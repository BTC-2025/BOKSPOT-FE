'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Plus, Minus, Info, AlertTriangle } from 'lucide-react';
import { api } from '../../../lib/api';
import { useBookingFlowStore } from '../../../lib/store';
import EventTemplate from '../../../components/archetypes/EventTemplate';

const DUMMY_SLOTS = Array.from({ length: 8 }, (_, i) => ({
  id: `slot-${i}`,
  timeStr: `${(i + 9) > 12 ? (i + 9) - 12 : (i + 9)}:00 ${i + 9 >= 12 ? 'PM' : 'AM'} - ${(i + 10) > 12 ? (i + 10) - 12 : (i + 10)}:00 ${i + 10 >= 12 ? 'PM' : 'AM'}`,
  available: Math.random() > 0.2,
  remaining: Math.floor(Math.random() * 4) + 1,
}));

export default function DistrictServiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const listingId = searchParams?.get('listing');
  const { setSelectedService, setSelectedSlot } = useBookingFlowStore();

  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [durationHr, setDurationHr] = useState(1);

  useEffect(() => {
    let active = true;
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const rawService = await api.services.byId(id);
        if (active) {
          const mapped = {
            ...rawService,
            price: parseFloat(rawService.basePrice),
            merchant: rawService.merchant?.name || 'Venue',
            category: rawService.category?.name || 'Category',
          };
          setService(mapped);
          
          if (listingId && selectedListings.length === 0) {
            setSelectedListings([listingId]);
          }
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load service details.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) fetchService();
    return () => { active = false; };
  }, [id]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateObj: d,
      month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      dayName: d.toLocaleString('default', { weekday: 'short' }),
      dayNum: d.getDate(),
    };
  });

  const toggleListing = (lid: string) => {
    if (selectedListings.includes(lid)) {
      setSelectedListings(selectedListings.filter(l => l !== lid));
    } else {
      setSelectedListings([...selectedListings, lid]);
    }
  };

  const handleProceed = () => {
    if (selectedListings.length === 0) return alert('Please select at least one option.');
    if (!selectedSlotId) return alert('Please select a time slot.');
    setSelectedService(service);
    setSelectedSlot(selectedSlotId);
    router.push(`/checkout`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-surface)]"><div className="animate-spin w-8 h-8 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full" /></div>;
  }
  if (error || !service) {
    return <div className="min-h-screen flex items-center justify-center bg-[color:var(--color-surface)]"><p className="text-[color:var(--color-error)] font-bold">{error || 'Service not found.'}</p></div>;
  }

  const listings = service.rawConfig?.metadata?.listings || service.metadata?.listings || [
    { id: '1', name: 'Standard Option 1', price: service.price, description: 'Indoor | Standard' },
    { id: '2', name: 'Standard Option 2', price: service.price, description: 'Indoor | Standard' }
  ];

  const currentDayNameLong = dates[selectedDateIdx].dateObj.toLocaleString('en-US', { weekday: 'long' });

  const availableSlotsMap = new Map<string, any>();
  listings.forEach((l: any) => {
    if (l.schedule && Array.isArray(l.schedule)) {
      l.schedule.forEach((s: any) => {
        if (s.dayOfWeek === currentDayNameLong) {
          const timeStr = `${s.startTime} - ${s.endTime}`;
          if (!availableSlotsMap.has(timeStr)) {
            availableSlotsMap.set(timeStr, {
              id: `slot-${timeStr.replace(/\s+/g, '-')}`,
              timeStr,
              price: s.price,
              available: true,
              remaining: 1,
            });
          } else {
            availableSlotsMap.get(timeStr)!.remaining += 1;
          }
        }
      });
    }
  });

  let slotsToDisplay = Array.from(availableSlotsMap.values());
  if (slotsToDisplay.length === 0) {
    slotsToDisplay = DUMMY_SLOTS;
  }

  // 0. Archetype Router
  const archetype = service.metadata?.archetype || service.rawConfig?.metadata?.archetype;
  const catLower = (service.category?.name || service.category || '').toLowerCase();
  
  if (
    archetype === 'Event' || 
    catLower.includes('event') || 
    catLower.includes('show') ||
    catLower.includes('concert')
  ) {
    return <EventTemplate service={service} />;
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface)] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[color:var(--color-surface)] border-b border-[color:var(--color-outline-variant)]/20 px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-[color:var(--color-surface-variant)]"><ArrowLeft size={20}/></button>
        <h1 className="font-bold">{service.name || service.category}</h1>
        <div className="w-10"></div>
      </div>

      {/* Left Side: Images (Desktop Split) */}
      <div className="w-full md:w-1/2 lg:w-[45%] md:h-screen md:sticky top-0 flex flex-col gap-2 p-4 md:p-8 md:overflow-hidden">
        {/* Top Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-[color:var(--color-surface-variant)] transition-colors"><ArrowLeft size={24}/></button>
          <span className="text-sm font-bold text-[color:var(--color-outline)]">Back</span>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-4 h-[300px] md:h-full overflow-hidden rounded-3xl">
          <div className="h-2/3 relative rounded-2xl overflow-hidden bg-gray-100">
            <img src={listings[0]?.imageUrl || listings[0]?.image || `https://picsum.photos/seed/${id}1/800/600`} className="w-full h-full object-cover" alt="Service Image" />
          </div>
          <div className="h-1/3 flex gap-2 md:gap-4">
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100">
              <img src={`https://picsum.photos/seed/${id}2/400/300`} className="w-full h-full object-cover" alt="Detail" />
            </div>
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100">
              <img src={`https://picsum.photos/seed/${id}3/400/300`} className="w-full h-full object-cover" alt="Detail" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Booking Details & Flow */}
      <div className="w-full md:w-1/2 lg:w-[55%] p-6 md:p-12 lg:p-16 flex flex-col md:overflow-y-auto">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2 text-[color:var(--color-on-surface)]">{service.name || service.category}</h1>
        <p className="text-sm text-[color:var(--color-on-surface-variant)] uppercase tracking-widest font-bold mb-8">{service.merchant}</p>

        {/* Date Picker */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h3 className="font-bold text-lg">Select Date</h3>
            <span className="text-xs font-bold text-[color:var(--color-outline)] uppercase">{dates[selectedDateIdx].month}</span>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {dates.map((d, i) => {
              const isSelected = i === selectedDateIdx;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDateIdx(i)}
                  className={`flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-2xl border transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)] text-[color:var(--color-on-primary)] shadow-lg hover:scale-105' 
                      : 'border-[color:var(--color-outline-variant)]/40 hover:border-black/30 text-[color:var(--color-on-surface)] bg-[color:var(--color-surface)]'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isSelected ? 'opacity-90' : 'text-[color:var(--color-on-surface-variant)]'}`}>{d.dayName}</span>
                  <span className="text-lg font-black mt-0.5">{d.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selector */}
        <div className="mb-10">
          <h3 className="font-bold text-lg mb-4">Time Choose</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slotsToDisplay.slice(0, 6).map(slot => {
              const isSelected = selectedSlotId === slot.id;
              if (!slot.available) return null;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                    isSelected 
                      ? 'border-black bg-black text-white shadow-md' 
                      : 'border-[color:var(--color-outline-variant)]/40 hover:border-black/50 text-[color:var(--color-on-surface)]'
                  }`}
                >
                  {slot.timeStr.split('-')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Room/Service Details */}
        <div className="mb-12 p-6 rounded-3xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-variant)]/20 shadow-sm relative overflow-hidden">
          {/* Subtle background icon for aesthetic */}
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-black">
            <Info size={120} />
          </div>
          
          <h3 className="text-xl font-bold text-[color:var(--color-on-surface)] mb-2">Room with Free breakfast</h3>
          <div className="flex items-center gap-4 text-sm font-semibold text-[color:var(--color-on-surface-variant)] mb-6">
            <span className="flex items-center gap-1.5"><Check size={16} className="text-green-500" /> TV</span>
            <span className="flex items-center gap-1.5"><Check size={16} className="text-green-500" /> WiFi</span>
            <span className="flex items-center gap-1.5"><Check size={16} className="text-green-500" /> 1 Bed (2 Single Bed)</span>
          </div>
          
          <div className="pt-6 border-t border-[color:var(--color-outline-variant)]/20 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-[color:var(--color-on-surface)]">₹{listings[0]?.price || service.price || '10,400'}</span>
              <span className="text-xs font-bold text-[color:var(--color-outline)] tracking-wide mt-1">+ Tax + Fees</span>
            </div>
            
            <button 
              onClick={() => {
                if (!selectedSlotId) return alert('Please select a time.');
                // Select the first listing by default if none selected
                if (selectedListings.length === 0 && listings.length > 0) {
                  setSelectedListings([listings[0].id]);
                }
                handleProceed();
              }}
              className="px-8 py-4 bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-[color:var(--color-on-primary)] font-extrabold text-lg rounded-2xl shadow-xl shadow-[color:var(--color-primary)]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Book <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
