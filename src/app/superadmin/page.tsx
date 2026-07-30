'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBookingFlowStore } from '../../lib/store';
import {
  ArrowLeft, ArrowRight, Activity, Database, Cpu, Server, TrendingUp, Users, IndianRupee,
  Clock, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, CheckCircle2,
  XCircle, Sliders, Settings, Building2, ChevronRight, ToggleLeft, ToggleRight,
  Calendar
} from 'lucide-react';

interface MerchantRecord {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'SUSPENDED';
  listingsCount: number;
  rating: number;
}

interface ServiceCommissionRowProps {
  svc: any;
  commissionRate: number;
  updateService: (svc: any) => void;
  showToast: (msg: string) => void;
}

function ServiceCommissionRow({ svc, commissionRate, updateService, showToast }: ServiceCommissionRowProps) {
  const hasOverride = svc.customCommissionRate !== undefined;
  const [localInput, setLocalInput] = useState(hasOverride ? String(svc.customCommissionRate) : '');

  // Keep in sync with store changes
  useEffect(() => {
    setLocalInput(hasOverride ? String(svc.customCommissionRate) : '');
  }, [svc.customCommissionRate, hasOverride]);

  return (
    <tr className="hover:bg-white/[0.005] transition-colors">
      <td className="p-4 pl-6 font-extrabold text-white">{svc.name}</td>
      <td className="p-4 text-[color:var(--color-on-surface-variant)] font-semibold">{svc.merchant}</td>
      <td className="p-4">
        <span className="badge badge-primary text-[9px] py-0.5 px-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold">
          {svc.category}
        </span>
      </td>
      <td className="p-4 text-right font-bold text-white">₹{svc.price}</td>
      <td className="p-4 text-center font-medium text-slate-500">{commissionRate}%</td>
      <td className="p-4 text-center">
        <div className="inline-flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            placeholder={String(commissionRate)}
            value={localInput}
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              if (localInput === '') {
                if (hasOverride) {
                  const { customCommissionRate, ...rest } = svc;
                  updateService(rest);
                  showToast(`Reset commission for "${svc.name}" to default.`);
                }
              } else {
                let val = parseFloat(localInput);
                if (!isNaN(val)) {
                  val = Math.max(0, Math.min(100, val));
                  setLocalInput(String(val));
                }
              }
            }}
            onChange={(e) => {
              let rawVal = e.target.value;
              if (rawVal.startsWith('0') && rawVal.length > 1 && rawVal[1] !== '.') {
                rawVal = rawVal.substring(1);
              }
              setLocalInput(rawVal);

              if (rawVal === '') {
                const { customCommissionRate, ...rest } = svc;
                updateService(rest);
                showToast(`Reset commission for "${svc.name}" to default.`);
              } else {
                let val = parseFloat(rawVal);
                if (!isNaN(val)) {
                  val = Math.max(0, Math.min(100, val));
                  updateService({ ...svc, customCommissionRate: val });
                  showToast(`Commission rate for "${svc.name}" set to ${val}%.`);
                }
              }
            }}
            className={`w-12 text-center py-0.5 rounded border text-xs font-bold focus:outline-none focus:border-[color:var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasOverride
                ? 'border-indigo-500/40 bg-indigo-500/5 text-indigo-400 font-extrabold'
                : 'border-white/10 bg-white/[0.02] text-slate-500'
              }`}
          />
          <span className={hasOverride ? 'text-indigo-400 font-bold' : 'text-slate-500 font-semibold'}>%</span>
        </div>
      </td>
      <td className="p-4 pr-6 text-right">
        {hasOverride && (
          <button
            onClick={() => {
              const { customCommissionRate, ...rest } = svc;
              updateService(rest);
              setLocalInput('');
              showToast(`Reset commission for "${svc.name}" to default.`);
            }}
            className="px-2 py-1 rounded border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-[9px] font-bold text-red-400 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </td>
    </tr>
  );
}

export default function SuperAdminPage() {
  const { bookings, cancelBooking, completeBooking, merchants, toggleMerchantStatus, services, commissionRate, setCommissionRate, updateService } = useBookingFlowStore();
  const [mounted, setMounted] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en', options);
    } catch {
      return dateStr;
    }
  };

  const formatBookedAt = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const optionsDate: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      return `${d.toLocaleDateString('en', optionsDate)}, ${d.toLocaleTimeString('en', optionsTime)}`;
    } catch {
      return dateStr;
    }
  };

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Dashboard configuration states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [standardCommInput, setStandardCommInput] = useState('');

  // Local state removed, reading from useBookingFlowStore

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    setMounted(true);
    // Check session storage for existing auth
    const sessionActive = sessionStorage.getItem('superadmin_session');
    if (sessionActive === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    setStandardCommInput(String(commissionRate));
  }, [commissionRate]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-dim)] flex items-center justify-center">
        <div className="text-center text-xs text-[color:var(--color-outline)] animate-pulse">LOADING PLATFORM REGISTRY...</div>
      </div>
    );
  }

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const normUsername = usernameInput.trim().replace(/\s+/g, '').toLowerCase();

    if (normUsername === 'superadmin' && passwordInput === '123') {
      setLoginSuccess('Authentication successful. Initiating Console...');
      sessionStorage.setItem('superadmin_session', 'true');
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 1000);
    } else {
      setLoginError('Invalid security credentials. Access denied.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('superadmin_session');
    setIsLoggedIn(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Toggle Merchant Status Handler
  const handleToggleMerchant = (id: string, name: string, currentStatus: string) => {
    toggleMerchantStatus(id);
    const nextStatus = currentStatus === 'ACTIVE' ? 'suspended' : 'active';
    showToast(`Merchant "${name}" is now ${nextStatus}.`);
  };

  // Global platform financials calculation
  const totalVolume = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.amount, 0);

  const estimatedFees = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => {
      const service = services.find(s => s.id === b.serviceId);
      const effectiveRate = service?.customCommissionRate ?? commissionRate;
      return sum + Math.round(b.amount * (effectiveRate / 100));
    }, 0);

  const filteredBookings = bookings.filter(b => {
    if (selectedStatusTab === 'ALL') return true;
    return b.status === selectedStatusTab;
  });

  const filteredServicesForCommissions = services.filter(svc =>
    svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    svc.merchant.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    svc.category.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  // Login view
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface)] flex flex-col justify-center items-center p-4 relative">
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-outline-variant)_1px,transparent_1px),linear-gradient(90deg,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.02] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-on-surface-variant)] hover:text-[color:var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to marketplace
          </Link>

          <div className="card-glass rounded-3xl p-6 md:p-8 bg-[color:var(--color-surface-container)] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--color-primary), transparent 60%)' }} />

            <div className="text-center mb-8">
              <div className="h-11 w-11 rounded-2xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4 text-[color:var(--color-primary)]">
                <Lock size={20} />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Founder Access Gate</h1>
              <p className="text-[11px] text-[color:var(--color-on-surface-variant)] mt-1">Enter credentials to unlock global platform dashboard.</p>
            </div>

            {loginError && (
              <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="mb-5 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={15} className="shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)] block">Founder Account ID</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. super admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    required
                  />
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)] block">Security Passcode</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all"
                    required
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)] hover:bg-[color:var(--color-primary-fixed-dim)] py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[color:var(--color-primary)]/10 mt-6 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Access System Console <ArrowRight size={13} />
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard view
  return (
    <main className="min-h-screen bg-[color:var(--color-surface-dim)] text-[color:var(--color-on-surface)] pb-16 relative">
      {/* Background decoration grid */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--color-outline-variant)_1px,transparent_1px),linear-gradient(90deg,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.01] pointer-events-none" />

      {/* Animated Success Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#0e1616] px-4 py-3 text-xs font-bold text-emerald-400 shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[color:var(--color-surface)]/80 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-white/[0.04] text-[color:var(--color-on-surface-variant)] hover:text-white rounded-lg transition-colors"
              title="Return to Marketplace"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[color:var(--color-primary)] shrink-0" />
              <h1 className="text-sm font-black tracking-wider flex items-center gap-2 text-white">
                <span>FOUNDER CONSOLE</span>
                <span className="text-[9px] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20 px-2 py-0.5 rounded-full font-bold">
                  SUPER ADMIN
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 hover:border-red-500/20 bg-white/[0.01] hover:bg-red-500/5 px-3 py-1.5 text-[10px] font-bold text-[color:var(--color-on-surface-variant)] hover:text-red-400 transition-all cursor-pointer"
            >
              Lock Terminal
            </button>
          </div>
        </div>
      </nav>

      {/* Content Container */}
      <div className="pt-24 max-w-7xl mx-auto px-6 space-y-8 relative z-10">

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Universal Platform Logs</h2>
          <p className="text-xs text-[color:var(--color-on-surface-variant)] mt-0.5">Founders portal to configure parameters, toggle merchant states, and override live customer bookings.</p>
        </div>

        {/* Top KPIs & Health Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Booking Volume */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">Platform Volume</span>
              <p className="text-xl font-black text-white pt-1">₹{totalVolume.toLocaleString()}</p>
              <p className="text-[9px] text-[color:var(--color-on-surface-variant)]">Sum of confirmed & complete sales</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>

          {/* Platform Commissions */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">Platform Revenue</span>
              <p className="text-xl font-black text-[color:var(--color-primary)] pt-1">₹{estimatedFees.toLocaleString()}</p>
              <p className="text-[9px] text-[color:var(--color-on-surface-variant)]">Revenue from bookings ({commissionRate}% standard)</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[color:var(--color-primary)]/10 border border-[color:var(--color-primary)]/20 flex items-center justify-center text-[color:var(--color-primary)]">
              <IndianRupee size={16} />
            </div>
          </div>

          {/* Active Merchants */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">Total Merchants</span>
              <p className="text-xl font-black text-white pt-1">{merchants.length} Registries</p>
              <p className="text-[9px] text-[color:var(--color-on-surface-variant)]">Active business partners online</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 size={16} />
            </div>
          </div>

          {/* System Health */}
          <div className="card-glass rounded-2xl p-5 bg-[color:var(--color-surface-container)] flex items-center justify-between border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">System Uptime</span>
              <p className="text-xl font-black text-white pt-1">99.98%</p>
              <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Platform Operations Healthy
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity size={16} />
            </div>
          </div>
        </div>

        {/* Main Grid: Server Status & Settings */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Platform Settings Panel */}
          <div className="rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders size={14} className="text-[color:var(--color-primary)]" /> System Configurations
            </h3>

            <div className="space-y-5 pt-2 text-xs">
              {/* Commission Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-[10px] uppercase text-[color:var(--color-on-surface-variant)]">Platform Commission Rate</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={standardCommInput}
                      onBlur={() => {
                        if (standardCommInput === '') {
                          setStandardCommInput(String(commissionRate));
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        let rawVal = e.target.value;
                        if (rawVal.startsWith('0') && rawVal.length > 1 && rawVal[1] !== '.') {
                          rawVal = rawVal.substring(1);
                        }
                        setStandardCommInput(rawVal);

                        let val = parseFloat(rawVal);
                        if (!isNaN(val)) {
                          val = Math.max(0, Math.min(100, val));
                          setCommissionRate(val);
                        }
                      }}
                      className="w-12 text-center py-0.5 rounded border border-white/10 bg-white/[0.02] text-xs text-[color:var(--color-primary)] font-bold focus:outline-none focus:border-[color:var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-white text-xs">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => {
                    setCommissionRate(parseFloat(e.target.value));
                    showToast(`Commission rate set to ${e.target.value}%.`);
                  }}
                  className="w-full accent-[color:var(--color-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-[color:var(--color-on-surface-variant)] font-bold">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="space-y-0.5">
                  <span className="font-bold block">Maintenance Lock</span>
                  <span className="text-[9px] text-[color:var(--color-on-surface-variant)]">Restrict marketplace user checkout</span>
                </div>
                <button
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    showToast(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}.`);
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {maintenanceMode ? (
                    <ToggleRight size={32} className="text-[color:var(--color-primary)]" />
                  ) : (
                    <ToggleLeft size={32} className="text-slate-600" />
                  )}
                </button>
              </div>

              {/* Backup Registry */}
              <div className="border-t border-white/5 pt-4 space-y-2">
                <span className="font-bold block text-[10px] uppercase text-[color:var(--color-on-surface-variant)]">Platform Registries Backup</span>
                <button
                  onClick={() => showToast('Database registry backup compiled and saved.')}
                  className="w-full py-2 rounded-xl border border-white/10 hover:border-[color:var(--color-primary)]/20 bg-white/[0.01] hover:bg-[color:var(--color-primary)]/5 text-xs text-white font-bold tracking-wide uppercase transition-all cursor-pointer"
                >
                  Trigger Registry Dump
                </button>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[color:var(--color-surface-container)] p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
              <Server size={14} className="text-indigo-400" /> Infrastructure Logs
            </h3>

            <div className="grid gap-4 sm:grid-cols-3 pt-2 text-xs">
              <div className="p-4 rounded-xl border border-white/5 bg-[color:var(--color-surface-dim)]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-[color:var(--color-on-surface-variant)]">Postgres DB</span>
                  <Database size={12} className="text-emerald-400" />
                </div>
                <div className="font-extrabold text-white">Connected</div>
                <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium">Pool: 21 Active</span>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-[color:var(--color-surface-dim)]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-[color:var(--color-on-surface-variant)]">Redis Cluster</span>
                  <Cpu size={12} className="text-emerald-400" />
                </div>
                <div className="font-extrabold text-white">Active</div>
                <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium">120k key pings/min</span>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-[color:var(--color-surface-dim)]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-[color:var(--color-on-surface-variant)]">Server Load</span>
                  <Activity size={12} className="text-indigo-400 animate-pulse" />
                </div>
                <div className="font-extrabold text-white">12.4% CPU</div>
                <span className="text-[9px] text-[color:var(--color-on-surface-variant)] font-medium">RAM: 4.8 / 16 GB</span>
              </div>
            </div>

            {/* Simulated server log terminal */}
            <div className="rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-[10px] text-slate-400 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
              <div>[system-init] Initializing local database registries...</div>
              <div>[postgres-pool] Connected to SSL PostgreSQL cluster pool successfully.</div>
              <div>[redis-client] Cached 47 dynamic location tokens.</div>
              {bookings.map(b => (
                <div key={b.id} className="text-indigo-300">
                  [auditor] Ticket {b.ref} mapped: {b.serviceName} at {b.merchantName} ({b.city}) slated for {b.date} @ {b.time} [{b.status}]
                </div>
              ))}
              <div className="text-emerald-400">[server-watch] Portal servers listening on port 3500, 3600, 4500. Dev environment ready.</div>
            </div>
          </div>
        </div>

        {/* Merchants Directory Registry */}
        <div className="card-glass rounded-2xl bg-[color:var(--color-surface-container)] border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Merchant Registries directory</h3>
            <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Founders have security permission to suspend or activate any merchant account listings.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/30 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                  <th className="p-4 pl-6">Merchant Name</th>
                  <th className="p-4">Industry Category</th>
                  <th className="p-4 text-center">Listings Count</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4 text-center">Operating Status</th>
                  <th className="p-4 pr-6 text-right">Founder Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.005] transition-colors">
                    <td className="p-4 pl-6 font-extrabold text-white">{m.name}</td>
                    <td className="p-4 text-[color:var(--color-on-surface-variant)] font-semibold">{m.category}</td>
                    <td className="p-4 text-center font-bold text-white">
                      {services.filter(s => s.merchant.toLowerCase() === m.name.toLowerCase()).length}
                    </td>
                    <td className="p-4 text-center font-bold text-white">{m.rating} ★</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-black ${m.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleToggleMerchant(m.id, m.name, m.status)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${m.status === 'ACTIVE'
                            ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400'
                            : 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-400'
                          }`}
                      >
                        {m.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Commission Overrides */}
        <div className="card-glass rounded-2xl bg-[color:var(--color-surface-container)] border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">Service Commission Overrides</h3>
              <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Customize the commission rate for each service individually. Leave blank or click reset to fallback to the platform default.</p>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Filter services..."
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] pl-3 pr-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[color:var(--color-primary)] transition-all w-48 font-bold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/30 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                  <th className="p-4 pl-6">Service Name</th>
                  <th className="p-4">Merchant</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Standard Rate</th>
                  <th className="p-4 text-center">Custom Override</th>
                  <th className="p-4 pr-6 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                {filteredServicesForCommissions.length > 0 ? (
                  filteredServicesForCommissions.map((svc) => (
                    <ServiceCommissionRow
                      key={svc.id}
                      svc={svc}
                      commissionRate={commissionRate}
                      updateService={updateService}
                      showToast={showToast}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[color:var(--color-on-surface-variant)] italic">
                      No matching services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Booking Auditor Log */}
        <div className="card-glass rounded-2xl bg-[color:var(--color-surface-container)] border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">Live Booking Auditor</h3>
              <p className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">Founders audit trail of all transactions occurring across the platform.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl gap-1 text-[10px] font-bold">
              {(['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedStatusTab(tab)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${selectedStatusTab === tab
                      ? 'bg-[color:var(--color-primary)] text-[color:var(--color-on-primary)]'
                      : 'text-[color:var(--color-on-surface-variant)] hover:text-white'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredBookings.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-[color:var(--color-surface-dim)]/30 text-[9px] uppercase font-bold tracking-wider text-[color:var(--color-on-surface-variant)]">
                    <th className="p-4 pl-6">Reference</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Merchant Target</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4 text-right">Commission Cut</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-right">Auditor Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] text-slate-300">
                  {filteredBookings.map((b) => {
                    const service = services.find(s => s.id === b.serviceId);
                    const effectiveRate = service?.customCommissionRate ?? commissionRate;
                    const isCustom = service?.customCommissionRate !== undefined;
                    const cutVal = Math.round(b.amount * (effectiveRate / 100));
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.005] transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-mono font-bold text-white">{b.ref}</div>
                          {b.bookedAt && (
                            <div className="text-[9px] text-slate-500 mt-1 whitespace-nowrap" title="Transaction Date & Time">
                              Booked: {formatBookedAt(b.bookedAt)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{b.customerName || 'Anonymous Guest'}</div>
                          <div className="text-[10px] text-[color:var(--color-on-surface-variant)] mt-0.5">{b.customerEmail || 'no-email'}</div>
                        </td>
                        <td className="p-4 font-bold text-white">{b.merchantName}</td>
                        <td className="p-4">{b.serviceName}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-white font-semibold whitespace-nowrap">
                            <Calendar size={13} className="text-[color:var(--color-primary)] shrink-0" />
                            <span>{formatDate(b.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[color:var(--color-on-surface-variant)] mt-1 whitespace-nowrap">
                            <Clock size={12} className="text-slate-500 shrink-0" />
                            <span>{b.time}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right font-bold text-white">
                          ₹{cutVal}{' '}
                          <span className={`text-[9px] font-medium ${isCustom ? 'text-indigo-400' : 'text-[color:var(--color-primary)]'}`}>
                            ({effectiveRate}%{isCustom ? ' custom' : ''})
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black ${b.status === 'CONFIRMED'
                              ? 'bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/20'
                              : b.status === 'COMPLETED'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {b.status === 'CONFIRMED' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  cancelBooking(b.id);
                                  showToast(`Booking ${b.ref} on ${b.date} at ${b.time} cancelled & refunded.`);
                                }}
                                className="px-2 py-1 rounded border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-[9.5px] font-bold text-red-400 transition-colors cursor-pointer"
                              >
                                Refund / Cancel
                              </button>
                              <button
                                onClick={() => {
                                  completeBooking(b.id);
                                  showToast(`Booking ${b.ref} on ${b.date} at ${b.time} marked as completed.`);
                                }}
                                className="px-2 py-1 rounded border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-[9.5px] font-bold text-green-400 transition-colors cursor-pointer"
                              >
                                Force Complete
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[color:var(--color-on-surface-variant)] italic font-semibold">Audited Logs Lock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-[color:var(--color-on-surface-variant)] italic">
                No matching transactions in auditor directories.
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
