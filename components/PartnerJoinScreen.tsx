import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Star,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Info,
  Zap,
  MessageSquare,
  Building2,
  Globe,
  User,
  Mail,
  Phone,
  LayoutGrid
} from "lucide-react";

interface PartnerJoinProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

type PlanId = "starter" | "growth" | "pro";
type BillingTerm = "monthly" | "m3" | "m6" | "m12";

const PartnerJoinScreen: React.FC<PartnerJoinProps> = ({ onSubmit, onBack }) => {
  const [plan, setPlan] = useState<PlanId>("growth");
  const [term, setTerm] = useState<BillingTerm>("monthly");
  
  // Form focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Basic Form State
  const [formData, setFormData] = useState({
    clinicName: "",
    website: "",
    contactName: "",
    role: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const PLANS: Record<PlanId, {
      id: PlanId;
      title: string;
      monthlyEur: number;
      creditsPerMonth: number;
      desc: string;
      bullets: string[];
      badge?: string;
      highlight?: boolean;
    }> = {
    starter: {
      id: "starter",
      title: "Starter",
      monthlyEur: 199,
      creditsPerMonth: 20,
      desc: "Butik klinikler için giriş paketi.",
      bullets: [
        "20 Kredi / Ay",
        "Temel Partner Paneli",
        "Manuel Talep Açma",
        "Email Desteği",
      ],
    },
    growth: {
      id: "growth",
      title: "Growth",
      monthlyEur: 399,
      creditsPerMonth: 60,
      desc: "Büyüyen ekipler için ideal.",
      bullets: [
        "60 Kredi / Ay",
        "WhatsApp Bildirimleri",
        "5 Kişilik Ekip Erişimi",
        "Öncelikli Sıralama",
        "Detaylı Analitik",
      ],
      badge: "En Popüler",
      highlight: true,
    },
    pro: {
      id: "pro",
      title: "Pro",
      monthlyEur: 649,
      creditsPerMonth: 120,
      desc: "Yüksek hacimli operasyonlar.",
      bullets: [
        "120 Kredi / Ay",
        "Sınırsız Ekip Erişimi",
        "CRM Entegrasyonu (API)",
        "Özel Hesap Yöneticisi",
        "Top Ranking",
      ],
    },
  };

  const TERMS: Record<BillingTerm, { id: BillingTerm; label: string; months: number; discountPct: number; helper: string }> = {
    monthly: { id: "monthly", label: "Aylık", months: 1, discountPct: 0, helper: "Esnek" },
    m3: { id: "m3", label: "3 Ay", months: 3, discountPct: 10, helper: "%10 İndirim" },
    m6: { id: "m6", label: "6 Ay", months: 6, discountPct: 15, helper: "%15 İndirim" },
    m12: { id: "m12", label: "Yıllık", months: 12, discountPct: 25, helper: "%25 İndirim" },
  };

  const selectedPlan = PLANS[plan];
  const selectedTerm = TERMS[term];

  const pricing = useMemo(() => {
    const baseMonthly = selectedPlan.monthlyEur;
    const months = selectedTerm.months;
    const discount = selectedTerm.discountPct;

    const subtotal = baseMonthly * months;
    const discountedSubtotal = Math.round(subtotal * (1 - discount / 100));
    const effectiveMonthly = Math.round(discountedSubtotal / months);

    return { baseMonthly, months, discount, subtotal, discountedSubtotal, effectiveMonthly };
  }, [selectedPlan.monthlyEur, selectedTerm.months, selectedTerm.discountPct]);

  const payload = useMemo(() => {
    return {
      ...formData,
      selection: {
        plan: selectedPlan.id,
        term: selectedTerm.id,
        price: pricing.discountedSubtotal
      }
    };
  }, [formData, selectedPlan, selectedTerm, pricing]);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-teal-500 selection:text-white overflow-x-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-teal-900/10 rounded-[100%] blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-white">HAIR<span className="text-teal-500">VIS</span></span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-0.5">Partner Access</span>
            </div>
          </div>
          <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
            Back
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative z-10 pt-24 pb-12 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-teal-300 text-[10px] font-black uppercase tracking-widest shadow-xl"
          >
            <Star size={10} className="fill-current" /> Official Partner Program
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95]"
          >
            Choose your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-teal-200 drop-shadow-2xl">
              Growth Engine.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Join 250+ clinics using HairVis to manage qualified patient cases. <br/>
            Select a membership tier to unlock your clinic dashboard.
          </motion.p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 py-10 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Term Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div>
              <h2 className="text-3xl font-black text-white">Select Membership</h2>
              <p className="text-slate-400 mt-2">Commit longer to save up to 25% on platform fees.</p>
            </div>
            <TermToggle term={term} setTerm={setTerm} terms={TERMS} />
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(PLANS).map((p) => (
              <PlanCard
                key={p.id}
                selected={plan === p.id}
                onClick={() => setPlan(p.id)}
                title={p.title}
                desc={p.desc}
                badge={p.badge}
                highlight={p.highlight}
                creditsPerMonth={p.creditsPerMonth}
                displayPrice={renderPlanPrice(p.monthlyEur, TERMS[term])}
                bullets={p.bullets}
              />
            ))}
          </div>

          {/* Summary & Transition */}
          <div className="rounded-3xl border border-white/10 bg-[#0A0F19]/70 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <ShieldCheck size={32} />
                </div>
                <div className="space-y-1">
                    <div className="text-white font-black tracking-tight text-xl">
                        {selectedPlan.title} Membership
                    </div>
                    <div className="text-slate-400 text-sm">
                        Includes <b className="text-white">{selectedPlan.creditsPerMonth} credits</b> every month.
                    </div>
                    {term !== 'monthly' && (
                        <div className="text-[10px] text-teal-400 font-bold uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded w-fit mt-1">
                            {selectedTerm.helper} Applied
                        </div>
                    )}
                </div>
            </div>

            <div className="text-right hidden md:block">
                <div className="text-3xl font-black text-white">€{pricing.discountedSubtotal}</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                    Billed {selectedTerm.label}
                </div>
            </div>
          </div>

        </div>
      </div>

      {/* Form Section */}
      <div className="relative z-10 py-16 px-6">
        <div className="max-w-3xl mx-auto bg-[#0A0F19]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Decoration Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
            
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-2">Final Step</h2>
                <p className="text-slate-400 text-sm">Complete your clinic profile to activate your {selectedPlan.title} plan.</p>
            </div>

            <form className="space-y-8">
                {/* Clinic Info */}
                <div className="space-y-6">
                    <SectionHeader title="Clinic Information" icon={Building2} />
                    <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup 
                            icon={LayoutGrid} 
                            label="Clinic Name" 
                            placeholder="e.g. Elite Hair" 
                            value={formData.clinicName} 
                            onChange={(v: string) => handleInputChange('clinicName', v)}
                            focused={focusedField} 
                            setFocused={setFocusedField} 
                        />
                        <InputGroup 
                            icon={Globe} 
                            label="Website" 
                            placeholder="https://" 
                            value={formData.website} 
                            onChange={(v: string) => handleInputChange('website', v)}
                            focused={focusedField} 
                            setFocused={setFocusedField} 
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    <SectionHeader title="Admin Contact" icon={User} />
                    <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup 
                            icon={User} 
                            label="Full Name" 
                            placeholder="Your Name" 
                            value={formData.contactName} 
                            onChange={(v: string) => handleInputChange('contactName', v)}
                            focused={focusedField} 
                            setFocused={setFocusedField} 
                        />
                        <InputGroup 
                            icon={ShieldCheck} 
                            label="Role" 
                            placeholder="e.g. Director" 
                            value={formData.role} 
                            onChange={(v: string) => handleInputChange('role', v)}
                            focused={focusedField} 
                            setFocused={setFocusedField} 
                        />
                        <InputGroup 
                            icon={Mail} 
                            label="Email" 
                            placeholder="official@clinic.com" 
                            value={formData.email} 
                            onChange={(v: string) => handleInputChange('email', v)}
                            focused={focusedField} 
                            setFocused={setFocusedField} 
                        />
                        <InputGroup 
                            icon={Phone} 
                            label="Phone" 
                            placeholder="+90..." 
                            value={formData.phone} 
                            onChange={(v: string) => handleInputChange('phone', v)}
                            focused={focusedField} 
                            setFocused={setFocusedField} 
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-6 md:hidden">
                        <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total Due:</span>
                        <span className="text-xl font-black text-white">€{pricing.discountedSubtotal}</span>
                    </div>

                    <button 
                        type="button" 
                        onClick={() => onSubmit(payload)} 
                        className="w-full py-5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Complete Application <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 mt-6 opacity-50">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <ShieldCheck size={12} /> Secure Data
                        </div>
                        <div className="h-3 w-px bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <Zap size={12} /> Instant Access
                        </div>
                    </div>
                </div>
            </form>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-600 pb-10 font-medium">
        © 2025 HairVis Partner Network. All rights reserved.
      </div>
    </div>
  );
};

/* ---------------- HELPER COMPONENTS ---------------- */

const SectionHeader = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Icon size={14} className="text-teal-500" />
        <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">{title}</span>
    </div>
);

const InputGroup = ({ icon: Icon, label, placeholder, focused, setFocused, value, onChange }: any) => {
    const isFocused = focused === label;
    return (
        <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isFocused ? 'text-teal-500' : 'text-slate-500'}`}>
                {label}
            </label>
            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-teal-500' : 'text-slate-600'}`}>
                    <Icon size={18} />
                </div>
                <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onFocus={() => setFocused(label)}
                    onBlur={() => setFocused(null)}
                    className={`
                        w-full bg-[#050B14] border rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-700 
                        focus:outline-none transition-all duration-300
                        ${isFocused ? 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.1)]' : 'border-white/10 hover:border-white/20'}
                    `} 
                />
            </div>
        </div>
    );
};

const TermToggle = ({ term, setTerm, terms }: any) => (
  <div className="inline-flex p-1 rounded-2xl border border-white/10 bg-white/[0.03]">
    {Object.values(terms).map((t: any) => {
      const active = term === t.id;
      return (
        <button
          key={t.id}
          type="button"
          onClick={() => setTerm(t.id)}
          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            active ? "bg-teal-500 text-[#020617] shadow-lg shadow-teal-500/20" : "text-slate-400 hover:text-white"
          }`}
          title={t.helper}
        >
          {t.label}
          {t.discountPct > 0 && (
             <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded ${active ? "bg-[#020617]/20 text-[#020617]" : "bg-teal-500/10 text-teal-400"}`}>
                -{t.discountPct}%
             </span>
          )}
        </button>
      );
    })}
  </div>
);

function renderPlanPrice(monthly: number, term: { months: number; discountPct: number; label: string }) {
  if (term.months === 1) return { main: `€${monthly}`, sub: "/mo", note: "Billed Monthly" };
  const subtotal = monthly * term.months;
  const discounted = Math.round(subtotal * (1 - term.discountPct / 100));
  const effective = Math.round(discounted / term.months);
  return { main: `€${effective}`, sub: "/mo", note: `Billed €${discounted} every ${term.months}mo` };
}

const PlanCard = ({ selected, onClick, title, desc, badge, highlight, creditsPerMonth, displayPrice, bullets }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      text-left rounded-[2rem] p-8 border transition-all duration-300 relative group w-full flex flex-col h-full
      ${selected
        ? "border-teal-500/60 bg-teal-500/10 shadow-[0_0_0_1px_rgba(20,184,166,0.25),0_20px_60px_rgba(0,0,0,0.35)] z-10 scale-[1.02]"
        : highlight
        ? "border-white/10 bg-[#0B101A] hover:border-white/20 hover:bg-[#0E1520]"
        : "border-white/5 bg-[#0B101A]/70 hover:border-white/10 hover:bg-[#0E1520]"
      }
    `}
  >
    {badge && (
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
          selected ? "bg-teal-500 text-[#020617]" : "bg-white/10 text-slate-200 border border-white/10"
      }`}>
        {badge}
      </div>
    )}

    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className={`text-xl font-black ${selected ? 'text-white' : 'text-slate-200'}`}>{title}</div>
        <div className="text-xs text-slate-500 mt-1 leading-relaxed h-8">{desc}</div>
      </div>
      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
          selected ? "border-teal-500 bg-teal-500" : "border-white/10 bg-white/5"
      }`}>
        {selected && <CheckCircle2 size={16} className="text-[#020617]" />}
      </div>
    </div>

    <div className="pb-6 border-b border-white/5 space-y-1">
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-black ${selected ? "text-teal-300" : "text-white"}`}>{displayPrice.main}</span>
        <span className="text-sm text-slate-500 font-medium">{displayPrice.sub}</span>
      </div>
      <div className="text-[10px] text-slate-500 font-medium tracking-wide">{displayPrice.note}</div>

      <div className={`mt-5 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${
          selected ? "bg-teal-500/20 border-teal-500/30 text-teal-300" : "bg-white/5 border-white/10 text-slate-300"
      }`}>
        <CreditCard size={14} />
        {creditsPerMonth} Credits / Month
      </div>
    </div>

    <ul className="mt-6 space-y-4 flex-1">
      {bullets.map((b: string, i: number) => (
        <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
          <CheckCircle2 size={14} className={`${selected ? "text-teal-400" : "text-slate-600"} shrink-0 mt-0.5`} />
          <span className="font-medium leading-relaxed">{b}</span>
        </li>
      ))}
    </ul>
  </button>
);

export default PartnerJoinScreen;