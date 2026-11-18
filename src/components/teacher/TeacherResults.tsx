import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import {
  Download,
  Search,
  Trophy,
} from 'lucide-react';

interface TeacherResultsProps {
  selectedExamId?: string;
}

export const TeacherResults: React.FC<TeacherResultsProps> = ({ selectedExamId }) => {
  const { currentTenant } = useAuth();
  const tenantId = currentTenant?.id;

  const exams = dbStore.getExams(tenantId);
  const [activeExamId, setActiveExamId] = useState<string>(
    selectedExamId || exams[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'marks' | 'roll'>('marks');

  const currentExam = exams.find((e) => e.id === activeExamId);
  const allSubmissions = dbStore.getSubmissions(activeExamId, tenantId);

  const rankedSubmissions = useMemo(() => {
    const sorted = [...allSubmissions].sort((a, b) => b.score.finalScore - a.score.finalScore);
    return sorted.map((s, idx) => ({
      ...s,
      calculatedRank: idx + 1,
    }));
  }, [allSubmissions]);

  const displayedList = useMemo(() => {
    let list = [...rankedSubmissions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentRollNumber.toLowerCase().includes(q) ||
          (s.studentName && s.studentName.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'roll') {
      list.sort((a, b) => a.studentRollNumber.localeCompare(b.studentRollNumber));
    } else {
      list.sort((a, b) => b.score.finalScore - a.score.finalScore);
    }

    return list;
  }, [rankedSubmissions, searchQuery, sortBy]);

  const analytics = useMemo(() => {
    if (allSubmissions.length === 0) {
      return { avg: 0, high: 0, low: 0, passPct: 0 };
    }
    const scores = allSubmissions.map((s) => s.score.finalScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Number((sum / scores.length).toFixed(2));
    const high = Math.max(...scores);
    const low = Math.min(...scores);
    const passThreshold = (currentExam?.totalMarks || 20) * 0.4;
    const passed = allSubmissions.filter((s) => s.score.finalScore >= passThreshold).length;
    const passPct = Number(((passed / allSubmissions.length) * 100).toFixed(1));

    return { avg, high, low, passPct };
  }, [allSubmissions, currentExam]);

  const handleExportCSV = () => {
    if (!currentExam) return;
    const headers = [
      'Rank',
      'Roll Number',
      'Student Name',
      'Attempted',
      'Correct',
      'Incorrect',
      'Unanswered',
      'Final Score',
      'Percentage',
      'Submitted At',
    ];

    const rows = rankedSubmissions.map((s) => [
      s.calculatedRank,
      s.studentRollNumber,
      `"${s.studentName || 'Candidate'}"`,
      s.score.attempted,
      s.score.correct,
      s.score.incorrect + s.score.multipleMarked,
      s.score.unanswered,
      s.score.finalScore,
      `${s.score.percentage}%`,
      `"${new Date(s.submittedAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GradeSnap_Results_${currentExam.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Results & Ranking Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time score audit, merit list generation, and exportable grade books.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={activeExamId}
            onChange={(e) => setActiveExamId(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 sm:w-64"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-medium text-slate-500 block">Average Score</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            {analytics.avg}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            out of {currentExam?.totalMarks || 20} pts
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-medium text-slate-500 block">Highest Score</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block tabular-nums">
            {analytics.high}
          </span>
          <span className="text-[11px] text-emerald-600/80 block mt-0.5">Top Merit Mark</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-medium text-slate-500 block">Lowest Score</span>
          <span className="text-2xl font-bold font-mono text-slate-700 mt-1 block tabular-nums">
            {analytics.low}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Floor Benchmark</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-medium text-slate-500 block">Pass Percentage</span>
          <span className="text-2xl font-bold font-mono text-blue-600 mt-1 block tabular-nums">
            {analytics.passPct}%
          </span>
          <span className="text-[11px] text-blue-500 block mt-0.5">≥40% Threshold</span>
        </div>
      </div>

      {currentExam && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
            Question-Wise Correct Response Frequency (MCQ Difficulty Breakdown)
          </span>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: currentExam.totalQuestions }, (_, i) => i + 1).map((q) => {
              const answerKey = dbStore.getAnswerKey(currentExam.id, tenantId, false);
              const correctOpts = answerKey?.answers[q] || [];

              const totalAttemptsOnQ = allSubmissions.filter((s) => s.detectedAnswers[q]?.detectedAnswer).length;
              const correctAttemptsOnQ = allSubmissions.filter((s) => {
                const ans = s.detectedAnswers[q]?.detectedAnswer;
                return ans && correctOpts.includes(ans);
              }).length;

              const pct =
                totalAttemptsOnQ > 0
                  ? Math.round((correctAttemptsOnQ / allSubmissions.length) * 100)
                  : 80;

              return (
                <div key={q} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-700 font-mono block">
                    Q{q}
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 75 ? 'bg-emerald-500' : pct > 45 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1 tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by roll number or student name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <button
              onClick={() => setSortBy('marks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                sortBy === 'marks'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Merit Rank (Score)
            </button>
            <button
              onClick={() => setSortBy('roll')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                sortBy === 'roll'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Roll Number
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate Roll</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Attempted</th>
                <th className="py-3 px-4">Correct</th>
                <th className="py-3 px-4">Incorrect</th>
                <th className="py-3 px-4">Final Score</th>
                <th className="py-3 px-4">Accuracy %</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No results recorded for this examination yet.
                  </td>
                </tr>
              ) : (
                displayedList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                        {item.calculatedRank === 1 && (
                          <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <span>#{item.calculatedRank}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.studentRollNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {item.studentName || 'Candidate'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {item.score.attempted} / {currentExam?.totalQuestions || 20}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-emerald-600 font-semibold">
                      {item.score.correct}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-red-600">
                      {item.score.incorrect + item.score.multipleMarked}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {item.score.finalScore}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700 tabular-nums">
                      {item.score.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'manual_reviewed' ? (
                        <span className="text-xs font-medium text-purple-700">
                          Overridden
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700">
                          Verified
                        </span>
                      )}
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
