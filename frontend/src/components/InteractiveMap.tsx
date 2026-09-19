import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Eye, Plus, Sparkles, RotateCcw, Info, Crosshair } from 'lucide-react';
import { DestinationCard } from '../types';
import { MagneticButton } from './MagneticButton';

interface InteractiveMapProps {
  destinations: DestinationCard[];
  onSelectDestination: (destination: DestinationCard) => void;
  onQuickPlan: (destination: DestinationCard) => void;
}

interface DraggablePin {
  id: string;
  name: string;
  state: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  temp: string;
  destinationData?: DestinationCard;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  onSelectDestination,
  onQuickPlan,
}) => {
  // Initial pins with coordinates mapped to the organic map
  const defaultPins: DraggablePin[] = destinations.map((d) => ({
    id: d.id,
    name: d.name.split(',')[0],
    state: d.state,
    x: d.coordinates.x,
    y: d.coordinates.y,
    temp: d.weatherTemp,
    destinationData: d
  }));

  const [pins, setPins] = useState<DraggablePin[]>(defaultPins);
  const [selectedPin, setSelectedPin] = useState<DraggablePin | null>(defaultPins[0] || null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mountains' | 'beaches' | 'heritage'>('all');
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Canvas cursor coordinate tracking
  const [canvasCursor, setCanvasCursor] = useState<{ x: number; y: number; lat: string; lng: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const lat = (35.5 - (yPct / 100) * 27.0).toFixed(1);
    const lng = (68.7 + (xPct / 100) * 28.5).toFixed(1);

    setCanvasCursor({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      lat: `${lat}°N`,
      lng: `${lng}°E`
    });
  };

  const handleCanvasMouseLeave = () => {
    setCanvasCursor(null);
  };

  const handleDragEnd = (id: string, info: { offset: { x: number; y: number } }) => {
    setPins((prev) =>
      prev.map((pin) => {
        if (pin.id === id) {
          // Approximate percentage shift based on container bounds
          const newX = Math.max(5, Math.min(95, pin.x + info.offset.x / 6));
          const newY = Math.max(5, Math.min(95, pin.y + info.offset.y / 4));
          return { ...pin, x: newX, y: newY };
        }
        return pin;
      })
    );
  };

  const handleReset = () => {
    setPins(defaultPins);
  };

  return (
    <div className="w-full glass-card p-4 sm:p-6 mb-8 border border-white/80 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Header with Title and Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
              DRAGGABLE WAYPOINT CANVAS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
            INTERACTIVE BHARAT EXPLORATION MAP
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 backdrop-blur-sm">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ALL PINS
            </button>
            <button
              onClick={() => setActiveFilter('mountains')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'mountains' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PEAKS ❄️
            </button>
            <button
              onClick={() => setActiveFilter('beaches')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'beaches' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              COASTAL 🌊
            </button>
          </div>

          <MagneticButton
            onClick={handleReset}
            title="Reset Pins"
            className="p-2 rounded-full glass-pill hover:bg-slate-100 text-slate-600 shadow-xs active:scale-95 flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </MagneticButton>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div 
        ref={canvasRef}
        id="india-interactive-map-canvas"
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="relative w-full h-[360px] sm:h-[440px] rounded-3xl bg-gradient-to-b from-sky-100/50 via-amber-50/40 to-emerald-50/50 border border-white/90 shadow-inner overflow-hidden cursor-crosshair"
      >
        {/* Map Watermark & Topographic Contours */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="map-dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1.2" fill="#64748b" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-dot-grid)" />
          
          {/* Animated Route Interconnector connecting pins in sequence */}
          <path
            d={`M ${pins.map((p) => `${p.x * 7} ${p.y * 4}`).join(' L ')}`}
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeDasharray="6,6"
            className="animate-pulse"
            opacity="0.65"
          />
        </svg>

        {/* Live Cursor Coordinate Tooltip */}
        {canvasCursor && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-12 transition-all duration-75"
            style={{ left: `${canvasCursor.x}px`, top: `${canvasCursor.y}px` }}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white backdrop-blur-md text-[10px] font-mono tracking-wider shadow-md border border-white/20">
              <Crosshair className="w-3 h-3 text-orange-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>{canvasCursor.lat} • {canvasCursor.lng}</span>
            </div>
          </div>
        )}

        {/* Informational Drag Instruction Pill */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 glass-pill text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-700 pointer-events-none border border-white/80 shadow-xs">
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
          <span><span className="hidden sm:inline">HOVER FOR COORDS • </span>DRAG PINS TO EXPLORE</span>
        </div>

        {/* Dynamic Draggable Destination Pins */}
        {pins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          const isHovered = hoveredPinId === pin.id;

          return (
            <motion.div
              key={pin.id}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => handleDragEnd(pin.id, info)}
              onMouseEnter={() => setHoveredPinId(pin.id)}
              onMouseLeave={() => setHoveredPinId(null)}
              onClick={() => {
                setSelectedPin(pin);
                if (pin.destinationData) {
                  onSelectDestination(pin.destinationData);
                }
              }}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
              }}
              whileHover={{ scale: 1.18, zIndex: 40 }}
              whileTap={{ scale: 0.95 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
            >
              <div className="flex flex-col items-center">
                {/* Ambient radar ring on hover */}
                {isHovered && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
                    className="absolute -top-3 w-14 h-14 rounded-full border-2 border-orange-500 pointer-events-none -z-10"
                  />
                )}

                {/* Pin Card Preview */}
                <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-lg border transition-all ${
                  isSelected 
                    ? 'bg-orange-500 text-white border-orange-400 scale-105 shadow-orange-500/30 ring-2 ring-orange-300/60' 
                    : isHovered
                    ? 'bg-white text-orange-600 border-orange-300 shadow-md scale-105'
                    : 'bg-white/95 text-slate-800 border-white/90'
                }`}>
                  <span>{pin.name}</span>
                  <span className="ml-1 opacity-85">{pin.temp}</span>
                </div>

                {/* Pin Needle */}
                <div className="relative -mt-1">
                  <div className={`w-3.5 h-3.5 rotate-45 rounded-sm shadow-md transition-colors ${
                    isSelected ? 'bg-orange-600' : isHovered ? 'bg-orange-500' : 'bg-orange-500'
                  }`} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 left-1" />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Bottom Floating Pin Detail Bar if selected */}
        {selectedPin && selectedPin.destinationData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-30 p-2.5 sm:p-3.5 glass-card border border-white/95 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto min-w-0">
              <img
                src={selectedPin.destinationData.image}
                alt={selectedPin.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-white shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs font-black uppercase text-slate-900 truncate">
                    {selectedPin.destinationData.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[9px] sm:text-[10px] font-bold uppercase shrink-0">
                    ⭐ {selectedPin.destinationData.rating}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
                  {selectedPin.destinationData.tagline}
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold text-orange-600 uppercase truncate">
                  🟢 {selectedPin.destinationData.activeVisitors.toLocaleString()} TRAVELERS NOW
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end shrink-0">
              <a
                href={`https://earth.google.com/web/search/${encodeURIComponent(selectedPin.destinationData.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all"
                title="Explore in Google Earth 3D"
              >
                <span>🌍 EARTH 3D</span>
              </a>
              <MagneticButton
                onClick={() => onSelectDestination(selectedPin.destinationData!)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-2xs active:scale-95"
              >
                DETAILS
              </MagneticButton>
              <MagneticButton
                onClick={() => onQuickPlan(selectedPin.destinationData!)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 glass-button text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-xs hover:shadow-md"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                <span>PLAN TRIP</span>
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

