import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { IntakeData } from '../context/LeadContext';

type StepKey =
  | 'gender'
  | 'ageRange'
  | 'hairLossStage'
  | 'donorQuality'
  | 'transplantHistory'
  | 'goal'
  | 'budget'
  | 'timing'
  | 'country'
  | 'contactPreference'
  | 'consents';

interface StepOption {
  value: string;
  label: string;
  hint?: string;
}

interface StepConfig {
  key: StepKey;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  options?: StepOption[];
  type: 'single' | 'multi' | 'input' | 'consent';
  field?: keyof IntakeData;
  placeholder?: string;
  quickPills?: string[];
}

interface PreReportIntakeScreenProps {
  lang: 'EN' | 'TR';
  onComplete: (data: IntakeData) => void;
  onAnalyzeRequest?: () => Promise<void>;
  analysisResult?: any;
  isAnalyzing?: boolean;
}

type Message =
  | { id: string; role: 'assistant'; text: string; }
  | { id: string; role: 'user'; text: string; };

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export default function PreReportIntakeScreen({
  lang,
  onComplete,
  onAnalyzeRequest,
  analysisResult,
  isAnalyzing = false
}: PreReportIntakeScreenProps) {
  const isTR = lang === 'TR';

  const steps: StepConfig[] = useMemo(() => ([
    {
      key: 'gender',
      title: isTR ? 'Önce birkaç soru' : 'A few quick questions',
      subtitle: isTR ? 'Raporu kişiselleştirelim.' : 'Let’s personalize your report.',
      icon: <Sparkles className="w-5 h-5 text-teal-500" />,
      type: 'single',
      field: 'gender' as any,
      options: [
        { value: 'Male', label: isTR ? 'Erkek' : 'Male' },
        { value: 'Female', label: isTR ? 'Kadın' : 'Female' },
      ],
    },
    {
      key: 'ageRange',
      title: isTR ? 'Yaş aralığın?' : 'Your age range?',
      subtitle: isTR ? 'Doğru yoğunluk ve çizgi için.' : 'For density & hairline planning.',
      type: 'single',
      field: 'ageRange' as any,
      options: [
        { value: '18-24', label: '18–24' },
        { value: '25-34', label: '25–34' },
        { value: '35-44', label: '35–44' },
        { value: '45+', label: '45+' },
      ],
    },
    {
      key: 'hairLossStage',
      title: isTR ? 'Dökülme seviyesi' : 'Hair loss level',
      subtitle: isTR ? 'Tahmini greft dağılımı için.' : 'For estimated graft distribution.',
      type: 'single',
      field: 'hairLossStage' as any,
      options: [
        { value: 'Mild', label: isTR ? 'Hafif' : 'Mild' },
        { value: 'Moderate', label: isTR ? 'Orta' : 'Moderate' },
        { value: 'Advanced', label: isTR ? 'İleri' : 'Advanced' },
      ],
    },
    {
      key: 'donorQuality',
      title: isTR ? 'Donör bölge' : 'Donor area quality',
      subtitle: isTR ? 'Planın kalitesini etkiler.' : 'Impacts surgical plan quality.',
      type: 'single',
      field: 'donorQuality' as any,
      options: [
        { value: 'Good', label: isTR ? 'İyi' : 'Good' },
        { value: 'Average', label: isTR ? 'Orta' : 'Average' },
        { value: 'Weak', label: isTR ? 'Zayıf' : 'Weak' },
      ],
    },
    {
      key: 'transplantHistory',
      title: isTR ? 'Daha önce ekim?' : 'Previous transplant?',
      subtitle: isTR ? 'Raporu doğru yorumlamak için.' : 'To interpret results correctly.',
      type: 'single',
      field: 'history' as any,
      options: [
        { value: 'No', label: isTR ? 'Hayır' : 'No' },
        { value: 'Yes', label: isTR ? 'Evet' : 'Yes' },
      ],
    },
    {
      key: 'goal',
      title: isTR ? 'Hedefin ne?' : 'Your goal?',
      subtitle: isTR ? 'Önceliği seç.' : 'Pick your priority.',
      type: 'single',
      field: 'goal' as any,
      options: [
        { value: 'NaturalHairline', label: isTR ? 'Doğal saç çizgisi' : 'Natural hairline' },
        { value: 'MaxDensity', label: isTR ? 'Maksimum yoğunluk' : 'Maximum density' },
        { value: 'Balanced', label: isTR ? 'Dengeli' : 'Balanced' },
      ],
    },
    {
      key: 'budget',
      title: isTR ? 'Bütçe aralığı' : 'Budget range',
      subtitle: isTR ? 'Klinik önerilerini filtreler.' : 'Filters clinic suggestions.',
      type: 'single',
      field: 'budgetRange' as any,
      options: [
        { value: '<2000', label: isTR ? '< €2.000' : '< €2,000' },
        { value: '2000-4000', label: isTR ? '€2.000–€4.000' : '€2,000–€4,000' },
        { value: '4000-7000', label: isTR ? '€4.000–€7.000' : '€4,000–€7,000' },
        { value: '7000+', label: isTR ? '€7.000+' : '€7,000+' },
      ],
    },
    {
      key: 'timing',
      title: isTR ? 'Ne zaman düşünüyorsun?' : 'When are you planning?',
      subtitle: isTR ? 'Uygun takvim için.' : 'For availability planning.',
      type: 'single',
      field: 'timing' as any,
      options: [
        { value: 'ASAP', label: isTR ? 'Hemen' : 'ASAP' },
        { value: '1-3mo', label: isTR ? '1–3 ay' : '1–3 months' },
        { value: '3-6mo', label: isTR ? '3–6 ay' : '3–6 months' },
        { value: '6mo+', label: isTR ? '6+ ay' : '6+ months' },
      ],
    },
    {
      key: 'country',
      title: isTR ? 'Hangi ülkedesin?' : 'Which country are you in?',
      subtitle: isTR ? 'Klinik lojistiği için.' : 'For clinic logistics.',
      type: 'input',
      field: 'country' as any,
      placeholder: isTR ? 'Örn: Türkiye' : 'e.g., Turkey',
      quickPills: isTR ? ['Türkiye', 'UK', 'Germany', 'USA'] : ['Turkey', 'UK', 'Germany', 'USA'],
    },
    {
      key: 'contactPreference',
      title: isTR ? 'Klinikler nasıl ulaşsın?' : 'How should clinics contact you?',
      subtitle: isTR ? 'Tercihini seç.' : 'Choose your preference.',
      type: 'single',
      field: 'contactPref' as any,
      options: [
        { value: 'WhatsApp', label: 'WhatsApp' },
        { value: 'Email', label: 'Email' },
        { value: isTR ? 'Arama' : 'Call', label: isTR ? 'Telefon' : 'Phone call' },
      ],
    },
    {
      key: 'consents',
      title: isTR ? 'Onaylar' : 'Consents',
      subtitle: isTR ? 'KVKK ve iletişim izinleri.' : 'Privacy and contact permissions.',
      type: 'consent',
    },
  ]), [isTR]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const [data, setData] = useState<IntakeData>({
    gender: 'Male' as any,
    history: 'No' as any,
  } as IntakeData);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: 'assistant',
      text: isTR
        ? 'Raporu sana özel yapabilmem için 30 saniyelik birkaç soru soracağım.'
        : 'To personalize your report, I’ll ask a few quick questions (30 seconds).',
    },
  ]);

  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [consentKVKK, setConsentKVKK] = useState(false);
  const [consentContact, setConsentContact] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isTyping, stepIndex]);

  // Show analysis result in chat when it becomes available
  const [hasShownAnalysis, setHasShownAnalysis] = useState(false);
  const prevAnalysisRef = useRef<any>(null);

  useEffect(() => {
    // Only show when analysis completes (transitions from null to having data) and we're on consent step
    const isConsentStep = stepIndex === steps.length - 1;
    const analysisJustCompleted = !prevAnalysisRef.current && analysisResult;

    if (analysisJustCompleted && !hasShownAnalysis && isConsentStep) {
      setHasShownAnalysis(true);
      prevAnalysisRef.current = analysisResult;

      const norwood = analysisResult.diagnosis?.norwood_scale || 'NW?';
      const graftsMin = analysisResult.technical_metrics?.graft_count_min || '?';
      const graftsMax = analysisResult.technical_metrics?.graft_count_max || '?';

      const resultMessage = isTR
        ? `Analiz tamamlandı! 📊\n\n• Kellik Derecesi: ${norwood}\n• Tahmini Greft: ${graftsMin}-${graftsMax}\n\nOnayları tamamladıktan sonra hesap oluşturup simülasyonu hazırlayacağım.`
        : `Analysis complete! 📊\n\n• Hair Loss Level: ${norwood}\n• Estimated Grafts: ${graftsMin}-${graftsMax}\n\nOnce you complete the consents, we'll create your account and prepare the simulation.`;

      setTimeout(() => {
        setMessages(prev => [...prev, { id: uid(), role: 'assistant', text: resultMessage }]);
      }, 800);
    }
  }, [analysisResult, hasShownAnalysis, stepIndex, steps.length, isTR]);

  const pushAssistant = async (text: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 350));
    setMessages(prev => [...prev, { id: uid(), role: 'assistant', text }]);
    setIsTyping(false);
  };

  const pushUser = (text: string) => {
    setMessages(prev => [...prev, { id: uid(), role: 'user', text }]);
  };

  const goNext = async () => {
    // Check if we're moving to the consent step (last step)
    if (stepIndex === steps.length - 2) {
      // Trigger analysis before showing consent screen
      if (!analysisResult && onAnalyzeRequest && !isAnalyzing) {
        console.log('[PreReportIntake] Triggering analysis before consent step...');
        onAnalyzeRequest();
      }
    }

    if (stepIndex >= steps.length - 1) {
      const finalData: IntakeData = {
        ...data,
        kvkk: consentKVKK,
        consent: consentContact,
      } as any;

      pushUser(isTR ? 'Onaylıyorum.' : 'I agree.');

      // Proceed to auth gate
      await pushAssistant(
        isTR ? 'Harika! Şimdi hesap oluşturup simülasyonu hazırlayabiliriz.' : 'Great! Now let\'s create your account and prepare the simulation.'
      );
      setTimeout(() => onComplete(finalData), 900);
      return;
    }

    setStepIndex(i => i + 1);
    const next = steps[stepIndex + 1];
    await pushAssistant(next.title);
  };

  const onSelectOption = async (opt: StepOption) => {
    pushUser(opt.label);

    if (step.type === 'single' && step.field) {
      setData(prev => ({ ...prev, [step.field!]: opt.value } as any));
      await goNext();
      return;
    }
  };

  const onSubmitInput = async () => {
    if (!inputValue.trim()) return;
    pushUser(inputValue.trim());
    if (step.type === 'input' && step.field) {
      setData(prev => ({ ...prev, [step.field!]: inputValue.trim() } as any));
    }
    setInputValue('');
    await goNext();
  };

  const onToggleMulti = (value: string) => {
    setSelectedMulti(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const onSubmitMulti = async () => {
    if (!selectedMulti.length) return;
    pushUser(selectedMulti.join(', '));
    if (step.type === 'multi' && step.field) {
      setData(prev => ({ ...prev, [step.field!]: selectedMulti } as any));
    }
    setSelectedMulti([]);
    await goNext();
  };

  const progress = Math.round(((stepIndex) / (steps.length)) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* TOP BAR */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                {isTR ? 'HIZLI PROFİL' : 'QUICK PROFILE'}
              </div>
              <div className="text-sm font-bold text-[#0E1A2B]">
                {isTR ? 'Kişisel rapor ayarı' : 'Personalize your report'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isTR ? 'Gizli' : 'Private'}
            </span>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* PROGRESS */}
          <div className="w-full flex items-center justify-center pt-6 pb-4 bg-gradient-to-b from-white to-transparent">
            <div className="w-[85%]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {isTR ? 'İLERLEME' : 'PROGRESS'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* CHAT AREA */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-6"
          >
            <div className="min-h-full flex flex-col justify-end gap-4">
              {messages.map(m => (
                <div key={m.id} className={`w-full flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-3xl px-5 py-4 shadow-sm border ${
                    m.role === 'user'
                      ? 'bg-[#0E1A2B] text-white border-[#0E1A2B]'
                      : 'bg-white text-[#0E1A2B] border-slate-100'
                  }`}>
                    <div className="text-sm leading-relaxed font-medium">
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}

              <AnimatePresence>
                {(isTyping || isAnalyzing) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-full flex justify-start"
                  >
                    <div className="bg-white border border-slate-100 rounded-3xl px-5 py-4 shadow-sm">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium text-slate-600">
                            {isTR ? 'Fotoğraflar analiz ediliyor...' : 'Analyzing photos...'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:120ms]" />
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:240ms]" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="shrink-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-slate-100/60">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* STEP TITLE */}
                <div className="flex items-start gap-3">
                  {step.icon && (
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      {step.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-black text-[#0E1A2B]">
                      {stepIndex === 0 ? (isTR ? 'Başlayalım' : "Let's start") : step.title}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {step.subtitle}
                    </div>
                  </div>
                </div>

                {/* SINGLE OPTIONS */}
                {step.type === 'single' && step.options && (
                  <div className="grid grid-cols-2 gap-3">
                    {step.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => onSelectOption(opt)}
                        className="group text-left px-4 py-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-[#0E1A2B] group-hover:text-teal-700">
                              {opt.label}
                            </div>
                            {opt.hint && (
                              <div className="text-[11px] text-slate-500">
                                {opt.hint}
                              </div>
                            )}
                          </div>
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* INPUT */}
                {step.type === 'input' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {step.quickPills?.map(pill => (
                        <button
                          key={pill}
                          onClick={() => setInputValue(pill)}
                          className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={step.placeholder}
                        className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      />
                      <button
                        onClick={onSubmitInput}
                        className="px-6 py-4 rounded-2xl bg-[#0E1A2B] text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all"
                      >
                        {isTR ? 'Devam' : 'Next'}
                      </button>
                    </div>
                  </div>
                )}

                {/* MULTI */}
                {step.type === 'multi' && step.options && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {step.options.map(opt => {
                        const active = selectedMulti.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => onToggleMulti(opt.value)}
                            className={`text-left px-4 py-4 rounded-2xl border transition-all shadow-sm ${
                              active
                                ? 'bg-teal-50 border-teal-300'
                                : 'bg-white border-slate-200 hover:border-teal-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className={`text-sm font-bold ${active ? 'text-teal-700' : 'text-[#0E1A2B]'}`}>
                                {opt.label}
                              </div>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                                active
                                  ? 'bg-teal-500 border-teal-500 text-white'
                                  : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}>
                                <Check className="w-4 h-4" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={onSubmitMulti}
                      className="w-full px-6 py-4 rounded-2xl bg-[#0E1A2B] text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                      {isTR ? 'Devam' : 'Next'}
                    </button>
                  </div>
                )}

                {/* CONSENT */}
                {step.type === 'consent' && (
                  <div className="space-y-3">
                    {/* Show analysis results if available */}
                    {analysisResult && (
                      <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                        <div className="text-xs font-black uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {isTR ? 'ANALİZ SONUÇLARI' : 'ANALYSIS RESULTS'}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-3 rounded-xl">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                              {isTR ? 'Kellik Derecesi' : 'Hair Loss Level'}
                            </div>
                            <div className="text-lg font-black text-[#0E1A2B]">
                              {analysisResult.diagnosis?.norwood_scale || 'NW?'}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-xl">
                            <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                              {isTR ? 'Tahmini Greft' : 'Est. Grafts'}
                            </div>
                            <div className="text-lg font-black text-teal-600">
                              {analysisResult.technical_metrics?.graft_count_min || '?'}-
                              {analysisResult.technical_metrics?.graft_count_max || '?'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setConsentKVKK(v => !v)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                        consentKVKK ? 'bg-teal-50 border-teal-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-bold text-[#0E1A2B]">
                          {isTR ? 'KVKK / Gizlilik' : 'Privacy'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isTR ? 'Veri işleme bilgilendirmesini kabul ediyorum.' : 'I agree to data processing terms.'}
                        </div>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                        consentKVKK ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </button>

                    <button
                      onClick={() => setConsentContact(v => !v)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                        consentContact ? 'bg-teal-50 border-teal-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-bold text-[#0E1A2B]">
                          {isTR ? 'İletişim izni' : 'Contact permission'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isTR ? 'Kliniklerin benimle iletişime geçmesine izin veriyorum.' : 'Clinics may contact me.'}
                        </div>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                        consentContact ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </button>

                    <button
                      onClick={goNext}
                      disabled={!consentKVKK || isAnalyzing}
                      className={`w-full px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
                        consentKVKK && !isAnalyzing
                          ? 'bg-[#0E1A2B] text-white hover:shadow-xl active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isAnalyzing
                        ? (isTR ? 'Analiz Devam Ediyor...' : 'Analysis In Progress...')
                        : analysisResult
                        ? (isTR ? 'Simülasyon Hazırla' : 'Prepare Simulation')
                        : (isTR ? 'Raporu Hazırla' : 'Generate Report')}
                    </button>

                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      {isTR
                        ? 'Onaylar olmadan rapor kişiselleştirme tamamlanamaz. Verilerin güvenle işlenir.'
                        : 'Consents are required to complete personalization. Your data is handled securely.'}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
