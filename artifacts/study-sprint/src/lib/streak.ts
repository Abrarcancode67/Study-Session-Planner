import { CompletedSprint } from '@/types';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';

export function computeStreak(completedSprints: CompletedSprint[]): number {
  if (!completedSprints.length) return 0;

  // Get unique days where a sprint was completed
  const daysWithSprints = Array.from(
    new Set(completedSprints.map(s => format(parseISO(s.completedAt), 'yyyy-MM-dd')))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // newest first

  if (!daysWithSprints.length) return 0;

  const today = startOfDay(new Date());
  const mostRecentDay = startOfDay(new Date(daysWithSprints[0]));
  const diffDaysFromToday = differenceInDays(today, mostRecentDay);

  // If most recent sprint is > 1 day ago, streak is broken
  if (diffDaysFromToday > 1) return 0;

  let streak = 1; // At least one today or yesterday

  for (let i = 0; i < daysWithSprints.length - 1; i++) {
    const current = startOfDay(new Date(daysWithSprints[i]));
    const previous = startOfDay(new Date(daysWithSprints[i + 1]));
    
    // If previous sprint day is exactly 1 day before the current sprint day
    if (differenceInDays(current, previous) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
