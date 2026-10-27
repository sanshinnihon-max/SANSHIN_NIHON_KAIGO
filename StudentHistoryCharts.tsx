import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExamResult, PerQuestionResult } from '../types/exam';
import { LESSON_DEFINITIONS, getPerformanceLevel } from '../data/caregiverExamData';

interface StudentHistoryChartsProps {
  results: ExamResult[];
  onStartExam?: () => void;
}

export const StudentHistoryCharts: React.FC<StudentHistoryChartsProps> = ({
  results,
  onStartExam,
}) => {
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<ExamResult | null>(null);
  const [lessonViewMode, setLessonViewMode] = useState<'latest' | 'aggregate'>('latest');

  // If no results, render friendly clean empty state (NO mock data!)
  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Examination History Yet</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          You haven&apos;t completed any tests yet. Take an official mock exam to track your Japanese caregiver performance, score progress, and lesson breakdown!
        </p>
        {onStartExam && (
          <button
            type="button"
            onClick={onStartExam}
            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm shadow-sm hover:from-emerald-500 hover:to-teal-600 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2 text-amber-300" />
            Start First Examination (試験開始)
          </button>
        )}
      </div>
    );
  }

  // Chronological order for trend charts (oldest to newest)
  const chronologicalResults = [...results].reverse();
  const latestResult = results[0]; // Newest attempt

  // 1. Overall Summary Statistics
  const totalCompleted = results.length;
  const totalPercentages = results.map((r) => r.percentage);
  const averagePercentage = Math.round(
    totalPercentages.reduce((acc, curr) => acc + curr, 0) / totalCompleted
  );
  const highestPercentage = Math.max(...totalPercentages);
  const latestPercentage = latestResult.percentage;
  const latestPerformanceLevel = getPerformanceLevel(latestPercentage);

  // Helper for performance badge colors
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/20';
      case 'Very Good':
        return 'bg-teal-50 text-teal-800 border-teal-300 ring-teal-500/20';
      case 'Good':
        return 'bg-sky-50 text-sky-800 border-sky-300 ring-sky-500/20';
      case 'Improving':
        return 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-500/20';
      case 'Needs Practice':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/20';
    }
  };

  // 2. Lesson-Based Analysis Data Calculation
  // We can evaluate for latest result or aggregate across all attempts
  interface LessonCalc {
    id: string;
    title: string;
    labelEn: string;
    questionRange: string;
    totalQuestions: number;
    correctCount: number;
    answeredCount: number;
    incorrectCount: number;
    accuracy: number | null; // (correct / answered) * 100
  }

  const calculateLessonStats = (mode: 'latest' | 'aggregate'): { stats: LessonCalc[]; hasData: boolean } => {
    if (mode === 'latest') {
      if (!latestResult.lessonBreakdown || latestResult.lessonBreakdown.length === 0) {
        // If latest attempt was saved before lesson breakdown existed, return fallback
        return { stats: [], hasData: false };
      }
      const stats = LESSON_DEFINITIONS.map((def) => {
        const found = latestResult.lessonBreakdown?.find(
          (l) => l.lessonTitle === def.title || l.lessonId === def.id
        );
        const correct = found?.correctCount || 0;
        const answered = found?.answeredCount || 0;
        const incorrect = found?.incorrectCount || 0;
        const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;
        return {
          id: def.id,
          title: def.title,
          labelEn: def.labelEn,
          questionRange: def.questionRange,
          totalQuestions: def.totalQuestions,
          correctCount: correct,
          answeredCount: answered,
          incorrectCount: incorrect,
          accuracy,
        };
      });
      return { stats, hasData: true };
    }

    // Aggregate mode across all attempts
    const validAttempts = results.filter((r) => r.lessonBreakdown && r.lessonBreakdown.length > 0);
    if (validAttempts.length === 0) {
      return { stats: [], hasData: false };
    }

    const aggregated = LESSON_DEFINITIONS.map((def) => {
      let totalCorrect = 0;
      let totalAnswered = 0;
      let totalIncorrect = 0;

      validAttempts.forEach((r) => {
        const found = r.lessonBreakdown?.find(
          (l) => l.lessonTitle === def.title || l.lessonId === def.id
        );
        if (found) {
          totalCorrect += found.correctCount;
          totalAnswered += found.answeredCount;
          totalIncorrect += found.incorrectCount;
        }
      });

      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;
      return {
        id: def.id,
        title: def.title,
        labelEn: def.labelEn,
        questionRange: def.questionRange,
        totalQuestions: def.totalQuestions,
        correctCount: totalCorrect,
        answeredCount: totalAnswered,
        incorrectCount: totalIncorrect,
        accuracy,
      };
    });

    return { stats: aggregated, hasData: true };
  };

  const { stats: lessonStats, hasData: hasLessonData } = calculateLessonStats(lessonViewMode);

  // Identify weakest lesson (lowest accuracy amongst lessons with answered questions)
  let weakestLessonId: string | null = null;
  if (hasLessonData && lessonStats.length > 0) {
    const answeredLessons = lessonStats.filter((l) => l.accuracy !== null);
    if (answeredLessons.length > 0) {
      const minAccuracy = Math.min(...answeredLessons.map((l) => l.accuracy as number));
      const weakest = answeredLessons.find((l) => l.accuracy === minAccuracy);
      if (weakest) weakestLessonId = weakest.id;
    }
  }

  // Time format helper
  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null || seconds <= 0) return 'Data unavailable';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ------------------------------------------------------------- */}
      {/* 1. OVERALL SUMMARY STATISTICS CARDS                           */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Overall Performance Summary</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total Completed */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Tests Completed
            </span>
            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900">{totalCompleted}</span>
              <span className="text-xs text-slate-500 font-medium">exams</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Full 45-MCQ evaluations</span>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Average Score
            </span>
            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-[#0F172A]">{averagePercentage}%</span>
              <span className="text-xs font-semibold text-slate-500">
                ({Math.round((averagePercentage * 45) / 100)} / 45)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Passing benchmark is 60%
            </span>
          </div>

          {/* Latest Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Latest Score
            </span>
            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className={`text-2xl font-black ${latestPercentage >= 60 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {latestPercentage}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({latestResult.score} / {latestResult.totalMarks})
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {latestResult.passed ? 'Status: Passed (合格)' : 'Status: Needs Practice'}
            </span>
          </div>

          {/* Highest Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Highest Score
            </span>
            <div className="mt-1 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-amber-600">{highestPercentage}%</span>
              <span className="text-xs font-semibold text-slate-500">
                ({Math.round((highestPercentage * 45) / 100)} / 45)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Personal best attempt</span>
          </div>

          {/* Latest Performance Level */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Performance Level
            </span>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getLevelBadge(
                  latestPerformanceLevel
                )}`}
              >
                {latestPerformanceLevel}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block">
              Based on official 60-100% scale
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PROGRESS CHARTS SECTION                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Score Trend Over Time */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">Score Trend Over Time (%)</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracking percentage mark per completed examination attempt
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Score %
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" /> Pass Mark (60%)
              </span>
            </div>
          </div>

          {/* SVG Score Trend Chart */}
          <div className="h-56 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <text x="32" y="24" textAnchor="end" fontSize="10" fill="#94A3B8">100%</text>

              <line x1="40" y1="65" x2="480" y2="65" stroke="#F1F5F9" strokeWidth="1" />
              <text x="32" y="69" textAnchor="end" fontSize="10" fill="#94A3B8">80%</text>

              {/* Pass Mark 60% Guideline */}
              <line x1="40" y1="110" x2="480" y2="110" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="32" y="114" textAnchor="end" fontSize="10" fill="#10B981" fontWeight="bold">60%</text>

              <line x1="40" y1="155" x2="480" y2="155" stroke="#F1F5F9" strokeWidth="1" />
              <text x="32" y="159" textAnchor="end" fontSize="10" fill="#94A3B8">40%</text>

              <line x1="40" y1="190" x2="480" y2="190" stroke="#CBD5E1" strokeWidth="1" />
              <text x="32" y="193" textAnchor="end" fontSize="10" fill="#94A3B8">0%</text>

              {/* Data points & connecting line */}
              {chronologicalResults.length === 1 ? (
                // Single attempt display
                <g>
                  <circle
                    cx="260"
                    cy={190 - (chronologicalResults[0].percentage / 100) * 170}
                    r="6"
                    fill="#D97706"
                    stroke="#FFF"
                    strokeWidth="2"
                  />
                  <text
                    x="260"
                    y={175 - (chronologicalResults[0].percentage / 100) * 170}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#0F172A"
                  >
                    {chronologicalResults[0].percentage}%
                  </text>
                  <text x="260" y="200" textAnchor="middle" fontSize="10" fill="#64748B">
                    Attempt #1
                  </text>
                </g>
              ) : (
                (() => {
                  const stepX = (480 - 60) / (chronologicalResults.length - 1);
                  const points = chronologicalResults.map((r, i) => {
                    const x = 60 + i * stepX;
                    const y = 190 - (r.percentage / 100) * 170;
                    return { x, y, pct: r.percentage, num: i + 1 };
                  });
                  const pathD = points.reduce(
                    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                    ''
                  );

                  return (
                    <g>
                      {/* Gradient area under trend line */}
                      <path
                        d={`${pathD} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`}
                        fill="rgba(245, 158, 11, 0.08)"
                      />
                      {/* Connecting line */}
                      <path d={pathD} fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Individual dots */}
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5"
                            fill="#0F172A"
                            stroke="#F59E0B"
                            strokeWidth="2"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#0F172A"
                          >
                            {pt.pct}%
                          </text>
                          <text x={pt.x} y="202" textAnchor="middle" fontSize="9" fill="#64748B">
                            #{pt.num}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()
              )}
            </svg>
          </div>
        </div>

        {/* Chart 2: Correct vs Incorrect Answers Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Answer Breakdown</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution across recent attempts (45 Questions)
            </p>
          </div>

          <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
            {results.slice(0, 4).map((r, i) => {
              const correct = r.breakdown?.correctCount ?? r.score;
              const incorrect = r.breakdown?.incorrectCount ?? (45 - r.score);
              const unanswered = r.breakdown?.unansweredCount ?? 0;
              const attemptNum = results.length - i;

              return (
                <div key={r.id || i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">
                      Attempt #{attemptNum} &bull; {new Date(r.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="text-slate-600 font-bold">{r.percentage}%</span>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(correct / 45) * 100}%` }}
                      title={`Correct: ${correct}`}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${(incorrect / 45) * 100}%` }}
                      title={`Incorrect: ${incorrect}`}
                    />
                    {unanswered > 0 && (
                      <div
                        className="bg-slate-300 h-full"
                        style={{ width: `${(unanswered / 45) * 100}%` }}
                        title={`Unanswered: ${unanswered}`}
                      />
                    )}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="text-emerald-700 font-medium">{correct} Correct</span>
                    <span className="text-rose-600 font-medium">{incorrect} Incorrect</span>
                    {unanswered > 0 && <span className="text-slate-500">{unanswered} Skipped</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center space-x-4 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-rose-500" /> Incorrect
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-slate-300" /> Skipped
            </span>
          </div>
        </div>
      </div>

      {/* Chart 3: Time Performance Across Attempts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">Time Performance Across Attempts</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Time spent per attempt compared against 60-minute duration limit
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            Total Allowance: 60 Minutes (3,600s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {results.slice(0, 4).map((r, i) => {
            const secs = r.timeElapsedSeconds || 0;
            const pctOfMax = secs > 0 ? Math.min(100, Math.round((secs / 3600) * 100)) : 0;
            const attemptNum = results.length - i;

            return (
              <div key={r.id || i} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Attempt #{attemptNum}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-base font-bold text-slate-900">
                  {formatTime(r.timeElapsedSeconds)}
                </div>

                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pctOfMax > 90 ? 'bg-rose-500' : pctOfMax > 75 ? 'bg-amber-500' : 'bg-sky-500'}`}
                    style={{ width: `${pctOfMax}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{pctOfMax}% of time used</span>
                  <span>{r.percentage}% score</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. LESSON-BASED ANALYSIS (4 LESSONS & WEAKEST LESSON HIGHLIGHT) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Lesson-Based Performance Analysis (分野別得点・正答率)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated using: Accuracy (%) = (Correct in Lesson ÷ Answered in Lesson) &times; 100
            </p>
          </div>

          {/* Toggle View: Latest vs Aggregate */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLessonViewMode('latest')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lessonViewMode === 'latest'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Latest Attempt
            </button>
            <button
              type="button"
              onClick={() => setLessonViewMode('aggregate')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lessonViewMode === 'aggregate'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Attempts Average
            </button>
          </div>
        </div>

        {/* Missing historical per-question data notice if applicable */}
        {!hasLessonData && (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Historical Question Data Notice</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Detailed lesson-by-lesson breakdown is unavailable for this earlier attempt. Complete a new examination to record comprehensive per-question analytics across all 4 lessons.
              </p>
            </div>
          </div>
        )}

        {/* 4 Lessons Cards Grid */}
        {hasLessonData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessonStats.map((lesson) => {
              const isWeakest = lesson.id === weakestLessonId;
              const hasAnswers = lesson.answeredCount > 0;
              const accuracy = lesson.accuracy;

              return (
                <div
                  key={lesson.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isWeakest
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{lesson.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {lesson.questionRange} ({lesson.totalQuestions} Qs)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{lesson.labelEn}</p>
                    </div>

                    <div className="text-right shrink-0">
                      {hasAnswers && accuracy !== null ? (
                        <div>
                          <span className={`text-xl font-black ${accuracy >= 70 ? 'text-emerald-700' : accuracy >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {accuracy}%
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {lesson.correctCount} / {lesson.answeredCount} answered
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          No questions answered yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        accuracy === null
                          ? 'w-0'
                          : accuracy >= 70
                          ? 'bg-emerald-500'
                          : accuracy >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${accuracy || 0}%` }}
                    />
                  </div>

                  {/* Weakest Lesson Recommendation Callout */}
                  {isWeakest && (
                    <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex items-center justify-between text-xs font-semibold text-amber-950">
                      <div className="flex items-center space-x-1.5 text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Recommended: Practice this lesson again.</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        Weakest Area
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. CHRONOLOGICAL EXAMINATION RECORDS LIST (NEWEST TO OLDEST)   */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">All Examination Records</h3>
            <p className="text-xs text-slate-500">Ordered newest to oldest &bull; {results.length} total attempts</p>
          </div>
        </div>

        <div className="space-y-3">
          {results.map((exam, index) => {
            const attemptNum = results.length - index;
            const perfLevel = exam.performanceLevel || getPerformanceLevel(exam.percentage);
            const correct = exam.breakdown?.correctCount ?? exam.score;
            const incorrect = exam.breakdown?.incorrectCount ?? ((exam.totalMarks || 45) - exam.score);
            const unanswered = exam.breakdown?.unansweredCount ?? 0;
            const hasQuestionDetail = Boolean(exam.questionResults && exam.questionResults.length > 0);

            return (
              <div
                key={exam.id || index}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-[#0F172A] text-amber-400">
                        Attempt #{attemptNum}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {exam.examTitle || '介護特定技能 評価試験 模擬試験 01'}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(exam.submittedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Time Taken: {formatTime(exam.timeElapsedSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${getLevelBadge(
                        perfLevel
                      )}`}
                    >
                      {perfLevel}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        exam.passed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {exam.passed ? 'PASS (合格)' : 'NEEDS PRACTICE'}
                    </span>
                  </div>
                </div>

                {/* Score & Answers Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Score</span>
                    <span className="text-base font-black text-slate-900">
                      {exam.score} / {exam.totalMarks}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Percentage</span>
                    <span className="text-base font-black text-amber-600">
                      {exam.percentage}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Answers</span>
                    <span className="text-xs font-semibold text-slate-700">
                      <span className="text-emerald-700 font-bold">{correct} Correct</span>,{' '}
                      <span className="text-rose-600 font-bold">{incorrect} Incorrect</span>
                      {unanswered > 0 && <span className="text-slate-500"> ({unanswered} skipped)</span>}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {hasQuestionDetail ? (
                      <button
                        type="button"
                        onClick={() => setSelectedAttemptForReview(exam)}
                        className="w-full h-full text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Review {exam.totalMarks || 45} Questions</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Detailed breakdown unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. QUESTION-BY-QUESTION REVIEW MODAL                          */}
      {/* ------------------------------------------------------------- */}
      {selectedAttemptForReview && selectedAttemptForReview.questionResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-3xl w-full max-h-[85vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Detailed Verification Audit
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedAttemptForReview.examTitle || 'Caregiver Skills Evaluation'} &bull; 45 Questions Breakdown
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Score: {selectedAttemptForReview.score}/45 ({selectedAttemptForReview.percentage}%) &bull;{' '}
                  {new Date(selectedAttemptForReview.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAttemptForReview(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Questions List */}
            <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100 flex-1">
              {selectedAttemptForReview.questionResults.map((q) => {
                return (
                  <div key={q.questionId} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">
                          Question #{q.questionNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {q.section}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          q.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.selectedAnswer === null
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {q.isCorrect ? 'CORRECT' : q.selectedAnswer === null ? 'UNANSWERED' : 'INCORRECT'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <span>
                        Selected Answer:{' '}
                        <strong className={q.isCorrect ? 'text-emerald-700' : 'text-rose-600'}>
                          Option {q.selectedAnswer || 'None'}
                        </strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Verified Key: <strong className="text-emerald-700">Option {q.correctAnswer}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAttemptForReview(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
