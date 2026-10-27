import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { VOCABULARY_WORDS, VOCABULARY_SYNONYMS } from './src/data/vocabularyData';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({});

// Helper: Normalize Romaji for matching
function normalizeRomaji(str: string): string {
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
}

// Helper: Sinhala phonetic mapping to approximate Romaji
function sinhalaToRomajiApprox(text: string): string {
  const map: Record<string, string> = {
    'ඉදෝ': 'idou',
    'ඉදො': 'ido',
    'නො': 'no',
    'කයිගෝ': 'kaigo',
    'කයිගො': 'kaigo',
    'ජිරිත්සු': 'jiritsu',
    'ජිරිත්සූ': 'jiritsu',
    'ශියෙන්': 'shien',
    'සියෙන්': 'shien',
    'නින්චිෂෝ': 'ninchishou',
    'නින්චිශෝ': 'ninchishou',
    'ශෝකුජි': 'shokuji',
    'හයිසෙත්සු': 'haisetsu',
    'නියුයොකු': 'nyuyoku',
    'කෙන්සොකු': 'kensoku',
    'කන්සොකු': 'kansoku',
    'හෙන්මාහි': 'henmahi',
    'බොඩි මෙකැනික්ස්': 'body mechanics',
    'ව': 'wa',
    'තො': 'to',
    'ග': 'ga',
    'චිගයි': 'chigai',
  };

  let str = text;
  for (const [si, ro] of Object.entries(map)) {
    str = str.split(si).join(` ${ro} `);
  }
  return str;
}

// Match query against SANSHIN Nihon 472 Vocabulary & Synonyms
function findMatchedVocabulary(query: string) {
  const cleanQ = query.trim().toLowerCase();
  const normQ = normalizeRomaji(query);
  const sinhalaRomaji = normalizeRomaji(sinhalaToRomajiApprox(query));

  const matchedWords: Array<{
    termJa: string;
    furigana: string;
    romaji: string;
    sinhalaMeaning: string;
    lessonId: number;
    chapterNumber?: number;
    chapterTitleJa?: string;
    type: 'word' | 'synonym';
    simplifiedTerm?: string;
  }> = [];

  // Search words
  for (const w of VOCABULARY_WORDS) {
    const wNormRo = normalizeRomaji(w.romaji);
    const kanjiHit = cleanQ.includes(w.kanji) || w.kanji.includes(cleanQ);
    const furiHit = cleanQ.includes(w.furigana) || w.furigana.includes(cleanQ);
    const roHit =
      normQ.length > 2 && (wNormRo.includes(normQ) || normQ.includes(wNormRo));
    const siRoHit =
      sinhalaRomaji.length > 2 &&
      (wNormRo.includes(sinhalaRomaji) || sinhalaRomaji.includes(wNormRo));
    const siHit =
      w.sinhalaMeaning.toLowerCase().includes(cleanQ) ||
      cleanQ.includes(w.sinhalaMeaning.toLowerCase());

    if (kanjiHit || furiHit || roHit || siRoHit || siHit) {
      matchedWords.push({
        termJa: w.kanji,
        furigana: w.furigana,
        romaji: w.romaji,
        sinhalaMeaning: w.sinhalaMeaning,
        lessonId: w.lessonId,
        chapterNumber: w.chapterNumber,
        chapterTitleJa: w.chapterTitleJa,
        type: 'word',
      });
      if (matchedWords.length >= 6) break;
    }
  }

  // Search synonyms if needed
  if (matchedWords.length < 6) {
    for (const s of VOCABULARY_SYNONYMS) {
      const kanjiHit =
        cleanQ.includes(s.technicalTerm) || s.technicalTerm.includes(cleanQ);
      const furiHit =
        cleanQ.includes(s.furigana) || s.furigana.includes(cleanQ);
      const simpHit =
        cleanQ.includes(s.simplifiedTerm) ||
        s.simplifiedTerm.includes(cleanQ);
      const siHit =
        s.sinhalaMeaning.toLowerCase().includes(cleanQ) ||
        cleanQ.includes(s.sinhalaMeaning.toLowerCase());

      if (kanjiHit || furiHit || simpHit || siHit) {
        matchedWords.push({
          termJa: s.technicalTerm,
          furigana: s.furigana,
          romaji: s.technicalTerm,
          sinhalaMeaning: s.sinhalaMeaning,
          lessonId: s.lessonId,
          type: 'synonym',
          simplifiedTerm: s.simplifiedTerm,
        });
        if (matchedWords.length >= 6) break;
      }
    }
  }

  return matchedWords;
}

// Fallback generator when offline or API limit reached
function generateLocalFallback(query: string, matched: ReturnType<typeof findMatchedVocabulary>) {
  const primaryMatch = matched[0];
  const queryTrim = query.trim();

  return {
    queryInterpretation: {
      detectedInput: primaryMatch ? 'Technical Term' : 'Japanese Learning Query',
      detectedJapanese: primaryMatch ? primaryMatch.termJa : queryTrim,
      readingHiragana: primaryMatch ? primaryMatch.furigana : '',
      readingRomaji: primaryMatch ? primaryMatch.romaji : '',
      sinhalaMeaning: primaryMatch
        ? primaryMatch.sinhalaMeaning
        : 'සත්කාරක සේවයට අදාළ ජපන් යෙදුමකි (Caregiver terminology)',
    },
    explanationSinhala: primaryMatch
      ? `මෙම යෙදුම (${primaryMatch.termJa} - ${primaryMatch.furigana}) SANSHIN NIHON විෂය නිර්දේශයේ පාඩම 0${primaryMatch.lessonId} ට අයත් වැදගත් වචනයකි. මෙයින් අදහස් වන්නේ "${primaryMatch.sinhalaMeaning}" යන්නයි. ජපානයේ වැඩිහිටි සත්කාරක මධ්‍යස්ථාන වලදී (Kaigo Facilities) මෙම පදය නිතර භාවිතා වේ.`
      : `මෙම පදය හෝ වාක්‍යය (${queryTrim}) ජපන් කයිගෝ (SSW Caregiver) විභාගයේදී සහ සත්කාරක සේවා කටයුතුවලදී සේවාලාභියාගේ ආරක්ෂාව සහ ස්වාධීනත්වය සුරැකීම සඳහා ප්‍රයෝජනවත් වන මූලික සංකල්පයකි.`,
    caregiverContext: {
      importance:
        'ජපානයේ සත්කාරක සේවාවේදී (Kaigo) සේවාලාභියාගේ ස්වයං ගෞරවය (Dignity) රැකීම, තමන්ට කළ හැකි දේ තමන් විසින්ම කිරීමට ඉඩදීම (自立支援 - Jiritsu Shien), සහ හෙද/සත්කාරක කාර්යමණ්ඩලය සමඟ නිවැරදි සන්නිවේදනය පවත්වා ගැනීම අත්‍යවශ්‍ය වේ.',
      practicalScenario:
        'වැඩබිමේදී (Care Facility) සේවාලාභියාට සහාය වීමට පෙර සැමවිටම කාරුණිකව ආමන්ත්‍රණය කර (声かけ - Koekake), ඔවුන්ගේ කැමැත්ත විමසා, නිරෝගී පැත්තෙන් (健側 - Kensoku) සහාය වීම මූලික පිළිවෙතයි.',
      examTip:
        'SSW කයිගෝ විභාගයේදී "බලහත්කාරයෙන් කිරීම", "සේවාලාභියා වෙනුවෙන් සියල්ල කිරීම" වැරදි පිළිතුරු වන අතර, "සේවාලාභියාගේ ශක්තිය උපයෝගී කර ගැනීම (残存能力の活用)" සහ "ආරක්ෂාව තහවුරු කිරීම" නිවැරදි ප්‍රවේශයයි.',
    },
    grammarBreakdown: [
      {
        part: primaryMatch ? primaryMatch.termJa : queryTrim,
        role: 'මූලික යෙදුම / මූල පදය (Main Term)',
        explanation: 'කයිගෝ විභාගයට නිතර පැමිණෙන වැදගත් තාක්ෂණික හෝ ව්‍යාකරණමය වචනයකි.',
      },
    ],
    exampleSentences: [
      {
        japanese: primaryMatch
          ? `${primaryMatch.termJa}の時は、利用者のペースに合わせます。`
          : '利用者の気持ちを尊重して介護を行います。',
        furigana: primaryMatch
          ? `${primaryMatch.furigana}のときは、りようしゃのぺーすにあわせます。`
          : 'りようしゃのきもちをそんちょうしてかいごをおこないます。',
        sinhala:
          'සේවාලාභියාගේ මානසික සහ කායික වේගයට (Pace) ගැලපෙන පරිදි සත්කාරක සහාය ලබා දෙයි.',
      },
    ],
    matchedVocab: matched,
  };
}

// API Route: POST /api/dictionary/explain
app.post('/api/dictionary/explain', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'කරුණාකර වචනයක්, වාක්‍යයක් හෝ ප්‍රශ්නයක් ඇතුළත් කරන්න (Please enter a query)',
      });
    }

    const trimmedQuery = query.trim();

    // 1. Check local curriculum database
    const matched = findMatchedVocabulary(trimmedQuery);

    // 2. Prepare structured Gemini Prompt
    const prompt = `You are the lead SSW Japanese & Caregiver Specialist at SANSHIN NIHON Academy.
A Sri Lankan student learning Japanese for the Specified Skilled Worker (SSW Tokutei Ginou 1 - 特定技能1号) Caregiver Exam asked the following query:

"${trimmedQuery}"

Student inputs can be:
1. A single Japanese word (e.g. 移動の介護, 認知症, 褥瘡, 誤嚥, 自立支援, 健側).
2. A Romaji question or phrase (e.g. "idou no kaigo to wa nan desu ka", "jiritsu shien to wa").
3. A grammar comparison in Romaji or Japanese (e.g. "wa to ga no chigai", "はとがの違い").
4. A Japanese term or question written phonetically in Sinhala script (e.g. "ඉදෝනො කයිගෝ යනු කුමක්ද?", "ජිරිත්සු ශියෙන්", "නින්චිෂෝ").
5. A Japanese sentence from caregiver textbooks or practice exams (e.g. "利用者は自分で食事をします。").
6. A caregiver situational or examination question.

Context from SANSHIN NIHON Caregiver Curriculum:
${matched.length > 0 ? JSON.stringify(matched, null, 2) : 'No exact match in 4-lesson curriculum, use standard SSW Japanese caregiver knowledge.'}

TASK:
Provide an exceptionally clear, encouraging, beginner-friendly explanation PRIMARILY IN SIMPLE, NATURAL SINHALA (සරල සහ පැහැදිලි සිංහල).
Keep explanations respectful, easy to understand for beginners, and full of practical caregiver insight.

OUTPUT REQUIREMENT:
Respond ONLY with a valid JSON object matching this exact schema:
{
  "queryInterpretation": {
    "detectedInput": "Technical Term" | "Sentence" | "Grammar Question" | "Romaji Query" | "Sinhala-Phonetic Query" | "Exam Question",
    "detectedJapanese": "The correct Japanese Kanji / Kana representation",
    "readingHiragana": "Full Hiragana reading with furigana spacing",
    "readingRomaji": "Clear standard Romaji",
    "sinhalaMeaning": "Accurate, concise Sinhala translation / meaning"
  },
  "explanationSinhala": "Comprehensive yet simple explanation in Sinhala explaining what this means, its breakdown, and how it is used.",
  "caregiverContext": {
    "importance": "Why this is important in Japanese elderly care facilities (කයිගෝ ක්ෂේත්‍රයේ වැදගත්කම / සත්කාරයේදී භාවිතය)",
    "practicalScenario": "Practical real-world facility scenario (වැඩබිමේ ප්‍රායෝගික උදාහරණය - e.g. how the caregiver interacts with or assists the user)",
    "examTip": "SSW Caregiver Examination Tip or common mistakes to avoid (විභාග උපදෙස හෝ වරදින තැන්)"
  },
  "grammarBreakdown": [
    {
      "part": "Word or Particle (e.g. 利用者, は, 自分, で, 食事, を, します)",
      "role": "Grammar role or particle explanation (e.g. 主語 (කර්තෘ), 助詞 (මාතෘකා නිපාතය), ආදිය)",
      "explanation": "Clear explanation in Sinhala of why this word/particle is used here"
    }
  ],
  "exampleSentences": [
    {
      "japanese": "Realistic caregiver sentence in Japanese",
      "furigana": "Hiragana reading of the sentence",
      "sinhala": "Sinhala translation of the sentence"
    }
  ]
}

DO NOT wrap in markdown backticks. Return raw JSON only.`;

    let aiResponseText = '';
    try {
      // Try gemini-3.1-flash-lite first for rapid response
      const result = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      aiResponseText = result.text || '';
    } catch (err: any) {
      console.warn('Gemini 3.1-flash-lite fallback attempt:', err?.message || err);
      // Fallback to gemini-3.8-flash if needed
      try {
        const fallbackResult = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        aiResponseText = fallbackResult.text || '';
      } catch (fbErr: any) {
        console.error('Gemini fallback failed:', fbErr?.message || fbErr);
        // Fall back to local database synthesis
        const fallbackData = generateLocalFallback(trimmedQuery, matched);
        return res.json({
          success: true,
          data: fallbackData,
          matchedVocab: matched,
          source: 'local_database',
        });
      }
    }

    try {
      // Clean and parse JSON
      let cleaned = aiResponseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      parsed.matchedVocab = matched;

      return res.json({
        success: true,
        data: parsed,
        matchedVocab: matched,
        source: 'gemini',
      });
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON:', parseErr, aiResponseText);
      const fallbackData = generateLocalFallback(trimmedQuery, matched);
      return res.json({
        success: true,
        data: fallbackData,
        matchedVocab: matched,
        source: 'local_database_fallback',
      });
    }
  } catch (globalErr: any) {
    console.error('Error in /api/dictionary/explain:', globalErr);
    return res.status(500).json({
      success: false,
      error: 'පැහැදිලි කිරීම ලබා ගැනීමේදී දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න (Server processing error)',
    });
  }
});

// Setup Vite middlewares in dev or serve static build in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SANSHIN SERVER] Running on http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
