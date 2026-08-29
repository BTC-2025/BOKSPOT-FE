'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_ADS } from '../../lib/homeData';

export function AdBanner() {
  const [adIndex, setAdIndex] = useState(0);

  // Advertisement auto-play rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % MOCK_ADS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="ad-banner-hero"
      data-ad-slot=""
      aria-label="Advertisement"
      className="ad-block mb-4 w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)]"
    >
      <div className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[270px] relative flex items-center justify-center">
        {MOCK_ADS.map((ad, idx) => {
          const isActive = adIndex === idx;

          return (
            <div
              key={ad.id}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'}`}
            >
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover brightness-50"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Ad Content */}
              <div className="absolute inset-0 z-20 p-5 md:p-8 flex flex-col justify-end text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${ad.tagBg}`}>
                    {ad.tag}
                  </span>
                </div>
                <h4 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 tracking-wide leading-tight">
                  {ad.title}
                </h4>
                <p className="text-xs md:text-sm text-slate-200 font-medium max-w-xl mb-4 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                  {ad.desc}
                </p>
                <Link
                  href={ad.href}
                  className="self-start px-5 py-2.5 rounded-full text-[10px] md:text-[11px] font-black tracking-widest bg-[color:var(--color-primary)] text-black hover:scale-105 transition-transform shadow-[0_4px_12px_rgba(212,175,55,0.4)] active:scale-[0.98]"
                >
                  {ad.actionText.toUpperCase()}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator inside Banner */}
      <div className="absolute bottom-4 left-0 w-full flex items-center justify-center gap-2 z-30">
        {MOCK_ADS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setAdIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${adIndex === idx
                ? 'w-5 bg-[color:var(--color-primary)]'
                : 'w-1.5 bg-white/50 hover:bg-white'
              }`}
            aria-label={`Go to ad slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
