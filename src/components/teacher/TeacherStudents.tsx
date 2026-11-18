import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import { Student } from '../../types';
import {
  UserPlus,
  Upload,
  Search,
  X,
} from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const { currentTenant } = useAuth();
  const tenantId = currentTenant?.id || 'tenant-apex';

  const [students, setStudents] = useState<Student[]>(dbStore.getStudents(tenantId));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [batch, setBatch] = useState('HSC-2026 Medical Batch A');

  const [csvText, setCsvText] = useState(
    `Roll,Name,Email,Phone,Batch\n104030,Kamal Hossain,kamal@example.com,+880 1712-112233,HSC-2026 Batch B\n104031,Nusrat Jahan,nusrat@example.com,+880 1812-223344,HSC-2026 Batch B`
  );

  const refreshList = () => {
    setStudents([...dbStore.getStudents(tenantId)]);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber) return;

    dbStore.addStudent({
      tenantId,
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      batch: batch.trim(),
    });

    setName('');
    setRollNumber('');
    setEmail('');
    setPhone('');
    refreshList();
    setShowAddModal(false);
  };

  const handleImportCSV = () => {
    const lines = csvText.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        dbStore.addStudent({
          tenantId,
          rollNumber: parts[0],
          name: parts[1],
          email: parts[2] || '',
          phone: parts[3] || '',
          batch: parts[4] || 'Imported Batch',
        });
      }
    }

    refreshList();
    setShowImportModal(false);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.batch && s.batch.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Student Roster & Cohort Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, batch assignments, and performance history within your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by roll number, name or batch..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total Enrolled: <strong className="text-slate-900 font-mono">{students.length}</strong>
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Batch / Section</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Exams Evaluated</th>
                <th className="py-3 px-4 text-right">Average Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students registered in this workspace yet.
                  </td>
                </tr>
              ) : (
                filtered.map((stu) => {
                  const subs = dbStore
                    .getSubmissions(undefined, tenantId)
                    .filter((s) => s.studentRollNumber === stu.rollNumber);
                  const avgScore =
                    subs.length > 0
                      ? (
                          subs.reduce((sum, s) => sum + s.score.percentage, 0) /
                          subs.length
                        ).toFixed(1)
                      : 'N/A';

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {stu.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {stu.name}
                        {stu.email && (
                          <span className="text-[11px] text-slate-400 block font-normal">
                            {stu.email}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {stu.batch || 'General Batch'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {stu.phone || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                        {subs.length} Tests
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {avgScore !== 'N/A' ? `${avgScore}%` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <form
            onSubmit={handleAddStudent}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Add New Student</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shakib Al Hasan"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 104050"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch / Section
                </label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. Medical Batch A"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1711..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Student
              </button>
            </div>
          </form>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Bulk Import Students via CSV
              </h4>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste your CSV data below (Headers: Roll, Name, Email, Phone, Batch):
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Process & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
