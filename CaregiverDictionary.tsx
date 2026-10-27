import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  BookMarked,
  BookOpen,
  Layers,
  Copy,
  Check,
  Star,
  X,
  Tag,
  ArrowRight,
  List,
  Grid,
  Filter,
  Sparkles,
  Send,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Building2,
  Heart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  VOCABULARY_WORDS,
  VOCABULARY_SYNONYMS,
  VocabularyWord,
  VocabularySynonym,
} from '../data/vocabularyData';
import { HighlightText } from './VocabularySection';

// Helper: Normalize Romaji for lenient matching
const normalizeRomaji = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ōo]/g, 'o')
    .replace(/[ūu]/g, 'u')
    .replace(/[āa]/g, 'a')
    .replace(/[ēe]/g, 'e')
    .replace(/[īi]/g, 'i')
    .replace(/ou/g, 'o')
    .replace(/uu/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'e')
    .replace(/ii/g, 'i')
    .replace(/[^a-z0-9]/g, '');
};

// Unified Dictionary Entry for the 472-word catalogue
export interface DictionaryEntry {
  id: string;
  type: 'word' | 'synonym';
  termJa: string;
  furigana: string;
  romaji: string;
  sinhalaMeaning: string;
  lessonId: number;
  lessonName: string;
  chapterNumber?: number;
  chapterTitle?: string;
  simplifiedTerm?: string;
  firstLetterRomaji: string;
}

// AI Explanation Structure
export interface ExplanationResult {
  queryInterpretation: {
    detectedInput: string;
    detectedJapanese: string;
    readingHiragana: string;
    readingRomaji: string;
    sinhalaMeaning: string;
  };
  explanationSinhala: string;
  caregiverContext?: {
    importance?: string;
    practicalScenario?: string;
    examTip?: string;
  };
  grammarBreakdown?: Array<{
    part: string;
    role: string;
    explanation: string;
  }>;
  exampleSentences?: Array<{
    japanese: string;
    furigana: string;
    sinhala: string;
  }>;
  matchedVocab?: Array<{
    termJa: string;
    furigana: string;
    romaji: string;
    sinhalaMeaning: string;
    lessonId: number;
    chapterNumber?: number;
    chapterTitleJa?: string;
    type: 'word' | 'synonym';
    simplifiedTerm?: string;
  }>;
}

// Pronunciation helper using Web Speech API
const speakJapanese = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
};

export const CaregiverDictionary: React.FC = () => {
  // -------------------------------------------------------------
  // AI ASSISTANT / SMART DICTIONARY STATE
  // -------------------------------------------------------------
  const [userQuery, setUserQuery] = useState<string>('');
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [explanationData, setExplanationData] = useState<ExplanationResult | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------------------------------------
  // 472 INDEXED CATALOGUE STATE
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'ja' | 'romaji' | 'si'>('all');
  const [selectedLesson, setSelectedLesson] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'word' | 'synonym' | 'bookmarked'>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCatalogue, setShowCatalogue] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sanshin_caregiver_dictionary_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(
        'sanshin_caregiver_dictionary_bookmarks',
        JSON.stringify(Array.from(bookmarkedIds))
      );
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyExplanation = () => {
    if (!explanationData) return;
    const text = `【${explanationData.queryInterpretation.detectedJapanese}】(${explanationData.queryInterpretation.readingHiragana} / ${explanationData.queryInterpretation.readingRomaji})
අර්ථය: ${explanationData.queryInterpretation.sinhalaMeaning}

${explanationData.explanationSinhala}

[කයිගෝ ක්ෂේත්‍රයේ වැදගත්කම]:
${explanationData.caregiverContext?.importance || ''}

[වැඩබිමේ ප්‍රායෝගික උදාහරණය]:
${explanationData.caregiverContext?.practicalScenario || ''}

[විභාග උපදෙස හෝ වරදින තැන්]:
${explanationData.caregiverContext?.examTip || ''}

SANSHIN NIHON Caregiver Assistant`;

    navigator.clipboard.writeText(text);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  // Auto-resize input textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  };

  // Submit query for explanation
  const handleExplain = async (queryToExplain?: string) => {
    const q = (queryToExplain ?? userQuery).trim();
    if (!q) {
      setExplainError('කරුණාකර වචනයක්, වාක්‍යයක් හෝ ප්‍රශ්නයක් ඇතුළත් කරන්න (Please enter a term or sentence)');
      return;
    }

    setIsExplaining(true);
    setExplainError(null);

    try {
      const response = await fetch('/api/dictionary/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Server returned an error');
      }

      setExplanationData(result.data);

      // Smooth scroll to results
      setTimeout(() => {
        resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Explanation request failed:', err);
      // NOTE: Preserving userQuery so student does not lose their text
      setExplainError(
        err.message ||
          'පැහැදිලි කිරීම ලබා ගැනීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න (Failed to fetch explanation)'
      );
    } finally {
      setIsExplaining(false);
    }
  };

  // Keyboard shortcut: Enter or Ctrl+Enter / Cmd+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExplain();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExplain();
    }
  };

  // Quick Scenario Suggestions
  const quickSuggestions = [
    { label: '移動の介護', type: 'Term', text: '移動の介護' },
    { label: 'idou no kaigo to wa', type: 'Romaji', text: 'idou no kaigo to wa nan desu ka' },
    { label: 'jiritsu shien to wa', type: 'Concept', text: 'jiritsu shien to wa' },
    { label: 'wa to ga no chigai', type: 'Grammar', text: 'wa to ga no chigai' },
    { label: 'ඉදෝනො කයිගෝ යනු කුමක්ද?', type: 'Sinhala', text: 'ඉදෝනො කයිගෝ යනු කුමක්ද?' },
    { label: '利用者は自分で食事をします。', type: 'Sentence', text: '利用者は自分で食事をします。' },
    { label: '認知症とは何ですか', type: 'Exam', text: '認知症とは何ですか' },
  ];

  // -------------------------------------------------------------
  // COMPILE ALL 472 INDEXED CATALOGUE ENTRIES
  // -------------------------------------------------------------
  const allEntries: DictionaryEntry[] = useMemo(() => {
    const list: DictionaryEntry[] = [];

    VOCABULARY_WORDS.forEach((w) => {
      const romajiFirst = w.romaji.trim().charAt(0).toUpperCase();
      const firstLetter = /[A-Z]/.test(romajiFirst) ? romajiFirst : '#';
      list.push({
        id: `word-${w.id}`,
        type: 'word',
        termJa: w.kanji,
        furigana: w.furigana,
        romaji: w.romaji,
        sinhalaMeaning: w.sinhalaMeaning,
        lessonId: w.lessonId,
        lessonName:
          w.lessonId === 1
            ? 'Lesson 1: 介護の基本'
            : w.lessonId === 2
            ? 'Lesson 2: こころとからだ'
            : w.lessonId === 3
            ? 'Lesson 3: コミュニケーション'
            : 'Lesson 4: 生活支援技術',
        chapterNumber: w.chapterNumber,
        chapterTitle: w.chapterTitleJa,
        firstLetterRomaji: firstLetter,
      });
    });

    VOCABULARY_SYNONYMS.forEach((s) => {
      const romajiFirst = s.technicalTerm.trim().charAt(0).toUpperCase();
      const firstLetter = /[A-Z]/.test(romajiFirst) ? romajiFirst : '#';
      list.push({
        id: `synonym-${s.id}`,
        type: 'synonym',
        termJa: s.technicalTerm,
        furigana: s.furigana,
        romaji: s.technicalTerm,
        sinhalaMeaning: s.sinhalaMeaning,
        lessonId: s.lessonId,
        lessonName:
          s.lessonId === 1
            ? 'Lesson 1: 介護の基本'
            : s.lessonId === 2
            ? 'Lesson 2: こころとからだ'
            : s.lessonId === 3
            ? 'Lesson 3: コミュニケーション'
            : 'Lesson 4: 生活支援技術',
        simplifiedTerm: s.simplifiedTerm,
        firstLetterRomaji: firstLetter,
      });
    });

    return list;
  }, []);

  // Filtered catalogue entries
  const filteredCatalogue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const normalizedQ = normalizeRomaji(searchQuery.trim());

    return allEntries.filter((entry) => {
      if (selectedLesson !== 'all' && entry.lessonId !== selectedLesson) return false;
      if (selectedType === 'word' && entry.type !== 'word') return false;
      if (selectedType === 'synonym' && entry.type !== 'synonym') return false;
      if (selectedType === 'bookmarked' && !bookmarkedIds.has(entry.id)) return false;
      if (selectedLetter !== 'all' && entry.firstLetterRomaji !== selectedLetter) return false;

      if (!q) return true;

      const jaMatch =
        entry.termJa.toLowerCase().includes(q) ||
        entry.furigana.toLowerCase().includes(q) ||
        (entry.simplifiedTerm && entry.simplifiedTerm.toLowerCase().includes(q));

      const romajiMatch =
        entry.romaji.toLowerCase().includes(q) ||
        normalizeRomaji(entry.romaji).includes(normalizedQ);

      const siMatch = entry.sinhalaMeaning.toLowerCase().includes(q);

      if (searchField === 'ja') return jaMatch;
      if (searchField === 'romaji') return romajiMatch;
      if (searchField === 'si') return siMatch;

      return jaMatch || romajiMatch || siMatch;
    });
  }, [allEntries, searchQuery, searchField, selectedLesson, selectedType, selectedLetter, bookmarkedIds]);

  return (
    <div className="space-y-5 animate-fade-in pb-16 max-w-5xl mx-auto">
      {/* ----------------------------------------------------- */}
      {/* 1. SMART DICTIONARY INPUT (REQUIREMENT 2)            */}
      {/* ----------------------------------------------------- */}
      <section className="bg-white rounded-2xl border-2 border-[#F3C3D8] hover:border-[#E91E63]/60 transition-colors p-4 sm:p-6 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F3C3D8]/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#E91E63] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                  Caregiver Smart Dictionary &amp; Assistant
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8]">
                  AI සහායකයා
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                ජපන් වචන, වාක්‍ය, ව්‍යාකරණ හෝ රෝමාජි/සිංහලෙන් අසන්න &bull; සරල සිංහල පැහැදිලි කිරීම්
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#C2185B] font-bold bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8] self-start sm:self-auto">
            <span>472 Curriculum Terms Indexed</span>
          </div>
        </div>

        {/* Multiline Textarea Input Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Ask or search anything in Japanese, Romaji, or Sinhala:
            <span className="text-slate-600 font-normal ml-1">
              (වචනයක්, වාක්‍යයක්, රෝමාජි හෝ සිංහලෙන් ලියූ ජපන් පදයක් ඇතුළත් කරන්න)
            </span>
          </label>

          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={3}
              value={userQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="උදා: 移動の介護  |  idou no kaigo to wa nan desu ka  |  wa to ga no chigai  |  ඉදෝනො කයිගෝ  |  利用者は自分で食事をします。"
              disabled={isExplaining}
              className="w-full min-h-[90px] max-h-[260px] p-3.5 pr-10 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-white border-2 border-[#F3C3D8] rounded-xl focus:border-[#C2185B] focus:ring-2 focus:ring-[#FCE4EC] outline-none transition-all resize-y leading-relaxed"
            />

            {/* Quick Clear Button */}
            {userQuery && !isExplaining && (
              <button
                type="button"
                onClick={() => {
                  setUserQuery('');
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                  }
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Row: Explanation Button + Shortcuts Hint */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-600 hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Enter</kbd> to search, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-700">Shift+Enter</kbd> for a new line
            </span>

            <button
              type="button"
              onClick={() => handleExplain()}
              disabled={isExplaining || !userQuery.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#E91E63] hover:from-[#AD1457] hover:to-[#D81B60] text-white text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shrink-0"
            >
              {isExplaining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>පැහැදිලි කරමින් පවතී... (Analyzing)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Search / Explain (සොයන්න / පැහැදිලි කරන්න)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-[#F3C3D8]/50">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#C2185B]" />
            <span>Try these test queries (පහත උදාහරණයක් ක්ලික් කර බලන්න):</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUserQuery(item.text);
                  handleExplain(item.text);
                }}
                disabled={isExplaining}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8] hover:border-[#D81B60] transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className="text-[10px] uppercase font-bold text-[#AD1457] px-1 py-0.2 rounded bg-white">
                  {item.type}
                </span>
                <span className="truncate max-w-[200px] sm:max-w-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert Box (preserves user input) */}
        {explainError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-2.5 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">දෝෂයක් ඇති විය (Error):</span>
              <p>{explainError}</p>
            </div>
            <button
              type="button"
              onClick={() => handleExplain()}
              className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-300 text-xs shrink-0 cursor-pointer"
            >
              නැවත උත්සාහ කරන්න
            </button>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------- */}
      {/* 2. EXPLANATION RESULT CARD (REQUIREMENT 3)           */}
      {/* ----------------------------------------------------- */}
      {isExplaining && (
        <div className="bg-white rounded-2xl border border-[#F3C3D8] p-8 text-center space-y-3 shadow-xs animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF0F6] border-2 border-[#C2185B] flex items-center justify-center text-[#C2185B]">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            SANSHIN AI සහායකයා පැහැදිලි කිරීම සකස් කරමින් සිටී...
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Analyzing term structure, matching SANSHIN SSW curriculum, and generating comprehensive Sinhala explanation.
          </p>
        </div>
      )}

      {explanationData && !isExplaining && (
        <section
          ref={resultCardRef}
          className="bg-white rounded-2xl border-2 border-[#C2185B] p-4 sm:p-6 shadow-md space-y-5 animate-fade-in"
        >
          {/* Card Top: Detection Badge + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3C3D8]">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white">
                {explanationData.queryInterpretation.detectedInput || 'Explanation'}
              </span>
              <span className="text-xs text-slate-600">
                SSW Caregiver Explanation &amp; Learning Breakdown
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Pronunciation */}
              <button
                type="button"
                onClick={() =>
                  speakJapanese(
                    explanationData.queryInterpretation.detectedJapanese ||
                      explanationData.queryInterpretation.readingHiragana
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] font-bold text-xs border border-[#F3C3D8] transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Listen to Japanese pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>ශබ්දය (Audio)</span>
              </button>

              {/* Copy Explanation */}
              <button
                type="button"
                onClick={handleCopyExplanation}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Copy entire explanation"
              >
                {copiedExplanation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Large Japanese Term Display */}
          <div className="bg-[#FFF0F6]/80 p-4 sm:p-5 rounded-2xl border border-[#F3C3D8] space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#54263F] tracking-tight">
                {explanationData.queryInterpretation.detectedJapanese}
              </h2>
              {explanationData.queryInterpretation.readingHiragana && (
                <span className="text-base sm:text-lg font-bold text-[#C2185B]">
                  【{explanationData.queryInterpretation.readingHiragana}】
                </span>
              )}
            </div>

            {explanationData.queryInterpretation.readingRomaji && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 font-mono">
                {explanationData.queryInterpretation.readingRomaji}
              </p>
            )}

            <div className="pt-2 border-t border-[#F3C3D8]/60">
              <span className="text-xs text-[#AD1457] font-bold uppercase block tracking-wider">
                සිංහල අර්ථය (Sinhala Meaning)
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {explanationData.queryInterpretation.sinhalaMeaning}
              </p>
            </div>
          </div>

          {/* Primary Sinhala Explanation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#C2185B] uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-[#C2185B]" />
              <span>සරල සිංහල පැහැදිලි කිරීම (Detailed Beginner Explanation)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
              {explanationData.explanationSinhala}
            </div>
          </div>

          {/* Caregiver Context Cards: Importance, Scenario, Exam Tip */}
          {explanationData.caregiverContext && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              {/* Importance */}
              <div className="bg-[#FFF5F8] p-4 rounded-xl border border-[#F3C3D8] space-y-1.5">
                <div className="flex items-center space-x-2 text-[#C2185B] font-bold text-xs uppercase">
                  <Heart className="w-4 h-4 text-[#E91E63]" />
                  <span>කයිගෝ ක්ෂේත්‍රයේ වැදගත්කම</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-normal">
                  {explanationData.caregiverContext.importance || 'ජපානයේ සත්කාරක සේවාවේදී මෙම පදය අත්‍යවශ්‍ය මූලික පිළිවෙතකි.'}
                </p>
              </div>

              {/* Practical Scenario */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>වැඩබිමේ ප්‍රායෝගික උදාහරණය</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-normal">
                  {explanationData.caregiverContext.practicalScenario || 'වැඩිහිටි සත්කාරක මධ්‍යස්ථානයේදී සේවාලාභියා සමඟ කටයුතු කිරීමේදී භාවිතා වේ.'}
                </p>
              </div>

              {/* Exam Tip & Common Mistakes */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4 text-emerald-600" />
                  <span>විභාග උපදෙස හෝ වරදින තැන්</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-normal">
                  {explanationData.caregiverContext.examTip || 'SSW විභාගයේදී ස්වාධීනත්වය සුරැකීම (自立支援) සහ සේවාලාභියාගේ ශක්තිය උපයෝගී කර ගැනීම කෙරෙහි අවධානය යොමු කරන්න.'}
                </p>
              </div>
            </div>
          )}

          {/* Grammar & Particle Breakdown Table */}
          {explanationData.grammarBreakdown && explanationData.grammarBreakdown.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#C2185B]" />
                <span>වචන සහ නිපාත විග්‍රහය (Word &amp; Particle Breakdown)</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FFF0F6] text-[#C2185B] uppercase text-[11px] font-bold border-b border-[#F3C3D8]">
                    <tr>
                      <th className="py-2.5 px-3">යෙදුම / නිපාතය (Part)</th>
                      <th className="py-2.5 px-3">භූමිකාව (Role)</th>
                      <th className="py-2.5 px-3">සිංහල පැහැදිලි කිරීම (Explanation)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {explanationData.grammarBreakdown.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {row.part}
                        </td>
                        <td className="py-2.5 px-3 text-[#AD1457] font-semibold">
                          {row.role}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {row.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Example Sentences */}
          {explanationData.exampleSentences && explanationData.exampleSentences.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#C2185B]" />
                <span>ප්‍රායෝගික වාක්‍ය උදාහරණ (Caregiver Example Sentences)</span>
              </div>
              <div className="space-y-2">
                {explanationData.exampleSentences.map((sent, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 hover:bg-[#FFF5F8] transition-colors rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {sent.japanese}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakJapanese(sent.japanese)}
                          className="p-1 rounded text-[#C2185B] hover:bg-[#FCE4EC] transition-colors cursor-pointer"
                          title="Listen to sentence"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#C2185B]">{sent.furigana}</p>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium">
                        {sent.sinhala}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Curriculum Terms from SANSHIN 4-Lesson Database */}
          {explanationData.matchedVocab && explanationData.matchedVocab.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#F3C3D8]/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#C2185B] uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-[#C2185B]" />
                  <span>SANSHIN විෂය නිර්දේශයේ අදාළ වචන (Matched Curriculum Terms)</span>
                </div>
                <span className="text-[11px] text-slate-600 font-semibold">
                  {explanationData.matchedVocab.length} matches
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {explanationData.matchedVocab.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FFF0F6]/50 border border-[#F3C3D8] hover:border-[#C2185B] transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#54263F]">
                        {w.termJa} ({w.furigana})
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#C2185B] border border-[#F3C3D8]">
                        Lesson {w.lessonId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate">
                      {w.sinhalaMeaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ----------------------------------------------------- */}
      {/* 3. COMPLETE 472 INDEXED CATALOGUE (SEARCH & FILTER)   */}
      {/* ----------------------------------------------------- */}
      <section className="bg-white rounded-2xl border border-[#F3C3D8] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Toggle / Header for Catalogue */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3C3D8]/60">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Official Caregiver Curriculum Dictionary
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8]">
                472 Terms
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Browse all Lessons 1–4 vocabulary &amp; synonyms with search and Romaji A-Z index
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCatalogue((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] text-xs font-bold border border-[#F3C3D8] transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span>{showCatalogue ? 'Hide Catalogue' : 'Show Catalogue'}</span>
            {showCatalogue ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showCatalogue && (
          <div className="space-y-4">
            {/* Search Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 472 terms by Kanji, Romaji, or Sinhala..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-[#FFF0F6]/40 border border-[#F3C3D8] focus:border-[#C2185B] focus:ring-2 focus:ring-[#FCE4EC] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="sm:col-span-4 flex items-center space-x-2">
                <select
                  value={searchField}
                  onChange={(e: any) => setSearchField(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-[#F3C3D8] text-slate-700 outline-none"
                >
                  <option value="all">Search in All Fields</option>
                  <option value="ja">Japanese (Kanji / Kana)</option>
                  <option value="romaji">Romaji (English Letters)</option>
                  <option value="si">Sinhala Meaning (සිංහල)</option>
                </select>
              </div>
            </div>

            {/* Lesson Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'all', label: 'All Lessons (472)' },
                { id: 1, label: 'L1: 介護の基本 (115)' },
                { id: 2, label: 'L2: こころとからだ (149)' },
                { id: 3, label: 'L3: コミュニケーション (69)' },
                { id: 4, label: 'L4: 生活支援技術 (139)' },
              ].map((pill) => (
                <button
                  key={String(pill.id)}
                  type="button"
                  onClick={() => setSelectedLesson(pill.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedLesson === pill.id
                      ? 'bg-[#C2185B] text-white shadow-xs'
                      : 'bg-[#FFF0F6] text-slate-700 hover:bg-[#FCE4EC] border border-[#F3C3D8]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedType(selectedType === 'bookmarked' ? 'all' : 'bookmarked')}
                className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                  selectedType === 'bookmarked'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Favorites ({bookmarkedIds.size})</span>
              </button>
            </div>

            {/* Results Count & View Switcher */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span>
                Showing <strong className="text-slate-900">{filteredCatalogue.length}</strong> terms
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[#C2185B] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[#C2185B] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cards List / Grid */}
            {filteredCatalogue.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-600">No matching dictionary terms found</p>
                <p className="text-xs text-slate-400 mt-1">Try another keyword or search using the AI Assistant at the top.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="divide-y divide-[#F3C3D8]/40 border border-[#F3C3D8] rounded-xl overflow-hidden">
                {filteredCatalogue.slice(0, 80).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 sm:p-3.5 bg-white hover:bg-[#FFF5F8] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {entry.termJa}
                        </span>
                        <span className="text-xs font-bold text-[#C2185B]">
                          【{entry.furigana}】
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {entry.romaji}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFF0F6] text-[#C2185B] border border-[#F3C3D8]">
                          L0{entry.lessonId}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium">
                        {entry.sinhalaMeaning}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                      {/* Audio */}
                      <button
                        type="button"
                        onClick={() => speakJapanese(entry.termJa)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#C2185B] hover:bg-[#FFF0F6] transition-colors cursor-pointer"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Favorite */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(entry.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          bookmarkedIds.has(entry.id)
                            ? 'text-amber-500'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                        }`}
                        title="Bookmark"
                      >
                        <Star className={`w-3.5 h-3.5 ${bookmarkedIds.has(entry.id) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => handleCopyText(`${entry.termJa} - ${entry.sinhalaMeaning}`, entry.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy"
                      >
                        {copiedId === entry.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Ask AI to Explain */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserQuery(entry.termJa);
                          handleExplain(entry.termJa);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] font-bold text-xs border border-[#F3C3D8] transition-colors cursor-pointer"
                        title="Ask AI to explain this term"
                      >
                        Explain &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCatalogue.slice(0, 60).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl border border-[#F3C3D8] bg-white hover:border-[#C2185B] transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {entry.termJa}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFF0F6] text-[#C2185B] border border-[#F3C3D8]">
                          L0{entry.lessonId}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#C2185B]">【{entry.furigana}】</p>
                      <p className="text-[11px] font-mono text-slate-500">{entry.romaji}</p>
                      <p className="text-xs text-slate-700 font-medium line-clamp-2 pt-1 border-t border-slate-100">
                        {entry.sinhalaMeaning}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => speakJapanese(entry.termJa)}
                          className="p-1 rounded text-slate-500 hover:text-[#C2185B] transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBookmark(entry.id)}
                          className={`p-1 rounded transition-colors ${
                            bookmarkedIds.has(entry.id) ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${bookmarkedIds.has(entry.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserQuery(entry.termJa);
                          handleExplain(entry.termJa);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-[#C2185B] bg-[#FFF0F6] hover:bg-[#FCE4EC] border border-[#F3C3D8]"
                      >
                        Explain &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredCatalogue.length > 80 && (
              <p className="text-center text-xs text-slate-500 pt-2">
                Showing top 80 of {filteredCatalogue.length} terms. Refine your search query to see more.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
