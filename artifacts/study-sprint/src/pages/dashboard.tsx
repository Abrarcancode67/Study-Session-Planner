import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Play, Flame, Clock, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { startOfWeek, addDays, format, parseISO } from 'date-fns';

import { useStudyStore } from '@/context/StudyContext';
import { computeStreak } from '@/lib/streak';
import { PageTransition } from '@/components/PageTransition';

export default function Dashboard() {
  const { plannedSprints, completedSprints, subjects } = useStudyStore();

  const totalHours = useMemo(() => {
    const mins = completedSprints.reduce((acc, s) => acc + s.durationMinutes, 0);
    return (mins / 60).toFixed(1);
  }, [completedSprints]);

  const streak = useMemo(() => computeStreak(completedSprints), [completedSprints]);

  const weeklyData = useMemo(() => {
    // Current week Monday-Sunday
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(monday, i);
      return {
        date: format(d, 'yyyy-MM-dd'),
        name: format(d, 'EEE'),
        hours: 0,
        isToday: format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      };
    });

    completedSprints.forEach(s => {
      const sDate = format(parseISO(s.completedAt), 'yyyy-MM-dd');
      const day = days.find(d => d.date === sDate);
      if (day) {
        day.hours += s.durationMinutes / 60;
      }
    });

    return days;
  }, [completedSprints]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your study overview and progress.</p>
          </div>
          <Link 
            href="/planner" 
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            Go to Planner
          </Link>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Streak Card */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{streak}</span>
                <span className="text-muted-foreground font-medium">days</span>
              </div>
            </div>
          </motion.div>

          {/* Total Hours Card */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Study Time</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{totalHours}</span>
                <span className="text-muted-foreground font-medium">hrs</span>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Stats Card */}
          <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sprints Finished</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{completedSprints.length}</span>
                <span className="text-muted-foreground font-medium">sprints</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Today's Study Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col"
          >
            <h2 className="text-xl font-bold text-white mb-4">Today's Plan</h2>
            
            {plannedSprints.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-muted-foreground mb-4">No sprints planned for today.</p>
                <Link href="/planner" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4">
                  Build one now
                </Link>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 max-h-[350px] scrollbar-thin">
                {plannedSprints.map((sprint, idx) => {
                  const subject = subjects.find(s => s.id === sprint.subjectId);
                  return (
                    <div key={sprint.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {subject?.name || 'Unknown'}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">{sprint.durationMinutes}m</span>
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2 mt-1">{sprint.topic}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Weekly Progress Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-panel rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Weekly Progress (Hours)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-white/10 p-3 rounded-lg shadow-xl">
                            <p className="text-white font-medium mb-1">{payload[0].payload.name}</p>
                            <p className="text-primary text-sm font-mono">{Number(payload[0].value).toFixed(1)} hrs</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {weeklyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}
