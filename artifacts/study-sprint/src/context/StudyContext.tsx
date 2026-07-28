import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  StudyStore, 
  Subject, 
  PlannedSprint, 
  CompletedSprint, 
  SkippedSprint, 
  TimerState,
  INITIAL_STATE 
} from '@/types';

interface StudyContextType extends StudyStore {
  addSubject: (name: string) => Subject;
  addPlannedSprint: (sprint: Omit<PlannedSprint, 'id'>) => void;
  reorderPlannedSprints: (orderedIds: string[]) => void;
  removePlannedSprint: (id: string) => void;
  startTimer: (sprintId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipSprint: (sprintId: string) => void;
  completeSprint: (sprintId: string, actualMinutes: number) => void;
  clearTimerState: () => void;
  updateTimerState: (state: Partial<TimerState>) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StudyStore>(INITIAL_STATE);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('study-sprint-store');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStore({ ...parsed, isHydrated: true });
      } catch (e) {
        console.error("Failed to parse store", e);
        setStore(s => ({ ...s, isHydrated: true }));
      }
    } else {
      setStore(s => ({ ...s, isHydrated: true }));
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (store.isHydrated) {
      // Don't save isHydrated flag
      const { isHydrated, ...toSave } = store;
      localStorage.setItem('study-sprint-store', JSON.stringify(toSave));
    }
  }, [store]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addSubject = useCallback((name: string) => {
    const newSubject: Subject = { id: generateId(), name };
    setStore(s => ({ ...s, subjects: [...s.subjects, newSubject] }));
    return newSubject;
  }, []);

  const addPlannedSprint = useCallback((sprint: Omit<PlannedSprint, 'id'>) => {
    const newSprint: PlannedSprint = { ...sprint, id: generateId() };
    setStore(s => ({ ...s, plannedSprints: [...s.plannedSprints, newSprint] }));
  }, []);

  const reorderPlannedSprints = useCallback((orderedIds: string[]) => {
    setStore(s => {
      const newOrder = orderedIds.map(id => s.plannedSprints.find(sp => sp.id === id)).filter(Boolean) as PlannedSprint[];
      return { ...s, plannedSprints: newOrder };
    });
  }, []);

  const removePlannedSprint = useCallback((id: string) => {
    setStore(s => ({ ...s, plannedSprints: s.plannedSprints.filter(sp => sp.id !== id) }));
  }, []);

  const startTimer = useCallback((sprintId: string) => {
    setStore(s => {
      const sprint = s.plannedSprints.find(sp => sp.id === sprintId);
      if (!sprint) return s;
      return {
        ...s,
        timerState: {
          activePlannedSprintId: sprintId,
          startTimestamp: Date.now(),
          pausedAt: null,
          totalDurationMs: sprint.durationMinutes * 60 * 1000
        }
      };
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setStore(s => ({
      ...s,
      timerState: { ...s.timerState, pausedAt: Date.now() }
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setStore(s => {
      if (!s.timerState.pausedAt || !s.timerState.startTimestamp) return s;
      const pausedDuration = Date.now() - s.timerState.pausedAt;
      return {
        ...s,
        timerState: {
          ...s.timerState,
          startTimestamp: s.timerState.startTimestamp + pausedDuration,
          pausedAt: null
        }
      };
    });
  }, []);

  const skipSprint = useCallback((sprintId: string) => {
    setStore(s => {
      const sprint = s.plannedSprints.find(sp => sp.id === sprintId);
      if (!sprint) return s;
      const skipped: SkippedSprint = {
        id: sprint.id,
        subjectId: sprint.subjectId,
        topic: sprint.topic,
        durationMinutes: sprint.durationMinutes,
        skippedAt: new Date().toISOString()
      };
      return {
        ...s,
        plannedSprints: s.plannedSprints.filter(sp => sp.id !== sprintId),
        skippedSprints: [...s.skippedSprints, skipped],
        timerState: INITIAL_STATE.timerState
      };
    });
  }, []);

  const completeSprint = useCallback((sprintId: string, actualMinutes: number) => {
    setStore(s => {
      const sprint = s.plannedSprints.find(sp => sp.id === sprintId);
      if (!sprint) return s;
      const completed: CompletedSprint = {
        id: sprint.id,
        subjectId: sprint.subjectId,
        topic: sprint.topic,
        durationMinutes: sprint.durationMinutes,
        actualMinutes,
        completedAt: new Date().toISOString()
      };
      return {
        ...s,
        plannedSprints: s.plannedSprints.filter(sp => sp.id !== sprintId),
        completedSprints: [...s.completedSprints, completed],
        timerState: INITIAL_STATE.timerState
      };
    });
  }, []);

  const clearTimerState = useCallback(() => {
    setStore(s => ({ ...s, timerState: INITIAL_STATE.timerState }));
  }, []);

  const updateTimerState = useCallback((state: Partial<TimerState>) => {
    setStore(s => ({ ...s, timerState: { ...s.timerState, ...state } }));
  }, []);

  return (
    <StudyContext.Provider
      value={{
        ...store,
        addSubject,
        addPlannedSprint,
        reorderPlannedSprints,
        removePlannedSprint,
        startTimer,
        pauseTimer,
        resumeTimer,
        skipSprint,
        completeSprint,
        clearTimerState,
        updateTimerState
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudyStore() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudyStore must be used within a StudyProvider');
  }
  return context;
}
