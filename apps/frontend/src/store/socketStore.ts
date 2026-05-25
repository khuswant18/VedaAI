import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { JobStatus } from '@vedaai/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  jobStatus: JobStatus | null;
  connect: () => void;
  disconnect: () => void;
  joinJob: (jobId: string) => void;
  setJobStatus: (status: JobStatus) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  jobStatus: null,

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinJob: (jobId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join:job', { jobId });
    }
  },

  setJobStatus: (status: JobStatus) => {
    set({ jobStatus: status });
  },
}));
