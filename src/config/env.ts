import { cleanEnv, str, port, url } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 5000 }),
  MONGODB_URI: url({ docs: 'MongoDB Atlas connection string' }),
  FIREBASE_PROJECT_ID: str(),
  FIREBASE_CLIENT_EMAIL: str(),
  FIREBASE_PRIVATE_KEY: str(),
  CORS_ORIGIN: str({ default: 'http://localhost:3000' }),
  IPFIND_KEY: str({ default: '' }),
  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),
  // Error monitoring — set in production via Sentry project DSN
  SENTRY_DSN: str({ default: '' }),
  // Upstash Redis — set both to enable caching
  UPSTASH_REDIS_REST_URL: str({ default: '' }),
  UPSTASH_REDIS_REST_TOKEN: str({ default: '' }),
});
