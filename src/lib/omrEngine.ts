/**
 * GradeSnap - Deterministic Computer Vision OMR Evaluation Engine
 */

import { AnswerKey, DetectedAnswer, EvaluationScore, MarkingScheme } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface MarkerPosition {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface BubbleCoordinate {
  questionNumber: number;
  option: string;
  x: number;
  y: number;
  radius: number;
}

export interface RollNumberCoordinate {
  digitColumn: number;
  value: number;
  x: number;
  y: number;
  radius: number;
}

export interface OMRProcessingResult {
  detectedAnswers: Record<number, DetectedAnswer>;
  detectedRollNumber: string;
  rollNumberConfidence: number;
  score: EvaluationScore;
  flaggedReasons: string[];
  canvasDataUrl: string;
  rawMarkers: MarkerPosition;
  skewDegrees: number;
}

export const CANONICAL_WIDTH = 1200;
export const CANONICAL_HEIGHT = 1700;
export const FIDUCIAL_MARGIN = 40;
export const FIDUCIAL_SIZE = 36;
export const CANONICAL_MARKERS: MarkerPosition = {
  topLeft: { x: FIDUCIAL_MARGIN + FIDUCIAL_SIZE / 2, y: FIDUCIAL_MARGIN + FIDUCIAL_SIZE / 2 },
  topRight: { x: CANONICAL_WIDTH - FIDUCIAL_MARGIN - FIDUCIAL_SIZE / 2, y: FIDUCIAL_MARGIN + FIDUCIAL_SIZE / 2 },
  bottomLeft: { x: FIDUCIAL_MARGIN + FIDUCIAL_SIZE / 2, y: CANONICAL_HEIGHT - FIDUCIAL_MARGIN - FIDUCIAL_SIZE / 2 },
  bottomRight: { x: CANONICAL_WIDTH - FIDUCIAL_MARGIN - FIDUCIAL_SIZE / 2, y: CANONICAL_HEIGHT - FIDUCIAL_MARGIN - FIDUCIAL_SIZE / 2 },
};

/**
 * Maps a point from canonical (1200x1700) space into the detected fiducial coordinate frame
 * using bilinear interpolation across the 4 detected corner alignment squares.
 */
function mapCanonicalToDetected(pt: Point, detected: MarkerPosition): Point {
  const minX = CANONICAL_MARKERS.topLeft.x;
  const maxX = CANONICAL_MARKERS.topRight.x;
  const minY = CANONICAL_MARKERS.topLeft.y;
  const maxY = CANONICAL_MARKERS.bottomLeft.y;

  const u = (pt.x - minX) / (maxX - minX);
  const v = (pt.y - minY) / (maxY - minY);

  const topX = detected.topLeft.x * (1 - u) + detected.topRight.x * u;
  const topY = detected.topLeft.y * (1 - u) + detected.topRight.y * u;
  const botX = detected.bottomLeft.x * (1 - u) + detected.bottomRight.x * u;
  const botY = detected.bottomLeft.y * (1 - u) + detected.bottomRight.y * u;

  return {
    x: topX * (1 - v) + botX * v,
    y: topY * (1 - v) + botY * v,
  };
}

export function generateBubbleCoordinates(
  totalQuestions: number = 20,
  optionsCount: 4 | 5 = 4
): BubbleCoordinate[] {
  const coordinates: BubbleCoordinate[] = [];
  const options = optionsCount === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
  const bubbleRadius = 14;

  let columns = 1;
  let rowsPerCol = totalQuestions;

  if (totalQuestions <= 20) {
    columns = 2;
    rowsPerCol = 10;
  } else if (totalQuestions <= 50) {
    columns = 2;
    rowsPerCol = 25;
  } else {
    columns = 4;
    rowsPerCol = 25;
  }

  const startY = 700;
  const rowHeight = totalQuestions <= 50 ? 34 : 26;
  const colWidth = 1000 / columns;
  const colStartX = 100;

  for (let q = 1; q <= totalQuestions; q++) {
    const colIdx = Math.floor((q - 1) / rowsPerCol);
    const rowIdx = (q - 1) % rowsPerCol;

    const rowCenterX = colStartX + colIdx * colWidth + (columns === 4 ? 56 : 80);
    const rowCenterY = startY + rowIdx * rowHeight;
    const optSpacing = columns === 4 ? (optionsCount === 5 ? 32 : 38) : (optionsCount === 5 ? 38 : 46);

    options.forEach((opt, oIdx) => {
      coordinates.push({
        questionNumber: q,
        option: opt,
        x: rowCenterX + oIdx * optSpacing,
        y: rowCenterY,
        radius: columns === 4 ? 12 : bubbleRadius,
      });
    });
  }

  return coordinates;
}

export function generateRollNumberCoordinates(): RollNumberCoordinate[] {
  const coordinates: RollNumberCoordinate[] = [];
  const startX = 680;
  const startY = 320;
  const colSpacing = 42;
  const rowSpacing = 30;
  const radius = 12;

  for (let col = 0; col < 6; col++) {
    for (let digit = 0; digit <= 9; digit++) {
      coordinates.push({
        digitColumn: col,
        value: digit,
        x: startX + col * colSpacing,
        y: startY + digit * rowSpacing,
        radius,
      });
    }
  }

  return coordinates;
}

function findFiducialMarkers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): MarkerPosition {
  const defaultMarkers: MarkerPosition = {
    topLeft: { ...CANONICAL_MARKERS.topLeft },
    topRight: { ...CANONICAL_MARKERS.topRight },
    bottomLeft: { ...CANONICAL_MARKERS.bottomLeft },
    bottomRight: { ...CANONICAL_MARKERS.bottomRight },
  };

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const scanQuadrant = (startX: number, startY: number, endX: number, endY: number, fallback: Point): Point => {
      let darkPixelSumX = 0;
      let darkPixelSumY = 0;
      let darkCount = 0;
      const threshold = 75;

      for (let y = Math.floor(startY); y < Math.floor(endY); y += 2) {
        for (let x = Math.floor(startX); x < Math.floor(endX); x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          if (brightness < threshold) {
            darkPixelSumX += x;
            darkPixelSumY += y;
            darkCount++;
          }
        }
      }

      if (darkCount > 25) {
        return {
          x: Math.round(darkPixelSumX / darkCount),
          y: Math.round(darkPixelSumY / darkCount),
        };
      }
      return fallback;
    };

    const quadW = width * 0.14;
    const quadH = height * 0.10;

    return {
      topLeft: scanQuadrant(0, 0, quadW, quadH, defaultMarkers.topLeft),
      topRight: scanQuadrant(width - quadW, 0, width, quadH, defaultMarkers.topRight),
      bottomLeft: scanQuadrant(0, height - quadH, quadW, height, defaultMarkers.bottomLeft),
      bottomRight: scanQuadrant(width - quadW, height - quadH, width, height, defaultMarkers.bottomRight),
    };
  } catch {
    return defaultMarkers;
  }
}

function analyzeBubbleFill(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  paperBaseline: number
): { fillRatio: number; avgBrightness: number } {
  const innerRadius = radius * 0.72;
  const x = Math.round(center.x);
  const y = Math.round(center.y);

  let innerDarkPixels = 0;
  let totalInnerPixels = 0;
  let brightnessSum = 0;

  const sampleBox = Math.ceil(radius * 1.5);

  try {
    const imgData = ctx.getImageData(
      Math.max(0, x - sampleBox),
      Math.max(0, y - sampleBox),
      sampleBox * 2,
      sampleBox * 2
    );
    const data = imgData.data;
    const w = sampleBox * 2;

    for (let dy = -sampleBox; dy < sampleBox; dy++) {
      for (let dx = -sampleBox; dx < sampleBox; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= innerRadius) {
          const px = dx + sampleBox;
          const py = dy + sampleBox;
          const idx = (py * w + px) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          brightnessSum += brightness;
          totalInnerPixels++;

          if (brightness < paperBaseline * 0.65) {
            innerDarkPixels++;
          }
        }
      }
    }

    if (totalInnerPixels === 0) return { fillRatio: 0, avgBrightness: 255 };

    const avgInnerBrightness = brightnessSum / totalInnerPixels;
    const contrastRatio = Math.max(0, (paperBaseline - avgInnerBrightness) / paperBaseline);
    const pixelDensityRatio = innerDarkPixels / totalInnerPixels;
    const fillRatio = Math.min(1.0, pixelDensityRatio * 0.6 + contrastRatio * 0.4);

    return { fillRatio, avgBrightness: avgInnerBrightness };
  } catch {
    return { fillRatio: 0, avgBrightness: 255 };
  }
}

export async function evaluateOMR(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  totalQuestions: number,
  optionsCount: 4 | 5,
  answerKey: AnswerKey,
  markingScheme: MarkingScheme
): Promise<OMRProcessingResult> {
  const canvas = document.createElement('canvas');
  canvas.width = CANONICAL_WIDTH;
  canvas.height = CANONICAL_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context initialization failed.');
  }

  ctx.drawImage(imageSource, 0, 0, CANONICAL_WIDTH, CANONICAL_HEIGHT);

  const markers = findFiducialMarkers(ctx, CANONICAL_WIDTH, CANONICAL_HEIGHT);
  const dx = markers.topRight.x - markers.topLeft.x;
  const dy = markers.topRight.y - markers.topLeft.y;
  const skewDegrees = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Validate reasonable marker box bounds; if wildly off, fallback to canonical
  const isMarkerBoxPlausible =
    dx > CANONICAL_WIDTH * 0.6 &&
    markers.bottomLeft.y - markers.topLeft.y > CANONICAL_HEIGHT * 0.6;
  const activeMarkers = isMarkerBoxPlausible ? markers : CANONICAL_MARKERS;

  let paperBaseline = 230;
  try {
    const marginSample = ctx.getImageData(100, 100, 50, 50).data;
    let sum = 0;
    for (let i = 0; i < marginSample.length; i += 4) {
      sum += (marginSample[i] * 299 + marginSample[i + 1] * 587 + marginSample[i + 2] * 114) / 1000;
    }
    paperBaseline = sum / (marginSample.length / 4);
    if (paperBaseline < 160) paperBaseline = 210;
  } catch {
    paperBaseline = 225;
  }

  // Roll Number Evaluation
  const rollCoords = generateRollNumberCoordinates();
  let detectedRollNumber = '';
  let rollConfidenceSum = 0;

  for (let col = 0; col < 6; col++) {
    const colDigits = rollCoords.filter((c) => c.digitColumn === col);
    let bestDigit = -1;
    let maxFill = 0;

    colDigits.forEach((c) => {
      const mapped = mapCanonicalToDetected({ x: c.x, y: c.y }, activeMarkers);
      const res = analyzeBubbleFill(ctx, mapped, c.radius, paperBaseline);
      if (res.fillRatio > maxFill) {
        maxFill = res.fillRatio;
        bestDigit = c.value;
      }
    });

    if (maxFill >= 0.38) {
      detectedRollNumber += bestDigit.toString();
      rollConfidenceSum += maxFill;
    } else {
      detectedRollNumber += '?';
      rollConfidenceSum += 0.2;
    }
  }

  const rollNumberConfidence = Number((rollConfidenceSum / 6).toFixed(2));

  // Question Answer Bubbles Evaluation
  const bubbleCoords = generateBubbleCoordinates(totalQuestions, optionsCount);
  const detectedAnswers: Record<number, DetectedAnswer> = {};
  const flaggedReasons: string[] = [];

  ctx.lineWidth = 3;

  for (let q = 1; q <= totalQuestions; q++) {
    const qCoords = bubbleCoords.filter((c) => c.questionNumber === q);
    const fillRatios: Record<string, number> = {};

    let highestOption: string | null = null;
    let highestFill = 0;
    let secondHighestFill = 0;
    let markedCount = 0;

    qCoords.forEach((bc) => {
      const mapped = mapCanonicalToDetected({ x: bc.x, y: bc.y }, activeMarkers);
      const res = analyzeBubbleFill(ctx, mapped, bc.radius, paperBaseline);
      fillRatios[bc.option] = Number(res.fillRatio.toFixed(3));

      if (res.fillRatio >= 0.42) {
        markedCount++;
      }

      if (res.fillRatio > highestFill) {
        secondHighestFill = highestFill;
        highestFill = res.fillRatio;
        highestOption = bc.option;
      } else if (res.fillRatio > secondHighestFill) {
        secondHighestFill = res.fillRatio;
      }
    });

    const isMultiple = markedCount > 1;
    const isAmbiguous =
      (highestFill >= 0.26 && highestFill < 0.48) ||
      (isMultiple && highestFill - secondHighestFill < 0.15);

    let chosenAnswer: string | null = null;
    let confidence = 0;

    if (isMultiple) {
      chosenAnswer = null;
      confidence = 0.45;
      flaggedReasons.push(`Q${q}: Multiple bubbles shaded (${highestOption} & other options).`);
    } else if (highestFill >= 0.45) {
      chosenAnswer = highestOption;
      confidence = Math.min(0.99, Number((0.6 + (highestFill - secondHighestFill) * 0.4).toFixed(2)));
    } else if (highestFill >= 0.28) {
      chosenAnswer = highestOption;
      confidence = 0.52;
      flaggedReasons.push(`Q${q}: Borderline/light shading detected (${Math.round(highestFill * 100)}% fill).`);
    } else {
      chosenAnswer = null;
      confidence = 0.95;
    }

    detectedAnswers[q] = {
      questionNumber: q,
      detectedAnswer: chosenAnswer,
      confidence,
      isAmbiguous,
      isMultiple,
      rawFillRatios: fillRatios,
    };

    // Draw debug circle markers at mapped locations
    qCoords.forEach((bc) => {
      const fill = fillRatios[bc.option] || 0;
      const mapped = mapCanonicalToDetected({ x: bc.x, y: bc.y }, activeMarkers);
      if (bc.option === chosenAnswer && !isMultiple && !isAmbiguous) {
        ctx.strokeStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(mapped.x, mapped.y, bc.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isMultiple && fill >= 0.4) {
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(mapped.x, mapped.y, bc.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isAmbiguous && fill >= 0.26) {
        ctx.strokeStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(mapped.x, mapped.y, bc.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  // Scoring
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let multipleMarked = 0;
  let obtainedMarks = 0;
  let negativeMarksDeducted = 0;

  for (let q = 1; q <= totalQuestions; q++) {
    const detected = detectedAnswers[q];
    const correctOptions = answerKey.answers[q] || [];

    if (detected.isMultiple) {
      multipleMarked++;
      attempted++;
      negativeMarksDeducted += markingScheme.negativeMarks;
    } else if (!detected.detectedAnswer) {
      unanswered++;
      obtainedMarks += markingScheme.unansweredMarks;
    } else {
      attempted++;
      if (correctOptions.includes(detected.detectedAnswer)) {
        correct++;
        const customMarks = markingScheme.customQuestionMarks?.[q]?.correct;
        obtainedMarks += customMarks !== undefined ? customMarks : markingScheme.correctMarks;
      } else {
        incorrect++;
        const customNeg = markingScheme.customQuestionMarks?.[q]?.negative;
        const neg = customNeg !== undefined ? customNeg : markingScheme.negativeMarks;
        negativeMarksDeducted += neg;
      }
    }
  }

  const finalScore = Number((obtainedMarks - negativeMarksDeducted).toFixed(2));
  const maxPossibleMarks = Math.max(1, totalQuestions * markingScheme.correctMarks);
  const percentage = Math.max(0, Number(((finalScore / maxPossibleMarks) * 100).toFixed(1)));

  const score: EvaluationScore = {
    totalQuestions,
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

  const canvasDataUrl = canvas.toDataURL('image/jpeg', 0.85);

  return {
    detectedAnswers,
    detectedRollNumber,
    rollNumberConfidence,
    score,
    flaggedReasons,
    canvasDataUrl,
    rawMarkers: markers,
    skewDegrees: Number(skewDegrees.toFixed(2)),
  };
}

export interface CanonicalSheetRenderOptions {
  instituteName?: string;
  examTitle?: string;
  subject?: string;
  sheetVersion?: string;
  instructions?: string;
  totalQuestions: number;
  optionsCount: 4 | 5;
  rollNumber?: string;
  answersToShade?: Record<number, string | string[]>;
  faintQuestions?: number[];
  includeBatchField?: boolean;
  includeCandidateSign?: boolean;
  includeInvigilatorSign?: boolean;
  accentColor?: string;
  showCalibrationOverlay?: boolean;
}

/**
 * Renders a 100% CV-compatible OMR sheet at canonical 1200x1700 resolution.
 * Supports blank printable templates, simulated shaded answers (including faint & multi-mark),
 * and an optional Computer Vision calibration grid overlay for teacher inspection.
 */
export function renderCompatibleOMRSheetCanvas(
  opts: CanonicalSheetRenderOptions
): HTMLCanvasElement {
  const {
    instituteName = 'GRADESNAP OFFICIAL OMR ANSWER SHEET',
    examTitle = 'Examination Assessment',
    subject = 'General',
    sheetVersion = 'v2.4',
    instructions = 'Darken bubble completely using black or dark blue ballpoint pen.',
    totalQuestions = 20,
    optionsCount = 4,
    rollNumber = '',
    answersToShade = {},
    faintQuestions = [],
    includeBatchField = true,
    includeCandidateSign = true,
    includeInvigilatorSign = true,
    accentColor = '#0f172a',
    showCalibrationOverlay = false,
  } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = CANONICAL_WIDTH;
  canvas.height = CANONICAL_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fcfdfe';
  ctx.fillRect(0, 0, CANONICAL_WIDTH, CANONICAL_HEIGHT);

  // 4 Corner Black Fiducial Alignment Squares (must remain crisp dark black for CV detector)
  const mSize = FIDUCIAL_SIZE;
  const mMargin = FIDUCIAL_MARGIN;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(mMargin, mMargin, mSize, mSize);
  ctx.fillRect(CANONICAL_WIDTH - mMargin - mSize, mMargin, mSize, mSize);
  ctx.fillRect(mMargin, CANONICAL_HEIGHT - mMargin - mSize, mSize, mSize);
  ctx.fillRect(CANONICAL_WIDTH - mMargin - mSize, CANONICAL_HEIGHT - mMargin - mSize, mSize, mSize);

  // Header
  ctx.fillStyle = accentColor || '#0f172a';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(instituteName.toUpperCase().slice(0, 44), 100, 102);

  ctx.font = '600 18px sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`${examTitle}  •  Subject: ${subject}`, 100, 134);

  ctx.font = '500 13px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(
    `COMPATIBLE OMR TEMPLATE ${sheetVersion.toUpperCase()}  |  QUESTIONS: ${totalQuestions}  |  OPTIONS: ${optionsCount === 5 ? 'A-E' : 'A-D'}`,
    100,
    158
  );

  // Left: Candidate Info Box
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(100, 180, 520, 440);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('STUDENT & CANDIDATE DETAILS', 120, 215);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Student Name: _____________________________________', 120, 260);
  ctx.fillText(`Exam: ${examTitle.slice(0, 38)}`, 120, 305);
  if (includeBatchField) {
    ctx.fillText('Batch / Section: __________________________________', 120, 350);
  }
  if (includeCandidateSign) {
    ctx.fillText('Candidate Signature: ______________________________', 120, 410);
  }
  if (includeInvigilatorSign) {
    ctx.fillText('Invigilator Signature: ____________________________', 120, 465);
  }

  ctx.fillStyle = '#334155';
  ctx.font = '12px sans-serif';
  ctx.fillText(`• ${instructions.slice(0, 68)}`, 120, 528);
  ctx.fillText('• Do not tick, cross, or make stray marks near corner squares.', 120, 554);
  ctx.fillText('• Compatible with GradeSnap CV Scanner & Teacher Recheck.', 120, 580);

  // Right: Roll Number Bubble Box (Fixed Canonical Coords)
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(650, 180, 450, 440);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('STUDENT ROLL NUMBER (6 DIGITS)', 670, 215);

  const rollCols = 6;
  const rollStartX = 680;
  for (let c = 0; c < rollCols; c++) {
    const digitChar = rollNumber[c] || '';
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(rollStartX + c * 42, 235, 36, 42);
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(digitChar, rollStartX + c * 42 + 11, 264);
  }

  const rollCoords = generateRollNumberCoordinates();
  rollCoords.forEach((rc) => {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(rc.x, rc.y, rc.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(rc.value.toString(), rc.x - 3.5, rc.y + 4);

    if (rollNumber && rollNumber.length > rc.digitColumn) {
      const targetDigit = parseInt(rollNumber[rc.digitColumn], 10);
      if (rc.value === targetDigit) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(rc.x, rc.y, rc.radius - 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // Bottom: Answer Bubble Grid
  const bubbleCoords = generateBubbleCoordinates(totalQuestions, optionsCount);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, 650, 1040, 950);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ANSWER BUBBLE GRID', 100, 682);

  const qFontSize = totalQuestions > 50 ? 12 : 14;
  const qLabelOffset = totalQuestions > 50 ? 38 : 55;

  bubbleCoords.forEach((bc) => {
    if (bc.option === 'A') {
      ctx.font = `bold ${qFontSize}px sans-serif`;
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${bc.questionNumber}.`, bc.x - qLabelOffset, bc.y + 4);
    }

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(bc.x, bc.y, bc.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = totalQuestions > 50 ? '10px sans-serif' : '11px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(bc.option, bc.x - 3.5, bc.y + 4);

    const shaded = answersToShade[bc.questionNumber];
    const isShaded = Array.isArray(shaded)
      ? shaded.includes(bc.option)
      : shaded === bc.option;

    if (isShaded) {
      const isFaint = faintQuestions.includes(bc.questionNumber);
      ctx.fillStyle = isFaint ? 'rgba(30, 41, 59, 0.36)' : '#0f172a';
      ctx.beginPath();
      ctx.arc(bc.x, bc.y, isFaint ? bc.radius * 0.72 : bc.radius - 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Footer
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(
    `GradeSnap Machine-Readable OMR • ${sheetVersion} • Canonical 1200x1700 Fiducial Frame`,
    100,
    1632
  );

  // Optional CV Calibration Overlay for Teacher Verification
  if (showCalibrationOverlay) {
    ctx.save();
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.85)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(
      CANONICAL_MARKERS.topLeft.x,
      CANONICAL_MARKERS.topLeft.y,
      CANONICAL_MARKERS.topRight.x - CANONICAL_MARKERS.topLeft.x,
      CANONICAL_MARKERS.bottomLeft.y - CANONICAL_MARKERS.topLeft.y
    );
    ctx.setLineDash([]);

    // Highlight 4 Fiducial Target Crosshairs
    Object.values(CANONICAL_MARKERS).forEach((pt) => {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pt.x - 24, pt.y - 24, 48, 48);
    });

    // Highlight Sampling Core Circles
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.45)';
    ctx.lineWidth = 1;
    rollCoords.forEach((rc) => {
      ctx.beginPath();
      ctx.arc(rc.x, rc.y, rc.radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    });
    bubbleCoords.forEach((bc) => {
      ctx.beginPath();
      ctx.arc(bc.x, bc.y, bc.radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  return canvas;
}

export function generateTestOMRImage(
  totalQuestions: number = 20,
  optionsCount: 4 | 5 = 4,
  answersToShade: Record<number, string>,
  rollNumber: string = '104012'
): string {
  const canvas = renderCompatibleOMRSheetCanvas({
    totalQuestions,
    optionsCount,
    answersToShade,
    rollNumber,
  });
  return canvas.toDataURL('image/jpeg', 0.9);
}
