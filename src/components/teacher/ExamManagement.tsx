import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import { Exam } from '../../types';
import { downloadOMRSheet } from '../../lib/omrGenerator';
import {
  Plus,
  Search,
  FileDown,
  Copy,
  Trash2,
  Play,
  Archive,
} from 'lucide-react';

interface ExamManagementProps {
  onOpenCreateExam: () => void;
  onViewResults: (examId: string) => void;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({
  onOpenCreateExam,
  onViewResults,
}) => {
  const { currentTenant, currentUser } = useAuth();
  const tenantId = currentTenant?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [exams, setExams] = useState<Exam[]>(dbStore.getExams(tenantId));

  const refreshExams = () => {
    setExams([...dbStore.getExams(tenantId)]);
  };

  const getActor = () => ({
    userId: currentUser?.id || 'teacher-lead',
    name: currentUser?.name || 'Faculty Lead',
    email: currentUser?.email || 'teacher@gradesnap.io',
    role: (currentUser?.role || 'teacher') as any,
  });

  const handleToggleStatus = (exam: Exam, newStatus: 'live' | 'completed' | 'draft') => {
    dbStore.updateExam(
      exam.id,
      { status: newStatus, published: newStatus === 'live' },
      tenantId,
      getActor()
    );
    refreshExams();
  };

  const handleDuplicate = (exam: Exam) => {
    const copyData = {
      ...exam,
      title: `${exam.title} (Copy)`,
      status: 'draft' as const,
      published: false,
    };
    dbStore.createExam(copyData, getActor());
    refreshExams();
  };

  const handleDelete = (examId: string) => {
    if (confirm('Are you sure you want to permanently delete this examination?')) {
      dbStore.deleteExam(examId, tenantId, getActor());
      refreshExams();
    }
  };

  const filtered = exams.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Examinations & Papers Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure question sets, download printable A4 OMR sheets, or update schedules.
          </p>
        </div>

        <button
          onClick={onOpenCreateExam}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Exam</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examinations by title or subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'live', 'scheduled', 'completed', 'draft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4">Exam Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">MCQs / Marks</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No examinations found in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{exam.title}</div>
                      <div className="text-[11px] text-slate-400">ID: {exam.id}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {exam.subject}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 tabular-nums">
                      {exam.totalQuestions} Q / {exam.totalMarks} pts
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {exam.durationMinutes} mins
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold capitalize ${
                          exam.status === 'live'
                            ? 'text-emerald-700'
                            : exam.status === 'scheduled'
                            ? 'text-blue-700'
                            : exam.status === 'completed'
                            ? 'text-slate-500'
                            : 'text-amber-700'
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => downloadOMRSheet(exam, currentTenant?.name)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          title="Download Printable A4 OMR Sheet PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>

                        {exam.status !== 'live' ? (
                          <button
                            onClick={() => handleToggleStatus(exam, 'live')}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Start / Make Exam Live"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(exam, 'completed')}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="Close Examination"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicate(exam)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          title="Duplicate Exam"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onViewResults(exam.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-medium text-[11px] hover:bg-blue-600 transition-colors"
                        >
                          Results
                        </button>

                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
