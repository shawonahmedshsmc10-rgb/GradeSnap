import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbStore } from '../lib/mockDatabase';
import { Tenant, User, UserRole } from '../types';

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  allTenants: Tenant[];
  role: UserRole;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isLoginModalOpen: boolean;
  isSignedOutView: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  continueAsGuest: () => void;
  loginWithEmail: (email: string, password: string) => AuthResult;
  loginStudentWithRoll: (rollNumber: string, tenantId: string, fullName?: string) => AuthResult;
  registerWorkspace: (params: {
    instituteName: string;
    instructorName: string;
    email: string;
    password: string;
  }) => AuthResult;
  loginAs: (userRole: UserRole, tenantId?: string, rollNumber?: string) => void;
  switchTenant: (tenantId: string) => void;
  logout: () => void;
  refreshData: () => void;
}

const SESSION_KEY = 'gradesnap_auth_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTenants, setAllTenants] = useState<Tenant[]>(() => dbStore.getTenants());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { userId?: string };
        if (parsed.userId) {
          return dbStore.getUserById(parsed.userId) || null;
        }
      }
    } catch {
      // Ignore storage read issues
    }
    return null;
  });

  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { userId?: string; tenantId?: string | null };
        if (parsed.userId) {
          const user = dbStore.getUserById(parsed.userId);
          if (user?.role === 'super_admin') return null;
          if (parsed.tenantId) {
            return dbStore.getTenantById(parsed.tenantId) || dbStore.getTenants()[0] || null;
          }
        }
      }
    } catch {
      // Ignore storage read issues
    }
    return dbStore.getTenants()[0] || null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignedOutView, setIsSignedOutView] = useState(false);

  const persistSession = (user: User | null, tenant: Tenant | null) => {
    try {
      if (user) {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ userId: user.id, tenantId: tenant?.id || null })
        );
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore storage write issues
    }
  };

  useEffect(() => {
    persistSession(currentUser, currentTenant);
  }, [currentUser, currentTenant]);

  const refreshData = () => {
    setAllTenants([...dbStore.getTenants()]);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const continueAsGuest = () => {
    setCurrentUser(null);
    setCurrentTenant(dbStore.getTenants()[0] || null);
    setIsSignedOutView(false);
    setIsLoginModalOpen(false);
    persistSession(null, null);
  };

  const loginWithEmail = (email: string, password: string): AuthResult => {
    const res = dbStore.authenticateByEmail(email, password);
    if (res.error || !res.user) {
      return { ok: false, error: res.error || 'Authentication failed.' };
    }
    setCurrentUser(res.user);
    setCurrentTenant(res.user.role === 'super_admin' ? null : res.tenant || null);
    setIsSignedOutView(false);
    setIsLoginModalOpen(false);
    refreshData();
    return { ok: true, user: res.user };
  };

  const loginStudentWithRoll = (
    rollNumber: string,
    tenantId: string,
    fullName?: string
  ): AuthResult => {
    const res = dbStore.loginOrRegisterStudent(rollNumber, tenantId, fullName);
    if (res.error || !res.user) {
      return { ok: false, error: res.error || 'Unable to sign in with Roll Number.' };
    }
    setCurrentUser(res.user);
    setCurrentTenant(res.tenant || dbStore.getTenants()[0] || null);
    setIsSignedOutView(false);
    setIsLoginModalOpen(false);
    refreshData();
    return { ok: true, user: res.user };
  };

  const registerWorkspace = (params: {
    instituteName: string;
    instructorName: string;
    email: string;
    password: string;
  }): AuthResult => {
    const res = dbStore.registerTeacherWorkspace(params);
    if (res.error || !res.user || !res.tenant) {
      return { ok: false, error: res.error || 'Could not create workspace.' };
    }
    refreshData();
    setCurrentUser(res.user);
    setCurrentTenant(res.tenant);
    setIsSignedOutView(false);
    setIsLoginModalOpen(false);
    return { ok: true, user: res.user };
  };

  const loginAs = (userRole: UserRole, tenantId?: string, rollNumber?: string) => {
    if (userRole === 'super_admin') {
      const admin = dbStore.getUsers().find((u) => u.role === 'super_admin');
      if (admin) {
        setCurrentUser(admin);
        setCurrentTenant(null);
      }
    } else if (userRole === 'teacher') {
      const targetTenantId = tenantId || allTenants[0]?.id;
      const teacher =
        dbStore.getUsers().find((u) => u.role === 'teacher' && u.tenantId === targetTenantId) || {
          id: `teacher-${Date.now()}`,
          name: 'Faculty Instructor',
          email: 'faculty@gradesnap.io',
          role: 'teacher' as UserRole,
          tenantId: targetTenantId,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        };
      setCurrentUser(teacher);
      const tenant = dbStore.getTenantById(targetTenantId);
      if (tenant) setCurrentTenant(tenant);
    } else {
      const targetTenantId = tenantId || allTenants[0]?.id;
      const student =
        dbStore.getUsers().find(
          (u) =>
            u.role === 'student' &&
            u.tenantId === targetTenantId &&
            (!rollNumber || u.studentRollNumber === rollNumber)
        ) || {
          id: `stu-${Date.now()}`,
          name: 'Student Candidate',
          email: 'candidate@student.edu',
          role: 'student' as UserRole,
          tenantId: targetTenantId,
          studentRollNumber: rollNumber || '104012',
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        };
      setCurrentUser(student);
      const tenant = dbStore.getTenantById(targetTenantId);
      if (tenant) setCurrentTenant(tenant);
    }
    setIsSignedOutView(false);
    setIsLoginModalOpen(false);
  };

  const switchTenant = (tenantId: string) => {
    const tenant = dbStore.getTenantById(tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      if (currentUser && currentUser.role === 'teacher') {
        const matchingTeacher = dbStore
          .getUsers()
          .find((u) => u.role === 'teacher' && u.tenantId === tenantId);
        if (matchingTeacher) setCurrentUser(matchingTeacher);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsSignedOutView(true);
    setIsLoginModalOpen(false);
    persistSession(null, null);
  };

  const isAuthenticated = Boolean(currentUser);
  const role: UserRole = currentUser?.role || 'student';
  const isSuperAdmin = role === 'super_admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTenant,
        allTenants,
        role,
        isAuthenticated,
        isSuperAdmin,
        isTeacher,
        isStudent,
        isLoginModalOpen,
        isSignedOutView,
        openLoginModal,
        closeLoginModal,
        continueAsGuest,
        loginWithEmail,
        loginStudentWithRoll,
        registerWorkspace,
        loginAs,
        switchTenant,
        logout,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
