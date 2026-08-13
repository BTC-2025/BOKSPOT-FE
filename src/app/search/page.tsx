'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, Star, Clock, ChevronDown, Grid3X3, Grid, List, Filter } from 'lucide-react';
import { useLocationStore, useBookingFlowStore } from '../../lib/store';
import { calculateDistance } from '../../lib/mockData';
import { api } from '../../lib/api';

export default function SearchPage() {
  const { city, latitude, longitude } = useLocationStore();
  const [services, setServices] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query) {
        setSearchQuery(query);
      }
    }
    
    // Fetch live services from mock sync API
    api.services.list().then(res => {
      if (res && res.data) {
        setServices(res.data);
      }
    });
  }, []);

  // Helper to get distance
  const getServiceDistance = (svc: any) => {
    if (latitude !== null && longitude !== null && svc.lat !== undefined && svc.lng !== undefined) {
      return calculateDistance(latitude, longitude, svc.lat, svc.lng);
    }
    return null;
  };

  // Filter services
  const filteredServices = services.filter((svc) => {
    let matchesLocation = false;
    if (latitude !== null && longitude !== null && svc.lat !== undefined && svc.lng !== undefined) {
      const distance = calculateDistance(latitude, longitude, svc.lat, svc.lng);
      matchesLocation = distance <= 100; // Show services within 100 km
    } else {
      matchesLocation = svc.city.toLowerCase() === (city || 'Chennai').toLowerCase();
    }

    const matchesSearch = 
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || svc.category === selectedCategory;
    
    return matchesLocation && matchesSearch && matchesCategory;
  });

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'price-low') return (a.basePrice || 0) - (b.basePrice || 0);
    if (sortBy === 'price-high') return (b.basePrice || 0) - (a.basePrice || 0);
    if (sortBy === 'rating') return b.rating - a.rating;
    
    // Sort by proximity by default if GPS coordinates are available
    if (latitude !== null && longitude !== null && a.lat !== undefined && a.lng !== undefined && b.lat !== undefined && b.lng !== undefined) {
      const distA = calculateDistance(latitude, longitude, a.lat, a.lng);
      const distB = calculateDistance(latitude, longitude, b.lat, b.lng);
      return distA - distB;
    }
    return 0;
  });

  const uniqueMerchants = new Map();
  sortedServices.forEach(svc => {
    const key = svc.merchantObj?.id || svc.merchant;
    if (!uniqueMerchants.has(key)) {
      uniqueMerchants.set(key, svc);
    }
  });
  const merchantResults = Array.from(uniqueMerchants.values());

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8">
        <div className="border-b border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 backdrop-blur-md sticky top-[var(--topnav-height)] z-40 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mr-8 lg:pr-8">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-outline)]" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-dim)]/50 py-3 pl-12 pr-4 text-sm text-[color:var(--color-on-surface)] outline-none focus:border-[color:var(--color-primary)]/50 focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    showFilters 
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]' 
                      : 'border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)] hover:bg-[color:var(--color-surface-container-highest)]'
                  }`}
                >
                  <Filter className="h-4 w-4" /> Filters
                </button>
                <div className="hidden sm:flex items-center gap-1 rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-container-high)] p-1">
                  <button onClick={() => setViewMode('grid')} className={`rounded-lg p-2 transition-colors ${viewMode === 'grid' ? 'bg-[color:var(--color-surface-container-highest)] text-[color:var(--color-on-surface)]' : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'}`}><Grid className="h-4 w-4" /></button>
                  <button onClick={() => setViewMode('list')} className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-[color:var(--color-surface-container-highest)] text-[color:var(--color-on-surface)]' : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'}`}><List className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-[color:var(--color-outline-variant)]/20">
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                            selectedCategory === cat
                              ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]'
                              : 'bg-[color:var(--color-surface-container-highest)] text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] hover:bg-[color:var(--color-surface-dim)]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm font-bold text-[color:var(--color-on-surface)]">
              {merchantResults.length} {merchantResults.length === 1 ? 'business' : 'businesses'} found in {city}
            </p>
            <div className="flex items-center gap-2 text-sm text-[color:var(--color-on-surface-variant)]">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium border-0 outline-none text-[color:var(--color-on-surface)] cursor-pointer focus:ring-0"
              >
                <option value="relevance" className="bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)]">Relevance</option>
                <option value="price-low" className="bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)]">Price: Low to High</option>
                <option value="price-high" className="bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)]">Price: High to Low</option>
                <option value="rating" className="bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)]">Rating</option>
              </select>
            </div>
          </div>

          {merchantResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[64px] text-[color:var(--color-outline)]/40 mb-4">search_off</span>
              <h3 className="text-lg font-bold text-[color:var(--color-on-surface)]">No businesses found</h3>
              <p className="text-sm text-[color:var(--color-on-surface-variant)] mt-1">Try checking your spelling or selecting another category.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-6 rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-bold text-[color:var(--color-on-primary)]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {merchantResults.map((service, i) => {
                const slugify = (text: string) => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const bType = slugify(service.serviceType || 'stay');
                const cat = slugify(service.category || 'hotels');
                const mSlug = service.merchantObj?.slug || service.merchantObj?.id || slugify(service.merchant || 'merchant');
                const mHref = `/${bType}/${cat}/${mSlug}`;
                
                return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                >
                  <Link
                    href={mHref}
                    className={`block rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 overflow-hidden card-glass ${viewMode === 'list' ? 'sm:flex sm:h-44' : ''}`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'sm:w-48 shrink-0 h-44 sm:h-full' : 'h-48'}`}>
                      <img src={service.merchantObj?.images?.[0] || service.image} alt={service.merchant} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 rounded-full bg-[color:var(--color-surface-container-high)]/90 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm border border-[color:var(--color-outline-variant)]/25 text-[color:var(--color-on-surface)]">
                        {service.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-base text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-[color:var(--color-primary)] transition-colors">{service.merchant}</h3>
                        <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[color:var(--color-primary)] shrink-0" /> {service.merchant} · {(() => {
                            const dist = getServiceDistance(service);
                            return dist !== null ? `${dist} km away` : service.city;
                          })()}
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-[color:var(--color-on-surface-variant)]">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-[color:var(--color-on-surface)]">{service.rating}</span>
                            <span>({service.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {service.durationMinutes} min
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[color:var(--color-outline-variant)]/20 flex items-center justify-between">
                          <span className="text-sm font-semibold text-[color:var(--color-on-surface-variant)]">From <span className="text-base font-black text-[color:var(--color-primary)]">₹{service.basePrice}</span></span>
                          <span className="rounded-lg bg-[color:var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20">View Options</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )})}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
