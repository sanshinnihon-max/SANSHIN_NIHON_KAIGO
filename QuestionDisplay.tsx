import React from 'react';
import { ClientQuestion } from '../types/exam';
import { EmptyState } from './EmptyState';
import { HelpCircle, Bookmark, CheckCircle2 } from 'lucide-react';

interface QuestionDisplayProps {
  question?: ClientQuestion | null;
  selectedOptionId?: string | null;
  isMarkedForReview?: boolean;
  onSelectOption?: (optionId: string) => void;
  onToggleMarkForReview?: () => void;
  readOnly?: boolean;
  totalQuestions?: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOptionId = null,
  isMarkedForReview = false,
  onSelectOption,
  onToggleMarkForReview,
  readOnly = false,
  totalQuestions,
}) => {
  if (!question) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="No Question Selected"
        description="Select an examination question to view its contents, options, and submission controls."
        className="my-6"
      />
    );
  }

  return (
    <div className="card-rose p-6 sm:p-7 space-y-6">
      {/* Header bar: Question number, section, marks, review toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3C3D8] pb-4">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white text-xs font-bold rounded-lg shadow-2xs">
            Question {question.questionNumber}
            {totalQuestions ? ` of ${totalQuestions}` : ''}
          </span>
          {question.section && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
              {question.section}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-[#806779] bg-[#FFF0F6] px-2.5 py-1 rounded-md border border-[#F3C3D8]">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>

          {onToggleMarkForReview && !readOnly && (
            <button
              type="button"
              onClick={onToggleMarkForReview}
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                isMarkedForReview
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-[#806779] border-[#F3C3D8] hover:bg-[#FFF7FB]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${isMarkedForReview ? 'fill-amber-500' : ''}`} />
              {isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="text-[#54263F] text-base leading-relaxed font-medium">
        <p className="whitespace-pre-wrap">{question.text}</p>
      </div>

      {/* Question Image(s) if applicable */}
      {question.images && question.images.length > 0 && (
        <div className="space-y-3 pt-1">
          {question.images.map((imgSrc, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#F3C3D8] overflow-hidden bg-[#FFF0F6] max-w-xl mx-auto p-2"
            >
              <img
                src={imgSrc}
                alt={`Question figure ${idx + 1}`}
                className="max-h-72 w-auto mx-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#A83267]">
          Select Answer (解答の選択):
        </label>
        <div className="space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                onClick={() => !readOnly && onSelectOption?.(option.id)}
                className={`flex items-start p-4 rounded-xl border text-sm transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#D94F91] bg-[#FFF0F6] ring-1 ring-[#D94F91] shadow-2xs'
                    : 'border-[#F3C3D8] bg-white hover:bg-[#FFF7FB]'
                } ${readOnly ? 'cursor-default opacity-85' : ''}`}
              >
                <div className="flex items-center h-5 mr-3 shrink-0">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={isSelected}
                    disabled={readOnly}
                    onChange={() => !readOnly && onSelectOption?.(option.id)}
                    className="w-4 h-4 text-[#D94F91] border-[#F3C3D8] focus:ring-[#D94F91]"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-[#A83267] min-w-[1.25rem]">
                      {option.label}.
                    </span>
                    <span className={`text-[#54263F] leading-relaxed ${isSelected ? 'font-semibold' : ''}`}>
                      {option.text}
                    </span>
                  </div>
                  {option.image && (
                    <div className="mt-2 rounded-lg border border-[#F3C3D8] bg-white p-1 max-w-xs">
                      <img
                        src={option.image}
                        alt={`Option ${option.label}`}
                        className="max-h-36 object-contain"
                      />
                    </div>
                  )}
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-[#D94F91] ml-2 shrink-0 self-center" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
