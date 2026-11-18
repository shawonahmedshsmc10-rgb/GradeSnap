import React, { useState } from 'react';
import { dbStore } from '../../lib/mockDatabase';
import { SubscriptionPlan, Tenant } from '../../types';
import { TeacherAuditLog } from '../teacher/TeacherAuditLog';
import {
  Building2,
  Users,
  FileCheck2,
  DollarSign,
  Plus,
  ShieldCheck,
  Power,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentTab: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentTab }) => {
  const [tenants, setTenants] = useState<Tenant[]>(dbStore.getTenants());
  const [subscriptions, setSubscriptions] = useState(dbStore.getSubscriptions());
  const stats = dbStore.getPlatformStats();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('pro');

  const refreshTenants = () => {
    setTenants([...dbStore.getTenants()]);
  };

  const handleToggleStatus = (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    dbStore.updateTenant(tenant.id, { status: newStatus });
    refreshTenants();
  };

  const handleChangePlan = (tenantId: string, plan: SubscriptionPlan) => {
    dbStore.updateTenant(tenantId, { plan });
    refreshTenants();
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) return;

    dbStore.createTenant({
      name: newTenantName.trim(),
      slug: newTenantSlug.trim(),
      ownerEmail: newOwnerEmail.trim() || 'owner@coaching.edu',
      contactEmail: newOwnerEmail.trim() || 'info@coaching.edu',
      phone: '+880 1711-000000',
      plan: newPlan,
      status: 'active',
      branding: {
        headerTitle: `${newTenantName} - Examination Portal`,
        instituteAddress: 'Dhaka, Bangladesh',
      },
    });

    setNewTenantName('');
    setNewTenantSlug('');
    setNewOwnerEmail('');
    setShowCreateModal(false);
    refreshTenants();
  };

  if (currentTab === 'admin-audit') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <TeacherAuditLog isSuperAdminView={true} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Platform Analytics Metrics (Prompt Part 7) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              GradeSnap SaaS Platform Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin multi-tenant control center & global metrics.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Coaching Centre</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Tenants</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {stats.totalTenants}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Coaching Centres</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Students</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {stats.totalStudents}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Active Registrations</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Examinations</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {stats.totalExams}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              {stats.liveExams} Live Now
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">OMR Scans</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {stats.totalSubmissions}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">CV Processed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <span className="text-xs font-medium text-slate-500 block">Simulated MRR</span>
            <span className="text-2xl font-bold font-mono text-blue-600 mt-1 block tabular-nums">
              ৳{stats.mrr.toLocaleString()}
            </span>
            <span className="text-[11px] text-blue-500 mt-0.5 block">Monthly Revenue</span>
          </div>
        </div>
      </div>

      {/* Teacher / Tenant Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Registered Coaching Centres & Workspaces
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage tenant isolation, change subscription limits, or suspend workspaces.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active Accounts: <strong className="text-slate-900 font-mono">{stats.activeSubscriptions}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Institute Name</th>
                <th className="py-3 px-4">Workspace URL</th>
                <th className="py-3 px-4">Director Email</th>
                <th className="py-3 px-4">Subscription Tier</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{tenant.name}</div>
                    <div className="text-[11px] text-slate-400">ID: {tenant.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-700">
                    gradesnap.com/{tenant.slug}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{tenant.ownerEmail}</td>
                  <td className="py-3 px-4">
                    <select
                      value={tenant.plan}
                      onChange={(e) =>
                        handleChangePlan(tenant.id, e.target.value as SubscriptionPlan)
                      }
                      className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    >
                      <option value="free">Free (50/mo)</option>
                      <option value="basic">Basic (500/mo)</option>
                      <option value="pro">Pro (2,500/mo)</option>
                      <option value="enterprise">Enterprise (25k/mo)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-semibold capitalize ${
                        tenant.status === 'active' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(tenant)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        tenant.status === 'active'
                          ? 'text-red-700 hover:bg-red-50 border border-red-200'
                          : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Plans & Quota Limits (Prompt Part 7) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Commercial Subscription Plans & Feature Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.plan}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  {sub.name}
                </span>
                <div className="mt-2 mb-3">
                  <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {sub.priceMonthly === 0 ? 'Free' : `৳${sub.priceMonthly.toLocaleString()}`}
                  </span>
                  {sub.priceMonthly > 0 && (
                    <span className="text-xs text-slate-400"> / month</span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Active Exams:</span>
                    <strong className="text-slate-900 font-mono">
                      {sub.maxExams > 1000 ? 'Unlimited' : sub.maxExams}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly OMRs:</span>
                    <strong className="text-slate-900 font-mono">
                      {sub.maxSubmissionsPerMonth.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custom Branding:</span>
                    <strong className="text-slate-900">{sub.customBranding ? 'Yes' : 'No'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Priority Support:</span>
                    <strong className="text-slate-900">{sub.prioritySupport ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 block">
                  Managed via GradeSnap Billing Engine
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboard New Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <form
            onSubmit={handleCreateTenant}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Onboard New Coaching Tenant
              </h4>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institute / Coaching Name *
              </label>
              <input
                type="text"
                required
                value={newTenantName}
                onChange={(e) => {
                  setNewTenantName(e.target.value);
                  if (!newTenantSlug) {
                    setNewTenantSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                    );
                  }
                }}
                placeholder="e.g. Udvash Academic Care"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workspace Slug URL *
              </label>
              <input
                type="text"
                required
                value={newTenantSlug}
                onChange={(e) => setNewTenantSlug(e.target.value)}
                placeholder="e.g. udvash-care"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Director / Teacher Email *
              </label>
              <input
                type="email"
                required
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
                placeholder="director@coaching.edu"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Subscription Tier
              </label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as SubscriptionPlan)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="free">Free Starter</option>
                <option value="basic">Basic (৳2,500/mo)</option>
                <option value="pro">Pro Academy (৳6,000/mo)</option>
                <option value="enterprise">Enterprise (৳15,000/mo)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
