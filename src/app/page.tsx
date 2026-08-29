'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Star, Compass, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShortcutManagerModal } from '../components/shortcuts/ShortcutManagerModal';
import { SubnavManagerModal } from '../components/shortcuts/SubnavManagerModal';
import { ActionModalManager } from '../components/shortcuts/ActionModalManager';
import { useBookingFlowStore, useLocationStore } from '../lib/store';
import { useShortcutStore, AVAILABLE_SHORTCUTS, SUBNAV_CATEGORIES } from '../store/useShortcutStore';
import { calculateDistance, getProvidersByCategory } from '../lib/mockData';
import { api } from '../lib/api';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-[color:var(--color-surface-dim)]/50 rounded-2xl border border-[color:var(--color-outline-variant)]/20">
      <div className="text-center">
        <div className="h-6 w-6 border-2 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-[10px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider animate-pulse">Syncing Satellite Feeds...</p>
      </div>
    </div>
  ),
});

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  chennai: { lat: 13.0827, lng: 80.2707 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  theni: { lat: 10.0104, lng: 77.4702 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 }
};

const EXPLORE_SECTIONS = [
  {
    id: 'trending',
    title: 'Trending Now',
    description: 'Most popular bookings near you',
    emoji: '🔥',
    from: '#F87171',
    to: '#EF4444',
    glow: 'rgba(248,113,113,0.30)',
    href: '/search?q=trending',
    items: [
      { id: 't1', title: 'Delhi to Goa Flight', location: 'IndiGo Indigo-603', price: '₹5,499', ratingScore: '4.9', ratingText: 'Excellent', usersCount: '1k+ Users', stars: 5, emoji: '✈️', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60', badge: 'Selling Fast', badgeBg: 'bg-red-500', link: '/travel-transport/flights' },
      { id: 't2', title: 'Taj Palace Luxury Suite', location: 'Mumbai stay reservation', price: '₹14,500', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '800+ Users', stars: 5, emoji: '🏨', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60', badge: 'Top Rated', badgeBg: 'bg-emerald-500', link: '/stay-accommodation/hotels' },
      { id: 't3', title: 'Style Studio Styling', location: 'Haircut & Styling in T Nagar', price: '₹599', ratingScore: '4.8', ratingText: 'Excellent', usersCount: '2k+ Users', stars: 4, emoji: '💇', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=60', badge: 'Popular', badgeBg: 'bg-blue-500', link: '/service/3' },
      { id: 't4', title: 'Apollo Dental Care', location: 'Oral scaling & checkup', price: '₹899', ratingScore: '4.8', ratingText: 'Excellent', usersCount: '5k+ Users', stars: 4, emoji: '🦷', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60', badge: 'Certified', badgeBg: 'bg-emerald-600', link: '/service/1' },
      { id: 't5', title: 'Zen Sports Turf', location: '9-a-side football turf slot', price: '₹1,500/hr', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '400+ Users', stars: 5, emoji: '⚽', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60', badge: 'Discount', badgeBg: 'bg-amber-500', link: '/sports-turf/football-turf' }
    ]
  },
  {
    id: 'news',
    title: 'News & Updates',
    description: 'Latest updates in your area',
    emoji: '📰',
    from: '#60A5FA',
    to: '#3B82F6',
    glow: 'rgba(96,165,250,0.30)',
    href: '/search?q=news',
    items: [
      { id: 'n1', title: 'Metro High-Speed Rail', subtitle: 'New Chennai routes opened today', tag: '10m ago', rating: 'New', emoji: '🚆', link: '/travel-transport/trains' },
      { id: 'n2', title: 'ZenFit Yoga Sessions', subtitle: 'New morning batches starting Monday', tag: '2h ago', rating: 'Yoga', emoji: '🧘', link: '/service/2' },
      { id: 'n3', title: 'Monsoon Safety Guidelines', subtitle: 'Travel advisories for hill stations', tag: '1d ago', rating: 'Alert', emoji: '🌧️', link: '/travel-transport/cabs' },
      { id: 'n4', title: 'Kapaleeshwarar Temple Darshan', subtitle: 'Special festival booking slots open', tag: '2d ago', rating: 'Temple', emoji: '🛕', link: '/religious-government/darshan' }
    ]
  },
  {
    id: 'offers',
    title: 'Offers & Discounts',
    description: 'Handpicked deals for savings',
    emoji: '🏷️',
    from: '#FBBF24',
    to: '#F59E0B',
    glow: 'rgba(251,191,36,0.30)',
    href: '/search?q=offers',
    items: [
      { id: 'o1', title: 'Apollo Dental: 30% Off', subtitle: 'Promo code: SMILE30', tag: 'Save ₹300', rating: 'Promo', emoji: '🦷', link: '/service/1' },
      { id: 'o2', title: 'ZenFit: 1 Week Free Pass', subtitle: 'Promo code: ZENFITPASS', tag: 'Free Trial', rating: 'Fitness', emoji: '💪', link: '/service/2' },
      { id: 'o3', title: 'Style Studio: ₹200 Cash', subtitle: 'Flat cashback on styling slots', tag: 'Cashback', rating: 'Salon', emoji: '💇', link: '/service/3' },
      { id: 'o4', title: 'Grand Palace: 2+1 Offer', subtitle: 'Book 2 nights, get 1 night free', tag: 'Get 1 Free', rating: 'Hotel', emoji: '🏡', link: '/stay-accommodation/hotels' }
    ]
  },
  {
    id: 'events',
    title: 'Local Events',
    description: 'Tournaments and classes near you',
    emoji: '📅',
    from: '#34D399',
    to: '#10B981',
    glow: 'rgba(52,211,153,0.30)',
    href: '/search?q=events',
    items: [
      { id: 'e1', title: 'Clay Pottery Class', location: 'Weekend workshop in Chennai', price: '₹400', ratingScore: '4.7', ratingText: 'Great', usersCount: '50+ Users', stars: 4, emoji: '🎨', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&auto=format&fit=crop&q=60', badge: 'Workshop', badgeBg: 'bg-purple-500', link: '/entertainment-events/workshops' },
      { id: 'e2', title: 'IPL Live Turf Screening', location: 'Match screening at Zen Arena', price: '₹299', ratingScore: '4.8', ratingText: 'Awesome', usersCount: '200+ Users', stars: 5, emoji: '⚽', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60', badge: 'Live', badgeBg: 'bg-red-500', link: '/entertainment-events/events' },
      { id: 'e3', title: 'Corporate Badminton League', location: 'Trophies and cash prizes', price: '₹999', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '500+ Users', stars: 5, emoji: '🏸', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60', badge: 'Tournament', badgeBg: 'bg-blue-600', link: '/sports-turf/badminton' },
      { id: 'e4', title: 'Sunburn Arena EDM concert', location: 'Early bird tickets live now', price: '₹1,200', ratingScore: '4.9', ratingText: 'Exceptional', usersCount: '1k+ Users', stars: 5, emoji: '🎵', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60', badge: 'Selling Fast', badgeBg: 'bg-pink-500', link: '/entertainment-events/concerts' },
      { id: 'e5', title: 'Street Food Festival', location: 'Marina Beach Seaview', price: '₹150', ratingScore: '4.8', ratingText: 'Awesome', usersCount: '2k+ Users', stars: 5, emoji: '🌮', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60', badge: 'Must Try', badgeBg: 'bg-orange-500', link: '/entertainment-events/events' }
    ]
  },
  {
    id: 'featured',
    title: 'Featured Partners',
    description: 'Elite verified businesses',
    emoji: '⭐',
    from: '#A78BFA',
    to: '#8B5CF6',
    glow: 'rgba(167,139,250,0.30)',
    href: '/search?q=featured',
    items: [
      { id: 'f1', title: 'Elite Spa & Wellness', subtitle: 'Luxury relaxation in T Nagar', tag: 'Verified', rating: '4.9', emoji: '💆', link: '/service/3' },
      { id: 'f2', title: 'Apollo Dental Metro', subtitle: 'Premium dental hospital network', tag: 'Verified', rating: '4.8', emoji: '🏥', link: '/service/1' },
      { id: 'f3', title: 'Zen Sports Turf Arena', subtitle: 'World class turf surface in Chennai', tag: 'Top Rated', rating: '4.9', emoji: '⚽', link: '/sports-turf/football-turf' },
      { id: 'f4', title: 'The Grand Palace Stay', subtitle: 'Super luxury suites & boarding', tag: 'Top Rated', rating: '4.8', emoji: '🏨', link: '/stay-accommodation/hotels' }
    ]
  }
];

function CategoryCard({
  label,
  icon,
  from,
  to,
  glow,
  href,
}: {
  label: string;
  icon: string;
  from: string;
  to: string;
  glow: string;
  href: string;
}) {
  return (
    <Link href={href} className="w-full group">
      <div
        className="relative h-[108px] rounded-2xl flex flex-col items-center justify-center gap-2.5 overflow-hidden border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 card-glass"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
          style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 1px ${glow}` }}
        />
        <div
          className="category-badge relative z-10"
          style={{
            background: `linear-gradient(135deg, ${from}, ${to})`,
            boxShadow: `0 4px 16px ${glow}, 0 2px 6px rgba(0,0,0,0.6)`,
          }}
        >
          <span className="material-symbols-outlined text-[#0C0C10] text-[21px]" style={{ fontVariationSettings: "'wght' 500" }}>
            {icon}
          </span>
        </div>
        <span className="relative z-10 text-[12px] font-semibold tracking-wide text-[color:var(--color-on-surface-variant)] group-hover:text-[color:var(--color-on-surface)] transition-colors duration-300">
          {label}
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-[18px] font-bold text-[color:var(--color-on-surface)] tracking-tight">{title}</h2>
        <p className="text-[12px] mt-0.5 text-[color:var(--color-outline)]">{sub}</p>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-[12px] font-semibold text-[color:var(--color-primary)] hover:gap-2 transition-all duration-300 shrink-0"
      >
        View All
        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: string;
}) {
  return (
    <div className="card-glass rounded-2xl p-4 md:p-5 bg-[color:var(--color-surface-container)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-outline)]">{label}</p>
          <p className="mt-2 text-[24px] md:text-[28px] font-black text-[color:var(--color-on-surface)] leading-none">{value}</p>
          <p className="mt-2 text-[12px] text-[color:var(--color-on-surface-variant)]">{note}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[color:var(--color-primary)]/10 flex items-center justify-center border border-[color:var(--color-primary)]/20">
          <span className="material-symbols-outlined text-[color:var(--color-primary)] text-[22px]" style={{ fontVariationSettings: "'wght' 500" }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

const RECOMMENDED_ITEMS = [
  {
    id: 'r1',
    title: 'Avengers: Secret Wars',
    location: 'Inox: Forum Mall',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.8',
    ratingText: 'Exceptional',
    usersCount: '1k+ Users',
    price: '₹190',
    badge: 'Selling Fast',
    badgeBg: 'bg-red-500',
    stars: 5,
    link: '/entertainment-events/movies',
  },
  {
    id: 'r2',
    title: 'Grand Palace Resorts',
    location: 'ECR, Chennai',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.2',
    ratingText: 'Exceptional',
    usersCount: '163 Users',
    price: '₹4,500',
    badge: '11% off',
    badgeBg: 'bg-emerald-500',
    stars: 4,
    link: '/stay-accommodation/hotels',
  },
  {
    id: 'r3',
    title: 'Vande Bharat Express',
    location: 'Chennai Central',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.8',
    ratingText: 'Excellent',
    usersCount: '441 Users',
    price: '₹850',
    badge: 'Best Price Guarantee',
    badgeBg: 'bg-blue-600',
    stars: 4,
    link: '/travel-transport/trains',
  },
  {
    id: 'r4',
    title: 'Sunburn EDM Festival',
    location: 'Goa',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.7',
    ratingText: 'Excellent',
    usersCount: '523 Users',
    price: '₹1,200',
    badge: 'Limited Passes',
    badgeBg: 'bg-purple-500',
    stars: 5,
    link: '/entertainment-events/events',
  },
  {
    id: 'r5',
    title: 'Zen Strike Play Arena',
    location: 'Anna Nagar',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.0',
    ratingText: 'Exceptional',
    usersCount: '1k+ Users',
    price: '₹400',
    badge: '25% off',
    badgeBg: 'bg-emerald-500',
    stars: 4,
    link: '/sports-turf/play-arena',
  }
];

const CONCIERGE_JOURNEYS_POOL = [
  {
    trainName: 'Vande Bharat Express (#20608)',
    source: 'SBC (Bengaluru)',
    destination: 'MAS (Chennai)',
    platform: 'Expected PF 7',
    icon: '🚆',
    iconColor: '#ff6325',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.8',
    ratingText: 'Excellent',
    usersCount: '441 Users',
    stars: 4
  },
  {
    trainName: 'Avengers: Secret Wars',
    source: 'Inox: Forum Mall',
    destination: 'Premium Audi 3',
    platform: 'Seat H-14, H-15',
    icon: '🍿',
    iconColor: '#eab308',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.8',
    ratingText: 'Exceptional',
    usersCount: '1k+ Users',
    stars: 5
  },
  {
    trainName: 'Metro High-Speed Rail',
    source: 'Central Metro Station',
    destination: 'Airport Terminal 2',
    platform: 'Platform 2 (South)',
    icon: '🚇',
    iconColor: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1548689816-c399f954f3dd?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.0',
    ratingText: 'Exceptional',
    usersCount: '800+ Users',
    stars: 4
  },
  {
    trainName: 'Sunburn EDM Festival',
    source: 'VGP Golden Beach',
    destination: 'VIP Arena Zone A',
    platform: 'Pass #SB-8920',
    icon: '🎸',
    iconColor: '#ec4899',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.7',
    ratingText: 'Excellent',
    usersCount: '523 Users',
    stars: 5
  },
  {
    trainName: 'ZenFit Yoga Session',
    source: 'ZenFit Health Studio',
    destination: 'Studio Room B',
    platform: 'Starts 07:00 AM',
    icon: '🧘',
    iconColor: '#10b981',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.2',
    ratingText: 'Exceptional',
    usersCount: '120 Users',
    stars: 5
  },
  {
    trainName: 'Kapaleeshwarar Darshan',
    source: 'Mylapore East Gate',
    destination: 'Inner Sanctum Queue',
    platform: 'Special Entry Pass',
    icon: '🛕',
    iconColor: '#f97316',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=60',
    ratingScore: '4.9',
    ratingText: 'Exceptional',
    usersCount: '2k+ Users',
    stars: 5
  },
  {
    trainName: 'IndiGo Flight 6E-204',
    source: 'MAA (Chennai)',
    destination: 'DEL (New Delhi)',
    platform: 'Boarding Gate 4',
    icon: '✈️',
    iconColor: '#2563eb',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60',
    ratingScore: '8.5',
    ratingText: 'Excellent',
    usersCount: '300+ Users',
    stars: 4
  },
  {
    trainName: 'The Grand Temple Dine',
    source: 'Main Dining Hall',
    destination: 'Rooftop Table 12',
    platform: 'Confirmed Booking',
    icon: '🍴',
    iconColor: '#14b8a6',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60',
    ratingScore: '9.5',
    ratingText: 'Exceptional',
    usersCount: '600+ Users',
    stars: 5
  }
];

const mapExploreItemToConcierge = (item: any, sectionId: string) => {
  const mappings: Record<string, { source: string; destination: string; platform: string; icon: string; iconColor: string; image: string }> = {
    'n1': {
      source: 'Chennai Central',
      destination: 'New Metro Routes',
      platform: 'Open Today',
      icon: '🚇',
      iconColor: '#3b82f6',
      image: 'https://images.unsplash.com/photo-1548689816-c399f954f3dd?w=500&auto=format&fit=crop&q=60'
    },
    'n2': {
      source: 'ZenFit Studio',
      destination: 'Morning Yoga Batch',
      platform: 'Starts Mon 7AM',
      icon: '🧘',
      iconColor: '#10b981',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60'
    },
    'n3': {
      source: 'City Gateways',
      destination: 'Hill Station Alert',
      platform: 'Monsoon Guide',
      icon: '🌧️',
      iconColor: '#f59e0b',
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60'
    },
    'n4': {
      source: 'Mylapore Gate',
      destination: 'Temple Darshan',
      platform: 'Festival Booking',
      icon: '🛕',
      iconColor: '#ec4899',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=60'
    },
    'e1': {
      source: 'Chennai Workshop',
      destination: 'Clay Pottery Class',
      platform: 'Sat 4:00 PM',
      icon: '🎨',
      iconColor: '#a855f7',
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&auto=format&fit=crop&q=60'
    },
    'e2': {
      source: 'Zen Arena Screen',
      destination: 'IPL Live Screening',
      platform: 'Sun 7:00 PM',
      icon: '⚽',
      iconColor: '#ef4444',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60'
    },
    'e3': {
      source: 'Arena Courts',
      destination: 'Badminton League',
      platform: 'Starts June 15',
      icon: '🏸',
      iconColor: '#14b8a6',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60'
    },
    'e4': {
      source: 'VGP Beach Stage',
      destination: 'Sunburn EDM Concert',
      platform: 'Gate Open June 20',
      icon: '🎵',
      iconColor: '#ec4899',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60'
    }
  };

  const mapped = mappings[item.id];
  if (mapped) {
    return {
      trainName: item.title,
      source: mapped.source,
      destination: mapped.destination,
      platform: mapped.platform,
      icon: mapped.icon,
      iconColor: mapped.iconColor,
      image: mapped.image,
      ratingScore: item.ratingScore || '4.5',
      ratingText: item.ratingText || 'Good',
      usersCount: item.usersCount || '100+ Users',
      stars: item.stars || 4
    };
  }

  return {
    trainName: item.title,
    source: sectionId === 'news' ? 'Local Update' : 'Local Event',
    destination: item.subtitle,
    platform: item.tag || 'Live Info',
    icon: item.emoji || (sectionId === 'news' ? '📰' : '📅'),
    iconColor: sectionId === 'news' ? '#3b82f6' : '#10b981',
    image: item.image || (sectionId === 'news' ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=60' : 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=60'),
    ratingScore: item.ratingScore || '4.5',
    ratingText: item.ratingText || 'Good',
    usersCount: item.usersCount || '100+ Users',
    stars: item.stars || 4
  };
};

const getCombinedConciergePool = () => {
  const newsSec = EXPLORE_SECTIONS.find(s => s.id === 'news');
  const eventsSec = EXPLORE_SECTIONS.find(s => s.id === 'events');

  const newsItems = newsSec ? newsSec.items.map(item => mapExploreItemToConcierge(item, 'news')) : [];
  const eventItems = eventsSec ? eventsSec.items.map(item => mapExploreItemToConcierge(item, 'events')) : [];

  return [...CONCIERGE_JOURNEYS_POOL, ...newsItems, ...eventItems];
};

const MOCK_ADS = [
  {
    id: 1,
    title: "International Flights Sale",
    desc: "Book your flights now and get up to 30% off.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&auto=format&fit=crop&q=80",
    tag: "FLIGHT OFFER",
    tagBg: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    actionText: "Book Flight",
    href: "/travel-transport/flights",
  },
  {
    id: 2,
    title: "Vande Bharat Express",
    desc: "Experience high-speed, premium train travel.",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1000&auto=format&fit=crop&q=80",
    tag: "TRAIN UPDATE",
    tagBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    actionText: "Check Slots",
    href: "/travel-transport/trains",
  },
  {
    id: 3,
    title: "Elite Turf Booking",
    desc: "Reserve premium football turfs and cricket nets.",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1000&auto=format&fit=crop&q=80",
    tag: "SPORTS EVENT",
    tagBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    actionText: "Reserve Turf",
    href: "/sports-turf/play-arena",
  },
  {
    id: 4,
    title: "Sunburn EDM Festival",
    desc: "Passes selling fast for the biggest music event.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
    tag: "CONCERT PASSES",
    tagBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    actionText: "Buy Tickets",
    href: "/entertainment-events/concerts",
  },
  {
    id: 5,
    title: "Summer Resort Getaway",
    desc: "Luxury beachfront, hill, and forest resorts.",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1000&auto=format&fit=crop&q=80",
    tag: "STAY OFFER",
    tagBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    actionText: "Book Stay",
    href: "/stay-accommodation/resorts",
  }
];

const MOCK_ACTIVITIES = [
  { user: 'Rohan', city: 'Chennai', action: 'booked', item: 'Root Canal Treatment', merchant: 'Apollo Dental Care', time: '2 mins ago', emoji: '🦷', link: '/service/s1' },
  { user: 'Sneha', city: 'Coimbatore', action: 'booked', item: 'Photography Session', merchant: 'Western Ghats ClickPro', time: '5 mins ago', emoji: '📸', link: '/service/svc-8' },
  { user: 'Amit', city: 'Bangalore', action: 'booked', item: 'Art Workshop', merchant: 'Cubbon ArtHouse', time: '10 mins ago', emoji: '🎨', link: '/service/svc-10' },
  { user: 'Vijay', city: 'Madurai', action: 'reserved a table', item: 'Table Reservation', merchant: 'The Grand Temple Dine', time: '1 min ago', emoji: '🍴', link: '/service/svc-3' },
  { user: 'Vikram', city: 'Delhi', action: 'booked', item: 'Tennis Court Reservation', merchant: 'Connaught SportArena', time: '15 mins ago', emoji: '🎾', link: '/service/svc-12' },
  { user: 'Harini', city: 'Chennai', action: 'booked', item: 'Premium Haircut', merchant: 'Style Studio', time: '4 mins ago', emoji: '💇', link: '/service/svc-1' },
  { user: 'Rahul', city: 'Chennai', action: 'booked', item: 'Yoga Class', merchant: 'ZenFit', time: '7 mins ago', emoji: '🧘', link: '/service/svc-2' }
];

function WishlistButton() {
  const [wished, setWished] = useState(false);
  return (
    <button 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
      className="absolute top-2 right-2 bg-white/90 backdrop-blur w-7 h-7 flex items-center justify-center rounded-full z-20 shadow-sm transition-all"
    >
      <span className={`material-symbols-outlined text-[15px] ${wished ? 'text-red-500 fill-current font-bold' : 'text-gray-400'}`}>
        favorite
      </span>
    </button>
  );
}

function CartAddButton() {
  const [qty, setQty] = useState(0);
  if (qty === 0) {
    return (
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(1); }}
        className="absolute bottom-2 right-2 bg-white text-red-600 font-bold text-[20px] w-8 h-8 rounded-lg shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all z-20"
      >
        +
      </button>
    );
  }
  return (
    <div 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="absolute bottom-2 right-2 bg-white text-red-600 font-bold text-[14px] px-1 py-1 rounded-lg shadow-md border border-gray-100 flex items-center justify-between min-w-[70px] h-8 z-20"
    >
      <button onClick={() => setQty(q => q - 1)} className="px-2 text-red-600 hover:bg-gray-100 rounded text-lg leading-none">-</button>
      <span className="text-black text-xs">{qty}</span>
      <button onClick={() => setQty(q => q + 1)} className="px-2 text-red-600 hover:bg-gray-100 rounded text-lg leading-none">+</button>
    </div>
  );
}

export default function HomePage() {
  const { bookings } = useBookingFlowStore();
  const { city, latitude, longitude } = useLocationStore();
  const { activeShortcuts, setShortcutModalOpen, openActionModal, subnavCategories, setSubnavModalOpen } = useShortcutStore();
  const [mounted, setMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [selectedNearbyService, setSelectedNearbyService] = useState<any | null>(null);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [activeExploreSection, setActiveExploreSection] = useState('news');

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = 320;
      trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const scrollRecommended = (direction: 'left' | 'right') => {
    if (recommendedScrollRef.current) {
      const scrollAmount = 320;
      recommendedScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const scrollEvents = (direction: 'left' | 'right') => {
    if (eventsScrollRef.current) {
      const scrollAmount = 320;
      eventsScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const journeysScrollRef = useRef<HTMLDivElement>(null);
  const scrollJourneys = (direction: 'left' | 'right') => {
    if (journeysScrollRef.current) {
      const scrollAmount = 320;
      journeysScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Real-time active Concierge Journeys
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);

  // Initialize active journeys on mount
  useEffect(() => {
    const combinedPool = getCombinedConciergePool();
    const initial = [
      {
        id: 'uj-1',
        ...combinedPool[0 % combinedPool.length],
        status: 'CONFIRMED',
        secondsLeft: 35
      },
      {
        id: 'uj-2',
        ...combinedPool[1 % combinedPool.length],
        status: 'CONFIRMED',
        secondsLeft: 70
      },
      {
        id: 'uj-3',
        ...combinedPool[2 % combinedPool.length],
        status: 'CONFIRMED',
        secondsLeft: 120
      },
      {
        id: 'uj-4',
        ...combinedPool[3 % combinedPool.length],
        status: 'CONFIRMED',
        secondsLeft: 180
      },
      {
        id: 'uj-5',
        ...combinedPool[4 % combinedPool.length],
        status: 'CONFIRMED',
        secondsLeft: 250
      }
    ];
    setActiveJourneys(initial);
  }, []);

  // Update journeys time & rotate on departure
  useEffect(() => {
    if (activeJourneys.length === 0) return;

    const timer = setInterval(() => {
      setActiveJourneys((prev) => {
        let departedIds: string[] = [];
        const updated = prev.map((j) => {
          const nextSec = j.secondsLeft - 1;
          if (nextSec <= 0) {
            departedIds.push(j.id);
          }
          return { ...j, secondsLeft: nextSec };
        });

        // Filter out expired journeys
        let remaining = updated.filter((j) => j.secondsLeft > 0);

        if (departedIds.length > 0) {
          const combinedPool = getCombinedConciergePool();
          departedIds.forEach(() => {
            const activeNames = remaining.map(r => r.trainName);
            const candidates = combinedPool.filter(p => !activeNames.includes(p.trainName));
            const poolItem = candidates.length > 0
              ? candidates[Math.floor(Math.random() * candidates.length)]
              : combinedPool[Math.floor(Math.random() * combinedPool.length)];

            remaining.push({
              id: 'uj-' + Date.now() + Math.random(),
              ...poolItem,
              status: 'CONFIRMED',
              secondsLeft: Math.floor(Math.random() * 120) + 90
            });
          });
        }

        // Sort by soonest departing
        return remaining.sort((a, b) => a.secondsLeft - b.secondsLeft);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeJourneys.length]);

  const formatSecondsLeft = (seconds: number) => {
    if (seconds <= 0) return 'Departing...';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `Departs in ${m}m ${s}s`;
    }
    return `Departs in ${s}s`;
  };

  // Live activity notification ticker state
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activityDismissed, setActivityDismissed] = useState(false);

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live activity notification ticker logic
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      if (!activityDismissed) {
        const randomIdx = Math.floor(Math.random() * MOCK_ACTIVITIES.length);
        setCurrentActivity(MOCK_ACTIVITIES[randomIdx]);
        setShowActivity(true);
      }
    }, 6000);

    const interval = setInterval(() => {
      setShowActivity(false);
      setTimeout(() => {
        if (!activityDismissed) {
          const randomIdx = Math.floor(Math.random() * MOCK_ACTIVITIES.length);
          setCurrentActivity(MOCK_ACTIVITIES[randomIdx]);
          setShowActivity(true);
        }
      }, 500);
    }, 18000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [activityDismissed]);

  const getDiff = (idx: number) => {
    let d = idx - adIndex;
    if (d < -2) d += 5;
    if (d > 2) d -= 5;
    return d;
  };

  const cityCenter = useMemo(() => {
    return CITY_COORDINATES[(city || 'Chennai').toLowerCase()] || { lat: 13.0827, lng: 80.2707 };
  }, [city]);

  const mapCenter = useMemo((): [number, number] => {
    if (latitude !== null && longitude !== null) return [latitude, longitude];
    return [cityCenter.lat, cityCenter.lng];
  }, [cityCenter, latitude, longitude]);

  // Reset panned center when city or manual location changes (re-centers the map)
  useEffect(() => {
    setUserPannedCenter(null);
  }, [city, latitude, longitude]);

  const activeMapCenter = useMemo((): [number, number] => {
    return userPannedCenter || mapCenter;
  }, [userPannedCenter, mapCenter]);

  // Fetch real services from NestJS backend near activeMapCenter for homepage radar
  useEffect(() => {
    let active = true;
    const fetchRealServices = async () => {
      try {
        const [lat, lng] = activeMapCenter;
        const response = await api.services.list({
          latitude: String(lat),
          longitude: String(lng),
          radius: '25',
          limit: '20',
        });
        if (active && response && (response as any).data) {
          setRealServices((response as any).data);
        }
      } catch (err) {
        console.warn('Failed to fetch real homepage services:', err);
      }
    };
    fetchRealServices();
    return () => {
      active = false;
    };
  }, [activeMapCenter]);

  // Generate popular nearby merchants dynamically for the homepage map
  const homepageNearbyServices = useMemo(() => {
    const list: any[] = [];

    // 1. First, map and include real services from the database
    const mappedReal = realServices
      .filter((s: any) => s && s.merchant && s.category)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        merchant: s.merchant.name,
        price: `₹${s.basePrice}`,
        rating: s.rating,
        reviews: s.reviewCount,
        category: s.category.name,
        emoji: '🏢',
        lat: s.merchant.latitude,
        lng: s.merchant.longitude,
        address: s.merchant.address || 'Premium verified venue',
        distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], s.merchant.latitude, s.merchant.longitude),
      }));

    list.push(...mappedReal);

    // 2. Next, generate dynamic mock providers (avoiding duplicates)
    const categoriesToMap = [
      { slug: 'doctor', name: 'Hospitals', emoji: '🏥' },
      { slug: 'dining', name: 'Restaurants', emoji: '🍴' },
      { slug: 'salons', name: 'Salons', emoji: '💇' },
      { slug: 'hotels', name: 'Hotels', emoji: '🏨' },
      { slug: 'football-turf', name: 'Sports turfs', emoji: '⚽' }
    ];

    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    categoriesToMap.forEach((cat, idx) => {
      const providers = getProvidersByCategory(cat.slug, cat.name, city);
      if (providers) {
        providers.forEach((p, pIdx) => {
          const seedLat = idx * 17 + pIdx;
          const seedLng = idx * 31 + pIdx * 3;
          // Generate realistic offsets within a local radius (~2 km) around cityCenter
          const lat = cityCenter.lat + (pseudoRandom(seedLat) - 0.5) * 0.022;
          const lng = cityCenter.lng + (pseudoRandom(seedLng) - 0.5) * 0.022;

          const itemVal = {
            id: p.id,
            name: p.name,
            merchant: p.name,
            price: p.price,
            rating: p.rating,
            reviews: p.reviewCount,
            category: cat.name,
            emoji: cat.emoji,
            lat: lat,
            lng: lng,
            address: p.address,
            distance: calculateDistance(activeMapCenter[0], activeMapCenter[1], lat, lng)
          };

          if (!list.some(existing => existing.id === itemVal.id || existing.name === itemVal.name)) {
            list.push(itemVal);
          }
        });
      }
    });

    return list.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [city, cityCenter, activeMapCenter, realServices]);

  // Default select first item
  useEffect(() => {
    if (homepageNearbyServices.length > 0) {
      // Keep selected item within the list if still matching, otherwise pick first
      const exists = homepageNearbyServices.some(s => s.id === selectedNearbyService?.id);
      if (!exists) {
        setSelectedNearbyService(homepageNearbyServices[0]);
      }
    }
  }, [homepageNearbyServices, selectedNearbyService]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[color:var(--color-background)]">
        <div className="h-8 w-8 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = Array.isArray(bookings) ? bookings.filter(b => b.status === 'CONFIRMED').length : 0;
  const activeNote = activeCount === 1 ? '1 active reservation' : `${activeCount} active reservations`;

  return (
    <>
      <ShortcutManagerModal />
      <SubnavManagerModal />
      <ActionModalManager />

      <main className="page-content px-4 md:px-8 lg:pr-8">
        <div className="mx-auto w-full">
          {/* Row 1: Main Categories & Dashboard pill */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2 pt-3.5">
            <div className="flex items-center gap-2.5 overflow-x-auto py-2 pr-4 custom-scrollbar shrink-0 max-w-full lg:max-w-[75%] scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {['travel-transport', 'stay-accommodation', 'entertainment-events', 'sports-turf', 'lifestyle-local'].map(catId => {
                const category = SUBNAV_CATEGORIES.find(c => c.id === catId);
                if (!category) return null;
                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="transition-all flex items-center gap-1 cursor-pointer text-[13px] font-extrabold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] shrink-0 pr-2"
                  >
                    <span className="text-[14px] leading-none shrink-0">{category.emoji}</span>
                    <span className="whitespace-nowrap">{category.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-3 px-1">
              <Link
                href="/vendor/register"
                className="bg-[#2a4365] text-white pl-1.5 pr-4 h-8 rounded-full flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] font-bold cursor-pointer shrink-0 border border-white/20"
              >
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[7px] text-[#2a4365]" style={{ transform: 'scale(0.7)' }}>storefront</span>
                </div>
                <span className="text-white text-[11px] font-bold tracking-wide select-none">VENDOR</span>
              </Link>
              <Link href="/support" className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0" aria-label="Help & Support">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">support_agent</span>
              </Link>
              <Link href="/profile" className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0" aria-label="Settings">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">settings</span>
              </Link>
            </div>
          </div>

          {/* Divider line between services and ad banner */}
          <div className="w-full relative border-b border-[color:var(--color-outline-variant)]/20 mb-2" />

          {/* Row 2: Ad Banner */}
          <section
            id="ad-banner-hero"
            data-ad-slot=""
            aria-label="Advertisement"
            className="ad-block mb-4 w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]"
          >
            <div className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[270px] relative flex items-center justify-center">
              {MOCK_ADS.map((ad, idx) => {
                const isActive = adIndex === idx;
                
                return (
                  <div
                    key={ad.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'}`}
                  >
                    {/* Background Image & Overlay */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full object-cover brightness-50"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    </div>



                    {/* Ad Content */}
                    <div className="absolute inset-0 z-20 p-5 md:p-8 flex flex-col justify-end text-left">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${ad.tagBg}`}>
                          {ad.tag}
                        </span>
                      </div>
                      <h4 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 tracking-wide leading-tight">
                        {ad.title}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-200 font-medium max-w-xl mb-4 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                        {ad.desc}
                      </p>
                      <Link
                        href={ad.href}
                        className="self-start px-5 py-2.5 rounded-full text-[10px] md:text-[11px] font-black tracking-widest bg-[color:var(--color-primary)] text-black hover:scale-105 transition-transform shadow-[0_4px_12px_rgba(212,175,55,0.4)] active:scale-98"
                      >
                        {ad.actionText.toUpperCase()}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator inside Banner */}
            <div className="absolute bottom-4 left-0 w-full flex items-center justify-center gap-2 z-30">
              {MOCK_ADS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setAdIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${adIndex === idx
                      ? 'w-5 bg-[color:var(--color-primary)]'
                      : 'w-1.5 bg-white/50 hover:bg-white'
                    }`}
                  aria-label={`Go to ad slide ${idx + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Row 3: Shortcuts Dock */}
          <section className="mb-6 mt-6 md:mt-8">

            <div className="flex flex-wrap items-center gap-3">
              {Array.isArray(activeShortcuts) && activeShortcuts.length > 0 ? (
                activeShortcuts.slice(0, 6).map(id => AVAILABLE_SHORTCUTS.find(s => s.id === id)).filter(Boolean).map(shortcut => {
                  if (!shortcut) return null;
                  const handleAction = () => {
                    if (shortcut.actionType === 'modal') {
                      openActionModal(shortcut.actionTarget);
                    } else {
                      window.location.href = shortcut.actionTarget;
                    }
                  };
                  return (
                    <button
                      key={shortcut.id}
                      onClick={handleAction}
                      className="h-10 px-5 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-container)]/40 hover:border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-surface-container-high)]/60 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer text-xs font-extrabold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] shadow-sm backdrop-blur-md"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[color:var(--color-primary)]">{shortcut.icon}</span>
                      <span>{shortcut.label}</span>
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-[color:var(--color-outline)] italic mr-2">No shortcuts added yet.</span>
              )}

              {/* Manage Dock Shortcuts Button */}
              <button
                onClick={() => setShortcutModalOpen(true)}
                className="h-10 px-4 rounded-2xl border border-dashed border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/[0.03] hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-[color:var(--color-primary)]"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Shortcut</span>
              </button>
            </div>
          </section>

          {/* Row 4: Recommended Section */}
          <section className="mb-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight">Recommended For You</h2>
                <p className="text-[11px] mt-0.5 text-[color:var(--color-outline)]">Curated bookings and activities tailored to your profile</p>
              </div>
              <Link href="/search" className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                View All
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            </div>

            <div className="relative group">
              {/* Left Arrow */}
              <button 
                onClick={() => scrollRecommended('left')} 
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_left</span>
              </button>

              {/* Right Arrow */}
              <button 
                onClick={() => scrollRecommended('right')} 
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_right</span>
              </button>

              <div 
                ref={recommendedScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
              {RECOMMENDED_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="w-[280px] shrink-0 snap-start group flex flex-col self-stretch"
                >
                  <div className="bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                    {/* Image Section */}
                    <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <WishlistButton />
                      <CartAddButton />
                      {/* Badge */}
                      {item.badge && (
                        <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                          <span className="material-symbols-outlined text-[10px]">sell</span>
                          {item.badge}
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-sm text-[color:var(--color-on-surface)] truncate pr-2">
                          {item.title}
                        </h3>
                        <div className="flex text-yellow-500 shrink-0">
                          {[...Array(item.stars)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-[color:var(--color-outline)] mb-3">{item.location}</p>
                      
                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-[#20274d] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {item.ratingScore}
                          </div>
                          <div className="text-[10px] text-[color:var(--color-on-surface)]">
                            <span className="font-bold">{item.ratingText}</span>
                            <span className="text-[color:var(--color-outline)] mx-1">•</span>
                            <span className="text-[color:var(--color-outline)]">{item.usersCount}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-[color:var(--color-on-surface)]">
                            {item.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              </div>
            </div>
          </section>


          {/* Row 5: Trending Now (Horizontal scrolling format below Recommended) */}
          {(() => {
            const sec = EXPLORE_SECTIONS.find(s => s.id === 'trending');
            if (!sec) return null;
            return (
              <section className="mb-10 text-left">
                <div className="bg-[color:var(--color-surface-container)] rounded-3xl p-6 shadow-sm border border-[color:var(--color-outline-variant)]/20">
                  <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight flex items-center gap-2">
                      <span className="select-none text-xl">{sec.emoji}</span>
                      <span>{sec.title}</span>
                    </h2>
                    <p className="text-[11px] mt-0.5 text-[color:var(--color-outline)]">{sec.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link href={sec.href} className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                      View All
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                <div className="relative group">
                  {/* Left Arrow */}
                  <button 
                    onClick={() => scrollTrending('left')} 
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_left</span>
                  </button>

                  {/* Right Arrow */}
                  <button 
                    onClick={() => scrollTrending('right')} 
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_right</span>
                  </button>

                  <div 
                    ref={trendingScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                  {sec.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[280px] shrink-0 snap-start group flex flex-col self-stretch"
                    >
                      <div className="bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <WishlistButton />
                          <CartAddButton />
                          {/* Badge */}
                          {item.badge && (
                            <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                              <span className="material-symbols-outlined text-[10px]">sell</span>
                              {item.badge}
                            </div>
                          )}
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-3 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-bold text-sm text-[color:var(--color-on-surface)] truncate pr-2">
                              {item.title}
                            </h3>
                            <div className="flex text-yellow-500 shrink-0">
                              {[...Array(item.stars || 4)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-[color:var(--color-outline)] mb-3">{item.location}</p>
                          
                          <div className="flex items-end justify-between mt-auto">
                            <div className="flex items-center gap-1.5">
                              <div className="bg-[#20274d] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {item.ratingScore}
                              </div>
                              <div className="text-[10px] text-[color:var(--color-on-surface)]">
                                <span className="font-bold">{item.ratingText}</span>
                                <span className="text-[color:var(--color-outline)] mx-1">•</span>
                                <span className="text-[color:var(--color-outline)]">{item.usersCount}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-[color:var(--color-on-surface)]">
                                {item.price}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  </div>
                </div>
                </div>
              </section>
            );
          })()}

          {/* Row 6: Local Events (Horizontal scrolling format below Trending Now) */}
          {(() => {
            const sec = EXPLORE_SECTIONS.find(s => s.id === 'events');
            if (!sec) return null;
            return (
              <section className="mb-10 text-left">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight flex items-center gap-2">
                      <span className="select-none text-xl">{sec.emoji}</span>
                      <span>{sec.title}</span>
                    </h2>
                    <p className="text-[11px] mt-0.5 text-[color:var(--color-outline)]">{sec.description}</p>
                  </div>
                  <Link href={sec.href} className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                    View All
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="relative group">
                  {/* Left Arrow */}
                  <button 
                    onClick={() => scrollEvents('left')} 
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_left</span>
                  </button>

                  {/* Right Arrow */}
                  <button 
                    onClick={() => scrollEvents('right')} 
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-black/10 dark:border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[color:var(--color-on-surface)]">chevron_right</span>
                  </button>

                  <div 
                    ref={eventsScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                  {sec.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[280px] shrink-0 snap-start group flex flex-col self-stretch"
                    >
                      <div className="bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative h-[160px] w-full shrink-0 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <WishlistButton />
                          <CartAddButton />
                          {/* Badge */}
                          {item.badge && (
                            <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                              <span className="material-symbols-outlined text-[10px]">sell</span>
                              {item.badge}
                            </div>
                          )}
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-3 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-bold text-sm text-[color:var(--color-on-surface)] truncate pr-2">
                              {item.title}
                            </h3>
                            <div className="flex text-yellow-500 shrink-0">
                              {[...Array(item.stars || 4)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-[color:var(--color-outline)] mb-3">{item.location}</p>
                          
                          <div className="flex items-end justify-between mt-auto">
                            <div className="flex items-center gap-1.5">
                              <div className="bg-[#20274d] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                {item.ratingScore}
                              </div>
                              <div className="text-[10px] text-[color:var(--color-on-surface)]">
                                <span className="font-bold">{item.ratingText}</span>
                                <span className="text-[color:var(--color-outline)] mx-1">•</span>
                                <span className="text-[color:var(--color-outline)]">{item.usersCount}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-[color:var(--color-on-surface)]">
                                {item.price}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Row 4.5: Upcoming Concierge Journey Section */}
          <section className="mb-10 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight">Upcoming Concierge Journeys & Events</h2>
              </div>
              <Link href="/search" className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                View All
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            </div>

            <div className="relative group overflow-hidden w-full">
              <div 
                className="flex gap-10 md:gap-14 overflow-visible pb-4 pt-1 animate-marquee"
              >
                {[...activeJourneys, ...activeJourneys, ...activeJourneys, ...activeJourneys, ...activeJourneys].map((journey, index) => (
                  <Link
                    href="#"
                    key={`${journey.id}-${index}`}
                    className="w-[140px] shrink-0 snap-start group flex flex-col items-center gap-2"
                  >
                    {/* Image Section */}
                    <div className="relative h-[130px] w-[130px] rounded-full overflow-hidden border-2 border-white dark:border-white/20 shadow-md">
                      <img 
                        src={journey.image} 
                        alt={journey.trainName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex flex-col items-center text-center w-full px-1">
                      <h3 className="font-extrabold text-[14px] leading-tight text-[color:var(--color-on-surface)] line-clamp-2 w-full mb-1 min-h-[40px] flex items-center justify-center">
                        {journey.trainName}
                      </h3>
                      
                      {/* Live Timer Badge */}
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        {formatSecondsLeft(journey.secondsLeft)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="h-px bg-[color:var(--color-outline-variant)]/20 my-8 w-full" />

          {/* Unified Explore More Section (Tabs based on screenshot) */}
          <section className="mb-10 text-left">
            <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight mb-4">
              Explore More Options
            </h2>
            <div className="flex flex-col-reverse md:flex-row bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm min-h-[260px]">
              
              {/* Left Content Area (Vertical Scroll Grid) */}
              <div className="flex-1 px-4 pt-1 pb-4 md:px-6 md:pt-2 md:pb-6 overflow-y-auto max-h-[260px] custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                {(() => {
                  const activeSec = EXPLORE_SECTIONS.find(s => s.id === activeExploreSection);
                  if (!activeSec) return null;
                  
                  const getImageForTitle = (title: string) => {
                    const t = title.toLowerCase();
                    if (t.includes('metro') || t.includes('rail')) return 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('yoga') || t.includes('zenfit')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('monsoon') || t.includes('safety')) return 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('temple') || t.includes('darshan')) return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('dental')) return 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('style') || t.includes('spa') || t.includes('salon')) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('palace') || t.includes('stay') || t.includes('hotel')) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60';
                    if (t.includes('turf') || t.includes('sports')) return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60';
                    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60';
                  };

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                      {activeSec.items.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-[color:var(--color-outline-variant)]/40 shadow-sm hover:shadow-md transition-shadow flex flex-row h-[200px] group">
                          {/* Top Image */}
                          <div className="relative w-1/2 shrink-0 h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <img src={item.image || getImageForTitle(item.title)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <WishlistButton />
                            <CartAddButton />
                            {item.tag && (
                              <div className="absolute top-2 left-2 bg-[#b548ff] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">sell</span>
                                {item.tag}
                              </div>
                            )}
                          </div>
                          
                          {/* Bottom Content */}
                          <div className="p-3 flex flex-col flex-1 justify-between">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-extrabold text-[13px] text-[color:var(--color-on-surface)] truncate pr-1">{item.title}</h3>
                              <div className="flex items-center text-yellow-500 shrink-0">
                                {[...Array(item.stars || 4)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                              </div>
                            </div>
                            
                            <p className="text-[10px] text-[color:var(--color-outline)] mb-3 line-clamp-1">
                              {item.subtitle || item.location}
                            </p>
                            
                            <div className="mt-auto flex justify-between items-end">
                              <div className="flex items-center gap-1.5">
                                <div className="bg-[#1f2937] dark:bg-white text-white dark:text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                                  {item.rating || '4.5'}
                                </div>
                                <span className="text-[9px] font-bold text-[color:var(--color-on-surface)]">
                                  Great <span className="text-[color:var(--color-outline)] font-normal mx-0.5">•</span> <span className="text-[color:var(--color-outline)] font-normal">50+</span>
                                </span>
                              </div>
                              {item.price ? (
                                <div className="font-extrabold text-[13px] text-[color:var(--color-on-surface)]">
                                  {item.price}
                                </div>
                              ) : (
                                <div className="text-[11px] font-extrabold text-[color:var(--color-primary)]">
                                  View
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Right Sidebar (Nav Links) */}
              <div className="w-full md:w-[260px] shrink-0 border-b md:border-b-0 md:border-l border-[color:var(--color-outline-variant)]/20 bg-white/10 dark:bg-black/10 flex flex-col pt-2">
                
                <div className="flex flex-col">
                  {EXPLORE_SECTIONS.filter(s => s.id !== 'trending' && s.id !== 'events').map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => setActiveExploreSection(sec.id)}
                      className={`text-left px-5 py-4 text-[13px] font-semibold transition-all border-l-[3px] border-b border-b-[color:var(--color-outline-variant)]/10 last:border-b-0 ${
                        activeExploreSection === sec.id 
                          ? 'border-l-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white dark:bg-[color:var(--color-primary)] dark:text-white' 
                          : 'border-l-transparent text-[color:var(--color-on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Row 6: Nearby Services */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-bold text-[color:var(--color-on-surface)] tracking-tight">Nearby Services Live Radar</h2>
                <p className="text-[12px] mt-0.5 text-[color:var(--color-outline)]">Real-time local tracking and instant slot bookings in {city}</p>
              </div>
              <Link
                href="/maps"
                className="flex items-center gap-1 text-[12px] font-semibold text-[color:var(--color-primary)] hover:gap-2 transition-all duration-300"
              >
                Expand Maps Hub
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-stretch">
              {/* Map Canvas */}
              <div className="lg:col-span-2 h-[380px] rounded-3xl overflow-hidden border border-[color:var(--color-outline-variant)]/30 shadow-2xl relative bg-slate-900/50">
                <MapComponent
                  center={selectedNearbyService ? [selectedNearbyService.lat, selectedNearbyService.lng] : (userPannedCenter || mapCenter)}
                  zoom={selectedNearbyService ? 17 : 13}
                  selectedMarkerId={selectedNearbyService?.id}
                  onCenterChange={(lat, lng) => setUserPannedCenter([lat, lng])}
                  onMarkerClick={(marker) => {
                    if (selectedNearbyService && selectedNearbyService.id === marker.id) {
                      setSelectedNearbyService(null);
                    } else {
                      const match = homepageNearbyServices.find(s => s.id === marker.id);
                      if (match) setSelectedNearbyService(match);
                    }
                  }}
                  markers={homepageNearbyServices.map(svc => ({
                    id: svc.id,
                    name: svc.name,
                    merchant: svc.merchant,
                    lat: svc.lat,
                    lng: svc.lng,
                    emoji: svc.emoji,
                    category: svc.category,
                    price: svc.price,
                    rating: svc.rating,
                    linkUrl: `/service/${svc.id}`
                  }))}
                />
              </div>

              {/* Scrollable list card */}
              <div className="lg:col-span-1 rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/80 backdrop-blur p-4 flex flex-col justify-between h-[380px] card-glass">
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)] block mb-1">📡 Real-Time Sensing Feed</span>
                  {homepageNearbyServices.map((svc) => {
                    const isSelected = selectedNearbyService?.id === svc.id;
                    return (
                      <div
                        key={svc.id}
                        onClick={() => setSelectedNearbyService(svc)}
                        className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${isSelected
                            ? 'bg-[color:var(--color-primary)]/10 border-[color:var(--color-primary)]'
                            : 'bg-[color:var(--color-surface-dim)]/30 border-[color:var(--color-outline-variant)]/20 hover:bg-[color:var(--color-surface-dim)]/50'
                          }`}
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-outline-variant)]/30 flex items-center justify-center text-xl">
                          {svc.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-xs text-[color:var(--color-on-surface)] truncate leading-tight">{svc.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[color:var(--color-on-surface-variant)]">
                            <span className="font-bold flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" /> {svc.rating}</span>
                            <span>•</span>
                            <span className="font-medium">📍 {svc.distance ? `${svc.distance.toFixed(1)} km` : '1.2 km'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom preview detail card */}
                {selectedNearbyService && (
                  <div className="mt-3 border-t border-[color:var(--color-outline-variant)]/20 pt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-[color:var(--color-on-surface)] truncate">{selectedNearbyService.name}</h4>
                      <p className="text-[10px] text-[color:var(--color-primary)] font-bold mt-0.5">{selectedNearbyService.price}</p>
                    </div>
                    <Link
                      href={`/service/${selectedNearbyService.id}`}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 py-2 text-[10px] uppercase font-bold text-white shadow hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all flex items-center gap-1 shrink-0"
                    >
                      Book <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Row 7: Detailed Footer */}
          <footer className="mt-16 border-t border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-container)]/10 backdrop-blur-xl pt-12 pb-24 px-6 md:px-12 rounded-t-[32px] card-glass relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02]" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />

            {/* Top Row: Customer Support Socials & Newsletter */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-[color:var(--color-outline-variant)]/10 z-10 relative">

              {/* Left: Customer Support Social Handles */}
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left w-full lg:w-auto">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[color:var(--color-outline)]">
                  Customer Support
                </span>
                <div className="flex items-center justify-center gap-2.5">
                  {[
                    { icon: 'public', label: 'FB', href: 'https://facebook.com', color: 'hover:text-blue-500' },
                    { icon: 'share', label: 'TW', href: 'https://twitter.com', color: 'hover:text-sky-400' },
                    { icon: 'photo_camera', label: 'IG', href: 'https://instagram.com', color: 'hover:text-pink-500' },
                    { icon: 'smart_display', label: 'YT', href: 'https://youtube.com', color: 'hover:text-red-500' },
                    { icon: 'send', label: 'TG', href: 'https://telegram.org', color: 'hover:text-sky-500' }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-full bg-[color:var(--color-surface-container-high)]/40 border border-[color:var(--color-outline-variant)]/20 flex items-center justify-center text-[color:var(--color-on-surface-variant)] transition-all hover:scale-105 active:scale-95 shadow-sm ${social.color}`}
                      title={social.label}
                    >
                      <span className="material-symbols-outlined text-[16px]">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right: Newsletter Subscription */}
              <div className="w-full lg:w-auto flex flex-col md:flex-row items-center justify-center lg:justify-end gap-3">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[color:var(--color-outline)] shrink-0">
                  Subscribe to Newsletter
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                    if (email) {
                      alert(`Thank you for subscribing, ${email}!`);
                      e.currentTarget.reset();
                    }
                  }}
                  className="flex items-center w-full md:w-80 rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/50 p-1.5 focus-within:border-[color:var(--color-primary)]/45 transition-colors card-glass"
                >
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent border-none outline-none text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] px-3 py-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors text-[10px] font-black uppercase tracking-wider"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Center Row: 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 z-10 relative">

              {/* Column 1: Exclusive Bookings */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)]">
                  Exclusive Bookings
                </h4>
                <ul className="space-y-2">
                  {['New Events', 'Featured Venues', 'Top Locations', 'Ongoing Promos'].map((link) => (
                    <li key={link}>
                      <Link
                        href="/categories"
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: BokSpot */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold bg-white/90 dark:bg-white/95 px-2.5 py-1 rounded-full border border-white/10 shadow-sm inline-block">
                  <span className="logo-text-bok text-[#0a3161]">Bok</span>
                  <span className="logo-text-spot text-[#ff6325]">Spot</span>
                </h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'All Categories', href: '/categories' },
                    { label: 'Live Radar Maps', href: '/maps' },
                    { label: 'Active Tracks', href: '/tracks' }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: About Us */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)]">
                  About Us
                </h4>
                <ul className="space-y-2">
                  {['Our Story', 'Company Bio', 'Careers', 'Press Kit', 'Privacy Policy'].map((link) => (
                    <li key={link}>
                      <Link
                        href="/profile#settings"
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Customer Care Support */}
              <div className="text-left space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-[color:var(--color-primary)]">
                  Customer Care Support
                </h4>
                <ul className="space-y-2">
                  {['Help Center / FAQs', 'Contact Support', 'Live Chat', 'Refund Policy', 'Terms of Service'].map((link) => (
                    <li key={link}>
                      <Link
                        href="/profile#saved"
                        className="text-xs text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors font-semibold"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Row: Logo & Copyright */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[color:var(--color-outline-variant)]/10 z-10 relative">
              <Link
                href="/"
                className="flex items-center gap-2 bg-white/90 dark:bg-white/95 px-3.5 py-1.5 rounded-full border border-white/20 shadow-md font-['Playfair_Display'] text-[15px] tracking-[0.15em] uppercase font-extrabold hover:opacity-90 transition-all shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#ff6325] fill-[#ff6325]" />
                <span className="font-black">
                  <span className="logo-text-bok text-[#0a3161]">BOK</span>
                  <span className="logo-text-spot text-[#ff6325]">SPOT</span>
                </span>
              </Link>
              <p className="text-[10px] font-bold text-[color:var(--color-outline)] tracking-wider">
                COPYRIGHT &copy; 2026 BOKSPOT. ALL RIGHTS RESERVED.
              </p>
            </div>
          </footer>
        </div>
      </main>

      {/* Glassmorphic Dashboard Drawer/Modal */}
      {dashboardOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[color:var(--color-surface-container)]/90 border border-[color:var(--color-outline-variant)]/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-up card-glass">

            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[color:var(--color-outline-variant)]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[color:var(--color-primary)]">analytics</span>
                <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Dashboard Control Center</h3>
              </div>
              <button
                onClick={() => setDashboardOpen(false)}
                className="p-1.5 hover:bg-[color:var(--color-on-surface)]/[0.05] rounded-full text-[color:var(--color-outline)] hover:text-[color:var(--color-primary)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Active Bookings"
                  value={String(activeCount)}
                  note={activeNote}
                  icon="event_available"
                />
                <StatCard
                  label="Saved Places"
                  value="28"
                  note="Verified local venues"
                  icon="bookmark"
                />
                <StatCard
                  label="Support Score"
                  value="98%"
                  note="Instant response rating"
                  icon="support_agent"
                />
              </div>

              {/* Quick Access Library */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[color:var(--color-outline)]">explore</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[color:var(--color-outline)]">Quick Library</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_SHORTCUTS.map(shortcut => {
                    const handleAction = () => {
                      setDashboardOpen(false);
                      if (shortcut.actionType === 'modal') {
                        openActionModal(shortcut.actionTarget);
                      } else {
                        window.location.href = shortcut.actionTarget;
                      }
                    };
                    return (
                      <button
                        key={shortcut.id}
                        onClick={handleAction}
                        className="h-10 px-3 rounded-xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/50 hover:border-[color:var(--color-primary)]/45 hover:bg-[color:var(--color-surface-container-high)]/60 transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] text-left truncate"
                      >
                        <span className="material-symbols-outlined text-[15px] text-[color:var(--color-primary)]">{shortcut.icon}</span>
                        <span className="truncate">{shortcut.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-[color:var(--color-surface-dim)]/50 border-t border-[color:var(--color-outline-variant)]/25 flex justify-end">
              <button
                onClick={() => {
                  setDashboardOpen(false);
                  setShortcutModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors text-xs font-bold shadow-md"
              >
                Manage Docks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time floating activity ticker */}
      <AnimatePresence>
        {showActivity && currentActivity && !activityDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-20 lg:bottom-6 left-4 z-40 max-w-sm rounded-2xl border border-white/10 bg-black/75 backdrop-blur-xl p-4 shadow-2xl flex gap-3 text-left group"
          >
            {/* Live Indicator Icon */}
            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 shadow-inner">
              {currentActivity.emoji}
            </div>

            {/* Text details */}
            <div className="flex-1 space-y-1 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400">Live booking activity</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-300 leading-normal">
                <span className="font-extrabold text-white">{currentActivity.user}</span> in <span className="text-[#fceea7] font-bold">{currentActivity.city}</span> {currentActivity.action} <span className="font-bold text-white underline underline-offset-2 decoration-indigo-400">{currentActivity.item}</span> <span className="text-slate-400 text-[10px] block font-medium mt-0.5">at {currentActivity.merchant}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase">{currentActivity.time}</span>
                <Link href={currentActivity.link || '/'} className="text-[9px] font-black text-indigo-400 uppercase tracking-wider hover:text-indigo-300 transition-colors flex items-center gap-0.5">
                  View Service <ArrowRight size={8} />
                </Link>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActivity(false);
                setActivityDismissed(true);
              }}
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
