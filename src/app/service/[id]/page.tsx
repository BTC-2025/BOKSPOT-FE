'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Plus, Minus, Info, AlertTriangle } from 'lucide-react';
import { api } from '../../../lib/api';
import { useBookingFlowStore } from '../../../lib/store';

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

  const listings = service.rawConfig?.metadata?.listings || [
    { id: '1', name: 'Standard Option 1', price: service.price, description: 'Indoor | Standard' },
    { id: '2', name: 'Standard Option 2', price: service.price, description: 'Indoor | Standard' }
  ];

  return (
    <div className="min-h-screen bg-[color:var(--color-surface)] flex flex-col pb-32">
      {/* 1. Header (District Style) */}
      <div className="sticky top-0 z-40 bg-[color:var(--color-surface)] border-b border-[color:var(--color-outline-variant)]/20 shadow-sm px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-[color:var(--color-surface-variant)] rounded-full transition-colors">
          <ArrowLeft size={20} className="text-[color:var(--color-on-surface)]" />
        </button>
        <div className="flex flex-col items-center flex-1 pr-10">
          <h1 className="text-lg font-bold text-[color:var(--color-on-surface)]">{service.name || service.category}</h1>
          <p className="text-[10px] text-[color:var(--color-on-surface-variant)] uppercase tracking-wide font-semibold">{service.merchant}</p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 overflow-hidden">
        
        {/* 2. Date Picker (Horizontal Scroll) */}
        <div className="flex items-center gap-4 mb-8">
          <div className="text-[10px] uppercase font-bold text-[color:var(--color-outline)] -rotate-90 origin-right pr-2 shrink-0">
            {dates[selectedDateIdx].month}
          </div>
          <div className="flex-1 overflow-x-auto hide-scrollbar flex gap-2 pb-2">
            {dates.map((d, i) => {
              const isSelected = i === selectedDateIdx;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDateIdx(i)}
                  className={`flex flex-col items-center justify-center min-w-[50px] py-2 rounded-xl transition-colors ${
                    isSelected 
                      ? 'bg-black text-white' 
                      : 'hover:bg-[color:var(--color-surface-variant)] text-[color:var(--color-on-surface)]'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-[color:var(--color-on-surface-variant)]'}`}>{d.dayName}</span>
                  <span className="text-sm font-black">{d.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Duration Selector */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[color:var(--color-outline-variant)]/20">
          <div>
            <h3 className="text-sm font-bold">Duration</h3>
            <p className="text-[10px] text-[color:var(--color-on-surface-variant)]">Duration of the slots</p>
          </div>
          <div className="flex items-center bg-black text-white rounded-full p-1 shadow-md">
            <button onClick={() => setDurationHr(Math.max(1, durationHr - 0.5))} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Minus size={14} /></button>
            <span className="px-4 text-xs font-bold">{durationHr} hr</span>
            <button onClick={() => setDurationHr(durationHr + 0.5)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Plus size={14} /></button>
          </div>
        </div>

        {/* 4. Time Slots */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-4">Time slots available</h3>
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 px-1">
            {DUMMY_SLOTS.map(slot => {
              const isSelected = selectedSlotId === slot.id;
              if (!slot.available) return null;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'border-black bg-[color:var(--color-primary)]/5 ring-1 ring-black shadow-sm' 
                      : 'border-[color:var(--color-outline-variant)]/30 hover:border-black/50 bg-[color:var(--color-surface)]'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected ? 'text-black' : 'text-[color:var(--color-on-surface)]'}`}>{slot.timeStr}</span>
                  <span className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-1">{slot.remaining} option{slot.remaining>1?'s':''}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Units / Listings */}
        <div>
          <h3 className="text-sm font-bold mb-4">{listings.length} option{listings.length>1?'s':''} available</h3>
          <div className="space-y-4">
            {listings.map((l: any, i: number) => {
              const isSelected = selectedListings.includes(l.id);
              return (
                <label 
                  key={l.id || i}
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 shadow-sm' 
                      : 'border-[color:var(--color-outline-variant)]/30 hover:border-black/30'
                  }`}
                >
                  <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                    <img src={`https://picsum.photos/seed/${l.id}/200/150`} alt={l.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[color:var(--color-on-surface)]">{l.name || l.title}</h4>
                    <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">{l.description || 'Standard'}</p>
                    <p className="text-xs font-semibold mt-1">₹{l.price || service.price}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleListing(l.id)} className="hidden" />
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'border-[color:var(--color-outline)] bg-transparent'
                    }`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[color:var(--color-surface)] border-t border-[color:var(--color-outline-variant)]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">{selectedListings.length} option{selectedListings.length !== 1 ? 's' : ''} reserved</p>
            {selectedSlotId && (
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5">
                {DUMMY_SLOTS.find(s => s.id === selectedSlotId)?.timeStr}
              </p>
            )}
          </div>
          <button 
            onClick={handleProceed}
            disabled={selectedListings.length === 0 || !selectedSlotId}
            className={`px-8 py-3 rounded-full font-bold text-sm shadow-md transition-all ${
              selectedListings.length > 0 && selectedSlotId 
                ? 'bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-[color:var(--color-on-primary)] hover:scale-105' 
                : 'bg-[color:var(--color-surface-variant)] text-[color:var(--color-outline)] cursor-not-allowed'
            }`}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
