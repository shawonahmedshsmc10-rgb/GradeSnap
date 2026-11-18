import React from 'react';
import { Exam } from '../../types';
import { downloadOMRSheet } from '../../lib/omrGenerator';
import {
  FileDown,
  Clock,
  Camera,
  FileCheck2,
  Calendar,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';

interface ExamDetailsModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onStartTimer: () => void;
  onCheckOMR: () => void;
}

export const ExamDetailsModal: React.FC<ExamDetailsModalProps> = ({
  exam,
  isOpen,
  onClose,
  onStartTimer,
  onCheckOMR,
}) => {
  if (!isOpen) return null;

  const handleDownloadOMR = () => {
    downloadOMRSheet(exam, exam.teacherName || 'GradeSnap Academy');
  };

  const handleDownloadQuestionPaper = () => {
    const content = `
================================================================================
GRADESNAP EXAMINATION PORTAL
Title: ${exam.title}
Subject: ${exam.subject} | Category: ${exam.category.toUpperCase()}
Total Questions: ${exam.totalQuestions} | Full Marks: ${exam.totalMarks}
Duration: ${exam.durationMinutes} Minutes | Negative Marking: -${exam.markingScheme.negativeMarks} per wrong answer
Teacher: ${exam.teacherName}
================================================================================

INSTRUCTIONS FOR CANDIDATE:
1. Each question carries ${exam.markingScheme.correctMarks} mark.
2. For each wrong answer, ${exam.markingScheme.negativeMarks} mark will be deducted.
3. Darken the appropriate circle on the official OMR Answer Sheet.
4. Use black/blue ballpoint pen only.

--- QUESTIONS (SAMPLE PREVIEW) ---
Q1. Which of the following is a fundamental SI base unit?
    [A] Newton  [B] Joule  [C] Kilogram  [D] Watt

Q2. What is the acceleration due to gravity on the surface of the Earth?
    [A] 9.8 m/s²  [B] 8.9 m/s²  [C] 10.5 m/s²  [D] 6.67 m/s²

Q3. The rate of change of momentum is directly proportional to:
    [A] Work done  [B] Applied Force  [C] Velocity  [D] Power

Q4. Which law states that total energy in an isolated system remains constant?
    [A] Ohm's Law  [B] Newton's 3rd Law  [C] Conservation of Energy  [D] Hooke's Law

... (Remaining ${exam.totalQuestions - 4} questions in full exam paper) ...
================================================================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exam.questionPaperFileName || `Question_Paper_${exam.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
              Examination Dossier & Action Center
            </span>
            <h3 className="text-lg font-bold text-slate-900 truncate max-w-md">
              {exam.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Duration</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {exam.durationMinutes} mins
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Total MCQs</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {exam.totalQuestions}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Total Marks</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {exam.totalMarks}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 text-center">
              <span className="text-[11px] text-red-600 font-medium block">Negative Mark</span>
              <span className="text-lg font-bold font-mono text-red-700 tabular-nums">
                -{exam.markingScheme.negativeMarks}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Conducted by: <strong className="text-slate-900">{exam.teacherName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Schedule: <strong className="text-slate-900">{new Date(exam.startTime).toLocaleDateString()}</strong> to{' '}
                <strong className="text-slate-900">{new Date(exam.endTime).toLocaleDateString()}</strong>
              </span>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block mb-0.5">Examination Instructions:</span>
                <p className="text-slate-600 leading-relaxed">
                  {exam.description || 'Attempt all questions within the allocated time. Each question has four choices (A, B, C, D). Ensure bubbles on the OMR sheet are shaded cleanly without smudges.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Examination Actions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadQuestionPaper}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all flex items-center gap-3 text-left group shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    1. Download Question Paper
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {exam.questionPaperFileName || 'Question_Paper.pdf'}
                  </span>
                </div>
              </button>

              <button
                onClick={handleDownloadOMR}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all flex items-center gap-3 text-left group shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    2. Download A4 OMR Sheet
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Printable vector PDF with fiducials
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onStartTimer();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all flex items-center gap-3 text-left group shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    3. Start Exam Timer
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {exam.durationMinutes} min full-screen countdown
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onCheckOMR();
                }}
                className="p-4 rounded-xl border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-3 text-left group shadow-md shadow-blue-500/20"
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">
                    4. Check / Evaluate OMR
                  </span>
                  <span className="text-[11px] text-blue-100 block">
                    Camera scan or gallery upload
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
