export type Priority = 'Low' | 'Medium' | 'High';

export interface Subject {
  id: string;
  name: string;
}

export interface PlannedSprint {
  id: string;
  subjectId: string;
  topic: string;
  durationMinutes: number; // 1–180
  priority: Priority;
}

export interface CompletedSprint {
  id: string;
  subjectId: string;
  topic: string;
  durationMinutes: number;
  actualMinutes: number;
  completedAt: string; // ISO date string
}

export interface SkippedSprint {
  id: string;
  subjectId: string;
  topic: string;
  durationMinutes: number;
  skippedAt: string; // ISO date string
}

export interface TimerState {
  activePlannedSprintId: string | null;
  startTimestamp: number | null; // epoch ms
  pausedAt: number | null; // epoch ms if paused, null if running
  totalDurationMs: number;
}

export interface StudyStore {
  isHydrated: boolean;
  subjects: Subject[];
  plannedSprints: PlannedSprint[]; 
  completedSprints: CompletedSprint[];
  skippedSprints: SkippedSprint[];
  timerState: TimerState;
}

export const INITIAL_STATE: StudyStore = {
  isHydrated: false,
  subjects: [],
  plannedSprints: [],
  completedSprints: [],
  skippedSprints: [],
  timerState: {
    activePlannedSprintId: null,
    startTimestamp: null,
    pausedAt: null,
    totalDurationMs: 0,
  }
};
