'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Clock, MapPin, 
  Phone, AlertCircle, ChevronRight,
  Package, Check, Home, 
  Map, MessageSquare, XCircle, ArrowLeft,
  Navigation, CheckCircle, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingFlowStore } from '../../lib/store';

function TracksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  
  const { bookings, cancelBooking } = useBookingFlowStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-primary)]/10 to-blue-500/10 blur-[100px]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-3xl text-center max-w-md w-full shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Booking Not Found</h2>
          <p className="text-slate-400 mb-8">We couldn't locate the tracking details for this session. It may have been removed.</p>
          <Link href="/user/bookings" className="block w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all">
            Return to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const isCancelled = booking.status === 'CANCELLED';
  const isCompleted = booking.status === 'COMPLETED';
  const isConfirmed = booking.status === 'CONFIRMED';

  const getStatusColor = () => {
    if (isCancelled) return 'from-red-500 to-rose-600';
    if (isCompleted) return 'from-blue-500 to-indigo-600';
    return 'from-[color:var(--color-primary)] to-emerald-400';
  };

  const STAGES = isCancelled 
    ? [
        { id: 'placed', label: 'Requested', icon: Package, completed: true, active: false },
        { id: 'cancelled', label: 'Cancelled', icon: XCircle, completed: true, active: true, isError: true }
      ]
    : [
        { id: 'placed', label: 'Requested', icon: Package, completed: true, active: false },
        { id: 'confirmed', label: 'Confirmed', icon: Check, completed: true, active: isConfirmed },
        { id: 'progress', label: 'In Progress', icon: Clock, completed: isCompleted, active: false },
        { id: 'completed', label: 'Completed', icon: Home, completed: isCompleted, active: isCompleted }
      ];

  const EVENTS = [
    ...(isCancelled ? [{
      id: 'evt-cancel', title: 'Booking Terminated', date: booking.date, time: 'Now', status: 'active', icon: XCircle
    }] : []),
    ...(isCompleted ? [{
      id: 'evt-complete', title: 'Service Fulfilled', date: booking.date, time: booking.time, status: 'active', icon: CheckCircle2
    }] : []),
    ...(isConfirmed && !isCancelled && !isCompleted ? [{
      id: 'evt-upcoming', title: 'Awaiting Check-in', date: booking.date, time: booking.time, status: 'active', icon: Clock
    }] : []),
    { id: 'evt-confirm', title: 'Confirmed by Merchant', date: booking.createdAt || booking.date, time: 'System', status: 'completed', icon: CheckCircle2 },
    { id: 'evt-placed', title: 'Booking Requested', date: booking.createdAt || booking.date, time: 'System', status: 'completed', icon: Package }
  ];

  const handleCancel = () => {
    if (confirm(`Are you certain you want to cancel reservation ${booking.ref}?`)) {
      cancelBooking(booking.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden pb-24">
      {/* Dynamic Background Glows based on status */}
      <div className={`absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b ${getStatusColor()} opacity-[0.03] pointer-events-none`} />
      <div className={`absolute top-20 right-20 w-96 h-96 bg-gradient-to-br ${getStatusColor()} rounded-full blur-[120px] opacity-[0.08] pointer-events-none`} />

      {/* Floating Header */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/user/bookings" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tracking</p>
            <p className="text-sm font-extrabold text-slate-800">#{booking.ref}</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8 space-y-8 relative z-10">
        
        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${getStatusColor()}`} />
          
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                  isCancelled ? 'bg-red-50 text-red-600' :
                  isCompleted ? 'bg-blue-50 text-blue-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {isConfirmed && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                  {isCompleted && <CheckCircle2 size={14} />}
                  {isCancelled && <XCircle size={14} />}
                  {booking.status}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-2">
                {booking.serviceName}
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                {booking.merchantName} {booking.city && `• ${booking.city}`}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-extrabold text-slate-800">{booking.date} <span className="text-slate-400 font-medium mx-1">at</span> {booking.time}</p>
                </div>
                <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="font-extrabold text-slate-800 text-xl">₹{booking.amount}</p>
                </div>
              </div>
            </div>

            {!isCancelled && (
              <div className="shrink-0 flex items-center justify-center">
                <Link href={`/booking/success?ref=${booking.ref}`} className="group relative w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Ticket className="w-5 h-5 text-[color:var(--color-primary)]" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-[color:var(--color-primary)]">View Ticket</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Glowing Progress Nodes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="relative flex flex-col sm:flex-row justify-between gap-10 sm:gap-0">
            {/* Background Line */}
            <div className="absolute top-6 left-12 right-12 h-1 bg-slate-100 rounded-full hidden sm:block" />
            <div className="absolute top-6 bottom-6 left-6 w-1 bg-slate-100 rounded-full sm:hidden" />

            {/* Animated Active Line */}
            <div className="absolute top-6 left-12 right-12 h-1 hidden sm:block z-0 overflow-hidden rounded-full">
              <motion.div 
                className={`h-full bg-gradient-to-r ${getStatusColor()}`}
                initial={{ width: '0%' }}
                animate={{ width: isCancelled || isCompleted ? '100%' : isConfirmed ? '50%' : '0%' }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="absolute top-6 bottom-6 left-6 w-1 sm:hidden z-0 overflow-hidden rounded-full">
              <motion.div 
                className={`w-full bg-gradient-to-b ${getStatusColor()}`}
                initial={{ height: '0%' }}
                animate={{ height: isCancelled || isCompleted ? '100%' : isConfirmed ? '50%' : '0%' }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 flex-1 sm:text-center group">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                    stage.active 
                      ? (stage.isError ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' : 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110') 
                      : stage.completed 
                        ? (stage.isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white') 
                        : 'bg-white text-slate-300 border-2 border-slate-100'
                  }`}>
                    <Icon size={20} strokeWidth={stage.active ? 2.5 : 2} />
                    {stage.active && !stage.isError && (
                      <span className="absolute -inset-1 rounded-2xl border-2 border-green-500/30 animate-ping" />
                    )}
                  </div>
                  <div className="sm:mt-2">
                    <p className={`font-black text-sm uppercase tracking-wider ${
                      stage.active || stage.completed ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {stage.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Timeline & Action Orbs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-[2rem] p-6 sm:p-10 shadow-lg shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="font-black text-xl text-slate-900 mb-8 flex items-center gap-3">
              <Navigation className="text-[color:var(--color-primary)]" size={24} /> 
              Journey Log
            </h3>
            
            <div className="relative pl-6 ml-2 space-y-10 before:absolute before:inset-0 before:ml-0 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
              {EVENTS.map((event, i) => (
                <div key={event.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 group">
                  <div className="absolute -left-9 mt-1.5 sm:mt-0 w-6 h-6 bg-white border-[3px] border-slate-100 rounded-full flex items-center justify-center z-10 transition-colors group-hover:border-slate-300">
                    {event.status === 'active' ? (
                      <div className={`w-2.5 h-2.5 rounded-full shadow-md ${isCancelled ? 'bg-red-500 shadow-red-500/50 animate-pulse' : 'bg-green-500 shadow-green-500/50 animate-pulse'}`} />
                    ) : (
                      <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-extrabold ${event.status === 'active' ? 'text-slate-900 text-lg' : 'text-slate-500 text-base'}`}>
                      {event.title}
                    </p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right bg-slate-50 px-4 py-2 rounded-xl">
                    <p className={`text-sm font-black ${event.status === 'active' ? (isCancelled ? 'text-red-600' : 'text-[color:var(--color-primary)]') : 'text-slate-500'}`}>{event.time}</p>
                    <p className="text-xs text-slate-400 font-semibold">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
              <h3 className="font-black text-lg text-slate-900 mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Phone size={20} />
                  </div>
                  <span className="text-xs font-bold">Call</span>
                </button>
                
                <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Map size={20} />
                  </div>
                  <span className="text-xs font-bold">Directions</span>
                </button>

                <button className="col-span-2 flex items-center justify-between p-4 rounded-2xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <MessageSquare size={18} className="text-slate-500" />
                    </div>
                    <span className="text-sm font-bold">24/7 Support Chat</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {!isCancelled && !isCompleted && (
              <div className="bg-white rounded-[2rem] p-6 shadow-lg shadow-red-500/5 border border-red-50">
                <h3 className="font-black text-lg text-slate-900 mb-4">Danger Zone</h3>
                <button 
                  onClick={handleCancel}
                  className="w-full py-4 text-sm font-black text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-colors shadow-lg shadow-red-500/20 active:scale-95"
                >
                  Cancel Reservation
                </button>
                <p className="text-[10px] font-bold text-slate-400 text-center mt-3 uppercase tracking-wider">This action cannot be undone</p>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default function TracksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[color:var(--color-primary)] rounded-full animate-spin" />
      </div>
    }>
      <TracksContent />
    </Suspense>
  );
}
