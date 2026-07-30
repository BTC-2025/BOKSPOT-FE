'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, MapPin, QrCode, CheckCircle2, XCircle, ArrowLeft, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { useBookingFlowStore } from '../../../lib/store';

export default function UserBookingsPage() {
  const { bookings, cancelBooking } = useBookingFlowStore();

  const handleCancel = (id: string, ref: string) => {
    const doubleCheck = confirm(`Are you sure you want to cancel reservation ${ref}?`);
    if (doubleCheck) {
      cancelBooking(id);
    }
  };

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8">
        <div className="mx-auto max-w-4xl py-6 sm:py-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-outline)] font-semibold">Reservations</p>
                <h1 className="text-2xl md:text-3xl font-black text-[color:var(--color-on-surface)] tracking-tight">My Bookings</h1>
              </div>
              <span className="text-xs bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-outline-variant)]/40 px-3 py-1.5 rounded-full font-bold text-[color:var(--color-on-surface)] shadow-sm">
                Total: {bookings.length}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 p-12 text-center card-glass">
                <AlertCircle className="h-12 w-12 text-[color:var(--color-outline)]/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[color:var(--color-on-surface)]">No bookings found</h3>
                <p className="text-sm text-[color:var(--color-on-surface-variant)] mt-1.5 max-w-sm mx-auto">You haven't confirmed any appointments yet. Head back to the search portal to book services.</p>
                <Link href="/search" className="mt-6 inline-block rounded-xl bg-[color:var(--color-primary)] px-5 py-3 text-xs font-bold text-[color:var(--color-on-primary)] shadow-lg shadow-[color:var(--color-primary)]/10">
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    className="rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 p-5 card-glass flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-base text-[color:var(--color-on-surface)]">{b.serviceName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
                          b.status === 'CONFIRMED' 
                            ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                            : b.status === 'COMPLETED'
                            ? 'border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-[color:var(--color-on-surface-variant)] flex flex-wrap gap-x-4 gap-y-1.5 items-center">
                        <span className="flex items-center gap-1 font-semibold text-[color:var(--color-on-surface)]"><MapPin className="h-3.5 w-3.5 text-[color:var(--color-primary)]" /> {b.merchantName} {b.city ? `· ${b.city}` : ''}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[color:var(--color-primary)]" /> {b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[color:var(--color-primary)]" /> {b.time}</span>
                        {b.durationMinutes && <span className="text-[color:var(--color-outline)] font-medium">({b.durationMinutes} min duration)</span>}
                      </div>
                      
                      <div className="text-[11px] font-mono text-[color:var(--color-outline)]">
                        Reference: <span className="font-bold text-[color:var(--color-on-surface)]">{b.ref}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 border-t border-[color:var(--color-outline-variant)]/10 md:pt-0 md:border-t-0 shrink-0">
                      <span className="font-black text-[color:var(--color-primary)] text-lg mr-2">₹{b.amount}</span>
                      
                      {b.status === 'CONFIRMED' ? (
                        <>
                          <button
                            onClick={() => handleCancel(b.id, b.ref)}
                            className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/15 active:scale-[0.97] transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          
                          <Link
                            href={`/booking/success?ref=${b.ref}`}
                            className="flex items-center gap-1.5 rounded-xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/30 px-4 py-2.5 text-xs font-bold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/20 active:scale-[0.97] transition-all"
                          >
                            <QrCode className="h-3.5 w-3.5" /> View Ticket
                          </Link>
                        </>
                      ) : b.status === 'CANCELLED' ? (
                        <span className="text-xs text-[color:var(--color-outline)] font-semibold border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/40 px-3.5 py-2.5 rounded-xl">
                          Cancelled
                        </span>
                      ) : (
                        <span className="text-xs text-green-400 font-semibold border border-green-500/20 bg-green-500/5 px-3.5 py-2.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
