/**
 * SANSHIN NIHON SECURE EXAMINATION SYSTEM
 * Core Data Models & Type Definitions
 * 
 * Architecture Note:
 * Real examination content and answer keys are kept strictly partitioned.
 * Client-facing questions during active examinations omit `correctAnswerId`
 * and `explanation` to ensure client-side tampering resistance.
 */

export type ExaminationStatus = 'draft' | 'published' | 'archived';

export type UserRole = 'student' | 'administrator';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type SupportedLanguage = 'ja' | 'en' | 'mixed';

/**
 * Examination Metadata & Configuration
 */
export interface Examination {
  id: string;
  title: string;
  subject: string;
  category: string;
  language: SupportedLanguage;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questionCount: number;
  publicationStatus: ExaminationStatus;
  availability: {
    isActive: boolean;
    startDate?: string; // ISO 8601 date string
    endDate?: string;   // ISO 8601 date string
  };
  instructions: string[];
  associatedPdfIds: string[]; // References to StudyMaterial metadata
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Multiple Choice / Single Choice Answer Option
 */
export interface QuestionOption {
  id: string; // e.g. "opt_a", "opt_b"
  label: string; // e.g. "A", "B", "C", "D"
  text: string;
  image?: string; // Optional image URL or asset identifier
}

/**
 * Client-facing Question Structure
 * Safe for delivery to candidate during an active examination.
 * Does NOT contain `correctAnswerId` or `explanation`.
 */
export interface ClientQuestion {
  id: string;
  examId: string;
  questionNumber: number;
  lessonQuestionNumber?: number;
  section?: string;
  text: string;
  images?: string[]; // Optional diagram/figure URLs
  options: QuestionOption[];
  marks: number;
}

/**
 * Authoritative Server-side Question Structure
 * Restricted to administrators and secure server verification routines.
 */
export interface AuthoritativeQuestion extends ClientQuestion {
  correctAnswerId: string; // ID of the correct QuestionOption
  explanation?: string;    // Post-examination or pedagogical explanation
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Candidate's Current Answer Selection State
 */
export interface CandidateAnswerRecord {
  questionId: string;
  selectedOptionId: string | null;
  markedForReview?: boolean;
  timeSpentSeconds?: number;
}

/**
 * Examination Submission Payload
 * Sent from browser to server for authoritative calculation.
 */
export interface ExamSubmissionPayload {
  examId: string;
  studentId: string;
  startedAt: string; // ISO 8601
  submittedAt: string; // ISO 8601
  answers: Record<string, string | null>; // questionId -> selectedOptionId
  timeElapsedSeconds: number;
}

export interface PerQuestionResult {
  questionId: string;
  questionNumber: number;
  section: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface LessonPerformance {
  lessonId: string;
  lessonTitle: string;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
  incorrectCount: number;
  accuracy: number | null; // percentage 0-100, or null if answeredCount === 0
}

/**
 * Server-Verified Result & Score History
 */
export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  verifiedByServer: boolean;
  timeElapsedSeconds?: number;
  performanceLevel?: 'Excellent' | 'Very Good' | 'Good' | 'Improving' | 'Needs Practice' | 'Not enough data yet';
  breakdown?: {
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
  };
  sectionBreakdown?: {
    section: string;
    score: number;
    total: number;
    percentage: number;
  }[];
  lessonBreakdown?: LessonPerformance[];
  questionResults?: PerQuestionResult[];
}

/**
 * PDF & Study Material Metadata
 * Kept strictly segregated from examination question content.
 */
export interface StudyMaterial {
  id: string;
  title: string;
  category: string;
  storageReference: string; // Internal storage URI / file path
  fileSizeFormatted?: string;
  fileSizeBytes?: number;
  mimeType: 'application/pdf';
  uploadDate: string; // ISO 8601
  publicationStatus: 'draft' | 'published' | 'archived';
  associatedExamIds: string[]; // Examinations that reference this resource
  description?: string;
}

/**
 * Japanese Language Knowledge Levels
 */
export type JapaneseLanguageLevel =
  | 'Beginner'
  | 'JLPT N5'
  | 'JLPT N4'
  | 'JLPT N3'
  | 'JLPT N2'
  | 'JLPT N1'
  | 'JFT-Basic';

/**
 * Access Request Record for audit and re-approval tracking
 */
export interface AccessRequestRecord {
  id: string;
  studentId: string;
  studentName: string;
  requestedAt: string; // ISO 8601
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Student Account Profile & Access Control (Firestore Document Schema)
 */
export interface StudentProfile {
  id: string;
  uid?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  japaneseLevels?: JapaneseLanguageLevel[];
  japaneseKnowledge?: JapaneseLanguageLevel[]; // Alias for backward compatibility
  password?: string;
  status?: ApprovalStatus;
  approvalStatus: ApprovalStatus;
  role?: 'student' | 'administrator';
  registrationNumber?: string;
  createdAt: any;
  updatedAt?: any;
  lastLoginAt?: string;
  enrolledExamsCount?: number;
  completedExamsCount?: number;
  accessRequests?: AccessRequestRecord[];
}

/**
 * Administrator Profile
 */
export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'administrator';
  permissions: string[];
}

