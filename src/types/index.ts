export type UserRole = 'super_admin' | 'teacher' | 'student';

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  headerTitle?: string;
  instituteAddress?: string;
  supportPhone?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  contactEmail: string;
  phone: string;
  plan: SubscriptionPlan;
  status: 'active' | 'suspended';
  branding: TenantBranding;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  studentRollNumber?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Student {
  id: string;
  tenantId: string;
  name: string;
  rollNumber: string;
  email?: string;
  phone?: string;
  batch?: string;
  createdAt: string;
}

export type ExamCategory = 'standard' | 'competitive' | 'medical' | 'engineering' | 'board';
export type ExamStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'archived';

export interface MarkingScheme {
  correctMarks: number;
  negativeMarks: number;
  unansweredMarks: number;
  customQuestionMarks?: Record<number, { correct: number; negative: number }>;
}

export interface Exam {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  subject: string;
  category: ExamCategory;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: ExamStatus;
  published: boolean;
  allowLateSubmission: boolean;
  maxSubmissions?: number;
  markingScheme: MarkingScheme;
  questionPaperFileName?: string;
  questionPaperUrl?: string;
  omrTemplateId: string;
  optionsPerQuestion: 4 | 5;
  allowMultipleCorrect: boolean;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerKey {
  id: string;
  examId: string;
  tenantId: string;
  answers: Record<number, string[]>;
  allowMultipleCorrect: boolean;
  optionsPerQuestion: 4 | 5;
  isReleased: boolean;
  releaseAt?: string;
  updatedAt: string;
}

export interface OMRTemplate {
  id: string;
  name: string;
  version: string;
  questionCount: number;
  optionsCount: 4 | 5;
  rollNumberDigits: number;
}

export interface CustomOMRSheetTemplate {
  id: string;
  tenantId: string;
  name: string;
  examId?: string;
  examTitle: string;
  subject: string;
  sheetVersion: string;
  totalQuestions: number;
  optionsPerQuestion: 4 | 5;
  rollNumberDigits: 6;
  instituteName: string;
  headerSubtitle: string;
  instructions: string;
  includeBatchField: boolean;
  includeCandidateSign: boolean;
  includeInvigilatorSign: boolean;
  accentColor: string;
  lastVerifiedAt?: string;
  lastVerifiedAccuracy?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetectedAnswer {
  questionNumber: number;
  detectedAnswer: string | null;
  confidence: number;
  isAmbiguous: boolean;
  isMultiple: boolean;
  rawFillRatios: Record<string, number>;
}

export interface EvaluationScore {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  multipleMarked: number;
  obtainedMarks: number;
  negativeMarksDeducted: number;
  finalScore: number;
  percentage: number;
  rank?: number;
}

export type AuditActionType =
  | 'exam_created'
  | 'exam_updated'
  | 'exam_status_changed'
  | 'exam_deleted'
  | 'answer_key_updated'
  | 'manual_omr_override'
  | 'omr_template_created'
  | 'omr_template_verified'
  | 'student_enrolled'
  | 'tenant_settings_updated';

export interface AuditActor {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  action: AuditActionType;
  performedBy: AuditActor;
  targetId?: string;
  targetType?: 'exam' | 'answer_key' | 'omr_submission' | 'omr_template' | 'student' | 'tenant';
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  performedBy: string;
  action: string;
  details: string;
}

export interface OMRSubmission {
  id: string;
  examId: string;
  tenantId: string;
  studentRollNumber: string;
  studentName?: string;
  studentId?: string;
  submittedAt: string;
  imageUrl: string;
  imageFileName: string;
  status: 'pending' | 'processed' | 'flagged' | 'manual_reviewed';
  detectedAnswers: Record<number, DetectedAnswer>;
  detectedRollNumber: string;
  rollNumberConfidence: number;
  score: EvaluationScore;
  flaggedReasons: string[];
  auditLog: AuditLogEntry[];
}

export interface SubscriptionConfig {
  plan: SubscriptionPlan;
  name: string;
  priceMonthly: number;
  maxExams: number;
  maxSubmissionsPerMonth: number;
  customBranding: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  features: string[];
}
