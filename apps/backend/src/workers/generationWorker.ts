import { Worker, Job as BullJob } from 'bullmq';
import { createBullMQConnection } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { Job } from '../models/Job';
import { generatePaper, parsePaper } from '../services/aiService';
import { paperService } from '../services/paperService';
import { cacheService } from '../services/cacheService';
import { emitToJob } from '../socket/index';
import { logger } from '../utils/logger';
import type { GenerationJobData } from '../queues/generationQueue';
import type { AssignmentInput } from '@vedaai/shared';

async function processGenerationJob(job: BullJob<GenerationJobData>): Promise<void> {
  const { assignmentId, jobId } = job.data;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    assignment.status = 'processing';
    await assignment.save();

    emitToJob(jobId, 'job:started', { jobId, assignmentId });
    emitToJob(jobId, 'job:progress', { jobId, step: 'generating' });
    await cacheService.setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'processing',
      step: 'generating',
    });
    await Job.findOneAndUpdate(
      { bullJobId: jobId },
      { status: 'processing', step: 'generating' }
    );

    const assignmentData: AssignmentInput = {
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate.toISOString(),
      questionTypes: assignment.questionTypes as AssignmentInput['questionTypes'],
      questionsPerType: Object.fromEntries(assignment.questionsPerType) as AssignmentInput['questionsPerType'],
      marksPerType: Object.fromEntries(assignment.marksPerType) as AssignmentInput['marksPerType'],
      additionalInstructions: assignment.additionalInstructions,
      fileContent: assignment.fileContent,
    };

    const rawResponse = await generatePaper(assignmentData);

    emitToJob(jobId, 'job:progress', { jobId, step: 'parsing' });
    await cacheService.setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'processing',
      step: 'parsing',
    });
    await Job.findOneAndUpdate(
      { bullJobId: jobId },
      { step: 'parsing' }
    );

    const parsedPaper = await parsePaper(rawResponse);

    emitToJob(jobId, 'job:progress', { jobId, step: 'saving' });
    await cacheService.setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'processing',
      step: 'saving',
    });
    await Job.findOneAndUpdate(
      { bullJobId: jobId },
      { step: 'saving' }
    );

    const savedPaper = await paperService.savePaper(
      assignmentId,
      assignment.subject,
      assignment.title,
      parsedPaper
    );

    const paperId = savedPaper._id.toString();

    await Job.findOneAndUpdate(
      { bullJobId: jobId },
      { status: 'completed', step: 'done', paperId: savedPaper._id }
    );
    await cacheService.setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'completed',
      step: 'done',
      paperId,
    });

    assignment.status = 'completed';
    await assignment.save();

    emitToJob(jobId, 'job:progress', { jobId, step: 'done' });
    emitToJob(jobId, 'job:completed', { jobId, assignmentId, paperId });

    logger.info(`Job completed: ${jobId}, Paper: ${paperId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Job failed: ${jobId}`, errorMessage);

    await Job.findOneAndUpdate(
      { bullJobId: jobId },
      { status: 'failed', error: errorMessage }
    );
    await cacheService.setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'failed',
      error: errorMessage,
    });
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });

    emitToJob(jobId, 'job:failed', { jobId, error: errorMessage });

    throw error;
  }
}

export function startWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    'generation',
    processGenerationJob,
    {
      connection: createBullMQConnection(),
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Worker completed job: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Worker job failed: ${job?.id}`, err.message);
  });

  worker.on('error', (err) => {
    logger.error('Worker error:', err.message);
  });

  logger.info('🔄 Generation worker started');

  return worker;
}
