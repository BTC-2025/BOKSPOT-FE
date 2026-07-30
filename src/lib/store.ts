// ============================================================
// Zustand Stores — Global state management
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockService, MOCK_SERVICES } from './mockData';

interface UserState {
  user: any | null;
  token: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        username: 'sssandy_1',
        fullName: 'Ramesh Kumar',
        email: 'sssandy_1@bnxmail.com',
        phone: '+91 99887 76655',
        emoji: '🧑',
        avatarColor: 'from-amber-400 to-yellow-600',
        profilePhoto: null
      },
      token: 'mock-session-token-sssandy_1',
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);
        set({ token });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      },
    }),
    { name: 'user-storage' },
  ),
);

export interface PersistedBooking {
  id: string;
  ref: string;
  serviceId: string;
  serviceName: string;
  merchantName: string;
  category?: string;
  date: string;
  time: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'CHECKED_IN';
  city?: string;
  durationMinutes?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  otp?: string;
  bookedAt?: string;
}

export interface PersistedMerchant {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'SUSPENDED';
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  description?: string;
  rating: number;
  vendorId?: string;
  latitude?: number;
  longitude?: number;
  assignSupervisor?: boolean;
  supervisorName?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  supervisorAddress?: string;
  supervisorBnxMail?: string;
}

export interface VendorRequest {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  assignSupervisor?: boolean;
  supervisorName?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  supervisorAddress?: string;
}

interface BookingFlowState {
  selectedService: any | null;
  selectedSlot: any | null;
  attendeeCount: number;
  notes: string;
  bookingResult: any | null;
  bookings: PersistedBooking[];
  services: MockService[];
  merchants: PersistedMerchant[];
  vendorRequests: VendorRequest[];
  commissionRate: number;
  nextVendorSerial: number;
  setCommissionRate: (rate: number) => void;
  setSelectedService: (service: any) => void;
  setSelectedSlot: (slot: any) => void;
  setAttendeeCount: (count: number) => void;
  setNotes: (notes: string) => void;
  setBookingResult: (result: any) => void;
  addBooking: (booking: PersistedBooking) => void;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  addService: (service: MockService) => void;
  updateService: (service: MockService) => void;
  deleteService: (serviceId: string) => void;
  addMerchant: (merchant: PersistedMerchant) => void;
  toggleMerchantStatus: (merchantId: string) => void;
  assignVendorId: (merchantId: string, vendorId: string) => void;
  addVendorRequest: (request: VendorRequest) => void;
  updateVendorRequestStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  resetFlow: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      selectedService: null,
      selectedSlot: null,
      attendeeCount: 1,
      notes: '',
      bookingResult: null,
      bookings: [
        { id: '1', ref: 'BK-A1B2C3', serviceId: 'svc-1', serviceName: 'Premium Haircut', merchantName: 'Style Studio', date: '2026-05-20', time: '10:00 AM', status: 'CONFIRMED', amount: 599, city: 'Chennai', durationMinutes: 45, customerName: 'Ramesh Kumar', customerEmail: 'ramesh@gmail.com', customerPhone: '+91 99887 76655', notes: 'Needs top styling.', bookedAt: '2026-05-19T10:30:00.000Z' },
        { id: '2', ref: 'BK-D4E5F6', serviceId: 'svc-2', serviceName: 'Yoga Class', merchantName: 'ZenFit', date: '2026-05-22', time: '7:00 AM', status: 'CONFIRMED', amount: 499, city: 'Chennai', durationMinutes: 60, customerName: 'Priya Raj', customerEmail: 'priya@outlook.com', customerPhone: '+91 91234 56789', notes: 'Prefers morning sunlight.', bookedAt: '2026-05-21T07:15:00.000Z' },
        { id: '3', ref: 'BK-G7H8I9', serviceId: 'svc-3', serviceName: 'Table Reservation', merchantName: 'The Grand temple Dine', date: '2026-05-15', time: '8:00 PM', status: 'COMPLETED', amount: 1200, city: 'Madurai', durationMinutes: 120, customerName: 'Ananth Subramanian', customerEmail: 'ananth@yahoo.com', customerPhone: '+91 98450 12345', notes: 'Window seat if possible.', bookedAt: '2026-05-14T20:00:00.000Z' },
      ],
      services: MOCK_SERVICES,
      merchants: [
        { id: '1', name: 'Apollo Dental Care', category: 'Doctor Appointment', status: 'ACTIVE', rating: 4.8, email: 'info@apollodental.com', phone: '+91 98765 43210', city: 'Chennai', address: '42 Anna Nagar Main Road', description: 'Apollo Dental Care is a state-of-the-art dental clinic providing top-tier oral care services.', vendorId: '2026050001', latitude: 13.0827, longitude: 80.2707 },
        { id: '2', name: 'ZenFit', category: 'Gym / Yoga Slot Booking', status: 'ACTIVE', rating: 4.9, email: 'zenfit@fitness.com', phone: '+91 98765 54321', city: 'Chennai', address: '15 T Nagar High Road', description: 'ZenFit is a wellness and fitness club offering personal training and group yoga sessions.', vendorId: '2026050002', latitude: 13.078, longitude: 80.268 },
        { id: '3', name: 'Style Studio', category: 'Salon / Spa Appointment', status: 'ACTIVE', rating: 4.8, email: 'style@studio.com', phone: '+91 98765 12345', city: 'Chennai', address: '15 T Nagar High Road', description: 'Style Studio is a premium beauty salon for haircuts, styling, and bridal makeups.', vendorId: '2026050003', latitude: 13.085, longitude: 80.275 },
        { id: '4', name: 'The Grand temple Dine', category: 'Restaurant Table Reservation', status: 'ACTIVE', rating: 4.7, email: 'dine@grandtemple.com', phone: '+91 98450 12345', city: 'Madurai', address: 'Madurai High Road', description: 'The Grand Temple Dine is an elegant family fine-dining restaurant.', vendorId: '2026050004', latitude: 9.925, longitude: 78.118 }
      ],
      vendorRequests: [
        {
          id: 'req-1',
          name: 'Green Wellness Spa',
          category: 'Salon / Spa Appointment',
          email: 'contact@greenwellness.com',
          phone: '+91 98765 67890',
          city: 'Chennai',
          address: '77 OMR Road, Karapakkam',
          description: 'A pure organic and herbal spa experience focusing on traditional therapies.',
          status: 'PENDING',
          submittedAt: '2026-06-09T10:00:00.000Z'
        },
        {
          id: 'req-2',
          name: 'Royal Stay Villas',
          category: 'Homestay / Villa',
          email: 'bookings@royalvillas.in',
          phone: '+91 99444 88888',
          city: 'Coimbatore',
          address: '44 Hill View Enclave',
          description: 'Luxury heritage homestay experience in the foothills of Western Ghats.',
          status: 'PENDING',
          submittedAt: '2026-06-09T11:30:00.000Z'
        }
      ],
      commissionRate: 10,
      nextVendorSerial: 5,
      setCommissionRate: (rate) => set({ commissionRate: rate }),
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),
      setAttendeeCount: (count) => set({ attendeeCount: count }),
      setNotes: (notes) => set({ notes }),
      setBookingResult: (result) => set({ bookingResult: result }),
      addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
      cancelBooking: (bookingId) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b)
      })),
      completeBooking: (bookingId) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === bookingId ? { ...b, status: 'COMPLETED' as const } : b)
      })),
      addService: (service) => set((state) => ({ services: [service, ...state.services] })),
      updateService: (updated) => set((state) => ({
        services: state.services.map((s) => s.id === updated.id ? updated : s)
      })),
      deleteService: (serviceId) => set((state) => ({
        services: state.services.filter((s) => s.id !== serviceId)
      })),
      addMerchant: (merchant) => set((state) => {
        let updatedMerchant = { ...merchant };
        let nextSerial = state.nextVendorSerial;
        if (!updatedMerchant.vendorId) {
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const serialStr = String(nextSerial).padStart(4, '0');
          updatedMerchant.vendorId = `${yyyy}${mm}${serialStr}`;
          nextSerial += 1;
        }
        return {
          merchants: [...state.merchants, updatedMerchant],
          nextVendorSerial: nextSerial
        };
      }),
      toggleMerchantStatus: (merchantId) => set((state) => ({
        merchants: state.merchants.map((m) => m.id === merchantId ? { ...m, status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : m)
      })),
      assignVendorId: (merchantId, vendorId) => set((state) => ({
        merchants: state.merchants.map((m) => m.id === merchantId ? { ...m, vendorId } : m)
      })),
      addVendorRequest: (request) => set((state) => ({
        vendorRequests: [request, ...state.vendorRequests]
      })),
      updateVendorRequestStatus: (id, status) => set((state) => ({
        vendorRequests: state.vendorRequests.map((req) =>
          req.id === id ? { ...req, status } : req
        )
      })),
      resetFlow: () => set({
        selectedService: null,
        selectedSlot: null,
        attendeeCount: 1,
        notes: '',
        bookingResult: null,
      }),
    }),
    { name: 'booking-flow-storage' },
  )
);

interface UIState {
  theme: 'system' | 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light' 
      })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'ui-storage' },
  ),
);

export interface LocationState {
  city: string;
  latitude: number | null;
  longitude: number | null;
  status: 'idle' | 'detecting' | 'detected' | 'error';
  setCity: (city: string) => void;
  setLocation: (lat: number, lng: number, city: string) => void;
  setStatus: (status: 'idle' | 'detecting' | 'detected' | 'error') => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      status: 'idle',
      setCity: (city) => set({ city, status: 'detected' }),
      setLocation: (latitude, longitude, city) => set({ latitude, longitude, city, status: 'detected' }),
      setStatus: (status) => set({ status }),
    }),
    { name: 'location-storage' },
  )
);

