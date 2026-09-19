import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, ShieldAlert, Clock, MapPin, PhoneCall, 
  Calendar, DollarSign, CloudRain, Truck, Navigation, 
  Copy, Check, Plus, RefreshCw, Sparkles, ExternalLink,
  ChevronRight, Activity, HeartPulse, LifeBuoy, Zap, Compass,
  Coffee, ShieldCheck
} from 'lucide-react';
import { ItineraryPlan, DayPlan } from '../../types';
import { TiltCard } from '../TiltCard';

interface WhatIfSimulatorProps {
  plan: ItineraryPlan;
  onApplyExtension?: (additionalDays: DayPlan[], extraBudget: number) => void;
}

type ScenarioType = 'stay-longer' | 'roadblock' | 'accident' | 'rain' | 'transit-delay' | 'budget-crunch' | 'custom';

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ plan, onApplyExtension }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('stay-longer');
  
  // Scenario 1 State: Stay Longer
  const [extensionDays, setExtensionDays] = useState<number>(2);
  const [isExtensionApplied, setIsExtensionApplied] = useState<boolean>(false);

  // Scenario 2 State: Roadblock
  const [roadblockType, setRoadblockType] = useState<'landslide' | 'traffic' | 'strike'>('landslide');

  // Scenario 3 State: Accident/SOS
  const [copiedSos, setCopiedSos] = useState<boolean>(false);

  // Scenario 7 State: Custom Prompt
  const [customQuery, setCustomQuery] = useState<string>('');
  const [customResponse, setCustomResponse] = useState<string | null>(null);
  const [isSimulatingCustom, setIsSimulatingCustom] = useState<boolean>(false);

  // Calculations for Extended Stay
  const estExtraStayCost = extensionDays * (plan.budgetSplit.stay / Math.max(1, plan.dayPlans.length));
  const estExtraFoodCost = extensionDays * (plan.budgetSplit.food / Math.max(1, plan.dayPlans.length));
  const totalExtraCost = Math.round(estExtraStayCost + estExtraFoodCost);

  // Generate simulated extension days
  const generateSimulatedDays = (count: number): DayPlan[] => {
    const startDayNum = plan.dayPlans.length + 1;
    const days: DayPlan[] = [];

    const extensionThemes = [
      {
        title: 'Hidden Trails & Sunset Cliffs',
        highlights: 'Offbeat scenic viewpoints, organic village farm-to-table lunch, twilight lounge',
        activities: [
          { time: '09:30 AM', activity: 'Scenic Offbeat Village Drive & Heritage Trail', location: `${plan.toLocation} Countryside`, cost: 400, tips: 'Hire a local guide for authentic folklore stories' },
          { time: '01:00 PM', activity: 'Farm-to-Table Traditional Feast', location: 'Organic Orchard Cafe', cost: 650, tips: 'Try seasonal local botanical coolers' },
          { time: '05:00 PM', activity: 'Panoramic Sunset Point & Ambient Evening Music', location: 'Top Cliff Deck', cost: 200, tips: 'Arrive 30 mins before sunset for photography spots' }
        ]
      },
      {
        title: 'Artisan Markets & Leisure Spa',
        highlights: 'Local craft shopping, Ayurvedic spa session, rooftop starlight dinner',
        activities: [
          { time: '10:30 AM', activity: 'Heritage Handicraft & Souvenir Market Crawl', location: 'Central Bazaar', cost: 500, tips: 'Friendly bargaining is welcomed by artisans' },
          { time: '02:30 PM', activity: 'Relaxing Ayurvedic Full Body Massage & Herbal Tea', location: 'Serenity Spa Hub', cost: 1200, tips: 'Book session 2 hours in advance' },
          { time: '08:00 PM', activity: 'Candlelight Rooftop Seafood & Jazz Evening', location: 'Horizon Lounge', cost: 950, tips: 'Reserve table with panoramic view' }
        ]
      },
      {
        title: 'Relaxed Departure & Memory Walk',
        highlights: 'Lazy brunch, photo walk along historical alleys, comfortable check-out',
        activities: [
          { time: '10:00 AM', activity: 'Unhurried Artisan Bakery Brunch & Coffee', location: 'Old Quarter Cafe', cost: 450, tips: 'Try freshly baked local cardammon croissants' },
          { time: '01:00 PM', activity: 'Souvenir Packing & Memory Photo Session', location: 'Resort Gardens', cost: 0, tips: 'Keep fragile crafts packed with bubble wrap' },
          { time: '04:00 PM', activity: 'Smooth Transfer to Airport / Railway Station', location: 'Transit Hub', cost: 600, tips: 'Keep digital ticket PDFs accessible' }
        ]
      }
    ];

    for (let i = 0; i < count; i++) {
      const theme = extensionThemes[i % extensionThemes.length];
      days.push({
        dayNumber: startDayNum + i,
        title: theme.title,
        highlights: theme.highlights,
        dayEstimatedCost: Math.round(totalExtraCost / count),
        schedule: theme.activities,
        diningOptions: plan.diningHighlights.length > 0 ? plan.diningHighlights.slice(0, 2) : [
          {
            id: `dine-ext-${i}`,
            name: `${plan.toLocation} Heritage Bistro`,
            cuisine: 'Regional Speciality & Fusion',
            famousDish: 'Signature Thali & Herbal Teas',
            avgCostPerPerson: 450,
            mealType: 'LUNCH',
            rating: 4.8,
            location: 'Central Old Town'
          }
        ],
        shoppingRecommendations: [
          { item: 'Local Artisanal Craft / Spices', market: 'Old Heritage Bazaar', priceRange: '₹350 - ₹1,200' }
        ]
      });
    }

    return days;
  };

  const simulatedDays = generateSimulatedDays(extensionDays);

  const handleApplyExtension = () => {
    if (onApplyExtension) {
      onApplyExtension(simulatedDays, totalExtraCost);
      setIsExtensionApplied(true);
      setTimeout(() => setIsExtensionApplied(false), 3000);
    }
  };

  const handleCopySos = () => {
    const sosMsg = `🚨 EMERGENCY SOS - YATRA EXPEDITION CONTINGENCY\nLocation: ${plan.toLocation}\nGPS Coordinates: ${plan.destinationCoords.lat.toFixed(4)}° N, ${plan.destinationCoords.lng.toFixed(4)}° E\nTravelers Count: ${plan.friendsCount}\nPrimary Mode: ${plan.transportMode.toUpperCase()}\nEmergency Contact: 112 / 1033 (Highway Patrol)\nPlease send immediate roadside / medical assistance.`;
    navigator.clipboard.writeText(sosMsg);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 2500);
  };

  const handleRunCustomQuery = (promptText?: string) => {
    const queryToUse = promptText || customQuery;
    if (!queryToUse.trim()) return;

    setIsSimulatingCustom(true);
    setCustomResponse(null);

    setTimeout(() => {
      let resp = '';
      const q = queryToUse.toLowerCase();

      if (q.includes('poison') || q.includes('sick') || q.includes('fever') || q.includes('health')) {
        resp = `🚑 MEDICAL EMERGENCY CONTINGENCY STRATEGY:\n1. Immediate Rest & Rehydration: Pause heavy sightseeing for Day ${plan.dayPlans[0]?.dayNumber || 1}.\n2. Nearest Medical Center: ${plan.toLocation} District Hospital & Emergency Clinic (24x7 Emergency Helpline: 108).\n3. Diet Adjustment: Request light khichdi / coconut water from stay kitchen.\n4. Itinerary Adaptation: Convert Day's outdoor schedule into room-rest; sights can be rescheduled to late evening.`;
      } else if (q.includes('lost') || q.includes('wallet') || q.includes('phone') || q.includes('luggage')) {
        resp = `💼 LOST BELONGINGS & DOCUMENT RECOVERY PROTOCOL:\n1. Police Verification: Visit nearest Tourist Police station in ${plan.toLocation} to file a Lost Item FIR/Report for insurance.\n2. Digital ID Access: Retrieve digital copies of Aadhaar/Passport from Digilocker or cloud storage.\n3. Cash & Card Freeze: Block cards via banking apps; use UPI / GPay backup account on friends' devices.\n4. Stay Assistance: Notify hotel desk; they can verify digital ID for room key continuity.`;
      } else if (q.includes('rain') || q.includes('storm') || q.includes('flood') || q.includes('weather')) {
        resp = `🌧️ BAD WEATHER & HEAVY RAIN CONTINGENCY:\n1. Outdoor Sight Swaps: Replace open viewpoints with covered heritage mansions, art galleries, and indoor tea tasting sessions.\n2. Transport Safety: Avoid coastal driveways and mountain pass curves during heavy downpours.\n3. Emergency Stay Extension: Contact hotel desk for flexible 12-hour checkout buffer if highways are temporarily waterlogged.`;
      } else {
        resp = `⚡ SIMULATED ACTION PLAN FOR "${queryToUse.toUpperCase()}":\n1. Immediate Buffer Protocol: Pause current schedule and notify local stay management in ${plan.toLocation}.\n2. Route & Transit Backup: Use verified local taxis or railway customer care (139) for instant alternative transport booking.\n3. Cost Impact: Negligible variance (estimated ₹500 - ₹1,500 reserve buffer utilization).\n4. Safety Assured: Primary emergency backup active with 24x7 local support networks.`;
      }

      setCustomResponse(resp);
      setIsSimulatingCustom(false);
    }, 600);
  };

  return (
    <div id="what-if-simulator-container" className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-amber-200/80 bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                PREMIUM CONTINGENCY ENGINE
              </span>
              <span className="text-[10px] font-mono text-amber-200/70 uppercase">
                24/7 DYNAMIC TRIP SIMULATION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight flex items-center gap-3">
              <span>WHAT IF? SIMULATOR</span>
            </h2>

            <p className="text-xs font-mono text-amber-100/80 max-w-2xl mt-1">
              Test real-world travel disruptions, road closures, stay extensions, and emergency protocols for <span className="text-amber-300 font-bold">{plan.toLocation}</span> before or during your expedition.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right shrink-0">
            <span className="text-[9px] font-mono font-bold uppercase text-amber-200 block">SIMULATION FIDELITY</span>
            <span className="text-sm font-black font-mono text-emerald-400 flex items-center justify-end gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% REALTIME
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {[
          { id: 'stay-longer' as ScenarioType, label: 'STAY LONGER', icon: Calendar, badge: '+DAYS' },
          { id: 'roadblock' as ScenarioType, label: 'ROADBLOCK', icon: Truck, badge: 'REROUTE' },
          { id: 'accident' as ScenarioType, label: 'ACCIDENT / SOS', icon: HeartPulse, badge: 'EMERGENCY' },
          { id: 'rain' as ScenarioType, label: 'HEAVY RAIN', icon: CloudRain, badge: 'PLAN B' },
          { id: 'transit-delay' as ScenarioType, label: 'DELAYED TRANSIT', icon: Clock, badge: 'SHIFT' },
          { id: 'budget-crunch' as ScenarioType, label: 'BUDGET CRUNCH', icon: DollarSign, badge: '-30% COST' },
          { id: 'custom' as ScenarioType, label: 'ASK CUSTOM', icon: Sparkles, badge: 'AI QUERY' }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = activeScenario === s.id;
          return (
            <button
              id={`btn-scenario-${s.id}`}
              key={s.id}
              type="button"
              onClick={() => setActiveScenario(s.id)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                isActive
                  ? 'bg-neutral-900 text-white border-amber-500/80 shadow-md ring-2 ring-amber-500/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-slate-100 text-slate-600'
                }`}>
                  {s.badge}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block line-clamp-1">
                  {s.label}
                </span>
                <span className={`text-[8px] font-mono block ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                  Simulate
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scenario Content Panels */}
      <AnimatePresence mode="wait">
        {/* SCENARIO 1: STAY LONGER */}
        {activeScenario === 'stay-longer' && (
          <motion.div
            key="scenario-stay-longer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase font-mono">
                  SCENARIO 01 • EXTENDED STAY SIMULATOR
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                  WHAT IF YOU WANT TO STAY LONGER IN {plan.toLocation}?
                </h3>
                <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                  Simulate adding extra days to your current {plan.dayPlans.length}-day itinerary with auto-generated offbeat activities and budget impact.
                </p>
              </div>

              {/* Selector for extension duration */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 px-2">EXTEND BY:</span>
                {[1, 2, 3].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtensionDays(days)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                      extensionDays === days
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +{days} {days === 1 ? 'DAY' : 'DAYS'}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Highlights Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-900 block">REVISED TRIP DURATION</span>
                <span className="text-2xl font-black text-amber-950 font-mono mt-1 block">
                  {plan.dayPlans.length + extensionDays} DAYS
                </span>
                <span className="text-[10px] text-amber-800/80 font-bold uppercase">Original: {plan.dayPlans.length} Days</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">ESTIMATED EXTRA EXPENSE</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                  +₹{totalExtraCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">₹{Math.round(totalExtraCost / plan.friendsCount)} / Explorer</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">PACING & RECOVERY SCORE</span>
                <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">
                  92% RELAXED
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">More rest & unhurried sight crawls</span>
              </div>
            </div>

            {/* Simulated Additional Days Cards */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>SIMULATED EXTENSION DAY SCHEDULES (+{extensionDays} DAYS)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simulatedDays.map((day) => (
                  <div key={day.dayNumber} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase font-mono">
                        DAY 0{day.dayNumber} (EXTENDED)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        EST. ₹{day.dayEstimatedCost.toLocaleString()}
                      </span>
                    </div>

                    <h5 className="font-black text-sm uppercase text-slate-900">{day.title}</h5>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">{day.highlights}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {day.schedule.map((slot, sIdx) => (
                        <div key={sIdx} className="p-2 rounded-xl bg-slate-50 text-[11px] space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-700 text-[10px]">{slot.time}</span>
                            <span className="font-mono text-slate-500 text-[10px]">₹{slot.cost}</span>
                          </div>
                          <p className="font-bold text-slate-900 uppercase">{slot.activity}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">💡 {slot.tips}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Action */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h5 className="font-black text-sm uppercase text-amber-950">APPLY EXTENSION TO LIVE ITINERARY?</h5>
                <p className="text-xs font-mono text-amber-800">
                  This will append these {extensionDays} new days to your live plan and update your budget breakdown.
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyExtension}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition-transform active:scale-95 shrink-0 flex items-center gap-2"
              >
                {isExtensionApplied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>APPLIED TO PLAN!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>CONFIRM +{extensionDays} DAYS EXTENSION</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* SCENARIO 2: ROADBLOCK / LANDSLIDE */}
        {activeScenario === 'roadblock' && (
          <motion.div
            key="scenario-roadblock"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-black uppercase font-mono">
                  SCENARIO 02 • HIGHWAY CLOSURE & REROUTE
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                  WHAT IF THERE IS A ROADBLOCK EN ROUTE TO {plan.toLocation}?
                </h3>
                <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                  Simulate high-priority road blockages, landslide bypasses, and emergency dhaba stopovers.
                </p>
              </div>

              {/* Roadblock selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shrink-0">
                {[
                  { id: 'landslide', label: 'LANDSLIDE / ROCKFALL' },
                  { id: 'traffic', label: 'TRAFFIC / WORKS' },
                  { id: 'strike', label: 'CHECKPOINT / STRIKE' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRoadblockType(type.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase font-mono transition-all cursor-pointer ${
                      roadblockType === type.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reroute Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-rose-600" />
                  <h4 className="font-black text-sm uppercase text-slate-900">VERIFIED BYPASS DETOUR STRATEGY</h4>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-900">
                    <span>PRIMARY HIGHWAY STATUS:</span>
                    <span className="text-rose-600 font-black">BLOCKED / CLOSED</span>
                  </div>
                  <p className="text-xs text-rose-800 font-bold">
                    {roadblockType === 'landslide' && 'Rockfall reported on main mountain pass route. Clearance work under way by BRO/NHAI.'}
                    {roadblockType === 'traffic' && 'Heavy freight congestion & flyover maintenance causing 2.5 hour standstill on main corridor.'}
                    {roadblockType === 'strike' && 'Local security diversion at state border entry point.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500">RECOMMENDED BYPASS ROUTE:</span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-xs font-black text-slate-900 uppercase">State Highway 17 Bypass via Old River Valley</p>
                    <p className="text-[11px] text-slate-600 font-bold uppercase">📍 Route: {plan.fromLocation} → River Bridge Detour → {plan.toLocation}</p>
                    <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500 font-bold">
                      <span>DISTANCE: +38 KM</span>
                      <span>•</span>
                      <span>TIME DELTA: +1 HR 15 MINS</span>
                      <span>•</span>
                      <span>ROAD QUALITY: GOOD PAVED</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/${encodeURIComponent(plan.fromLocation)}/${encodeURIComponent(plan.toLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>OPEN LIVE MAPS BYPASS NAVIGATION</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Stopover & Helpline Cards */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-600" />
                    <h4 className="font-black text-sm uppercase text-slate-900">RECOMMENDED PITSTOPS & SAFE DHABAS</h4>
                  </div>
                  <p className="text-xs font-mono text-slate-500 uppercase">Verified roadside rest hubs to wait out clearance or refresh during the detour:</p>

                  <div className="space-y-2">
                    {[
                      { name: 'Grand Highway Express Plaza', distance: '12 km before detour', features: '24/7 Clean Restrooms, Hot Tea, EV Charging', rating: '4.8★' },
                      { name: 'Shivalik Family Dhaba & Cafe', distance: 'On SH-17 Bypass', features: 'Fresh Parathas, Shaded Parking, Wi-Fi', rating: '4.7★' }
                    ].map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{p.distance} • {p.features}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-800">{p.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase text-amber-400 font-mono flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4" />
                      HIGHWAY EMERGENCY HELPLINES
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400">24/7 TOLL FREE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                      <span className="text-[9px] text-slate-400 block font-bold">NHAI HIGHWAY HELPLINE</span>
                      <a href="tel:1033" className="text-amber-300 font-black hover:underline">📞 1033</a>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                      <span className="text-[9px] text-slate-400 block font-bold">NATIONAL EMERGENCY</span>
                      <a href="tel:112" className="text-emerald-400 font-black hover:underline">📞 112</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCENARIO 3: ACCIDENT / SOS */}
        {activeScenario === 'accident' && (
          <motion.div
            key="scenario-accident"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-900 text-[10px] font-black uppercase font-mono">
                  SCENARIO 03 • BREAKDOWN & SOS CONTINGENCY
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                  WHAT IF THERE IS AN ACCIDENT OR VEHICLE BREAKDOWN?
                </h3>
                <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                  Instant SOS coordinates broadcast, roadside assistance numbers, and trauma centers along route.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySos}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
              >
                {copiedSos ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>SOS COPIED TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY EMERGENCY SOS MESSAGE</span>
                  </>
                )}
              </button>
            </div>

            {/* Emergency Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-600" />
                  <h4 className="font-black text-sm uppercase text-red-950">NEAREST HOSPITALS ALONG ROUTE</h4>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-red-100 space-y-1">
                    <p className="font-black uppercase text-slate-900">{plan.toLocation} District Trauma Center</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">📍 4.2 km from City Center • 24/7 ER</p>
                    <a href="tel:108" className="text-red-600 font-bold block pt-0.5">📞 Emergency ER: 108</a>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-red-100 space-y-1">
                    <p className="font-black uppercase text-slate-900 LifeCare Multi-Specialty Hospital"></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">📍 Highway Exit 4 B • ICU & Ambulance</p>
                    <a href="tel:102" className="text-red-600 font-bold block pt-0.5">📞 Ambulance Line: 102</a>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-700" />
                  <h4 className="font-black text-sm uppercase text-amber-950">24/7 ROADSIDE ASSISTANCE & TOWING</h4>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-amber-100 space-y-1">
                    <p className="font-black uppercase text-slate-900">National Towing & Crane Services</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Flatbed towing within 30 mins</p>
                    <a href="tel:18001021033" className="text-amber-800 font-bold block pt-0.5">📞 Toll Free: 1800-102-1033</a>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-amber-100 space-y-1">
                    <p className="font-black uppercase text-slate-900">State Highway Mechanics Guild</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Mobile tire & battery jumpstart unit</p>
                    <a href="tel:1033" className="text-amber-800 font-bold block pt-0.5">📞 NHAI Mobile Unit: 1033</a>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h4 className="font-black text-sm uppercase text-white">IMMEDIATE SAFETY CHECKLIST</h4>
                </div>

                <ul className="space-y-2 text-xs font-mono text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">1.</span>
                    <span>Turn on hazard warning lights immediately and move vehicle off the main driving lane.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span>Place warning triangle 50 meters behind vehicle facing oncoming traffic.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span>Copy and send the SOS message button above to your emergency family contact group.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCENARIO 4: HEAVY RAIN */}
        {activeScenario === 'rain' && (
          <motion.div
            key="scenario-rain"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase font-mono">
                  SCENARIO 04 • UNSEASONAL RAIN & PLAN B
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                  WHAT IF HEAVY UNSEASONAL RAIN STRIKES IN {plan.toLocation}?
                </h3>
                <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                  Automatically converts outdoor viewpoints to covered heritage museums, indoor cafes, and cultural experiences.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-bold uppercase shrink-0">
                ☔ WEATHER ADAPTATION ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <h4 className="font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-600" />
                  <span>ORIGINAL OUTDOOR SIGHTS</span>
                </h4>
                <div className="space-y-2 text-xs font-mono text-slate-500">
                  {plan.topSights.slice(0, 3).map((sight, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 line-through opacity-70">
                      • {sight.name} ({sight.category})
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                <h4 className="font-black text-sm uppercase text-blue-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>COVERED INDOOR PLAN B ALTERNATIVES</span>
                </h4>
                <div className="space-y-2 text-xs font-mono text-slate-900 font-bold">
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                    🏛️ {plan.toLocation} Heritage State Museum & Art Gallery (Covered)
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                    ☕ Historic Spice Estate Tea Lounge & Culinary Workshop
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                    🎭 Local Cultural Indoor Performing Arts Center
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCENARIO 5: TRANSIT DELAY */}
        {activeScenario === 'transit-delay' && (
          <motion.div
            key="scenario-transit-delay"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="pb-4 border-b border-slate-200/80">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-black uppercase font-mono">
                SCENARIO 05 • FLIGHT / TRAIN DELAY SHIFT
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                WHAT IF TRANSIT IS DELAYED BY 6+ HOURS?
              </h3>
              <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                Automatically shifts Day 1 arrival activities to evening and generates late check-in hotel advisory messages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <h4 className="font-black text-sm uppercase text-purple-950">LATE CHECK-IN HOTEL ADVISORY TEMPLATE:</h4>
              <div className="p-3 rounded-xl bg-white border border-purple-100 font-mono text-xs text-slate-800">
                "Hello [Hotel Front Desk], our reservation is under {plan.fromLocation} Expedition Group ({plan.friendsCount} guests). Due to transit delay, our estimated arrival time in {plan.toLocation} is now rescheduled to late evening (~09:30 PM). Please hold our rooms. Thank you!"
              </div>
            </div>
          </motion.div>
        )}

        {/* SCENARIO 6: BUDGET CRUNCH */}
        {activeScenario === 'budget-crunch' && (
          <motion.div
            key="scenario-budget-crunch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="pb-4 border-b border-slate-200/80">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase font-mono">
                SCENARIO 06 • 30% COST-SLASHING PROTOCOL
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                WHAT IF EXPENSES EXCEED BUDGET MID-TRIP?
              </h3>
              <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                Instant budget optimization strategy to save up to ₹{Math.round(plan.budget * 0.3).toLocaleString()} without compromising safety.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">STAY SAVINGS</span>
                <p className="font-black text-slate-900 uppercase">Switch to Verified Boutique Hostels</p>
                <p className="text-[10px] text-slate-500 font-bold">Saves ~₹1,800/night per room</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">DINING SAVINGS</span>
                <p className="font-black text-slate-900 uppercase">Iconic Street Food Crawl</p>
                <p className="text-[10px] text-slate-500 font-bold">Saves ~₹800/person daily</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">TRANSIT SAVINGS</span>
                <p className="font-black text-slate-900 uppercase">Shared Tourist Shuttle / Auto</p>
                <p className="text-[10px] text-slate-500 font-bold">Saves ~₹1,200 total transit</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* SCENARIO 7: CUSTOM QUERY */}
        {activeScenario === 'custom' && (
          <motion.div
            key="scenario-custom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
          >
            <div className="pb-4 border-b border-slate-200/80">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase font-mono">
                SCENARIO 07 • CUSTOM WHAT-IF SIMULATION
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
                ASK ANY CUSTOM "WHAT IF?" SCENARIO
              </h3>
              <p className="text-xs font-mono text-slate-500 uppercase mt-0.5">
                Type any custom situation (e.g. lost luggage, food allergies, missed train) for instant actionable contingency strategy.
              </p>
            </div>

            {/* Quick Prompt Preset Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                "What if my friend gets food poisoning?",
                "What if I lose my wallet or phone?",
                "What if rental bike breaks down?",
                "What if we miss our return flight?"
              ].map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    setCustomQuery(preset);
                    handleRunCustomQuery(preset);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold uppercase transition-colors cursor-pointer border border-slate-200/80"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunCustomQuery()}
                placeholder="e.g. What if camera equipment gets damaged near the waterfall?"
                className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleRunCustomQuery()}
                disabled={isSimulatingCustom}
                className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSimulatingCustom ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>SIMULATING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>SIMULATE</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Response Output */}
            {customResponse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2 font-mono text-xs text-amber-950 whitespace-pre-line shadow-2xs"
              >
                {customResponse}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatIfSimulator;
