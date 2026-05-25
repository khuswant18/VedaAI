import { Queue } from 'bullmq';
import { createBullMQConnection } from '../config/redis';

export interface GenerationJobData {
  assignmentId: string;
  jobId: string;
}

export const generationQueue = new Queue<GenerationJobData>('generation', {
  connection: createBullMQConnection(),
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});
