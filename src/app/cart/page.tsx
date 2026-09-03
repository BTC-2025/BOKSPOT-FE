'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, useBookingFlowStore } from '../../lib/store';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { RECOMMENDED_ITEMS } from '../../lib/homeData';
import { WishlistButton, CartAddButton } from '../../components/home/HomeShared';

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);
  
  const router = useRouter();
  const { addBooking } = useBookingFlowStore();

  const handlePayment = () => {
    // Generate bookings from cart items
    items.forEach(item => {
      addBooking({
        id: `BKG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ref: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        merchantId: 'merchant-id', // default
        merchantName: 'BOKSPOT Merchant',
        serviceId: item.id,
        serviceName: item.title,
        amount: (item.price || 0) * item.quantity,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: '10:00 AM', // Default time
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      });
    });

    clearCart();
    
    // Redirect to user tracks page where bookings are shown
    router.push('/user/bookings');
  };

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const scrollRecommended = (direction: 'left' | 'right') => {
    if (recommendedScrollRef.current) {
      const scrollAmount = 320;
      recommendedScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
                onClick={handlePayment}
                disabled={items.length === 0}
                className="w-full bg-[#0056b3] hover:bg-[#004494] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                Proceed to Payment
                <span className="material-symbols-outlined text-[18px]">payment</span>
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-5 font-medium flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Secure checkout. Easy cancellations.
              </p>
              
            </div>
          </div>
          
        </div>

        {/* Recommended Items Carousel */}
        <div className="mt-16 mb-8 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0A3161] tracking-tight">
                Recommended based on your shopping trends
              </h2>
              <p className="text-sm text-slate-500 mt-1">Inspired by the items in your cart</p>
            </div>
            
            {/* Custom Carousel Controls */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scrollRecommended('left')}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-black transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollRecommended('right')}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-black transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div 
            ref={recommendedScrollRef}
            className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar scroll-smooth snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {RECOMMENDED_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="w-[180px] shrink-0 snap-start group flex flex-col self-stretch"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  {/* Image Section */}
                  <div className="relative h-[200px] w-full shrink-0 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <WishlistButton item={item} />
                    <CartAddButton item={item} />
                    {/* Badge */}
                    {item.badge && (
                      <div className={`absolute top-2 left-2 ${item.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[10px]">sell</span>
                        {item.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex flex-col items-start justify-between mb-1">
                      <h3 className="font-bold text-sm text-slate-800 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex text-yellow-500 shrink-0 mt-1">
                        {[...Array(item.stars || 4)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 mb-3">{item.location}</p>
                    
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-[#20274d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          {item.ratingScore || '4.5'}
                        </div>
                        <div className="text-[10px] text-slate-700 truncate">
                          <span className="font-bold">{item.ratingText || 'Great'}</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-400">{item.usersCount || '50+'}</span>
                        </div>
                      </div>
                      
                      <div className="w-full">
                        <div className="text-[13px] font-extrabold text-slate-800">
                          {item.price || 'View'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
