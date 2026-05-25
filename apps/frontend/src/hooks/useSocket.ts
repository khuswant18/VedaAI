'use client';

import { useEffect, useCallback } from 'react';
import { useSocketStore } from '@/store/socketStore';
import type { JobStatus } from '@vedaai/shared';

interface SocketJobEvents {
  onStarted?: (data: { jobId: string; assignmentId: string }) => void;
  onProgress?: (data: { jobId: string; step: string }) => void;
  onCompleted?: (data: { jobId: string; assignmentId: string; paperId: string }) => void;
  onFailed?: (data: { jobId: string; error: string }) => void;
}

export function useSocket(jobId: string | null, events?: SocketJobEvents) {
  const { socket, connect, disconnect, joinJob, setJobStatus } = useSocketStore();

  const setupListeners = useCallback(() => {
    if (!socket || !jobId) return;

    socket.on('job:started', (data: { jobId: string; assignmentId: string }) => {
      setJobStatus({
        jobId: data.jobId,
        assignmentId: data.assignmentId,
        status: 'processing',
        step: 'generating',
      });
      events?.onStarted?.(data);
    });

    socket.on('job:progress', (data: { jobId: string; step: string }) => {
      setJobStatus({
        jobId: data.jobId,
        assignmentId: '',
        status: 'processing',
        step: data.step as JobStatus['step'],
      });
      events?.onProgress?.(data);
    });

    socket.on('job:completed', (data: { jobId: string; assignmentId: string; paperId: string }) => {
      setJobStatus({
        jobId: data.jobId,
        assignmentId: data.assignmentId,
        status: 'completed',
        step: 'done',
        paperId: data.paperId,
      });
      events?.onCompleted?.(data);
    });

    socket.on('job:failed', (data: { jobId: string; error: string }) => {
      setJobStatus({
        jobId: data.jobId,
        assignmentId: '',
        status: 'failed',
        error: data.error,
      });
      events?.onFailed?.(data);
    });
  }, [socket, jobId, setJobStatus, events]);

  useEffect(() => {
    if (!jobId) return;

    connect();

    return () => {
      // Don't disconnect on unmount — socket is shared
    };
  }, [jobId, connect]);

  useEffect(() => {
    if (!socket || !jobId) return;

    joinJob(jobId);
    setupListeners();

    return () => {
      socket.off('job:started');
      socket.off('job:progress');
      socket.off('job:completed');
      socket.off('job:failed');
    };
  }, [socket, jobId, joinJob, setupListeners]);
}
