
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  ScanFace, 
  Move, 
  ArrowRight, 
  User, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { translations, LanguageCode } from '../translations';

interface PreScanScreenProps {
  onStart: () => void;
  onBack: () => void;
  lang: LanguageCode;
}

const PreScanScreen: React.FC<PreScanScreenProps> = ({ onStart, onBack, lang }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[lang].preScan;
  const isRTL = lang === 'AR';

  const handlePermissionsAndStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Warm up TTS Engine
      if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.cancel();
      }

      // 2. Request Camera Permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      // 3. Proceed
      onStart();
    } catch (err) {
      console.error("Permission denied", err);
      setError(t.cameraError);
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F8FA] text-[#0E1A2B] flex flex-col items-center justify-start p-6 pt-32 md:pt-44 overflow-y-auto font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Ambience (Light) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full relative z-10 flex flex-col h-full md:h-auto justify-start md:justify-center pb-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8 space-y-4 shrink-0">
          <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-100 shadow-xl relative">
            <div className="absolute inset-0 bg-teal-500/5 blur-xl rounded-full" />
            <ScanFace size={40} className="text-teal-600 relative z-10" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#0E1A2B]">{t.title}</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            {t.desc}
          </p>
        </motion.div>

        <div className="space-y-3 mb-8 shrink-0">
          <InstructionCard 
            variants={itemVariants}
            icon={Sun}
            title={t.lightingTitle}
            desc={t.lightingDesc}
          />
          <InstructionCard 
            variants={itemVariants}
            icon={User}
            title={t.hairlineTitle}
            desc={t.hairlineDesc}
          />
          <InstructionCard 
            variants={itemVariants}
            icon={Move}
            title={t.movementTitle}
            desc={t.movementDesc}
          />
          <InstructionCard 
            variants={itemVariants}
            icon={CheckCircle2}
            title={t.automationTitle}
            desc={t.automationDesc}
          />
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 shrink-0"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="space-y-4 shrink-0 mt-auto md:mt-0">
          <button 
            onClick={handlePermissionsAndStart}
            disabled={isLoading}
            className="w-full py-5 bg-[#0E1A2B] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                {t.startBtn} <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
              </>
            )}
          </button>
          
          <button 
            onClick={onBack}
            className="w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            {t.cancelBtn}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

const InstructionCard = ({ icon: Icon, title, desc, variants }: any) => (
  <motion.div 
    variants={variants}
    className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all"
  >
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-teal-600 border border-slate-100">
      <Icon size={20} />
    </div>
    <div>
      <h3 className="text-sm font-bold text-[#0E1A2B] mb-0.5">{title}</h3>
      <p className="text-[11px] text-slate-500 font-medium leading-snug">{desc}</p>
    </div>
  </motion.div>
);

export default PreScanScreen;
