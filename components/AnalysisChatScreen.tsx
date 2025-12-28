import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Check,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  Zap,
  ShieldCheck,
  Mail,
  Phone,
  SkipForward,
  Globe,
  MapPin,
  Pill,
  Star,
  User,
} from "lucide-react";

// --- TİPLER VE TANIMLAR ---

export type LanguageCode = "tr" | "en" | "de";

interface AnalysisChatProps {
  onComplete: (data: AnalysisAnswers) => void;
  lang: LanguageCode;
}

type ChatStep =
  | "INIT"
  | "Q_AGE"
  | "Q_GENDER"
  | "Q_GOAL"
  | "Q_HISTORY"
  | "Q_EXPECTATION"
  | "LAYER_B_INTRO"
  | "Q_TIMELINE"
  | "Q_BUDGET"
  | "Q_LOCATION"
  | "Q_MEDS"
  | "Q_CONSENT"
  | "PROCESSING"
  | "COMPLETE";

type Sender = "ai" | "user";

type ChatMessage = {
  id: number;
  text: string | React.ReactNode;
  sender: Sender;
};

type ContactMethod = "email" | "whatsapp";

type AnalysisAnswers = {
  ageRange: string;
  gender: "Male" | "Female";
  previousTransplant: "Yes" | "No";
  goal: "Frontal" | "Crown" | "Both";
  expectation: "Natural" | "Density" | "Recovery" | "";
  timeline: string;
  budget: string;
  location: string;
  meds: string;
  contact: string;
  consent: boolean;
  lang: LanguageCode;
};

type OptionButtonProps = {
  label: string;
  subLabel?: string; // Ekran görüntüsündeki alt metinler için
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
};

// --- TRANSLATION DICTIONARY (Eksik olan kısım) ---
const TRANSLATIONS = {
  tr: {
    analyzing: "Analiz motoru başlatılıyor...",
    mapped: "Görsel veriler işlendi. Doğru simülasyon için yaş aralığınızı öğrenebilir miyim?",
    calibration_complete: "Kalibrasyon tamamlandı.",
    optimizing: "Şimdi klinik eşleşmesi için optimizasyon yapılıyor (Opsiyonel). Ne zaman işlem düşünüyorsunuz?",
    generating: "Güvenli raporunuz oluşturuluyor...",
    skip: "Atla",
    input_placeholder_email: "ornek@email.com",
    input_placeholder_phone: "5XX XXX XX XX",
    steps: {
      age: "Yaş Aralığı Seçimi",
      gender: "Biyolojik Cinsiyet",
      goal: "Ekim Bölgesi / Hedef",
      history: "Geçmiş İşlemler",
      expectation: "Beklenti Önceliği",
      timeline: "Zaman Çizelgesi",
      budget: "Bütçe Aralığı",
      location: "Lokasyon Tercihi",
      meds: "İlaç Kullanımı",
      consent: "İletişim İzni",
    },
    options: {
      frontal: { label: "Ön Bölge / Saç Çizgisi", sub: "Sadece ön tarafı düzeltmek istiyorum." },
      crown: { label: "Tepe Bölgesi (Vertex)", sub: "Tepe kısmındaki açıklığı kapatmak." },
      both: { label: "Genel Sıklaştırma / Komple", sub: "Tüm bölgelerde yoğunluk istiyorum." },
      male: { label: "Erkek", sub: "Erkek tipi dökülme analizi." },
      female: { label: "Kadın", sub: "Kadın tipi dökülme analizi." },
      natural: { label: "Doğal Görünüm", sub: "Kimse fark etmesin." },
      density: { label: "Maksimum Yoğunluk", sub: "Mümkün olan en sık ekim." },
      recovery: { label: "Hızlı İyileşme", sub: "İş hayatına hemen dönüş." },
    },
  },
  en: {
    analyzing: "Analyzing scalp topography...",
    mapped: "Visual patterns mapped. To calibrate the simulation age-appropriately, what is your age range?",
    calibration_complete: "Calibration complete.",
    optimizing: "Now optimizing for clinic matching (Optional). When are you looking to start?",
    generating: "Generating your secure report...",
    skip: "Skip",
    input_placeholder_email: "your@email.com",
    input_placeholder_phone: "+1 555 ...",
    steps: {
      age: "Select Age Range",
      gender: "Biological Sex",
      goal: "Primary Goal",
      history: "Previous Procedures",
      expectation: "Your Priority",
      timeline: "Timeframe",
      budget: "Budget Tier",
      location: "Preferred Location",
      meds: "Current Medication",
      consent: "Unlock Quotes",
    },
    options: {
      frontal: { label: "Frontal Hairline", sub: "Restore only the front area." },
      crown: { label: "Crown / Vertex", sub: "Fill the bald spot at the top." },
      both: { label: "Full Coverage", sub: "Density across all areas." },
      male: { label: "Male", sub: "Male pattern analysis." },
      female: { label: "Female", sub: "Female pattern analysis." },
      natural: { label: "Natural Look", sub: "Undetectable results." },
      density: { label: "Maximum Density", sub: "High volume focus." },
      recovery: { label: "Minimal Recovery", sub: "Quick return to work." },
    },
  },
  de: {
    // Placeholder for German
    analyzing: "Analyse wird gestartet...",
    mapped: "Daten verarbeitet. Wie alt sind Sie?",
    calibration_complete: "Kalibrierung abgeschlossen.",
    optimizing: "Wann möchten Sie beginnen?",
    generating: "Bericht wird erstellt...",
    skip: "Überspringen",
    input_placeholder_email: "ihre@email.com",
    input_placeholder_phone: "+49 ...",
    steps: {
      age: "Altersgruppe",
      gender: "Geschlecht",
      goal: "Zielbereich",
      history: "Frühere Eingriffe",
      expectation: "Priorität",
      timeline: "Zeitrahmen",
      budget: "Budget",
      location: "Ort",
      meds: "Medikamente",
      consent: "Kontakt",
    },
    options: {
      frontal: { label: "Vorderer Bereich", sub: "Nur Haaransatz." },
      crown: { label: "Scheitelbereich", sub: "Den oberen Bereich füllen." },
      both: { label: "Komplett", sub: "Volle Dichte überall." },
      male: { label: "Männlich", sub: "" },
      female: { label: "Weiblich", sub: "" },
      natural: { label: "Natürlicher Look", sub: "" },
      density: { label: "Maximale Dichte", sub: "" },
      recovery: { label: "Schnelle Heilung", sub: "" },
    },
  },
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidPhoneLoose = (s: string) => s.trim().length >= 7;

const AnalysisChatScreen: React.FC<AnalysisChatProps> = ({ onComplete, lang = "tr" }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS["en"];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<ChatStep>("INIT");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Consent Form State
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);
  const [contactValue, setContactValue] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const msgIdRef = useRef(1);
  const nextMsgId = () => msgIdRef.current++;

  const initialAnswers: AnalysisAnswers = useMemo(
    () => ({
      ageRange: "",
      gender: "Male",
      previousTransplant: "No",
      goal: "Frontal",
      expectation: "",
      timeline: "",
      budget: "",
      location: "",
      meds: "",
      contact: "",
      consent: false,
      lang,
    }),
    [lang]
  );

  const [answers, setAnswers] = useState<AnalysisAnswers>(initialAnswers);
  const answersRef = useRef<AnalysisAnswers>(initialAnswers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const getProgress = () => {
    // Basit ilerleme mantığı
    const steps = ["INIT", "Q_AGE", "Q_GENDER", "Q_GOAL", "Q_HISTORY", "Q_EXPECTATION", "LAYER_B_INTRO", "Q_TIMELINE", "Q_BUDGET", "Q_LOCATION", "Q_MEDS", "Q_CONSENT", "PROCESSING", "COMPLETE"];
    const index = steps.indexOf(step);
    return Math.min(100, Math.round(((index + 1) / steps.length) * 100));
  };

  const scrollToBottom = () => {
    // requestAnimationFrame ensures render is done
    requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, step, contactMethod]);

  const addAiMessage = (text: string | React.ReactNode, delay = 0, callback?: () => void) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextMsgId(), text, sender: "ai" }]);
      setIsTyping(false);
      callback?.();
    }, Math.max(0, delay));
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextMsgId(), text, sender: "user" }]);
  };

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    addAiMessage(t.analyzing, 300);
    addAiMessage(
      t.mapped,
      1200,
      () => setStep("Q_AGE")
    );
  }, [t]);

  const handleResponse = <K extends keyof AnalysisAnswers>(
    key: K,
    value: AnalysisAnswers[K] extends string ? string : string,
    nextStep: ChatStep,
    nextAiMsg?: string,
    isSkip = false,
    displayLabel?: string // User bubble'da ne görüneceği (opsiyonel)
  ) => {
    if (!isSkip) setSelectedOption(String(value));

    window.setTimeout(() => {
      // displayLabel varsa onu kullan, yoksa value'yu kullan
      const bubbleText = isSkip ? t.skip : (displayLabel || String(value));
      addUserMessage(bubbleText);

      setAnswers((prev) => {
        const updated = { ...prev, [key]: value } as AnalysisAnswers;
        answersRef.current = updated;
        return updated;
      });

      setSelectedOption(null);

      // Layer B Geçişi
      if (nextStep === "LAYER_B_INTRO") {
        setStep("PROCESSING");
        window.setTimeout(() => {
          addAiMessage(t.calibration_complete, 0);
          addAiMessage(
            t.optimizing,
            800,
            () => setStep("Q_TIMELINE")
          );
        }, 600);
        return;
      }

      if (nextAiMsg) {
        setStep("PROCESSING");
        addAiMessage(nextAiMsg, 600, () => setStep(nextStep));
      } else {
        setStep(nextStep);
      }
    }, 400); // Biraz daha doğal gecikme
  };

  const finishFlow = (finalAnswers: AnalysisAnswers) => {
    setStep("PROCESSING");
    addAiMessage(t.generating, 800, () => {
      setStep("COMPLETE");
      window.setTimeout(() => onComplete(finalAnswers), 1000);
    });
  };

  const handleConsentSubmit = () => {
    if (!contactMethod || !consentGiven) return;
    const v = contactValue.trim();
    if (contactMethod === "email" && !isValidEmail(v)) return;
    if (contactMethod === "whatsapp" && !isValidPhoneLoose(v)) return;

    addUserMessage(`Notify via ${contactMethod === "email" ? "Email" : "WhatsApp"}`);

    const finalAnswers: AnalysisAnswers = {
      ...answersRef.current,
      contact: v,
      consent: true,
      lang,
    };
    setAnswers(finalAnswers);
    finishFlow(finalAnswers);
  };

  return (
    <div className="w-full max-w-md mx-auto relative flex flex-col h-[700px] max-h-[100dvh] font-sans">
        
      {/* BACKGROUND & GLASS CONTAINER */}
      <div className="absolute inset-0 bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
         {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* HEADER */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-white/50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
            <BrainCircuit className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-sm">HairVis AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="flex flex-col items-end w-20">
             <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress()}%` }}
                    className="h-full bg-slate-800"
                 />
             </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-slate-700 text-white rounded-br-none" // Ekran görüntüsündeki koyu ton
                  : "bg-white text-slate-600 rounded-bl-none border border-slate-100"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {isTyping && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="flex justify-start"
            >
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms"}}/>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms"}}/>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms"}}/>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT / OPTIONS AREA */}
      <div className="relative z-20 bg-white/80 backdrop-blur-xl border-t border-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="p-4 pb-8 min-h-[180px] flex flex-col justify-end">
            <AnimatePresence mode="wait">
                
                {/* --- AGE QUESTION --- */}
                {step === "Q_AGE" && (
                    <OptionGroup title={t.steps.age}>
                        {["18-25", "26-35", "36-45", "46+"].map(opt => (
                            <OptionButton 
                                key={opt} 
                                label={opt} 
                                onClick={() => handleResponse("ageRange", opt, "Q_GENDER")}
                                selected={selectedOption === opt}
                                disabled={selectedOption !== null}
                            />
                        ))}
                    </OptionGroup>
                )}

                {/* --- GENDER --- */}
                {step === "Q_GENDER" && (
                    <OptionGroup title={t.steps.gender}>
                         <OptionButton label={t.options.male.label} subLabel={t.options.male.sub} onClick={() => handleResponse("gender", "Male", "Q_GOAL", undefined, false, t.options.male.label)} selected={selectedOption === "Male"} disabled={selectedOption !== null} />
                         <OptionButton label={t.options.female.label} subLabel={t.options.female.sub} onClick={() => handleResponse("gender", "Female", "Q_GOAL", undefined, false, t.options.female.label)} selected={selectedOption === "Female"} disabled={selectedOption !== null} />
                    </OptionGroup>
                )}

                {/* --- GOAL (Ekran görüntüsündeki yer) --- */}
                {step === "Q_GOAL" && (
                    <OptionGroup title={t.steps.goal}>
                        <OptionButton 
                            label={t.options.frontal.label} 
                            subLabel={t.options.frontal.sub}
                            onClick={() => handleResponse("goal", "Frontal", "Q_HISTORY", undefined, false, t.options.frontal.label)}
                            selected={selectedOption === "Frontal"}
                            disabled={selectedOption !== null}
                        />
                         <OptionButton 
                            label={t.options.crown.label} 
                            subLabel={t.options.crown.sub}
                            onClick={() => handleResponse("goal", "Crown", "Q_HISTORY", undefined, false, t.options.crown.label)}
                            selected={selectedOption === "Crown"}
                            disabled={selectedOption !== null}
                        />
                         <OptionButton 
                            label={t.options.both.label} 
                            subLabel={t.options.both.sub}
                            onClick={() => handleResponse("goal", "Both", "Q_HISTORY", undefined, false, t.options.both.label)}
                            selected={selectedOption === "Both"}
                            disabled={selectedOption !== null}
                        />
                    </OptionGroup>
                )}

                {/* --- HISTORY --- */}
                {step === "Q_HISTORY" && (
                    <OptionGroup title={t.steps.history}>
                        <OptionButton label="Hayır, İlk Kez" onClick={() => handleResponse("previousTransplant", "No", "Q_EXPECTATION")} selected={selectedOption === "No"} disabled={selectedOption !== null} />
                        <OptionButton label="Evet, Daha Önce Yaptırdım" onClick={() => handleResponse("previousTransplant", "Yes", "Q_EXPECTATION")} selected={selectedOption === "Yes"} disabled={selectedOption !== null} />
                    </OptionGroup>
                )}

                {/* --- EXPECTATION --- */}
                {step === "Q_EXPECTATION" && (
                     <OptionGroup title={t.steps.expectation}>
                        <OptionButton label={t.options.natural.label} subLabel={t.options.natural.sub} onClick={() => handleResponse("expectation", "Natural", "LAYER_B_INTRO", undefined, false, t.options.natural.label)} selected={selectedOption === "Natural"} disabled={selectedOption !== null} />
                        <OptionButton label={t.options.density.label} subLabel={t.options.density.sub} onClick={() => handleResponse("expectation", "Density", "LAYER_B_INTRO", undefined, false, t.options.density.label)} selected={selectedOption === "Density"} disabled={selectedOption !== null} />
                        <OptionButton label={t.options.recovery.label} subLabel={t.options.recovery.sub} onClick={() => handleResponse("expectation", "Recovery", "LAYER_B_INTRO", undefined, false, t.options.recovery.label)} selected={selectedOption === "Recovery"} disabled={selectedOption !== null} />
                     </OptionGroup>
                )}

                 {/* --- TIMELINE --- */}
                 {step === "Q_TIMELINE" && (
                     <OptionGroup title={t.steps.timeline} onSkip={() => handleResponse("timeline", "Skipped", "Q_BUDGET", undefined, true)}>
                        <OptionButton label="Hemen (ASAP)" onClick={() => handleResponse("timeline", "ASAP", "Q_BUDGET")} selected={selectedOption === "ASAP"} disabled={selectedOption !== null} />
                        <OptionButton label="1-3 Ay İçinde" onClick={() => handleResponse("timeline", "1-3 Months", "Q_BUDGET")} selected={selectedOption === "1-3 Months"} disabled={selectedOption !== null} />
                        <OptionButton label="Sadece Araştırıyorum" onClick={() => handleResponse("timeline", "Researching", "Q_BUDGET")} selected={selectedOption === "Researching"} disabled={selectedOption !== null} />
                     </OptionGroup>
                )}

                {/* --- BUDGET --- */}
                {step === "Q_BUDGET" && (
                     <OptionGroup title={t.steps.budget} onSkip={() => handleResponse("budget", "Skipped", "Q_LOCATION", undefined, true)}>
                        <OptionButton label="Ekonomik (€1.5k - €2.5k)" onClick={() => handleResponse("budget", "Economy", "Q_LOCATION")} selected={selectedOption === "Economy"} disabled={selectedOption !== null} />
                        <OptionButton label="Standart (€2.5k - €4k)" onClick={() => handleResponse("budget", "Standard", "Q_LOCATION")} selected={selectedOption === "Standard"} disabled={selectedOption !== null} />
                        <OptionButton label="Premium (€4k+)" onClick={() => handleResponse("budget", "Premium", "Q_LOCATION")} selected={selectedOption === "Premium"} disabled={selectedOption !== null} />
                     </OptionGroup>
                )}

                {/* --- LOCATION --- */}
                {step === "Q_LOCATION" && (
                     <OptionGroup title={t.steps.location} onSkip={() => handleResponse("location", "Skipped", "Q_MEDS", undefined, true)}>
                        <OptionButton label="Türkiye (En İyi Fiyat/Perf.)" onClick={() => handleResponse("location", "Turkey", "Q_MEDS")} selected={selectedOption === "Turkey"} disabled={selectedOption !== null} />
                        <OptionButton label="Avrupa (Yerel)" onClick={() => handleResponse("location", "Europe", "Q_MEDS")} selected={selectedOption === "Europe"} disabled={selectedOption !== null} />
                     </OptionGroup>
                )}

                {/* --- MEDS --- */}
                {step === "Q_MEDS" && (
                     <OptionGroup title={t.steps.meds} onSkip={() => handleResponse("meds", "Skipped", "Q_CONSENT", undefined, true)}>
                        <OptionButton label="Kullanmıyorum" onClick={() => handleResponse("meds", "None", "Q_CONSENT")} selected={selectedOption === "None"} disabled={selectedOption !== null} />
                        <OptionButton label="Minoxidil / Finasterid" onClick={() => handleResponse("meds", "Meds", "Q_CONSENT")} selected={selectedOption === "Meds"} disabled={selectedOption !== null} />
                        <OptionButton label="Vitamin / Takviye" onClick={() => handleResponse("meds", "Vitamins", "Q_CONSENT")} selected={selectedOption === "Vitamins"} disabled={selectedOption !== null} />
                     </OptionGroup>
                )}

                {/* --- CONSENT --- */}
                {step === "Q_CONSENT" && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                <ShieldCheck size={16} />
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Ücretsiz Fiyat Teklifi?</h4>
                                <p className="text-[10px] text-slate-500">Raporunuzu anlaşmalı kliniklerle eşleştirebiliriz.</p>
                             </div>
                        </div>

                        {!contactMethod ? (
                             <div className="grid grid-cols-2 gap-3">
                                 <button onClick={() => setContactMethod("email")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all bg-white">
                                     <Mail size={18} className="text-slate-400" />
                                     <span className="text-xs font-bold text-slate-700">Email</span>
                                 </button>
                                 <button onClick={() => setContactMethod("whatsapp")} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all bg-white">
                                     <Phone size={18} className="text-slate-400" />
                                     <span className="text-xs font-bold text-slate-700">WhatsApp</span>
                                 </button>
                             </div>
                        ) : (
                            <div className="space-y-3">
                                 <input 
                                    type={contactMethod === "email" ? "email" : "tel"}
                                    placeholder={contactMethod === "email" ? t.input_placeholder_email : t.input_placeholder_phone}
                                    value={contactValue}
                                    onChange={(e) => setContactValue(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-800 transition-colors"
                                    autoFocus
                                 />
                                 <label className="flex items-start gap-3 cursor-pointer">
                                     <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consentGiven ? "bg-slate-800 border-slate-800" : "bg-white border-slate-300"}`}>
                                         {consentGiven && <Check size={14} className="text-white" />}
                                     </div>
                                     <input type="checkbox" className="hidden" checked={consentGiven} onChange={() => setConsentGiven(!consentGiven)} />
                                     <span className="text-[10px] text-slate-500">Anonim verilerimin seçkin klinikler ile paylaşılmasını kabul ediyorum.</span>
                                 </label>
                                 <button onClick={handleConsentSubmit} disabled={!consentGiven} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase disabled:opacity-50">
                                     Raporu Gör
                                 </button>
                            </div>
                        )}
                        
                        {!contactMethod && (
                             <button onClick={() => {
                                 const final = { ...answersRef.current, consent: false, contact: "", lang };
                                 setAnswers(final);
                                 finishFlow(final);
                             }} className="w-full text-center text-[10px] font-bold text-slate-400">
                                 Hayır, sadece raporu göster
                             </button>
                        )}
                    </motion.div>
                )}

                {step === "PROCESSING" && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                            <span className="text-xs font-bold text-slate-400">İşleniyor...</span>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- YARDIMCI BİLEŞENLER ---

const OptionGroup: React.FC<{title: string, children: React.ReactNode, onSkip?: () => void}> = ({ title, children, onSkip }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -10 }}
        className="space-y-3"
    >
        <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h4>
            {onSkip && (
                <button onClick={onSkip} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    Atla <SkipForward size={10} />
                </button>
            )}
        </div>
        <div className="flex flex-col gap-2">
            {children}
        </div>
    </motion.div>
);

// EKRAN GÖRÜNTÜSÜNDEKİ STİL İÇİN DÜZENLENMİŞ BUTON
const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  subLabel,
  onClick,
  selected,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !selected}
    className={`
      w-full p-4 rounded-xl text-left transition-all relative group
      flex items-center justify-between
      ${selected 
        ? "bg-slate-50 border-2 border-slate-800 shadow-none z-10" 
        : "bg-white border border-slate-100 shadow-sm hover:border-slate-300"
      }
      ${disabled && !selected ? "opacity-40 grayscale cursor-not-allowed" : ""}
    `}
  >
    <div className="flex flex-col">
        <span className={`text-sm font-bold ${selected ? "text-slate-800" : "text-slate-700"}`}>{label}</span>
        {subLabel && <span className="text-[10px] text-slate-400 font-medium mt-0.5">{subLabel}</span>}
    </div>

    {/* Radio Circle Style */}
    <div className={`
        w-5 h-5 rounded-full border flex items-center justify-center transition-colors
        ${selected ? "border-slate-800 bg-slate-800" : "border-slate-200 group-hover:border-slate-300"}
    `}>
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
    </div>
  </button>
);

export default AnalysisChatScreen;