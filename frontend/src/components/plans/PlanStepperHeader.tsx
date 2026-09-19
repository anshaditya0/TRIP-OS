import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Users, Wallet, Sparkles, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { DateDropboxCalendar } from './DateDropboxCalendar';

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6; // 1: Route, 2: Travelers, 3: Budget & Vibe, 4: Interests, 5: Review, 6: Final Itinerary

interface PlanStepperHeaderProps {
  currentStep: WizardStep;
  onSelectStep: (step: WizardStep) => void;
  hasItinerary: boolean;
  selectedDate?: string;
  durationDays?: number;
  onChangeDate?: (date: string) => void;
  onChangeDuration?: (days: number) => void;
}

const STEPS_CONFIG = [
  { step: 1 as WizardStep, label: 'ROUTE', title: 'Origin & Destination', icon: MapPin },
  { step: 2 as WizardStep, label: 'TRAVELERS', title: 'Party & Transit', icon: Users },
  { step: 3 as WizardStep, label: 'BUDGET & VIBE', title: 'Budget & Style', icon: Wallet },
  { step: 4 as WizardStep, label: 'INTERESTS', title: 'Top Experiences', icon: Sparkles },
  { step: 5 as WizardStep, label: 'REVIEW', title: 'Trip Brief', icon: CheckCircle2 },
  { step: 6 as WizardStep, label: 'ITINERARY', title: 'Final Itinerary', icon: FileText },
];

export const PlanStepperHeader: React.FC<PlanStepperHeaderProps> = ({
  currentStep,
  onSelectStep,
  hasItinerary,
  selectedDate,
  durationDays,
  onChangeDate,
  onChangeDuration,
}) => {
  const progressPercent = Math.min(100, Math.round(((currentStep - 1) / 5) * 100));

  return (
    <div id="plan-stepper-container" className="glass-card p-3 sm:p-4 mb-6 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Top row: current status, calendar date quick dropbox, and progress percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-black text-white text-[9px] font-mono-telemetry font-black uppercase tracking-widest">
            {currentStep === 6 ? 'FINAL ITINERARY' : `STEP 0${currentStep} OF 05`}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 hidden md:inline">
            {STEPS_CONFIG[currentStep - 1]?.title}
          </span>

          {/* Small compact dropbox calendar in header */}
          {selectedDate && onChangeDate && (
            <div className="w-auto inline-block">
              <DateDropboxCalendar
                selectedDate={selectedDate}
                durationDays={durationDays || 3}
                onChangeDate={onChangeDate}
                onChangeDuration={onChangeDuration}
                compact={true}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {hasItinerary && currentStep !== 6 && (
            <button
              id="jump-to-itinerary-btn"
              type="button"
              onClick={() => onSelectStep(6)}
              className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer"
            >
              VIEW FINAL ITINERARY →
            </button>
          )}
          <span className="text-[10px] font-mono-telemetry font-black text-slate-500">
            {currentStep === 6 ? '100% COMPLETE' : `${progressPercent}% COMPLETED`}
          </span>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${currentStep === 6 ? 100 : progressPercent}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* Step buttons / pills row */}
      <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-6 gap-1.5 sm:gap-2 pb-1 sm:pb-0">
        {STEPS_CONFIG.map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step || (item.step === 6 && hasItinerary);
          const isAccessible = item.step <= currentStep || (item.step === 6 && hasItinerary);

          return (
            <button
              id={`stepper-step-${item.step}`}
              key={item.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onSelectStep(item.step)}
              className={`py-2 px-2.5 sm:px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all shrink-0 min-w-[72px] sm:min-w-0 min-h-[44px] ${
                !isAccessible
                  ? 'opacity-40 cursor-not-allowed bg-slate-100/50 text-slate-400'
                  : 'cursor-pointer hover:scale-[1.02]'
              } ${
                isActive
                  ? 'bg-neutral-900 text-white font-black shadow-md ring-2 ring-neutral-900 scale-[1.02]'
                  : isCompleted
                  ? 'bg-white/90 text-slate-800 font-bold border border-slate-200/80 hover:bg-white'
                  : 'bg-white/60 text-slate-500 font-medium border border-transparent'
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono-telemetry font-black hidden md:inline">
                  0{item.step}
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold truncate w-full px-0.5 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
