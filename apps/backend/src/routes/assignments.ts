import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AssignmentSchema } from '@vedaai/shared';
import { Assignment } from '../models/Assignment';
import { Job } from '../models/Job';
import { generationQueue } from '../queues/generationQueue';
import { cacheService } from '../services/cacheService';
import { paperService } from '../services/paperService';
import { upload } from '../middleware/upload';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /api/assignments — Create assignment + queue generation job
router.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the body data
      let bodyData = req.body;

      // If form data, parse JSON fields
      if (typeof bodyData.questionTypes === 'string') {
        bodyData = {
          ...bodyData,
          questionTypes: JSON.parse(bodyData.questionTypes),
          questionsPerType: JSON.parse(bodyData.questionsPerType),
          marksPerType: JSON.parse(bodyData.marksPerType),
        };
      }

      // Handle file upload — extract text
      let fileContent: string | undefined;
      if (req.file) {
        const filePath = req.file.path;
        if (req.file.mimetype === 'text/plain') {
          fileContent = fs.readFileSync(filePath, 'utf-8');
        } else if (req.file.mimetype === 'application/pdf') {
          // Dynamic import for pdf-parse (CommonJS module)
          const pdfParse = (await import('pdf-parse')).default;
          const pdfBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(pdfBuffer);
          fileContent = pdfData.text;
        }
        // Clean up uploaded file
        fs.unlinkSync(filePath);
      }

      const inputData = {
        ...bodyData,
        fileContent: fileContent ?? bodyData.fileContent,
      };

      // Validate with Zod
      const validated = AssignmentSchema.parse(inputData);

      // Save to MongoDB
      const assignment = new Assignment({
        title: validated.title,
        subject: validated.subject,
        dueDate: new Date(validated.dueDate),
        questionTypes: validated.questionTypes,
        questionsPerType: validated.questionsPerType,
        marksPerType: validated.marksPerType,
        additionalInstructions: validated.additionalInstructions,
        fileContent: validated.fileContent,
        status: 'pending',
      });
      await assignment.save();

      const assignmentId = assignment._id.toString();
      const jobId = uuidv4();

      // Add to BullMQ queue
      await generationQueue.add('generate', { assignmentId, jobId });

      // Save Job document
      const jobDoc = new Job({
        assignmentId: assignment._id,
        bullJobId: jobId,
        status: 'pending',
        step: 'queued',
      });
      await jobDoc.save();

      // Cache initial job status
      await cacheService.setJobStatus(jobId, {
        jobId,
        assignmentId,
        status: 'pending',
        step: 'queued',
      });

      logger.info(`Assignment created: ${assignmentId}, Job: ${jobId}`);

      res.status(201).json({
        success: true,
        data: { assignmentId, jobId },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/assignments — List all assignments
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('title subject dueDate status createdAt updatedAt')
      .lean();

    res.json({
      success: true,
      data: assignments.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json({
      success: true,
      data: { ...assignment, _id: assignment._id.toString() },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    // Delete cached paper
    await paperService.deletePaperByAssignmentId(assignmentId);

    // Reset assignment status
    assignment.status = 'pending';
    await assignment.save();

    // Create new job
    const jobId = uuidv4();
    await generationQueue.add('generate', { assignmentId, jobId });

    const jobDoc = new Job({
      assignmentId: assignment._id,
      bullJobId: jobId,
      status: 'pending',
      step: 'queued',
    });
    await jobDoc.save();

    await cacheService.setJobStatus(jobId, {
      jobId,
      assignmentId,
      status: 'pending',
      step: 'queued',
    });

    logger.info(`Regeneration queued: ${assignmentId}, Job: ${jobId}`);

    res.json({
      success: true,
      data: { jobId },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: 'Assignment not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    // Clean up related data
    await paperService.deletePaperByAssignmentId(req.params.id);
    await Job.deleteMany({ assignmentId: req.params.id });

    logger.info(`Assignment deleted: ${req.params.id}`);

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
