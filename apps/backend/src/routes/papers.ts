import { Router, Request, Response, NextFunction } from 'express';
import { paperService } from '../services/paperService';

const router = Router();

router.get('/:assignmentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    const paper = await paperService.getPaperByAssignmentId(assignmentId);

    if (!paper) {
      res.status(404).json({
        success: false,
        error: 'Paper not found. It may still be generating.',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.json({
      success: true,
      data: paper,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
