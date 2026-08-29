'use client';

import React from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-[104px] pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-1">My Wishlist</h1>
            <p className="text-slate-500 font-medium text-sm">12 items saved</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 shadow-sm cursor-pointer">
              <option>Recently Saved</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Luxury Resort */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            {/* Top Row: Icon, Tag, Trash */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bed</span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Hotel Stay
                </span>
              </div>
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
            
            {/* Title & Desc */}
            <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">Luxury Resort Getaway</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1">
              5-star accommodation with ocean views and premium spa access.
            </p>
            
            {/* Bottom Row: Price & Action */}
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800">₹12500</span>
                  <span className="text-xs text-slate-500 font-medium">/night</span>
                </div>
              </div>
              <button className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm px-5 py-2 rounded-full shadow-md active:scale-95 transition-all">
                Move to Cart
              </button>
            </div>
          </div>

          {/* Card 2: Flight */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">flight</span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Flight
                </span>
              </div>
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">Roundtrip to Bali</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-3">
              Direct flights with premium economy seating and extra baggage allowance.
            </p>
            
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                Available Now
              </span>
            </div>
            
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800">₹35000</span>
                  <span className="text-xs text-slate-500 font-medium">/person</span>
                </div>
              </div>
              <button className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm px-5 py-2 rounded-full shadow-md active:scale-95 transition-all">
                Move to Cart
              </button>
            </div>
          </div>

          {/* Card 3: Wellness */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">spa</span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Wellness
                </span>
              </div>
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">Couples Massage Retreat</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1">
              90-minute full body massage followed by private sauna access.
            </p>
            
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800">₹4500</span>
                  <span className="text-xs text-slate-500 font-medium">/session</span>
                </div>
              </div>
              <button className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm px-5 py-2 rounded-full shadow-md active:scale-95 transition-all">
                Move to Cart
              </button>
            </div>
          </div>

          {/* Card 4: Rental */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">directions_car</span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Rental
                </span>
              </div>
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">Premium SUV Rental</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-3">
              Spacious SUV for weekend getaways, includes unlimited mileage.
            </p>
            
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                Limited Availability
              </span>
            </div>
            
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Starting at</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-800">₹3000</span>
                  <span className="text-xs text-slate-500 font-medium">/day</span>
                </div>
              </div>
              <button className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm px-5 py-2 rounded-full shadow-md active:scale-95 transition-all">
                Move to Cart
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

