import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { WeatherType } from '../types';

interface LiveDynamicParallaxBackgroundProps {
  weather: WeatherType;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const LiveDynamicParallaxBackground: React.FC<LiveDynamicParallaxBackgroundProps> = ({ weather }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deepLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const foreLayerRef = useRef<HTMLDivElement>(null);
  const cursorAuraRef = useRef<HTMLDivElement>(null);
  const cursorCoreRef = useRef<HTMLDivElement>(null);
  const flightDashRef = useRef<SVGPathElement>(null);
  const compassRef = useRef<SVGSVGElement>(null);

  // Click radar ripples state
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  
  // Real-time Flight Telemetry HUD data (reacting to cursor)
  const [telemetry, setTelemetry] = useState({
    lat: "28°36'N",
    lng: "77°12'E",
    bearing: "042°",
    altitude: "1,420M"
  });

  // Mouse parallax interpolation targets and current coordinates
  const mousePos = useRef({ 
    targetX: 0, 
    targetY: 0, 
    currentX: 0, 
    currentY: 0,
    cursorClientX: 0,
    cursorClientY: 0,
    prevX: 0,
    prevY: 0,
    velocity: 0
  });

  // Atmospheric theme palette mapping
  const themePalette = {
    rain: {
      orb1: 'rgba(71, 85, 105, 0.45)',    // slate mist
      orb2: 'rgba(51, 65, 85, 0.38)',     // storm cloud
      orb3: 'rgba(148, 163, 184, 0.28)',  // light rain drizzle
      accent: 'rgba(56, 189, 248, 0.65)', // neon sky drizzle
      secondary: 'rgba(125, 211, 252, 0.4)',
      gridColor: 'rgba(148, 163, 184, 0.12)',
      code: 'MONSOON ACTIVE'
    },
    nature: {
      orb1: 'rgba(16, 185, 129, 0.42)',   // lush emerald
      orb2: 'rgba(52, 211, 153, 0.35)',   // tea hills mint
      orb3: 'rgba(234, 179, 8, 0.25)',    // warm sunlight through forest
      accent: 'rgba(16, 185, 129, 0.7)',
      secondary: 'rgba(110, 231, 183, 0.45)',
      gridColor: 'rgba(16, 185, 129, 0.10)',
      code: 'FOREST BREEZE'
    },
    snow: {
      orb1: 'rgba(56, 189, 248, 0.42)',   // glacial ice sky
      orb2: 'rgba(224, 242, 254, 0.55)',  // alpine frost
      orb3: 'rgba(186, 230, 253, 0.35)',  // snow powder blue
      accent: 'rgba(14, 165, 233, 0.7)',
      secondary: 'rgba(224, 242, 254, 0.6)',
      gridColor: 'rgba(56, 189, 248, 0.11)',
      code: 'HIMALAYAN FROST'
    },
    sunny: {
      orb1: 'rgba(249, 115, 22, 0.45)',   // golden sunset orange
      orb2: 'rgba(251, 191, 36, 0.40)',   // warm radiant amber
      orb3: 'rgba(244, 63, 94, 0.22)',    // coral dusk blush
      accent: 'rgba(249, 115, 22, 0.72)',
      secondary: 'rgba(253, 186, 116, 0.5)',
      gridColor: 'rgba(249, 115, 22, 0.10)',
      code: 'SOLAR RADIANCE'
    }
  }[weather];

  // 1. Mouse movement tracking & telemetry calculation
  useEffect(() => {
    let lastTelemetryUpdate = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const normY = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      
      // Calculate cursor velocity for fluid inertia
      const dx = e.clientX - mousePos.current.prevX;
      const dy = e.clientY - mousePos.current.prevY;
      const vel = Math.sqrt(dx * dx + dy * dy);
      
      mousePos.current.prevX = e.clientX;
      mousePos.current.prevY = e.clientY;
      mousePos.current.velocity = Math.min(vel, 80);
      mousePos.current.targetX = normX;
      mousePos.current.targetY = normY;
      mousePos.current.cursorClientX = e.clientX;
      mousePos.current.cursorClientY = e.clientY;

      // Position interactive smooth lighting aura
      if (cursorAuraRef.current) {
        cursorAuraRef.current.style.transform = `translate3d(${e.clientX - 225}px, ${e.clientY - 225}px, 0)`;
        cursorAuraRef.current.style.opacity = '0.45';
      }
      if (cursorCoreRef.current) {
        cursorCoreRef.current.style.transform = `translate3d(${e.clientX - 60}px, ${e.clientY - 60}px, 0)`;
        cursorCoreRef.current.style.opacity = '0.6';
      }

      // Throttle telemetry update to 120ms
      const now = Date.now();
      if (now - lastTelemetryUpdate > 120) {
        lastTelemetryUpdate = now;
        const latVal = (28.6 + normY * 8.4).toFixed(2);
        const lngVal = (77.2 + normX * 12.1).toFixed(2);
        const degBearing = Math.round(((Math.atan2(normY, normX) * 180) / Math.PI + 360) % 360);
        const elev = Math.round(1200 + Math.abs(normX * normY) * 1800);

        setTelemetry({
          lat: `${latVal}°N`,
          lng: `${lngVal}°E`,
          bearing: `${degBearing.toString().padStart(3, '0')}°`,
          altitude: `${elev.toLocaleString()}M`
        });
      }
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = 0;
      mousePos.current.targetY = 0;
      if (cursorAuraRef.current) {
        cursorAuraRef.current.style.opacity = '0';
      }
      if (cursorCoreRef.current) {
        cursorCoreRef.current.style.opacity = '0';
      }
    };

    // Global click listener to emit radar sonar ripple waves from cursor
    const handleClick = (e: MouseEvent) => {
      // Avoid if click happened inside an input or form button to keep UI clean
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const rippleId = Date.now();
      setRipples((prev) => [...prev.slice(-3), { id: rippleId, x: e.clientX, y: e.clientY }]);

      // Remove after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 1600);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Continuous requestAnimationFrame loop to smoothly interpolate (lerp) parallax layers
    let animationFrameId: number;
    let autonomousTime = 0;

    const tickParallax = () => {
      autonomousTime += 0.014;
      // Autonomous gentle breathing wave (guarantees background is ALWAYS live even without mouse)
      const autoWaveX = Math.sin(autonomousTime) * 0.18;
      const autoWaveY = Math.cos(autonomousTime * 0.85) * 0.18;

      const effectiveTargetX = mousePos.current.targetX + autoWaveX;
      const effectiveTargetY = mousePos.current.targetY + autoWaveY;

      // Smooth Lerp (factor 0.065 for agile responsive tracking)
      mousePos.current.currentX += (effectiveTargetX - mousePos.current.currentX) * 0.065;
      mousePos.current.currentY += (effectiveTargetY - mousePos.current.currentY) * 0.065;

      const curX = mousePos.current.currentX;
      const curY = mousePos.current.currentY;

      // Velocity decay
      mousePos.current.velocity *= 0.92;

      // Apply to layered planes with increasing depth factors + 3D rotational perspective
      if (deepLayerRef.current) {
        deepLayerRef.current.style.transform = `translate3d(${curX * -22}px, ${curY * -22}px, 0) scale(1.05)`;
      }
      if (midLayerRef.current) {
        const rotX = curY * 4;
        const rotY = curX * -4;
        midLayerRef.current.style.transform = `translate3d(${curX * -46}px, ${curY * -46}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      if (foreLayerRef.current) {
        const rotX = curY * 8;
        const rotY = curX * -8;
        foreLayerRef.current.style.transform = `translate3d(${curX * -84}px, ${curY * -84}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      animationFrameId = requestAnimationFrame(tickParallax);
    };

    animationFrameId = requestAnimationFrame(tickParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Anime.js Live Continuous Animations for Orbs, Compass, and Flight Path
  useEffect(() => {
    // Animate glowing atmospheric light spheres continuously with organic wander
    const animOrb1 = animate('.live-orb-1', {
      translateX: [-50, 60, -30],
      translateY: [-35, 50, -15],
      scale: [1, 1.22, 0.94],
      duration: 13000,
      ease: 'inOutSine',
      loop: true,
      alternate: true
    });

    const animOrb2 = animate('.live-orb-2', {
      translateX: [40, -60, 30],
      translateY: [45, -45, 20],
      scale: [1.12, 0.9, 1.18],
      duration: 16000,
      ease: 'inOutSine',
      loop: true,
      alternate: true
    });

    const animOrb3 = animate('.live-orb-3', {
      translateX: [-30, 45, -35],
      translateY: [25, -55, 30],
      scale: [0.92, 1.25, 0.98],
      duration: 15000,
      ease: 'inOutSine',
      loop: true,
      alternate: true
    });

    // Navigational compass rotation
    let animCompass: { revert: () => void } | null = null;
    if (compassRef.current) {
      animCompass = animate(compassRef.current, {
        rotate: [0, 360],
        duration: 55000,
        ease: 'linear',
        loop: true
      });
    }

    // Animated flight corridor pulse along the stroke
    let animFlight: { revert: () => void } | null = null;
    if (flightDashRef.current) {
      animFlight = animate(flightDashRef.current, {
        strokeDashoffset: [500, 0],
        duration: 7000,
        ease: 'linear',
        loop: true
      });
    }

    // Living pulsing waypoint beacon rings
    const animWaypoints = animate('.live-corridor-waypoint-ring', {
      scale: [1, 2.4],
      opacity: [0.8, 0],
      delay: stagger(600),
      duration: 2200,
      ease: 'outQuad',
      loop: true
    });

    // Weather particle motes: continuous living flow with Anime.js
    const animParticles = animate('.live-weather-particle', {
      translateY: () => (weather === 'rain' ? [-60, 160] : [-30, 30]),
      translateX: () => [-25 + Math.random() * 50, 25 - Math.random() * 50],
      opacity: [0.25, 0.85, 0.25],
      scale: [0.85, 1.35, 0.9],
      duration: () => 3500 + Math.random() * 4500,
      delay: stagger(180),
      ease: 'inOutQuad',
      loop: true,
      alternate: weather !== 'rain'
    });

    return () => {
      animOrb1.revert();
      animOrb2.revert();
      animOrb3.revert();
      animCompass?.revert();
      animFlight?.revert();
      animWaypoints.revert();
      animParticles.revert();
    };
  }, [weather]);

  return (
    <div
      ref={containerRef}
      id="live-dynamic-parallax-background"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. DEEP LAYER: Soft Multi-Spectral Radial Light Spheres */}
      <div 
        ref={deepLayerRef} 
        className="absolute inset-0 w-full h-full will-change-transform"
      >
        {/* Top-Left Ambient Luminescence */}
        <div
          className="live-orb-1 absolute -top-[15%] -left-[12%] w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] rounded-full blur-[120px] opacity-80 transition-colors duration-1000"
          style={{ background: themePalette.orb1 }}
        />

        {/* Bottom-Right Atmospheric Glow */}
        <div
          className="live-orb-2 absolute -bottom-[18%] -right-[12%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full blur-[140px] opacity-75 transition-colors duration-1000"
          style={{ background: themePalette.orb2 }}
        />

        {/* Center Sub-Surface Radial Tint */}
        <div
          className="live-orb-3 absolute top-[28%] left-[28%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[130px] opacity-65 transition-colors duration-1000"
          style={{ background: themePalette.orb3 }}
        />

        {/* Geodetic Waypoint Dot-Grid Matrix */}
        <div
          className="absolute inset-0 opacity-45 transition-colors duration-1000"
          style={{
            backgroundImage: `radial-gradient(${themePalette.gridColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '36px 36px'
          }}
        />

        {/* Subtle Horizontal Geodesic Scanning Latitude Lines */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 96%, ${themePalette.accent} 97%, transparent 100%)`,
            backgroundSize: '100% 120px'
          }}
        />
      </div>

      {/* 2. MID LAYER: Topographic Elevation Contours & Animated Flight Corridors */}
      <div 
        ref={midLayerRef} 
        className="absolute inset-0 w-full h-full will-change-transform preserve-3d"
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="liveTopoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themePalette.accent} stopOpacity="0.5" />
              <stop offset="50%" stopColor={themePalette.secondary} stopOpacity="0.25" />
              <stop offset="100%" stopColor={themePalette.accent} stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="liveCorridorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Topographic Contour Wave 1 */}
          <path
            d="M -100 220 C 250 160, 520 320, 880 190 C 1220 70, 1420 270, 1650 180"
            stroke="url(#liveTopoGradient)"
            strokeWidth="1.75"
            fill="none"
            strokeDasharray="8 6"
          />

          {/* Topographic Contour Wave 2 */}
          <path
            d="M -100 460 C 280 540, 620 370, 970 490 C 1270 600, 1470 410, 1680 470"
            stroke="url(#liveTopoGradient)"
            strokeWidth="2.25"
            fill="none"
          />

          {/* Topographic Contour Wave 3 */}
          <path
            d="M -50 700 C 350 610, 670 760, 1070 650 C 1320 560, 1520 710, 1680 640"
            stroke="url(#liveTopoGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="5 7"
          />

          {/* Living Flight Route Corridor with Traveling Pulse */}
          <path
            ref={flightDashRef}
            d="M 140 760 Q 440 160 1340 200"
            stroke="url(#liveCorridorGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="20 14"
          />

          {/* High-Tech Geodetic Flight Vector Node 1 (Goa Coast Waypoint) */}
          <g transform="translate(140, 760)">
            <circle cx="0" cy="0" r="14" className="live-corridor-waypoint-ring" stroke="#f97316" strokeWidth="1.5" fill="none" />
            <circle cx="0" cy="0" r="5" fill="#f97316" />
            <circle cx="0" cy="0" r="10" stroke="#f97316" strokeWidth="1" opacity="0.6" />
          </g>

          {/* High-Tech Geodetic Flight Vector Node 2 (Jaipur Midpoint) */}
          <g transform="translate(740, 350)">
            <circle cx="0" cy="0" r="16" className="live-corridor-waypoint-ring" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
            <circle cx="0" cy="0" r="5.5" fill="#38bdf8" />
            <circle cx="0" cy="0" r="12" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          </g>

          {/* High-Tech Geodetic Flight Vector Node 3 (Manali Peak Waypoint) */}
          <g transform="translate(1340, 200)">
            <circle cx="0" cy="0" r="18" className="live-corridor-waypoint-ring" stroke="#10b981" strokeWidth="2" fill="none" />
            <circle cx="0" cy="0" r="6" fill="#10b981" />
            <circle cx="0" cy="0" r="14" stroke="#10b981" strokeWidth="1" opacity="0.7" />
          </g>
        </svg>

        {/* Live Aeronautics HUD Overlay in Corners */}
        <div className="absolute top-8 left-10 text-[10px] font-mono tracking-widest text-slate-500/50 uppercase hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>RADAR ONLINE • {themePalette.code} • BEARING: {telemetry.bearing}</span>
        </div>

        <div className="absolute top-8 right-12 text-[10px] font-mono tracking-widest text-slate-500/50 uppercase hidden md:flex items-center gap-3">
          <span>LAT: {telemetry.lat}</span>
          <span>•</span>
          <span>LNG: {telemetry.lng}</span>
          <span>•</span>
          <span>ALT: {telemetry.altitude}</span>
        </div>
      </div>

      {/* 3. FOREGROUND LAYER: Navigational Compass Rose & Living Weather Particle Motes */}
      <div 
        ref={foreLayerRef} 
        className="absolute inset-0 w-full h-full will-change-transform preserve-3d"
      >
        {/* Floating Navigational Compass Rose */}
        <div className="absolute top-20 right-8 md:right-28 opacity-30">
          <svg
            ref={compassRef}
            width="130"
            height="130"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 3" className="text-slate-600" />
            <circle cx="50" cy="50" r="39" stroke="currentColor" strokeWidth="0.5" className="text-slate-600" />
            
            {/* North Point */}
            <polygon points="50,6 56,46 50,42" fill="#f97316" />
            <polygon points="50,6 44,46 50,42" fill="#ea580c" />
            
            {/* South Point */}
            <polygon points="50,94 56,54 50,58" fill="#64748b" />
            <polygon points="50,94 44,54 50,58" fill="#475569" />
            
            {/* East & West Points */}
            <polygon points="94,50 54,44 58,50" fill="#94a3b8" />
            <polygon points="94,50 54,56 58,50" fill="#cbd5e1" />
            <polygon points="6,50 46,44 42,50" fill="#94a3b8" />
            <polygon points="6,50 46,56 42,50" fill="#cbd5e1" />
            <circle cx="50" cy="50" r="3.5" fill="#0f172a" />
          </svg>
        </div>

        {/* Dynamic Weather Particle Motes (Living Flow with Anime.js) */}
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            className="live-weather-particle absolute rounded-full pointer-events-none"
            style={{
              top: `${8 + (i * 4.2)}%`,
              left: `${5 + ((i * 19) % 90)}%`,
              width: weather === 'rain' ? '1.5px' : `${4 + (i % 5)}px`,
              height: weather === 'rain' ? `${20 + (i % 12)}px` : `${4 + (i % 5)}px`,
              backgroundColor: weather === 'rain'
                ? '#38bdf8'
                : weather === 'snow'
                ? '#e0f2fe'
                : weather === 'nature'
                ? '#34d399'
                : '#fbbf24',
              boxShadow: `0 0 12px ${themePalette.accent}`
            }}
          />
        ))}
      </div>

      {/* 4. INTERACTIVE RADAR SONAR CLICK RIPPLES */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            border: `2px solid ${themePalette.accent}`,
            boxShadow: `0 0 25px ${themePalette.accent}`,
            animation: 'radarSonarExpand 1.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards'
          }}
        />
      ))}

      {/* 5. INTERACTIVE DUAL-LAYER CURSOR REFLECTION AURA (Apple-like soft follow-light) */}
      <div
        ref={cursorAuraRef}
        className="absolute top-0 left-0 w-[450px] h-[450px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300 blur-[90px]"
        style={{
          background: `radial-gradient(circle, ${themePalette.accent} 0%, transparent 72%)`
        }}
      />
      <div
        ref={cursorCoreRef}
        className="absolute top-0 left-0 w-[120px] h-[120px] rounded-full pointer-events-none opacity-0 transition-opacity duration-200 blur-[40px]"
        style={{
          background: `radial-gradient(circle, ${themePalette.secondary} 0%, transparent 80%)`
        }}
      />

      {/* Inline Radar Sonar Keyframe Animation */}
      <style>{`
        @keyframes radarSonarExpand {
          0% {
            width: 0px;
            height: 0px;
            opacity: 0.85;
          }
          100% {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
