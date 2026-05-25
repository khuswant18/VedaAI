import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let io: Server | null = null;

export function setupSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
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
