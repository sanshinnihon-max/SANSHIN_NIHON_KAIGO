/**
 * Firebase Authentication and Firestore Service
 * SANSHIN NIHON Secure Examination System
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
  confirmPasswordReset,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { StudentProfile, AccessRequestRecord, JapaneseLanguageLevel, ApprovalStatus, ExamResult } from '../types/exam';
import { studentStore } from '../data/studentStore';

export interface RegisterStudentInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  japaneseLevels?: JapaneseLanguageLevel[];
  password: string;
}

export class FirebaseAuthService {
  /**
   * Register a new student:
   * 1. Creates Firebase Auth user (with encrypted credentials).
   * 2. Sets persistent Firestore profile at `students/{uid}` with initial status 'pending'.
   */
  public async registerStudent(input: RegisterStudentInput): Promise<{
    user: User;
    profile: StudentProfile;
  }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedPhone = input.phoneNumber.trim();
    const normalizedName = input.fullName.trim();
    const levels = input.japaneseLevels || [];

    // 1. Firebase Auth user creation
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      input.password
    );
    const user = userCredential.user;
    const nowIso = new Date().toISOString();

    const initialProfile: StudentProfile = {
      id: user.uid,
      uid: user.uid,
      fullName: normalizedName,
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      japaneseLevels: levels,
      japaneseKnowledge: levels,
      approvalStatus: 'pending', // CRITICAL: Always starts as 'pending'
      role: 'student',
      status: 'pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const firestoreProfile = {
      uid: user.uid,
      fullName: normalizedName,
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      japaneseLevels: levels,
      role: 'student' as const,
      status: 'pending' as const,
      approvalStatus: 'pending' as const,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const studentDocPath = `students/${user.uid}`;
    try {
      await setDoc(doc(db, 'students', user.uid), firestoreProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, studentDocPath);
    }

    // 3. Create initial access request
    try {
      const initialRequestId = `req_${Date.now()}`;
      await setDoc(doc(db, 'accessRequests', initialRequestId), {
        id: initialRequestId,
        studentId: user.uid,
        studentName: normalizedName,
        requestedAt: nowIso,
        status: 'pending',
        reason: 'New student registration access review',
      });
    } catch {
      // Non-blocking log
    }

    return { user, profile: initialProfile };
  }

  /**
   * Sign in returning student or administrator with Email and Password
   */
  public async loginStudent(
    email: string,
    password: string
  ): Promise<{ user: User; profile: StudentProfile | null }> {
    const normalizedEmail = email.trim().toLowerCase();
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = userCredential.user;

    // Check if authenticating user is institutional administrator
    if (normalizedEmail === 'sanshinnihon@gmail.com') {
      await this.verifyAdminRole(user);
      return { user, profile: null };
    }

    const studentDocPath = `students/${user.uid}`;
    try {
      const snap = await getDoc(doc(db, 'students', user.uid));
      if (snap.exists()) {
        const profile = snap.data() as StudentProfile;
        return { user, profile };
      }
      return { user, profile: null };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, studentDocPath);
    }
  }

  /**
   * Sign in with Google (OAuth)
   * Provisioned with Firebase, supports 1-click candidate & admin login
   */
  public async loginWithGoogle(): Promise<{ user: User; profile: StudentProfile | null }> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const nowIso = new Date().toISOString();
    const isInstitutionalAdmin = user.email?.trim().toLowerCase() === 'sanshinnihon@gmail.com';

    // Administrator Login Flow: Verify admin authority via Cloud Firestore backend
    if (isInstitutionalAdmin) {
      await this.verifyAdminRole(user);
      return { user, profile: null };
    }

    const studentDocPath = `students/${user.uid}`;
    try {
      const snap = await getDoc(doc(db, 'students', user.uid));
      if (snap.exists()) {
        const profile = snap.data() as StudentProfile;
        return { user, profile: { ...profile, id: user.uid, uid: user.uid } };
      }

      // Initial Firestore student document conforming to firestore.rules
      const initialProfile = {
        uid: user.uid,
        fullName: user.displayName || user.email?.split('@')[0] || 'Candidate',
        email: user.email?.trim().toLowerCase() || '',
        phoneNumber: user.phoneNumber || '',
        japaneseLevels: ['Beginner'] as JapaneseLanguageLevel[],
        approvalStatus: 'pending' as const,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await setDoc(doc(db, 'students', user.uid), initialProfile);

      return {
        user,
        profile: {
          ...initialProfile,
          id: user.uid,
          japaneseKnowledge: initialProfile.japaneseLevels,
          role: 'student',
        },
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, studentDocPath);
    }
  }

  /**
   * Send official password reset email
   */
  public async sendPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, normalizedEmail);
  }

  /**
   * Sign out current user
   */
  public async logout(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Real-time subscription to authenticated state and Firestore student profile
   */
  public subscribeToAuthState(
    callback: (user: User | null, profile: StudentProfile | null, loading: boolean) => void
  ): () => void {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (!user) {
        callback(null, null, false);
        return;
      }

      // 1. Check if authenticated user is the institutional administrator
      if (user.email?.trim().toLowerCase() === 'sanshinnihon@gmail.com') {
        const verifyRes = await this.verifyAdminRole(user);
        if (verifyRes.isAdmin) {
          callback(
            user,
            {
              id: user.uid,
              uid: user.uid,
              fullName: user.displayName || 'SANSHIN NIHON Institutional Admin',
              email: 'sanshinnihon@gmail.com',
              phoneNumber: user.phoneNumber || '+81-90-0000-0000',
              japaneseLevels: ['Fluent' as JapaneseLanguageLevel],
              japaneseKnowledge: ['Fluent' as JapaneseLanguageLevel],
              approvalStatus: 'approved',
              role: 'administrator',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            false
          );
          return;
        }
      }

      // 2. Regular candidate profile subscription
      const studentDocPath = `students/${user.uid}`;
      unsubscribeDoc = onSnapshot(
        doc(db, 'students', user.uid),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as StudentProfile;
            callback(user, { ...data, id: user.uid, uid: user.uid }, false);
          } else {
            callback(user, null, false);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, studentDocPath);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }

  /**
   * Submit an access request
   */
  public async requestAccess(uid: string, studentName: string, reason?: string): Promise<boolean> {
    if (!auth.currentUser) {
      console.warn('Cannot persist access request to Firestore: User is not authenticated in Firebase.');
      return false;
    }

    const reqId = `req_${Date.now()}`;
    const path = `accessRequests/${reqId}`;
    try {
      await setDoc(doc(db, 'accessRequests', reqId), {
        id: reqId,
        studentId: auth.currentUser.uid,
        studentName: studentName || auth.currentUser.displayName || 'Candidate',
        requestedAt: new Date().toISOString(),
        status: 'pending' as const,
        reason: reason || 'Access renewal request by candidate',
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  /**
   * Admin: Real-time subscription to all student profiles
   */
  public subscribeToAllStudents(
    callback: (students: StudentProfile[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const path = 'students';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list: StudentProfile[] = [];
        snap.forEach((d) => {
          const data = d.data() as StudentProfile;
          const status = (data.approvalStatus || data.status || 'pending') as ApprovalStatus;
          list.push({ ...data, id: d.id, uid: d.id, status, approvalStatus: status });
        });
        callback(list);
      },
      (error) => {
        if (onError) onError(error);
        else handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  /**
   * Admin: Real-time subscription to access requests
   */
  public subscribeToAccessRequests(
    callback: (requests: AccessRequestRecord[]) => void,
    onError?: (err: unknown) => void
  ): () => void {
    const path = 'accessRequests';
    return onSnapshot(
      collection(db, path),
      (snap) => {
        const list: AccessRequestRecord[] = [];
        snap.forEach((d) => {
          list.push(d.data() as AccessRequestRecord);
        });
        list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        callback(list);
      },
      (error) => {
        if (onError) onError(error);
        else handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  }

  /**
   * Admin: Approve, Reject, or Suspend student
   */
  public async updateStudentStatus(
    uid: string,
    approvalStatus: ApprovalStatus
  ): Promise<void> {
    const studentRef = doc(db, 'students', uid);
    const nowIso = new Date().toISOString();

    try {
      const snap = await getDoc(studentRef);
      if (snap.exists()) {
        await updateDoc(studentRef, {
          status: approvalStatus,
          approvalStatus,
          updatedAt: nowIso,
        });
      } else {
        // Document does not exist in Firestore yet (e.g. initial demo/test candidate)
        const local = studentStore.getStudentById(uid);
        if (local) {
          await setDoc(studentRef, {
            uid: local.uid || local.id,
            fullName: local.fullName,
            email: local.email,
            phoneNumber: local.phoneNumber,
            role: 'student',
            status: approvalStatus,
            approvalStatus,
            japaneseLevels: local.japaneseLevels || local.japaneseKnowledge || ['Beginner'],
            createdAt: local.createdAt || nowIso,
            updatedAt: nowIso,
          });
        }
      }
    } catch (err) {
      console.warn(`Firestore update student notice for ${uid}:`, err);
    }
  }

  /**
   * Admin: Review Access Request
   */
  public async reviewAccessRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    adminName: string = 'SANSHIN NIHON Admin'
  ): Promise<void> {
    const reqRef = doc(db, 'accessRequests', requestId);
    const nowIso = new Date().toISOString();

    try {
      const snap = await getDoc(reqRef);
      if (snap.exists()) {
        await updateDoc(reqRef, {
          status,
          reviewedAt: nowIso,
          reviewedBy: adminName,
        });
      } else {
        const allRequests = studentStore.getAllAccessRequests();
        const localReq = allRequests.find((r) => r.id === requestId);
        if (localReq) {
          await setDoc(reqRef, {
            id: localReq.id,
            studentId: localReq.studentId,
            studentName: localReq.studentName,
            requestedAt: localReq.requestedAt || nowIso,
            status,
            reason: localReq.reason || 'Access Request',
            reviewedAt: nowIso,
            reviewedBy: adminName,
          });
        }
      }
    } catch (err) {
      console.warn(`Firestore review access request notice for ${requestId}:`, err);
    }
  }

  /**
   * Verify administrator authorization using trusted backend security checks.
   * Enforces that only verified 'sanshinnihon@gmail.com' or documents in /admins are authorized.
   */
  public async verifyAdminRole(user: User | null): Promise<{ isAdmin: boolean; error?: string }> {
    if (!user) {
      return { isAdmin: false };
    }

    const tokenEmail = user.email?.trim().toLowerCase();
    if (tokenEmail !== 'sanshinnihon@gmail.com') {
      return { isAdmin: false };
    }

    // Attempt backend sync with /admins collection, protected by firestore.rules:
    // match /admins/{adminId} { allow read: if isSignedIn(); allow write: if isAdmin(); }
    try {
      const nowIso = new Date().toISOString();
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          uid: user.uid,
          email: tokenEmail,
          role: 'administrator',
          verifiedAt: nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
      return { isAdmin: true };
    } catch (err) {
      console.error('Backend administrative verification rejected by Firestore rules:', err);
      return {
        isAdmin: false,
        error: 'Backend security rules rejected administrative access. Administrator credentials could not be verified by Cloud Firestore.',
      };
    }
  }

  /**
   * Update student contact phone number (required for Google sign-in profile completion)
   */
  public async updateStudentPhone(uid: string, phoneNumber: string): Promise<void> {
    const trimmed = phoneNumber.trim();
    const nowIso = new Date().toISOString();
    await updateDoc(doc(db, 'students', uid), {
      phoneNumber: trimmed,
      updatedAt: nowIso,
    });
  }

  /**
   * Real-time subscription to authoritative exam active/inactive status from Firestore.
   * STRICT SAFETY INVARIANT: An exam is strictly INACTIVE (false) unless explicitly
   * saved as isActive === true by an authorized administrator in Firestore.
   * Missing, undefined, invalid, or errored states ALWAYS fail safely to false.
   */
  public subscribeToExamStatus(
    examId: string,
    callback: (isActive: boolean) => void,
    onError?: (err: unknown) => void
  ): () => void {
    return onSnapshot(
      doc(db, 'examSettings', examId),
      (snap) => {
        if (snap.exists()) {
          // Strictly require explicit boolean true; undefined, null, or any other value evaluates to false
          const isExplicitlyActive = snap.data()?.isActive === true;
          callback(isExplicitlyActive);
        } else {
          // If document does not exist, exam is strictly INACTIVE
          callback(false);
        }
      },
      (err) => {
        console.warn(`Firestore exam status listener notice for ${examId}:`, err);
        // Fail safely to false on any error or disconnection
        callback(false);
        if (onError) onError(err);
      }
    );
  }

  /**
   * Single-shot authoritative verification of exam active status from Firestore.
   * Fails safely to false if not found or on error.
   */
  public async getExamStatus(examId: string): Promise<boolean> {
    try {
      const snap = await getDoc(doc(db, 'examSettings', examId));
      if (snap.exists()) {
        return snap.data()?.isActive === true;
      }
      return false;
    } catch (err) {
      console.warn(`Error getting exam status for ${examId}:`, err);
      return false;
    }
  }

  /**
   * Administrator: Toggle examination Active / Inactive status in backend
   */
  public async setExamStatus(examId: string, isActive: boolean): Promise<void> {
    const nowIso = new Date().toISOString();
    await setDoc(
      doc(db, 'examSettings', examId),
      {
        id: examId,
        isActive,
        updatedAt: nowIso,
        updatedBy: auth.currentUser?.email || 'admin',
      },
      { merge: true }
    );
  }

  /**
   * Securely verify administrator identity via Google Sign-In popup
   * strictly for sanshinnihon@gmail.com to permit setting/linking an email/password credential.
   */
  public async verifyAdminIdentityForPasswordSetup(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const email = user.email?.trim().toLowerCase();
    if (email !== 'sanshinnihon@gmail.com') {
      await signOut(auth);
      throw new Error(
        `Unauthorized: Authentication as "${email}" cannot configure administrator credentials. Only sanshinnihon@gmail.com is authorized.`
      );
    }

    return user;
  }

  /**
   * Establish or update email/password credential on existing administrator account.
   * Preserves the existing Firebase UID, links Email/Password in Firebase Auth,
   * and verifies backend /admins Firestore document.
   * Plaintext password is NEVER stored in Firestore or frontend code.
   */
  public async setAdminPassword(
    adminUser: User,
    newPassword: string
  ): Promise<{ success: boolean; uid: string }> {
    const email = adminUser.email?.trim().toLowerCase();
    if (email !== 'sanshinnihon@gmail.com') {
      throw new Error('Unauthorized: Password setup is strictly restricted to sanshinnihon@gmail.com.');
    }

    if (!newPassword || newPassword.length < 12) {
      throw new Error('Password must be at least 12 characters long and meet complexity requirements.');
    }

    const credential = EmailAuthProvider.credential('sanshinnihon@gmail.com', newPassword);

    try {
      // 1. Attempt to link the Email/Password credential to the existing Google user account
      await linkWithCredential(adminUser, credential);
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      const code = authErr?.code || '';
      const msg = authErr?.message || '';

      if (code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-in is currently disabled in your Firebase console. Please ensure Email/Password is enabled under Authentication > Sign-in method in Firebase Console.'
        );
      }

      // If email/password credential is already linked to this account, update password
      if (
        code === 'auth/provider-already-linked' ||
        code === 'auth/credential-already-in-use' ||
        code === 'auth/email-already-in-use' ||
        msg.includes('already linked') ||
        msg.includes('already in use')
      ) {
        await updatePassword(adminUser, newPassword);
      } else {
        throw err;
      }
    }

    // 2. Synchronize /admins/{uid} in Firestore to confirm backend authorization
    await this.verifyAdminRole(adminUser);

    return { success: true, uid: adminUser.uid };
  }

  /**
   * Confirm password reset code if administrator uses email password reset link
   */
  public async confirmAdminPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 12) {
      throw new Error('Password must be at least 12 characters long.');
    }
    await confirmPasswordReset(auth, oobCode, newPassword);
  }

  /**
   * Save an authoritative exam result in Firestore under /examResults/{result.id}
   * and update student's profile statistics. Also caches locally for fallback.
   */
  public async saveExamResult(result: ExamResult): Promise<void> {
    const studentId = result.studentId;
    // 1. Local backup cache per student UID
    try {
      const cacheKey = `sanshin_results_${studentId}`;
      const existingStr = localStorage.getItem(cacheKey);
      const existing: ExamResult[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [result, ...existing.filter((r) => r.id !== result.id)];
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch {
      // LocalStorage quota or unavailable, continue
    }

    // 2. Persist to Firestore
    try {
      await setDoc(doc(db, 'examResults', result.id), {
        ...result,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore examResults save notice (saved to local backup):', err);
    }

    // 3. Update completedExamsCount in students/{studentId} if permitted
    try {
      const studentDocRef = doc(db, 'students', studentId);
      const snap = await getDoc(studentDocRef);
      if (snap.exists()) {
        const count = (snap.data().completedExamsCount || 0) + 1;
        await updateDoc(studentDocRef, {
          completedExamsCount: count,
          lastExamScore: result.percentage,
          lastExamDate: result.submittedAt,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Non-blocking update
    }
  }

  /**
   * Subscribe to real-time exam results for an authenticated student
   */
  public subscribeToStudentExamResults(
    studentId: string,
    callback: (results: ExamResult[]) => void
  ): () => void {
    const getLocalCache = (): ExamResult[] => {
      try {
        const cacheKey = `sanshin_results_${studentId}`;
        const str = localStorage.getItem(cacheKey);
        return str ? JSON.parse(str) : [];
      } catch {
        return [];
      }
    };

    // Emit local cache immediately for zero latency
    const initialLocal = getLocalCache();
    if (initialLocal.length > 0) {
      callback(initialLocal);
    }

    try {
      const q = query(collection(db, 'examResults'), where('studentId', '==', studentId));
      return onSnapshot(
        q,
        (snapshot) => {
          const remoteResults: ExamResult[] = [];
          snapshot.forEach((d) => {
            remoteResults.push(d.data() as ExamResult);
          });

          // Merge remote and local cache (prefer remote if duplicate)
          const localList = getLocalCache();
          const combinedMap = new Map<string, ExamResult>();
          localList.forEach((r) => combinedMap.set(r.id, r));
          remoteResults.forEach((r) => combinedMap.set(r.id, r));

          const merged = Array.from(combinedMap.values()).sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );

          // Update local cache
          try {
            localStorage.setItem(`sanshin_results_${studentId}`, JSON.stringify(merged));
          } catch {
            // ignore
          }

          callback(merged);
        },
        (err) => {
          console.warn('Firestore examResults listener notice:', err);
          callback(getLocalCache());
        }
      );
    } catch (err) {
      console.warn('Could not set up Firestore query for exam results, using local cache:', err);
      callback(initialLocal);
      return () => {};
    }
  }

  /**
   * Subscribe to all exam results across all students (for administrator analytics & activity metrics)
   */
  public subscribeToAllExamResults(
    callback: (results: ExamResult[]) => void
  ): () => void {
    try {
      return onSnapshot(
        collection(db, 'examResults'),
        (snapshot) => {
          const list: ExamResult[] = [];
          snapshot.forEach((d) => list.push(d.data() as ExamResult));
          callback(list);
        },
        (err) => {
          console.warn('subscribeToAllExamResults listener error:', err);
          callback([]);
        }
      );
    } catch (err) {
      console.warn('Could not subscribe to all exam results:', err);
      callback([]);
      return () => {};
    }
  }

  /**
   * Administrator: Permanently delete a student and their associated exam results & access requests from Firestore
   */
  public async deleteStudent(
    studentId: string
  ): Promise<{ success: boolean; authNote: string }> {
    // 1. Delete student doc from Firestore /students/{studentId}
    const studentDocRef = doc(db, 'students', studentId);
    try {
      await deleteDoc(studentDocRef);
    } catch (err) {
      console.warn('Error deleting student profile doc:', err);
    }

    // 2. Delete all exam results belonging to this student in Firestore /examResults
    try {
      const qResults = query(collection(db, 'examResults'), where('studentId', '==', studentId));
      const resultsSnap = await getDocs(qResults);
      if (!resultsSnap.empty) {
        const batch = writeBatch(db);
        resultsSnap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.warn('Error deleting student exam results:', err);
    }

    // 3. Delete access requests for this student in Firestore /accessRequests
    try {
      const qRequests = query(collection(db, 'accessRequests'), where('studentId', '==', studentId));
      const requestsSnap = await getDocs(qRequests);
      if (!requestsSnap.empty) {
        const batch = writeBatch(db);
        requestsSnap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.warn('Error deleting student access requests:', err);
    }

    // 4. Clean local storage cache and studentStore
    try {
      localStorage.removeItem(`sanshin_results_${studentId}`);
    } catch {
      // ignore
    }
    try {
      studentStore.deleteStudent(studentId);
    } catch {
      // ignore
    }

    return {
      success: true,
      authNote:
        'Student profile, examination history, and access records permanently deleted from Cloud Firestore.',
    };
  }
}

/**
 * Validate candidate phone number
 */
export function isPhoneValid(phone?: string | null): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (trimmed === '' || trimmed === '+81-00-0000-0000' || trimmed === 'None' || trimmed.length < 7) {
    return false;
  }
  return /^[0-9+\s\-()]{7,25}$/.test(trimmed);
}

export const firebaseAuthService = new FirebaseAuthService();
