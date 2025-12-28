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
} from "lucide-react";
import { LanguageCode } from "../translations";

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
  timeline: string; // can be "Skipped"
  budget: string; // can be "Skipped"
  location: string; // can be "Skipped"
  meds: string; // can be "Skipped"
  contact: string;
  consent: boolean;
  lang: LanguageCode;
};

type Option = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  centered?: boolean;
};

type StepConfig = {
  question: string;
  key?: keyof AnalysisAnswers; // where to store answer
  options?: Option[];
  allowSkip?: boolean;
  skipValue?: string;
  next?: ChatStep;
  // next can also be computed via function if needed
  nextFn?: (value: string, current: AnalysisAnswers) => ChatStep;
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidPhoneLoose = (s: string) => s.trim().replace(/\s/g, "").length >= 7;

const AnalysisChatScreen: React.FC<AnalysisChatProps> = ({ onComplete, lang }) => {
  // ---------- Messages ----------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // ---------- Steps ----------
  const [step, setStep] = useState<ChatStep>("INIT");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // ---------- Consent ----------
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);
  const [contactValue, setContactValue] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  // ---------- Refs ----------
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const msgIdRef = useRef(1);

  const nextMsgId = () => msgIdRef.current++;

  // ---------- Answers ----------
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

  // ---------- Step Config ----------
  const steps: Record<Exclude<ChatStep, "INIT" | "PROCESSING" | "COMPLETE">, StepConfig> =
    useMemo(
      () => ({
        Q_AGE: {
          question: "Doğru simülasyon için yaş aralığınızı seçer misiniz?",
          key: "ageRange",
          options: [
            { label: "18-25", value: "18-25", centered: true },
            { label: "26-35", value: "26-35", centered: true },
            { label: "36-45", value: "36-45", centered: true },
            { label: "46+", value: "46+", centered: true },
          ],
          next: "Q_GENDER",
        },
        Q_GENDER: {
          question: "Biyolojik cinsiyet (saç dökülme paterni için önemli).",
          key: "gender",
          options: [
            { label: "Erkek", value: "Male", centered: true },
            { label: "Kadın", value: "Female", centered: true },
          ],
          next: "Q_GOAL",
        },
        Q_GOAL: {
          question: "Birincil hedefiniz hangi bölge?",
          key: "goal",
          options: [
            {
              label: "Ön Bölge / Saç Çizgisi",
              value: "Frontal",
              icon: <ChevronRight size={16} />,
            },
            {
              label: "Tepe Bölgesi (Vertex)",
              value: "Crown",
              icon: <ChevronRight size={16} />,
            },
            {
              label: "Genel / Her İkisi",
              value: "Both",
              icon: <ChevronRight size={16} />,
            },
          ],
          next: "Q_HISTORY",
        },
        Q_HISTORY: {
          question: "Daha önce saç ekimi yaptırdınız mı?",
          key: "previousTransplant",
          options: [
            { label: "Hayır, ilk kez", value: "No", centered: true },
            { label: "Evet", value: "Yes", centered: true },
          ],
          next: "Q_EXPECTATION",
        },
        Q_EXPECTATION: {
          question: "Önceliğiniz nedir?",
          key: "expectation",
          options: [
            { label: "Doğal görünüm", value: "Natural", icon: <Star size={14} /> },
            { label: "Maksimum yoğunluk", value: "Density", icon: <Zap size={14} /> },
            { label: "Minimal toparlanma", value: "Recovery", icon: <Activity size={14} /> },
          ],
          next: "Q_TIMELINE",
        },
        Q_TIMELINE: {
          question: "Ne zaman başlamayı düşünüyorsunuz? (Opsiyonel)",
          key: "timeline",
          allowSkip: true,
          skipValue: "Skipped",
          options: [
            { label: "Hemen", value: "ASAP", centered: true },
            { label: "1-3 Ay", value: "1-3 Months", centered: true },
            { label: "3-6 Ay", value: "3-6 Months", centered: true },
            { label: "Sadece araştırıyorum", value: "Researching", centered: true },
          ],
          next: "Q_BUDGET",
        },
        Q_BUDGET: {
          question: "Bütçe aralığı (Opsiyonel)",
          key: "budget",
          allowSkip: true,
          skipValue: "Skipped",
          options: [
            { label: "Ekonomik (€1.5k - €2.5k)", value: "Economy" },
            { label: "Standart (€2.5k - €4k)", value: "Standard" },
            { label: "Premium (€4k+)", value: "Premium" },
          ],
          next: "Q_LOCATION",
        },
        Q_LOCATION: {
          question: "Tercih ettiğiniz lokasyon (Opsiyonel)",
          key: "location",
          allowSkip: true,
          skipValue: "Skipped",
          options: [
            { label: "Türkiye (Fiyat/Performans)", value: "Turkey", icon: <Globe size={14} /> },
            { label: "Avrupa / UK", value: "Europe", icon: <MapPin size={14} /> },
            { label: "Fark etmez", value: "Any", icon: <Check size={14} /> },
          ],
          next: "Q_MEDS",
        },
        Q_MEDS: {
          question: "Şu an kullandığınız bir medikal ürün var mı? (Opsiyonel)",
          key: "meds",
          allowSkip: true,
          skipValue: "Skipped",
          options: [
            { label: "Yok", value: "None" },
            { label: "Minoxidil / Finasteride", value: "Meds", icon: <Pill size={14} /> },
            { label: "Vitamin / Takviye", value: "Vitamins", icon: <Sparkles size={14} /> },
          ],
          next: "Q_CONSENT",
        },
        Q_CONSENT: {
          question:
            "İsterseniz raporu seçili klinik partnerlerle anonim olarak paylaşarak fiyat teklifi alabilirsiniz.",
        },
      }),
      []
    );

  // ---------- Progress ----------
  const getProgress = () => {
    switch (step) {
      case "INIT":
        return 5;
      case "Q_AGE":
        return 12;
      case "Q_GENDER":
        return 22;
      case "Q_GOAL":
        return 32;
      case "Q_HISTORY":
        return 42;
      case "Q_EXPECTATION":
        return 52;
      case "Q_TIMELINE":
        return 62;
      case "Q_BUDGET":
        return 70;
      case "Q_LOCATION":
        return 78;
      case "Q_MEDS":
        return 86;
      case "Q_CONSENT":
        return 92;
      case "PROCESSING":
        return 98;
      case "COMPLETE":
        return 100;
      default:
        return 0;
    }
  };

  const scrollToBottom = () => {
    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, step, contactMethod]);

  // ---------- Message helpers ----------
  const addAiMessage = (text: string | React.ReactNode, delay = 0, cb?: () => void) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextMsgId(), text, sender: "ai" }]);
      setIsTyping(false);
      cb?.();
    }, Math.max(0, delay));
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextMsgId(), text, sender: "user" }]);
  };

  // ---------- Deterministic step runner ----------
  const runStep = (next: ChatStep) => {
    // only one step visible at a time
    setSelectedOption(null);

    if (next === "PROCESSING") {
      setStep("PROCESSING");
      return;
    }
    if (next === "COMPLETE") {
      setStep("COMPLETE");
      return;
    }

    // Ask question for that step first, then show options
    const cfg = steps[next as Exclude<ChatStep, "INIT" | "PROCESSING" | "COMPLETE">];
    if (!cfg) {
      setStep(next);
      return;
    }

    // show short processing flash for better rhythm
    setStep("PROCESSING");
    addAiMessage(cfg.question, 450, () => {
      setStep(next);
    });
  };

  // ---------- Start flow ----------
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    addAiMessage("Analiz motoru başlatılıyor…", 250);
    addAiMessage("Görüntü paternleri çıkarılıyor…", 650, () => {
      runStep("Q_AGE");
    });
  }, []);

  // ---------- Handle option selection ----------
  const handleSelect = (value: string, isSkip = false) => {
    const cfg = steps[step as Exclude<ChatStep, "INIT" | "PROCESSING" | "COMPLETE">];
    if (!cfg) return;

    // visual lock
    if (!isSkip) setSelectedOption(value);
    else setSelectedOption("SKIP_LOCK");

    window.setTimeout(() => {
      addUserMessage(isSkip ? "Atla" : prettyUserValue(step, value));

      // persist answer if key exists
      if (cfg.key) {
        const key = cfg.key;

        setAnswers((prev) => {
          const updated = { ...prev, [key]: value } as AnalysisAnswers;
          answersRef.current = updated;
          return updated;
        });
      }

      // Next step
      if (step === "Q_MEDS") {
        // go to consent
        runStep("Q_CONSENT");
        return;
      }

      const next =
        cfg.nextFn?.(value, answersRef.current) ||
        cfg.next ||
        "Q_CONSENT";

      runStep(next);
    }, 220);
  };

  const prettyUserValue = (s: ChatStep, v: string) => {
    if (s === "Q_GENDER") return v === "Male" ? "Erkek" : "Kadın";
    if (s === "Q_GOAL") {
      if (v === "Frontal") return "Ön Bölge / Saç Çizgisi";
      if (v === "Crown") return "Tepe (Vertex)";
      return "Genel / Her İkisi";
    }
    if (s === "Q_HISTORY") return v === "Yes" ? "Evet" : "Hayır";
    if (s === "Q_EXPECTATION") {
      if (v === "Natural") return "Doğal görünüm";
      if (v === "Density") return "Maksimum yoğunluk";
      return "Minimal toparlanma";
    }
    if (s === "Q_BUDGET") {
      if (v === "Economy") return "Ekonomik";
      if (v === "Standard") return "Standart";
      if (v === "Premium") return "Premium";
    }
    if (s === "Q_LOCATION") {
      if (v === "Turkey") return "Türkiye";
      if (v === "Europe") return "Avrupa / UK";
      return "Fark etmez";
    }
    if (s === "Q_MEDS") {
      if (v === "None") return "Yok";
      if (v === "Meds") return "Minoxidil / Finasteride";
      return "Vitamin / Takviye";
    }
    return v;
  };

  // ---------- Consent ----------
  const canSubmitConsent = () => {
    if (!contactMethod) return false;
    if (!consentGiven) return false;
    const v = contactValue.trim();
    if (contactMethod === "email") return isValidEmail(v);
    return isValidPhoneLoose(v);
  };

  const finishFlow = (finalAnswers: AnalysisAnswers) => {
    setStep("PROCESSING");
    addAiMessage("Rapor hazırlanıyor…", 600, () => {
      setStep("COMPLETE");
      window.setTimeout(() => onComplete(finalAnswers), 650);
    });
  };

  const handleConsentSubmit = () => {
    if (!contactMethod) return;
    if (!canSubmitConsent()) return;

    const v = contactValue.trim();
    addUserMessage(`Bildirim: ${contactMethod === "email" ? "E-posta" : "WhatsApp"}`);

    const finalAnswers: AnalysisAnswers = {
      ...answersRef.current,
      contact: v,
      consent: true,
      lang,
    };
    setAnswers(finalAnswers);
    answersRef.current = finalAnswers;

    finishFlow(finalAnswers);
  };

  const handleConsentSkip = () => {
    addUserMessage("Sadece raporu görmek istiyorum.");

    const finalAnswers: AnalysisAnswers = {
      ...answersRef.current,
      contact: "",
      consent: false,
      lang,
    };
    setAnswers(finalAnswers);
    answersRef.current = finalAnswers;

    finishFlow(finalAnswers);
  };

  // ---------- UI helpers ----------
  const headerStatus =
    step === "Q_CONSENT" || step === "PROCESSING" || step === "COMPLETE"
      ? "Finalizing"
      : "Calibrating";

  const currentCfg =
    step !== "INIT" && step !== "PROCESSING" && step !== "COMPLETE"
      ? steps[step as Exclude<ChatStep, "INIT" | "PROCESSING" | "COMPLETE">]
      : null;

  const showOptions =
    step !== "INIT" && step !== "PROCESSING" && step !== "COMPLETE" && step !== "Q_CONSENT";

  // ---------- Render ----------
  return (
    <div className="w-full max-w-md relative flex flex-col h-[650px] font-sans mx-auto">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-teal-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-indigo-400/10 rounded-full blur-[60px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[2.5rem] m-2 border border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/30 flex items-center justify-between bg-white/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 relative">
              <BrainCircuit className="w-5 h-5 text-teal-600" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-slate-800 font-bold text-sm tracking-tight">HairVis AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-teal-500 rounded-full" />
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  {headerStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col items-end w-16">
            <div className="text-[9px] font-black text-teal-600 mb-1">{getProgress()}%</div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgress()}%` }}
                className="h-full bg-teal-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Chat */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
          style={{
            // ✅ prevents bottom area overlap
            paddingBottom: 220,
          }}
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm backdrop-blur-sm ${
                  msg.sender === "user"
                    ? "bg-[#0E1A2B] text-white rounded-br-none shadow-lg shadow-slate-900/10"
                    : "bg-white/85 text-slate-700 border border-white rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/60 border border-white/40 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center backdrop-blur-sm">
                <Sparkles size={14} className="text-teal-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  İşleniyor
                </span>
              </div>
            </div>
          )}

          {/* Consent block is in chat stream (clean UX) */}
          {step === "Q_CONSENT" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 border border-teal-100 p-5 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0E1A2B] text-sm">Klinik Teklifleri?</h4>
                  <p className="text-[10px] text-slate-500">
                    Anonim raporu seçili klinik partnerlerle eşleştirebiliriz.
                  </p>
                </div>
              </div>

              {!contactMethod ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setContactMethod("email")}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all bg-white"
                  >
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">E-posta</span>
                  </button>
                  <button
                    onClick={() => setContactMethod("whatsapp")}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all bg-white"
                  >
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">WhatsApp</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={contactMethod === "email" ? "email" : "tel"}
                      placeholder={contactMethod === "email" ? "ornek@email.com" : "+90 5xx xxx xx xx"}
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-teal-500 outline-none"
                      autoFocus
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {contactMethod === "email" ? <Mail size={16} /> : <Phone size={16} />}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        consentGiven
                          ? "bg-teal-500 border-teal-500"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {consentGiven && <Check size={14} className="text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={consentGiven}
                      onChange={() => setConsentGiven((v) => !v)}
                    />
                    <span className="text-[10px] text-slate-500 leading-tight">
                      Anonim rapor verilerimin seçili kliniklerle paylaşılmasına ve teklif almaya onay veriyorum.
                    </span>
                  </label>

                  <button
                    onClick={handleConsentSubmit}
                    disabled={!canSubmitConsent()}
                    className="w-full py-3 bg-[#0E1A2B] text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-600 transition-colors shadow-lg"
                  >
                    Teklif Al
                  </button>

                  <p className="text-[10px] text-slate-400">
                    {contactMethod === "email" && contactValue.trim() && !isValidEmail(contactValue)
                      ? "Geçerli bir e-posta girin."
                      : null}
                    {contactMethod === "whatsapp" &&
                    contactValue.trim() &&
                    !isValidPhoneLoose(contactValue)
                      ? "Geçerli bir telefon girin."
                      : null}
                  </p>
                </div>
              )}

              {!contactMethod ? (
                <button
                  onClick={handleConsentSkip}
                  className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Hayır, sadece raporu göster
                </button>
              ) : (
                <button
                  onClick={() => {
                    setContactMethod(null);
                    setContactValue("");
                    setConsentGiven(false);
                  }}
                  className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Geri
                </button>
              )}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom action area (only options/progress states) */}
        <div className="absolute left-0 right-0 bottom-0 p-4 border-t border-white/30 bg-white/40 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {/* OPTIONS */}
            {showOptions && currentCfg?.options && (
              <motion.div
                key={`opts-${step}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Seçim Yapın
                  </p>

                  {currentCfg.allowSkip && (
                    <button
                      onClick={() => handleSelect(currentCfg.skipValue || "Skipped", true)}
                      disabled={selectedOption !== null}
                      className="text-[10px] text-slate-400 font-bold hover:text-teal-600 flex items-center gap-1 disabled:opacity-40"
                    >
                      Atla <SkipForward size={10} />
                    </button>
                  )}
                </div>

                {/* grid only when centered options */}
                {currentCfg.options.every((o) => o.centered) ? (
                  <div className="grid grid-cols-2 gap-2">
                    {currentCfg.options.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        label={opt.label}
                        icon={opt.icon}
                        onClick={() => handleSelect(opt.value)}
                        centered
                        selected={selectedOption === opt.value}
                        disabled={selectedOption !== null}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentCfg.options.map((opt) => (
                      <OptionButton
                        key={opt.value}
                        label={opt.label}
                        icon={opt.icon}
                        onClick={() => handleSelect(opt.value)}
                        centered={opt.centered}
                        selected={selectedOption === opt.value}
                        disabled={selectedOption !== null}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* PROCESSING */}
            {step === "PROCESSING" && !isTyping && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-3 space-y-2"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={14} className="text-teal-500 fill-current" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  Hesaplanıyor…
                </p>
              </motion.div>
            )}

            {/* COMPLETE */}
            {step === "COMPLETE" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 text-white">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-[#0E1A2B] font-black text-sm">Rapor hazır</div>
                  <div className="text-slate-400 text-[10px] font-medium">Panel açılıyor…</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

type OptionButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  centered?: boolean;
  selected?: boolean;
  disabled?: boolean;
};

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  icon,
  onClick,
  centered,
  selected,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-5 rounded-xl text-xs font-bold transition-all
        flex items-center group active:scale-[0.985]
        focus:outline-none focus:ring-2 focus:ring-teal-500/50
        ${centered ? "justify-center text-center" : "justify-between text-left"}
        ${
          selected
            ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
            : "bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-[#0E1A2B] hover:shadow-md"
        }
        ${disabled && !selected ? "opacity-50 cursor-not-allowed grayscale" : ""}
      `}
    >
      <span className="flex items-center gap-2">
        {!centered && (
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              selected ? "border-white/60" : "border-slate-300"
            }`}
          >
            {selected ? <span className="w-2 h-2 rounded-full bg-white" /> : null}
          </span>
        )}
        <span>{label}</span>
      </span>

      {icon && !selected && !centered && (
        <span className="text-slate-300 group-hover:text-teal-500 transition-colors">{icon}</span>
      )}

      {selected && centered && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      )}
    </button>
  );
};

export default AnalysisChatScreen;
