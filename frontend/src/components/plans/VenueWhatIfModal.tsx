import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Clock, Sun, AlertTriangle, Check, ArrowRight, 
  X, Sparkles, MapPin, Coffee, UtensilsCrossed, ShieldAlert
} from 'lucide-react';
import { DayScheduleItem } from '../../types';
import { calculateVenueWhatIf } from '../../services/api';

interface VenueWhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  venueIndex: number;
  daySchedule: DayScheduleItem[];
  destination: string;
  onApplyScheduleShift: (newSchedule: DayScheduleItem[]) => void;
}

const DURATION_PRESETS = [
  { mins: 30, label: '+30 MINS', desc: 'Brief extra photo walk & tea' },
  { mins: 45, label: '+45 MINS', desc: 'Extra museum gallery exploration' },
  { mins: 60, label: '+1 HOUR', desc: 'Leisurely cafe chill / souvenir hunt' },
  { mins: 90, label: '+1.5 HOURS', desc: 'Deep dive & sunset photography' },
  { mins: 120, label: '+2 HOURS', desc: 'Extended stay & relaxed relaxation' },
];

export const VenueWhatIfModal: React.FC<VenueWhatIfModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  venueIndex,
  daySchedule,
  destination,
  onApplyScheduleShift,
}) => {
  const [selectedExtraMins, setSelectedExtraMins] = useState<number>(60);
  const [hasApplied, setHasApplied] = useState(false);

  if (!isOpen || venueIndex < 0 || venueIndex >= daySchedule.length) return null;

  const currentItem = daySchedule[venueIndex];
  const simulation = calculateVenueWhatIf(daySchedule, venueIndex, selectedExtraMins);

  const handleApply = () => {
    onApplyScheduleShift(simulation.shiftedSchedule);
    setHasApplied(true);
    setTimeout(() => {
      setHasApplied(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_70px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 text-amber-200 flex items-center justify-center shadow-inner ring-1 ring-white/30">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black uppercase tracking-tight text-white">
                    WHAT-IF VENUE SIMULATOR
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
                    DAY {dayNumber}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-amber-100/80 uppercase tracking-wider">
                  SIMULATE EXTENDED VISIT • SCHEDULE CASCADE & CURFEW IMPACT
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Target Venue Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-mono font-black uppercase text-orange-600 block">
                TARGET VENUE STOP #{venueIndex + 1}
              </span>
              <h4 className="text-sm font-black uppercase text-slate-900">
                {currentItem.activity}
              </h4>
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentItem.location}, {destination}</span>
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono font-bold text-slate-500">
                <span>SCHEDULED ARRIVAL: <strong>{currentItem.time}</strong></span>
                <span>•</span>
                <span>PROJECTED DEPARTURE: <strong className="text-orange-600">{simulation.newDepartureTime}</strong></span>
              </div>
            </div>

            {/* Extra Duration Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                "WHAT IF I WANT TO STAY LONGER HERE BY..."
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => setSelectedExtraMins(preset.mins)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedExtraMins === preset.mins
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="block text-xs font-mono font-black">
                      {preset.label}
                    </span>
                    <span className={`text-[10px] block mt-0.5 ${
                      selectedExtraMins === preset.mins ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry Impact Analysis */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                SIMULATED ITINERARY TELEMETRY IMPACT:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Daylight Impact */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>DAYLIGHT & SUNSET</span>
                  </div>
                  <p className="text-[11px] font-medium text-amber-900 leading-snug">
                    {simulation.daylightImpact}
                  </p>
                </div>

                {/* Curfew / Gate Alert */}
                <div className={`p-3.5 rounded-2xl border space-y-1 ${
                  simulation.isCurfewRisk
                    ? 'bg-red-50/80 border-red-200 text-red-950'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase">
                    {simulation.isCurfewRisk ? (
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>CURFEW & CLOSING GATES</span>
                  </div>
                  <p className="text-[11px] font-medium leading-snug">
                    {simulation.curfewWarning || 'All remaining sights are open within daylight operating windows.'}
                  </p>
                </div>
              </div>

              {/* Dinner & Evening Shift */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
                  <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                  <span>EVENING DINNER SHIFT:</span>
                </div>
                <span className="text-xs font-mono font-black text-slate-900">
                  +{simulation.dinnerShiftMinutes} MINS LATER
                </span>
              </div>

              {/* Pro Tip Recommendation */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/70 text-[11px] font-semibold text-orange-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong>RECOMMENDED RE-PACING: </strong>
                  {simulation.suggestedAction}
                </div>
              </div>
            </div>

            {/* Cascaded Timeline Preview */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                CASCADED TIMINGS FOR REMAINING STOPS:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {simulation.shiftedSchedule.slice(venueIndex + 1).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs flex items-center justify-between shadow-2xs"
                  >
                    <span className="font-bold text-slate-800 uppercase truncate pr-2">
                      {item.activity}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-950 font-mono font-black text-[10px] shrink-0">
                      ➔ {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={hasApplied}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {hasApplied ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              <span>{hasApplied ? 'APPLIED TO ITINERARY!' : 'APPLY RESCHEDULED TIMINGS'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
