import React, { useEffect, useState, useRef } from 'react';
import { Exam } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface ExamTimerModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckOMR: () => void;
}

export const ExamTimerModal: React.FC<ExamTimerModalProps> = ({
  exam,
  isOpen,
  onClose,
  onOpenCheckOMR,
}) => {
  const totalSeconds = exam.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(totalSeconds);
      setIsRunning(false);
      setIsFinished(false);
      setShowWarning(null);
      startTimeRef.current = null;
    }
  }, [isOpen, totalSeconds]);

  useEffect(() => {
    let interval: any = null;

    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          const next = prev - 1;

          if (next === 300) {
            setShowWarning('5 Minutes Remaining! Ensure your OMR bubbles are darkened properly.');
          }
          if (next === 60) {
            setShowWarning('1 Minute Remaining! Stop writing and prepare your OMR sheet for evaluation.');
          }
          if (next <= 0) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  if (!isOpen) return null;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
    setIsFinished(false);
    setShowWarning(null);
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : n);

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        ref={containerRef}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 sm:p-8 flex flex-col items-center justify-between min-h-[500px]"
      >
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="text-left">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block">
              Official Examination Timer
            </span>
            <h3 className="text-lg font-bold text-white truncate max-w-md">
              {exam.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Timer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showWarning && (
          <div className="w-full mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{showWarning}</span>
          </div>
        )}

        <div className="flex flex-col items-center my-8">
          <div className="relative flex items-center justify-center">
            <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="115"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="115"
                stroke="currentColor"
                strokeWidth="8"
                className={`transition-all duration-1000 ${
                  secondsRemaining < 300
                    ? 'text-red-500'
                    : secondsRemaining < 600
                    ? 'text-amber-500'
                    : 'text-blue-500'
                }`}
                strokeDasharray={2 * Math.PI * 115}
                strokeDashoffset={2 * Math.PI * 115 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight tabular-nums">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {isFinished
                  ? 'Time Over'
                  : isRunning
                  ? 'Exam In Progress'
                  : secondsRemaining === totalSeconds
                  ? 'Ready to Start'
                  : 'Timer Paused'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs text-slate-400">
            <span>Duration: {exam.durationMinutes} mins</span>
            <span>·</span>
            <span>Total Questions: {exam.totalQuestions}</span>
            <span>·</span>
            <span>Marks: {exam.totalMarks}</span>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
          {!isRunning && !isFinished && (
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{secondsRemaining === totalSeconds ? 'Start Examination' : 'Resume'}</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handlePause}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause Timer</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCheckOMR();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit / Check OMR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
