'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Star, Compass, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShortcutManagerModal } from '../components/shortcuts/ShortcutManagerModal';
import { ActionModalManager } from '../components/shortcuts/ActionModalManager';
import { useBookingFlowStore, useLocationStore } from '../lib/store';
import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../store/useShortcutStore';
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
      { id: 't1', title: 'Delhi to Goa Flight', subtitle: 'IndiGo Indigo-603', tag: '₹5,499', rating: '4.9', emoji: '✈️', link: '/travel-transport/flights' },
      { id: 't2', title: 'Taj Palace Luxury Suite', subtitle: 'Mumbai stay reservation', tag: '₹14,500', rating: '4.9', emoji: '🏨', link: '/stay-accommodation/hotels' },
      { id: 't3', title: 'Style Studio Styling', subtitle: 'Haircut & Styling in T Nagar', tag: '₹599', rating: '4.8', emoji: '💇', link: '/service/3' },
      { id: 't4', title: 'Apollo Dental Care', subtitle: 'Oral scaling & checkup', tag: '₹899', rating: '4.8', emoji: '🦷', link: '/service/1' },
      { id: 't5', title: 'Zen Sports Turf', subtitle: '9-a-side football turf slot', tag: '₹1,500/hr', rating: '4.9', emoji: '⚽', link: '/sports-turf/football-turf' }
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
      { id: 'o3', title: 'Style Studio: ₹200 Cash', subtitle: 'Flat cashback on styling slots', tag: 'Cashback', rating: 'Salon', emoji: 'service/3', link: '/service/3' },
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
      { id: 'e1', title: 'Clay Pottery Class', subtitle: 'Weekend workshop in Chennai', tag: 'Sat 4 PM', rating: 'Class', emoji: '🎨', link: '/entertainment-events/workshops' },
      { id: 'e2', title: 'IPL Live Turf Screening', subtitle: 'Match screening at Zen Arena', tag: 'Sun 7 PM', rating: 'Screening', emoji: '⚽', link: '/entertainment-events/events' },
      { id: 'e3', title: 'Corporate Badminton League', subtitle: 'Trophies and cash prizes', tag: 'June 15', rating: 'League', emoji: '🏸', link: '/sports-turf/badminton' },
      { id: 'e4', title: 'Sunburn Arena EDM concert', subtitle: 'Early bird tickets live now', tag: 'June 20', rating: 'Concert', emoji: '🎵', link: '/entertainment-events/concerts' }
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
    category: 'Avengers Movie',
    emoji: '🎬',
    rating: '4.9',
    price: 'From ₹190',
    link: '/entertainment-events/movies',
    bgGradient: 'from-red-950/50 to-black/85',
    borderColor: 'border-red-500/20'
  },
  {
    id: 'r2',
    title: 'Grand Palace Resorts',
    category: 'Stay & Accomm',
    emoji: '🏨',
    rating: '4.8',
    price: 'From ₹4,500',
    link: '/stay-accommodation/hotels',
    bgGradient: 'from-amber-950/50 to-black/85',
    borderColor: 'border-amber-500/20'
  },
  {
    id: 'r3',
    title: 'Vande Bharat Express',
    category: 'Your Next Train',
    emoji: '🚆',
    rating: '4.9',
    price: 'From ₹850',
    link: '/travel-transport/trains',
    bgGradient: 'from-blue-950/50 to-black/85',
    borderColor: 'border-blue-500/20'
  },
  {
    id: 'r4',
    title: 'Sunburn EDM Festival',
    category: 'Events',
    emoji: '🎪',
    rating: '4.7',
    price: 'From ₹1,200',
    link: '/entertainment-events/events',
    bgGradient: 'from-purple-950/50 to-black/85',
    borderColor: 'border-purple-500/20'
  },
  {
    id: 'r5',
    title: 'Zen Strike Play Arena',
    category: 'Play Time',
    emoji: '🎮',
    rating: '4.9',
    price: 'From ₹400',
    link: '/sports-turf/play-arena',
    bgGradient: 'from-emerald-950/50 to-black/85',
    borderColor: 'border-emerald-500/20'
  }
];

const CONCIERGE_JOURNEYS_POOL = [
  {
    trainName: 'Vande Bharat Express (#20608)',
    source: 'SBC (Bengaluru)',
    destination: 'MAS (Chennai)',
    platform: 'Expected PF 7',
    icon: '🚆',
    iconColor: '#ff6325'
  },
  {
    trainName: 'Avengers: Secret Wars',
    source: 'Inox: Forum Mall',
    destination: 'Premium Audi 3',
    platform: 'Seat H-14, H-15',
    icon: '🍿',
    iconColor: '#eab308'
  },
  {
    trainName: 'Metro High-Speed Rail',
    source: 'Central Metro Station',
    destination: 'Airport Terminal 2',
    platform: 'Platform 2 (South)',
    icon: '🚇',
    iconColor: '#3b82f6'
  },
  {
    trainName: 'Sunburn EDM Festival',
    source: 'VGP Golden Beach',
    destination: 'VIP Arena Zone A',
    platform: 'Pass #SB-8920',
    icon: '🎸',
    iconColor: '#ec4899'
  },
  {
    trainName: 'ZenFit Yoga Session',
    source: 'ZenFit Health Studio',
    destination: 'Studio Room B',
    platform: 'Starts 07:00 AM',
    icon: '🧘',
    iconColor: '#10b981'
  },
  {
    trainName: 'Kapaleeshwarar Darshan',
    source: 'Mylapore East Gate',
    destination: 'Inner Sanctum Queue',
    platform: 'Special Entry Pass',
    icon: '🛕',
    iconColor: '#f97316'
  },
  {
    trainName: 'IndiGo Flight 6E-204',
    source: 'MAA (Chennai)',
    destination: 'DEL (New Delhi)',
    platform: 'Boarding Gate 4',
    icon: '✈️',
    iconColor: '#2563eb'
  },
  {
    trainName: 'The Grand Temple Dine',
    source: 'Main Dining Hall',
    destination: 'Rooftop Table 12',
    platform: 'Confirmed Booking',
    icon: '🍴',
    iconColor: '#14b8a6'
  }
];

const mapExploreItemToConcierge = (item: any, sectionId: string) => {
  const mappings: Record<string, { source: string; destination: string; platform: string; icon: string; iconColor: string }> = {
    'n1': {
      source: 'Chennai Central',
      destination: 'New Metro Routes',
      platform: 'Open Today',
      icon: '🚇',
      iconColor: '#3b82f6'
    },
    'n2': {
      source: 'ZenFit Studio',
      destination: 'Morning Yoga Batch',
      platform: 'Starts Mon 7AM',
      icon: '🧘',
      iconColor: '#10b981'
    },
    'n3': {
      source: 'City Gateways',
      destination: 'Hill Station Alert',
      platform: 'Monsoon Guide',
      icon: '🌧️',
      iconColor: '#f59e0b'
    },
    'n4': {
      source: 'Mylapore Gate',
      destination: 'Temple Darshan',
      platform: 'Festival Booking',
      icon: '🛕',
      iconColor: '#ec4899'
    },
    'e1': {
      source: 'Chennai Workshop',
      destination: 'Clay Pottery Class',
      platform: 'Sat 4:00 PM',
      icon: '🎨',
      iconColor: '#a855f7'
    },
    'e2': {
      source: 'Zen Arena Screen',
      destination: 'IPL Live Screening',
      platform: 'Sun 7:00 PM',
      icon: '⚽',
      iconColor: '#ef4444'
    },
    'e3': {
      source: 'Arena Courts',
      destination: 'Badminton League',
      platform: 'Starts June 15',
      icon: '🏸',
      iconColor: '#14b8a6'
    },
    'e4': {
      source: 'VGP Beach Stage',
      destination: 'Sunburn EDM Concert',
      platform: 'Gate Open June 20',
      icon: '🎵',
      iconColor: '#ec4899'
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
      iconColor: mapped.iconColor
    };
  }

  return {
    trainName: item.title,
    source: sectionId === 'news' ? 'Local Update' : 'Local Event',
    destination: item.subtitle,
    platform: item.tag || 'Live Info',
    icon: item.emoji || (sectionId === 'news' ? '📰' : '📅'),
    iconColor: sectionId === 'news' ? '#3b82f6' : '#10b981'
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
    title: "Summer Resort Getaway",
    desc: "Luxury beachfront, hill, and forest resorts.",
    image: "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=1000&auto=format&fit=crop&q=80",
    tag: "STAY OFFER",
    tagBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    actionText: "Book Stay",
    href: "/stay-accommodation/resorts"
  },
  {
    id: 2,
    title: "Vande Bharat Express",
    desc: "Experience high-speed, premium train travel.",
    image: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=1000&auto=format&fit=crop&q=80",
    tag: "TRAIN UPDATE",
    tagBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    actionText: "Check Slots",
    href: "/travel-transport/trains"
  },
  {
    id: 3,
    title: "Elite Turf Booking",
    desc: "Reserve premium football turfs and cricket nets.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80",
    tag: "SPORTS EVENT",
    tagBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    actionText: "Reserve Turf",
    href: "/sports-turf/play-arena"
  },
  {
    id: 4,
    title: "Sunburn EDM Festival",
    desc: "Passes selling fast for the biggest music event.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
    tag: "CONCERT PASSES",
    tagBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    actionText: "Buy Tickets",
    href: "/entertainment-events/concerts"
  },
  {
    id: 5,
    title: "Luxury Spa & Wellness",
    desc: "Rejuvenate your body with premium spa therapies.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80",
    tag: "WELLNESS OFFER",
    tagBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    actionText: "Book Session",
    href: "/lifestyle-local/beauty-wellness"
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

export default function HomePage() {
  const { bookings } = useBookingFlowStore();
  const { city, latitude, longitude } = useLocationStore();
  const { activeShortcuts, setShortcutModalOpen, openActionModal } = useShortcutStore();
  const [mounted, setMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [selectedNearbyService, setSelectedNearbyService] = useState<any | null>(null);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [realServices, setRealServices] = useState<any[]>([]);
  const [activeExploreTab, setActiveExploreTab] = useState('news');
  const [adIndex, setAdIndex] = useState(0);

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
      <ActionModalManager />

      <main className="page-content px-4 md:px-8 lg:pr-8">
        <div className="mx-auto max-w-7xl">
          {/* Row 1: Main Categories & Dashboard pill */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2 pt-3.5">
            <div className="flex items-center gap-5 overflow-x-auto py-1 custom-scrollbar shrink-0 max-w-full lg:max-w-[70%] scroll-smooth">
              {[
                { label: 'Travel', emoji: '✈️', href: '/travel-transport' },
                { label: 'Stay & Accomodation', emoji: '🏨', href: '/stay-accommodation' },
                { label: 'Entertainment', emoji: '🎥', href: '/entertainment-events' },
                { label: 'Sports', emoji: '⚽', href: '/sports-turf' },
                { label: 'Lifestyle Services', emoji: '💇', href: '/lifestyle-local' },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="text-[12px] font-bold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-all flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-[0.98] py-1 px-0.5"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDashboardOpen(true)}
                className="custom-nav-btn pl-1 pr-3 h-7 rounded-full flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] font-bold cursor-pointer shrink-0"
              >
                <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[13px] text-[#0a3161]">dashboard</span>
                </div>
                <span className="text-inherit text-[11px] font-bold tracking-wide select-none">DASHBOARD</span>
              </button>
              <Link
                href="/vendor/register"
                className="custom-nav-btn pl-1 pr-3 h-7 rounded-full flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-[11px] font-bold cursor-pointer shrink-0"
              >
                <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[13px] text-[#0a3161]">storefront</span>
                </div>
                <span className="text-inherit text-[11px] font-bold tracking-wide select-none">VENDOR</span>
              </Link>
            </div>
          </div>

          {/* Divider line between services and ad banner */}
          <div className="w-screen relative left-1/2 -translate-x-1/2 border-b border-[color:var(--color-outline-variant)]/20 mb-2" />

          {/* Row 2: Ad Banner */}
          <section
            id="ad-banner-hero"
            data-ad-slot=""
            aria-label="Advertisement"
            className="ad-block mb-1 flex flex-col items-center gap-2 w-screen relative left-1/2 -translate-x-1/2 overflow-hidden"
          >
            {/* Carousel Container */}
            <div className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[270px] relative flex items-center justify-center">
              {MOCK_ADS.map((ad, idx) => {
                const diff = getDiff(idx);
                
                // Position and styling depending on diff
                let transformStr = "";
                let opacityClass = "";
                let zIndexClass = "";
                let pointerEventsClass = "";
                
                if (diff === 0) {
                  // Center / Active Card
                  transformStr = "translate3d(0, 0, 0) scale(1)";
                  opacityClass = "opacity-100";
                  zIndexClass = "z-20";
                  pointerEventsClass = "pointer-events-auto";
                } else if (diff === -1) {
                  // Left peeking card
                  transformStr = "translate3d(-94%, 0, 0) scale(0.92)";
                  opacityClass = "opacity-45 hover:opacity-75";
                  zIndexClass = "z-10";
                  pointerEventsClass = "pointer-events-auto cursor-pointer";
                } else if (diff === 1) {
                  // Right peeking card
                  transformStr = "translate3d(94%, 0, 0) scale(0.92)";
                  opacityClass = "opacity-45 hover:opacity-75";
                  zIndexClass = "z-10";
                  pointerEventsClass = "pointer-events-auto cursor-pointer";
                } else {
                  // Hidden cards (diff <= -2 or diff >= 2)
                  transformStr = diff < 0 
                    ? "translate3d(-180%, 0, 0) scale(0.85)" 
                    : "translate3d(180%, 0, 0) scale(0.85)";
                  opacityClass = "opacity-0";
                  zIndexClass = "z-0";
                  pointerEventsClass = "pointer-events-none";
                }

                return (
                  <div
                    key={ad.id}
                    onClick={() => {
                      if (diff !== 0) {
                        setAdIndex(idx);
                      }
                    }}
                    className={`absolute w-[92vw] sm:w-[90vw] md:w-[88vw] lg:w-[86vw] h-full left-[4vw] sm:left-[5vw] md:left-[6vw] lg:left-[7vw] rounded-3xl overflow-hidden border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)] card-glass transition-all duration-700 ease-in-out select-none ${opacityClass} ${zIndexClass} ${pointerEventsClass}`}
                    style={{
                      transform: transformStr,
                      boxShadow: 'none'
                    }}
                  >
                    {/* Background Image & Overlay */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={ad.image} 
                        alt={ad.title} 
                        className="w-full h-full object-cover brightness-50"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>

                    {/* Ad Content */}
                    <div className="absolute inset-0 z-10 p-5 md:p-7 flex flex-col justify-end text-left">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${ad.tagBg}`}>
                          {ad.tag}
                        </span>
                      </div>
                      <h4 className="text-base md:text-lg lg:text-xl font-black text-white mb-1.5 tracking-wide leading-tight">
                        {ad.title}
                      </h4>
                      <p className="text-[11px] md:text-xs text-slate-300 font-medium max-w-xl mb-3.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                        {ad.desc}
                      </p>
                      {diff === 0 && (
                        <Link 
                          href={ad.href}
                          className="self-start px-4.5 py-2 rounded-full text-[9px] font-black tracking-widest bg-[color:var(--color-primary)] text-black hover:scale-105 transition-transform shadow-lg active:scale-98"
                        >
                          {ad.actionText.toUpperCase()}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-0">
              {MOCK_ADS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setAdIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    adIndex === idx 
                      ? 'w-5 bg-[color:var(--color-primary)]' 
                      : 'w-1.5 bg-[color:var(--color-outline-variant)]/60 hover:bg-[color:var(--color-outline)]'
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
              
              <button
                onClick={() => setShortcutModalOpen(true)}
                className="h-10 px-4 rounded-2xl border border-dashed border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/[0.03] hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-[color:var(--color-primary)]"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Shortcut +</span>
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
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x">
              {RECOMMENDED_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="w-[215px] sm:w-[235px] shrink-0 snap-start group"
                >
                  <div
                    className={`relative h-[290px] rounded-3xl p-5 overflow-hidden flex flex-col justify-between border ${item.borderColor} bg-gradient-to-b ${item.bgGradient} hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 card-glass shadow-lg`}
                  >
                    {/* Top category label & rating */}
                    <div className="flex items-center justify-between gap-2 z-10">
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#FFD700] bg-black/65 px-2 py-0.5 rounded-md border border-[#FFD700]/30 backdrop-blur-md">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-0.5 text-[9px] font-black text-yellow-500 bg-black/45 px-2 py-0.5 rounded-md border border-white/5 backdrop-blur-md">
                        <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    {/* Big center emoji / illustration */}
                    <div className="flex items-center justify-center my-4 z-10 transition-transform duration-300 group-hover:scale-110">
                      <span className="text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] select-none">
                        {item.emoji}
                      </span>
                    </div>

                    {/* Bottom title & price info */}
                    <div className="z-10 text-left">
                      <h3 className="font-extrabold text-xs text-white leading-tight group-hover:text-[#FFD700] transition-colors truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[10px] font-bold text-gray-300">{item.price}</span>
                        <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity">
                          Book <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Row 4.5: Upcoming Concierge Journey Section */}
          <section className="mb-10 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight">Upcoming Concierge Journeys & Events</h2>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x">
              {activeJourneys.map((journey) => (
                <div 
                  key={journey.id}
                  className="w-[280px] sm:w-[325px] shrink-0 snap-start rounded-2xl border border-white/10 bg-[#0e0e11] p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4 shrink-0">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      {/* Train Icon */}
                      <span className="text-xl" style={{ color: journey.iconColor }}>{journey.icon}</span>
                      <span className="text-xs font-bold text-gray-300 truncate font-sans">
                        {journey.trainName}
                      </span>
                    </div>
                    {/* Confirmed badge */}
                    <div className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-wide shrink-0">
                      {journey.status}
                    </div>
                  </div>

                  {/* Station routing row */}
                  <div className="flex items-center justify-between flex-1">
                    {/* Source station */}
                    <div className="text-left">
                      <div className="text-sm font-extrabold text-white">{journey.source}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono font-medium">
                        {formatSecondsLeft(journey.secondsLeft)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-lg font-black text-[#d4af37] px-3">
                      →
                    </div>

                    {/* Destination station */}
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">{journey.destination}</div>
                      <div className="text-[10px] text-[#d4af37] font-semibold mt-1 font-sans">{journey.platform}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Row 5: Trending Now (Horizontal scrolling format below Recommended) */}
          {(() => {
            const sec = EXPLORE_SECTIONS.find(s => s.id === 'trending');
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

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x">
                  {sec.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[215px] sm:w-[235px] shrink-0 snap-start group"
                    >
                      <div
                        className="relative h-[290px] rounded-3xl p-5 overflow-hidden flex flex-col justify-between border border-[#F87171]/20 bg-gradient-to-b from-[#F87171]/20 to-black/85 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 card-glass shadow-lg"
                      >
                        {/* Top category label & rating */}
                        <div className="flex items-center justify-between gap-2 z-10">
                          <span className="text-[9px] uppercase font-black tracking-widest text-[#FFD700] bg-black/65 px-2 py-0.5 rounded-md border border-[#FFD700]/30 backdrop-blur-md truncate max-w-[110px]" title={item.subtitle}>
                            {item.subtitle}
                          </span>
                          <div className="flex items-center gap-0.5 text-[9px] font-black text-yellow-500 bg-black/45 px-2 py-0.5 rounded-md border border-white/5 backdrop-blur-md shrink-0">
                            <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                            <span>{item.rating}</span>
                          </div>
                        </div>

                        {/* Big center emoji */}
                        <div className="flex items-center justify-center my-4 z-10 transition-transform duration-300 group-hover:scale-110">
                          <span className="text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] select-none">
                            {item.emoji}
                          </span>
                        </div>

                        {/* Bottom title & price info */}
                        <div className="z-10 text-left">
                          <h3 className="font-extrabold text-xs text-white leading-tight group-hover:text-[#FFD700] transition-colors truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-[10px] font-bold text-gray-300">{item.tag}</span>
                            <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity">
                              Book <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                            </span>
                          </div>
                        </div>

                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </Link>
                  ))}
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

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x">
                  {sec.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-[280px] sm:w-[320px] shrink-0 snap-start group"
                    >
                      <div
                        className="relative h-[210px] rounded-3xl p-5 overflow-hidden flex flex-col justify-between border border-[#34D399]/20 bg-gradient-to-b from-[#34D399]/20 to-black/85 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 card-glass shadow-lg"
                      >
                        {/* Top category label & rating */}
                        <div className="flex items-center justify-between gap-2 z-10">
                          <span className="text-[9px] uppercase font-black tracking-widest text-[#FFD700] bg-black/65 px-2 py-0.5 rounded-md border border-[#FFD700]/30 backdrop-blur-md truncate max-w-[150px]" title={item.subtitle}>
                            {item.subtitle}
                          </span>
                          <div className="flex items-center gap-0.5 text-[9px] font-black text-yellow-500 bg-black/45 px-2 py-0.5 rounded-md border border-white/5 backdrop-blur-md shrink-0">
                            <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                            <span>{item.rating}</span>
                          </div>
                        </div>

                        {/* Big center emoji */}
                        <div className="flex items-center justify-center my-1.5 z-10 transition-transform duration-300 group-hover:scale-110">
                          <span className="text-5xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] select-none">
                            {item.emoji}
                          </span>
                        </div>

                        {/* Bottom title & price info */}
                        <div className="z-10 text-left">
                          <h3 className="font-extrabold text-xs text-white leading-tight group-hover:text-[#FFD700] transition-colors truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-[10px] font-bold text-gray-300">{item.tag}</span>
                            <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity">
                              Book <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                            </span>
                          </div>
                        </div>

                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Row 7: Explore More (News, Offers, Featured in tab switcher layout) */}
          <section className="mb-10 text-left">
            <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight mb-4">Explore More</h2>
            
            {/* Custom Horizontal Tabs Switcher Bar */}
            <div className="flex items-center justify-between mb-5 border-b border-[color:var(--color-outline-variant)]/15 pb-2.5">
              <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto scrollbar-none scroll-smooth snap-x">
                {EXPLORE_SECTIONS.filter(s => s.id !== 'trending' && s.id !== 'events').map((sec) => {
                  const isActive = activeExploreTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveExploreTab(sec.id)}
                      className={`text-[13.5px] font-black tracking-wide pb-2.5 relative z-10 transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-[color:var(--color-primary)]'
                          : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-base select-none">{sec.emoji}</span>
                        <span>{sec.title}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeExploreTabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[color:var(--color-primary)] rounded-full shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Dynamic View All button pointing to active category */}
              {(() => {
                const activeSec = EXPLORE_SECTIONS.find(s => s.id === activeExploreTab);
                if (!activeSec) return null;
                return (
                  <Link href={activeSec.href} className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300 shrink-0 ml-4 pb-2.5">
                    View All
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                );
              })()}
            </div>

            {/* Display active tab content */}
            {(() => {
              const activeSec = EXPLORE_SECTIONS.find(s => s.id === activeExploreTab);
              if (!activeSec) return null;
              return (
                <div className="flex flex-col text-left animate-fade-up">
                  {/* Category Description */}
                  <p className="text-[11px] text-[color:var(--color-on-surface-variant)] font-medium mb-4">— {activeSec.description}</p>

                  {/* Content Box (Glass Card) */}
                  <div className="rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]/25 backdrop-blur-md p-5 card-glass shadow-lg relative overflow-hidden">
                    {/* Subtle themed gradient background glow */}
                    <div 
                      className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                      style={{ background: `linear-gradient(135deg, ${activeSec.from}, ${activeSec.to})` }}
                    />
                    
                    {/* Vertical list of items (placed down one after another, filling the space) */}
                    <div className="flex flex-col gap-2.5">
                      {activeSec.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="p-3.5 rounded-2xl border border-[color:var(--color-outline-variant)]/15 bg-[color:var(--color-surface-dim)]/20 hover:bg-[color:var(--color-surface-dim)]/50 hover:border-[color:var(--color-primary)]/20 transition-all flex items-center justify-between gap-4 group w-full relative overflow-hidden"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="h-9 w-9 shrink-0 rounded-xl bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-outline-variant)]/30 flex items-center justify-center text-lg select-none group-hover:scale-105 transition-transform">
                              {item.emoji}
                            </div>
                            <div className="min-w-0 text-left">
                              <h4 className="font-extrabold text-[12.5px] text-[color:var(--color-on-surface)] group-hover:text-[color:var(--color-primary)] transition-colors truncate leading-tight">{item.title}</h4>
                              <p className="text-[10px] text-[color:var(--color-on-surface-variant)] truncate mt-0.5">{item.subtitle}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[9px] text-[color:var(--color-primary)] font-extrabold bg-[color:var(--color-primary)]/10 px-2.5 py-0.5 rounded-md border border-[color:var(--color-primary)]/20">{item.tag}</span>
                            <div className="flex items-center gap-0.5 text-[9px] font-bold text-[color:var(--color-on-surface-variant)] bg-[color:var(--color-surface-container-highest)] px-2.5 py-0.5 rounded-md border border-[color:var(--color-outline-variant)]/20">
                              <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                              <span>{item.rating}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
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
                        className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${
                          isSelected
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
