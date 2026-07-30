'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

function getHierarchicalParent(path: string): string | null {
  if (!path || path === '/') return null;
  
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  // Checkout / success -> goes back to Home
  if (cleanPath.startsWith('/booking/')) {
    return '/';
  }
  
  // Service detail page: /service/[id]
  if (cleanPath.startsWith('/service/')) {
    return '/'; // default fallback to home page
  }
  
  const segments = cleanPath.split('/').filter(Boolean);
  
  if (segments.length === 1) {
    // e.g. /travel-transport -> parent is /
    return '/';
  }
  
  if (segments.length === 2) {
    // e.g. /travel-transport/cabs -> parent is /travel-transport
    return `/${segments[0]}`;
  }
  
  if (segments.length === 3) {
    // e.g. /travel-transport/cabs/some-merchant -> parent is /travel-transport/cabs
    return `/${segments[0]}/${segments[1]}`;
  }
  
  return '/';
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lastPathRef = useRef<string>(pathname);
  const [utilityDrawerOpen, setUtilityDrawerOpen] = useState(false);
  const [activeUtilityTab, setActiveUtilityTab] = useState<'calendar' | 'calc' | 'tasks' | 'contacts' | null>(null);

  // We exclude administrative dashboard portals /sales and /superadmin
  const isExcluded = pathname?.startsWith('/sales') || pathname?.startsWith('/superadmin');

  useEffect(() => {
    if (isExcluded) return;

    const handlePopState = (event: PopStateEvent) => {
      const prevPath = lastPathRef.current;
      const nextPath = window.location.pathname;

      const parentPath = getHierarchicalParent(prevPath);
      // If the destination of back/forward navigation is NOT the hierarchical parent,
      // override and programmatically push to the hierarchical parent instead.
      if (parentPath && nextPath !== parentPath) {
        event.preventDefault();
        router.push(parentPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isExcluded, router]);

  useEffect(() => {
    lastPathRef.current = pathname;
  }, [pathname]);

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className={`transition-all duration-300 ${
      utilityDrawerOpen ? (activeUtilityTab ? 'lg:pr-[370px]' : 'lg:pr-[50px]') : ''
    }`}>
      <TopNav 
        utilityDrawerOpen={utilityDrawerOpen}
        setUtilityDrawerOpen={setUtilityDrawerOpen}
        activeUtilityTab={activeUtilityTab}
        setActiveUtilityTab={setActiveUtilityTab}
      />
      {children}
      <BottomNav />
    </div>
  );
}
