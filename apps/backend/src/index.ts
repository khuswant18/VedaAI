import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { env, isDev } from './config/env';
import { connectDB } from './config/db';
import { setupSocket } from './socket/index';
import { startWorker } from './workers/generationWorker';
import { errorHandler } from './middleware/errorHandler';
import assignmentRoutes from './routes/assignments';
import paperRoutes from './routes/papers';
import jobRoutes from './routes/jobs';
import { logger } from './utils/logger';
import fs from 'fs';

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const app = express();
const httpServer = createServer(app);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = [
  'http://localhost:3000',
  'https://veda-ai-frontend-one.vercel.app',
  'https://vedaai-frontend.vercel.app',
];
if (Array.isArray(env.corsOrigin)) {
  allowedOrigins.push(...env.corsOrigin);
} else if (typeof env.corsOrigin === 'string') {
  allowedOrigins.push(env.corsOrigin);
}

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

app.use(cors({ origin: uniqueOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (isDev) {
  app.use(morgan('dev'));
}

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/assignments', assignmentRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/jobs', jobRoutes);

// ── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Setup Socket.io
    setupSocket(httpServer);

    // Start BullMQ worker
    startWorker();

    // Start HTTP server
    httpServer.listen(env.port, () => {
      logger.info(`🚀 Server running on port ${env.port}`);
      logger.info(`📋 API: http://localhost:${env.port}/api`);
      logger.info(`🔌 WebSocket: ws://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  httpServer.close(() => {
    process.exit(0);
  });
});
