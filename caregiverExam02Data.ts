/**
 * SANSHIN NIHON CAREGIVER EXAMINATION DATASET
 * TEST 02 (1st lesson)
 * 
 * 46 Verified Multiple Choice Questions with Furigana & Exact Answer Key
 * 
 * Distribution:
 * - Lesson 1: 介護の基本 (Questions 1–13) [13 Qs]
 * - Lesson 2: こころとからだのしくみ (Questions 1–13) [13 Qs]
 * - Lesson 3: 生活支援技術 (Questions 1–12) [12 Qs]
 * - Lesson 4: 医療的ケア・多職種連携 (Questions 1–8) [8 Qs]
 * Total: 46 Questions
 * 
 * Scoring:
 * - 46 Questions, 1 mark each (Total: 46 marks)
 * - Passing Score: 40 marks (86.96%)
 * - PASS: 40–46 marks (86.96%–100.00%)
 * - FAIL: 0–39 marks (0.00%–84.78%)
 */

import { AuthoritativeQuestion, Examination, ExamResult } from '../types/exam';

export const CAREGIVER_EXAM_02_ID = 'sanshin-caregiver-exam-02';

export const caregiverExam02: Examination = {
  id: CAREGIVER_EXAM_02_ID,
  title: 'TEST 02 (1st lesson)',
  subject: '介護（介護の基本、こころとからだのしくみ、生活支援技術、医療的ケア・多職種連携）',
  category: '介護実習・専門技能',
  language: 'ja',
  durationMinutes: 60,
  totalMarks: 46,
  passingMarks: 40, // 40 / 46 = 86.96%
  questionCount: 46,
  publicationStatus: 'published',
  availability: {
    isActive: false,
  },
  instructions: [
    '全46問の選択式（A・B・Cの3択）試験です。',
    '各設問で最も適切なものを1つ選んでください。',
    '試験時間は60分です。制限時間が終了すると自動的に答案が提出されます。',
    '各問題の配点は1点、合計46点満点です。40点以上（86.96%以上）で合格（PASS）となります。',
    'すべての問題に回答した後、「試験終了・提出（Submit）」ボタンを押してください。',
  ],
  associatedPdfIds: [],
  createdAt: '2026-10-24T00:00:00Z',
  updatedAt: '2026-10-24T00:00:00Z',
};

export const TEST_02_LESSON_DEFINITIONS = [
  {
    id: 'lesson_01',
    title: '介護の基本',
    labelEn: 'Fundamentals of Caregiving',
    questionRange: 'Q1–Q13',
    totalQuestions: 13,
  },
  {
    id: 'lesson_02',
    title: 'こころとからだのしくみ',
    labelEn: 'Mechanisms of Mind and Body',
    questionRange: 'Q1–Q13',
    totalQuestions: 13,
  },
  {
    id: 'lesson_03',
    title: '生活支援技術',
    labelEn: 'Life Support Technology',
    questionRange: 'Q1–Q12',
    totalQuestions: 12,
  },
  {
    id: 'lesson_04',
    title: '医療的ケア・多職種連携',
    labelEn: 'Medical Care & Interprofessional Collaboration',
    questionRange: 'Q1–Q8',
    totalQuestions: 8,
  },
];

export const caregiverExam02Questions: AuthoritativeQuestion[] = [
  // =========================================================================
  // LESSON 1 — 介護の基本（かいごのきほん） [13 Questions]
  // =========================================================================
  {
    id: 't02_l1_q01',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 1,
    lessonQuestionNumber: 1,
    section: '介護の基本',
    text: '利用者（りようしゃ）の自宅（じたく）を訪問（ほうもん）し、サービスを提供（ていきょう）するサービスは何（なに）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '通所系（つうしょけい）サービス' },
      { id: 'B', label: 'B', text: '訪問系（ほうもんけい）サービス' },
      { id: 'C', label: 'C', text: '入所系（にゅうしょけい）サービス' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l1_q02',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 2,
    lessonQuestionNumber: 2,
    section: '介護の基本',
    text: '日中（にっちゅう）、介護施設（かいごしせつ）で利用者（りようしゃ）にサービスを提供（ていきょう）するサービスはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '訪問介護（ほうもんかいご）' },
      { id: 'B', label: 'B', text: '介護老人福祉施設（かいごろうじんふくししせつ）' },
      { id: 'C', label: 'C', text: '通所介護（つうしょかいご・デイサービス）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l1_q03',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 3,
    lessonQuestionNumber: 3,
    section: '介護の基本',
    text: '介護老人福祉施設（かいごろうじんふくししせつ）（特別養護老人ホーム（とくべつようごろうじんホーム））は、どのサービスに分類（ぶんるい）されますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '入所系（にゅうしょけい）サービス' },
      { id: 'B', label: 'B', text: '通所系（つうしょけい）サービス' },
      { id: 'C', label: 'C', text: '訪問系（ほうもんけい）サービス' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l1_q04',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 4,
    lessonQuestionNumber: 4,
    section: '介護の基本',
    text: '介護（かいご）過程（かてい）を実施（じっし）する目的（もくてき）は何（なに）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '介護職（かいごしょく）の仕事（しごと）を増（ふ）やすこと' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）一人（ひとり）ひとりの望（のぞ）む生活（せいかつ）を実現（じつげん）すること' },
      { id: 'C', label: 'C', text: '施設（しせつ）の費用（ひよう）を削減（さくげん）すること' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l1_q05',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 5,
    lessonQuestionNumber: 5,
    section: '介護の基本',
    text: '介護（かいご）過程（かてい）の最初（さいしょ）の段階（だんかい）で、利用者（りようしゃ）に関（かん）する情報（じょうほう）を集（あつ）め、生活（せいかつ）課題（かだい）などについて分析（ぶんせき）するステップは何（なに）と呼（よ）ばれますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '評価（ひょうか）' },
      { id: 'B', label: 'B', text: '計画（けいかく）作成（さくせい）' },
      { id: 'C', label: 'C', text: 'アセスメント' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l1_q06',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 6,
    lessonQuestionNumber: 6,
    section: '介護の基本',
    text: '介護（かいご）計画（けいかく）には、何（なに）を書（か）きますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '目標（もくひょう）と具体的（ぐたいてき）な支援（しえん）内容（ないよう）' },
      { id: 'B', label: 'B', text: '施設（しせつ）の食事（しょくじ）の献立（こんだて）だけ' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の家族（かぞく）の履歴書（りれきしょ）' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l1_q07',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 7,
    lessonQuestionNumber: 7,
    section: '介護の基本',
    text: '介護（かいご）過程（かてい）の基本的（きほんてき）な流（なが）れの正（ただ）しい順序（じゅんじょ）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '計画作成 → 実施 → アセスメント → 評価' },
      { id: 'B', label: 'B', text: '実施 → アセスメント → 評価 → 計画作成' },
      { id: 'C', label: 'C', text: 'アセスメント → 計画作成 → 実施 → 評価' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l1_q08',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 8,
    lessonQuestionNumber: 8,
    section: '介護の基本',
    text: '介護職（かいごしょく）が支援（しえん）をするための基本（きほん）となる考（かんが）え方（かた）は何（なに）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '施設（しせつ）の利益（りえき）を最優先（さいゆうせん）すること' },
      { id: 'B', label: 'B', text: '人間（にんげん）の尊厳（そんげん）' },
      { id: 'C', label: 'C', text: '介護職（かいごしょく）の価値観（かちかん）の押（お）し付（つ）け' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l1_q09',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 9,
    lessonQuestionNumber: 9,
    section: '介護の基本',
    text: '介護（かいご）における「生活（せいかつ）の主体（しゅたい）」はだれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の家族（かぞく）' },
      { id: 'B', label: 'B', text: '介護職（かいごしょく）' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）自身（じしん）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l1_q10',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 10,
    lessonQuestionNumber: 10,
    section: '介護の基本',
    text: 'QOL（Quality of Life）について、正（ただ）しい説明（せつめい）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '人生（じんせい）に対（たい）する満足感（まんぞくかん）や幸福感（こうふくかん）、生（い）きがいなど精神面（せいしんめん）の豊（ゆた）かさを含（ふく）めた生活（せいかつ）の考（かんが）え方（かた）' },
      { id: 'B', label: 'B', text: '他人（たにん）の助（たす）けを一切（いっさい）借（か）りずに暮（く）らすこと' },
      { id: 'C', label: 'C', text: '経済的（けいざいてき）に裕福（ゆうふく）で贅沢（ぜいたく）な生活（せいかつ）を送（おく）ること' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l1_q11',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 11,
    lessonQuestionNumber: 11,
    section: '介護の基本',
    text: 'ノーマライゼーションの考（かんが）え方（かた）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '高齢者（こうれいしゃ）だけが優遇（ゆうぐう）される地域（ちいき）社会（しゃかい）を作（つく）ること' },
      { id: 'B', label: 'B', text: '障害（しょうがい）がある人も障害（しょうがい）がない人と同じように、偏見（へんけん）を受（う）けず人権（じんけん）が守（まも）られ、普通（ふつう）に生活（せいかつ）できるという考（かんが）え方（かた）' },
      { id: 'C', label: 'C', text: '障害（しょうがい）のある人（ひと）を専用（せんよう）の施設（しせつ）に隔離（かくり）して暮（く）らすこと' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l1_q12',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 12,
    lessonQuestionNumber: 12,
    section: '介護の基本',
    text: '介護（かいご）における「自立（じりつ）」の意味（いみ）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '身体（しんたい）を一切（いっさい）動（うご）かさずに安静（あんせい）にすること' },
      { id: 'B', label: 'B', text: 'すべての動作（どうさ）を他人（たにん）の助（たす）けなしで行（おこな）うこと' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）自身（じしん）がどのように生活（せいかつ）したいかを選択（せんたく）し、自分（じぶん）で決定（けってい）すること' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l1_q13',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 13,
    lessonQuestionNumber: 13,
    section: '介護の基本',
    text: '自立（じりつ）を支援（しえん）する上（うえ）で、介護職（かいごしょく）が大切（たいせつ）にするべきことはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '介護職（かいごしょく）の判断（はんだん）で一方的（いっぽうてき）にスケジュールを決（き）めること' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の意思（いし）や力（ちから）でできることを増（ふ）やすこと' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の時間（じかん）を節約（せつやく）するため、できるだけ介護職（かいごしょく）が代（か）わりに作業（さぎょう）を行（おこな）うこと' },
    ],
    correctAnswerId: 'B',
  },

  // =========================================================================
  // LESSON 2 — こころとからだのしくみ [13 Questions]
  // =========================================================================
  {
    id: 't02_l2_q01',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 14,
    lessonQuestionNumber: 1,
    section: 'こころとからだのしくみ',
    text: '人間（にんげん）の生活（せいかつ）リズムに関（かん）して、一般的（いっぱんてき）に含（ふく）まれないものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '食事（しょくじ）・排泄（はいせつ）・入浴（にゅうよく）' },
      { id: 'B', label: 'B', text: '起床（きしょう）・着替（きが）え・洗面（せんめん）' },
      { id: 'C', label: 'C', text: '株（かぶ）の取引（とりひき）や不動産（ふどうさん）投資（とうし）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l2_q02',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 15,
    lessonQuestionNumber: 2,
    section: 'こころとからだのしくみ',
    text: '介護（かいご）における観察（かんさつ）の目的（もくてき）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の生活（せいかつ）の向上（こうじょう）に活（い）かすこと' },
      { id: 'B', label: 'B', text: '介護職（かいごしょく）の仕事（しごと）を減（へ）らすこと' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の行動（こうどう）を制限（せいげん）すること' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l2_q03',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 16,
    lessonQuestionNumber: 3,
    section: 'こころとからだのしくみ',
    text: 'リスクマネジメントの意味（いみ）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '事故（じこ）の責任（せきにん）を個人（こじん）に負（お）わせること' },
      { id: 'B', label: 'B', text: '危険（きけん）なことを予測（よそく）して、事故（じこ）を防止（ぼうし）すること' },
      { id: 'C', label: 'C', text: '事故（じこ）が起（お）きてから原因（げんいん）を調（しら）べること' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l2_q04',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 17,
    lessonQuestionNumber: 4,
    section: 'こころとからだのしくみ',
    text: '感染症対策（かんせんしょうたいさく）の基本（きほん）として、正（ただ）しい３つの原則（げんそく）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '隔離（かくり）する・薬（くすり）を飲（の）む・休（やす）む' },
      { id: 'B', label: 'B', text: '洗（あら）う・消毒（しょうどく）・換気（かんき）する' },
      { id: 'C', label: 'C', text: '持（も）ち込（こ）まない・持（も）ち出（だ）さない・広（ひろ）げない' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l2_q05',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 18,
    lessonQuestionNumber: 5,
    section: 'こころとからだのしくみ',
    text: 'スタンダード・プリコーション（標準予防策（ひょうじゅんよぼうさく））について、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'すべての患者（かんじゃ）の血液（けつえき）、体液（たいえき）、排泄物（はいせつぶつ）などは、感染（かんせん）する危険性（きけんせい）があるものとして取り扱（とりあつか）う' },
      { id: 'B', label: 'B', text: '手袋（てぶくろ）をすれば、何度（なんど）使（つか）ってもよい' },
      { id: 'C', label: 'C', text: '感染症（かんせんしょう）の患者（かんじゃ）だけ手袋（てぶくろ）を使用（しよう）する' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l2_q06',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 19,
    lessonQuestionNumber: 6,
    section: 'こころとからだのしくみ',
    text: '手洗（てあら）いにおいて、最（もっと）も不十分（ふじゅうぶん）になりやすい部位（ぶい）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '腕（うで）の中央（ちゅうおう）' },
      { id: 'B', label: 'B', text: '指先（ゆびさき）・指間（しかん）・手（て）の甲（こう）・親指（おやゆび）のつけ根（ね）・手首（てくび）' },
      { id: 'C', label: 'C', text: '手（て）のひら全体（ぜんたい）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l2_q07',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 20,
    lessonQuestionNumber: 7,
    section: 'こころとからだのしくみ',
    text: 'インフルエンザなどの感染症（かんせんしょう）は、どの感染経路（かんせんけいろ）で広（ひろ）がることが多（おお）いですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '経口感染（けいこうかんせん）' },
      { id: 'B', label: 'B', text: '空気感染（くうきかんせん）' },
      { id: 'C', label: 'C', text: '飛沫感染（ひまつかんせん）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l2_q08',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 21,
    lessonQuestionNumber: 8,
    section: 'こころとからだのしくみ',
    text: '手洗（てあら）いの際（さい）、指輪（ゆびわ）や腕時計（うでどけい）を付（つ）けている場合（ばあい）、どうすべきですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '指輪（ゆびわ）や腕時計（うでどけい）を外（はず）してから、丁寧（ていねい）に手（て）を洗（あら）う' },
      { id: 'B', label: 'B', text: 'アルコール消毒（しょうどく）だけをする' },
      { id: 'C', label: 'C', text: 'そのまま洗（あら）えば問題（もんだい）ない' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l2_q09',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 22,
    lessonQuestionNumber: 9,
    section: 'こころとからだのしくみ',
    text: '手指消毒液（しゅししょうどくえき）を使用（しよう）する前（まえ）、目（め）に見（み）える汚（よご）れがある場合（ばあい）はどうしますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'ティッシュで拭（ふ）き取（と）るだけにする' },
      { id: 'B', label: 'B', text: 'まず石鹸液（せっけんえき）で一連（いちれん）の手洗（てあら）いを行（おこな）う' },
      { id: 'C', label: 'C', text: 'そのまま消毒液（しょうどくえき）を多（おお）めに塗（ぬ）る' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l2_q10',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 23,
    lessonQuestionNumber: 10,
    section: 'こころとからだのしくみ',
    text: '荷物（にもつ）を持（も）ち上（あ）げる時（とき）、腰（こし）の負担（ふたん）を減（へ）らす正（ただ）しい姿勢（しせい）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '荷物（にもつ）を体（からだ）から遠（とお）く離（はな）して持（も）つ' },
      { id: 'B', label: 'B', text: '膝（ひざ）を伸（の）ばしたまま、腰（こし）の筋肉（きんにく）だけで持（も）ち上（あ）げる' },
      { id: 'C', label: 'C', text: '膝（ひざ）を曲（ま）げて重心（じゅうしん）を低（ひく）くし、太（ふと）ももの筋肉（きんにく）を利用（りよう）する' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l2_q11',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 24,
    lessonQuestionNumber: 11,
    section: 'こころとからだのしくみ',
    text: 'ベッドなどを動（うご）かす時（とき）、腰（こし）への負担（ふたん）を減（へ）らすために、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '腰（こし）を大（おお）きく曲（ま）げ、腰（こし）の力（ちから）だけで動（うご）かす' },
      { id: 'B', label: 'B', text: '膝（ひざ）を軽（かる）く曲（ま）げ、腰（こし）をひねらず、急（きゅう）な動作（どうさ）を避（さ）けて動（うご）かす' },
      { id: 'C', label: 'C', text: '腕（うで）を伸（の）ばして、身体（からだ）から遠（とお）い位置（いち）で動（うご）かす' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l2_q12',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 25,
    lessonQuestionNumber: 12,
    section: 'こころとからだのしくみ',
    text: '支持基底面（しじきていめん）を広（ひろ）く取（と）ることの目的（もくてき）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '介護職（かいごしょく）の力（ちから）を弱（よわ）める' },
      { id: 'B', label: 'B', text: 'からだのバランスが不安定（ふあんてい）になる' },
      { id: 'C', label: 'C', text: 'より安定（あんてい）した姿勢（しせい）を保（たも）つことができる' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l2_q13',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 26,
    lessonQuestionNumber: 13,
    section: 'こころとからだのしくみ',
    text: '介護職（かいごしょく）がこころの健康（けんこう）を保（たも）つために、適切（てきせつ）な行動（こうどう）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '不安（ふあん）や心配事（しんぱいごと）は一人（ひとり）で抱（かか）え込（こ）む' },
      { id: 'B', label: 'B', text: '先輩（せんぱい）や仲間（なかま）と話（はな）したり、相談（そうだん）する' },
      { id: 'C', label: 'C', text: '睡眠時間（すいみんじかん）を極端（きょくたん）に減（へ）らす' },
    ],
    correctAnswerId: 'B',
  },

  // =========================================================================
  // LESSON 3 — 生活支援技術（せいかつしえんぎじゅつ） [12 Questions]
  // =========================================================================
  {
    id: 't02_l3_q01',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 27,
    lessonQuestionNumber: 1,
    section: '生活支援技術',
    text: '介護職（かいごしょく）の役割（やくわり）として適切（てきせつ）なものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の変化（へんか）を無視（むし）する' },
      { id: 'B', label: 'B', text: '多職種（たしょくしゅ）と連携（れんけい）し、利用者（りようしゃ）の望（のぞ）む生活（せいかつ）を実現（じつげん）する' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の要介護（ようかいご）状態（じょうたい）が悪（わる）くなるようにする' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l3_q02',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 28,
    lessonQuestionNumber: 2,
    section: '生活支援技術',
    text: '入浴（にゅうよく）や排泄（はいせつ）の場面（ばめん）で、介護職（かいごしょく）が最（もっと）も配慮（はいりょ）すべきことは何（なん）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'プライバシーへの配慮（はいりょ）' },
      { id: 'B', label: 'B', text: '他（ほか）の人（ひと）に見（み）せること' },
      { id: 'C', label: 'C', text: '時間（じかん）の節約（せつやく）' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l3_q03',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 29,
    lessonQuestionNumber: 3,
    section: '生活支援技術',
    text: '秘密保持（ひみつほじ）について、正（ただ）しい行動（こうどう）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'SNSに利用者（りようしゃ）の個人情報（こじんじょうほう）を投稿（とうこう）する' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の同意（どうい）を得（え）ずに家族（かぞく）以外（いがい）の人（ひと）に話（はな）す' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の同意（どうい）を得（え）ずに個人情報（こじんじょうほう）を他（ほか）の人（ひと）に話（はな）してはいけない' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l3_q04',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 30,
    lessonQuestionNumber: 4,
    section: '生活支援技術',
    text: '身体拘束（しんたいこうそく）の弊害（へいがい）として適切（てきせつ）なものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '身体能力（しんたいのうりょく）の向上（こうじょう）' },
      { id: 'B', label: 'B', text: '身体能力（しんたいのうりょく）の低下（ていか）や認知症（にんちしょう）の悪化（あっか）' },
      { id: 'C', label: 'C', text: '認知症（にんちしょう）の改善（かいぜん）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l3_q05',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 31,
    lessonQuestionNumber: 5,
    section: '生活支援技術',
    text: '次（つぎ）のうち、身体拘束（しんたいこうそく）にあたる行為（こうい）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の話（はなし）を聞（き）く' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）と一緒（いっしょ）に散歩（さんぽ）する' },
      { id: 'C', label: 'C', text: '部屋（へや）に鍵（かぎ）をかけて閉（と）じ込（こ）める' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l3_q06',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 32,
    lessonQuestionNumber: 6,
    section: '生活支援技術',
    text: 'ベッドを柵（さく）で囲（かこ）み、自分（じぶん）で下（お）りられないようにする行為（こうい）は何（なん）と呼（よ）ばれますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '自立支援（じりつしえん）' },
      { id: 'B', label: 'B', text: '身体拘束（しんたいこうそく）' },
      { id: 'C', label: 'C', text: '適切（てきせつ）な介護（かいご）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l3_q07',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 33,
    lessonQuestionNumber: 7,
    section: '生活支援技術',
    text: '向精神薬（こうせいしんやく）を過剰（かじょう）に飲（の）ませる行為（こうい）は、何（なん）に該当（がいとう）しますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'リハビリテーション' },
      { id: 'B', label: 'B', text: '適切（てきせつ）な服薬介助（ふくやくかいじょ）' },
      { id: 'C', label: 'C', text: '行動（こうどう）を制限（せいげん）する目的（もくてき）で過剰（かじょう）に投薬（とうやく）することは、身体拘束（しんたいこうそく）に該当（がいとう）する場合（ばあい）がある' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l3_q08',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 34,
    lessonQuestionNumber: 8,
    section: '生活支援技術',
    text: '利用者（りようしゃ）のからだに暴行（ぼうこう）を加（くわ）える行為（こうい）は、どの虐待（ぎゃくたい）に該当（がいとう）しますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '心理的虐待（しんりてきぎゃくたい）' },
      { id: 'B', label: 'B', text: '身体的虐待（しんたいてきぎゃくたい）' },
      { id: 'C', label: 'C', text: '経済的虐待（けいざいてきぎゃくたい）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l3_q09',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 35,
    lessonQuestionNumber: 9,
    section: '生活支援技術',
    text: '利用者（りようしゃ）を傷（きず）つける言動（げんどう）や恐怖（きょうふ）を与（あた）える言動（げんどう）をする虐待（ぎゃくたい）は何（なん）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '性的虐待（せいてきぎゃくたい）' },
      { id: 'B', label: 'B', text: '介護等放棄（かいごとうほうき）' },
      { id: 'C', label: 'C', text: '心理的虐待（しんりてきぎゃくたい）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l3_q10',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 36,
    lessonQuestionNumber: 10,
    section: '生活支援技術',
    text: 'ご飯（はん）を食（た）べさせない、介護（かいご）をしないなどの放置（ほうち）行為（こうい）は何（なん）と呼（よ）ばれますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '経済的虐待（けいざいてきぎゃくたい）' },
      { id: 'B', label: 'B', text: '介護等放棄（かいごとうほうき）（ネグレクト）' },
      { id: 'C', label: 'C', text: '身体的虐待（しんたいてきぎゃくたい）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l3_q11',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 37,
    lessonQuestionNumber: 11,
    section: '生活支援技術',
    text: '利用者（りようしゃ）から不当（ふとう）に財産上（ざいさんじょう）の利益（りえき）を得（え）る行為（こうい）はどの虐待（ぎゃくたい）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '経済的虐待（けいざいてきぎゃくたい）' },
      { id: 'B', label: 'B', text: '心理的虐待（しんりてきぎゃくたい）' },
      { id: 'C', label: 'C', text: '性的虐待（せいてきぎゃくたい）' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l3_q12',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 38,
    lessonQuestionNumber: 12,
    section: '生活支援技術',
    text: '利用者（りようしゃ）にわいせつな行為（こうい）をすることは何（なん）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '身体的虐待（しんたいてきぎゃくたい）' },
      { id: 'B', label: 'B', text: '介護等放棄（かいごとうほうき）' },
      { id: 'C', label: 'C', text: '性的虐待（せいてきぎゃくたい）' },
    ],
    correctAnswerId: 'C',
  },

  // =========================================================================
  // LESSON 4 — 医療的ケア・多職種連携（いりょうてきケア・たしょくしゅれんけい） [8 Questions]
  // =========================================================================
  {
    id: 't02_l4_q01',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 39,
    lessonQuestionNumber: 1,
    section: '医療的ケア・多職種連携',
    text: '介護職（かいごしょく）は原則（げんそく）として医療行為（いりょうこうい）を行（おこな）うことができますか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '医師（いし）の許可（きょか）なくいつでもできる' },
      { id: 'B', label: 'B', text: '原則（げんそく）としてできない。ただし、法令（ほうれい）で認（みと）められた行為（こうい）や所定（しょてい）の条件（じょうけん）を満（み）たす場合（ばあい）がある' },
      { id: 'C', label: 'C', text: 'すべての医療行為（いりょうこうい）を自由（じゆう）にできる' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l4_q02',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 40,
    lessonQuestionNumber: 2,
    section: '医療的ケア・多職種連携',
    text: '病気（びょうき）の診断（しんだん）や治療（ちりょう）を行（おこな）う専門職（せんもんしょく）は誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '理学療法士（りがくりょうほうし）' },
      { id: 'B', label: 'B', text: '調理員（ちょうりいん）' },
      { id: 'C', label: 'C', text: '医師（いし）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l4_q03',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 41,
    lessonQuestionNumber: 3,
    section: '医療的ケア・多職種連携',
    text: '医師（いし）の指示（しじ）のもとに、療養上（りょうようじょう）のお世話（せわ）や診療（しんりょう）の補助（ほじょ）を行（おこな）うのは誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '看護師（かんごし）' },
      { id: 'B', label: 'B', text: '作業療法士（さぎょうりょうほうし）' },
      { id: 'C', label: 'C', text: '管理栄養士（かんりえいようし）' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l4_q04',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 42,
    lessonQuestionNumber: 4,
    section: '医療的ケア・多職種連携',
    text: '歩行（ほこう）などの動作能力（どうさのうりょく）の訓練（くんれん）を行（おこな）うリハビリテーションの専門職（せんもんしょく）は誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '社会福祉士（しゃかいふくしし）' },
      { id: 'B', label: 'B', text: '理学療法士（りがくりょうほうし / PT）' },
      { id: 'C', label: 'C', text: '言語聴覚士（げんごちょうかくし / ST）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l4_q05',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 43,
    lessonQuestionNumber: 5,
    section: '医療的ケア・多職種連携',
    text: '日常生活（にちじょうせいかつ）に必要（ひつよう）な行為（こうい）の訓練（くんれん）を行（おこな）う専門職（せんもんしょく）は誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '管理栄養士（かんりえいようし）' },
      { id: 'B', label: 'B', text: '歯科医師（しかいし）' },
      { id: 'C', label: 'C', text: '作業療法士（さぎょうりょうほうし / OT）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't02_l4_q06',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 44,
    lessonQuestionNumber: 6,
    section: '医療的ケア・多職種連携',
    text: '話（はな）すことや飲（の）み込（こ）み（嚥下（えんげ））が困難（こんなん）な利用者（りようしゃ）の訓練（くんれん）を行（おこな）うのは誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '言語聴覚士（げんごちょうかくし / ST）' },
      { id: 'B', label: 'B', text: '介護支援専門員（かいごしえんせんもんいん）' },
      { id: 'C', label: 'C', text: '理学療法士（りがくりょうほうし / PT）' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't02_l4_q07',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 45,
    lessonQuestionNumber: 7,
    section: '医療的ケア・多職種連携',
    text: '利用者（りようしゃ）に合（あ）った献立（こんだて）を作成（さくせい）し、栄養（えいよう）バランスを考（かんが）える専門職（せんもんしょく）は誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '看護師（かんごし）' },
      { id: 'B', label: 'B', text: '管理栄養士（かんりえいようし）' },
      { id: 'C', label: 'C', text: '医師（いし）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't02_l4_q08',
    examId: CAREGIVER_EXAM_02_ID,
    questionNumber: 46,
    lessonQuestionNumber: 8,
    section: '医療的ケア・多職種連携',
    text: '福祉（ふくし）サービスの相談（そうだん）・調整（ちょうせい）を行（おこな）い、支援計画（しえんけいかく）を立（た）てる専門職（せんもんしょく）は誰（だれ）ですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '作業療法士（さぎょうりょうほうし）' },
      { id: 'B', label: 'B', text: '調理員（ちょうりいん）' },
      { id: 'C', label: 'C', text: '介護支援専門員（かいごしえんせんもんいん / ケアマネジャー）' },
    ],
    correctAnswerId: 'C',
  },
];

/**
 * Score evaluation for TEST 02 (1st lesson)
 * Total: 46 questions, 1 mark each
 * Passing: 40/46 marks (86.96%)
 * Percentage: (score / 46) * 100 to 2 decimal places
 */
export function evaluateTest02Submission(
  answers: Record<string, string>,
  studentId: string,
  studentName?: string,
  timeElapsedSeconds: number = 0
): ExamResult {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const lessonStats: Record<
    string,
    { total: number; correct: number; incorrect: number; unanswered: number }
  > = {
    '介護の基本': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
    'こころとからだのしくみ': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
    '生活支援技術': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
    '医療的ケア・多職種連携': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
  };

  const questionResults = caregiverExam02Questions.map((q) => {
    const selected = answers[q.id] || null;
    const isCorrect = selected === q.correctAnswerId;
    const lessonKey = q.section || '介護の基本';

    if (!lessonStats[lessonKey]) {
      lessonStats[lessonKey] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
    }
    lessonStats[lessonKey].total += 1;

    if (!selected) {
      unansweredCount++;
      lessonStats[lessonKey].unanswered += 1;
    } else if (isCorrect) {
      score += q.marks;
      correctCount++;
      lessonStats[lessonKey].correct += 1;
    } else {
      incorrectCount++;
      lessonStats[lessonKey].incorrect += 1;
    }

    return {
      questionId: q.id,
      questionNumber: q.questionNumber,
      section: lessonKey,
      selectedAnswer: selected,
      correctAnswer: q.correctAnswerId,
      isCorrect,
    };
  });

  const totalMarks = 46;
  // Calculate percentage to exactly two decimal places
  const percentage = Number(((score / totalMarks) * 100).toFixed(2));
  // Passing score: 40 marks
  // PASS: 40-46 correct answers (86.96% - 100.00%)
  // FAIL: 0-39 correct answers (0.00% - 84.78%)
  const passed = score >= 40;

  const performanceLevel =
    score >= 44
      ? 'Excellent'
      : score >= 40
      ? 'Very Good'
      : score >= 35
      ? 'Good'
      : score >= 25
      ? 'Improving'
      : 'Needs Practice';

  const lessonBreakdown = TEST_02_LESSON_DEFINITIONS.map((def) => {
    const stat = lessonStats[def.title] || {
      total: def.totalQuestions,
      correct: 0,
      incorrect: 0,
      unanswered: def.totalQuestions,
    };
    const answeredCount = stat.correct + stat.incorrect;
    const accuracy = answeredCount > 0 ? Number(((stat.correct / answeredCount) * 100).toFixed(2)) : null;

    return {
      lessonId: def.id,
      lessonTitle: def.title,
      totalQuestions: def.totalQuestions,
      correctCount: stat.correct,
      answeredCount,
      incorrectCount: stat.incorrect,
      accuracy,
    };
  });

  return {
    id: `res_t02_${Date.now()}`,
    examId: CAREGIVER_EXAM_02_ID,
    examTitle: caregiverExam02.title, // 'TEST 02 (1st lesson)'
    studentId,
    studentName,
    score,
    totalMarks,
    percentage,
    passed,
    timeElapsedSeconds,
    performanceLevel,
    submittedAt: new Date().toISOString(),
    verifiedByServer: true,
    breakdown: {
      totalQuestions: totalMarks,
      correctCount,
      incorrectCount,
      unansweredCount,
    },
    lessonBreakdown,
    questionResults,
  };
}
