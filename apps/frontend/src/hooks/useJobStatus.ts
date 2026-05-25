'use client';

import { useEffect, useRef, useState } from 'react';
import { getJobStatus } from '@/services/api';
import { useSocketStore } from '@/store/socketStore';
import type { JobStatus } from '@vedaai/shared';

export function useJobStatus(jobId: string | null) {
  const { isConnected, jobStatus: socketJobStatus } = useSocketStore();
  const [polledStatus, setPolledStatus] = useState<JobStatus | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // Only poll if socket is disconnected
    if (isConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      const status = await getJobStatus(jobId);
      if (status) {
        setPolledStatus(status);

        // Stop polling when terminal state
        if (status.status === 'completed' || status.status === 'failed') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, isConnected]);

  // Prefer socket status, fall back to polled
  return socketJobStatus ?? polledStatus;
}
