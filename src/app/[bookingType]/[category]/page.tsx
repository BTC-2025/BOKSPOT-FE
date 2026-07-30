'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, MapPin, Star, Clock, Shield, Search, SlidersHorizontal,
  List, Map, AlertCircle, Plane, Train, Bus, Car, Compass, Sparkles, QrCode, Ticket,
  Luggage, X, RotateCw, CheckCircle2, ShieldCheck, Heart, User, Phone, Check, RefreshCw,
  Navigation, HelpCircle, Activity, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLocationStore, useBookingFlowStore, useUserStore } from '../../../lib/store';
import { api, Service } from '../../../lib/api';
import { calculateDistance } from '../../../lib/mockData';

const MapComponent = dynamic(() => import('../../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[color:var(--color-surface-dim)]/50">
      <div className="text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[color:var(--color-primary)] mx-auto mb-2" />
        <p className="text-[10px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider">Syncing Map Overlays...</p>
      </div>
    </div>
  ),
});

const CATEGORY_NAMES: Record<string, string> = {
  // Travel & Transport
  flights: 'Flight Booking',
  trains: 'Train Booking',
  buses: 'Bus Booking',
  ferry: 'Ferry / Boat Booking',
  shuttle: 'Shuttle / Van Booking',
  helicopter: 'Helicopter Booking',
  cabs: 'Cab / Taxi Booking',
  'bike-rental': 'Bike Rental',
  'car-rental': 'Self-Drive Car Rental',

  // Stay & Accommodation
  hotels: 'Hotel Booking',
  resorts: 'Resort Booking',
  villas: 'Homestay / Villa',
  hostels: 'Hostel Booking',
  camping: 'Camping Booking',

  // Entertainment & Events
  movies: 'Cinema / Movie Tickets',
  theatre: 'Theatre Shows',
  concerts: 'Concert Tickets',
  events: 'Events & Festivals',
  exhibitions: 'Exhibition Entry',
  workshops: 'Workshops / Classes',
  gaming: 'Gaming Arena Booking',

  // Sports & Turf
  'football-turf': 'Football Turf',
  'cricket-ground': 'Cricket Ground',
  badminton: 'Badminton Court',
  tennis: 'Tennis Court',
  basketball: 'Basketball Court',
  swimming: 'Swimming Pool Slots',
  'play-arena': 'Indoor Play Arena',

  // Lifestyle & Local Services
  dining: 'Restaurant Table Reservation',
  salons: 'Salon / Spa Appointment',
  'gym-yoga': 'Gym / Yoga Slot Booking',
  doctor: 'Doctor Appointment',
  electrician: 'Electrician Booking',
  plumber: 'Plumber Booking',
  cleaning: 'Cleaning Service',
  technician: 'Technician Service',
  studio: 'Studio Booking',

  // Business & Professional
  coworking: 'Co-working Space',
  'meeting-room': 'Meeting Room',
  podcast: 'Podcast Studio',
  conference: 'Conference Hall',
  training: 'Training Sessions',

  // Religious Services
  darshan: 'Temple Darshan Booking',
  pooja: 'Pooja Slot Booking',
  pilgrimage: 'Pilgrimage Packages',

  // Rental & Equipment Booking
  'cycle-rental': 'Cycle Rental',
  'sports-bike': 'Sports Bike Rental',
  camera: 'Camera Rental',
  'sound-system': 'Sound System Rental',
  'event-equip': 'Event Equipment Rental',

  // Personal & Miscellaneous Services
  'pet-grooming': 'Pet Grooming Appointment',
  babysitting: 'Babysitting Service',
  'elder-care': 'Elder Care Service',
  'event-organizer': 'Event Organizer Booking',
};

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'reviews', label: 'Most Reviewed' },
];

function MockQRCode({ value }: { value: string }) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const size = 17;
  const blocks = [];
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isTopLeft = r < 5 && c < 5;
      const isTopRight = r < 5 && c >= size - 5;
      const isBottomLeft = r >= size - 5 && c < 5;
      
      let fill = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = r < 5 ? r : r >= size - 5 ? r - (size - 5) : r;
        const localC = c < 5 ? c : c >= size - 5 ? c - (size - 5) : c;
        fill = (localR === 0 || localR === 4 || localC === 0 || localC === 4) || (localR === 2 && localC === 2);
      } else {
        const val = Math.abs(Math.sin(hash + r * 19 + c * 31));
        fill = val > 0.48;
      }
      
      if (fill) {
        blocks.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" />);
      }
    }
  }

  return (
    <div className="bg-white p-2 rounded-2xl inline-block shadow-lg border border-slate-200">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 text-slate-900 animate-scale-up" shapeRendering="crispEdges">
        <rect width={size} height={size} fill="white" />
        {blocks}
      </svg>
    </div>
  );
}

/* ============================================================================
 * 1. CAB SERVICE VIEW (cabs)
 * ============================================================================ */
function CabBookingView({ categoryName, city }: any) {
  const router = useRouter();
  const [pickup, setPickup] = useState('Anna Nagar Metro Station');
  const [drop, setDrop] = useState('Chennai International Airport');
  const [cabType, setCabType] = useState<'mini' | 'sedan' | 'suv' | 'auto'>('mini');
  const [rideState, setRideState] = useState<'idle' | 'searching' | 'driver_found' | 'riding' | 'completed'>('idle');
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const cabDetails = {
    mini: { name: 'Go Mini', price: 160, time: '2 mins away' },
    sedan: { name: 'Prime Sedan', price: 240, time: '3 mins away' },
    suv: { name: 'Luxury SUV', price: 380, time: '5 mins away' },
    auto: { name: 'Auto Express', price: 85, time: '1 min away' },
  };

  const handleBook = () => {
    setRideState('searching');

    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const id = `trv-${Date.now()}`;
    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-cab-${cabType}`,
      serviceName: `Cab Booking (${cabDetails[cabType].name})`,
      merchantName: 'Beta Transit Cabs',
      category: 'cabs',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: cabDetails[cabType].price,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 30,
      customerName,
      customerEmail,
      customerPhone,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced cab booking to backend:', data))
      .catch(err => console.error('Error syncing cab booking to backend:', err));

    setTimeout(() => {
      setRideState('driver_found');
      setTimeout(() => {
        setRideState('riding');
        setTimeout(() => {
          setRideState('completed');
        }, 5000);
      }, 3000);
    }, 3000);
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Car size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Dashboard</span>
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 px-2.5 py-1 rounded-full border border-[color:var(--color-primary)]/20">
          Cab Dispatcher
        </span>
      </div>

      {rideState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Pickup Address</label>
              <div className="flex items-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3 py-2 bg-[color:var(--color-surface-dim)]">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <input value={pickup} onChange={(e) => setPickup(e.target.value)} className="bg-transparent text-xs w-full outline-none text-[color:var(--color-on-surface)]" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Destination Address</label>
              <div className="flex items-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3 py-2 bg-[color:var(--color-surface-dim)]">
                <MapPin size={14} className="text-rose-400 shrink-0" />
                <input value={drop} onChange={(e) => setDrop(e.target.value)} className="bg-transparent text-xs w-full outline-none text-[color:var(--color-on-surface)]" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-2">Select Cab Tier</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(cabDetails) as Array<keyof typeof cabDetails>).map((key) => {
                const isSel = cabType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCabType(key)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer hover:scale-102 ${
                      isSel
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 shadow-[0_0_12px_rgba(255,215,0,0.1)]'
                        : 'border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/45'
                    }`}
                  >
                    <span className="text-xs font-bold text-[color:var(--color-on-surface)]">{cabDetails[key].name}</span>
                    <div className="mt-2 flex items-baseline justify-between w-full">
                      <span className="text-sm font-black text-[color:var(--color-primary)]">₹{cabDetails[key].price}</span>
                      <span className="text-[9px] text-[color:var(--color-outline)]">{cabDetails[key].time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleBook}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Car size={14} />
            <span>Confirm Booking — ₹{cabDetails[cabType].price}</span>
          </button>
        </div>
      )}

      {rideState === 'searching' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center h-20 w-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-primary)] opacity-20"></span>
            <div className="relative rounded-full h-14 w-14 bg-[color:var(--color-primary)]/15 border border-[color:var(--color-primary)]/40 flex items-center justify-center text-[color:var(--color-primary)]">
              <Compass size={28} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Matching Nearby Drivers...</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Analyzing satellite telematics & dispatch routes</p>
          </div>
        </div>
      )}

      {rideState === 'driver_found' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={24} className="scale-110" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Driver Secured!</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Ramesh Kumar is dispatching your vehicle</p>
          </div>
          <div className="bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-2xl p-4 w-full max-w-sm grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Vehicle Info</span>
              <p className="text-xs font-bold mt-1 text-[color:var(--color-on-surface)]">TN-01-AB-4820</p>
              <p className="text-[10px] text-[color:var(--color-on-surface-variant)]">Maruti Suzuki Dzire (White)</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">OTP Code</span>
              <p className="text-base font-black mt-1 text-[color:var(--color-primary)] tracking-widest">{activeBooking?.otp || '4829'}</p>
            </div>
          </div>
        </div>
      )}

      {rideState === 'riding' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold text-[color:var(--color-on-surface)]">Ride In Progress</span>
            </div>
            <span className="text-[10px] font-mono text-[color:var(--color-primary)] font-bold">ETA: 4 mins</span>
          </div>

          <div className="relative h-32 bg-[color:var(--color-surface-dim)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,60 Q 150,120 300,40 T 600,100" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" />
            </svg>
            <motion.div
              animate={{ x: [-150, 150] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="text-[color:var(--color-primary)] flex flex-col items-center gap-1 relative z-10"
            >
              <Car size={24} className="drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-[color:var(--color-outline)]">Cruising...</span>
            </motion.div>
          </div>
        </div>
      )}

      {rideState === 'completed' && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
          <div className="h-10 w-10 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/30 flex items-center justify-center">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Ride Completed!</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Thank you for traveling with Beta Transit.</p>
          </div>
          
          {activeBooking && (
            <div className="w-full max-w-xs rounded-2xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] p-4 space-y-3 shadow-lg text-left mx-auto">
              <div className="flex justify-between items-center border-b border-[color:var(--color-outline-variant)]/20 pb-2">
                <span className="text-[9px] uppercase font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Confirmed Pass
                </span>
                <span className="text-[10px] font-mono text-[color:var(--color-outline)]">{activeBooking.ref}</span>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-[color:var(--color-outline)] block">Boarding OTP</span>
                  <span className="text-lg font-black tracking-widest text-[color:var(--color-primary)] block">{activeBooking.otp}</span>
                  <span className="text-[9px] text-[color:var(--color-outline)] block">Fare Paid: ₹{cabDetails[cabType].price}</span>
                </div>
                <div className="shrink-0 flex justify-center items-center">
                  <MockQRCode value={activeBooking.ref} />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setRideState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-xl cursor-pointer transition-all"
          >
            Book Another Ride
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 2. FLIGHT BOOKING VIEW (flights)
 * ============================================================================ */
function FlightBookingView({ categoryName, city }: any) {
  const [tripType, setTripType] = useState<'one-way' | 'round'>('one-way');
  const [fromAirport, setFromAirport] = useState('MAA - Chennai');
  const [toAirport, setToAirport] = useState('BLR - Bangalore');
  const [flightState, setFlightState] = useState<'idle' | 'searching' | 'results' | 'booked'>('idle');
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string; pnr: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const mockFlights = [
    { id: 'f1', carrier: 'Air India', code: 'AI-439', time: '08:00 AM – 09:15 AM', price: 4200, duration: '1h 15m' },
    { id: 'f2', carrier: 'IndiGo Airlines', code: '6E-205', time: '11:30 AM – 12:45 PM', price: 3800, duration: '1h 15m' },
    { id: 'f3', carrier: 'SpiceJet', code: 'SG-902', time: '04:15 PM – 05:30 PM', price: 3500, duration: '1h 15m' },
  ];

  const handleSearch = () => {
    setFlightState('searching');
    setTimeout(() => {
      setFlightState('results');
    }, 3500);
  };

  const handleBookFlight = (flight: any) => {
    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const pnr = `PNR-FLT-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `trv-${Date.now()}`;
    
    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-flight-${flight.id}`,
      serviceName: `Flight Booking (${flight.carrier} - ${flight.code})`,
      merchantName: 'Beta Airways',
      category: 'flights',
      date: new Date().toISOString().split('T')[0],
      time: flight.time.split(' – ')[0],
      amount: flight.price,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 75,
      customerName,
      customerEmail,
      customerPhone,
      notes: `Route: ${fromAirport} to ${toAirport}. PNR: ${pnr}`,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp, pnr });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced flight booking to backend:', data))
      .catch(err => console.error('Error syncing flight booking to backend:', err));

    setSelectedFlight(flight);
    setFlightState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Plane size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Dispatcher</span>
        </h2>
        <div className="flex border border-[color:var(--color-outline-variant)]/30 rounded-xl overflow-hidden p-0.5 bg-[color:var(--color-surface-dim)]">
          <button
            onClick={() => setTripType('one-way')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${tripType === 'one-way' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            One-Way
          </button>
          <button
            onClick={() => setTripType('round')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${tripType === 'round' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            Round-Trip
          </button>
        </div>
      </div>

      {flightState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">From Airport</label>
              <select value={fromAirport} onChange={(e) => setFromAirport(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="MAA - Chennai">MAA - Chennai International</option>
                <option value="BLR - Bangalore">BLR - Kempegowda Bangalore</option>
                <option value="BOM - Mumbai">BOM - Chhatrapati Shivaji Mumbai</option>
                <option value="DEL - Delhi">DEL - Indira Gandhi Delhi</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">To Airport</label>
              <select value={toAirport} onChange={(e) => setToAirport(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="BLR - Bangalore">BLR - Kempegowda Bangalore</option>
                <option value="MAA - Chennai">MAA - Chennai International</option>
                <option value="BOM - Mumbai">BOM - Chhatrapati Shivaji Mumbai</option>
                <option value="DEL - Delhi">DEL - Indira Gandhi Delhi</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Search size={14} />
            <span>Search Flight Options</span>
          </button>
        </div>
      )}

      {flightState === 'searching' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-full h-16 bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <motion.div
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-[color:var(--color-primary)]"
            >
              <Plane size={32} className="rotate-90" />
            </motion.div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Scanning Radar Airspaces...</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Retrieving active airlines schedule database</p>
          </div>
        </div>
      )}

      {flightState === 'results' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-on-surface-variant)]">Available Flights ({fromAirport.split(' - ')[0]} ➔ {toAirport.split(' - ')[0]})</span>
            <button onClick={() => setFlightState('idle')} className="text-xs text-[color:var(--color-primary)] hover:underline cursor-pointer">Modify Search</button>
          </div>

          <div className="space-y-2.5">
            {mockFlights.map((flight) => (
              <div
                key={flight.id}
                className="p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[color:var(--color-on-surface)]">{flight.carrier}</span>
                    <span className="text-[9px] font-bold text-[color:var(--color-outline)] font-mono border border-[color:var(--color-outline-variant)]/30 px-1.5 py-0.5 rounded">{flight.code}</span>
                  </div>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 font-mono">{flight.time}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-[color:var(--color-outline)] font-semibold block">{flight.duration}</span>
                    <span className="text-base font-black text-[color:var(--color-primary)]">₹{flight.price}</span>
                  </div>
                  <button
                    onClick={() => handleBookFlight(flight)}
                    className="bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] text-[10px] font-extrabold uppercase py-2 px-4 rounded-xl cursor-pointer hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors"
                  >
                    Select Seat & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {flightState === 'booked' && selectedFlight && activeBooking && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up animate-scale-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Boarding Pass Issued</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Your seat 12A is locked and ticket is compiled.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-left flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Boarding Pass</span>
                <h4 className="text-sm font-extrabold">{selectedFlight.carrier}</h4>
              </div>
              <span className="text-xs font-mono font-bold">{selectedFlight.code}</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Route</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{fromAirport.split(' - ')[0]} ➔ {toAirport.split(' - ')[0]}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Seat Assignment</span>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">12A (Window)</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Gate Status</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">Gate 3B (Open)</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket PNR</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.pnr}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Boarding OTP</span>
                <p className="text-base font-black text-[color:var(--color-primary)] tracking-widest leading-none mt-0.5">{activeBooking.otp}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket Ref</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.ref}</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-container-high)]/60 py-4 px-6 border-t border-[color:var(--color-outline-variant)]/20 flex flex-col items-center justify-center gap-2 select-none">
              <MockQRCode value={activeBooking.ref} />
              <span className="text-[8px] font-mono text-[color:var(--color-outline)] tracking-widest uppercase">Digital Security Barcode</span>
            </div>
          </div>

          <button
            onClick={() => setFlightState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 3. TRAIN BOOKING VIEW (trains)
 * ============================================================================ */
function TrainBookingView({ categoryName, city }: any) {
  const [fromStation, setFromStation] = useState('Chennai Central (MAS)');
  const [toStation, setToStation] = useState('KSR Bengaluru (SBC)');
  const [classType, setClassType] = useState<'3AC' | '2AC' | 'SL'>('3AC');
  const [trainState, setTrainState] = useState<'idle' | 'searching' | 'results' | 'booked'>('idle');
  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string; pnr: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const mockTrains = [
    { id: 't1', name: 'Shatabdi Express', no: '12007', time: '06:00 AM – 11:00 AM', price: 890, seats: 'AVBL 14' },
    { id: 't2', name: 'Lalbagh Express', no: '12607', time: '03:30 PM – 09:30 PM', price: 420, seats: 'AVBL 108' },
    { id: 't3', name: 'Chennai Express', no: '12609', time: '01:35 PM – 08:05 PM', price: 390, seats: 'WL 3' },
  ];

  const handleSearch = () => {
    setTrainState('searching');
    setTimeout(() => {
      setTrainState('results');
    }, 3500);
  };

  const handleBookTrain = (train: any) => {
    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const pnr = `PNR-TRN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const id = `trv-${Date.now()}`;
    
    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-train-${train.id}`,
      serviceName: `Train Booking (${train.name} - ${train.no})`,
      merchantName: 'Beta Rail Connect',
      category: 'trains',
      date: new Date().toISOString().split('T')[0],
      time: train.time.split(' – ')[0],
      amount: train.price,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 300,
      customerName,
      customerEmail,
      customerPhone,
      notes: `Train: ${train.no} ${train.name}. PNR: ${pnr}`,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp, pnr });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced train booking to backend:', data))
      .catch(err => console.error('Error syncing train booking to backend:', err));

    setSelectedTrain(train);
    setTrainState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Train size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Dispatcher</span>
        </h2>
        <div className="flex border border-[color:var(--color-outline-variant)]/30 rounded-xl overflow-hidden p-0.5 bg-[color:var(--color-surface-dim)]">
          {(['3AC', '2AC', 'SL'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setClassType(c)}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${classType === c ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {trainState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Departure Station</label>
              <select value={fromStation} onChange={(e) => setFromStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="Chennai Central (MAS)">MAS - Chennai Central</option>
                <option value="KSR Bengaluru (SBC)">SBC - KSR Bengaluru</option>
                <option value="Mumbai CSMT (CSMT)">CSMT - Chhatrapati Shivaji Mumbai</option>
                <option value="New Delhi (NDLS)">NDLS - New Delhi Station</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Arrival Station</label>
              <select value={toStation} onChange={(e) => setToStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="KSR Bengaluru (SBC)">SBC - KSR Bengaluru</option>
                <option value="Chennai Central (MAS)">MAS - Chennai Central</option>
                <option value="Mumbai CSMT (CSMT)">CSMT - Chhatrapati Shivaji Mumbai</option>
                <option value="New Delhi (NDLS)">NDLS - New Delhi Station</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Train size={14} />
            <span>Search Train Connections</span>
          </button>
        </div>
      )}

      {trainState === 'searching' && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-full h-16 bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <motion.div
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="text-[color:var(--color-primary)] flex items-center gap-1.5"
            >
              <Train size={28} />
              <div className="flex gap-0.5">
                <span className="h-1 w-1 bg-[color:var(--color-primary)] rounded-full animate-bounce" />
                <span className="h-1 w-1 bg-[color:var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="h-1 w-1 bg-[color:var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Scanning Railway Telematics...</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Interrogating live seat availability databases</p>
          </div>
        </div>
      )}

      {trainState === 'results' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[color:var(--color-on-surface-variant)]">Available Express Services ({fromStation.split(' ')[0]} ➔ {toStation.split(' ')[0]})</span>
            <button onClick={() => setTrainState('idle')} className="text-xs text-[color:var(--color-primary)] hover:underline cursor-pointer">Modify Search</button>
          </div>

          <div className="space-y-2.5">
            {mockTrains.map((train) => (
              <div
                key={train.id}
                className="p-4 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-dim)]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[color:var(--color-on-surface)]">{train.name}</span>
                    <span className="text-[9px] font-bold text-[color:var(--color-outline)] font-mono border border-[color:var(--color-outline-variant)]/30 px-1.5 py-0.5 rounded">{train.no}</span>
                  </div>
                  <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1 font-mono">{train.time}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="text-left sm:text-right">
                    <span className={`text-[9px] font-bold block ${train.seats.includes('WL') ? 'text-rose-400' : 'text-emerald-400'}`}>{train.seats}</span>
                    <span className="text-base font-black text-[color:var(--color-primary)]">₹{train.price}</span>
                  </div>
                  <button
                    onClick={() => handleBookTrain(train)}
                    className="bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] text-[10px] font-extrabold uppercase py-2 px-4 rounded-xl cursor-pointer hover:bg-[color:var(--color-primary-fixed-dim)] transition-colors"
                  >
                    Book Berth
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trainState === 'booked' && selectedTrain && activeBooking && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up animate-scale-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Berth Booking Secured</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Seat assigned inside coach {classType}.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white text-left flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Indian Railways</span>
                <h4 className="text-sm font-extrabold">{selectedTrain.name}</h4>
              </div>
              <span className="text-xs font-mono font-bold">Class {classType}</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Train No</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{selectedTrain.no}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Coach & Seat</span>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">B2 - Berth 42 (Lower)</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Departure</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{selectedTrain.time.split(' – ')[0]}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">IRCTC PNR</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.pnr}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Boarding OTP</span>
                <p className="text-base font-black text-[color:var(--color-primary)] tracking-widest leading-none mt-0.5">{activeBooking.otp}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket Ref</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.ref}</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-container-high)]/60 py-4 px-6 border-t border-[color:var(--color-outline-variant)]/20 flex flex-col items-center justify-center gap-2 select-none">
              <MockQRCode value={activeBooking.ref} />
              <span className="text-[8px] font-mono text-[color:var(--color-outline)] tracking-widest uppercase">Digital Security Barcode</span>
            </div>
          </div>

          <button
            onClick={() => setTrainState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Train
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 4. BUS BOOKING VIEW (buses)
 * ============================================================================ */
function BusBookingView({ categoryName, city }: any) {
  const [fromCity, setFromCity] = useState('Chennai');
  const [toCity, setToCity] = useState('Madurai');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [busState, setBusState] = useState<'seat_selection' | 'booked'>('seat_selection');
  const [activeBooking, setActiveBooking] = useState<{ ref: string; otp: string } | null>(null);

  const addBooking = useBookingFlowStore((state) => state.addBooking);
  const user = useUserStore((state) => state.user);
  const customerName = user?.name || "Premium Traveler";
  const customerEmail = user?.email || "traveler@bnxmail.com";
  const customerPhone = user?.phone || "+91 99887 76655";

  const SEAT_PRICE = 650;
  const mockSeats = [
    { code: 'A1', booked: true }, { code: 'A2', booked: false }, { code: 'A3', booked: false }, { code: 'A4', booked: true },
    { code: 'B1', booked: false }, { code: 'B2', booked: false }, { code: 'B3', booked: false }, { code: 'B4', booked: false },
    { code: 'C1', booked: true }, { code: 'C2', booked: true }, { code: 'C3', booked: false }, { code: 'C4', booked: false },
    { code: 'D1', booked: false }, { code: 'D2', booked: false }, { code: 'D3', booked: false }, { code: 'D4', booked: true },
    { code: 'E1', booked: false }, { code: 'E2', booked: false }, { code: 'E3', booked: false }, { code: 'E4', booked: false },
  ];

  const handleSeatClick = (code: string, booked: boolean) => {
    if (booked) return;
    if (selectedSeats.includes(code)) {
      setSelectedSeats(prev => prev.filter(s => s !== code));
    } else {
      setSelectedSeats(prev => [...prev, code]);
    }
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;

    const ref = `TRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const id = `trv-${Date.now()}`;
    
    const bookingDetails = {
      id,
      ref,
      otp,
      serviceId: `svc-bus-${id}`,
      serviceName: `Bus Booking (Volvo AC - Seats: ${selectedSeats.join(', ')})`,
      merchantName: 'Beta Roadlines',
      category: 'buses',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: selectedSeats.length * SEAT_PRICE,
      status: 'CONFIRMED' as const,
      city: city || 'Chennai',
      durationMinutes: 360,
      customerName,
      customerEmail,
      customerPhone,
      notes: `Seats: ${selectedSeats.join(', ')}. Route: ${fromCity} to ${toCity}`,
      bookedAt: new Date().toISOString(),
    };

    setActiveBooking({ ref, otp });
    addBooking(bookingDetails);

    fetch('/api/v1/bookings/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingDetails),
    })
      .then(res => res.json())
      .then(data => console.log('Successfully synced bus booking to backend:', data))
      .catch(err => console.error('Error syncing bus booking to backend:', err));

    setBusState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Bus size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Seat Dispatcher</span>
        </h2>
        <span className="text-[10px] font-mono text-[color:var(--color-outline)] font-bold">
          Sleeper Multi-Axle Volvo
        </span>
      </div>

      {busState === 'seat_selection' && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Route Source</label>
              <input value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Route Destination</label>
              <input value={toCity} onChange={(e) => setToCity(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none" />
            </div>
          </div>

          <div className="border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/50 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[color:var(--color-outline)] mb-4 block">Select Seats (Upper/Lower Deck)</span>
            <div className="w-full flex justify-end max-w-[200px] border-b border-[color:var(--color-outline-variant)]/20 pb-2 mb-3">
              <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)] flex items-center gap-1">
                Driver <Compass size={11} className="rotate-45" />
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-[200px]">
              {mockSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.code);
                return (
                  <button
                    key={seat.code}
                    disabled={seat.booked}
                    onClick={() => handleSeatClick(seat.code, seat.booked)}
                    className={`h-9 w-9 rounded-lg border flex items-center justify-center text-[10px] font-black tracking-tighter transition-all cursor-pointer ${
                      seat.booked
                        ? 'bg-[color:var(--color-surface-container-highest)] border-[color:var(--color-outline-variant)]/40 text-[color:var(--color-outline)] cursor-not-allowed opacity-35'
                        : isSelected
                          ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)] text-[color:var(--color-on-primary)] scale-95 shadow-[0_0_8px_rgba(255,215,0,0.5)]'
                          : 'bg-[color:var(--color-surface-dim)] border-[color:var(--color-outline-variant)]/50 text-[color:var(--color-on-surface-variant)] hover:border-[color:var(--color-primary)]/40'
                    }`}
                  >
                    {seat.code}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[color:var(--color-outline-variant)]/20 pt-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Selected Seats</span>
              <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Total Fare</span>
              <p className="text-base font-black text-[color:var(--color-primary)] mt-0.5">₹{selectedSeats.length * SEAT_PRICE}</p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={selectedSeats.length === 0}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] disabled:opacity-50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Bus size={14} />
            <span>Confirm Seats & Book</span>
          </button>
        </div>
      )}

      {busState === 'booked' && activeBooking && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up animate-scale-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Bus Reservation Confirmed</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Seats {selectedSeats.join(', ')} secured successfully.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl mx-auto">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-4 text-white text-left flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Beta Roadlines</span>
                <h4 className="text-sm font-extrabold">Volvo Multi-Axle AC</h4>
              </div>
              <span className="text-xs font-mono font-bold">{selectedSeats.length} Seat(s)</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Route</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">{fromCity} ➔ {toCity}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Seat Codes</span>
                <p className="text-xs font-bold text-[color:var(--color-primary)] mt-0.5">{selectedSeats.join(', ')}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Total Fare Paid</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5">₹{selectedSeats.length * SEAT_PRICE}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Boarding OTP</span>
                <p className="text-base font-black text-[color:var(--color-primary)] tracking-widest leading-none mt-0.5">{activeBooking.otp}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Ticket Ref</span>
                <p className="text-xs font-bold text-[color:var(--color-on-surface)] mt-0.5 font-mono">{activeBooking.ref}</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-container-high)]/60 py-4 px-6 border-t border-[color:var(--color-outline-variant)]/20 flex flex-col items-center justify-center gap-2 select-none">
              <MockQRCode value={activeBooking.ref} />
              <span className="text-[8px] font-mono text-[color:var(--color-outline)] tracking-widest uppercase">Digital Security Barcode</span>
            </div>
          </div>

          <button
            onClick={() => { setSelectedSeats([]); setBusState('seat_selection'); }}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 5. METRO ROUTE VIEW (metro)
 * ============================================================================ */
function MetroBookingView({ categoryName, city }: any) {
  const [startStation, setStartStation] = useState('Central Metro');
  const [endStation, setEndStation] = useState('Guindy Metro');
  const [activeTab, setActiveTab] = useState<'route' | 'recharge'>('route');
  const [metroState, setMetroState] = useState<'idle' | 'token_generated' | 'card_recharged'>('idle');

  const [cardNo, setCardNo] = useState('');
  const [rechargeAmt, setRechargeAmt] = useState('100');

  const handleGenerateToken = () => {
    setMetroState('token_generated');
  };

  const handleRecharge = () => {
    if (!cardNo.trim()) return;
    setMetroState('card_recharged');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <QrCode size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Route Center</span>
        </h2>
        <div className="flex border border-[color:var(--color-outline-variant)]/30 rounded-xl overflow-hidden p-0.5 bg-[color:var(--color-surface-dim)]">
          <button
            onClick={() => { setActiveTab('route'); setMetroState('idle'); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${activeTab === 'route' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            QR Token
          </button>
          <button
            onClick={() => { setActiveTab('recharge'); setMetroState('idle'); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors ${activeTab === 'recharge' ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]' : 'text-[color:var(--color-on-surface-variant)]'}`}
          >
            Card Recharge
          </button>
        </div>
      </div>

      {activeTab === 'route' && metroState === 'idle' && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Origin Station</label>
              <select value={startStation} onChange={(e) => setStartStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="Central Metro">Central Metro Station</option>
                <option value="Teynampet Metro">Teynampet Metro</option>
                <option value="Guindy Metro">Guindy Metro Station</option>
                <option value="Airport Metro">Airport Metro Station</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Destination Station</label>
              <select value={endStation} onChange={(e) => setEndStation(e.target.value)} className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer">
                <option value="Guindy Metro">Guindy Metro Station</option>
                <option value="Airport Metro">Airport Metro Station</option>
                <option value="Central Metro">Central Metro Station</option>
                <option value="Teynampet Metro">Teynampet Metro</option>
              </select>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface-dim)]/50 border border-[color:var(--color-outline-variant)]/20 p-3 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-[color:var(--color-on-surface-variant)]">Token Fare Estimate:</span>
            <span className="font-extrabold text-[color:var(--color-primary)]">₹40</span>
          </div>

          <button
            onClick={handleGenerateToken}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Ticket size={14} />
            <span>Generate QR Token</span>
          </button>
        </div>
      )}

      {activeTab === 'route' && metroState === 'token_generated' && (
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">QR Token Generated</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-0.5">Please scan this token code at the entry gate.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-xl p-4 flex flex-col items-center justify-center gap-4">
            <div className="relative h-44 w-44 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
              <QrCode size={120} className="text-slate-900" />
              {/* Laser scanner effect */}
              <motion.div
                animate={{ y: [-80, 80] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              />
            </div>
            <div className="text-left w-full border-t border-[color:var(--color-outline-variant)]/20 pt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Stations</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{startStation.split(' ')[0]} ➔ {endStation.split(' ')[0]}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)] font-bold">Fare Token</span>
                <p className="font-bold text-[color:var(--color-primary)]">₹40 (Single Entry)</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMetroState('idle')}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Buy Another Token
          </button>
        </div>
      )}

      {activeTab === 'recharge' && metroState === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Metro Smart Card Number</label>
            <div className="flex items-center gap-2 border border-[color:var(--color-outline-variant)]/40 rounded-xl px-3 py-2.5 bg-[color:var(--color-surface-dim)]">
              <QrCode size={14} className="text-[color:var(--color-outline)] shrink-0" />
              <input
                placeholder="Enter 10-digit card serial number"
                value={cardNo}
                onChange={(e) => setCardNo(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-[color:var(--color-on-surface)]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Recharge Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {['100', '200', '500'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmt(amt)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    rechargeAmt === amt
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                      : 'border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/45 text-[color:var(--color-on-surface-variant)]'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRecharge}
            disabled={!cardNo.trim()}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] disabled:opacity-50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <RotateCw size={14} />
            <span>Proceed Recharge — ₹{rechargeAmt}</span>
          </button>
        </div>
      )}

      {activeTab === 'recharge' && metroState === 'card_recharged' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-up">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[color:var(--color-on-surface)]">Smart Card Recharged!</h3>
            <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">₹{rechargeAmt} credited successfully to card serial: <span className="font-bold text-[color:var(--color-primary)] font-mono">{cardNo}</span></p>
          </div>
          <button
            onClick={() => { setCardNo(''); setMetroState('idle'); }}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl cursor-pointer transition-colors"
          >
            Recharge Another Card
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 6. TURFS ARENA BOOKING VIEW (turfs)
 * ============================================================================ */
function TurfsBookingView({ categoryName, city }: any) {
  const [selectedSport, setSelectedSport] = useState<'football' | 'cricket' | 'badminton'>('football');
  const [bookingDate, setBookingDate] = useState('2026-05-29');
  const [timeSlot, setTimeSlot] = useState('06:00 PM - 08:00 PM');
  const [duration, setDuration] = useState<number>(2);
  const [equipmentRental, setEquipmentRental] = useState(false);
  const [bookingState, setBookingState] = useState<'idle' | 'booked'>('idle');

  const sportConfig = {
    football: {
      name: 'Football Turf',
      rate: 1200,
      emoji: '⚽',
      addons: 'Bibs, football, & pump kit',
      addonPrice: 150,
    },
    cricket: {
      name: 'Cricket Pitch',
      rate: 1500,
      emoji: '🏏',
      addons: 'Bat, leather balls, stumps, & pads',
      addonPrice: 250,
    },
    badminton: {
      name: 'Badminton Court',
      rate: 400,
      emoji: '🏸',
      addons: '2 Carbon rackets & nylon shuttles',
      addonPrice: 100,
    },
  };

  const currentSport = sportConfig[selectedSport];
  const baseCost = currentSport.rate * duration;
  const addonCost = equipmentRental ? currentSport.addonPrice : 0;
  const totalCost = baseCost + addonCost;

  const handleBook = () => {
    setBookingState('booked');
  };

  return (
    <div className="card-glass rounded-3xl p-6 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/30 relative overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between mb-5 border-b border-[color:var(--color-outline-variant)]/20 pb-4">
        <h2 className="text-lg font-black flex items-center gap-2 text-[color:var(--color-on-surface)]">
          <Activity size={20} className="text-[color:var(--color-primary)]" />
          <span>{categoryName} Arena Hub</span>
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 px-2.5 py-1 rounded-full border border-[color:var(--color-primary)]/20">
          Arena Booking
        </span>
      </div>

      {bookingState === 'idle' && (
        <div className="space-y-5 animate-fade-up">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-2.5">Select Court/Sport</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(sportConfig) as Array<keyof typeof sportConfig>).map((key) => {
                const isSel = selectedSport === key;
                const config = sportConfig[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSport(key)}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:scale-102 ${
                      isSel
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 shadow-[0_0_12px_rgba(255,215,0,0.1)] font-extrabold'
                        : 'border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/45 font-medium'
                    }`}
                  >
                    <span className="text-2xl mb-1">{config.emoji}</span>
                    <span className="text-[11px] text-[color:var(--color-on-surface)]">{config.name}</span>
                    <span className="text-[9px] text-[color:var(--color-outline)] mt-0.5">₹{config.rate}/hr</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Select Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2.5 text-xs text-[color:var(--color-on-surface)] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2.5 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer"
              >
                <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM</option>
                <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Floodlights)</option>
                <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM (Floodlights)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[color:var(--color-outline)] block mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/30 rounded-xl px-3 py-2.5 text-xs text-[color:var(--color-on-surface)] outline-none cursor-pointer"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours</option>
                <option value={3}>3 Hours</option>
                <option value={4}>4 Hours</option>
              </select>
            </div>
          </div>

          <div
            onClick={() => setEquipmentRental(!equipmentRental)}
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-300 ${
              equipmentRental
                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/[0.04]'
                : 'border-[color:var(--color-outline-variant)]/20 bg-transparent hover:bg-[color:var(--color-surface-dim)]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎒</span>
              <div className="text-left">
                <p className="text-xs font-bold text-[color:var(--color-on-surface)]">Rent Play Equipment Kit?</p>
                <p className="text-[10px] text-[color:var(--color-outline)] mt-0.5">{currentSport.addons}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[color:var(--color-primary)]">+₹{currentSport.addonPrice}</span>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                equipmentRental ? 'bg-[color:var(--color-primary)] border-[color:var(--color-primary)]' : 'border-[color:var(--color-outline-variant)]'
              }`}>
                {equipmentRental && <Check size={10} className="text-[#0C0C10] stroke-[4]" />}
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface-dim)] border border-[color:var(--color-outline-variant)]/20 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[color:var(--color-on-surface-variant)] text-[10px] uppercase tracking-wider font-bold">Total Arena Fare:</span>
              <p className="text-[9px] text-[color:var(--color-outline)] mt-0.5">₹{currentSport.rate}/hr × {duration} hrs {equipmentRental && `+ ₹${currentSport.addonPrice} rental`}</p>
            </div>
            <span className="font-extrabold text-base text-[color:var(--color-primary)]">₹{totalCost}</span>
          </div>

          <button
            onClick={handleBook}
            className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[color:var(--color-primary-fixed-dim)] transition-all cursor-pointer shadow-[0_4px_16px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2"
          >
            <Activity size={14} />
            <span>Book {currentSport.name} slot — ₹{totalCost}</span>
          </button>
        </div>
      )}

      {bookingState === 'booked' && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-up">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Check size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[color:var(--color-on-surface)]">Arena Booking Confirmed!</h3>
            <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5">Your play slot has been reserved near {city}.</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)] overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[color:var(--color-outline-variant)]/20">
              <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-outline)] font-black">Booking ID</span>
              <span className="font-bold text-xs text-[color:var(--color-primary)] font-mono">TRF-98274A</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Facility</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{currentSport.emoji} {currentSport.name}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Date & Duration</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{bookingDate} ({duration} hrs)</p>
              </div>
              <div className="col-span-2 border-t border-[color:var(--color-outline-variant)]/10 pt-2.5">
                <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Reserved Timing</span>
                <p className="font-bold text-[color:var(--color-on-surface)]">{timeSlot}</p>
              </div>
              <div className="col-span-2 border-t border-[color:var(--color-outline-variant)]/10 pt-2.5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Equipment Rental</span>
                  <p className="font-bold text-[color:var(--color-on-surface)]">{equipmentRental ? 'Included' : 'None'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[color:var(--color-outline)]">Total Paid</span>
                  <p className="font-extrabold text-sm text-[color:var(--color-primary)]">₹{totalCost}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEquipmentRental(false); setBookingState('idle'); }}
            className="border border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl cursor-pointer transition-colors"
          >
            Book Another Court
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * MAIN SERVICE DISCOVERY PAGE COMPONENT
 * ============================================================================ */
export default function ProviderDiscoveryPage() {
  const params = useParams();
  const bookingType = params?.bookingType as string;
  const category = params?.category as string;
  const { city, latitude, longitude } = useLocationStore();
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  let categoryName = CATEGORY_NAMES[category] || category;
  if (bookingType === 'accomodation' && category === 'camping') {
    categoryName = 'Camps & Glamping';
  }
  if (bookingType === 'entertainment' && category === 'sports-events') {
    categoryName = 'Sports';
  }

  useEffect(() => {
    if (!mounted) return;
    let active = true;
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          categorySlug: category,
        };
        if (city) {
          params.city = city;
        }
        if (latitude !== null && longitude !== null) {
          params.latitude = String(latitude);
          params.longitude = String(longitude);
        }
        const response = await api.services.list(params);
        if (active) {
          setServicesList(Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []));
        }
      } catch (err: any) {
        console.error('Error fetching services:', err);
        if (active) {
          setError(err.message || 'Failed to load services.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    return () => {
      active = false;
    };
  }, [category, city, latitude, longitude, mounted]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
        <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[var(--border-subtle)]">
          <div className="container-main flex items-center justify-between h-16">
            <div className="flex items-center gap-4 min-w-0">
              <Link href={`/${bookingType}`} className="btn-ghost p-2 shrink-0">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
                <Link href="/" className="hover:text-[var(--text-primary)] transition-colors shrink-0">Home</Link>
                <ChevronRight size={14} className="shrink-0" />
                <span className="text-[var(--text-primary)] font-bold truncate">Loading...</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-24 container-main py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-slate-300/20 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-300/20 rounded-lg"></div>
            <div className="space-y-4 pt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-300/10 border border-slate-300/10 rounded-2xl p-6 flex gap-4">
                  <div className="w-20 h-20 bg-slate-300/20 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-300/20 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-slate-300/20 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-300/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Intercept the custom booking flows for custom dashboard category views
  const isCustomBooking = ['cabs', 'flights', 'trains', 'buses', 'metro', 'turfs', 'football-turf', 'cricket-ground'].includes(category);

  // Handle local sorting
  const sortedServices = [...(Array.isArray(servicesList) ? servicesList : [])].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = parseFloat(a.basePrice) || 0;
      const priceB = parseFloat(b.basePrice) || 0;
      return priceA - priceB;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'reviews') {
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    }
    if (sortBy === 'distance' && latitude !== null && longitude !== null) {
      const distA = a.merchant.latitude && a.merchant.longitude ? calculateDistance(latitude, longitude, a.merchant.latitude, a.merchant.longitude) : 9999;
      const distB = b.merchant.latitude && b.merchant.longitude ? calculateDistance(latitude, longitude, b.merchant.latitude, b.merchant.longitude) : 9999;
      return distA - distB;
    }
    return 0;
  });

  // Handle local search
  const filteredServices = sortedServices.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      s.name.toLowerCase().includes(query) ||
      s.merchant.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query))
    );
  });

  if (loading && !isCustomBooking) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
        <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[var(--border-subtle)]">
          <div className="container-main flex items-center justify-between h-16">
            <div className="flex items-center gap-4 min-w-0">
              <Link href={`/${bookingType}`} className="btn-ghost p-2 shrink-0">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
                <Link href="/" className="hover:text-[var(--text-primary)] transition-colors shrink-0">Home</Link>
                <ChevronRight size={14} className="shrink-0" />
                <span className="text-[var(--text-primary)] font-bold truncate">Loading...</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-28 container-main py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-slate-300/20 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-300/20 rounded-lg"></div>
            <div className="space-y-4 pt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-300/10 border border-slate-300/10 rounded-2xl p-6 flex gap-4">
                  <div className="w-20 h-20 bg-slate-300/20 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-300/20 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-slate-300/20 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-300/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 custom-navbar border-b border-[var(--border-subtle)]">
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={`/${bookingType}`} className="btn-ghost p-2 shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors shrink-0">Home</Link>
              <ChevronRight size={14} className="shrink-0" />
              <Link href={`/${bookingType}`} className="hover:text-[var(--text-primary)] transition-colors truncate shrink-0">{bookingType}</Link>
              <ChevronRight size={14} className="shrink-0" />
              <span className="text-[var(--text-primary)] truncate">{categoryName}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-28 container-main py-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-xs text-[color:var(--color-primary)] font-bold mb-1">
            <MapPin size={12} className="animate-bounce" />
            <span>Search Hub: {city} Terminal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[color:var(--color-on-surface)]">{categoryName}</h1>
          <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5">
            Interactive dispatcher portal for customized bookings.
          </p>
        </motion.div>

        <div className="mt-4">
          {category === 'cabs' && <CabBookingView categoryName={categoryName} city={city} />}
          {category === 'flights' && <FlightBookingView categoryName={categoryName} city={city} />}
          {category === 'trains' && <TrainBookingView categoryName={categoryName} city={city} />}
          {category === 'buses' && <BusBookingView categoryName={categoryName} city={city} />}
          {category === 'metro' && <MetroBookingView categoryName={categoryName} city={city} />}
          {['turfs', 'football-turf', 'cricket-ground'].includes(category) && <TurfsBookingView categoryName={categoryName} city={city} />}

          {/* Standard fallback listing for all other categories */}
          {!isCustomBooking && (
            <div className="space-y-6">
              {/* Search, Sort, and View Mode Toggle Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[color:var(--color-surface-container)]/50 border border-[color:var(--color-outline-variant)]/20 p-3 rounded-2xl">
                <div className="relative flex items-center w-full sm:max-w-xs rounded-xl border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-dim)]/50 px-3 py-1.5 focus-within:border-[color:var(--color-primary)]/50 transition-all">
                  <Search size={14} className="text-[color:var(--color-outline)] mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${categoryName}...`}
                    className="w-full bg-transparent text-xs text-[color:var(--color-on-surface)] placeholder-[color:var(--color-outline)] outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal size={13} className="text-[color:var(--color-outline)]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs font-bold text-[color:var(--color-on-surface-variant)] outline-none cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[color:var(--color-surface-container-high)] text-[color:var(--color-on-surface)]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="h-4 w-px bg-[color:var(--color-outline-variant)]/25" />

                  {/* Segmented view mode control */}
                  <div className="flex rounded-lg border border-[color:var(--color-outline-variant)]/30 p-0.5 bg-[color:var(--color-surface-dim)]">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                        viewMode === 'list'
                          ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]'
                          : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                      }`}
                    >
                      <List size={12} />
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                        viewMode === 'map'
                          ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]'
                          : 'text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)]'
                      }`}
                    >
                      <Map size={12} />
                      Map
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === 'map' ? (
                <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-[color:var(--color-outline-variant)]/30 relative">
                  <MapComponent
                    center={[latitude || 13.0827, longitude || 80.2707]}
                    zoom={13}
                    markers={filteredServices.map(svc => ({
                      id: svc.id,
                      name: svc.name,
                      merchant: svc.merchant.name,
                      lat: svc.merchant.latitude || (latitude || 13.0827),
                      lng: svc.merchant.longitude || (longitude || 80.2707),
                      emoji: '📍',
                      category: categoryName,
                      price: `₹${svc.basePrice}`,
                      rating: svc.rating,
                      linkUrl: `/service/${svc.id}`
                    }))}
                  />
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredServices.map((service, i) => {
                    const dist = (latitude !== null && longitude !== null && service.merchant.latitude && service.merchant.longitude)
                      ? `${calculateDistance(latitude, longitude, service.merchant.latitude, service.merchant.longitude)} km`
                      : 'Nearby';

                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link href={`/service/${service.id}`}>
                          <div className="group glass-card p-5 md:p-6 flex gap-5 cursor-pointer hover:border-[var(--border-strong)] transition-all">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {service.images && service.images[0] ? (
                                <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl">✨</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-base md:text-lg truncate text-[var(--text-primary)]">{service.name}</h3>
                                    {service.merchant.isVerified && (
                                      <Shield size={14} className="text-blue-400 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-sm font-semibold text-indigo-400 mb-1">{service.merchant.name}</p>
                                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mb-2 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <Star size={13} className="text-amber-400 fill-amber-400" />
                                      <span className="text-[var(--text-primary)] font-semibold">{service.rating}</span>
                                      <span>({service.reviewCount})</span>
                                    </div>
                                    <span className="text-[var(--border-strong)]">•</span>
                                    <div className="flex items-center gap-1">
                                      <MapPin size={13} />
                                      {dist}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-lg font-bold text-[var(--text-primary)]">₹{service.basePrice}</div>
                                  <button className="btn-primary text-xs py-2 px-4 mt-2 rounded-lg">Book Now</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {filteredServices.length === 0 && (
                    <div className="text-center py-12 glass-card rounded-3xl border border-dashed border-[var(--border-subtle)]">
                      <AlertCircle className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-3" />
                      <h3 className="text-lg font-bold mb-1">No services found</h3>
                      <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                        We couldn't find any services matching "{categoryName}" in {city}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
