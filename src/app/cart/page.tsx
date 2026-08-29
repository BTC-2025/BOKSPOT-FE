'use client';

import React from 'react';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-[104px] pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0A3161] tracking-tight mb-2">Your Cart</h1>
          <p className="text-slate-500 font-medium">Review your selected services before checkout.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Item 1 */}
            <div className="bg-white rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/50 hover:shadow-md transition-shadow">
              {/* Icon */}
              <div className="w-14 h-14 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[24px]">directions_bus</span>
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base truncate">Premium Bus Booking</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  <span>Date: 24 Oct, 2024 | 10:00 AM</span>
                </div>
              </div>
              
              {/* Price & Actions */}
              <div className="flex items-center gap-4 pl-2 md:pl-4">
                <div className="font-bold text-slate-800 text-[15px] md:text-[17px] whitespace-nowrap">
                  $45.00
                </div>
                <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-white rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/50 hover:shadow-md transition-shadow">
              {/* Icon */}
              <div className="w-14 h-14 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[24px]">bed</span>
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base truncate">Luxury Hotel Stay</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  <span>Date: 25 Oct - 27 Oct, 2024</span>
                </div>
              </div>
              
              {/* Price & Actions */}
              <div className="flex items-center gap-4 pl-2 md:pl-4">
                <div className="font-bold text-slate-800 text-[15px] md:text-[17px] whitespace-nowrap">
                  $150.00
                </div>
                <button className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/80 sticky top-[120px]">
              
              <h2 className="text-[17px] font-bold text-slate-800 pb-4 border-b border-slate-100 mb-4">
                Order Summary
              </h2>
              
              <div className="flex flex-col gap-3.5 mb-6">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-700 font-semibold">$195.00</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Tax (10%)</span>
                  <span className="text-slate-700 font-semibold">$19.50</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Service Fee</span>
                  <span className="text-slate-700 font-semibold">$5.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-slate-100 mb-6">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#0056b3] tracking-tight">$219.50</span>
              </div>

              <button className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]">
                Proceed to Checkout
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-5 font-medium flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Secure checkout. Easy cancellations.
              </p>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
