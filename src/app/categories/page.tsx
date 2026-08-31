'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SERVICE_GROUPS, GROUP_EMOJIS, getHrefForCategoryItem } from '../../lib/searchData';

function getGroupHref(title: string): string {
  const cleanTitle = title.toLowerCase();
  if (cleanTitle.includes('travel') || cleanTitle.includes('transport')) return '/travel-transport';
  if (cleanTitle.includes('stay') || cleanTitle.includes('accommodation') || cleanTitle.includes('accomodation')) return '/stay-accommodation';
  if (cleanTitle.includes('entertainment') || cleanTitle.includes('events')) return '/entertainment-events';
  if (cleanTitle.includes('sports') || cleanTitle.includes('turf')) return '/sports-turf';
  if (cleanTitle.includes('lifestyle') || cleanTitle.includes('local')) return '/lifestyle-local';
  if (cleanTitle.includes('business') || cleanTitle.includes('professional')) return '/business-professional';
  if (cleanTitle.includes('religious') || cleanTitle.includes('government')) return '/religious-government';
  if (cleanTitle.includes('rental') || cleanTitle.includes('equipment')) return '/rental-equipment';
  if (cleanTitle.includes('personal') || cleanTitle.includes('misc') || cleanTitle.includes('miscellaneous')) return '/personal-misc';
  return '/travel-transport';
}

interface SearchableService {
  name: string;
  emoji: string;
  groupTitle: string;
  href: string;
}

// Flat list of all categories for autocomplete search
const ALL_SEARCHABLE_SERVICES: SearchableService[] = SERVICE_GROUPS.flatMap((group) =>
  group.subcategories.flatMap((subcat) =>
    subcat.items.map((item) => ({
      name: item.name,
      emoji: item.emoji,
      groupTitle: group.title,
      href: getHrefForCategoryItem(group.title, item.name),
    }))
  )
);

const SERVICE_IMAGE_MAP: Record<string, string> = {
  // Travel
  'Bus Booking': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  'Train Booking': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
  'Flight Booking': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80',
  'Ferry / Boat Booking': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  'Shuttle / Van Booking': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
  'Helicopter Booking (Premium)': 'https://loremflickr.com/600/600/helicopter?lock=1',
  'Cab / Taxi Booking': '/images/taxi_booking.jpg',
  'Bike Rental': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
  'Self-Drive Car Rental': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
  
  // Stay
  'Hotel Booking': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
  'Resort Booking': 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&auto=format&fit=crop&q=80',
  'Homestay / Villa': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
  'Hostel Booking': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
  'Camping Booking': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
  
  // Entertainment
  'Cinema / Movie Tickets': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
  'Theatre Shows': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
  'Concert Tickets': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'Events & Festivals': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
  'Exhibition Entry': '/images/exhibition.jpg',
  'Workshops / Classes': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&auto=format&fit=crop&q=80',
  'Gaming Arena Booking': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
  
  // Sports
  'Football Turf': '/images/football.jpg',
  'Cricket Ground': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=80',
  'Badminton Court': 'https://loremflickr.com/600/600/badminton,court?lock=1',
  'Tennis Court': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
  'Basketball Court': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
  'Swimming Pool Slots': '/images/swimming.jpg',
  'Indoor Play Arena': 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80',
  
  // Lifestyle
  'Restaurant Table Reservation': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
  'Salon / Spa Appointment': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  'Gym / Yoga Slot Booking': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
  'Doctor Appointment': 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&auto=format&fit=crop&q=80',
  'Electrician Booking': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
  'Plumber Booking': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
  'Cleaning Service': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
  'Technician Service': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&auto=format&fit=crop&q=80',
  'Studio Booking': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  
  // Business
  'Co-working Space': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
  'Meeting Room': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&auto=format&fit=crop&q=80',
  'Podcast Studio': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
  'Conference Hall': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
  'Training Sessions': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
  
  // Religious
  'Temple Darshan Booking': 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&auto=format&fit=crop&q=80',
  'Pooja Slot Booking': 'https://loremflickr.com/600/600/pooja,hindu?lock=1',
  'Pilgrimage Packages': 'https://loremflickr.com/600/600/temple,india?lock=1',
  
  // Equipment Rentals
  'Cycle Rental': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
  'Sports Bike Rental': 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=600&auto=format&fit=crop&q=80',
  'Camera Rental': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  'Sound System Rental': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop&q=80',
  'Event Equipment Rental': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  
  // Personal Services
  'Pet Grooming Appointment': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80',
  'Babysitting Service': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80',
  'Elder Care Service': 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80',
  'Event Organizer Booking': 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&auto=format&fit=crop&q=80'
};

function getServiceImage(name: string): string {
  if (SERVICE_IMAGE_MAP[name]) {
    return SERVICE_IMAGE_MAP[name];
  }
  return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80';
}

function getServiceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bus')) return 'directions_bus';
  if (n.includes('train')) return 'train';
  if (n.includes('flight')) return 'flight';
  if (n.includes('ferry') || n.includes('boat')) return 'directions_boat';
  if (n.includes('shuttle')) return 'airport_shuttle';
  if (n.includes('helicopter')) return 'flight_takeoff';
  if (n.includes('cab') || n.includes('taxi')) return 'local_taxi';
  if (n.includes('bike')) return 'two_wheeler';
  if (n.includes('car rental') || n.includes('self-drive')) return 'directions_car';
  if (n.includes('hotel')) return 'hotel';
  if (n.includes('resort')) return 'beach_access';
  if (n.includes('villa') || n.includes('homestay')) return 'holiday_village';
  if (n.includes('hostel')) return 'bed';
  if (n.includes('camping')) return 'deck';
  if (n.includes('cinema') || n.includes('movie')) return 'movie';
  if (n.includes('theatre')) return 'theater_comedy';
  if (n.includes('concert')) return 'music_note';
  if (n.includes('event') || n.includes('festival')) return 'festival';
  if (n.includes('exhibition')) return 'museum';
  if (n.includes('workshop')) return 'palette';
  if (n.includes('gaming')) return 'sports_esports';
  if (n.includes('football') || n.includes('turf')) return 'sports_soccer';
  if (n.includes('cricket')) return 'sports_cricket';
  if (n.includes('badminton')) return 'sports_tennis';
  if (n.includes('tennis')) return 'sports_tennis';
  if (n.includes('basketball')) return 'sports_basketball';
  if (n.includes('swimming')) return 'pool';
  if (n.includes('play arena')) return 'toys';
  if (n.includes('restaurant') || n.includes('dining')) return 'restaurant';
  if (n.includes('salon') || n.includes('spa')) return 'spa';
  if (n.includes('gym') || n.includes('yoga')) return 'fitness_center';
  if (n.includes('doctor')) return 'medical_services';
  if (n.includes('electrician')) return 'electrical_services';
  if (n.includes('plumber')) return 'plumbing';
  if (n.includes('cleaning')) return 'cleaning_services';
  if (n.includes('technician')) return 'build';
  if (n.includes('studio') && !n.includes('podcast')) return 'camera_alt';
  if (n.includes('co-working') || n.includes('coworking')) return 'laptop_mac';
  if (n.includes('meeting')) return 'meeting_room';
  if (n.includes('podcast')) return 'mic';
  if (n.includes('conference')) return 'groups';
  if (n.includes('training')) return 'model_training';
  if (n.includes('darshan') || n.includes('temple')) return 'temple_hindu';
  if (n.includes('pooja')) return 'self_improvement';
  if (n.includes('pilgrimage')) return 'directions_walk';
  if (n.includes('cycle')) return 'directions_bike';
  if (n.includes('camera')) return 'photo_camera';
  if (n.includes('sound')) return 'speaker';
  if (n.includes('equipment')) return 'construction';
  if (n.includes('pet')) return 'pets';
  if (n.includes('babysitting')) return 'child_care';
  if (n.includes('elder')) return 'elderly';
  if (n.includes('organizer')) return 'event';
  return 'category';
}

function getServicePrice(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bus')) return 'From ₹450';
  if (n.includes('train')) return 'From ₹120';
  if (n.includes('flight')) return 'From ₹3,500';
  if (n.includes('ferry')) return 'From ₹250';
  if (n.includes('shuttle')) return 'From ₹60';
  if (n.includes('helicopter')) return 'From ₹15,000';
  if (n.includes('cab') || n.includes('taxi')) return 'From ₹12/km';
  if (n.includes('bike')) return 'From ₹30/hr';
  if (n.includes('car rental')) return 'From ₹1,200/day';
  if (n.includes('hotel')) return 'From ₹1,500/night';
  if (n.includes('resort')) return 'From ₹4,500/night';
  if (n.includes('villa')) return 'From ₹8,000/night';
  if (n.includes('hostel')) return 'From ₹400/night';
  if (n.includes('camping')) return 'From ₹1,800/night';
  if (n.includes('cinema') || n.includes('movie')) return 'From ₹150';
  if (n.includes('theatre')) return 'From ₹300';
  if (n.includes('concert')) return 'From ₹999';
  if (n.includes('event') || n.includes('festival')) return 'From ₹499';
  if (n.includes('exhibition')) return 'From ₹100';
  if (n.includes('workshop')) return 'From ₹500';
  if (n.includes('gaming')) return 'From ₹150/hr';
  if (n.includes('turf')) return 'From ₹800/hr';
  if (n.includes('cricket')) return 'From ₹1,000/hr';
  if (n.includes('badminton')) return 'From ₹250/hr';
  if (n.includes('tennis')) return 'From ₹400/hr';
  if (n.includes('basketball')) return 'From ₹350/hr';
  if (n.includes('swimming')) return 'From ₹150/slot';
  if (n.includes('play arena')) return 'From ₹300/entry';
  if (n.includes('dining') || n.includes('restaurant')) return 'Free Reservation';
  if (n.includes('salon') || n.includes('spa')) return 'From ₹299';
  if (n.includes('gym') || n.includes('yoga')) return 'From ₹150/session';
  if (n.includes('doctor')) return 'From ₹400/visit';
  if (n.includes('electrician') || n.includes('plumber') || n.includes('cleaning') || n.includes('technician')) return 'From ₹199';
  if (n.includes('studio') || n.includes('podcast')) return 'From ₹500/hr';
  if (n.includes('coworking') || n.includes('co-working')) return 'From ₹200/day';
  if (n.includes('meeting')) return 'From ₹400/hr';
  if (n.includes('conference')) return 'From ₹5,000/day';
  if (n.includes('darshan')) return 'From ₹300';
  if (n.includes('pooja')) return 'From ₹150';
  if (n.includes('pilgrimage')) return 'From ₹2,500';
  if (n.includes('rental')) return 'From ₹99/day';
  return 'From ₹299';
}

interface CategoryTheme {
  border: string;
  glow: string;
  badge: string;
  text: string;
  gradient: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'Travel': {
    border: 'group-hover:border-sky-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    text: 'group-hover:text-sky-400',
    gradient: 'from-sky-500/20 to-transparent'
  },
  'Stay & Accomodation': {
    border: 'group-hover:border-amber-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    text: 'group-hover:text-amber-400',
    gradient: 'from-amber-500/20 to-transparent'
  },
  'Entertainment': {
    border: 'group-hover:border-fuchsia-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(217,70,239,0.25)]',
    badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    text: 'group-hover:text-fuchsia-400',
    gradient: 'from-fuchsia-500/20 to-transparent'
  },
  'Sports': {
    border: 'group-hover:border-emerald-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    text: 'group-hover:text-emerald-400',
    gradient: 'from-emerald-500/20 to-transparent'
  },
  'Lifestyle Services': {
    border: 'group-hover:border-rose-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    text: 'group-hover:text-rose-400',
    gradient: 'from-rose-500/20 to-transparent'
  },
  'Business': {
    border: 'group-hover:border-cyan-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    text: 'group-hover:text-cyan-400',
    gradient: 'from-cyan-500/20 to-transparent'
  },
  'Religious Services': {
    border: 'group-hover:border-orange-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    text: 'group-hover:text-orange-400',
    gradient: 'from-orange-500/20 to-transparent'
  },
  'Equipment Rentals': {
    border: 'group-hover:border-lime-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(132,204,22,0.25)]',
    badge: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    text: 'group-hover:text-lime-400',
    gradient: 'from-lime-500/20 to-transparent'
  },
  'Personal Services': {
    border: 'group-hover:border-indigo-500/40',
    glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    text: 'group-hover:text-indigo-400',
    gradient: 'from-indigo-500/20 to-transparent'
  }
};


function getServiceSubtitle(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bus')) return 'State & private bus routes';
  if (n.includes('train')) return 'Express & passenger schedules';
  if (n.includes('flight')) return 'Domestic & international routes';
  if (n.includes('ferry') || n.includes('boat')) return 'Scenic waterways & cruises';
  if (n.includes('shuttle')) return 'Convenient local route shuttles';
  if (n.includes('helicopter')) return 'Fast luxury charter travel';
  if (n.includes('cab') || n.includes('taxi')) return 'On-demand cabs & drivers';
  if (n.includes('bike')) return 'Hourly & daily rentals';
  if (n.includes('car rental') || n.includes('self-drive')) return 'Premium self-drive fleets';
  if (n.includes('hotel')) return 'Boutique & premium rooms';
  if (n.includes('resort')) return 'Beachfront & hill getaways';
  if (n.includes('villa') || n.includes('homestay')) return 'Private luxury villas';
  if (n.includes('hostel')) return 'Backpacker & social stays';
  if (n.includes('camping')) return 'Outdoor luxury glamping';
  if (n.includes('cinema') || n.includes('movie')) return 'Blockbuster movie tickets';
  if (n.includes('theatre')) return 'Live drama & music plays';
  if (n.includes('concert')) return 'Major local & global bands';
  if (n.includes('events & festival') || n.includes('festival')) return 'Art exhibitions & carnivals';
  if (n.includes('exhibition')) return 'Museum & gallery shows';
  if (n.includes('workshop') || n.includes('class')) return 'Skill & creative learning';
  if (n.includes('gaming')) return 'Console & PC slots';
  if (n.includes('football') || n.includes('turf')) return 'Fifa-grade synthetic turfs';
  if (n.includes('cricket')) return 'Nets & pitch bookings';
  if (n.includes('badminton')) return 'Indoor synthetic courts';
  if (n.includes('tennis')) return 'Clay & hard court slots';
  if (n.includes('basketball')) return 'Standard indoor courts';
  if (n.includes('swimming')) return 'Olympic-sized public pools';
  if (n.includes('play arena') || n.includes('indoor play')) return 'Climbing & adventure park';
  if (n.includes('restaurant') || n.includes('dining')) return 'Table reservation & menus';
  if (n.includes('salon') || n.includes('spa')) return 'Styling, massage & therapies';
  if (n.includes('gym') || n.includes('yoga')) return 'Fitness trainers & studio';
  if (n.includes('doctor')) return 'Consult general & specialists';
  if (n.includes('electrician')) return 'House wiring & repairs';
  if (n.includes('plumber')) return 'Leak fixes & installations';
  if (n.includes('cleaning')) return 'Deep home cleaning services';
  if (n.includes('technician')) return 'AC & appliance maintenance';
  if (n.includes('studio') && !n.includes('podcast')) return 'Photoshoot & video spaces';
  if (n.includes('co-working') || n.includes('coworking')) return 'Hot desks & dedicated cabins';
  if (n.includes('meeting')) return 'Smart screens & whiteboard';
  if (n.includes('podcast')) return 'Pro microphones & soundboard';
  if (n.includes('conference')) return 'Seminars & business events';
  if (n.includes('training')) return 'Classrooms & workshops';
  if (n.includes('darshan')) return 'Fast-track temple entry';
  if (n.includes('pooja')) return 'Traditional archana rituals';
  if (n.includes('pilgrimage')) return 'Guided religious journeys';
  if (n.includes('cycle')) return 'Eco gear & cycles';
  if (n.includes('camera')) return 'DSL & mirrorless gear';
  if (n.includes('sound')) return 'DJ speakers & mics';
  if (n.includes('equipment')) return 'Catering & seating rental';
  if (n.includes('pet')) return 'Baths, clips & nail trims';
  if (n.includes('babysitting')) return 'Trusted child care services';
  if (n.includes('elder')) return 'Assisted care & companions';
  if (n.includes('organizer')) return 'Parties, birthdays & weddings';
  return 'Reserve slots instantly';
}

export default function CategoriesPage() {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <main className="page-content px-4 md:px-8 lg:pr-8 pt-[100px] md:pt-[132px]">
        <div className="mx-auto max-w-7xl">

        {/* Category Tabs Switcher (Sticky Row) */}
        <div className="sticky top-[42px] md:top-[48px] z-30 border-b border-[color:var(--color-outline-variant)]/20 py-3 mb-8 -mx-4 px-4 md:-mx-8 md:px-8 overflow-x-auto flex gap-2.5 scrollbar-none scroll-smooth">
          {SERVICE_GROUPS.map((group) => {
            const id = group.title.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={group.title}
                onClick={() => scrollToSection(id)}
                className="px-4 py-2.5 rounded-full text-[11.5px] font-bold bg-[color:var(--color-surface-container)]/40 border border-[color:var(--color-outline-variant)]/20 text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] hover:border-[color:var(--color-primary)]/30 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm backdrop-blur-md"
              >
                <span className="text-sm shrink-0">{GROUP_EMOJIS[group.title] || '📍'}</span>
                <span className="whitespace-nowrap">{group.title}</span>
              </button>
            );
          })}
        </div>

        {/* Categories Section Feed */}
        <div className="space-y-12">
          {SERVICE_GROUPS.map((group) => {
            const id = group.title.toLowerCase().replace(/\s+/g, '-');
            return (
              <section
                key={group.title}
                id={id}
                className="scroll-mt-36 text-left animate-fade-up border-b border-[color:var(--color-outline-variant)]/20 pb-12 mb-12 last:border-0"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4.5 mb-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] shadow-md">
                    <span className="material-symbols-outlined text-[26px]">{group.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-[20px] md:text-[22px] font-black text-[color:var(--color-on-surface)] tracking-tight">
                      {group.title}
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-[color:var(--color-on-surface-variant)]">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Subcategories & Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.subcategories.map((subcat) => (
                    <div key={subcat.name} className="bg-[color:var(--color-surface-container)] rounded-3xl p-5 shadow-sm border border-[color:var(--color-outline-variant)]/20 flex flex-col">
                      <h3 className="text-[14px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight mb-4">
                        {subcat.name}
                      </h3>
                      
                      {/* Horizontal Scroll of Service Cards */}
                      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 items-start">
                        {subcat.items.map((item) => {
                          const serviceHref = getHrefForCategoryItem(group.title, item.name);
                          return (
                            <Link
                              key={item.name}
                              href={serviceHref}
                              className="shrink-0 w-24 snap-start group flex flex-col items-center"
                            >
                              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1a1a24] shadow-[0_4px_15px_-6px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800 group-hover:shadow-[0_10px_25px_-8px_rgba(0,0,0,0.12)] group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                <img 
                                  src={getServiceImage(item.name)} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                              </div>
                              <h3 className="mt-2.5 text-center font-extrabold text-[11px] leading-tight text-[color:var(--color-on-surface-variant)] group-hover:text-[color:var(--color-primary)] line-clamp-2 px-1 w-full transition-colors duration-200">
                                {item.name}
                              </h3>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        </div>
      </main>
    </>
  );
}
