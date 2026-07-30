'use client';

import { useShortcutStore } from '../../store/useShortcutStore';
import { useState, useEffect } from 'react';

export function ActionModalManager() {
  const { activeActionModal, closeActionModal } = useShortcutStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeActionModal) return null;

  const renderModalContent = () => {
    switch (activeActionModal) {
      case 'bus_booking':
        return <BusBookingModal onClose={closeActionModal} />;
      case 'concierge_request':
        return <ConciergeModal onClose={closeActionModal} />;
      case 'nearby_hotels':
        return <NearbyHotelsModal onClose={closeActionModal} />;
      case 'airports_search':
        return <AirportsModal onClose={closeActionModal} />;
      default:
        return (
          <div className="p-8 text-center">
            <h3 className="font-headline-md mb-2">Coming Soon</h3>
            <p className="text-on-surface-variant">This quick action is not yet available.</p>
            <button onClick={closeActionModal} className="mt-6 text-primary hover:underline">Close</button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeActionModal}></div>
      <div className="relative w-full max-w-md bg-surface-container rounded-2xl shadow-2xl border border-outline/10 overflow-hidden">
        {renderModalContent()}
      </div>
    </div>
  );
}

function BusBookingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
        </div>
        <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Searching Routes...</h3>
        <p className="text-on-surface-variant font-body-md mb-6">Our system is fetching the best available executive coaches for your route.</p>
        <button 
          onClick={onClose}
          className="bg-surface-variant text-on-surface px-6 py-3 rounded-lg font-label-md hover:bg-surface-container-highest transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">directions_bus</span>
          </div>
          <h2 className="font-headline-md text-xl text-on-surface">Quick Bus Booking</h2>
        </div>
        <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        <div>
          <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">From (Origin)</label>
          <input 
            required 
            type="text" 
            placeholder="e.g. New York, NY" 
            className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">To (Destination)</label>
          <input 
            required 
            type="text" 
            placeholder="e.g. Washington, DC" 
            className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Date</label>
            <input 
              required 
              type="date" 
              className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Passengers</label>
            <select className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
              <option>1 Passenger</option>
              <option>2 Passengers</option>
              <option>3+ Passengers</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="mt-4 w-full bg-primary text-on-primary py-4 rounded-xl font-label-md hover:bg-primary-fixed-dim transition-colors shadow-lg"
        >
          Search Routes
        </button>
      </form>
    </>
  );
}

function ConciergeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
        </div>
        <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Request Sent</h3>
        <p className="text-on-surface-variant font-body-md mb-6">A concierge specialist will contact you shortly.</p>
        <button onClick={onClose} className="bg-surface-variant text-on-surface px-6 py-3 rounded-lg font-label-md hover:bg-surface-container-highest transition-colors">Close</button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">room_service</span>
          </div>
          <h2 className="font-headline-md text-xl text-on-surface">Concierge Request</h2>
        </div>
        <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        <div>
          <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">How can we help?</label>
          <textarea 
            required 
            rows={4}
            placeholder="Describe your request..." 
            className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md hover:bg-primary-fixed-dim transition-colors shadow-lg">Submit Request</button>
      </form>
    </>
  );
}

function NearbyHotelsModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'loading' | 'results'>('loading');

  useEffect(() => {
    const timer = setTimeout(() => setStep('results'), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">hotel</span>
          </div>
          <h2 className="font-headline-md text-xl text-on-surface">Nearby Hotels</h2>
        </div>
        <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="p-6">
        {step === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-4">progress_activity</span>
            <p className="text-on-surface-variant">Locating top-tier stays near you...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-surface-container-high rounded-xl border border-outline/10 hover:border-primary/30 transition-all cursor-pointer flex justify-between items-center">
              <div>
                <h4 className="font-label-md text-on-surface">The Grand Horizon</h4>
                <p className="text-xs text-on-surface-variant mt-1">0.5 miles away • 5 Star</p>
              </div>
              <span className="text-primary font-bold">$450<span className="text-xs font-normal text-outline">/night</span></span>
            </div>
            <div className="p-4 bg-surface-container-high rounded-xl border border-outline/10 hover:border-primary/30 transition-all cursor-pointer flex justify-between items-center">
              <div>
                <h4 className="font-label-md text-on-surface">Aura Boutique</h4>
                <p className="text-xs text-on-surface-variant mt-1">1.2 miles away • 4.5 Star</p>
              </div>
              <span className="text-primary font-bold">$280<span className="text-xs font-normal text-outline">/night</span></span>
            </div>
            <button className="w-full mt-2 bg-surface-variant text-on-surface py-3 rounded-xl hover:bg-surface-container-highest transition-colors font-label-md">View All Map Results</button>
          </div>
        )}
      </div>
    </>
  );
}

function AirportsModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
        </div>
        <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Searching Flights...</h3>
        <p className="text-on-surface-variant font-body-md mb-6">Scanning schedules for exclusive connections between your requested airports.</p>
        <button onClick={onClose} className="bg-surface-variant text-on-surface px-6 py-3 rounded-lg font-label-md hover:bg-surface-container-highest transition-colors">Close</button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">flight</span>
          </div>
          <h2 className="font-headline-md text-xl text-on-surface">Airports & Flights</h2>
        </div>
        <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        <div className="relative">
          <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Origin Airport (From)</label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">flight_takeoff</span>
            <input required type="text" placeholder="e.g. JFK or New York" className="w-full bg-surface-container-high border border-outline/20 rounded-xl pl-10 pr-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </div>
        <div className="relative">
          <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Destination Airport (To)</label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">flight_land</span>
            <input required type="text" placeholder="e.g. LHR or London" className="w-full bg-surface-container-high border border-outline/20 rounded-xl pl-10 pr-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Departure Date</label>
            <input required type="date" className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:dark]" />
          </div>
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Class</label>
            <select className="w-full bg-surface-container-high border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
              <option>First Class</option>
              <option>Business Class</option>
              <option>Premium Economy</option>
            </select>
          </div>
        </div>
        <button type="submit" className="mt-4 w-full bg-primary text-on-primary py-4 rounded-xl font-label-md hover:bg-primary-fixed-dim transition-colors shadow-lg">Find Connections</button>
      </form>
    </>
  );
}
