/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { AdminPortal } from './components/AdminPortal';
import { SystemInspectionReport } from './components/SystemInspectionReport';
import { ShieldCheck, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { firebaseAuthService } from './services/firebaseAuthService';

export default function App() {
  const [portalRole, setPortalRole] = useState<'student' | 'administrator'>('student');
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Real-time backend verification of authenticated administrator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAdminAuthError(null);

      if (user && user.email?.trim().toLowerCase() === 'sanshinnihon@gmail.com') {
        // Authenticated with the institutional administrator email
        // Enforce verification through Cloud Firestore security rules
        const verifyRes = await firebaseAuthService.verifyAdminRole(user);
        if (verifyRes.isAdmin) {
          setIsAdminVerified(true);
          setPortalRole('administrator'); // Open Admin Dashboard for authorized administrator!
        } else {
          setIsAdminVerified(false);
          setPortalRole('student');
          setAdminAuthError(
            verifyRes.error ||
              'Access Denied: Cloud Firestore security rules rejected administrator authorization for this account.'
          );
        }
      } else {
        setIsAdminVerified(false);
        setPortalRole('student');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF0F6] text-[#54263F] flex flex-col font-sans">
      {/* Top Header & Brand Bar */}
      {(portalRole === 'administrator' || isAdminVerified) && (
        <Header
          portalRole={portalRole}
          onSelectRole={setPortalRole}
          showAuditModal={showAuditModal}
          onToggleAuditModal={() => setShowAuditModal(!showAuditModal)}
          isAdminVerified={isAdminVerified}
          adminEmail={currentUser?.email || 'sanshinnihon@gmail.com'}
          onSignOut={async () => {
            await firebaseAuthService.logout();
            setIsAdminVerified(false);
            setPortalRole('student');
          }}
        />
      )}

      {/* Administrator Verification Error Banner */}
      {adminAuthError && (
        <div className="bg-rose-600 text-white px-4 py-3 text-xs shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-200 shrink-0" />
              <span className="font-bold">Administrative Authorization Error:</span>
              <span>{adminAuthError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAdminAuthError(null)}
              className="text-white hover:text-rose-200 underline font-semibold text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Administrator Status Notification Banner (Shown in Administrator console) */}
      {portalRole === 'administrator' && isAdminVerified && (
        <div className="bg-white/90 border-b border-[#F3C3D8] px-4 py-2 text-xs text-[#806779]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              <span className="font-bold text-[#54263F]">
                Institutional Examination Console (管理者コンソール):
              </span>
              <span>
                141 MCQ Questions Active (TEST 01, TEST 02, TEST 03 &bull; Verified Answer Keys)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAuditModal(true)}
              className="text-[#A83267] hover:text-[#D94F91] font-semibold inline-flex items-center underline underline-offset-2 self-start sm:self-auto cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 mr-1 text-[#D94F91]" />
              View Interface Inspection Report
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {portalRole === 'student' ? (
          <StudentPortal
            onSelectRole={isAdminVerified ? setPortalRole : undefined}
            isAdminVerified={isAdminVerified}
          />
        ) : (
          <AdminPortal
            onSwitchToStudentView={isAdminVerified ? () => setPortalRole('student') : undefined}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-[#F3C3D8] py-5 text-xs text-[#806779] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#D94F91]" />
            <span className="font-semibold text-[#54263F]">
              SANSHIN NIHON (三振日本) Secure Student Examination System &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>Official Candidate Assessment &amp; Verification</span>
            {isAdminVerified && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#54263F] text-white">
                ADMIN AUTHORIZED
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* System Inspection & Audit Modal */}
      {showAuditModal && (
        <SystemInspectionReport onClose={() => setShowAuditModal(false)} />
      )}
    </div>
  );
}
