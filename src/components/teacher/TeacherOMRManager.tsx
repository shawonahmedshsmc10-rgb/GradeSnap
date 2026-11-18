import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import { evaluateOMR } from '../../lib/omrEngine';
import { OMRSubmission } from '../../types';
import {
  Search,
  AlertTriangle,
  Sliders,
  History,
  X,
  RefreshCw,
} from 'lucide-react';

interface TeacherOMRManagerProps {
  initialSelectedSubmission?: OMRSubmission | null;
}

export const TeacherOMRManager: React.FC<TeacherOMRManagerProps> = ({
  initialSelectedSubmission,
}) => {
  const { currentTenant, currentUser } = useAuth();
  const tenantId = currentTenant?.id;

  const [submissions, setSubmissions] = useState<OMRSubmission[]>(
    dbStore.getSubmissions(undefined, tenantId)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<OMRSubmission | null>(
    initialSelectedSubmission || null
  );

  const [overrideQNum, setOverrideQNum] = useState<number>(1);
  const [overrideAnswer, setOverrideAnswer] = useState<string>('A');
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [recheckNotice, setRecheckNotice] = useState<string | null>(null);

  useEffect(() => {
    const fresh = [...dbStore.getSubmissions(undefined, tenantId)];
    setSubmissions(fresh);
    if (initialSelectedSubmission && initialSelectedSubmission.tenantId === tenantId) {
      setSelectedSub(initialSelectedSubmission);
    }
  }, [tenantId, initialSelectedSubmission]);

  const refreshList = () => {
    setSubmissions([...dbStore.getSubmissions(undefined, tenantId)]);
  };

  const handleRecheckCV = async () => {
    if (!selectedSub) return;
    if (!selectedSub.imageUrl || !selectedSub.imageUrl.startsWith('data:image')) {
      setRecheckNotice('No stored raster scan image on this legacy sample. Use Manual Override or verify a sheet in OMR Designer.');
      return;
    }
    const exam = dbStore.getExamById(selectedSub.examId, tenantId);
    const key = dbStore.getAnswerKey(selectedSub.examId);
    if (!exam || !key) {
      setRecheckNotice('Exam configuration or answer key missing for CV recheck.');
      return;
    }
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Failed to decode stored OMR scan image.'));
        el.src = selectedSub.imageUrl!;
      });
      const res = await evaluateOMR(
        img,
        exam.totalQuestions,
        exam.optionsPerQuestion || 4,
        key,
        exam.markingScheme
      );
      setRecheckNotice(
        `CV Recheck Complete: Detected ${Object.values(res.detectedAnswers).filter((d) => d.detectedAnswer).length}/${exam.totalQuestions} marks · Roll ${res.detectedRollNumber} · Score ${res.score.finalScore} pts`
      );
    } catch (err) {
      setRecheckNotice(err instanceof Error ? err.message : 'CV recheck failed.');
    }
  };

  const handleApplyOverride = () => {
    if (!selectedSub) return;
    const actor = {
      userId: currentUser?.id || 'teacher-lead',
      name: currentUser?.name || 'Faculty Lead',
      email: currentUser?.email || 'teacher@gradesnap.io',
      role: (currentUser?.role || 'teacher') as any,
    };
    const updated = dbStore.overrideSubmissionAnswer(
      selectedSub.id,
      overrideQNum,
      overrideAnswer || null,
      currentUser?.name || 'Teacher Faculty',
      tenantId,
      actor
    );
    if (updated) {
      setSelectedSub({ ...updated });
      refreshList();
      setShowOverrideModal(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.studentRollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentName && s.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            OMR Submissions & Quality Audit
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review machine-detected bubbles, inspect optical confidence scores, and resolve ambiguous markings with audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            Total Evaluated: <strong className="text-slate-900 font-mono">{submissions.length}</strong>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'flagged', 'manual_reviewed', 'processed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {s === 'all'
                ? 'All Submissions'
                : s === 'flagged'
                ? 'Flagged for Review'
                : s === 'manual_reviewed'
                ? 'Manually Overridden'
                : 'Processed Clean'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Submissions ({filtered.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No submissions matching this filter.
              </div>
            ) : (
              filtered.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          Roll: {sub.studentRollNumber}
                        </span>
                        {sub.status === 'flagged' && (
                          <span className="text-[11px] font-semibold text-amber-700">
                            · Ambiguous
                          </span>
                        )}
                        {sub.status === 'manual_reviewed' && (
                          <span className="text-[11px] font-semibold text-purple-700">
                            · Overridden
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {sub.studentName || 'Candidate'} · {new Date(sub.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-slate-900 block tabular-nums">
                        {sub.score.finalScore} pts
                      </span>
                      <span className="text-[10px] text-slate-400 block tabular-nums">
                        {sub.score.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          {selectedSub ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Submission Inspector: {selectedSub.studentRollNumber}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600">{selectedSub.studentName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecheckCV}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recheck CV</span>
                  </button>
                  <button
                    onClick={() => setShowOverrideModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Manual Override</span>
                  </button>
                </div>
              </div>

              {recheckNotice && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-2">
                  <span>{recheckNotice}</span>
                  <button
                    onClick={() => setRecheckNotice(null)}
                    className="text-blue-600 hover:text-blue-900 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Final Score</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedSub.score.finalScore}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-600 block">Correct</span>
                  <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                    {selectedSub.score.correct}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
                  <span className="text-[10px] text-red-600 block">Incorrect</span>
                  <span className="text-base font-bold font-mono text-red-700 tabular-nums">
                    {selectedSub.score.incorrect + selectedSub.score.multipleMarked}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Unanswered</span>
                  <span className="text-base font-bold font-mono text-slate-700 tabular-nums">
                    {selectedSub.score.unanswered}
                  </span>
                </div>
              </div>

              {selectedSub.flaggedReasons.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ambiguity Flags:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-0.5">
                    {selectedSub.flaggedReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Computer Vision Detected Answers
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Q#</th>
                        <th className="py-2 px-3">Detected</th>
                        <th className="py-2 px-3">Confidence</th>
                        <th className="py-2 px-3">Raw Optical Density</th>
                        <th className="py-2 px-3">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {Object.keys(selectedSub.detectedAnswers).map((qKey) => {
                        const q = Number(qKey);
                        const d = selectedSub.detectedAnswers[q];
                        return (
                          <tr key={q} className="hover:bg-slate-50/70">
                            <td className="py-1.5 px-3 font-bold text-slate-900">{q}</td>
                            <td className="py-1.5 px-3">
                              {d.isMultiple ? (
                                <span className="text-red-600 font-bold">MULTIPLE</span>
                              ) : d.detectedAnswer ? (
                                <span className="font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-50">
                                  {d.detectedAnswer}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="py-1.5 px-3 tabular-nums">
                              {Math.round(d.confidence * 100)}%
                            </td>
                            <td className="py-1.5 px-3 text-[11px] text-slate-500 font-sans">
                              {d.rawFillRatios
                                ? Object.entries(d.rawFillRatios)
                                    .map(([opt, fill]) => `${opt}:${Math.round(fill * 100)}%`)
                                    .join(' ')
                                : 'N/A'}
                            </td>
                            <td className="py-1.5 px-3 font-sans">
                              {d.isAmbiguous ? (
                                <span className="text-amber-700 text-[10px] font-bold">Ambiguous</span>
                              ) : d.isMultiple ? (
                                <span className="text-red-700 text-[10px] font-bold">Double Shaded</span>
                              ) : (
                                <span className="text-emerald-700 text-[10px]">Clean</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audit Trail</span>
                </span>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {selectedSub.auditLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-900 font-mono text-[10px] block">
                          [{log.action}] by {log.performedBy}
                        </span>
                        <p className="text-slate-600 mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">
              Select an OMR submission from the list to inspect answers, confidence, and audit trail.
            </div>
          )}
        </div>
      </div>

      {showOverrideModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Manual Answer Override & Recalculation
              </h4>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Teacher correction for Roll No: <strong className="text-slate-800 font-mono">{selectedSub.studentRollNumber}</strong>. An immutable audit trail entry will be created.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Number
                </label>
                <select
                  value={overrideQNum}
                  onChange={(e) => setOverrideQNum(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                >
                  {Object.keys(selectedSub.detectedAnswers).map((q) => (
                    <option key={q} value={q}>
                      Question {q}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corrected Answer
                </label>
                <select
                  value={overrideAnswer}
                  onChange={(e) => setOverrideAnswer(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                  <option value="E">Option E</option>
                  <option value="">Unanswered (Blank)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyOverride}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Apply & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
