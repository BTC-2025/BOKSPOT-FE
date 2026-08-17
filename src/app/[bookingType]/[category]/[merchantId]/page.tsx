'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Clock, CheckCircle2, ChevronRight, Info, ShieldCheck, Search, Users, Utensils, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useLocationStore } from '@/lib/store';

export default function VenueProfilePage() {
  const params = useParams();
  const router = useRouter();
  const bookingType = params?.bookingType as string;
  const category = params?.category as string;
  const merchantId = params?.merchantId as string;
  const { city } = useLocationStore();

  const [liveServices, setLiveServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // We are passing the merchantId to filter services belonging to this merchant
    api.services.list({}).then(res => {
      if (res && res.data) {
        const merchantServices = res.data.filter((s: any) => 
          (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId))
        );
        setLiveServices(merchantServices);
      }
      setLoading(false);
    });
  }, [merchantId]);

  const venueName = liveServices.length > 0 ? (liveServices[0].merchantObj?.name || liveServices[0].merchant || 'Venue') : 'Loading...';
  const address = liveServices.length > 0 ? (liveServices[0].merchantObj?.address || `${city || 'Chennai'}`) : '';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div><p>Loading Venue...</p></div></div>;
  }

  if (liveServices.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><p>Venue not found or has no services.</p></div>;
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface)] pb-32">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[color:var(--color-surface)]/80 backdrop-blur-xl border-b border-[color:var(--color-outline-variant)]/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">{bookingType.replace('-', ' ')}</span>
          <h1 className="text-sm font-bold truncate max-w-[250px]">{venueName}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-[color:var(--color-on-surface)]">{venueName}</h1>

        {/* Hero Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 rounded-3xl overflow-hidden mb-8 h-[300px] md:h-[400px]">
          <div className="relative h-full w-full">
            <img src={`https://picsum.photos/seed/${merchantId}1/800/600`} alt="Venue" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <img src={`https://picsum.photos/seed/${merchantId}2/400/300`} alt="Detail" className="w-full h-full object-cover rounded-xl" />
            <img src={`https://picsum.photos/seed/${merchantId}3/400/300`} alt="Detail" className="w-full h-full object-cover rounded-xl" />
            <img src={`https://picsum.photos/seed/${merchantId}4/400/300`} alt="Detail" className="w-full h-full object-cover rounded-xl" />
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <img src={`https://picsum.photos/seed/${merchantId}5/400/300`} alt="Detail" className="w-full h-full object-cover brightness-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform">Show all photos</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Options Summary */}
            <div>
              <h2 className="text-xl font-bold mb-4">{liveServices.length} Options available</h2>
              <div className="flex flex-wrap gap-3">
                {liveServices.map(svc => (
                  <button 
                    key={svc.id} 
                    onClick={() => router.push(`/service/${svc.id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/5 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-on-primary)] transition-all cursor-pointer text-xs font-bold shadow-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span>{svc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-[color:var(--color-outline-variant)]/20" />

            {/* About */}
            {liveServices[0]?.rawConfig?.description && (
              <>
                <div>
                  <h2 className="text-xl font-bold mb-4">About</h2>
                  <p className="text-[color:var(--color-on-surface-variant)] text-sm leading-relaxed mb-3">
                    {liveServices[0].rawConfig.description}
                  </p>
                </div>
                <hr className="border-[color:var(--color-outline-variant)]/20" />
              </>
            )}

            {/* Things to know (Dynamic Toggles) */}
            <div>
              <h2 className="text-xl font-bold mb-6">Things to know</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                {liveServices[0]?.rawConfig?.isTimingEnabled && (
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Clock size={20} className="text-[color:var(--color-outline)]" /> {liveServices[0].rawConfig.timingDetails || '24/7 Check-in available'}
                  </div>
                )}
                {liveServices[0]?.rawConfig?.isCapacityEnabled && (
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Users size={20} className="text-[color:var(--color-outline)]" /> Capacity: {liveServices[0].rawConfig.participantCapacity} max
                  </div>
                )}
                {liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasAC && (
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={20} className="text-[color:var(--color-outline)]" /> Air Conditioning (AC)
                  </div>
                )}
                {liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasWiFi && (
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={20} className="text-[color:var(--color-outline)]" /> Free WiFi
                  </div>
                )}
                {liveServices[0]?.rawConfig?.metadata?.listings?.[0]?.metadata?.hasBreakfast && (
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Utensils size={20} className="text-[color:var(--color-outline)]" /> Breakfast Included
                  </div>
                )}
              </div>
              
              {/* Dynamic Special Instructions & T&C */}
              {liveServices[0]?.rawConfig?.isInstructionsEnabled && (
                <div className="mt-6 p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-primary)]/5">
                  <div className="flex items-center gap-3 font-bold text-sm mb-2 text-[color:var(--color-primary)]">
                    <Info size={20} /> Special Instructions
                  </div>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)] leading-relaxed">
                    {liveServices[0].rawConfig.specialInstructions}
                  </p>
                </div>
              )}

              {liveServices[0]?.rawConfig?.isRestrictionsEnabled && (
                <div className="mt-4 p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-red-500/5">
                  <div className="flex items-center gap-3 font-bold text-sm mb-2 text-red-500">
                    <ShieldCheck size={20} /> Terms & Restrictions
                  </div>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)] leading-relaxed">
                    {liveServices[0].rawConfig.restrictions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar / Book Button */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-24 space-y-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-[color:var(--color-on-primary)] py-4 rounded-2xl font-extrabold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Book
              </button>

              <div className="p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-variant)]/10">
                <h3 className="font-bold text-sm mb-1">{venueName} - {city || 'Chennai'}</h3>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] mb-3">{address || '168 Main Road, Block 1'}</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Map size={14} /> View on Map
                  {/* Calculate distance dynamically */}
                  {(() => {
                    const store = useLocationStore.getState();
                    if (store.latitude && store.longitude && liveServices[0]?.merchantObj?.latitude && liveServices[0]?.merchantObj?.longitude) {
                      const lat1 = store.latitude;
                      const lon1 = store.longitude;
                      const lat2 = liveServices[0].merchantObj.latitude;
                      const lon2 = liveServices[0].merchantObj.longitude;
                      const R = 6371; // Radius of the earth in km
                      const dLat = (lat2 - lat1) * Math.PI / 180;
                      const dLon = (lon2 - lon1) * Math.PI / 180;
                      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                                Math.sin(dLon/2) * Math.sin(dLon/2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                      const d = R * c; // Distance in km
                      return <span className="text-[color:var(--color-outline)] ml-1">• {d.toFixed(1)} km away</span>;
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[color:var(--color-surface)] rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[color:var(--color-outline-variant)]/20">
                <h2 className="text-2xl font-extrabold">Select Category</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveServices.map(svc => {
                     const numOptions = svc.rawConfig?.metadata?.listings ? svc.rawConfig.metadata.listings.length : 1;
                     return (
                       <button
                         key={svc.id}
                         onClick={() => router.push(`/service/${svc.id}`)}
                         className="flex flex-col text-left p-6 rounded-2xl border border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5 transition-all group"
                       >
                         <h3 className="text-lg font-bold mb-2 group-hover:text-[color:var(--color-primary)] transition-colors">{svc.name}</h3>
                         <p className="text-sm text-[color:var(--color-on-surface-variant)] font-medium">{numOptions} option{numOptions !== 1 ? 's' : ''}</p>
                       </button>
                     );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
