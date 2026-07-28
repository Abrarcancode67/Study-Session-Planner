import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Timer, Zap, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const features = [
    { icon: Timer, title: "Deep Focus", description: "Timed sprints eliminate distractions and force you into a flow state." },
    { icon: Zap, title: "Ruthless Prioritization", description: "Plan only what matters. No more endless, overwhelming to-do lists." },
    { icon: Trophy, title: "Gamified Progress", description: "Build streaks, unlock achievements, and visualize your hard work." },
    { icon: TrendingUp, title: "Actionable Insights", description: "Track your actual hours spent studying vs planning." }
  ];

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <motion.div 
          className="max-w-4xl w-full text-center space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/30 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>The productivity system for serious students</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
              Study Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">
                Finish Faster.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Stop making lists and start making progress. A premium cockpit for your study sessions, designed to drop you straight into deep work.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link 
              href="/planner" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(0,204,255,0.5)]"
              data-testid="btn-start-sprint"
            >
              Start Sprint
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 text-left"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform">
                  <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
