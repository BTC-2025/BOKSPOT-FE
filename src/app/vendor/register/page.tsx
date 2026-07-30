'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Store, Send, ShieldAlert, Sparkles, Building } from 'lucide-react';
import { useBookingFlowStore } from '../../../lib/store';

const CITIES = [
  'Chennai', 'Bangalore', 'Coimbatore', 'Theni', 'Madurai', 'Mumbai', 'Delhi',
  'Hyderabad', 'Kochi', 'Kolkata', 'Pune'
];

const CATEGORIES = [
  'Salon / Spa Appointment',
  'Gym / Yoga Slot Booking',
  'Restaurant Table Reservation',
  'Hotel Booking',
  'Resort Booking',
  'Homestay / Villa',
  'Cinema / Movie Tickets',
  'Concert Tickets',
  'Events & Festivals',
  'Football Turf',
  'Cricket Ground',
  'Badminton Court',
  'Doctor Appointment',
  'Co-working Space',
  'Meeting Room'
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const { addVendorRequest } = useBookingFlowStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [assignSupervisor, setAssignSupervisor] = useState(false);
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorPhone, setSupervisorPhone] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorAddress, setSupervisorAddress] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !description.trim()) {
      setErrorMsg('Please fill in all the required fields.');
      return;
    }

    if (assignSupervisor) {
      if (!supervisorName.trim() || !supervisorPhone.trim() || !supervisorEmail.trim() || !supervisorAddress.trim()) {
        setErrorMsg('Please fill in all supervisor fields.');
        return;
      }
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      name: name.trim(),
      category,
      email: email.trim(),
      phone: phone.trim(),
      city,
      address: address.trim(),
      description: description.trim(),
      status: 'PENDING' as const,
      submittedAt: new Date().toISOString(),
      assignSupervisor,
      ...(assignSupervisor ? {
        supervisorName: supervisorName.trim(),
        supervisorPhone: supervisorPhone.trim(),
        supervisorEmail: supervisorEmail.trim(),
        supervisorAddress: supervisorAddress.trim(),
      } : {})
    };

    addVendorRequest(newRequest);
    setIsSubmitted(true);
  };

  return (
    <>
      <main className="min-h-screen bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface)] pb-16 relative pt-4">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-outline-variant)_1px,transparent_1px),linear-gradient(90deg,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.02] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Marketplace
          </Link>

          {!isSubmitted ? (
            <div className="card-glass rounded-3xl p-6 md:p-10 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />

              <div className="text-center mb-8">
                <div className="h-12 w-12 rounded-2xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4 text-[color:var(--color-primary)]">
                  <Store size={22} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Become a Partner Vendor</h1>
                <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-1.5 leading-relaxed max-w-md mx-auto">
                  Submit an onboarding request to list your services on Bokspot. Our sales team will verify your business details to complete the setup.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs font-semibold">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Business / Shop Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lavender Spa Center"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Industry / Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[color:var(--color-surface-dim)] px-4 py-3 text-xs text-white outline-none focus:border-[color:var(--color-primary)] transition-all cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[color:var(--color-surface-container)] text-white">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Business Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. contact@lavenderspa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 99887 76655"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Operating City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[color:var(--color-surface-dim)] px-4 py-3 text-xs text-white outline-none focus:border-[color:var(--color-primary)] transition-all cursor-pointer"
                    >
                      {CITIES.map(c => <option key={c} value={c} className="bg-[color:var(--color-surface-container)] text-white">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Business Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shop 42, Green Plaza, Anna Nagar"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Service Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about the services you plan to offer, pricing, facilities, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all resize-none"
                  />
                </div>

                {/* Supervisor Field Toggle */}
                <div className="border-t border-white/10 pt-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={assignSupervisor}
                      onChange={(e) => setAssignSupervisor(e.target.checked)}
                      className="rounded border-white/20 bg-white/[0.02] text-[color:var(--color-primary)] focus:ring-0 focus:ring-offset-0 cursor-pointer h-4 w-4"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Assign Supervisor to this Business</span>
                  </label>
                  <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-1">
                    Toggle this if you want to assign a dedicated supervisor to manage services and bookings.
                  </p>
                </div>

                {assignSupervisor && (
                  <div className="grid gap-5 sm:grid-cols-2 p-5 rounded-2xl bg-white/[0.01] border border-white/5 mt-4">
                    <div className="sm:col-span-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[color:var(--color-primary)] mb-2">Supervisor Contact Details</h3>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Supervisor Name *</label>
                      <input
                        type="text"
                        required={assignSupervisor}
                        placeholder="e.g. Arun Kumar"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Supervisor Phone *</label>
                      <input
                        type="text"
                        required={assignSupervisor}
                        placeholder="e.g. +91 98765 12345"
                        value={supervisorPhone}
                        onChange={(e) => setSupervisorPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Supervisor Personal Email *</label>
                      <input
                        type="email"
                        required={assignSupervisor}
                        placeholder="e.g. arun.kumar@gmail.com"
                        value={supervisorEmail}
                        onChange={(e) => setSupervisorEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[color:var(--color-on-surface-variant)] uppercase tracking-widest">Supervisor Address *</label>
                      <input
                        type="text"
                        required={assignSupervisor}
                        placeholder="e.g. Flat 3B, Sunshine Apartments, Chennai"
                        value={supervisorAddress}
                        onChange={(e) => setSupervisorAddress(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[color:var(--color-primary)]/10 mt-6 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} /> Submit Onboarding Request
                </button>
              </form>
            </div>
          ) : (
            <div className="card-glass rounded-3xl p-6 md:p-10 bg-[color:var(--color-surface-container)] border border-[color:var(--color-outline-variant)]/20 shadow-2xl relative overflow-hidden text-center animate-fade-up">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />

              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <Building size={32} className="animate-pulse" />
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">Request Successfully Submitted!</h2>
              <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-3 leading-relaxed max-w-md mx-auto">
                Thank you for applying to become a partner vendor. Your registration request for <strong className="text-white">"{name}"</strong> has been successfully forwarded to our sales team.
              </p>

              <div className="my-8 p-5 bg-[color:var(--color-surface-dim)]/50 rounded-2xl border border-white/5 max-w-md mx-auto text-left text-xs space-y-2.5 font-medium">
                <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] uppercase font-bold text-[color:var(--color-outline)] tracking-wider">
                  <span>Application Summary</span>
                  <span className="text-emerald-400 font-extrabold">Pending Review</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-on-surface-variant)]">Business Name:</span>
                  <span className="text-white font-bold">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-on-surface-variant)]">Category:</span>
                  <span className="text-white font-bold">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-on-surface-variant)]">Operating City:</span>
                  <span className="text-white font-bold">{city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--color-on-surface-variant)]">Email:</span>
                  <span className="text-white font-bold">{email}</span>
                </div>

                {assignSupervisor && (
                  <>
                    <div className="flex justify-between border-t border-white/5 pt-2 text-[9px] uppercase font-bold text-[color:var(--color-primary)] tracking-wider">
                      <span>Supervisor Assigned</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--color-on-surface-variant)]">Supervisor Name:</span>
                      <span className="text-white font-bold">{supervisorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--color-on-surface-variant)]">Supervisor Email:</span>
                      <span className="text-white font-bold">{supervisorEmail}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-lg"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
