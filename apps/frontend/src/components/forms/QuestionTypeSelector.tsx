'use client';

import React from 'react';
import { Minus, Plus, X } from 'lucide-react';

interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

interface QuestionTypeSelectorProps {
  selected: QuestionTypeConfig[];
  onChange: (configs: QuestionTypeConfig[]) => void;
  errors?: {
    questionTypes?: string;
    questionsPerType?: string;
    marksPerType?: string;
  };
}

const allTypes = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Long Answer Questions' },
  { value: 'truefalse', label: 'True or False' },
];

export function QuestionTypeSelector({
  selected,
  onChange,
  errors,
}: QuestionTypeSelectorProps) {
  const addType = () => {
    const availableTypes = allTypes.filter(
      (t) => !selected.some((s) => s.type === t.value)
    );
    if (availableTypes.length > 0) {
      onChange([
        ...selected,
        { type: availableTypes[0].value, count: 4, marks: 1 },
      ]);
    }
  };

  const removeType = (index: number) => {
    onChange(selected.filter((_, i) => i !== index));
  };

  const updateType = (index: number, _field: string, value: string) => {
    const updated = [...selected];
    updated[index] = { ...updated[index], type: value };
    onChange(updated);
  };

  const updateCount = (index: number, delta: number) => {
    const updated = [...selected];
    const newCount = Math.max(1, updated[index].count + delta);
    updated[index] = { ...updated[index], count: newCount };
    onChange(updated);
  };

  const updateMarks = (index: number, delta: number) => {
    const updated = [...selected];
    const newMarks = Math.max(1, updated[index].marks + delta);
    updated[index] = { ...updated[index], marks: newMarks };
    onChange(updated);
  };

  const totalQuestions = selected.reduce((sum, s) => sum + s.count, 0);
  const totalMarks = selected.reduce((sum, s) => sum + s.count * s.marks, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          Question Type
        </label>
        {/* Column headers — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
          <span>No. of Questions</span>
          <span>Marks</span>
        </div>
      </div>

      <div className="space-y-3">
        {selected.map((config, index) => {
          const availableForThis = allTypes.filter(
            (t) =>
              t.value === config.type ||
              !selected.some((s) => s.type === t.value)
          );

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 px-3 sm:px-4 py-3"
            >
              {/* Desktop: single row | Mobile: stacked */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Type selector + remove */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <select
                    value={config.type}
                    onChange={(e) => updateType(index, 'type', e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {availableForThis.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeType(index)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Steppers row */}
                <div className="flex items-center gap-3 sm:gap-2">
                  {/* Count stepper */}
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-gray-500 mr-1 sm:hidden">Qty:</span>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => updateCount(index, -1)}
                        className="flex items-center justify-center w-7 h-7 rounded-l-lg hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900">
                        {config.count}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCount(index, 1)}
                        className="flex items-center justify-center w-7 h-7 rounded-r-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Marks stepper */}
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-gray-500 mr-1 sm:hidden">Marks:</span>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => updateMarks(index, -1)}
                        className="flex items-center justify-center w-7 h-7 rounded-l-lg hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900">
                        {config.marks}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateMarks(index, 1)}
                        className="flex items-center justify-center w-7 h-7 rounded-r-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add type button */}
      {selected.length < allTypes.length && (
        <button
          type="button"
          onClick={addType}
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100">
            <Plus className="h-3.5 w-3.5" />
          </div>
          Add Question Type
        </button>
      )}

      {/* Totals */}
      {selected.length > 0 && (
        <div className="text-right space-y-0.5">
          <p className="text-sm text-gray-600">
            Total Questions:{' '}
            <span className="font-semibold text-gray-900">{totalQuestions}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Marks:{' '}
            <span className="font-semibold text-gray-900">{totalMarks}</span>
          </p>
        </div>
      )}

      {/* Errors */}
      {errors?.questionTypes && (
        <p className="text-xs text-red-600">{errors.questionTypes}</p>
      )}
    </div>
  );
}
