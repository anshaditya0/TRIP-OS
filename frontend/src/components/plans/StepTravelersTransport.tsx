import React from 'react';
import { motion } from 'motion/react';
import { Users, Plane, Train, Car, Bike, ArrowRight, ArrowLeft, ShieldCheck, UserPlus, Check, Clock, QrCode } from 'lucide-react';
import { TransportMode, TripMember } from '../../types';

interface StepTravelersTransportProps {
  friendsCount: number;
  transportMode: TransportMode;
  members?: TripMember[];
  onOpenAddMembersModal?: () => void;
  onChangeFriendsCount: (count: number) => void;
  onChangeTransportMode: (mode: TransportMode) => void;
  onNext: () => void;
  onBack: () => void;
}

const PARTY_PRESETS = [
  { count: 1, label: '1' },
  { count: 2, label: '2' },
  { count: 3, label: '3' },
  { count: 4, label: '4' },
  { count: 5, label: '5' },
  { count: 6, label: '6' }
];

const TRANSPORT_OPTIONS: {
  mode: TransportMode;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  speedBadge: string;
}[] = [
  {
    mode: 'flight',
    label: 'AIR TRAVEL',
    sub: 'Fastest transit, minimal physical fatigue',
    icon: Plane,
    speedBadge: '⚡ EXPRESS (2-3 HRS)'
  },
  {
    mode: 'train',
    label: 'INDIAN RAILWAYS',
    sub: 'Classic scenic tracks, overnight sleeper options',
    icon: Train,
    speedBadge: '🚂 SCENIC (12-24 HRS)'
  },
  {
    mode: 'roadtrip',
    label: 'HIGHWAY ROAD TRIP',
    sub: 'Total route flexibility, dhabas & spontaneous stops',
    icon: Car,
    speedBadge: '🚗 FREEDOM (8-16 HRS)'
  },
  {
    mode: 'bike',
    label: 'MOTORCYCLE EXPEDITION',
    sub: 'Pure adrenaline, rugged mountain passes & wind',
    icon: Bike,
    speedBadge: '🏍️ ADVENTURE (HIGH STRAIN)'
  }
];

export const StepTravelersTransport: React.FC<StepTravelersTransportProps> = ({
  friendsCount,
  transportMode,
  members = [],
  onOpenAddMembersModal,
  onChangeFriendsCount,
  onChangeTransportMode,
  onNext,
  onBack,
}) => {
  return (
    <motion.div
      id="step-travelers-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-mono-telemetry font-black uppercase tracking-widest text-orange-600">
            STEP 02 • PARTY & MOBILITY
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
          WHO IS GOING & HOW WILL YOU TRAVEL?
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">
          INVITE CREW MEMBERS, GATHER COLLABORATORS & SELECT TRANSIT MODE
        </p>
      </div>

      <div className="space-y-8">
        {/* Requirement 1: Add Members rectangular button with circular edges */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-orange-400 font-black uppercase tracking-wider block">
                COLLABORATIVE TRIP SQUAD
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                EXPEDITION MEMBERS & INVITE PORTAL
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Share your invite link so all members can join and log their 9 Vibe Preferences for GroupDNA.
              </p>
            </div>

            {/* Rectangular button with circular edges (rounded-2xl) */}
            <motion.button
              id="btn-add-members-rectangular"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onOpenAddMembersModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 border border-orange-400/40 shrink-0"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>ADD MEMBERS</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold">
                {members.length} MEMBERS
              </span>
            </motion.button>
          </div>

          {/* Member Avatars Pills Strip */}
          <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200"
              >
                <span className="w-5 h-5 rounded-full bg-orange-500/30 text-orange-300 text-[10px] flex items-center justify-center font-mono">
                  {m.name.slice(0, 1)}
                </span>
                <span>{m.name}</span>
                {m.role === 'LEADER' ? (
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-orange-500 text-white">LEADER</span>
                ) : m.preferencesSubmitted ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section A: Number of Travelers */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
            TOTAL GROUP SIZE / TRAVELERS COUNT
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Direct Counter */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="btn-decrease-travelers"
                type="button"
                onClick={() => onChangeFriendsCount(Math.max(1, friendsCount - 1))}
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-black text-lg hover:bg-slate-100 cursor-pointer shadow-xs active:scale-95"
              >
                -
              </button>
              <div className="w-20 py-3 text-center rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xl font-black shadow-inner">
                {friendsCount}
              </div>
              <button
                id="btn-increase-travelers"
                type="button"
                onClick={() => onChangeFriendsCount(Math.min(16, friendsCount + 1))}
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-black text-lg hover:bg-slate-100 cursor-pointer shadow-xs active:scale-95"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 w-full sm:flex-1">
              {PARTY_PRESETS.map((preset) => (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => onChangeFriendsCount(preset.count)}
                  className={`text-[10px] font-bold uppercase px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    friendsCount === preset.count
                      ? 'bg-neutral-900 text-white font-black shadow-xs'
                      : 'bg-white/80 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section B: Transit Mode Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
            PREFERRED TRANSIT MODE
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TRANSPORT_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = transportMode === item.mode;
              return (
                <button
                  id={`transport-option-${item.mode}`}
                  key={item.mode}
                  type="button"
                  onClick={() => onChangeTransportMode(item.mode)}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900 scale-[1.02]'
                      : 'bg-white/80 text-slate-800 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/10 text-amber-300' : 'bg-orange-50 text-orange-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[8px] font-mono-telemetry font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {item.speedBadge}
                      </span>
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">
                      {item.label}
                    </h4>
                    <p className={`text-[11px] leading-snug ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {item.sub}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-white/20 flex items-center gap-1 text-[10px] font-bold text-amber-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>SELECTED CARRIER</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
          <button
            id="step-travelers-back-btn"
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK: ROUTE</span>
          </button>

          <motion.button
            id="step-travelers-next-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onNext}
            className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>NEXT: BUDGET & VIBE</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
