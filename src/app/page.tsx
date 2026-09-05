'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Star, Compass, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShortcutManagerModal } from '../components/shortcuts/ShortcutManagerModal';
import { SubnavManagerModal } from '../components/shortcuts/SubnavManagerModal';
import { ActionModalManager } from '../components/shortcuts/ActionModalManager';
import { useBookingFlowStore, useLocationStore } from '../lib/store';
import { useShortcutStore, AVAILABLE_SHORTCUTS, SUBNAV_CATEGORIES } from '../store/useShortcutStore';
import { calculateDistance, getProvidersByCategory } from '../lib/mockData';
import { api } from '../lib/api';
import { CarouselSections } from '../components/home/CarouselSections';
import { ConciergeJourneys } from '../components/home/ConciergeJourneys';
import { ExploreMore } from '../components/home/ExploreMore';
import { OffersForYou } from '../components/home/OffersForYou';
import { NearbyRadar } from '../components/home/NearbyRadar';
import { ShortcutsDock } from '../components/home/ShortcutsDock';
import { AdBanner } from '../components/home/AdBanner';
import { CategoryCard, SectionHeader, StatCard, WishlistButton, CartAddButton } from '../components/home/HomeShared';
import { CITY_COORDINATES, EXPLORE_SECTIONS, RECOMMENDED_ITEMS, CONCIERGE_JOURNEYS_POOL, MOCK_ADS, MOCK_ACTIVITIES, getCombinedConciergePool } from '../lib/homeData';



import { BokspotLoader } from '../components/ui/BokspotLoader';

export default function HomePage() {
  const { bookings } = useBookingFlowStore();
  const { city, latitude, longitude } = useLocationStore();
  const { activeShortcuts, setShortcutModalOpen, openActionModal, subnavCategories, setSubnavModalOpen } = useShortcutStore();
  const [mounted, setMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = 320;
      trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const scrollRecommended = (direction: 'left' | 'right') => {
    if (recommendedScrollRef.current) {
      const scrollAmount = 320;
      recommendedScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const scrollEvents = (direction: 'left' | 'right') => {
    if (eventsScrollRef.current) {
      const scrollAmount = 320;
      eventsScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const journeysScrollRef = useRef<HTMLDivElement>(null);
  const scrollJourneys = (direction: 'left' | 'right') => {
    if (journeysScrollRef.current) {
      const scrollAmount = 320;
      journeysScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };



  // Live activity notification ticker state
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activityDismissed, setActivityDismissed] = useState(false);

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live activity notification ticker logic
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      if (!activityDismissed) {
        const randomIdx = Math.floor(Math.random() * MOCK_ACTIVITIES.length);
        setCurrentActivity(MOCK_ACTIVITIES[randomIdx]);
        setShowActivity(true);
      }
    }, 6000);

    const interval = setInterval(() => {
      setShowActivity(false);
      setTimeout(() => {
        if (!activityDismissed) {
          const randomIdx = Math.floor(Math.random() * MOCK_ACTIVITIES.length);
          setCurrentActivity(MOCK_ACTIVITIES[randomIdx]);
          setShowActivity(true);
        }
      }, 500);
    }, 18000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [activityDismissed]);

  const getDiff = (idx: number) => {
    let d = idx - adIndex;
    if (d < -2) d += 5;
    if (d > 2) d -= 5;
    return d;
  };

  

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <BokspotLoader message="Waking up server..." />;
  }

  const activeCount = Array.isArray(bookings) ? bookings.filter(b => b.status === 'CONFIRMED').length : 0;
  const activeNote = activeCount === 1 ? '1 active reservation' : `${activeCount} active reservations`;

  return (
    <>
      <ShortcutManagerModal />
      <SubnavManagerModal />
      <ActionModalManager />

      <main className="page-content px-4 md:px-8 lg:pr-8">
        <div className="mx-auto w-full">
          {/* Row 1: Main Categories & Dashboard pill */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2 pt-3.5">
            <div className="flex items-center gap-2.5 overflow-x-auto py-2 pr-4 custom-scrollbar shrink-0 max-w-full lg:max-w-[75%] scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {['travel-transport', 'stay-accommodation', 'entertainment-events', 'sports-turf', 'lifestyle-local'].map(catId => {
                const category = SUBNAV_CATEGORIES.find(c => c.id === catId);
                if (!category) return null;
                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="transition-all flex items-center gap-1 cursor-pointer text-[13px] font-extrabold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] shrink-0 pr-2"
                  >
                    <span className="text-[14px] leading-none shrink-0">{category.emoji}</span>
                    <span className="whitespace-nowrap">{category.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-3 px-1">
              <Link
                href="/vendor/register"
                className="bg-[#2a4365] text-white pl-1.5 pr-4 h-8 rounded-full flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] font-bold cursor-pointer shrink-0 border border-white/20"
              >
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[7px] text-[#2a4365]" style={{ transform: 'scale(0.7)' }}>storefront</span>
                </div>
                <span className="text-white text-[11px] font-bold tracking-wide select-none">VENDOR</span>
              </Link>
              <Link href="/support" className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0" aria-label="Help & Support">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">support_agent</span>
              </Link>
              <Link href="/profile" className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0" aria-label="Settings">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">settings</span>
              </Link>
            </div>
          </div>

          {/* Divider line between services and ad banner */}
          <div className="w-full relative border-b border-[color:var(--color-outline-variant)]/20 mb-2" />

          {/* Row 2: Ad Banner */}
          <AdBanner />

          {/* Row 3: Shortcuts Dock */}
          <section className="mb-6 mt-6 md:mt-8">

            <div className="flex flex-wrap items-center gap-3">
              {Array.isArray(activeShortcuts) && activeShortcuts.length > 0 ? (
                activeShortcuts.slice(0, 6).map(id => AVAILABLE_SHORTCUTS.find(s => s.id === id)).filter(Boolean).map(shortcut => {
                  if (!shortcut) return null;
                  const handleAction = () => {
                    if (shortcut.actionType === 'modal') {
                      openActionModal(shortcut.actionTarget);
                    } else {
                      window.location.href = shortcut.actionTarget;
                    }
                  };
                  return (
                    <button
                      key={shortcut.id}
                      onClick={handleAction}
                      className="h-10 px-5 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-container)]/40 hover:border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-surface-container-high)]/60 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer text-xs font-extrabold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] shadow-sm backdrop-blur-md"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[color:var(--color-primary)]">{shortcut.icon}</span>
                      <span>{shortcut.label}</span>
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-[color:var(--color-outline)] italic mr-2">No shortcuts added yet.</span>
              )}

              {/* Manage Dock Shortcuts Button */}
              <button
                onClick={() => setShortcutModalOpen(true)}
                className="h-10 px-4 rounded-2xl border border-dashed border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/[0.03] hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-[color:var(--color-primary)]"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Shortcut</span>
              </button>
            </div>
          </section>

          <CarouselSections />

          <ConciergeJourneys />
          <div className="h-px bg-[color:var(--color-outline-variant)]/20 my-8 w-full" />

          <ExploreMore />
          <OffersForYou />
          <NearbyRadar />
          {/* Row 7: Detailed Footer */}
          <footer className="mt-16 border-t border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-container)]/10 backdrop-blur-xl pt-12 pb-24 px-6 md:px-12 rounded-t-[32px] card-glass relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02]" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />

            {/* Top Row: Customer Support Socials & Newsletter */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-[color:var(--color-outline-variant)]/10 z-10 relative">

              {/* Left: Customer Support Social Handles */}
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left w-full lg:w-auto">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[color:var(--color-outline)]">
                  Customer Support
                </span>
                <div className="flex items-center justify-center gap-2.5">
                  {[
                    { icon: 'public', label: 'FB', href: 'https://facebook.com', color: 'hover:text-blue-500' },
                    { icon: 'share', label: 'TW', href: 'https://twitter.com', color: 'hover:text-sky-400' },
                    { icon: 'photo_camera', label: 'IG', href: 'https://instagram.com', color: 'hover:text-pink-500' },
                    { icon: 'smart_display', label: 'YT', href: 'https://youtube.com', color: 'hover:text-red-500' },
                    { icon: 'send', label: 'TG', href: 'https://telegram.org', color: 'hover:text-sky-500' }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-full bg-[color:var(--color-surface-container-high)]/40 border border-[color:var(--color-outline-variant)]/20 flex items-center justify-center text-[color:var(--color-on-surface-variant)] transition-all hover:scale-105 active:scale-95 shadow-sm ${social.color}`}
                      title={social.label}
                    >
                      <span className="material-symbols-outlined text-[16px]">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right: Newsletter Subscription */}
              <div className="w-full lg:w-auto flex flex-col md:flex-row items-center justify-center lg:justify-end gap-3">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[color:var(--color-outline)] shrink-0">
                  Subscribe to Newsletter
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                    if (email) {
                      alert(`Thank you for subscribing, ${email}!`);
                      e.currentTarget.reset();
                    }
                  }}
                  className="flex items-center w-full md:w-80 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/50 p-1.5 focus-within:border-[color:var(--color-primary)]/45 transition-colors card-glass"
                >
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent border-none outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] px-3 py-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors text-[10px] font-black uppercase tracking-wider"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Center Row: 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 z-10 relative">

              {/* Column 1: Exclusive Bookings */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)]">
                  Exclusive Bookings
                </h4>
                <ul className="space-y-2">
                  {['New Events', 'Featured Venues', 'Top Locations', 'Ongoing Promos'].map((link) => (
                    <li key={link}>
                      <Link
                        href="/categories"
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: BokSpot */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold bg-white/90 dark:bg-white/95 px-2.5 py-1 rounded-full border border-white/10 shadow-sm inline-block">
                  <span className="logo-text-bok text-[#0a3161]">Bok</span>
                  <span className="logo-text-spot text-[#ff6325]">Spot</span>
                </h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'All Categories', href: '/categories' },
                    { label: 'Live Radar Maps', href: '/maps' },
                    { label: 'Active Tracks', href: '/tracks' }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: About Us */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)]">
                  About Us
                </h4>
                <ul className="space-y-2">
                  {['Our Story', 'Company Bio', 'Careers', 'Press Kit', 'Privacy Policy'].map((link) => (
                    <li key={link}>
                      <Link
                        href="/profile#settings"
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Customer Care Support */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)]">
                  Customer Care Support
                </h4>
                <ul className="space-y-2">
                  {['Help Center / FAQs', 'Contact Support', 'Live Chat', 'Refund Policy', 'Terms of Service'].map((link) => (
                    <li key={link}>
                      <Link
                        href="/profile#saved"
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Row: Logo & Copyright */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[color:var(--color-outline-variant)]/10 z-10 relative">
              <Link
                href="/"
                className="flex items-center gap-2 bg-white/90 dark:bg-white/95 px-3.5 py-1.5 rounded-full border border-white/20 shadow-md font-['Playfair_Display'] text-[15px] tracking-[0.15em] uppercase font-extrabold hover:opacity-90 transition-all shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#ff6325] fill-[#ff6325]" />
                <span className="font-black">
                  <span className="logo-text-bok text-[#0a3161]">BOK</span>
                  <span className="logo-text-spot text-[#ff6325]">SPOT</span>
                </span>
              </Link>
              <p className="text-[10px] font-bold text-[color:var(--color-outline)] tracking-wider">
                COPYRIGHT &copy; 2026 BOKSPOT. ALL RIGHTS RESERVED.
              </p>
            </div>
          </footer>
        </div>
      </main>

      {/* Glassmorphic Dashboard Drawer/Modal */}
      {dashboardOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[color:var(--color-surface-container)]/90 border border-[color:var(--color-outline-variant)]/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-up card-glass">

            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[color:var(--color-outline-variant)]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-primary)]">analytics</span>
                <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Dashboard Control Center</h3>
              </div>
              <button
                onClick={() => setDashboardOpen(false)}
                className="p-1.5 hover:bg-[color:var(--color-on-surface)]/[0.05] rounded-full text-[color:var(--color-outline)] hover:text-[color:var(--color-primary)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Active Bookings"
                  value={String(activeCount)}
                  note={activeNote}
                  icon="event_available"
                />
                <StatCard
                  label="Saved Places"
                  value="28"
                  note="Verified local venues"
                  icon="bookmark"
                />
                <StatCard
                  label="Support Score"
                  value="98%"
                  note="Instant response rating"
                  icon="support_agent"
                />
              </div>

              {/* Quick Access Library */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[color:var(--color-outline)]">explore</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[color:var(--color-outline)]">Quick Library</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_SHORTCUTS.map(shortcut => {
                    const handleAction = () => {
                      setDashboardOpen(false);
                      if (shortcut.actionType === 'modal') {
                        openActionModal(shortcut.actionTarget);
                      } else {
                        window.location.href = shortcut.actionTarget;
                      }
                    };
                    return (
                      <button
                        key={shortcut.id}
                        onClick={handleAction}
                        className="h-10 px-3 rounded-xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/50 hover:border-[color:var(--color-primary)]/45 hover:bg-[color:var(--color-surface-container-high)]/60 transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] text-left truncate"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[color:var(--color-primary)]">{shortcut.icon}</span>
                        <span className="truncate">{shortcut.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-[color:var(--color-surface-dim)]/50 border-t border-[color:var(--color-outline-variant)]/25 flex justify-end">
              <button
                onClick={() => {
                  setDashboardOpen(false);
                  setShortcutModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors text-xs font-bold shadow-md"
              >
                Manage Docks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time floating activity ticker */}
      <AnimatePresence>
        {showActivity && currentActivity && !activityDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-20 lg:bottom-6 left-4 z-40 max-w-sm rounded-2xl border border-white/10 bg-black/75 backdrop-blur-xl p-4 shadow-2xl flex gap-3 text-left group"
          >
            {/* Live Indicator Icon */}
            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 shadow-inner">
              {currentActivity.emoji}
            </div>

            {/* Text details */}
            <div className="flex-1 space-y-1 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400">Live booking activity</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-300 leading-normal">
                <span className="font-extrabold text-white">{currentActivity.user}</span> in <span className="text-[#fceea7] font-bold">{currentActivity.city}</span> {currentActivity.action} <span className="font-bold text-white underline underline-offset-2 decoration-indigo-400">{currentActivity.item}</span> <span className="text-slate-400 text-[10px] block font-medium mt-0.5">at {currentActivity.merchant}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">{currentActivity.time}</span>
                <Link href={currentActivity.link || '/'} className="text-[9px] font-black text-indigo-400 uppercase tracking-wider hover:text-indigo-300 transition-colors flex items-center gap-0.5">
                  View Service <ArrowRight size={8} />
                </Link>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActivity(false);
                setActivityDismissed(true);
              }}
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}