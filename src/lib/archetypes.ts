export type Archetype = 'EVENT' | 'RENTAL' | 'APPOINTMENT' | 'DINING' | 'ACCOMMODATION' | 'TRANSPORT';

export const CATEGORY_TO_ARCHETYPE_MAP: Record<string, Archetype> = {
  // Events
  'comedy-events': 'EVENT',
  'sports-events': 'EVENT',
  'music-events': 'EVENT',
  'nightlife': 'EVENT',
  'screenings': 'EVENT',
  'social-mixers': 'EVENT',
  
  // Rentals
  'turfs': 'RENTAL',
  'football-turf': 'RENTAL',
  'cricket-ground': 'RENTAL',
  'game-zones': 'RENTAL',
  'theme-parks': 'RENTAL', // Can also be EVENT, but generally rental/passes
  'photo-studios': 'RENTAL',

  // Appointments
  'salons': 'APPOINTMENT',
  'spas': 'APPOINTMENT',
  'clinics': 'APPOINTMENT',
  'fitness-classes': 'APPOINTMENT', // or CLASS depending on how we handle it

  // Dining
  'restaurants': 'DINING',
  'restobars': 'DINING',
  'clubs': 'DINING',
  'cafes': 'DINING',
  'fine-dining': 'DINING',
  'restaurant-table-reservation': 'DINING',
  
  // Accommodation
  'hotels': 'ACCOMMODATION',
  'resorts': 'ACCOMMODATION',
  'camping': 'ACCOMMODATION',
  'villas': 'ACCOMMODATION',
  'homestays': 'ACCOMMODATION',
  'hotel-booking': 'ACCOMMODATION',
  'resort-booking': 'ACCOMMODATION',
  'homestay-villa': 'ACCOMMODATION',
  'hostel-booking': 'ACCOMMODATION',
  'camping-booking': 'ACCOMMODATION',
  'accommodation-hospitality': 'ACCOMMODATION',
  
  // Transport (Existing custom flows in BOKSPOT)
  'cabs': 'TRANSPORT',
  'flights': 'TRANSPORT',
  'trains': 'TRANSPORT',
  'buses': 'TRANSPORT',
  'metro': 'TRANSPORT',
};

// Blueprint schemas for the Dynamic Form Engine (Business App)
export const ARCHETYPE_SCHEMAS: Record<Archetype, any> = {
  EVENT: {
    title: "Event Details",
    fields: [
      { name: "eventName", type: "text", label: "Event Name", required: true },
      { name: "eventDate", type: "date", label: "Event Date", required: true },
      { name: "ticketTiers", type: "array", label: "Ticket Pricing Tiers (e.g., VIP: ₹2000)", required: true },
      { name: "cast", type: "textarea", label: "Cast / Performers", required: false },
      { name: "ageLimit", type: "text", label: "Age Limit / Entry Rules", required: false }
    ]
  },
  RENTAL: {
    title: "Facility Rental Details",
    fields: [
      { name: "facilityName", type: "text", label: "Facility Name", required: true },
      { name: "hourlyRate", type: "number", label: "Hourly Rate (₹)", required: true },
      { name: "minDuration", type: "number", label: "Minimum Booking Duration (Hrs)", required: true },
      { name: "equipmentAddons", type: "array", label: "Equipment Addons (e.g., Football: ₹100)", required: false }
    ]
  },
  APPOINTMENT: {
    title: "Appointment Service Details",
    fields: [
      { name: "serviceName", type: "text", label: "Service Name", required: true },
      { name: "durationMinutes", type: "number", label: "Duration (Minutes)", required: true },
      { name: "staffMembers", type: "array", label: "Available Staff Members", required: true }
    ]
  },
  DINING: {
    title: "Dining / Restaurant Details",
    fields: [
      { name: "costForTwo", type: "number", label: "Cost for Two (₹)", required: true },
      { name: "cuisines", type: "multi-select", label: "Cuisines", required: true },
      { name: "facilities", type: "multi-select", label: "Facilities (e.g. Serves Alcohol, Indoor Seating)", required: false },
      { name: "menuImages", type: "image-array", label: "Upload Menu Pages", required: true },
      { name: "offers", type: "array", label: "Active Offers (e.g. FLAT 25% OFF)", required: false }
    ]
  },
  ACCOMMODATION: {
    title: "Accommodation Details",
    fields: [
      { name: "roomType", type: "text", label: "Room Type", required: true },
      { name: "totalUnits", type: "number", label: "Number of Rooms Available (Inventory)", required: true },
      { name: "maxGuests", type: "number", label: "Max Guests per Room", required: true },
      { name: "checkInTime", type: "time", label: "Standard Check-in Time", required: true },
      { name: "checkOutTime", type: "time", label: "Standard Check-out Time", required: true },
      { name: "amenities", type: "multi-select", label: "Room Amenities (e.g. WiFi, AC, Pool View)", required: false }
    ]
  },
  TRANSPORT: {
    title: "Transport Details",
    fields: [
      // Usually highly custom, fallback fields here
      { name: "vehicleType", type: "text", label: "Vehicle Type", required: true }
    ]
  }
};
