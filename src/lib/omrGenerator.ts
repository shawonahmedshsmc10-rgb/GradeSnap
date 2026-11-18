/**
 * GradeSnap - Print-Ready A4 OMR Sheet PDF Generator
 * Uses 1:1 proportional mapping from the canonical 1200x1700 CV coordinate space
 * onto A4 (210mm x 297mm) so every printed sheet is immediately compatible with
 * the GradeSnap deterministic CV scanner, recheck, and audit pipeline.
 */

import { jsPDF } from 'jspdf';
import { CustomOMRSheetTemplate, Exam } from '../types';
import {
  CANONICAL_HEIGHT,
  CANONICAL_WIDTH,
  FIDUCIAL_MARGIN,
  FIDUCIAL_SIZE,
  generateBubbleCoordinates,
  generateRollNumberCoordinates,
} from './omrEngine';

const A4_WIDTH = 210;
const A4_HEIGHT = 297;

const toMmX = (cx: number) => (cx / CANONICAL_WIDTH) * A4_WIDTH;
const toMmY = (cy: number) => (cy / CANONICAL_HEIGHT) * A4_HEIGHT;
const toMmR = (cr: number) => (cr / CANONICAL_WIDTH) * A4_WIDTH;

export interface A4OMRRenderInput {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  optionsPerQuestion: 4 | 5;
  instituteName: string;
  sheetVersion?: string;
  instructions?: string;
  includeBatchField?: boolean;
  includeCandidateSign?: boolean;
  includeInvigilatorSign?: boolean;
  accentColor?: string;
  totalMarks?: number;
  durationMinutes?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [15, 23, 42];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return [15, 23, 42];
  return [r, g, b];
}

export function generateCompatibleA4PDF(input: A4OMRRenderInput): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Draw 4 Corner Black Fiducial Alignment Markers at exact canonical coordinates
  const mW = toMmX(FIDUCIAL_SIZE);
  const mH = toMmY(FIDUCIAL_SIZE);
  const mX = toMmX(FIDUCIAL_MARGIN);
  const mY = toMmY(FIDUCIAL_MARGIN);

  doc.setFillColor(15, 23, 42);
  doc.rect(mX, mY, mW, mH, 'F');
  doc.rect(A4_WIDTH - mX - mW, mY, mW, mH, 'F');
  doc.rect(mX, A4_HEIGHT - mY - mH, mW, mH, 'F');
  doc.rect(A4_WIDTH - mX - mW, A4_HEIGHT - mY - mH, mW, mH, 'F');

  // 2. Top Header
  const [ar, ag, ab] = hexToRgb(input.accentColor || '#0f172a');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(ar, ag, ab);
  doc.text(input.instituteName.toUpperCase().slice(0, 52), toMmX(100), toMmY(98));

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${input.title}  •  Subject: ${input.subject}`.slice(0, 78), toMmX(100), toMmY(132));

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const metaParts = [
    `TEMPLATE ${input.sheetVersion || 'v2.4'}`,
    `QUESTIONS: ${input.totalQuestions}`,
    `OPTIONS: ${input.optionsPerQuestion === 5 ? 'A-E' : 'A-D'}`,
  ];
  if (input.totalMarks !== undefined) metaParts.push(`MARKS: ${input.totalMarks}`);
  if (input.durationMinutes !== undefined) metaParts.push(`TIME: ${input.durationMinutes}m`);
  doc.text(metaParts.join('  |  '), toMmX(100), toMmY(156));

  // 3. Left Candidate Info Box (100, 180, 520, 440 in canonical)
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(toMmX(100), toMmY(180), toMmX(520), toMmY(440), 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STUDENT & CANDIDATE DETAILS', toMmX(120), toMmY(215));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Student Name:', toMmX(120), toMmY(260));
  doc.line(toMmX(240), toMmY(260), toMmX(590), toMmY(260));

  doc.text(`Exam: ${input.title.slice(0, 40)}`, toMmX(120), toMmY(305));

  if (input.includeBatchField !== false) {
    doc.text('Batch / Section:', toMmX(120), toMmY(350));
    doc.line(toMmX(250), toMmY(350), toMmX(590), toMmY(350));
  }

  if (input.includeCandidateSign !== false) {
    doc.text('Candidate Signature:', toMmX(120), toMmY(410));
    doc.line(toMmX(280), toMmY(410), toMmX(590), toMmY(410));
  }

  if (input.includeInvigilatorSign !== false) {
    doc.text('Invigilator Signature:', toMmX(120), toMmY(465));
    doc.line(toMmX(280), toMmY(465), toMmX(590), toMmY(465));
  }

  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  const inst = input.instructions || 'Darken bubble completely using black or dark blue ballpoint pen.';
  doc.text(`• ${inst.slice(0, 74)}`, toMmX(120), toMmY(528));
  doc.text('• Do not tick, cross, or make stray marks near corner squares.', toMmX(120), toMmY(554));
  doc.text('• Compatible with GradeSnap CV Scanner & Teacher Recheck.', toMmX(120), toMmY(580));

  // 4. Right Roll Number Bubble Grid (650, 180, 450, 440 in canonical)
  doc.setDrawColor(203, 213, 225);
  doc.rect(toMmX(650), toMmY(180), toMmX(450), toMmY(440), 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STUDENT ROLL NUMBER (6 DIGITS)', toMmX(670), toMmY(215));

  const rollStartX = 680;
  for (let c = 0; c < 6; c++) {
    doc.setDrawColor(148, 163, 184);
    doc.rect(toMmX(rollStartX + c * 42), toMmY(235), toMmX(36), toMmY(42), 'S');
  }

  const rollCoords = generateRollNumberCoordinates();
  rollCoords.forEach((rc) => {
    const cx = toMmX(rc.x);
    const cy = toMmY(rc.y);
    const cr = toMmR(rc.radius);
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.25);
    doc.circle(cx, cy, cr, 'S');

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(rc.value.toString(), cx, cy + 0.6, { align: 'center' });
  });

  // 5. Answer Bubble Grid (80, 650, 1040, 950 in canonical)
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(toMmX(80), toMmY(650), toMmX(1040), toMmY(950), 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ANSWER BUBBLE GRID', toMmX(100), toMmY(682));

  const totalQuestions = Math.min(100, Math.max(5, input.totalQuestions || 20));
  const bubbleCoords = generateBubbleCoordinates(totalQuestions, input.optionsPerQuestion);
  const qLabelOffset = totalQuestions > 50 ? 38 : 55;

  bubbleCoords.forEach((bc) => {
    const bx = toMmX(bc.x);
    const by = toMmY(bc.y);
    const br = toMmR(bc.radius);

    if (bc.option === 'A') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(totalQuestions > 50 ? 6.5 : 7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${bc.questionNumber}.`, toMmX(bc.x - qLabelOffset), by + 0.7);
    }

    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.25);
    doc.circle(bx, by, br, 'S');

    doc.setFontSize(totalQuestions > 50 ? 4.8 : 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(bc.option, bx, by + 0.6, { align: 'center' });
  });

  // 6. Footer
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `GradeSnap Machine-Readable OMR • ID: ${input.id.toUpperCase()} • ${input.sheetVersion || 'v2.4'} • Canonical 1200x1700 Fiducial Frame`,
    A4_WIDTH / 2,
    toMmY(1635),
    { align: 'center' }
  );

  return doc;
}

export function generateA4OMRSheetPDF(exam: Exam, instituteName: string = 'GradeSnap Academy'): jsPDF {
  return generateCompatibleA4PDF({
    id: exam.id,
    title: exam.title,
    subject: exam.subject,
    totalQuestions: exam.totalQuestions,
    optionsPerQuestion: exam.optionsPerQuestion,
    instituteName,
    sheetVersion: 'v2.4',
    totalMarks: exam.totalMarks,
    durationMinutes: exam.durationMinutes,
  });
}

export function downloadOMRSheet(exam: Exam, instituteName?: string) {
  const doc = generateA4OMRSheetPDF(exam, instituteName);
  const safeTitle = exam.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`OMR_Sheet_${safeTitle}.pdf`);
}

export function downloadCustomOMRSheet(template: CustomOMRSheetTemplate) {
  const doc = generateCompatibleA4PDF({
    id: template.id,
    title: template.examTitle || template.name,
    subject: template.subject,
    totalQuestions: template.totalQuestions,
    optionsPerQuestion: template.optionsPerQuestion,
    instituteName: template.instituteName,
    sheetVersion: template.sheetVersion,
    instructions: template.instructions,
    includeBatchField: template.includeBatchField,
    includeCandidateSign: template.includeCandidateSign,
    includeInvigilatorSign: template.includeInvigilatorSign,
    accentColor: template.accentColor,
  });
  const safeName = template.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`GradeSnap_OMR_${safeName}_${template.sheetVersion}.pdf`);
}
