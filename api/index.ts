import 'dotenv/config';
import { initSentry } from '../src/config/sentry';
initSentry();

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../src/config/database';
import app from '../src/app';

export default async (req: VercelRequest, res: VercelResponse) => {
  await connectDatabase();
  return app(req as never, res as never);
};
