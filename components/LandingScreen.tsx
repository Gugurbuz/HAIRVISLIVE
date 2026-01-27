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
  CheckCircle2,
} from 'lucide-react';
import { translations, LanguageCode } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, ClinicCategory } from '../data/clinics';
import { supabase } from '../lib/supabase';
import { clinicService } from '../lib/clinicService';
import type { Database } from '../lib/database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'];

// --- PERFORMANCE HELPERS ---
// Mobilde olup olmadığını anlamak için basit kontrol
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

interface LandingScreenProps {
  onStart: () => void;
  onVisitClinic: () => void;
  onBrowseDirectory: () => void;
  lang: LanguageCode;
}

// OPTIMIZATION 1: LivingBackground artık CSS animation kullanıyor ve blur mobilde daha düşük.
// Framer-motion yerine saf CSS classları kullanıldı.
const LivingBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#F7F8FA] transform-gpu">
    {/* Grid Background - Static */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

    {/* Blob 1 - Teal */}
    <div
      className="absolute left-0 right-0 top-[-10%] m-auto h-[300px] w-[300px] md:h-[400px] md:w-[400px] rounded-full bg-teal-500/20 blur-[50px] md:blur-[100px] animate-blob mix-blend-multiply"
      style={{ willChange: 'transform, opacity' }}
    />

    {/* Blob 2 - Indigo */}
    <div
      className="absolute right-[-10%] bottom-0 h-[350px] w-[350px] md:h-[500px] md:w-[500px] rounded-full bg-indigo-500/20 blur-[60px] md:blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"
      style={{ willChange: 'transform, opacity' }}
    />

    {/* CSS Styles for Blobs (Inline style to ensure it works without external CSS file) */}
    <style>{`
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 10s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
    `}</style>
  </div>
);

type BeforeAfterSliderProps = {
  lang: LanguageCode;
  className?: string;
  beforeImage: string;
  afterImage: string;
  autoPeriodMs?: number;
};

const BeforeAfterSlider = ({
  lang,
  className,
  beforeImage,
  afterImage,
  autoPeriodMs = 4500,
}: BeforeAfterSliderProps) => {
  const isRTL = lang === 'AR';
  const rafRef = useRef<number | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // OPTIMIZATION 2: Mobilde animasyon framerate'ini düşür veya basitleştir.
  // Burada React State update'i yerine doğrudan DOM manipülasyonu bile yapılabilir ama
  // şimdilik lojiği koruyup sadece görünürlük kontrolü ekliyoruz.
  useEffect(() => {
    let startTime: number | null = null;

    const tick = (ts: number) => {
      if (!startTime) startTime = ts;

      // Ekranda değilse hesaplama yapma
      if (document.visibilityState !== 'visible') {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const t = ts / autoPeriodMs;
      const s = Math.sin(t * Math.PI * 2);
      const eased = Math.sign(s) * Math.pow(Math.abs(s), 2.5);
      const next = 50 + eased * 50;

      setSliderPos(Math.max(0, Math.min(100, next)));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoPeriodMs]);

  const sliderMaskStyle = isRTL
    ? `linear-gradient(to left, black calc(${sliderPos}% - 1%), transparent calc(${sliderPos}% + 1%))`
    : `linear-gradient(to right, black calc(${sliderPos}% - 1%), transparent calc(${sliderPos}% + 1%))`;

  const edgeFadeMask = `radial-gradient(ellipse at center, black 60%, transparent 100%)`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none transform-gpu ${
        className || 'aspect-[16/9] rounded-[2.5rem] md:rounded-[4rem]'
      }`}
      style={{
        WebkitMaskImage: edgeFadeMask,
        maskImage: edgeFadeMask,
        // Mobilde box-shadow performans düşürebilir, gerekirse azaltılabilir
        boxShadow: 'inset 0 0 80px rgba(14, 26, 43, 0.08)',
      }}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={afterImage}
          alt="After"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 25%' }}
          loading="eager" // Hero image olduğu için eager
        />
      </div>

      <div
        className="absolute inset-0 z-10"
        style={{
          WebkitMaskImage: sliderMaskStyle,
          maskImage: sliderMaskStyle,
          willChange: 'mask-image, -webkit-mask-image', // Tarayıcıya ipucu
        }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 25%' }}
          loading="eager"
        />
      </div>

      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          transform: `translate3d(${isRTL ? -sliderPos : sliderPos}%, 0, 0)`,
          left: isRTL ? 'auto' : '0',
          right: isRTL ? '0' : 'auto',
          width: '100%',
          willChange: 'transform', // GPU acceleration
        }}
      >
        <div className="absolute top-0 bottom-0 left-0 w-[2px] -ml-[1px]">
          <div className="absolute inset-0 bg-teal-400/80" />
          <div className="absolute inset-0 bg-teal-400 blur-[8px] opacity-60 w-[4px] -ml-[1px]" />
          <div className="absolute inset-0 bg-teal-300 blur-[20px] opacity-30 w-[20px] -ml-[9px]" />
        </div>
      </div>
    </div>
  );
};

const TopClinics = ({
  onViewDetail,
  onBrowseDirectory,
}: {
  onViewDetail: () => void;
  onBrowseDirectory: () => void;
}) => {
  const [activeCat, setActiveCat] = useState<ClinicCategory>('All');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isMobile = useIsMobile();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const { data, error } = await clinicService.getAllClinics({ status: 'ACTIVE', limit: 10 });
        if (data && !error) {
          const transformed = data.map((dbClinic) => {
            const metadata = (dbClinic.metadata as any) || {};
            const specialties = metadata.specialties || [];
            return {
              id: dbClinic.id,
              name: dbClinic.name,
              location: dbClinic.location || 'Unknown',
              rating: (4.7 + Math.random() * 0.3).toFixed(1),
              reviews: Math.floor(Math.random() * 3000) + 500,
              price: '€2,200',
              img:
                dbClinic.logo_url ||
                'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600',
              tags: specialties.slice(0, 2),
              waitTime: '2-4 Weeks',
              features: specialties.slice(0, 2),
            };
          });
          setClinics(transformed);
        }
      } catch (err) {
        console.error('Error fetching clinics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const filteredClinics = useMemo(() => {
    return activeCat === 'All'
      ? clinics
      : clinics.filter((c) =>
          c.tags.some((t: string) => t.includes(activeCat) || (activeCat === 'Sapphire FUE' && t === 'Best Value'))
        );
  }, [activeCat, clinics]);

  // OPTIMIZATION 3: Mobilde Auto-Scroll'u iptal et.
  // Mobilde auto-scroll hem performansı düşürür hem de UX açısından kötüdür.
  useEffect(() => {
    if (isMobile) return; // Mobilde isen kodu çalıştırma, çık.

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
  }, [filteredClinics, isMobile]);

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
          className="flex gap-8 pl-8 overflow-x-auto no-scrollbar scroll-smooth" // scroll-smooth eklendi
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            // Mobilde native touch scrolling'i etkinleştirmek için:
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filteredClinics.map((clinic, idx) => (
            <div
              key={`${clinic.id}-${idx}`}
              onClick={onViewDetail}
              // transform-gpu eklendi
              className="group relative w-[360px] md:w-[400px] shrink-0 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 cursor-pointer flex flex-col snap-center transform-gpu"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={clinic.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
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
  <div className="group bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden surgical-shadow transition-all duration-500 text-left hover:border-teal-500/30 flex flex-col h-full transform-gpu">
    <div className="aspect-[4/3] relative overflow-hidden">
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 will-change-transform"
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

type WhyChooseProps = {
  lang: LanguageCode;
  onStart: () => void;
};

const WhyChooseSection: React.FC<WhyChooseProps> = ({ lang, onStart }) => {
  const isRTL = lang === 'AR';

  const copy = useMemo(() => {
    const TR = {
      badge: 'Tek sefer tarama · Standart rapor',
      title1: 'Kullanıcılar',
      title2: 'neden HairVis’i seçer?',
      desc:
        'Fotoğraf gönderme trafiğini ortadan kaldırıyoruz. Tek sefer tarama ile oluşturulan rapor, seçili kliniklerle aynı anda paylaşılır.',
      items: [
        {
          title: 'Tek sefer tarama',
          desc: 'Her kliniğe ayrı ayrı foto göndermek yok. Kamera ile tek sefer tarama yapılır.',
        },
        {
          title: 'Otomatik rapor paylaşımı',
          desc: 'Tarama sonrası oluşan standart rapor, seçtiğin kliniklerle doğrudan paylaşılır.',
        },
        {
          title: 'Ham foto değil, rapor paketi',
          desc:
            'Klinikler dağınık fotoğraflar değil; ölçümler, bölgeler, greft aralığı ve simülasyon içeren raporu görür.',
        },
        {
          title: 'Karşılaştırılabilir teklifler',
          desc:
            'Tüm klinikler aynı raporu gördüğü için gelen teklifler net ve karşılaştırılabilirdir.',
        },
      ],
      cta: 'Taramayı başlat',
    };

    const EN = {
      badge: 'Single scan · Standardized report',
      title1: 'Why users',
      title2: 'choose HairVis',
      desc:
        'We eliminate photo back-and-forth. A single scan generates a report that is shared with selected clinics instantly.',
      items: [
        {
          title: 'One scan',
          desc: 'No sending photos to clinics one by one. A single camera scan is enough.',
        },
        {
          title: 'Automatic report sharing',
          desc: 'Once the scan is complete, the report is shared with selected clinics automatically.',
        },
        {
          title: 'Report package, not raw photos',
          desc:
            'Clinics receive a structured report with measurements, zones, graft ranges and simulation.',
        },
        {
          title: 'Comparable offers',
          desc:
            'All clinics review the same report, making offers clear and easy to compare.',
        },
      ],
      cta: 'Start scanning',
    };

    const map: Record<string, any> = { TR, EN };
    return map[lang] || EN;
  }, [lang]);

  return (
    <div className={`max-w-7xl mx-auto mb-32 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="px-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/70 backdrop-blur-md rounded-full border border-slate-200 text-[#0E1A2B] text-[10px] font-black uppercase tracking-widest shadow-lg">
          {copy.badge}
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-10 items-end px-2">
        <div className="space-y-5">
          <h2 className="text-5xl md:text-6xl font-black text-[#0E1A2B] tracking-tighter leading-[0.95]">
            {copy.title1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
              {copy.title2}
            </span>
          </h2>
          <p className="max-w-2xl text-slate-500 text-lg font-light leading-relaxed">{copy.desc}</p>
        </div>

        <div className="flex lg:justify-end">
          <button
            onClick={onStart}
            className="w-full lg:w-auto px-10 py-5 bg-[#0E1A2B] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-teal-500 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
          >
            {copy.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {copy.items.map((it: any, idx: number) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-[2.5rem] p-7 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-teal-900/10 transition-all transform-gpu"
          >
            <h3 className="text-lg font-black text-[#0E1A2B] leading-tight">{it.title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed font-light">{it.desc}</p>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                Standardized flow
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, onVisitClinic, onBrowseDirectory, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'AR';

  const showcaseRef = useRef<HTMLDivElement>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  const scrollToShowcase = () => {
    showcaseRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Scroll eventini debounce yapmak daha iyidir ama şimdilik basit tutuyoruz.
    // Passive: true performans için kritiktir.
    const handleScroll = () => {
      if (window.scrollY > 500) setShowStickyCTA(true);
      else setShowStickyCTA(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const SLIDER_BUCKET = 'public-assets';
  const SLIDER_BEFORE_PATH = 'landing/slider/before.webp';
  const SLIDER_AFTER_PATH = 'landing/slider/after.webp';

  const sliderBeforeUrl = useMemo(() => {
    const { data } = supabase.storage.from(SLIDER_BUCKET).getPublicUrl(SLIDER_BEFORE_PATH);
    return data.publicUrl;
  }, []);

  const sliderAfterUrl = useMemo(() => {
    const { data } = supabase.storage.from(SLIDER_BUCKET).getPublicUrl(SLIDER_AFTER_PATH);
    return data.publicUrl;
  }, []);

  return (
    <div className={`relative w-full min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>
      <LivingBackground />

      <div className="relative pt-32 md:pt-40 pb-20 px-6 max-w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32 relative z-10">
          {/* Text Content - ORDER 1 ON MOBILE (Your requested fix) */}
          <div className="text-left space-y-8 order-1 lg:order-1">
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

          {/* Slider Content - ORDER 2 ON MOBILE */}
          <div className="order-2 lg:order-2 relative">
            {/* Reduced Blur for Performance */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-500/10 blur-[40px] md:blur-[80px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <BeforeAfterSlider
                lang={lang}
                beforeImage={sliderBeforeUrl}
                afterImage={sliderAfterUrl}
                autoPeriodMs={4500}
                className="w-full h-[520px] md:h-[640px] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-none bg-white/50"
              />
            </motion.div>
          </div>
        </div>

        {/* SHOWCASE */}
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

        {/* ✅ WHY USERS CHOOSE US (En doğru yer: Showcase'ten sonra, Action Plan'dan önce) */}
        <WhyChooseSection lang={lang} onStart={onStart} />

        {/* ACTION PLAN BLOCK */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="bg-[#0E1A2B] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl transform-gpu">
            {/* Reduced Blur */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[60px] md:blur-[120px] pointer-events-none" />

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
                    'Personalized 12-Month Simulation',
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
                <div className="relative bg-white rounded-[2rem] p-6 shadow-2xl transform transition-transform group-hover:rotate-y-2 duration-500 will-change-transform">
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

        {/* TOP CLINICS */}
        <div className="mb-32">
          <TopClinics onViewDetail={onVisitClinic} onBrowseDirectory={onBrowseDirectory} />
        </div>
      </div>

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
