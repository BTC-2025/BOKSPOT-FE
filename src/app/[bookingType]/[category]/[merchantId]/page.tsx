'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Clock, CheckCircle2, ChevronRight, ChevronLeft, Info, ShieldCheck, Search, Users, Utensils, X } from 'lucide-react';
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
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch full merchant details for the Venue Profile (About, Gallery, Amenities)
        // If merchantId is the dummy megamerchant, we just fall back, but for real merchants this will get the filled details.
        let mData = null;
        if (merchantId !== '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e') {
          try {
            mData = await api.merchants.get(merchantId);
          } catch (e) {
            console.warn('Could not fetch merchant:', e);
          }
        }
        
        const res = await api.services.list({});
        if (active && res && res.data) {
          const merchantServices = res.data.filter((s: any) => {
            const isMatchMerchant = (s.merchantObj?.id === merchantId) || (s.merchant === merchantId) || (s.merchantObj?.name === merchantId) || (s.merchant === decodeURIComponent(merchantId));
            
            let isMatchType = true;
            if (merchantId === '2cf63fd7-6710-4ac6-a3fa-8cbda29fdc0e') {
              const bType = bookingType.toLowerCase();
              const typeKeywords = (bType.includes('stay') || bType.includes('hotel') || bType.includes('accommodation') || bType.includes('room')) ? ['hotel', 'room', 'resort', 'accommodation', 'stay'] :
                                   (bType.includes('sports') || bType.includes('turf') || bType.includes('play')) ? ['turf', 'cricket', 'football', 'badminton', 'tennis', 'court', 'sport', 'ground', 'ball'] :
                                   (bType.includes('health') || bType.includes('doctor') || bType.includes('clinic') || bType.includes('medical')) ? ['doctor', 'clinic', 'dental', 'medical', 'appointment', 'health'] :
                                   (bType.includes('dine') || bType.includes('food') || bType.includes('restaurant')) ? ['restaurant', 'dining', 'food', 'table', 'dine'] : 
                                   (bType.includes('salon') || bType.includes('spa') || bType.includes('beauty') || bType.includes('care')) ? ['salon', 'spa', 'beauty', 'hair', 'massage', 'care'] :
                                   (bType.includes('event') || bType.includes('party') || bType.includes('hall')) ? ['event', 'party', 'hall', 'wedding', 'banquet'] : [];
                                   
              if (typeKeywords.length > 0) {
                const catName = (s.category || '').toLowerCase();
                const svcName = (s.name || '').toLowerCase();
                const catSlug = (s.categoryObj?.slug || '').toLowerCase();
                isMatchType = typeKeywords.some(kw => catName.includes(kw) || svcName.includes(kw) || catSlug.includes(kw));
              }
            }
            return isMatchMerchant && isMatchType;
          });
          setLiveServices(merchantServices);
          if (mData) {
            setMerchantData(mData.data || mData);
          } else if (merchantServices.length > 0) {
            setMerchantData(merchantServices[0].merchantObj || {});
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchData();
    return () => { active = false; };
  }, [merchantId, bookingType]);

  const venueName = liveServices.length > 0 ? (liveServices[0].merchantObj?.name || liveServices[0].merchant || 'Venue') : 'Loading...';
  const address = liveServices.length > 0 ? (liveServices[0].merchantObj?.address || `${city || 'Chennai'}`) : '';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div><p>Loading Venue...</p></div></div>;
  }

  if (liveServices.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><p>Venue not found or has no services.</p></div>;
  }

  const finalMerchantObj = merchantData || liveServices[0]?.merchantObj || {};
  const validImages = (finalMerchantObj.images || []).filter((img: any) => typeof img === 'string' && img.trim() !== '');
  const galleryImages = validImages.length > 0 ? validImages : [
    `https://picsum.photos/seed/${merchantId}1/800/600`,
    `https://picsum.photos/seed/${merchantId}2/400/300`,
    `https://picsum.photos/seed/${merchantId}3/400/300`,
    `https://picsum.photos/seed/${merchantId}4/400/300`,
    `https://picsum.photos/seed/${merchantId}5/400/300`
  ];
  const aboutText = finalMerchantObj.description || liveServices[0]?.rawConfig?.description;
  const amenities = finalMerchantObj.amenities || [];

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
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[color:var(--color-on-surface)]">{venueName}</h1>
          {address && <p className="text-sm font-medium text-[color:var(--color-on-surface-variant)] mt-1">{address}</p>}
        </div>

        {/* Hero Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 rounded-3xl overflow-hidden mb-8 h-[300px] md:h-[400px]">
          <div className="relative h-full w-full cursor-pointer" onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}>
            <img src={galleryImages[0] || `https://picsum.photos/seed/${merchantId}1/800/600`} alt="Venue" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <div className="relative cursor-pointer" onClick={() => { setCurrentImageIdx(1); setIsGalleryOpen(true); }}>
              <img src={galleryImages[1] || galleryImages[0] || `https://picsum.photos/seed/${merchantId}2/400/300`} alt="Detail" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="relative cursor-pointer" onClick={() => { setCurrentImageIdx(2); setIsGalleryOpen(true); }}>
              <img src={galleryImages[2] || galleryImages[0] || `https://picsum.photos/seed/${merchantId}3/400/300`} alt="Detail" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="relative cursor-pointer" onClick={() => { setCurrentImageIdx(3); setIsGalleryOpen(true); }}>
              <img src={galleryImages[3] || galleryImages[0] || `https://picsum.photos/seed/${merchantId}4/400/300`} alt="Detail" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer" onClick={() => { setCurrentImageIdx(0); setIsGalleryOpen(true); }}>
              <img src={galleryImages[4] || galleryImages[0] || `https://picsum.photos/seed/${merchantId}5/400/300`} alt="Detail" className="w-full h-full object-cover brightness-50" />
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
              <h2 className="text-xl font-bold mb-4">
                {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length} Category available at {venueName}
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length === 0 ? (
                  <p className="text-sm text-[color:var(--color-on-surface-variant)] italic p-4">No specific categories have been added by the business yet.</p>
                ) : (
                  liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').map(svc => (
                    <div 
                      key={svc.id} 
                      onClick={() => router.push(`/service/${svc.id}`)}
                      className="flex shrink-0 w-64 h-20 bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer snap-start group"
                    >
                      <div className="w-20 shrink-0 bg-gray-100 relative">
                        <img 
                          src={svc.imageUrl || (svc.images && svc.images.length > 0 && svc.images[0] ? svc.images[0] : null) || `https://picsum.photos/seed/${svc.id}/200/200`} 
                          alt={svc.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <div className="p-3 flex items-center justify-center flex-1">
                        <h3 className="font-bold text-sm text-[color:var(--color-on-surface)] text-center leading-tight">
                          {svc.name}
                        </h3>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <hr className="border-[color:var(--color-outline-variant)]/20" />

            {/* About */}
            {aboutText && (
              <>
                <div>
                  <h2 className="text-xl font-bold mb-4">About</h2>
                  <p className="text-[color:var(--color-on-surface-variant)] text-sm leading-relaxed mb-3">
                    {aboutText}
                  </p>
                </div>
                <hr className="border-[color:var(--color-outline-variant)]/20" />
              </>
            )}

            {/* Things to know (Dynamic Toggles) */}
            <div>
              <h2 className="text-xl font-bold mb-6">Things to know</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                {amenities.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={20} className="text-[color:var(--color-outline)]" /> {amenity}
                  </div>
                ))}
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

              {/* Policies */}
              {finalMerchantObj.metadata?.policies && finalMerchantObj.metadata.policies.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Policies</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-[color:var(--color-on-surface-variant)] font-medium">
                    {finalMerchantObj.metadata.policies.map((policy: string, idx: number) => (
                      <li key={idx}>{policy}</li>
                    ))}
                  </ul>
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
                <div className="flex items-center gap-2 text-xs font-bold mb-4">
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
                
                {/* Around Property */}
                <div className="pt-4 border-t border-[color:var(--color-outline-variant)]/30">
                  <h4 className="text-xs font-bold text-[color:var(--color-on-surface)] mb-2 uppercase tracking-wider">Around Property</h4>
                  <ul className="space-y-1 text-xs text-[color:var(--color-on-surface-variant)] font-medium">
                    <li className="flex justify-between"><span>Hospital</span> <span>0.5 km</span></li>
                    <li className="flex justify-between"><span>Temple</span> <span>0.2 km</span></li>
                    <li className="flex justify-between"><span>Supermarket</span> <span>1.0 km</span></li>
                  </ul>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[color:var(--color-surface)] rounded-3xl shadow-2xl z-[99999] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[color:var(--color-outline-variant)]/20">
                <h2 className="text-2xl font-extrabold">Select Category</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').map(svc => {
                     const numOptions = svc.rawConfig?.metadata?.listings ? svc.rawConfig.metadata.listings.length : 1;
                     return (
                       <button
                         key={svc.id}
                         onClick={() => router.push(`/service/${svc.id}`)}
                         className="flex flex-col text-left p-6 rounded-2xl border border-[color:var(--color-outline-variant)]/30 hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5 transition-all group"
                       >
                         <h3 className="text-lg font-bold mb-2 group-hover:text-[color:var(--color-primary)] transition-colors">
                           {svc.name}
                         </h3>
                         <p className="text-sm text-[color:var(--color-on-surface-variant)] font-medium">{numOptions} option{numOptions !== 1 ? 's' : ''}</p>
                       </button>
                     );
                  })}
                  {liveServices.filter((svc: any) => svc.name !== '__BOKSPOT_GROUP__').length === 0 && (
                    <p className="text-sm text-[color:var(--color-on-surface-variant)] italic p-4 col-span-2 text-center">No specific categories have been added by the business yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between p-4 md:p-6 text-white absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h3 className="font-bold">{venueName}</h3>
                  <p className="text-xs text-white/60">{currentImageIdx + 1} / {galleryImages.length}</p>
                </div>
              </div>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Main Image Viewer */}
            <div className="flex-1 flex items-center justify-center relative px-4 md:px-12 mt-16 md:mt-0">
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === 0 ? galleryImages.length - 1 : prev - 1); }}
                className="absolute left-2 md:left-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/10 z-10"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="w-full max-w-5xl max-h-[70vh] flex items-center justify-center">
                <motion.img 
                  key={currentImageIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={galleryImages[currentImageIdx]} 
                  alt="Gallery image" 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === galleryImages.length - 1 ? 0 : prev + 1); }}
                className="absolute right-2 md:right-6 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors border border-white/10 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-4 md:p-6 bg-black/50 border-t border-white/10 overflow-x-auto">
              <div className="flex items-center gap-3 w-max mx-auto px-4">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all ${currentImageIdx === idx ? 'ring-2 ring-white scale-105 opacity-100' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
