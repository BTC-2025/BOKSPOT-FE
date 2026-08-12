'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Star, Clock, MapPin, Shield, Phone, Mail, Calendar, Info, X, Users, CheckCircle2, ChevronLeft, Map } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocationStore } from '../../../../lib/store';
import { getMerchantBySlug } from '../../../../lib/mockData';
import { api } from '../../../../lib/api';

export default function MerchantDetailPage() {
  const params = useParams();
  const bookingType = params?.bookingType as string;
  const category = params?.category as string;
  const merchantSlug = decodeURIComponent(params?.merchantSlug as string);
  const { city } = useLocationStore();
  
  const [liveServices, setLiveServices] = useState<any[]>([]);
  const [viewState, setViewState] = useState<'venue' | 'booking'>('venue');
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  useEffect(() => {
    api.services.list({ merchantId: merchantSlug }).then(res => {
      if (res && res.data && res.data.length > 0) {
        setLiveServices(res.data);
      } else {
        api.services.list({ search: merchantSlug }).then(resFallback => {
           if (resFallback && resFallback.data) {
             setLiveServices(resFallback.data);
           }
        });
      }
    });
  }, [merchantSlug]);

  const mockMerchant = getMerchantBySlug(merchantSlug, category, bookingType, city);
  const liveMerchantObj = liveServices.length > 0 ? liveServices[0].merchantObj : null;
  
  const merchant = {
    ...mockMerchant,
    name: liveMerchantObj?.name || mockMerchant.name || merchantSlug,
    services: liveServices.length > 0 
      ? liveServices.flatMap(ls => {
          const listings = ls.rawConfig?.metadata?.listings || [];
          if (listings.length > 0) {
            return listings.map((list: any) => ({
              id: list.id || ls.id + '-' + (list.name || list.title || ls.name),
              name: list.name || list.title || ls.name,
              desc: list.description || ls.shortDescription || ls.description,
              duration: `${ls.durationMinutes || 60} min`,
              price: list.price || ls.basePrice,
              image: list.imageUrl || ls.image
            }));
          }
          return [{
             id: ls.id,
             name: ls.name,
             desc: ls.shortDescription || ls.description,
             duration: `${ls.durationMinutes || 60} min`,
             price: ls.basePrice,
             image: ls.image
          }];
      })
      : mockMerchant.services
  };

  if (viewState === 'booking') {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        {/* District.in Style Header for Booking Selection */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewState('venue')} className="w-10 h-10 rounded-full hover:bg-[var(--bg-surface)] flex items-center justify-center transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-sm font-black leading-tight uppercase tracking-widest">{category}</h1>
              <p className="text-xs text-[var(--text-secondary)] font-bold">{merchant.name}</p>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-32 max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Date Strip */}
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Select Date</h2>
              <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                {Array.from({length: 14}).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const isSelected = selectedDate === i;
                  return (
                    <button 
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      className={`shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-base)] shadow-lg scale-105' 
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold mb-1">{d.toLocaleDateString('en-US', { month: 'short', weekday: 'short' })}</span>
                      <span className="text-xl font-black">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inventory / Rooms */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">{merchant.services.length} Rooms Available</h2>
              <div className="space-y-4">
                {merchant.services.map((service, index) => {
                  const isSelected = selectedRoom === service.id;
                  return (
                    <label 
                      key={service.id || index}
                      className={`block p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[var(--text-primary)] bg-[var(--text-primary)]/5 ring-1 ring-[var(--text-primary)]' 
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          <img src={service.image || `https://picsum.photos/seed/${service.id || index}/100/100`} alt={service.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)]">{service.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">{service.desc || 'Standard amenities included'}</p>
                            <div className="text-sm font-black text-[var(--text-primary)] mt-2">₹{service.price}</div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <input 
                            type="radio" 
                            name="room_selection" 
                            checked={isSelected}
                            onChange={() => setSelectedRoom(service.id)}
                            className="w-5 h-5 accent-[var(--text-primary)] cursor-pointer"
                          />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sticky Proceed Footer */}
        <AnimatePresence>
          {selectedRoom && (
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="max-w-3xl mx-auto">
                <Link href={`/service/${selectedRoom}`} className="block w-full">
                  <button className="w-full bg-[var(--text-primary)] text-[var(--bg-base)] font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-xl hover:opacity-90 active:scale-[0.99] transition-all">
                    Proceed to Booking
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // --- DEFAULT VENUE VIEW (District Image 2 Style) ---
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-24">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={`/${bookingType}/${category}`} className="w-10 h-10 rounded-full hover:bg-[var(--bg-surface)] flex items-center justify-center transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors shrink-0">Home</Link>
              <ChevronRight size={14} className="shrink-0" />
              <Link href={`/${bookingType}`} className="hover:text-[var(--text-primary)] transition-colors truncate shrink-0">{bookingType}</Link>
              <ChevronRight size={14} className="shrink-0" />
              <span className="text-[var(--text-primary)] truncate font-bold">{merchant.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 container-main">
        <h1 className="text-3xl lg:text-4xl font-black mb-6">{merchant.name}</h1>

        {/* Gallery Collage (District Style) */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] lg:h-[450px] rounded-3xl overflow-hidden mb-10">
          <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer">
            <img src={`https://picsum.photos/seed/${merchantSlug}1/800/800`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden group cursor-pointer">
            <img src={`https://picsum.photos/seed/${merchantSlug}2/400/400`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden group cursor-pointer">
            <img src={`https://picsum.photos/seed/${merchantSlug}3/400/400`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden group cursor-pointer">
            <img src={`https://picsum.photos/seed/${merchantSlug}4/400/400`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden group cursor-pointer">
            <img src={`https://picsum.photos/seed/${merchantSlug}5/400/400`} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg">Show all photos</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Content Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Category Tag */}
            <div>
              <h2 className="text-lg font-bold mb-3">{merchant.services.length} Option{merchant.services.length !== 1 ? 's' : ''} available</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(merchant.services.map(s => s.name))).map((serviceName, idx) => (
                  <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    {serviceName}
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black">About</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
                {merchant.about || `Welcome to ${merchant.name}. We provide a well-maintained environment suitable for all your needs. Whether you're visiting for a short stay or looking for premium amenities, our facility ensures a high-quality experience.`}
              </p>
              <button className="text-sm font-bold flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                Read more <ChevronRight size={14} />
              </button>
            </div>

            {/* Things to Know / Amenities */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Things to know</h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-semibold">24/7 Check-in available</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-semibold">Parking (Free)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-semibold">Washrooms available</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-semibold">Seating lounge</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-surface)] transition-colors">
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-[var(--text-muted)]" />
                  <span className="font-bold">Terms and Conditions</span>
                </div>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          {/* Right Sticky Column (District.in Style "Book Slots") */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <button 
                onClick={() => setViewState('booking')}
                className="w-full bg-[var(--text-primary)] text-[var(--bg-base)] py-5 rounded-2xl font-black text-lg tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
              >
                Book Slots
              </button>

              <div className="border border-[var(--border-subtle)] rounded-2xl p-5 bg-[var(--bg-surface)]/50">
                <h3 className="font-bold mb-1 text-sm">{merchant.name} - {city}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                  {merchant.address}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                  <Map size={14} />
                  <span>View on Map • 5.2 km away</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
