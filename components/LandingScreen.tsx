import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronRight,
  Microscope,
  ArrowRight,
  ScanFace,
  Scale,
  Sparkles,
  MapPin,
  Star,
  Trophy,
  Clock,
  Euro,
  PlusCircle,
  Activity,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { translations, LanguageCode } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { CLINICS_DATA, CATEGORIES, ClinicCategory } from '../data/clinics';

// ✅ 1) BUNU EKLE: supabase client import
// Not: senin projende supabase client dosyası neredeyse path’i ona göre düzelt.
// Örn: '../lib/supabase' değilse doğru path'i yaz.
import { supabase } from '../lib/supabase';

interface LandingScreenProps {
  onStart: () => void;
  onVisitClinic: () => void;
  onBrowseDirectory: () => void;
  lang: LanguageCode;
}

const LivingBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#F7F8FA]">
    {/* 1. Grid Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

    {/* 2. Living Teal Blob */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15],
        x: [0, 20, 0],
        y: [0, -20, 0]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-0 right-0 top-[-10%] m-auto h-[400px] w-[400px] rounded-full bg-teal-500 blur-[100px]"
    />

    {/* 3. Living Indigo Blob */}
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.1, 0.2, 0.1],
        x: [0, -30, 0]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute right-[-10%] bottom-0 h-[500px] w-[500px] rounded-full bg-indigo-500 blur-[120px]"
    />
  </div>
);

const BeforeAfterSlider = ({
  lang,
  className,
  beforeImage,
  afterImage
}: {
  lang: LanguageCode;
  className?: string;
  beforeImage?: string | null;
  afterImage?: string | null;
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const t = translations[lang];
  const isRTL = lang === 'AR';

  // Fallback (Supabase URL gelene kadar veya hata olursa)
  const fallbackBefore =
    'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200';
  const fallbackAfter = fallbackBefore;

  const beforeSrc = beforeImage || fallbackBefore;
  const afterSrc = afterImage || fallbackAfter;

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = 50;
      const end = 55;
      let step = 0;
      const frames = 20;

      const animateHint = () => {
        step++;
        const progress = step / frames;
        const val =
          progress < 0.5
            ? start + (end - start) * (progress * 2)
            : end - (end - start) * ((progress - 0.5) * 2);

        setSliderPos(val);
        if (step < frames) requestAnimationFrame(animateHint);
        else setSliderPos(50);
      };

      requestAnimationFrame(animateHint);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden surgical-shadow border border-slate-200 bg-slate-100 group cursor-ew-resize select-none ${
        className || 'aspect-[16/9] rounded-[2.5rem] md:rounded-[4rem]'
      }`}
    >
      {/* --- AFTER STATE --- */}
      <div className="absolute inset-0">
        <img
          src={afterSrc}
          alt="After Result"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 25%' }}
        />

        {/* SURGICAL PLAN OVERLAY - Only visible on the "After" side */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <svg
            className="absolute top-[22%] left-1/2 -translate-x-1/2 w-[35%] h-[20%] opacity-80"
            viewBox="0 0 200 100"
          >
            <path
              d="M10,80 Q50,40 100,40 Q150,40 190,80"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="3"
              strokeDasharray="8 4"
              className="drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]"
            />
            <path
              d="M10,80 Q50,40 100,40 Q150,40 190,80 L190,0 L10,0 Z"
              fill="url(#graftPattern)"
              opacity="0.4"
            />
            <defs>
              <pattern id="graftPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#14B8A6" />
              </pattern>
            </defs>
          </svg>

          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[40%] h-[30%] border border-teal-500/30 rounded-[3rem] opacity-40"></div>
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-1 h-10 bg-teal-500/50"></div>
        </div>

        <div className="absolute inset-0 bg-teal-500/10 mix-blend-overlay pointer-events-none"></div>

        <div
          className={`absolute top-6 md:top-10 ${
            isRTL ? 'left-6 md:left-10' : 'right-6 md:right-10'
          } px-4 md:px-6 py-2 md:py-3 bg-[#14B8A6] rounded-full text-white text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-2xl z-20`}
        >
          {t.afterLabel}
        </div>
      </div>

      {/* --- BEFORE STATE --- */}
      <div
        className="absolute inset-0 z-20 overflow-hidden pointer-events-none bg-white"
        style={{ clipPath: `inset(0 ${isRTL ? 0 : 100 - sliderPos}% 0 ${isRTL ? sliderPos : 0}%)` }}
      >
        <img
          src={beforeSrc}
          alt="Before State"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover grayscale contrast-110"
          style={{ objectPosition: '50% 25%' }}
        />
        <div
          className={`absolute top-6 md:top-10 ${
            isRTL ? 'right-6 md:right-10' : 'left-6 md:left-10'
          } px-4 md:px-6 py-2 md:py-3 bg-white rounded-full text-[#0E1A2B] text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-xl`}
        >
          {t.beforeLabel}
        </div>
      </div>

      {/* --- SLIDER CONTROLS --- */}
      <div className="absolute inset-0 z-30">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="w-full h-full opacity-0 cursor-ew-resize"
          aria-label="Compare Before and After images"
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none shadow-[0_0_30px_rgba(255,255,255,1)]"
          style={{ [isRTL ? 'right' : 'left']: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 md:w-14 h-10 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center border-[4px] md:border-[6px] border-[#0E1A2B]">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 md:h-4 bg-[#0E1A2B]/20 rounded-full" />
              <div className="w-0.5 h-3 md:h-4 bg-[#0E1A2B] rounded-full" />
              <div className="w-0.5 h-3 md:h-4 bg-[#0E1A2B]/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopClinics = ({
  onViewDetail,
  onBrowseDirectory
}: {
  onViewDetail: () => void;
  onBrowseDirectory: () => void;
}) => {
  const [activeCat, setActiveCat] = useState<ClinicCategory>('All');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  const filteredClinics = useMemo(() => {
    return activeCat === 'All'
      ? CLINICS_DATA
      : CLINICS_DATA.filter((c) =>
          c.tags.some((t) => t.includes(activeCat) || (activeCat === 'Sapphire FUE' && t === 'Best Value'))
        );
  }, [activeCat]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let direction = 1;
    const speed = 0.5;

    const animate = () => {
      if (!isPaused.current && document.visibilityState === 'visible') {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        const maxScroll = scrollWidth - clientWidth;

        if (maxScroll > 0) {
          scrollContainer.scrollLeft += speed * direction;

          if (direction === 1 && scrollLeft >= maxScroll - 1) direction = -1;
          else if (direction === -1 && scrollLeft <= 1) direction = 1;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [filteredClinics]);

  return (
    <div className="w-full space-y-12 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 px-2 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0E1A2B] rounded-full border border-[#0E1A2B] text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" /> HairVis Network Partners
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-[#0E1A2B] tracking-tighter leading-[0.9]">
            Listed Centers of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
              Excellence
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-end gap-3 max-w-xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeCat === cat
                  ? 'bg-[#0E1A2B] text-white border-[#0E1A2B] shadow-lg transform scale-105'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-teal-500 hover:text-teal-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative w-full py-8"
        onMouseEnter={() => (isPaused.current = true)}
        onMouseLeave={() => (isPaused.current = false)}
        onTouchStart={() => (isPaused.current = true)}
        onTouchEnd={() => setTimeout(() => (isPaused.current = false), 2000)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F7F8FA] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F7F8FA] to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-8 pl-8 overflow-x-auto no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredClinics.map((clinic, idx) => (
            <div
              key={`${clinic.id}-${idx}`}
              onClick={onViewDetail}
              className="group relative w-[360px] md:w-[400px] shrink-0 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 cursor-pointer flex flex-col snap-center"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={clinic.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={clinic.name}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-black text-[#0E1A2B]">{clinic.rating}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  {clinic.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-lg font-black text-[#0E1A2B] leading-tight group-hover:text-teal-600 transition-colors">
                      {clinic.name}
                    </h4>
                    <div className="text-teal-500 shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">{clinic.location}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 border-b border-slate-50 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> Wait Time
                    </span>
                    <span className="font-bold text-[#0E1A2B]">{clinic.waitTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 border-b border-slate-50 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Euro size={12} /> Starting From
                    </span>
                    <span className="font-bold text-[#0E1A2B] text-lg leading-none">{clinic.price}</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-slate-50 text-[#0E1A2B] rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-[#0E1A2B] group-hover:text-white transition-all flex items-center justify-center gap-2">
                  View Profile <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
          <div className="w-8 shrink-0" />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onBrowseDirectory}
          className="px-10 py-5 bg-white border border-slate-200 text-[#0E1A2B] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center gap-3 shadow-lg shadow-slate-200/50"
        >
          <PlusCircle className="w-4 h-4" /> Find Clinics Now
        </button>
      </div>
    </div>
  );
};

interface ShowcaseCardProps {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  proof: string;
}

const ShowcaseCard = ({ step, title, description, icon, image, proof }: ShowcaseCardProps) => (
  <div className="group bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden surgical-shadow transition-all duration-500 text-left hover:border-teal-500/30 flex flex-col h-full">
    <div className="aspect-[4/3] relative overflow-hidden">
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
      <div className="absolute top-8 left-8 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-[#0E1A2B]">
        {icon}
      </div>
      <div className="absolute bottom-8 left-10">
        <span className="text-6xl font-black text-slate-100 uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
          {step}
        </span>
      </div>
    </div>
    <div className="p-10 space-y-5 flex-1 flex flex-col">
      <h3 className="text-3xl font-bold text-[#0E1A2B] leading-tight">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-light">{description}</p>

      <div className="mt-auto pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-600">
          <CheckCircle2 size={12} className="fill-teal-100" /> {proof}
        </div>
      </div>
    </div>
  </div>
);

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, onVisitClinic, onBrowseDirectory, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'AR';

  const showcaseRef = useRef<HTMLDivElement>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // ✅ 2) SLIDER RESİMLERİ SUPABASE PUBLIC URL
  const [sliderBeforeUrl, setSliderBeforeUrl] = useState<string | null>(null);
  const [sliderAfterUrl, setSliderAfterUrl] = useState<string | null>(null);

  // ✅ 3) BU KISIMDA: bucket + path’leri senin eklediğin dosya path’leriyle aynı olmalı
  useEffect(() => {
    // Burada sadece path değiştirirsin:
    // Bucket: public-assets
    // Files:
    //  - landing/slider/before.webp
    //  - landing/slider/after.webp

    const before = supabase.storage.from('public-assets').getPublicUrl('landing/slider/before.webp');
    const after = supabase.storage.from('public-assets').getPublicUrl('landing/slider/after.webp');

    setSliderBeforeUrl(before.data.publicUrl);
    setSliderAfterUrl(after.data.publicUrl);

    // Debug istersen aç:
    // console.log('Slider BEFORE:', before.data.publicUrl);
    // console.log('Slider AFTER :', after.data.publicUrl);
  }, []);

  const scrollToShowcase = () => showcaseRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`relative w-full min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>
      <LivingBackground />

      <div className="relative pt-32 md:pt-40 pb-20 px-6 max-w-full overflow-x-hidden">
        {/* --- HERO SECTION (Split Layout) --- */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32 relative z-10">
          {/* Left Column */}
          <div className="text-left space-y-8 order-2 lg:order-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-[#0E1A2B] tracking-tighter leading-[0.9]"
            >
              {t.heroTitle1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                {t.heroTitle2}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl text-slate-500 text-lg md:text-xl font-light leading-relaxed"
            >
              {t.heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <button
                onClick={onStart}
                className="px-10 py-5 bg-[#0E1A2B] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-teal-500 hover:text-white transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 group"
              >
                {t.startBtn} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToShowcase}
                className="px-10 py-5 bg-white text-[#0E1A2B] border border-slate-200 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-slate-50 transition-all flex items-center gap-3"
              >
                <Microscope className="w-4 h-4" /> {t.methodBtn}
              </button>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              {/* ✅ 4) SLIDER’A SUPABASE’DEN GELEN URL’LERİ BURADA VERİYORSUN */}
              <BeforeAfterSlider
                lang={lang}
                className="aspect-square md:aspect-[4/3] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-4 border-white"
                beforeImage={sliderBeforeUrl}
                afterImage={sliderAfterUrl}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -top-6 -left-6 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 hidden md:flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                  <ScanFace size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI Analysis</p>
                  <p className="text-sm font-bold text-[#0E1A2B]">Texture Mapped</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-8 -right-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 hidden md:flex flex-col gap-2 min-w-[140px]"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Graft Est.</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-[#0E1A2B] leading-none">3,200</span>
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5">grafts</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-teal-500 rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Showcase */}
        <div ref={showcaseRef} className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 scroll-mt-32 mb-32">
          <ShowcaseCard
            step="01"
            title={t.showcaseTitle1}
            description={t.showcaseDesc1}
            icon={<ScanFace className="w-6 h-6" />}
            image="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800"
            proof="Angle-locked capture (FaceMesh)"
          />
          <ShowcaseCard
            step="02"
            title={t.showcaseTitle2}
            description={t.showcaseDesc2}
            icon={<Scale className="w-6 h-6" />}
            image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
            proof="Zone-based graft planning"
          />
          <ShowcaseCard
            step="03"
            title={t.showcaseTitle3}
            description={t.showcaseDesc3}
            icon={<Sparkles className="w-6 h-6" />}
            image="https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=800"
            proof="12-month projection + timeline"
          />
        </div>

        {/* REPORT PREVIEW */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="bg-[#0E1A2B] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 rounded-full text-teal-400 text-[10px] font-black uppercase tracking-widest border border-teal-500/20 mb-4">
                    <FileText size={14} /> Comprehensive Output
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                    Not just a photo.
                    <br />
                    <span className="text-teal-400">A Full Action Plan.</span>
                  </h2>
                  <p className="text-slate-400 text-lg font-light leading-relaxed mt-4">
                    Your free analysis unlocks a medical-grade dashboard used by top surgeons to plan procedures.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    'Norwood Scale Classification & Zone Mapping',
                    'Precise Graft Estimate Range (Min - Max)',
                    'Donor Area Density Assessment',
                    'Personalized 12-Month Simulation'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-[#0E1A2B]" />
                      </div>
                      <span className="text-white font-medium text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onStart}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#0E1A2B] rounded-xl font-black uppercase tracking-widest text-xs hover:bg-teal-500 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Get My Report Now <ArrowRight size={14} />
                </button>
              </div>

              <div className="relative group perspective-1000">
                <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl transform transition-transform group-hover:rotate-y-2 duration-500">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Activity size={20} className="text-[#0E1A2B]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis ID</div>
                        <div className="font-mono font-bold text-[#0E1A2B]">#8392-X</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Completed
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 bg-slate-50 p-4 rounded-xl">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Scale</div>
                        <div className="text-xl font-black text-[#0E1A2B]">NW 3V</div>
                      </div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-xl">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Grafts</div>
                        <div className="text-xl font-black text-[#0E1A2B]">2,800+</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Est. Cost (Turkey)</span>
                        <span className="text-lg font-black text-teal-600">€2,200</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-[40%] h-full bg-teal-500" />
                      </div>
                    </div>

                    <div className="aspect-[16/9] bg-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                      <Sparkles className="text-teal-500 animate-pulse" />
                      <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white/50 uppercase tracking-widest">
                        AI Preview Generated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Clinics */}
        <div className="mb-32">
          <TopClinics onViewDetail={onVisitClinic} onBrowseDirectory={onBrowseDirectory} />
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-50 md:hidden flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready?</span>
              <span className="text-sm font-bold text-[#0E1A2B]">Get your free analysis</span>
            </div>
            <button
              onClick={onStart}
              className="px-6 py-3 bg-[#0E1A2B] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
            >
              Start Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingScreen;
