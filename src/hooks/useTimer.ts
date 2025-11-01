import { useState, useEffect, useRef } from 'react';

export type TimerMode = 'focus' | 'break';

interface UseTimerReturn {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
}

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export const useTimer = (): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = 1 - (timeLeft / totalTime);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            setIsActive(false);
            // Switch modes
            const newMode = mode === 'focus' ? 'break' : 'focus';
            setMode(newMode);
            return newMode === 'focus' ? FOCUS_TIME : BREAK_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, mode]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);

  const reset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const skip = () => {
    setIsActive(false);
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  return {
    timeLeft,
    isActive,
    mode,
    progress,
    start,
    pause,
    reset,
    skip,
  };
};
