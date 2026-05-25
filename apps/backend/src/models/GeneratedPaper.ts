import mongoose, { Schema, Document } from 'mongoose';

interface IQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: string[];
}

interface ISection {
  id: string;
  title: string;
  instruction: string;
  questionType: string;
  questions: IQuestion[];
  totalMarks: number;
}

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  subject: string;
  title: string;
  totalMarks: number;
  totalQuestions: number;
  sections: ISection[];
  generatedAt: Date;
}

const QuestionSubSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: { type: String, required: true },
    marks: { type: Number, required: true },
    options: { type: [String] },
  },
  { _id: false }
);

const SectionSubSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questionType: { type: String, required: true },
    questions: { type: [QuestionSubSchema], required: true },
    totalMarks: { type: Number, required: true },
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  sections: { type: [SectionSubSchema], required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const GeneratedPaper = mongoose.model<IGeneratedPaper>(
  'GeneratedPaper',
  GeneratedPaperSchema
);
