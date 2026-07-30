'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Star, Clock, MapPin, Shield, Phone, Mail, Calendar, Info } from 'lucide-react';
import { useState } from 'react';
import { useLocationStore } from '../../../../lib/store';
import { getMerchantBySlug } from '../../../../lib/mockData';

export default function MerchantDetailPage() {
  const params = useParams();
  const bookingType = params?.bookingType as string;
  const category = params?.category as string;
  const merchantSlug = params?.merchantSlug as string;
  const { city } = useLocationStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const merchant = getMerchantBySlug(merchantSlug, category, bookingType, city);

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[var(--border-subtle)]">
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={`/${bookingType}/${category}`} className="btn-ghost p-2 shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors shrink-0">Home</Link>
              <ChevronRight size={14} className="shrink-0" />
              <Link href={`/${bookingType}`} className="hover:text-[var(--text-primary)] transition-colors truncate shrink-0">{bookingType}</Link>
              <ChevronRight size={14} className="shrink-0" />
              <Link href={`/${bookingType}/${category}`} className="hover:text-[var(--text-primary)] transition-colors truncate shrink-0">{category}</Link>
              <ChevronRight size={14} className="shrink-0" />
              <span className="text-[var(--text-primary)] truncate">{merchant.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Banner with Icon Logo */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/15 overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="container-main h-full flex items-end pb-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center text-5xl shadow-xl">
                {merchant.image}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h1 className="text-3xl font-black">{merchant.name}</h1>
                  {merchant.isVerified && (
                    <Shield size={18} className="text-blue-400 fill-blue-400/10" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-[var(--text-primary)] font-bold">{merchant.rating}</span>
                    <span>({merchant.reviewCount} reviews)</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{merchant.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container-main py-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left/Main Column - Services & About */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Card */}
              <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info size={20} className="text-indigo-400" />
                  About Provider
                </h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {merchant.about}
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)] text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Phone size={14} />
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] text-xs">Call Us</div>
                      <div className="font-semibold">{merchant.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Mail size={14} />
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] text-xs">Email</div>
                      <div className="font-semibold">{merchant.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Services Offered</h2>
                <div className="grid gap-4">
                  {merchant.services.map((service) => (
                    <div 
                      key={service.id}
                      className={`glass-card p-6 flex justify-between gap-6 items-start hover:border-[var(--border-strong)] transition-all cursor-pointer ${
                        selectedService === service.id ? 'border-[var(--border-strong)] ring-1 ring-indigo-500/20' : ''
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{service.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)] max-w-xl">{service.desc}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pt-2">
                          <Clock size={13} />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-[var(--text-primary)] mb-2">₹{service.price}</div>
                        <Link 
                          href={`/service/${service.id}`}
                          className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                        >
                          Book Service
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${merchant.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="font-bold text-sm">{merchant.isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{merchant.openTime}</span>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-6">
                  <h3 className="font-bold text-sm mb-3">Quick Slot Booking</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    Choose one of the services from the list and easily schedule your appointment instantly.
                  </p>
                  {selectedService ? (
                    <div>
                      <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] mb-4 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold text-xs text-[var(--text-muted)] block">Selected Service</span>
                          <span className="font-bold text-[var(--text-primary)] truncate">
                            {merchant.services.find(s => s.id === selectedService)?.name}
                          </span>
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">
                          ₹{merchant.services.find(s => s.id === selectedService)?.price}
                        </span>
                      </div>
                      <Link 
                        href={`/service/${selectedService}`}
                        className="btn-primary w-full py-3.5 text-center font-bold text-sm rounded-xl flex items-center justify-center gap-2"
                      >
                        <Calendar size={16} />
                        Choose Date & Time
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-muted)]">
                      Select a service to start booking slots
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
