import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Database,
  Lock,
  Layers,
  X,
  FileCheck,
} from 'lucide-react';

interface SystemInspectionReportProps {
  onClose: () => void;
}

export const SystemInspectionReport: React.FC<SystemInspectionReportProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">System Inspection & Audit Report</h2>
              <p className="text-[11px] text-slate-400">
                SANSHIN NIHON — Complete Student Registration & Backend Implementation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {/* Section 1: Backend & Cloud Firestore Status */}
          <div className="rounded-xl border border-emerald-200 p-4 bg-emerald-50/60">
            <h3 className="font-bold text-emerald-950 flex items-center mb-2">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              1. Cloud Backend &amp; Firebase Authentication Provisioned
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-emerald-900">
              <li>
                <strong>Cloud Firestore Database:</strong> Provisioned via official GCP/Firebase connector (Database ID: <code className="font-mono text-[11px]">ai-studio-sanshinnihonsecu-bad47fb5...</code>).
              </li>
              <li>
                <strong>Firebase Authentication:</strong> Active with Email/Password authentication provider, password hashing, and session management. Plaintext passwords are never stored.
              </li>
              <li>
                <strong>Firestore Security Rules:</strong> Deployed with strict Attribute-Based Access Control (ABAC), default-deny safety net, path validation, and anti-tampering rules.
              </li>
              <li>
                <strong>Initial Approval State:</strong> New student accounts strictly start as <code className="font-semibold">pending</code> in <code className="font-mono">students/{'{uid}'}</code>.
              </li>
            </ul>
          </div>

          {/* Section 2: Registration & Student Interface */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h3 className="font-bold text-slate-900 flex items-center mb-2">
              <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
              2. Student Registration Features &amp; Security Controls
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Registration Fields:</strong> Full Name, normalized Email Address, Phone Number, and Japanese Language Knowledge (multiple choice for Beginner, JLPT N5–N1, JFT-Basic).
              </li>
              <li>
                <strong>Password Security:</strong> Visibility toggles, 12-character recommended minimum, real-time strength meter (Weak/Fair/Good/Strong), and privacy terms agreement.
              </li>
              <li>
                <strong>Duplicate Prevention:</strong> Handled by Firebase Auth (<code className="font-mono text-[11px]">auth/email-already-in-use</code>).
              </li>
              <li>
                <strong>Password Recovery:</strong> Automated Firebase email password reset via <code className="font-mono text-[11px]">sendPasswordResetEmail</code>.
              </li>
            </ul>
          </div>

          {/* Section 3: Access Control & Anti-Self-Approval */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h3 className="font-bold text-slate-900 flex items-center mb-2">
              <Lock className="w-4 h-4 mr-1.5 text-amber-600" />
              3. Security Rules &amp; Authorization Enforcement
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Anti-Self-Approval:</strong> Rules strictly enforce <code className="font-mono text-[11px]">incoming().approvalStatus == existing().approvalStatus</code> for student updates. Students cannot approve themselves.
              </li>
              <li>
                <strong>PII Isolation:</strong> <code className="font-mono text-[11px]">allow get: if isOwner(studentId) || isAdmin();</code> prevents candidates from inspecting another student's profile.
              </li>
              <li>
                <strong>Protected Examination Gate:</strong> Candidates awaiting approval see the required waiting message (*"Your registration has been received. Please wait for administrator approval."*) and are blocked from active examination questions.
              </li>
              <li>
                <strong>Admin Console:</strong> Real-time approval, rejection, suspension, and restoration controls for administrators.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
