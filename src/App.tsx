import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { StudentPortal } from './components/student/StudentPortal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { OMRScannerModal } from './components/student/OMRScannerModal';
import { LoginSection } from './components/auth/LoginSection';
import { dbStore } from './lib/mockDatabase';
import {
  BookOpen,
  Camera,
  Layers,
  PhoneCall,
  User,
  ShieldAlert,
  BarChart2,
  FileCheck2,
  FileText,
  Users,
  ShieldCheck,
} from 'lucide-react';

function MainApp() {
  const {
    role,
    isSuperAdmin,
    isTeacher,
    isStudent,
    isLoginModalOpen,
    isSignedOutView,
    closeLoginModal,
  } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>(
    isStudent ? 'exams' : isTeacher ? 'overview' : 'admin-stats'
  );
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);

  useEffect(() => {
    if (role === 'super_admin' && !currentTab.startsWith('admin-')) {
      setCurrentTab('admin-stats');
    } else if (
      role === 'teacher' &&
      !['overview', 'exams-manage', 'omr-builder', 'omr-manage', 'results', 'students', 'audit-log', 'settings'].includes(currentTab)
    ) {
      setCurrentTab('overview');
    } else if (role === 'student' && !['exams', 'contact', 'about'].includes(currentTab)) {
      setCurrentTab('exams');
    }
  }, [role, currentTab]);

  // Default exam for quick scanner trigger
  const defaultExam = dbStore.getExams()[0];

  if (isSignedOutView) {
    return (
      <LoginSection
        variant="page"
        onSuccess={(nextRole) => {
          if (nextRole === 'super_admin') setCurrentTab('admin-stats');
          else if (nextRole === 'teacher') setCurrentTab('overview');
          else setCurrentTab('exams');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenScanner={() => setIsGlobalScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-8">
        {isSuperAdmin && <SuperAdminDashboard currentTab={currentTab} />}

        {isTeacher && (
          <TeacherDashboard currentTab={currentTab} setCurrentTab={setCurrentTab} />
        )}

        {isStudent && (
          <StudentPortal
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            scannerOpen={isGlobalScannerOpen}
            setScannerOpen={setIsGlobalScannerOpen}
          />
        )}
      </main>

      {/* Global OMR Scanner Modal (accessible from quick scanner buttons) */}
      {defaultExam && (
        <OMRScannerModal
          exam={defaultExam}
          isOpen={isGlobalScannerOpen}
          onClose={() => setIsGlobalScannerOpen(false)}
        />
      )}

      {isLoginModalOpen && (
        <LoginSection
          variant="modal"
          onClose={closeLoginModal}
          onSuccess={(nextRole) => {
            if (nextRole === 'super_admin') setCurrentTab('admin-stats');
            else if (nextRole === 'teacher') setCurrentTab('overview');
            else setCurrentTab('exams');
          }}
        />
      )}

      {/* Mobile-First Bottom Navigation Bar (Phone-Friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {isStudent && (
          <>
            <button
              onClick={() => setCurrentTab('exams')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[64px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'exams' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Exams</span>
            </button>

            <button
              onClick={() => setIsGlobalScannerOpen(true)}
              className="flex flex-col items-center justify-center p-1.5 min-w-[64px] min-h-[44px] rounded-lg text-blue-600"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 -mt-3">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-700 mt-0.5">Scan OMR</span>
            </button>

            <button
              onClick={() => setCurrentTab('contact')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[64px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'contact' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Contact</span>
            </button>
          </>
        )}

        {isTeacher && (
          <>
            <button
              onClick={() => setCurrentTab('overview')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'overview' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Overview</span>
            </button>

            <button
              onClick={() => setCurrentTab('exams-manage')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'exams-manage' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Exams</span>
            </button>

            <button
              onClick={() => setCurrentTab('omr-manage')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'omr-manage' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <FileCheck2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">OMR Audit</span>
            </button>

            <button
              onClick={() => setCurrentTab('audit-log')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'audit-log' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Audit</span>
            </button>

            <button
              onClick={() => setCurrentTab('results')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'results' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Results</span>
            </button>
          </>
        )}

        {isSuperAdmin && (
          <>
            <button
              onClick={() => setCurrentTab('admin-stats')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'admin-stats' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Stats</span>
            </button>
            <button
              onClick={() => setCurrentTab('admin-tenants')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'admin-tenants' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Teachers</span>
            </button>
            <button
              onClick={() => setCurrentTab('admin-audit')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[44px] rounded-lg transition-colors ${
                currentTab === 'admin-audit' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Audit</span>
            </button>
          </>
        )}
      </div>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">GradeSnap</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Tenant Online Examination & OMR Evaluation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Deterministic CV v2.4</span>
            <span>·</span>
            <span>Multi-Tenant Isolated</span>
            <span>·</span>
            <span>A4 Fiducial Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
