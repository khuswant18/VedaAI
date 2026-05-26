'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { FileUpload } from './FileUpload';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { QuestionType } from '@vedaai/shared';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  additionalInstructions: z.string().optional(),
});

type FormFields = z.infer<typeof formSchema>;

interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

interface AssignmentFormProps {
  onSubmitSuccess: () => void;
}

export function AssignmentForm({ onSubmitSuccess }: AssignmentFormProps) {
  const { submitAssignment, isSubmitting } = useAssignmentStore();
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>([
    { type: 'mcq', count: 4, marks: 1 },
  ]);
  const [questionTypeError, setQuestionTypeError] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
  });

  const handleFileSelect = useCallback(
    (file: File | null, content?: string) => {
      setUploadedFile(file);
      if (content) setFileContent(content);
      else setFileContent('');
    },
    []
  );

  const onSubmit = async (data: FormFields) => {
    if (questionTypes.length === 0) {
      setQuestionTypeError('Select at least one question type');
      return;
    }
    setQuestionTypeError('');

    const dueDate = new Date(data.dueDate);
    if (dueDate <= new Date()) {
      return;
    }

    const questionsPerType: Record<string, number> = {};
    const marksPerType: Record<string, number> = {};
    const types: QuestionType[] = [];

    questionTypes.forEach((qt) => {
      types.push(qt.type as QuestionType);
      questionsPerType[qt.type] = qt.count;
      marksPerType[qt.type] = qt.marks;
    });

    try {
      await submitAssignment(
        {
          title: data.title,
          subject: data.subject,
          dueDate: new Date(data.dueDate).toISOString(),
          questionTypes: types,
          questionsPerType: questionsPerType as Record<QuestionType, number>,
          marksPerType: marksPerType as Record<QuestionType, number>,
          additionalInstructions: data.additionalInstructions,
          fileContent: fileContent || undefined,
        },
        uploadedFile
      );
      onSubmitSuccess();
    } catch {
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-8">
      {}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Assignment Details
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Basic information about your assignment
          </p>
        </div>

        {}
        <FileUpload onFileSelect={handleFileSelect} />

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            placeholder="e.g. Quiz on Electricity"
            error={errors.title?.message}
            {...register('title')}
          />
          <Input
            label="Subject"
            placeholder="e.g. Science"
            error={errors.subject?.message}
            {...register('subject')}
          />
        </div>

        {}
        <Input
          label="Due Date"
          type="date"
          min={minDate}
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <QuestionTypeSelector
          selected={questionTypes}
          onChange={setQuestionTypes}
          errors={{ questionTypes: questionTypeError }}
        />
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Additional Information (For better output)
        </label>
        <textarea
          {...register('additionalInstructions')}
          rows={4}
          placeholder="e.g. Generate a question paper for 3 hour exam duration..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 transition-all duration-200 resize-none"
        />
      </div>

      {}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          Generate Question Paper
        </Button>
      </div>
    </form>
  );
}
