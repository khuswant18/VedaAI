'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Clock,
  Sparkles,
  FileSearch,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface JobProgressProps {
  step?: string;
  status: string;
  error?: string;
  onRetry?: () => void;
}

const steps = [
  { key: 'queued', label: 'Queued', icon: Clock },
  { key: 'generating', label: 'Generating', icon: Sparkles },
  { key: 'parsing', label: 'Parsing', icon: FileSearch },
  { key: 'saving', label: 'Saving', icon: Save },
  { key: 'done', label: 'Done', icon: CheckCircle2 },
];

export function JobProgress({ step, status, error, onRetry }: JobProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const isFailed = status === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="text-center mb-8">
          {isFailed ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Generation Failed
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {error || 'An unexpected error occurred'}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Generating Question Paper
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we create your question paper...
              </p>
            </>
          )}
        </div>

        {/* Step Progress */}
        <div className="space-y-3 mb-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={s.key}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500',
                  isCompleted && 'bg-emerald-50',
                  isCurrent && !isFailed && 'bg-orange-50',
                  isFailed && isCurrent && 'bg-red-50',
                  isPending && 'opacity-40'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && !isFailed && 'bg-orange-500 text-white',
                    isFailed && isCurrent && 'bg-red-500 text-white',
                    isPending && 'bg-gray-200 text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent && !isFailed ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && 'text-emerald-700',
                    isCurrent && !isFailed && 'text-orange-700',
                    isFailed && isCurrent && 'text-red-700',
                    isPending && 'text-gray-400'
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Retry Button */}
        {isFailed && onRetry && (
          <Button onClick={onRetry} className="w-full" variant="primary">
            Regenerate
          </Button>
        )}
      </div>
    </div>
  );
}
