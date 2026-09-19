import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Clock, 
  Plane, 
  Mountain, 
  Compass, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Pause, 
  Play, 
  Zap, 
  Globe2, 
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertOctagon
} from 'lucide-react';

interface InfiniteBlackInfoStripProps {
  onOpenDisasterModal?: () => void;
}

interface TelemetryItem {
  id: string;
  category: string;
  categoryColor: string;
  badge: string;
  label: string;
  detail: string;
  metric?: string;
  status: 'optimal' | 'live' | 'alert';
}

const TELEMETRY_STREAM: TelemetryItem[] = [
  {
    id: 't-1',
    category: 'EXPEDITION RADAR',
    categoryColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60',
    badge: '99.8% CLEAR',
    label: 'AIRSPACE & CORRIDORS',
    detail: 'DEL • BOM • BLR • JAI • GOI RUNWAYS ON-SCHEDULE',
    metric: '32 HUBS ACTIVE',
    status: 'optimal'
  },
  {
    id: 't-2',
    category: 'HIGH-ALTITUDE PASSES',
    categoryColor: 'text-sky-400 border-sky-500/40 bg-sky-950/60',
    badge: 'SNOW ACCESS',
    label: 'HIMACHAL & LADAKH',
    detail: 'ATAL TUNNEL OPEN (-2°C) • ROHTANG 4WD ONLY • KHARDUNG LA 5,359M STABLE',
    metric: 'ROADS OPEN',
    status: 'live'
  },
  {
    id: 't-3',
    category: 'ROYAL RAJASTHAN',
    categoryColor: 'text-amber-400 border-amber-500/40 bg-amber-950/60',
    badge: 'NIGHT SPECTACLE',
    label: 'JAIPUR & JODHPUR',
    detail: 'AMBER FORT & NAHARGARH SUNSET ILLUMINATION 19:30 IST',
    metric: '4,120 ON-SITE',
    status: 'live'
  },
  {
    id: 't-4',
    category: 'COASTAL TELEMETRY',
    categoryColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60',
    badge: 'SWELL 1.1M',
    label: 'GOA & MALABAR SHORES',
    detail: 'NORTH GOA CALANGUTE & ANJUNA WATER 29°C • PALOLEM QUIET SEAS',
    metric: 'PERFECT SURF',
    status: 'optimal'
  },
  {
    id: 't-5',
    category: 'SPIRITUAL CORRIDORS',
    categoryColor: 'text-orange-400 border-orange-500/40 bg-orange-950/60',
    badge: 'AARTI 18:45',
    label: 'VARANASI & GANGES',
    detail: 'DASHASHWAMEDH MAHA AARTI CONFIRMED • SUBAH-E-BANARAS SUNRISE AT 05:30',
    metric: 'HIGH DENSITY',
    status: 'live'
  },
  {
    id: 't-6',
    category: 'EMERALD HIGHLANDS',
    categoryColor: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/60',
    badge: 'MIST & PETRICHOR',
    label: 'MUNNAR TEA PLANTATIONS',
    detail: 'KOLUKKUMALAI SUNRISE JEEPS DEPARTING • ATTUKAD TRAILS PRISTINE (18°C)',
    metric: 'CLEAR AIR',
    status: 'optimal'
  },
  {
    id: 't-7',
    category: 'LIVE VOYAGER INDEX',
    categoryColor: 'text-purple-400 border-purple-500/40 bg-purple-950/60',
    badge: 'REAL-TIME METRIC',
    label: 'GLOBAL TRAVELLERS',
    detail: '14,892 VERIFIED EXPLORERS CURRENTLY ARCHITECTING TRIPS ACROSS INDIA',
    metric: 'GLOBAL RECORD',
    status: 'optimal'
  },
  {
    id: 't-8',
    category: 'CURRENCY & BUDGET',
    categoryColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/60',
    badge: 'INR INDEX',
    label: 'GLOBAL FOREX DISPATCH',
    detail: '1 USD = ₹86.42 • 1 EUR = ₹91.80 • 1 GBP = ₹109.30 • 1 AED = ₹23.53',
    metric: 'OPTIMAL SPREAD',
    status: 'optimal'
  },
  {
    id: 't-9',
    category: 'GEODETIC SATELLITE',
    categoryColor: 'text-zinc-400 border-zinc-500/40 bg-zinc-900',
    badge: 'GPS CORRIDOR',
    label: 'LAT 20°35\'N • LON 78°57\'E',
    detail: 'HIGH RESOLUTION 3D TOPOGRAPHIC CORRIDOR MAPPING SYNCHRONIZED',
    metric: 'LOCK ACTIVE',
    status: 'optimal'
  }
];

export const InfiniteBlackInfoStrip: React.FC<InfiniteBlackInfoStripProps> = ({ onOpenDisasterModal }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TelemetryItem | null>(null);

  // Live IST Clock calculation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to IST
      const istString = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(istString);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const marqueeDuration = 55 / speed;

  return (
    <div className="sticky top-0 left-0 right-0 z-50 w-full select-none bg-black text-white border-b border-neutral-800 shadow-2xl transition-all duration-300 backdrop-blur-md">
      {/* Upper Subtle Glow Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between px-2.5 sm:px-6 py-1.5 sm:py-2 overflow-hidden gap-2 sm:gap-3">
        {/* Left Fixed Badge: International Telemetry Tag */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 pr-2 sm:pr-3 border-r border-neutral-800">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-mono-telemetry text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-white whitespace-nowrap">
                <span className="sm:hidden">LIVE</span>
                <span className="hidden sm:inline">LIVE DISPATCH</span>
              </span>
              <span className="hidden md:inline-block px-1 py-0.2 rounded bg-neutral-800 text-[8px] font-mono font-bold text-neutral-400 tracking-wider">
                IND • 2026
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-neutral-400 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
              <span>{currentTime ? `${currentTime} IST` : 'SYNCING...'}</span>
            </div>
          </div>
        </div>

        {/* Center: Infinite Dynamic Marquee Container */}
        <div 
          className="relative flex-1 overflow-hidden py-0.5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle Left & Right Fade Gradients for Luxury Look */}
          <div className="absolute left-0 inset-y-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />

          {/* Marquee Track with 2 Repeated Arrays for Seamless Infinite Flow */}
          <div 
            className="flex items-center gap-6 whitespace-nowrap will-change-transform"
            style={{
              display: 'flex',
              width: 'max-content',
              animationName: 'marquee-linear',
              animationDuration: `${marqueeDuration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {[...TELEMETRY_STREAM, ...TELEMETRY_STREAM].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => setSelectedItem(item)}
                className="group flex items-center gap-2.5 px-3 py-1 rounded-lg bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all cursor-pointer"
              >
                {/* Status Dot */}
                <span className={`w-1.5 h-1.5 rounded-full ${
                  item.status === 'optimal' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />

                {/* Category Pill */}
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-black tracking-wider ${item.categoryColor}`}>
                  {item.category}
                </span>

                {/* Main Label */}
                <span className="font-editorial text-[11px] font-bold text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                  {item.label}:
                </span>

                {/* Detail */}
                <span className="text-[11px] text-neutral-300 font-medium">
                  {item.detail}
                </span>

                {/* Metric Badge */}
                {item.metric && (
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px] font-bold">
                    {item.metric}
                  </span>
                )}

                {/* Divider Diamond */}
                <span className="text-neutral-600 text-[10px] pl-2 font-mono">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Fixed Controls: Play/Pause, Speed Selector */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-2 sm:pl-3 border-l border-neutral-800">
          {onOpenDisasterModal && (
            <button
              type="button"
              onClick={onOpenDisasterModal}
              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Report Natural Disaster or Road Hazard"
            >
              <AlertOctagon className="w-3 h-3 text-white animate-pulse" />
              <span className="hidden xl:inline">REPORT DISASTER</span>
              <span className="xl:hidden">ALERT</span>
            </button>
          )}

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Infinite Stream" : "Pause Stream"}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span className="text-[9px] font-mono font-bold hidden md:inline">RESUME</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-neutral-400" />
                <span className="text-[9px] font-mono font-bold hidden md:inline">PAUSE</span>
              </>
            )}
          </button>

          {/* Speed Toggle: 1x / 1.5x */}
          <button
            onClick={() => setSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-[8px] sm:text-[9px] font-mono font-black text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Marquee Velocity"
          >
            {speed}X
          </button>

          {/* International Stamp - Interactive Global Feed toggle */}
          <button
            type="button"
            onClick={() => {
              setSelectedItem((prev) => (prev ? null : TELEMETRY_STREAM[0]));
            }}
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[9px] font-mono text-neutral-200 hover:text-white cursor-pointer transition-all active:scale-95"
            title="Inspect Live Telemetry Dispatch"
          >
            <Globe2 className="w-3 h-3 text-emerald-400" />
            <span>GLOBAL FEED</span>
          </button>
        </div>
      </div>

      {/* Optional Interactive Detail Modal/Drawer if item is clicked */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-800 bg-neutral-950 px-3 sm:px-8 py-2.5 sm:py-3 text-white overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-black ${selectedItem.categoryColor}`}>
                  {selectedItem.category}
                </span>
                <span className="text-xs font-bold font-editorial uppercase text-white">
                  {selectedItem.label} — {selectedItem.detail}
                </span>
                {selectedItem.metric && (
                  <span className="text-[10px] font-mono text-emerald-400 font-black">
                    [{selectedItem.metric}]
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="self-start sm:self-auto text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              >
                CLOSE DISPATCH ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
