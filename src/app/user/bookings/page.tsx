'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Search, Navigation, CheckCircle2, XCircle, ChevronRight, AlertCircle, Sparkles, Map } from 'lucide-react';
import { useBookingFlowStore } from '../../../lib/store';

export default function UserBookingsPage() {
  const { bookings, cancelBooking } = useBookingFlowStore();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const handleCancel = (id: string, ref: string) => {
    const doubleCheck = confirm(`Are you sure you want to cancel reservation ${ref}?`);
    if (doubleCheck) {
      cancelBooking(id);
    }
  };

  const filteredBookings = bookings.filter(b => activeFilter === 'ALL' || b.status === activeFilter);

  const filters = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'CONFIRMED', label: 'Active' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8 min-h-screen relative">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[color:var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-5xl py-8 sm:py-12 relative z-10">
          <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--color-primary)] font-bold mb-2">
                  <Sparkles size={14} /> My Journey
                </p>
                <h1 className="text-3xl md:text-5xl font-black text-[color:var(--color-on-surface)] tracking-tight">Your Bookings</h1>
                <p className="text-[color:var(--color-on-surface-variant)] mt-2 text-sm md:text-base max-w-md">
                  Track, manage, and review all your reservations in one beautiful place.
                </p>
              </div>
              
              {/* Premium Glass Filter Pills */}
              <div className="flex bg-[color:var(--color-surface-container)]/60 backdrop-blur-xl p-1.5 rounded-2xl border border-[color:var(--color-outline-variant)]/30 w-full md:w-auto overflow-x-auto no-scrollbar shrink-0 shadow-sm">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`relative px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 ${
                      activeFilter === filter.id 
                        ? 'text-white' 
                        : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                    }`}
                  >
                    {activeFilter === filter.id && (
                      <motion.div 
                        layoutId="activeFilterBg"
                        className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-primary)] to-blue-500 rounded-xl -z-10 shadow-lg shadow-[color:var(--color-primary)]/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Section */}
            {filteredBookings.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/40 backdrop-blur-2xl p-16 text-center shadow-2xl shadow-[color:var(--color-surface-dim)]/20"
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-[color:var(--color-primary)]/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Search className="h-10 w-10 text-[color:var(--color-primary)]" />
                </div>
                <h3 className="text-2xl font-black text-[color:var(--color-on-surface)] mb-2">No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} bookings found</h3>
                <p className="text-[color:var(--color-on-surface-variant)] max-w-md mx-auto mb-8">
                  You don't have any reservations matching this criteria. Explore amazing services and book your next experience.
                </p>
                <Link href="/search" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[color:var(--color-primary)] to-blue-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[color:var(--color-primary)]/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                  <Navigation size={18} /> Explore Services
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence mode='popLayout'>
                  {filteredBookings.map((b, i) => (
                    <motion.div
                      key={b.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                      className="group relative overflow-hidden rounded-3xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-container)]/60 backdrop-blur-xl p-6 shadow-lg shadow-[color:var(--color-surface-dim)]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      {/* Status Glow Indicator */}
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-40 -z-10 transition-colors duration-500 ${
                        b.status === 'CONFIRMED' ? 'bg-green-500' : 
                        b.status === 'COMPLETED' ? 'bg-[color:var(--color-primary)]' : 
                        'bg-red-500'
                      }`} />

                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--color-outline)] block mb-1.5">
                            Ref #{b.ref}
                          </span>
                          <h3 className="font-extrabold text-xl text-[color:var(--color-on-surface)] leading-tight group-hover:text-[color:var(--color-primary)] transition-colors line-clamp-2">
                            {b.serviceName}
                          </h3>
                        </div>
                        
                        {/* Premium Status Chip */}
                        <div className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase border flex items-center gap-1.5 shadow-sm ${
                          b.status === 'CONFIRMED' 
                            ? 'border-green-500/20 bg-green-500/10 text-green-500' 
                            : b.status === 'COMPLETED'
                            ? 'border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                            : 'border-red-500/20 bg-red-500/10 text-red-500'
                        }`}>
                          {b.status === 'CONFIRMED' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                          {b.status === 'COMPLETED' && <CheckCircle2 size={12} strokeWidth={3} />}
                          {b.status === 'CANCELLED' && <XCircle size={12} strokeWidth={3} />}
                          {b.status}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[color:var(--color-surface-dim)]/50 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-[color:var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[color:var(--color-outline)] uppercase tracking-wider mb-0.5">Location</p>
                            <p className="text-xs font-semibold text-[color:var(--color-on-surface)] line-clamp-2">{b.merchantName} {b.city ? `, ${b.city}` : ''}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[color:var(--color-surface-dim)]/50 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4 text-[color:var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[color:var(--color-outline)] uppercase tracking-wider mb-0.5">Schedule</p>
                            <p className="text-xs font-semibold text-[color:var(--color-on-surface)]">{b.date}</p>
                            <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">{b.time}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-[color:var(--color-outline-variant)]/30 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[color:var(--color-outline)] uppercase tracking-wider">Total</span>
                          <span className="font-black text-[color:var(--color-on-surface)] text-xl tracking-tight">₹{b.amount}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancel(b.id, b.ref)}
                              className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/15 active:scale-[0.95] transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          
                          <Link
                            href={`/tracks?id=${b.id}`}
                            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[color:var(--color-primary)] to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[color:var(--color-primary)]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Track <ChevronRight size={14} strokeWidth={3} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
