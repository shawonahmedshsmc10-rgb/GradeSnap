/**
 * GradeSnap Multi-Tenant Data Store
 */

import type {
  AnswerKey,
  AuditActionType,
  AuditActor,
  AuditLog,
  AuditLogEntry,
  CustomOMRSheetTemplate,
  Exam,
  OMRSubmission,
  Student,
  SubscriptionConfig,
  Tenant,
  User,
} from '../types/index.ts';

export interface DatabaseState {
  tenants: Tenant[];
  users: User[];
  students: Student[];
  exams: Exam[];
  answerKeys: Record<string, AnswerKey>;
  omrSubmissions: OMRSubmission[];
  omrTemplates: CustomOMRSheetTemplate[];
  subscriptions: SubscriptionConfig[];
  auditLogs: AuditLog[];
}

const initialTenants: Tenant[] = [
  {
    id: 'tenant-apex',
    name: 'Apex Academy & Coaching',
    slug: 'apex-academy',
    ownerEmail: 'director@apexacademy.edu',
    contactEmail: 'support@apexacademy.edu',
    phone: '+880 1711-234567',
    plan: 'pro',
    status: 'active',
    branding: {
      primaryColor: '#1d4ed8',
      headerTitle: 'Apex Academy - Excellence in Medical & Engineering',
      instituteAddress: 'Farmgate, Dhaka - 1215',
      supportPhone: '+880 1711-234567',
    },
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'tenant-sciencecare',
    name: 'Science Care Medical Classes',
    slug: 'science-care',
    ownerEmail: 'dr.rahman@sciencecare.org',
    contactEmail: 'info@sciencecare.org',
    phone: '+880 1819-987654',
    plan: 'enterprise',
    status: 'active',
    branding: {
      primaryColor: '#0f766e',
      headerTitle: 'Science Care - Premier Medical Admission Pre-Clinical Hub',
      instituteAddress: 'Chittagong GEC Circle, Chattogram',
      supportPhone: '+880 1819-987654',
    },
    createdAt: '2026-01-15T12:00:00Z',
  },
];

const initialUsers: User[] = [
  {
    id: 'user-super-admin',
    name: 'Super Admin',
    email: 'admin@gradesnap.io',
    role: 'super_admin',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-teacher-apex',
    name: 'Prof. Anisul Haque',
    email: 'teacher@apexacademy.edu',
    role: 'teacher',
    tenantId: 'tenant-apex',
    status: 'active',
    createdAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'user-teacher-sciencecare',
    name: 'Dr. Tariq Rahman',
    email: 'dr.rahman@sciencecare.org',
    role: 'teacher',
    tenantId: 'tenant-sciencecare',
    status: 'active',
    createdAt: '2026-01-15T12:30:00Z',
  },
  {
    id: 'user-student-rahim',
    name: 'Rahim Ahmed',
    email: 'rahim.10401@student.edu',
    role: 'student',
    tenantId: 'tenant-apex',
    studentRollNumber: '104012',
    status: 'active',
    createdAt: '2026-02-01T08:00:00Z',
  },
];

const initialStudents: Student[] = [
  {
    id: 'stu-1',
    tenantId: 'tenant-apex',
    name: 'Rahim Ahmed',
    rollNumber: '104012',
    email: 'rahim.10401@student.edu',
    phone: '+880 1912-345678',
    batch: 'HSC-2026 Medical Batch A',
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'stu-2',
    tenantId: 'tenant-apex',
    name: 'Farhana Yasmin',
    rollNumber: '104015',
    email: 'farhana.y@gmail.com',
    phone: '+880 1712-445566',
    batch: 'HSC-2026 Medical Batch A',
    createdAt: '2026-02-01T08:15:00Z',
  },
  {
    id: 'stu-3',
    tenantId: 'tenant-apex',
    name: 'Tanvir Hossain',
    rollNumber: '104020',
    email: 'tanvir.eng@yahoo.com',
    phone: '+880 1812-778899',
    batch: 'Engineering Batch 01',
    createdAt: '2026-02-02T09:00:00Z',
  },
  {
    id: 'stu-4',
    tenantId: 'tenant-sciencecare',
    name: 'Sadia Jahan',
    rollNumber: '205001',
    email: 'sadia.j@student.org',
    phone: '+880 1612-990011',
    batch: 'MBBS Target 2026',
    createdAt: '2026-02-03T10:00:00Z',
  },
];

const initialExams: Exam[] = [
  {
    id: 'exam-phy-final',
    tenantId: 'tenant-apex',
    title: 'HSC Physics 1st Paper Model Test 2026',
    description: 'Comprehensive evaluation covering Vectors, Dynamics, Work-Energy-Power, and Gravity.',
    subject: 'Physics',
    category: 'competitive',
    totalQuestions: 20,
    totalMarks: 20,
    durationMinutes: 25,
    startTime: '2026-11-10T08:00:00Z',
    endTime: '2026-11-20T23:59:59Z',
    status: 'live',
    published: true,
    allowLateSubmission: false,
    maxSubmissions: 500,
    markingScheme: {
      correctMarks: 1.0,
      negativeMarks: 0.25,
      unansweredMarks: 0,
    },
    questionPaperFileName: 'HSC_Physics_Paper_1_Final.pdf',
    omrTemplateId: 'std-20q',
    optionsPerQuestion: 4,
    allowMultipleCorrect: false,
    teacherName: 'Prof. Anisul Haque',
    createdAt: '2026-11-05T09:00:00Z',
    updatedAt: '2026-11-05T09:00:00Z',
  },
  {
    id: 'exam-med-bio',
    tenantId: 'tenant-sciencecare',
    title: 'Medical Biology Pre-Admission Blitz 04',
    description: 'High-yield MCQs covering Human Physiology, Genetics, and Plant Reproduction.',
    subject: 'Biology',
    category: 'medical',
    totalQuestions: 20,
    totalMarks: 20,
    durationMinutes: 20,
    startTime: '2026-11-12T09:00:00Z',
    endTime: '2026-11-25T18:00:00Z',
    status: 'live',
    published: true,
    allowLateSubmission: true,
    maxSubmissions: 300,
    markingScheme: {
      correctMarks: 1.0,
      negativeMarks: 0.25,
      unansweredMarks: 0,
    },
    questionPaperFileName: 'Medical_Biology_Blitz_04.pdf',
    omrTemplateId: 'std-20q',
    optionsPerQuestion: 4,
    allowMultipleCorrect: false,
    teacherName: 'Dr. Tariq Rahman',
    createdAt: '2026-11-08T11:00:00Z',
    updatedAt: '2026-11-08T11:00:00Z',
  },
  {
    id: 'exam-buet-math',
    tenantId: 'tenant-apex',
    title: 'BUET Engineering Math Sprint Exam 02',
    description: 'Advanced Calculus, Differential Equations, and Coordinate Geometry problems.',
    subject: 'Higher Mathematics',
    category: 'engineering',
    totalQuestions: 20,
    totalMarks: 20,
    durationMinutes: 30,
    startTime: '2026-11-20T10:00:00Z',
    endTime: '2026-11-20T12:00:00Z',
    status: 'scheduled',
    published: true,
    allowLateSubmission: false,
    maxSubmissions: 200,
    markingScheme: {
      correctMarks: 1.0,
      negativeMarks: 0.5,
      unansweredMarks: 0,
    },
    questionPaperFileName: 'BUET_Math_Sprint_02.pdf',
    omrTemplateId: 'std-20q',
    optionsPerQuestion: 4,
    allowMultipleCorrect: false,
    teacherName: 'Prof. Anisul Haque',
    createdAt: '2026-11-09T14:00:00Z',
    updatedAt: '2026-11-09T14:00:00Z',
  },
  {
    id: 'exam-chem-unit2',
    tenantId: 'tenant-apex',
    title: 'Organic Chemistry Reactions & Mechanisms',
    description: 'Reaction mechanisms, IUPAC nomenclature, isomerism, and stereochemistry.',
    subject: 'Chemistry',
    category: 'standard',
    totalQuestions: 20,
    totalMarks: 20,
    durationMinutes: 25,
    startTime: '2026-10-15T09:00:00Z',
    endTime: '2026-10-18T18:00:00Z',
    status: 'completed',
    published: true,
    allowLateSubmission: false,
    markingScheme: {
      correctMarks: 1.0,
      negativeMarks: 0.25,
      unansweredMarks: 0,
    },
    questionPaperFileName: 'Organic_Chemistry_Unit2.pdf',
    omrTemplateId: 'std-20q',
    optionsPerQuestion: 4,
    allowMultipleCorrect: false,
    teacherName: 'Prof. Anisul Haque',
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-18T18:05:00Z',
  },
];

const initialAnswerKeys: Record<string, AnswerKey> = {
  'exam-phy-final': {
    id: 'ak-phy-final',
    examId: 'exam-phy-final',
    tenantId: 'tenant-apex',
    answers: {
      1: ['A'], 2: ['C'], 3: ['B'], 4: ['D'], 5: ['A'],
      6: ['C'], 7: ['B'], 8: ['B'], 9: ['D'], 10: ['A'],
      11: ['C'], 12: ['D'], 13: ['A'], 14: ['B'], 15: ['C'],
      16: ['D'], 17: ['A'], 18: ['B'], 19: ['C'], 20: ['A'],
    },
    allowMultipleCorrect: false,
    optionsPerQuestion: 4,
    isReleased: true,
    updatedAt: '2026-11-05T09:30:00Z',
  },
  'exam-med-bio': {
    id: 'ak-med-bio',
    examId: 'exam-med-bio',
    tenantId: 'tenant-sciencecare',
    answers: {
      1: ['B'], 2: ['B'], 3: ['A'], 4: ['C'], 5: ['D'],
      6: ['A'], 7: ['B'], 8: ['C'], 9: ['D'], 10: ['A'],
      11: ['B'], 12: ['C'], 13: ['D'], 14: ['A'], 15: ['B'],
      16: ['C'], 17: ['D'], 18: ['A'], 19: ['B'], 20: ['C'],
    },
    allowMultipleCorrect: false,
    optionsPerQuestion: 4,
    isReleased: true,
    updatedAt: '2026-11-08T11:20:00Z',
  },
};

const initialSubmissions: OMRSubmission[] = [
  {
    id: 'sub-1',
    examId: 'exam-phy-final',
    tenantId: 'tenant-apex',
    studentRollNumber: '104012',
    studentName: 'Rahim Ahmed',
    studentId: 'stu-1',
    submittedAt: '2026-11-12T14:32:00Z',
    imageUrl: '',
    imageFileName: 'omr_scan_104012.jpg',
    status: 'processed',
    detectedAnswers: {
      1: { questionNumber: 1, detectedAnswer: 'A', confidence: 0.96, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.92, B: 0.04, C: 0.02, D: 0.01 } },
      2: { questionNumber: 2, detectedAnswer: 'C', confidence: 0.94, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.03, B: 0.05, C: 0.88, D: 0.02 } },
      3: { questionNumber: 3, detectedAnswer: 'B', confidence: 0.92, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.04, B: 0.85, C: 0.02, D: 0.03 } },
      4: { questionNumber: 4, detectedAnswer: 'D', confidence: 0.95, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.02, B: 0.01, C: 0.03, D: 0.91 } },
      5: { questionNumber: 5, detectedAnswer: 'A', confidence: 0.93, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.89, B: 0.02, C: 0.04, D: 0.01 } },
      6: { questionNumber: 6, detectedAnswer: 'C', confidence: 0.97, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.01, B: 0.02, C: 0.94, D: 0.03 } },
      7: { questionNumber: 7, detectedAnswer: 'B', confidence: 0.91, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.05, B: 0.84, C: 0.03, D: 0.02 } },
      8: { questionNumber: 8, detectedAnswer: 'B', confidence: 0.95, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.02, B: 0.91, C: 0.04, D: 0.01 } },
      9: { questionNumber: 9, detectedAnswer: 'D', confidence: 0.89, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.03, B: 0.06, C: 0.02, D: 0.82 } },
      10: { questionNumber: 10, detectedAnswer: 'A', confidence: 0.94, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.9, B: 0.03, C: 0.02, D: 0.01 } },
      11: { questionNumber: 11, detectedAnswer: 'C', confidence: 0.92, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.02, B: 0.04, C: 0.87, D: 0.02 } },
      12: { questionNumber: 12, detectedAnswer: 'D', confidence: 0.91, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.03, B: 0.02, C: 0.05, D: 0.86 } },
      13: { questionNumber: 13, detectedAnswer: 'A', confidence: 0.94, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.92, B: 0.01, C: 0.03, D: 0.02 } },
      14: { questionNumber: 14, detectedAnswer: 'B', confidence: 0.88, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.04, B: 0.81, C: 0.02, D: 0.05 } },
      15: { questionNumber: 15, detectedAnswer: 'C', confidence: 0.96, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.01, B: 0.03, C: 0.93, D: 0.02 } },
      16: { questionNumber: 16, detectedAnswer: 'A', confidence: 0.85, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.79, B: 0.04, C: 0.03, D: 0.06 } },
      17: { questionNumber: 17, detectedAnswer: 'A', confidence: 0.93, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.88, B: 0.02, C: 0.03, D: 0.01 } },
      18: { questionNumber: 18, detectedAnswer: 'B', confidence: 0.92, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.03, B: 0.87, C: 0.02, D: 0.03 } },
      19: { questionNumber: 19, detectedAnswer: 'C', confidence: 0.95, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.02, B: 0.03, C: 0.91, D: 0.02 } },
      20: { questionNumber: 20, detectedAnswer: 'A', confidence: 0.94, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.89, B: 0.04, C: 0.02, D: 0.01 } },
    },
    detectedRollNumber: '104012',
    rollNumberConfidence: 0.96,
    score: {
      totalQuestions: 20,
      attempted: 20,
      correct: 19,
      incorrect: 1,
      unanswered: 0,
      multipleMarked: 0,
      obtainedMarks: 19.0,
      negativeMarksDeducted: 0.25,
      finalScore: 18.75,
      percentage: 93.8,
      rank: 1,
    },
    flaggedReasons: [],
    auditLog: [
      {
        id: 'aud-1',
        timestamp: '2026-11-12T14:32:05Z',
        performedBy: 'system:omr_engine',
        action: 'EVALUATED_AUTOMATICALLY',
        details: 'Evaluated with 96% fiducial alignment accuracy.',
      },
    ],
  },
  {
    id: 'sub-2',
    examId: 'exam-phy-final',
    tenantId: 'tenant-apex',
    studentRollNumber: '104015',
    studentName: 'Farhana Yasmin',
    studentId: 'stu-2',
    submittedAt: '2026-11-12T15:10:00Z',
    imageUrl: '',
    imageFileName: 'omr_scan_104015.jpg',
    status: 'flagged',
    detectedAnswers: {
      1: { questionNumber: 1, detectedAnswer: 'A', confidence: 0.94, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.89, B: 0.02, C: 0.03, D: 0.01 } },
      2: { questionNumber: 2, detectedAnswer: 'C', confidence: 0.92, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.02, B: 0.03, C: 0.86, D: 0.01 } },
      3: { questionNumber: 3, detectedAnswer: null, confidence: 0.42, isAmbiguous: true, isMultiple: true, rawFillRatios: { A: 0.02, B: 0.58, C: 0.54, D: 0.03 } },
      4: { questionNumber: 4, detectedAnswer: 'D', confidence: 0.95, isAmbiguous: false, isMultiple: false, rawFillRatios: { A: 0.01, B: 0.02, C: 0.03, D: 0.92 } },
      5: { questionNumber: 5, detectedAnswer: 'A', confidence: 0.62, isAmbiguous: true, isMultiple: false, rawFillRatios: { A: 0.36, B: 0.04, C: 0.02, D: 0.03 } },
    },
    detectedRollNumber: '104015',
    rollNumberConfidence: 0.92,
    score: {
      totalQuestions: 20,
      attempted: 18,
      correct: 15,
      incorrect: 2,
      unanswered: 2,
      multipleMarked: 1,
      obtainedMarks: 15.0,
      negativeMarksDeducted: 0.75,
      finalScore: 14.25,
      percentage: 71.3,
      rank: 2,
    },
    flaggedReasons: [
      'Q3: Multiple bubbles shaded (B & C).',
      'Q5: Borderline/light shading detected (36% fill).',
    ],
    auditLog: [
      {
        id: 'aud-2',
        timestamp: '2026-11-12T15:10:04Z',
        performedBy: 'system:omr_engine',
        action: 'FLAGGED_FOR_REVIEW',
        details: '2 questions flagged for manual review due to multiple shading & light fill.',
      },
    ],
  },
];

const initialSubscriptions: SubscriptionConfig[] = [
  {
    plan: 'free',
    name: 'Free Starter',
    priceMonthly: 0,
    maxExams: 3,
    maxSubmissionsPerMonth: 50,
    customBranding: false,
    advancedAnalytics: false,
    prioritySupport: false,
    features: ['Up to 3 Active Exams', '50 OMR Evaluations / month', 'Standard Marking Scheme', 'Email Support'],
  },
  {
    plan: 'basic',
    name: 'Basic Coaching',
    priceMonthly: 2500,
    maxExams: 15,
    maxSubmissionsPerMonth: 500,
    customBranding: false,
    advancedAnalytics: true,
    prioritySupport: false,
    features: ['15 Active Exams', '500 OMR Evaluations / month', 'Negative Marking & Audits', 'CSV / Excel Export', 'Standard Analytics'],
  },
  {
    plan: 'pro',
    name: 'Pro Academy',
    priceMonthly: 6000,
    maxExams: 50,
    maxSubmissionsPerMonth: 2500,
    customBranding: true,
    advancedAnalytics: true,
    prioritySupport: true,
    features: ['50 Active Exams', '2,500 OMR Evaluations / month', 'Custom Institute Branding', 'Live Camera Evaluation', 'Question-wise Analytics', 'Priority Support'],
  },
  {
    plan: 'enterprise',
    name: 'Enterprise Network',
    priceMonthly: 15000,
    maxExams: 9999,
    maxSubmissionsPerMonth: 25000,
    customBranding: true,
    advancedAnalytics: true,
    prioritySupport: true,
    features: ['Unlimited Exams', '25,000+ Evaluations / month', 'Multi-Campus Tenant Management', 'Dedicated Account Manager', 'Custom Domain & SLA'],
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-seed-001',
    tenantId: 'tenant-apex',
    action: 'exam_created',
    performedBy: {
      userId: 'user-teacher-apex',
      name: 'Prof. Anisul Haque',
      email: 'teacher@apexacademy.edu',
      role: 'teacher',
    },
    targetId: 'exam-apex-001',
    targetType: 'exam',
    details: 'Created examination "Medical Admission Model Test - Paper 1" with 20 questions (Total 20 marks, 0.25 negative penalty).',
    metadata: {
      examTitle: 'Medical Admission Model Test - Paper 1',
      totalQuestions: 20,
      totalMarks: 20,
      negativeMarks: 0.25,
      category: 'medical',
    },
    timestamp: '2026-02-10T14:30:00Z',
  },
  {
    id: 'audit-seed-002',
    tenantId: 'tenant-apex',
    action: 'answer_key_updated',
    performedBy: {
      userId: 'user-teacher-apex',
      name: 'Prof. Anisul Haque',
      email: 'teacher@apexacademy.edu',
      role: 'teacher',
    },
    targetId: 'exam-apex-001',
    targetType: 'answer_key',
    details: 'Configured and verified official 20-question answer key for Medical Model Test.',
    metadata: {
      examId: 'exam-apex-001',
      totalAnswersConfigured: 20,
      optionsPerQuestion: 4,
    },
    timestamp: '2026-02-10T14:45:00Z',
  },
  {
    id: 'audit-seed-003',
    tenantId: 'tenant-apex',
    action: 'manual_omr_override',
    performedBy: {
      userId: 'user-teacher-apex',
      name: 'Prof. Anisul Haque',
      email: 'teacher@apexacademy.edu',
      role: 'teacher',
    },
    targetId: 'sub-apex-001',
    targetType: 'omr_submission',
    details: 'Manually inspected and overridden Question 14 for student Roll 104012 (Rahim Ahmed) from option [B] to [C] due to faint pencil stroke. Score adjusted from 18.75 to 20.00 pts.',
    metadata: {
      rollNumber: '104012',
      questionNumber: 14,
      previousAnswer: 'B',
      newAnswer: 'C',
      previousScore: 18.75,
      newScore: 20.0,
      scoreDelta: 1.25,
      reason: 'Faint circular mark verified during inspection',
    },
    timestamp: '2026-02-11T11:20:00Z',
  },
  {
    id: 'audit-seed-004',
    tenantId: 'tenant-sciencecare',
    action: 'exam_created',
    performedBy: {
      userId: 'user-teacher-sciencecare',
      name: 'Dr. Tariq Rahman',
      email: 'dr.rahman@sciencecare.org',
      role: 'teacher',
    },
    targetId: 'exam-sc-001',
    targetType: 'exam',
    details: 'Created examination "Chemistry 1st Paper - Organic Principles" with 20 questions (Total 20 marks, 0.50 negative penalty).',
    metadata: {
      examTitle: 'Chemistry 1st Paper - Organic Principles',
      totalQuestions: 20,
      totalMarks: 20,
      negativeMarks: 0.5,
      category: 'medical',
    },
    timestamp: '2026-02-12T09:15:00Z',
  },
  {
    id: 'audit-seed-005',
    tenantId: 'tenant-sciencecare',
    action: 'exam_status_changed',
    performedBy: {
      userId: 'user-teacher-sciencecare',
      name: 'Dr. Tariq Rahman',
      email: 'dr.rahman@sciencecare.org',
      role: 'teacher',
    },
    targetId: 'exam-sc-001',
    targetType: 'exam',
    details: 'Transitioned examination status to LIVE. OMR scanning and student access enabled.',
    metadata: {
      previousStatus: 'scheduled',
      newStatus: 'live',
    },
    timestamp: '2026-02-12T10:00:00Z',
  },
];

const initialOMRTemplates: CustomOMRSheetTemplate[] = [
  {
    id: 'tpl-apex-20q',
    tenantId: 'tenant-apex',
    name: 'Medical Model Test Standard 20Q',
    examId: 'exam-apex-001',
    examTitle: 'Medical Admission Model Test - Paper 1',
    subject: 'Biology & Chemistry',
    sheetVersion: 'v2.4',
    totalQuestions: 20,
    optionsPerQuestion: 4,
    rollNumberDigits: 6,
    instituteName: 'Apex Academy & Coaching',
    headerSubtitle: 'Canonical 1200x1700 Machine-Readable Sheet',
    instructions: 'Darken circle completely with black/blue ballpoint pen. Do not fold.',
    includeBatchField: true,
    includeCandidateSign: true,
    includeInvigilatorSign: true,
    accentColor: '#1d4ed8',
    lastVerifiedAt: '2026-02-10T15:00:00Z',
    lastVerifiedAccuracy: 100,
    createdBy: 'Prof. Anisul Haque',
    createdAt: '2026-02-10T14:25:00Z',
    updatedAt: '2026-02-10T15:00:00Z',
  },
  {
    id: 'tpl-sc-50q',
    tenantId: 'tenant-sciencecare',
    name: 'Medical Admission 50 MCQ Sheet',
    examId: 'exam-sc-001',
    examTitle: 'Chemistry 1st Paper - Organic Principles',
    subject: 'Chemistry',
    sheetVersion: 'v2.4',
    totalQuestions: 50,
    optionsPerQuestion: 4,
    rollNumberDigits: 6,
    instituteName: 'Science Care Medical Classes',
    headerSubtitle: 'Canonical 1200x1700 Machine-Readable Sheet',
    instructions: 'Shade one bubble per question cleanly. Avoid stray ink near fiducials.',
    includeBatchField: true,
    includeCandidateSign: true,
    includeInvigilatorSign: true,
    accentColor: '#0f766e',
    lastVerifiedAt: '2026-02-12T09:40:00Z',
    lastVerifiedAccuracy: 100,
    createdBy: 'Dr. Tariq Rahman',
    createdAt: '2026-02-12T09:10:00Z',
    updatedAt: '2026-02-12T09:40:00Z',
  },
];

class DatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = {
      tenants: [...initialTenants],
      users: [...initialUsers],
      students: [...initialStudents],
      exams: [...initialExams],
      answerKeys: { ...initialAnswerKeys },
      omrSubmissions: [...initialSubmissions],
      omrTemplates: [...initialOMRTemplates],
      subscriptions: [...initialSubscriptions],
      auditLogs: [...initialAuditLogs],
    };
  }

  getTenants(): Tenant[] {
    return this.state.tenants;
  }

  getTenantById(id: string): Tenant | undefined {
    return this.state.tenants.find((t) => t.id === id);
  }

  getTenantBySlug(slug: string): Tenant | undefined {
    return this.state.tenants.find((t) => t.slug === slug);
  }

  createTenant(data: Omit<Tenant, 'id' | 'createdAt'>): Tenant {
    const newTenant: Tenant = {
      ...data,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.tenants.push(newTenant);
    return newTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant | undefined {
    const index = this.state.tenants.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    this.state.tenants[index] = { ...this.state.tenants[index], ...updates };
    return this.state.tenants[index];
  }

  private credentials: Record<string, string> = {
    'admin@gradesnap.io': 'admin123',
    'teacher@apexacademy.edu': 'apex123',
    'dr.rahman@sciencecare.org': 'science123',
  };

  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    return newUser;
  }

  authenticateByEmail(
    email: string,
    password: string
  ): { user?: User; tenant?: Tenant | null; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { error: 'Please enter both your email address and password.' };
    }

    const user = this.getUserByEmail(normalizedEmail);
    if (!user) {
      return { error: 'No account found for this email address.' };
    }

    if (user.status === 'suspended') {
      return { error: 'This account has been suspended. Contact your administrator.' };
    }

    const expectedPassword = this.credentials[normalizedEmail];
    if (!expectedPassword || expectedPassword !== password) {
      return { error: 'Incorrect password. Check your credentials or use a demo preset below.' };
    }

    const tenant = user.tenantId ? this.getTenantById(user.tenantId) || null : null;
    if (tenant && tenant.status === 'suspended') {
      return { error: 'This coaching workspace is currently suspended.' };
    }

    return { user, tenant };
  }

  findStudentByRoll(rollNumber: string, tenantId?: string): Student | undefined {
    const cleanRoll = rollNumber.trim().toLowerCase();
    if (!cleanRoll) return undefined;
    return this.state.students.find(
      (s) =>
        s.rollNumber.toLowerCase() === cleanRoll &&
        (!tenantId || s.tenantId === tenantId)
    );
  }

  loginOrRegisterStudent(
    rollNumber: string,
    tenantId: string,
    fullName?: string
  ): { user?: User; tenant?: Tenant; error?: string } {
    const cleanRoll = rollNumber.trim();
    if (!cleanRoll || cleanRoll.length < 3) {
      return { error: 'Enter a valid Roll / Registration Number (at least 3 characters).' };
    }

    const tenant = this.getTenantById(tenantId) || this.state.tenants[0];
    if (!tenant) {
      return { error: 'Selected institute workspace was not found.' };
    }

    let student = this.findStudentByRoll(cleanRoll, tenant.id);
    if (!student) {
      const displayName = fullName?.trim() || `Candidate ${cleanRoll}`;
      student = this.addStudent({
        tenantId: tenant.id,
        name: displayName,
        rollNumber: cleanRoll,
        batch: 'Registered Candidate',
      });
    }

    let user = this.state.users.find(
      (u) =>
        u.role === 'student' &&
        u.tenantId === tenant.id &&
        u.studentRollNumber?.toLowerCase() === cleanRoll.toLowerCase()
    );

    if (!user) {
      user = this.createUser({
        name: student.name,
        email: student.email || `${cleanRoll}@student.gradesnap.io`,
        role: 'student',
        tenantId: tenant.id,
        studentRollNumber: student.rollNumber,
        status: 'active',
      });
    }

    return { user, tenant };
  }

  registerTeacherWorkspace(params: {
    instituteName: string;
    instructorName: string;
    email: string;
    password: string;
  }): { user?: User; tenant?: Tenant; error?: string } {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanInstitute = params.instituteName.trim();
    const cleanInstructor = params.instructorName.trim();

    if (!cleanInstitute || !cleanInstructor || !cleanEmail || params.password.length < 6) {
      return { error: 'Complete all fields and use a password of at least 6 characters.' };
    }

    if (this.getUserByEmail(cleanEmail)) {
      return { error: 'An account with this email already exists. Try signing in instead.' };
    }

    const baseSlug = cleanInstitute
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = this.getTenantBySlug(baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const tenant = this.createTenant({
      name: cleanInstitute,
      slug: slug || `institute-${Date.now().toString().slice(-4)}`,
      ownerEmail: cleanEmail,
      contactEmail: cleanEmail,
      phone: '+880 1700-000000',
      plan: 'free',
      status: 'active',
      branding: {
        primaryColor: '#1d4ed8',
        headerTitle: `${cleanInstitute} — Assessment Portal`,
      },
    });

    const user = this.createUser({
      name: cleanInstructor,
      email: cleanEmail,
      role: 'teacher',
      tenantId: tenant.id,
      status: 'active',
    });

    this.credentials[cleanEmail] = params.password;

    return { user, tenant };
  }

  getExams(tenantId?: string): Exam[] {
    if (!tenantId) return this.state.exams;
    return this.state.exams.filter((e) => e.tenantId === tenantId);
  }

  getExamById(id: string, tenantId?: string): Exam | undefined {
    const exam = this.state.exams.find((e) => e.id === id);
    if (!exam) return undefined;
    if (tenantId && exam.tenantId !== tenantId) return undefined;
    return exam;
  }

  createExam(data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: AuditActor): Exam {
    const newExam: Exam = {
      ...data,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.exams.push(newExam);

    const actor = performedBy || {
      userId: 'user-teacher-active',
      name: newExam.teacherName || 'Faculty Instructor',
      email: 'teacher@gradesnap.io',
      role: 'teacher',
    };

    this.logAudit({
      tenantId: newExam.tenantId,
      action: 'exam_created',
      performedBy: actor,
      targetId: newExam.id,
      targetType: 'exam',
      details: `Created examination "${newExam.title}" (${newExam.totalQuestions} questions, ${newExam.totalMarks} marks, ${newExam.durationMinutes} mins).`,
      metadata: {
        examTitle: newExam.title,
        totalQuestions: newExam.totalQuestions,
        totalMarks: newExam.totalMarks,
        durationMinutes: newExam.durationMinutes,
        negativeMarks: newExam.markingScheme?.negativeMarks || 0,
      },
    });

    return newExam;
  }

  updateExam(id: string, updates: Partial<Exam>, tenantId?: string, performedBy?: AuditActor): Exam | undefined {
    const index = this.state.exams.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    if (tenantId && this.state.exams[index].tenantId !== tenantId) return undefined;

    const oldExam = this.state.exams[index];
    const isStatusChange = updates.status && updates.status !== oldExam.status;

    this.state.exams[index] = {
      ...this.state.exams[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (performedBy) {
      this.logAudit({
        tenantId: oldExam.tenantId,
        action: isStatusChange ? 'exam_status_changed' : 'exam_updated',
        performedBy,
        targetId: oldExam.id,
        targetType: 'exam',
        details: isStatusChange
          ? `Changed status of exam "${oldExam.title}" from ${oldExam.status} to ${updates.status}.`
          : `Updated configuration for exam "${oldExam.title}".`,
        metadata: {
          examTitle: oldExam.title,
          previousStatus: oldExam.status,
          newStatus: updates.status,
          updatedFields: Object.keys(updates),
        },
      });
    }

    return this.state.exams[index];
  }

  deleteExam(id: string, tenantId?: string, performedBy?: AuditActor): boolean {
    const index = this.state.exams.findIndex((e) => e.id === id);
    if (index === -1) return false;
    if (tenantId && this.state.exams[index].tenantId !== tenantId) return false;

    const examTitle = this.state.exams[index].title;
    const examTenant = this.state.exams[index].tenantId;

    this.state.exams.splice(index, 1);
    delete this.state.answerKeys[id];

    if (performedBy) {
      this.logAudit({
        tenantId: examTenant,
        action: 'exam_deleted',
        performedBy,
        targetId: id,
        targetType: 'exam',
        details: `Deleted examination "${examTitle}" and purged its corresponding answer key.`,
        metadata: { examId: id, examTitle },
      });
    }

    return true;
  }

  getAnswerKey(examId: string, tenantId?: string, isStudent: boolean = false): AnswerKey | undefined {
    const key = this.state.answerKeys[examId];
    if (!key) return undefined;
    if (tenantId && key.tenantId !== tenantId) return undefined;

    if (isStudent && !key.isReleased) {
      return {
        ...key,
        answers: {},
      };
    }
    return key;
  }

  setAnswerKey(key: AnswerKey, tenantId?: string, performedBy?: AuditActor): AnswerKey {
    if (tenantId && key.tenantId !== tenantId) {
      throw new Error('Tenant mismatch: unauthorized answer key access');
    }
    this.state.answerKeys[key.examId] = {
      ...key,
      updatedAt: new Date().toISOString(),
    };

    const exam = this.getExamById(key.examId, tenantId);
    const actor = performedBy || {
      userId: 'user-teacher-active',
      name: 'Faculty Instructor',
      email: 'teacher@gradesnap.io',
      role: 'teacher',
    };

    this.logAudit({
      tenantId: key.tenantId,
      action: 'answer_key_updated',
      performedBy: actor,
      targetId: key.examId,
      targetType: 'answer_key',
      details: `Updated answer key matrix for "${exam?.title || key.examId}". Configured: ${Object.keys(key.answers).length} questions.`,
      metadata: {
        examId: key.examId,
        examTitle: exam?.title,
        answersCount: Object.keys(key.answers).length,
        isReleased: key.isReleased,
      },
    });

    return this.state.answerKeys[key.examId];
  }

  getSubmissions(examId?: string, tenantId?: string): OMRSubmission[] {
    let list = this.state.omrSubmissions;
    if (tenantId) list = list.filter((s) => s.tenantId === tenantId);
    if (examId) list = list.filter((s) => s.examId === examId);
    return list;
  }

  getSubmissionById(id: string, tenantId?: string): OMRSubmission | undefined {
    const sub = this.state.omrSubmissions.find((s) => s.id === id);
    if (!sub) return undefined;
    if (tenantId && sub.tenantId !== tenantId) return undefined;
    return sub;
  }

  addSubmission(sub: Omit<OMRSubmission, 'id'>): OMRSubmission {
    const newSub: OMRSubmission = {
      ...sub,
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.state.omrSubmissions.unshift(newSub);
    return newSub;
  }

  overrideSubmissionAnswer(
    submissionId: string,
    questionNumber: number,
    newAnswer: string | null,
    teacherName: string,
    tenantId?: string,
    performedByActor?: AuditActor
  ): OMRSubmission | undefined {
    const sub = this.getSubmissionById(submissionId, tenantId);
    if (!sub) return undefined;

    const exam = this.getExamById(sub.examId, tenantId);
    const answerKey = this.getAnswerKey(sub.examId, tenantId, false);
    if (!exam || !answerKey) return undefined;

    const oldAnswer = sub.detectedAnswers[questionNumber]?.detectedAnswer;
    const previousScore = sub.score?.finalScore ?? 0;

    sub.detectedAnswers[questionNumber] = {
      ...sub.detectedAnswers[questionNumber],
      detectedAnswer: newAnswer,
      isAmbiguous: false,
      isMultiple: false,
      confidence: 1.0,
    };

    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let multipleMarked = 0;
    let obtainedMarks = 0;
    let negativeMarksDeducted = 0;

    for (let q = 1; q <= exam.totalQuestions; q++) {
      const d = sub.detectedAnswers[q];
      const correctOpts = answerKey.answers[q] || [];

      if (!d || !d.detectedAnswer) {
        unanswered++;
        obtainedMarks += exam.markingScheme.unansweredMarks;
      } else if (d.isMultiple) {
        multipleMarked++;
        attempted++;
        negativeMarksDeducted += exam.markingScheme.negativeMarks;
      } else {
        attempted++;
        if (correctOpts.includes(d.detectedAnswer)) {
          correct++;
          obtainedMarks += exam.markingScheme.correctMarks;
        } else {
          incorrect++;
          negativeMarksDeducted += exam.markingScheme.negativeMarks;
        }
      }
    }

    const finalScore = Number((obtainedMarks - negativeMarksDeducted).toFixed(2));
    const maxMarks = exam.totalQuestions * exam.markingScheme.correctMarks;
    const percentage = Math.max(0, Number(((finalScore / maxMarks) * 100).toFixed(1)));

    sub.score = {
      totalQuestions: exam.totalQuestions,
      attempted,
      correct,
      incorrect,
      unanswered,
      multipleMarked,
      obtainedMarks: Number(obtainedMarks.toFixed(2)),
      negativeMarksDeducted: Number(negativeMarksDeducted.toFixed(2)),
      finalScore,
      percentage,
    };

    sub.status = 'manual_reviewed';

    const actor: AuditActor = performedByActor || {
      userId: 'user-teacher-active',
      name: teacherName,
      email: 'teacher@gradesnap.io',
      role: 'teacher',
    };

    const detailsText = `Question ${questionNumber} answer corrected from [${oldAnswer || 'NONE'}] to [${newAnswer || 'NONE'}] for Roll ${sub.studentRollNumber}. Score adjusted from ${previousScore} to ${finalScore} pts.`;

    // Local per-submission audit log
    sub.auditLog.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      performedBy: teacherName,
      action: 'MANUAL_OVERRIDE',
      details: detailsText,
    });

    // Global protected tenant audit log
    this.logAudit({
      tenantId: sub.tenantId,
      action: 'manual_omr_override',
      performedBy: actor,
      targetId: sub.id,
      targetType: 'omr_submission',
      details: detailsText,
      metadata: {
        submissionId: sub.id,
        examId: sub.examId,
        examTitle: exam.title,
        studentRollNumber: sub.studentRollNumber,
        studentName: sub.studentName,
        questionNumber,
        oldAnswer: oldAnswer || null,
        newAnswer: newAnswer || null,
        previousScore,
        newScore: finalScore,
        scoreDelta: Number((finalScore - previousScore).toFixed(2)),
      },
    });

    return sub;
  }

  getAuditLogs(tenantId?: string, actionFilter?: string, searchQuery?: string): AuditLog[] {
    let logs = this.state.auditLogs;
    if (tenantId) {
      logs = logs.filter((l) => l.tenantId === tenantId);
    }
    if (actionFilter && actionFilter !== 'all') {
      if (actionFilter === 'omr_templates') {
        logs = logs.filter(
          (l) => l.action === 'omr_template_created' || l.action === 'omr_template_verified'
        );
      } else {
        logs = logs.filter((l) => l.action === actionFilter);
      }
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          l.performedBy.name.toLowerCase().includes(q) ||
          l.performedBy.email.toLowerCase().includes(q) ||
          (l.targetId && l.targetId.toLowerCase().includes(q)) ||
          (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q))
      );
    }
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAuditLog(entry: AuditLog): void {
    this.state.auditLogs.unshift(entry);
  }

  logAudit(params: {
    tenantId: string;
    action: AuditActionType;
    performedBy: AuditActor;
    details: string;
    targetId?: string;
    targetType?: 'exam' | 'answer_key' | 'omr_submission' | 'student' | 'tenant' | 'omr_template';
    metadata?: Record<string, any>;
  }): AuditLog {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      tenantId: params.tenantId,
      action: params.action,
      performedBy: params.performedBy,
      targetId: params.targetId,
      targetType: params.targetType,
      details: params.details,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    };
    this.addAuditLog(newLog);
    return newLog;
  }

  getStudents(tenantId?: string): Student[] {
    if (!tenantId) return this.state.students;
    return this.state.students.filter((s) => s.tenantId === tenantId);
  }

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const newStudent: Student = {
      ...student,
      id: `stu-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.students.push(newStudent);
    return newStudent;
  }

  getSubscriptions(): SubscriptionConfig[] {
    return this.state.subscriptions;
  }

  getPlatformStats() {
    return {
      totalTenants: this.state.tenants.length,
      totalStudents: this.state.students.length,
      totalExams: this.state.exams.length,
      totalSubmissions: this.state.omrSubmissions.length,
      liveExams: this.state.exams.filter((e) => e.status === 'live').length,
      activeSubscriptions: this.state.tenants.filter((t) => t.status === 'active').length,
      mrr: this.state.tenants.reduce((sum, t) => {
        const plan = this.state.subscriptions.find((p) => p.plan === t.plan);
        return sum + (plan ? plan.priceMonthly : 0);
      }, 0),
    };
  }

  getOMRTemplates(tenantId?: string): CustomOMRSheetTemplate[] {
    if (!tenantId) return this.state.omrTemplates;
    return this.state.omrTemplates.filter((t) => t.tenantId === tenantId);
  }

  saveOMRTemplate(
    template: Omit<CustomOMRSheetTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    performedBy?: AuditActor
  ): CustomOMRSheetTemplate {
    const now = new Date().toISOString();
    const existingIdx = template.id
      ? this.state.omrTemplates.findIndex((t) => t.id === template.id && t.tenantId === template.tenantId)
      : -1;

    let saved: CustomOMRSheetTemplate;
    if (existingIdx >= 0) {
      saved = {
        ...this.state.omrTemplates[existingIdx],
        ...template,
        id: this.state.omrTemplates[existingIdx].id,
        updatedAt: now,
      };
      this.state.omrTemplates[existingIdx] = saved;
    } else {
      saved = {
        ...template,
        id: template.id || `tpl-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      this.state.omrTemplates.unshift(saved);
    }

    const actor: AuditActor = performedBy || {
      userId: 'user-teacher-active',
      name: saved.createdBy || 'Faculty Instructor',
      email: 'teacher@gradesnap.io',
      role: 'teacher',
    };

    this.logAudit({
      tenantId: saved.tenantId,
      action: 'omr_template_created',
      performedBy: actor,
      targetId: saved.id,
      targetType: 'omr_template',
      details: `${existingIdx >= 0 ? 'Updated' : 'Created'} compatible A4 OMR template "${saved.name}" (${saved.totalQuestions} questions, ${saved.optionsPerQuestion} options, ${saved.sheetVersion}).`,
      metadata: {
        templateId: saved.id,
        name: saved.name,
        examId: saved.examId || null,
        totalQuestions: saved.totalQuestions,
        optionsPerQuestion: saved.optionsPerQuestion,
        sheetVersion: saved.sheetVersion,
      },
    });

    return saved;
  }

  recordOMRTemplateVerification(
    templateId: string,
    tenantId: string,
    accuracyPercent: number,
    details: string,
    performedBy?: AuditActor,
    metadata?: Record<string, any>
  ): void {
    const now = new Date().toISOString();
    const idx = this.state.omrTemplates.findIndex(
      (t) => t.id === templateId && t.tenantId === tenantId
    );
    if (idx >= 0) {
      this.state.omrTemplates[idx] = {
        ...this.state.omrTemplates[idx],
        lastVerifiedAt: now,
        lastVerifiedAccuracy: accuracyPercent,
        updatedAt: now,
      };
    }

    const actor: AuditActor = performedBy || {
      userId: 'user-teacher-active',
      name: 'Faculty Instructor',
      email: 'teacher@gradesnap.io',
      role: 'teacher',
    };

    this.logAudit({
      tenantId,
      action: 'omr_template_verified',
      performedBy: actor,
      targetId: templateId,
      targetType: 'omr_template',
      details,
      metadata,
    });
  }

  deleteOMRTemplate(templateId: string, tenantId: string): boolean {
    const idx = this.state.omrTemplates.findIndex(
      (t) => t.id === templateId && t.tenantId === tenantId
    );
    if (idx === -1) return false;
    this.state.omrTemplates.splice(idx, 1);
    return true;
  }

  resetToSeed() {
    this.state = {
      tenants: [...initialTenants],
      users: [...initialUsers],
      students: [...initialStudents],
      exams: [...initialExams],
      answerKeys: { ...initialAnswerKeys },
      omrSubmissions: [...initialSubmissions],
      omrTemplates: [...initialOMRTemplates],
      subscriptions: [...initialSubscriptions],
      auditLogs: [...initialAuditLogs],
    };
  }
}

export const dbStore = new DatabaseManager();
