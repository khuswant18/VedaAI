import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  assignmentId: mongoose.Types.ObjectId;
  bullJobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  step?: string;
  error?: string;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    bullJobId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    step: { type: String },
    error: { type: String },
    paperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper' },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
