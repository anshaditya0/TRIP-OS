import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tag, Users, CloudRain, Mountain, Sparkles, X, Pause, Play, AlertOctagon } from 'lucide-react';
import { LIVE_NEWS_ALERTS } from '../data/travelData';

interface LiveAlertsStripProps {
  onOpenDisasterModal?: () => void;
}

export const LiveAlertsStrip: React.FC<LiveAlertsStripProps> = ({ onOpenDisasterModal }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  if (isDismissed) return null;

  const getAlertIcon = (iconName: string) => {
    switch (iconName) {
      case 'plane':
        return <Tag className="w-3.5 h-3.5 text-amber-400" />;
      case 'users':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cloud-rain':
        return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'mountain':
        return <Mountain className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  // Repeated alerts array for seamless infinite marquee
  const repeatedAlerts = [...LIVE_NEWS_ALERTS, ...LIVE_NEWS_ALERTS, ...LIVE_NEWS_ALERTS];

  return (
    <div className="w-full mb-8">
      <motion.div 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative flex items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-3 rounded-2xl bg-black text-white border border-neutral-800 shadow-xl overflow-hidden"
      >
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* Left Fixed Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-2 sm:pr-3 border-r border-neutral-800 z-10 bg-black">
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-white text-[8px] sm:text-[9px] font-mono-telemetry font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WIRE</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono-telemetry text-neutral-400 font-bold uppercase">
            24/7 DISPATCH
          </span>
        </div>

        {/* Center: Infinite Marquee Stream with Black Background and White Text */}
        <div 
          className="relative flex-1 overflow-hidden py-0.5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge fades */}
          <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 inset-y-0 w-6 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />

          <div 
            className="flex items-center gap-6 whitespace-nowrap will-change-transform"
            style={{
              display: 'flex',
              width: 'max-content',
              animationName: 'marquee-linear',
              animationDuration: '36s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {repeatedAlerts.map((alert, idx) => (
              <div 
                key={`${alert.id}-${idx}`}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white"
              >
                {getAlertIcon(alert.icon)}
                <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-200 border border-neutral-700 rounded font-mono font-black text-[9px]">
                  {alert.badge}
                </span>
                <span className="font-editorial text-xs font-semibold text-neutral-200 hover:text-white transition-colors">
                  {alert.text}
                </span>
                <span className="text-neutral-600 font-mono pl-3 text-[10px]">◆</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-neutral-800 z-10 bg-black">
          {onOpenDisasterModal && (
            <button
              type="button"
              onClick={onOpenDisasterModal}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Report Natural Disaster or Road Hazard"
            >
              <AlertOctagon className="w-3 h-3 text-white animate-pulse" />
              <span className="hidden sm:inline">REPORT DISASTER</span>
              <span className="sm:hidden">ALERT</span>
            </button>
          )}

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Wire" : "Pause Wire"}
            className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            title="Dismiss Wire"
            className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
