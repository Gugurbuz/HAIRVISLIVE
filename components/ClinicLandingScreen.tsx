
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  ChevronRight, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Globe,
  LayoutGrid,
  Wallet,
  Search,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

interface ClinicLandingProps {
  onLogin: () => void;
  onApply: () => void;
  onBack: () => void;
}

const ClinicLandingScreen: React.FC<ClinicLandingProps> = ({ onLogin, onApply, onBack }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    if (typeof window !== 'undefined') {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050B14] text-white selection:bg-teal-500 selection:text-white overflow-x-hidden font-sans w-full">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-teal-900/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-indigo-900/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050B14]/80 backdrop-blur-md w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onBack}>
                {/* UNIFIED LOGO */}
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center border border-teal-400/20 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M7 4c4 4-4 12 0 16" />
                      <path d="M12 4c4 4-4 12 0 16" />
                      <path d="M17 4c4 4-4 12 0 16" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight leading-none text-white">HAIR<span className="text-teal-500">VIS</span></span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Partner Network</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button 
                    onClick={onLogin}
                    className="px-4 py-2 md:px-6 md:py-2.5 bg-white text-[#050B14] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
                >
                    Clinic Login
                </button>
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 pt-10 pb-16 md:pt-24 md:pb-32 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-5 space-y-6 md:space-y-8 text-center lg:text-left w-full"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                    <Users size={12} className="fill-current" /> For Hair Restoration Clinics
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-7xl font-black tracking-tighter leading-[1.1] md:leading-[0.95] text-white">
                    Acquire Patients. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-400 to-emerald-400">Not Just Leads.</span>
                </h1>
                
                <p className="text-sm md:text-lg text-slate-400 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Join the marketplace where patients come pre-analyzed with AI. View anonymous case details for free, and use credits to <b>unlock & quote</b> only the ones you want.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start w-full">
                    <button onClick={onApply} className="w-full sm:w-auto px-8 py-4 bg-teal-500 text-[#050B14] rounded-xl text-xs font-black uppercase tracking-[0.15em] hover:bg-teal-400 hover:scale-105 transition-all shadow-lg shadow-teal-500/20 text-center">
                        Join Partner Network
                    </button>
                    <button onClick={onApply} className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.15em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        View Live Cases <ArrowUpRight size={14} />
                    </button>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-2 flex flex-col items-center lg:items-start w-full">
                      <div className="flex gap-8 justify-center lg:justify-start">
                        <div className="space-y-1">
                            <div className="text-xl md:text-2xl font-bold text-white">250+</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Clinics</div>
                        </div>
                        <div className="h-full w-px bg-white/10" />
                        <div className="space-y-1">
                            <div className="text-xl md:text-2xl font-bold text-white">UK & EU</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Markets</div>
                        </div>
                      </div>
                </div>
            </motion.div>

            {/* Right Dashboard Mockup (MARKETPLACE FEED VIEW) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="lg:col-span-7 relative w-full lg:perspective-1000 mt-8 lg:mt-0 flex justify-center lg:block"
            >
                {/* Glow behind dashboard */}
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/30 to-blue-500/10 rounded-[2rem] blur-3xl opacity-40 transform translate-y-4" />
                
                {/* Dashboard Container */}
                <motion.div 
                    initial={{ rotateY: 0 }}
                    whileInView={{ rotateY: isMobile ? 0 : 10 }}
                    viewport={{ margin: "200px" }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className="relative bg-[#0E1520] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-[calc(100vw-2rem)]"
                    style={{ aspectRatio: isMobile ? 'auto' : '16/10', minHeight: isMobile ? '450px' : 'auto' }}
                >
                    {/* Header Bar */}
                    <div className="h-10 md:h-12 bg-[#0A0F16] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-700" />
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-slate-700" />
                            </div>
                            <div className="h-4 w-px bg-white/10 mx-2" />
                            <div className="text-[9px] md:text-[10px] font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Feed
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/5">
                            <Wallet size={10} className="text-teal-400" />
                            <span className="text-[9px] font-bold text-white">12 Credits</span>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar (Navigation) - Hidden on Mobile */}
                        <div className="w-48 bg-[#0A0F16] border-r border-white/5 p-3 hidden md:flex flex-col gap-1 shrink-0">
                             <SidebarItem active icon={<LayoutGrid size={14} />} label="Browse Cases" />
                             <SidebarItem icon={<Lock size={14} />} label="My Unlocks" badge="3" />
                             <SidebarItem icon={<Users size={14} />} label="Consultations" />
                             <div className="mt-auto">
                                 <SidebarItem icon={<BarChart3 size={14} />} label="Performance" />
                             </div>
                        </div>

                        {/* Main Feed Content */}
                        <div className="flex-1 bg-[#0E1520] p-4 md:p-6 overflow-hidden flex flex-col relative">
                            {/* Filter Pills */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar shrink-0 w-full">
                                <FilterPill active label="All Regions" />
                                <FilterPill label="UK" />
                                <FilterPill label="Germany" />
                                <FilterPill label="NW 4+" />
                            </div>

                            {/* Case Cards List */}
                            <div className="space-y-3 overflow-y-auto pb-20 no-scrollbar">
                                <CaseCard 
                                    location="London, UK" 
                                    age="34" 
                                    grafts="~3,200" 
                                    time="2m ago" 
                                    status="New"
                                />
                                <CaseCard 
                                    location="Berlin, DE" 
                                    age="29" 
                                    grafts="~2,100" 
                                    time="14m ago" 
                                    status="New"
                                />
                                <CaseCard 
                                    location="Dubai, UAE" 
                                    age="41" 
                                    grafts="~4,000" 
                                    time="45m ago" 
                                    status="Hot"
                                />
                                <CaseCard 
                                    location="Paris, FR" 
                                    age="38" 
                                    grafts="~1,800" 
                                    time="1h ago" 
                                    status="Active"
                                />
                            </div>

                             {/* Fade out effect */}
                             <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0E1520] to-transparent pointer-events-none" />

                            {/* Unlock Button Overlay */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto w-max max-w-[90%]">
                                <button className="px-5 py-3 md:px-6 md:py-3 bg-white text-[#050B14] rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap w-full justify-center">
                                    View More Cases <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </div>

      {/* --- TRUST BAR --- */}
      <div className="border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-6 py-8 md:py-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-4 opacity-60">
             <div className="flex items-center gap-3">
                 <div className="text-xs md:text-sm font-black tracking-widest uppercase text-slate-500 whitespace-nowrap">Quality Over Quantity</div>
             </div>
             <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-700" />
             <div className="flex items-center gap-3">
                 <div className="text-xs md:text-sm font-black tracking-widest uppercase text-slate-500 whitespace-nowrap">Direct Patient Access</div>
             </div>
             <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-700" />
             <div className="flex items-center gap-3">
                 <div className="text-xs md:text-sm font-black tracking-widest uppercase text-slate-500 whitespace-nowrap">No Hidden Fees</div>
             </div>
         </div>
      </div>

      {/* --- FEATURES (Marketplace Value Props) --- */}
      <div className="relative z-10 py-16 md:py-32 px-4 md:px-6 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">How the Marketplace Works</h2>
                <p className="text-slate-400 text-sm md:text-lg font-light leading-relaxed">
                    Think of us as your digital triage team. We verify the patient, analyze their photos, and present you with a clean case file.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Large Card: The Visual Estimate */}
                <div className="md:col-span-2 bg-[#0E1520] border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Users size={200} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400">
                            <Activity size={28} />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white">AI-Analyzed Patient Profiles</h3>
                        <p className="text-slate-400 max-w-md leading-relaxed text-sm md:text-base">
                            Don't waste time on email threads asking for photos. Every HairVis case includes standard angles, AI graft estimation, and donor area visibility check.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-300 font-medium pt-4">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-500"/> Standardized Photo Sets</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-500"/> Norwood & Graft Estimate</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-500"/> Medical History Flagging</li>
                        </ul>
                    </div>
                </div>

                {/* Tall Card: The Credit System */}
                <div className="bg-[#0E1520] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group flex flex-col">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                        <Wallet size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Pay Per Unlock</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        See anonymized details (age, country, budget) for free. Use 1 Credit to unlock contact info and chat.
                    </p>
                    <div className="mt-auto bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Typical Cost</span>
                                <span className="text-white font-bold">~€30 / Patient</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Avg. Value</span>
                                <span className="text-teal-400 font-bold">€3,200</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Standard Cards */}
                <BentoCard 
                    icon={Globe} 
                    title="Global Reach" 
                    desc="We market heavily in the UK, USA, and Western Europe to bring you patients with higher budget potential."
                />
                <BentoCard 
                    icon={ShieldCheck} 
                    title="Verified Identity" 
                    desc="We use basic biometric checks to ensure every request comes from a real person, reducing fake leads."
                />
                <BentoCard 
                    icon={Zap} 
                    title="Instant Notification" 
                    desc="Get alerts via WhatsApp or Email the moment a qualified patient in your target region requests a quote."
                />
            </div>
         </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="relative z-10 py-16 md:py-20 px-4 md:px-6">
         <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-b from-teal-900/40 to-[#0E1520] border border-teal-500/30 p-8 md:p-20 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent shadow-[0_0_20px_rgba(20,184,166,0.5)]" />

                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-white mb-6">
                    Fill Your Calendar.
                </h2>
                <p className="text-slate-300 text-sm md:text-lg mb-10 max-w-xl mx-auto">
                    Start receiving qualified patient cases today. First 5 credits are on us when you join the Partner Network.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={onApply} className="w-full sm:w-auto px-10 py-5 bg-white text-[#050B14] rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl hover:shadow-white/20">
                        Apply for Partnership
                    </button>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-4 sm:mt-0 sm:ml-4">
                        Approval within 24 hours
                    </p>
                </div>
            </div>
         </div>
      </div>
      
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const SidebarItem = ({ icon, label, active, badge }: any) => (
    <div className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-xs font-bold">{label}</span>
        </div>
        {badge && <span className="bg-teal-500 text-[#050B14] text-[9px] font-black px-1.5 py-0.5 rounded-md">{badge}</span>}
    </div>
);

const FilterPill = ({ label, active }: any) => (
    <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border whitespace-nowrap cursor-pointer transition-colors ${active ? 'bg-white text-[#050B14] border-white' : 'bg-transparent text-slate-500 border-white/10 hover:border-white/30'}`}>
        {label}
    </div>
);

const CaseCard = ({ location, age, grafts, time, status }: any) => (
    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl flex items-center justify-between hover:bg-white/[0.05] transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                {location.substring(0,2)}
            </div>
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white text-xs">{location}</span>
                    <span className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
                    <span className="text-[10px] text-slate-400">{age} yrs</span>
                </div>
                <div className="text-[9px] text-teal-400 font-mono flex items-center gap-1">
                    <Activity size={8} /> {grafts}
                </div>
            </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
            <div className="text-[9px] font-bold text-slate-500">{time}</div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${status === 'Hot' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' : 'text-teal-400 border-teal-400/20 bg-teal-400/10'}`}>
                {status}
            </span>
        </div>
    </div>
);

const BentoCard = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-[#0E1520] border border-white/10 rounded-[2rem] p-8 hover:bg-white/[0.02] transition-colors group">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform group-hover:bg-teal-500/20 group-hover:text-teal-400">
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default ClinicLandingScreen;
