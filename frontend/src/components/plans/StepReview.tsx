import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, ArrowRight, ArrowLeft, MapPin, Users, Wallet, Plane, Train, Car, Bike, Activity, Calendar, Clock, Dna, ThumbsUp } from 'lucide-react';
import { TransportMode, MoodMeterConfig, TripMember, GroupDNA } from '../../types';
import { estimateDistanceKm, calculateExhaustion } from '../../utils/planGenerator';

interface StepReviewProps {
  fromLocation: string;
  toLocation: string;
  preferredDestination?: string;
  finalDestination?: string;
  destinationReason?: string;
  dailyStartTime?: string;
  members?: TripMember[];
  groupDNA?: GroupDNA;
  friendsCount: number;
  budget: number;
  transportMode: TransportMode;
  selectedActivities: string[];
  moodMeter: MoodMeterConfig;
  isGenerating: boolean;
  selectedDate?: string;
  durationDays?: number;
  onGenerate: () => void;
  onBack: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  fromLocation,
  toLocation,
  preferredDestination,
  finalDestination,
  destinationReason,
  dailyStartTime = '09:00 AM',
  members = [],
  groupDNA,
  friendsCount,
  budget,
  transportMode,
  selectedActivities,
  moodMeter,
  isGenerating,
  selectedDate,
  durationDays = 3,
  onGenerate,
  onBack,
}) => {
  const distanceKm = estimateDistanceKm(fromLocation || 'New Delhi', toLocation || 'Goa');
  const exhaustion = calculateExhaustion(distanceKm, transportMode, selectedActivities, moodMeter);
  const perPersonCost = Math.round(budget / Math.max(1, friendsCount));

  const formatReviewDate = (dateStr?: string) => {
    if (!dateStr) return 'FLEXIBLE DATES';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  const getTransportIcon = () => {
    switch (transportMode) {
      case 'flight': return Plane;
      case 'train': return Train;
      case 'roadtrip': return Car;
      case 'bike': return Bike;
      default: return Plane;
    }
  };
  const TransportIcon = getTransportIcon();

  return (
    <motion.div
      id="step-review-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-mono-telemetry font-black uppercase tracking-widest text-emerald-700">
            STEP 05 • EXPEDITION BLUEPRINT BRIEF
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
          CONFIRM YOUR EXPEDITION PARAMETERS
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">
          READY TO GENERATE YOUR BESPOKE DAY-BY-DAY ITINERARY & SPATIAL CORRIDOR MAPS
        </p>
      </div>

      <div className="space-y-6">
        {/* GroupDNA Destination Verification Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-neutral-900 text-white shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-orange-400" />
                <span className="text-[10px] font-mono text-orange-400 font-black uppercase tracking-wider">
                  GROUPDNA™ FINALIZED DESTINATION
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  LEADER APPROVED
                </span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                {finalDestination || toLocation}
              </h3>
              {preferredDestination && preferredDestination !== (finalDestination || toLocation) && (
                <p className="text-xs text-slate-300 font-medium">
                  User Provisional Preference: <strong>{preferredDestination}</strong> ➔ Calibrated by GroupDNA consensus.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-right">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block">
                  DAILY VISIT START TIME
                </span>
                <span className="text-sm font-black font-mono text-orange-400">
                  {dailyStartTime}
                </span>
              </div>
            </div>
          </div>

          {destinationReason && (
            <p className="text-xs text-slate-300 font-medium border-t border-slate-700/60 pt-2 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{destinationReason}</span>
            </p>
          )}
        </div>

        {/* Visual Summary Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Route */}
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-mono font-bold uppercase">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>EXPEDITION CORRIDOR</span>
            </div>
            <p className="text-base font-black text-slate-900 uppercase truncate">
              {fromLocation} ➔ {finalDestination || toLocation}
            </p>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Estimated: ~{distanceKm.toLocaleString()} KM
            </p>
          </div>

          {/* Card 2: Dates & Duration */}
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-mono font-bold uppercase">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>DATES & DURATION</span>
            </div>
            <p className="text-sm font-black text-slate-900 uppercase">
              {formatReviewDate(selectedDate)}
            </p>
            <p className="text-xs font-mono text-orange-700 font-bold mt-1">
              {durationDays} Days Itinerary
            </p>
          </div>

          {/* Card 3: Party & Transit */}
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>CREW & TRANSIT</span>
            </div>
            <div className="flex items-center gap-2">
              <TransportIcon className="w-4 h-4 text-slate-700" />
              <p className="text-sm font-black text-slate-900 uppercase">
                {friendsCount} {friendsCount === 1 ? 'SOLO' : 'CREW'} • {transportMode.toUpperCase()}
              </p>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Transit: ~{exhaustion.travelTimeHours} Hours
            </p>
          </div>

          {/* Card 4: Budget Split */}
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-mono font-bold uppercase">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>FINANCIAL CAPACITY</span>
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              ₹{budget.toLocaleString()} TOTAL
            </p>
            <p className="text-xs font-mono text-emerald-700 font-bold mt-1">
              ₹{perPersonCost.toLocaleString()} / person
            </p>
          </div>
        </div>

        {/* Card 4: Selected Activities & Projected Fatigue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-2">
              HIGHLIGHT INTERESTS ({selectedActivities.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedActivities.map((act) => (
                <span
                  key={act}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-mono font-black uppercase border border-slate-200"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono font-bold uppercase mb-1">
                <Activity className="w-3.5 h-3.5 text-orange-500" />
                <span>PROJECTED PACING</span>
              </div>
              <p className="text-sm font-black uppercase text-slate-900">
                {exhaustion.level} ({exhaustion.score}% FATIGUE)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Physical: {exhaustion.physicalStrain}% • Recovery: {exhaustion.recoveryScore}%
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-black text-white font-mono"
              style={{ backgroundColor: exhaustion.color }}
            >
              {exhaustion.level}
            </span>
          </div>
        </div>

        {/* Primary Call to Action */}
        <div className="pt-2">
          <motion.button
            id="btn-architect-itinerary"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isGenerating}
            onClick={onGenerate}
            className="w-full py-4.5 rounded-2xl bg-neutral-900 hover:bg-black text-white text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl cursor-pointer disabled:opacity-75"
          >
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{isGenerating ? 'ORCHESTRATING BESPOKE ITINERARY & MAPS...' : 'ARCHITECT FINAL ITINERARY →'}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Back navigation */}
        <div className="pt-2 flex justify-start">
          <button
            id="step-review-back-btn"
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK: INTERESTS</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
