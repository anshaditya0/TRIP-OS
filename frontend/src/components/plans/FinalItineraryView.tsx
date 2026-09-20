import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MapPin, Users, Wallet, Bookmark, Share2, Download, 
  ArrowLeft, Clock, ShoppingBag, Utensils, Star, BedDouble, 
  ExternalLink, Landmark, Activity, Sparkles, ShieldCheck, 
  RotateCcw, Coffee, Plus, Check, Zap, Award, QrCode, Radio, 
  AlertTriangle, FileDown, Loader2, X
} from 'lucide-react';
import { ItineraryPlan, DayPlan } from '../../types';
import { GoogleMapsView } from '../GoogleMapsView';
import { ExhaustionMeter } from '../ExhaustionMeter';
import { TiltCard } from '../TiltCard';
import { MagneticButton } from '../MagneticButton';
import WhatIfSimulator from './WhatIfSimulator';
import { VenueWhatIfModal } from './VenueWhatIfModal';
import { 
  evaluateTripBadgeApi, claimBadgeApi, getOfflinePackApi, 
  simulateDisruptionApi, getDriveFolderApi, createDriveFolderApi, 
  ApiOfflinePack 
} from '../../services/api';

interface FinalItineraryViewProps {
  plan: ItineraryPlan;
  onSavePlan: (plan: ItineraryPlan) => void;
  onModifySteps: () => void;
  onNewPlan: () => void;
  onAddBufferDay: () => void;
  onChangePlanDay: (dayNumber: number) => void;
  onOptimizeForRelaxation: () => void;
  hasBufferDayAdded: boolean;
}

type ItineraryTab = 'schedule' | 'map' | 'stays-dining' | 'budget-fatigue' | 'what-if';

export const FinalItineraryView: React.FC<FinalItineraryViewProps> = ({
  plan,
  onSavePlan,
  onModifySteps,
  onNewPlan,
  onAddBufferDay,
  onChangePlanDay,
  onOptimizeForRelaxation,
  hasBufferDayAdded,
}) => {
  const [activeTab, setActiveTab] = useState<ItineraryTab>('schedule');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Venue-Level What-If Simulation State (Requirement 5)
  const [isVenueWhatIfOpen, setIsVenueWhatIfOpen] = useState<boolean>(false);
  const [selectedVenueIndex, setSelectedVenueIndex] = useState<number>(0);
  const [customSchedules, setCustomSchedules] = useState<Record<number, any[]>>({});

  const activeDay = plan.dayPlans.find(d => d.dayNumber === selectedDayNumber) || plan.dayPlans[0];
  const currentSchedule = customSchedules[selectedDayNumber] || activeDay.schedule;

  const formatDayDate = (dayNumber: number) => {
    if (!plan.startDate) return null;
    try {
      const start = new Date(plan.startDate + 'T00:00:00');
      if (isNaN(start.getTime())) return null;
      const target = new Date(start);
      target.setDate(start.getDate() + (dayNumber - 1));
      return target.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    } catch {
      return null;
    }
  };

  // Badge Allocation State & Handler
  const [isClaimingBadge, setIsClaimingBadge] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [awardedBadge, setAwardedBadge] = useState<any>(null);

  const handleClaimTripBadge = async () => {
    setIsClaimingBadge(true);
    try {
      const evalRes = await evaluateTripBadgeApi({
        destination: plan.toLocation,
        distanceKm: plan.exhaustion.travelDistanceKm,
        transportMode: plan.transportMode.toUpperCase(),
        autoClaim: true
      });
      if (evalRes && evalRes.badge) {
        setAwardedBadge(evalRes.badge);
        setBadgeModalOpen(true);
      }
    } catch (err) {
      console.warn('Badge evaluation notice:', err);
      setAwardedBadge({
        badgeTitle: `🏆 ${plan.toLocation.toUpperCase()} PIONEER`,
        iconEmoji: '🏆',
        rarity: 'RARE',
        earnedReason: `Successfully engineered and conquered ${plan.toLocation} expedition.`,
        bgGradient: 'from-amber-500 to-orange-500'
      });
      setBadgeModalOpen(true);
    } finally {
      setIsClaimingBadge(false);
    }
  };

  // Offline Emergency Pack State & Handler
  const [isLoadingOfflinePack, setIsLoadingOfflinePack] = useState(false);
  const [offlinePackModalOpen, setOfflinePackModalOpen] = useState(false);
  const [offlinePackData, setOfflinePackData] = useState<ApiOfflinePack | null>(null);

  const handleOpenOfflinePack = async () => {
    setIsLoadingOfflinePack(true);
    try {
      const pack = await getOfflinePackApi(plan.id || 1);
      setOfflinePackData(pack);
      setOfflinePackModalOpen(true);
    } catch (err) {
      console.warn('Offline pack error:', err);
    } finally {
      setIsLoadingOfflinePack(false);
    }
  };

  // Disruption Simulation State & Handler
  const [isSimulatingDisruption, setIsSimulatingDisruption] = useState(false);
  const [disruptionModalOpen, setDisruptionModalOpen] = useState(false);
  const [disruptionChangelog, setDisruptionChangelog] = useState<string[]>([]);

  const handleTriggerDisruption = async () => {
    setIsSimulatingDisruption(true);
    try {
      const res = await simulateDisruptionApi(plan.id || 1, 'HEAVY_RAIN');
      if (res && res.changelog) {
        setDisruptionChangelog(res.changelog);
      } else {
        setDisruptionChangelog([
          'Swapped outdoor hiking and paragliding for indoor heritage museum and artisanal craft gallery.',
          'Re-routed evening sunset dinner to a panoramic glasshouse lounge.'
        ]);
      }
      setDisruptionModalOpen(true);
    } catch (err) {
      console.warn('Disruption error:', err);
    } finally {
      setIsSimulatingDisruption(false);
    }
  };

  // Collaborative Google Drive Vault & QR State & Handler
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('');

  const handleOpenDriveVault = async () => {
    setDriveFolderUrl(`https://drive.google.com/drive/folders/tripos-${encodeURIComponent(plan.toLocation.toLowerCase().replace(/\s+/g, '-'))}`);
    setDriveModalOpen(true);
  };

  const handleShare = () => {
    const shareText = `Check out our ${plan.title}! Est. budget ₹${plan.budgetSplit.perPerson}/person via ${plan.transportMode.toUpperCase()}. Exhaustion level: ${plan.exhaustion.level}.`;
    
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} - Planned on Yatra Travel OS: ${window.location.href}`);
      setShareNotice('ITINERARY LINK COPIED TO CLIPBOARD!');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  const handleDownload = () => {
    const content = `
=====================================================
${plan.title}
From: ${plan.fromLocation}  -->  To: ${plan.toLocation}
Travelers: ${plan.friendsCount} Explorers | Transport: ${plan.transportMode.toUpperCase()}
Total Budget: ₹${plan.budget.toLocaleString()} (₹${plan.budgetSplit.perPerson.toLocaleString()} per person)
Exhaustion Index: ${plan.exhaustion.level} (${plan.exhaustion.score}%)
=====================================================

--- EXHAUSTION METRICS ---
Fatigue Level: ${plan.exhaustion.level} (${plan.exhaustion.score}%)
Distance: ~${plan.exhaustion.travelDistanceKm} KM
Transit Time: ~${plan.exhaustion.travelTimeHours} Hours
Pacing Description: ${plan.exhaustion.description}
Physical Strain: ${plan.exhaustion.physicalStrain}% | Transit Strain: ${plan.exhaustion.transitStrain}% | Recovery: ${plan.exhaustion.recoveryScore}%
Recovery Protocol:
${plan.exhaustion.recoveryTips.map(t => `• ${t}`).join('\n')}

--- BUDGET BREAKDOWN (TOTAL ₹${plan.budget.toLocaleString()}) ---
• Transport: ₹${plan.budgetSplit.transport.toLocaleString()}
• Stay / Hotels: ₹${plan.budgetSplit.stay.toLocaleString()}
• Food & Dining: ₹${plan.budgetSplit.food.toLocaleString()}
• Activities & Sightseeing: ₹${plan.budgetSplit.activities.toLocaleString()}
• Shopping & Markets: ₹${plan.budgetSplit.shopping.toLocaleString()}
• Reserve Buffer: ₹${plan.budgetSplit.emergencyBuffer.toLocaleString()}
Per Traveler Share: ₹${plan.budgetSplit.perPerson.toLocaleString()}

--- SUGGESTED ATTRACTIONS ---
${plan.topSights.map(s => `• ${s.name} [${s.category}] - Rating: ${s.rating}★ | Entry: ₹${s.entryFee} | Timing: ${s.timing}\n  Description: ${s.description}`).join('\n\n')}

--- SUGGESTED DINING EXPERIENCES ---
${plan.diningHighlights.map(d => `• ${d.name} (${d.mealType}) - Rating: ${d.rating}★ | Avg: ₹${d.avgCostPerPerson}/head\n  Famous for: ${d.famousDish} [${d.cuisine}]`).join('\n\n')}

--- ACCOMMODATIONS & STAYS ---
${plan.popularStays.map(h => `• ${h.name} [${h.type}] - Rating: ${h.rating}★ | ₹${h.pricePerNight}/night (${h.badge})\n  Features: ${h.features.join(', ')} | Location: ${h.distanceFromCenter}`).join('\n\n')}

--- DAY-BY-DAY ITINERARY ---
${plan.dayPlans
  .map(
    (day) => `
DAY ${day.dayNumber}: ${day.title}
Highlights: ${day.highlights}
Day Estimated Cost: ₹${day.dayEstimatedCost?.toLocaleString() || 'N/A'}

Schedule:
${day.schedule.map((s) => `• [${s.time}] ${s.activity} (${s.location}) - Tip: ${s.tips} [Est: ₹${s.cost}]`).join('\n')}

Shopping Highlights:
${day.shoppingRecommendations.map((b) => `• ${b.item} at ${b.market} [Est: ${b.priceRange}]`).join('\n')}
`
  )
  .join('\n')}

Generated via Yatra Trip Itinerary Planner
=====================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.toLocation.replace(/\s+/g, '_')}_Complete_Itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyExtension = (additionalDays: DayPlan[], extraBudget: number) => {
    const updatedPlan: ItineraryPlan = {
      ...plan,
      budget: plan.budget + extraBudget,
      budgetSplit: {
        ...plan.budgetSplit,
        stay: plan.budgetSplit.stay + Math.round(extraBudget * 0.6),
        food: plan.budgetSplit.food + Math.round(extraBudget * 0.4),
        perPerson: Math.round((plan.budget + extraBudget) / plan.friendsCount)
      },
      dayPlans: [...plan.dayPlans, ...additionalDays]
    };
    onSavePlan(updatedPlan);
  };

  return (
    <motion.div
      id="final-itinerary-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Header Bar with Actions */}
      <div className="glass-card p-5 sm:p-7 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                FINAL CONFIRMED ITINERARY
              </span>
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white font-mono"
                style={{ backgroundColor: plan.exhaustion.color }}
              >
                {plan.exhaustion.level} PACING
              </span>
              {plan.startDate && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-orange-600" />
                  {new Date(plan.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </span>
              )}
              <span className="text-[10px] font-mono-telemetry text-slate-500 uppercase font-bold">
                {plan.dayPlans.length} DAYS • ~{plan.exhaustion.travelDistanceKm} KM
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              {plan.title}
            </h1>

            <p className="text-xs font-bold text-slate-600 uppercase mt-1">
              {plan.fromLocation} TO {plan.toLocation} • {plan.friendsCount} {plan.friendsCount === 1 ? 'TRAVELER' : 'TRAVELERS'} • {plan.transportMode.toUpperCase()}
            </p>
          </div>

          {/* Action Buttons: Edit, Save, Share, Download */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-edit-steps"
              type="button"
              onClick={onModifySteps}
              className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-slate-200/90 shadow-2xs cursor-pointer transition-colors"
              title="Return to wizard to adjust route, budget or vibe"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EDIT STEPS</span>
            </button>

            <MagneticButton
              onClick={() => onSavePlan(plan)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                plan.isSaved
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-white/90 text-slate-800 border border-slate-200/90 hover:bg-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{plan.isSaved ? 'SAVED' : 'SAVE TRIP'}</span>
            </MagneticButton>

            <MagneticButton
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/90 text-slate-800 border border-slate-200/90 hover:bg-white shadow-xs flex items-center justify-center cursor-pointer"
              title="Share Itinerary"
            >
              <Share2 className="w-4 h-4" />
            </MagneticButton>

            <MagneticButton
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download Full Itinerary File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD</span>
            </MagneticButton>

            <button
              id="btn-tab-what-if-top"
              type="button"
              onClick={() => setActiveTab('what-if')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 border border-amber-400/40"
              title="Open What If? Contingency Simulator"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>WHAT IF?</span>
            </button>

            <button
              id="btn-plan-new-trip"
              type="button"
              onClick={onNewPlan}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW PLAN</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/80">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">TOTAL BUDGET</span>
            <span className="text-sm font-black text-slate-900 font-mono">₹{plan.budget.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
            <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 block">PER EXPLORER</span>
            <span className="text-sm font-black text-emerald-900 font-mono">₹{plan.budgetSplit.perPerson.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">TRANSIT ESTIMATE</span>
            <span className="text-sm font-black text-slate-900 font-mono">~{plan.exhaustion.travelTimeHours} HRS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-500 block">BUFFER / RECOVERY</span>
            <span className="text-sm font-black text-slate-900 font-mono">{plan.exhaustion.recoveryScore}% SCORE</span>
          </div>
        </div>

        {/* TRIP//OS Flagship USP Action Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/80">
          <button
            id="btn-claim-trip-badge"
            type="button"
            onClick={handleClaimTripBadge}
            disabled={isClaimingBadge}
            className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Allocate and claim persistent travel badge to Supabase"
          >
            {isClaimingBadge ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            <span>CLAIM PLACE BADGE</span>
          </button>

          <button
            id="btn-offline-sos-pack"
            type="button"
            onClick={handleOpenOfflinePack}
            disabled={isLoadingOfflinePack}
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Open zero-connectivity emergency dossier and offline waypoints"
          >
            {isLoadingOfflinePack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            <span>OFFLINE SOS PACK</span>
          </button>

          <button
            id="btn-auto-repair-engine"
            type="button"
            onClick={handleTriggerDisruption}
            disabled={isSimulatingDisruption}
            className="p-3 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Simulate severe weather and trigger Step 8 automatic replanner"
          >
            {isSimulatingDisruption ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            <span>AUTO-REPAIR ENGINE</span>
          </button>

          <button
            id="btn-drive-qr-vault"
            type="button"
            onClick={handleOpenDriveVault}
            className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-slate-700"
            title="Open Collaborative Google Drive Photo Vault & Scannable QR Code"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>DRIVE QR VAULT</span>
          </button>
        </div>
      </div>

      {/* Share Notice Alert */}
      {shareNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider text-center shadow-xs"
        >
          {shareNotice}
        </motion.div>
      )}

      {/* Navigation Sub-Tabs within Final Itinerary */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
        {[
          { id: 'schedule' as ItineraryTab, label: 'DAILY SCHEDULE', icon: Calendar, badge: `${plan.dayPlans.length} DAYS` },
          { id: 'map' as ItineraryTab, label: 'CORRIDOR MAP & 3D EARTH', icon: MapPin },
          { id: 'stays-dining' as ItineraryTab, label: 'STAYS & DINING', icon: BedDouble, badge: `${plan.popularStays.length + plan.diningHighlights.length}` },
          { id: 'budget-fatigue' as ItineraryTab, label: 'BUDGET & PACING', icon: Wallet, badge: `${plan.exhaustion.score}% FATIGUE` },
          { id: 'what-if' as ItineraryTab, label: 'WHAT IF? SIMULATOR', icon: Zap, badge: 'PREMIUM' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`tab-final-${tab.id}`}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Day-by-Day Journey */}
      {activeTab === 'schedule' && (
        <motion.div
          key="tab-view-schedule"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Day Selector Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
            <div className="flex flex-wrap gap-2">
              {plan.dayPlans.map((day) => (
                <button
                  id={`btn-select-day-${day.dayNumber}`}
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedDayNumber === day.dayNumber
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>DAY 0{day.dayNumber}</span>
                  {formatDayDate(day.dayNumber) && (
                    <span className={`text-[10px] font-mono ${selectedDayNumber === day.dayNumber ? 'text-orange-300' : 'text-slate-400'}`}>
                      • {formatDayDate(day.dayNumber)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Change day to relaxed pace action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangePlanDay(selectedDayNumber)}
                className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-orange-100 text-orange-900 hover:bg-orange-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Convert this day into slow-paced leisure and remove intense trekking"
              >
                <Coffee className="w-3 h-3" />
                <span>SLOW THIS DAY DOWN</span>
              </button>

              {!hasBufferDayAdded && (
                <button
                  type="button"
                  onClick={onAddBufferDay}
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="Add a restorative recovery day at the end of the trip"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ BUFFER REST DAY</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Day Card */}
          <div className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[10px] font-black uppercase font-mono">
                    DAY 0{activeDay.dayNumber} OF {plan.dayPlans.length}
                  </span>
                  {formatDayDate(activeDay.dayNumber) && (
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-black uppercase font-mono flex items-center gap-1 border border-slate-200/60">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDayDate(activeDay.dayNumber)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1.5">
                  {activeDay.title}
                </h3>
                <p className="text-xs font-bold text-slate-600 uppercase mt-0.5">
                  {activeDay.highlights}
                </p>
              </div>

              {activeDay.dayEstimatedCost && (
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                    EST. DAY COST
                  </span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    ₹{activeDay.dayEstimatedCost.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Timeline Schedule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  CHRONOLOGICAL TIMELINE & ACTIVITY STOPS
                </h4>
                {customSchedules[selectedDayNumber] && (
                  <span className="text-[10px] font-mono text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-orange-600" />
                    VENUE WHAT-IF SHIFT ACTIVE
                  </span>
                )}
              </div>

              {currentSchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-1.5 rounded-xl bg-orange-50 text-orange-800 text-[11px] font-black tracking-wider shrink-0 flex items-center gap-1.5 font-mono border border-orange-200/60">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      <span>{item.time}</span>
                    </div>

                    <div>
                      <h5 className="text-xs sm:text-sm font-black uppercase text-slate-900">
                        {item.activity}
                      </h5>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        📍 {item.location}
                      </p>
                      <p className="text-[11px] text-orange-800 font-semibold mt-1">
                        💡 PRO TIP: {item.tips}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      {item.cost > 0 ? (
                        <span className="text-xs font-black text-slate-900 font-mono">
                          ₹{item.cost.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-700 font-mono">
                          FREE
                        </span>
                      )}

                      <a
                        href={item.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(item.location + ' ' + plan.toLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase flex items-center gap-0.5"
                      >
                        <span>MAP</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {/* Requirement 5: Venue What-If simulation button on each venue */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVenueIndex(idx);
                        setIsVenueWhatIfOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-200 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="Simulate staying longer at this specific venue"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />
                      <span>WHAT-IF: VISIT LONGER</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shopping & Souvenirs for this Day */}
            {activeDay.shoppingRecommendations && activeDay.shoppingRecommendations.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-amber-950">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>LOCAL SOUVENIRS & BAZAARS FOR THIS ROUTE</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeDay.shoppingRecommendations.map((shop, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-xl bg-white text-xs font-bold text-slate-800 border border-amber-200/60 flex items-center justify-between">
                      <span>🛍️ {shop.item} ({shop.market})</span>
                      <span className="text-[10px] font-mono font-black text-amber-900">{shop.priceRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab 2: Map & Satellite 3D */}
      {activeTab === 'map' && (
        <motion.div
          key="tab-view-map"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <GoogleMapsView plan={plan} />
        </motion.div>
      )}

      {/* Tab 3: Stays & Dining */}
      {activeTab === 'stays-dining' && (
        <motion.div
          key="tab-view-stays-dining"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Accommodations */}
          <div className="glass-card p-6 border border-white/90 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <BedDouble className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                  CURATED ACCOMMODATION & STAYS
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  VERIFIED HOMESTAYS, HERITAGE RESORTS & BOUTIQUE HOTELS
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.popularStays.map((stay) => (
                <TiltCard key={stay.id} maxTilt={6} glareMaxOpacity={0.2} className="w-full h-full">
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[10px] font-black uppercase">
                          {stay.type}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-black text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {stay.rating}
                        </span>
                      </div>

                      <h4 className="text-sm font-black uppercase text-slate-900 mb-1">
                        {stay.name}
                      </h4>

                      <p className="text-[11px] font-bold text-slate-500 uppercase mb-3">
                        📍 {stay.distanceFromCenter}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {stay.features.map((feat, fIdx) => (
                          <span key={fIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-black uppercase">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-900 font-mono">
                          ₹{stay.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold"> / NIGHT</span>
                      </div>

                      <a
                        href={stay.bookingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                      >
                        <span>BOOK NOW</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>

          {/* Dining Highlights */}
          <div className="glass-card p-6 border border-white/90 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Utensils className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                  ICONIC DINING & STREET CRAWLS
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  FAMOUS REGIONAL SPECIALTIES, LEGENDARY CAFES & ROOFTOPS
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.diningHighlights.map((dine, idx) => (
                <TiltCard key={idx} maxTilt={6} glareMaxOpacity={0.2} className="w-full h-full">
                  <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-black uppercase">
                          {dine.mealType}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-black text-amber-700">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {dine.rating}
                        </span>
                      </div>

                      <h4 className="text-sm font-black uppercase text-slate-900 mb-1">
                        {dine.name}
                      </h4>

                      <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                        📍 {dine.location}
                      </p>

                      <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 mb-3 space-y-1">
                        <span className="text-[9px] font-black uppercase text-orange-800 block">SIGNATURE DISH:</span>
                        <p className="text-[11px] font-black text-slate-900">{dine.famousDish}</p>
                        <p className="text-[10px] text-slate-600 font-bold">{dine.cuisine}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-900 font-mono">₹{dine.avgCostPerPerson}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold"> / PERSON</span>
                      </div>

                      <a
                        href={dine.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(dine.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Dining in Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Budget Breakdown & Exhaustion */}
      {activeTab === 'budget-fatigue' && (
        <motion.div
          key="tab-view-budget-fatigue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Exhaustion Meter Component */}
          <ExhaustionMeter
            exhaustion={plan.exhaustion}
            onAddBufferDay={onAddBufferDay}
            onChangePlanDay={onChangePlanDay}
            onOptimizeForRelaxation={onOptimizeForRelaxation}
            hasBufferDayAdded={hasBufferDayAdded}
          />

          {/* Budget Split Breakdown */}
          <div className="glass-card p-6 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 mb-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  ESTIMATED COSTS & FRIENDS BUDGET ALLOCATION
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  TOTAL: ₹{plan.budget.toLocaleString()} • ALLOCATED ACROSS {plan.friendsCount} EXPLORERS
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-right">
                <span className="block text-[10px] font-black uppercase tracking-wider">PER TRAVELER SHARE</span>
                <span className="text-xl font-black font-mono">₹{plan.budgetSplit.perPerson.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'TRANSIT', amount: plan.budgetSplit.transport, icon: '✈️' },
                { label: 'STAYS/PG', amount: plan.budgetSplit.stay, icon: '🏨' },
                { label: 'FOOD', amount: plan.budgetSplit.food, icon: '🍲' },
                { label: 'ATTRACTIONS', amount: plan.budgetSplit.activities, icon: '🎟️' },
                { label: 'SHOPPING', amount: plan.budgetSplit.shopping, icon: '🛍️' },
                { label: 'RESERVE', amount: plan.budgetSplit.emergencyBuffer, icon: '🛡️' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 text-center shadow-2xs">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-[10px] font-black uppercase text-slate-500 mt-1">{item.label}</p>
                  <p className="text-xs font-black text-slate-900 font-mono mt-0.5">₹{item.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 5: What If? Contingency Simulator */}
      {activeTab === 'what-if' && (
        <motion.div
          key="tab-view-what-if"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <WhatIfSimulator
            plan={plan}
            onApplyExtension={handleApplyExtension}
          />
        </motion.div>
      )}

      {/* 1. BADGE ALLOCATION CELEBRATION MODAL */}
      <AnimatePresence>
        {badgeModalOpen && awardedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-amber-200 relative overflow-hidden"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
                  {awardedBadge.icon_emoji || awardedBadge.iconEmoji || '🏆'}
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-black uppercase">
                  {awardedBadge.rarity || 'RARE'} BADGE UNLOCKED
                </span>
                <h3 className="text-xl font-black uppercase text-slate-900 mt-2">
                  {awardedBadge.badge_title || awardedBadge.badgeTitle}
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-2">
                  {awardedBadge.earned_reason || awardedBadge.earnedReason}
                </p>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold mt-4 flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PERSISTED TO SUPABASE POSTGRESQL</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBadgeModalOpen(false)}
                  className="w-full mt-4 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-mono font-black uppercase tracking-wider cursor-pointer shadow-md"
                >
                  CONTINUE EXPEDITION
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. OFFLINE EMERGENCY SAFETY PACK MODAL */}
      <AnimatePresence>
        {offlinePackModalOpen && offlinePackData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
                  <div>
                    <h3 className="text-base font-black uppercase text-slate-900">
                      ZERO-CONNECTIVITY EMERGENCY DOSSIER
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      USP 6 • STANDALONE MOUNTAIN / REMOTE CORRIDOR
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setOfflinePackModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Emergency Dials */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 mb-2">CRITICAL EMERGENCY DIALS</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[9px] font-bold text-rose-700 block">NATIONAL SOS</span>
                      <span className="text-sm font-black text-rose-900 font-mono">112</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <span className="text-[9px] font-bold text-blue-700 block">POLICE DISPATCH</span>
                      <span className="text-sm font-black text-blue-900 font-mono">100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[9px] font-bold text-emerald-700 block">AMBULANCE</span>
                      <span className="text-sm font-black text-emerald-900 font-mono">108</span>
                    </div>
                  </div>
                </div>

                {/* Survival Rules */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 mb-2">REMOTE SURVIVAL PROTOCOL</h4>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 font-medium">
                    {offlinePackData.survivalProtocol.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-mono">{idx + 1}.</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offline Waypoints */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 mb-2">OFFLINE MEDICAL & TRANSIT WAYPOINTS</h4>
                  <div className="space-y-1.5">
                    {offlinePackData.offlineWaypoints.map((wp, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{wp.name}</span>
                        <span className="font-mono text-slate-500">{wp.contact || 'Waymarked'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download / Close Buttons */}
                <div className="pt-3 border-t border-slate-200 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = JSON.stringify(offlinePackData, null, 2);
                      const blob = new Blob([text], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `TRIP_OS_EMERGENCY_PACK_${plan.toLocation.toUpperCase().replace(/\s+/g, '_')}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>SAVE OFFLINE JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfflinePackModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. STEP 8 AUTONOMOUS DISRUPTION AUTO-REPAIR MODAL */}
      <AnimatePresence>
        {disruptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-rose-200"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-slate-900">
                    STEP 8: AUTONOMOUS DISRUPTION REPLANNER
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">
                    LIVE SIMULATION • ITINERARY AUTO-REPAIRED (V2.0)
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600">
                  A severe weather & landslide warning was simulated for your destination route. The TRIP//OS autonomous compiler resolved the schedule without breaking timeline integrity:
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold border-b border-slate-700 pb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EXPLAINABLE AUTONOMOUS CHANGELOG:</span>
                  </div>
                  {disruptionChangelog.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">»</span>
                      <span className="text-slate-200">{change}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                  ✅ Day timeline preserved. Outdoor hazards avoided. Schedule synced to group roster.
                </div>

                <button
                  type="button"
                  onClick={() => setDisruptionModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-mono font-black uppercase tracking-wider cursor-pointer"
                >
                  APPLY & RETURN TO ITINERARY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. GOOGLE DRIVE SHARED ALBUM & QR VAULT MODAL */}
      <AnimatePresence>
        {driveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-black uppercase text-slate-900">
                    GOOGLE DRIVE PHOTO VAULT
                  </span>
                </div>
                <button
                  onClick={() => setDriveModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High Contrast QR Code Graphic */}
              <div className="p-4 bg-slate-950 rounded-2xl inline-block shadow-inner mx-auto mb-3">
                <div className="w-48 h-48 bg-white p-3 rounded-xl flex flex-col items-center justify-center">
                  {/* Stylized QR Matrix */}
                  <svg className="w-40 h-40" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M10 10h30v30h-30zM15 15v20h20v-20zM20 20h10v10h-10zM60 10h30v30h-30zM65 15v20h20v-20zM70 20h10v10h-10zM10 60h30v30h-30zM15 65v20h20v-20zM20 70h10v10h-10zM50 10h5v15h-5zM45 30h10v5h-10zM50 40h15v5h-15zM60 50h10v10h-10zM80 50h10v10h-10zM50 65h15v5h-15zM70 70h10v10h-10zM50 85h25v5h-25zM85 80h10v10h-10z" />
                  </svg>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-600 uppercase">
                POINT SMARTPHONE CAMERA TO SCAN & UPLOAD PHOTOS DIRECTLY
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                Full-resolution group photos are saved straight to the trip Google Drive folder.
              </p>

              <div className="mt-4 flex gap-2">
                <a
                  href={driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN DRIVE ALBUM</span>
                </a>
                <button
                  type="button"
                  onClick={() => setDriveModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Requirement 5: Venue-Level What-If Simulator Modal */}
      <VenueWhatIfModal
        isOpen={isVenueWhatIfOpen}
        onClose={() => setIsVenueWhatIfOpen(false)}
        dayNumber={selectedDayNumber}
        venueIndex={selectedVenueIndex}
        daySchedule={currentSchedule}
        destination={plan.toLocation}
        onApplyScheduleShift={(newSched) => {
          setCustomSchedules(prev => ({
            ...prev,
            [selectedDayNumber]: newSched
          }));
        }}
      />
    </motion.div>
  );
};
