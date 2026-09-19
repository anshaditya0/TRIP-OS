import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Sparkles, ArrowRight, ArrowLeft, Sliders, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { MoodMeterConfig } from '../../types';
import { DynamicMoodMeter } from '../DynamicMoodMeter';

interface StepBudgetVibeProps {
  budget: number;
  friendsCount: number;
  moodMeter: MoodMeterConfig;
  onChangeBudget: (budget: number) => void;
  onChangeMoodMeter: (mood: MoodMeterConfig) => void;
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

export const VIBE_ARCHETYPES = [
  {
    id: 'zen',
    title: 'ZEN & SCENIC LEISURE',
    icon: '🍃',
    desc: 'Unrushed morning tea, lush valleys, wellness, sunset viewpoints & low fatigue.',
    mood: {
      adventure: 25,
      nature: 85,
      food: 70,
      photography: 65,
      nightlife: 20,
      relaxation: 95,
      budgetSensitivity: 50,
      walkingTolerance: 30,
      crowdTolerance: 20
    }
  },
  {
    id: 'adventure',
    title: 'HIKES & HIGH ADRENALINE',
    icon: '🏔️',
    desc: 'High physical stamina, ridge treks, river rapids, cliff views & dawn summits.',
    mood: {
      adventure: 90,
      nature: 85,
      food: 60,
      photography: 75,
      nightlife: 35,
      relaxation: 30,
      budgetSensitivity: 40,
      walkingTolerance: 85,
      crowdTolerance: 40
    }
  },
  {
    id: 'heritage',
    title: 'ROYAL HERITAGE & CULTURE',
    icon: '🏛️',
    desc: 'Grand forts, ancient temples, artisan textile bazaars & historical chronicles.',
    mood: {
      adventure: 45,
      nature: 55,
      food: 75,
      photography: 90,
      nightlife: 30,
      relaxation: 60,
      budgetSensitivity: 50,
      walkingTolerance: 60,
      crowdTolerance: 65
    }
  },
  {
    id: 'coastal',
    title: 'COASTAL & NIGHTLIFE VIBE',
    icon: '🏖️',
    desc: 'Golden beaches, waterfront shacks, water sports, live music & beach clubs.',
    mood: {
      adventure: 65,
      nature: 70,
      food: 80,
      photography: 80,
      nightlife: 90,
      relaxation: 55,
      budgetSensitivity: 45,
      walkingTolerance: 45,
      crowdTolerance: 75
    }
  },
  {
    id: 'foodie',
    title: 'CULINARY & FLAVOR ODYSSEY',
    icon: '🍲',
    desc: 'Iconic street food gullies, secret heritage recipes, cafe hopping & spices.',
    mood: {
      adventure: 50,
      nature: 45,
      food: 95,
      photography: 75,
      nightlife: 65,
      relaxation: 70,
      budgetSensitivity: 45,
      walkingTolerance: 60,
      crowdTolerance: 70
    }
  }
];

export const StepBudgetVibe: React.FC<StepBudgetVibeProps> = ({
  budget,
  friendsCount,
  moodMeter,
  onChangeBudget,
  onChangeMoodMeter,
  projectedExhaustion,
  onNext,
  onBack,
}) => {
  const [activeVibeId, setActiveVibeId] = useState<string>('zen');
  const [showAdvancedMood, setShowAdvancedMood] = useState(false);

  const perPersonCost = Math.round(budget / Math.max(1, friendsCount));

  const handleSelectVibe = (archetype: typeof VIBE_ARCHETYPES[0]) => {
    setActiveVibeId(archetype.id);
    onChangeMoodMeter(archetype.mood);
  };

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

        {/* Section B: Travel Vibe Archetypes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
              SELECT TRAVEL VIBE & TEMPO
            </label>
            <span className="text-[10px] font-mono-telemetry text-slate-500 uppercase">
              AUTO-CONFIGURES PACING & REST CYCLES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VIBE_ARCHETYPES.map((vibe) => {
              const isSelected = activeVibeId === vibe.id;
              return (
                <button
                  id={`vibe-card-${vibe.id}`}
                  key={vibe.id}
                  type="button"
                  onClick={() => handleSelectVibe(vibe)}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900 scale-[1.02]'
                      : 'bg-white/80 text-slate-800 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{vibe.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">
                      {vibe.title}
                    </h4>
                    <p className={`text-[11px] leading-snug ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {vibe.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section C: Optional Advanced Mood Sliders Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvancedMood(!showAdvancedMood)}
            className="w-full py-2.5 px-4 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <span>CUSTOMIZE DETAILED BIOMETRICS & SENSORY SLIDERS (OPTIONAL)</span>
            </div>
            {showAdvancedMood ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showAdvancedMood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3"
              >
                <DynamicMoodMeter
                  config={moodMeter}
                  onChange={onChangeMoodMeter}
                  projectedExhaustion={projectedExhaustion}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
