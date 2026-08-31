'use client';

import { motion } from 'framer-motion';
import { Sparkles, Utensils, MapPin, Building2, Ticket, Waves } from 'lucide-react';

interface BokspotLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function BokspotLoader({ 
  message = "Syncing live booking data...", 
  fullScreen = true 
}: BokspotLoaderProps) {
  
  // Custom orbit animation styles
  const orbitDuration = "8s";

  return (
    <div className={`flex flex-col items-center justify-center bg-[color:var(--color-background)] ${fullScreen ? 'min-h-screen fixed inset-0 z-[99999]' : 'h-full w-full py-16'} backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90`}>
      
      <div className="relative flex items-center justify-center w-28 h-28 mb-4">
        
        {/* The Rotating Outer Ring */}
        <div 
          className="absolute inset-0 rounded-full border border-dashed border-[color:var(--color-primary)]/40 shadow-[0_0_15px_rgba(255,99,37,0.1)]"
          style={{ 
            animation: `spin ${orbitDuration} linear infinite` 
          }}
        >
          
          {/* Orbiting Icons */}
          
          {/* Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 rounded-full p-1.5 shadow-md" style={{ animation: `spin ${orbitDuration} linear infinite reverse` }}>
            <Building2 size={14} className="text-[#0a3161]" />
          </div>
          
          {/* Right */}
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 rounded-full p-1.5 shadow-md" style={{ animation: `spin ${orbitDuration} linear infinite reverse` }}>
            <Utensils size={14} className="text-[#ff6325]" />
          </div>
          
          {/* Bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 rounded-full p-1.5 shadow-md" style={{ animation: `spin ${orbitDuration} linear infinite reverse` }}>
            <Ticket size={14} className="text-purple-500" />
          </div>
          
          {/* Left */}
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-[color:var(--color-surface)] border border-[color:var(--color-outline-variant)]/30 rounded-full p-1.5 shadow-md" style={{ animation: `spin ${orbitDuration} linear infinite reverse` }}>
            <Waves size={14} className="text-cyan-500" />
          </div>

        </div>

        {/* Center Logo */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="flex items-center justify-center bg-white p-2 rounded-xl shadow-xl border border-slate-200">
            <img src="/images/bs-logo.jpg" alt="BokSpot" className="w-10 h-10 object-contain" />
          </div>
        </motion.div>
      </div>

      {/* Loading Message */}
      <div className="text-center mt-4">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
          className="text-[13px] font-black text-[color:var(--color-on-surface-variant)] uppercase tracking-widest"
        >
          {message}
        </motion.p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-[#0a3161] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#ff6325] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#0a3161] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
