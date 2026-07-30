'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, Car, Film, Bed, Compass, Heart, Award
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/', label: 'For You', icon: Sparkles },
  { href: '/transportation', label: 'Transportation', icon: Car },
  { href: '/accomodation', label: 'Accomodation & Stays', icon: Bed },
  { href: '/entertainment', label: 'Entertainment', icon: Film },
  { href: '/activities', label: 'Activities', icon: Compass },
  { href: '/wellness', label: 'Wellness', icon: Heart },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-desktop h-screen w-72 fixed left-0 top-0 glass flex flex-col gap-2 p-6 z-40 overflow-y-auto">
      {/* Section label */}
      <div className="mb-4 px-2">
        <h3 className="label-upper text-[var(--on-surface-variant)]">Categories</h3>
      </div>

      {/* Nav links */}
      <nav className="space-y-1 flex-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Vendor login & Elite badge */}
      <div className="pt-6 border-t border-[color:var(--color-outline-variant)]/30 space-y-4">
        <Link
          href="http://localhost:3600"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/5 text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 text-xs font-bold tracking-wide uppercase transition-all text-center justify-center cursor-pointer"
        >
          Vendor Console
        </Link>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[color:var(--color-primary)]/10 flex items-center justify-center text-[color:var(--color-primary)]">
            <Award size={20} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-[color:var(--color-on-surface)]">Travel Elite</p>
            <p className="text-[10px] text-[color:var(--color-primary)] uppercase tracking-[0.2em] font-bold">Gold Status</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
