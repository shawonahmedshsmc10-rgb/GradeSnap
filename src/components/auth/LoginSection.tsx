import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../lib/mockDatabase';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

interface LoginSectionProps {
  variant?: 'page' | 'modal';
  onClose?: () => void;
  onSuccess?: (role: 'student' | 'teacher' | 'super_admin') => void;
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  variant = 'modal',
  onClose,
  onSuccess,
}) => {
  const {
    allTenants,
    currentTenant,
    loginWithEmail,
    loginStudentWithRoll,
    registerWorkspace,
    loginAs,
    continueAsGuest,
  } = useAuth();

  const [portalMode, setPortalMode] = useState<'student' | 'staff'>('student');
  const [staffSubMode, setStaffSubMode] = useState<'signin' | 'register'>('signin');

  // Student form state
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    currentTenant?.id || allTenants[0]?.id || 'tenant-apex'
  );
  const [rollNumber, setRollNumber] = useState<string>('');
  const [studentFullName, setStudentFullName] = useState<string>('');

  // Teacher / Admin sign-in state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // New Institute Registration state
  const [instituteName, setInstituteName] = useState<string>('');
  const [instructorName, setInstructorName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  const matchedStudent = useMemo(() => {
    if (rollNumber.trim().length < 3) return undefined;
    return dbStore.findStudentByRoll(rollNumber, selectedTenantId);
  }, [rollNumber, selectedTenantId]);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginStudentWithRoll(rollNumber, selectedTenantId, studentFullName);
    if (!res.ok) {
      setError(res.error || 'Could not sign in.');
      return;
    }
    onSuccess?.('student');
    onClose?.();
  };

  const handleStaffSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginWithEmail(email, password);
    if (!res.ok || !res.user) {
      setError(res.error || 'Invalid credentials.');
      return;
    }
    onSuccess?.(res.user.role);
    onClose?.();
  };

  const handleRegisterWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = registerWorkspace({
      instituteName,
      instructorName,
      email: regEmail,
      password: regPassword,
    });
    if (!res.ok || !res.user) {
      setError(res.error || 'Registration failed.');
      return;
    }
    onSuccess?.(res.user.role);
    onClose?.();
  };

  const handleQuickDemo = (
    demoRole: 'student' | 'teacher' | 'super_admin',
    tenantId?: string,
    roll?: string
  ) => {
    setError(null);
    loginAs(demoRole, tenantId, roll);
    onSuccess?.(demoRole);
    onClose?.();
  };

  const cardContent = (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Sign in to GradeSnap
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your portal to continue
            </p>
          </div>
        </div>

        {variant === 'modal' && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Segmented Tabs */}
      <div className="px-6 pt-5">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setPortalMode('student');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              portalMode === 'student'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalMode('staff');
              setError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              portalMode === 'staff'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Teacher & Admin</span>
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {portalMode === 'student' ? (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Coaching Institute
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {allTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Candidate Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 104012"
                required
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
              />
              {matchedStudent && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Enrolled: {matchedStudent.name}
                    {matchedStudent.batch ? ` · ${matchedStudent.batch}` : ''}
                  </span>
                </div>
              )}
            </div>

            {rollNumber.trim().length >= 3 && !matchedStudent && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name (New Candidate)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Continue to Exams</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : staffSubMode === 'signin' ? (
          <form onSubmit={handleStaffSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@apexacademy.edu"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStaffSubMode('register');
                  setError(null);
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                New coaching centre? Create a Teacher Workspace
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterWorkspace} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coaching / Institute Name
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. Dhaka Science Scholars"
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Instructor Name
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. Prof. Mahmudul Hasan"
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@institute.edu"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Create Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStaffSubMode('signin');
                  setError(null);
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Already have an account? Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Access */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Instant Demo Access</span>
            <span className="font-mono text-[10px] text-slate-400">1-click workspace preview</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student', 'tenant-apex', '104012')}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-900 block">Student Demo</span>
              <span className="text-[10px] font-mono text-slate-500 block">Roll 104012</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher', 'tenant-apex')}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-900 block">Apex Teacher</span>
              <span className="text-[10px] text-slate-500 block truncate">teacher@apexacademy.edu</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher', 'tenant-sciencecare')}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-900 block">Science Care</span>
              <span className="text-[10px] text-slate-500 block truncate">dr.rahman@sciencecare.org</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('super_admin')}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-900 block">Super Admin</span>
              <span className="text-[10px] text-slate-500 block truncate">admin@gradesnap.io</span>
            </button>
          </div>
        </div>

        {/* Public Exam Browsing Escape Hatch */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              continueAsGuest();
              onSuccess?.('student');
              onClose?.();
            }}
            className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-4"
          >
            Browse public exams without signing in
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {cardContent}
    </div>
  );
};
