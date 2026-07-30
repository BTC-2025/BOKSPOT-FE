// ============================================================
// BETA Universal Booking Platform — Shared Types
// ============================================================

// ---- Enums ----

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CHECKED_IN = 'CHECKED_IN',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
}

export enum ServiceType {
  APPOINTMENT = 'APPOINTMENT',
  RESERVATION = 'RESERVATION',
  RENTAL = 'RENTAL',
  TICKET = 'TICKET',
  MEETING = 'MEETING',
  CLASS = 'CLASS',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CHECKIN_SUCCESS = 'CHECKIN_SUCCESS',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
}

export enum MerchantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export enum QRStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

// ---- Interfaces ----

export interface IUser {
  id: string;
  externalAuthId: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMerchant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  serviceType: ServiceType;
  durationMinutes: number;
  basePrice: number;
  currency: string;
  maxCapacity: number;
  images: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  id: string;
  userId: string;
  serviceId: string;
  merchantId: string;
  slotId: string;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  bookingReference: string;
  notes?: string;
  attendeeCount: number;
  bookedAt: Date;
  scheduledStart: Date;
  scheduledEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingSlot {
  id: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  maxCapacity: number;
  bookedCount: number;
  price: number;
  isBlocked: boolean;
  isAvailable: boolean;
}

export interface IPayment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerOrderId?: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  id: string;
  userId: string;
  serviceId: string;
  merchantId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQRCheckin {
  id: string;
  bookingId: string;
  qrToken: string;
  status: QRStatus;
  checkedInAt?: Date;
  checkedInById?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// ---- API Types ----

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface GeoSearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
  offset?: number;
}

export interface SlotSearchParams {
  serviceId: string;
  date: string; // ISO date string
  timezone?: string;
}

export interface BookingCreatePayload {
  serviceId: string;
  slotId: string;
  attendeeCount: number;
  notes?: string;
  paymentProvider: PaymentProvider;
}

export interface PaymentWebhookPayload {
  provider: PaymentProvider;
  event: string;
  paymentId: string;
  orderId: string;
  status: string;
  signature?: string;
  rawPayload: Record<string, unknown>;
}

// ---- WebSocket Events ----

export enum WsEvent {
  // Slot events
  SLOT_UPDATED = 'slot:updated',
  SLOT_LOCKED = 'slot:locked',
  SLOT_RELEASED = 'slot:released',

  // Booking events
  BOOKING_CREATED = 'booking:created',
  BOOKING_CONFIRMED = 'booking:confirmed',
  BOOKING_CANCELLED = 'booking:cancelled',
  BOOKING_CHECKED_IN = 'booking:checkedIn',

  // Dashboard events
  DASHBOARD_UPDATE = 'dashboard:update',
  REVENUE_UPDATE = 'revenue:update',

  // Notification events
  NOTIFICATION_NEW = 'notification:new',

  // Connection
  JOIN_SERVICE_ROOM = 'join:serviceRoom',
  LEAVE_SERVICE_ROOM = 'leave:serviceRoom',
  JOIN_MERCHANT_ROOM = 'join:merchantRoom',
  LEAVE_MERCHANT_ROOM = 'leave:merchantRoom',
}

// ---- Constants ----

export const BOOKING_HOLD_TTL_SECONDS = 600; // 10 minutes
export const QR_EXPIRY_HOURS = 24;
export const MAX_BOOKING_ATTENDEES = 50;
export const DEFAULT_SEARCH_RADIUS_KM = 25;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const SLOT_LOCK_TTL_SECONDS = 300; // 5 minutes

export const REDIS_KEYS = {
  slotLock: (slotId: string) => `lock:slot:${slotId}`,
  bookingHold: (bookingId: string) => `hold:booking:${bookingId}`,
  slotAvailability: (slotId: string) => `availability:slot:${slotId}`,
  merchantDashboard: (merchantId: string) => `dashboard:${merchantId}`,
  rateLimitUser: (userId: string) => `ratelimit:user:${userId}`,
  rateLimitIp: (ip: string) => `ratelimit:ip:${ip}`,
} as const;

export const QUEUE_NAMES = {
  BOOKING: 'booking-queue',
  PAYMENT: 'payment-queue',
  NOTIFICATION: 'notification-queue',
  ANALYTICS: 'analytics-queue',
  EMAIL: 'email-queue',
} as const;
