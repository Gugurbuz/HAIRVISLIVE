
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, FileText, Download, Sparkles, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { LanguageCode } from '../translations';

interface LeadGateProps {
  onComplete: (data: any) => void;
  lang: LanguageCode;
  variant?: 'pre-analysis' | 'post-analysis';
}

const LeadCaptureModal: React.FC<LeadGateProps> = ({ onComplete, lang }) => {
  const [selectedTier, setSelectedTier] = useState<'standard' | 'premium'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRTL = lang === 'AR';

  const handleAction = (provider: 'google' | 'apple') => {
    setIsSubmitting(true);
    
    // Simulate Login / Handoff
    setTimeout(() => {
        const mockUserData = {
            fullName: "Guest User",
            email: "guest@example.com",
            phone: "", // No phone needed for report view
            tier: selectedTier
        };
        onComplete(mockUserData);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`w-full max-w-lg bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Loading State */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-black text-[#0E1A2B] uppercase tracking-tight">
                {selectedTier === 'premium' ? 'Preparing secure checkout' : 'Preparing your report'}
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-1">Finalizing your secure private link...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-teal-100">
           <Activity size={12} /> Report Ready
        </div>
        <h2 className="text-3xl font-black text-[#0E1A2B] tracking-tight leading-none mb-3">
            Your Visual Report is Ready
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            We generated a visual estimate from your photos. Choose how you want to access and save it.
        </p>
      </div>

      {/* ACCESS TIERS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          {/* OPTION A: STANDARD (FREE) */}
          <div 
            onClick={() => setSelectedTier('standard')}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier === 'standard' ? 'border-teal-500 bg-teal-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
          >
             <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard</span>
                {selectedTier === 'standard' && <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
             </div>
             <div className="text-2xl font-black text-[#0E1A2B] mb-2">Free</div>
             <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <FileText size={12} className="text-teal-500" /> View report online
                </li>
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <Lock size={12} className="text-teal-500" /> Save to your account
                </li>
             </ul>
          </div>

          {/* OPTION B: PREMIUM (PAID FEATURES) */}
          <div 
            onClick={() => setSelectedTier('premium')}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier === 'premium' ? 'border-[#0E1A2B] bg-[#0E1A2B]/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
          >
             {/* Badge */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0E1A2B] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg">
                 Most Popular
             </div>
             <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0E1A2B]">Premium</span>
                {selectedTier === 'premium' && <div className="w-4 h-4 bg-[#0E1A2B] rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
             </div>
             <div className="text-2xl font-black text-[#0E1A2B] mb-2">$9<span className="text-sm text-slate-400">.99</span></div>
             <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <Download size={12} className="text-[#0E1A2B]" /> PDF export
                </li>
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <Sparkles size={12} className="text-[#0E1A2B]" /> HD visual simulation
                </li>
             </ul>
          </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="space-y-3">
         <button 
            onClick={() => handleAction('google')}
            className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 ${
                selectedTier === 'premium' 
                ? 'bg-[#0E1A2B] text-white hover:bg-slate-800' 
                : 'bg-[#0E1A2B] text-white hover:bg-slate-800'
            }`}
         >
            {selectedTier === 'premium' ? (
                <>Continue <ArrowRight size={14} /></>
            ) : (
                <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    View my report
                </>
            )}
         </button>
         
         <div className="flex flex-col items-center justify-center gap-1 mt-4 text-slate-400">
            <div className="flex items-center gap-2">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    Private by default. You control sharing.
                </span>
            </div>
            <span className="text-[9px] font-medium text-slate-300">Sharing is always optional.</span>
         </div>
      </div>

    </motion.div>
  );
};

export default LeadCaptureModal;
