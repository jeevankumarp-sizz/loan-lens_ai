'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: 'features', label: 'Features' },
  { href: 'workflow', label: 'How It Works' },
  { href: 'compliance', label: 'Compliance' },
  { href: 'testimonials', label: 'Testimonials' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
];

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-card backdrop-blur-md' : ''
      }`}
      style={{ background: scrolled ? 'rgba(248,250,252,0.92)' : 'transparent' }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo + Status */}
        <div className="flex items-center gap-2.5">
          <AppLogo size={32} />
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--foreground)' }}>
            LoanLens AI
          </span>
          <span
            className="badge-base text-[10px] px-2 py-0.5 ml-1"
            style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', borderColor: 'rgba(37,99,235,0.2)' }}
          >
            Beta
          </span>
          {/* System Status Chip */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ml-2"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.22)',
              color: 'var(--accent)',
            }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-accent"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            AI Verification Active
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks?.map((link) => (
            <button
              key={`nav-${link?.label}`}
              onClick={() => smoothScrollTo(link.href)}
              className="text-sm font-medium transition-colors hover:text-primary relative pb-0.5"
              style={{
                color: activeSection === link.href ? 'var(--primary)' : 'var(--secondary-foreground)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {link?.label}
              {activeSection === link.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors hover:bg-muted"
              style={{ color: 'var(--secondary-foreground)', border: '1px solid var(--border)' }}
            >
              <Globe size={14} />
              <span>{selectedLang.label}</span>
              <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-1.5 rounded-xl shadow-card-hover overflow-hidden z-50"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    minWidth: '130px',
                  }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                      style={{
                        color: selectedLang.code === lang.code ? 'var(--primary)' : 'var(--foreground)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/beneficiary-login" className="btn-outline text-sm px-4 py-2">
              Beneficiary Login
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/officer-dashboard" className="btn-primary text-sm px-4 py-2">
              Officer Portal
            </Link>
          </motion.div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-t px-6 py-4 space-y-3 overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Mobile status chip */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-1"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.22)',
                color: 'var(--accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
              AI Verification Active
            </div>
            {navLinks?.map((link) => (
              <button
                key={`mobile-nav-${link?.label}`}
                onClick={() => { smoothScrollTo(link.href); setMobileOpen(false); }}
                className="block w-full text-left text-sm font-medium py-2"
                style={{ color: 'var(--secondary-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {link?.label}
              </button>
            ))}
            {/* Mobile language switcher */}
            <div className="flex gap-2 pt-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: selectedLang.code === lang.code ? 'var(--primary)' : 'var(--muted)',
                    color: selectedLang.code === lang.code ? '#fff' : 'var(--foreground)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link href="/beneficiary-login" className="btn-outline text-sm text-center">
                Beneficiary Login
              </Link>
              <Link href="/officer-dashboard" className="btn-primary text-sm text-center">
                Officer Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}