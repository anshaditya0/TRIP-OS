import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { WeatherType } from '../types';
import { WEATHER_CONFIGS } from '../data/travelData';

interface WeatherMoodBadgeProps {
  currentWeather: WeatherType;
  onSelectWeather: (weather: WeatherType) => void;
}

const WEATHER_TEMPS: Record<WeatherType, string> = {
  sunny: '31°C • SUNNY',
  rain: '22°C • THUNDER RAIN',
  nature: '19°C • SERENE NATURE',
  snow: '-2°C • FROST SNOW'
};

const WEATHER_ORDER: WeatherType[] = ['sunny', 'rain', 'nature', 'snow'];

export const WeatherMoodBadge: React.FC<WeatherMoodBadgeProps> = ({
  currentWeather,
  onSelectWeather,
}) => {
  const currentConfig = WEATHER_CONFIGS[currentWeather];

  const handleNextWeather = () => {
    const currentIndex = WEATHER_ORDER.indexOf(currentWeather);
    const nextIndex = (currentIndex + 1) % WEATHER_ORDER.length;
    onSelectWeather(WEATHER_ORDER[nextIndex]);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleNextWeather}
      title="Current Live Weather (Auto-cycling • Click to switch)"
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill border border-white/90 bg-white/80 backdrop-blur-xl shadow-xs cursor-pointer select-none group"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWeather}
          initial={{ opacity: 0, y: -6, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <span className="text-base drop-shadow-xs">{currentConfig.emoji}</span>
          <div className="text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wide">
                {currentConfig.label}
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
              {WEATHER_TEMPS[currentWeather]}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pl-1 border-l border-slate-200/80 text-slate-400 group-hover:text-slate-800 transition-colors">
        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
      </div>
    </motion.button>
  );
};

