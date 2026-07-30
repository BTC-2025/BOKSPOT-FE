'use client';

import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';
import Link from 'next/link';

export function ShortcutDock() {
  const { activeShortcuts, setShortcutModalOpen, openActionModal } = useShortcutStore();
  const active = Array.isArray(activeShortcuts)
    ? activeShortcuts.map(id => AVAILABLE_SHORTCUTS.find(s => s.id === id)).filter(Boolean)
    : [];

  const Card = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl cursor-pointer
                 border border-[color:var(--color-outline-variant)]/30
                 bg-[color:var(--color-surface-container)]
                 hover:border-[color:var(--color-primary)]/30
                 hover:bg-[color:var(--color-surface-container-high)]
                 active:scale-[0.94] transition-all duration-300 group"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
    >
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-3">
      {active.map(shortcut => {
        if (!shortcut) return null;

        const inner = (
          <>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center
                         bg-[color:var(--color-primary)]/10
                         group-hover:bg-[color:var(--color-primary)]/20
                         group-hover:scale-110 transition-all duration-300"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255,215,0,0.08)' }}
            >
              <span
                className="material-symbols-outlined text-[color:var(--color-primary)] text-[21px]"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                {shortcut.icon}
              </span>
            </div>
            <span
              className="text-[11px] font-semibold text-center leading-tight
                         text-[color:var(--color-on-surface-variant)]
                         group-hover:text-[color:var(--color-on-surface)]
                         transition-colors duration-300"
            >
              {shortcut.label}
            </span>
          </>
        );

        return shortcut.actionType === 'modal' ? (
          <Card key={shortcut.id} onClick={() => openActionModal(shortcut.actionTarget)}>
            {inner}
          </Card>
        ) : (
          <Link key={shortcut.id} href={shortcut.actionTarget} className="block">
            <Card>{inner}</Card>
          </Link>
        );
      })}

      {/* Empty filler slots */}
      {Array.from({ length: Math.max(0, 3 - active.length) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="h-[88px] rounded-2xl border border-dashed
                     border-[color:var(--color-outline-variant)]/20
                     bg-[color:var(--color-surface-container-low)]/30"
        />
      ))}

      {/* Manage button */}
      <button
        onClick={() => setShortcutModalOpen(true)}
        title="Add / Manage Shortcuts"
        className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl
                   border border-dashed border-[color:var(--color-outline-variant)]/35
                   bg-[color:var(--color-surface-container-low)]
                   hover:border-[color:var(--color-primary)]/40
                   hover:bg-[color:var(--color-primary)]/5
                   active:scale-[0.94] transition-all duration-300 group"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center
                     bg-[color:var(--color-outline)]/8
                     group-hover:bg-[color:var(--color-primary)]/15
                     transition-all duration-300"
        >
          <span
            className="material-symbols-outlined text-[22px]
                       text-[color:var(--color-outline)]
                       group-hover:text-[color:var(--color-primary)]
                       transition-colors duration-300"
          >
            add
          </span>
        </div>
        <span
          className="text-[11px] font-semibold
                     text-[color:var(--color-outline)]
                     group-hover:text-[color:var(--color-primary)]
                     transition-colors duration-300"
        >
          Manage
        </span>
      </button>
    </div>
  );
}
