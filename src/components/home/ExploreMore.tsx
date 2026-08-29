'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { EXPLORE_SECTIONS } from '../../lib/homeData';
import { motion } from 'framer-motion';
import { WishlistButton, CartAddButton } from './HomeShared';

export function ExploreMore() {
  const [activeExploreSection, setActiveExploreSection] = useState('news');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Unified Explore More Section (Tabs based on screenshot) */}
      <section className="mb-10 text-left">
        <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight mb-4">
          Explore More Options
        </h2>
        <div className="flex flex-col-reverse md:flex-row bg-[color:var(--color-surface-container)] rounded-2xl overflow-hidden border border-[color:var(--color-outline-variant)]/20 shadow-sm min-h-[260px]">
          
          {/* Left Content Area (Vertical Scroll Grid) */}
          <div className="flex-1 px-4 pt-1 pb-4 md:px-6 md:pt-2 md:pb-6 overflow-y-auto max-h-[260px] custom-scrollbar bg-slate-50/50 dark:bg-black/20">
            {(() => {
              const activeSec = EXPLORE_SECTIONS.find(s => s.id === activeExploreSection);
              if (!activeSec) return null;
              
              const getImageForTitle = (title: string) => {
                const t = title.toLowerCase();
                if (t.includes('metro') || t.includes('rail')) return 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=500&auto=format&fit=crop&q=60';
                if (t.includes('yoga') || t.includes('zenfit')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60';
                if (t.includes('monsoon') || t.includes('safety')) return 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60';
                if (t.includes('temple') || t.includes('darshan')) return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=60';
                if (t.includes('dental')) return 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=60';
                if (t.includes('style') || t.includes('spa') || t.includes('salon')) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=60';
                if (t.includes('palace') || t.includes('stay') || t.includes('hotel')) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60';
                if (t.includes('turf') || t.includes('sports')) return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60';
                return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=60';
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  {activeSec.items.map((item) => (
                    <Link href={item.link || '#'} key={item.id} className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-[color:var(--color-outline-variant)]/40 shadow-sm hover:shadow-md transition-shadow flex flex-row h-[200px] group">
                      {/* Top Image */}
                      <div className="relative w-1/2 shrink-0 h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img src={item.image || getImageForTitle(item.title)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <WishlistButton item={item} />
                        <CartAddButton item={item} />
                        {item.tag && (
                          <div className="absolute top-2 left-2 bg-[#b548ff] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">sell</span>
                            {item.tag}
                          </div>
                        )}
                      </div>
                      
                      {/* Bottom Content */}
                      <div className="p-3 flex flex-col flex-1 justify-between">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-extrabold text-[13px] text-[color:var(--color-on-surface)] truncate pr-1">{item.title}</h3>
                          <div className="flex items-center text-yellow-500 shrink-0">
                            {[...Array(item.stars || 4)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                          </div>
                        </div>
                        
                        <p className="text-[10px] text-[color:var(--color-outline)] mb-3 line-clamp-1">
                          {item.subtitle || item.location}
                        </p>
                        
                        <div className="mt-auto flex justify-between items-end">
                          <div className="flex items-center gap-1.5">
                            <div className="bg-[#1f2937] dark:bg-white text-white dark:text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                              {item.rating || '4.5'}
                            </div>
                            <span className="text-[9px] font-bold text-[color:var(--color-on-surface)]">
                              Great <span className="text-[color:var(--color-outline)] font-normal mx-0.5">•</span> <span className="text-[color:var(--color-outline)] font-normal">50+</span>
                            </span>
                          </div>
                          {item.price ? (
                            <div className="font-extrabold text-[13px] text-[color:var(--color-on-surface)]">
                              {item.price}
                            </div>
                          ) : (
                            <div className="text-[11px] font-extrabold text-[color:var(--color-primary)]">
                              View
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Right Sidebar (Nav Links) */}
          <div className="w-full md:w-[260px] shrink-0 border-b md:border-b-0 md:border-l border-[color:var(--color-outline-variant)]/20 bg-white/10 dark:bg-black/10 flex flex-col pt-2">
            
            <div className="flex flex-col">
              {EXPLORE_SECTIONS.filter(s => s.id !== 'trending' && s.id !== 'events').map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveExploreSection(sec.id)}
                  className={`text-left px-5 py-4 text-[13px] font-semibold transition-all border-l-[3px] border-b border-b-[color:var(--color-outline-variant)]/10 last:border-b-0 ${
                    activeExploreSection === sec.id 
                      ? 'border-l-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white dark:bg-[color:var(--color-primary)] dark:text-white' 
                      : 'border-l-transparent text-[color:var(--color-on-surface-variant)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>
    </motion.div>
  );
}
