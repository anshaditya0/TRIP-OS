import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, Bookmark, User, MapPin, Sparkles, Navigation, Bell } from 'lucide-react';
import { UserProfile } from '../types';
import { TiltCard } from './TiltCard';

export type NavTab = 'home' | 'plans' | 'saves' | 'profile';

interface LiquidNavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile;
  savedCount: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const LiquidNavbar: React.FC<LiquidNavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  savedCount,
  unreadNotificationsCount = 3,
  onOpenNotifications,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'HOME', icon: Home, badge: null },
    { id: 'plans' as NavTab, label: 'PLANS', icon: Compass, badge: 'PLANNER' },
    { id: 'saves' as NavTab, label: 'SAVES', icon: Bookmark, badge: savedCount > 0 ? `${savedCount}` : null },
    { id: 'profile' as NavTab, label: user.name.split(' ')[0] || 'PROFILE', icon: User, badge: null },
  ];

  return (
    <>
      {/* PC DESKTOP SIDE PANEL (lg: and above) */}
      <aside className="hidden lg:flex fixed left-0 top-[37px] bottom-0 w-72 flex-col justify-between p-6 z-40 bg-white/75 backdrop-blur-2xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] select-none">
        <div>
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-slate-900 p-1 flex items-center justify-center text-white shadow-sm overflow-hidden ring-1 ring-slate-200">
              <img src="/logo.png" alt="TRIP OS Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 leading-tight uppercase">
                TRIP OS
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                TRAVEL OPERATING SYSTEM
              </p>
            </div>
          </div>

          {/* User Quick Pill (Clickable Profile Switcher) */}
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className={`w-full flex items-center gap-3 p-3 mb-6 rounded-2xl transition-all cursor-pointer text-left ${
              currentTab === 'profile'
                ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900 scale-[1.02]'
                : 'bg-slate-50/80 hover:bg-white backdrop-blur-md border border-slate-200/60 shadow-2xs hover:shadow-xs'
            }`}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-xs"
              />
            ) : (
              <div className={`w-10 h-10 rounded-xl text-amber-400 font-black text-sm flex items-center justify-center ring-2 ring-white shadow-xs ${
                currentTab === 'profile' ? 'bg-slate-800' : 'bg-gradient-to-tr from-slate-900 to-slate-800'
              }`}>
                {user.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) : 'EX'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-black uppercase truncate ${
                  currentTab === 'profile' ? 'text-white' : 'text-slate-900'
                }`}>{user.name}</p>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${
                currentTab === 'profile' ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{user.badge}</span>
              </div>
            </div>
          </button>

          {/* Navigation Links (HOME, PLANS, SAVES, NOTIFICATIONS) */}
          <nav className="space-y-1.5">
            {tabs.filter(t => t.id !== 'profile').map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'text-white font-extrabold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-2xs'
                  }`}
                >
                  {/* Apple Sleek Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSideNavPill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-xl bg-slate-900 text-white -z-10 shadow-md"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}

            {/* Requirement 1 & 3: Sidebar Notifications Button with identical design, typography & theme */}
            <motion.button
              id="sidebar-notifications-btn"
              whileHover={{ x: 6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenNotifications}
              className="relative w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-orange-100/70 text-orange-700">
                  <Bell className="w-4 h-4" />
                </div>
                <span>NOTIFICATIONS</span>
              </div>

              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-orange-500 text-white shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </motion.button>
          </nav>
        </div>

        {/* Bottom Quick Metric Card with 3D Tilt */}
        <TiltCard maxTilt={5} glareMaxOpacity={0.25} className="w-full">
          <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-xl border border-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">JOURNEY STATS</span>
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-transform duration-200 hover:scale-105">
                <span className="block text-sm font-black text-slate-900">{user.tripsCount}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">TRIPS MADE</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 transition-transform duration-200 hover:scale-105">
                <span className="block text-sm font-black text-slate-900">{user.statesExplored}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">STATES</span>
              </div>
            </div>
          </div>
        </TiltCard>
      </aside>

      {/* MOBILE LIQUID GLASS FLOATING BOTTOM BAR (below lg:) */}
      <div className="lg:hidden fixed bottom-3 sm:bottom-4 left-0 right-0 z-50 px-2.5 sm:px-4 pointer-events-none flex justify-center">
        <motion.nav
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="pointer-events-auto w-full max-w-sm sm:max-w-md liquid-glass-nav rounded-full px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-around shadow-2xl backdrop-blur-xl border border-white/60 bg-white/80"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => onSelectTab(tab.id)}
                className="relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-3.5 rounded-full cursor-pointer transition-transform min-w-[58px]"
              >
                {/* Dynamic Flow Liquid Capsule */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveLiquidPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full shadow-[0_4px_16px_rgba(249,115,22,0.45)] -z-10"
                  />
                )}

                <div className={`transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-600'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5 transition-colors whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-slate-600'
                }`}>
                  {tab.label}
                </span>

                {/* Micro notification dot */}
                {tab.id === 'saves' && savedCount > 0 && !isActive && (
                  <span className="absolute top-1 right-2 sm:right-3 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white"></span>
                )}
              </motion.button>
            );
          })}

          {/* Mobile Notifications Trigger */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onOpenNotifications}
            className="relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-3.5 rounded-full cursor-pointer transition-transform min-w-[58px]"
          >
            <div className="text-slate-600">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5 text-slate-600 whitespace-nowrap">
              NOTIFS
            </span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-2 sm:right-3 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white"></span>
            )}
          </motion.button>
        </motion.nav>
      </div>
    </>
  );
};
