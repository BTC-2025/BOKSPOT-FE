'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useBookingFlowStore } from '../../lib/store';
import { 
  ArrowLeft, ArrowRight, Activity, TrendingUp, Lock, User, Eye, EyeOff, AlertCircle, 
  ShieldCheck, CheckCircle2, Building2, Calendar, ShoppingBag, PlusCircle, Trash2, 
  MapPin, Clock, Search, Briefcase, Sliders, Check, Copy, Navigation, Loader, Inbox, XCircle
} from 'lucide-react';

// Dynamic import of MapComponent with SSR disabled
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[color:var(--color-surface-dim)]/50 rounded-2xl border border-white/5 min-h-[250px]">
      <div className="text-center">
        <Loader className="h-6 w-6 animate-spin text-[color:var(--color-primary)] mx-auto mb-2" />
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Loading Map Canvas...</span>
      </div>
    </div>
  )
});

const CITIES = [
  'Ahmedabad', 'Amritsar', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai', 
  'Coimbatore', 'Dehradun', 'Delhi', 'Faridabad', 'Ghaziabad', 'Gurugram', 'Guwahati', 
  'Hyderabad', 'Indore', 'Jaipur', 'Jalandhar', 'Jammu', 'Jamshedpur', 'Kanpur', 'Kochi', 
  'Kolkata', 'Kozhikode', 'Lucknow', 'Ludhiana', 'Madurai', 'Mangalore', 'Mumbai', 'Mysore', 
  'Nagpur', 'Nashik', 'Noida', 'Patna', 'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Srinagar', 
  'Surat', 'Theni', 'Thiruvananthapuram', 'Thrissur', 'Tiruchirappalli', 'Udaipur', 'Vadodara', 
  'Varanasi', 'Vijayawada', 'Visakhapatnam'
];

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  dehradun: { lat: 30.3165, lng: 78.0322 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  guwahati: { lat: 26.1158, lng: 91.7086 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  indore: { lat: 22.7196, lng: 75.8577 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  jalandhar: { lat: 31.3260, lng: 75.5762 },
  jammu: { lat: 32.7266, lng: 74.8570 },
  jamshedpur: { lat: 22.8046, lng: 86.2029 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  kozhikode: { lat: 11.2588, lng: 75.7804 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  ludhiana: { lat: 30.9010, lng: 75.8573 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  mangalore: { lat: 12.9141, lng: 74.8560 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  noida: { lat: 28.5355, lng: 77.3910 },
  patna: { lat: 25.5941, lng: 85.1376 },
  pune: { lat: 18.5204, lng: 73.8567 },
  raipur: { lat: 21.2514, lng: 81.6296 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  srinagar: { lat: 34.0837, lng: 74.7973 },
  surat: { lat: 21.1702, lng: 72.8311 },
  theni: { lat: 10.0104, lng: 77.4702 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  thrissur: { lat: 10.5276, lng: 76.2144 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  vijayawada: { lat: 16.5062, lng: 80.6480 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 }
};
const CATEGORIES = [
  // Travel & Transport
  'Bus Booking',
  'Train Booking',
  'Flight Booking',
  'Ferry / Boat Booking',
  'Shuttle / Van Booking',
  'Helicopter Booking',
  'Cab / Taxi Booking',
  'Bike Rental',
  'Self-Drive Car Rental',

  // Stay & Accommodation
  'Hotel Booking',
  'Resort Booking',
  'Homestay / Villa',
  'Hostel Booking',
  'Camping Booking',

  // Entertainment & Events
  'Cinema / Movie Tickets',
  'Theatre Shows',
  'Concert Tickets',
  'Events & Festivals',
  'Exhibition Entry',
  'Workshops / Classes',
  'Gaming Arena Booking',

  // Sports & Turf
  'Football Turf',
  'Cricket Ground',
  'Badminton Court',
  'Tennis Court',
  'Basketball Court',
  'Swimming Pool Slots',
  'Indoor Play Arena',

  // Lifestyle & Local Services
  'Restaurant Table Reservation',
  'Salon / Spa Appointment',
  'Gym / Yoga Slot Booking',
  'Doctor Appointment',
  'Electrician Booking',
  'Plumber Booking',
  'Cleaning Service',
  'Technician Service',
  'Studio Booking',

  // Business & Professional
  'Co-working Space',
  'Meeting Room',
  'Podcast Studio',
  'Conference Hall',
  'Training Sessions',

  // Religious Services
  'Temple Darshan Booking',
  'Pooja Slot Booking',
  'Pilgrimage Packages',

  // Rental & Equipment Booking
  'Cycle Rental',
  'Sports Bike Rental',
  'Camera Rental',
  'Sound System Rental',
  'Event Equipment Rental',

  // Personal & Miscellaneous Services
  'Pet Grooming Appointment',
  'Babysitting Service',
  'Elder Care Service',
  'Event Organizer Booking'
];

interface ServiceCommissionRowProps {
  svc: any;
  commissionRate: number;
  updateService: (svc: any) => void;
  showToast: (msg: string) => void;
}

function ServiceCommissionRow({ svc, commissionRate, updateService, showToast }: ServiceCommissionRowProps) {
  const hasOverride = svc.customCommissionRate !== undefined;
  const [localInput, setLocalInput] = useState(hasOverride ? String(svc.customCommissionRate) : '');

  // Keep in sync with store changes
  useEffect(() => {
    setLocalInput(hasOverride ? String(svc.customCommissionRate) : '');
  }, [svc.customCommissionRate, hasOverride]);

  return (
    <tr className="hover:bg-white/[0.005] transition-colors border-b border-white/5">
      <td className="p-4 pl-6 font-extrabold text-white">{svc.name}</td>
      <td className="p-4 text-slate-400 font-semibold">{svc.merchant}</td>
      <td className="p-4">
        <span className="badge badge-primary text-[9px] py-0.5 px-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold">
          {svc.category}
        </span>
      </td>
      <td className="p-4 text-right font-bold text-white">₹{svc.price}</td>
      <td className="p-4 text-center font-medium text-slate-500">{commissionRate}%</td>
      <td className="p-4 text-center">
        <div className="inline-flex items-center gap-1.5 justify-center">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            placeholder={String(commissionRate)}
            value={localInput}
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              if (localInput === '') {
                if (hasOverride) {
                  const { customCommissionRate, ...rest } = svc;
                  updateService(rest);
                  showToast(`Reset commission for "${svc.name}" to default.`);
                }
              } else {
                let val = parseFloat(localInput);
                if (!isNaN(val)) {
                  val = Math.max(0, Math.min(100, val));
                  setLocalInput(String(val));
                }
              }
            }}
            onChange={(e) => {
              let rawVal = e.target.value;
              if (rawVal.startsWith('0') && rawVal.length > 1 && rawVal[1] !== '.') {
                rawVal = rawVal.substring(1);
              }
              setLocalInput(rawVal);

              if (rawVal === '') {
                const { customCommissionRate, ...rest } = svc;
                updateService(rest);
                showToast(`Reset commission for "${svc.name}" to default.`);
              } else {
                let val = parseFloat(rawVal);
                if (!isNaN(val)) {
                  val = Math.max(0, Math.min(100, val));
                  updateService({ ...svc, customCommissionRate: val });
                  showToast(`Commission rate for "${svc.name}" set to ${val}%.`);
                }
              }
            }}
            className={`w-14 text-center py-0.5 rounded border text-xs font-bold focus:outline-none focus:border-[color:var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              hasOverride 
                ? 'border-indigo-500/40 bg-indigo-500/5 text-indigo-400 font-extrabold' 
                : 'border-white/10 bg-white/[0.02] text-slate-500'
            }`}
          />
          <span className={hasOverride ? 'text-indigo-400 font-bold' : 'text-slate-500 font-semibold'}>%</span>
        </div>
      </td>
      <td className="p-4 pr-6 text-right">
        {hasOverride && (
          <button
            onClick={() => {
              const { customCommissionRate, ...rest } = svc;
              updateService(rest);
              setLocalInput('');
              showToast(`Reset commission for "${svc.name}" to default.`);
            }}
            className="px-2 py-1 rounded border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-[9px] font-bold text-red-400 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </td>
    </tr>
  );
}

export default function SalesAdminPage() {
  const { 
    services, addService, deleteService, 
    merchants, addMerchant,
    commissionRate, setCommissionRate, updateService,
    assignVendorId,
    vendorRequests, updateVendorRequestStatus
  } = useBookingFlowStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'onboarding' | 'requests' | 'commission' | 'vendorId'>('onboarding');
  const [standardCommInput, setStandardCommInput] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Handle Approve Request
  const handleApproveRequest = (req: any) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const currentSerial = useBookingFlowStore.getState().nextVendorSerial || 5;
    const serialStr = String(currentSerial).padStart(4, '0');
    const generatedId = `${yyyy}${mm}${serialStr}`;

    const defaultBnxMail = req.assignSupervisor && req.supervisorName && req.email
      ? `${req.supervisorName.trim().toLowerCase().replace(/\s+/g, '')}/${req.email.trim()}`
      : undefined;

    const newMerchant = {
      id: `merchant-${Date.now()}`,
      name: req.name,
      category: req.category,
      status: 'ACTIVE' as const,
      email: req.email,
      phone: req.phone,
      city: req.city,
      address: req.address,
      description: req.description,
      rating: 5.0,
      latitude: 13.0827,
      longitude: 80.2707,
      assignSupervisor: req.assignSupervisor || false,
      supervisorName: req.supervisorName || '',
      supervisorPhone: req.supervisorPhone || '',
      supervisorEmail: req.supervisorEmail || '',
      supervisorAddress: req.supervisorAddress || '',
      supervisorBnxMail: defaultBnxMail
    };

    addMerchant(newMerchant);
    updateVendorRequestStatus(req.id, 'APPROVED');
    showToast(`Application for "${req.name}" approved! Onboarded with ID: ${generatedId}`);
  };

  // Handle Reject Request
  const handleRejectRequest = (reqId: string, reqName: string) => {
    updateVendorRequestStatus(reqId, 'REJECTED');
    showToast(`Application for "${reqName}" rejected.`);
  };

  // Auto Fill details from request to manual onboarding form
  const handleAutoUpdateDetails = (req: any) => {
    setVendorName(req.name);
    setVendorCategory(req.category);
    setVendorEmail(req.email);
    setVendorPhone(req.phone);
    setVendorCity(req.city);
    setVendorAddress(req.address);
    setVendorDesc(req.description);
    
    if (req.assignSupervisor) {
      setVendorAssignSupervisor(true);
      setVendorSupervisorName(req.supervisorName || '');
      setVendorSupervisorPhone(req.supervisorPhone || '');
      setVendorSupervisorEmail(req.supervisorEmail || '');
      setVendorSupervisorAddress(req.supervisorAddress || '');
    } else {
      setVendorAssignSupervisor(false);
      setVendorSupervisorName('');
      setVendorSupervisorPhone('');
      setVendorSupervisorEmail('');
      setVendorSupervisorAddress('');
    }
    
    setActiveTab('onboarding');
    showToast(`Details for "${req.name}" auto-filled into onboarding form.`);
  };

  // Vendor Onboarding Form State
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState(CATEGORIES[0]);
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorCity, setVendorCity] = useState(CITIES[0]);
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorDesc, setVendorDesc] = useState('');
  const [vendorLat, setVendorLat] = useState('13.0827');
  const [vendorLng, setVendorLng] = useState('80.2707');

  // Supervisor Form State
  const [vendorAssignSupervisor, setVendorAssignSupervisor] = useState(false);
  const [vendorSupervisorName, setVendorSupervisorName] = useState('');
  const [vendorSupervisorPhone, setVendorSupervisorPhone] = useState('');
  const [vendorSupervisorEmail, setVendorSupervisorEmail] = useState('');
  const [vendorSupervisorAddress, setVendorSupervisorAddress] = useState('');
  const [vendorSupervisorBnxMail, setVendorSupervisorBnxMail] = useState('');

  // Listing Form State
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [listingName, setListingName] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingDuration, setListingDuration] = useState('60');
  const [listingCategory, setListingCategory] = useState('Salon');
  const [listingImageUrl, setListingImageUrl] = useState('');
  const [listingLat, setListingLat] = useState('13.0827');
  const [listingLng, setListingLng] = useState('80.2707');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMerchantId, setCopiedMerchantId] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    setMounted(true);
    // Check session storage for existing auth
    const sessionActive = sessionStorage.getItem('sales_session');
    if (sessionActive === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Synchronize vendor lat/lng default value when operating city changes
  useEffect(() => {
    const coords = CITY_COORDINATES[vendorCity.toLowerCase()] || { lat: 13.0827, lng: 80.2707 };
    setVendorLat(String(coords.lat));
    setVendorLng(String(coords.lng));
  }, [vendorCity]);

  // Synchronize listing lat/lng with the selected merchant's coordinates
  useEffect(() => {
    const targetMerchant = merchants.find(m => m.id === selectedMerchantId);
    if (targetMerchant) {
      setListingLat(String(targetMerchant.latitude || 13.0827));
      setListingLng(String(targetMerchant.longitude || 80.2707));
    }
  }, [selectedMerchantId, merchants]);

  // Pre-fill dropdowns when merchants list loads
  useEffect(() => {
    if (merchants.length > 0 && !selectedMerchantId) {
      setSelectedMerchantId(merchants[0].id);
    }
  }, [merchants, selectedMerchantId]);

  useEffect(() => {
    setStandardCommInput(String(commissionRate));
  }, [commissionRate]);

  // Synchronize supervisor integrated BNX Mail ID
  useEffect(() => {
    if (vendorSupervisorName.trim() && vendorEmail.trim()) {
      const cleanName = vendorSupervisorName.trim().toLowerCase().replace(/\s+/g, '');
      setVendorSupervisorBnxMail(`${cleanName}/${vendorEmail.trim()}`);
    } else {
      setVendorSupervisorBnxMail('');
    }
  }, [vendorSupervisorName, vendorEmail]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-dim)] flex items-center justify-center">
        <div className="text-center text-xs text-[color:var(--color-outline)] animate-pulse">INITIATING SALES TERMINAL...</div>
      </div>
    );
  }

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const normUsername = usernameInput.trim().toLowerCase();
    
    if (normUsername === 'sales' && passwordInput === '123') {
      setLoginSuccess('Authentication verified. Loading Sales Dashboard...');
      sessionStorage.setItem('sales_session', 'true');
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 1000);
    } else {
      setLoginError('Invalid sales representative credentials.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('sales_session');
    setIsLoggedIn(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Vendor Onboarding handler
  const handleOnboardVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      showToast('Vendor Name is required.');
      return;
    }

    // Pre-calculate what the generated Vendor ID will be
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const currentSerial = useBookingFlowStore.getState().nextVendorSerial || 5;
    const serialStr = String(currentSerial).padStart(4, '0');
    const generatedId = `${yyyy}${mm}${serialStr}`;

    const newVendor = {
      id: String(Date.now()),
      name: vendorName.trim(),
      category: vendorCategory,
      status: 'ACTIVE' as const,
      email: vendorEmail.trim() || 'contact@merchant.com',
      phone: vendorPhone.trim() || '+91 90000 00000',
      city: vendorCity,
      address: vendorAddress.trim() || 'Main St',
      description: vendorDesc.trim() || 'Premium service vendor.',
      rating: 5.0,
      latitude: parseFloat(vendorLat) || 13.0827,
      longitude: parseFloat(vendorLng) || 80.2707,
      assignSupervisor: vendorAssignSupervisor,
      ...(vendorAssignSupervisor ? {
        supervisorName: vendorSupervisorName.trim(),
        supervisorPhone: vendorSupervisorPhone.trim(),
        supervisorEmail: vendorSupervisorEmail.trim(),
        supervisorAddress: vendorSupervisorAddress.trim(),
        supervisorBnxMail: vendorSupervisorBnxMail.trim(),
      } : {})
    };

    addMerchant(newVendor);
    showToast(`Vendor "${vendorName}" onboarded! Assigned ID: ${generatedId}`);
    
    // Reset state
    setVendorName('');
    setVendorEmail('');
    setVendorPhone('');
    setVendorAddress('');
    setVendorDesc('');
    setVendorAssignSupervisor(false);
    setVendorSupervisorName('');
    setVendorSupervisorPhone('');
    setVendorSupervisorEmail('');
    setVendorSupervisorAddress('');
    setVendorSupervisorBnxMail('');
    setSelectedMerchantId(newVendor.id); // Pre-select newly created vendor
  };

  // Listing creation handler
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingName.trim() || !listingPrice.trim()) {
      showToast('Listing Name and Price are required.');
      return;
    }

    const targetMerchant = merchants.find(m => m.id === selectedMerchantId);
    if (!targetMerchant) {
      showToast('Invalid merchant selected.');
      return;
    }

    const randomSeed = Math.floor(Math.random() * 100);
    const resolvedImg = listingImageUrl.trim() || `https://picsum.photos/seed/${randomSeed}/400/250`;

    const newService = {
      id: `svc-${Date.now()}`,
      name: listingName.trim(),
      merchant: targetMerchant.name,
      price: parseInt(listingPrice),
      rating: 5.0,
      reviews: 0,
      duration: parseInt(listingDuration) || 60,
      city: targetMerchant.city || 'Chennai',
      image: resolvedImg,
      category: listingCategory,
      lat: parseFloat(listingLat) || 13.0827,
      lng: parseFloat(listingLng) || 80.2707,
      desc: `Expertly provided service by ${targetMerchant.name}.`
    };

    addService(newService);
    showToast(`Listing "${listingName}" created under ${targetMerchant.name}.`);

    // Reset listing inputs
    setListingName('');
    setListingPrice('');
    setListingImageUrl('');
  };

  // Filter listings based on search query
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Login view
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface)] flex flex-col justify-center items-center p-4 relative">
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-outline-variant)_1px,transparent_1px),linear-gradient(90deg,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.02] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 z-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to marketplace
          </Link>

          <div className="card-glass rounded-3xl p-6 md:p-8 bg-[color:var(--color-surface-container)] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />

            <div className="text-center mb-8">
              <div className="h-11 w-11 rounded-2xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4 text-[color:var(--color-primary)]">
                <Lock size={20} />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Sales Terminal Login</h1>
              <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Authorized corporate sales console access only.</p>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="mb-5 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={15} className="shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)] block">Sales Agent ID</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. sales"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    required
                  />
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)] block">Security Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    required
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[color:var(--color-primary)]/10 mt-6 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Access Sales Console <ArrowRight size={13} />
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Sales dashboard view
  return (
    <main className="min-h-screen bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface)] pb-16 relative">
      <div className="absolute inset-0 bg-[linear-gradient(var(--color-outline-variant)_1px,transparent_1px),linear-gradient(90deg,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.01] pointer-events-none" />

      {/* Dynamic Success Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#0e1616] px-4 py-3 text-xs font-bold text-emerald-400 shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[color:var(--color-surface)]/80 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 hover:bg-white/[0.04] text-[color:var(--color-on-surface-variant)] hover:text-white rounded-lg transition-colors"
              title="Return to Marketplace"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[color:var(--color-primary)] shrink-0" />
              <h1 className="text-sm font-black tracking-wider flex items-center gap-2 text-white">
                <span>SALES ADMINISTRATIVE PORTAL</span>
                <span className="text-[9px] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20 px-2 py-0.5 rounded-full font-bold">
                  SALES TEAM
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 hover:border-red-500/20 bg-white/[0.01] hover:bg-red-500/5 px-3 py-1.5 text-[10px] font-bold text-[color:var(--color-on-surface-variant)] hover:text-red-400 transition-all cursor-pointer"
            >
              Lock Console
            </button>
          </div>
        </div>
      </nav>

      {/* Content Container */}
      <div className="pt-24 max-w-7xl mx-auto px-6 space-y-8 relative z-10">
        
        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Marketplace Product & Onboarding Manager</h2>
            <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5">Corporate sales team workspace to onboard new merchants and list/monitor service listings.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl shrink-0 select-none flex-wrap gap-1 sm:gap-0">
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`rounded-lg py-2 px-4 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'onboarding'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 size={13} />
              Onboarding
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`rounded-lg py-2 px-4 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox size={13} />
              Requests
              {mounted && vendorRequests.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                  {vendorRequests.filter(r => r.status === 'PENDING').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`rounded-lg py-2 px-4 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'commission'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders size={13} />
              Commissions
            </button>
            <button
              onClick={() => setActiveTab('vendorId')}
              className={`rounded-lg py-2 px-4 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vendorId'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock size={13} />
              Vendor IDs
            </button>
          </div>
        </div>

        {activeTab === 'onboarding' && (
          <>
            {/* Top Analytics Widgets */}
            <div className="grid gap-6 md:grid-cols-3">
          {/* Onboarded Vendors */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">Onboarded Vendors</span>
              <p className="text-xl font-black text-white pt-1">{merchants.length} Active</p>
              <p className="text-[9px] text-[color:var(--color-on-surface-variant)]">Total registered marketplace partners</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 size={16} />
            </div>
          </div>

          {/* Active Service Listings */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">Total Service Products</span>
              <p className="text-xl font-black text-[color:var(--color-primary)] pt-1">{services.length} Listings</p>
              <p className="text-[9px] text-[color:var(--color-on-surface-variant)]">Dynamic bookable assets in catalog</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center text-[color:var(--color-primary)]">
              <ShoppingBag size={16} />
            </div>
          </div>

          {/* Categories mapped */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">Sectors Covered</span>
              <p className="text-xl font-black text-white pt-1">
                {new Set(services.map(s => s.category)).size} Categories
              </p>
              <p className="text-[9px] text-[color:var(--color-on-surface-variant)]">Active industries running online</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity size={16} />
            </div>
          </div>
        </div>

        {/* Input Forms Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vendor Onboarding Form */}
          <div className="rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <Building2 size={15} className="text-indigo-400" /> Onboard New Vendor
            </h3>
            
            <form onSubmit={handleOnboardVendor} className="space-y-4 pt-2 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Vendor (Merchant) Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Western Ghats Treks"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Industry Sector</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[color:var(--color-surface-container)]">{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@treks.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 99887 76655"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Operating City</label>
                  <select
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  >
                    {CITIES.map(city => <option key={city} value={city} className="bg-[color:var(--color-surface-container)]">{city}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 bypass road, Sector 3"
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Exact Location & Interactive Map Picker */}
              <div className="space-y-3 border-t border-white/5 pt-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Shop Coordinates Location</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setVendorLat(position.coords.latitude.toFixed(5));
                            setVendorLng(position.coords.longitude.toFixed(5));
                            showToast("Current location detected!");
                          },
                          (err) => {
                            console.error("GPS detection failed", err);
                            showToast("GPS timeout. Please select on map or enter manually.");
                          }
                        );
                      } else {
                        showToast("Geolocation is not supported by your browser.");
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Navigation size={10} /> Detect GPS Location
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 13.0827"
                      value={vendorLat}
                      onChange={(e) => setVendorLat(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 80.2707"
                      value={vendorLng}
                      onChange={(e) => setVendorLng(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-white/5 relative bg-slate-900/50">
                  <MapComponent
                    center={[parseFloat(vendorLat) || 13.0827, parseFloat(vendorLng) || 80.2707]}
                    zoom={13}
                    customPin={{ lat: parseFloat(vendorLat) || 13.0827, lng: parseFloat(vendorLng) || 80.2707 }}
                    onMapClick={(lat, lng) => {
                      setVendorLat(lat.toFixed(5));
                      setVendorLng(lng.toFixed(5));
                    }}
                    markers={merchants
                      .filter(m => m.latitude && m.longitude)
                      .map(m => ({
                        id: m.id,
                        name: m.name,
                        merchant: m.name,
                        lat: m.latitude!,
                        lng: m.longitude!,
                        emoji: '🏢',
                        category: m.category,
                        price: 'Partner',
                        rating: m.rating,
                      }))
                    }
                  />
                </div>
                <p className="text-[9px] text-slate-500 italic">
                  💡 Hint: Drag the map and click anywhere to place your shop pin exactly.
                </p>
              </div>

              {/* Supervisor Onboarding Option */}
              <div className="border-t border-white/5 pt-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={vendorAssignSupervisor}
                    onChange={(e) => setVendorAssignSupervisor(e.target.checked)}
                    className="rounded border-white/20 bg-white/[0.02] text-[color:var(--color-primary)] focus:ring-0 focus:ring-offset-0 cursor-pointer h-4 w-4"
                  />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Assign Supervisor to this Vendor</span>
                </label>
              </div>

              {vendorAssignSupervisor && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl bg-white/[0.01] border border-white/5 mt-2">
                  <div className="sm:col-span-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-primary)]">Supervisor Configuration</h4>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Supervisor Name</label>
                    <input
                      type="text"
                      required={vendorAssignSupervisor}
                      placeholder="e.g. arun"
                      value={vendorSupervisorName}
                      onChange={(e) => setVendorSupervisorName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Supervisor Phone</label>
                    <input
                      type="text"
                      required={vendorAssignSupervisor}
                      placeholder="e.g. +91 98765 12345"
                      value={vendorSupervisorPhone}
                      onChange={(e) => setVendorSupervisorPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Supervisor Personal Email</label>
                    <input
                      type="email"
                      required={vendorAssignSupervisor}
                      placeholder="e.g. arun@gmail.com"
                      value={vendorSupervisorEmail}
                      onChange={(e) => setVendorSupervisorEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Supervisor Address</label>
                    <input
                      type="text"
                      required={vendorAssignSupervisor}
                      placeholder="e.g. Flat 3B, Sunshine Apts"
                      value={vendorSupervisorAddress}
                      onChange={(e) => setVendorSupervisorAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-[9px] font-bold text-[color:var(--color-primary)] uppercase tracking-wider">Supervisor Integrated BNX Mail ID</label>
                    <input
                      type="text"
                      required={vendorAssignSupervisor}
                      placeholder="e.g. arun/anderson@bnxmail.com"
                      value={vendorSupervisorBnxMail}
                      onChange={(e) => setVendorSupervisorBnxMail(e.target.value)}
                      className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/5 focus:bg-indigo-500/10 px-3.5 py-2 text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500 transition-all"
                    />
                    <p className="text-[9px] text-slate-500 font-medium">
                      Generated automatically as <code className="text-slate-400">supervisor_name/vendor's_bnx_mail</code>. You can customize this if required.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Vendor Registry Description</label>
                <textarea
                  placeholder="e.g. Western Ghats Treks is a verified adventure organizer specializing in campings, tent rentings, and hill treks..."
                  value={vendorDesc}
                  onChange={(e) => setVendorDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={15} /> Onboard Vendor Account
              </button>
            </form>
          </div>

          {/* Product/Listing Creation Form */}
          <div className="rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <PlusCircle size={15} className="text-[color:var(--color-primary)]" /> Add Product Listing
            </h3>
            
            <form onSubmit={handleCreateListing} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Assign Vendor</label>
                <select
                  value={selectedMerchantId}
                  onChange={(e) => setSelectedMerchantId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[color:var(--color-primary)] transition-all"
                >
                  {merchants.length > 0 ? (
                    merchants.map(m => (
                      <option key={m.id} value={m.id} className="bg-[color:var(--color-surface-container)]">
                        {m.name} ({m.city})
                      </option>
                    ))
                  ) : (
                    <option value="">No vendors onboarded yet</option>
                  )}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Listing / Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Camping Gear Rental Pack"
                    value={listingName}
                    onChange={(e) => setListingName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Marketplace Sector</label>
                  <select
                    value={listingCategory}
                    onChange={(e) => setListingCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[color:var(--color-surface-dim)] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[color:var(--color-primary)] transition-all"
                  >
                    <option value="Salon" className="bg-[color:var(--color-surface-container)]">Salon</option>
                    <option value="Fitness" className="bg-[color:var(--color-surface-container)]">Fitness</option>
                    <option value="Dining" className="bg-[color:var(--color-surface-container)]">Dining</option>
                    <option value="Events" className="bg-[color:var(--color-surface-container)]">Events</option>
                    <option value="Wellness" className="bg-[color:var(--color-surface-container)]">Wellness</option>
                    <option value="Sports" className="bg-[color:var(--color-surface-container)]">Sports</option>
                    <option value="Rentals" className="bg-[color:var(--color-surface-container)]">Rentals</option>
                    <option value="Clinic" className="bg-[color:var(--color-surface-container)]">Clinic</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Listing Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 60"
                    value={listingDuration}
                    onChange={(e) => setListingDuration(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Image Link URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/... (auto-generated if empty)"
                  value={listingImageUrl}
                  onChange={(e) => setListingImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Latitude Coordinate</label>
                  <input
                    type="text"
                    placeholder="13.0827"
                    value={listingLat}
                    onChange={(e) => setListingLat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[color:var(--color-primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-wider">Longitude Coordinate</label>
                  <input
                    type="text"
                    placeholder="80.2707"
                    value={listingLng}
                    onChange={(e) => setListingLng(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[color:var(--color-primary)] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={merchants.length === 0}
                className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md mt-4 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle size={15} /> Publish Listing to Marketplace
              </button>
            </form>
          </div>
        </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="font-bold text-base text-white uppercase tracking-wider">Pending Vendor Applications</h3>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5">
                  Verify vendor business credentials and approve them to automatically onboard them as Bokspot partners.
                </p>
              </div>
            </div>

            {vendorRequests.length === 0 ? (
              <div className="card-glass rounded-2xl p-16 text-center border border-white/5 bg-[color:var(--color-surface-container)] flex flex-col items-center justify-center">
                <Inbox size={48} className="text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-white">No applications found</h4>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1">There are currently no prospective vendor registrations on file.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {vendorRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] border border-white/5 flex flex-col justify-between space-y-5 relative overflow-hidden transition-all hover:scale-[1.01] duration-300"
                  >
                    {/* Top ambient highlight */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />
                    
                    <div className="space-y-3.5 relative z-10 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{req.name}</h4>
                          <span className="inline-block mt-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                            {req.category}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                          req.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-[11px] pt-1.5 border-t border-white/5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)]">Operating City</span>
                          <p className="text-white font-semibold">{req.city}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)]">Application Date</span>
                          <p className="text-slate-300 font-semibold">{new Date(req.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)]">Email Address</span>
                          <p className="text-slate-300 font-semibold truncate" title={req.email}>{req.email}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)]">Phone Number</span>
                          <p className="text-slate-300 font-semibold">{req.phone}</p>
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)]">Street Address</span>
                          <p className="text-slate-300 font-medium">{req.address}</p>
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[color:var(--color-outline)]">Business Bio / Description</span>
                          <p className="text-slate-400 leading-relaxed font-medium italic">"{req.description}"</p>
                        </div>

                        {req.assignSupervisor && (
                          <div className="col-span-2 border-t border-white/5 pt-2 mt-1 space-y-2">
                            <span className="text-[9px] uppercase font-bold text-[color:var(--color-primary)]">Supervisor Request Details</span>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-slate-500 font-medium block">Supervisor Name</span>
                                <span className="text-white font-semibold">{req.supervisorName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium block">Supervisor Phone</span>
                                <span className="text-white font-semibold">{req.supervisorPhone}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium block">Supervisor Email</span>
                                <span className="text-white font-semibold truncate block" title={req.supervisorEmail}>{req.supervisorEmail}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium block">Supervisor Address</span>
                                <span className="text-white font-semibold truncate block" title={req.supervisorAddress}>{req.supervisorAddress}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="space-y-2.5 pt-3 border-t border-white/5 relative z-10">
                        <button
                          onClick={() => handleAutoUpdateDetails(req)}
                          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <PlusCircle size={13} /> Auto Fill & Configure Onboarding
                        </button>
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => handleRejectRequest(req.id, req.name)}
                            className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <XCircle size={13} /> Reject Request
                          </button>
                          <button
                            onClick={() => handleApproveRequest(req)}
                            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-900/15"
                          >
                            <CheckCircle2 size={13} /> Direct Onboard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'commission' && (
          <>
            {/* Commission & Overrides Section */}
            <div className="grid gap-6 lg:grid-cols-3">
          {/* Platform Settings */}
          <div className="rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders size={14} className="text-[color:var(--color-primary)]" /> Platform Commission
            </h3>
            
            <div className="space-y-5 pt-2 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[10px] uppercase text-[color:var(--color-on-surface-variant)]">Platform Commission Rate</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={standardCommInput}
                      onBlur={() => {
                        if (standardCommInput === '') {
                          setStandardCommInput(String(commissionRate));
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        let rawVal = e.target.value;
                        if (rawVal.startsWith('0') && rawVal.length > 1 && rawVal[1] !== '.') {
                          rawVal = rawVal.substring(1);
                        }
                        setStandardCommInput(rawVal);
                        
                        let val = parseFloat(rawVal);
                        if (!isNaN(val)) {
                          val = Math.max(0, Math.min(100, val));
                          setCommissionRate(val);
                        }
                      }}
                      className="w-12 text-center py-0.5 rounded border border-white/10 bg-white/[0.02] text-xs text-[color:var(--color-primary)] font-bold focus:outline-none focus:border-[color:var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-white text-xs">%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  value={commissionRate} 
                  onChange={(e) => {
                    setCommissionRate(parseFloat(e.target.value));
                    showToast(`Commission rate set to ${e.target.value}%.`);
                  }}
                  className="w-full accent-[color:var(--color-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-[color:var(--color-on-surface-variant)] font-bold">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Overrides */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">Service Commission Overrides</h3>
                <p className="text-[9px] text-[color:var(--color-on-surface-variant)] mt-0.5">Customize commission for each service individually. Leave blank to fallback to default.</p>
              </div>
              <div className="relative flex items-center shrink-0">
                <Search size={12} className="absolute left-2.5 text-[color:var(--color-outline)]" />
                <input
                  type="text"
                  placeholder="Filter override list..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-8 pr-3 py-1 text-[10px] text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all w-48"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[220px] border border-white/5 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/50 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                    <th className="p-3 pl-6">Service</th>
                    <th className="p-3">Merchant</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-center">Default</th>
                    <th className="p-3 text-center">Custom %</th>
                    <th className="p-3 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[10px] text-slate-300">
                  {services
                    .filter(svc => 
                      svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                      svc.merchant.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                      svc.category.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                    )
                    .map((svc) => (
                      <ServiceCommissionRow 
                        key={svc.id}
                        svc={svc}
                        commissionRate={commissionRate}
                        updateService={updateService}
                        showToast={showToast}
                      />
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'onboarding' && (
          <>
            {/* Live Products Directory */}
            <div className="card-glass rounded-2xl bg-[color:var(--color-surface-container)] border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">Active Product Listings auditor</h3>
              <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Sales representatives catalog audit of all services actively queryable by customers.</p>
            </div>
            
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-[color:var(--color-outline)]" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all w-60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredServices.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/30 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                    <th className="p-4 pl-6">Service/Product</th>
                    <th className="p-4">Merchant Target</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-center">Duration</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Rating</th>
                    <th className="p-4 pr-6 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                  {filteredServices.map((svc) => (
                    <tr key={svc.id} className="hover:bg-white/[0.005] transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        {svc.image.startsWith('http') ? (
                          <img src={svc.image} alt={svc.name} className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[color:var(--color-surface-dim)] border border-white/10 flex items-center justify-center text-lg shrink-0">
                            {svc.image}
                          </div>
                        )}
                        <span className="font-extrabold text-white">{svc.name}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-400">{svc.merchant}</td>
                      <td className="p-4 flex items-center gap-1.5 py-6">
                        <MapPin size={12} className="text-[color:var(--color-primary)] shrink-0" />
                        <span>{svc.city}</span>
                      </td>
                      <td className="p-4">
                        <span className="badge badge-primary text-[9px] py-0.5 px-2">{svc.category}</span>
                      </td>
                      <td className="p-4 text-center font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-slate-500" />
                          {svc.duration} mins
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-white">₹{svc.price}</td>
                      <td className="p-4 text-center font-bold text-yellow-500">{svc.rating} ★</td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            deleteService(svc.id);
                            showToast(`Listing "${svc.name}" removed from marketplace.`);
                          }}
                          className="p-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                          title="Remove Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-[color:var(--color-on-surface-variant)] italic">
                No matching product listings in auditor directories.
              </div>
            )}
          </div>
        </div>

        {/* Registered Vendors Directory */}
        <div className="card-glass rounded-2xl bg-[color:var(--color-surface-container)] border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Active Merchant registries</h3>
            <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Directory of all partner merchants registered on the marketplace platform.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/30 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                  <th className="p-4 pl-6">Merchant Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Address</th>
                  <th className="p-4 text-center">Active Listings</th>
                  <th className="p-4 pr-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.005] transition-colors">
                    <td className="p-4 pl-6 font-extrabold text-white">{m.name}</td>
                    <td className="p-4 text-slate-400 font-medium">{m.category}</td>
                    <td className="p-4 font-semibold text-white">{m.city || 'Chennai'}</td>
                    <td className="p-4">
                      <div>{m.email}</div>
                      <div className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">{m.phone}</div>
                    </td>
                    <td className="p-4 text-slate-400 truncate max-w-[150px]" title={m.address}>{m.address}</td>
                    <td className="p-4 text-center font-bold text-white">
                      {services.filter(s => s.merchant.toLowerCase() === m.name.toLowerCase()).length}
                    </td>
                    <td className="p-4 pr-6 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black ${
                        m.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
        {activeTab === 'vendorId' && (
          <div className="space-y-6">
            {/* Nomenclature info card */}
            <div className="rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                <Lock size={15} className="text-indigo-400" /> Vendor ID Nomenclature Guide
              </h3>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] leading-relaxed">
                Each vendor in the Booking marketplace must be assigned a unique ID for security, auditing, and multi-store management.
                The corporate nomenclature is formatted as <code className="font-mono text-indigo-400 bg-white/5 px-1 py-0.5 rounded text-[11px] font-bold">YYYYMMSSSS</code>:
              </p>
              <div className="grid gap-4 sm:grid-cols-3 pt-2 text-[11px]">
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                  <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500 block mb-1">YYYY (4 Digits)</span>
                  <span className="text-white font-semibold">Year of onboarding (e.g. {new Date().getFullYear()})</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                  <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500 block mb-1">MM (2 Digits)</span>
                  <span className="text-white font-semibold">Month of onboarding (e.g. {String(new Date().getMonth() + 1).padStart(2, '0')})</span>
                </div>
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                  <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-500 block mb-1">SSSS (4 Digits)</span>
                  <span className="text-white font-semibold">Zero-padded serial code (e.g. 0001, 0002)</span>
                </div>
              </div>
            </div>

            {/* Vendor ID Registry Table */}
            <div className="card-glass rounded-2xl bg-[color:var(--color-surface-container)] border border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">Vendor ID Assignment Registry</h3>
                  <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Generate, audit, and copy unique ID credentials for marketplace merchant consoles.</p>
                </div>
                
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3 text-[color:var(--color-outline)]" />
                  <input
                    type="text"
                    placeholder="Search vendor registry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all w-60"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/30 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                      <th className="p-4 pl-6">Vendor Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Operating City</th>
                      <th className="p-4">Email / Phone</th>
                      <th className="p-4 text-center">Unique Vendor ID</th>
                      <th className="p-4 pr-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                    {merchants
                      .filter(m => 
                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.city && m.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (m.vendorId && m.vendorId.includes(searchQuery))
                      )
                      .map((m) => {
                        const isCopied = copiedMerchantId === m.id;
                        return (
                          <tr key={m.id} className="hover:bg-white/[0.005] transition-colors">
                            <td className="p-4 pl-6 font-extrabold text-white">{m.name}</td>
                            <td className="p-4 text-slate-400 font-medium">{m.category}</td>
                            <td className="p-4 font-semibold text-white">{m.city || 'Chennai'}</td>
                            <td className="p-4">
                              <div>{m.email}</div>
                              <div className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">{m.phone}</div>
                            </td>
                            <td className="p-4 text-center">
                              {m.vendorId ? (
                                <code className="font-mono text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1 inline-block w-fit select-all">
                                  {m.vendorId}
                                </code>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                                  Pending Assignment
                                </span>
                              )}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {m.vendorId ? (
                                <button
                                  onClick={() => {
                                    const textToCopy = m.vendorId!;
                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                      navigator.clipboard.writeText(textToCopy);
                                      setCopiedMerchantId(m.id);
                                      setTimeout(() => setCopiedMerchantId(null), 2000);
                                      showToast(`Copied Vendor ID ${textToCopy} to clipboard.`);
                                    } else {
                                      const textArea = document.createElement('textarea');
                                      textArea.value = textToCopy;
                                      textArea.style.position = 'fixed';
                                      document.body.appendChild(textArea);
                                      textArea.focus();
                                      textArea.select();
                                      try {
                                        document.execCommand('copy');
                                        setCopiedMerchantId(m.id);
                                        setTimeout(() => setCopiedMerchantId(null), 2000);
                                        showToast(`Copied Vendor ID ${textToCopy} to clipboard.`);
                                      } catch (err) {
                                        showToast('Failed to copy ID to clipboard.');
                                      }
                                      document.body.removeChild(textArea);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-[10px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check size={12} className="text-emerald-400 animate-pulse" />
                                      <span className="text-emerald-400 font-bold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={12} />
                                      <span>Copy ID</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const now = new Date();
                                    const yyyy = now.getFullYear();
                                    const mm = String(now.getMonth() + 1).padStart(2, '0');
                                    const nextSerial = useBookingFlowStore.getState().nextVendorSerial || 5;
                                    const serialStr = String(nextSerial).padStart(4, '0');
                                    const assignedId = `${yyyy}${mm}${serialStr}`;
                                    assignVendorId(m.id, assignedId);
                                    useBookingFlowStore.setState({ nextVendorSerial: nextSerial + 1 });
                                    showToast(`Assigned Vendor ID ${assignedId} to "${m.name}".`);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                >
                                  Generate ID
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
