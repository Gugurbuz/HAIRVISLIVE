
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  LayoutGrid,
  Crown,
  Lock,
  Star,
  BarChart3,
  HelpCircle,
  CreditCard,
  Globe,
  User,
  Mail,
  Search
} from "lucide-react";

interface PartnerJoinProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const PartnerJoinScreen: React.FC<PartnerJoinProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    clinicName: "",
    website: "",
    contactName: "",
    role: "",
    email: "",
    phone: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const payload = {
      ...formData,
      plan: "CoE",
      price: 99
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500 selection:text-black overflow-x-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-amber-900/10 rounded-[100%] blur-[120px] mix-blend-screen opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] opacity-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Crown size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-white">HAIR<span className="text-amber-500">VIS</span></span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-0.5">Clinic Program</span>
            </div>
          </div>
          <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
            Back
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative z-10 pt-24 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-xl"
          >
            <Crown size={12} className="fill-current" /> Clinic Upgrade
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95]"
          >
            Be visible where <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 drop-shadow-lg">
              decisions happen
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Work with prepared patients. Respond with clarity.<br/> Stand out with trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-6 pb-2"
          >
              <div className="inline-flex flex-col items-center p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-5xl font-black text-white">€99 <span className="text-sm font-medium text-slate-500">/ month</span></span>
                  <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-amber-500/20 rounded-lg border border-amber-500/20">
                      <CreditCard size={12} className="text-amber-400" />
                      <span className="text-[10px] text-amber-200 font-bold uppercase tracking-widest">Includes 30 Engagement Passes</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-3">Cancel anytime</span>
              </div>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={() => window.scrollTo({ top: 1500, behavior: 'smooth' })} className="px-8 py-4 bg-amber-500 text-[#020617] rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-amber-400 hover:scale-105 transition-all shadow-lg shadow-amber-500/20">
                Upgrade to CoE
             </button>
             <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-white/10 transition-all">
                See how it works
             </button>
          </div>
        </div>
      </div>

      {/* WHAT'S INCLUDED */}
      <div className="relative z-10 py-20 px-6 bg-white/[0.02] border-y border-white/5">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
             <div className="space-y-10">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">What's Included</h3>
                    <ul className="space-y-4">
                        {[
                            "Direct patient booking from profile",
                            "30 Engagement Passes / month",
                            "Priority access to suitable cases",
                            "CoE badge visible to patients",
                            "\"Responds within 24h\" trust signal",
                            "Proposal snapshot (graft & price range)",
                            "Recommended visibility in patient feed"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                <span className="text-sm font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
             </div>

             <div className="space-y-6">
                 <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                     <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Search size={18} className="text-amber-500" /> What CoE Is:</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">
                        A professional standard for clinics that respond clearly and on time. It signals readiness and quality to patients who are comparing options.
                     </p>
                 </div>
                 
                 <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                     <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Lock size={18} className="text-slate-500" /> What CoE Is Not:</h4>
                     <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-slate-400 text-sm">
                            <div className="w-4 h-4 rounded-full border border-red-500/50 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-0.5 bg-red-500" /></div>
                            Not a price-comparison marketplace
                        </li>
                        <li className="flex items-start gap-2 text-slate-400 text-sm">
                            <div className="w-4 h-4 rounded-full border border-red-500/50 flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-0.5 bg-red-500" /></div>
                            Not pay-to-win listings
                        </li>
                     </ul>
                 </div>
             </div>
         </div>
      </div>

      {/* APPLICATION FORM */}
      <div className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto bg-[#0A0F19]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-2">Upgrade to Center of Excellence</h2>
                <p className="text-slate-400 text-sm">Activation is instant.</p>
            </div>

            <form className="space-y-6">
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
                <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup 
                        icon={User} 
                        label="Contact Name" 
                        placeholder="Full Name" 
                        value={formData.contactName} 
                        onChange={(v: string) => handleInputChange('contactName', v)}
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
                </div>

                <div className="pt-6">
                    <button 
                        type="button" 
                        onClick={() => onSubmit(payload)} 
                        className="w-full py-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-[#020617] rounded-xl font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 group"
                    >
                        Upgrade to CoE <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
                        Secure Payment • Instant Access
                    </p>
                </div>
            </form>
        </div>
      </div>

      <div className="text-center pb-10 space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Clinics don't compete on price. They compete on clarity and trust.
        </p>
        <div className="text-[10px] text-slate-600 font-medium">
            © 2025 HairVis Partner Network. All rights reserved.
        </div>
      </div>
    </div>
  );
};

/* ---------------- HELPER COMPONENTS ---------------- */

const ValueCard = ({ icon, title, desc }: any) => (
    <div className="bg-[#0E1520] border border-white/5 p-8 rounded-[2rem] hover:bg-white/5 transition-colors group">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform group-hover:bg-amber-500/20 group-hover:text-amber-400">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const InputGroup = ({ icon: Icon, label, placeholder, focused, setFocused, value, onChange }: any) => {
    const isFocused = focused === label;
    return (
        <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isFocused ? 'text-amber-500' : 'text-slate-500'}`}>
                {label}
            </label>
            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-amber-500' : 'text-slate-600'}`}>
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
                        ${isFocused ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/10 hover:border-white/20'}
                    `} 
                />
            </div>
        </div>
    );
};

export default PartnerJoinScreen;
