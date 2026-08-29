'use client';

import { motion } from 'framer-motion';
import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';

export function ShortcutsDock() {
  const { activeShortcuts, setShortcutModalOpen, openActionModal } = useShortcutStore();

  return (
    <section className="mb-6 mt-6 md:mt-8">
      <div className="flex flex-wrap items-center gap-3">
        {Array.isArray(activeShortcuts) && activeShortcuts.length > 0 ? (
          activeShortcuts.slice(0, 6).map(id => AVAILABLE_SHORTCUTS.find(s => s.id === id)).filter(Boolean).map(shortcut => {
            if (!shortcut) return null;
            const handleAction = () => {
              if (shortcut.actionType === 'modal') {
                openActionModal(shortcut.actionTarget);
              } else {
                window.location.href = shortcut.actionTarget;
              }
            };
            return (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * activeShortcuts.indexOf(shortcut.id) }}
                key={shortcut.id}
                onClick={handleAction}
                className="h-10 px-5 rounded-2xl border border-[color:var(--color-outline-variant)]/20 bg-[color:var(--color-surface-container)]/40 hover:border-[color:var(--color-primary)]/30 hover:bg-[color:var(--color-surface-container-high)]/60 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer text-xs font-extrabold text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-on-surface)] shadow-sm backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-[16px] text-[color:var(--color-primary)]">{shortcut.icon}</span>
                <span>{shortcut.label}</span>
              </motion.button>
            );
          })
        ) : (
          <span className="text-xs text-[color:var(--color-outline)] italic mr-2">No shortcuts added yet.</span>
        )}

        {/* Manage Dock Shortcuts Button */}
        <button
          onClick={() => setShortcutModalOpen(true)}
          className="h-10 px-4 rounded-2xl border border-dashed border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/[0.03] hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 hover:scale-[1.03] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-[color:var(--color-primary)]"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Shortcut</span>
        </button>
      </div>
    </section>
  );
}
