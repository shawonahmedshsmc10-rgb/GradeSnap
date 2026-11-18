import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileCheck2,
  Layers,
  GraduationCap,
  ShieldAlert,
  ChevronDown,
  Building2,
  Menu,
  X,
  Camera,
  User,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenScanner }) => {
  const {
    currentUser,
    currentTenant,
    isAuthenticated,
    isSuperAdmin,
    isTeacher,
    isStudent,
    openLoginModal,
    logout,
  } = useAuth();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBrandClick = () => {
    if (isSuperAdmin) setCurrentTab('admin-stats');
    else if (isTeacher) setCurrentTab('overview');
    else setCurrentTab('exams');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  GradeSnap
                </span>
                <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">
                  Multi-Tenant OMR SaaS
                </span>
              </div>
            </button>

            {currentTenant && (
              <div className="hidden lg:flex items-center gap-2 pl-3 ml-2 border-l border-slate-200 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-800 truncate max-w-[180px]">
                  {currentTenant.name}
                </span>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {isStudent && (
              <>
                <button
                  onClick={() => setCurrentTab('exams')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'exams'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Available Exams
                </button>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'contact'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Contact
                </button>
                <button
                  onClick={() => setCurrentTab('about')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'about'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  About Teacher
                </button>
                <button
                  onClick={() => {
                    if (onOpenScanner) onOpenScanner();
                    else setCurrentTab('scanner');
                  }}
                  className="px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Check OMR</span>
                </button>
              </>
            )}

            {isTeacher && (
              <>
                <button
                  onClick={() => setCurrentTab('overview')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'overview'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentTab('exams-manage')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'exams-manage'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Examinations
                </button>
                <button
                  onClick={() => setCurrentTab('omr-builder')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'omr-builder'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  OMR Designer
                </button>
                <button
                  onClick={() => setCurrentTab('omr-manage')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'omr-manage'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  OMR Evaluations
                </button>
                <button
                  onClick={() => setCurrentTab('results')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'results'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Results & Ranks
                </button>
                <button
                  onClick={() => setCurrentTab('students')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'students'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setCurrentTab('audit-log')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'audit-log'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Audit Trail
                </button>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`px-2.5 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'settings'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Branding & Plan
                </button>
              </>
            )}

            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setCurrentTab('admin-stats')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'admin-stats'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Platform Overview
                </button>
                <button
                  onClick={() => setCurrentTab('admin-tenants')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'admin-tenants'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Institutes & Teachers
                </button>
                <button
                  onClick={() => setCurrentTab('admin-plans')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'admin-plans'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Subscriptions & Quotas
                </button>
                <button
                  onClick={() => setCurrentTab('admin-audit')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'admin-audit'
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Global Audit Trail
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isAuthenticated ? (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/80 focus:outline-none whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-900 max-w-[140px] truncate">
                    {currentUser?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {currentUser?.studentRollNumber
                          ? `Roll ${currentUser.studentRollNumber}`
                          : currentUser?.email}
                      </div>
                      <div className="text-[10px] font-medium text-blue-600 mt-1">
                        {isSuperAdmin
                          ? 'Platform Owner'
                          : isTeacher
                          ? `Teacher · ${currentTenant?.name || 'Workspace'}`
                          : `Student · ${currentTenant?.name || 'Candidate'}`}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openLoginModal();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-xs font-medium text-slate-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2 text-xs font-medium text-red-600"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1">
          {isStudent && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('exams');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Available Exams
              </button>
              <button
                onClick={() => {
                  setCurrentTab('contact');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  setCurrentTab('about');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                About Teacher
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenScanner) onOpenScanner();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-blue-600 bg-blue-50"
              >
                Check OMR with Camera
              </button>
            </>
          )}

          {isTeacher && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('overview');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Dashboard Overview
              </button>
              <button
                onClick={() => {
                  setCurrentTab('exams-manage');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Manage Examinations
              </button>
              <button
                onClick={() => {
                  setCurrentTab('omr-builder');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Compatible OMR Sheet Designer
              </button>
              <button
                onClick={() => {
                  setCurrentTab('omr-manage');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                OMR Evaluations & Submissions
              </button>
              <button
                onClick={() => {
                  setCurrentTab('results');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Results & Ranking Analytics
              </button>
              <button
                onClick={() => {
                  setCurrentTab('students');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Students Roster
              </button>
              <button
                onClick={() => {
                  setCurrentTab('audit-log');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Security & Audit Trail
              </button>
              <button
                onClick={() => {
                  setCurrentTab('settings');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Institute Branding & Quotas
              </button>
            </>
          )}

          {isSuperAdmin && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('admin-stats');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Platform Stats
              </button>
              <button
                onClick={() => {
                  setCurrentTab('admin-tenants');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                All Teachers & Coaching Centres
              </button>
              <button
                onClick={() => {
                  setCurrentTab('admin-plans');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                SaaS Plans & Commercial Quotas
              </button>
              <button
                onClick={() => {
                  setCurrentTab('admin-audit');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Global Audit Trail
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
