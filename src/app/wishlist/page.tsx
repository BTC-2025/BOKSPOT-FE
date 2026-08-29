'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlistStore, useCartStore } from '../../lib/store';

export default function WishlistPage() {
  const items = useWishlistStore(state => state.items);
  const removeItem = useWishlistStore(state => state.removeItem);
  const addItemToCart = useCartStore(state => state.addItem);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleMoveToCart = (item: any) => {
    addItemToCart({
      id: item.id,
      title: item.title,
      price: item.price || 0,
      quantity: 1,
      image: item.image,
      icon: item.icon,
      iconColor: item.iconColor
    });
    removeItem(item.id);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-[104px] pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-1">My Wishlist</h1>
            <p className="text-slate-500 font-medium text-sm">{items.length} items saved</p>
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
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">favorite</span>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Explore Bokspot to find services and experiences you love, and save them here for later.</p>
            <Link href="/" className="inline-flex items-center justify-center bg-[#0056b3] hover:bg-[#004494] text-white font-bold px-6 py-2.5 rounded-full shadow-md transition-all">
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${item.iconColor || 'indigo'}-50 text-${item.iconColor || 'indigo'}-500 flex items-center justify-center overflow-hidden`}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">{item.icon || 'star'}</span>
                      )}
                    </div>
                    {item.tag && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-slate-500 text-xs leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>
                )}
                
                {item.statusTag && (
                  <div className="mb-4 mt-auto">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {item.statusTag}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-end justify-between ${!item.statusTag && !item.description ? 'mt-auto pt-6' : 'mt-auto'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Starting at</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-800">{formatCurrency(item.price || 0)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleMoveToCart(item)} className="bg-[#0056b3] hover:bg-[#004494] text-white font-bold text-sm px-5 py-2 rounded-full shadow-md active:scale-95 transition-all">
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
