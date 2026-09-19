import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { 
  Compass, 
  Trees, 
  UtensilsCrossed, 
  Camera, 
  MoonStar, 
  Sparkles, 
  PiggyBank, 
  Footprints, 
  Users2,
  RotateCcw,
  Sliders,
  Zap,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { MoodMeterConfig } from '../types';

export const DEFAULT_MOOD_METER: MoodMeterConfig = {
  adventure: 60,
  nature: 70,
  food: 75,
  photography: 65,
  nightlife: 45,
  relaxation: 55,
  budgetSensitivity: 50,
  walkingTolerance: 60,
  crowdTolerance: 40
};

interface MoodMeterProps {
  mood?: MoodMeterConfig;
  config?: MoodMeterConfig;
  onChange: (newMood: MoodMeterConfig) => void;
  calculatedExhaustionScore?: number;
  projectedExhaustion?: { score: number };
}

interface DimensionMeta {
  key: keyof MoodMeterConfig;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string; // Tailwind hex or rgb
  gradient: string;
  badgeDesc: (val: number) => string;
  category: 'VIBE' | 'PHYSICAL & SENSORY' | 'BUDGET';
}

const DIMENSIONS: DimensionMeta[] = [
  {
    key: 'adventure',
    label: 'ADVENTURE',
    icon: Compass,
    accentColor: '#f97316', // orange-500
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    category: 'VIBE',
    badgeDesc: (v) => (v < 35 ? 'MILD LEISURE' : v < 70 ? 'SCENIC HIKES' : 'EXTREME EXPEDITION')
  },
  {
    key: 'nature',
    label: 'NATURE',
    icon: Trees,
    accentColor: '#10b981', // emerald-500
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    category: 'VIBE',
    badgeDesc: (v) => (v < 35 ? 'URBAN RETREAT' : v < 70 ? 'LUSH HILLS' : 'PRISTINE WILDERNESS')
  },
  {
    key: 'food',
    label: 'FOOD & CULINARY',
    icon: UtensilsCrossed,
    accentColor: '#eab308', // yellow-500
    gradient: 'from-amber-400 via-yellow-500 to-orange-400',
    category: 'VIBE',
    badgeDesc: (v) => (v < 35 ? 'LIGHT BITES' : v < 70 ? 'FOOD STREETS' : 'GOURMET FEASTS')
  },
  {
    key: 'photography',
    label: 'PHOTOGRAPHY',
    icon: Camera,
    accentColor: '#06b6d4', // cyan-500
    gradient: 'from-cyan-400 via-sky-500 to-blue-500',
    category: 'VIBE',
    badgeDesc: (v) => (v < 35 ? 'CASUAL SNAPS' : v < 70 ? 'GOLDEN HOUR' : 'PRO CINEMATOGRAPHY')
  },
  {
    key: 'nightlife',
    label: 'NIGHTLIFE',
    icon: MoonStar,
    accentColor: '#8b5cf6', // violet-500
    gradient: 'from-purple-500 via-violet-600 to-indigo-600',
    category: 'VIBE',
    badgeDesc: (v) => (v < 35 ? 'EARLY SLEEPER' : v < 70 ? 'EVENING PUBS' : 'ALL-NIGHT RAVES')
  },
  {
    key: 'relaxation',
    label: 'RELAXATION',
    icon: Sparkles,
    accentColor: '#ec4899', // pink-500
    gradient: 'from-pink-400 via-rose-500 to-teal-400',
    category: 'VIBE',
    badgeDesc: (v) => (v < 35 ? 'FAST PACED' : v < 70 ? 'BALANCED CALM' : 'ZEN RETREAT & SPA')
  },
  {
    key: 'budgetSensitivity',
    label: 'BUDGET SENSITIVITY',
    icon: PiggyBank,
    accentColor: '#6366f1', // indigo-500
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    category: 'BUDGET',
    badgeDesc: (v) => (v < 35 ? 'LUXURY SPLURGE' : v < 70 ? 'BALANCED COMFORT' : 'BACKPACKER SAVVY')
  },
  {
    key: 'walkingTolerance',
    label: 'WALKING TOLERANCE',
    icon: Footprints,
    accentColor: '#f43f5e', // rose-500
    gradient: 'from-orange-500 via-rose-500 to-red-600',
    category: 'PHYSICAL & SENSORY',
    badgeDesc: (v) => (v < 35 ? 'CAB & AUTOS (<5K)' : v < 70 ? 'ACTIVE (10K-15K)' : 'TREK MARATHON (25K+)')
  },
  {
    key: 'crowdTolerance',
    label: 'CROWD TOLERANCE',
    icon: Users2,
    accentColor: '#0ea5e9', // sky-500
    gradient: 'from-teal-400 via-cyan-500 to-blue-600',
    category: 'PHYSICAL & SENSORY',
    badgeDesc: (v) => (v < 35 ? 'SECLUDED & PEACEFUL' : v < 70 ? 'MODERATE HUBS' : 'HIGH ENERGY BAZAARS')
  }
];

export const DynamicMoodMeter: React.FC<MoodMeterProps> = ({
  mood,
  config,
  onChange,
  calculatedExhaustionScore,
  projectedExhaustion
}) => {
  const activeMood = config || mood || DEFAULT_MOOD_METER;
  const exhaustionScore = calculatedExhaustionScore !== undefined 
    ? calculatedExhaustionScore 
    : projectedExhaustion?.score;

  // References to the dynamic bar elements for animejs smooth expansion/shrink
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Trigger Anime.js animation whenever any mood parameter changes
  useEffect(() => {
    DIMENSIONS.forEach((dim) => {
      const el = barRefs.current[dim.key];
      if (!el) return;

      const targetValue = activeMood[dim.key];

      animate(el, {
        width: `${Math.max(4, targetValue)}%`,
        duration: 450,
        ease: 'outElastic(1, .8)'
      });
    });
  }, [activeMood]);

  const handleSliderChange = (key: keyof MoodMeterConfig, value: number) => {
    const updated = { ...activeMood, [key]: value };
    onChange(updated);

    // Interactive haptic-like animation trigger on the specific bar
    const el = barRefs.current[key];
    if (el) {
      animate(el, {
        scaleY: [1, 1.35, 1],
        duration: 250,
        ease: 'outQuad'
      });
    }
  };

  const handlePresetSelect = (preset: 'SERENE_CHILL' | 'THRILL_SEEKER' | 'FOOD_CULTURE' | 'BALANCED') => {
    switch (preset) {
      case 'SERENE_CHILL':
        onChange({
          adventure: 25,
          nature: 85,
          food: 65,
          photography: 70,
          nightlife: 20,
          relaxation: 95,
          budgetSensitivity: 40,
          walkingTolerance: 30,
          crowdTolerance: 20
        });
        break;
      case 'THRILL_SEEKER':
        onChange({
          adventure: 95,
          nature: 90,
          food: 50,
          photography: 80,
          nightlife: 60,
          relaxation: 25,
          budgetSensitivity: 55,
          walkingTolerance: 95,
          crowdTolerance: 65
        });
        break;
      case 'FOOD_CULTURE':
        onChange({
          adventure: 45,
          nature: 50,
          food: 100,
          photography: 85,
          nightlife: 75,
          relaxation: 55,
          budgetSensitivity: 45,
          walkingTolerance: 70,
          crowdTolerance: 85
        });
        break;
      case 'BALANCED':
      default:
        onChange(DEFAULT_MOOD_METER);
        break;
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Header & Quick Archetype Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[9px] font-mono-telemetry font-black uppercase tracking-widest">
              DYNAMIC EXPEDITION DNA
            </span>
            <span className="text-[10px] font-mono-telemetry text-neutral-500 font-bold uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              ANIME.JS FLUID SPRING METERS
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-extrabold uppercase text-neutral-900 tracking-tight mt-1">
            EXPLORER MOOD & ENDURANCE PROFILE
          </h3>
          <p className="font-editorial text-xs font-semibold text-neutral-600 uppercase">
            Fine-tune each dimension with kinetic micro-sliders. The exhaustion engine recalculates your physiological index in real-time.
          </p>
        </div>

        {/* Quick Archetype Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handlePresetSelect('BALANCED')}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            ⚖️ BALANCED
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('SERENE_CHILL')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-200 cursor-pointer transition-colors"
          >
            🧘 ZEN CHILL
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('THRILL_SEEKER')}
            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 text-[10px] font-mono font-bold uppercase tracking-wider border border-orange-200 cursor-pointer transition-colors"
          >
            🏔️ HIGH THRILL
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('FOOD_CULTURE')}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-200 cursor-pointer transition-colors"
          >
            🍲 FOOD TRAIL
          </button>
        </div>
      </div>

      {/* Grid of 9 Dynamic Mood Dimension Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {DIMENSIONS.map((dim) => {
          const Icon = dim.icon;
          const value = activeMood[dim.key];
          const badgeText = dim.badgeDesc(value);

          return (
            <div
              key={dim.key}
              className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              {/* Top Row: Label, Icon, and Percentage Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
                    style={{ backgroundColor: dim.accentColor }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black uppercase text-neutral-900 leading-tight">
                      {dim.label}
                    </span>
                    <span className="text-[9px] font-mono-telemetry font-bold text-neutral-500 uppercase">
                      {badgeText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-900 font-mono font-black text-xs border border-neutral-200/80">
                    {value}%
                  </span>
                </div>
              </div>

              {/* Dynamic Fluid Bar with Anime.js Elastic Morphing */}
              <div className="w-full space-y-2 mt-1">
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200/60 shadow-inner relative">
                  <div
                    ref={(el) => {
                      barRefs.current[dim.key] = el;
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${dim.gradient} shadow-xs relative`}
                    style={{ width: `${Math.max(4, value)}%`, willChange: 'width, transform' }}
                  >
                    {/* Glowing head indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-white/80 shadow-xs" />
                  </div>
                </div>

                {/* Range Slider for Manual Tactile Tuning */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(e) => handleSliderChange(dim.key, Number(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer h-1 bg-neutral-200 rounded-lg appearance-none"
                />
              </div>

              {/* Bottom Micro Guide */}
              <div className="flex justify-between text-[9px] font-mono-telemetry text-neutral-400 font-bold uppercase mt-1 px-0.5">
                <span>0% MIN</span>
                <span>50% MID</span>
                <span>100% MAX</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Physiological Projected Exhaustion Indicator Bar */}
      {exhaustionScore !== undefined && (
        <div className="p-3.5 rounded-2xl bg-neutral-950 text-white border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Flame className={`w-4 h-4 ${exhaustionScore > 50 ? 'text-orange-400 animate-pulse' : 'text-emerald-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-telemetry text-neutral-400 uppercase font-black tracking-wider">
                  REAL-TIME PROJECTED EXHAUSTION
                </span>
                <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-black uppercase ${
                  exhaustionScore > 75 
                    ? 'bg-red-500 text-white' 
                    : exhaustionScore > 50 
                    ? 'bg-amber-500 text-black' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  {exhaustionScore}% LOAD
                </span>
              </div>
              <p className="text-[11px] font-editorial text-neutral-300 font-semibold uppercase mt-0.5">
                {exhaustionScore > 50 
                  ? '⚠️ Exhaustion index exceeds 50% threshold. Relaxation buffer or day adjustments recommended.'
                  : '✅ Balanced physiological stamina. Ideal recovery margin during transfers.'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  exhaustionScore > 75 
                    ? 'bg-red-500' 
                    : exhaustionScore > 50 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(6, exhaustionScore)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
