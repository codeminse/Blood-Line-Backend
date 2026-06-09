import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

// Force c-ares to use reliable public DNS — prevents IPv6 SRV lookup failures on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global._mongooseConnection) {
  global._mongooseConnection = { conn: null, promise: null };
}

function attachMongooseListeners(): void {
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected — next request will reconnect');
    global._mongooseConnection.conn = null;
    global._mongooseConnection.promise = null;
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.info('[MongoDB] Reconnected');
  });
}

export async function connectDatabase(): Promise<typeof mongoose> {
  if (global._mongooseConnection.conn) {
    return global._mongooseConnection.conn;
  }

  if (!global._mongooseConnection.promise) {
    global._mongooseConnection.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
        maxPoolSize: 10,
      })
      .then((m) => {
        attachMongooseListeners();
        return m;
      });
  }

  global._mongooseConnection.conn = await global._mongooseConnection.promise;
  return global._mongooseConnection.conn;
}
