'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, SlidersHorizontal, MapPin, Star, Clock, ChevronDown, Grid3X3, List } from 'lucide-react';
import { useLocationStore, useBookingFlowStore } from '../../lib/store';
import { calculateDistance } from '../../lib/mockData';

export default function SearchPage() {
  const { city, latitude, longitude } = useLocationStore();
  const { services } = useBookingFlowStore();
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
    
    // Automatically limit to major services (rating >= 4.6) if there is no search query or category selected
    const matchesMajor = searchQuery || selectedCategory !== 'All' || svc.rating >= 4.6;

    return matchesLocation && matchesSearch && matchesCategory && matchesMajor;
  });

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    
    // Sort by proximity by default if GPS coordinates are available
    if (latitude !== null && longitude !== null && a.lat !== undefined && a.lng !== undefined && b.lat !== undefined && b.lng !== undefined) {
      const distA = calculateDistance(latitude, longitude, a.lat, a.lng);
      const distB = calculateDistance(latitude, longitude, b.lat, b.lng);
      return distA - distB;
    }
    return 0; // relevance
  });

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8">
        {/* Search Header */}
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
                      : 'border-[color:var(--color-outline-variant)]/40 hover:bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)]'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <div className="flex rounded-xl border border-[color:var(--color-outline-variant)]/45 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] font-bold' : 'hover:bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface-variant)]'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] font-bold' : 'hover:bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface-variant)]'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar">
              {['All', 'Salon', 'Fitness', 'Dining', 'Events', 'Wellness', 'Sports'].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                        : 'border-[color:var(--color-outline-variant)]/40 hover:border-[color:var(--color-primary)]/50 text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[color:var(--color-on-surface-variant)]">
              {sortedServices.length} {sortedServices.length === 1 ? 'service' : 'services'} found in {city}
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

          {sortedServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[64px] text-[color:var(--color-outline)]/40 mb-4">search_off</span>
              <h3 className="text-lg font-bold text-[color:var(--color-on-surface)]">No services found</h3>
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
              {sortedServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                >
                  <Link
                    href={`/service/${service.id}`}
                    className={`block rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 overflow-hidden card-glass ${viewMode === 'list' ? 'sm:flex sm:h-44' : ''}`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'sm:w-48 shrink-0 h-44 sm:h-full' : 'h-48'}`}>
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 rounded-full bg-[color:var(--color-surface-container-high)]/90 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm border border-[color:var(--color-outline-variant)]/25 text-[color:var(--color-on-surface)]">
                        {service.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-bold text-base text-[color:var(--color-on-surface)] line-clamp-1 group-hover:text-[color:var(--color-primary)] transition-colors">{service.name}</h3>
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
                            <Clock className="h-3.5 w-3.5" /> {service.duration} min
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[color:var(--color-outline-variant)]/20 flex items-center justify-between">
                          <span className="text-base font-black text-[color:var(--color-primary)]">₹{service.price}</span>
                          <span className="rounded-lg bg-[color:var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20">Book Now</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
