import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import {
  Building2,
  Globe,
  Palette,
  CreditCard,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const TeacherSettings: React.FC = () => {
  const { currentTenant, switchTenant, refreshData } = useAuth();
  const tenantId = currentTenant?.id || 'tenant-apex';

  const [name, setName] = useState(currentTenant?.name || '');
  const [slug, setSlug] = useState(currentTenant?.slug || '');
  const [headerTitle, setHeaderTitle] = useState(
    currentTenant?.branding.headerTitle || ''
  );
  const [address, setAddress] = useState(
    currentTenant?.branding.instituteAddress || ''
  );
  const [phone, setPhone] = useState(currentTenant?.phone || '');
  const [supportEmail, setSupportEmail] = useState(
    currentTenant?.contactEmail || ''
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    dbStore.updateTenant(tenantId, {
      name: name.trim(),
      slug: slug.trim(),
      phone: phone.trim(),
      contactEmail: supportEmail.trim(),
      branding: {
        ...currentTenant.branding,
        headerTitle: headerTitle.trim(),
        instituteAddress: address.trim(),
        supportPhone: phone.trim(),
      },
    });

    setSavedSuccess(true);
    refreshData();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const exams = dbStore.getExams(tenantId);
  const submissions = dbStore.getSubmissions(undefined, tenantId);
  const plan = dbStore
    .getSubscriptions()
    .find((p) => p.plan === currentTenant?.plan);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Workspace branding and institute settings saved successfully.</span>
        </div>
      )}

      {/* Subscription & Quota Usage Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
              Commercial Subscription Tier
            </span>
            <h4 className="text-lg font-bold text-slate-900 capitalize">
              {plan?.name || `${currentTenant?.plan} Plan`}
            </h4>
          </div>

          <div className="text-right">
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {plan?.priceMonthly === 0 ? 'FREE' : `৳${plan?.priceMonthly}/month`}
            </div>
            <div className="text-[11px] text-slate-500">Active Billing Tier</div>
          </div>
        </div>

        {/* Quota Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Active Exams Quota</span>
              <span className="text-slate-900 font-mono tabular-nums">
                {exams.length} / {plan?.maxExams || 50}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (exams.length / (plan?.maxExams || 50)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-600">Monthly OMR Evaluations</span>
              <span className="text-slate-900 font-mono tabular-nums">
                {submissions.length} / {plan?.maxSubmissionsPerMonth || 2500}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (submissions.length / (plan?.maxSubmissionsPerMonth || 2500)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Institute Branding & URL Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
      >
        <div className="pb-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-900">
            Institute Branding & Portal Settings
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize how your coaching center appears to students on their dedicated portal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Coaching / Institute Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tenant Slug (Subdomain URL) *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500">
                gradesnap.com/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-r-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Student Portal Header Title
          </label>
          <input
            type="text"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Physical Campus Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Helpline Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Workspace Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
