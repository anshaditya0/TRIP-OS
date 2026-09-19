import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { animate, stagger } from 'animejs';
import { Compass, MapPin, Navigation, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface ParallaxMapLoginProps {
  onLogin: (email: string, name: string) => void;
  defaultEmail?: string;
}

export const ParallaxMapLogin: React.FC<ParallaxMapLoginProps> = ({ onLogin, defaultEmail = '' }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Anime.js continuous live floating animation for background elements
  useEffect(() => {
    const animOrbs = animate('.login-live-orb', {
      translateX: [-30, 40, -10],
      translateY: [-20, 30, -15],
      scale: [1, 1.15, 0.95],
      duration: 12000,
      ease: 'inOutSine',
      loop: true,
      alternate: true
    });

    const animPins = animate('.login-floating-pin', {
      translateY: [-8, 8],
      duration: 3500,
      delay: stagger(400),
      ease: 'inOutQuad',
      loop: true,
      alternate: true
    });

    return () => {
      animOrbs.revert();
      animPins.revert();
    };
  }, []);

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax offsets
  const mapTranslateX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const mapTranslateY = useTransform(smoothY, [-0.5, 0.5], [-35, 35]);
  const pinsTranslateX = useTransform(smoothX, [-0.5, 0.5], [-60, 60]);
  const pinsTranslateY = useTransform(smoothY, [-0.5, 0.5], [-60, 60]);
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientWidth, clientHeight } = e.currentTarget;
    const xPct = e.clientX / clientWidth - 0.5;
    const yPct = e.clientY / clientHeight - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'EXPLORER';
    const cleanEmail = email.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@tripos.world`;
    onLogin(cleanEmail, cleanName);
  };

  return (
    <div 
      id="login-parallax-container"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-4 select-none"
    >
      {/* Dynamic Background Living Ambient Light Spheres (Anime.js) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="login-live-orb absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-orange-400/25 blur-[100px]" />
        <div className="login-live-orb absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-sky-400/25 blur-[120px]" />
        <div className="login-live-orb absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-emerald-400/20 blur-[90px]" />
      </div>

      {/* Dynamic Parallax Interactive Map Background */}
      <motion.div 
        style={{ x: mapTranslateX, y: mapTranslateY }}
        className="absolute inset-[-60px] pointer-events-none opacity-30"
      >
        {/* Topographic Contour lines & India Map Silhouette */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
              <circle cx="30" cy="30" r="1.5" fill="#64748b" opacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          
          {/* Organic Topographic elevation curves */}
          <path 
            d="M 50 150 Q 300 80 600 220 T 1200 180 T 1800 280" 
            fill="none" 
            stroke="#f97316" 
            strokeWidth="1.5" 
            opacity="0.3" 
          />
          <path 
            d="M 0 350 Q 400 220 850 420 T 1600 360 T 2100 480" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="1.2" 
            opacity="0.25" 
          />
          <path 
            d="M 100 600 Q 550 480 980 680 T 1750 560" 
            fill="none" 
            stroke="#0284c7" 
            strokeWidth="1.5" 
            opacity="0.25" 
          />
        </svg>
      </motion.div>

      {/* Floating Parallax Destination Pins */}
      <motion.div 
        style={{ x: pinsTranslateX, y: pinsTranslateY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="login-floating-pin absolute top-[18%] left-[22%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">JAIPUR • 28°C</span>
        </div>

        <div className="login-floating-pin absolute top-[32%] right-[18%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">MANALI • -2°C ❄️</span>
        </div>

        <div className="login-floating-pin absolute bottom-[24%] left-[16%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">GOA BEACHES • 31°C ☀️</span>
        </div>

        <div className="login-floating-pin absolute bottom-[20%] right-[24%] flex items-center gap-2 bg-white/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">MUNNAR TEA HILLS • 19°C 🍃</span>
        </div>
      </motion.div>

      {/* Center Soft Glass Login Card with Subtle Parallax Tilt */}
      <motion.div
        id="login-glass-card"
        style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformPerspective: 1000 }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 140 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 glass-card border border-white/90 shadow-[0_24px_50px_rgba(15,23,42,0.08)]"
      >
        {/* Top Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-3 py-1 glass-pill text-slate-800 font-bold text-xs tracking-wider">
            <Compass className="w-3.5 h-3.5 text-orange-500 animate-spin" style={{ animationDuration: '16s' }} />
            <span>SOFT GLASS DESIGN</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SECURE VAULT</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center text-white shadow-xs ring-1 ring-slate-200 overflow-hidden">
              <img src="/logo.png" alt="TRIP OS Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-orange-600">TRIP OS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 leading-none mb-2">
            TRIP OS VAULT
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            EXPLORE DESTINATIONS • JOURNEY COLLECTIBLES • DISASTER RADAR
          </p>
        </div>

        {/* Login vs Sign Up Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100/80 p-1 mb-6 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setAuthMode('LOGIN')}
            className={`flex-1 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('SIGNUP')}
            className={`flex-1 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              authMode === 'SIGNUP'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Login / Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {authMode === 'SIGNUP' ? 'CHOOSE EXPLORER USERNAME / NAME *' : 'EXPLORER USERNAME / NAME *'}
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ALEX MORGAN / RAHUL"
              required
              className="w-full px-4 py-3 glass-input text-slate-900 font-bold uppercase tracking-wide text-sm placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              TRAVEL EMAIL ADDRESS *
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.morgan@gmail.com / traveler@tripos.world"
              required
              className="w-full px-4 py-3 glass-input text-slate-900 font-bold uppercase tracking-wide text-sm placeholder:text-slate-400"
            />
          </div>

          {authMode === 'SIGNUP' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5"
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                SECURE SECURITY PIN / PASSWORD
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER ACCESS PIN"
                className="w-full px-4 py-3 glass-input text-slate-900 font-bold uppercase tracking-wide text-sm placeholder:text-slate-400"
              />
            </motion.div>
          )}

          <div className="pt-2 space-y-2.5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              className="w-full py-3.5 glass-button flex items-center justify-center gap-2.5 text-sm font-bold shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{authMode === 'LOGIN' ? 'ACCESS TRIP OS DASHBOARD' : 'REGISTER & LAUNCH TRIP OS'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <button
              type="button"
              onClick={() => onLogin('guest.explorer@tripos.world', 'GUEST EXPLORER')}
              className="w-full py-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/60 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              OR EXPLORE AS GUEST
            </button>
          </div>
        </form>

        {/* Fast Instant Demo Badge */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            PARALLAX MOTION ENABLED • MOVE CURSOR TO EXPLORE
          </p>
        </div>
      </motion.div>
    </div>
  );
};
