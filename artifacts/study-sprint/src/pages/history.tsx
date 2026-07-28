import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { PageTransition } from '@/components/PageTransition';
import { useStudyStore } from '@/context/StudyContext';
import { Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { CompletedSprint, SkippedSprint } from '@/types';

export default function History() {
  const { completedSprints, skippedSprints, subjects } = useStudyStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const totalHours = useMemo(() => {
    return (completedSprints.reduce((acc, s) => acc + s.durationMinutes, 0) / 60).toFixed(1);
  }, [completedSprints]);

  const subjectStats = useMemo(() => {
    const stats: Record<string, { name: string; hours: number }> = {};
    completedSprints.forEach(s => {
      if (!stats[s.subjectId]) {
        stats[s.subjectId] = {
          name: subjects.find(sub => sub.id === s.subjectId)?.name || 'Unknown',
          hours: 0
        };
      }
      stats[s.subjectId].hours += s.durationMinutes / 60;
    });
    return Object.values(stats).sort((a, b) => b.hours - a.hours);
  }, [completedSprints, subjects]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const completed = completedSprints.filter(s => format(parseISO(s.completedAt), 'yyyy-MM-dd') === dateStr).map(s => ({ ...s, type: 'completed' as const }));
    const skipped = skippedSprints.filter(s => format(parseISO(s.skippedAt), 'yyyy-MM-dd') === dateStr).map(s => ({ ...s, type: 'skipped' as const }));
    
    return [...completed, ...skipped].sort((a, b) => {
      const timeA = new Date(a.type === 'completed' ? (a as CompletedSprint).completedAt : (a as SkippedSprint).skippedAt).getTime();
      const timeB = new Date(b.type === 'completed' ? (b as CompletedSprint).completedAt : (b as SkippedSprint).skippedAt).getTime();
      return timeB - timeA;
    });
  }, [completedSprints, skippedSprints, selectedDate]);

  // Determine dates with activity for calendar highlighting
  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    completedSprints.forEach(s => dates.add(format(parseISO(s.completedAt), 'yyyy-MM-dd')));
    skippedSprints.forEach(s => dates.add(format(parseISO(s.skippedAt), 'yyyy-MM-dd')));
    return Array.from(dates).map(d => parseISO(d));
  }, [completedSprints, skippedSprints]);

  const modifiers = { active: activeDates };
  const modifiersStyles = {
    active: {
      fontWeight: 'bold',
      border: '2px solid hsl(var(--primary))',
      color: 'hsl(var(--primary))'
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">History</h1>
          <p className="text-muted-foreground mt-1">Review your past study sessions and consistency.</p>
        </div>

        {completedSprints.length === 0 && skippedSprints.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl flex flex-col items-center text-center border-dashed">
            <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No history yet</h3>
            <p className="text-muted-foreground">Your study history will show up here once you finish your first sprint.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Stats & Calendar */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">All-Time Hours</p>
                  <p className="text-2xl font-bold text-white">{totalHours} hrs</p>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl flex justify-center">
                <style>{`
                  .rdp { --rdp-cell-size: 40px; margin: 0; }
                  .rdp-day_selected { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); font-weight: bold; }
                  .rdp-day_selected:hover { background-color: hsl(var(--primary) / 0.8); }
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: hsl(var(--muted)); }
                  .rdp-day { color: hsl(var(--foreground)); border-radius: 8px; }
                  .rdp-head_cell { color: hsl(var(--muted-foreground)); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                  .rdp-nav_button { color: hsl(var(--foreground)); }
                  .rdp-nav_button:hover { background-color: hsl(var(--muted)); }
                  .rdp-caption_label { font-weight: 700; color: white; }
                `}</style>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  showOutsideDays
                />
              </div>

              {subjectStats.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-4">Subject Focus</h3>
                  <div className="space-y-4">
                    {subjectStats.map((stat, idx) => {
                      const maxHours = subjectStats[0].hours;
                      const percentage = Math.max(5, (stat.hours / maxHours) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white font-medium">{stat.name}</span>
                            <span className="text-muted-foreground font-mono">{stat.hours.toFixed(1)}h</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Daily Log */}
            <div className="lg:col-span-8">
              <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span>Log for</span>
                  <span className="text-primary">{selectedDate ? format(selectedDate, 'MMM do, yyyy') : '...'}</span>
                </h3>

                {selectedDayItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground italic">
                    No sprints logged on this date.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayItems.map((item, idx) => {
                      const subject = subjects.find(s => s.id === item.subjectId);
                      const isCompleted = item.type === 'completed';
                      return (
                        <div 
                          key={`${item.type}-${item.id}-${idx}`}
                          className={`p-4 rounded-xl border flex items-start gap-4 ${isCompleted ? 'bg-white/5 border-white/5' : 'bg-red-950/10 border-red-900/20 opacity-75'}`}
                        >
                          <div className="mt-1 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/10 text-white/80">
                                {subject?.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(parseISO(isCompleted ? (item as CompletedSprint).completedAt : (item as SkippedSprint).skippedAt), 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-base font-medium text-white">{item.topic}</p>
                            <div className="mt-2 text-sm">
                              {isCompleted ? (
                                <span className="text-emerald-400 font-mono">
                                  Completed {(item as CompletedSprint).actualMinutes}m / {item.durationMinutes}m
                                </span>
                              ) : (
                                <span className="text-red-400 font-mono">
                                  Skipped ({item.durationMinutes}m planned)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </PageTransition>
  );
}
