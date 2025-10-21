import { useState, useEffect, useCallback } from 'react';

interface UseTimelineOptions {
  duration: number;
  onTimeUpdate?: (time: number) => void;
}

export function useTimeline({ duration, onTimeUpdate }: UseTimelineOptions) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    onTimeUpdate?.(time);
  }, [onTimeUpdate]);

  const handleSeek = useCallback((time: number) => {
    handleTimeUpdate(Math.max(0, Math.min(time, duration)));
  }, [duration, handleTimeUpdate]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Auto-advance time when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  return {
    currentTime,
    isPlaying,
    handleTimeUpdate,
    handleSeek,
    togglePlayPause,
  };
} 