import { v4 as uuidv4 } from 'uuid';
import { GeneratedPaper, IGeneratedPaper } from '../models/GeneratedPaper';
import { cacheService } from './cacheService';
import { logger } from '../utils/logger';

interface PaperSections {
  sections: Array<{
    id: string;
    title: string;
    instruction: string;
    questionType: string;
    totalMarks: number;
    questions: Array<{
      id: string;
      text: string;
      type: string;
      difficulty: string;
      marks: number;
      options?: string[];
    }>;
  }>;
}

export const paperService = {
  async savePaper(
    assignmentId: string,
    subject: string,
    title: string,
    parsedData: PaperSections
  ): Promise<IGeneratedPaper> {
    const totalQuestions = parsedData.sections.reduce(
      (sum, s) => sum + s.questions.length,
      0
    );
    const totalMarks = parsedData.sections.reduce(
      (sum, s) => sum + s.totalMarks,
      0
    );

    const paper = new GeneratedPaper({
      assignmentId,
      subject,
      title,
      totalMarks,
      totalQuestions,
      sections: parsedData.sections,
      generatedAt: new Date(),
    });

    await paper.save();
    logger.info(`Paper saved: ${paper._id}`);

    const paperObj = paper.toObject();
    const cacheData = {
      ...paperObj,
      id: paperObj._id.toString(),
      assignmentId: paperObj.assignmentId.toString(),
      generatedAt: paperObj.generatedAt.toISOString(),
    };
    await cacheService.setPaper(assignmentId, cacheData);

    return paper;
  },

  async getPaperByAssignmentId(assignmentId: string): Promise<Record<string, unknown> | null> {
    const cached = await cacheService.getPaper(assignmentId);
    if (cached) {
      logger.debug('Paper cache hit for:', assignmentId);
      return cached;
    }

    const paper = await GeneratedPaper.findOne({ assignmentId }).lean();
    if (!paper) return null;

    const paperData = {
      ...paper,
      id: paper._id.toString(),
      assignmentId: paper.assignmentId.toString(),
      generatedAt: paper.generatedAt.toISOString(),
    };

    await cacheService.setPaper(assignmentId, paperData);
    logger.debug('Paper cached for:', assignmentId);

    return paperData;
  },

  async deletePaperByAssignmentId(assignmentId: string): Promise<void> {
    await GeneratedPaper.deleteMany({ assignmentId });
    await cacheService.delPaper(assignmentId);
    logger.info(`Paper deleted for assignment: ${assignmentId}`);
  },
};
