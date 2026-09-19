import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface StepActivitiesProps {
  selectedActivities: string[];
  onToggleActivity: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const CURATED_ACTIVITIES = [
  {
    id: 'HERITAGE',
    label: 'HERITAGE & PALACES',
    emoji: '🏛️',
    tag: 'CULTURE',
    desc: 'Grand forts, Mughal/Rajput palaces, ancient temples & royal chronicles'
  },
  {
    id: 'ADVENTURE',
    label: 'TREKKING & ADVENTURE',
    emoji: '🥾',
    tag: 'ACTIVE',
    desc: 'Ridge hikes, mountain passes, whitewater rafting, ATV rides & camping'
  },
  {
    id: 'BEACH',
    label: 'BEACHES & NIGHTLIFE',
    emoji: '🏖️',
    tag: 'COASTAL',
    desc: 'Sunset beach shacks, coastal walks, nightlife parties & water sports'
  },
  {
    id: 'SPIRITUAL',
    label: 'SPIRITUAL & GHATS',
    emoji: '🪔',
    tag: 'SACRED',
    desc: 'Riverside evening aartis, ancient ghat promenades & quiet meditation'
  },
  {
    id: 'CULINARY',
    label: 'STREET FOOD & DINING',
    emoji: '🍲',
    tag: 'GASTRONOMY',
    desc: 'Secret street food gullies, royal regional thalis & legendary local cafes'
  },
  {
    id: 'NATURE',
    label: 'NATURE & SCENIC VALLEYS',
    emoji: '🌿',
    tag: 'OUTDOOR',
    desc: 'Tea plantations, pine forests, cascading waterfalls & tranquil lakes'
  },
  {
    id: 'WELLNESS',
    label: 'WELLNESS & YOGA',
    emoji: '🧘',
    tag: 'RECOVERY',
    desc: 'Ayurvedic wellness spas, sunrise yoga pavilions & restorative detox'
  },
  {
    id: 'SHOPPING',
    label: 'BAZAARS & HANDICRAFTS',
    emoji: '🛍️',
    tag: 'COMMERCE',
    desc: 'Artisan handlooms, brassware, semi-precious gems & exotic spice markets'
  }
];

export const StepActivities: React.FC<StepActivitiesProps> = ({
  selectedActivities,
  onToggleActivity,
  onNext,
  onBack,
}) => {
  return (
    <motion.div
      id="step-activities-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-mono-telemetry font-black uppercase tracking-widest text-orange-600">
            STEP 04 • EXPERIENTIAL CURATION
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
          CHOOSE YOUR HIGHLIGHT EXPERIENCES
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">
          SELECT THE ACTIVITIES & THEMES THAT MATTER MOST TO YOUR EXPEDITION ({selectedActivities.length} SELECTED)
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CURATED_ACTIVITIES.map((act) => {
            const isSelected = selectedActivities.includes(act.id);
            return (
              <button
                id={`activity-card-${act.id}`}
                key={act.id}
                type="button"
                onClick={() => onToggleActivity(act.id)}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900 scale-[1.02]'
                    : 'bg-white/80 text-slate-800 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{act.emoji}</span>
                    <span className={`text-[8px] font-mono-telemetry font-black px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {act.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight mb-1.5 flex items-center justify-between">
                    <span>{act.label}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </h4>
                  <p className={`text-[11px] leading-snug ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
          <button
            id="step-activities-back-btn"
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK: BUDGET & VIBE</span>
          </button>

          <motion.button
            id="step-activities-next-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onNext}
            className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>NEXT: REVIEW TRIP BRIEF</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
