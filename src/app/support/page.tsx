'use client';

import { useState, useEffect } from 'react';
import { Shield, Building2, Ticket, CheckCircle2, Search, ArrowLeft, Send } from 'lucide-react';
import { useBookingFlowStore } from '../../lib/store';
import Link from 'next/link';

export default function SupportPage() {
  const { merchants, addUserTicket, userTickets, fetchTickets } = useBookingFlowStore();
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const [targetType, setTargetType] = useState<'ADMIN' | 'BUSINESS'>('ADMIN');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (targetType === 'BUSINESS' && !selectedMerchantId) {
      alert('Please select a business to send the complaint to.');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const merchant = merchants.find(m => m.id === selectedMerchantId);

    addUserTicket({
      targetType,
      merchantId: targetType === 'BUSINESS' ? selectedMerchantId : undefined,
      merchantName: targetType === 'BUSINESS' ? merchant?.name : undefined,
      subject,
      message,
    });

    setIsSubmitted(true);
    setSubject('');
    setMessage('');
    setSelectedMerchantId('');
    
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-bold mb-4">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight">Support & Complaints</h1>
            <p className="text-text-secondary text-lg mt-2 font-medium">We're here to help. Reach out to BOKSPOT Admin or directly to a Business.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-brand rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden backdrop-blur-md">
              
              {/* Target Selection Toggle */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-text-primary mb-3">Who do you want to contact?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTargetType('ADMIN')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      targetType === 'ADMIN' 
                        ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                        : 'border-border-brand bg-bg-primary text-text-secondary hover:border-primary/50 hover:bg-white/5'
                    }`}
                  >
                    <Shield size={24} />
                    <span className="font-bold text-sm">BOKSPOT Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('BUSINESS')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      targetType === 'BUSINESS' 
                        ? 'border-secondary bg-secondary/10 text-secondary shadow-sm' 
                        : 'border-border-brand bg-bg-primary text-text-secondary hover:border-secondary/50 hover:bg-white/5'
                    }`}
                  >
                    <Building2 size={24} />
                    <span className="font-bold text-sm">A Business</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                
                {targetType === 'BUSINESS' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-bold text-text-primary">Select Business</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 pointer-events-none" />
                      <select 
                        value={selectedMerchantId}
                        onChange={(e) => setSelectedMerchantId(e.target.value)}
                        className="w-full bg-bg-primary border border-border-brand text-text-primary text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary transition-colors appearance-none cursor-pointer font-medium"
                      >
                        <option value="" disabled>Choose a business...</option>
                        {merchants.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Briefly summarize the issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-bg-primary border border-border-brand text-text-primary text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary">Message Details</label>
                  <textarea 
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full bg-bg-primary border border-border-brand text-text-primary text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors resize-none font-medium"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
                >
                  <Send size={20} />
                  Submit Ticket
                </button>

              </div>
            </form>
            
            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-slide-up">
                <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-text-primary mb-2">Ticket Submitted!</h3>
                <p className="text-text-secondary text-sm font-medium">Your complaint has been successfully registered. We will look into it shortly.</p>
              </div>
            )}
          </div>

          {/* Recent Tickets Sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-bg-secondary border border-border-brand rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-brand/50">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Ticket size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-primary">Recent Tickets</h2>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">Your Support History</p>
                </div>
              </div>

              {userTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted font-medium text-sm">No recent tickets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="p-4 bg-bg-primary rounded-2xl border border-border-brand flex flex-col gap-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted">{ticket.id}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                          ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          ticket.status === 'PENDING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-text-primary line-clamp-1">{ticket.subject}</h4>
                      <p className="text-xs font-medium text-text-secondary flex items-center gap-1">
                        To: {ticket.targetType === 'ADMIN' ? <span className="text-primary font-bold">Admin</span> : <span className="text-secondary font-bold">{ticket.merchantName}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
