import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Power,
  Database,
  FileCheck2,
  AlertTriangle,
  FolderLock,
  Layers,
  Search,
  CheckCircle2,
  Filter,
  UserCheck,
  UserX,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  LogOut,
  UserCheck2,
  ExternalLink,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  X,
  Download,
  Trash2,
  History as HistoryIcon,
  BarChart3,
  Award,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from './EmptyState';
import { VocabularySection } from './VocabularySection';
import { StudyMaterial, StudentProfile, ExamResult } from '../types/exam';
import { caregiverExam, caregiverQuestions } from '../data/caregiverExamData';
import {
  caregiverExam02,
  caregiverExam02Questions,
  TEST_02_LESSON_DEFINITIONS,
} from '../data/caregiverExam02Data';
import {
  caregiverExam03,
  caregiverExam03Questions,
  TEST_03_LESSON_DEFINITIONS,
} from '../data/caregiverExam03Data';
import { studentStore } from '../data/studentStore';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AdminPortalProps {
  onSwitchToStudentView?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onSwitchToStudentView }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'accounts' | 'activation' | 'exams' | 'vocabulary' | 'pdfs'
  >('dashboard');

  const [studentAccountsView, setStudentAccountsView] = useState<'roster' | 'requests'>('roster');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [selectedExamInspector, setSelectedExamInspector] = useState<'exam01' | 'exam02' | 'exam03'>('exam01');

  // Multi-exam status tracking across Cloud Firestore
  const [examActiveMap, setExamActiveMap] = useState<Record<string, boolean>>({
    [caregiverExam.id]: false,
    [caregiverExam02.id]: false,
    [caregiverExam03.id]: false,
  });
  const [isExamStatusLoadingMap, setIsExamStatusLoadingMap] = useState<Record<string, boolean>>({
    [caregiverExam.id]: true,
    [caregiverExam02.id]: true,
    [caregiverExam03.id]: true,
  });
  const [isTogglingExamMap, setIsTogglingExamMap] = useState<Record<string, boolean>>({
    [caregiverExam.id]: false,
    [caregiverExam02.id]: false,
    [caregiverExam03.id]: false,
  });

  const examActiveState = Boolean(examActiveMap[caregiverExam.id]);
  const isExamStatusLoading = Boolean(isExamStatusLoadingMap[caregiverExam.id]);
  const isTogglingExam = Boolean(isTogglingExamMap[caregiverExam.id]);

  // Student State from Cloud Firestore
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [accessRequests, setAccessRequests] = useState(studentStore.getAllAccessRequests());
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(auth.currentUser);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Student Exam History Inspection State
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<StudentProfile | null>(null);
  const [studentHistoryResults, setStudentHistoryResults] = useState<ExamResult[]>([]);
  const [studentHistoryFilter, setStudentHistoryFilter] = useState<string>('all');
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // Permanent Student Deletion State
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState<boolean>(false);

  // Overall Exam Activity across all students
  const [allExamResults, setAllExamResults] = useState<ExamResult[]>([]);

  // Password Setup / Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);
  const [passwordModalSuccess, setPasswordModalSuccess] = useState<string | null>(null);

  const handleSaveAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordModalError(null);
    setPasswordModalSuccess(null);

    if (newAdminPassword.length < 12) {
      setPasswordModalError('Administrator password must be at least 12 characters long.');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordModalError('The passwords do not match. Please re-enter.');
      return;
    }

    const targetUser = adminUser || auth.currentUser;
    if (!targetUser) {
      setPasswordModalError('No active administrator session detected.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await firebaseAuthService.setAdminPassword(targetUser, newAdminPassword);
      setPasswordModalSuccess(
        'Administrator password established and linked to your Firebase account successfully.'
      );
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordModalSuccess(null);
      }, 2500);
    } catch (err) {
      setPasswordModalError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingPassword(false);
    }
  };

  useEffect(() => {
    // 1. Track Firebase Auth user
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });

    // 2. Subscribe in real time to Cloud Firestore students collection
    const unsubscribeFirestoreStudents = firebaseAuthService.subscribeToAllStudents(
      (firestoreList) => {
        setStudents(firestoreList);
      },
      (err) => {
        console.warn('Firestore students collection listener notice:', err);
      }
    );

    // 3. Subscribe in real time to Cloud Firestore exam settings for Exam 01
    const unsubscribeExam01 = firebaseAuthService.subscribeToExamStatus(
      caregiverExam.id,
      (isActive) => {
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam.id]: isActive }));
        setIsExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam.id]: false }));
      },
      (err) => {
        console.warn('Admin exam 01 status subscription error:', err);
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam.id]: false }));
        setIsExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam.id]: false }));
      }
    );

    // 4. Subscribe in real time to Cloud Firestore exam settings for Exam 02
    const unsubscribeExam02 = firebaseAuthService.subscribeToExamStatus(
      caregiverExam02.id,
      (isActive) => {
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam02.id]: isActive }));
        setIsExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam02.id]: false }));
      },
      (err) => {
        console.warn('Admin exam 02 status subscription error:', err);
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam02.id]: false }));
        setIsExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam02.id]: false }));
      }
    );

    // 5. Subscribe in real time to Cloud Firestore exam settings for Exam 03
    const unsubscribeExam03 = firebaseAuthService.subscribeToExamStatus(
      caregiverExam03.id,
      (isActive) => {
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam03.id]: isActive }));
        setIsExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam03.id]: false }));
      },
      (err) => {
        console.warn('Admin exam 03 status subscription error:', err);
        setExamActiveMap((prev) => ({ ...prev, [caregiverExam03.id]: false }));
        setIsExamStatusLoadingMap((prev) => ({ ...prev, [caregiverExam03.id]: false }));
      }
    );

    // 6. Subscribe to Firestore access requests
    const unsubscribeFirestoreRequests = firebaseAuthService.subscribeToAccessRequests(
      (firestoreReqs) => {
        if (firestoreReqs.length > 0) {
          setAccessRequests(firestoreReqs);
        }
      },
      (err) => {
        console.warn('Firestore access requests listener notice:', err);
      }
    );

    // 7. Subscribe to all exam results for aggregate exam activity count
    const unsubscribeAllResults = firebaseAuthService.subscribeToAllExamResults((results) => {
      setAllExamResults(results);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestoreStudents();
      unsubscribeExam01();
      unsubscribeExam02();
      unsubscribeExam03();
      unsubscribeFirestoreRequests();
      unsubscribeAllResults();
    };
  }, []);

  // Real-time listener for selected student's complete exam history
  useEffect(() => {
    if (!selectedStudentForHistory) {
      setStudentHistoryResults([]);
      setIsHistoryLoading(false);
      return;
    }
    setIsHistoryLoading(true);
    const targetStudentId = selectedStudentForHistory.uid || selectedStudentForHistory.id;
    const unsub = firebaseAuthService.subscribeToStudentExamResults(
      targetStudentId,
      (results) => {
        setStudentHistoryResults(results);
        setIsHistoryLoading(false);
      }
    );
    return () => {
      unsub();
    };
  }, [selectedStudentForHistory]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleUnlockStudent = async (studentId: string, name: string) => {
    setIsUpdatingStatus(studentId);
    try {
      await firebaseAuthService.updateStudentStatus(studentId, 'approved');
      studentStore.approveStudent(studentId, 'SANSHIN NIHON Admin');
      showNotice(`${name} (${studentId}) のステータスを [Unlock] (承認) に変更しました。`);
    } catch (err) {
      console.error('Unlock failed:', err);
      showNotice(`Error unlocking ${name}. Please check permissions.`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleLockStudent = async (studentId: string, name: string) => {
    setIsUpdatingStatus(studentId);
    try {
      await firebaseAuthService.updateStudentStatus(studentId, 'suspended');
      studentStore.suspendStudent(studentId);
      showNotice(`${name} (${studentId}) のステータスを [Lock] (利用停止) に変更しました。`);
    } catch (err) {
      console.error('Lock failed:', err);
      showNotice(`Error locking ${name}.`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    try {
      await firebaseAuthService.deleteStudent(studentToDelete.id);
      showNotice(`${studentToDelete.fullName} (${studentToDelete.email}) の受講生レコードおよび全試験履歴を完全に削除しました。`);
      setStudentToDelete(null);
    } catch (err) {
      console.error('Delete student failed:', err);
      showNotice(`Error deleting student: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleApprove = handleUnlockStudent;
  const handleRestore = handleUnlockStudent;
  const handleSuspend = handleLockStudent;

  const handleReject = async (studentId: string, name: string) => {
    setIsUpdatingStatus(studentId);
    try {
      await firebaseAuthService.updateStudentStatus(studentId, 'rejected');
      studentStore.rejectStudent(studentId, 'SANSHIN NIHON Admin');
      showNotice(`${name} (${studentId}) の登録を却下しました (Rejected / Lock).`);
    } catch (err) {
      console.error('Rejection failed:', err);
      showNotice(`Error rejecting ${name}. Please check permissions.`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Toggle examination Active / Inactive state for any exam and persist to Cloud Firestore backend
  const handleToggleExamStatus = async (targetExamId: string = caregiverExam.id) => {
    if (isTogglingExamMap[targetExamId]) return;
    setIsTogglingExamMap((prev) => ({ ...prev, [targetExamId]: true }));
    const currentActive = Boolean(examActiveMap[targetExamId]);
    const nextState = !currentActive;
    const examLabel =
      targetExamId === caregiverExam03.id
        ? 'TEST 03 (介護総合問題)'
        : targetExamId === caregiverExam02.id
        ? 'TEST 02 (1st lesson)'
        : '模擬試験 01';

    try {
      await firebaseAuthService.setExamStatus(targetExamId, nextState);
      setExamActiveMap((prev) => ({ ...prev, [targetExamId]: nextState }));
      showNotice(
        nextState
          ? `${examLabel} is now ACTIVE (試験を開始しました - 受講可能)`
          : `${examLabel} is now INACTIVE (試験を停止しました - 非公開)`
      );
    } catch (err) {
      console.error(`Failed to toggle status for ${targetExamId}:`, err);
      showNotice(`Failed to update ${examLabel} status in Cloud Firestore.`);
    } finally {
      setIsTogglingExamMap((prev) => ({ ...prev, [targetExamId]: false }));
    }
  };

  // Filter students by search (name, email, phone) and status
  const filteredStudents = students.filter((s) => {
    const matchesStatus =
      studentStatusFilter === 'all'
        ? true
        : studentStatusFilter === 'approved'
        ? s.approvalStatus === 'approved'
        : studentStatusFilter === 'locked'
        ? s.approvalStatus !== 'approved'
        : s.approvalStatus === studentStatusFilter;
    const q = studentSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phoneNumber.includes(q) ||
      s.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingStudents = students.filter((s) => s.approvalStatus === 'pending');
  const pendingCount = pendingStudents.length;
  const unlockedStudents = students.filter((s) => s.approvalStatus === 'approved');
  const lockedStudents = students.filter((s) => s.approvalStatus !== 'approved');
  const unlockedCount = unlockedStudents.length;
  const lockedCount = lockedStudents.length;
  const totalStudentsCount = students.length;
  const totalExamAttempts = allExamResults.length;
  const hasPasswordProvider = adminUser?.providerData?.some((p) => p.providerId === 'password');

  const examinations = [caregiverExam, caregiverExam02, caregiverExam03];
  const studyMaterials: StudyMaterial[] = [];

  const inspectedQuestions =
    selectedExamInspector === 'exam03'
      ? caregiverExam03Questions
      : selectedExamInspector === 'exam02'
      ? caregiverExam02Questions
      : caregiverQuestions;

  const filteredQuestions = inspectedQuestions.filter((q) => {
    const matchesFilter =
      selectedSectionFilter === 'all' || q.section === selectedSectionFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(q.questionNumber).includes(searchQuery) ||
      (q.lessonQuestionNumber != null && String(q.lessonQuestionNumber).includes(searchQuery)) ||
      q.options.some((opt) => opt.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-[#54263F] text-white text-xs rounded-xl shadow-md flex items-center justify-between animate-fade-in border border-[#A83267]/40">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-[#F3C3D8] font-mono">Firestore synced</span>
        </div>
      )}

      {/* Cloud Firestore Unmistakable Admin Authorization Header */}
      <div className="bg-gradient-to-r from-[#54263F] via-[#732950] to-[#54263F] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#A83267]/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6589C] to-[#A83267] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0 border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  ADMIN ROLE AUTHORIZED
                </span>
                <span className="text-[11px] font-mono text-[#F3C3D8]">
                  sanshinnihon@gmail.com
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                SANSHIN NIHON Institutional Administrator Console
              </h1>
              <p className="text-xs text-[#F3C3D8]/80 mt-0.5">
                Verified by Cloud Firestore Security Rules &bull; Real-Time Role-Based Access Control Active
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <a
              href="/SANSHIN_NIHON_NETLIFY_DIST.zip"
              download="SANSHIN_NIHON_NETLIFY_DIST.zip"
              className="px-3 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              title="Download pre-built static bundle for instant drag-and-drop to Netlify"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Netlify Drop ZIP (Pre-built)</span>
            </a>

            <a
              href="/SANSHIN_NIHON_CAREGIVER.zip"
              download="SANSHIN_NIHON_CAREGIVER.zip"
              className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              title="Download complete project source code for Git/Netlify"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Source ZIP</span>
            </a>

            {onSwitchToStudentView && (
              <button
                type="button"
                onClick={onSwitchToStudentView}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                title="Preview Candidate Portal"
              >
                <span>Student View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordModalError(null);
                setPasswordModalSuccess(null);
              }}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              title="Set or update administrator password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Set Password</span>
            </button>

            <button
              type="button"
              onClick={() => firebaseAuthService.logout()}
              className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold border border-rose-400/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Administrator Password Setup Notice Banner */}
      {!hasPasswordProvider && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#54263F]">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">
                Password Setup Recommended for Administrator Account
              </p>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                You are currently signed in via Google. Email/Password authentication is now enabled on Firebase. Establish your 12+ character password to enable direct email/password login anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordModalError(null);
              setPasswordModalSuccess(null);
            }}
            className="btn-rose-primary px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 shadow-sm"
          >
            Set Password Now
          </button>
        </div>
      )}

      {/* Sub-navigation tabs for administrator modules */}
      <div className="border border-[#F3C3D8] bg-white px-3 py-2 rounded-2xl shadow-xs">
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          {[
            { id: 'dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
            {
              id: 'accounts',
              label: `Student Approvals (${pendingCount > 0 ? `${pendingCount} Pending` : `${students.length} Accounts`})`,
              icon: Users,
            },
            {
              id: 'activation',
              label: `Exam Control (${examActiveMap[caregiverExam.id] || examActiveMap[caregiverExam02.id] ? 'Active' : 'Inactive'})`,
              icon: Power,
            },
            { id: 'exams', label: 'Exam Data (91 Questions)', icon: Database },
            { id: 'vocabulary', label: 'Vocabulary (単語集 365+)', icon: Sparkles },
            { id: 'pdfs', label: 'PDF Documents', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white font-semibold shadow-xs'
                    : 'text-[#806779] hover:text-[#54263F] hover:bg-[#FFF0F6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODULE 1: ADMINISTRATOR DASHBOARD                         */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Cards (Redesigned with Total, Unlocked, Locked, Exam Activity) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Students */}
            <div className="card-rose p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A83267]">
                  Total Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FFF0F6] text-[#A83267] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#54263F]">{totalStudentsCount}</p>
              <p className="text-[11px] text-[#806779]">All registered student accounts</p>
            </div>

            {/* Card 2: Unlocked Students (Green) */}
            <div className="card-rose p-5 space-y-2 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  Unlocked Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-emerald-700">{unlockedCount}</p>
              <p className="text-[11px] text-emerald-700/80 font-medium">Authorized to take exams</p>
            </div>

            {/* Card 3: Locked Students (Red) */}
            <div className="card-rose p-5 space-y-2 border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  Locked Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <UserX className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-rose-700">{lockedCount}</p>
              <p className="text-[11px] text-rose-700/80 font-medium">Access locked / awaiting approval</p>
            </div>

            {/* Card 4: Exam Activity */}
            <div className="card-rose p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A83267]">
                  Exam Activity
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[#54263F]">{totalExamAttempts}</p>
              <div className="space-y-0.5 pt-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Total Attempts Recorded</span>
                  <span className="font-bold text-[#A83267] font-mono">{totalExamAttempts}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Active Live Exams</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {[caregiverExam.id, caregiverExam02.id, caregiverExam03.id].filter((id) => examActiveMap[id]).length} / 3
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* EXAMINATION ACTIVE / INACTIVE CONTROLLER (ALL EXAMS)      */}
          {/* ========================================================= */}
          <div className="space-y-4">
            {/* Exam 01 Switch */}
            <div className="card-rose p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3C3D8] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A83267] block">
                    Exam #01 Access Controller &bull; 実施管理
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#54263F] mt-0.5">
                    {caregiverExam.title}
                  </h3>
                  <p className="text-xs text-[#806779] mt-0.5">
                    45 Questions &bull; 60 Minutes &bull; Passing Score: 27 / 45 (60% 合格基準)
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 ${
                      examActiveMap[caregiverExam.id]
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        examActiveMap[caregiverExam.id] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {examActiveMap[caregiverExam.id] ? 'ACTIVE (受講可能)' : 'INACTIVE (停止中)'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleExamStatus(caregiverExam.id)}
                    disabled={isExamStatusLoadingMap[caregiverExam.id] || isTogglingExamMap[caregiverExam.id]}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60 ${
                      examActiveMap[caregiverExam.id]
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>
                      {examActiveMap[caregiverExam.id]
                        ? 'Deactivate (停止)'
                        : 'Activate (開始)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Exam 02 Switch */}
            <div className="card-rose p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3C3D8] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A83267] block">
                    Exam #02 Access Controller &bull; 実施管理
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#54263F] mt-0.5">
                    {caregiverExam02.title}
                  </h3>
                  <p className="text-xs text-[#806779] mt-0.5">
                    46 Questions &bull; 60 Minutes &bull; Passing Score: 40 / 46 (86.96% 合格基準 40問以上)
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 ${
                      examActiveMap[caregiverExam02.id]
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        examActiveMap[caregiverExam02.id] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {examActiveMap[caregiverExam02.id] ? 'ACTIVE (受講可能)' : 'INACTIVE (停止中)'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleExamStatus(caregiverExam02.id)}
                    disabled={isExamStatusLoadingMap[caregiverExam02.id] || isTogglingExamMap[caregiverExam02.id]}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60 ${
                      examActiveMap[caregiverExam02.id]
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>
                      {examActiveMap[caregiverExam02.id]
                        ? 'Deactivate (停止)'
                        : 'Activate (開始)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Exam 03 Switch */}
            <div className="card-rose p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3C3D8] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A83267] block">
                    Exam #03 Access Controller &bull; 実施管理
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#54263F] mt-0.5">
                    {caregiverExam03.title}
                  </h3>
                  <p className="text-xs text-[#806779] mt-0.5">
                    50 Questions &bull; 60 Minutes &bull; Passing Score: 30 / 50 (60% 合格基準 30問以上)
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 ${
                      examActiveMap[caregiverExam03.id]
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        examActiveMap[caregiverExam03.id] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {examActiveMap[caregiverExam03.id] ? 'ACTIVE (受講可能)' : 'INACTIVE (停止中)'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleExamStatus(caregiverExam03.id)}
                    disabled={isExamStatusLoadingMap[caregiverExam03.id] || isTogglingExamMap[caregiverExam03.id]}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60 ${
                      examActiveMap[caregiverExam03.id]
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>
                      {examActiveMap[caregiverExam03.id]
                        ? 'Deactivate (停止)'
                        : 'Activate (開始)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* REQUIREMENT 2: DEDICATED PENDING STUDENT APPROVALS SECTION */}
          {/* ========================================================= */}
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3C3D8] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A83267]">
                    Access Control &bull; 受講審査
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
                    {pendingCount} Pending Account{pendingCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#54263F] mt-0.5">
                  Pending Student Approvals (承認待ち受講生)
                </h3>
                <p className="text-xs text-[#806779] mt-0.5">
                  Review registered candidates, verify contact phone numbers and Japanese language proficiency, and grant or reject access.
                </p>
              </div>
            </div>

            {/* List of Pending Students */}
            {pendingStudents.length > 0 ? (
              <div className="space-y-3">
                {pendingStudents.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F3C3D8] shadow-xs space-y-3 hover:border-[#D94F91] transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F3C3D8]/60 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#54263F]">
                            {st.fullName}
                          </span>
                          <span className="text-[11px] font-mono text-[#806779]">
                            [{st.id}]
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-600" />
                            Lock
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#806779]">
                          <span className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1 text-[#A83267]" />
                            {st.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1 text-[#A83267]" />
                            {st.phoneNumber ? (
                              <span className="font-medium text-[#54263F]">{st.phoneNumber}</span>
                            ) : (
                              <span className="text-rose-600 font-semibold italic">Not provided</span>
                            )}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-[#A83267]" />
                            Registered: {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Unlock, History & Remove */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForHistory(st)}
                          className="inline-flex items-center px-3 py-1.5 bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#A83267] border border-[#F3C3D8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          title="View student's exam history"
                        >
                          <HistoryIcon className="w-3.5 h-3.5 mr-1" />
                          <span>Exam History</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdatingStatus === st.id}
                          onClick={() => handleUnlockStudent(st.id, st.fullName)}
                          className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1" />
                          <span>Unlock Student</span>
                        </button>

                        {st.email !== 'sanshinnihon@gmail.com' && (
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(st)}
                            className="inline-flex items-center px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            title="Permanently remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            <span>Remove Student</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Japanese Language Proficiency Display */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-[11px] font-bold text-[#A83267]">
                        日本語能力・資格 (Japanese Knowledge):
                      </span>
                      {st.japaneseLevels && st.japaneseLevels.length > 0 ? (
                        st.japaneseLevels.map((lvl) => (
                          <span
                            key={lvl}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]"
                          >
                            {lvl}
                          </span>
                        ))
                      ) : st.japaneseKnowledge && st.japaneseKnowledge.length > 0 ? (
                        st.japaneseKnowledge.map((lvl) => (
                          <span
                            key={lvl}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]"
                          >
                            {lvl}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#806779] italic">未指定 (Unspecified)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#F3C3D8] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#54263F]">
                    All Student Registrations Reviewed
                  </h4>
                  <p className="text-xs text-[#806779] max-w-md mx-auto mt-1">
                    There are currently 0 pending student accounts awaiting approval. When new applicants register, their profiles will appear here for one-click authorization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 2: STUDENT ROSTER & DETAILED ACCESS CONTROL       */}
      {/* ========================================================= */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F3C3D8] pb-5">
              <div>
                <h2 className="text-lg font-bold text-[#54263F]">
                  Student Account Approval &amp; Access Control
                </h2>
                <p className="text-xs text-[#806779] mt-0.5">
                  Complete candidate directory with real-time Cloud Firestore synchronization and access audit log.
                </p>
              </div>

              {/* Sub-view toggle: Roster vs Request Log */}
              <div className="bg-[#FFF0F6] p-1 rounded-xl border border-[#F3C3D8] flex items-center space-x-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStudentAccountsView('roster')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    studentAccountsView === 'roster'
                      ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white shadow-xs'
                      : 'text-[#806779] hover:text-[#54263F]'
                  }`}
                >
                  受講生名簿 ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentAccountsView('requests')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    studentAccountsView === 'requests'
                      ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white shadow-xs'
                      : 'text-[#806779] hover:text-[#54263F]'
                  }`}
                >
                  申請履歴 ({accessRequests.length})
                </button>
              </div>
            </div>

            {studentAccountsView === 'roster' && (
              <>
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                    <input
                      type="text"
                      placeholder="氏名・メールアドレス・電話番号で検索 (Search by Name, Email, or Phone)..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F3C3D8] rounded-xl text-xs text-[#54263F] placeholder-[#806779]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-[#806779] shrink-0" />
                    <select
                      value={studentStatusFilter}
                      onChange={(e) => setStudentStatusFilter(e.target.value)}
                      className="border border-[#F3C3D8] rounded-xl text-xs py-2.5 px-3 bg-white text-[#54263F] focus:outline-hidden"
                    >
                      <option value="all">すべてのステータス (All Statuses)</option>
                      <option value="pending">承認待ち (Pending Approval)</option>
                      <option value="approved">承認済み (Approved)</option>
                      <option value="rejected">却下 (Rejected)</option>
                      <option value="suspended">利用停止 (Suspended)</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-3 mt-4">
                  {filteredStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl border border-[#F3C3D8] bg-white hover:border-[#D94F91] transition-colors shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F3C3D8]/60 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-[#54263F]">{st.fullName}</span>
                            <span className="text-xs font-mono text-[#806779]">[{st.id}]</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                                st.approvalStatus === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                            >
                              {st.approvalStatus === 'approved' ? (
                                <>
                                  <Unlock className="w-3 h-3 text-emerald-600" />
                                  <span>Unlock</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-rose-600" />
                                  <span>Lock</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 text-xs text-[#806779]">
                            <span className="flex items-center">
                              <Mail className="w-3.5 h-3.5 mr-1 text-[#A83267]" />
                              {st.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3.5 h-3.5 mr-1 text-[#A83267]" />
                              {st.phoneNumber || 'Not provided'}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-[#A83267]" />
                              登録日: {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: Exam History, Lock/Unlock, Remove Student */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* 1. Exam History Option */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForHistory(st)}
                            className="inline-flex items-center px-3 py-1.5 bg-[#FFF0F6] hover:bg-[#FCE4EC] text-[#A83267] border border-[#F3C3D8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="View student's complete exam history"
                          >
                            <HistoryIcon className="w-3.5 h-3.5 mr-1" />
                            <span>Exam History</span>
                          </button>

                          {/* 2. Lock / Unlock Action */}
                          {st.email === 'sanshinnihon@gmail.com' ? (
                            <span className="text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">
                              Admin (Immune)
                            </span>
                          ) : st.approvalStatus === 'approved' ? (
                            <button
                              type="button"
                              disabled={isUpdatingStatus === st.id}
                              onClick={() => handleLockStudent(st.id, st.fullName)}
                              className="inline-flex items-center px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                              title="Lock student account (prevents exam access)"
                            >
                              <Lock className="w-3.5 h-3.5 mr-1" />
                              <span>Lock Student</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isUpdatingStatus === st.id}
                              onClick={() => handleUnlockStudent(st.id, st.fullName)}
                              className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              title="Unlock student account (grants exam access)"
                            >
                              <Unlock className="w-3.5 h-3.5 mr-1" />
                              <span>Unlock Student</span>
                            </button>
                          )}

                          {/* 3. Permanently Remove Student Option */}
                          {st.email !== 'sanshinnihon@gmail.com' && (
                            <button
                              type="button"
                              onClick={() => setStudentToDelete(st)}
                              className="inline-flex items-center px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                              title="Permanently remove student and all history"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              <span>Remove Student</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Japanese Proficiency */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="text-[11px] font-semibold text-[#806779]">
                          日本語能力・資格:
                        </span>
                        {(st.japaneseLevels || st.japaneseKnowledge || []).length > 0 ? (
                          (st.japaneseLevels || st.japaneseKnowledge || []).map((lvl) => (
                            <span
                              key={lvl}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]"
                            >
                              {lvl}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#806779] italic">未指定</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredStudents.length === 0 && (
                    <EmptyState
                      icon={Search}
                      title="No Students Matching Query"
                      description="Try clearing your search terms or selecting a different status filter."
                      badge="Roster Search"
                    />
                  )}
                </div>
              </>
            )}

            {studentAccountsView === 'requests' && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#A83267]">
                    Access Request Audit Trail (アクセス申請履歴)
                  </h3>
                  <span className="text-xs text-[#806779] font-mono">
                    Total: {accessRequests.length} requests
                  </span>
                </div>

                {accessRequests.length > 0 ? (
                  <div className="overflow-x-auto border border-[#F3C3D8] rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FFF0F6] text-[#54263F] font-semibold border-b border-[#F3C3D8]">
                        <tr>
                          <th className="p-3">Requested At</th>
                          <th className="p-3">Student Name / ID</th>
                          <th className="p-3">Reason / Details</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3C3D8]/60 bg-white">
                        {accessRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-[#FFF7FB]">
                            <td className="p-3 font-mono text-[#806779]">
                              {new Date(req.requestedAt).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-[#54263F] block">
                                {req.studentName}
                              </span>
                              <span className="font-mono text-[10px] text-[#806779]">
                                {req.studentId}
                              </span>
                            </td>
                            <td className="p-3 text-[#54263F] max-w-xs">{req.reason}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : req.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {req.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">
                              {req.status === 'pending' ? (
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(req.studentId, req.studentName)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReject(req.studentId, req.studentName)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#806779] font-mono">
                                  Reviewed: {req.reviewedBy || 'Admin'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Send}
                    title="No Access Requests Logged"
                    description="When candidates submit access or renewal requests, they will appear here for audit and administrator review."
                    badge="Requests Empty"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 3: EXAMINATION ACTIVATION & DEACTIVATION           */}
      {/* ========================================================= */}
      {activeTab === 'activation' && (
        <div className="space-y-6">
          <div className="card-rose p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#54263F]">
              Examination Activation &amp; Status Management
            </h2>
            <p className="text-xs text-[#806779] mt-0.5">
              Enable or disable live examination access across all candidate portals independently for each examination.
            </p>
          </div>

          {/* EXAM 01 CONTROLLER CARD */}
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3C3D8]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#54263F] text-amber-300">
                    EXAM #01
                  </span>
                  {isExamStatusLoadingMap[caregiverExam.id] ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        examActiveMap[caregiverExam.id]
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {examActiveMap[caregiverExam.id] ? 'Active (実施中)' : 'Inactive (停止中)'}
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#806779]">ID: {caregiverExam.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#54263F] mt-1.5">{caregiverExam.title}</h3>
                <p className="text-xs text-[#806779] mt-0.5">{caregiverExam.subject}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleExamStatus(caregiverExam.id)}
                disabled={isExamStatusLoadingMap[caregiverExam.id] || isTogglingExamMap[caregiverExam.id]}
                className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                  examActiveMap[caregiverExam.id]
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTogglingExamMap[caregiverExam.id] ? (
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Power className="w-4 h-4 mr-1.5" />
                )}
                {isTogglingExamMap[caregiverExam.id]
                  ? 'Updating Firestore...'
                  : examActiveMap[caregiverExam.id]
                  ? '試験を非アクティブ化 (Deactivate)'
                  : '試験をアクティブ化 (Activate)'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Question Count:</span>
                <span className="font-bold text-[#54263F]">45 Questions</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Allocated Duration:</span>
                <span className="font-bold text-[#54263F]">60 Minutes</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Pass Criteria:</span>
                <span className="font-bold text-emerald-700">27 / 45 Marks (60%)</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Language:</span>
                <span className="font-bold text-[#54263F]">Japanese (with Furigana)</span>
              </div>
            </div>
          </div>

          {/* EXAM 02 CONTROLLER CARD: TEST 02 (1st lesson) */}
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3C3D8]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#54263F] text-amber-300">
                    EXAM #02
                  </span>
                  {isExamStatusLoadingMap[caregiverExam02.id] ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        examActiveMap[caregiverExam02.id]
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {examActiveMap[caregiverExam02.id] ? 'Active (実施中)' : 'Inactive (停止中)'}
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#806779]">ID: {caregiverExam02.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#54263F] mt-1.5">{caregiverExam02.title}</h3>
                <p className="text-xs text-[#806779] mt-0.5">{caregiverExam02.subject}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleExamStatus(caregiverExam02.id)}
                disabled={isExamStatusLoadingMap[caregiverExam02.id] || isTogglingExamMap[caregiverExam02.id]}
                className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                  examActiveMap[caregiverExam02.id]
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTogglingExamMap[caregiverExam02.id] ? (
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Power className="w-4 h-4 mr-1.5" />
                )}
                {isTogglingExamMap[caregiverExam02.id]
                  ? 'Updating Firestore...'
                  : examActiveMap[caregiverExam02.id]
                  ? '試験を非アクティブ化 (Deactivate)'
                  : '試験をアクティブ化 (Activate)'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Question Count:</span>
                <span className="font-bold text-[#54263F]">46 Questions</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Allocated Duration:</span>
                <span className="font-bold text-[#54263F]">60 Minutes</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Pass Criteria:</span>
                <span className="font-bold text-emerald-700">40 / 46 Marks (合格基準 40問以上)</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Language:</span>
                <span className="font-bold text-[#54263F]">Japanese (with Furigana)</span>
              </div>
            </div>
          </div>

          {/* EXAM 03 CONTROLLER CARD: TEST 03 (介護総合問題) */}
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3C3D8]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#54263F] text-amber-300">
                    EXAM #03
                  </span>
                  {isExamStatusLoadingMap[caregiverExam03.id] ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                      <span>Checking...</span>
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        examActiveMap[caregiverExam03.id]
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {examActiveMap[caregiverExam03.id] ? 'Active (実施中)' : 'Inactive (停止中)'}
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#806779]">ID: {caregiverExam03.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#54263F] mt-1.5">{caregiverExam03.title}</h3>
                <p className="text-xs text-[#806779] mt-0.5">{caregiverExam03.subject}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleExamStatus(caregiverExam03.id)}
                disabled={isExamStatusLoadingMap[caregiverExam03.id] || isTogglingExamMap[caregiverExam03.id]}
                className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                  examActiveMap[caregiverExam03.id]
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTogglingExamMap[caregiverExam03.id] ? (
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Power className="w-4 h-4 mr-1.5" />
                )}
                {isTogglingExamMap[caregiverExam03.id]
                  ? 'Updating Firestore...'
                  : examActiveMap[caregiverExam03.id]
                  ? '試験を非アクティブ化 (Deactivate)'
                  : '試験をアクティブ化 (Activate)'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Question Count:</span>
                <span className="font-bold text-[#54263F]">50 Questions</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Allocated Duration:</span>
                <span className="font-bold text-[#54263F]">60 Minutes</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Pass Criteria:</span>
                <span className="font-bold text-emerald-700">30 / 50 Marks (合格基準 30問以上・60%)</span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[#806779] block text-[10px] uppercase font-bold">Language:</span>
                <span className="font-bold text-[#54263F]">Japanese (Hiragana / Katakana)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 4: EXAMINATION DATA MANAGEMENT (91 QUESTIONS TOTAL)*/}
      {/* ========================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F3C3D8] pb-5">
              <div>
                <h2 className="text-lg font-bold text-[#54263F]">
                  Examination Data Management (問題データ管理)
                </h2>
                <p className="text-xs text-[#806779] mt-0.5">
                  Inspection of official Japanese caregiver questions with verified answer keys across all examinations.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 self-start sm:self-auto">
                {selectedExamInspector === 'exam03'
                  ? '50/50 Verified Questions'
                  : selectedExamInspector === 'exam02'
                  ? '46/46 Verified Questions'
                  : '45/45 Verified Questions'}
              </span>
            </div>

            {/* Examination Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#F3C3D8] pb-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedExamInspector('exam01');
                  setSelectedSectionFilter('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExamInspector === 'exam01'
                    ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white shadow-xs'
                    : 'bg-white text-[#54263F] border border-[#F3C3D8] hover:bg-[#FFF0F6]'
                }`}
              >
                模擬試験 01 (45 Questions)
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedExamInspector('exam02');
                  setSelectedSectionFilter('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExamInspector === 'exam02'
                    ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white shadow-xs'
                    : 'bg-white text-[#54263F] border border-[#F3C3D8] hover:bg-[#FFF0F6]'
                }`}
              >
                TEST 02 (1st lesson) (46 Questions)
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedExamInspector('exam03');
                  setSelectedSectionFilter('all');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExamInspector === 'exam03'
                    ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white shadow-xs'
                    : 'bg-white text-[#54263F] border border-[#F3C3D8] hover:bg-[#FFF0F6]'
                }`}
              >
                TEST 03 (介護総合問題) (50 Questions)
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type="text"
                  placeholder="問題文またはキーワードを検索 (Search question text or number)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F3C3D8] rounded-xl text-xs text-[#54263F] placeholder-[#806779]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#806779] shrink-0" />
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="border border-[#F3C3D8] rounded-xl text-xs py-2.5 px-3 bg-white text-[#54263F] focus:outline-hidden"
                >
                  <option value="all">
                    {selectedExamInspector === 'exam03'
                      ? 'All Categories (全50問)'
                      : selectedExamInspector === 'exam02'
                      ? 'All Lessons (全46問)'
                      : 'All Lessons (全45問)'}
                  </option>
                  {selectedExamInspector === 'exam01' ? (
                    <>
                      <option value="Lesson 01: 尊厳・自立支援">Lesson 01: 尊厳・自立支援 (Q1–10)</option>
                      <option value="Lesson 02: 心身の理解">Lesson 02: 心身の理解 (Q11–17)</option>
                      <option value="Lesson 03: コミュニケーション">Lesson 03: コミュニケーション (Q18–23)</option>
                      <option value="Lesson 04: 介護技術">Lesson 04: 介護技術 (Q24–45)</option>
                    </>
                  ) : selectedExamInspector === 'exam02' ? (
                    <>
                      <option value="介護の基本">介護の基本 (13問: Q1–13)</option>
                      <option value="こころとからだのしくみ">こころとからだのしくみ (13問: Q1–13)</option>
                      <option value="生活支援技術">生活支援技術 (12問: Q1–12)</option>
                      <option value="医療的ケア・多職種連携">医療的ケア・多職種連携 (8問: Q1–8)</option>
                    </>
                  ) : (
                    <>
                      <option value="介護の基本・自立支援">介護の基本・自立支援 (13問: Q1–13)</option>
                      <option value="権利擁護・虐待防止・秘密保持">権利擁護・虐待防止・秘密保持 (8問: Q14–21)</option>
                      <option value="多職種連携・介護過程・サービス">多職種連携・介護過程・サービス (5問: Q22–26)</option>
                      <option value="安全管理・リスクマネジメント">安全管理・リスクマネジメント (8問: Q27–34)</option>
                      <option value="感染症予防・衛生管理">感染症予防・衛生管理 (8問: Q35–42)</option>
                      <option value="ボディメカニクス・介護技術">ボディメカニクス・介護技術 (8問: Q43–50)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="card-rose p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3C3D8]/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-lg bg-[#54263F] text-white flex items-center justify-center font-bold text-xs">
                      {q.lessonQuestionNumber != null ? `問${q.lessonQuestionNumber}` : `Q${q.questionNumber}`}
                    </span>
                    <span className="text-xs font-semibold text-[#A83267] bg-[#FFF0F6] px-2.5 py-0.5 rounded-full border border-[#F3C3D8]">
                      {q.section}
                    </span>
                    {q.lessonQuestionNumber != null && (
                      <span className="text-[10px] text-[#806779] font-mono">
                        (第{q.questionNumber}問 / 全46問)
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    正解 (Correct): {q.correctAnswerId}
                  </span>
                </div>

                <p className="text-xs font-medium text-[#54263F] leading-relaxed whitespace-pre-wrap">
                  {q.text}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                  {q.options.map((opt) => {
                    const isKey = q.correctAnswerId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          isKey
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium shadow-xs'
                            : 'bg-white border-[#F3C3D8] text-[#54263F]'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{opt.label}.</span>
                        <span>{opt.text}</span>
                        {isKey && (
                          <span className="block mt-1 text-[10px] font-bold text-emerald-700">
                            &check; 正解 (Answer Key)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <EmptyState
                icon={Search}
                title="No Matching Questions Found"
                description="Try adjusting your search query or lesson filter."
                badge="Search Empty"
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 5: PDF & STUDY MATERIAL MANAGEMENT                 */}
      {/* ========================================================= */}
      {activeTab === 'pdfs' && (
        <div className="space-y-6">
          <div className="card-rose p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F3C3D8] pb-5">
              <div>
                <h2 className="text-lg font-bold text-[#54263F]">PDF &amp; Study Material Management</h2>
                <p className="text-xs text-[#806779] mt-0.5">
                  Segregated document repository for official syllabus, reference manuals, and study guides.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8] self-start sm:self-auto">
                PDF Metadata Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Institutional Document Notice</p>
                <p className="mt-1 leading-relaxed text-amber-800">
                  Per strict instructions, no placeholder PDF files have been uploaded. Storage references remain segregated from examination question content and are protected against unauthorized download.
                </p>
              </div>
            </div>
          </div>

          {studyMaterials.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No Study Materials or PDFs Uploaded"
              description="The PDF metadata architecture is fully prepared with support for Title, Category, Storage Reference, Upload Date, Publication Status, and Associated Exam References."
              badge="Ready for Real Files"
            />
          ) : null}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE: CAREGIVER VOCABULARY DATASET & FLASHCARDS          */}
      {/* ========================================================= */}
      {activeTab === 'vocabulary' && (
        <VocabularySection />
      )}

      {/* ========================================================= */}
      {/* MODAL: ADMINISTRATOR PASSWORD SETUP / UPDATE              */}
      {/* ========================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#F3C3D8] shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#FFF0F6] to-white p-5 sm:p-6 border-b border-[#F3C3D8] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6589C] to-[#A83267] text-white flex items-center justify-center font-black shadow-sm">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#54263F]">
                    Administrator Password Setup
                  </h3>
                  <p className="text-xs text-[#806779]">
                    Set or update your email/password credential for sanshinnihon@gmail.com
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#FFF0F6] text-[#806779] hover:text-[#54263F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAdminPassword} className="p-5 sm:p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FFF0F6] border border-[#F3C3D8] text-xs text-[#54263F] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#A83267]">
                  <ShieldCheck className="w-4 h-4 text-[#D94F91]" />
                  <span>Verified Account: sanshinnihon@gmail.com</span>
                </div>
                <p className="text-[11px] text-[#806779]">
                  This establishes or updates the Firebase Authentication password for your existing administrator UID. The password is never stored in plaintext in Firestore.
                </p>
              </div>

              {passwordModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{passwordModalError}</span>
                </div>
              )}

              {passwordModalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{passwordModalSuccess}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#54263F]">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#A83267] font-semibold">Minimum 12 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter new administrator password"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#F3C3D8] rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#54263F] mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#F3C3D8] rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmAdminPassword && (
                  <p
                    className={`text-[11px] mt-1 font-semibold flex items-center gap-1 ${
                      newAdminPassword === confirmAdminPassword ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {newAdminPassword === confirmAdminPassword ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#F3C3D8]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-[#F3C3D8] hover:bg-[#FFF0F6] text-[#54263F] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSavingPassword ||
                    newAdminPassword.length < 12 ||
                    newAdminPassword !== confirmAdminPassword
                  }
                  className="btn-rose-primary px-5 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingPassword ? 'Saving Password...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: VIEW STUDENT COMPLETE EXAM HISTORY MODAL         */}
      {/* ========================================================= */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#F3C3D8] shadow-2xl max-w-3xl w-full p-5 sm:p-7 space-y-4 my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F3C3D8] pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E6589C] to-[#A83267] text-white flex items-center justify-center shadow-xs shrink-0">
                  <HistoryIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A83267]">
                      Student Exam History &bull; 受講生受験履歴
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        selectedStudentForHistory.approvalStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {selectedStudentForHistory.approvalStatus === 'approved' ? (
                        <>
                          <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Unlock</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5 text-rose-600" />
                          <span>Lock</span>
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#54263F] mt-0.5">
                    {selectedStudentForHistory.fullName}
                  </h3>
                  <p className="text-xs text-[#806779]">
                    {selectedStudentForHistory.email} &bull; ID: <span className="font-mono text-[#54263F] font-semibold">{selectedStudentForHistory.id}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForHistory(null)}
                className="text-[#806779] hover:text-[#54263F] p-1.5 rounded-xl hover:bg-[#FFF0F6] cursor-pointer transition-colors"
                title="Return to Student List"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info & Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[10px] uppercase font-bold text-[#A83267] block">Total Attempts</span>
                <span className="text-lg font-black text-[#54263F] mt-0.5 block">
                  {studentHistoryResults.length} attempt{studentHistoryResults.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Passed Exams</span>
                <span className="text-lg font-black text-emerald-800 mt-0.5 block">
                  {studentHistoryResults.filter((r) => r.passed).length}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Failed / Retakes</span>
                <span className="text-lg font-black text-rose-800 mt-0.5 block">
                  {studentHistoryResults.filter((r) => !r.passed).length}
                </span>
              </div>
              <div className="p-3 bg-[#FFF0F6] rounded-xl border border-[#F3C3D8]">
                <span className="text-[10px] uppercase font-bold text-[#A83267] block">Phone Contact</span>
                <span className="text-xs font-semibold text-[#54263F] truncate mt-1 block">
                  {selectedStudentForHistory.phoneNumber || 'Not available'}
                </span>
              </div>
            </div>

            {/* Filter by Exam */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0 pt-1">
              <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#806779] shrink-0" />
                <span className="font-bold text-[#54263F]">Filter by Test:</span>
                <select
                  value={studentHistoryFilter}
                  onChange={(e) => setStudentHistoryFilter(e.target.value)}
                  className="border border-[#F3C3D8] rounded-xl text-xs py-1.5 px-3 bg-white text-[#54263F] focus:outline-hidden"
                >
                  <option value="all">All Examinations ({studentHistoryResults.length})</option>
                  <option value={caregiverExam.id}>TEST 01 (模擬試験 01)</option>
                  <option value={caregiverExam02.id}>TEST 02 (1st lesson)</option>
                  <option value={caregiverExam03.id}>TEST 03 (介護総合問題)</option>
                </select>
              </div>

              <span className="text-[11px] text-[#806779] font-mono">
                Sorted: Chronological (Newest First)
              </span>
            </div>

            {/* Exam Attempts List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {isHistoryLoading ? (
                <div className="p-8 text-center text-xs text-[#806779] space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#D94F91]" />
                  <p>Loading real-time exam records from Cloud Firestore...</p>
                </div>
              ) : (
                (() => {
                  const filteredResults = studentHistoryResults.filter((r) =>
                    studentHistoryFilter === 'all' ? true : r.examId === studentHistoryFilter
                  );

                  if (filteredResults.length === 0) {
                    return (
                      <div className="p-8 text-center bg-[#FFF0F6]/40 rounded-2xl border border-dashed border-[#F3C3D8] space-y-2">
                        <Award className="w-8 h-8 text-[#D94F91] mx-auto opacity-60" />
                        <h4 className="text-sm font-bold text-[#54263F]">No Examination Records Found</h4>
                        <p className="text-xs text-[#806779]">
                          {studentHistoryFilter === 'all'
                            ? 'This student has not submitted any exam attempts yet.'
                            : 'No attempts recorded for the selected examination filter.'}
                        </p>
                      </div>
                    );
                  }

                  return filteredResults.map((r, idx) => {
                    const testTitle =
                      r.examTitle ||
                      (r.examId === caregiverExam03.id
                        ? 'TEST 03 (介護総合問題)'
                        : r.examId === caregiverExam02.id
                        ? 'TEST 02 (1st lesson)'
                        : 'TEST 01 (模擬試験 01)');

                    const formattedDate = r.submittedAt
                      ? new Date(r.submittedAt).toLocaleString()
                      : 'Not available';

                    const durationText =
                      r.timeElapsedSeconds != null && r.timeElapsedSeconds > 0
                        ? `${Math.floor(r.timeElapsedSeconds / 60)} min ${r.timeElapsedSeconds % 60} sec`
                        : 'Not available';

                    return (
                      <div
                        key={r.id || idx}
                        className="p-4 rounded-2xl bg-white border border-[#F3C3D8] hover:border-[#D94F91] transition-all shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3C3D8]/50 pb-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-[#54263F]">{testTitle}</span>
                              <span className="text-[10px] font-mono text-[#806779]">
                                [Attempt #{filteredResults.length - idx}]
                              </span>
                            </div>
                            <p className="text-[11px] text-[#806779] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#A83267]" />
                              <span>Submitted: {formattedDate}</span>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-black border ${
                                r.passed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {r.passed ? '合格 (PASS)' : '不合格 (FAIL)'}
                            </span>
                          </div>
                        </div>

                        {/* Result KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 bg-[#FFF0F6]/60 rounded-xl border border-[#F3C3D8]/60">
                            <span className="text-[10px] text-[#806779] block">Score</span>
                            <span className="font-bold text-sm text-[#54263F] mt-0.5 block">
                              {r.score != null ? `${r.score} / ${r.totalMarks ?? 45}` : 'Not available'}
                            </span>
                          </div>

                          <div className="p-2.5 bg-[#FFF0F6]/60 rounded-xl border border-[#F3C3D8]/60">
                            <span className="text-[10px] text-[#806779] block">Percentage</span>
                            <span className="font-bold text-sm text-[#A83267] mt-0.5 block">
                              {r.percentage != null ? `${Number(r.percentage).toFixed(2)}%` : 'Not available'}
                            </span>
                          </div>

                          <div className="p-2.5 bg-[#FFF0F6]/60 rounded-xl border border-[#F3C3D8]/60">
                            <span className="text-[10px] text-[#806779] block">Duration</span>
                            <span className="font-semibold text-xs text-[#54263F] mt-0.5 block">
                              {durationText}
                            </span>
                          </div>

                          <div className="p-2.5 bg-[#FFF0F6]/60 rounded-xl border border-[#F3C3D8]/60">
                            <span className="text-[10px] text-[#806779] block">Performance Level</span>
                            <span className="font-semibold text-xs text-[#54263F] truncate mt-0.5 block">
                              {r.performanceLevel != null ? r.performanceLevel : 'Not available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F3C3D8] shrink-0">
              <span className="text-[11px] text-[#806779]">
                Showing live student results from <span className="font-mono">/examResults</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#D94F91] to-[#A83267] hover:from-[#C2185B] hover:to-[#880E4F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Return to Student List (受講生一覧に戻る)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PERMANENTLY REMOVE STUDENT CONFIRMATION MODAL    */}
      {/* ========================================================= */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 block">
                  Permanent Removal &bull; アカウント完全削除
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Permanently Remove Student
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to permanently delete this student account and all their records?
                </p>
              </div>
            </div>

            {/* Student Details Card */}
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Student Name (氏名):</span>
                <span className="font-bold text-slate-900 text-sm">{studentToDelete.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-mono font-semibold text-rose-800">{studentToDelete.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Student ID:</span>
                <span className="font-mono text-slate-700">{studentToDelete.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold uppercase text-slate-800">
                  {studentToDelete.approvalStatus === 'approved' ? 'Unlock' : 'Lock'}
                </span>
              </div>
            </div>

            {/* Irreversible Warning & Auth Notice */}
            <div className="space-y-2 text-xs text-rose-950 bg-amber-50/80 p-3.5 rounded-xl border border-amber-300">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-900">
                    Warning: This action is permanent and cannot be undone.
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    All student-specific Firestore records—including profile, past examination history, scores, and access requests—will be permanently wiped from the Cloud Firestore database.
                  </p>
                  <p className="text-[10px] text-slate-600 pt-1 border-t border-amber-200 leading-normal">
                    <strong>Firebase Authentication Notice:</strong> Client-side SDK cannot delete another user's Firebase Auth authentication record without Firebase Admin SDK / Cloud Function. However, deleting this student permanently revokes all access permissions and clears all database records.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeletingStudent}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel (キャンセル)
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={isDeletingStudent}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingStudent ? 'Deleting Student...' : 'Permanently Delete (完全削除)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
