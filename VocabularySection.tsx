import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Volume2,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  ListFilter,
  Grid,
  Table as TableIcon,
  Copy,
  Check,
  GraduationCap,
  X,
  Tag,
  Globe,
  BookMarked,
} from 'lucide-react';
import {
  VOCABULARY_WORDS,
  VOCABULARY_SYNONYMS,
  VOCABULARY_CHAPTERS,
  VOCABULARY_LESSONS,
  VocabularyWord,
  VocabularySynonym,
} from '../data/vocabularyData';

// Normalize Romaji helper for lenient, accent-free search (e.g., "shoukai" or "shokai" matches "shōkai")
const normalizeRomaji = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ō/g, 'o')
    .replace(/ū/g, 'u')
    .replace(/ā/g, 'a')
    .replace(/ē/g, 'e')
    .replace(/ī/g, 'i')
    .replace(/ou/g, 'o')
    .replace(/uu/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'e')
    .replace(/ii/g, 'i');
};

// Real-time Text Highlighter Component
export const HighlightText: React.FC<{
  text: string;
  query: string;
  className?: string;
}> = ({ text, query, className = '' }) => {
  const trimmed = query.trim();
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    if (parts.length === 1) {
      return <span className={className}>{text}</span>;
    }
    return (
      <span className={className}>
        {parts.map((part, index) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark
              key={index}
              className="bg-amber-200 text-[#54263F] font-black rounded-xs px-1 py-0.2 shadow-2xs"
            >
              {part}
            </mark>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          )
        )}
      </span>
    );
  } catch {
    return <span className={className}>{text}</span>;
  }
};

// Popular Caregiver Examination Search Tags
const QUICK_SEARCH_TAGS = [
  { label: 'All (සියල්ල)', value: '' },
  { label: '移動・移乗 (ගමන්/මාරුවීම)', value: '移動' },
  { label: '食事・嚥下 (කෑම/ගිලීම)', value: '食事' },
  { label: '排泄・失禁 (මල/මුත්රා)', value: '排泄' },
  { label: '入浴・清潔 (නෑම/පිරිසිදුකම)', value: '入浴' },
  { label: 'みじたく (හැඩගැන්වීම)', value: 'みじたく' },
  { label: 'コミュニケーション (සන්නිවේදනය)', value: 'コミュニケーション' },
  { label: '尊厳・自立 (ගරුත්වය)', value: '尊厳' },
  { label: '褥瘡 (ඇඳ තුවාල)', value: '褥瘡' },
  { label: '誤嚥 (කෑම වැරදිලෙස යෑම)', value: '誤嚥' },
  { label: 'ADL / IADL', value: 'ADL' },
];

export interface VocabularySectionProps {
  onOpenDictionary?: () => void;
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({ onOpenDictionary }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'words' | 'synonyms' | 'flashcards'>('words');
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScopeAll, setSearchScopeAll] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic counts derived from data
  const totalWordCount = VOCABULARY_WORDS.length;
  const totalSynonymCount = VOCABULARY_SYNONYMS.length;

  const lessonCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    VOCABULARY_WORDS.forEach((w) => {
      counts[w.lessonId] = (counts[w.lessonId] || 0) + 1;
    });
    return counts;
  }, []);

  // Flashcard State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState<Record<number, boolean>>({});

  // Audio speech synthesis
  const playJapaneseAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85; // slightly slower for language learners
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut to quickly clear search with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Available chapters based on current lesson filter
  const availableChapters = useMemo(() => {
    if (selectedLessonId === 'all') {
      return VOCABULARY_CHAPTERS;
    }
    return VOCABULARY_CHAPTERS.filter((ch) => ch.lessonId === selectedLessonId);
  }, [selectedLessonId]);

  // Real-time Filtered Essential Words across all four lessons
  const { filteredWords, lessonMatchCounts, totalMatchesAcrossAll } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const normalizedQ = normalizeRomaji(q);

    // Calculate match count in each of the 4 lessons
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalAll = 0;

    VOCABULARY_WORDS.forEach((word) => {
      let isMatch = true;
      if (q) {
        const kanjiMatch = word.kanji.toLowerCase().includes(q);
        const furiganaMatch = word.furigana.toLowerCase().includes(q);
        const sinhalaMatch = word.sinhalaMeaning.toLowerCase().includes(q);
        const romajiRawMatch = word.romaji.toLowerCase().includes(q);
        const romajiNormMatch = normalizeRomaji(word.romaji).includes(normalizedQ);
        const idMatch = String(word.id) === q;
        isMatch = kanjiMatch || furiganaMatch || sinhalaMatch || romajiRawMatch || romajiNormMatch || idMatch;
      }
      if (isMatch) {
        counts[word.lessonId] = (counts[word.lessonId] || 0) + 1;
        totalAll++;
      }
    });

    const words = VOCABULARY_WORDS.filter((word) => {
      // If user typed a search query and searchScopeAll is enabled, filter across all 4 lessons
      const effectiveLesson = q && searchScopeAll ? 'all' : selectedLessonId;
      if (effectiveLesson !== 'all' && word.lessonId !== effectiveLesson) {
        return false;
      }

      // Chapter filter (only when not searching globally across all lessons)
      if ((!q || !searchScopeAll) && selectedChapter !== 'all' && word.chapterNumber !== selectedChapter) {
        return false;
      }

      if (!q) return true;

      const kanjiMatch = word.kanji.toLowerCase().includes(q);
      const furiganaMatch = word.furigana.toLowerCase().includes(q);
      const sinhalaMatch = word.sinhalaMeaning.toLowerCase().includes(q);
      const romajiRawMatch = word.romaji.toLowerCase().includes(q);
      const romajiNormMatch = normalizeRomaji(word.romaji).includes(normalizedQ);
      const idMatch = String(word.id) === q;

      return kanjiMatch || furiganaMatch || sinhalaMatch || romajiRawMatch || romajiNormMatch || idMatch;
    });

    return {
      filteredWords: words,
      lessonMatchCounts: counts,
      totalMatchesAcrossAll: totalAll,
    };
  }, [selectedLessonId, selectedChapter, searchQuery, searchScopeAll]);

  // Filtered Synonyms in real-time
  const filteredSynonyms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const normalizedQ = normalizeRomaji(q);

    return VOCABULARY_SYNONYMS.filter((syn) => {
      const effectiveLesson = q && searchScopeAll ? 'all' : selectedLessonId;
      if (effectiveLesson !== 'all' && syn.lessonId !== effectiveLesson) {
        return false;
      }

      if (!q) return true;

      const techMatch = syn.technicalTerm.toLowerCase().includes(q);
      const furiMatch = syn.furigana.toLowerCase().includes(q);
      const simpMatch = syn.simplifiedTerm.toLowerCase().includes(q);
      const sinhalaMatch = syn.sinhalaMeaning.toLowerCase().includes(q);
      const idMatch = String(syn.id) === q;

      return techMatch || furiMatch || simpMatch || sinhalaMatch || idMatch;
    });
  }, [selectedLessonId, searchQuery, searchScopeAll]);

  // Flashcards deck (based on filtered words, reset index safely if out of range)
  const safeCardIndex = filteredWords.length > 0 ? Math.min(currentCardIndex, filteredWords.length - 1) : 0;
  const currentCard: VocabularyWord | undefined = filteredWords[safeCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (filteredWords.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % filteredWords.length);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (filteredWords.length > 0) {
      setCurrentCardIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
    }
  };

  const markCardStudied = (id: number) => {
    setStudiedCount((prev) => ({ ...prev, [id]: true }));
    handleNextCard();
  };

  const handleLessonChange = (lessonId: number | 'all') => {
    setSelectedLessonId(lessonId);
    setSelectedChapter('all');
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ----------------------------------------------------- */}
      {/* 1. COMPACT VOCABULARY HEADER & NAVIGATION             */}
      {/* ----------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F3C3D8] p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Compact Heading & Primary Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F3C3D8]/60">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
              Caregiver Vocabulary
            </h1>
            <p className="text-xs font-bold text-[#C2185B] mt-1">
              {totalWordCount} Words &middot; {totalSynonymCount} Synonyms
            </p>
          </div>

          {/* Primary Action Buttons: One Essential Words, One Synonyms, One Interactive Flashcards */}
          <div className="flex items-center p-0.5 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8] self-stretch sm:self-auto overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('words')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'words'
                  ? 'bg-[#C2185B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#C2185B]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Essential Words</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'words' ? 'bg-white/20 text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                {filteredWords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('synonyms')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'synonyms'
                  ? 'bg-[#C2185B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#C2185B]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Synonyms</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'synonyms' ? 'bg-white/20 text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                {filteredSynonyms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('flashcards');
                setIsFlipped(false);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'flashcards'
                  ? 'bg-[#C2185B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#C2185B]'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Interactive Flashcards</span>
            </button>

            {onOpenDictionary && (
              <button
                type="button"
                onClick={onOpenDictionary}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap text-[#C2185B] hover:bg-[#FCE4EC] hover:text-[#AD1457]"
                title="Open complete search-indexed Caregiver Dictionary"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Dictionary (472)</span>
              </button>
            )}
          </div>
        </div>

        {/* Simplified Navigation: One "All Lessons" action + Four compact lesson rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Lessons
            </span>
            {/* The ONE "All Lessons" action */}
            <button
              type="button"
              onClick={() => handleLessonChange('all')}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                selectedLessonId === 'all'
                  ? 'bg-[#C2185B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#C2185B] bg-[#FFF0F6] border border-[#F3C3D8]'
              }`}
            >
              <span>All Lessons ({totalWordCount})</span>
            </button>
          </div>

          {/* 4 Compact Lesson Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Lesson 1 — 介護の基本 (100) */}
            <button
              type="button"
              onClick={() => handleLessonChange(1)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedLessonId === 1
                  ? 'bg-[#FFF0F6] border-[#C2185B] ring-1 ring-[#C2185B] text-[#C2185B] font-bold shadow-2xs'
                  : 'bg-white border-[#F3C3D8] hover:border-[#D94F91] text-slate-700 hover:bg-[#FFF5F8]'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                    selectedLessonId === 1 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                  }`}
                >
                  1
                </span>
                <span className="text-xs truncate">
                  Lesson 1 — 介護の基本
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                  selectedLessonId === 1 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                ({lessonCounts[1]})
              </span>
            </button>

            {/* Lesson 2 — こころとからだ (111) */}
            <button
              type="button"
              onClick={() => handleLessonChange(2)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedLessonId === 2
                  ? 'bg-[#FFF0F6] border-[#C2185B] ring-1 ring-[#C2185B] text-[#C2185B] font-bold shadow-2xs'
                  : 'bg-white border-[#F3C3D8] hover:border-[#D94F91] text-slate-700 hover:bg-[#FFF5F8]'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                    selectedLessonId === 2 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                  }`}
                >
                  2
                </span>
                <span className="text-xs truncate">
                  Lesson 2 — こころとからだ
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                  selectedLessonId === 2 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                ({lessonCounts[2]})
              </span>
            </button>

            {/* Lesson 3 — コミュニケーション (59) */}
            <button
              type="button"
              onClick={() => handleLessonChange(3)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedLessonId === 3
                  ? 'bg-[#FFF0F6] border-[#C2185B] ring-1 ring-[#C2185B] text-[#C2185B] font-bold shadow-2xs'
                  : 'bg-white border-[#F3C3D8] hover:border-[#D94F91] text-slate-700 hover:bg-[#FFF5F8]'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                    selectedLessonId === 3 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                  }`}
                >
                  3
                </span>
                <span className="text-xs truncate">
                  Lesson 3 — コミュニケーション
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                  selectedLessonId === 3 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                ({lessonCounts[3]})
              </span>
            </button>

            {/* Lesson 4 — 生活支援技術 (97) */}
            <button
              type="button"
              onClick={() => handleLessonChange(4)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedLessonId === 4
                  ? 'bg-[#FFF0F6] border-[#C2185B] ring-1 ring-[#C2185B] text-[#C2185B] font-bold shadow-2xs'
                  : 'bg-white border-[#F3C3D8] hover:border-[#D94F91] text-slate-700 hover:bg-[#FFF5F8]'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span
                  className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                    selectedLessonId === 4 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                  }`}
                >
                  4
                </span>
                <span className="text-xs truncate">
                  Lesson 4 — 生活支援技術
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                  selectedLessonId === 4 ? 'bg-[#C2185B] text-white' : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                ({lessonCounts[4]})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* 2. REAL-TIME SEARCH BAR & COMPACT FILTER CONTROLS     */}
      {/* ----------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F3C3D8] p-3 sm:p-3.5 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Real-time Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D94F91]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 4 lessons by Kanji, Romaji, or Sinhala..."
              className="w-full pl-9 pr-20 py-2 rounded-xl border border-[#F3C3D8] focus:border-[#C2185B] focus:ring-2 focus:ring-[#F48FB1]/40 text-xs sm:text-sm text-[#54263F] placeholder-[#806779] bg-[#FFF0F6]/30 transition-all outline-hidden font-medium"
            />
            {searchQuery && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFF0F6] text-[#C2185B] border border-[#F3C3D8]">
                  {filteredWords.length} results
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Clear search (Esc)"
                  className="p-1 rounded-lg text-[#806779] hover:text-[#C2185B] hover:bg-[#FFF0F6] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* View Mode Toggle (Table / Cards) */}
          {activeTab !== 'flashcards' && (
            <div className="flex items-center bg-[#FFF0F6] border border-[#F3C3D8] rounded-xl p-0.5 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-[#C2185B] text-white shadow-2xs' : 'text-[#806779] hover:text-[#54263F]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Card Grid View"
                className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  viewMode === 'cards' ? 'bg-[#C2185B] text-white shadow-2xs' : 'text-[#806779] hover:text-[#54263F]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Real-time Match Summary when searching */}
        {searchQuery.trim() && (
          <div className="px-3 py-1.5 bg-[#FFF0F6]/60 rounded-xl border border-[#F3C3D8] flex items-center justify-between text-xs text-[#54263F]">
            <span className="font-semibold truncate">
              Found <strong className="text-[#C2185B]">{filteredWords.length}</strong> matching word{filteredWords.length === 1 ? '' : 's'} across all 4 lessons
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-bold text-[#C2185B] hover:underline cursor-pointer shrink-0 ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* Quick Topic Chips (instant filter on click) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-[#806779] flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-[#D94F91]" /> Quick Topics:
          </span>
          {QUICK_SEARCH_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setSearchQuery(tag.value);
                setSearchScopeAll(true);
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                searchQuery === tag.value
                  ? 'bg-[#C2185B] text-white font-bold shadow-2xs'
                  : 'bg-[#FFF0F6] text-[#54263F] border border-[#F3C3D8]/80 hover:bg-[#FCE4EC] hover:text-[#C2185B]'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Chapter Filter Pills (only when on Words tab and not searching across all lessons) */}
        {activeTab === 'words' && (!searchQuery.trim() || !searchScopeAll) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#F3C3D8]/50">
            <span className="text-xs font-bold text-[#806779] flex items-center gap-1 mr-1">
              <ListFilter className="w-3.5 h-3.5 text-[#D94F91]" /> Chapter Filter:
            </span>

            <button
              type="button"
              onClick={() => setSelectedChapter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedChapter === 'all'
                  ? 'bg-[#C2185B] text-white shadow-2xs'
                  : 'bg-[#FFF0F6] text-[#54263F] border border-[#F3C3D8] hover:bg-[#FCE4EC]'
              }`}
            >
              All Chapters
            </button>

            {availableChapters.map((ch) => (
              <button
                key={`${ch.lessonId}-${ch.chapterNumber}`}
                type="button"
                onClick={() => setSelectedChapter(ch.chapterNumber)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedChapter === ch.chapterNumber
                    ? 'bg-[#C2185B] text-white shadow-2xs'
                    : 'bg-[#FFF0F6] text-[#54263F] border border-[#F3C3D8] hover:bg-[#FCE4EC]'
                }`}
              >
                {selectedLessonId === 'all' ? `L${ch.lessonId} Ch.${ch.chapterNumber}` : `Ch. ${ch.chapterNumber}`}: {ch.titleSi} ({ch.count})
              </button>
            ))}
          </div>
        )}
      </div>


      {/* ----------------------------------------------------- */}
      {/* TAB 1: ESSENTIAL WORDS TABLE / CARDS                  */}
      {/* ----------------------------------------------------- */}
      {activeTab === 'words' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#806779]">
              Showing <span className="font-extrabold text-[#C2185B]">{filteredWords.length}</span> Vocabulary Words
              {selectedLessonId !== 'all' && ` (Lesson ${selectedLessonId})`}
            </span>
            <span className="text-[11px] text-[#806779] hidden sm:inline">
              Click <Volume2 className="w-3 h-3 inline text-[#D94F91]" /> to listen to native Japanese pronunciation
            </span>
          </div>

          {filteredWords.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#F3C3D8] space-y-2">
              <Search className="w-8 h-8 text-[#D94F91] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#54263F]">No vocabulary words matched your filter</h3>
              <p className="text-xs text-[#806779]">Try clearing your search query or selecting a different chapter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedChapter('all');
                  setSelectedLessonId('all');
                }}
                className="mt-2 px-4 py-2 bg-[#C2185B] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-3xl border border-[#F3C3D8] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFF0F6] border-b border-[#F3C3D8] text-[#54263F]">
                      <th className="py-3 px-3.5 font-bold w-12 text-center">#</th>
                      <th className="py-3 px-4 font-bold">Kanji (漢字)</th>
                      <th className="py-3 px-4 font-bold">Furigana / Romaji</th>
                      <th className="py-3 px-4 font-bold">සිංහල තේරුම (Sinhala Meaning)</th>
                      <th className="py-3 px-3.5 font-bold w-24 text-center">Lesson</th>
                      <th className="py-3 px-4 font-bold w-24 text-center">Audio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3C3D8]/50">
                    {filteredWords.map((word) => {
                      const displayNum =
                        word.lessonId === 4
                          ? word.id - 270
                          : word.lessonId === 3
                          ? word.id - 211
                          : word.lessonId === 2
                          ? word.id - 100
                          : word.id;
                      return (
                        <tr
                          key={word.id}
                          className="hover:bg-[#FFF0F6]/40 transition-colors group"
                        >
                          <td className="py-3 px-3.5 text-center font-bold text-[#806779] font-mono text-[11px]">
                            {displayNum}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <HighlightText
                                text={word.kanji}
                                query={searchQuery}
                                className="font-black text-sm text-[#54263F] group-hover:text-[#C2185B] transition-colors"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <HighlightText
                                text={word.furigana}
                                query={searchQuery}
                                className="font-bold text-xs text-[#A83267] block"
                              />
                              <HighlightText
                                text={`(${word.romaji})`}
                                query={searchQuery}
                                className="text-[11px] font-mono text-[#806779] block"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-xs text-slate-800">
                            <HighlightText
                              text={word.sinhalaMeaning}
                              query={searchQuery}
                            />
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
                              L{word.lessonId} Ch.{word.chapterNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => playJapaneseAudio(word.kanji)}
                                title="Listen to Japanese pronunciation"
                                className="p-1.5 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8] transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(`${word.kanji} - ${word.furigana} (${word.romaji}): ${word.sinhalaMeaning}`, `w-${word.id}`)}
                                title="Copy word"
                                className="p-1.5 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#806779] hover:text-[#54263F] border border-[#F3C3D8] transition-colors cursor-pointer"
                              >
                                {copiedId === `w-${word.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredWords.map((word) => {
                const displayNum =
                  word.lessonId === 4
                    ? word.id - 270
                    : word.lessonId === 3
                    ? word.id - 211
                    : word.lessonId === 2
                    ? word.id - 100
                    : word.id;
                return (
                  <div
                    key={word.id}
                    className="bg-white rounded-2xl border border-[#F3C3D8] p-4 shadow-2xs hover:border-[#D94F91] transition-all space-y-2.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#F3C3D8]/50 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-[#FFF0F6] text-[#C2185B] border border-[#F3C3D8] flex items-center justify-center font-bold text-[11px] font-mono shrink-0">
                          {displayNum}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
                          L{word.lessonId} Ch.{word.chapterNumber}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(word.kanji)}
                          title="Listen to Japanese pronunciation"
                          className="p-1 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8] cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(`${word.kanji} - ${word.furigana}: ${word.sinhalaMeaning}`, `wc-${word.id}`)}
                          className="p-1 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#806779] cursor-pointer"
                        >
                          {copiedId === `wc-${word.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-[#54263F] group-hover:text-[#C2185B] transition-colors">
                        <HighlightText text={word.kanji} query={searchQuery} />
                      </h3>
                      <p className="text-xs font-bold text-[#A83267] mt-0.5">
                        <HighlightText text={word.furigana} query={searchQuery} />
                      </p>
                      <p className="text-[11px] font-mono text-[#806779]">
                        <HighlightText text={word.romaji} query={searchQuery} />
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F3C3D8]/40">
                      <span className="text-[10px] uppercase font-bold text-[#806779] block">
                        සිංහල තේරුම:
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        <HighlightText text={word.sinhalaMeaning} query={searchQuery} />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* TAB 2: SYNONYMS / 同義語                             */}
      {/* ----------------------------------------------------- */}
      {activeTab === 'synonyms' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-[#F3C3D8] flex items-start space-x-3 text-xs text-[#54263F]">
            <Layers className="w-5 h-5 text-[#C2185B] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#C2185B]">
                {selectedLessonId === 4
                  ? 'Lesson 4: සමාන වචන ලැයිස්තුව (Synonyms / 同義語 - 30 Words)'
                  : selectedLessonId === 3
                  ? 'Lesson 3: සමාන වචන ලැයිස්තුව (Synonyms / 類義語 - 22 Words)'
                  : selectedLessonId === 2
                  ? 'Lesson 2: සමාන වචන ලැයිස්තුව (Synonyms / 同義語 - 38 Words)'
                  : selectedLessonId === 1
                  ? 'Lesson 1: සමාන වචන ලැයිස්තුව (Synonyms / 同義語 - 15 Words)'
                  : 'සමාන වචන ලැයිස්තුව (All Synonyms / 同義語・類義語 - 105 Words)'}
              </h4>
              <p className="text-xs text-[#806779] mt-0.5">
                Caregiver examination questions (Skill Test &amp; Japanese Test) frequently replace textbook technical terms with simplified expressions. Mastering these pairs ensures higher accuracy.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#F3C3D8] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FFF0F6] border-b border-[#F3C3D8] text-[#54263F]">
                    <th className="py-3 px-3.5 font-bold w-12 text-center">#</th>
                    <th className="py-3 px-4 font-bold">පෙළපොත් / තාක්ෂණික වචනය (Technical Term)</th>
                    <th className="py-3 px-4 font-bold">Furigana (ふりがな)</th>
                    <th className="py-3 px-4 font-bold">සමාන / සරල යෙදුම (Simplified Equivalent)</th>
                    <th className="py-3 px-4 font-bold">සිංහල අර්ථය (Sinhala Meaning)</th>
                    <th className="py-3 px-3 font-bold w-20 text-center">Lesson</th>
                    <th className="py-3 px-3 font-bold w-20 text-center">Audio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3C3D8]/50">
                  {filteredSynonyms.map((syn) => {
                    const displayNum =
                      syn.lessonId === 4
                        ? syn.id - 75
                        : syn.lessonId === 3
                        ? syn.id - 53
                        : syn.lessonId === 2
                        ? syn.id - 15
                        : syn.id;
                    return (
                      <tr key={syn.id} className="hover:bg-[#FFF0F6]/40 transition-colors group">
                        <td className="py-3.5 px-3.5 text-center font-bold text-[#806779] font-mono text-[11px]">
                          {displayNum}
                        </td>
                        <td className="py-3.5 px-4 font-black text-sm text-[#54263F] group-hover:text-[#C2185B]">
                          <HighlightText text={syn.technicalTerm} query={searchQuery} />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-xs text-[#A83267]">
                          <HighlightText text={syn.furigana} query={searchQuery} />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-xs text-emerald-800 bg-emerald-50/50">
                          <HighlightText text={syn.simplifiedTerm} query={searchQuery} />
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-xs text-slate-800">
                          <HighlightText text={syn.sinhalaMeaning} query={searchQuery} />
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
                            L{syn.lessonId}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => playJapaneseAudio(`${syn.technicalTerm}。${syn.simplifiedTerm}`)}
                            title="Listen to Japanese pronunciation"
                            className="p-1.5 rounded-lg bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8] cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* TAB 3: INTERACTIVE FLASHCARD MODE                     */}
      {/* ----------------------------------------------------- */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-5">
          {/* Deck Progress Header */}
          <div className="flex items-center justify-between text-xs text-[#806779] bg-white p-3.5 rounded-2xl border border-[#F3C3D8]">
            <span className="font-bold text-[#54263F]">
              Card {currentCardIndex + 1} of {filteredWords.length}
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-emerald-700">
                Studied: {Object.keys(studiedCount).length} / {filteredWords.length}
              </span>
              <button
                type="button"
                onClick={() => setStudiedCount({})}
                className="text-[11px] text-[#C2185B] hover:underline cursor-pointer"
              >
                Reset Progress
              </button>
            </div>
          </div>

          {currentCard ? (
            <div className="space-y-4">
              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    setIsFlipped(!isFlipped);
                  }
                }}
                className="bg-white rounded-3xl border-2 border-[#F3C3D8] hover:border-[#C2185B] shadow-md p-8 sm:p-12 text-center min-h-[260px] sm:min-h-[300px] flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg relative select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
                    Lesson {currentCard.lessonId} &bull; Ch.{currentCard.chapterNumber}
                  </span>

                  <span className="text-[11px] font-medium text-[#806779] flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-[#D94F91]" /> Click card to flip
                  </span>
                </div>

                <div className="py-6 space-y-3">
                  {!isFlipped ? (
                    /* Front: Japanese Kanji & Furigana */
                    <div className="space-y-2 animate-fade-in">
                      <p className="text-3xl sm:text-4xl md:text-5xl font-black text-[#54263F] tracking-tight">
                        <HighlightText text={currentCard.kanji} query={searchQuery} />
                      </p>
                      <p className="text-base sm:text-lg font-bold text-[#C2185B]">
                        <HighlightText text={currentCard.furigana} query={searchQuery} />
                      </p>
                      <p className="text-xs font-mono text-[#806779]">
                        <HighlightText text={currentCard.romaji} query={searchQuery} />
                      </p>
                    </div>
                  ) : (
                    /* Back: Sinhala Meaning & Details */
                    <div className="space-y-2 animate-fade-in">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#C2185B] block">
                        සිංහල තේරුම (Sinhala Meaning)
                      </span>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                        <HighlightText text={currentCard.sinhalaMeaning} query={searchQuery} />
                      </p>
                      <p className="text-xs text-[#806779] pt-2">
                        {currentCard.chapterTitleSi}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2 pt-2 border-t border-[#F3C3D8]/50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playJapaneseAudio(currentCard.kanji);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#C2185B] text-xs font-bold border border-[#F3C3D8] cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Pronounce (උච්චාරණය)</span>
                  </button>
                </div>
              </div>

              {/* Navigation & Study Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#F3C3D8] hover:bg-[#FFF0F6] text-[#54263F] text-xs font-bold shadow-2xs cursor-pointer flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => markCardStudied(currentCard.id)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Memorized &amp; Next</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#E91E63] hover:from-[#AD1457] hover:to-[#D81B60] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#F3C3D8]">
              <p className="text-sm font-bold text-[#54263F]">No cards in this deck.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
