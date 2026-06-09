import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler.middleware';
import { notFound } from './middleware/notFound.middleware';
import apiRoutes from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later', data: null },
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many search requests, please slow down',
    data: null,
  },
});

app.use(globalLimiter);
app.use('/api/v1/users/search', searchLimiter);
app.use('/api/v1/blood-requests', searchLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feni Blood Line API is running [Author : MD Nazmul Khan]',
    data: null,
  });
});

app.use('/api/v1', apiRoutes);

// Sentry must capture errors before the custom error handler
Sentry.setupExpressErrorHandler(app);

app.use(notFound);
app.use(errorHandler);

export default app;
