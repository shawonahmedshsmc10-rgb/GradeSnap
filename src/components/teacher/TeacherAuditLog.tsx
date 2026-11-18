import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import { AuditActionType, AuditLog } from '../../types';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Eye,
  X,
  FileCheck2,
  KeyRound,
  FileText,
  AlertTriangle,
  RotateCcw,
  Layers,
  ScanLine,
} from 'lucide-react';

interface TeacherAuditLogProps {
  tenantId?: string;
  isSuperAdminView?: boolean;
}

export const TeacherAuditLog: React.FC<TeacherAuditLogProps> = ({
  tenantId: propTenantId,
  isSuperAdminView = false,
}) => {
  const { currentTenant, currentUser } = useAuth();
  const effectiveTenantId = propTenantId || (isSuperAdminView ? undefined : currentTenant?.id);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Retrieve logs from store
  const logs = dbStore.getAuditLogs(effectiveTenantId, selectedFilter, searchQuery);

  // Compute summary metrics
  const allTenantLogs = dbStore.getAuditLogs(effectiveTenantId);
  const totalLogs = allTenantLogs.length;
  const omrOverrideCount = allTenantLogs.filter((l) => l.action === 'manual_omr_override').length;
  const answerKeyCount = allTenantLogs.filter((l) => l.action === 'answer_key_updated').length;
  const examEventCount = allTenantLogs.filter((l) =>
    ['exam_created', 'exam_updated', 'exam_status_changed', 'exam_deleted'].includes(l.action)
  ).length;
  const omrTemplateCount = allTenantLogs.filter((l) =>
    ['omr_template_created', 'omr_template_verified'].includes(l.action)
  ).length;

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'manual_omr_override':
        return {
          label: 'Manual OMR Override',
          color: 'text-purple-700 font-semibold',
          icon: FileCheck2,
        };
      case 'answer_key_updated':
        return {
          label: 'Answer Key Update',
          color: 'text-amber-700 font-semibold',
          icon: KeyRound,
        };
      case 'exam_created':
        return {
          label: 'Exam Created',
          color: 'text-blue-700 font-semibold',
          icon: FileText,
        };
      case 'exam_status_changed':
        return {
          label: 'Exam Status Changed',
          color: 'text-emerald-700 font-semibold',
          icon: CheckCircle2,
        };
      case 'exam_deleted':
        return {
          label: 'Exam Deleted',
          color: 'text-rose-700 font-semibold',
          icon: AlertTriangle,
        };
      case 'omr_template_created':
        return {
          label: 'OMR Template Created',
          color: 'text-indigo-700 font-semibold',
          icon: Layers,
        };
      case 'omr_template_verified':
        return {
          label: 'OMR Sheet CV Verified',
          color: 'text-teal-700 font-semibold',
          icon: ScanLine,
        };
      default:
        return {
          label: action.replace(/_/g, ' '),
          color: 'text-slate-700 font-semibold',
          icon: Clock,
        };
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'Log ID',
      'Timestamp (ISO)',
      'Tenant ID',
      'Action Type',
      'Performed By Name',
      'Performed By Email',
      'Actor Role',
      'Target ID',
      'Target Type',
      'Action Details',
    ];

    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.tenantId}"`,
      `"${l.action}"`,
      `"${l.performedBy.name}"`,
      `"${l.performedBy.email}"`,
      `"${l.performedBy.role}"`,
      `"${l.targetId || ''}"`,
      `"${l.targetType || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GradeSnap_AuditTrail_${effectiveTenantId || 'platform'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              {isSuperAdminView ? 'Platform-Wide Security Audit Trail' : 'Workspace Action & Security Audit Log'}
            </h3>
            <span className="text-xs font-semibold text-blue-700">
              · Protected Storage
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Collection:</span>
            <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              /tenants/{effectiveTenantId || '{tenantId}'}/auditLogs
            </span>
            <span>·</span>
            <span>Append-Only & Immutable ABAC Rules</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Critical Actions</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
            {totalLogs}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Logged with tamper-proof IDs</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-purple-700 font-medium block">Manual OMR Overrides</span>
          <span className="text-2xl font-bold text-purple-900 font-mono tabular-nums block mt-1">
            {omrOverrideCount}
          </span>
          <span className="text-[11px] text-purple-600/80 mt-0.5 block">Bubble inspection adjustments</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-amber-700 font-medium block">Answer Key Updates</span>
          <span className="text-2xl font-bold text-amber-900 font-mono tabular-nums block mt-1">
            {answerKeyCount}
          </span>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Matrix & option changes</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-blue-700 font-medium block">Exam Lifecycle Events</span>
          <span className="text-2xl font-bold text-blue-900 font-mono tabular-nums block mt-1">
            {examEventCount}
          </span>
          <span className="text-[11px] text-blue-600/80 mt-0.5 block">Creation, scheduling, status toggles</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Action Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({allTenantLogs.length})
            </button>
            <button
              onClick={() => setSelectedFilter('manual_omr_override')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === 'manual_omr_override'
                  ? 'bg-white text-purple-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OMR Overrides ({omrOverrideCount})
            </button>
            <button
              onClick={() => setSelectedFilter('answer_key_updated')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === 'answer_key_updated'
                  ? 'bg-white text-amber-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Answer Keys ({answerKeyCount})
            </button>
            <button
              onClick={() => setSelectedFilter('exam_created')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === 'exam_created'
                  ? 'bg-white text-blue-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exam Creation
            </button>
            <button
              onClick={() => setSelectedFilter('exam_status_changed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === 'exam_status_changed'
                  ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status Toggles
            </button>
            <button
              onClick={() => setSelectedFilter('omr_templates')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedFilter === 'omr_templates'
                  ? 'bg-white text-teal-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OMR Templates ({omrTemplateCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, user, roll, exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Performed By</th>
                {isSuperAdminView && <th className="py-3 px-4">Tenant</th>}
                <th className="py-3 px-4">Details & Outcome</th>
                <th className="py-3 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdminView ? 6 : 5}
                    className="py-12 text-center text-slate-400"
                  >
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const date = new Date(log.timestamp);
                  const formattedTime = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const formattedDate = date.toLocaleDateString();

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-800 font-medium tabular-nums">
                          {formattedDate} {formattedTime}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {log.id}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 ${badge.color}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{badge.label}</span>
                        </div>
                        {log.targetType && (
                          <div className="text-[10px] text-slate-400 capitalize">
                            Target: {log.targetType.replace(/_/g, ' ')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {log.performedBy.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {log.performedBy.email} · {log.performedBy.role}
                        </div>
                      </td>

                      {isSuperAdminView && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-slate-700">
                            {log.tenantId}
                          </span>
                        </td>
                      )}

                      <td className="py-3 px-4 max-w-md">
                        <p className="text-slate-800 text-xs leading-relaxed line-clamp-2">
                          {log.details}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700">
                    Audit Verification Payload
                  </span>
                  <span>·</span>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {new Date(selectedLog.timestamp).toISOString()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1 capitalize">
                  {selectedLog.action.replace(/_/g, ' ')}
                </h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenant Workspace:</span>
                  <span className="font-mono text-slate-800">{selectedLog.tenantId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actor Identity:</span>
                  <span className="text-slate-900 font-medium">
                    {selectedLog.performedBy.name} ({selectedLog.performedBy.email})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actor Role:</span>
                  <span className="text-slate-800 font-semibold uppercase font-mono text-[11px]">
                    {selectedLog.performedBy.role}
                  </span>
                </div>
                {selectedLog.targetId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Entity:</span>
                    <span className="font-mono text-slate-800">
                      {selectedLog.targetType} ({selectedLog.targetId})
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Action Description:</span>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-800 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <span className="font-semibold text-slate-900 block mb-1">
                    Structured Audit Metadata (JSON):
                  </span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
