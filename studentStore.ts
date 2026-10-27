/**
 * SANSHIN NIHON Student Account & Access Store
 * 
 * Note on Architecture & Persistence:
 * Enterprise production requires Firebase Firestore / Cloud SQL backend provisioning.
 * This reactive store manages in-memory student credentials, registration integrity,
 * approval states, and access audit requests with session synchronization.
 */

import { StudentProfile, AccessRequestRecord, JapaneseLanguageLevel, ApprovalStatus } from '../types/exam';

const STORAGE_KEY = 'sanshin_nihon_student_store_v1';
const SESSION_KEY = 'sanshin_nihon_current_student_id_v1';

const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'SN-STD-2026-001',
    fullName: '田中 健太 (Kenta Tanaka)',
    email: 'kenta.tanaka@example.com',
    phoneNumber: '+81-90-1234-5678',
    japaneseKnowledge: ['JLPT N3', 'JFT-Basic'],
    registrationNumber: 'SN-REG-001',
    approvalStatus: 'approved',
    role: 'student',
    password: 'Password123!',
    createdAt: '2026-10-15T09:00:00Z',
    lastLoginAt: '2026-10-19T20:00:00Z',
    enrolledExamsCount: 1,
    completedExamsCount: 0,
    accessRequests: [],
  },
  {
    id: 'SN-STD-2026-002',
    fullName: 'サマン ペレラ (Saman Perera)',
    email: 'saman.perera@example.lk',
    phoneNumber: '+94-77-123-4567',
    japaneseKnowledge: ['JLPT N4', 'Beginner'],
    registrationNumber: 'SN-REG-002',
    approvalStatus: 'pending',
    role: 'student',
    password: 'Password123!',
    createdAt: '2026-10-19T14:30:00Z',
    lastLoginAt: '2026-10-19T14:30:00Z',
    enrolledExamsCount: 1,
    completedExamsCount: 0,
    accessRequests: [
      {
        id: 'req_001',
        studentId: 'SN-STD-2026-002',
        studentName: 'サマン ペレラ (Saman Perera)',
        requestedAt: '2026-10-19T14:30:00Z',
        status: 'pending',
        reason: '介護実習試験受講のための新規登録承認申請 (New registration access approval request)',
      },
    ],
  },
];

class StudentStore {
  private students: StudentProfile[] = [];
  private currentStudentId: string | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.students = JSON.parse(stored);
      } else {
        this.students = [...INITIAL_STUDENTS];
        this.saveState();
      }

      const currentId = sessionStorage.getItem(SESSION_KEY);
      if (currentId && this.students.some((s) => s.id === currentId)) {
        this.currentStudentId = currentId;
      } else {
        this.currentStudentId = null;
      }
    } catch {
      this.students = [...INITIAL_STUDENTS];
      this.currentStudentId = null;
    }
  }

  private saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
      if (this.currentStudentId) {
        sessionStorage.setItem(SESSION_KEY, this.currentStudentId);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore storage write issues
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((listener) => listener());
  }

  public getStudents(): StudentProfile[] {
    return [...this.students];
  }

  public getCurrentStudent(): StudentProfile | null {
    if (!this.currentStudentId) return null;
    return this.students.find((s) => s.id === this.currentStudentId) || null;
  }

  public getStudentById(id: string): StudentProfile | null {
    return this.students.find((s) => s.id === id || s.uid === id) || null;
  }

  public getAllAccessRequests(): AccessRequestRecord[] {
    const list: AccessRequestRecord[] = [];
    this.students.forEach((s) => {
      if (s.accessRequests) {
        list.push(...s.accessRequests);
      }
    });
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  /**
   * Register a new student.
   * Enforces:
   * - No duplicate email or phone number
   * - Strict initial status: 'pending' (Pending Approval)
   * - Mandatory access request created
   */
  public registerStudent(data: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password?: string;
    japaneseKnowledge: JapaneseLanguageLevel[];
  }): { success: boolean; error?: string; student?: StudentProfile } {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPhone = data.phoneNumber.trim();

    // Check duplicates
    const existingEmail = this.students.find(
      (s) => s.email.trim().toLowerCase() === normalizedEmail
    );
    if (existingEmail) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    const existingPhone = this.students.find(
      (s) => s.phoneNumber.trim() === normalizedPhone
    );
    if (existingPhone) {
      return {
        success: false,
        error: 'An account with this phone number already exists. Please log in instead.',
      };
    }

    const newId = `SN-STD-2026-${String(this.students.length + 1).padStart(3, '0')}`;
    const newRegNumber = `SN-REG-${String(this.students.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const initialRequest: AccessRequestRecord = {
      id: `req_${Date.now()}`,
      studentId: newId,
      studentName: data.fullName.trim(),
      requestedAt: nowIso,
      status: 'pending',
      reason: '新規受講生登録に伴う初期アクセス承認申請 (Initial enrollment approval request)',
    };

    const newStudent: StudentProfile = {
      id: newId,
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      password: data.password || 'Sanshin2026!',
      japaneseKnowledge: data.japaneseKnowledge,
      registrationNumber: newRegNumber,
      approvalStatus: 'pending', // CRITICAL: Always starts as 'pending'
      role: 'student',
      createdAt: nowIso,
      lastLoginAt: nowIso,
      enrolledExamsCount: 1,
      completedExamsCount: 0,
      accessRequests: [initialRequest],
    };

    this.students.push(newStudent);
    this.currentStudentId = newId;
    this.notify();

    return { success: true, student: newStudent };
  }

  /**
   * Authenticate student with email and password
   */
  public loginStudent(
    email: string,
    password?: string
  ): { success: boolean; error?: string; student?: StudentProfile } {
    const normalizedEmail = email.trim().toLowerCase();
    const student = this.students.find(
      (s) => s.email.trim().toLowerCase() === normalizedEmail
    );

    if (!student) {
      return {
        success: false,
        error: 'No account found matching this email address. Please register first.',
      };
    }

    if (password && student.password && student.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials or reset your password.',
      };
    }

    student.lastLoginAt = new Date().toISOString();
    this.currentStudentId = student.id;
    this.notify();

    return { success: true, student };
  }

  public logoutStudent() {
    this.currentStudentId = null;
    this.notify();
  }

  public switchActiveStudent(studentId: string) {
    if (this.students.some((s) => s.id === studentId)) {
      this.currentStudentId = studentId;
      this.notify();
    }
  }

  /**
   * Submit an access request
   */
  public submitAccessRequest(studentId: string, reason?: string): boolean {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return false;

    const newReq: AccessRequestRecord = {
      id: `req_${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      reason: reason || '受講・試験アクセスの再申請 (Access reactivation request)',
    };

    student.accessRequests = [newReq, ...(student.accessRequests || [])];
    this.notify();
    return true;
  }

  /**
   * Admin: Approve student account
   */
  public approveStudent(studentId: string, adminName: string = 'Authorized Admin'): boolean {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return false;

    student.approvalStatus = 'approved';
    const nowIso = new Date().toISOString();
    if (student.accessRequests) {
      student.accessRequests.forEach((req) => {
        if (req.status === 'pending') {
          req.status = 'approved';
          req.reviewedAt = nowIso;
          req.reviewedBy = adminName;
        }
      });
    }

    this.notify();
    return true;
  }

  /**
   * Admin: Reject student account
   */
  public rejectStudent(studentId: string, adminName: string = 'Authorized Admin'): boolean {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return false;

    student.approvalStatus = 'rejected';
    const nowIso = new Date().toISOString();
    if (student.accessRequests) {
      student.accessRequests.forEach((req) => {
        if (req.status === 'pending') {
          req.status = 'rejected';
          req.reviewedAt = nowIso;
          req.reviewedBy = adminName;
        }
      });
    }

    this.notify();
    return true;
  }

  /**
   * Admin: Suspend student account
   */
  public suspendStudent(studentId: string): boolean {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return false;

    student.approvalStatus = 'suspended';
    this.notify();
    return true;
  }

  /**
   * Admin: Restore student account to approved
   */
  public restoreStudent(studentId: string): boolean {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return false;

    student.approvalStatus = 'approved';
    this.notify();
    return true;
  }

  /**
   * Admin: Permanently delete student account
   */
  public deleteStudent(studentId: string): boolean {
    const initialLen = this.students.length;
    this.students = this.students.filter((s) => s.id !== studentId && s.uid !== studentId);
    if (this.currentStudentId === studentId) {
      this.currentStudentId = null;
    }
    this.saveState();
    this.notify();
    return this.students.length < initialLen;
  }
}

export const studentStore = new StudentStore();
