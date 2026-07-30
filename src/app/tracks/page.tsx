'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plane, TrainFront, Bus, Car, Search, X, 
  MapPin, Clock, User, Phone, CheckCircle2, 
  RotateCw, Share2, Compass, AlertCircle, Navigation,
  ChevronRight, ShieldCheck, Coffee, Hotel
} from 'lucide-react';

const TRACKS = [
  { title: 'Recent bookings', value: '12 active items', note: 'Track ongoing and upcoming reservations' },
  { title: 'Live updates', value: 'Realtime status', note: 'Monitor booking and service changes' },
  { title: 'Saved trails', value: '8 journeys', note: 'Keep track of frequent destinations' },
];

const ACTIVITY = [
  { name: 'Premium Haircut', status: 'Confirmed', time: 'Today · 10:00 AM' },
  { name: 'Yoga Class', status: 'In progress', time: 'Today · 7:00 AM' },
  { name: 'Table Reservation', status: 'Completed', time: 'Yesterday · 8:00 PM' },
];

const TRANSIT_RECOMMENDATIONS = [
  {
    id: 'rec-cab',
    title: 'Airport / Station Cab',
    emoji: '🚖',
    icon: Car,
    description: 'Pre-book a cab from your arrival terminal to your final destination with instant verification.',
    price: 'Starts at ₹399',
    btnText: 'Book Cab',
    link: '/travel-transport/cabs',
    isLink: true
  },
  {
    id: 'rec-hotel',
    title: 'Transit Room / Hotel',
    emoji: '🏨',
    icon: Hotel,
    description: 'Book hourly rooms or premium hotels near your arrival station/airport for a quick refresh.',
    price: 'Starts at ₹1,200',
    btnText: 'Book Stay',
    link: '/stay-accommodation/hotels',
    isLink: true
  },
  {
    id: 'rec-lounge',
    title: 'Airport Lounge Pass',
    emoji: '🛋️',
    icon: Coffee,
    description: 'Get exclusive access to premium terminal lounges with complimentary dining and high-speed Wi-Fi.',
    price: 'Pass from ₹799',
    btnText: 'Get Pass',
    link: '',
    isLink: false
  },
  {
    id: 'rec-insurance',
    title: 'Travel Protection',
    emoji: '🛡️',
    icon: ShieldCheck,
    description: 'Secure your journey against cancellations, delays, baggage loss, or medical emergencies.',
    price: 'Coverage from ₹99',
    btnText: 'Protect Trip',
    link: '',
    isLink: false
  }
];

// Helper mock staff information based on transport type
const GET_STAFF_INFO = (type: 'flight' | 'train' | 'bus' | 'cab') => {
  switch (type) {
    case 'flight':
      return { name: 'Capt. Aditi Sharma', role: 'Captain / First Officer', phone: '+91 90123 45678', rating: '4.9★', trips: '1,200+ flights' };
    case 'train':
      return { name: 'TTE Ramesh Prasad', role: 'Chief Ticket Inspector', phone: '+91 91234 56789', rating: '4.8★', trips: '800+ journeys' };
    case 'bus':
      return { name: 'Driver Selvam K.', role: 'Senior Fleet Driver', phone: '+91 92345 67890', rating: '4.7★', trips: '450+ trips' };
    case 'cab':
      return { name: 'Rider Rajesh Kumar', role: 'Premium Partner Driver', phone: '+91 93456 78901', rating: '4.9★', trips: '2,300+ rides' };
  }
};

// Helper mock waypoints based on transport type
const GET_WAYPOINTS = (type: 'flight' | 'train' | 'bus' | 'cab') => {
  switch (type) {
    case 'flight':
      return [
        { name: 'Chennai Intl Airport (MAA)', status: 'completed', time: '10:15 AM' },
        { name: 'Cruising Altitude (32,000 ft)', status: 'active', time: '11:00 AM' },
        { name: 'Bangalore Intl Airport (BLR)', status: 'upcoming', time: 'ETA 11:45 AM' },
      ];
    case 'train':
      return [
        { name: 'Chennai Central (MAS)', status: 'completed', time: '10:00 AM' },
        { name: 'Katpadi Junction (KPD)', status: 'active', time: '11:55 AM' },
        { name: 'Bangalore City (SBC)', status: 'upcoming', time: 'ETA 01:45 PM' },
      ];
    case 'bus':
      return [
        { name: 'Koyambedu Omni Bus Terminus', status: 'completed', time: '09:00 AM' },
        { name: 'Sriperumbudur Toll Plaza', status: 'completed', time: '09:45 AM' },
        { name: 'Vellore Bypass Stop', status: 'active', time: '11:20 AM' },
        { name: 'Electronic City Bus Stand', status: 'upcoming', time: 'ETA 02:00 PM' },
      ];
    case 'cab':
      return [
        { name: 'Pickup: Anna Nagar East', status: 'completed', time: '10:45 AM' },
        { name: 'En Route: Poonamallee High Rd', status: 'active', time: '11:15 AM' },
        { name: 'Destination: Chennai Airport', status: 'upcoming', time: 'ETA 11:35 AM' },
      ];
  }
};

function TracksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Active state variables to guarantee instant reactivity
  const [activeNumber, setActiveNumber] = useState<string | null>(() => searchParams.get('number'));
  const [activeType, setActiveType] = useState<'flight' | 'train' | 'bus' | 'cab' | null>(() => searchParams.get('type') as any);

  // Sync state from query parameters on mount or URL search changes (with functional setter to prevent loops & keep deps stable)
  useEffect(() => {
    if (!mounted) return;
    const num = searchParams.get('number');
    const type = searchParams.get('type') as 'flight' | 'train' | 'bus' | 'cab' | null;
    
    setActiveNumber((prev) => (prev !== num ? num : prev));
    setActiveType((prev) => (prev !== type ? type : prev));
  }, [searchParams, mounted]);

  // Local console inputs (when no parameters are active)
  const [localNumber, setLocalNumber] = useState('');
  const [localType, setLocalType] = useState<'flight' | 'train' | 'bus' | 'cab'>('train');
  const [isSearchingLocal, setIsSearchingLocal] = useState(false);

  // Live tracking states
  const [activePromoModal, setActivePromoModal] = useState<any | null>(null);
  const [speed, setSpeed] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(1280); // ~21 mins
  const [altitude, setAltitude] = useState(31800);
  const [evBattery, setEvBattery] = useState(86);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCallToast, setShowCallToast] = useState(false);

  // Initialize live variables based on mode
  useEffect(() => {
    if (!activeType) return;
    
    // Set base speed
    let baseSpeed = 78;
    let baseEta = 1280;
    if (activeType === 'flight') {
      baseSpeed = 840;
      baseEta = 1800; // 30 mins
    } else if (activeType === 'bus') {
      baseSpeed = 52;
      baseEta = 2700; // 45 mins
    } else if (activeType === 'cab') {
      baseSpeed = 44;
      baseEta = 950; // 15 mins
    }

    setSpeed(baseSpeed);
    setEtaSeconds(baseEta);
    setEvBattery(86);
    setAltitude(31800);
  }, [activeType]);

  // Real-time ticking/fluctuations
  useEffect(() => {
    if (!activeType) return;

    const timer = setInterval(() => {
      // Countdown ETA
      setEtaSeconds((prev) => (prev > 0 ? prev - 1 : 0));

      // Fluctuate Speed
      setSpeed((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        if (activeType === 'flight') {
          return Math.max(830, Math.min(855, prev + delta * 2));
        } else if (activeType === 'train') {
          return Math.max(74, Math.min(83, prev + delta));
        } else if (activeType === 'bus') {
          return Math.max(48, Math.min(56, prev + delta));
        } else {
          return Math.max(38, Math.min(48, prev + delta));
        }
      });

      // Fluctuate Altitude for flights
      if (activeType === 'flight') {
        setAltitude((prev) => {
          const delta = Math.random() > 0.5 ? 15 : -15;
          return Math.max(31700, Math.min(32100, prev + delta));
        });
      }

      // Slowly drain cab EV battery
      if (activeType === 'cab') {
        setEvBattery((prev) => {
          if (Math.random() > 0.85) {
            return Math.max(1, prev - 1);
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeType]);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localNumber.trim()) return;
    setIsSearchingLocal(true);
    setTimeout(() => {
      setIsSearchingLocal(false);
      setActiveNumber(localNumber.trim());
      setActiveType(localType);
      router.push(`/tracks?number=${encodeURIComponent(localNumber.trim())}&type=${localType}`);
    }, 1200);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Instant telemetry fluctuation for feedback
    setSpeed((prev) => {
      const delta = Math.random() > 0.5 ? 4 : -4;
      return prev + delta;
    });
    setTimeout(() => {
      setRefreshing(false);
      // Reset variables slightly on refresh
      if (activeType === 'flight') {
        setAltitude(32000);
      } else if (activeType === 'cab') {
        setEvBattery(84);
      }
    }, 1000);
  };

  const handleCopyLink = () => {
    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}${window.location.pathname}` : '';
    const shareUrl = `${baseUrl}?number=${encodeURIComponent(activeNumber || '')}&type=${activeType || ''}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCallStaff = (e: React.MouseEvent) => {
    setShowCallToast(true);
    setTimeout(() => setShowCallToast(false), 3000);
    if (!staff?.phone) {
      e.preventDefault();
    }
  };

  const formatETA = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const staff = activeType ? GET_STAFF_INFO(activeType) : null;
  const waypoints = activeType ? GET_WAYPOINTS(activeType) : [];

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[color:var(--color-surface)]">
        <div className="h-8 w-8 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8 pb-24">
        <div className="mx-auto max-w-5xl">
          
          {/* Active Live Journey Tracker View */}
          {activeNumber && activeType ? (
            <div className="space-y-6 animate-fade-up">
              
              {/* Header card with active indicator */}
              <div className="card-glass rounded-3xl p-5 md:p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-primary)]/15 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 70%)' }} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/30 flex items-center justify-center text-[color:var(--color-primary)]">
                      {activeType === 'flight' && <Plane size={24} className="rotate-45" />}
                      {activeType === 'train' && <TrainFront size={24} />}
                      {activeType === 'bus' && <Bus size={24} />}
                      {activeType === 'cab' && <Car size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest text-[color:var(--color-primary)] font-extrabold px-2 py-0.5 rounded bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 animate-pulse">
                          Live Tracking
                        </span>
                        <span className="text-xs text-[color:var(--color-on-surface-variant)] font-mono font-bold">
                          Ref: {activeNumber}
                        </span>
                      </div>
                      <h1 className="text-xl md:text-2xl font-black text-[color:var(--color-on-surface)] mt-1 capitalize">
                        Active {activeType} journey
                      </h1>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] hover:border-[color:var(--color-outline-variant)]/50 transition-all cursor-pointer disabled:opacity-50"
                      title="Sync GPS location"
                    >
                      <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] text-xs text-[color:var(--color-on-surface)] hover:border-[color:var(--color-outline-variant)]/50 transition-all cursor-pointer font-bold uppercase tracking-wider"
                    >
                      <Share2 size={14} />
                      <span>{copied ? 'Link Copied' : 'Share GPS'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveNumber(null);
                        setActiveType(null);
                        router.push('/tracks');
                      }}
                      className="p-2.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-500/40 transition-all cursor-pointer"
                      title="Stop Live Tracking"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Map and Speed/ETA */}
              <div className="grid gap-6 md:grid-cols-3">
                
                {/* SVG Map Visualizer Card */}
                <div className="md:col-span-2 card-glass rounded-[28px] bg-[color:var(--color-surface-container)] p-5 md:p-6 border border-[color:var(--color-outline-variant)]/30 flex flex-col justify-between h-96 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[color:var(--color-outline)]">Simulated GPS Map Route</h3>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Real-time transit vector tracking</p>
                    </div>
                    <Compass size={18} className="text-[color:var(--color-primary)] animate-spin" style={{ animationDuration: '6s' }} />
                  </div>

                  {/* SVG Map Container */}
                  <div className="flex-1 flex items-center justify-center my-4 bg-[color:var(--color-surface-dim)]/50 rounded-2xl border border-[color:var(--color-outline-variant)]/20 p-4 relative overflow-hidden select-none">
                    <svg viewBox="0 0 600 200" className="w-full h-full">
                      <defs>
                        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(255,215,0,0.1)" />
                          <stop offset="50%" stopColor="rgba(255,215,0,0.8)" />
                          <stop offset="100%" stopColor="rgba(255,215,0,0.2)" />
                        </linearGradient>
                      </defs>

                      {/* Route Path (curved line) */}
                      <path 
                        id="route-path" 
                        d="M 60,120 Q 300,20 540,120" 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.05)" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                      />
                      
                      {/* Active Route Glow line */}
                      <path 
                        d="M 60,120 Q 300,20 540,120" 
                        fill="none" 
                        stroke="url(#gold-gradient)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        className="opacity-90"
                      />

                      {/* Moving Vehicle Pulse Dot */}
                      <g>
                        <circle r="12" fill="var(--color-primary)" className="opacity-20 animate-ping" />
                        <circle r="7.5" fill="var(--color-primary)" className="stroke-[color:var(--color-surface-container)] stroke-2 shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
                        <circle r="3.5" fill="var(--color-on-primary)" />
                        <animateMotion dur="18s" repeatCount="indefinite" path="M 60,120 Q 300,20 540,120" />
                      </g>

                      {/* Origin Waypoint Pin */}
                      <g transform="translate(60, 120)">
                        <circle r="5" fill="#4ade80" className="stroke-[color:var(--color-surface-container)] stroke-2" />
                        <text y="20" textAnchor="middle" fill="#A8A8C0" className="text-[10px] font-bold font-sans">
                          {activeType === 'cab' ? 'Anna Nagar' : 'Chennai'}
                        </text>
                      </g>

                      {/* Mid Point Station Marker */}
                      <g transform="translate(300, 68)">
                        <circle r="6" fill="var(--color-primary)" className="stroke-[color:var(--color-surface-container)] stroke-2 animate-pulse" />
                        <text y="-14" textAnchor="middle" fill="#FFD700" className="text-[9px] font-extrabold uppercase tracking-wider bg-black/60 px-1 py-0.5 rounded">
                          {activeType === 'flight' ? 'Cruising' : activeType === 'train' ? 'Katpadi' : activeType === 'bus' ? 'Vellore' : 'Poonamallee'}
                        </text>
                      </g>

                      {/* Destination Waypoint Pin */}
                      <g transform="translate(540, 120)">
                        <circle r="5" fill="#606078" className="stroke-[color:var(--color-surface-container)] stroke-2" />
                        <text y="20" textAnchor="middle" fill="#A8A8C0" className="text-[10px] font-bold font-sans">
                          {activeType === 'cab' ? 'Airport' : 'Bangalore'}
                        </text>
                      </g>
                    </svg>

                    {/* Compass direction Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[color:var(--color-surface-dim)]/80 border border-[color:var(--color-outline-variant)]/30 rounded-lg px-2 py-1 select-none">
                      <Navigation size={10} className="text-[color:var(--color-primary)] rotate-90" />
                      <span className="text-[8px] font-mono text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Heading West</span>
                    </div>

                    {refreshing && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center rounded-2xl animate-fade-in">
                        <div className="flex items-center gap-2 bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-primary)]/20 rounded-2xl px-4 py-2 text-xs font-bold text-[color:var(--color-on-surface)] shadow-lg shadow-black/40 animate-pulse">
                          <RotateCw size={14} className="animate-spin text-[color:var(--color-primary)]" />
                          <span>Re-locking GPS Satellites...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speed, Alt, ETA Stats Grid */}
                <div className="flex flex-col gap-6">
                  
                  {/* ETA & Countdown Card */}
                  <div className="flex-1 card-glass rounded-[28px] bg-[color:var(--color-surface-container)] p-5 border border-[color:var(--color-outline-variant)]/30 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[color:var(--color-outline)]">Estimated Arrival</h3>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Dynamic recalculation countdown</p>
                    </div>

                    <div className="my-3">
                      <p className="text-[28px] md:text-[34px] font-black text-[color:var(--color-on-surface)] font-mono tracking-tight glow-text leading-none">
                        {etaSeconds > 0 ? formatETA(etaSeconds) : 'Arrived / Terminal'}
                      </p>
                      <p className="text-[11px] text-[color:var(--color-primary)] font-bold mt-1.5 flex items-center gap-1">
                        <Clock size={11} className="animate-pulse" />
                        <span>On schedule · Running smoothly</span>
                      </p>
                    </div>

                    <div className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
                      <span className="text-[color:var(--color-on-surface-variant)] font-semibold">Remaining Dist:</span>
                      <span className="text-[color:var(--color-on-surface)] font-bold font-mono">
                        {activeType === 'flight' ? '210 km' : activeType === 'train' ? '74 km' : activeType === 'bus' ? '104 km' : '6.4 km'}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Stats Card */}
                  <div className="flex-1 card-glass rounded-[28px] bg-[color:var(--color-surface-container)] p-5 border border-[color:var(--color-outline-variant)]/30 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[color:var(--color-outline)]">Live Telemetry</h3>
                      <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Active sensor statistics</p>
                    </div>

                    <div className="my-2 space-y-4">
                      {/* Speedometer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-xs font-semibold text-[color:var(--color-on-surface)]">Current Speed:</span>
                        </div>
                        <span className="text-base font-black text-[color:var(--color-primary)] font-mono">
                          {speed} km/h
                        </span>
                      </div>

                      {/* Conditional display variables (Altitude or EV Battery) */}
                      {activeType === 'flight' && (
                        <div className="flex items-center justify-between border-t border-[color:var(--color-outline-variant)]/30 pt-2">
                          <div className="flex items-center gap-2 text-[color:var(--color-on-surface-variant)]">
                            <Compass size={14} />
                            <span className="text-xs font-semibold">Altitude:</span>
                          </div>
                          <span className="text-sm font-bold text-[color:var(--color-on-surface)] font-mono">
                            {altitude.toLocaleString()} ft
                          </span>
                        </div>
                      )}

                      {activeType === 'cab' && (
                        <div className="flex items-center justify-between border-t border-[color:var(--color-outline-variant)]/30 pt-2">
                          <div className="flex items-center gap-2 text-[color:var(--color-on-surface-variant)]">
                            <div className="h-1.5 w-3 bg-emerald-500/20 border border-emerald-400 rounded-xs relative flex items-center">
                              <div className="h-full bg-emerald-400" style={{ width: `${evBattery}%` }} />
                            </div>
                            <span className="text-xs font-semibold">EV Battery:</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {evBattery}%
                          </span>
                        </div>
                      )}

                      {/* Standard stats for train/bus */}
                      {(activeType === 'train' || activeType === 'bus') && (
                        <div className="flex items-center justify-between border-t border-[color:var(--color-outline-variant)]/30 pt-2">
                          <div className="flex items-center gap-2 text-[color:var(--color-on-surface-variant)]">
                            <Clock size={14} />
                            <span className="text-xs font-semibold">Delay:</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-400">
                            None (On-Time)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold text-center border-t border-[color:var(--color-outline-variant)]/30 pt-2 select-none">
                      Satellite lock: 9 GPS channels active
                    </div>
                  </div>

                </div>

              </div>

              {/* Waypoints & Staff Details */}
              <div className="grid gap-6 md:grid-cols-3">
                
                {/* Detailed Waypoint Checklist Card */}
                <div className="md:col-span-2 card-glass rounded-[28px] bg-[color:var(--color-surface-container)] p-5 md:p-6 border border-[color:var(--color-outline-variant)]/30">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[color:var(--color-outline)] mb-4">Journey Stations & Checkpoints</h3>
                  
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[color:var(--color-outline-variant)]/30">
                    {waypoints.map((point, index) => {
                      const isActive = point.status === 'active';
                      const isCompleted = point.status === 'completed';
                      
                      return (
                        <div key={point.name + index} className="relative flex items-center justify-between gap-4">
                          
                          {/* Left indicator marker */}
                          <div className={`absolute -left-[22px] h-3 w-3 rounded-full border-2 bg-[color:var(--color-surface-container)] transition-all ${
                            isCompleted 
                              ? 'border-emerald-400 bg-emerald-400 scale-90' 
                              : isActive 
                                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] scale-110 shadow-[0_0_8px_rgba(255,215,0,0.8)]' 
                                : 'border-[color:var(--color-outline-variant)]/50'
                          }`} />

                          <div className="flex flex-col gap-0.5">
                            <p className={`text-xs font-bold ${
                              isActive ? 'text-[color:var(--color-on-surface)]' : isCompleted ? 'text-[color:var(--color-on-surface-variant)]' : 'text-[color:var(--color-outline)]'
                            }`}>
                              {point.name}
                            </p>
                            {isActive && (
                              <p className="text-[10px] text-[color:var(--color-primary)] font-semibold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)] animate-ping" />
                                <span>Currently passing checkpoint</span>
                              </p>
                            )}
                          </div>

                          <div className="text-[10px] font-mono text-[color:var(--color-outline)] font-bold">
                            {point.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Staff Details Card */}
                <div className="card-glass rounded-[28px] bg-[color:var(--color-surface-container)] p-5 border border-[color:var(--color-outline-variant)]/30 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[color:var(--color-outline)] mb-3">Assigned Crew Staff</h3>
                    
                    {staff && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar icon */}
                          <div className="h-11 w-11 rounded-full bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center text-[color:var(--color-primary)]">
                            <User size={20} strokeWidth={1.5} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-[color:var(--color-on-surface)]">{staff.name}</h4>
                            <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">{staff.role}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/30 p-2 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-[color:var(--color-outline)]">Rating</span>
                            <span className="font-bold text-[color:var(--color-on-surface)] font-mono">{staff.rating}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[color:var(--color-outline)]">Experience</span>
                            <span className="font-bold text-[color:var(--color-on-surface)] font-mono">{staff.trips}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <a
                    href={staff?.phone ? `tel:${staff.phone}` : '#'}
                    onClick={handleCallStaff}
                    className="w-full mt-4 flex items-center justify-center gap-2 border border-[color:var(--color-primary)]/30 hover:border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center justify-center"
                  >
                    <Phone size={12} />
                    <span>Contact Staff / Crew</span>
                  </a>

                </div>

              </div>

            </div>
          ) : (
            
            // Standard / Default Tracks Page Dashboard
            <div className="space-y-6 animate-fade-up">
              
              {/* Header */}
              <div className="mb-6">
                <h1 className="mt-2 text-[30px] md:text-[42px] font-black tracking-tight text-[color:var(--color-on-surface)]">
                  Track your bookings and live activity
                </h1>
                <p className="mt-3 max-w-2xl text-[14px] md:text-[16px] leading-7 text-[color:var(--color-on-surface-variant)]">
                  Keep an eye on reservations, service progress, and important transit updates from one clean dashboard.
                </p>
              </div>

              {/* Interactive Local Console Form Card */}
              <div className="card-glass rounded-3xl p-5 md:p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 70%)' }} />
                
                <h2 className="text-base font-bold text-[color:var(--color-on-surface)] mb-2 flex items-center gap-2">
                  <Compass size={18} className="text-[color:var(--color-primary)]" />
                  <span>Real-Time Travel Tracker</span>
                </h2>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] mb-5 max-w-xl">
                  Select a travel classification, input your PNR reference or ticket identifier, and hook into real-time satellite updates.
                </p>

                <form onSubmit={handleLocalSubmit} className="grid gap-4 md:grid-cols-3 items-end">
                  
                  {/* Mode Selector */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold mb-2">
                      Transportation Mode
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/30 p-1 rounded-xl">
                      {[
                        { type: 'flight', icon: Plane, label: 'Flight' },
                        { type: 'train', icon: TrainFront, label: 'Train' },
                        { type: 'bus', icon: Bus, label: 'Bus' },
                        { type: 'cab', icon: Car, label: 'Cab' },
                      ].map((m) => {
                        const isSel = localType === m.type;
                        return (
                          <button
                            key={m.type}
                            type="button"
                            onClick={() => setLocalType(m.type as any)}
                            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]'
                                : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                            }`}
                            title={m.label}
                          >
                            <m.icon size={13} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input PNR */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold mb-2">
                      PNR / Ticket / Reference
                    </label>
                    <input
                      type="text"
                      required
                      value={localNumber}
                      onChange={(e) => setLocalNumber(e.target.value)}
                      placeholder={
                        localType === 'flight' ? 'e.g., PNR AA-302' :
                        localType === 'train' ? 'e.g., PNR 4839-2045' :
                        localType === 'bus' ? 'e.g., BUS-92384-TX' :
                        'e.g., Booking CAB-8291'
                      }
                      className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3.5 py-2.5 text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] outline-none focus:border-[color:var(--color-primary)] transition-all font-mono"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!localNumber.trim() || isSearchingLocal}
                    className="bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] disabled:opacity-50 py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-[color:var(--color-primary-fixed-dim)] w-full h-[40px]"
                  >
                    {isSearchingLocal ? (
                      <>
                        <div className="h-3 w-3 border-2 border-[color:var(--color-on-primary)] border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Find & Track</span>
                      </>
                    )}
                  </button>

                </form>
              </div>

              {/* Stat Boxes */}
              <div className="grid gap-4 md:grid-cols-3">
                {TRACKS.map((item) => (
                  <div key={item.title} className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30">
                    <p className="text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-outline)]">{item.title}</p>
                    <p className="mt-3 text-[22px] font-black text-[color:var(--color-on-surface)]">{item.value}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[color:var(--color-on-surface-variant)]">{item.note}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity List */}
              <div className="rounded-[28px] card-glass bg-[color:var(--color-surface-container)] p-5 md:p-6 border border-[color:var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-[color:var(--color-on-surface)]">Recent activity</h2>
                    <p className="text-[13px] text-[color:var(--color-on-surface-variant)]">Latest service and booking events</p>
                  </div>
                  <Link
                    href="/user/bookings"
                    className="rounded-xl border border-[color:var(--color-outline-variant)]/40 bg-[color:var(--color-surface-container-high)] px-4 py-2 text-[13px] font-semibold text-[color:var(--color-on-surface)] hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-surface-container-highest)] transition-colors"
                  >
                    View bookings
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {ACTIVITY.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/40 px-4 py-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[color:var(--color-on-surface)]">{item.name}</p>
                        <p className="text-[12px] text-[color:var(--color-on-surface-variant)]">{item.time}</p>
                      </div>
                      <span className="rounded-full border border-[color:var(--color-primary)]/25 bg-[color:var(--color-primary)]/10 px-3 py-1 text-[12px] font-semibold text-[color:var(--color-primary)]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Transit Essentials & Connected Bookings */}
          <div className="mt-8 pt-8 border-t border-[color:var(--color-outline-variant)]/20">
            <div className="mb-6">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[color:var(--color-primary)] font-extrabold px-2 py-0.5 rounded bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20">
                Transit Essentials
              </span>
              <h2 className="text-xl md:text-2xl font-black text-[color:var(--color-on-surface)] mt-3">
                Connected Services & Add-ons
              </h2>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5 max-w-xl leading-relaxed">
                Maximize comfort and security on your journey. Complete your itinerary with pre-booked transfers, accommodations, lounge passes, or protection plans.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TRANSIT_RECOMMENDATIONS.map((item) => (
                <div 
                  key={item.id} 
                  className="card-glass bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 rounded-[24px] p-5 hover:scale-[1.03] hover:border-[color:var(--color-primary)]/40 hover:shadow-xl hover:shadow-[color:var(--color-primary)]/5 transition-all duration-300 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl select-none">{item.emoji}</span>
                      <div className="h-8 w-8 rounded-xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center text-[color:var(--color-primary)]">
                        <item.icon size={15} />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)] leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    <div className="border-t border-[color:var(--color-outline-variant)]/10 my-4" />
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-mono text-[color:var(--color-primary)] font-bold">
                        {item.price}
                      </span>
                      {item.isLink ? (
                        <Link
                          href={item.link}
                          className="flex items-center gap-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[9px] uppercase font-black px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-[0.97]"
                        >
                          <span>{item.btnText}</span>
                          <ChevronRight size={10} />
                        </Link>
                      ) : (
                        <button
                          onClick={() => setActivePromoModal(item)}
                          className="flex items-center gap-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[9px] uppercase font-black px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-[0.97] cursor-pointer"
                        >
                          <span>{item.btnText}</span>
                          <ChevronRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toast Notification for Phone Dialer */}
          {showCallToast && (
            <div className="fixed bottom-6 right-6 z-[100] animate-fade-up">
              <div className="bg-[color:var(--color-surface-container-high)] border border-[color:var(--color-primary)]/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone size={14} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--color-on-surface)]">Opening phone dialer...</h4>
                  <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Connecting you to {staff?.name} ({staff?.phone})</p>
                </div>
              </div>
            </div>
          )}

          {/* Mock Booking Confirmation Modal for Promos */}
          {activePromoModal && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
              <div className="card-glass bg-slate-950 border border-slate-800 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden animate-scale-up text-center">
                
                {/* Close Button */}
                <button 
                  onClick={() => setActivePromoModal(null)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Header Icon */}
                <div className="mx-auto h-16 w-16 rounded-full bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center text-3xl mb-4 select-none animate-bounce" style={{ animationDuration: '3s' }}>
                  {activePromoModal.emoji}
                </div>

                {/* Content */}
                <h3 className="text-lg font-black text-white">{activePromoModal.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {activePromoModal.id === 'rec-lounge' 
                    ? 'Unlock access to executive lounges at your arrival airport. Includes refreshments, buffet meals, shower facilities, and premium seating.'
                    : 'Insure your trip with comprehensive coverage. Protect against flight/train delays (>2 hours), luggage loss, and accidental medical expenses.'
                  }
                </p>

                {/* Price Badge */}
                <div className="my-5 inline-block bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/30 rounded-xl px-4 py-2 text-sm font-black text-[color:var(--color-primary)] font-mono">
                  {activePromoModal.price}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const title = activePromoModal.title;
                      setActivePromoModal(null);
                      alert(`🎉 Booking confirmed! Your ${title} has been linked to reference ${activeNumber || 'TRK-9832'}.`);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-2xl transition-all shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    Confirm Purchase
                  </button>
                  <button
                    onClick={() => setActivePromoModal(null)}
                    className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
      </main>
    </>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[color:var(--color-surface)]">
        <div className="h-8 w-8 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TracksContent />
    </Suspense>
  );
}
