import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import {
  FileText,
  Users,
  Radio,
  FileCheck2,
  Plus,
  Upload,
  KeyRound,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ScanLine,
} from 'lucide-react';
import { OMRSubmission } from '../../types';

interface TeacherOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateExam: () => void;
  onSelectSubmission?: (sub: OMRSubmission) => void;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  onNavigateTab,
  onOpenCreateExam,
  onSelectSubmission,
}) => {
  const { currentTenant } = useAuth();
  const tenantId = currentTenant?.id;

  const exams = dbStore.getExams(tenantId);
  const students = dbStore.getStudents(tenantId);
  const submissions = dbStore.getSubmissions(undefined, tenantId);
  const liveExams = exams.filter((e) => e.status === 'live');

  const recentExams = [...exams].slice(0, 4);
  const recentSubmissions = [...submissions].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Examinations</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {exams.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Managed in workspace</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Students</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {students.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Enrolled in roster</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Live Examinations</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block tabular-nums">
              {liveExams.length}
            </span>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Currently accessible</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">OMR Submissions</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {submissions.length}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Evaluated via CV</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={onOpenCreateExam}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                Create New Exam
              </span>
              <span className="text-[10px] text-slate-500 block">5-step wizard</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('omr-builder')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                Design OMR Sheet
              </span>
              <span className="text-[10px] text-slate-500 block">A4 PDF & CV verify</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('exams-manage')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                Upload Paper PDF
              </span>
              <span className="text-[10px] text-slate-500 block">Manage question sets</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('exams-manage')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                Upload Answer Key
              </span>
              <span className="text-[10px] text-slate-500 block">Audit & release</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('results')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                View Results
              </span>
              <span className="text-[10px] text-slate-500 block">Rankings & CSV</span>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('audit-log')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                Audit Trail
              </span>
              <span className="text-[10px] text-slate-500 block">Action & override logs</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-900">Recent Examinations</h4>
              <button
                onClick={() => onNavigateTab('exams-manage')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 truncate max-w-xs">
                      {exam.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{exam.subject}</span>
                      <span>·</span>
                      <span>{exam.totalQuestions} Questions</span>
                      <span>·</span>
                      <span>{exam.durationMinutes}m</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold capitalize ${
                        exam.status === 'live'
                          ? 'text-emerald-700'
                          : exam.status === 'scheduled'
                          ? 'text-blue-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-900">Recent OMR Submissions</h4>
              <button
                onClick={() => onNavigateTab('omr-manage')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>Review All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentSubmissions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No submissions recorded yet.</p>
              ) : (
                recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onSelectSubmission?.(sub)}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          Roll: {sub.studentRollNumber}
                        </span>
                        {sub.status === 'flagged' && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Ambiguous
                          </span>
                        )}
                        {sub.status === 'manual_reviewed' && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            Overridden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{sub.studentName || 'Candidate'}</span>
                        <span>·</span>
                        <span>{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-slate-900 block tabular-nums">
                        {sub.score.finalScore} pts
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 block tabular-nums">
                        {sub.score.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
