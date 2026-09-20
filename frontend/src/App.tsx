import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, Sparkles, LogOut, Compass, MapPin, Calendar, 
  Users, Bookmark, ArrowRight, ShieldCheck, Heart, Plus 
} from 'lucide-react';

import { 
  DestinationCard, ItineraryPlan, ReviewItem, UserProfile, 
  WeatherType, DigitalDocument, PersonalExpense, DisasterAlert 
} from './types';
import { 
  DEFAULT_USER_PROFILE, INITIAL_SAVED_PLANS, POPULAR_DESTINATIONS, 
  WEATHER_CONFIGS, INITIAL_DISASTER_ALERTS 
} from './data/travelData';
import { detectWeatherType } from './utils/planGenerator';

import { ParallaxMapLogin } from './components/ParallaxMapLogin';
import { LiquidNavbar, NavTab } from './components/LiquidNavbar';
import { WeatherMoodBadge } from './components/WeatherMoodBadge';
import { LiveAlertsStrip } from './components/LiveAlertsStrip';
import { InfiniteBlackInfoStrip } from './components/InfiniteBlackInfoStrip';
import { InteractiveMap } from './components/InteractiveMap';
import { DestinationCarousel } from './components/DestinationCarousel';
import { PlansPage } from './components/PlansPage';
import { SavesPage } from './components/SavesPage';
import { ProfilePage } from './components/ProfilePage';
import { LiveDynamicParallaxBackground } from './components/LiveDynamicParallaxBackground';
import { TiltCard } from './components/TiltCard';
import { MagneticButton } from './components/MagneticButton';
import { DisasterAlertModal } from './components/DisasterAlertModal';
import { DisasterAlertsFeed } from './components/DisasterAlertsFeed';
import { OpeningSplash } from './components/OpeningSplash';
import { MultilingualGreeting } from './components/MultilingualGreeting';
import { NotificationsModal } from './components/NotificationsModal';
import { FriendsPage } from './components/FriendsPage';
import { AppNotification } from './types';
import { removeStoredToken, createTripApi, fetchUserTripsApi, savePreferencesApi, fetchFriendsApi } from './services/api';

const PAGE_HEADER_CONFIGS: Record<NavTab, { title: string; subtitle: string }> = {
  home: {
    title: 'GLOBAL TRAVEL SYSTEM',
    subtitle: 'PAN-GLOBAL EXPEDITION ENGINE • REALTIME TELEMETRY',
  },
  plans: {
    title: 'EXPEDITION PLANNER STUDIO',
    subtitle: 'STEP-BY-STEP VOYAGE ARCHITECT • MULTI-MODAL ROUTING',
  },
  saves: {
    title: 'SAVED EXPEDITIONS VAULT',
    subtitle: 'BOOKMARKED JOURNEYS • OFFLINE EXPEDITION DOSSIERS',
  },
  friends: {
    title: 'SQUAD & FRIENDS ROSTER',
    subtitle: 'EXPEDITION COMPANIONS • DIRECT INVITATION NETWORK',
  },
  profile: {
    title: 'EXPLORER IDENTITY & VAULT',
    subtitle: 'GLOBAL COLLECTIBLES & SPEND INTELLIGENCE',
  },
};

export default function App() {
  // Opening splash sequence state
  const [isSplashDone, setIsSplashDone] = useState(false);

  // Purge legacy demo sessions and mock data from previous runs
  const SESSION_KEY = 'tripos_user_session_v2';
  try {
    localStorage.removeItem('tripos_user_session');
  } catch {}

  // Authentication state: check clean v2 session in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name !== 'SPARSH RAJ') {
          return true;
        }
      }
    } catch {}
    return false;
  });

  // Core navigation tab state ('home' | 'plans' | 'saves' | 'profile')
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Dynamic weather theme state ('rain' | 'nature' | 'snow' | 'sunny')
  const [weatherTheme, setWeatherTheme] = useState<WeatherType>('sunny');

  // Automatic interval for weather condition rotation
  useEffect(() => {
    const weatherList: WeatherType[] = ['sunny', 'rain', 'nature', 'snow'];
    const timer = setInterval(() => {
      setWeatherTheme((prev) => {
        const nextIdx = (weatherList.indexOf(prev) + 1) % weatherList.length;
        return weatherList[nextIdx];
      });
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  // User Profile state: hydrate from clean session or fresh explorer
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name !== 'SPARSH RAJ') {
          return {
            ...DEFAULT_USER_PROFILE,
            ...parsed,
            // Strip out any legacy mock documents (doc-1) or expenses (exp-1)
            documents: Array.isArray(parsed.documents) ? parsed.documents.filter((d: any) => !d.id?.startsWith('doc-')) : [],
            expenses: Array.isArray(parsed.expenses) ? parsed.expenses.filter((e: any) => !e.id?.startsWith('exp-')) : []
          };
        }
      }
    } catch (e) {
      console.warn('Error reading saved session', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  // Destinations & Reviews state
  const [destinations, setDestinations] = useState<DestinationCard[]>(POPULAR_DESTINATIONS);

  // Plans state
  const [savedPlans, setSavedPlans] = useState<ItineraryPlan[]>(INITIAL_SAVED_PLANS);
  const [currentPlan, setCurrentPlan] = useState<ItineraryPlan | null>(null);
  const [plannerDestination, setPlannerDestination] = useState<string>('');
  const [plannerKey, setPlannerKey] = useState<number>(0);

  // Synchronize real saved trips directly from backend PostgreSQL database
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUserTripsApi().then((trips) => {
      if (Array.isArray(trips) && trips.length > 0) {
        const mappedPlans: ItineraryPlan[] = trips.map((t: any) => ({
          id: `trip-${t.id}`,
          title: t.name,
          destination: t.end_location,
          finalDestination: t.end_location,
          preferredDestination: t.end_location,
          fromLocation: t.start_location || 'Current City',
          toLocation: t.end_location,
          transportMode: t.transport_mode || 'flight',
          dates: `${t.start_date} to ${t.end_date}`,
          startDate: t.start_date,
          endDate: t.end_date,
          dailyStartTime: t.start_time ? String(t.start_time).slice(0, 5) : '09:00',
          budget: Number(t.budget) || 25000,
          friendsCount: Number(t.member_count) || 1,
          travelType: 'SOLO_OR_GROUP',
          weatherType: detectWeatherType(t.end_location),
          isSaved: true,
          inviteCode: t.invite_code,
          budgetSplit: {
            totalBudget: Number(t.budget) || 25000,
            perPerson: Math.round((Number(t.budget) || 25000) / (Number(t.member_count) || 1)),
            stayTotal: Math.round((Number(t.budget) || 25000) * 0.4),
            foodTotal: Math.round((Number(t.budget) || 25000) * 0.3),
            activitiesTotal: Math.round((Number(t.budget) || 25000) * 0.2),
            contingency: Math.round((Number(t.budget) || 25000) * 0.1)
          },
          exhaustion: {
            score: 45,
            level: 'OPTIMAL',
            color: '#10b981',
            details: 'Calculated from backend telemetry'
          },
          dayPlans: [],
          schedule: [],
          members: []
        }));

        setSavedPlans((prev) => {
          const combined = [...prev];
          mappedPlans.forEach((mp) => {
            if (!combined.some((p) => p.id === mp.id)) {
              combined.push(mp);
            }
          });
          return combined;
        });
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  // Natural Disaster & Hazard Alerts State
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>(INITIAL_DISASTER_ALERTS);
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState<boolean>(false);

  const handleNewDisasterAlert = (newAlert: DisasterAlert) => {
    setDisasterAlerts((prev) => [newAlert, ...prev]);
  };

  const handleUpvoteAlert = (alertId: string) => {
    setDisasterAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, upvotesCount: a.upvotesCount + 1 } : a))
    );
  };

  // Requirement 1 & 3: Mission telemetry notifications state - fresh and clean
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pendingFriendsCount, setPendingFriendsCount] = useState<number>(0);

  // Sync pending friend requests
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFriendsApi().then((data) => {
      if (data && Array.isArray(data.incomingRequests)) {
        setPendingFriendsCount(data.incomingRequests.length);
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleStartNewPlan = () => {
    setPlannerDestination('');
    setCurrentPlan(null);
    setPlannerKey((k) => k + 1);
    setCurrentTab('plans');
  };

  // Weather configuration mapping
  const activeWeatherConfig = WEATHER_CONFIGS[weatherTheme];

  const handleLogin = (email: string, name: string) => {
    const cleanName = (name.trim() || 'EXPLORER').toUpperCase();
    const cleanEmail = email.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@tripos.world`;
    const updatedUser: UserProfile = {
      ...user,
      name: cleanName,
      email: cleanEmail,
      documents: [],
      expenses: []
    };
    setUser(updatedUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Error saving session', e);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('tripos_user_session');
      removeStoredToken();
    } catch (e) {
      console.warn('Error clearing session', e);
    }
    setIsAuthenticated(false);
  };

  const handleSelectDestination = (dest: DestinationCard) => {
    // Dynamically adjust weather to the clicked destination
    setWeatherTheme(dest.weatherType);
  };

  const handlePlanDestination = (dest: DestinationCard) => {
    setPlannerDestination(dest.name);
    setWeatherTheme(dest.weatherType);
    setCurrentTab('plans');
  };

  const handleAddReview = (destId: string, review: ReviewItem) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id === destId) {
          const newReviews = [review, ...d.reviews];
          const newRating =
            (d.rating * d.reviewCount + review.rating) / (d.reviewCount + 1);
          return {
            ...d,
            reviews: newReviews,
            reviewCount: d.reviewCount + 1,
            rating: Math.round(newRating * 10) / 10
          };
        }
        return d;
      })
    );
  };

  const handlePlanCreated = (plan: ItineraryPlan) => {
    setCurrentPlan(plan);
    setWeatherTheme(plan.weatherType);
  };

  const handleSavePlan = async (plan: ItineraryPlan) => {
    const updatedPlan = { ...plan, isSaved: true };
    setCurrentPlan(updatedPlan);

    // Optimistically update local UI state immediately
    setSavedPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      if (exists) {
        return prev.map((p) => (p.id === plan.id ? updatedPlan : p));
      }
      return [updatedPlan, ...prev];
    });

    // Persist real trip data directly to PostgreSQL database
    try {
      const backendTrip = await createTripApi({
        name: plan.title,
        startDate: plan.startDate,
        startTime: plan.dailyStartTime,
        startLocation: plan.startLocation || 'Current City',
        endDate: plan.endDate,
        endTime: '20:00',
        endLocation: plan.finalDestination || plan.destination,
        budget: plan.budget,
        transportMode: plan.transportMode
      });

      if (backendTrip && backendTrip.id) {
        const syncedPlan: ItineraryPlan = {
          ...updatedPlan,
          id: `trip-${backendTrip.id}`,
          inviteCode: backendTrip.invite_code || plan.inviteCode
        };
        setCurrentPlan(syncedPlan);
        setSavedPlans((prev) => prev.map((p) => (p.id === plan.id ? syncedPlan : p)));

        // Synchronize GroupDNA vibe scores if present
        if (plan.groupDNA) {
          savePreferencesApi(backendTrip.id, {
            adventure: plan.groupDNA.adventure,
            nature: plan.groupDNA.nature,
            food: plan.groupDNA.food,
            photography: plan.groupDNA.photography,
            nightlife: plan.groupDNA.nightlife,
            relaxation: plan.groupDNA.relaxation,
            budgetSensitivity: plan.groupDNA.budgetSensitivity,
            walkingTolerance: plan.groupDNA.walkingTolerance,
            crowdTolerance: plan.groupDNA.crowdTolerance
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Backend trip sync notice:', e);
    }
  };

  const handleDeleteSavedPlan = (planId: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
    if (currentPlan?.id === planId) {
      setCurrentPlan((prev) => (prev ? { ...prev, isSaved: false } : null));
    }
  };

  const handleAddDocument = (doc: DigitalDocument) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        documents: [doc, ...prev.documents]
      };
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAddExpense = (exp: PersonalExpense) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        expenses: [exp, ...prev.expenses]
      };
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // If not logged in, render the Parallax Map Login Page
  if (!isAuthenticated) {
    return (
      <ParallaxMapLogin
        onLogin={handleLogin}
        defaultEmail=""
      />
    );
  }

  return (
    <div
      id="app-root-container"
      className={`min-h-screen w-full transition-colors duration-700 select-none bg-gradient-to-br ${activeWeatherConfig.bgGradient} text-slate-900 flex flex-col`}
    >
      {/* Website Opening Splash Load Animation */}
      {!isSplashDone && <OpeningSplash onComplete={() => setIsSplashDone(true)} />}

      {/* 0. Top Infinite Dynamic Info Strip with Black Background & White Text */}
      <InfiniteBlackInfoStrip onOpenDisasterModal={() => setIsDisasterModalOpen(true)} />

      {/* Live Dynamic Parallax Background (Powered by Anime.js & Multi-Plane Depth) */}
      <LiveDynamicParallaxBackground weather={weatherTheme} />

      {/* Main App Layout: PC Sidebar Navigation on Left, Content on Right */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Navigation Component: PC Side Panel + Mobile Liquid Bottom Bar */}
        <LiquidNavbar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          user={user}
          savedCount={savedPlans.length}
          unreadNotificationsCount={notifications.filter(n => !n.read).length}
          pendingFriendsCount={pendingFriendsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Primary Main Content Area (offset on desktop for PC side panel) */}
        <main className="flex-1 min-w-0 lg:ml-72 p-3 sm:p-6 md:p-8 pb-24 lg:pb-8">
          {/* Top Floating App Bar: International Editorial Masthead */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-neutral-200/60">
            {/* Left Title / Branding */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900 p-1 flex items-center justify-center text-white shadow-lg border border-slate-800 shrink-0 overflow-hidden ring-1 ring-slate-200">
                <img src="/logo.png" alt="TRIP OS Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h1 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight truncate">
                        {PAGE_HEADER_CONFIGS[currentTab]?.title || 'GLOBAL TRAVEL SYSTEM'}
                      </h1>
                      <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-white text-[9px] font-mono-telemetry font-black uppercase tracking-wider border border-white/20 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        GLOBAL EDITION
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono-telemetry text-neutral-500 uppercase truncate">
                      <span>{PAGE_HEADER_CONFIGS[currentTab]?.subtitle}</span>
                      <span>•</span>
                      <span className="truncate">{activeWeatherConfig.description}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Controls: Weather Mood Pill, Profile Pill & Sign Out Button */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <WeatherMoodBadge
                currentWeather={weatherTheme}
                onSelectWeather={(w) => setWeatherTheme(w)}
              />

              <button
                type="button"
                onClick={() => setCurrentTab('profile')}
                title="Open Explorer Profile & Vault"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all cursor-pointer border shadow-xs ${
                  currentTab === 'profile'
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900'
                    : 'glass-pill bg-white/80 hover:bg-white text-slate-800 border-white/80'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 font-mono text-[9px] font-black flex items-center justify-center shrink-0">
                  {user.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) : 'EX'}
                </div>
                <span className="hidden md:inline truncate">{user.name}</span>
              </button>

              <MagneticButton
                onClick={handleLogout}
                title="Switch Explorer / Logout"
                className="p-2 sm:p-2.5 rounded-full glass-pill hover:bg-white text-slate-500 hover:text-red-600 shadow-xs active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </MagneticButton>
            </div>
          </header>

          {/* PAGE ROUTING WITH PARALLAX FLOW BOUNCE TRANSITIONS */}
          <AnimatePresence mode="wait">
            {currentTab === 'home' && (
              <motion.div
                key="tab-home"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                className="space-y-6"
              >
                {/* 1. Personal Dashboard Hero Card with 3D Tilt & Specular Glare */}
                <TiltCard maxTilt={4} glareMaxOpacity={0.25} className="w-full">
                  <div className="glass-card p-4 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-black text-white text-[9px] font-mono-telemetry font-black uppercase tracking-widest">
                          EXPEDITION ARCHIVE
                        </span>
                        <span className="text-[10px] font-mono-telemetry text-neutral-500 font-bold uppercase tracking-wider">
                          LAT 20°35'N • LON 78°57'E
                        </span>
                      </div>
                      <div className="mb-2">
                        <MultilingualGreeting userName={user.name} />
                      </div>
                      <p className="font-editorial text-xs sm:text-sm font-semibold text-neutral-600 uppercase mt-1 max-w-xl">
                        Architect and orchestrate bespoke journeys across the Indian subcontinent with high-precision satellite telemetry, curated heritage routes, and live budget splits.
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                        <MagneticButton
                          id="btn-hero-circular-create"
                          onClick={handleStartNewPlan}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[11px] sm:text-xs font-mono font-bold uppercase border border-orange-400/60 shadow-xs active:scale-95 cursor-pointer flex items-center gap-2"
                          title="Start building a fresh custom trip plan"
                        >
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>CREATE PLAN</span>
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => {
                            setPlannerDestination('Manali & Solang');
                            setCurrentTab('plans');
                          }}
                          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-neutral-900 text-white text-[11px] sm:text-xs font-mono font-bold uppercase border border-neutral-700 hover:bg-black shadow-xs active:scale-95 cursor-pointer"
                        >
                          ❄️ MANALI HIKES
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => {
                            setPlannerDestination('Goa Coastline');
                            setCurrentTab('plans');
                          }}
                          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/90 text-neutral-900 text-[11px] sm:text-xs font-mono font-bold uppercase border border-neutral-300 hover:bg-white shadow-xs active:scale-95 cursor-pointer"
                        >
                          🌊 GOA COASTAL
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => {
                            setPlannerDestination('Jaipur Royal City');
                            setCurrentTab('plans');
                          }}
                          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/90 text-neutral-900 text-[11px] sm:text-xs font-mono font-bold uppercase border border-neutral-300 hover:bg-white shadow-xs active:scale-95 cursor-pointer"
                        >
                          👑 JAIPUR FORTS
                        </MagneticButton>
                      </div>
                    </div>

                    {/* Active Itinerary Snippet with Tilt */}
                    {currentPlan ? (
                      <TiltCard maxTilt={6} glareMaxOpacity={0.35} className="w-full md:w-76 shrink-0">
                        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono-telemetry font-black uppercase text-orange-700 tracking-wider">
                              PINNED EXPEDITION
                            </span>
                            <span 
                              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black text-white"
                              style={{ backgroundColor: currentPlan.exhaustion.color }}
                            >
                              {currentPlan.exhaustion.level}
                            </span>
                          </div>
                          <h4 className="font-display text-sm font-black uppercase text-neutral-900 mb-1 truncate">
                            {currentPlan.title}
                          </h4>
                          <p className="text-[11px] font-mono text-neutral-500 uppercase mb-3">
                            BUDGET: ₹{currentPlan.budget.toLocaleString()} • {currentPlan.friendsCount} EXPLORERS
                          </p>
                          <MagneticButton
                            onClick={() => setCurrentTab('plans')}
                            className="w-full py-2.5 glass-button text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs hover:shadow-md cursor-pointer"
                          >
                            <span>VIEW FULL ITINERARY</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </MagneticButton>
                        </div>
                      </TiltCard>
                    ) : (
                      <TiltCard maxTilt={6} glareMaxOpacity={0.35} className="w-full md:w-76 shrink-0">
                        <div className="p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-sm flex flex-col items-center text-center">
                          <button
                            id="btn-hero-circular-create-empty"
                            type="button"
                            onClick={handleStartNewPlan}
                            className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 border-2 border-dashed border-orange-400 flex items-center justify-center transition-all cursor-pointer mb-3 group"
                          >
                            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform stroke-[2.5]" />
                          </button>
                          <h4 className="font-display text-xs font-black uppercase text-neutral-900 mb-1">
                            START NEW EXPEDITION
                          </h4>
                          <p className="text-[10px] font-mono text-neutral-500 uppercase mb-3">
                            Launch step-by-step route wizard
                          </p>
                          <button
                            type="button"
                            onClick={handleStartNewPlan}
                            className="w-full py-2 rounded-xl bg-neutral-900 text-white text-[10px] font-mono font-bold uppercase hover:bg-black transition-colors cursor-pointer"
                          >
                            + CREATE PLAN
                          </button>
                        </div>
                      </TiltCard>
                    )}
                  </div>
                </TiltCard>

                {/* 2. Thin Live Strip of Informations (sales, alerts, media) */}
                <LiveAlertsStrip onOpenDisasterModal={() => setIsDisasterModalOpen(true)} />

                {/* 3. Interactive Bharat Exploration Map (Draggable Pins) */}
                <InteractiveMap
                  destinations={destinations}
                  onSelectDestination={handleSelectDestination}
                  onQuickPlan={handlePlanDestination}
                />

                {/* 4. Carousel of Popular Tourist Destinations of India */}
                <DestinationCarousel
                  destinations={destinations}
                  onPlanDestination={handlePlanDestination}
                  onAddReview={handleAddReview}
                />

                {/* 5. Live Disaster & Hazard Radar Feed */}
                <DisasterAlertsFeed
                  alerts={disasterAlerts}
                  onOpenReportModal={() => setIsDisasterModalOpen(true)}
                  onUpvoteAlert={handleUpvoteAlert}
                />

                {/* 5. Prominent Circular '+' Floating Create Button on Home View */}
                <div className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 z-50">
                  <div className="relative group">
                    <button
                      id="btn-circular-create-plan"
                      type="button"
                      onClick={handleStartNewPlan}
                      aria-label="Create New Itinerary Plan"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-950 hover:bg-black text-white border-2 border-orange-500 shadow-[0_10px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.5)] flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-orange-400/40"
                    >
                      <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400 group-hover:text-white group-hover:rotate-90 transition-transform duration-300 stroke-[2.5]" />
                    </button>
                    
                    {/* Floating Tooltip Tag */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-xl bg-neutral-950/95 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/15 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      <span>CREATE NEW PLAN</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentTab === 'plans' && (
              <motion.div
                key={`tab-plans-${plannerKey}`}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              >
                <PlansPage
                  key={`plans-page-${plannerKey}`}
                  currentPlan={currentPlan}
                  onPlanCreated={handlePlanCreated}
                  onSavePlan={handleSavePlan}
                  initialDestination={plannerDestination}
                  weatherType={weatherTheme}
                  user={user}
                />
              </motion.div>
            )}

            {currentTab === 'saves' && (
              <motion.div
                key="tab-saves"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              >
                <SavesPage
                  savedPlans={savedPlans}
                  onSelectPlan={(plan) => {
                    setCurrentPlan(plan);
                    setWeatherTheme(plan.weatherType);
                    setCurrentTab('plans');
                  }}
                  onDeletePlan={handleDeleteSavedPlan}
                />
              </motion.div>
            )}

            {currentTab === 'friends' && (
              <motion.div
                key="tab-friends"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              >
                <FriendsPage
                  user={user}
                  savedPlans={savedPlans}
                  onSelectTripToPlan={(plan) => {
                    setCurrentPlan(plan);
                    setWeatherTheme(plan.weatherType);
                    setCurrentTab('plans');
                  }}
                  onFriendInviteSent={(tripId, friendName) => {
                    setNotifications(prev => [
                      {
                        id: `notif-${Date.now()}`,
                        type: 'JOIN_REQUEST',
                        title: 'FRIEND INVITED TO EXPEDITION',
                        message: `Directly approved & added ${friendName} to expedition squad.`,
                        timestamp: 'Just now',
                        read: false
                      },
                      ...prev
                    ]);
                  }}
                />
              </motion.div>
            )}

            {currentTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              >
                <ProfilePage
                  user={user}
                  onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
                  onAddDocument={handleAddDocument}
                  onAddExpense={handleAddExpense}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Natural Disaster & Hazard Report Modal */}
      <DisasterAlertModal
        isOpen={isDisasterModalOpen}
        onClose={() => setIsDisasterModalOpen(false)}
        onSubmitAlert={handleNewDisasterAlert}
        defaultReporterName={user.name}
      />

      {/* Requirement 1 & 3: Mission Telemetry Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onApproveMember={(tripId, memberId) => {
          setNotifications(prev => prev.map(n => n.memberId === memberId ? { 
            ...n, 
            read: true, 
            title: 'MEMBER JOIN APPROVED',
            message: 'Member has been approved and added to your expedition roster! GroupDNA calibrated.' 
          } : n));
        }}
        onNavigateToTab={(tab) => setCurrentTab(tab as NavTab)}
      />
    </div>
  );
}

