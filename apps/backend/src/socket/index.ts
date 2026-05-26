import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let io: Server | null = null;

export function setupSocket(httpServer: HTTPServer): Server {
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
  const uniqueOrigins = [...new Set(allowedOrigins)];

  io = new Server(httpServer, {
    cors: {
      origin: uniqueOrigins,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join:job', ({ jobId }: { jobId: string }) => {
      const room = `job:${jobId}`;
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitToJob(jobId: string, event: string, data: Record<string, unknown>): void {
  if (!io) {
    logger.warn('Socket.io not initialized, cannot emit event');
    return;
  }
  io.to(`job:${jobId}`).emit(event, data);
}

export function getIO(): Server | null {
  return io;
}
