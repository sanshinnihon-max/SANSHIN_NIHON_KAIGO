import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  initialSeconds: number;
  isActive?: boolean;
  onTimeExpired?: () => void;
  className?: string;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  initialSeconds,
  isActive = true,
  onTimeExpired,
  className = '',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, secondsRemaining, onTimeExpired]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');

  const isLowTime = secondsRemaining > 0 && secondsRemaining <= 300; // < 5 minutes
  const isExpired = secondsRemaining === 0;

  return (
    <div
      className={`inline-flex items-center px-3.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-colors shadow-2xs ${
        isExpired
          ? 'bg-rose-50 text-rose-800 border-rose-300'
          : isLowTime
          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
          : 'bg-[#FFF0F6] text-[#54263F] border-[#F3C3D8]'
      } ${className}`}
    >
      {isLowTime || isExpired ? (
        <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 mr-1.5 text-[#D94F91] shrink-0" />
      )}
      <span className="font-bold tracking-wider text-xs">{formattedTime}</span>
      <span className="ml-1.5 text-[10px] uppercase font-sans text-[#806779]">
        {isExpired ? 'Expired' : 'Remaining'}
      </span>
    </div>
  );
};
