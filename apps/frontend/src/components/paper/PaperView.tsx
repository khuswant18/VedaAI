'use client';

import React from 'react';
import { SectionBlock } from './SectionBlock';
import { StudentInfoBar } from './StudentInfoBar';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Download, Calendar, Hash, Award } from 'lucide-react';
import type { GeneratedPaper } from '@vedaai/shared';
import { formatDate } from '@/lib/utils';

interface PaperViewProps {
  paper: GeneratedPaper;
  dueDate?: string;
  onRegenerate?: () => void;
  onDownloadPDF?: () => void;
  isRegenerating?: boolean;
}

export function PaperView({
  paper,
  dueDate,
  onRegenerate,
  onDownloadPDF,
  isRegenerating,
}: PaperViewProps) {
  // Track cumulative question numbers across sections
  let questionCounter = 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 sm:p-5 text-white">
        <p className="text-sm text-gray-300 mb-3">
          ✨ Here is your customized Question Paper for{' '}
          <span className="font-semibold text-white">{paper.subject}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {onDownloadPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadPDF}
              icon={<Download className="h-4 w-4" />}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <span className="hidden sm:inline">Download as PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              isLoading={isRegenerating}
              icon={<RefreshCw className="h-4 w-4" />}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Paper Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10">
          {/* Paper Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {paper.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Subject: {paper.subject}
            </p>
          </div>

          {/* Paper Meta — stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-3">
              {dueDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Due: {formatDate(dueDate)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4" />
                Questions: {paper.totalQuestions}
              </span>
            </div>
            <span className="flex items-center gap-1.5 font-semibold text-gray-900">
              <Award className="h-4 w-4" />
              Maximum Marks: {paper.totalMarks}
            </span>
          </div>

          {/* Instructions */}
          <p className="text-sm font-medium text-gray-700 mb-4">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student Info */}
          <StudentInfoBar />

          {/* Sections */}
          <div className="divide-y divide-gray-200 mt-4 sm:mt-6">
            {paper.sections.map((section, idx) => {
              const startNum = questionCounter + 1;
              questionCounter += section.questions.length;

              return (
                <SectionBlock
                  key={section.id}
                  section={section}
                  sectionIndex={idx}
                  questionStartNumber={startNum}
                />
              );
            })}
          </div>

          {/* End of Paper */}
          <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-red-600">
              End of Question Paper
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
