import React from 'react';
import { ShieldCheck, UserCheck, FileCheck, LogOut } from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuthService';

interface HeaderProps {
  portalRole: 'student' | 'administrator';
  onSelectRole: (role: 'student' | 'administrator') => void;
  showAuditModal: boolean;
  onToggleAuditModal: () => void;
  isAdminVerified?: boolean;
  adminEmail?: string;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  portalRole,
  onSelectRole,
  showAuditModal,
  onToggleAuditModal,
  isAdminVerified = false,
  adminEmail = 'sanshinnihon@gmail.com',
  onSignOut,
}) => {
  const handleLogout = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await firebaseAuthService.logout();
    }
  };

  return (
    <header className="bg-white border-b border-[#F3C3D8] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6589C] to-[#A83267] flex items-center justify-center text-white shadow-xs font-black text-sm">
              三振
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#54263F]">
                  SANSHIN NIHON
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8] hidden sm:inline-block">
                  Caregiver Examination
                </span>
              </div>
              <p className="text-[10px] text-[#806779] hidden md:block">
                三振日本 介護技能実習評価試験システム &bull; Institutional Assessment Portal
              </p>
            </div>
          </div>

          {/* Right Header Controls: Unmistakable ADMIN Badge, Audit, & Sign Out */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAdminVerified && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-[#54263F] to-[#732950] text-white px-3 py-1.5 rounded-xl shadow-xs border border-[#A83267]/40">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300 animate-pulse" />
                <span className="font-black text-xs tracking-wider">ADMIN</span>
                <span className="text-[10px] font-mono text-[#F3C3D8] border-l border-white/20 pl-2 hidden sm:inline">
                  {adminEmail}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onToggleAuditModal}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showAuditModal
                  ? 'bg-[#FFF0F6] text-[#A83267] border-[#D94F91]'
                  : 'bg-white text-[#806779] border-[#F3C3D8] hover:bg-[#FFF7FB] hover:text-[#54263F]'
              }`}
              title="View System Inspection & Audit Report"
            >
              <FileCheck className="w-3.5 h-3.5 sm:mr-1.5 text-[#D94F91]" />
              <span className="hidden sm:inline">System Audit</span>
            </button>

            {/* Role view toggle ONLY accessible to verified administrators */}
            {isAdminVerified && (
              <div className="bg-[#FFF0F6] p-1 rounded-xl border border-[#F3C3D8] flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectRole('student')}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    portalRole === 'student'
                      ? 'bg-gradient-to-r from-[#D94F91] to-[#A83267] text-white shadow-xs'
                      : 'text-[#806779] hover:text-[#54263F]'
                  }`}
                  title="Preview Student View"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Student View</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectRole('administrator')}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    portalRole === 'administrator'
                      ? 'bg-[#54263F] text-white shadow-xs'
                      : 'text-[#806779] hover:text-[#54263F]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#F3C3D8]" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            {isAdminVerified && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 bg-white border border-[#F3C3D8] hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Sign out of Administrator Account"
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1 text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
