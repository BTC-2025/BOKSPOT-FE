'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../lib/store';

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.10; // 10% tax
  const serviceFee = items.length > 0 ? 500 : 0; // Flat ₹500 fee if items exist
  const totalAmount = subtotal + tax + serviceFee;

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (!mounted) return null;

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
            
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">shopping_cart</span>
                <h3 className="text-lg font-bold text-slate-700">Your cart is empty</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4">Looks like you haven't added any services yet.</p>
                <Link href="/" className="text-[#0056b3] font-semibold hover:underline">
                  Browse Services
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/50 hover:shadow-md transition-shadow">
                  
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon / Image */}
                    <div className={`w-14 h-14 shrink-0 rounded-xl bg-${item.iconColor || 'blue'}-50 flex items-center justify-center text-${item.iconColor || 'blue'}-600 overflow-hidden`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[24px]">{item.icon || 'sell'}</span>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-base truncate">{item.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        {item.date && (
                          <>
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            <span>{item.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity & Price & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pl-0 md:pl-4 mt-3 md:mt-0 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="font-bold text-slate-800 text-[15px] md:text-[17px] whitespace-nowrap min-w-[80px] text-right">
                      {formatCurrency((item.price || 0) * item.quantity)}
                    </div>
                    
                    {/* Delete */}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>

                </div>
              ))
            )}

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
                  <span className="text-slate-700 font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Tax (10%)</span>
                  <span className="text-slate-700 font-semibold">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-slate-500 font-medium">Service Fee</span>
                  <span className="text-slate-700 font-semibold">{formatCurrency(serviceFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-slate-100 mb-6">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#0056b3] tracking-tight">{formatCurrency(totalAmount)}</span>
              </div>

              <button 
                disabled={items.length === 0}
                className="w-full bg-[#0056b3] hover:bg-[#004494] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
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
