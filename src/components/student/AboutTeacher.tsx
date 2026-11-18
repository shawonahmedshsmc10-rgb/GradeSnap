import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
} from 'lucide-react';

export const AboutTeacher: React.FC = () => {
  const { currentTenant } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {currentTenant?.slug === 'science-care'
                ? 'Dr. Tariq Rahman, MBBS, FCPS'
                : 'Prof. Anisul Haque, M.Sc'}
            </h3>
            <span className="text-xs text-indigo-600 font-semibold block">
              {currentTenant?.slug === 'science-care'
                ? 'Chief Faculty & Medical Admission Mentor'
                : 'Senior Physics & Engineering Coordinator'}
            </span>
            <span className="text-xs text-slate-500 block">
              {currentTenant?.name || 'GradeSnap Academy'}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            With over 14 years of dedicated experience mentoring competitive examination candidates,
            our coaching curriculum leverages structured evaluation frameworks, instant OMR feedback,
            and high-precision performance analytics.
          </p>
          <p>
            Our examination architecture is calibrated to mirror the official national board, medical admission
            (DGHS), and BUET engineering standards. Every model test includes detailed question-wise difficulty
            matrices and verified marking schemes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              Top Tier Results
            </span>
            <span className="text-[11px] text-slate-500">
              Over 450+ students placed in public medical colleges and BUET engineering.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-900 block mb-1">
              Instant OMR Feedback
            </span>
            <span className="text-[11px] text-slate-500">
              Automated computer-vision verification with penalty deduction audit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
