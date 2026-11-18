import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeacherOverview } from './TeacherOverview';
import { ExamManagement } from './ExamManagement';
import { TeacherOMRManager } from './TeacherOMRManager';
import { TeacherResults } from './TeacherResults';
import { TeacherStudents } from './TeacherStudents';
import { TeacherSettings } from './TeacherSettings';
import { TeacherAuditLog } from './TeacherAuditLog';
import { OMRSheetBuilder } from './OMRSheetBuilder';
import { ExamWizard } from './ExamWizard';
import { Exam, OMRSubmission } from '../../types';
import { Building2, Layers, ShieldCheck } from 'lucide-react';

interface TeacherDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { currentTenant, currentUser, switchTenant, allTenants } = useAuth();
  const [isExamWizardOpen, setIsExamWizardOpen] = useState(false);
  const [selectedResultExamId, setSelectedResultExamId] = useState<string | undefined>(undefined);
  const [selectedSubForInspector, setSelectedSubForInspector] = useState<OMRSubmission | null>(null);

  const handleOpenResults = (examId: string) => {
    setSelectedResultExamId(examId);
    setCurrentTab('results');
  };

  const handleSelectSubmission = (sub: OMRSubmission) => {
    setSelectedSubForInspector(sub);
    setCurrentTab('omr-manage');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Workspace Header Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {currentTenant?.name || 'Workspace Dashboard'}
              </h2>
                <span className="text-xs font-semibold text-blue-600">
                  · {currentTenant?.plan?.toUpperCase()} Plan
                </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Instructor: <strong>{currentUser?.name || 'Faculty Lead'}</strong></span>
              <span>·</span>
              <span className="font-mono text-[11px] text-blue-600">gradesnap.com/{currentTenant?.slug}</span>
            </div>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Switch Workspace:</span>
          <select
            value={currentTenant?.id}
            onChange={(e) => switchTenant(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
          >
            {allTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Views */}
      <div>
        {currentTab === 'overview' && (
          <TeacherOverview
            onNavigateTab={setCurrentTab}
            onOpenCreateExam={() => setIsExamWizardOpen(true)}
            onSelectSubmission={handleSelectSubmission}
          />
        )}

        {currentTab === 'exams-manage' && (
          <ExamManagement
            onOpenCreateExam={() => setIsExamWizardOpen(true)}
            onViewResults={handleOpenResults}
          />
        )}

        {currentTab === 'omr-manage' && (
          <TeacherOMRManager initialSelectedSubmission={selectedSubForInspector} />
        )}

        {currentTab === 'omr-builder' && (
          <OMRSheetBuilder
            onOpenSubmissionInAudit={handleSelectSubmission}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'results' && (
          <TeacherResults selectedExamId={selectedResultExamId} />
        )}

        {currentTab === 'students' && <TeacherStudents />}

        {currentTab === 'audit-log' && <TeacherAuditLog />}

        {currentTab === 'settings' && <TeacherSettings />}
      </div>

      {/* 5-Step Examination Creation Wizard Modal */}
      <ExamWizard
        isOpen={isExamWizardOpen}
        onClose={() => setIsExamWizardOpen(false)}
        onExamCreated={(newExam) => {
          setCurrentTab('exams-manage');
        }}
      />
    </div>
  );
};
