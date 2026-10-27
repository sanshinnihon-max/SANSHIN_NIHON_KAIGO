import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Clock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  GraduationCap,
  RotateCcw,
  Award,
  Check,
  X,
  Eye,
  Lock,
  LogOut,
  Send,
  User,
  Edit3,
  Save,
  BarChart3,
  History as HistoryIcon,
  Play,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Layers,
  RefreshCw,
  BookMarked,
} from 'lucide-react';
import { EmptyState } from './EmptyState';
import { QuestionDisplay } from './QuestionDisplay';
import { ExamTimer } from './ExamTimer';
import { StudentAuth } from './StudentAuth';
import { CompleteProfile } from './CompleteProfile';
import { StudentHistoryCharts } from './StudentHistoryCharts';
import { VocabularySection } from './VocabularySection';
import { CaregiverDictionary } from './CaregiverDictionary';
import {
  caregiverExam,
  caregiverQuestions,
  evaluateCaregiverSubmission,
  getPerformanceLevel,
  LESSON_DEFINITIONS,
} from '../data/caregiverExamData';
import {
  caregiverExam02,
  caregiverExam02Questions,
  evaluateTest02Submission,
  TEST_02_LESSON_DEFINITIONS,
} from '../data/caregiverExam02Data';
import {
  caregiverExam03,
  caregiverExam03Questions,
  evaluateTest03Submission,
  TEST_03_LESSON_DEFINITIONS,
} from '../data/caregiverExam03Data';
import {
  ExamResult,
  StudentProfile,
  JapaneseLanguageLevel,
} from '../types/exam';
import { firebaseAuthService, isPhoneValid } from '../services/firebaseAuthService';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface StudentPortalProps {
  onSelectRole?: (role: 'student' | 'administrator') => void;
  isAdminVerified?: boolean;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onSelectRole, isAdminVerified = false }) => {
  // Navigation State: 'test' | 'vocabulary' | 'dictionary' | 'history' | 'profile'
  const [activeSection, setActiveSection] = useState<'test' | 'vocabulary' | 'dictionary' | 'history' | 'profile'>('test');

  // Firebase Real-time State & Candidate Profile
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(false);

  // Reactivation Request & Status Refresh State
  const [reactivationReason, setReactivationReason] = useState('');
  const [isSubmittingReactivation, setIsSubmittingReactivation] = useState(false);
  const [reactivationSuccess, setReactivationSuccess] = useState<string | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editLevels, setEditLevels] = useState<JapaneseLanguageLevel[]>([]);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // Active Examination ID (e.g. 'sanshin-caregiver-exam-01', 'sanshin-caregiver-exam-02', or 'sanshin-caregiver-exam-03')
  const [activeExamId, setActiveExamId] = useState<string>(caregiverExam.id);

  // Global Examination Activation State mapped per examination ID (Firestore authoritative source)
  const [examActiveMap, setExamActiveMap] = useState<Record<string, boolean>>({
    [caregiverExam.id]: false,
    [caregiverExam02.id]: false,
    [caregiverExam03.id]: false,
  });
  const [examStatusLoadingMap, setExamStatusLoadingMap] = useState<Record<string, boolean>>({
    [caregiverExam.id]: true,
    [caregiverExam02.id]: true,
    [caregiverExam03.id]: true,
  });
  const [isStartingExamCheck, setIsStartingExamCheck] = useState<boolean>(false);
  const isSubmittingExamRef = useRef<boolean>(false);

  // Computed status for current active exam
  const examGlobalActive = Boolean(examActiveMap[activeExamId]);
  const examStatusLoading = Boolean(examStatusLoadingMap[activeExamId]);

  // Examination History State (persisted per student UID in Firestore)
  const [resultsHistory, setResultsHistory] = useState<ExamResult[]>([]);

  // Active Examination Session State
  const [isTakingExam, setIsTakingExam] = useState<boolean>(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [latestExamResult, setLatestExamResult] = useState<ExamResult | null>(null);
  const [showResultCompletionModal, setShowResultCompletionModal] = useState<boolean>(false);

  // Track exam duration elapsed in seconds
  const examStartTimeRef = useRef<number>(0);
  const [examElapsedSeconds, setExamElapsedSeconds] = useState<number>(0);

  // Subscribe to real-time Firebase Auth and Firestore student profile
  useEffect(() => {
    const unsubscribeFirebase = firebaseAuthService.subscribeToAuthState((user, profile, loading) => {
      setAuthLoading(loading);
      if (user && profile) {
        setCurrentStudent(profile);
        setEditFullName(profile.fullName);
        setEditPhoneNumber(profile.phoneNumber);
        setEditLevels(profile.japaneseLevels || profile.japaneseKnowledge || []);
      } else {
        setCurrentStudent(null);
      }
    });

    // Real-time listener for Exam 01 Active / Inactive status in backend
    const unsubscribeExam01 = firebaseAuthService.subscribeToExamStatus(
      caregiverExam.id,
      (isActive) => {
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam.id]: isActive }));
        setExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam.id]: false }));
      },
      (err) => {
        console.warn('Backend exam 01 status subscription fallback:', err);
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam.id]: false }));
        setExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam.id]: false }));
      }
    );

    // Real-time listener for Exam 02 Active / Inactive status in backend
    const unsubscribeExam02 = firebaseAuthService.subscribeToExamStatus(
      caregiverExam02.id,
      (isActive) => {
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam02.id]: isActive }));
        setExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam02.id]: false }));
      },
      (err) => {
        console.warn('Backend exam 02 status subscription fallback:', err);
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam02.id]: false }));
        setExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam02.id]: false }));
      }
    );

    // Real-time listener for Exam 03 Active / Inactive status in backend
    const unsubscribeExam03 = firebaseAuthService.subscribeToExamStatus(
      caregiverExam03.id,
      (isActive) => {
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam03.id]: isActive }));
        setExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam03.id]: false }));
      },
      (err) => {
        console.warn('Backend exam 03 status subscription fallback:', err);
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam03.id]: false }));
        setExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam03.id]: false }));
      }
    );

    return () => {
      unsubscribeFirebase();
      unsubscribeExam01();
      unsubscribeExam02();
      unsubscribeExam03();
    };
  }, []);

  // Subscribe to student's persistent exam results once authenticated
  useEffect(() => {
    if (!currentStudent?.uid && !currentStudent?.id) return;
    const studentUid = currentStudent.uid || currentStudent.id;

    const unsubscribeResults = firebaseAuthService.subscribeToStudentExamResults(
      studentUid,
      (results) => {
        setResultsHistory(results);
      }
    );

    return () => {
      unsubscribeResults();
    };
  }, [currentStudent?.uid, currentStudent?.id]);

  // Interval for measuring elapsed time during active exam
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTakingExam) {
      examStartTimeRef.current = Date.now();
      setExamElapsedSeconds(0);
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - examStartTimeRef.current) / 1000);
        setExamElapsedSeconds(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTakingExam]);

  // Active Examination Object and Dataset
  const activeExam =
    activeExamId === caregiverExam03.id
      ? caregiverExam03
      : activeExamId === caregiverExam02.id
      ? caregiverExam02
      : caregiverExam;
  const activeQuestions =
    activeExamId === caregiverExam03.id
      ? caregiverExam03Questions
      : activeExamId === caregiverExam02.id
      ? caregiverExam02Questions
      : caregiverQuestions;
  const currentQuestion = activeQuestions[selectedQuestionIndex];
  const answeredTotal = Object.keys(selectedAnswers).length;

  const isApproved =
    currentStudent?.approvalStatus === 'approved' || currentStudent?.status === 'approved';
  const isSuspended =
    currentStudent?.approvalStatus === 'suspended' || currentStudent?.status === 'suspended';
  const isRejected =
    currentStudent?.approvalStatus === 'rejected' || currentStudent?.status === 'rejected';
  const isPending = !isApproved && !isSuspended && !isRejected;

  const isInstitutionalAdminUser =
    isAdminVerified ||
    currentStudent?.role === 'administrator' ||
    currentStudent?.email?.trim().toLowerCase() === 'sanshinnihon@gmail.com';

  // Answer selection handler
  const handleSelectOption = (questionId: string, optionId: string) => {
    if (!isTakingExam) return;
    if (!examGlobalActive) {
      alert('This examination is currently deactivated by the administrator. Answering questions is locked.');
      return;
    }
    if (!isApproved && !isInstitutionalAdminUser) {
      alert('Account authorization required: Examination access is locked.');
      return;
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleReview = (questionId: string) => {
    if (!isTakingExam) return;
    setReviewFlags((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Start Exam Session with authoritative Firestore verification for the selected exam
  const handleStartExam = async (targetExamId: string = caregiverExam.id) => {
    if (examStatusLoadingMap[targetExamId] || isStartingExamCheck) return;
    setIsStartingExamCheck(true);

    try {
      // 1. Authoritative backend active status check from Firestore
      const authoritativeIsActive = await firebaseAuthService.getExamStatus(targetExamId);
      setExamActiveMap((prev) => ({ ...prev, [targetExamId]: authoritativeIsActive }));

      if (!authoritativeIsActive) {
        alert('This examination is currently deactivated by the institutional administrator. Starting a new session is blocked.');
        return;
      }

      // 2. Strict approval status check:
      if (!isApproved && !isInstitutionalAdminUser) {
        alert('Your account is not approved to take this examination. Administrator approval is required.');
        return;
      }

      setActiveExamId(targetExamId);
      setSelectedAnswers({});
      setReviewFlags({});
      setSelectedQuestionIndex(0);
      setLatestExamResult(null);
      setShowResultCompletionModal(false);
      setShowSubmitModal(false);
      setShowExitConfirmModal(false);
      setIsTakingExam(true);
    } catch (err) {
      console.error('Failed to verify exam status:', err);
      alert('Unable to verify examination status with backend. Please check your network connection.');
    } finally {
      setIsStartingExamCheck(false);
    }
  };

  // Submit and evaluate exam session with duplicate submission lock
  const confirmAndSubmit = async () => {
    if (isSubmittingExamRef.current) return;
    isSubmittingExamRef.current = true;
    setShowSubmitModal(false);

    try {
      // Authoritative verification before evaluating and recording
      const authoritativeIsActive = await firebaseAuthService.getExamStatus(activeExamId);
      if (!authoritativeIsActive && !isInstitutionalAdminUser) {
        setExamActiveMap((prev) => ({ ...prev, [activeExamId]: false }));
        alert('This examination has been deactivated by the administrator. Submissions are blocked.');
        setIsTakingExam(false);
        return;
      }

      if (!isApproved && !isInstitutionalAdminUser) {
        alert('Your account is suspended or not approved. Examination submission rejected.');
        setIsTakingExam(false);
        return;
      }

      const elapsed = Math.max(1, examElapsedSeconds);
      const studentUid = currentStudent?.uid || currentStudent?.id || auth.currentUser?.uid || 'std_candidate';
      const studentName = currentStudent?.fullName || 'Candidate';

      // Authoritative evaluation using verified answer key
      const result =
        activeExamId === caregiverExam03.id
          ? evaluateTest03Submission(selectedAnswers, studentUid, studentName, elapsed)
          : activeExamId === caregiverExam02.id
          ? evaluateTest02Submission(selectedAnswers, studentUid, studentName, elapsed)
          : evaluateCaregiverSubmission(selectedAnswers, studentUid, studentName, elapsed);

      setLatestExamResult(result);
      setIsTakingExam(false);
      setShowResultCompletionModal(true);

      // Persist to Cloud Firestore /examResults/{result.id} and local cache
      try {
        await firebaseAuthService.saveExamResult(result);
      } catch (err) {
        console.warn('Result persistence notice:', err);
      }
    } finally {
      isSubmittingExamRef.current = false;
    }
  };

  const handleRefreshStatus = async () => {
    if (!auth.currentUser) return;
    setIsRefreshingStatus(true);
    try {
      const snap = await getDoc(doc(db, 'students', auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data() as StudentProfile;
        setCurrentStudent({ ...data, id: auth.currentUser.uid, uid: auth.currentUser.uid });
      }
    } catch (err) {
      console.warn('Status refresh notice:', err);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleRequestReactivation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentStudent || !auth.currentUser) return;
    setIsSubmittingReactivation(true);
    setReactivationSuccess(null);
    try {
      const note = reactivationReason.trim()
        ? `Reactivation request: ${reactivationReason.trim()}`
        : 'Student requested account reactivation from suspended status';
      await firebaseAuthService.requestAccess(
        auth.currentUser.uid,
        currentStudent.fullName,
        note
      );
      setReactivationSuccess('Reactivation request submitted to the administrator for review.');
      setReactivationReason('');
    } catch (err) {
      console.warn('Reactivation request error:', err);
    } finally {
      setIsSubmittingReactivation(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseAuthService.logout();
    } catch {
      // ignore
    }
    setCurrentStudent(null);
  };

  // Safe profile save (only permitted fields per Firestore rules) with client validation
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !auth.currentUser) return;
    setProfileSaveError(null);
    setProfileSaveSuccess(false);

    if (editFullName.trim().length < 2) {
      setProfileSaveError('Full Name must be at least 2 characters long.');
      return;
    }

    const cleanPhone = editPhoneNumber.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(?:0|94|\+94)?[0-9]{9,10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setProfileSaveError('Please enter a valid Sri Lankan mobile number (e.g. 0771234567).');
      return;
    }

    try {
      const nowIso = new Date().toISOString();
      await updateDoc(doc(db, 'students', auth.currentUser.uid), {
        fullName: editFullName.trim(),
        phoneNumber: editPhoneNumber.trim(),
        japaneseLevels: editLevels,
        updatedAt: nowIso,
      });

      setCurrentStudent((prev) =>
        prev
          ? {
              ...prev,
              fullName: editFullName.trim(),
              phoneNumber: editPhoneNumber.trim(),
              japaneseLevels: editLevels,
              japaneseKnowledge: editLevels,
              updatedAt: nowIso,
            }
          : null
      );
      setProfileSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSaveSuccess(false), 3500);
    } catch (err) {
      setProfileSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleEditLevel = (lvl: JapaneseLanguageLevel) => {
    setEditLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  // -------------------------------------------------------------
  // VIEW 1: UN-AUTHENTICATED STATE (STUDENT AUTH LANDING PAGE)
  // -------------------------------------------------------------
  if (!currentStudent) {
    return (
      <StudentAuth
        onAuthSuccess={() => setActiveSection('test')}
        onSelectRole={onSelectRole}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW 1.5: PROFILE COMPLETION FLOW (PHONE NUMBER REQUIRED)
  // -------------------------------------------------------------
  if (!isInstitutionalAdminUser && !isPhoneValid(currentStudent.phoneNumber)) {
    return (
      <CompleteProfile
        student={currentStudent}
        onProfileCompleted={(updatedProfile) => {
          setCurrentStudent(updatedProfile);
          setEditPhoneNumber(updatedProfile.phoneNumber);
        }}
        onLogout={handleLogout}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW 2A: PENDING APPROVAL SCREEN (STRICT LOCKOUT PRESERVED)
  // -------------------------------------------------------------
  if (!isInstitutionalAdminUser && isPending) {
    const formattedDate = currentStudent.createdAt
      ? new Date(currentStudent.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Today';

    return (
      <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C2185B] to-[#E91E63] text-white flex items-center justify-center font-black text-lg shadow-sm border border-[#F48FB1]/40">
                三振
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#C2185B] uppercase">
                  SANSHIN NIHON &bull; STUDENT PORTAL
                </span>
                <h2 className="text-lg font-bold text-slate-900">Registration Status</h2>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-rose-50 text-rose-800 border-rose-300 flex items-center space-x-1.5">
              <Lock className="w-3 h-3 text-rose-600" />
              <span>Lock (承認待ち)</span>
            </span>
          </div>

          <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 shrink-0 mt-0.5">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  Your registration has been submitted and is awaiting administrator approval.
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  受講生登録を受理しました。管理者がアカウントを確認・承認するまで、試験問題の閲覧、解答の提出、保護された受講生機能へのアクセスは制限されます。
                </p>
                <div className="mt-2.5 flex items-center space-x-2 text-xs font-semibold text-amber-900 bg-amber-100/60 px-2.5 py-1 rounded-md w-fit">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>The administrator has been notified of your registration request.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted Registration Details (申請内容)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Full Name (氏名)</span>
                <span className="font-bold text-slate-900 text-sm">{currentStudent.fullName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gmail Address (メールアドレス)</span>
                <span className="font-medium text-slate-900">{currentStudent.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Phone Number (電話番号)</span>
                <span className="font-medium text-slate-900">{currentStudent.phoneNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Status (ステータス)</span>
                <span className="font-bold text-rose-700">Lock (承認待ち)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Student UID</span>
                <span className="font-mono text-[11px] text-slate-900 truncate block">
                  {currentStudent.uid || currentStudent.id}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Request Date (申請日時)</span>
                <span className="font-medium text-slate-900">{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={isRefreshingStatus}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#E91E63] hover:from-[#AD1457] hover:to-[#D81B60] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
              <span>{isRefreshingStatus ? 'Checking Status...' : 'Check Status (ステータス再確認)'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out (ログアウト)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2B: ACCESS SUSPENDED SCREEN (STRICT LOCKOUT PRESERVED)
  // -------------------------------------------------------------
  if (!isInstitutionalAdminUser && isSuspended) {
    return (
      <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 text-rose-300 flex items-center justify-center font-black text-lg shadow-sm border border-rose-900">
                三振
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-rose-700 uppercase">
                  SANSHIN NIHON &bull; STUDENT PORTAL
                </span>
                <h2 className="text-lg font-bold text-slate-900">Account Access Suspended</h2>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-rose-50 text-rose-800 border-rose-300">
              利用停止 (SUSPENDED)
            </span>
          </div>

          <div className="p-5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300 shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-rose-950">
                  Account Access Suspended (アカウント利用停止)
                </h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Your account access has been suspended by the administrator. Access to examination modules, mock tests, and student features is denied.
                </p>
              </div>
            </div>
          </div>

          {/* Reactivation Request Form */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>Request Account Reactivation (利用再開申請)</span>
            </h4>
            <p className="text-xs text-slate-600">
              If you believe this suspension was made in error, submit a note to the administrator:
            </p>

            {reactivationSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reactivationSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRequestReactivation} className="space-y-3">
              <textarea
                value={reactivationReason}
                onChange={(e) => setReactivationReason(e.target.value)}
                rows={3}
                placeholder="Explain reason for reactivation request / 事務局・管理者への連絡事項・再開理由を入力"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none bg-white"
              />
              <button
                type="submit"
                disabled={isSubmittingReactivation}
                className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmittingReactivation ? 'Submitting...' : 'Submit Reactivation Request'}</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={isRefreshingStatus}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
              <span>Check Status</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE EXAMINATION RUNNER (FOCUSED TEST-TAKING EXPERIENCE)
  // -------------------------------------------------------------
  if (isTakingExam) {
    const examTitleBadge =
      activeExamId === caregiverExam03.id
        ? 'TEST 03 (介護総合問題)'
        : activeExamId === caregiverExam02.id
        ? 'TEST 02 (1st lesson)'
        : '模擬試験 01';
    const totalQCount = activeQuestions.length;

    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Exam Session Header (Pink Theme) */}
        <div className="bg-gradient-to-r from-[#C2185B] via-[#D81B60] to-[#E91E63] text-white rounded-2xl p-4 sm:p-5 shadow-md border border-[#F48FB1]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#C2185B] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              三振
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#FCE4EC] uppercase tracking-wider">
                  Official Caregiver Assessment &bull; {examTitleBadge}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white/20 text-white border border-white/30">
                  LIVE SESSION
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {activeExam.title} ({activeExam.subject})
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-end">
            <ExamTimer
              initialSeconds={activeExam.durationMinutes * 60}
              isActive={isTakingExam}
              onTimeExpired={confirmAndSubmit}
            />

            <button
              type="button"
              onClick={() => setShowExitConfirmModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold cursor-pointer border border-white/20"
            >
              Exit
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Submit ({answeredTotal}/{totalQCount})
            </button>
          </div>
        </div>

        {/* Question Navigator Palette */}
        <div className="bg-white rounded-2xl border border-[#F3C3D8] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3C3D8]/50 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#54263F] uppercase tracking-wider">
                Question Navigator (全{totalQCount}問)
              </span>
              <span className="text-xs text-[#806779]">
                &bull; {answeredTotal} Answered, {totalQCount - answeredTotal} Remaining
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-[#806779] font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2185B]" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
              </span>
            </div>
          </div>

          <div className="grid grid-cols-9 sm:grid-cols-15 gap-1.5">
            {activeQuestions.map((q, idx) => {
              const isCurrent = idx === selectedQuestionIndex;
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isFlagged = Boolean(reviewFlags[q.id]);
              const label = q.lessonQuestionNumber != null ? q.lessonQuestionNumber : idx + 1;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQuestionIndex(idx)}
                  title={q.lessonQuestionNumber != null ? `${q.section} 問 ${q.lessonQuestionNumber}` : `Question ${idx + 1}`}
                  className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white shadow-sm scale-105 border-2 border-[#C2185B]'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                      : 'bg-white text-[#54263F] border border-[#F3C3D8] hover:bg-[#FFF0F6]'
                  }`}
                >
                  {label}
                  {isFlagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Display */}
        {currentQuestion && (
          <div className="bg-white rounded-2xl border border-[#F3C3D8] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3C3D8]/50 pb-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white font-black text-xs">
                  {currentQuestion.lessonQuestionNumber != null
                    ? `${currentQuestion.section} — 問 ${currentQuestion.lessonQuestionNumber}`
                    : `Question ${currentQuestion.questionNumber} / ${totalQCount}`}
                </span>
                <span className="text-xs font-bold text-[#54263F] bg-[#FFF0F6] px-2.5 py-1 rounded-md border border-[#F3C3D8]">
                  第 {selectedQuestionIndex + 1} 問 / 全 {totalQCount} 問
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleReview(currentQuestion.id)}
                className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  reviewFlags[currentQuestion.id]
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${reviewFlags[currentQuestion.id] ? 'fill-amber-500 text-amber-600' : 'text-slate-400'}`} />
                {reviewFlags[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              <p className="whitespace-pre-wrap">{currentQuestion.text}</p>
            </div>

            {/* MCQ Options A, B, C */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select One Answer (解答を選択してください):
              </label>

              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={`flex items-start p-4 rounded-xl border text-sm transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center h-5 mr-3 shrink-0">
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => {}}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-black text-xs text-slate-900 block">
                          Option {opt.label}
                        </span>
                        <p className={`text-xs sm:text-sm text-slate-800 leading-relaxed ${isSelected ? 'font-semibold' : ''}`}>
                          {opt.text}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={selectedQuestionIndex === 0}
                onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-40 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous (前へ)
              </button>

              <span className="text-xs font-bold text-slate-600">
                {selectedQuestionIndex + 1} of {totalQCount}
              </span>

              <button
                type="button"
                disabled={selectedQuestionIndex === totalQCount - 1}
                onClick={() => setSelectedQuestionIndex((prev) => Math.min(totalQCount - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-40 flex items-center"
              >
                Next (次へ)
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Exit Confirmation Modal */}
        {showExitConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">Exit Active Examination?</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to exit? Your currently selected answers for this active session will be discarded unless submitted.
              </p>
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExitConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Stay in Exam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirmModal(false);
                    setIsTakingExam(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submission Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3 text-slate-900">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Submit Examination?</h3>
                  <p className="text-xs text-slate-500">試験の提出確認</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Answered Questions:</span>
                  <span className="text-emerald-700 font-bold">{answeredTotal} of {totalQCount}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Unanswered Questions:</span>
                  <span className={totalQCount - answeredTotal > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                    {totalQCount - answeredTotal}
                  </span>
                </div>
                {totalQCount - answeredTotal > 0 && (
                  <p className="text-[11px] text-rose-600 pt-1 leading-relaxed">
                    Notice: Unanswered questions will receive 0 marks. You can still return and answer them before submitting.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={confirmAndSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-600 shadow-sm cursor-pointer"
                >
                  Confirm &amp; Submit (提出)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // POST-EXAM RESULT COMPLETION MODAL DIALOG
  // -------------------------------------------------------------
  const renderResultModal = () => {
    if (!showResultCompletionModal || !latestExamResult) return null;

    const perfLevel = latestExamResult.performanceLevel || getPerformanceLevel(latestExamResult.percentage);
    const passThreshold =
      latestExamResult.totalMarks === 50
        ? 'Passing Score: 30 / 50 (30問以上合格・60%)'
        : latestExamResult.totalMarks === 46
        ? 'Passing Score: 40 / 46 (40問以上合格)'
        : 'Passing Threshold: 27 / 45 (60%)';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
          <div className="text-center space-y-2">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-sm ${
              latestExamResult.passed
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {latestExamResult.passed ? 'Examination Passed! (合格)' : 'Examination Completed (不合格 / 再挑戦)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {latestExamResult.examTitle || 'Official Caregiver Assessment'} &bull; {passThreshold}
            </p>
          </div>

          {/* KPI summary */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Score</span>
              <span className="text-xl font-black text-slate-900">
                {latestExamResult.score} / {latestExamResult.totalMarks}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Percentage</span>
              <span className="text-xl font-black text-amber-600">
                {Number(latestExamResult.percentage).toFixed(2)}%
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
              <span className={`text-xs font-bold block mt-1 ${latestExamResult.passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                {latestExamResult.passed ? '合格 (PASS)' : '不合格 (FAIL)'}
              </span>
            </div>
          </div>

          {/* Breakdown KPI (Correct, Incorrect, Unanswered) */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-slate-600 block text-[10px] font-bold">正解 (Correct)</span>
              <span className="font-extrabold text-emerald-700">
                {latestExamResult.breakdown?.correctCount ?? latestExamResult.score}
              </span>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-slate-600 block text-[10px] font-bold">不正解 (Incorrect)</span>
              <span className="font-extrabold text-rose-700">
                {latestExamResult.breakdown?.incorrectCount ?? ((latestExamResult.totalMarks || 45) - latestExamResult.score)}
              </span>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
              <span className="text-slate-600 block text-[10px] font-bold">未回答 (Unanswered)</span>
              <span className="font-extrabold text-slate-700">
                {latestExamResult.breakdown?.unansweredCount ?? 0}
              </span>
            </div>
          </div>

          {/* Quick Lesson Breakdown snippet */}
          {latestExamResult.lessonBreakdown && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Lesson-by-Lesson Snapshot
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {latestExamResult.lessonBreakdown.map((l) => (
                  <div key={l.lessonId} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-700 truncate font-medium text-[11px]">
                      {l.lessonTitle.split(':')[0]}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0 ml-1">
                      {l.correctCount}/{l.totalQuestions} ({l.accuracy !== null ? `${Number(l.accuracy).toFixed(2)}%` : 'N/A'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowResultCompletionModal(false);
                setActiveSection('test');
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Return to Tests
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResultCompletionModal(false);
                setActiveSection('history');
              }}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#E91E63] hover:from-[#AD1457] hover:to-[#D81B60] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>View Full History &amp; Charts</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // PRIMARY STUDENT DASHBOARD INTERFACE (3 SECTIONS: TEST, HISTORY, PROFILE)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* --------------------------------------------------------- */}
      {/* 1. COMPACT RESPONSIVE HEADER BAR                          */}
      {/* --------------------------------------------------------- */}
      <header className="bg-white rounded-2xl border border-[#F3C3D8] shadow-xs px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Student Identity */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#E91E63] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              三振
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 truncate">
                  SANSHIN NIHON
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8] shrink-0">
                  Student Portal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5 truncate">
                <span className="font-bold text-slate-900 truncate">{currentStudent.fullName}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-500 font-mono text-[11px] shrink-0">ID: {currentStudent.id}</span>
              </div>
            </div>
          </div>

          {/* Right controls: Status badge, Profile toggle, Admin (if admin), Sign out */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Approved
            </span>

            {/* Collapsible toggle for secondary profile details */}
            <button
              type="button"
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#C2185B] hover:bg-[#FCE4EC]/50 border border-transparent hover:border-[#F3C3D8] transition-colors cursor-pointer"
              title={isProfileExpanded ? 'Hide profile details' : 'Show profile details'}
              aria-label="Toggle profile details"
            >
              {isProfileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isInstitutionalAdminUser && onSelectRole && (
              <button
                type="button"
                onClick={() => onSelectRole('administrator')}
                className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-[#FCE4EC] text-[#C2185B] hover:bg-[#F8BBD0] border border-[#F3C3D8] text-xs font-bold cursor-pointer transition-colors"
              >
                Admin &rarr;
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 text-xs font-semibold cursor-pointer flex items-center space-x-1 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Collapsible Secondary Profile Details */}
        {isProfileExpanded && (
          <div className="mt-3 pt-3 border-t border-[#F3C3D8]/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#FFF0F6]/60 p-3 rounded-xl animate-fade-in">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Email</span>
              <span className="font-medium text-slate-800 truncate block text-[11px]">{currentStudent.email}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Phone</span>
              <span className="font-medium text-slate-800 text-[11px]">{currentStudent.phoneNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Japanese Level</span>
              <span className="font-medium text-[#C2185B] text-[11px]">
                {currentStudent.japaneseLevels?.join(', ') || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Status</span>
              <span className="font-bold text-emerald-600 text-[11px]">Active &amp; Approved</span>
            </div>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------- */}
      {/* 2. CATALOGUE-STYLE NAVIGATION SECTION                     */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-[#F3C3D8] shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-[#FFF0F6] border-b border-[#F3C3D8] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#C2185B] uppercase tracking-wider">
            Student Menu &bull; මෙනුව
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Select a section</span>
        </div>

        <div className="divide-y divide-[#F3C3D8]/40">
          {/* Row 1: Examinations / Tests */}
          <button
            type="button"
            onClick={() => setActiveSection('test')}
            className={`w-full flex items-center justify-between px-4 py-3 sm:py-3.5 text-left transition-colors cursor-pointer ${
              activeSection === 'test'
                ? 'bg-[#FFF0F6] border-l-4 border-l-[#C2185B]'
                : 'hover:bg-[#FFF5F8]'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeSection === 'test'
                    ? 'bg-[#C2185B] text-white shadow-xs'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold truncate ${
                      activeSection === 'test' ? 'text-[#C2185B]' : 'text-slate-900'
                    }`}
                  >
                    Examinations / Tests
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    3 Available
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  TEST 01, TEST 02 &amp; TEST 03 mock examinations
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                activeSection === 'test' ? 'text-[#C2185B] translate-x-0.5' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Row 2: Vocabulary */}
          <button
            type="button"
            onClick={() => setActiveSection('vocabulary')}
            className={`w-full flex items-center justify-between px-4 py-3 sm:py-3.5 text-left transition-colors cursor-pointer ${
              activeSection === 'vocabulary'
                ? 'bg-[#FFF0F6] border-l-4 border-l-[#C2185B]'
                : 'hover:bg-[#FFF5F8]'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeSection === 'vocabulary'
                    ? 'bg-[#C2185B] text-white shadow-xs'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold truncate ${
                      activeSection === 'vocabulary' ? 'text-[#C2185B]' : 'text-slate-900'
                    }`}
                  >
                    Vocabulary
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8]">
                    367 Words
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Lessons 1–4 Japanese, Romaji &amp; Sinhala meanings
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                activeSection === 'vocabulary' ? 'text-[#C2185B] translate-x-0.5' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Row: Caregiver Dictionary */}
          <button
            type="button"
            onClick={() => setActiveSection('dictionary')}
            className={`w-full flex items-center justify-between px-4 py-3 sm:py-3.5 text-left transition-colors cursor-pointer ${
              activeSection === 'dictionary'
                ? 'bg-[#FFF0F6] border-l-4 border-l-[#C2185B]'
                : 'hover:bg-[#FFF5F8]'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeSection === 'dictionary'
                    ? 'bg-[#C2185B] text-white shadow-xs'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                <BookMarked className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold truncate ${
                      activeSection === 'dictionary' ? 'text-[#C2185B]' : 'text-slate-900'
                    }`}
                  >
                    Caregiver Dictionary
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FCE4EC] text-[#C2185B] border border-[#F3C3D8]">
                    472 Terms
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Search-indexed terms by Japanese, Romaji &amp; Sinhala
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                activeSection === 'dictionary' ? 'text-[#C2185B] translate-x-0.5' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Row 3: Exam History */}
          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`w-full flex items-center justify-between px-4 py-3 sm:py-3.5 text-left transition-colors cursor-pointer ${
              activeSection === 'history'
                ? 'bg-[#FFF0F6] border-l-4 border-l-[#C2185B]'
                : 'hover:bg-[#FFF5F8]'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeSection === 'history'
                    ? 'bg-[#C2185B] text-white shadow-xs'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                <HistoryIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold truncate ${
                      activeSection === 'history' ? 'text-[#C2185B]' : 'text-slate-900'
                    }`}
                  >
                    Exam History
                  </span>
                  {resultsHistory.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {resultsHistory.length} attempts
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Past scores, analytics and detailed answer reviews
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                activeSection === 'history' ? 'text-[#C2185B] translate-x-0.5' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Row 4: My Profile */}
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 sm:py-3.5 text-left transition-colors cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-[#FFF0F6] border-l-4 border-l-[#C2185B]'
                : 'hover:bg-[#FFF5F8]'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeSection === 'profile'
                    ? 'bg-[#C2185B] text-white shadow-xs'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold truncate ${
                      activeSection === 'profile' ? 'text-[#C2185B]' : 'text-slate-900'
                    }`}
                  >
                    My Profile
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Candidate contact details and Japanese qualifications
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform ${
                activeSection === 'profile' ? 'text-[#C2185B] translate-x-0.5' : 'text-slate-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 3. SECTION CONTENT AREA (TEST, VOCABULARY, HISTORY, PROFILE) */}
      {/* --------------------------------------------------------- */}
      {activeSection === 'test' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between gap-2 pb-1">
            <div>
              <h2 className="text-base font-bold text-slate-900">Available Examinations</h2>
              <p className="text-xs text-slate-500">
                Select a test below to start your timed caregiver skills evaluation
              </p>
            </div>
          </div>

          {/* Compact Simplified Examination Cards (Requirement 5) */}
          <div className="space-y-4">
            {/* --------------------------------------------- */}
            {/* COMPACT CARD 1: TEST 01                       */}
            {/* --------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-[#F3C3D8] hover:border-[#D94F91] p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3C3D8]/60 pb-3.5">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white">
                    TEST 01
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#54263F]">
                    TEST 01
                  </h3>
                </div>

                {/* Status Pill */}
                <div>
                  {examStatusLoadingMap[caregiverExam.id] ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-300">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                        examActiveMap[caregiverExam.id]
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          examActiveMap[caregiverExam.id] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <span>{examActiveMap[caregiverExam.id] ? 'Active' : 'Inactive'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Information & Start Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 text-xs font-bold text-[#54263F]">
                  <span className="flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8]">
                    <FileText className="w-4 h-4 text-[#C2185B]" />
                    45 Questions
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8]">
                    <Clock className="w-4 h-4 text-[#C2185B]" />
                    60 Mins
                  </span>
                </div>

                <div>
                  {examStatusLoadingMap[caregiverExam.id] || isStartingExamCheck ? (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs cursor-wait flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </button>
                  ) : examActiveMap[caregiverExam.id] ? (
                    <button
                      type="button"
                      onClick={() => handleStartExam(caregiverExam.id)}
                      disabled={!isApproved && !isInstitutionalAdminUser}
                      className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Test</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs opacity-75 cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Inactive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* --------------------------------------------- */}
            {/* COMPACT CARD 2: TEST 02 (1st lesson)           */}
            {/* --------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-[#F3C3D8] hover:border-[#D94F91] p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3C3D8]/60 pb-3.5">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white">
                    TEST 02
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#54263F]">
                    TEST 02
                  </h3>
                </div>

                {/* Status Pill */}
                <div>
                  {examStatusLoadingMap[caregiverExam02.id] ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-300">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                        examActiveMap[caregiverExam02.id]
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          examActiveMap[caregiverExam02.id] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <span>{examActiveMap[caregiverExam02.id] ? 'Active' : 'Inactive'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Information & Start Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 text-xs font-bold text-[#54263F]">
                  <span className="flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8]">
                    <FileText className="w-4 h-4 text-[#C2185B]" />
                    46 Questions
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8]">
                    <Clock className="w-4 h-4 text-[#C2185B]" />
                    60 Mins
                  </span>
                </div>

                <div>
                  {examStatusLoadingMap[caregiverExam02.id] || isStartingExamCheck ? (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs cursor-wait flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </button>
                  ) : examActiveMap[caregiverExam02.id] ? (
                    <button
                      type="button"
                      onClick={() => handleStartExam(caregiverExam02.id)}
                      disabled={!isApproved && !isInstitutionalAdminUser}
                      className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Test</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs opacity-75 cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Inactive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* --------------------------------------------- */}
            {/* COMPACT CARD 3: TEST 03 (介護総合問題)          */}
            {/* --------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-[#F3C3D8] hover:border-[#D94F91] p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3C3D8]/60 pb-3.5">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white">
                    TEST 03
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#54263F]">
                    TEST 03
                  </h3>
                </div>

                {/* Status Pill */}
                <div>
                  {examStatusLoadingMap[caregiverExam03.id] ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-300">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                        examActiveMap[caregiverExam03.id]
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          examActiveMap[caregiverExam03.id] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <span>{examActiveMap[caregiverExam03.id] ? 'Active' : 'Inactive'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Information & Start Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 text-xs font-bold text-[#54263F]">
                  <span className="flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8]">
                    <FileText className="w-4 h-4 text-[#C2185B]" />
                    50 Questions
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#FFF0F6] px-3 py-1.5 rounded-xl border border-[#F3C3D8]">
                    <Clock className="w-4 h-4 text-[#C2185B]" />
                    60 Mins
                  </span>
                </div>

                <div>
                  {examStatusLoadingMap[caregiverExam03.id] || isStartingExamCheck ? (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs cursor-wait flex items-center justify-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </button>
                  ) : examActiveMap[caregiverExam03.id] ? (
                    <button
                      type="button"
                      onClick={() => handleStartExam(caregiverExam03.id)}
                      disabled={!isApproved && !isInstitutionalAdminUser}
                      className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Test</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs opacity-75 cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Inactive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* SECTION: VOCABULARY SECTION (367 WORDS + 105 SYNONYMS)    */}
      {/* --------------------------------------------------------- */}
      {activeSection === 'vocabulary' && (
        <VocabularySection onOpenDictionary={() => setActiveSection('dictionary')} />
      )}

      {/* --------------------------------------------------------- */}
      {/* SECTION: CAREGIVER DICTIONARY (SEARCH-INDEXED TERMS)      */}
      {/* --------------------------------------------------------- */}
      {activeSection === 'dictionary' && (
        <CaregiverDictionary />
      )}

      {/* --------------------------------------------------------- */}
      {/* 3. SECTION 2: HISTORY SECTION                             */}
      {/* --------------------------------------------------------- */}
      {activeSection === 'history' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Examination History &amp; Analytics</h2>
              <p className="text-xs text-slate-600">
                Detailed progress charts, 4-lesson performance analysis, and complete attempt history
              </p>
            </div>
          </div>

          <StudentHistoryCharts
            results={resultsHistory}
            onStartExam={handleStartExam}
          />
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* 4. SECTION 3: PROFILE SECTION                             */}
      {/* --------------------------------------------------------- */}
      {activeSection === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Profile (受講生プロフィール)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticated candidate record &amp; Japanese qualifications
                </p>
              </div>

              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  <span>Edit Contact Info</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {profileSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contact details successfully updated and synced with Cloud Firestore.</span>
              </div>
            )}

            {profileSaveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileSaveError}</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (氏名)
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (電話番号)
                  </label>
                  <input
                    type="tel"
                    value={editPhoneNumber}
                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* Japanese qualifications selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Japanese Language Qualifications (日本語資格)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(
                      [
                        'Beginner',
                        'JLPT N5',
                        'JLPT N4',
                        'JLPT N3',
                        'JLPT N2',
                        'JLPT N1',
                        'JFT-Basic',
                      ] as JapaneseLanguageLevel[]
                    ).map((lvl) => {
                      const isChecked = editLevels.includes(lvl);
                      return (
                        <label
                          key={lvl}
                          onClick={() => toggleEditLevel(lvl)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer text-center font-bold transition-all ${
                            isChecked
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {lvl}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs shadow-sm hover:bg-slate-800 cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    <span>Save Contact Changes (保存)</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Full Name
                    </span>
                    <p className="text-sm font-bold text-slate-900">{currentStudent.fullName}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Gmail Address
                    </span>
                    <p className="text-xs font-semibold text-slate-900">{currentStudent.email}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Phone Number
                    </span>
                    <p className="text-xs font-semibold text-slate-900">{currentStudent.phoneNumber}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Account Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isSuspended
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isApproved ? 'Approved (承認済)' : isSuspended ? 'Suspended (利用停止)' : 'Pending (承認待ち)'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Registration Date
                    </span>
                    <p className="text-xs font-semibold text-slate-900">
                      {currentStudent.createdAt
                        ? new Date(currentStudent.createdAt).toLocaleDateString()
                        : 'Today'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Candidate UID
                    </span>
                    <p className="text-xs font-mono text-slate-700 truncate">
                      {currentStudent.uid || currentStudent.id}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Total Examinations Completed
                    </span>
                    <p className="text-base font-black text-slate-900">
                      {resultsHistory.length}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Latest Examination Score
                    </span>
                    <p className="text-base font-black text-amber-600">
                      {resultsHistory.length > 0 ? `${resultsHistory[0].percentage}% (${resultsHistory[0].score}/45)` : 'None'}
                    </p>
                  </div>
                </div>

                {/* Japanese qualifications pills */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                    Japanese Language Qualifications (日本語能力・資格)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(currentStudent.japaneseLevels || currentStudent.japaneseKnowledge || []).length > 0 ? (
                      (currentStudent.japaneseLevels || currentStudent.japaneseKnowledge || []).map(
                        (lvl: JapaneseLanguageLevel) => (
                          <span
                            key={lvl}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                          >
                            {lvl}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-xs text-slate-400">None specified yet</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Result Completion Dialog */}
      {renderResultModal()}
    </div>
  );
};
