import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe } from 'lucide-react';

interface MultilingualGreetingProps {
  userName: string;
}

const GREETINGS = [
  { word: 'HOLA', lang: 'SPANISH' },
  { word: 'HELLO', lang: 'ENGLISH' },
  { word: 'BONJOUR', lang: 'FRENCH' },
  { word: 'KONNICHIWA', lang: 'JAPANESE' },
  { word: 'CIAO', lang: 'ITALIAN' },
  { word: 'PRIVET', lang: 'RUSSIAN' },
  { word: 'HALLO', lang: 'GERMAN' },
  { word: 'NI HAO', lang: 'CHINESE' },
  { word: 'OLÁ', lang: 'PORTUGUESE' },
  { word: 'NAMASTE', lang: 'HINDI' },
  { word: 'MERHABA', lang: 'TURKISH' },
  { word: 'ANNYEONG', lang: 'KOREAN' },
  { word: 'AHLAN', lang: 'ARABIC' },
  { word: 'SAWATDEE', lang: 'THAI' },
];

export const MultilingualGreeting: React.FC<MultilingualGreetingProps> = ({ userName }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const currentGreeting = GREETINGS[index];
  const firstName = userName.split(' ')[0] || 'EXPLORER';

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 max-w-full">
        <div className="relative inline-flex items-center overflow-hidden h-8 sm:h-11">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentGreeting.word}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="font-display text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-neutral-900 whitespace-nowrap"
            >
              {currentGreeting.word},
            </motion.span>
          </AnimatePresence>
        </div>

        <span className="font-display text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-neutral-900 truncate">
          {firstName}!
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.span
          key={currentGreeting.lang}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest border border-slate-800 shadow-2xs shrink-0"
        >
          <Globe className="w-3 h-3 text-orange-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span>{currentGreeting.lang}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
