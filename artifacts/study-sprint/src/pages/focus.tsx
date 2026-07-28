import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, FastForward, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useStudyStore } from '@/context/StudyContext';
import { PageTransition } from '@/components/PageTransition';

const QUOTES = [
  "Deep work is the superpower of the 21st century.",
  "Focus is a muscle. The more you use it, the stronger it gets.",
  "Do what you have to do until you can do what you want to do.",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "The successful warrior is the average man, with laser-like focus.",
  "If you are going through hell, keep going.",
  "Don't stop when you're tired. Stop when you're done.",
  "Action is the foundational key to all success.",
  "It always seems impossible until it's done."
];

export default function Focus() {
  const [location, setLocation] = useLocation();
  const { 
    timerState, 
    plannedSprints, 
    subjects, 
    pauseTimer, 
    resumeTimer, 
    skipSprint, 
    completeSprint,
    startTimer,
    clearTimerState
  } = useStudyStore();

  const activeSprintId = timerState.activePlannedSprintId;
  const sprint = plannedSprints.find(s => s.id === activeSprintId);
  const subject = sprint ? subjects.find(s => s.id === sprint.subjectId) : null;

  // Local state for UI updates
  const [remainingMs, setRemainingMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const beepPlayedRef = useRef(false);

  // Pick a stable quote based on sprint id
  const quote = useMemo(() => {
    if (!sprint) return QUOTES[0];
    const index = sprint.id.charCodeAt(0) % QUOTES.length;
    return QUOTES[index];
  }, [sprint]);

  // Redirect if no sprint
  useEffect(() => {
    if (!timerState.isHydrated) return; // wait for hydration
    if (!activeSprintId && !isFinished) {
      setLocation('/planner');
    }
  }, [activeSprintId, isFinished, setLocation, timerState.isHydrated]);

  // Timer loop
  useEffect(() => {
    if (!sprint || !timerState.startTimestamp || isFinished) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - timerState.startTimestamp!) - (timerState.pausedAt ? (now - timerState.pausedAt) : 0);
      const remaining = Math.max(0, timerState.totalDurationMs - elapsed);
      
      setRemainingMs(remaining);

      if (remaining === 0 && !isFinished) {
        setIsFinished(true);
        playBeep();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sprint, timerState.startTimestamp, timerState.pausedAt, timerState.totalDurationMs, isFinished]);

  const playBeep = () => {
    if (beepPlayedRef.current) return;
    beepPlayedRef.current = true;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported or blocked');
    }
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.ceil(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = sprint ? 1 - (remainingMs / timerState.totalDurationMs) : 0;
  const circumference = 2 * Math.PI * 120; // r=120
  const strokeDashoffset = circumference - progress * circumference;

  const handleSkip = () => {
    if (!sprint) return;
    skipSprint(sprint.id);
    const nextSprint = plannedSprints.find(s => s.id !== sprint.id);
    if (nextSprint) {
      startTimer(nextSprint.id);
      setIsFinished(false);
      beepPlayedRef.current = false;
    } else {
      setLocation('/dashboard');
    }
  };

  const handleComplete = () => {
    if (!sprint) return;
    const actualElapsedMs = timerState.totalDurationMs - remainingMs;
    const actualMinutes = Math.ceil(actualElapsedMs / 60000);
    completeSprint(sprint.id, actualMinutes);
    
    const nextSprint = plannedSprints.find(s => s.id !== sprint.id);
    if (nextSprint) {
      startTimer(nextSprint.id);
      setIsFinished(false);
      beepPlayedRef.current = false;
    } else {
      setLocation('/dashboard');
    }
  };

  const handleAbort = () => {
    clearTimerState();
    setLocation('/planner');
  };

  if (!sprint) return null;

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background dynamic glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"
          animate={{
            scale: isFinished ? [1, 1.2, 1] : 1,
            opacity: isFinished ? [0.5, 0.8, 0.5] : 0.5,
          }}
          transition={isFinished ? { repeat: Infinity, duration: 2 } : {}}
        />

        <button 
          onClick={handleAbort}
          className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Planner</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel p-8 sm:p-12 rounded-[32px] flex flex-col items-center text-center relative"
        >
          
          <div className="mb-8 space-y-2">
            <span className="inline-block px-3 py-1 rounded bg-primary/20 text-primary font-mono text-sm tracking-wider font-semibold uppercase">
              {subject?.name || 'Unknown'}
            </span>
            <h2 className="text-2xl font-bold text-white max-w-[280px] truncate">{sprint.topic}</h2>
          </div>

          {/* Timer Ring */}
          <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-10">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r="120"
                fill="transparent"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <motion.circle
                cx="130"
                cy="130"
                r="120"
                fill="transparent"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.1, ease: 'linear' }}
                className={isFinished ? "opacity-0" : "opacity-100"}
              />
            </svg>

            <AnimatePresence mode="wait">
              {isFinished ? (
                <motion.div 
                  key="finished"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4 relative">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <CheckCircle2 className="w-16 h-16 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-white">Time's Up!</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute flex flex-col items-center"
                >
                  <span className="text-6xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-lg">
                    {formatTime(remainingMs)}
                  </span>
                  {timerState.pausedAt && (
                    <span className="absolute -bottom-8 text-amber-500 font-bold tracking-widest uppercase text-sm animate-pulse">
                      Paused
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSkip}
              className="p-4 rounded-full glass-button text-muted-foreground hover:text-white"
              title="Skip Sprint"
            >
              <FastForward className="w-6 h-6" />
            </button>

            {!isFinished && (
              <button
                onClick={timerState.pausedAt ? resumeTimer : pauseTimer}
                className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(0,204,255,0.4)]"
              >
                {timerState.pausedAt ? (
                  <Play className="w-8 h-8 fill-current ml-1" />
                ) : (
                  <Pause className="w-8 h-8 fill-current" />
                )}
              </button>
            )}

            {isFinished && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleComplete}
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(0,204,255,0.4)]"
              >
                Complete Session
              </motion.button>
            )}

            {!isFinished && (
              <button
                onClick={handleComplete}
                className="p-4 rounded-full glass-button text-muted-foreground hover:text-emerald-400"
                title="Finish Early"
              >
                <CheckCircle2 className="w-6 h-6" />
              </button>
            )}
          </div>

          <p className="mt-12 text-sm text-muted-foreground/60 italic max-w-[280px]">
            "{quote}"
          </p>

        </motion.div>
      </div>
    </PageTransition>
  );
}
