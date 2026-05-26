import { Router, Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';
import { Job } from '../models/Job';

const router = Router();

router.get('/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    const cached = await cacheService.getJobStatus(jobId);
    if (cached) {
      res.json({
        success: true,
        data: cached,
      });
      return;
    }

    const job = await Job.findOne({ bullJobId: jobId }).lean();
    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Job not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    const jobStatus = {
      jobId: job.bullJobId,
      assignmentId: job.assignmentId.toString(),
      status: job.status,
      step: job.step,
      error: job.error,
      paperId: job.paperId?.toString(),
    };

    res.json({
      success: true,
      data: jobStatus,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
