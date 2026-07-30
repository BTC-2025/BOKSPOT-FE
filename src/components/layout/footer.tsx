import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">β</div>
              <span className="text-lg font-bold gradient-text">BETA</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Universal booking platform for appointments, reservations, and more.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/search" className="hover:text-[var(--primary)] transition-colors">Explore</Link></li>
              <li><Link href="/maps" className="hover:text-[var(--primary)] transition-colors">Nearby</Link></li>
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">For Business</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">Terms</Link></li>
              <li><Link href="#" className="hover:text-[var(--primary)] transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} BETA Booking Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
