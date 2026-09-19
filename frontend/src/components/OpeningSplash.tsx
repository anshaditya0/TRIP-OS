import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OpeningSplashProps {
  onComplete: () => void;
}

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'APPEAR' | 'SHRINK' | 'DONE'>('APPEAR');

  useEffect(() => {
    // Stage 1: Fade-in appear at center (0 - 1200ms)
    const shrinkTimer = setTimeout(() => {
      setStage('SHRINK');
    }, 1200);

    // Stage 2: Shrink out to position & reveal home page (1200ms - 2000ms)
    const completeTimer = setTimeout(() => {
      setStage('DONE');
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === 'DONE') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="opening-splash-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'SHRINK' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none"
      >
        {/* Soft Ambient Radial Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-orange-500/30 via-amber-500/20 to-emerald-500/10 blur-3xl animate-pulse" />

        {/* Animated Center Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={
            stage === 'APPEAR'
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.15, y: -180, x: -120 }
          }
          transition={{
            duration: stage === 'APPEAR' ? 0.9 : 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex flex-col items-center justify-center text-center z-10"
        >
          {/* Logo Frame */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 p-3 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex items-center justify-center ring-4 ring-white/10 mb-5 overflow-hidden">
            <img
              src="/logo.png"
              alt="TRIP OS Logo"
              className="w-full h-full object-contain rounded-2xl drop-shadow-md"
            />
          </div>

          {/* Title & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage === 'APPEAR' ? 1 : 0, y: stage === 'APPEAR' ? 0 : -10 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.25em] text-white">
              TRIP OS
            </h1>
            <p className="text-[11px] font-mono font-bold tracking-[0.3em] text-orange-400/90 uppercase mt-2">
              TRAVEL OPERATING SYSTEM
            </p>
          </motion.div>

          {/* Sleek Progress Indicator */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: stage === 'APPEAR' ? 120 : 200, opacity: stage === 'APPEAR' ? 1 : 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 rounded-full mt-6 shadow-sm"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
