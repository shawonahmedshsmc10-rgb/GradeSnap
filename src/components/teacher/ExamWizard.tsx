import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnswerKey, Exam, ExamCategory } from '../../types';
import { dbStore } from '../../lib/mockDatabase';
import { downloadOMRSheet } from '../../lib/omrGenerator';
import {
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  Sparkles,
  FileDown,
} from 'lucide-react';

interface ExamWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (newExam: Exam) => void;
}

export const ExamWizard: React.FC<ExamWizardProps> = ({ isOpen, onClose, onExamCreated }) => {
  const { currentTenant, currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ExamCategory>('competitive');
  const [totalQuestions, setTotalQuestions] = useState<number>(20);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState<4 | 5>(4);
  const [teacherName, setTeacherName] = useState(currentUser?.name || 'Prof. Anisul Haque');

  const [questionPaperName, setQuestionPaperName] = useState('Physics_Model_Test.pdf');
  const [instructions, setInstructions] = useState(
    'Shade bubbles completely using black or blue ballpoint pen. Each wrong answer deducts 0.25 marks.'
  );

  const [answerKeyMap, setAnswerKeyMap] = useState<Record<number, string[]>>({});
  const [allowMultipleCorrect, setAllowMultipleCorrect] = useState(false);

  const [correctMarks, setCorrectMarks] = useState<number>(1.0);
  const [negativeMarks, setNegativeMarks] = useState<number>(0.25);
  const [unansweredMarks, setUnansweredMarks] = useState<number>(0.0);

  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [maxSubmissions, setMaxSubmissions] = useState<number>(500);

  if (!isOpen) return null;

  const options = optionsPerQuestion === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  const handleToggleAnswer = (questionNum: number, opt: string) => {
    setAnswerKeyMap((prev) => {
      const current = prev[questionNum] || [];
      if (allowMultipleCorrect) {
        if (current.includes(opt)) {
          return { ...prev, [questionNum]: current.filter((o) => o !== opt) };
        } else {
          return { ...prev, [questionNum]: [...current, opt] };
        }
      } else {
        return { ...prev, [questionNum]: [opt] };
      }
    });
  };

  const handleAutoFillKey = () => {
    const newMap: Record<number, string[]> = {};
    const defaultCycle = ['A', 'C', 'B', 'D'];
    for (let q = 1; q <= totalQuestions; q++) {
      newMap[q] = [defaultCycle[(q - 1) % defaultCycle.length]];
    }
    setAnswerKeyMap(newMap);
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!title.trim()) {
        setErrorMessage('Please enter an Examination Title.');
        return false;
      }
      if (!subject.trim()) {
        setErrorMessage('Please enter an Examination Subject.');
        return false;
      }
      if (totalQuestions < 5 || totalQuestions > 100) {
        setErrorMessage('Total questions must be between 5 and 100.');
        return false;
      }
    } else if (step === 3) {
      let missingCount = 0;
      for (let q = 1; q <= totalQuestions; q++) {
        if (!answerKeyMap[q] || answerKeyMap[q].length === 0) {
          missingCount++;
        }
      }
      if (missingCount > 0) {
        setErrorMessage(
          `Answer Key is incomplete: ${missingCount} questions still have no correct answer assigned.`
        );
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleCreateExam = (published: boolean) => {
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    const tenantId = currentTenant?.id || 'tenant-apex';

    const examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'> = {
      tenantId,
      title: title.trim(),
      description: description.trim() || instructions,
      subject: subject.trim(),
      category,
      totalQuestions,
      totalMarks: totalQuestions * correctMarks,
      durationMinutes,
      startTime: new Date(startDate).toISOString(),
      endTime: new Date(endDate).toISOString(),
      status: published ? 'live' : 'draft',
      published,
      allowLateSubmission,
      maxSubmissions,
      markingScheme: {
        correctMarks,
        negativeMarks,
        unansweredMarks,
      },
      questionPaperFileName: questionPaperName,
      omrTemplateId: 'std-omr-v2',
      optionsPerQuestion,
      allowMultipleCorrect,
      teacherName: teacherName.trim(),
    };

    const actor = {
      userId: currentUser?.id || 'teacher-active',
      name: teacherName.trim() || currentUser?.name || 'Faculty Lead',
      email: currentUser?.email || 'teacher@gradesnap.io',
      role: (currentUser?.role || 'teacher') as any,
    };

    const newExam = dbStore.createExam(examData, actor);

    const answerKeyData: AnswerKey = {
      id: `ak-${newExam.id}`,
      examId: newExam.id,
      tenantId,
      answers: answerKeyMap,
      allowMultipleCorrect,
      optionsPerQuestion,
      isReleased: true,
      updatedAt: new Date().toISOString(),
    };
    dbStore.setAnswerKey(answerKeyData, tenantId, actor);

    onExamCreated(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
              Step-by-Step Examination Wizard
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Create New Examination (Step {currentStep} of 5)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-5 border-b border-slate-200 text-center text-xs font-medium">
          {[
            { num: 1, label: '1. Basic Info' },
            { num: 2, label: '2. Uploads' },
            { num: 3, label: '3. Answer Key' },
            { num: 4, label: '4. Marking' },
            { num: 5, label: '5. Schedule' },
          ].map((s) => (
            <div
              key={s.num}
              className={`py-2.5 border-r last:border-r-0 transition-colors ${
                currentStep === s.num
                  ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-b-blue-600'
                  : currentStep > s.num
                  ? 'bg-slate-50 text-emerald-700 font-medium'
                  : 'bg-white text-slate-400'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Examination Name / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. HSC Physics 2nd Paper Final Model Test"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics, Biology, Chemistry, Math"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExamCategory)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="competitive">Competitive Model Test</option>
                    <option value="medical">Medical Admission Test (DGHS)</option>
                    <option value="engineering">Engineering Admission (BUET/CKRUET)</option>
                    <option value="board">HSC / SSC Board Standard</option>
                    <option value="standard">Standard Term Evaluation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Options Per MCQ
                  </label>
                  <select
                    value={optionsPerQuestion}
                    onChange={(e) => setOptionsPerQuestion(Number(e.target.value) as 4 | 5)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value={4}>4 Options (A, B, C, D)</option>
                    <option value={5}>5 Options (A, B, C, D, E)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teacher / Faculty Name
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Examination Description / Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline syllabus chapters, topic distribution or prerequisite instructions..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-bold text-slate-900">
                  Upload Question Paper (PDF)
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Students will be able to download or view this during the exam.
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setQuestionPaperName(f.name);
                    }
                  }}
                  className="mt-3 text-xs text-slate-600"
                />
                <span className="text-[11px] text-blue-700 font-mono mt-2">
                  Current: {questionPaperName}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Standard GradeSnap A4 OMR Template (Version 2.4)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Automated layout with 4 corner alignment fiducials matching your {totalQuestions} questions.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    downloadOMRSheet(
                      {
                        id: 'preview',
                        tenantId: 'tenant-apex',
                        title: title || 'Draft Exam',
                        description: description || 'Standard objective examination sheet.',
                        subject: subject || 'Science',
                        category: 'standard',
                        totalQuestions,
                        totalMarks: totalQuestions * correctMarks,
                        durationMinutes,
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        status: 'draft',
                        published: false,
                        allowLateSubmission: false,
                        markingScheme: { correctMarks, negativeMarks, unansweredMarks },
                        omrTemplateId: 'std-20q',
                        optionsPerQuestion,
                        allowMultipleCorrect,
                        teacherName,
                        createdAt: '',
                        updatedAt: '',
                      },
                      teacherName
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Preview A4 OMR PDF</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Candidate Instructions Note
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Answer Key Configuration</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-600 font-mono">
                    {Object.keys(answerKeyMap).filter((k) => answerKeyMap[Number(k)]?.length > 0).length} / {totalQuestions} Configured
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFillKey}
                    className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100/70 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Populate Draft Key</span>
                  </button>

                  <label className="flex items-center gap-1.5 text-xs text-slate-700 ml-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultipleCorrect}
                      onChange={(e) => setAllowMultipleCorrect(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Allow Multiple Correct</span>
                  </label>
                </div>
              </div>

              <div className="max-h-[340px] overflow-y-auto border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((q) => {
                  const currentSelected = answerKeyMap[q] || [];
                  const isConfigured = currentSelected.length > 0;

                  return (
                    <div
                      key={q}
                      className={`p-2 rounded-xl border transition-colors flex items-center justify-between ${
                        isConfigured ? 'bg-slate-50/80 border-slate-200' : 'bg-red-50/40 border-red-200'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 font-mono w-6">
                        {q}.
                      </span>

                      <div className="flex items-center gap-1">
                        {options.map((opt) => {
                          const isSelected = currentSelected.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleToggleAnswer(q, opt)}
                              className={`w-6 h-6 rounded-lg text-xs font-bold font-mono transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 text-center">
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Correct Answer (+Marks)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    value={correctMarks}
                    onChange={(e) => setCorrectMarks(Number(e.target.value))}
                    className="w-24 mx-auto text-center py-1.5 text-base font-bold font-mono bg-white border border-emerald-300 rounded-lg text-emerald-900"
                  />
                  <span className="text-[11px] text-emerald-600 block mt-1">
                    Standard: +1.0
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-red-50/50 text-center">
                  <label className="block text-xs font-bold text-red-800 mb-1">
                    Negative Mark (-Marks)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-24 mx-auto text-center py-1.5 text-base font-bold font-mono bg-white border border-red-300 rounded-lg text-red-900"
                  />
                  <span className="text-[11px] text-red-600 block mt-1">
                    Standard: -0.25 (Medical/BUET)
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unanswered (0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={unansweredMarks}
                    onChange={(e) => setUnansweredMarks(Number(e.target.value))}
                    className="w-24 mx-auto text-center py-1.5 text-base font-bold font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Usually 0 marks
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
                <strong>Marking Summary:</strong> For {totalQuestions} questions with +{correctMarks} per correct and -{negativeMarks} per wrong answer, the maximum achievable score is{' '}
                <strong className="font-mono">{totalQuestions * correctMarks}</strong> marks.
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Examination Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Submissions
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxSubmissions}
                    onChange={(e) => setMaxSubmissions(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available From (Start Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Until (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="lateSub"
                  checked={allowLateSubmission}
                  onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="lateSub" className="text-xs text-slate-700 cursor-pointer">
                  Allow late submissions with penalty flag
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateExam(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateExam(true)}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Examination Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
