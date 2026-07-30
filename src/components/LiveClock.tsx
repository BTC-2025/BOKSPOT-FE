'use client';

import { useState, useEffect } from 'react';

export function LiveClock() {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <span className="font-mono text-xs opacity-50 tracking-wider">LOADING TIME...</span>;
  }

  return (
    <span className="font-mono text-xs font-black text-[color:var(--color-primary)] tracking-widest uppercase">
      {time}
    </span>
  );
}
