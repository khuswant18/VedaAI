import { z } from 'zod';

// ── Question type enum ──────────────────────────────────────────────────────
export const QuestionTypeEnum = z.enum(['mcq', 'short', 'long', 'truefalse']);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

// ── Assignment input schema (from form) ─────────────────────────────────────
export const AssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().datetime({ message: 'Valid ISO date required' }),
  questionTypes: z.array(QuestionTypeEnum).min(1, 'Select at least one question type'),
  questionsPerType: z.record(QuestionTypeEnum, z.number().int().positive()),
  marksPerType: z.record(QuestionTypeEnum, z.number().int().positive()),
  additionalInstructions: z.string().optional(),
  fileContent: z.string().optional(),
});

export type AssignmentInput = z.infer<typeof AssignmentSchema>;

// ── Question schema ─────────────────────────────────────────────────────────
export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: QuestionTypeEnum,
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number(),
  options: z.array(z.string()).optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

// ── Section schema ──────────────────────────────────────────────────────────
export const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  questionType: z.string(),
  questions: z.array(QuestionSchema),
  totalMarks: z.number(),
});

export type Section = z.infer<typeof SectionSchema>;

// ── Generated paper schema ──────────────────────────────────────────────────
export const GeneratedPaperSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  subject: z.string(),
  title: z.string(),
  totalMarks: z.number(),
  totalQuestions: z.number(),
  sections: z.array(SectionSchema),
  generatedAt: z.string(),
});

export type GeneratedPaper = z.infer<typeof GeneratedPaperSchema>;

// ── Job status schema ───────────────────────────────────────────────────────
export const JobStepEnum = z.enum(['queued', 'generating', 'parsing', 'saving', 'done']);
export type JobStep = z.infer<typeof JobStepEnum>;

export const JobStatusSchema = z.object({
  jobId: z.string(),
  assignmentId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  step: JobStepEnum.optional(),
  error: z.string().optional(),
  paperId: z.string().optional(),
});

export type JobStatus = z.infer<typeof JobStatusSchema>;

// ── API response wrappers ───────────────────────────────────────────────────
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ── Assignment creation response ────────────────────────────────────────────
export interface CreateAssignmentResponse {
  assignmentId: string;
  jobId: string;
}

// ── Assignment list item ────────────────────────────────────────────────────
export interface AssignmentListItem {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}
