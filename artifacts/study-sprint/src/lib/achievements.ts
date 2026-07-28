import { CompletedSprint } from '@/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  check: (completed: CompletedSprint[], streak: number) => boolean;
  progress: (completed: CompletedSprint[], streak: number) => { current: number; target: number };
}

function totalHours(completed: CompletedSprint[]): number {
  return completed.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;
}

export const ACHIEVEMENTS: Achievement[] = [
  { 
    id: 'first-sprint',  
    title: 'First Sprint',  
    description: 'Complete 1 sprint',       
    check: (c) => c.length >= 1,   
    progress: (c) => ({ current: Math.min(c.length, 1), target: 1 }) 
  },
  { 
    id: '5-sprints',     
    title: '5 Sprints',      
    description: 'Complete 5 sprints',      
    check: (c) => c.length >= 5,   
    progress: (c) => ({ current: Math.min(c.length, 5), target: 5 }) 
  },
  { 
    id: '25-sprints',    
    title: '25 Sprints',     
    description: 'Complete 25 sprints',     
    check: (c) => c.length >= 25,  
    progress: (c) => ({ current: Math.min(c.length, 25), target: 25 }) 
  },
  { 
    id: '10-hours',      
    title: '10 Hours',       
    description: 'Study 10 total hours',    
    check: (c) => totalHours(c) >= 10,  
    progress: (c) => ({ current: Math.min(totalHours(c), 10), target: 10 }) 
  },
  { 
    id: '50-hours',      
    title: '50 Hours',       
    description: 'Study 50 total hours',    
    check: (c) => totalHours(c) >= 50,  
    progress: (c) => ({ current: Math.min(totalHours(c), 50), target: 50 }) 
  },
  { 
    id: '3-day-streak',  
    title: '3-Day Streak',   
    description: 'Reach a 3-day streak',   
    check: (_c, s) => s >= 3,  
    progress: (_c, s) => ({ current: Math.min(s, 3), target: 3 }) 
  },
  { 
    id: '7-day-streak',  
    title: '7-Day Streak',   
    description: 'Reach a 7-day streak',   
    check: (_c, s) => s >= 7,  
    progress: (_c, s) => ({ current: Math.min(s, 7), target: 7 }) 
  },
];
