'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, Clock, MapPin, 
  Phone, Share2, AlertCircle, ChevronRight,
  Package, Check, Truck, Home, 
  Map, MessageSquare, XCircle, Search
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock booking details
const MOCK_BOOKING = {
  id: 'BKG-982374',
  merchantName: 'Grand Hotel & Spa',
  serviceName: 'Deluxe Room (2 Nights)',
  image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80',
  status: 'In Progress', // 'Placed', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'
  statusTitle: 'Check-in Confirmed',
  statusDescription: 'Your stay is currently active. Check-out is on Aug 26 at 11:00 AM.',
  bookingDate: 'Aug 24, 2026',
  totalAmount: '₹ 4,500',
  merchantPhone: '+91 98765 43210',
  merchantAddress: '123 Residency Road, Bangalore, Karnataka',
};

// Tracking stages
const STAGES = [
  { id: 'placed', label: 'Booking Placed', icon: Package, completed: true },
  { id: 'confirmed', label: 'Confirmed', icon: Check, completed: true },
  { id: 'progress', label: 'In Progress', icon: Clock, completed: true, active: true },
  { id: 'completed', label: 'Completed', icon: Home, completed: false }
];

// Detailed events log
const EVENTS = [
  { id: 1, title: 'Check-in Completed at Reception', date: 'Aug 25, 2026', time: '12:15 PM', status: 'active', icon: MapPin },
  { id: 2, title: 'Reminder: Upcoming Check-in', date: 'Aug 25, 2026', time: '08:00 AM', status: 'completed', icon: Clock },
  { id: 3, title: 'Booking Confirmed by Grand Hotel & Spa', date: 'Aug 24, 2026', time: '04:30 PM', status: 'completed', icon: CheckCircle2 },
  { id: 4, title: 'Payment Successful', date: 'Aug 24, 2026', time: '04:26 PM', status: 'completed', icon: CheckCircle2 },
  { id: 5, title: 'Booking Placed', date: 'Aug 24, 2026', time: '04:25 PM', status: 'completed', icon: Package }
];

function TracksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || MOCK_BOOKING.id;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb & Search */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[color:var(--color-primary)] transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/profile" className="hover:text-[color:var(--color-primary)] transition-colors">Your Bookings</Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-slate-900">Track Booking</span>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)] w-full sm:w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

        {/* Top Summary Card */}
        <div className="bg-white p-5 md:p-7 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Accent bar at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500" />
          
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">{MOCK_BOOKING.statusTitle}</h1>
              <p className="text-slate-600 text-sm md:text-base">{MOCK_BOOKING.statusDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95">
                View Details
              </button>
              <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95">
                Invoice
              </button>
            </div>
          </div>
          
          <div className="flex gap-5 items-center">
            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group">
              <img src={MOCK_BOOKING.image} alt={MOCK_BOOKING.serviceName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking #{bookingId}</p>
              <h2 className="font-extrabold text-slate-900 text-lg md:text-xl truncate">{MOCK_BOOKING.serviceName}</h2>
              <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                <MapPin size={14} className="text-slate-400" />
                {MOCK_BOOKING.merchantName}
              </p>
              <p className="font-bold mt-2 text-slate-900 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">{MOCK_BOOKING.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Tracking Stages (Horizontal Timeline for Desktop, Vertical for Mobile) */}
        <div className="bg-white p-5 md:p-7 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-extrabold text-lg text-slate-900 mb-8">Booking Progress</h3>
          
          {/* Stages Container */}
          <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-slate-100 rounded-full z-0">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                style={{ width: '66%' }} // Based on In Progress state
              />
            </div>

            {/* Mobile connecting line */}
            <div className="md:hidden absolute top-6 bottom-6 left-6 w-1 bg-slate-100 rounded-full z-0">
              <div 
                className="w-full bg-green-500 rounded-full transition-all duration-1000" 
                style={{ height: '66%' }} // Based on In Progress state
              />
            </div>

            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 flex-1 md:text-center group">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${
                    stage.active ? 'bg-green-500 text-white shadow-green-200' :
                    stage.completed ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon size={20} strokeWidth={stage.active ? 2.5 : 2} />
                  </div>
                  <div className="md:mt-1">
                    <p className={`font-bold text-sm ${stage.active || stage.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stage.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Timeline & Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Detailed Events Log */}
          <div className="md:col-span-2 bg-white p-5 md:p-7 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-extrabold text-lg text-slate-900 mb-6">Tracking Details</h3>
            
            <div className="relative pl-6 ml-2 space-y-8 before:absolute before:inset-0 before:ml-0 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
              {EVENTS.map((event, index) => {
                const EventIcon = event.icon;
                return (
                  <div key={event.id} className="relative">
                    {/* Node Dot */}
                    <div className="absolute -left-9 mt-1.5 w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center z-10 shadow-sm">
                      {event.status === 'active' ? (
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                      <div>
                        <p className={`font-bold ${event.status === 'active' ? 'text-slate-900 text-base' : 'text-slate-600 text-sm'}`}>
                          {event.title}
                        </p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className={`text-sm font-semibold ${event.status === 'active' ? 'text-green-600' : 'text-slate-500'}`}>{event.time}</p>
                        <p className="text-xs text-slate-400">{event.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Help */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-extrabold text-slate-900 mb-4">Need help?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm">Call Merchant</p>
                    <p className="text-xs text-slate-500">{MOCK_BOOKING.merchantPhone}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Map size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm">Get Directions</p>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">View on Maps</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm">Support Chat</p>
                    <p className="text-xs text-slate-500">24/7 Assistance</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-extrabold text-slate-900 mb-4">Manage Order</h3>
              <div className="space-y-2">
                <button className="w-full py-2.5 px-4 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
                  Reschedule Booking
                </button>
                <button className="w-full py-2.5 px-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TracksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[color:var(--color-primary)] rounded-full animate-spin" />
      </div>
    }>
      <TracksContent />
    </Suspense>
  );
}
