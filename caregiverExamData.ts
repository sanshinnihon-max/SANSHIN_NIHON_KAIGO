/**
 * SANSHIN NIHON CAREGIVER EXAMINATION DATASET
 * 45 Multiple Choice Questions with Furigana & Exact Answer Key
 * 
 * Lessons:
 * - Lesson 01: 尊厳・自立支援 (Questions 1–10)
 * - Lesson 02: 心身の理解 (Questions 11–17)
 * - Lesson 03: コミュニケーション (Questions 18–23)
 * - Lesson 04: 介護技術 (Questions 24–45)
 */

import { AuthoritativeQuestion, Examination } from '../types/exam';

export const CAREGIVER_EXAM_ID = 'sanshin-caregiver-exam-01';

export const caregiverExam: Examination = {
  id: CAREGIVER_EXAM_ID,
  title: '介護福祉士・介護技能実習評価試験 (SANSHIN NIHON Caregiver Examination)',
  subject: '介護（尊厳・自立支援、心身の理解、コミュニケーション、介護技術）',
  category: '介護実習・専門技能',
  language: 'ja',
  durationMinutes: 60,
  totalMarks: 45,
  passingMarks: 27, // 60% standard pass mark
  questionCount: 45,
  publicationStatus: 'published',
  availability: {
    isActive: false,
  },
  instructions: [
    '全45問の選択式（A・B・Cの3択）試験です。',
    '各設問で最も適切なものを1つ選んでください。',
    '試験時間は60分です。制限時間が終了すると自動的に答案が提出されます。',
    '各問題の配点は1点、合計45点満点です。',
    'すべての問題に回答した後、「試験終了・提出（Submit）」ボタンを押してください。',
  ],
  associatedPdfIds: [],
  createdAt: '2026-10-20T00:00:00Z',
  updatedAt: '2026-10-20T00:00:00Z',
};

export const caregiverQuestions: AuthoritativeQuestion[] = [
  // --- Lesson 01: 尊厳・自立支援 (Questions 1–10) ---
  {
    id: 'cq_01',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 1,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '介護（かいご）におけるQOL（生活（せいかつ）の質（しつ））について、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '介護職（かいごしょく）の指示（しじ）にすべて従（したが）って生活（せいかつ）すること' },
      { id: 'B', label: 'B', text: '「生命（せいめい）の質（しつ）」と「生活（せいかつ）の質（しつ）」の両方（りょうほう）を含（ふく）み、利用者（りようしゃ）らしい生活（せいかつ）を目指（めざ）すこと' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の希望（きぼう）や感情（かんじょう）を無視（むし）して生活管理（せいかつかんり）をすること' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_02',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 2,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '自立支援（じりつしえん）の考（かんが）え方（かた）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）ができることもすべて介護職（かいごしょく）が行（おこな）うこと' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の意見（いけん）を聞（き）かずに介護方針（かいごほうしん）を決（き）めること' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）が自分自身（じぶんじしん）で決定（けってい）できるように支援（しえん）すること' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_03',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 3,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '利用者（りようしゃ）のプライバシーや尊厳（そんげん）の保持（ほじ）について、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '着替（きが）えや入浴（にゅうよく）の際（さい）、バスタオルなどで身体（からだ）を覆（おお）い、露出（ろしゅつ）を最小限（さいしょうげん）にすること' },
      { id: 'B', label: 'B', text: '効率（こうりつ）を優先（ゆうせん）して、ドアを開（あ）けたまま着替（きが）えを行（おこな）うこと' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の個人情報（こじんじょうほう）を他（ほか）の利用者（りようしゃ）に話（はな）すこと' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_04',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 4,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '介護職（かいごしょく）が利用者（りようしゃ）を日常的（にちじょうてき）に観察（かんさつ）する理由（りゆう）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の行動（こうどう）を監視（かんし）して間違（まちが）いを注意（ちゅうい）するため' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の普段（ふだん）の状態（じょうたい）を知（し）り、変化（へんか）や異変（いへん）に早（はや）く気（き）づくため' },
      { id: 'C', label: 'C', text: '記録（きろく）を増（ふ）やすためだけに観察（かんさつ）するため' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_05',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 5,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '病原体（びょうげんたい）が体内（たいない）に入（はい）っても、必（かなら）ずしも発症（はっしょう）しない理由（りゆう）として正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '病原体（びょうげんたい）は体内（たいない）に入（はい）ると、すぐに消滅（しょうめつ）するため' },
      { id: 'B', label: 'B', text: 'すべての人（ひと）が同（おな）じ感染（かんせん）リスクを持（も）っているため' },
      { id: 'C', label: 'C', text: '人間（にんげん）の身体（からだ）には免疫（めんえき）があり、病原体（びょうげんたい）から身体（からだ）を守（まも）っているため' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_06',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 6,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '施設内（しせつない）での感染拡大（かんせんかくだい）を防（ふせ）ぐための環境衛生（かんきょうえいせい）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '居室（きょしつ）やトイレなどの環境（かんきょう）を適切（てきせつ）に清掃（せいそう）・消毒（しょうどく）すること' },
      { id: 'B', label: 'B', text: '清掃（せいそう）は週（しゅう）に1回（いっかい）程度（ていど）とし、換気（かんき）も行（おこな）わないこと' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）が触（ふ）れる場所（ばしょ）を消毒（しょうどく）せず放置（ほうち）すること' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_07',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 7,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '使用（しよう）した使（つか）い捨（す）て手袋（てぶくろ）を外（はず）す方法（ほうほう）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '表面（ひょうめん）を素手（すで）でつかんで引（ひ）っ張（ぱ）って外（はず）すこと' },
      { id: 'B', label: 'B', text: '汚（よご）れた面（めん）が内側（うちがわ）になるように裏返（うらがえ）して外（はず）し、廃棄（はいき）すること' },
      { id: 'C', label: 'C', text: '外（はず）した手袋（てぶくろ）を洗（あら）って再利用（さいりよう）すること' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_08',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 8,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '利用者（りようしゃ）の尊厳（そんげん）を守（まも）る介護（かいご）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の希望（きぼう）を聞（き）かずに、介護職（かいごしょく）が決（き）める' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）を子（こ）どものように扱（あつか）う' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の気持（きも）ちや希望（きぼう）を尊重（そんちょう）する' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_09',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 9,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '介護（かいご）の仕事（しごと）で、利用者（りようしゃ）の個人情報（こじんじょうほう）を扱（あつか）うとき、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '他（ほか）の利用者（りようしゃ）に、利用者（りようしゃ）の病気（びょうき）について話（はな）す' },
      { id: 'B', label: 'B', text: '必要（ひつよう）な人（ひと）以外（いがい）に、利用者（りようしゃ）の情報（じょうほう）を話（はな）さない' },
      { id: 'C', label: 'C', text: '家族（かぞく）や友人（ゆうじん）に、仕事（しごと）の話（はなし）として自由（じゆう）に話（はな）す' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_10',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 10,
    section: 'Lesson 01: 尊厳・自立支援',
    text: '利用者（りようしゃ）の自己決定（じこけってい）を支援（しえん）する介護（かいご）として、正（ただ）しいものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）が自分（じぶん）で選（えら）べるように、必要（ひつよう）な情報（じょうほう）を伝（つた）える' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の代（か）わりに、介護職（かいごしょく）がすべて決（き）める' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の意見（いけん）を聞（き）かずに介助（かいじょ）する' },
    ],
    correctAnswerId: 'A',
  },

  // --- Lesson 02: 心身の理解 (Questions 11–17) ---
  {
    id: 'cq_11',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 11,
    section: 'Lesson 02: 心身の理解',
    text: '体（からだ）で覚（おぼ）えた技術（ぎじゅつ）や手続（てつづ）きに関（かん）する記憶（きおく）として正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'エピソード記憶（きおく）' },
      { id: 'B', label: 'B', text: '意味（いみ）記憶（きおく）' },
      { id: 'C', label: 'C', text: '手続（てつづ）き記憶（きおく）' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_12',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 12,
    section: 'Lesson 02: 心身の理解',
    text: '介護職（かいごしょく）が行（おこな）う身体介護（しんたいかいご）におけるマッサージについて、正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）が望（のぞ）めば、どのような強（つよ）いマッサージでも行（おこな）ってよい' },
      { id: 'B', label: 'B', text: '医療的（いりょうてき）判断（はんだん）を伴（ともな）う医行為（いこうい）としてのマッサージは、介護職（かいごしょく）が行（おこな）ってはならない' },
      { id: 'C', label: 'C', text: '痛（いた）みを訴（うった）える部位（ぶい）を強（つよ）く揉（も）むことが介護職（かいごしょく）の義務（ぎむ）である' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_13',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 13,
    section: 'Lesson 02: 心身の理解',
    text: '高血圧（こうけつあつ）の状態（じょうたい）が長（なが）く続（つづ）くことで引（ひ）き起（お）こされるリスクとして、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '血管（けっかん）が傷（きず）つき、脳血管疾患（のうけっかんしっかん）や心疾患（しんしっかん）などを引（ひ）き起（お）こす危険性（きけんせい）がある' },
      { id: 'B', label: 'B', text: '筋肉量（きんにくりょう）が大幅（おおはば）に増加（ぞうか）する' },
      { id: 'C', label: 'C', text: '記憶力（きおくりょく）が必（かなら）ず向上（こうじょう）する' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_14',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 14,
    section: 'Lesson 02: 心身の理解',
    text: '「小腸（しょうちょう）」の主（おも）な働（はたら）きとして正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '主（おも）に水分（すいぶん）のみを吸収（きゅうしゅう）して糞便（ふんべん）を作（つく）ること' },
      { id: 'B', label: 'B', text: '食（た）べたものを一時的（いちじてき）に蓄（たくわ）えて混（ま）ぜること' },
      { id: 'C', label: 'C', text: '消化（しょうか）された食物（しょくもつ）の栄養素（えいようそ）を吸収（きゅうしゅう）すること' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_15',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 15,
    section: 'Lesson 02: 心身の理解',
    text: 'ICF（国際生活機能分類（こくさいせいかつきのうぶんるい））の基本的（きほんてき）な考（かんが）え方（かた）として、正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '病気（びょうき）や障害（しょうがい）だけを評価（ひょうか）すること' },
      { id: 'B', label: 'B', text: 'できないことだけでなく、できることや環境（かんきょう）にも着目（ちゃくもく）すること' },
      { id: 'C', label: 'C', text: '社会参加（しゃかいさんか）を制限（せいげん）して安静（あんせい）にさせること' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_16',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 16,
    section: 'Lesson 02: 心身の理解',
    text: '認知症（にんちしょう）の中核症状（ちゅうかくしょうじょう）である「実行機能障害（じっこうきのうしょうがい）」の説明（せつめい）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '目（め）の前（まえ）にあるものの名前（なまえ）や形（かたち）が見（み）えなくなる' },
      { id: 'B', label: 'B', text: '昔（むかし）の出来事（できごと）だけを完全（かんぜん）に忘（わす）れる' },
      { id: 'C', label: 'C', text: '物事（ものごと）を順序立（じゅんじょだ）てて計画（けいかく）し、実行（じっこう）することが難（むずか）しくなる' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_17',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 17,
    section: 'Lesson 02: 心身の理解',
    text: '車（くるま）いすを使用（しよう）する前（まえ）の安全確認（あんぜんかくにん）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'ブレーキの効（き）きやタイヤの状態（じょうたい）などを確認（かくにん）すること' },
      { id: 'B', label: 'B', text: 'ブレーキが効（き）かなくても、そのまま利用者（りようしゃ）を乗（の）せること' },
      { id: 'C', label: 'C', text: '点検（てんけん）を行（おこな）わず、不具合（ふぐあい）が起（お）きてから修理（しゅうり）すること' },
    ],
    correctAnswerId: 'A',
  },

  // --- Lesson 03: コミュニケーション (Questions 18–23) ---
  {
    id: 'cq_18',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 18,
    section: 'Lesson 03: コミュニケーション',
    text: '利用者（りようしゃ）が「悲（かな）しいです」と言（い）ったとき、介護職（かいごしょく）の応答（おうとう）として最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '「悲（かな）しんではいけません」と励（はげ）ます' },
      { id: 'B', label: 'B', text: '「悲（かな）しいのですね」と相手（あいて）の言葉（ことば）を受（う）け止（と）める' },
      { id: 'C', label: 'C', text: '何（なに）も言（い）わずに無視（むし）する' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_19',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 19,
    section: 'Lesson 03: コミュニケーション',
    text: '介護（かいご）サービスを提供（ていきょう）する際（さい）の説明（せつめい）と同意（どうい）について、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '専門用語（せんもんようご）を多（おお）く使（つか）い、一方的（いっぽうてき）に説明（せつめい）すること' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）に説明（せつめい）せず、家族（かぞく）の許可（きょか）だけで決（き）めること' },
      { id: 'C', label: 'C', text: '分（わ）かりやすく説明（せつめい）し、利用者（りようしゃ）の納得（なっとく）と意思（いし）を確認（かくにん）すること' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_20',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 20,
    section: 'Lesson 03: コミュニケーション',
    text: '聴覚（ちょうかく）や視覚（しかく）に障害（しょうがい）がある利用者（りようしゃ）とのコミュニケーションで、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '相手（あいて）の表情（ひょうじょう）や口（くち）の動（うご）きが分（わ）かるように、前方（ぜんぽう）から話（はな）しかける' },
      { id: 'B', label: 'B', text: '大声（おおごえ）で耳元（みみもと）に向（む）かって叫（さけ）ぶ' },
      { id: 'C', label: 'C', text: '後（うし）ろから突然（とつぜん）肩（かた）を叩（たた）いて話（はな）しかける' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_21',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 21,
    section: 'Lesson 03: コミュニケーション',
    text: '耳（みみ）が遠（とお）く、会話（かいわ）が難（むずか）しい利用者（りようしゃ）へのコミュニケーション方法（ほうほう）として適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '大（おお）きな声（こえ）で何度（なんど）も怒鳴（どな）る' },
      { id: 'B', label: 'B', text: '筆談（ひつだん）を用（もち）いる' },
      { id: 'C', label: 'C', text: 'コミュニケーションを諦（あきら）める' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_22',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 22,
    section: 'Lesson 03: コミュニケーション',
    text: '言葉（ことば）での意思疎通（いしそつう）が困難（こんなん）な利用者（りようしゃ）への支援（しえん）として、正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '長（なが）い文章（ぶんしょう）を早口（はやくち）で話（はな）す' },
      { id: 'B', label: 'B', text: '本人（ほんにん）の意思（いし）を確認（かくにん）せずに介護（かいご）を進（すす）める' },
      { id: 'C', label: 'C', text: 'イラストや絵（え）カード、写真（しゃしん）などを使（つか）って視覚的（しかくてき）に伝（つた）える' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_23',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 23,
    section: 'Lesson 03: コミュニケーション',
    text: '介護記録（かいごきろく）を記載（きさい）する際（さい）の注意点（ちゅういてん）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '介護職（かいごしょく）の個人的（こじんてき）な感想（かんそう）や想像（そうぞう）だけを書く（か）くこと' },
      { id: 'B', label: 'B', text: '事実（じじつ）と自分（じぶん）の判断（はんだん）を区別（くべつ）し、正確（せいかく）に記録（きろく）すること' },
      { id: 'C', label: 'C', text: '時間（じかん）が経（た）ってから記憶（きおく）だけを頼（たよ）りに書（か）くこと' },
    ],
    correctAnswerId: 'B',
  },

  // --- Lesson 04: 介護技術 (Questions 24–45) ---
  {
    id: 'cq_24',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 24,
    section: 'Lesson 04: 介護技術',
    text: '左片麻痺（ひだりかたまひ）のある利用者（りようしゃ）の立（た）ち上（あ）がり介助（かいじょ）で、膝（ひざ）の折（お）れ込（こ）みを防（ふせ）ぐための適切（てきせつ）な介助位置（かいじょいち）を選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の麻痺側（まひそく）に立（た）ち、膝（ひざ）を支（ささ）える' },
      { id: 'B', label: 'B', text: '健側（けんそく）から強（つよ）く引（ひ）っ張（ぱ）る' },
      { id: 'C', label: 'C', text: '正面（しょうめん）から両手（りょうて）を強（つよ）く引（ひ）っ張（ぱ）る' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_25',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 25,
    section: 'Lesson 04: 介護技術',
    text: '車（くるま）いすで移動（いどう）する際（さい）、利用者（りようしゃ）の手（て）や指（ゆび）の事故（じこ）を防（ふせ）ぐための注意点（ちゅういてん）として正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '手（て）の位置（いち）を確認（かくにん）せずに速（はや）く押（お）す' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の手（て）が駆動輪（くどうりん）などに巻（ま）き込（こ）まれないように確認（かくにん）する' },
      { id: 'C', label: 'C', text: 'アームサポートの外側（そとがわ）に手（て）を置（お）かせる' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_26',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 26,
    section: 'Lesson 04: 介護技術',
    text: '車（くるま）いすの「ティッピングレバー」を使用（しよう）する場面（ばめん）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '車（くるま）いすを完全（かんぜん）に固定（こてい）するとき' },
      { id: 'B', label: 'B', text: '背（せ）もたれを倒（たお）すとき' },
      { id: 'C', label: 'C', text: '段差（だんさ）を上（のぼ）る際（さい）、前輪（ぜんりん）を浮（う）かせるとき' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_27',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 27,
    section: 'Lesson 04: 介護技術',
    text: '車（くるま）いすで急（きゅう）な下（くだ）り坂（ざか）を進（すす）む際（さい）の方法（ほうほう）として、適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '前向（まえむ）きのまま速度（そくど）を上（あ）げて下（くだ）る' },
      { id: 'B', label: 'B', text: '車（くるま）いすを後（うし）ろ向（む）きにして、速度（そくど）を調整（ちょうせい）しながらゆっくり下（くだ）る' },
      { id: 'C', label: 'C', text: '前輪（ぜんりん）を浮（う）かせたまま走（はし）る' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_28',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 28,
    section: 'Lesson 04: 介護技術',
    text: '視覚障害（しかくしょうがい）のある利用者（りようしゃ）への食事（しょくじ）の配膳（はいぜん）説明（せつめい）として適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '時計（とけい）の文字盤（もじばん）の位置（いち）に見立（みた）てて料理（りょうり）の位置（いち）を説明（せつめい）する' },
      { id: 'B', label: 'B', text: '「あっち」「そっち」などの指示語（しじご）だけを使（つか）う' },
      { id: 'C', label: 'C', text: '説明（せつめい）せずに食（た）べてもらう' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_29',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 29,
    section: 'Lesson 04: 介護技術',
    text: '食事（しょくじ）を始（はじ）める前（まえ）の準備（じゅんび）として、誤嚥（ごえん）を防（ふせ）ぐために適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'いきなり乾燥（かんそう）した食物（しょくもつ）を口（くち）に入（い）れる' },
      { id: 'B', label: 'B', text: '体幹（たいかん）を大（おお）きく後（うし）ろに傾（かたむ）ける' },
      { id: 'C', label: 'C', text: '水分（すいぶん）などで口（くち）の中（なか）を湿（しめ）らせる' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_30',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 30,
    section: 'Lesson 04: 介護技術',
    text: 'スプーンを使（つか）って食事介助（しょくじかいじょ）をする際（さい）の抜（ぬ）き方（かた）として正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '上（うえ）に向（む）けて強（つよ）く引（ひ）き上（あ）げる' },
      { id: 'B', label: 'B', text: 'スプーンを水平（すいへい）にして、まっすぐ引（ひ）き抜（ぬ）く' },
      { id: 'C', label: 'C', text: '口（くち）の中（なか）で強（つよ）く回転（かいてん）させる' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_31',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 31,
    section: 'Lesson 04: 介護技術',
    text: '泌尿器系（ひにょうきけい）の器官（きかん）である「腎臓（じんぞう）」の主（おも）な働（はたら）きとして正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '食物（しょくもつ）を消化（しょうか）して栄養（えいよう）を吸収（きゅうしゅう）する' },
      { id: 'B', label: 'B', text: '酸素（さんそ）を体内（たいない）に取（と）り込（こ）む' },
      { id: 'C', label: 'C', text: '血液中（けつえきちゅう）の不要（ふよう）な老廃物（ろうはいぶつ）などをろ過（ろか）して尿（にょう）をつくる' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_32',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 32,
    section: 'Lesson 04: 介護技術',
    text: '右片麻痺（みぎかたまひ）のある利用者（りようしゃ）のベッド横（よこ）にポータブルトイレを設置（せっち）する場合（ばあい）、適切（てきせつ）な位置（いち）を選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '健側（けんそく）である左側（ひだりがわ）のベッド脇（わき）に、移動（いどう）しやすい位置（いち）に設置（せっち）する' },
      { id: 'B', label: 'B', text: '麻痺側（まひそく）である右側（みぎがわ）に設置（せっち）する' },
      { id: 'C', label: 'C', text: 'ベッドから遠（とお）く離（はな）れた場所（ばしょ）に設置（せっち）する' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_33',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 33,
    section: 'Lesson 04: 介護技術',
    text: 'オムツ交換（こうかん）を行（おこな）う際（さい）の注意点（ちゅういてん）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'カーテンを開（あ）けたまま全身（ぜんしん）を露出（ろしゅつ）させる' },
      { id: 'B', label: 'B', text: '肌（はだ）の露出（ろしゅつ）を最小限（さいしょうげん）にし、利用者（りようしゃ）に声（こえ）をかけながら行（おこな）う' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）に声（こえ）をかけずに無言（むごん）で行（おこな）う' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_34',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 34,
    section: 'Lesson 04: 介護技術',
    text: '片麻痺（かたまひ）のある利用者（りようしゃ）の着替（きが）えの基本（きほん）として正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '脱（ぬ）ぐときも着（き）るときも健側（けんそく）から行（おこな）う' },
      { id: 'B', label: 'B', text: '脱（ぬ）ぐときは麻痺側（まひそく）から、着（き）るときは健側（けんそく）から行（おこな）う' },
      { id: 'C', label: 'C', text: '脱（ぬ）ぐときは健側（けんそく）から、着（き）るときは麻痺側（まひそく）から行（おこな）う' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_35',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 35,
    section: 'Lesson 04: 介護技術',
    text: '利用者（りようしゃ）の爪切（つめき）りを行（おこな）うタイミングとして、最（もっと）も適（てき）しているものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '爪（つめ）が硬（かた）く乾燥（かんそう）しているとき' },
      { id: 'B', label: 'B', text: '入浴後（にゅうよくご）など、爪（つめ）が柔（やわ）らかくなっているとき' },
      { id: 'C', label: 'C', text: '食事（しょくじ）の直前（ちょくぜん）' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_36',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 36,
    section: 'Lesson 04: 介護技術',
    text: '口腔（こうくう）ケアを行（おこな）う主（おも）な目的（もくてき）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '口（くち）の中（なか）を清潔（せいけつ）に保（たも）ち、誤嚥性肺炎（ごえんせいはいえん）などを予防（よぼう）すること' },
      { id: 'B', label: 'B', text: '虫歯（むしば）を治療（ちりょう）すること' },
      { id: 'C', label: 'C', text: '顎（あご）の骨（ほね）を強（つよ）くすること' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_37',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 37,
    section: 'Lesson 04: 介護技術',
    text: '入浴介助（にゅうよくかいじょ）を行（おこな）う前（まえ）の確認（かくにん）として、適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '直前（ちょくぜん）に満腹（まんぷく）になるまで食事（しょくじ）をさせる' },
      { id: 'B', label: 'B', text: '浴室（よくしつ）を寒（さむ）くしておく' },
      { id: 'C', label: 'C', text: '体調（たいちょう）やバイタルサインなどを確認（かくにん）し、安全（あんぜん）に入浴（にゅうよく）できる状態（じょうたい）か確認（かくにん）する' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_38',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 38,
    section: 'Lesson 04: 介護技術',
    text: '片麻痺（かたまひ）のある利用者（りようしゃ）がベッドから起（お）き上（あ）がる際（さい）の介助（かいじょ）として、適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '麻痺側（まひそく）を下（した）にして無理（むり）に引（ひ）き上（あ）げる' },
      { id: 'B', label: 'B', text: '健側（けんそく）を上（うえ）にした側臥位（そくがい）になり、健側（けんそく）の手（て）を使（つか）って起（お）き上（あ）がる' },
      { id: 'C', label: 'C', text: '仰向（あおむ）けのまま頭（あたま）だけを引（ひ）っ張（ぱ）る' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_39',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 39,
    section: 'Lesson 04: 介護技術',
    text: '顔（かお）や目（め）の周（まわ）りを拭（ふ）く際（さい）の方向（ほうこう）として正（ただ）しいものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '目頭（めがしら）から目尻（めじり）に向（む）かって拭（ふ）く' },
      { id: 'B', label: 'B', text: '目尻（めじり）から目頭（めがしら）に向（む）かって拭（ふ）く' },
      { id: 'C', label: 'C', text: '往復（おうふく）させて強（つよ）くこする' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_40',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 40,
    section: 'Lesson 04: 介護技術',
    text: '家事援助（かじえんじょ）で調理（ちょうり）の献立（こんだて）を決（き）める際（さい）の対応（たいおう）として、適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '介護職（かいごしょく）の好（す）きな食（た）べ物（もの）だけを作（つく）る' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の嗜好（しこう）や栄養（えいよう）バランスを考慮（こうりょ）し、相談（そうだん）して決（き）める' },
      { id: 'C', label: 'C', text: '高価（こうか）な食材（しょくざい）を本人（ほんにん）に相談（そうだん）せずに買（か）う' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_41',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 41,
    section: 'Lesson 04: 介護技術',
    text: '車（くるま）いすからベッドへ移乗（いじょう）するとき、正（ただ）しい介助（かいじょ）はどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: 'ブレーキをかけずに移乗（いじょう）する' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）の腕（うで）を強（つよ）く引（ひ）っ張（ぱ）って移（うつ）す' },
      { id: 'C', label: 'C', text: '車（くるま）いすのブレーキを確認（かくにん）してから介助（かいじょ）する' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_42',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 42,
    section: 'Lesson 04: 介護技術',
    text: 'ベッドから車（くるま）いすへ移乗（いじょう）するとき、介護職（かいごしょく）が最初（さいしょ）に確認（かくにん）することとして、適切（てきせつ）なものはどれですか。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）の体調（たいちょう）と車（くるま）いすの安全（あんぜん）を確認（かくにん）する' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）に何（なに）も説明（せつめい）せず、すぐに立（た）たせる' },
      { id: 'C', label: 'C', text: '車（くるま）いすをベッドから遠（とお）く離（はな）す' },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 'cq_43',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 43,
    section: 'Lesson 04: 介護技術',
    text: 'ベッド上（じょう）で利用者（りようしゃ）の体位変換（たいいへんかん）を行（おこな）う際（さい）の介助（かいじょ）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '利用者（りようしゃ）に何（なに）も説明（せつめい）せず、介護職（かいごしょく）が一人（ひとり）で強（つよ）く動（うご）かす' },
      { id: 'B', label: 'B', text: '利用者（りようしゃ）に声（こえ）をかけ、できる動（うご）きは本人（ほんにん）にしてもらいながら介助（かいじょ）する' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）の痛（いた）みや体調（たいちょう）を確認（かくにん）せずに、速（はや）く体（からだ）を動（うご）かす' },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 'cq_44',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 44,
    section: 'Lesson 04: 介護技術',
    text: '移乗介助（いじょうかいじょ）を行（おこな）う前（まえ）の環境確認（かんきょうかくにん）として、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '床（ゆか）に物（もの）があっても、そのまま移乗（いじょう）する' },
      { id: 'B', label: 'B', text: '車（くるま）いすを不安定（ふあんてい）な場所（ばしょ）に置（お）く' },
      { id: 'C', label: 'C', text: 'ベッドや車（くるま）いすの位置（いち）を確認（かくにん）し、周囲（しゅうい）の障害物（しょうがいぶつ）を取（と）り除（のぞ）く' },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 'cq_45',
    examId: CAREGIVER_EXAM_ID,
    questionNumber: 45,
    section: 'Lesson 04: 介護技術',
    text: '介助（かいじょ）を始（はじ）める前（まえ）の声（こえ）かけとして、最（もっと）も適切（てきせつ）なものを1つ選（えら）びなさい。',
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: '「今（いま）から移動（いどう）しますね」と説明（せつめい）し、利用者（りようしゃ）の準備（じゅんび）を確認（かくにん）する' },
      { id: 'B', label: 'B', text: '何（なに）も言（い）わずに突然（とつぜん）介助（かいじょ）を始（はじ）める' },
      { id: 'C', label: 'C', text: '利用者（りようしゃ）が嫌（いや）がっても無理（むり）に介助（かいじょ）する' },
    ],
    correctAnswerId: 'A',
  },
];

export const LESSON_DEFINITIONS = [
  {
    id: 'lesson_01',
    title: 'Lesson 01: 尊厳・自立支援',
    labelEn: 'Dignity and Independence',
    questionRange: 'Q1 - Q10',
    totalQuestions: 10,
    startNum: 1,
    endNum: 10,
  },
  {
    id: 'lesson_02',
    title: 'Lesson 02: 心身の理解',
    labelEn: 'Understanding of Mind and Body',
    questionRange: 'Q11 - Q17',
    totalQuestions: 7,
    startNum: 11,
    endNum: 17,
  },
  {
    id: 'lesson_03',
    title: 'Lesson 03: コミュニケーション',
    labelEn: 'Communication',
    questionRange: 'Q18 - Q23',
    totalQuestions: 6,
    startNum: 18,
    endNum: 23,
  },
  {
    id: 'lesson_04',
    title: 'Lesson 04: 介護技術',
    labelEn: 'Caregiving Techniques',
    questionRange: 'Q24 - Q45',
    totalQuestions: 22,
    startNum: 24,
    endNum: 45,
  },
] as const;

export function getPerformanceLevel(percentage: number): 'Excellent' | 'Very Good' | 'Good' | 'Improving' | 'Needs Practice' {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Very Good';
  if (percentage >= 70) return 'Good';
  if (percentage >= 60) return 'Improving';
  return 'Needs Practice';
}

/**
 * Helper to get safe ClientQuestions without exposing correct answer keys
 */
export function getCaregiverClientQuestions() {
  return caregiverQuestions.map(({ correctAnswerId, explanation, ...clientQ }) => clientQ);
}

/**
 * Verify answers and produce an authoritative ExamResult with comprehensive lesson analytics
 */
export function evaluateCaregiverSubmission(
  answers: Record<string, string>,
  studentId: string = 'std_current',
  studentName: string = 'Registered Candidate',
  timeElapsedSeconds: number = 0
) {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  // Track per-lesson metrics
  const lessonStats: Record<
    string,
    { total: number; correct: number; incorrect: number; unanswered: number }
  > = {
    'Lesson 01: 尊厳・自立支援': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
    'Lesson 02: 心身の理解': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
    'Lesson 03: コミュニケーション': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
    'Lesson 04: 介護技術': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
  };

  const questionResults = caregiverQuestions.map((q) => {
    const selected = answers[q.id] || null;
    const isCorrect = selected === q.correctAnswerId;
    const lessonKey = q.section || 'Lesson 01: 尊厳・自立支援';

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

  const totalMarks = caregiverQuestions.length;
  const percentage = Math.round((score / totalMarks) * 100);
  const passed = score >= caregiverExam.passingMarks;
  const performanceLevel = getPerformanceLevel(percentage);

  // Build lessonBreakdown
  const lessonBreakdown = LESSON_DEFINITIONS.map((def) => {
    const stat = lessonStats[def.title] || { total: def.totalQuestions, correct: 0, incorrect: 0, unanswered: def.totalQuestions };
    const answeredCount = stat.correct + stat.incorrect;
    const accuracy = answeredCount > 0 ? Math.round((stat.correct / answeredCount) * 100) : null;

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
    id: `res_${Date.now()}`,
    examId: CAREGIVER_EXAM_ID,
    examTitle: caregiverExam.title,
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
