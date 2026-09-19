import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Users, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  Compass, 
  MessageSquare, 
  Send, 
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Globe2,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { DestinationCard, ReviewItem } from '../types';
import { TiltCard } from './TiltCard';
import { MagneticButton } from './MagneticButton';

interface DestinationCarouselProps {
  destinations: DestinationCard[];
  onPlanDestination: (dest: DestinationCard) => void;
  onAddReview: (destId: string, review: ReviewItem) => void;
}

export const DestinationCarousel: React.FC<DestinationCarouselProps> = ({
  destinations,
  onPlanDestination,
  onAddReview,
}) => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [reviewModalDest, setReviewModalDest] = useState<DestinationCard | null>(null);

  // Auto-motion infinite carousel states
  const [isAutoMoving, setIsAutoMoving] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [moveSpeed, setMoveSpeed] = useState<number>(0.85); // pixels per frame
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward (left to right visual), -1 = reverse

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState('LOCAL EXPLORER');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  // Triple the items to construct a true seamless infinite ring buffer
  const infiniteDestinations = React.useMemo(() => {
    return [...destinations, ...destinations, ...destinations];
  }, [destinations]);

  // Initial scroll position: offset to the middle set so backwards scrolling wraps seamlessly
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      if (container.scrollWidth > 0) {
        const singleSetWidth = container.scrollWidth / 3;
        container.scrollLeft = singleSetWidth;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [destinations]);

  // Always-moving continuous infinite scroll loop via requestAnimationFrame
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let lastTimestamp = performance.now();

    const step = (timestamp: number) => {
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // When auto-moving and not hovered, scroll continuously
      if (isAutoMoving && !isHovered && !isDraggingRef.current && container) {
        const singleSetWidth = container.scrollWidth / 3;

        if (singleSetWidth > 0) {
          // Normalize speed by frame rate (targeting ~60fps)
          const delta = (elapsed / 16.67) * moveSpeed * direction;
          container.scrollLeft += delta;

          // Infinite wrap bounds check
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isAutoMoving, isHovered, moveSpeed, direction]);

  // Manual scroll nudge buttons (Left / Right)
  const handleManualNudge = (dir: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const singleCardWidth = 380;
    const nudgeAmount = dir === 'left' ? -singleCardWidth : singleCardWidth;

    container.scrollBy({
      left: nudgeAmount,
      behavior: 'smooth'
    });

    // Check wrap shortly after smooth scroll completes
    setTimeout(() => {
      if (!container) return;
      const singleSetWidth = container.scrollWidth / 3;
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft -= singleSetWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += singleSetWidth;
      }
    }, 350);
  };

  // Mouse Drag / Touch Swipe handlers for seamless tactile control
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on non-interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeftStartRef.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleToggleExpand = (id: string) => {
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalDest || !reviewComment.trim()) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim() || 'EXPLORER',
      rating: reviewRating,
      date: 'Just now',
      comment: reviewComment.trim(),
      helpfulCount: 1,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    };

    onAddReview(reviewModalDest.id, newReview);
    setReviewComment('');
    setReviewModalDest(null);
  };

  return (
    <div className="w-full mb-12 select-none">
      {/* Editorial Section Header: International Layout */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 pb-4 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[9px] font-mono-telemetry font-black uppercase tracking-widest">
              COLLECTION 01 • PAN-INDIA
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono-telemetry text-neutral-500 font-bold uppercase">
              <Flame className="w-3 h-3 text-orange-500" />
              ALWAYS-ACTIVE INFINITE STREAM
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-4xl font-extrabold uppercase tracking-tight text-neutral-900 leading-tight">
            FAMOUS PLACES & ICONIC EXPEDITIONS
          </h2>
          <p className="font-editorial text-xs sm:text-sm font-medium text-neutral-600 mt-1 max-w-2xl">
            A continuous kinetic stream of India's most celebrated heritage citadels, alpine valleys, and coastal sanctuaries. Hover anytime to pause and architect.
          </p>
        </div>

        {/* International Stream Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active Motion Status Pill with Play/Pause */}
          <button
            onClick={() => setIsAutoMoving(!isAutoMoving)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-mono-telemetry font-black uppercase tracking-wider transition-all cursor-pointer border shadow-2xs ${
              isAutoMoving 
                ? 'bg-neutral-900 text-white border-neutral-700' 
                : 'bg-white text-neutral-800 border-neutral-300'
            }`}
            title={isAutoMoving ? "Pause Infinite Movement" : "Resume Infinite Movement"}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoMoving ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'}`} />
            {isAutoMoving ? (
              <>
                <Pause className="w-3 h-3 text-white" />
                <span>STREAM: ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>STREAM: PAUSED</span>
              </>
            )}
          </button>

          {/* Velocity Switcher: 0.5x / 1x / 1.8x */}
          <div className="flex items-center rounded-full bg-white/90 border border-neutral-200 p-0.5 shadow-2xs text-[8px] sm:text-[9px] font-mono-telemetry font-black">
            <button
              onClick={() => setMoveSpeed(0.5)}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-colors cursor-pointer ${moveSpeed === 0.5 ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'}`}
              title="Slow Stately Glide"
            >
              0.5X
            </button>
            <button
              onClick={() => setMoveSpeed(0.85)}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-colors cursor-pointer ${moveSpeed === 0.85 ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'}`}
              title="Default Kinetic Pace"
            >
              1X
            </button>
            <button
              onClick={() => setMoveSpeed(1.6)}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-colors cursor-pointer ${moveSpeed === 1.6 ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'}`}
              title="Swift Flow"
            >
              1.8X
            </button>
          </div>

          {/* Direction Inverter */}
          <button
            onClick={() => setDirection((prev) => (prev === 1 ? -1 : 1))}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-white/90 border border-neutral-200 text-neutral-700 hover:text-black text-[9px] sm:text-[10px] font-mono-telemetry font-black uppercase cursor-pointer shadow-2xs"
            title="Reverse Scroll Direction"
          >
            {direction === 1 ? 'FLOW ➔' : '◀ FLOW'}
          </button>

          {/* Manual Step Buttons */}
          <div className="flex items-center gap-1">
            <MagneticButton
              onClick={() => handleManualNudge('left')}
              className="p-2 sm:p-2.5 rounded-full glass-pill hover:bg-white text-neutral-800 shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
              title="Step Left"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </MagneticButton>
            <MagneticButton
              onClick={() => handleManualNudge('right')}
              className="p-2 sm:p-2.5 rounded-full glass-pill hover:bg-white text-neutral-800 shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
              title="Step Right"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Infinite Carousel Container */}
      <div className="relative w-full">
        {/* Subtle Horizontal Edge Fades for High-End Depth */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-12 bg-gradient-to-r from-slate-50/80 via-slate-50/40 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-12 bg-gradient-to-l from-slate-50/80 via-slate-50/40 to-transparent z-10" />

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUpOrLeave();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6 pt-2 px-2 sm:px-3 cursor-grab active:cursor-grabbing select-none"
          style={{ willChange: 'scroll-position' }}
        >
          {infiniteDestinations.map((dest, index) => {
            const isExpanded = expandedCardId === `${dest.id}-${index}`;
            const uniqueCardKey = `${dest.id}-${index}`;

            return (
              <div 
                key={uniqueCardKey} 
                className="shrink-0 w-[280px] xs:w-[320px] sm:w-[380px] transition-transform duration-300"
              >
                <TiltCard
                  id={`card-${uniqueCardKey}`}
                  maxTilt={5}
                  glareMaxOpacity={0.35}
                  className="w-full h-full"
                >
                  <div
                    className={`w-full h-full glass-card glass-card-interactive p-5 flex flex-col justify-between transition-all duration-300 ${
                      isExpanded ? 'ring-2 ring-neutral-900/20' : ''
                    }`}
                  >
                    {/* Visual & Geodetic Header */}
                    <div>
                      {/* Image Frame */}
                      <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 shadow-xs group bg-neutral-900">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />

                        {/* Top Left: Live Real-Time Visitors */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/20 text-[9px] font-mono-telemetry font-black uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>{dest.activeVisitors.toLocaleString()} ACTIVE</span>
                        </div>

                        {/* Top Right: Weather Tag */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-mono font-bold shadow-xs">
                          {dest.weatherTemp}
                        </div>

                        {/* Bottom Bar: Geodetic Stamp & Duration */}
                        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-neutral-200 text-[9px] font-mono-telemetry uppercase tracking-wider border border-white/15">
                            {dest.coordinates.lat.toFixed(2)}°N, {dest.coordinates.lng.toFixed(2)}°E
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-white/90 text-neutral-900 text-[9px] font-mono font-black uppercase shadow-xs">
                            {dest.recommendedDuration}
                          </span>
                        </div>
                      </div>

                      {/* Editorial Title & Review Trigger */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="block text-[9px] font-mono-telemetry uppercase tracking-widest text-neutral-400 font-bold">
                            REGION: {dest.state.toUpperCase()}
                          </span>
                          <h3 className="font-display text-lg font-black uppercase text-neutral-900 tracking-tight leading-tight">
                            {dest.name}
                          </h3>
                        </div>

                        {/* Star Rating Button */}
                        <button
                          onClick={() => setReviewModalDest(dest)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                          title="View Explorer Reviews"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span className="font-mono">{dest.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-700 opacity-80">({dest.reviewCount})</span>
                        </button>
                      </div>

                      <p className="font-editorial text-xs font-semibold text-neutral-600 mb-4 line-clamp-2 uppercase">
                        {dest.tagline}
                      </p>

                      {/* Internal Expand Trigger (Shopping & Spots) */}
                      <button
                        onClick={() => handleToggleExpand(uniqueCardKey)}
                        className="w-full py-2 px-3 mb-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer active:scale-98"
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-mono">
                          <ShoppingBag className="w-3.5 h-3.5 text-neutral-700" />
                          <span>{isExpanded ? 'HIDE CURATED GUIDE' : 'VIEW BAZAARS & LANDMARKS'}</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Expand Content Accordion */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden space-y-3 pt-1 pb-3 text-left"
                          >
                            {/* What to Buy / Shopping */}
                            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
                              <span className="block text-[10px] font-mono-telemetry font-black uppercase tracking-wider text-amber-800 mb-1.5">
                                🛍️ FAMOUS BAZAARS & HANDICRAFTS
                              </span>
                              <ul className="space-y-1">
                                {dest.famousShopping.map((item, idx) => (
                                  <li key={idx} className="text-[11px] font-bold text-neutral-800 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Must Visit Spots */}
                            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/60">
                              <span className="block text-[10px] font-mono-telemetry font-black uppercase tracking-wider text-sky-800 mb-1.5">
                                📍 TOP MONUMENTS & NATURE
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {dest.mustVisitSpots.map((spot, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-white/90 text-neutral-800 text-[10px] font-extrabold uppercase border border-sky-200 shadow-2xs"
                                  >
                                    {spot}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Average Est Budget */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 text-xs font-mono font-black uppercase">
                              <span className="text-neutral-500">EST. BUDGET PER EXPLORER</span>
                              <span className="text-neutral-900 font-extrabold">₹{dest.averageBudget.toLocaleString()}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                      <MagneticButton
                        onClick={() => setReviewModalDest(dest)}
                        className="p-3 rounded-2xl bg-white/90 hover:bg-white text-neutral-700 border border-neutral-200 shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Read Reviews & Ratings"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </MagneticButton>
                      <MagneticButton
                        onClick={() => onPlanDestination(dest)}
                        className="flex-1 py-3 glass-button text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>ARCHITECT ITINERARY</span>
                      </MagneticButton>
                    </div>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Reviews & Star Ratings Modal */}
      <AnimatePresence>
        {reviewModalDest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card p-6 border border-white max-h-[90vh] flex flex-col justify-between overflow-y-auto shadow-2xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
                  <div>
                    <h3 className="font-display text-lg font-black uppercase text-neutral-900">
                      {reviewModalDest.name} REVIEWS
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(reviewModalDest.rating) ? 'fill-amber-400' : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold font-mono uppercase text-neutral-800">
                        {reviewModalDest.rating.toFixed(1)} / 5.0 ({reviewModalDest.reviewCount} REVIEWS)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewModalDest(null)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Existing Reviews List */}
                <div className="space-y-3 mb-6 max-h-56 overflow-y-auto pr-1">
                  {reviewModalDest.reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-2xl bg-white/95 border border-neutral-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img src={rev.avatar} alt={rev.author} className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-xs font-black uppercase text-neutral-900">{rev.author}</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs font-medium text-neutral-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Post Your Own Review Form */}
                <form onSubmit={handlePostReview} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 mb-2">
                    POST YOUR TRAVEL EXPERIENCE
                  </h4>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase text-neutral-700">YOUR RATING:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="SHARE SIGHTSEEING TIPS, HIDDEN MARKETS, OR FOOD SPOTS..."
                    className="w-full px-3 py-2 text-xs glass-input font-medium uppercase placeholder:text-neutral-400 mb-3 resize-none"
                    required
                  />

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 glass-button text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SUBMIT VERIFIED REVIEW</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
