// ============================================================
// API Client — BETA Universal Service Marketplace
// ============================================================

const API_BASE = typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1`
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500/api/v1');

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ---- Category Mappings & Mock Generators ----
const SLUG_TO_CATEGORY: Record<string, string> = {
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

function formatSlug(slug: string): string {
  if (SLUG_TO_CATEGORY[slug]) return SLUG_TO_CATEGORY[slug];
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getMockServicesByCategory(slug: string, city: string = 'Chennai'): Service[] {
  const formatted = formatSlug(slug);
  const merchantName = `${formatted} Care Hub`;
  const merchantSlug = `${slug}-care-hub`;

  const merchant: Merchant = {
    id: `mer-${slug}`,
    name: merchantName,
    slug: merchantSlug,
    description: `Premium provider for ${formatted} services, verified and licensed in ${city}.`,
    images: ['🏢'],
    city: city,
    address: `42 Main High Road, ${city}`,
    rating: 4.7,
    reviewCount: 120,
    isVerified: true,
    amenities: ['Parking', 'AC', 'Card Accepted'],
    tags: [formatted, 'Best Price'],
    latitude: 13.0827,
    longitude: 80.2707,
  };

  const category: Category = {
    id: `cat-${slug}`,
    name: formatted,
    slug: slug,
  };

  return [
    {
      id: `ds-${slug}-1`,
      name: `Standard ${formatted} Service`,
      slug: `std-${slug}`,
      description: `Get professional, top-rated standard ${formatted} services with guaranteed satisfaction.`,
      shortDescription: `Standard evaluation and basic package for ${formatted}.`,
      serviceType: 'Standard',
      basePrice: '499',
      currency: 'INR',
      durationMinutes: 45,
      images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'],
      rating: 4.6,
      reviewCount: 95,
      isFeatured: true,
      merchant,
      category,
    },
    {
      id: `ds-${slug}-2`,
      name: `Premium ${formatted} Package`,
      slug: `prem-${slug}`,
      description: `Complete, priority-level premium package for ${formatted} services including advanced benefits.`,
      shortDescription: `Full comprehensive treatment and priority support for ${formatted}.`,
      serviceType: 'Premium',
      basePrice: '1499',
      currency: 'INR',
      durationMinutes: 90,
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80'],
      rating: 4.9,
      reviewCount: 42,
      isFeatured: true,
      merchant,
      category,
    }
  ];
}

// ---- Booking Types ----
export const api = {
  bookingTypes: {
    list: () => apiFetch<BookingType[]>('/booking-types'),
    featured: () => apiFetch<BookingType[]>('/booking-types?featured=true'),
    bySlug: (slug: string) => apiFetch<BookingTypeDetail>(`/booking-types/${slug}`),
  },
  categories: {
    list: () => apiFetch<Category[]>('/services/categories'),
  },
  services: {
    featured: async (limit = 8) => {
      try {
        const res = await apiFetch<any>(`/services/featured?limit=${limit}`);
        if (res && res.success && res.data) {
          return res.data;
        }
      } catch (err) {
        console.warn('Backend featured services error:', err);
      }
      return [];
    },
    list: async (params?: Record<string, string>) => {
      const slug = params?.categorySlug;
      const city = params?.city || 'Chennai';
      try {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        const res = await apiFetch<any>(`/services${qs}`);
        if (res && res.success && res.data) {
          return res.data;
        }
      } catch (err) {
        console.warn('Backend service fetch error, falling back to mock services:', err);
      }
      
      if (slug) {
        const mocks = getMockServicesByCategory(slug, city);
        return {
          data: mocks,
          meta: { total: mocks.length, page: 1, limit: 10, totalPages: 1 }
        };
      }
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
      };
    },
    byId: async (id: string) => {
      try {
        const res = await apiFetch<any>(`/services/${id}`);
        if (res && res.success && res.data) {
          return res.data;
        }
      } catch (err) {
        console.warn('Backend service details error, falling back to mock parser:', err);
      }
      
      if (id.startsWith('ds-')) {
        const parts = id.split('-');
        const indexStr = parts[parts.length - 1];
        const slugParts = parts.slice(1, parts.length - 1);
        const categorySlug = slugParts.join('-');
        
        const mocks = getMockServicesByCategory(categorySlug);
        const found = mocks.find(s => s.id === id);
        if (found) return found;
      }

      if (id.startsWith('prov-')) {
        const parts = id.split('-');
        const indexStr = parts[parts.length - 1];
        const categorySlug = parts.slice(1, parts.length - 1).join('-');
        
        const categoryName = formatSlug(categorySlug);
        const names = ['Care', 'Studio', 'Pro', 'Express', 'Hub', 'Specialists'];
        const nameIdx = categorySlug.length % names.length;
        const merchantName = `${categoryName} ${names[nameIdx]}`;
        const merchantSlug = `${categorySlug}-${indexStr}`;
        
        const merchant: Merchant = {
          id: `mer-${merchantSlug}`,
          name: merchantName,
          slug: merchantSlug,
          description: `Welcome to ${merchantName}, your trusted premium partner in Chennai. We guarantee expert consultations, absolute hygiene, and top-tier services tailored to you.`,
          images: ['🏢'],
          city: 'Chennai',
          address: `${Math.floor(categorySlug.length * 7)} Main Road, Block ${indexStr}`,
          rating: 4.6,
          reviewCount: 145,
          isVerified: true,
          amenities: ['AC', 'Card Accepted', 'Parking'],
          tags: [categoryName, 'Verified'],
          latitude: 13.0827 + (Math.sin(categorySlug.length + parseInt(indexStr)) * 0.05),
          longitude: 80.2707 + (Math.cos(categorySlug.length + parseInt(indexStr)) * 0.05),
        };

        const category: Category = {
          id: `cat-${categorySlug}`,
          name: categoryName,
          slug: categorySlug,
        };

        return {
          id,
          name: `${categoryName} Premium Package`,
          slug: `prem-${categorySlug}-${indexStr}`,
          description: `Complete, priority-level premium package for ${categoryName} services including advanced benefits and expert support.`,
          shortDescription: `Full comprehensive treatment and priority support for ${categoryName}.`,
          serviceType: 'Premium',
          basePrice: String(400 + parseInt(indexStr) * 200),
          currency: 'INR',
          durationMinutes: 60,
          images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80'],
          rating: 4.6,
          reviewCount: 145,
          isFeatured: true,
          merchant,
          category,
        };
      }
      
      throw new Error(`Service not found: ${id}`);
    },
  },
  merchants: {
    nearby: (lat: number, lng: number, params?: Record<string, string>) => {
      const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), ...params }).toString();
      return apiFetch<Merchant[]>(`/geo/nearby?${qs}`);
    },
    bySlug: (slug: string) => apiFetch<Merchant>(`/merchants/slug/${slug}`),
  },
};

// ---- Types ----
export interface BookingType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  coverImage?: string;
  color?: string;
  gradient?: string;
  sortOrder: number;
  isFeatured: boolean;
  _count?: { categories: number; merchants: number };
}

export interface BookingTypeDetail extends BookingType {
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  iconUrl?: string;
  coverImage?: string;
  color?: string;
  bookingTypeId?: string;
  _count?: { services: number };
  children?: Category[];
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  images: string[];
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  amenities: string[];
  tags: string[];
  latitude?: number;
  longitude?: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  serviceType: string;
  basePrice: string;
  currency: string;
  durationMinutes: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  merchant: Merchant;
  category: Category;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
