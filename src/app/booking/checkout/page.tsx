'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, CreditCard, Clock, MapPin, ArrowLeft, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { useBookingFlowStore, useUserStore } from '../../../lib/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedService, selectedSlot, addBooking, notes } = useBookingFlowStore();
  const { user } = useUserStore();

  const [name, setName] = useState('User Name');
  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate details from logged in user
  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Time remaining count down state
  const [timeLeft, setTimeLeft] = useState(585); // 9 mins 45 secs

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!selectedService || !selectedSlot) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] transition-colors duration-300">
        <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[var(--color-outline-variant)]/30 backdrop-blur-xl">
          <div className="container-main flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="btn-ghost p-2">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2 text-sm text-[var(--color-outline)]">
                <Link href="/" className="hover:text-[var(--color-on-surface)] transition-colors">Home</Link>
                <ChevronRight size={14} />
                <span className="text-[var(--color-on-surface)]">Checkout</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-32 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[color:var(--color-on-surface)]">No Active Booking Session</h2>
          <p className="text-sm text-[color:var(--color-on-surface-variant)] mt-1.5 max-w-sm">You haven't selected a service or date/time slot. Please browse services to start booking.</p>
          <Link href="/search" className="mt-6 rounded-xl bg-[color:var(--color-primary)] px-5 py-3 text-sm font-bold text-[color:var(--color-on-primary)] transition-transform hover:scale-[1.02] shadow-lg shadow-[color:var(--color-primary)]/10">
            Browse Services
          </Link>
        </div>
      </main>
    );
  }

  const price = selectedService.price;
  const platformFee = 29;
  const gst = Math.round(price * 0.18);
  const total = price + platformFee + gst;

  // Format date display
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en', options);
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all contact fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Simulate Payment processing
    setTimeout(() => {
      const generateBookingRef = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let ref = 'BK-';
        for (let i = 0; i < 6; i++) {
          ref += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return ref;
      };

      const ref = generateBookingRef();
      const merchantName = selectedService.merchant?.name || selectedService.merchant || '';
      const categoryName = selectedService.category?.name || selectedService.category || 'Default';

      const newBooking = {
        id: String(Date.now()),
        ref: ref,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        merchantName: merchantName,
        category: categoryName,
        date: selectedSlot.date,
        time: selectedSlot.time,
        amount: total,
        status: 'CONFIRMED' as const,
        city: selectedService.city,
        durationMinutes: selectedService.duration,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes: notes || '',
        bookedAt: new Date().toISOString(),
      };

      addBooking(newBooking);

      // Sync booking with NestJS backend so that port 3600 (Admin) can capture it
      fetch('/api/v1/bookings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      })
        .then(res => res.json())
        .then(data => console.log('Successfully synced booking to backend:', data))
        .catch(err => console.error('Error syncing booking to backend:', err));

      setIsSubmitting(false);
      router.push(`/booking/success?ref=${ref}`);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-on-surface)] transition-colors duration-300">
      {/* Sticky header */}
      <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[color:var(--color-outline-variant)]/30 backdrop-blur-xl">
        <div className="container-main flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/service/${selectedService.id}`} className="btn-ghost p-2">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[color:var(--color-outline)]">
              <Link href="/" className="hover:text-[color:var(--color-on-surface)] transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link href="/search" className="hover:text-[color:var(--color-on-surface)] transition-colors">Search</Link>
              <ChevronRight size={14} />
              <Link href={`/service/${selectedService.id}`} className="hover:text-[color:var(--color-on-surface)] transition-colors">Details</Link>
              <ChevronRight size={14} />
              <span className="text-[color:var(--color-on-surface)]">Checkout</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="container-main py-8 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-[24px] md:text-[28px] font-black tracking-tight mb-6">Booking Checkout</h1>
            
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5 items-start">
              <div className="lg:col-span-3 space-y-4">
                {/* Service Details summary */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 p-6 card-glass">
                  <h2 className="font-bold text-lg mb-4 text-[color:var(--color-on-surface)] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[color:var(--color-primary)]" /> Booking Details
                  </h2>
                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                      <span className="text-[color:var(--color-on-surface-variant)]">Service</span>
                      <span className="font-bold text-[color:var(--color-on-surface)]">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                      <span className="text-[color:var(--color-on-surface-variant)]">Merchant</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)]">{selectedService.merchant}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                      <span className="text-[color:var(--color-on-surface-variant)]">Date</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)]">{formatDate(selectedSlot.date)}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                      <span className="text-[color:var(--color-on-surface-variant)]">Time Slot</span>
                      <span className="font-bold text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 px-2.5 py-1 rounded-lg border border-[color:var(--color-primary)]/20">{selectedSlot.time}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                      <span className="text-[color:var(--color-on-surface-variant)]">Duration</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)]">{selectedService.duration} minutes</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[color:var(--color-on-surface-variant)]">Venue Address</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)] flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[color:var(--color-primary)]" /> {selectedService.city}</span>
                    </div>
                  </div>
                </motion.div>

                {/* User Input Form */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 p-6 card-glass">
                  <h2 className="font-bold text-lg mb-4 text-[color:var(--color-on-surface)]">Contact Information</h2>
                  
                  {error && (
                    <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 text-xs font-semibold text-red-500 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[color:var(--color-on-surface-variant)] mb-1.5 uppercase tracking-wider">Full Name</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)]/50 px-4 py-3 text-sm text-[color:var(--color-on-surface)] outline-none focus:border-[color:var(--color-primary)]/50 focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-[color:var(--color-on-surface-variant)] mb-1.5 uppercase tracking-wider">Email Address</label>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)]/50 px-4 py-3 text-sm text-[color:var(--color-on-surface)] outline-none focus:border-[color:var(--color-primary)]/50 focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                          placeholder="e.g. john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[color:var(--color-on-surface-variant)] mb-1.5 uppercase tracking-wider">Phone Number</label>
                        <input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)]/50 px-4 py-3 text-sm text-[color:var(--color-on-surface)] outline-none focus:border-[color:var(--color-primary)]/50 focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                          placeholder="e.g. +91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Payment summary */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 p-6 card-glass">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-[color:var(--color-on-surface)]">
                    <CreditCard className="h-5 w-5 text-[color:var(--color-primary)]" /> Payment Options
                  </h2>
                  <div className="rounded-xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/8 p-4 flex items-center gap-3">
                    <div className="h-10 w-14 rounded-lg bg-[color:var(--color-surface-container-highest)] border border-[color:var(--color-outline-variant)]/40 flex items-center justify-center text-[color:var(--color-primary)] font-bold text-xs tracking-wider shadow">
                      UPI/CARD
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[color:var(--color-on-surface)]">Direct Razorpay Portal</div>
                      <div className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5">UPI, Cards, Net Banking, and Wallets supported</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--color-outline)]">
                    <Shield className="h-4 w-4 text-green-500 shrink-0" /> Secure 256-bit SSL encrypted checkout platform
                  </div>
                </motion.div>
              </div>

              {/* Sidebar summary */}
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="sticky top-20 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 p-6 card-glass">
                  <h2 className="font-bold text-lg mb-4 text-[color:var(--color-on-surface)]">Price Summary</h2>
                  
                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[color:var(--color-on-surface-variant)]">Service Fee</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)]">₹{price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[color:var(--color-on-surface-variant)]">Platform Fee</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)]">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[color:var(--color-on-surface-variant)]">GST (18%)</span>
                      <span className="font-semibold text-[color:var(--color-on-surface)]">₹{gst}</span>
                    </div>
                    <hr className="border-[color:var(--color-outline-variant)]/20 my-1" />
                    <div className="flex justify-between items-center font-black text-lg py-1">
                      <span className="text-[color:var(--color-on-surface)]">Total Amount</span>
                      <span className="text-[color:var(--color-primary)] text-xl">₹{total}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 font-bold text-[color:var(--color-on-primary)] transition-all shadow-lg ${
                      isSubmitting 
                        ? 'bg-gray-500 cursor-not-allowed opacity-80' 
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25 active:scale-[0.98]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Pay & Confirm Booking
                      </>
                    )}
                  </button>

                  {timeLeft > 0 ? (
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[color:var(--color-outline)] bg-[color:var(--color-surface-dim)]/40 py-2 rounded-lg border border-[color:var(--color-outline-variant)]/10">
                      <Clock className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
                      <span>Slot hold expires in <span className="font-bold text-[color:var(--color-on-surface)] font-mono">{formatTime(timeLeft)}</span></span>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-red-500 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Slot hold expired. Please re-select a slot.</span>
                    </div>
                  )}
                </motion.div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
