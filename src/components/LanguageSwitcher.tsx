'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-150 hover:bg-muted text-sm font-medium"
        style={{ color: 'var(--foreground)' }}
        title="Change Language"
      >
        <Globe size={15} style={{ color: 'var(--primary)' }} />
        <span className="hidden sm:inline text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
          {current.nativeLabel}
        </span>
        <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl border shadow-lg z-50 overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="p-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-150 hover:bg-muted"
                  style={{ color: 'var(--foreground)' }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-xs">{lang.nativeLabel}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{lang.label}</span>
                  </div>
                  {language === lang.code && (
                    <Check size={13} style={{ color: 'var(--primary)' }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
