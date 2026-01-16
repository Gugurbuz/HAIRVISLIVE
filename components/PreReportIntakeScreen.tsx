import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BrainCircuit, SkipForward, Check, Star,
  MapPin, Globe, Pill, Activity, Zap, ShieldCheck, User
} from 'lucide-react';
import { LanguageCode } from '../translations';
import { IntakeData } from '../context/LeadContext';
import QuoteConsentModal from './QuoteConsentModal';

interface PreReportIntakeProps {
  onComplete: (data: IntakeData) => void;
  lang: LanguageCode;
}

type Step =
  | 'INIT'
  | 'LAYER_A_AGE' | 'LAYER_A_GENDER' | 'LAYER_A_GOAL' | 'LAYER_A_HISTORY' | 'LAYER_A_EXPECTATION'
  | 'LAYER_B_INTRO'
  | 'LAYER_B_TIMELINE' | 'LAYER_B_BUDGET' | 'LAYER_B_LOCATION' | 'LAYER_B_MEDS'
  | 'COMPLETE';

type Sender = 'ai' | 'user';
type Msg = { id: number; text: string | React.ReactNode; sender: Sender };

const PreReportIntakeScreen: React.FC<PreReportIntakeProps> = ({ onComplete, lang }) => {
  // Messages
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Flow
  const [step, setStep] = useState<Step>('INIT');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const msgIdRef = useRef(1);
  const lockRef = useRef(false); // prevent double tap

  // Modal
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Data
  const [intakeData, setIntakeData] = useState<IntakeData>({
    gender: 'Male',
    history: 'No'
  });
  const intakeRef = useRef<IntakeData>(intakeData);
  useEffect(() => { intakeRef.current = intakeData; }, [intakeData]);

  const nextId = () => msgIdRef.current++;

  const scrollToBottom = () => {
    // Smooth scroll (kaydırmayı yumuşatır): yeni mesaj gelince en alta sabitler
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, step]);

  // --- PROGRESS (AI’siz, nötr) ---
  const getProgressState = () => {
    if (['INIT', 'LAYER_A_AGE', 'LAYER_A_GENDER'].includes(step))
      return { percent: 18, label: "Hazırlanıyor", color: "bg-indigo-500" };

    if (['LAYER_A_GOAL', 'LAYER_A_HISTORY', 'LAYER_A_EXPECTATION'].includes(step))
      return { percent: 50, label: "Kısa Sorular", color: "bg-blue-500" };

    if (['LAYER_B_INTRO', 'LAYER_B_TIMELINE', 'LAYER_B_BUDGET'].includes(step))
      return { percent: 76, label: "Eşleşme Tercihleri", color: "bg-teal-500" };

    if (['LAYER_B_LOCATION', 'LAYER_B_MEDS'].includes(step))
      return { percent: 90, label: "Son Dokunuşlar", color: "bg-teal-500" };

    return { percent: 100, label: "Rapor", color: "bg-green-500" };
  };

  const progress = getProgressState();

  // --- Helpers (display values) ---
  const prettyValue = (raw: string) => {
    if (raw === 'Skipped') return 'Tercih belirtilmedi';
    if (raw === 'Male') return 'Erkek';
    if (raw === 'Female') return 'Kadın';
    if (raw === 'Frontal') return 'Ön Bölge / Saç Çizgisi';
    if (raw === 'Crown') return 'Tepe Bölgesi (Vertex)';
    if (raw === 'Both') return 'Genel / Her İkisi';
    if (raw === 'No') return 'Hayır';
    if (raw === 'Yes') return 'Evet';
    if (raw === 'Natural') return 'Doğallık';
    if (raw === 'Density') return 'Yoğunluk';
    if (raw === 'Recovery') return 'Hızlı İyileşme';
    if (raw === 'ASAP') return 'Hemen (1 Ay)';
    if (raw === '1-3 Months') return '1-3 Ay İçinde';
    if (raw === '3-6 Months') return '3-6 Ay Sonra';
    if (raw === 'Researching') return 'Henüz Araştırıyorum';
    if (raw === 'Economy') return 'Ekonomik Plan';
    if (raw === 'Standard') return 'Standart Paket';
    if (raw === 'Premium') return 'Premium / VIP';
    if (raw === 'Turkey') return 'Türkiye';
    if (raw === 'Europe') return 'Avrupa / Yerel';
    if (raw === 'None') return 'Kullanmıyorum';
    if (raw === 'Meds') return 'İlaç Kullanıyorum';
    if (raw === 'Vitamins') return 'Vitamin / Takviye';
    return raw;
  };

  // --- Messaging ---
  const addAiMessage = (text: string | React.ReactNode, delay = 0, callback?: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: nextId(), text, sender: 'ai' }]);
      callback?.();
    }, delay + 450);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: nextId(), text, sender: 'user' }]);
  };

  // --- INIT onboarding (yaşa kilitli değil) ---
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    addAiMessage("Analiz hazırlanıyor…", 200);
    setTimeout(() => {
      addAiMessage("Daha doğru bir simülasyon ve rapor için size birkaç kısa soru soracağım.", 650);
    }, 700);
    setTimeout(() => {
      addAiMessage("Yaş aralığınız nedir?", 700, () => setStep('LAYER_A_AGE'));
    }, 1400);
  }, []);

  // --- Core handler ---
  const handleResponse = (key: keyof IntakeData, value: string, nextStep: Step, nextAiMsg?: string) => {
    if (lockRef.current) return;
    lockRef.current = true;

    setSelectedOption(value);

    setTimeout(() => {
      addUserMessage(prettyValue(value));

      // update data (and ref) safely
      setIntakeData(prev => {
        const updated = { ...prev, [key]: value } as IntakeData;
        intakeRef.current = updated;
        return updated;
      });

      setSelectedOption(null);

      // ✅ Fix: LAYER_B_INTRO step should be set & messages should not duplicate
      if (nextStep === 'LAYER_B_INTRO') {
        setStep('LAYER_B_INTRO');
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
          addAiMessage("Harika. Klinik eşleşmesi için 3 kısa soru daha soracağım (opsiyonel).", 0);
          addAiMessage("Operasyonu ne zaman planlıyorsunuz?", 900, () => setStep('LAYER_B_TIMELINE'));
          lockRef.current = false;
        }, 500);
        return;
      }

      // Last step triggers consent modal
      if (nextStep === 'COMPLETE') {
        setShowConsentModal(true);
        lockRef.current = false;
        return;
      }

      if (nextAiMsg) {
        setIsTyping(true);
        addAiMessage(nextAiMsg, 400, () => {
          setStep(nextStep);
          lockRef.current = false;
        });
      } else {
        setStep(nextStep);
        lockRef.current = false;
      }
    }, 250);
  };

  const finishProcess = (finalData: IntakeData) => {
    setShowConsentModal(false);
    setStep('COMPLETE');
    addAiMessage("Raporunuz hazırlanıyor, lütfen bekleyin…", 350, () => {
      setTimeout(() => onComplete(finalData), 900);
    });
  };

  // --- RENDER ---
  return (
    <div className="w-full max-w-2xl mx-auto h-[85svh] md:h-[700px] flex flex-col font-sans relative">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] bg-indigo-400/10 rounded-full blur-[60px]" />
      </div>

      {/* Container */}
      <div className="relative z-10 flex-1 flex flex-col backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
        {/* HEADER */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100/50 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0E1A2B] to-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
              <BrainCircuit size={20} />
            </div>
            <div>
              {/* ✅ AI’siz isim */}
              <h3 className="text-[#0E1A2B] font-bold text-sm tracking-tight">AsistVis</h3>
              <div className="flex items-center gap-1.5 opacity-60">
                <Activity size={10} className="text-green-600" />
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{progress.label}</span>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                className={`h-full ${progress.color} transition-all duration-700 ease-out`}
              />
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="flex flex-col justify-end min-h-full space-y-6">
              {messages.map((msg, idx) => {
                const isLast = idx === messages.length - 1;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: isLast ? 1 : 0.6, y: 0, scale: 1 }}
                    className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-500
                        ${msg.sender === 'user'
                          ? 'bg-[#0E1A2B] text-white rounded-br-none shadow-lg shadow-slate-900/10'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'}
                        ${isLast && msg.sender === 'ai' ? 'border-l-4 border-l-teal-500' : ''}
                      `}
                    >
                      {/* ✅ AI badge yerine nötr */}
                      {isLast && msg.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-2 text-teal-600">
                          <Sparkles size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Soru</span>
                        </div>
                      )}
                      <span className={msg.sender === 'ai' && isLast ? 'text-base font-medium' : ''}>
                        {msg.text}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/80 border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="shrink-0 relative p-6 bg-white/70 backdrop-blur-md border-t border-slate-100">
            <div className="absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-white/70 via-white/40 to-transparent pointer-events-none" />
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {step === 'LAYER_A_AGE' && (
                  <GridOptions>
                    {['18-25', '26-35', '36-45', '46+'].map(age => (
                      <BigCard
                        key={age}
                        label={age}
                        onClick={() => handleResponse('ageRange', age, 'LAYER_A_GENDER')}
                        selected={selectedOption === age}
                      />
                    ))}
                  </GridOptions>
                )}

                {step === 'LAYER_A_GENDER' && (
                  <GridOptions cols={2}>
                    <BigCard
                      label="Erkek"
                      icon={<User />}
                      onClick={() => handleResponse('gender', 'Male', 'LAYER_A_GOAL')}
                      selected={selectedOption === 'Male'}
                    />
                    <BigCard
                      label="Kadın"
                      icon={<User />}
                      onClick={() => handleResponse('gender', 'Female', 'LAYER_A_GOAL')}
                      selected={selectedOption === 'Female'}
                    />
                  </GridOptions>
                )}

                {step === 'LAYER_A_GOAL' && (
                  <GridOptions cols={1}>
                    <ListCard
                      title="Ön Bölge / Saç Çizgisi"
                      sub="Sadece ön tarafı düzeltmek istiyorum."
                      onClick={() => handleResponse('goal', 'Frontal', 'LAYER_A_HISTORY')}
                      selected={selectedOption === 'Frontal'}
                    />
                    <ListCard
                      title="Tepe Bölgesi (Vertex)"
                      sub="Tepe kısmındaki açıklığı kapatmak."
                      onClick={() => handleResponse('goal', 'Crown', 'LAYER_A_HISTORY')}
                      selected={selectedOption === 'Crown'}
                    />
                    <ListCard
                      title="Genel Sıklaştırma / Komple"
                      sub="Tüm bölgelerde yoğunluk istiyorum."
                      onClick={() => handleResponse('goal', 'Both', 'LAYER_A_HISTORY')}
                      selected={selectedOption === 'Both'}
                    />
                  </GridOptions>
                )}

                {step === 'LAYER_A_HISTORY' && (
                  <GridOptions cols={2}>
                    <BigCard
                      label="Hayır, İlk Kez"
                      sub="Daha önce ekim yaptırmadım"
                      onClick={() => handleResponse('history', 'No', 'LAYER_A_EXPECTATION')}
                      selected={selectedOption === 'No'}
                      activeColor="bg-teal-500"
                    />
                    <BigCard
                      label="Evet, Yaptırdım"
                      sub="Revizyon gerekli olabilir"
                      onClick={() => handleResponse('history', 'Yes', 'LAYER_A_EXPECTATION')}
                      selected={selectedOption === 'Yes'}
                      activeColor="bg-blue-500"
                    />
                  </GridOptions>
                )}

                {step === 'LAYER_A_EXPECTATION' && (
                  <GridOptions cols={3}>
                    <CompactCard
                      icon={<Star size={18} />}
                      label="Doğallık"
                      onClick={() => handleResponse('expectation', 'Natural', 'LAYER_B_INTRO')}
                      selected={selectedOption === 'Natural'}
                    />
                    <CompactCard
                      icon={<Zap size={18} />}
                      label="Yoğunluk"
                      onClick={() => handleResponse('expectation', 'Density', 'LAYER_B_INTRO')}
                      selected={selectedOption === 'Density'}
                    />
                    <CompactCard
                      icon={<Activity size={18} />}
                      label="Hızlı İyileşme"
                      onClick={() => handleResponse('expectation', 'Recovery', 'LAYER_B_INTRO')}
                      selected={selectedOption === 'Recovery'}
                    />
                  </GridOptions>
                )}

                {step === 'LAYER_B_TIMELINE' && (
                  <GridOptions cols={2} onSkip={() => handleResponse('timeline', 'Skipped', 'LAYER_B_BUDGET')}>
                    <BigCard label="Hemen (1 Ay)" onClick={() => handleResponse('timeline', 'ASAP', 'LAYER_B_BUDGET')} selected={selectedOption === 'ASAP'} />
                    <BigCard label="1-3 Ay İçinde" onClick={() => handleResponse('timeline', '1-3 Months', 'LAYER_B_BUDGET')} selected={selectedOption === '1-3 Months'} />
                    <BigCard label="3-6 Ay Sonra" onClick={() => handleResponse('timeline', '3-6 Months', 'LAYER_B_BUDGET')} selected={selectedOption === '3-6 Months'} />
                    <BigCard label="Henüz Araştırıyorum" onClick={() => handleResponse('timeline', 'Researching', 'LAYER_B_BUDGET')} selected={selectedOption === 'Researching'} />
                  </GridOptions>
                )}

                {step === 'LAYER_B_BUDGET' && (
                  <GridOptions cols={1} onSkip={() => handleResponse('budget', 'Skipped', 'LAYER_B_LOCATION')}>
                    <ListCard title="Ekonomik Plan" sub="€1.500 - €2.500 arası" onClick={() => handleResponse('budget', 'Economy', 'LAYER_B_LOCATION')} selected={selectedOption === 'Economy'} />
                    <ListCard title="Standart Paket" sub="€2.500 - €4.000 arası (En çok tercih edilen)" onClick={() => handleResponse('budget', 'Standard', 'LAYER_B_LOCATION')} selected={selectedOption === 'Standard'} highlight />
                    <ListCard title="Premium / VIP" sub="€4.000 ve üzeri" onClick={() => handleResponse('budget', 'Premium', 'LAYER_B_LOCATION')} selected={selectedOption === 'Premium'} />
                  </GridOptions>
                )}

                {step === 'LAYER_B_LOCATION' && (
                  <GridOptions cols={2} onSkip={() => handleResponse('location', 'Skipped', 'LAYER_B_MEDS')}>
                    <BigCard label="Türkiye" sub="En iyi fiyat/perf." icon={<Globe />} onClick={() => handleResponse('location', 'Turkey', 'LAYER_B_MEDS')} selected={selectedOption === 'Turkey'} />
                    <BigCard label="Avrupa / Yerel" sub="Seyahat istemiyorum" icon={<MapPin />} onClick={() => handleResponse('location', 'Europe', 'LAYER_B_MEDS')} selected={selectedOption === 'Europe'} />
                  </GridOptions>
                )}

                {step === 'LAYER_B_MEDS' && (
                  <GridOptions cols={1} onSkip={() => handleResponse('meds', 'Skipped', 'COMPLETE')}>
                    <ListCard title="Kullanmıyorum" onClick={() => handleResponse('meds', 'None', 'COMPLETE')} selected={selectedOption === 'None'} />
                    <ListCard title="İlaç Kullanıyorum" sub="Finasteride, Minoxidil vb." onClick={() => handleResponse('meds', 'Meds', 'COMPLETE')} selected={selectedOption === 'Meds'} />
                    <ListCard title="Vitamin / Takviye" sub="Biotin, Multivitamin vb." onClick={() => handleResponse('meds', 'Vitamins', 'COMPLETE')} selected={selectedOption === 'Vitamins'} />
                  </GridOptions>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <QuoteConsentModal
        isOpen={showConsentModal}
        onSkip={() => finishProcess(intakeRef.current)}
        onComplete={(consentData) => {
          const finalData = {
            ...intakeRef.current,
            consent: consentData.consent,
            kvkk: consentData.kvkk,
          } as IntakeData;
          finishProcess(finalData);
        }}
      />
    </div>
  );
};

// --- UI COMPONENTS ---

const GridOptions = ({ children, cols = 2, onSkip }: any) => (
  <div className="space-y-3">
    <div className={`grid gap-3 ${cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {children}
    </div>
    {onSkip && (
      <button
        onClick={onSkip}
        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 transition-colors"
      >
        Şimdilik Atla <SkipForward size={12} />
      </button>
    )}
  </div>
);

const BigCard = ({ label, sub, icon, onClick, selected, activeColor = "bg-[#0E1A2B]" }: any) => (
  <button
    onClick={onClick}
    className={`
      relative p-4 rounded-2xl border text-left transition-all duration-300 group
      ${selected
        ? `${activeColor} border-transparent text-white shadow-xl scale-[1.02]`
        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'}
    `}
  >
    <div className="flex flex-col gap-2">
      {icon && <span className={`${selected ? 'text-white/80' : 'text-slate-400 group-hover:text-[#0E1A2B]'}`}>{icon}</span>}
      <div>
        <div className="font-bold text-sm">{label}</div>
        {sub && <div className={`text-[10px] mt-0.5 ${selected ? 'text-white/60' : 'text-slate-400'}`}>{sub}</div>}
      </div>
    </div>
    {selected && <div className="absolute top-3 right-3 text-white"><Check size={16} /></div>}
  </button>
);

const ListCard = ({ title, sub, onClick, selected, highlight }: any) => (
  <button
    onClick={onClick}
    className={`
      w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all duration-200
      ${selected
        ? 'bg-[#0E1A2B] border-[#0E1A2B] text-white shadow-lg'
        : highlight
          ? 'bg-white border-teal-200 shadow-sm ring-1 ring-teal-50 text-slate-800 hover:border-teal-300'
          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'}
    `}
  >
    <div>
      <div className="font-bold text-sm">{title}</div>
      {sub && <div className={`text-xs mt-0.5 ${selected ? 'text-slate-300' : 'text-slate-400'}`}>{sub}</div>}
    </div>
    <div
      className={`
        w-6 h-6 rounded-full flex items-center justify-center border
        ${selected ? 'bg-white text-[#0E1A2B] border-white' : 'border-slate-200 text-transparent'}
      `}
    >
      <Check size={14} strokeWidth={3} />
    </div>
  </button>
);

const CompactCard = ({ label, icon, onClick, selected }: any) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all
      ${selected
        ? 'bg-teal-500 border-teal-500 text-white shadow-lg'
        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'}
    `}
  >
    <div className={selected ? 'text-white' : 'text-slate-400'}>{icon}</div>
    <div className="text-[11px] font-bold text-center leading-tight">{label}</div>
  </button>
);

export default PreReportIntakeScreen;
