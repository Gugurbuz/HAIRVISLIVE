
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Phone, Lock, CheckCircle2, X } from 'lucide-react';

interface QuoteConsentModalProps {
  onComplete: (data: { consent: boolean; kvkk: boolean }) => void;
  onSkip: () => void;
  isOpen: boolean;
}

const QuoteConsentModal: React.FC<QuoteConsentModalProps> = ({ onComplete, onSkip, isOpen }) => {
  const [consent, setConsent] = useState(false);
  const [kvkk, setKvkk] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (consent && kvkk) {
      onComplete({ consent, kvkk });
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

            <h2 className="text-2xl font-black text-[#0E1A2B] mb-2">Gizlilik ve Onaylar</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Analizinizi kaydetmek ve paylaşmak için lütfen aşağıdaki onayları verin.
            </p>
        </div>

        <div className="px-8 pb-8 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 hover:border-teal-200 transition-all">
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${kvkk ? 'bg-teal-500 border-teal-500' : 'bg-white border-slate-300'}`}>
                    {kvkk && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={kvkk} onChange={() => setKvkk(!kvkk)} />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#0E1A2B]">KVKK Aydınlatma Metni:</strong> Kişisel verilerinizin işlenmesine ilişkin aydınlatma metnini okudum ve anladım.
                </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 hover:border-teal-200 transition-all">
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consent ? 'bg-teal-500 border-teal-500' : 'bg-white border-slate-300'}`}>
                    {consent && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={consent} onChange={() => setConsent(!consent)} />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#0E1A2B]">Açık Rıza:</strong> Analiz sonuçlarımın seçilmiş klinik ortaklarla paylaşılmasına ve fiyat teklifleri almak için kullanılmasına onay veriyorum.
                </span>
            </label>

            <button
                onClick={handleSubmit}
                disabled={!consent || !kvkk}
                className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
                Devam Et
            </button>

            <button onClick={onSkip} className="w-full mt-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
              Şimdilik atla
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuoteConsentModal;
