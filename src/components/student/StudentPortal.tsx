import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Exam } from '../../types';
import { AvailableExams } from './AvailableExams';
import { TeacherContact } from './TeacherContact';
import { AboutTeacher } from './AboutTeacher';
import { ExamDetailsModal } from './ExamDetailsModal';
import { ExamTimerModal } from './ExamTimerModal';
import { OMRScannerModal } from './OMRScannerModal';
import {
  BookOpen,
  PhoneCall,
  ArrowRight,
  GraduationCap,
  Building2,
} from 'lucide-react';

interface StudentPortalProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  scannerOpen?: boolean;
  setScannerOpen?: (open: boolean) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentTab,
  setCurrentTab,
  scannerOpen,
  setScannerOpen,
}) => {
  const { currentUser, currentTenant, isAuthenticated, openLoginModal } = useAuth();

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isScannerOpenInternal, setIsScannerOpenInternal] = useState(false);

  const isScannerActive = scannerOpen !== undefined ? scannerOpen : isScannerOpenInternal;
  const setScannerActive = setScannerOpen || setIsScannerOpenInternal;

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsDetailsOpen(true);
  };

  const handleStartTimer = () => {
    setIsDetailsOpen(false);
    setIsTimerOpen(true);
  };

  const handleOpenScanner = () => {
    setIsDetailsOpen(false);
    setScannerActive(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentTenant?.name || 'GradeSnap Examination Portal'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isAuthenticated && currentUser
              ? `Welcome, ${currentUser.name}`
              : 'Welcome to GradeSnap'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your model test papers, download printable A4 OMR sheets, or evaluate completed sheets via camera.
          </p>
        </div>

        {isAuthenticated && currentUser?.studentRollNumber ? (
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-right self-stretch sm:self-auto">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Candidate Roll No.
            </span>
            <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              {currentUser.studentRollNumber}
            </span>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            Sign in with Roll No.
          </button>
        )}
      </div>

      {/* Main 3 Navigation Options as Large, Recognizable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentTab('exams')}
          className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between group shadow-xs ${
            currentTab === 'exams'
              ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform mb-4">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Available Exams
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Browse published model tests, download questions, and timed sessions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-5">
            <span>View All Exams</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('contact')}
          className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between group shadow-xs ${
            currentTab === 'contact'
              ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-700/20 group-hover:scale-105 transition-transform mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
              Contact Teacher
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Direct hotline phone, campus hall location, and advisory office hours.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-5">
            <span>Get in Touch</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('about')}
          className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between group shadow-xs ${
            currentTab === 'about'
              ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform mb-4">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              About the Teacher
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Faculty credentials, medical/engineering records, and methodology.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-5">
            <span>Faculty Profile</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      <div className="pt-2">
        {currentTab === 'exams' && <AvailableExams onSelectExam={handleSelectExam} />}
        {currentTab === 'contact' && <TeacherContact />}
        {currentTab === 'about' && <AboutTeacher />}
      </div>

      {selectedExam && (
        <ExamDetailsModal
          exam={selectedExam}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onStartTimer={handleStartTimer}
          onCheckOMR={handleOpenScanner}
        />
      )}

      {selectedExam && (
        <ExamTimerModal
          exam={selectedExam}
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          onOpenCheckOMR={handleOpenScanner}
        />
      )}

      {selectedExam && (
        <OMRScannerModal
          exam={selectedExam}
          isOpen={isScannerActive}
          onClose={() => setScannerActive(false)}
        />
      )}
    </div>
  );
};
