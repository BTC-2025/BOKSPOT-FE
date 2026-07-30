'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Clock, MapPin, Heart, Share2, ChevronLeft, ChevronRight, Check, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { useBookingFlowStore } from '../../../lib/store';

const mockSlots = Array.from({ length: 16 }, (_, i) => ({
  id: `slot-${i}`,
  time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
  available: Math.random() > 0.3,
  price: 599,
  remaining: Math.floor(Math.random() * 5) + 1,
}));

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { setSelectedService, setSelectedSlot } = useBookingFlowStore();

  const [service, setService] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [localSelectedSlot, setLocalSelectedSlot] = useState<string | null>(null);

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
            merchant: rawService.merchant.name,
            city: rawService.merchant.city,
            duration: rawService.durationMinutes,
            reviews: rawService.reviewCount,
            image: rawService.images[0] || '✨',
            category: rawService.category.name,
            lat: rawService.merchant.latitude,
            lng: rawService.merchant.longitude,
            desc: rawService.description,
          };
          setService(mapped);
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        if (active) {
          setError(err.message || 'Failed to load service details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchService();
    }
    return () => {
      active = false;
    };
  }, [id]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), date: d.getDate(), month: d.toLocaleDateString('en', { month: 'short' }), full: d.toISOString().split('T')[0] };
  });

  const handleBookNow = (e: React.MouseEvent) => {
    if (!localSelectedSlot || !service) {
      e.preventDefault();
      return;
    }
    const slotObj = mockSlots.find(s => s.id === localSelectedSlot);
    setSelectedService(service);
    setSelectedSlot({
      date: dates[selectedDate].full,
      time: slotObj?.time,
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider animate-pulse">Loading Service Details...</p>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold">Service Not Found</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{error || 'The requested service could not be located.'}</p>
        <Link href="/search" className="mt-6 btn-primary py-2.5 px-5 text-sm font-semibold rounded-xl">
          Back to Search
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Sticky header */}
      <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[var(--border-subtle)]">
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/search" className="btn-ghost p-2">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
              <ChevronRight size={14} />
              <Link href="/search" className="hover:text-[var(--text-primary)] transition-colors">Search</Link>
              <ChevronRight size={14} />
              <span className="text-[var(--text-primary)]">{service.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Image Gallery */}
        <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-indigo-600 to-purple-700">
        <img src={service.image} alt={service.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white mb-2">{service.category}</span>
          <h1 className="text-3xl font-bold text-white">{service.name}</h1>
          <p className="text-white/70 mt-1 flex items-center gap-2"><MapPin className="h-4 w-4" /> {service.merchant} · {service.city}</p>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="rounded-full bg-white/20 backdrop-blur-sm p-2.5 text-white hover:bg-white/30 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
          <button className="rounded-full bg-white/20 backdrop-blur-sm p-2.5 text-white hover:bg-white/30 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Star, value: `${service.rating}`, label: `${service.reviews} reviews`, color: 'text-yellow-500' },
                { icon: Clock, value: `${service.duration} min`, label: 'Duration', color: 'text-blue-500' },
                { icon: Users, value: `${Math.round(service.rating * service.reviews * 1.5)}+`, label: 'Bookings', color: 'text-green-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
                  <stat.icon className={`h-5 w-5 ${stat.color} ${stat.icon === Star ? 'fill-yellow-500' : ''}`} />
                  <div>
                    <div className="font-semibold text-sm">{stat.value}</div>
                    <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6">
              <h2 className="font-semibold text-lg mb-3">About this service</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {service.desc || service.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Consultation', 'Hair Wash', 'Precision Cut', 'Styling', 'Finishing'].map((item) => (
                  <span key={item} className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                    <Check className="h-3.5 w-3.5" /> {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6">
              <h2 className="font-semibold text-lg mb-4">Reviews</h2>
              {[
                { name: 'Rahul M.', rating: 5, comment: 'Amazing experience! The stylist was very professional and attentive.', date: '2 days ago' },
                { name: 'Priya S.', rating: 4, comment: 'Great service, loved the ambiance. Would definitely come back.', date: '1 week ago' },
                { name: 'Arjun K.', rating: 5, comment: 'Best haircut I\'ve ever had! Highly recommend this place.', date: '2 weeks ago' },
              ].map((review, i) => (
                <div key={i} className={`py-4 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">{review.name[0]}</div>
                      <div>
                        <div className="font-medium text-sm">{review.name}</div>
                        <div className="flex items-center gap-0.5">{Array.from({ length: review.rating }, (_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />)}</div>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{review.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[var(--primary)]">₹{service.price}</div>
                <div className="text-sm text-[var(--text-muted)]">per session</div>
              </div>

              {/* Date Selector */}
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-3">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((d, i) => (
                    <button key={i} onClick={() => setSelectedDate(i)} className={`shrink-0 flex flex-col items-center rounded-xl px-3 py-2 text-center transition-all ${selectedDate === i ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/25' : 'border border-[var(--border)] hover:border-[var(--primary)]'}`}>
                      <span className="text-xs font-medium">{d.day}</span>
                      <span className="text-lg font-bold">{d.date}</span>
                      <span className="text-xs opacity-70">{d.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3">Available Slots</h3>
                <div className="grid grid-cols-3 gap-2">
                  {mockSlots.map((slot) => (
                    <button key={slot.id} disabled={!slot.available} onClick={() => setLocalSelectedSlot(slot.id)}
                      className={`rounded-lg py-2 text-sm font-medium transition-all ${!slot.available ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed line-through' : localSelectedSlot === slot.id ? 'bg-[var(--primary)] text-white shadow-md' : 'border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/booking/checkout"
                onClick={handleBookNow}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all ${localSelectedSlot ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25' : 'bg-gray-300 cursor-not-allowed pointer-events-none'}`}
              >
                Book Now — ₹{service.price}
              </Link>
              <p className="mt-3 text-center text-xs text-[var(--text-muted)]">Free cancellation up to 2 hours before</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
