import React, { useState, useRef, useEffect } from 'react';
import { AnswerKey, Exam, MarkingScheme, OMRSubmission } from '../../types';
import {
  evaluateOMR,
  generateTestOMRImage,
  OMRProcessingResult,
} from '../../lib/omrEngine';
import { dbStore } from '../../lib/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import {
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  X,
  Eye,
} from 'lucide-react';

interface OMRScannerModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onSubmissionComplete?: (sub: OMRSubmission) => void;
}

export const OMRScannerModal: React.FC<OMRScannerModalProps> = ({
  exam,
  isOpen,
  onClose,
  onSubmissionComplete,
}) => {
  const { currentUser } = useAuth();

  const [step, setStep] = useState<'select' | 'camera' | 'preview' | 'processing' | 'results'>('select');
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [studentRollNumber, setStudentRollNumber] = useState<string>(
    currentUser?.studentRollNumber || '104012'
  );
  const [evaluationResult, setEvaluationResult] = useState<OMRProcessingResult | null>(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedImageSrc(null);
      setRotationDegrees(0);
      setEvaluationResult(null);
      setErrorMessage(null);
      if (currentUser?.studentRollNumber) {
        setStudentRollNumber(currentUser.studentRollNumber);
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentUser?.studentRollNumber]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartCamera = async () => {
    setErrorMessage(null);
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMessage('Camera access was denied or not available. Please choose "Upload from Gallery" instead.');
      setStep('select');
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      stopCamera();
      setSelectedImageSrc(dataUrl);
      setStep('preview');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImageSrc(event.target.result as string);
        setStep('preview');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadDemoSheet = (scenario: 'high_score' | 'mixed_with_ambiguous') => {
    setErrorMessage(null);
    const answersToShade: Record<number, string> = {};

    const answerKey = dbStore.getAnswerKey(exam.id, exam.tenantId, false);
    const correctAnswers = answerKey?.answers || {};

    for (let q = 1; q <= exam.totalQuestions; q++) {
      const correctOpt = correctAnswers[q]?.[0] || 'A';
      if (scenario === 'high_score') {
        answersToShade[q] = q === 16 ? 'B' : correctOpt;
      } else {
        if (q % 4 === 0) answersToShade[q] = 'C';
        else if (q % 5 === 0) continue;
        else answersToShade[q] = correctOpt;
      }
    }

    const demoImg = generateTestOMRImage(
      exam.totalQuestions,
      exam.optionsPerQuestion,
      answersToShade,
      studentRollNumber || '104012'
    );
    setSelectedImageSrc(demoImg);
    setStep('preview');
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    setRotationDegrees((prev) => (prev + delta) % 360);
  };

  const handleEvaluate = async () => {
    if (!selectedImageSrc) return;

    setStep('processing');
    setErrorMessage(null);

    try {
      const img = new Image();
      img.src = selectedImageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to decode uploaded image.'));
      });

      let processedCanvas = document.createElement('canvas');
      if (rotationDegrees === 0) {
        processedCanvas.width = img.width;
        processedCanvas.height = img.height;
        const ctx = processedCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
      } else {
        const rad = (rotationDegrees * Math.PI) / 180;
        const isSwapped = rotationDegrees === 90 || rotationDegrees === 270;
        processedCanvas.width = isSwapped ? img.height : img.width;
        processedCanvas.height = isSwapped ? img.width : img.height;
        const ctx = processedCanvas.getContext('2d')!;
        ctx.translate(processedCanvas.width / 2, processedCanvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      }

      const answerKey = dbStore.getAnswerKey(exam.id, exam.tenantId, false) || {
        id: `ak-${exam.id}`,
        examId: exam.id,
        tenantId: exam.tenantId,
        answers: {},
        allowMultipleCorrect: false,
        optionsPerQuestion: exam.optionsPerQuestion,
        isReleased: true,
        updatedAt: new Date().toISOString(),
      };

      const result = await evaluateOMR(
        processedCanvas,
        exam.totalQuestions,
        exam.optionsPerQuestion,
        answerKey,
        exam.markingScheme
      );

      setEvaluationResult(result);

      if (result.detectedRollNumber && !result.detectedRollNumber.includes('?')) {
        setStudentRollNumber(result.detectedRollNumber);
      }

      const newSubmission = dbStore.addSubmission({
        examId: exam.id,
        tenantId: exam.tenantId,
        studentRollNumber: studentRollNumber || result.detectedRollNumber || '104012',
        studentName: currentUser?.name || 'Candidate Student',
        studentId: currentUser?.id,
        submittedAt: new Date().toISOString(),
        imageUrl: result.canvasDataUrl,
        imageFileName: `omr_${studentRollNumber || 'scan'}.jpg`,
        status: result.flaggedReasons.length > 0 ? 'flagged' : 'processed',
        detectedAnswers: result.detectedAnswers,
        detectedRollNumber: result.detectedRollNumber,
        rollNumberConfidence: result.rollNumberConfidence,
        score: result.score,
        flaggedReasons: result.flaggedReasons,
        auditLog: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            performedBy: 'computer_vision_engine',
            action: 'SUBMITTED_AND_EVALUATED',
            details: `Deterministic CV evaluation completed. Score: ${result.score.finalScore}/${result.score.totalQuestions * exam.markingScheme.correctMarks} (${result.score.percentage}%).`,
          },
        ],
      });

      if (onSubmissionComplete) {
        onSubmissionComplete(newSubmission);
      }

      setStep('results');
    } catch (err: any) {
      console.error('OMR Evaluation Error:', err);
      setErrorMessage(err.message || 'Computer vision pipeline failed to locate OMR sheet markers. Please try again with clear lighting.');
      setStep('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Automated OMR Evaluation
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-600">CV Engine v2.4</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 truncate max-w-lg">
              {exam.title}
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-6 text-center py-4">
              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Submit OMR Sheet for Instant Scoring
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Align the 4 corner black boxes inside the camera frame or upload a clear photo from your gallery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                <button
                  onClick={handleStartCamera}
                  className="p-6 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/80 transition-all flex flex-col items-center justify-center gap-3 group text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-base">Open Camera</span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Use smartphone camera with live alignment guidelines
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-600 bg-slate-50/60 hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-3 group text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-700/20 group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-base">Upload from Gallery</span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      JPG, JPEG, or PNG scanned sheet
                    </span>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="pt-6 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  OR TEST INSTANTLY WITH A DEMO SHEET
                </span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleLoadDemoSheet('high_score')}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Load 95% High Score Test Sheet</span>
                  </button>
                  <button
                    onClick={() => handleLoadDemoSheet('mixed_with_ambiguous')}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Load Sheet with Ambiguous/Light Bubbles</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'camera' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <video ref={videoRef} playsInline autoPlay className="w-full h-full object-cover" />

                <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-4 border-l-4 border-blue-500" />
                    <div className="w-6 h-6 border-t-4 border-r-4 border-blue-500" />
                  </div>
                  <div className="text-center text-[11px] font-medium text-white/90 bg-black/70 px-3 py-1.5 rounded-md mx-auto backdrop-blur-sm border border-white/10">
                    Fit 4 corner alignment squares inside frame
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-4 border-l-4 border-blue-500" />
                    <div className="w-6 h-6 border-b-4 border-r-4 border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-5">
                <button
                  onClick={() => {
                    stopCamera();
                    setStep('select');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCapturePhoto}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && selectedImageSrc && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Student Roll Number:</span>
                  <input
                    type="text"
                    value={studentRollNumber}
                    onChange={(e) => setStudentRollNumber(e.target.value)}
                    placeholder="e.g. 104012"
                    maxLength={10}
                    className="px-2.5 py-1 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="text-xs text-slate-500 mr-1">Rotate:</span>
                  <button
                    onClick={() => handleRotate('ccw')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                    title="Rotate 90 degrees counter-clockwise"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRotate('cw')}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                    title="Rotate 90 degrees clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImageSrc(null);
                      setStep('select');
                    }}
                    className="ml-2 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Change Image
                  </button>
                </div>
              </div>

              <div className="w-full max-h-[380px] bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={selectedImageSrc}
                  alt="OMR Sheet Preview"
                  className="max-h-[360px] object-contain rounded transition-transform"
                  style={{ transform: `rotate(${rotationDegrees}deg)` }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setStep('select')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEvaluate}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for Computer Vision Evaluation</span>
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Processing OMR with Computer Vision Pipeline...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Detecting fiducials, correcting skew, measuring bubble darkening, and comparing with teacher answer key.
                </p>
              </div>
            </div>
          )}

          {step === 'results' && evaluationResult && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Final Score</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {evaluationResult.score.finalScore}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    out of {exam.totalQuestions * exam.markingScheme.correctMarks}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Percentage</span>
                  <span className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
                    {evaluationResult.score.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">Accuracy</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[11px] font-medium text-emerald-700 block">Correct</span>
                  <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                    {evaluationResult.score.correct}
                  </span>
                  <span className="text-[10px] text-emerald-600 block">
                    +{evaluationResult.score.obtainedMarks} Marks
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-center">
                  <span className="text-[11px] font-medium text-red-700 block">Incorrect</span>
                  <span className="text-2xl font-bold font-mono text-red-700 tabular-nums">
                    {evaluationResult.score.incorrect + evaluationResult.score.multipleMarked}
                  </span>
                  <span className="text-[10px] text-red-600 block">
                    -{evaluationResult.score.negativeMarksDeducted} Penalty
                  </span>
                </div>
              </div>

              {evaluationResult.flaggedReasons.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Ambiguous Answers Flagged for Teacher Review:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700">
                    {evaluationResult.flaggedReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 py-1 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span>Candidate Roll: <strong className="text-slate-800 font-mono">{studentRollNumber}</strong></span>
                  <span>·</span>
                  <span>Skew Correction: <strong className="text-slate-800">{evaluationResult.skewDegrees}°</strong></span>
                  <span>·</span>
                  <span>Attempted: <strong className="text-slate-800">{evaluationResult.score.attempted} / {exam.totalQuestions}</strong></span>
                </div>

                <button
                  onClick={() => setShowDebugOverlay(!showDebugOverlay)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showDebugOverlay ? 'Hide CV Debug Canvas' : 'View CV Debug Canvas'}</span>
                </button>
              </div>

              {showDebugOverlay && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-[11px] text-slate-300 font-medium mb-2">
                    CV Diagnostic View: Green = Detected, Yellow = Borderline, Red = Multiple
                  </span>
                  <img
                    src={evaluationResult.canvasDataUrl}
                    alt="CV Diagnostic Image"
                    className="max-h-[350px] object-contain rounded"
                  />
                </div>
              )}

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Question-Wise Evaluation Breakdown
                </h5>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 sticky top-0 font-medium">
                      <tr>
                        <th className="py-2 px-3">Q#</th>
                        <th className="py-2 px-3">Detected</th>
                        <th className="py-2 px-3">Confidence</th>
                        <th className="py-2 px-3">Correct Key</th>
                        <th className="py-2 px-3">Mark Awarded</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: exam.totalQuestions }, (_, i) => i + 1).map((q) => {
                        const d = evaluationResult.detectedAnswers[q];
                        const answerKey = dbStore.getAnswerKey(exam.id, exam.tenantId, false);
                        const correctOpts = answerKey?.answers[q] || [];
                        const isCorrect = d?.detectedAnswer && correctOpts.includes(d.detectedAnswer);
                        const isUnanswered = !d?.detectedAnswer && !d?.isMultiple;

                        return (
                          <tr key={q} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-semibold text-slate-900 font-mono">{q}</td>
                            <td className="py-2 px-3">
                              {d?.isMultiple ? (
                                <span className="font-semibold text-red-600">MULTIPLE</span>
                              ) : d?.detectedAnswer ? (
                                <span className="font-bold text-slate-900 font-mono px-1.5 py-0.5 rounded bg-slate-100">
                                  {d.detectedAnswer}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600 tabular-nums">
                              {d ? Math.round(d.confidence * 100) : 0}%
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold text-blue-700">
                              {correctOpts.join(', ') || 'N/A'}
                            </td>
                            <td className="py-2 px-3 font-mono tabular-nums font-semibold">
                              {isCorrect ? (
                                <span className="text-emerald-600">+{exam.markingScheme.correctMarks}</span>
                              ) : isUnanswered ? (
                                <span className="text-slate-400">0</span>
                              ) : (
                                <span className="text-red-600">-{exam.markingScheme.negativeMarks}</span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
                                </span>
                              ) : d?.isMultiple ? (
                                <span className="inline-flex items-center gap-1 text-red-700 font-medium text-[11px]">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" /> Multiple
                                </span>
                              ) : isUnanswered ? (
                                <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Skipped
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-700 font-medium text-[11px]">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" /> Incorrect
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedImageSrc(null);
                    setEvaluationResult(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Sheet</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
