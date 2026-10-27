import React, { useState } from 'react';
import { Phone, ShieldCheck, AlertCircle, CheckCircle2, LogOut, ArrowRight } from 'lucide-react';
import { StudentProfile } from '../types/exam';
import { firebaseAuthService, isPhoneValid } from '../services/firebaseAuthService';

interface CompleteProfileProps {
  student: StudentProfile;
  onProfileCompleted: (updatedProfile: StudentProfile) => void;
  onLogout: () => void;
}

export const CompleteProfile: React.FC<CompleteProfileProps> = ({
  student,
  onProfileCompleted,
  onLogout,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setErrorMessage('Phone Number is required.');
      return;
    }

    if (!isPhoneValid(trimmed)) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits, e.g. +81-90-1234-5678 or +94-77-123-4567).');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentUid = student.uid || student.id;
      await firebaseAuthService.updateStudentPhone(studentUid, trimmed);
      
      const updated: StudentProfile = {
        ...student,
        phoneNumber: trimmed,
        updatedAt: new Date().toISOString(),
      };
      onProfileCompleted(updated);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update phone number in database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-6 sm:my-10 px-4 animate-fade-in">
      <div className="card-rose-elevated p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 border-b border-[#F3C3D8] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6589C] to-[#A83267] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
            三振
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#A83267] uppercase">
              SANSHIN NIHON &bull; STUDENT PORTAL
            </span>
            <h2 className="text-lg font-bold text-[#54263F]">
              Complete Your Profile (プロフィール情報の完了)
            </h2>
          </div>
        </div>

        {/* Informative Callout */}
        <div className="p-4 rounded-xl bg-[#FFF0F6] border border-[#F3C3D8] text-xs text-[#54263F] space-y-1">
          <p className="font-semibold text-[#A83267] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D94F91]" />
            Candidate Authentication Successful
          </p>
          <p className="text-[#806779] leading-relaxed">
            Welcome to the SANSHIN NIHON Caregiver Examination platform. A valid contact phone number is required to complete your candidate record for official assessment eligibility.
          </p>
        </div>

        {/* Confirmed Account Data (Read-only) */}
        <div className="space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-[#806779] block">
            Confirmed Account Details (確認済みアカウント情報)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-white rounded-xl border border-[#F3C3D8]">
              <span className="text-[10px] text-[#806779] block">Full Name</span>
              <span className="font-bold text-[#54263F] text-xs truncate block">{student.fullName}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#F3C3D8]">
              <span className="text-[10px] text-[#806779] block">Registered Email</span>
              <span className="font-medium text-[#54263F] text-xs truncate block">{student.email}</span>
            </div>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Phone Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#54263F] mb-1">
              Contact Phone Number (電話番号) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#A83267] absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="+81-90-1234-5678 or +94-77-123-4567"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F3C3D8] rounded-xl text-xs text-[#54263F] placeholder-[#806779]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D94F91]"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-[#806779] mt-1.5">
              Include international country code prefix (e.g. <code>+81</code> for Japan, <code>+94</code> for Sri Lanka).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F3C3D8]">
            <button
              type="button"
              onClick={onLogout}
              className="btn-rose-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5 text-[#A83267]" />
              Sign Out
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-rose-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <span>Save &amp; Continue (保存して続行)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
