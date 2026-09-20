import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { MoodMeterConfig } from '../../types';

interface StepBudgetVibeProps {
  budget: number;
  friendsCount: number;
  moodMeter: MoodMeterConfig;
  onChangeBudget: (budget: number) => void;
  onChangeMoodMeter?: (mood: MoodMeterConfig) => void;
  projectedExhaustion?: { score: number };
  onNext: () => void;
  onBack: () => void;
}

const BUDGET_PRESETS = [
  { amount: 20000, label: 'BACKPACKER', tier: 'ECONOMICAL', sub: 'Hostels, local trains & street food' },
  { amount: 45000, label: 'BALANCED', tier: 'COMFORT', sub: 'Boutique stays, cabs & mixed dining' },
  { amount: 85000, label: 'PREMIUM', tier: 'PREMIUM', sub: 'Resorts, flights, fine dining & private tours' },
  { amount: 150000, label: 'ROYAL LUXURY', tier: 'HERITAGE/LUXE', sub: 'Palaces, 5-star chauffeurs & private suites' },
];

export const StepBudgetVibe: React.FC<StepBudgetVibeProps> = ({
  budget,
  friendsCount,
  moodMeter: _moodMeter,
  onChangeBudget,
  onChangeMoodMeter: _onChangeMoodMeter,
  projectedExhaustion,
  onNext,
  onBack,
}) => {
  const perPersonCost = Math.round(budget / Math.max(1, friendsCount));

  return (
    <motion.div
      id="step-budget-vibe-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-mono-telemetry font-black uppercase tracking-widest text-orange-600">
            STEP 03 • BUDGET & TRAVEL PHILOSOPHY
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
          YOUR BUDGET & TRAVEL VIBE
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">
          SET YOUR FINANCIAL BOUNDARIES AND CHOOSE YOUR PREFERRED EXPEDITION TEMPO
        </p>
      </div>

      <div className="space-y-8">
        {/* Section A: Budget Allocation */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
              TOTAL GROUP BUDGET (INR ₹)
            </label>
            <span className="text-xs font-black text-emerald-700 font-mono bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ≈ ₹{perPersonCost.toLocaleString()} PER EXPLORER
            </span>
          </div>

          <div className="relative">
            <Wallet className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              id="input-trip-budget"
              type="number"
              step="1000"
              min="5000"
              value={budget}
              onChange={(e) => onChangeBudget(Math.max(1000, Number(e.target.value)))}
              className="w-full pl-12 pr-4 py-3 glass-input text-slate-900 font-mono font-black text-lg"
            />
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = budget === preset.amount;
              return (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => onChangeBudget(preset.amount)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white/80 text-slate-800 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[9px] font-mono-telemetry font-black block ${isSelected ? 'text-amber-300' : 'text-neutral-500'}`}>
                    {preset.tier}
                  </span>
                  <p className="text-sm font-black font-mono mt-0.5">₹{preset.amount.toLocaleString()}</p>
                  <p className={`text-[10px] truncate mt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {preset.sub}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section B: Automated Budget Category Allocation Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>EXPEDITION BUDGET CATEGORY ALLOCATION</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              BALANCED VIA SQUAD GROUPDNA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: 'LODGING & STAYS', pct: 40, amount: Math.round(budget * 0.4), color: 'text-orange-600 bg-orange-50 border-orange-200' },
              { label: 'TRANSIT & CABS', pct: 25, amount: Math.round(budget * 0.25), color: 'text-blue-600 bg-blue-50 border-blue-200' },
              { label: 'DINING & CUISINE', pct: 20, amount: Math.round(budget * 0.2), color: 'text-amber-600 bg-amber-50 border-amber-200' },
              { label: 'ACTIVITIES & TOURS', pct: 10, amount: Math.round(budget * 0.1), color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'SAFETY BUFFER', pct: 5, amount: Math.round(budget * 0.05), color: 'text-purple-600 bg-purple-50 border-purple-200' },
            ].map((cat) => (
              <div
                key={cat.label}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between shadow-2xs ${cat.color}`}
              >
                <div>
                  <span className="text-[9px] font-mono-telemetry font-black block tracking-wider">
                    {cat.label} ({cat.pct}%)
                  </span>
                  <p className="text-base font-black font-mono mt-1 text-slate-900">
                    ₹{cat.amount.toLocaleString()}
                  </p>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                  ₹{Math.round(cat.amount / Math.max(1, friendsCount)).toLocaleString()} / PERSON
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section C: GroupDNA Calibrated Pacing Confirmation */}
        <div className="p-4 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-orange-400 block tracking-widest">
                GROUPDNA PACING APPLIED
              </span>
              <p className="text-xs font-bold text-slate-200 uppercase">
                Endurance & vibe dimensions calibrated in Step 03 are actively driving itinerary pacing.
              </p>
            </div>
          </div>
          {projectedExhaustion && (
            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">PROJECTED FATIGUE</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                {projectedExhaustion.score}% OPTIMAL
              </span>
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
          <button
            id="step-budget-back-btn"
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK: TRAVELERS</span>
          </button>

          <motion.button
            id="step-budget-next-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onNext}
            className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>NEXT: TOP EXPERIENCES</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
