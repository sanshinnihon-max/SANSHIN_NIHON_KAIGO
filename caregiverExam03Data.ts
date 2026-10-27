/**
 * SANSHIN NIHON CAREGIVER EXAMINATION DATASET
 * TEST 03 (介護総合問題)
 * 
 * 50 Verified Multiple Choice Questions with Exact Answer Key
 * 
 * Structure:
 * - Section 1: 介護の基本・自立支援 (Q1–Q13) [13 Qs]
 * - Section 2: 権利擁護・虐待防止・秘密保持 (Q14–Q21) [8 Qs]
 * - Section 3: 多職種連携・介護過程・サービス (Q22–Q26) [5 Qs]
 * - Section 4: 安全管理・リスクマネジメント (Q27–Q34) [8 Qs]
 * - Section 5: 感染症予防・衛生管理 (Q35–Q42) [8 Qs]
 * - Section 6: ボディメカニクス・介護技術 (Q43–Q50) [8 Qs]
 * Total: 50 Questions
 * 
 * Scoring:
 * - 50 Questions, 1 mark each (Total: 50 marks)
 * - Passing Score: 30 marks (60.00%)
 * - PASS: 30–50 marks (60.00%–100.00%)
 * - FAIL: 0–29 marks (0.00%–58.00%)
 */

import { AuthoritativeQuestion, Examination, ExamResult } from '../types/exam';

export const CAREGIVER_EXAM_03_ID = 'sanshin-caregiver-exam-03';

export const caregiverExam03: Examination = {
  id: CAREGIVER_EXAM_03_ID,
  title: 'TEST 03 (介護総合問題)',
  subject: '介護（介護の基本、権利擁護、多職種連携、安全管理、感染症予防、ボディメカニクス）',
  category: '介護実習・専門技能',
  language: 'ja',
  durationMinutes: 60,
  totalMarks: 50,
  passingMarks: 30, // 60.00% standard pass mark
  questionCount: 50,
  publicationStatus: 'published',
  availability: {
    isActive: false,
  },
  instructions: [
    '全50問の選択式（A・B・Cの3択）試験です。',
    '各設問で最も適切なものを1つ選んでください。',
    '試験時間は60分です。制限時間が終了すると自動的に答案が提出されます。',
    '各問題の配点は1点、合計50点満点です。30点以上（60.00%以上）で合格（PASS）となります。',
    'すべての問題に回答した後、「試験終了・提出（Submit）」ボタンを押してください。',
  ],
  associatedPdfIds: [],
  createdAt: '2026-10-25T00:00:00Z',
  updatedAt: '2026-10-25T00:00:00Z',
};

export const TEST_03_LESSON_DEFINITIONS = [
  {
    id: 'lesson_01',
    title: '介護の基本・自立支援',
    labelEn: 'Fundamentals & Independence Support',
    questionRange: 'Q1–Q13',
    totalQuestions: 13,
  },
  {
    id: 'lesson_02',
    title: '権利擁護・虐待防止・秘密保持',
    labelEn: 'Rights Protection & Abuse Prevention',
    questionRange: 'Q14–Q21',
    totalQuestions: 8,
  },
  {
    id: 'lesson_03',
    title: '多職種連携・介護過程・サービス',
    labelEn: 'Interprofessional Team & Care Process',
    questionRange: 'Q22–Q26',
    totalQuestions: 5,
  },
  {
    id: 'lesson_04',
    title: '安全管理・リスクマネジメント',
    labelEn: 'Safety Management & Risk Reduction',
    questionRange: 'Q27–Q34',
    totalQuestions: 8,
  },
  {
    id: 'lesson_05',
    title: '感染症予防・衛生管理',
    labelEn: 'Infection Prevention & Hygiene',
    questionRange: 'Q35–Q42',
    totalQuestions: 8,
  },
  {
    id: 'lesson_06',
    title: 'ボディメカニクス・介護技術',
    labelEn: 'Body Mechanics & Care Technique',
    questionRange: 'Q43–Q50',
    totalQuestions: 8,
  },
];

export const caregiverExam03Questions: AuthoritativeQuestion[] = [
  {
    id: 't03_q01',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 1,
    section: '介護の基本・自立支援',
    text: "かいごしょくが りようしゃの きがえを しえんするとき、かいごしょくの つごうや しせつの きまりだけでなく、りようしゃの せいかつしゅうかんや かんがえかたを たいせつにして たいおうしました。この かんがえかたとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "かいごしょくの かちかんを ゆうせんすること" },
      { id: 'B', label: 'B', text: "りようしゃを しゅたいとした せいかつしえん" },
      { id: 'C', label: 'C', text: "こうりつを ゆうせんした じかんかんり" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q02',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 2,
    section: '介護の基本・自立支援',
    text: "くるまいすを しようしている りようしゃが、すきな はなに みずを やったり、パソコンで じょうほうを しらべたりして、まいにちを たのしく まんぞくして くらしています。このような せいかつの ゆたかさや いきがいを ふくめた かんがえかたとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "QOL（せいかつの しつ）" },
      { id: 'B', label: 'B', text: "しんたいてき こうそく" },
      { id: 'C', label: 'C', text: "かんせんしょうの よぼう" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q03',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 3,
    section: '介護の基本・自立支援',
    text: "しょうがいの あるひとも ないひとも、じんけんが まもられ、ちいきしゃかいの なかで おたがいに ささえあいながら ふつうに せいかつできるようにする かんがえかたは どれですか。もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "スタンダード・プリコーション" },
      { id: 'B', label: 'B', text: "ノーマライゼーション" },
      { id: 'C', label: 'C', text: "リスクマネジメント" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q04',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 4,
    section: '介護の基本・自立支援',
    text: "りようしゃが じぶんで ふくを えらび、できる ところまで じぶんで そでを とおせるように、かいごしょくが みまもりながら しえんしました。この しえんの もくてきとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "じりつしえん" },
      { id: 'B', label: 'B', text: "ひみつほじ" },
      { id: 'C', label: 'C', text: "かんせんげんの はいじょ" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q05',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 5,
    section: '介護の基本・自立支援',
    text: "りようしゃの せいかつリズム（きしょう、しょくじ、にゅうよく、すいみん など）について、もっとも てきせつな きじゅつを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "すべての りようしゃは しせつの きまりに あわせなければ なりません" },
      { id: 'B', label: 'B', text: "ぶんかや しゅうかん、かちかんなどにより、ひとりひとりの せいかつリズムは ことなります" },
      { id: 'C', label: 'C', text: "かいごしょくの せいかつしゅうかんに あわせて りようしゃを しどうします" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q06',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 6,
    section: '介護の基本・自立支援',
    text: "かいごが ひつように なったひとの こころの じょうたいについて、もっとも てきせつな きじゅつを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "からだの きのうや せいかつの へんかにより、ふあんや とまどいを かんじることがあります" },
      { id: 'B', label: 'B', text: "かいごが ひつように なると、すべての ひとが つねに かつどうてきに なります" },
      { id: 'C', label: 'C', text: "かいごが ひつように なったひとは、ふあんを かんじることが ありません" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q07',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 7,
    section: '介護の基本・自立支援',
    text: "りようしゃが からだの ふじゆうさを かかえながらも、これまでの いきかたや かちかんに そって、じぶんが どうしたいかを じぶんで きめることは、どのような じりつに あたりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "しんたいてき じりつ" },
      { id: 'B', label: 'B', text: "せいしんてき じりつ" },
      { id: 'C', label: 'C', text: "けいざいてき じりつ" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q08',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 8,
    section: '介護の基本・自立支援',
    text: "かいごを ひつようとする ひとへの しえんにおいて、もっとも きほんとなる かんがえかたは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "にんげんの そんげんを まもること" },
      { id: 'B', label: 'B', text: "かいごしょくの しゅどうけんを まもること" },
      { id: 'C', label: 'C', text: "しせつの つごうを さいゆうせんすること" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q09',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 9,
    section: '介護の基本・自立支援',
    text: "りようしゃの へやに すきな おんがくを ながしたり、きせつの はなを かざったりする はいりょは、なにの こうじょうに つながりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "しんたいこうそくの きょうか" },
      { id: 'B', label: 'B', text: "QOL（せいかつの しつ）" },
      { id: 'C', label: 'C', text: "かんせんけいろの しゃだん" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q10',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 10,
    section: '介護の基本・自立支援',
    text: "りようしゃの しょくじしえんにおいて、かいごしょくの たいおうとして もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "かいごしょくが おいしいと おもう じゅんじょで たべてもらいます" },
      { id: 'B', label: 'B', text: "りようしゃの このみや たべかたの しゅうかんを そんちょうして しえんします" },
      { id: 'C', label: 'C', text: "じかんを かけないために、りようしゃの きぼうを きかずに ぜんかいじょします" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q11',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 11,
    section: '介護の基本・自立支援',
    text: "じりつしえんを おこなうさいの かいごしょくの かかわりとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "りようしゃが できる どうさも すべて かいごしょくが かわりに おこないます" },
      { id: 'B', label: 'B', text: "りようしゃが もっている ちからを いかし、じぶんの いしで できることを ふやします" },
      { id: 'C', label: 'C', text: "きけんを さけるため、りようしゃには なにも させないように します" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q12',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 12,
    section: '介護の基本・自立支援',
    text: "ひとりひとりの せいかつの しかたに えいきょうを あたえる よういんとして、あやまっているものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "くにの ぶんかや ふうしゅう" },
      { id: 'B', label: 'B', text: "ほんにんの けんこうじょうたい、じゅうきょ、かぞくかんけい" },
      { id: 'C', label: 'C', text: "かいごしょくの こじんてきな しゅみを りようしゃに おしつけること" },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't03_q13',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 13,
    section: '介護の基本・自立支援',
    text: "りようしゃの そのひとらしい せいかつの けいぞくを ささえるために、かいごしょくに もとめられることは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "りようしゃの これまでの せいかつれきや せいかつしゅうかんを りかいすること" },
      { id: 'B', label: 'B', text: "しせつの すべての ルールに りようしゃを かんぜんに あわせること" },
      { id: 'C', label: 'C', text: "あんぜんのために りようしゃの きぼうを つねに せいげんすること" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q14',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 14,
    section: '権利擁護・虐待防止・秘密保持',
    text: "はいせつや にゅうよくの さい、りようしゃの はだの ろしゅつを さいしょうげんにし、タオルなどで からだを おおう りゆうとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "しんたいこうそくを おこないやすくするため" },
      { id: 'B', label: 'B', text: "りようしゃの しゅうちしんと プライバシーに はいりょするため" },
      { id: 'C', label: 'C', text: "かいごしょくの てを よごさないように するため" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q15',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 15,
    section: '権利擁護・虐待防止・秘密保持',
    text: "かいごしょくが、きんむちゅうに しった りようしゃの なまえや びょうれき、しゃしんなどを、ほんにんの どういなく SNSに とうこうしました。この こういは、どの ぎむに いはんしますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ひみつほじ（しゅひぎむ）" },
      { id: 'B', label: 'B', text: "たしょくしゅれんけい" },
      { id: 'C', label: 'C', text: "かんせんたいさく" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q16',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 16,
    section: '権利擁護・虐待防止・秘密保持',
    text: "ベッドからの てんらくを ふせぐ もくてきであっても、りようしゃが じゆうに ベッドから おりられないように、ベッドの しほうを さくで かこむ こういは なんに あたりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "てきせつな あんぜんたいさく" },
      { id: 'B', label: 'B', text: "しんたいこうそく" },
      { id: 'C', label: 'C', text: "じりつしえん" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q17',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 17,
    section: '権利擁護・虐待防止・秘密保持',
    text: "しんたいこうそくが りようしゃに あたえる あくえいきょうとして、ただしいものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "きんりょくや しんたいきのうの ていか、にんちしょうの しょうじょうの あっかなど" },
      { id: 'B', label: 'B', text: "すいみんの しつの こうじょうと せいしんの あんてい" },
      { id: 'C', label: 'C', text: "こつみつどの ぞうかと ほこうきのうの かいぜん" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q18',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 18,
    section: '権利擁護・虐待防止・秘密保持',
    text: "やかんに はいかいする りようしゃに たいし、こうどうを せいげんする もくてきで、ひつよういじょうの こうせいしんやくを しようする こういは、どのように はんだんされることがありますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "しんたいこうそくに あたる かのうせいが ある" },
      { id: 'B', label: 'B', text: "つねに てきせつな しんりてき ケアである" },
      { id: 'C', label: 'C', text: "どのような ばあいでも せいじょうな ふくやくかいじょである" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q19',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 19,
    section: '権利擁護・虐待防止・秘密保持',
    text: "りようしゃに「なんど いったら わかるの」「いうことを きかないと ごはんを あげない」などと どなり、きょうふを あたえる こういは、どの ぎゃくたいに あたりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "しんたいてき ぎゃくたい" },
      { id: 'B', label: 'B', text: "しんりてき ぎゃくたい" },
      { id: 'C', label: 'C', text: "けいざいてき ぎゃくたい" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q20',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 20,
    section: '権利擁護・虐待防止・秘密保持',
    text: "ひつような しょくじや にゅうよくなどの かいごを おこなわず、りようしゃを ふけつな じょうたいのまま ほうちする こういは、どの ぎゃくたいに あたりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "かいごとうほうき（ネグレクト）" },
      { id: 'B', label: 'B', text: "しんたいてき ぎゃくたい" },
      { id: 'C', label: 'C', text: "せいてき ぎゃくたい" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q21',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 21,
    section: '権利擁護・虐待防止・秘密保持',
    text: "りようしゃの よちょきんや ねんきんを かってに つかい、かいごしょく じしんの しぶつを こうにゅうする こういは、どの ぎゃくたいに あたりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "けいざいてき ぎゃくたい" },
      { id: 'B', label: 'B', text: "しんりてき ぎゃくたい" },
      { id: 'C', label: 'C', text: "しんたいこうそく" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q22',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 22,
    section: '多職種連携・介護過程・サービス',
    text: "たしょくしゅれんけいにおいて、ほこうなどの きほんてきな からだの うごきの くんれんを おもに たんとうする せんもんしょくは だれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "りがくりょうほうし（PT）" },
      { id: 'B', label: 'B', text: "げんごちょうかくし（ST）" },
      { id: 'C', label: 'C', text: "かんりえいようし" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q23',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 23,
    section: '多職種連携・介護過程・サービス',
    text: "のみこみ（えんげ）や ことばを はなすことに こんなんが ある りようしゃに、ひつような くんれんや しえんを おこなう せんもんしょくは だれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "さぎょうりょうほうし（OT）" },
      { id: 'B', label: 'B', text: "げんごちょうかくし（ST）" },
      { id: 'C', label: 'C', text: "ソーシャルワーカー" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q24',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 24,
    section: '多職種連携・介護過程・サービス',
    text: "りようしゃの けんこうじょうたい、かむちから、のみこむちからなどを こうりょし、えいようバランスに はいりょした こんだてを さくせいする せんもんしょくは だれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "かんごし" },
      { id: 'B', label: 'B', text: "かいごしえんせんもんいん（ケアマネジャー）" },
      { id: 'C', label: 'C', text: "かんりえいようし" },
    ],
    correctAnswerId: 'C',
  },
  {
    id: 't03_q25',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 25,
    section: '多職種連携・介護過程・サービス',
    text: "かいごかていにおいて、りようしゃの しんしんの じょうたい、せいかつかだい、きぼうなどを はあくするために じょうほうを あつめ、ぶんせきする プロセスは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "アセスメント" },
      { id: 'B', label: 'B', text: "けいかくさくせい" },
      { id: 'C', label: 'C', text: "ひょうか" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q26',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 26,
    section: '多職種連携・介護過程・サービス',
    text: "りようしゃが にっちゅうに しせつへ かよい、しょくじや にゅうよく、きのうくんれんなどの サービスを うけるものは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ほうもんかいご（ホームヘルプ）" },
      { id: 'B', label: 'B', text: "つうしょかいご（デイサービス）" },
      { id: 'C', label: 'C', text: "とくべつようごろうじんホームへの にゅうしょ" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q27',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 27,
    section: '安全管理・リスクマネジメント',
    text: "ベッドから くるまいすへ いじょうするさい、ブレーキの かけわすれにより てんとうしそうに なった じれいを きろくし、しょくいん ぜんいんで きょうゆうして さいはつぼうしに いかしました。この とりくみは なんに あたりますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "リスクマネジメント" },
      { id: 'B', label: 'B', text: "しんたいこうそくの すいしん" },
      { id: 'C', label: 'C', text: "いりょうこういの じっし" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q28',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 28,
    section: '安全管理・リスクマネジメント',
    text: "こうれいしゃの てんとう・てんらくを ふせぐための かんきょうせいびとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ぬげやすく すべりやすい スリッパを はいてもらいます" },
      { id: 'B', label: 'B', text: "ゆかの ぬれを ふきとり、あしもとの コードなどを かたづけます" },
      { id: 'C', label: 'C', text: "ズボンの すそを ながくして、あしくびを かくします" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q29',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 29,
    section: '安全管理・リスクマネジメント',
    text: "かいごしょくが おこなう かんさつについて、もっとも てきせつな きじゅつを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "たいおんや けつあつなどの すうちだけを じゅうしし、ひょうじょうや はつわは かんさつしません" },
      { id: 'B', label: 'B', text: "りようしゃの ひょうじょうや どうさ、はつわなどを かんさつし、いつもと ちがう へんかに きづきます" },
      { id: 'C', label: 'C', text: "かんさつした けっかは きろくせず、ほかの しょくいんにも つたえません" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q30',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 30,
    section: '安全管理・リスクマネジメント',
    text: "りようしゃに はつねつ、おうと、げり、ほっしんなどの しょうじょうが みられ、かんせんしょうが うたがわれるとき、かいごしょくの たいおうとして てきせつなものは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ようすを みて、だれにも しらせずに ほうちします" },
      { id: 'B', label: 'B', text: "しせつの きまりに したがい、かんごしなどの いりょうしょくに すみやかに ほうこくします" },
      { id: 'C', label: 'C', text: "かいごしょくの はんだんで しはんやくを のませます" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q31',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 31,
    section: '安全管理・リスクマネジメント',
    text: "じしんや かさいなどの さいがいに そなえる たいさくとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ひごろから ひつような ぶっぴんを そなえ、ていきてきに ぼうさいくんれんを おこないます" },
      { id: 'B', label: 'B', text: "さいがいが おきてから はじめて ひなんけいろを かくにんします" },
      { id: 'C', label: 'C', text: "しせつだけで たいおうし、ちいきや かんけいきかんとの れんけいは おこないません" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q32',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 32,
    section: '安全管理・リスクマネジメント',
    text: "くるまいすを しようするまえの てんけんで、かくにんすべき じゅうような こうもくは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "シートの いろが きせつに あっているか" },
      { id: 'B', label: 'B', text: "タイヤや ブレーキが あんぜんに しようできる じょうたいか" },
      { id: 'C', label: 'C', text: "くるまいすの じゅうりょうが きていより おもいか" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q33',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 33,
    section: '安全管理・リスクマネジメント',
    text: "かいごしょく じしんの メンタルヘルスについて、もっとも てきせつな きじゅつを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ふあんや しんぱいごとは ひとりで かかえこみ、だれにも そうだんしません" },
      { id: 'B', label: 'B', text: "きそくただしい せいかつを こころがけ、ひつように おうじて せんぱいや なかまに そうだんします" },
      { id: 'C', label: 'C', text: "つかれていても すいみんじかんを けずり、しごとを つづけます" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q34',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 34,
    section: '安全管理・リスクマネジメント',
    text: "さんそのうしゅくきを しようしている りようしゃの あんぜんたいさくとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "さんそを しようしている ばしょで タバコや ひを つかいます" },
      { id: 'B', label: 'B', text: "ていでんなどに そなえ、いりょうしょくなどの しじに したがって よびの さんそききや でんげんを じゅんびします" },
      { id: 'C', label: 'C', text: "さんそを しようしているときは、てあらいなどの かんせんたいさくは ひつようありません" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q35',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 35,
    section: '感染症予防・衛生管理',
    text: "すべての りようしゃの けつえき、たいえき、はいせつぶつ、きずのある ひふなどには、かんせんの きけんせいが あるものとして たいおうする かんがえかたは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "リスクマネジメント" },
      { id: 'B', label: 'B', text: "スタンダード・プリコーション（ひょうじゅんよぼうさく）" },
      { id: 'C', label: 'C', text: "インフォームド・コンセント" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q36',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 36,
    section: '感染症予防・衛生管理',
    text: "せきや くしゃみによる ひまつを すいこんだり、ねんまくに つけたりすることで かんせんする けいろは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "くうきかんせん" },
      { id: 'B', label: 'B', text: "ひまつかんせん" },
      { id: 'C', label: 'C', text: "せっしょくかんせん" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q37',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 37,
    section: '感染症予防・衛生管理',
    text: "けっかくや ましんなどの びょうげんたいが、ちいさな つぶとなって くうきちゅうを ただよい、それを すいこむことで おこる かんせんけいろは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "せっしょくかんせん" },
      { id: 'B', label: 'B', text: "くうきかんせん" },
      { id: 'C', label: 'C', text: "けいこうかんせん" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q38',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 38,
    section: '感染症予防・衛生管理',
    text: "びょうげんたいが ついた てや ドアノブ、ぶっぴんなどに ふれることで おこる かんせんけいろは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "せっしょくかんせん" },
      { id: 'B', label: 'B', text: "くうきかんせん" },
      { id: 'C', label: 'C', text: "ひまつかんせん" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q39',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 39,
    section: '感染症予防・衛生管理',
    text: "つかいすての てぶくろを はずして はいきするときの りゅういてんとして、ただしいものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "おせんされた そとがわに できるだけ ふれず、うちがわに つつみこむように はずして すてます" },
      { id: 'B', label: 'B', text: "せんじょう・しょうどくすれば、つかいすての てぶくろを なんども しようできます" },
      { id: 'C', label: 'C', text: "てぶくろを はずしたあとは、てあらいを する ひつようは ありません" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q40',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 40,
    section: '感染症予防・衛生管理',
    text: "かんせんよぼうのための マスクの ただしい ちゃくようほうほうは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "くちだけを おおい、はなは そとに だします" },
      { id: 'B', label: 'B', text: "はなから あごまでを おおい、できるだけ すきまが できないように ちゃくようします" },
      { id: 'C', label: 'C', text: "かいわを するときは、マスクを あごの したに ずらします" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q41',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 41,
    section: '感染症予防・衛生管理',
    text: "てあらいで あらいのこしが おおい ぶいの くみあわせとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "てのひらと ぜんわん" },
      { id: 'B', label: 'B', text: "ゆびさき、ゆびの あいだ、おやゆび、てくび" },
      { id: 'C', label: 'C', text: "ひじと かた" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q42',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 42,
    section: '感染症予防・衛生管理',
    text: "かいごしせつなどで おこなう かんせんたいさくの きほんとして、「かんせんげんを もちこまない・もちださない・ひろげない」という かんがえかたを あらわすものは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "もちこまない・もちださない・ひろげない" },
      { id: 'B', label: 'B', text: "かくさない・はなさない・みせない" },
      { id: 'C', label: 'C', text: "とめない・いそがない・あわてない" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q43',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 43,
    section: 'ボディメカニクス・介護技術',
    text: "かいじょを おこなうさい、りょうあしを ぜんごまたは さゆうに ひろげ、ひざを まげて じゅうしんを ひくくする りゆうは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "しじきていめんを せまくするため" },
      { id: 'B', label: 'B', text: "しじきていめんを ひろくとり、しせいを あんていさせるため" },
      { id: 'C', label: 'C', text: "かいごしょくの しんちょうを たかく みせるため" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q44',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 44,
    section: 'ボディメカニクス・介護技術',
    text: "ベッドじょうで りようしゃの からだを いどうさせるとき、ひざを まげたり、うでを からだの まえで くんでもらったりする りゆうとして、もっとも てきせつなものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "からだを ちいさく まとめ、いどうの さいの ひつような ちからを へらすため" },
      { id: 'B', label: 'B', text: "りようしゃの こきゅうを とめるため" },
      { id: 'C', label: 'C', text: "りようしゃの からだを かたくして うごかなくするため" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q45',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 45,
    section: 'ボディメカニクス・介護技術',
    text: "おもいものや りようしゃを もちあげるとき、ひざを のばしたまま こしだけを まげて もちあげると、どのような きけんが ありますか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ひざへの ふたんが なくなります" },
      { id: 'B', label: 'B', text: "こしに おおきな ふたんが かかり、ようつうの げんいんに なります" },
      { id: 'C', label: 'C', text: "じゅうしんが ひくくなり、かならず あんぜんに もちあげられます" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q46',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 46,
    section: 'ボディメカニクス・介護技術',
    text: "りようしゃを ベッドから くるまいすへ いじょうかいじょするとき、かいごしょくの からだの つかいかたとして、もっとも てきせつなものは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "りようしゃから できるだけ とおい いちで さぎょうします" },
      { id: 'B', label: 'B', text: "あんぜんに はいりょしながら、かいごしょくと りようしゃの からだを できるだけ ちかづけます" },
      { id: 'C', label: 'C', text: "からだの いちや じゅうしんは かんがえずに かいじょします" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q47',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 47,
    section: 'ボディメカニクス・介護技術',
    text: "ボディメカニクスを かつようして りようしゃを ささえたり、たちあがりを しえんしたりするとき、おもに いしきして つかう きんにくぐんは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "ゆびや てくびの きんにく だけ" },
      { id: 'B', label: 'B', text: "ふとももや おしりなどの おおきな きんにく" },
      { id: 'C', label: 'C', text: "くびや かたの きんにく だけ" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q48',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 48,
    section: 'ボディメカニクス・介護技術',
    text: "りようしゃを よこの ほうこうへ いどうさせるときの かいごしょくの からだの うごかしかたとして、ただしいものを 1つ えらびなさい。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "あしを うごかさず、こしと じょうはんしんだけを おおきく ねじります" },
      { id: 'B', label: 'B', text: "からだを ねじらず、いどうする ほうこうへ あしを ふみかえます" },
      { id: 'C', label: 'C', text: "せなかを まるめて、うでの ちからだけで ひっぱります" },
    ],
    correctAnswerId: 'B',
  },
  {
    id: 't03_q49',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 49,
    section: 'ボディメカニクス・介護技術',
    text: "じぶんで からだを もちあげることが むずかしい りようしゃを、ベッドから くるまいすへ すわった しせいで いどうさせるときに しようする ふくしようぐは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "スライディングボード" },
      { id: 'B', label: 'B', text: "よんてんづえ" },
      { id: 'C', label: 'C', text: "シルバーカー" },
    ],
    correctAnswerId: 'A',
  },
  {
    id: 't03_q50',
    examId: CAREGIVER_EXAM_03_ID,
    questionNumber: 50,
    section: 'ボディメカニクス・介護技術',
    text: "ベッドじょうで りようしゃの たいせいを かえるとき、してんを つくり、ちいさな ちからで おおきな ちからを うみだす ぶつりの げんりは どれですか。",
    marks: 1,
    options: [
      { id: 'A', label: 'A', text: "てこの げんり" },
      { id: 'B', label: 'B', text: "えんしんりょくの げんり" },
      { id: 'C', label: 'C', text: "かんせいの ほうそく" },
    ],
    correctAnswerId: 'A',
  },

];

export function evaluateTest03Submission(
  answers: Record<string, string>,
  studentId: string,
  studentName?: string,
  timeElapsedSeconds: number = 0
): ExamResult {
  return calculateExam03Result(answers, timeElapsedSeconds, studentId, studentName);
}

/**
 * Authoritative Server-Side Scoring Function for TEST 03
 */
export function calculateExam03Result(
  answers: Record<string, string | null>,
  timeElapsedSeconds: number,
  studentId: string,
  studentName?: string
): ExamResult {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const lessonStats: Record<string, { total: number; correct: number; incorrect: number; unanswered: number }> = {};
  TEST_03_LESSON_DEFINITIONS.forEach((def) => {
    lessonStats[def.title] = {
      total: def.totalQuestions,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
    };
  });

  const questionResults = caregiverExam03Questions.map((q) => {
    const selected = answers[q.id] || null;
    const isCorrect = selected === q.correctAnswerId;
    const lessonKey = q.section || '介護総合問題';

    if (!lessonStats[lessonKey]) {
      lessonStats[lessonKey] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
    }

    if (!selected) {
      unansweredCount++;
      lessonStats[lessonKey].unanswered++;
    } else if (isCorrect) {
      score += q.marks;
      correctCount++;
      lessonStats[lessonKey].correct++;
    } else {
      incorrectCount++;
      lessonStats[lessonKey].incorrect++;
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

  const totalMarks = 50;
  const percentage = Number(((score / totalMarks) * 100).toFixed(2));
  // Passing score: 30 marks (60.00%)
  const passed = score >= 30;

  const performanceLevel =
    score >= 45
      ? 'Excellent'
      : score >= 40
      ? 'Very Good'
      : score >= 30
      ? 'Good'
      : score >= 20
      ? 'Improving'
      : 'Needs Practice';

  const lessonBreakdown = TEST_03_LESSON_DEFINITIONS.map((def) => {
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
    id: `res_t03_${Date.now()}`,
    examId: CAREGIVER_EXAM_03_ID,
    examTitle: caregiverExam03.title,
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
