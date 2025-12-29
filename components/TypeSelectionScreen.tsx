
import React from 'react';
import { motion } from 'framer-motion';
import { User, Eye, ArrowLeft, Smile, Crown } from 'lucide-react';
import { translations, LanguageCode } from '../translations';

interface TypeSelectionScreenProps {
  onSelect: (type: string) => void;
  onBack: () => void;
  lang: LanguageCode;
}

const TypeSelectionScreen: React.FC<TypeSelectionScreenProps> = ({ onSelect, onBack, lang }) => {
  const t = translations[lang].typeSelection;
  const isRTL = lang === 'AR';

  const options = [
    {
      id: 'hair',
      label: t.hair,
      icon: User,
      active: true,
      image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 'beard',
      label: t.beard,
      icon: Smile,
      active: false,
      image: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: 'eyebrow',
      label: t.eyebrow,
      icon: Eye,
      active: false,
      image: "https://images.unsplash.com/photo-1515536765-9b2a74003733?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="pt-24 pb-8 px-6 text-center relative z-10">
        <button 
          onClick={onBack}
          className="absolute top-8 left-6 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0E1A2B] hover:border-[#0E1A2B] transition-all shadow-sm"
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
        </button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-600 text-[10px] font-black uppercase tracking-widest">
             <Crown size={12} /> Personalized Analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0E1A2B] tracking-tight">{t.title}</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
            {t.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
          {options.map((opt, idx) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => opt.active && onSelect(opt.id)}
              className={`
                group relative overflow-hidden border-2 transition-all duration-300 bg-white
                ${opt.active 
                  ? 'border-teal-500 shadow-lg cursor-pointer hover:scale-[1.02]' 
                  : 'border-slate-100 grayscale opacity-90 cursor-not-allowed'}
                /* Mobile Styles: Compact Height */
                h-24 rounded-2xl w-full
                /* Desktop Styles: Portrait Card */
                md:h-auto md:aspect-[3/4] md:rounded-[2rem]
              `}
            >
              {/* Shared Background Image */}
              <div className="absolute inset-0">
                 <img src={opt.image} className="w-full h-full object-cover opacity-90" alt={opt.label} />
                 {/* Mobile Gradient: Left to Right for horizontal text readability */}
                 <div className="absolute inset-0 bg-gradient-to-r from-[#0E1A2B] via-[#0E1A2B]/70 to-transparent md:hidden" />
                 {/* Desktop Gradient: Bottom to Top */}
                 <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#0E1A2B] via-transparent to-transparent opacity-90" />
              </div>

              {/* --- MOBILE LAYOUT (Compact Horizontal) --- */}
              <div className="absolute inset-0 flex md:hidden items-center px-5 gap-4 z-10">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10 backdrop-blur-md shadow-sm ${opt.active ? 'bg-teal-500' : 'bg-slate-700'}`}>
                      <opt.icon size={18} />
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1">
                      <h3 className="text-lg font-black text-white leading-tight">{opt.label}</h3>
                  </div>

                  {/* Status Indicator */}
                  {!opt.active ? (
                      <div className="px-2 py-1 bg-slate-800/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-md border border-white/10 whitespace-nowrap">
                          {t.comingSoon}
                      </div>
                  ) : (
                      <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                  )}
              </div>

              {/* --- DESKTOP LAYOUT (Large Vertical) --- */}
              <div className="hidden md:block absolute inset-0">
                  {/* Badge */}
                  {!opt.active && (
                     <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
                        {t.comingSoon}
                     </div>
                  )}
                  {opt.active && (
                     <div className="absolute top-4 right-4 bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full" />
                     </div>
                  )}

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start gap-4">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white border border-white/20 backdrop-blur-md shadow-lg ${opt.active ? 'bg-teal-500' : 'bg-slate-700'}`}>
                        <opt.icon size={28} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white leading-tight mb-1">{opt.label}</h3>
                        {opt.active && (
                          <div className="h-1 w-12 bg-teal-500 rounded-full mt-2" />
                        )}
                     </div>
                  </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeSelectionScreen;
