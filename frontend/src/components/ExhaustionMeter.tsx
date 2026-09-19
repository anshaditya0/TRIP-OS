import React, { useState } from 'react';
import { 
  BatteryMedium, Zap, Activity, Clock, Navigation, 
  ShieldCheck, AlertCircle, HeartPulse, Sparkles,
  CalendarPlus, RefreshCw, Coffee, BedDouble, SunMedium, CheckCircle2, ArrowRight
} from 'lucide-react';
import { ExhaustionData } from '../types';

interface ExhaustionMeterProps {
  exhaustion: ExhaustionData;
  onAddBufferDay?: () => void;
  onChangePlanDay?: (dayNumber: number) => void;
  onOptimizeForRelaxation?: () => void;
  hasBufferDayAdded?: boolean;
}

export const ExhaustionMeter: React.FC<ExhaustionMeterProps> = ({ 
  exhaustion,
  onAddBufferDay,
  onChangePlanDay,
  onOptimizeForRelaxation,
  hasBufferDayAdded = false
}) => {
  const { 
    score, level, color, gradient, description, 
    travelDistanceKm, travelTimeHours, paceFactor,
    physicalStrain = 40, transitStrain = 45, recoveryScore = 60,
    recoveryTips = []
  } = exhaustion;

  const [selectedChangeDay, setSelectedChangeDay] = useState<number>(2);
  const [relaxationAppliedNotice, setRelaxationAppliedNotice] = useState<string | null>(null);

  // Score badge styling
  const getBadgeStyle = () => {
    if (score > 85) return 'bg-red-500 text-white shadow-red-200';
    if (score > 70) return 'bg-orange-500 text-white shadow-orange-200';
    if (score > 50) return 'bg-amber-500 text-white shadow-amber-200';
    if (score > 30) return 'bg-lime-600 text-white shadow-lime-200';
    return 'bg-emerald-600 text-white shadow-emerald-200';
  };

  const handleApplyBuffer = () => {
    if (onAddBufferDay) {
      onAddBufferDay();
      setRelaxationAppliedNotice('ACCLIMATIZATION BUFFER DAY ADDED TO EXPEDITION ITINERARY!');
      setTimeout(() => setRelaxationAppliedNotice(null), 3500);
    }
  };

  const handleChangeDayPlan = () => {
    if (onChangePlanDay) {
      onChangePlanDay(selectedChangeDay);
      setRelaxationAppliedNotice(`DAY ${selectedChangeDay} RECONFIGURED FOR LEISURE & SPA DETOX!`);
      setTimeout(() => setRelaxationAppliedNotice(null), 3500);
    }
  };

  const handleBoostRelaxation = () => {
    if (onOptimizeForRelaxation) {
      onOptimizeForRelaxation();
      setRelaxationAppliedNotice('RELAXATION & RECOVERY PROTOCOL APPLIED TO MOOD PROFILE!');
      setTimeout(() => setRelaxationAppliedNotice(null), 3500);
    }
  };

  return (
    <div className="glass-card p-3.5 sm:p-6 border border-white/80 space-y-3 sm:space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800 shadow-2xs shrink-0">
            <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-900">
                TRIP EXHAUSTION METER
              </h3>
              {score > 50 && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[9px] sm:text-[10px] font-mono-telemetry font-black uppercase flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  &gt;50%
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">
              BIOMETRIC PACING & TRANSIT FATIGUE PROJECTION
            </p>
          </div>
        </div>

        {/* Level Pill */}
        <div className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs self-start sm:self-auto ${getBadgeStyle()}`}>
          {level} ({score} / 100)
        </div>
      </div>

      {/* Main Gauge Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700">
          <span className="flex items-center gap-1.5">
            <span>FATIGUE INDEX</span>
            {score > 50 && (
              <span className="text-[9px] sm:text-[10px] text-red-600 font-black font-mono">
                (RELAXATION NEEDED)
              </span>
            )}
          </span>
          <span style={{ color }} className="font-mono font-black">{score}% LOAD</span>
        </div>

        <div className="w-full h-3 sm:h-3.5 bg-slate-200/70 rounded-full overflow-hidden p-0.5 shadow-inner relative">
          {/* 50% Threshold marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500/60 z-10" 
            style={{ left: '50%' }} 
            title="50% Exhaustion Warning Threshold"
          />
          <div
            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${gradient}`}
            style={{ width: `${Math.max(8, score)}%` }}
          />
        </div>

        <div className="flex justify-between text-[8px] sm:text-[10px] font-bold uppercase text-slate-500 px-0.5">
          <span className="text-emerald-700">RELAXED</span>
          <span className="hidden sm:inline text-lime-700">MODERATE (31-48%)</span>
          <span className="text-amber-700 font-black">50% WARNING</span>
          <span className="hidden sm:inline text-orange-700">HIGH (71-85%)</span>
          <span className="text-red-700">EXTREME</span>
        </div>
      </div>

      {/* Status Description Callout */}
      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-1">
          <Activity className="w-4 h-4 text-orange-600" />
          <span>PHYSIOLOGICAL PACING FACTOR:</span>
        </div>
        <p className="text-slate-600 leading-relaxed uppercase text-[11px]">
          {description}
        </p>
      </div>

      {/* 3 Metric Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 mb-1">
            <span>PHYSICAL STRAIN</span>
            <span className="text-orange-600 font-extrabold">{physicalStrain}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-500" 
              style={{ width: `${physicalStrain}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase">Walking, stairs & outdoor treks</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 mb-1">
            <span>TRANSIT STRAIN</span>
            <span className="text-sky-600 font-extrabold">{transitStrain}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-sky-500 rounded-full transition-all duration-500" 
              style={{ width: `${transitStrain}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase">~{travelDistanceKm} KM ({travelTimeHours} hrs transit)</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 mb-1">
            <span>RECOVERY INDEX</span>
            <span className="text-emerald-600 font-extrabold">{recoveryScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${recoveryScore}%` }} 
            />
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase">Rest window & sleep quality</p>
        </div>
      </div>

      {/* DYNAMIC FATIGUE MITIGATION CONTROLS (IF SCORE > 50%) */}
      {score > 50 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/40 space-y-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-300/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                ⚠️
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase text-amber-950 tracking-tight">
                  FATIGUE OVERLOAD PROTOCOL ACTIVATED (&gt;50% INDEX)
                </h4>
                <p className="text-[10px] font-bold text-amber-800 uppercase">
                  Select an intervention below to inject restorative downtime and protect explorer stamina.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 font-mono text-[9px] font-black uppercase self-start sm:self-auto">
              ACTION REQUIRED
            </span>
          </div>

          {/* Action Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* OPTION 1: Add a Buffer Day */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-amber-200/80 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase mb-1">
                  <CalendarPlus className="w-4 h-4 text-amber-600" />
                  <span>ADD A BUFFER DAY</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal mb-3">
                  Inserts a dedicated slow-recovery day with late brunches, swimming pool relaxation, and scenic hammock reading.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyBuffer}
                disabled={hasBufferDayAdded}
                className={`w-full py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  hasBufferDayAdded
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {hasBufferDayAdded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>BUFFER DAY ACTIVE</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>ADD BUFFER DAY</span>
                  </>
                )}
              </button>
            </div>

            {/* OPTION 2: Change Plans Day */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-amber-200/80 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center gap-1.5 text-orange-900 font-black text-xs uppercase mb-1">
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                  <span>CHANGE PLANS DAY</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal mb-2">
                  Swap high-strain trekking and rushed commutes on a specific day with gentle sunset viewpoints and cafe hopping.
                </p>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">TARGET:</span>
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedChangeDay(d)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer ${
                        selectedChangeDay === d
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      DAY {d}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangeDayPlan}
                className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>CHANGE DAY {selectedChangeDay} PLAN</span>
              </button>
            </div>

            {/* OPTION 3: Auto-Optimize for Relaxation */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-amber-200/80 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs uppercase mb-1">
                  <Coffee className="w-4 h-4 text-emerald-600" />
                  <span>OPTIMIZE FOR RELAXATION</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal mb-3">
                  Re-tunes the Dynamic Mood Meter: boosts Relaxation to 95%, reduces walking quotas, and schedules mandatory downtime.
                </p>
              </div>
              <button
                type="button"
                onClick={handleBoostRelaxation}
                className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>BOOST RELAXATION (ZEN)</span>
              </button>
            </div>
          </div>

          {/* Feedback banner when option is executed */}
          {relaxationAppliedNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider text-center animate-fade-in flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{relaxationAppliedNotice}</span>
            </div>
          )}
        </div>
      )}

      {/* Actionable Fatigue Mitigation Tips */}
      {recoveryTips && recoveryTips.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold uppercase text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>EXHAUSTION PREVENTION PROTOCOL:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
            {recoveryTips.map((tip, idx) => (
              <li key={idx} className="text-[11px] font-semibold text-emerald-800 flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
