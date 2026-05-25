import React from 'react';
import { QuestionCard } from './QuestionCard';
import type { Section } from '@vedaai/shared';
import { sectionLetters } from '@/lib/utils';

interface SectionBlockProps {
  section: Section;
  sectionIndex: number;
  questionStartNumber: number;
}

export function SectionBlock({
  section,
  sectionIndex,
  questionStartNumber,
}: SectionBlockProps) {
  const letter = sectionLetters[sectionIndex] || String(sectionIndex + 1);

  return (
    <div className="py-6">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-wide">
          Section {letter}
        </h3>
      </div>

      <div className="mb-4">
        <h4 className="text-base font-bold text-gray-900">
          {section.title}
        </h4>
        <p className="text-sm italic text-gray-600 mt-1">
          {section.instruction}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          Total marks: {section.totalMarks}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-1">
        {section.questions.map((question, qIndex) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={questionStartNumber + qIndex}
          />
        ))}
      </div>
    </div>
  );
}
