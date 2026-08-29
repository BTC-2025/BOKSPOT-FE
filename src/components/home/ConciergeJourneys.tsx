'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { getCombinedConciergePool } from '../../lib/homeData';
import { motion } from 'framer-motion';

export function ConciergeJourneys() {
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);

  useEffect(() => {
    const combinedPool = getCombinedConciergePool();
    const initial = [
      { id: 'uj-1', ...combinedPool[0 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 35 },
      { id: 'uj-2', ...combinedPool[1 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 70 },
      { id: 'uj-3', ...combinedPool[2 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 120 },
      { id: 'uj-4', ...combinedPool[3 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 180 },
      { id: 'uj-5', ...combinedPool[4 % combinedPool.length], status: 'CONFIRMED', secondsLeft: 300 }
    ];
    setActiveJourneys(initial);
  }, []);

  useEffect(() => {
    if (activeJourneys.length === 0) return;
    const timer = setInterval(() => {
      setActiveJourneys(prev => {
        let remaining = prev.map(j => ({ ...j, secondsLeft: j.secondsLeft - 1 }));
        const departed = remaining.filter(j => j.secondsLeft <= 0);
        remaining = remaining.filter(j => j.secondsLeft > 0);

        if (departed.length > 0) {
          const combinedPool = getCombinedConciergePool();
          departed.forEach(() => {
            const randomSource = combinedPool[Math.floor(Math.random() * combinedPool.length)];
            remaining.push({
              id: 'uj-new-' + Math.random().toString(36).substring(7),
              ...randomSource,
              status: 'CONFIRMED',
              secondsLeft: Math.floor(Math.random() * (400 - 180) + 180)
            });
          });
        }
        return remaining.sort((a, b) => a.secondsLeft - b.secondsLeft);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeJourneys.length]);

  const formatSecondsLeft = (seconds: number) => {
    if (seconds <= 0) return 'Departing...';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `Departs in ${m}m ${s}s`;
    }
    return `Departs in ${s}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
                {/* Row 4.5: Upcoming Concierge Journey Section */}
          <section className="mb-10 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-extrabold text-[color:var(--color-on-surface)] tracking-tight">Upcoming Concierge Journeys & Events</h2>
              </div>
              <Link href="/search" className="flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-primary)] hover:gap-1.5 transition-all duration-300">
                View All
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            </div>

            <div className="relative group overflow-hidden w-full">
              <div 
                className="flex gap-10 md:gap-14 overflow-visible pb-4 pt-1 animate-marquee"
              >
                {[...activeJourneys, ...activeJourneys, ...activeJourneys, ...activeJourneys, ...activeJourneys].map((journey, index) => (
                  <Link
                    href="#"
                    key={`${journey.id}-${index}`}
                    className="w-[140px] shrink-0 snap-start group flex flex-col items-center gap-2"
                  >
                    {/* Image Section */}
                    <div className="relative h-[130px] w-[130px] rounded-full overflow-hidden border-2 border-white dark:border-white/20 shadow-md">
                      <img 
                        src={journey.image} 
                        alt={journey.trainName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex flex-col items-center text-center w-full px-1">
                      <h3 className="font-extrabold text-[14px] leading-tight text-[color:var(--color-on-surface)] line-clamp-2 w-full mb-1 min-h-[40px] flex items-center justify-center">
                        {journey.trainName}
                      </h3>
                      
                      {/* Live Timer Badge */}
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        {formatSecondsLeft(journey.secondsLeft)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

    </motion.div>
  );
}
