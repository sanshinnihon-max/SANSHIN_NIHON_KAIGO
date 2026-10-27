import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firebaseAuthService } from '../services/firebaseAuthService';

interface StudentAuthProps {
  onAuthSuccess?: () => void;
  defaultMode?: 'landing' | 'login' | 'register' | 'admin-setup';
  onSelectRole?: (role: 'student' | 'administrator') => void;
}

export const StudentAuth: React.FC<StudentAuthProps> = ({
  onAuthSuccess,
  defaultMode = 'landing',
  onSelectRole,
}) => {
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register' | 'admin-setup'>(defaultMode);

  // Registration Form State (Strictly 5 required fields in exact order)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showStudentConfirmPassword, setShowStudentConfirmPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Administrator Password Setup State
  const [adminSetupStep, setAdminSetupStep] = useState<'verify' | 'set-password' | 'success'>('verify');
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
  const [verifiedAdminUser, setVerifiedAdminUser] = useState<FirebaseUser | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [isSendingEmailLink, setIsSendingEmailLink] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [manualResetCode, setManualResetCode] = useState('');

  // Auto-detect existing active administrator session
  useEffect(() => {
    if (authMode === 'admin-setup') {
      const current = auth.currentUser;
      if (current && current.email?.trim().toLowerCase() === 'sanshinnihon@gmail.com') {
        setVerifiedAdminUser(current);
        setAdminSetupStep('set-password');
      }
    }
  }, [authMode]);

  // Google Sign-In Handler (Kept available for administrative account linking per requirement 7)
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await firebaseAuthService.loginWithGoogle();
      if (res?.user?.email?.trim().toLowerCase() === 'sanshinnihon@gmail.com') {
        onSelectRole?.('administrator');
      }
      onAuthSuccess?.();
    } catch (err) {
      setServerError(formatFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );

  // UI & Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState<string | null>(null);

  // Validation checks for the 5 required registration fields
  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phoneNumber.trim();

  // Valid 10-digit Sri Lankan mobile number: starts with 07 or 0 and has 10 digits total
  const isSriLankanMobileFormat = /^(?:07\d{8}|0\d{9})$/.test(trimmedPhone);
  const isNameValid = trimmedName.length >= 2;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmedEmail);
  const isPasswordValid = studentPassword.length >= 6;
  const isConfirmMatching = studentConfirmPassword.length >= 6 && studentConfirmPassword === studentPassword;

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isSriLankanMobileFormat &&
    isPasswordValid &&
    isConfirmMatching;

  const validateRegistration = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Full Name
    if (!trimmedName) {
      errors.fullName = 'Full Name is mandatory.';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters long.';
    }

    // 2. Gmail Address (must end in @gmail.com)
    if (!trimmedEmail) {
      errors.email = 'Gmail Address is mandatory.';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(trimmedEmail)) {
      errors.email = 'Email must be a valid Gmail address ending in "@gmail.com".';
    }

    // 3. Phone Number (valid 10-digit Sri Lankan mobile number)
    if (!trimmedPhone) {
      errors.phoneNumber = 'Phone Number is mandatory.';
    } else if (!/^(?:07\d{8}|0\d{9})$/.test(trimmedPhone)) {
      errors.phoneNumber = 'Require a valid 10-digit Sri Lankan mobile number (e.g. 0771234567).';
    }

    // 4. Password
    if (!studentPassword) {
      errors.studentPassword = 'Password is mandatory.';
    } else if (studentPassword.length < 6) {
      errors.studentPassword = 'Password must be at least 6 characters.';
    }

    // 5. Confirm Password
    if (!studentConfirmPassword) {
      errors.studentConfirmPassword = 'Confirm Password is mandatory.';
    } else if (studentConfirmPassword !== studentPassword) {
      errors.studentConfirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Administrator password validation
  const isAdminPasswordLengthValid = adminNewPassword.length >= 12;
  const hasUpperCase = /[A-Z]/.test(adminNewPassword);
  const hasLowerCase = /[a-z]/.test(adminNewPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(adminNewPassword);
  const isAdminPasswordConfirmed =
    adminNewPassword.length > 0 && adminNewPassword === adminConfirmPassword;
  const isAdminFormValid =
    isAdminPasswordLengthValid &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumberOrSymbol &&
    isAdminPasswordConfirmed;

  const formatFirebaseError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account with this email address already exists. Please log in instead.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'The email address is improperly formatted. Please use a valid @gmail.com address.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password is too weak. Please use at least 12 characters including uppercase, lowercase, and numbers.';
    }
    if (
      msg.includes('auth/user-not-found') ||
      msg.includes('auth/wrong-password') ||
      msg.includes('auth/invalid-credential')
    ) {
      return 'Invalid email or password. Please verify your credentials or establish your administrator password.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Access temporarily disabled due to multiple failed login attempts. Please try again later.';
    }
    if (msg.includes('auth/operation-not-allowed')) {
      return 'Email/Password sign-in is currently disabled in your Firebase console. Please ensure Email/Password is enabled under Authentication > Sign-in method in Firebase Console.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Identity verification popup was closed before completion. Please try again.';
    }
    return msg;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateRegistration()) return;

    setIsSubmitting(true);
    try {
      const res = await firebaseAuthService.registerStudent({
        fullName: trimmedName,
        email: trimmedEmail,
        phoneNumber: trimmedPhone,
        japaneseLevels: [],
        password: studentPassword,
      });

      setRegistrationSuccessMsg(
        `Profile created successfully! Registration request submitted for administrator review (Status: PENDING).`
      );

      setTimeout(() => {
        onAuthSuccess?.();
      }, 1000);
    } catch (err) {
      setServerError(formatFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const emailInput = loginEmail.trim().toLowerCase();
    if (!emailInput || !loginPassword) {
      setServerError('Please enter both your registered email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseAuthService.loginStudent(emailInput, loginPassword);
      if (emailInput === 'sanshinnihon@gmail.com') {
        onSelectRole?.('administrator');
      }
      onAuthSuccess?.();
    } catch (err) {
      setServerError(formatFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // ADMIN PASSWORD SETUP HANDLERS
  // -------------------------------------------------------------
  const handleVerifyAdminIdentity = async () => {
    setIsVerifyingAdmin(true);
    setServerError(null);
    try {
      const user = await firebaseAuthService.verifyAdminIdentityForPasswordSetup();
      setVerifiedAdminUser(user);
      setAdminSetupStep('set-password');
    } catch (err) {
      setServerError(formatFirebaseError(err));
    } finally {
      setIsVerifyingAdmin(false);
    }
  };

  const handleSendAdminEmailLink = async () => {
    setIsSendingEmailLink(true);
    setServerError(null);
    try {
      await firebaseAuthService.sendPasswordReset('sanshinnihon@gmail.com');
      setEmailLinkSent(true);
    } catch (err) {
      setServerError(formatFirebaseError(err));
    } finally {
      setIsSendingEmailLink(false);
    }
  };

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (adminNewPassword.length < 12) {
      setServerError('Administrator password must be at least 12 characters long.');
      return;
    }

    if (adminNewPassword !== adminConfirmPassword) {
      setServerError('The passwords do not match. Please re-enter the confirmation password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (manualResetCode.trim()) {
        // Confirmation via email action code
        await firebaseAuthService.confirmAdminPasswordReset(manualResetCode.trim(), adminNewPassword);
      } else if (verifiedAdminUser) {
        // Linking / updating credential on verified existing Google user account
        await firebaseAuthService.setAdminPassword(verifiedAdminUser, adminNewPassword);
      } else {
        throw new Error('Please verify your administrator identity before setting the password.');
      }

      setAdminSetupStep('success');
    } catch (err) {
      setServerError(formatFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // MODE 1: DEDICATED INITIAL AUTHENTICATION LANDING PAGE
  // -------------------------------------------------------------
  if (authMode === 'landing') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#F3C3D8] shadow-[0_12px_40px_-8px_rgba(217,79,145,0.18)] p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle decorative rose-gold ambient glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FFF0F6] rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FFF0F6] rounded-full blur-2xl pointer-events-none" />

          {/* SANSHIN NIHON Brand Emblem */}
          <div className="relative mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E6589C] via-[#D94F91] to-[#A83267] text-white flex items-center justify-center font-black text-2xl shadow-[0_8px_20px_-2px_rgba(217,79,145,0.4)]">
            <span>三振</span>
          </div>

          {/* Brand Name & Portal Label */}
          <div className="relative mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#54263F]">
              SANSHIN NIHON
            </h1>
            <p className="text-xs font-bold tracking-widest text-[#A83267] uppercase mt-1">
              STUDENT PORTAL
            </p>
            <div className="mt-4 pt-4 border-t border-[#F3C3D8]/50">
              <p className="text-sm font-semibold text-[#54263F]">
                Your Journey to Japan Starts Here
              </p>
              <p className="text-xs text-[#806779] mt-0.5">
                日本への第一歩、ここから始まる
              </p>
            </div>
          </div>

          {/* Action Buttons: LOGIN & CREATE PROFILE */}
          <div className="space-y-3.5 relative">
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setFormErrors({});
                setAuthMode('login');
              }}
              className="btn-rose-primary w-full py-3.5 px-6 text-sm cursor-pointer shadow-md"
            >
              LOGIN
            </button>

            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setFormErrors({});
                setAuthMode('register');
              }}
              className="btn-rose-secondary w-full py-3.5 px-6 text-sm cursor-pointer"
            >
              CREATE A PROFILE
            </button>
          </div>

          {/* Quiet security assurance */}
          <div className="mt-8 pt-6 border-t border-[#F3C3D8]/40 flex items-center justify-center space-x-2 text-[11px] text-[#806779]">
            <ShieldCheck className="w-4 h-4 text-[#A83267]" />
            <span>Official Candidate Assessment &amp; Verification</span>
          </div>

          {/* Institutional Admin Navigation (only for authenticated administrator) */}
          {onSelectRole && (
            <div className="mt-4 pt-3 border-t border-[#F3C3D8]/30 flex flex-col items-center">
              <button
                type="button"
                onClick={() => onSelectRole('administrator')}
                className="text-[10px] font-medium text-[#806779] hover:underline cursor-pointer"
              >
                Institutional Administrator Console &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEDICATED LOGIN, CREATE PROFILE & ADMIN PASSWORD SETUP SCREENS
  // -------------------------------------------------------------
  return (
    <div className="max-w-xl mx-auto my-4 sm:my-8 px-4">
      <div className="bg-white rounded-3xl border border-[#F3C3D8] shadow-[0_12px_40px_-8px_rgba(217,79,145,0.12)] overflow-hidden">
        {/* Brand & Section Header */}
        <div className="bg-gradient-to-r from-[#FFF0F6] to-white p-6 sm:p-7 border-b border-[#F3C3D8]">
          <div className="flex items-center justify-between mb-3">
            {authMode === 'register' || authMode === 'admin-setup' ? (
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setFormErrors({});
                  setAuthMode('login');
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-xl border border-[#F3C3D8] bg-white text-xs font-semibold text-[#A83267] hover:bg-[#FFF0F6] hover:text-[#D94F91] transition-colors cursor-pointer group shadow-2xs"
                title="Return to Login"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setFormErrors({});
                  setAuthMode('landing');
                }}
                className="inline-flex items-center text-xs font-semibold text-[#A83267] hover:text-[#D94F91] transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                Back to Welcome
              </button>
            )}

            <span className="text-[10px] font-bold tracking-widest text-[#A83267] uppercase">
              {authMode === 'admin-setup' ? 'INSTITUTIONAL ADMIN' : 'STUDENT PORTAL'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E6589C] to-[#A83267] flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
              三振
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#54263F] tracking-tight">
                {authMode === 'register'
                  ? 'Create Profile'
                  : authMode === 'admin-setup'
                  ? 'Administrator Password Setup'
                  : 'Student & Staff Login'}
              </h2>
              <p className="text-xs text-[#806779] mt-0.5">
                {authMode === 'register'
                  ? 'Enter your name, Gmail address, and 10-digit phone number to create your profile.'
                  : authMode === 'admin-setup'
                  ? 'Establish email/password credentials for sanshinnihon@gmail.com.'
                  : 'Sign in to access your examination workspace and review records.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2.5">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Authentication Notice</p>
                <p className="mt-0.5 leading-relaxed">{serverError}</p>
              </div>
            </div>

            {serverError.includes('Firebase Console') && (
              <div className="mt-2 pt-2.5 border-t border-rose-200/80 space-y-2">
                <p className="font-bold text-rose-900 text-[11px]">
                  Required Firebase Console Step (1-minute setup):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-rose-800 ml-1">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.firebase.google.com/project/gen-lang-client-0518144266/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-[#A83267] hover:text-[#D94F91] inline-flex items-center gap-0.5"
                    >
                      Firebase Console &gt; Authentication &gt; Sign-in method <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                  <li>Click <strong>Email/Password</strong> under the Sign-in providers table.</li>
                  <li>Toggle the <strong>Enable</strong> switch ON and click <strong>Save</strong>.</li>
                </ol>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-rose-700 italic">
                    Project ID: gen-lang-client-0518144266
                  </span>
                  <button
                    type="button"
                    onClick={() => setServerError(null)}
                    className="text-[11px] font-semibold text-[#A83267] hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Success Banner */}
        {registrationSuccessMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Profile Registration Completed</p>
              <p className="mt-0.5">{registrationSuccessMsg}</p>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            MODE A: LOGIN SCREEN
            Strictly limited to:
            1. Registered email address
            2. Password
            3. Login button
            4. Create a Profile navigation option
            5. Administrator: One-Time Password Setup navigation option
           ------------------------------------------------------------- */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Gmail Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="registered@gmail.com or sanshinnihon@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-[#F3C3D8] rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-[#F3C3D8] rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-rose-primary w-full py-3 text-xs font-semibold shadow-md mt-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'LOGIN'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>

            <div className="pt-4 border-t border-[#F3C3D8]/60 text-center">
              <p className="text-xs text-[#806779]">
                New student candidate?
              </p>
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setFormErrors({});
                  setAuthMode('register');
                }}
                className="mt-1 inline-flex items-center text-xs font-semibold text-[#A83267] hover:text-[#D94F91] underline cursor-pointer"
              >
                Create a Profile (新規受講生登録)
              </button>
            </div>
          </form>
        )}

        {/* -------------------------------------------------------------
        {/* -------------------------------------------------------------
            MODE B: CREATE ACCOUNT / REGISTRATION SCREEN
            Strictly 5 required fields in this exact order:
            1. Full Name
            2. Gmail Address
            3. Phone Number
            4. Password (with Sinhala helper text underneath)
            5. Confirm Password
           ------------------------------------------------------------- */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-7 space-y-4">
            {/* Top Back Navigation Button */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F3C3D8]/60">
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setFormErrors({});
                  setAuthMode('login');
                }}
                className="inline-flex items-center text-xs font-semibold text-[#A83267] hover:text-[#D94F91] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Back to Login (ログインに戻る)</span>
              </button>
              <span className="text-[10px] uppercase font-bold text-[#806779]">Student Registration</span>
            </div>

            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.fullName;
                        return next;
                      });
                    }
                  }}
                  placeholder="Enter candidate full name"
                  className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden ${
                    formErrors.fullName
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-[#F3C3D8] focus:ring-2 focus:ring-[#D94F91]'
                  }`}
                  required
                />
              </div>
              {formErrors.fullName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.fullName}</span>
                </p>
              )}
            </div>

            {/* Field 2: Gmail Address */}
            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Gmail Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }
                  }}
                  placeholder="candidate@gmail.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden ${
                    formErrors.email
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-[#F3C3D8] focus:ring-2 focus:ring-[#D94F91]'
                  }`}
                  required
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.email}</span>
                </p>
              )}
            </div>

            {/* Field 3: Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(cleaned);
                    if (formErrors.phoneNumber) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.phoneNumber;
                        return next;
                      });
                    }
                  }}
                  placeholder="10-digit Sri Lankan mobile (e.g. 0771234567)"
                  className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden font-mono ${
                    formErrors.phoneNumber
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-[#F3C3D8] focus:ring-2 focus:ring-[#D94F91]'
                  }`}
                  required
                />
              </div>
              {formErrors.phoneNumber && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.phoneNumber}</span>
                </p>
              )}
            </div>

            {/* Field 4: Password */}
            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type={showStudentPassword ? 'text' : 'password'}
                  value={studentPassword}
                  onChange={(e) => {
                    setStudentPassword(e.target.value);
                    if (formErrors.studentPassword) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.studentPassword;
                        return next;
                      });
                    }
                    if (studentConfirmPassword && e.target.value !== studentConfirmPassword) {
                      setFormErrors((prev) => ({
                        ...prev,
                        studentConfirmPassword: 'Passwords do not match.',
                      }));
                    } else if (studentConfirmPassword && e.target.value === studentConfirmPassword) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.studentConfirmPassword;
                        return next;
                      });
                    }
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden font-mono ${
                    formErrors.studentPassword
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-[#F3C3D8] focus:ring-2 focus:ring-[#D94F91]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
                  className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                  aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                >
                  {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Sinhala Helper Text Required by User */}
              <p className="text-[11px] text-[#A83267] font-medium mt-1">
                මුරපදය ලෙස ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න.
              </p>
              {formErrors.studentPassword && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.studentPassword}</span>
                </p>
              )}
            </div>

            {/* Field 5: Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#54263F] mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                <input
                  type={showStudentConfirmPassword ? 'text' : 'password'}
                  value={studentConfirmPassword}
                  onChange={(e) => {
                    setStudentConfirmPassword(e.target.value);
                    if (studentPassword && e.target.value !== studentPassword) {
                      setFormErrors((prev) => ({
                        ...prev,
                        studentConfirmPassword: 'Passwords do not match.',
                      }));
                    } else if (studentPassword && e.target.value === studentPassword) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.studentConfirmPassword;
                        return next;
                      });
                    }
                  }}
                  placeholder="Re-enter your password to confirm"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden font-mono ${
                    formErrors.studentConfirmPassword
                      ? 'border-rose-400 ring-1 ring-rose-400'
                      : 'border-[#F3C3D8] focus:ring-2 focus:ring-[#D94F91]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowStudentConfirmPassword(!showStudentConfirmPassword)}
                  className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                  aria-label={showStudentConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showStudentConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {studentConfirmPassword && (
                <p
                  className={`text-[11px] mt-1 font-semibold flex items-center gap-1 ${
                    studentPassword === studentConfirmPassword ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {studentPassword === studentConfirmPassword ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Passwords match (මුරපද සමාන වේ)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{formErrors.studentConfirmPassword || 'Passwords do not match'}</span>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="btn-rose-primary w-full py-3 text-xs font-semibold shadow-md mt-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Account (アカウント作成)'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>

            {/* Back / Navigation Option */}
            <div className="pt-4 border-t border-[#F3C3D8]/60 text-center">
              <p className="text-xs text-[#806779]">
                Already have an account?
              </p>
              <button
                type="button"
                onClick={() => {
                  setServerError(null);
                  setFormErrors({});
                  setAuthMode('login');
                }}
                className="mt-1 inline-flex items-center text-xs font-semibold text-[#A83267] hover:text-[#D94F91] underline cursor-pointer"
              >
                Sign in to existing account (ログイン)
              </button>
            </div>
          </form>
        )}

        {/* -------------------------------------------------------------
            MODE C: SECURE ONE-TIME ADMINISTRATOR PASSWORD SETUP FLOW
            For: sanshinnihon@gmail.com
            1. Verifies identity via trusted Firebase method
            2. Collects & confirms new password (>= 12 chars)
            3. Establishes email/password credential on existing UID
            4. Never stores plaintext in Firestore
           ------------------------------------------------------------- */}
        {authMode === 'admin-setup' && (
          <div className="p-6 sm:p-7 space-y-5">
            {/* Context callout */}
            <div className="p-4 rounded-2xl bg-[#FFF0F6] border border-[#F3C3D8] text-xs text-[#54263F] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#A83267]">
                <ShieldCheck className="w-4 h-4 text-[#D94F91]" />
                <span>Authorized Administrator: sanshinnihon@gmail.com</span>
              </div>
              <p className="text-[#806779] leading-relaxed">
                This secure setup links an email/password credential to your existing Firebase administrator account. Your account UID, approval controls, and examination data remain fully preserved.
              </p>
            </div>

            {/* STEP 1: VERIFY ADMINISTRATOR IDENTITY */}
            {adminSetupStep === 'verify' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#F3C3D8] bg-white space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#A83267] block">
                    Step 1 of 2: Trusted Identity Verification
                  </span>
                  <h3 className="text-sm font-bold text-[#54263F]">
                    Verify Administrator Identity via Google Authentication
                  </h3>
                  <p className="text-xs text-[#806779]">
                    Click below to authenticate securely using your administrator Google account (<span className="font-mono font-semibold text-[#54263F]">sanshinnihon@gmail.com</span>). This verifies ownership before establishing the new password.
                  </p>

                  <button
                    type="button"
                    onClick={handleVerifyAdminIdentity}
                    disabled={isVerifyingAdmin}
                    className="btn-rose-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifyingAdmin ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Administrator Account...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Identity as sanshinnihon@gmail.com</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Alternative Option: Dispatch official Firebase reset/setup email */}
                <div className="pt-2 text-center space-y-2">
                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-[#F3C3D8] w-full" />
                    <span className="bg-white px-3 text-[10px] uppercase font-bold text-[#806779] absolute">
                      or via email link
                    </span>
                  </div>

                  {emailLinkSent ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2 text-left">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Official Password Setup Email Dispatched</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        A secure link has been sent to <span className="font-mono font-bold">sanshinnihon@gmail.com</span>. You can open the link in your email to set your password, or enter the action code below:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCodeInput(true);
                          setAdminSetupStep('set-password');
                        }}
                        className="text-xs font-semibold text-emerald-800 underline cursor-pointer"
                      >
                        Enter verification code from email link &rarr;
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isSendingEmailLink}
                      onClick={handleSendAdminEmailLink}
                      className="text-xs font-medium text-[#A83267] hover:text-[#D94F91] underline cursor-pointer disabled:opacity-50"
                    >
                      {isSendingEmailLink ? 'Dispatching...' : 'Send Password Setup Link to sanshinnihon@gmail.com'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: ENTER & CONFIRM NEW PASSWORD */}
            {adminSetupStep === 'set-password' && (
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
                {verifiedAdminUser && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Identity Verified: </span>
                        <span>{verifiedAdminUser.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      UID: {verifiedAdminUser.uid.slice(0, 8)}...
                    </span>
                  </div>
                )}

                {showCodeInput && (
                  <div>
                    <label className="block text-xs font-semibold text-[#54263F] mb-1">
                      Firebase Action Code (oobCode from Email Link) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualResetCode}
                      onChange={(e) => setManualResetCode(e.target.value)}
                      placeholder="Paste oobCode from reset URL"
                      className="w-full px-3.5 py-2.5 border border-[#F3C3D8] rounded-xl text-xs font-mono bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                      required={!verifiedAdminUser}
                    />
                  </div>
                )}

                {/* Field 1: New Administrator Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#54263F]">
                      New Administrator Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#A83267]">
                      Minimum 12 characters
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="Enter strong password (minimum 12 characters)"
                      className="w-full pl-10 pr-10 py-2.5 border border-[#F3C3D8] rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                      aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password requirements visual validation checklist */}
                  <div className="mt-2.5 p-3 rounded-xl bg-[#FFF0F6] border border-[#F3C3D8]/80 space-y-1 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-[#806779] block mb-1">
                      Password Requirements:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      <span className={`flex items-center gap-1.5 ${isAdminPasswordLengthValid ? 'text-emerald-700 font-semibold' : 'text-[#806779]'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isAdminPasswordLengthValid ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        At least 12 characters ({adminNewPassword.length}/12)
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-700 font-semibold' : 'text-[#806779]'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasUpperCase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        One uppercase letter (A–Z)
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-700 font-semibold' : 'text-[#806779]'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasLowerCase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        One lowercase letter (a–z)
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? 'text-emerald-700 font-semibold' : 'text-[#806779]'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasNumberOrSymbol ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        One number or symbol
                      </span>
                    </div>
                  </div>
                </div>

                {/* Field 2: Confirm New Administrator Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#54263F] mb-1">
                    Confirm New Administrator Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#806779]" />
                    <input
                      type={showAdminConfirmPassword ? 'text' : 'password'}
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="Re-enter password to confirm"
                      className="w-full pl-10 pr-10 py-2.5 border border-[#F3C3D8] rounded-xl text-xs bg-[#FFF0F6]/30 text-[#54263F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                      className="absolute right-3.5 top-2.5 text-[#806779] hover:text-[#54263F] cursor-pointer"
                      aria-label={showAdminConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {adminConfirmPassword && (
                    <p
                      className={`text-[11px] mt-1.5 flex items-center gap-1 font-semibold ${
                        isAdminPasswordConfirmed ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isAdminPasswordConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Passwords match!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>The passwords do not match.</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isAdminFormValid}
                  className="btn-rose-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Establishing Administrator Password...' : 'Save Administrator Password (パスワードを確定)'}
                </button>
              </form>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {adminSetupStep === 'success' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="font-bold text-sm">Administrator Password Established!</h3>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Your email and password credential is now active in Firebase Authentication. Your institutional account UID ({verifiedAdminUser?.uid || 'Preserved'}), admin authorization, and examination databases are fully preserved.
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1 text-[11px] text-[#54263F]">
                    <div className="flex justify-between">
                      <span className="text-[#806779]">Administrator Email:</span>
                      <span className="font-mono font-bold">sanshinnihon@gmail.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#806779]">Credential Provider:</span>
                      <span className="font-semibold text-emerald-700">Email &amp; Password (Active)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#806779]">Access Privilege:</span>
                      <span className="font-semibold text-emerald-700">Institutional Administrator</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole?.('administrator');
                      onAuthSuccess?.();
                    }}
                    className="btn-rose-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Open Admin Dashboard Directly (管理画面へ進む)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await firebaseAuthService.logout();
                      setLoginEmail('sanshinnihon@gmail.com');
                      setAuthMode('login');
                    }}
                    className="btn-rose-secondary w-full py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    Sign Out &amp; Test Login with New Password
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
