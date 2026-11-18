import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
} from 'lucide-react';

export const TeacherContact: React.FC = () => {
  const { currentTenant } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {currentTenant?.name || 'GradeSnap Academy'}
            </h3>
            <span className="text-xs text-slate-500">
              Official Student Helpdesk & Examination Centre
            </span>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Helpline Phone
              </span>
              <a
                href={`tel:${currentTenant?.phone || '+8801711234567'}`}
                className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                {currentTenant?.phone || '+880 1711-234567'}
              </a>
              <span className="text-xs text-slate-500 block mt-0.5">
                Available Saturday to Thursday, 9:00 AM – 8:00 PM
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Inquiries
              </span>
              <a
                href={`mailto:${currentTenant?.contactEmail || 'support@gradesnap.io'}`}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                {currentTenant?.contactEmail || 'support@apexacademy.edu'}
              </a>
              <span className="text-xs text-slate-500 block mt-0.5">
                For answer key clarifications and re-check requests
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Campus Location
              </span>
              <p className="text-slate-800 font-medium">
                {currentTenant?.branding.instituteAddress || 'Farmgate, Dhaka - 1215, Bangladesh'}
              </p>
              <span className="text-xs text-slate-500 block mt-0.5">
                Physical examination hall & advisory office
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Office Hours
              </span>
              <p className="text-slate-800">
                Morning Shift: 08:00 AM – 01:00 PM<br />
                Evening Shift: 03:00 PM – 09:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
