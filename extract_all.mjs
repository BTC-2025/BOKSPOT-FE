import fs from 'fs';

const pageFile = 'src/app/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');
const lines = content.split('\n');

// 1. ConciergeJourneys
const cStart = lines.findIndex(l => l.includes('{/* Row 4.5: Upcoming Concierge Journey Section */}'));
const cEnd = lines.findIndex(l => l.includes('<div className="h-px bg-[color:var(--color-outline-variant)]/20 my-8 w-full" />'));

// 2. ExploreMore
const eStart = lines.findIndex(l => l.includes('{/* Unified Explore More Section (Tabs based on screenshot) */}'));
const eEnd = lines.findIndex(l => l.includes('{/* Row 6: Nearby Services */}'));

// 3. NearbyRadar
const rStart = eEnd;
const rEnd = lines.findIndex(l => l.includes('{/* Row 7: Detailed Footer */}'));

if (cStart !== -1 && cEnd !== -1 && eStart !== -1 && eEnd !== -1 && rStart !== -1 && rEnd !== -1) {
  const cJSX = lines.slice(cStart, cEnd).join('\n');
  const eJSX = lines.slice(eStart, eEnd).join('\n');
  const rJSX = lines.slice(rStart, rEnd).join('\n');

  // Create ConciergeJourneys.tsx
  const cCode = `'use client';
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
      return \`Departs in \${m}m \${s}s\`;
    }
    return \`Departs in \${s}s\`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
${cJSX.split('\\n').map(l => '      ' + l).join('\\n')}
    </motion.div>
  );
}
`;
  fs.writeFileSync('src/components/home/ConciergeJourneys.tsx', cCode);

  // Create ExploreMore.tsx
  const eCode = `'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { EXPLORE_SECTIONS } from '../../lib/homeData';
import { motion } from 'framer-motion';

export function ExploreMore() {
  const [activeExploreSection, setActiveExploreSection] = useState('dining');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
${eJSX.split('\\n').map(l => '      ' + l).join('\\n')}
    </motion.div>
  );
}
`;
  fs.writeFileSync('src/components/home/ExploreMore.tsx', eCode);

  // Create NearbyRadar.tsx
  const rCode = `'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Star, ArrowRight } from 'lucide-react';
import { useLocationStore } from '../../lib/store';
import { homepageNearbyServices } from '../../lib/homeData';
import { motion } from 'framer-motion';

const MapComponent = dynamic(() => import('../MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-[color:var(--color-surface-dim)]/50 rounded-2xl border border-[color:var(--color-outline-variant)]/20">
      <div className="text-center">
        <div className="h-6 w-6 border-2 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-[10px] text-[color:var(--color-outline)] font-bold uppercase tracking-wider animate-pulse">Syncing Satellite Feeds...</p>
      </div>
    </div>
  ),
});

export function NearbyRadar() {
  const { city } = useLocationStore();
  const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);

  // Fallback coords
  const mapCenter: [number, number] = [13.0827, 80.2707];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
${rJSX.split('\\n').map(l => '      ' + l).join('\\n')}
    </motion.div>
  );
}
`;
  fs.writeFileSync('src/components/home/NearbyRadar.tsx', rCode);

  // Replace page.tsx
  // 1. Remove states/effects associated with these
  const newLines = [];
  let inSkip = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Add imports at top
    if (line.includes('import { CarouselSections } from')) {
      newLines.push(line);
      newLines.push("import { ConciergeJourneys } from '../components/home/ConciergeJourneys';");
      newLines.push("import { ExploreMore } from '../components/home/ExploreMore';");
      newLines.push("import { NearbyRadar } from '../components/home/NearbyRadar';");
      continue;
    }
    
    // Remove dynamic map import from page.tsx (it's in NearbyRadar now)
    if (line.includes('const MapComponent = dynamic')) {
      inSkip = true;
    }
    if (inSkip && line.includes('});')) {
      inSkip = false;
      continue;
    }
    if (inSkip) continue;

    // Remove states from page.tsx
    if (line.includes('const [activeExploreSection')) continue;
    if (line.includes('const [selectedNearbyService')) continue;
    if (line.includes('const [userPannedCenter')) continue;
    if (line.includes('const mapCenter:')) continue;
    if (line.includes('const [activeJourneys')) continue;
    
    if (line.includes('// Real-time active Concierge Journeys')) {
      // skip effect and format function
      inSkip = true;
      continue;
    }
    if (inSkip && line.includes('return `Departs in ${s}s`;')) {
      // Wait, let's just skip until we find "};\n"
    }
    
    // Replace JSX
    if (i === cStart) {
      newLines.push('          <ConciergeJourneys />');
      i = cEnd - 1; // skip to just before the divider
      continue;
    }
    if (i === eStart) {
      newLines.push('          <ExploreMore />');
      i = eEnd - 1;
      continue;
    }
    if (i === rStart) {
      newLines.push('          <NearbyRadar />');
      i = rEnd - 1;
      continue;
    }
    
    newLines.push(line);
  }
  
  // Cleanup Real-time active Concierge Journeys block
  let finalContent = newLines.join('\\n');
  
  
  fs.writeFileSync(pageFile, finalContent);
  console.log('Success');
} else {
  console.log('Failed to find boundaries', { cStart, cEnd, eStart, eEnd, rStart, rEnd });
}
