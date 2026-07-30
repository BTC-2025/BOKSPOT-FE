'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, HelpCircle, User } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_OPTIONS = [
  { text: '💬 How do I book a service?', action: 'book' },
  { text: '🏢 How to become a partner?', action: 'partner' },
  { text: '🔑 Supervisor login details', action: 'supervisor' },
  { text: '📞 Customer Support Helpline', action: 'support' }
];

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: "Hi there! 👋 Welcome to Bokspot. I'm your interactive assistant. How can I help you book or manage your services today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Alert user with a notification pulse after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response based on keyword/action matches
    setTimeout(() => {
      let botResponseText = "Thanks for reaching out! Our client operations team will review your message. In the meantime, try selecting one of our quick help options above for instant answers!";
      const normalizedText = textToSend.toLowerCase();

      if (normalizedText.includes('book') || normalizedText.includes('service')) {
        botResponseText = "Booking is simple! Just click any category on the Home page, pick your preferred vendor and service, then select an available date/time slot to confirm. You can view all active reservations directly under your Profile tab!";
      } else if (normalizedText.includes('partner') || normalizedText.includes('become a vendor') || normalizedText.includes('register')) {
        botResponseText = "To register, click the 'Become a Vendor' option at the top or bottom of the marketplace. You can fill in your business particulars and even toggle 'Assign Supervisor' to attach a manager account directly during sign-up!";
      } else if (normalizedText.includes('supervisor') || normalizedText.includes('arun') || normalizedText.includes('anderson')) {
        botResponseText = "Supervisor accounts are managed by prepending their Supervisor ID. For example, supervisor Name 'arun' under vendor 'anderson@bnxmail.com' becomes 'arun/anderson@bnxmail.com' for logging in. Try logging in on the Admin Portal!";
      } else if (normalizedText.includes('support') || normalizedText.includes('contact') || normalizedText.includes('phone') || normalizedText.includes('email') || normalizedText.includes('help')) {
        botResponseText = "For customer support or general inquiries, you can contact our helpdesk at support@bokspot.com or call our toll-free customer helpline at 1-800-BOK-SPOT. We are available 24/7!";
      } else if (normalizedText.includes('sales') || normalizedText.includes('superadmin') || normalizedText.includes('founder') || normalizedText.includes('credentials') || normalizedText.includes('password') || normalizedText.includes('login') || normalizedText.includes('admin') || normalizedText.includes('secret')) {
        botResponseText = "For security and privacy, administrative console credentials and internal URLs are strictly confidential. If you are an active partner or supervisor experiencing login issues, please contact your account manager directly.";
      }

      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickOptionClick = (optionText: string) => {
    // Send cleaned text as if user typed it
    const cleanText = optionText.replace(/^[^\w]+/, '').trim();
    handleSendMessage(cleanText);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="w-[340px] h-[450px] rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-gradient-to-r from-indigo-900/40 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Sparkles size={15} />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Bokspot Assistant</h3>
                  <span className="text-[9px] text-emerald-400 font-bold block leading-none">Online Helpdesk</span>
                </div>
              </div>
              <button 
                onClick={handleOpenToggle}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-[11px]">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/5 border border-white/10 text-indigo-400'
                  }`}>
                    {msg.sender === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                  </div>
                  <div className="space-y-0.5">
                    <div className={`p-3 rounded-2xl leading-relaxed font-medium ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`text-[8px] text-slate-500 block ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 max-w-[85%]">
                  <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Sparkles size={10} />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-500 rounded-tl-none flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick Option Pills */}
            {messages.length < 5 && (
              <div className="px-4 py-2 border-t border-white/5 bg-slate-950/50 flex flex-col gap-1.5 text-left shrink-0">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1">
                  <HelpCircle size={10} /> Quick Assist Options:
                </span>
                <div className="flex flex-wrap gap-1">
                  {QUICK_OPTIONS.map(opt => (
                    <button
                      key={opt.action}
                      onClick={() => handleQuickOptionClick(opt.text)}
                      className="px-2 py-1 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-[9px] font-bold text-slate-300 hover:text-white rounded-lg transition-all text-left cursor-pointer"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 border-t border-white/5 bg-slate-900/50 flex gap-2"
            >
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a support query..."
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] focus:bg-white/[0.05] px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-all font-semibold"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg shadow-indigo-950/50"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger Button */}
      <button
        onClick={handleOpenToggle}
        className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-900/50 border border-indigo-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
      >
        <MessageSquare size={20} className={isOpen ? 'hidden' : 'block'} />
        <X size={20} className={isOpen ? 'block' : 'hidden'} />
        
        {/* Pulsing indicator dot */}
        {hasNewMessage && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-slate-950" />
          </span>
        )}
      </button>
    </div>
  );
}
