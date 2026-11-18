import React, { useState, useMemo } from 'react';
import { Exam } from '../../types';
import { dbStore } from '../../lib/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  HelpCircle,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface AvailableExamsProps {
  onSelectExam: (exam: Exam) => void;
}

export const AvailableExams: React.FC<AvailableExamsProps> = ({ onSelectExam }) => {
  const { allTenants } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const allExams = useMemo(() => {
    return dbStore.getExams().filter((e) => e.published);
  }, []);

  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      const tenant = allTenants.find((t) => t.id === exam.tenantId);
      const tenantName = tenant ? tenant.name.toLowerCase() : '';
      const teacherName = exam.teacherName.toLowerCase();
      const examTitle = exam.title.toLowerCase();
      const subject = exam.subject.toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        examTitle.includes(query) ||
        teacherName.includes(query) ||
        tenantName.includes(query) ||
        subject.includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'live' && exam.status === 'live') ||
        (statusFilter === 'upcoming' && exam.status === 'scheduled') ||
        (statusFilter === 'completed' && exam.status === 'completed');

      return matchesSearch && matchesStatus;
    });
  }, [allExams, allTenants, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search examinations by title, teacher name, coaching centre..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            {(['all', 'live', 'upcoming', 'completed'] as const).map((tab) => {
              const label =
                tab === 'all'
                  ? 'All Exams'
                  : tab === 'live'
                  ? 'Live Exams'
                  : tab === 'upcoming'
                  ? 'Upcoming'
                  : 'Completed';

              const isActive = statusFilter === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-mono tabular-nums">{filteredExams.length}</strong> examinations
          </span>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800">No Examinations Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filter to find other active or upcoming tests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => {
            const tenant = allTenants.find((t) => t.id === exam.tenantId);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{tenant?.name || 'GradeSnap Academy'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium">
                      {exam.status === 'live' ? (
                        <span className="text-emerald-700 font-semibold">Live Now</span>
                      ) : exam.status === 'scheduled' ? (
                        <span className="text-blue-700">Upcoming</span>
                      ) : (
                        <span className="text-slate-500">Completed</span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {exam.title}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5">
                    <span>{exam.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>Teacher: {exam.teacherName}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {exam.description || 'Standard evaluation test.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <span className="text-xs font-semibold font-mono text-slate-800 tabular-nums">
                        {exam.durationMinutes} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Questions</span>
                      <span className="text-xs font-semibold font-mono text-slate-800 tabular-nums">
                        {exam.totalQuestions} MCQs
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Full Marks</span>
                      <span className="text-xs font-semibold font-mono text-slate-800 tabular-nums">
                        {exam.totalMarks}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectExam(exam)}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>View Examination</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
