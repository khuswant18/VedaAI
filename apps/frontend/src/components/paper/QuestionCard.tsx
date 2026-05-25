import React from 'react';
import { DifficultyBadge } from './DifficultyBadge';
import type { Question } from '@vedaai/shared';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-gray-500 mt-0.5 flex-shrink-0">
              {questionNumber}.
            </span>
            <p className="text-sm sm:text-base font-medium text-gray-900 leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* MCQ Options */}
          {question.options && question.options.length > 0 && (
            <div className="ml-5 sm:ml-6 mt-2 space-y-1.5">
              {question.options.map((option, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-sm text-gray-500 font-medium min-w-[20px]">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="text-sm text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-5 sm:ml-0">
          <DifficultyBadge
            difficulty={question.difficulty as 'easy' | 'medium' | 'hard'}
          />
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
        </div>
      </div>
    </div>
  );
}
