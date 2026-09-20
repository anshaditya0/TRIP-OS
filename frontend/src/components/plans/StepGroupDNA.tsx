import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, Users, Sparkles, Check, Clock, AlertTriangle, 
  ArrowRight, ArrowLeft, ShieldCheck, ThumbsUp, RefreshCw,
  Compass, Award, ChevronRight, UserCheck, Flame, Sliders
} from 'lucide-react';
import { TripMember, GroupDNA, DestinationRecommendation, MoodMeterConfig } from '../../types';
import { rankDestinationsWithDNA, calculateLocalGroupDNA, savePreferencesApi } from '../../services/api';
import { DynamicMoodMeter } from '../DynamicMoodMeter';

interface StepGroupDNAProps {
  tripId: string | number;
  preferredDestination: string;
  members: TripMember[];
  onUpdateMemberPreferences: (memberId: string, preferences: MoodMeterConfig) => void;
  onFinalizeDestination: (finalDestination: string, destinationReason: string, groupDNA: GroupDNA) => void;
  onOpenAddMembersModal: () => void;
  onBack: () => void;
}



export const StepGroupDNA: React.FC<StepGroupDNAProps> = ({
  tripId,
  preferredDestination,
  members,
  onUpdateMemberPreferences,
  onFinalizeDestination,
  onOpenAddMembersModal,
  onBack,
}) => {
  // Selected member to input/review preferences for
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || 'leader-1');
  
  // Local state for the selected member's active 9 sliders
  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];
  const [currentPrefs, setCurrentPrefs] = useState<MoodMeterConfig>(
    activeMember?.preferences || {
      adventure: 65, nature: 80, food: 75, photography: 80,
      nightlife: 45, relaxation: 70, budgetSensitivity: 50,
      walkingTolerance: 60, crowdTolerance: 45
    }
  );

  // Sync currentPrefs when switching members
  useEffect(() => {
    if (activeMember && activeMember.preferences) {
      setCurrentPrefs(activeMember.preferences);
    }
  }, [selectedMemberId]);

  // GroupDNA Calculation & Recommendations State
  const [calculatedDNA, setCalculatedDNA] = useState<GroupDNA | null>(null);
  const [recommendations, setRecommendations] = useState<DestinationRecommendation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedDestinationToApprove, setSelectedDestinationToApprove] = useState<string>('');
  const [hasApproved, setHasApproved] = useState(false);

  const approvedMembers = members.filter(m => m.status === 'APPROVED');
  const allPreferencesSubmitted = approvedMembers.length > 0 && approvedMembers.every(m => m.preferencesSubmitted);
  const pendingCount = approvedMembers.filter(m => !m.preferencesSubmitted).length;

  // Handle saving the currently edited member's preferences
  const handleSaveActiveMemberPreferences = () => {
    if (!activeMember) return;
    onUpdateMemberPreferences(activeMember.id, currentPrefs);
    savePreferencesApi(tripId, currentPrefs);

    // Auto switch to next pending member if available
    const nextPending = approvedMembers.find(m => m.id !== activeMember.id && !m.preferencesSubmitted);
    if (nextPending) {
      setSelectedMemberId(nextPending.id);
    }
  };

  // Helper to simulate remaining members submitting their preferences (great for testing)
  const handleSimulateAllSubmitted = () => {
    approvedMembers.forEach((m, idx) => {
      if (!m.preferencesSubmitted) {
        const simulatedPrefs: MoodMeterConfig = {
          adventure: Math.min(95, 40 + (idx * 18) % 55),
          nature: Math.min(98, 60 + (idx * 12) % 38),
          food: Math.min(95, 55 + (idx * 15) % 40),
          photography: Math.min(95, 50 + (idx * 16) % 45),
          nightlife: Math.min(90, 30 + (idx * 22) % 65),
          relaxation: Math.min(95, 50 + (idx * 14) % 45),
          budgetSensitivity: Math.min(90, 40 + (idx * 17) % 50),
          walkingTolerance: Math.min(90, 45 + (idx * 13) % 45),
          crowdTolerance: Math.min(85, 35 + (idx * 19) % 50),
        };
        onUpdateMemberPreferences(m.id, simulatedPrefs);
      }
    });
  };

  // Run GroupDNA consensus calculation
  const handleComputeGroupDNA = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const prefList = approvedMembers.map(m => m.preferences || currentPrefs);
      const dna = calculateLocalGroupDNA(prefList);
      setCalculatedDNA(dna);

      const ranked = rankDestinationsWithDNA(dna, preferredDestination);
      setRecommendations(ranked);

      // Default selected destination: preferred if high score, otherwise top ranked
      const preferredRank = ranked.find(r => r.matchesPreferred);
      if (preferredRank && preferredRank.score >= 65) {
        setSelectedDestinationToApprove(preferredRank.name);
      } else if (ranked.length > 0) {
        setSelectedDestinationToApprove(ranked[0].name);
      }

      setIsCalculating(false);
    }, 600);
  };

  // Automatically compute GroupDNA if all are ready
  useEffect(() => {
    if (allPreferencesSubmitted && !calculatedDNA) {
      handleComputeGroupDNA();
    }
  }, [allPreferencesSubmitted]);

  // Leader finalizes and approves destination
  const handleLeaderApproveDestination = (destName: string, reason: string) => {
    if (!calculatedDNA) return;
    setHasApproved(true);
    onFinalizeDestination(destName, reason, calculatedDNA);
  };

  return (
    <motion.div
      id="step-group-dna-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-mono-telemetry font-black uppercase tracking-widest text-orange-600">
              STEP 03 • GROUPDNA™ VIBE ENGINE & DESTINATION CONSENSUS
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddMembersModal}
            className="px-3.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-orange-700" />
            <span>MANAGE MEMBERS ({approvedMembers.length})</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
          9-DIMENSIONAL GROUPDNA VIBE PROFILER
        </h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">
          EVERY TRAVELER LOGS THEIR 9 PREFERENCES. DESTINATION IS PROVISIONALLY RECOMMENDED & FINALIZED ACCORDING TO GROUPDNA.
        </p>
      </div>

      {/* Roster & Member Switcher Tabs */}
      <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-black uppercase text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            SELECT MEMBER TO REVIEW / LOG 9 PREFERENCES:
          </span>

          <div className="flex items-center gap-2">
            {!allPreferencesSubmitted && (
              <button
                type="button"
                onClick={handleSimulateAllSubmitted}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-800 uppercase underline cursor-pointer"
                title="Quickly fill varied sample preferences for all remaining members"
              >
                + SIMULATE ALL MEMBER PREFERENCES
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {approvedMembers.map((member) => {
            const isSelected = member.id === selectedMemberId;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/70 shadow-2xs'
                }`}
              >
                <span>{member.name}</span>
                {member.role === 'LEADER' && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    LEADER
                  </span>
                )}
                {member.preferencesSubmitted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 9 Preferences Sliders for Currently Selected Member */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono text-orange-600 font-bold uppercase block">
              CONFIGURING VIBE PROFILE FOR:
            </span>
            <h3 className="text-base font-black uppercase text-slate-900">
              {activeMember?.name} {activeMember?.role === 'LEADER' && '(TRIP LEADER)'}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleSaveActiveMemberPreferences}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>SAVE {activeMember?.name?.split(' ')[0]}'S PREFERENCES</span>
          </button>
        </div>

        {/* Kinetic 3x3 Endurance Profile Sliders from DynamicMoodMeter */}
        <DynamicMoodMeter
          config={currentPrefs}
          onChange={(newMood) => setCurrentPrefs(newMood)}
        />
      </div>

      {/* Lock Status / GroupDNA Telemetry Engine Section */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono font-black uppercase tracking-wider text-orange-400">
                GROUPDNA CONSENSUS TELEMETRY
              </span>
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight">
              {allPreferencesSubmitted
                ? 'ALL MEMBER PREFERENCES LOGGED • GROUPDNA READY'
                : `WAITING FOR ${pendingCount} MEMBER${pendingCount > 1 ? 'S' : ''} TO LOG PREFERENCES`}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase">
              ITINERARY CANNOT BE GENERATED UNTIL ALL MEMBERS SUBMIT PREFERENCES AND LEADER CONFIRMS THE DESTINATION.
            </p>
          </div>

          <button
            type="button"
            onClick={handleComputeGroupDNA}
            disabled={!allPreferencesSubmitted || isCalculating}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
            <span>{calculatedDNA ? 'RE-CALCULATE GROUPDNA' : 'RUN GROUPDNA CALCULATION'}</span>
          </button>
        </div>

        {/* Display GroupDNA Vector when calculated */}
        {calculatedDNA && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                COLLECTIVE GROUPDNA PROFILE GENERATED
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                BASED ON {approvedMembers.length} APPROVED EXPLORERS
              </span>
            </div>

            {/* Dimensional Badges */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 text-center">
              {PREFERENCE_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700">
                  <span className="text-base block mb-0.5">{dim.emoji}</span>
                  <span className="block text-xs font-black font-mono text-white">
                    {calculatedDNA[dim.key]}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase truncate block">
                    {dim.key.replace('Sensitivity', '').replace('Tolerance', '')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Destination Recommendation & Leader Finalization (Requirement 2 & 4) */}
      {calculatedDNA && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-6"
        >
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-mono text-orange-600 font-black uppercase tracking-widest block mb-1">
              DESTINATION RECOMMENDATION & GROUPDNA FIT
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900">
              WHICH DESTINATION SUITS YOUR GROUPDNA?
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase mt-0.5">
              THE RECOMMENDED DESTINATION BY USER WAS: <strong className="text-slate-900">{preferredDestination}</strong>. REVIEW GROUPDNA SUITABILITY BELOW.
            </p>
          </div>

          {/* User's Preferred Destination GroupDNA Compatibility Card */}
          {(() => {
            const prefMatch = recommendations.find(r => r.matchesPreferred) || recommendations[0];
            const suitsWell = prefMatch.score >= 65;

            return (
              <div className={`p-5 rounded-2xl border ${
                suitsWell
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              } space-y-3`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-600 block">
                      USER PREFERRED DESTINATION EVALUATION:
                    </span>
                    <h4 className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
                      <span>{preferredDestination}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                        suitsWell ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {prefMatch.score}% GROUPDNA MATCH
                      </span>
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLeaderApproveDestination(
                      preferredDestination,
                      `Leader approved user recommendation which scored ${prefMatch.score}% against GroupDNA`
                    )}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>FINALIZE & APPROVE "{preferredDestination}"</span>
                  </button>
                </div>

                <p className="text-xs font-bold text-slate-700">
                  {prefMatch.matchVerdict}
                </p>

                <div className="space-y-1">
                  {prefMatch.why.map((reason, idx) => (
                    <div key={idx} className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Top Ranked Alternative Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              TOP GROUPDNA RANKED DESTINATIONS (EXPLAINABLE REASONS):
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((dest, idx) => {
                return (
                  <div
                    key={dest.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-orange-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-black">
                          RANK #0{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-xs font-mono font-black">
                          {dest.score}% FIT
                        </span>
                      </div>

                      <h5 className="text-sm font-black uppercase text-slate-900">
                        {dest.name}
                      </h5>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                        {dest.state}, {dest.country}
                      </span>

                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mb-2">
                        {dest.description}
                      </p>

                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        {dest.why.slice(0, 2).map((r, rIdx) => (
                          <div key={rIdx} className="text-[10px] text-slate-600 font-bold flex items-start gap-1">
                            <span className="text-orange-500 font-black">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLeaderApproveDestination(
                        dest.name,
                        `Leader selected top GroupDNA recommendation ${dest.name} (${dest.score}% match)`
                      )}
                      className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <span>APPROVE AS DESTINATION</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200/80">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO MEMBERS</span>
        </button>

        <div className="flex items-center gap-3">
          {!allPreferencesSubmitted && (
            <span className="text-[10px] font-mono text-amber-700 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              ITINERARY LOCKED UNTIL ALL PREFERENCES LOGGED
            </span>
          )}

          {hasApproved && (
            <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              DESTINATION FINALIZED & CONFIRMED!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
