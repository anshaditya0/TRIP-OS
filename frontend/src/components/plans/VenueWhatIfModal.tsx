import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Clock, MapPin, AlertTriangle, Check, ArrowRight, 
  Calendar, ShieldCheck, Sun, Moon, Sparkles, RefreshCw, X,
  Coffee, Compass, Flame, ShieldAlert
} from 'lucide-react';
import { DayScheduleItem } from '../../types';
import { calculateVenueWhatIf } from '../../services/api';

interface VenueWhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  totalDays?: number;
  venueIndex?: number;
  scheduleIndex?: number;
  daySchedule?: DayScheduleItem[];
  fullSchedule?: DayScheduleItem[];
  destination?: string;
  destinationName?: string;
  activity?: DayScheduleItem | null;
  onApplyScheduleShift?: (newSched: DayScheduleItem[]) => void;
  onApplyShift?: (dayNumber: number, shiftedSchedule: DayScheduleItem[], reason: string) => void;
  onMoveVenueToDay?: (fromDayNumber: number, toDayNumber: number, activity: DayScheduleItem) => void;
}

export const VenueWhatIfModal: React.FC<VenueWhatIfModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  totalDays = 3,
  venueIndex,
  scheduleIndex,
  daySchedule,
  fullSchedule,
  destination,
  destinationName,
  activity,
  onApplyScheduleShift,
  onApplyShift,
  onMoveVenueToDay,
}) => {
  const [activeTab, setActiveTab] = useState<'stay-longer' | 'move-day' | 'contingency'>('stay-longer');
  const [extraMinutes, setExtraMinutes] = useState<number>(60);
  const [targetMoveDay, setTargetMoveDay] = useState<number>(() => {
    return dayNumber === 1 ? 2 : 1;
  });
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const actualSchedule = daySchedule || fullSchedule || [];
  const actualIndex = venueIndex ?? scheduleIndex ?? 0;
  const actualActivity = activity || actualSchedule[actualIndex] || {
    time: '10:00 AM',
    activity: 'Scheduled Venue',
    location: destination || destinationName || 'Destination Hub',
    cost: 0,
    tips: 'Leisurely exploration'
  };
  const actualDest = destination || destinationName || 'Destination';

  if (!isOpen) return null;

  // Run live venue what-if calculation
  const simulation = calculateVenueWhatIf(actualSchedule, actualIndex, extraMinutes);

  const handleConfirmShift = () => {
    if (onApplyScheduleShift) {
      onApplyScheduleShift(simulation.shiftedSchedule);
    }
    if (onApplyShift) {
      onApplyShift(
        dayNumber,
        simulation.shiftedSchedule,
        `Extended stay at "${actualActivity.activity}" by +${extraMinutes} mins.`
      );
    }
    setAppliedNotice(`Shifted schedule applied! New departure: ${simulation.newDepartureTime}`);
    setTimeout(() => {
      setAppliedNotice(null);
      onClose();
    }, 1000);
  };

  const handleConfirmMoveDay = () => {
    if (targetMoveDay === dayNumber) return;
    if (onMoveVenueToDay) {
      onMoveVenueToDay(dayNumber, targetMoveDay, actualActivity);
    }
    setAppliedNotice(`Venue "${actualActivity.activity}" relocated to Day 0${targetMoveDay}!`);
    setTimeout(() => {
      setAppliedNotice(null);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_70px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-neutral-900 via-amber-950 to-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center ring-1 ring-amber-400/40">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-black uppercase">
                    VENUE WHAT-IF™ SIMULATOR
                  </span>
                  <span className="text-[10px] font-mono text-amber-200/70">
                    DAY 0{dayNumber} STOP #{actualIndex + 1}
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-white line-clamp-1 mt-0.5">
                  {actualActivity.activity}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtabs Selector */}
          <div className="flex border-b border-slate-200/80 bg-slate-50/80 p-2 gap-2">
            {[
              { id: 'stay-longer' as const, label: 'STAY LONGER', icon: Clock },
              { id: 'move-day' as const, label: 'MOVE TO ANOTHER DAY', icon: Calendar },
              { id: 'contingency' as const, label: 'PLAN B CONTINGENCY', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
            {/* TAB 1: STAY LONGER */}
            {activeTab === 'stay-longer' && (
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-mono font-black uppercase text-slate-700 block mb-2">
                    HOW MUCH LONGER DO YOU WANT TO STAY AT THIS VENUE?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setExtraMinutes(mins)}
                        className={`py-2.5 rounded-2xl text-xs font-black font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                          extraMinutes === mins
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        +{mins} MINS
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation Telemetry Card */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-amber-900">ORIGINAL ARRIVAL:</span>
                    <span className="text-slate-900">{actualActivity.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-amber-900">PROJECTED DEPARTURE:</span>
                    <span className="text-amber-700 font-black">{simulation.newDepartureTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-amber-900">SUBSEQUENT STOPS DELAYED:</span>
                    <span className="text-slate-900">{Math.max(0, simulation.shiftedSchedule.length - 1 - actualIndex)} venues</span>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 text-xs font-mono">
                    <div className="flex items-start gap-2 text-slate-700">
                      <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{simulation.daylightImpact}</span>
                    </div>

                    {simulation.isCurfewRisk && simulation.curfewWarning && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{simulation.curfewWarning}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shifted Timeline Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 block">
                    PROJECTED SCHEDULE TIMELINE (DAY 0{dayNumber}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {simulation.shiftedSchedule.map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-xs font-mono flex items-center justify-between border ${
                          idx === actualIndex
                            ? 'bg-amber-100/90 border-amber-300 font-bold text-amber-900'
                            : idx > actualIndex
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-white border-slate-100 text-slate-400 opacity-60'
                        }`}
                      >
                        <span className="font-black">{s.time}</span>
                        <span className="line-clamp-1 max-w-[240px]">{s.activity}</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {idx === actualIndex ? `(+${extraMinutes}m)` : idx > actualIndex ? 'SHIFTED' : 'UNTOUCHED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmShift}
                  className="w-full py-3.5 rounded-2xl bg-neutral-950 hover:bg-black text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>APPLY SCHEDULE TIMING EXTENSION (+{extraMinutes} MINS)</span>
                </button>
              </div>
            )}

            {/* TAB 2: MOVE TO ANOTHER DAY */}
            {activeTab === 'move-day' && (
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-mono font-black uppercase text-slate-700 block mb-2">
                    SELECT DESTINATION DAY TO RELOCATE THIS VENUE:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={d === dayNumber}
                        onClick={() => setTargetMoveDay(d)}
                        className={`py-3 rounded-2xl text-xs font-black font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                          d === dayNumber
                            ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-40 cursor-not-allowed'
                            : targetMoveDay === d
                            ? 'bg-neutral-900 text-white border-neutral-950 shadow-md ring-2 ring-orange-400/30'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        DAY 0{d} {d === dayNumber && '(CURRENT)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>RELOCATION IMPACT SIMULATION:</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">
                    Moving <span className="font-bold text-slate-900">"{actualActivity.activity}"</span> from Day 0{dayNumber} to Day 0{targetMoveDay} lightens Day 0{dayNumber}'s physical fatigue index by ~18% and auto-schedules it into Day 0{targetMoveDay}'s prime afternoon window.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmMoveDay}
                  className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>RELOCATE VENUE TO DAY 0{targetMoveDay}</span>
                </button>
              </div>
            )}

            {/* TAB 3: PLAN B CONTINGENCY */}
            {activeTab === 'contingency' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>WEATHER & CROWD CONTINGENCY PROTOCOL</span>
                  </div>
                  <p className="text-xs text-blue-800 font-mono">
                    If sudden monsoon showers or road congestions occur near <span className="font-bold">{actualDest}</span>, switch to an indoor artisanal museum, covered spice gallery, or tea cafe retreat.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 block">
                    RECOMMENDED PLAN B ALTERNATIVE:
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase">
                        Indoor Cultural Heritage Centre & Organic Artisan Cafe
                      </h4>
                      <p className="text-xs font-mono text-slate-600 mt-0.5">
                        Air-conditioned covered gallery featuring regional architecture, tea tasting, and zero rain risk.
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-mono font-black shrink-0">
                      INDOOR SAFE
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newShifted = actualSchedule.map((s, idx) => {
                      if (idx === actualIndex) {
                        return {
                          ...s,
                          activity: `[Plan B] Cultural Heritage Centre & Artisan Cafe`,
                          tips: 'Indoor weather-safe alternative with acoustic ambience.'
                        };
                      }
                      return s;
                    });
                    if (onApplyScheduleShift) {
                      onApplyScheduleShift(newShifted);
                    }
                    if (onApplyShift) {
                      onApplyShift(dayNumber, newShifted, 'Swapped with indoor Plan B alternative.');
                    }
                    setAppliedNotice('Swapped with Plan B indoor alternative!');
                    setTimeout(() => {
                      setAppliedNotice(null);
                      onClose();
                    }, 1000);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>SWAP VENUE WITH INDOOR PLAN B ALTERNATIVE</span>
                </button>
              </div>
            )}

            {appliedNotice && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-mono font-black text-center border border-emerald-300"
              >
                {appliedNotice}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
