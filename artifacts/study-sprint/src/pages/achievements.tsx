import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

import { useStudyStore } from '@/context/StudyContext';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { computeStreak } from '@/lib/streak';
import { PageTransition } from '@/components/PageTransition';

export default function Achievements() {
  const { completedSprints } = useStudyStore();
  const streak = useMemo(() => computeStreak(completedSprints), [completedSprints]);
  
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Read previously unlocked
    const saved = localStorage.getItem('study-sprint-achievements-unlocked');
    let prevUnlocked = new Set<string>();
    if (saved) {
      try {
        prevUnlocked = new Set(JSON.parse(saved));
      } catch(e) {}
    }

    const currentUnlocked = new Set(prevUnlocked);
    let newlyUnlocked = false;

    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(completedSprints, streak)) {
        if (!currentUnlocked.has(ach.id)) {
          currentUnlocked.add(ach.id);
          newlyUnlocked = true;
        }
      }
    });

    setUnlockedIds(currentUnlocked);

    if (newlyUnlocked) {
      localStorage.setItem('study-sprint-achievements-unlocked', JSON.stringify(Array.from(currentUnlocked)));
      
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00ccff', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00ccff', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [completedSprints, streak]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Achievements</h1>
          <p className="text-muted-foreground mt-1">Unlock badges as you build your study habits.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id);
            const { current, target } = ach.progress(completedSprints, streak);
            const percentage = Math.min(100, Math.max(0, (current / target) * 100));

            return (
              <motion.div 
                key={ach.id} 
                variants={itemVariants}
                className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
                  isUnlocked 
                    ? 'glass-panel border-primary/30 shadow-[0_0_30px_-10px_rgba(0,204,255,0.2)] hover:shadow-[0_0_40px_-10px_rgba(0,204,255,0.3)] hover:-translate-y-1' 
                    : 'bg-white/[0.02] border-white/5 opacity-80 grayscale'
                }`}
              >
                {/* Background glow if unlocked */}
                {isUnlocked && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] pointer-events-none" />
                )}

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
                  }`}>
                    {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                  </div>
                  {isUnlocked && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                </div>

                <div className="relative z-10">
                  <h3 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-white/70'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {ach.description}
                  </p>

                  {!isUnlocked && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-white/70">{current} / {target}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/50 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      Unlocked
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </PageTransition>
  );
}
