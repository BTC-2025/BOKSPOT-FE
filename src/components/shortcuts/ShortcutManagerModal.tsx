'use client';

import { useShortcutStore, AVAILABLE_SHORTCUTS } from '../../store/useShortcutStore';
import { useEffect, useState } from 'react';

export function ShortcutManagerModal() {
  const { activeShortcuts, shortcutModalOpen, toggleShortcut, setShortcutModalOpen } = useShortcutStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !shortcutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShortcutModalOpen(false)}></div>
      
      <div className="relative w-full max-w-lg bg-surface-container rounded-2xl shadow-2xl border border-outline/10 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-outline/10 flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Manage Shortcuts</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Select quick actions for your dashboard.</p>
          </div>
          <button 
            onClick={() => setShortcutModalOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-md text-primary uppercase tracking-widest">{Array.isArray(activeShortcuts) ? activeShortcuts.length : 0} / 6 Selected</span>
            {Array.isArray(activeShortcuts) && activeShortcuts.length >= 6 && (
              <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider animate-pulse">Max limit of 6 reached</span>
            )}
          </div>
          
          <div className="space-y-2">
            {AVAILABLE_SHORTCUTS.map(shortcut => {
              const isActive = Array.isArray(activeShortcuts) ? activeShortcuts.includes(shortcut.id) : false;
              const isMaxReached = Array.isArray(activeShortcuts) && activeShortcuts.length >= 6;
              const isDisabled = !isActive && isMaxReached;

              return (
                <div 
                  key={shortcut.id}
                  onClick={() => {
                    if (isDisabled) return;
                    toggleShortcut(shortcut.id);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-primary/10 border-primary text-primary cursor-pointer' 
                      : isDisabled
                        ? 'opacity-40 border-outline/10 bg-surface-container-high cursor-not-allowed'
                        : 'bg-surface-container-high border-outline/10 hover:border-primary/30 hover:bg-surface-variant text-on-surface cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-surface'}`}>
                      <span className="material-symbols-outlined">{shortcut.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-label-md">{shortcut.label}</h4>
                      <p className="text-[12px] opacity-70">
                        {shortcut.actionType === 'modal' ? 'Direct Action' : 'Page Link'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isActive ? (
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined opacity-30">add_circle</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-outline/10 bg-surface-container-low">
          <button 
            onClick={() => setShortcutModalOpen(false)}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md hover:bg-primary-fixed-dim transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
