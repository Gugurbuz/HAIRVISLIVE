
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Phone, Lock, CheckCircle2, X } from 'lucide-react';

interface QuoteConsentModalProps {
  onComplete: (data: { method: 'email' | 'whatsapp' | 'anonymous', value?: string }) => void;
  onSkip: () => void;
  isOpen: boolean;
}

const QuoteConsentModal: React.FC<QuoteConsentModalProps> = ({ onComplete, onSkip, isOpen }) => {
  const [method, setMethod] = useState<'email' | 'whatsapp' | 'anonymous' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [consent, setConsent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (method === 'anonymous') {
        onComplete({ method: 'anonymous' });
    } else if (method && inputValue && consent) {
        onComplete({ method, value: inputValue });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onSkip}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 pb-6">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                <ShieldCheck size={24} />
            </div>
            
            <h2 className="text-2xl font-black text-[#0E1A2B] mb-2">Unlock Clinical Quotes?</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Share your anonymized visual report with top-rated partner clinics to get precise price estimates.
            </p>
        </div>

        <div className="px-8 space-y-3">
            <button 
                onClick={() => setMethod('anonymous')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${method === 'anonymous' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Lock size={16} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-black uppercase text-[#0E1A2B]">Anonymous Inbox</div>
                        <div className="text-[10px] text-slate-400 font-bold">No contact info shared</div>
                    </div>
                </div>
                {method === 'anonymous' && <CheckCircle2 size={18} className="text-teal-500" />}
            </button>

            <button 
                onClick={() => setMethod('whatsapp')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${method === 'whatsapp' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <Phone size={16} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-black uppercase text-[#0E1A2B]">Notify via WhatsApp</div>
                        <div className="text-[10px] text-slate-400 font-bold">Fastest response</div>
                    </div>
                </div>
                {method === 'whatsapp' && <CheckCircle2 size={18} className="text-teal-500" />}
            </button>

            <button 
                onClick={() => setMethod('email')}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${method === 'email' ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Mail size={16} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-black uppercase text-[#0E1A2B]">Notify via Email</div>
                        <div className="text-[10px] text-slate-400 font-bold">Standard delivery</div>
                    </div>
                </div>
                {method === 'email' && <CheckCircle2 size={18} className="text-teal-500" />}
            </button>
        </div>

        <div className="p-8 bg-slate-50 mt-6 border-t border-slate-100">
            {(method === 'email' || method === 'whatsapp') && (
                <div className="mb-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <input 
                        type={method === 'email' ? 'email' : 'tel'}
                        placeholder={method === 'email' ? 'your@email.com' : '+1 234 567 8900'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 text-sm font-bold text-[#0E1A2B] outline-none focus:border-teal-500 bg-white"
                        autoFocus
                    />
                    <label className="flex items-start gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consent ? 'bg-teal-500 border-teal-500' : 'bg-white border-slate-300'}`}>
                            {consent && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={consent} onChange={() => setConsent(!consent)} />
                        <span className="text-[10px] text-slate-500 leading-tight">
                            I agree to share my report data with selected partner clinics to receive quotes.
                        </span>
                    </label>
                </div>
            )}

            <button 
                onClick={handleSubmit}
                disabled={!method || ((method === 'email' || method === 'whatsapp') && (!inputValue || !consent))}
                className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
                {method === 'anonymous' ? 'Generate Anonymous ID' : 'Get My Quotes'}
            </button>
            
            <button onClick={onSkip} className="w-full mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                No thanks, just view report
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuoteConsentModal;
