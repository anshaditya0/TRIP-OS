import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Clock, Check, Sparkles } from 'lucide-react';

interface DateDropboxCalendarProps {
  selectedDate: string; // ISO date string "YYYY-MM-DD"
  durationDays?: number; // default e.g. 3 or 5
  onChangeDate: (date: string) => void;
  onChangeDuration?: (days: number) => void;
  compact?: boolean;
  label?: string;
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const DAYS_SHORT = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export const DateDropboxCalendar: React.FC<DateDropboxCalendarProps> = ({
  selectedDate,
  durationDays = 3,
  onChangeDate,
  onChangeDuration,
  compact = false,
  label = 'DEPARTURE DATE & EXPEDITION TIMELINE'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selectedDate or fallback to current date
  const parsedDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const safeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  // Calendar navigation state (month & year being viewed)
  const [viewYear, setViewYear] = useState(safeDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(safeDate.getMonth());

  // Close dropbox on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Ensure view reflects selected date when opened
  const handleToggle = () => {
    if (!isOpen) {
      setViewYear(safeDate.getFullYear());
      setViewMonth(safeDate.getMonth());
    }
    setIsOpen(!isOpen);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Compute days in current viewed month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const newDateStr = `${viewYear}-${monthStr}-${dayStr}`;
    onChangeDate(newDateStr);
  };

  // Quick Preset Handlers
  const setPresetDate = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    onChangeDate(`${yyyy}-${mm}-${dd}`);
    setViewYear(yyyy);
    setViewMonth(target.getMonth());
  };

  // Format display string
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'SELECT EXPEDITION DATE';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = dayNames[d.getDay()];
      const day = d.getDate();
      const month = MONTH_NAMES[d.getMonth()]?.slice(0, 3);
      const year = d.getFullYear();
      return `${dayName}, ${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div ref={containerRef} className="relative w-full">
      {!compact && label && (
        <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] font-mono-telemetry text-orange-600 font-bold">
            CALENDAR DATE PICKER
          </span>
        </label>
      )}

      {/* Trigger Dropbox Button */}
      <button
        id="btn-date-dropbox-trigger"
        type="button"
        onClick={handleToggle}
        className={`w-full text-left transition-all cursor-pointer flex items-center justify-between ${
          compact
            ? 'px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 border border-slate-200/90 shadow-2xs text-xs font-bold'
            : 'px-4 py-3 rounded-2xl glass-input text-slate-900 border border-slate-200/90 hover:border-slate-300 shadow-2xs'
        } ${isOpen ? 'ring-2 ring-neutral-900/10 border-neutral-800' : ''}`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`rounded-lg flex items-center justify-center shrink-0 ${
            compact ? 'w-6 h-6 bg-orange-100 text-orange-700' : 'w-8 h-8 bg-orange-100 text-orange-700'
          }`}>
            <CalendarIcon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </div>

          <div className="min-w-0">
            <span className="text-xs font-black uppercase tracking-tight text-slate-900 block truncate">
              {formatDisplayDate(selectedDate)}
            </span>
            {!compact && (
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {durationDays} DAYS TRIP DURATION
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {compact && (
            <span className="text-[10px] font-mono font-black text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
              {durationDays}D
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropbox Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="dropbox-calendar-popover"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 sm:left-auto sm:w-84 top-full mt-2 z-50 p-4 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl space-y-4"
          >
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block font-mono">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_SHORT.map((day) => (
                <span key={day} className="text-[9px] font-mono font-black text-slate-400 uppercase py-0.5">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading padding days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="w-8 h-8" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = new Date(viewYear, viewMonth, dayNum);
                cellDate.setHours(0, 0, 0, 0);

                const isToday = cellDate.getTime() === today.getTime();
                const isSelected =
                  safeDate.getFullYear() === viewYear &&
                  safeDate.getMonth() === viewMonth &&
                  safeDate.getDate() === dayNum;

                const isPast = cellDate < today;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`w-8 h-8 mx-auto rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-black shadow-sm scale-105 ring-2 ring-neutral-900/30'
                        : isToday
                        ? 'bg-orange-100 text-orange-900 font-black border border-orange-300'
                        : isPast
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Quick Date Presets */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[9px] font-mono-telemetry font-bold text-slate-400 uppercase block">
                QUICK DATE SELECT PRESETS:
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setPresetDate(0)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-900 text-[10px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  TODAY
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(1)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-900 text-[10px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  TOMORROW
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(7)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-900 text-[10px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  NEXT WEEK
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(14)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-900 text-[10px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  IN 2 WEEKS
                </button>
              </div>
            </div>

            {/* Trip Duration Select (if supported) */}
            {onChangeDuration && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono-telemetry font-bold text-slate-400 uppercase">
                    EXPEDITION DURATION:
                  </span>
                  <span className="text-[10px] font-mono font-black text-neutral-900">
                    {durationDays} DAYS
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[3, 4, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => onChangeDuration(d)}
                      className={`py-1 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
                        durationDays === d
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {d} DAYS
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct date input sync & Close */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <input
                id="input-native-date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onChangeDate(e.target.value);
                    const dt = new Date(e.target.value + 'T00:00:00');
                    if (!isNaN(dt.getTime())) {
                      setViewYear(dt.getFullYear());
                      setViewMonth(dt.getMonth());
                    }
                  }
                }}
                className="text-[11px] font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
                title="Direct date input"
              />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>CONFIRM</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
