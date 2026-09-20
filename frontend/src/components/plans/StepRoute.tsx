import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Compass, Route, Calendar, Clock, Sparkles } from 'lucide-react';
import { estimateDistanceKm } from '../../utils/planGenerator';
import { DateDropboxCalendar } from './DateDropboxCalendar';

interface StepRouteProps {
  fromLocation: string;
  toLocation: string;
  selectedDate: string;
  durationDays: number;
  dailyStartTime?: string;
  onChangeFrom: (from: string) => void;
  onChangeTo: (to: string) => void;
  onChangeDate: (date: string) => void;
  onChangeDuration: (days: number) => void;
  onChangeDailyStartTime?: (time: string) => void;
  onNext: () => void;
}

const POPULAR_ORIGINS = ['New Delhi', 'Mumbai', 'Bengaluru', 'Varanasi', 'Kolkata', 'Hyderabad', 'Pune', 'Chennai'];
const POPULAR_HUBS = ['Goa Coastline', 'Manali & Solang', 'Jaipur Royal City', 'Varanasi Ghats', 'Munnar Tea Hills', 'Leh Ladakh', 'Rishikesh', 'Udaipur'];

export const StepRoute: React.FC<StepRouteProps> = ({
  fromLocation,
  toLocation,
  selectedDate,
  durationDays,
  dailyStartTime = '09:00 AM',
  onChangeFrom,
  onChangeTo,
  onChangeDate,
  onChangeDuration,
  onChangeDailyStartTime,
  onNext,
}) => {
  const distanceKm = estimateDistanceKm(fromLocation || 'New Delhi', toLocation || 'Goa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocation.trim() && toLocation.trim()) {
      onNext();
    }
  };

  return (
    <motion.div
      id="step-route-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-mono-telemetry font-black uppercase tracking-widest text-orange-600">
            STEP 01 • SPATIAL ROUTING & CALENDAR TIMELINE
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
          WHERE & WHEN ARE YOU TRAVELING?
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">
          SELECT YOUR ROUTE AND PICK YOUR EXPEDITION DATES ON THE CALENDAR
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* From Location */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
              ORIGIN (STARTING CITY)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5" />
              <input
                id="input-from-location"
                type="text"
                value={fromLocation}
                onChange={(e) => onChangeFrom(e.target.value)}
                placeholder="E.G. NEW DELHI, MUMBAI, VARANASI"
                required
                className="w-full pl-10 pr-4 py-3 glass-input text-slate-900 font-bold uppercase text-sm"
              />
            </div>
            <div className="pt-1">
              <span className="text-[10px] font-mono-telemetry text-neutral-400 uppercase block mb-1.5">
                POPULAR DEPARTURES:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_ORIGINS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onChangeFrom(city)}
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      fromLocation.toLowerCase() === city.toLowerCase()
                        ? 'bg-neutral-900 text-white font-black shadow-2xs'
                        : 'bg-white/80 text-slate-600 hover:bg-orange-100 hover:text-orange-900 border border-slate-200/60'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* To Location / Provisional Recommendation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                RECOMMENDED DESTINATION (PREFERENCE)
              </label>
              <span className="text-[9px] font-mono font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                GROUPDNA FINALIZED
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">
              Provisional preference: finalized once squad GroupDNA is calculated.
            </p>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              <input
                id="input-to-location"
                type="text"
                value={toLocation}
                onChange={(e) => onChangeTo(e.target.value)}
                placeholder="E.G. GOA, MANALI, JAIPUR, MUNNAR"
                required
                className="w-full pl-10 pr-4 py-3 glass-input text-slate-900 font-bold uppercase text-sm"
              />
            </div>
            <div className="pt-1">
              <span className="text-[10px] font-mono-telemetry text-neutral-400 uppercase block mb-1.5">
                POPULAR HUBS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_HUBS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onChangeTo(city)}
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      toLocation.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(toLocation.toLowerCase())
                        ? 'bg-emerald-700 text-white font-black shadow-2xs'
                        : 'bg-white/80 text-slate-600 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200/60'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requirement 5: Time to Begin Visits Each Day */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-slate-200/80 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>TIME TO BEGIN VISITS EACH DAY</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              DAILY ITINERARY DEPARTURE ANCHOR
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'].map((timePreset) => {
              const isSelected = (dailyStartTime || '09:00 AM') === timePreset;
              return (
                <button
                  key={timePreset}
                  type="button"
                  onClick={() => onChangeDailyStartTime?.(timePreset)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                      : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-900 border border-slate-200'
                  }`}
                >
                  {timePreset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Small Dropbox Calendar and Date Select */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/80 space-y-2 shadow-2xs">
          <DateDropboxCalendar
            selectedDate={selectedDate}
            durationDays={durationDays}
            onChangeDate={onChangeDate}
            onChangeDuration={onChangeDuration}
            label="EXPEDITION CALENDAR & DEPARTURE DATE SELECT (DROPBOX)"
          />
        </div>

        {/* Route Estimate Preview Banner */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono-telemetry text-neutral-500 font-bold uppercase block">
                PROJECTED EXPEDITION CORRIDOR
              </span>
              <p className="text-sm font-black text-neutral-900 uppercase">
                {fromLocation || 'ORIGIN'} ➔ {toLocation || 'DESTINATION'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] font-mono-telemetry text-neutral-400 font-bold uppercase block">
                APPROX DISTANCE
              </span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                ~{distanceKm.toLocaleString()} KM
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Action */}
        <div className="pt-2 flex justify-end">
          <motion.button
            id="step-route-next-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>NEXT: TRAVELERS & TRANSPORT</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
