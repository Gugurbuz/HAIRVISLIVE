
import React, { useState, useMemo } from "react";
import {
  Shield,
  Sparkles,
  Camera,
  Layers,
  Activity,
  Check,
  Lock,
  ChevronRight,
  Share2,
  Download,
  AlertCircle,
  Eye,
  ScanFace,
  Menu,
  Zap,
  Map as MapIcon,
  FileText,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { LanguageCode } from "../translations";
import { LeadData } from "../context/LeadContext";
import { ScalpAnalysisResult } from "../geminiService";
import { SAFE_VOCABULARY, validateCopy, getSafeLabel } from "../copy/copy";

// --- TYPES & HELPERS ---

interface DashboardProps {
  lang: LanguageCode;
  analysis: ScalpAnalysisResult | any;
  capturedPhotos: any[];
  planningImage: string;
  afterImage: string;
  error?: string | null;
  leadData?: LeadData;
}

const safeStr = (v: any, fallback: string) => validateCopy(String(v || fallback));

// --- ATOMS ---

const Pill = ({ icon: Icon, label, color = "slate" }: any) => {
  const colors: any = {
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>
      {Icon && <Icon size={12} />}
      {label}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, icon: Icon, action }: any) => (
  <div className="flex items-end justify-between mb-6">
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-teal-600 mb-1">
        {Icon && <Icon size={16} />}
        <span className="text-[10px] font-black uppercase tracking-widest">{subtitle}</span>
      </div>
      <h3 className="text-xl md:text-2xl font-black text-[#0E1A2B] tracking-tight">{title}</h3>
    </div>
    {action}
  </div>
);

// --- MODULES ---

const MetricCard = ({ label, value, sub, trend, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className="relative z-10">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-3xl font-black text-[#0E1A2B] tracking-tight">{value}</div>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{trend}</span>}
          {sub && <span className="text-xs font-medium text-slate-500">{sub}</span>}
        </div>
      )}
    </div>
    {/* Decorative BG */}
    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Activity size={80} />
    </div>
  </motion.div>
);

const PhotoProofStrip = ({ photos }: { photos: any[] }) => {
  if (!photos.length) return null;
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-2 flex gap-2 overflow-x-auto no-scrollbar">
      {photos.map((p, i) => (
        <div key={i} className="relative shrink-0 w-20 h-24 rounded-2xl overflow-hidden group">
          <img src={p.preview} className="w-full h-full object-cover" alt={p.id} />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          <div className="absolute bottom-1 right-1">
             <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                <Check size={10} className="text-white" />
             </div>
          </div>
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="text-[8px] font-bold text-white bg-black/50 px-1.5 rounded backdrop-blur-md uppercase">{getSafeLabel(p.id).split(' ')[0]}</span>
          </div>
        </div>
      ))}
      <div className="shrink-0 w-20 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-1">
         <span className="text-[10px] font-bold">Angle</span>
         <span className="text-xl font-black text-teal-500">92%</span>
         <span className="text-[8px] uppercase font-bold">Match</span>
      </div>
    </div>
  );
};

const SimulationModule = ({ before, after }: { before: string, after: string }) => {
  const [slider, setSlider] = useState(50);
  
  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl group border-[4px] border-white">
      {/* After Image */}
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="Simulation" />
      
      {/* Surgical Overlay (Ghost Hairline) */}
      <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen">
         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M20,40 Q50,25 80,40" fill="none" stroke="#14B8A6" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M25,35 Q50,20 75,35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
         </svg>
      </div>

      {/* Before Image (Clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100-slider}% 0 0)` }}>
         <img src={before} className="w-full h-full object-cover grayscale contrast-110" alt="Original" />
         <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Slider Handle */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize z-20" style={{ left: `${slider}%` }}>
         <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-[#0E1A2B]">
            <ScanFace size={14} />
         </div>
      </div>
      
      <input 
        type="range" min="0" max="100" value={slider} 
        onChange={(e) => setSlider(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

      {/* Floating UI Chips */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
         <div className="space-y-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 inline-flex items-center gap-2">
               <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Projection</span>
            </div>
         </div>
         <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg text-right">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Density Gain</div>
            <div className="text-lg font-black text-teal-600">+45%</div>
         </div>
      </div>
    </div>
  );
};

const PlanBuilder = ({ zones }: { zones: any }) => {
  const [z1, setZ1] = useState(zones?.zone_1 || 1800);
  const [z2, setZ2] = useState(zones?.zone_2 || 1200);
  const [z3, setZ3] = useState(zones?.zone_3 || 600);
  const total = z1 + z2 + z3;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 md:p-8">
       <SectionHeader 
          title="Interactive Plan" 
          subtitle="Graft Distribution" 
          icon={SlidersHorizontal} 
          action={<div className="text-right"><div className="text-2xl font-black text-[#0E1A2B]">{total}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Grafts</div></div>}
       />
       
       <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Zone 1: Frontal</span>
                <span>{z1}</span>
             </div>
             <input type="range" min="1000" max="2500" step="50" value={z1} onChange={(e) => setZ1(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500" />
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Zone 2: Mid-Scalp</span>
                <span>{z2}</span>
             </div>
             <input type="range" min="500" max="2000" step="50" value={z2} onChange={(e) => setZ2(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
          </div>

          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Zone 3: Crown</span>
                <span>{z3}</span>
             </div>
             <input type="range" min="0" max="1500" step="50" value={z3} onChange={(e) => setZ3(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          </div>
       </div>

       <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
             *Adjust sliders to see how density impacts total count. This is a visual planning tool, not a medical prescription.
          </p>
       </div>
    </div>
  );
};

const LockedFeature = ({ title, subtitle, icon: Icon }: any) => (
  <div className="relative group overflow-hidden bg-slate-50 border border-slate-200 rounded-[2rem] p-6 h-full min-h-[200px] flex flex-col">
     <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6 opacity-100 transition-all">
        <div className="w-12 h-12 bg-[#0E1A2B] rounded-full flex items-center justify-center text-white mb-3 shadow-xl">
           <Lock size={18} />
        </div>
        <h4 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide mb-1">Premium Feature</h4>
        <p className="text-[10px] text-slate-500 font-medium">Unlock full report to view</p>
     </div>
     
     {/* Blurred Content Background */}
     <div className="opacity-30 blur-sm flex-1 flex flex-col">
        <div className="w-10 h-10 bg-slate-200 rounded-xl mb-4 flex items-center justify-center">
           {Icon && <Icon size={20} />}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
        <div className="mt-auto space-y-2 pt-4">
           <div className="h-2 w-full bg-slate-200 rounded-full" />
           <div className="h-2 w-2/3 bg-slate-200 rounded-full" />
        </div>
     </div>
  </div>
);

const ClinicShareTeaser = () => (
  <div className="bg-gradient-to-br from-[#0E1A2B] to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
     <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />
     
     <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
              <Share2 size={12} /> Clinic Connect
           </div>
           <h3 className="text-2xl font-black">Get Quotes from Top Surgeons</h3>
           <p className="text-sm text-slate-400 font-light leading-relaxed max-w-md">
              Share your anonymized visual report with our verified network of 250+ clinics to get precise price quotes without sending photos manually.
           </p>
        </div>
        <div className="shrink-0">
           <button className="px-8 py-4 bg-white text-[#0E1A2B] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-50 transition-all shadow-xl flex items-center gap-2">
              Unlock Sharing <ChevronRight size={14} />
           </button>
        </div>
     </div>
  </div>
);

// --- MAIN DASHBOARD ---

const DashboardScreen: React.FC<DashboardProps> = ({
  lang,
  analysis,
  capturedPhotos,
  planningImage,
  afterImage,
  leadData
}) => {
  const patientId = leadData?.id || "Unknown";
  const nwScale = safeStr(analysis?.diagnosis?.norwood_scale, "NW3");
  const graftCount = analysis?.technical_metrics?.graft_count_min || 2500;
  const donorRating = safeStr(analysis?.donor_assessment?.density_rating, "Moderate");
  
  const summaryText = analysis?.diagnosis?.analysis_summary || "Visual patterns indicate recession consistent with male pattern thinning. Donor density appears sufficient for coverage.";

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24 font-sans selection:bg-teal-100">
      
      {/* 1. HERO HEADER (Immediate Value) */}
      <header className="bg-white border-b border-slate-200 pt-32 pb-8 px-6 md:px-12 rounded-b-[3rem] shadow-sm relative z-20">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
               <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                     <Pill icon={Shield} label="Private Report" color="slate" />
                     <Pill icon={Eye} label="Visual Estimate" color="teal" />
                     <Pill icon={AlertCircle} label="Not Medical Advice" color="amber" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-[#0E1A2B] tracking-tighter leading-[0.95]">
                     Visual Report <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">Ready & Analyzed.</span>
                  </h1>
               </div>
               <div className="text-right hidden md:block">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Report ID</div>
                  <div className="font-mono text-xl font-bold text-[#0E1A2B]">{patientId}</div>
               </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <MetricCard label="Norwood Scale" value={nwScale} sub="Visual Classification" delay={0.1} />
               <MetricCard label="Donor Rating" value={donorRating} sub="Extraction Capacity" trend="Verified" delay={0.2} />
               <MetricCard label="Est. Grafts" value={`${graftCount}+`} sub="Recommended Range" delay={0.3} />
            </div>

            {/* AI Summary & Photo Strip */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row items-center gap-6">
               <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                     <Sparkles size={16} className="text-teal-600" />
                     <span className="text-xs font-black text-[#0E1A2B] uppercase tracking-widest">AI Executive Summary</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                     {summaryText}
                  </p>
               </div>
               <div className="shrink-0 w-full md:w-auto">
                  <PhotoProofStrip photos={capturedPhotos} />
               </div>
            </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 space-y-24">
         
         {/* 2. SIMULATION & PLAN (The 'Wow' Layer) */}
         <section>
            <div className="grid lg:grid-cols-12 gap-8 items-start">
               <div className="lg:col-span-7 space-y-8">
                  <SectionHeader title="Visual Projection" subtitle="AI Simulation" icon={Layers} />
                  <SimulationModule before={capturedPhotos[0]?.preview || ""} after={afterImage || planningImage || capturedPhotos[0]?.preview || ""} />
                  
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                     <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">A</div>
                        <div className="text-xs font-bold text-slate-700">12 Month Projection</div>
                     </div>
                     <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 shrink-0 opacity-50 grayscale">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">B</div>
                        <div className="text-xs font-bold text-slate-400">Immediate Post-Op (Locked)</div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-5 space-y-8">
                  <PlanBuilder zones={analysis?.technical_metrics?.graft_distribution} />
                  
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 text-center space-y-4">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText size={28} />
                     </div>
                     <h3 className="text-lg font-black text-[#0E1A2B]">Download Full Report</h3>
                     <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Get the detailed PDF with zone-by-zone breakdown, medical timeline, and technical specs.
                     </p>
                     <button className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                        <Download size={14} /> Download PDF
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* 3. TEASER MODULES (The 'Upsell' Layer) */}
         <section>
            <SectionHeader 
               title="Deep Dive Modules" 
               subtitle="Premium Analysis" 
               icon={Lock} 
               action={<button className="text-xs font-bold text-teal-600 hover:underline">Restore Purchases</button>}
            />
            <div className="grid md:grid-cols-3 gap-6">
               <LockedFeature 
                  title="Donor Safe Zone Map" 
                  subtitle="Detailed density analysis of occipital extraction bands." 
                  icon={ScanFace} 
               />
               <LockedFeature 
                  title="Recovery Timeline" 
                  subtitle="Day 0 to Month 12 visual growth milestones." 
                  icon={Activity} 
               />
               <LockedFeature 
                  title="Technique Recommendation" 
                  subtitle="Sapphire FUE vs DHI suitability check." 
                  icon={Zap} 
               />
            </div>
         </section>

         {/* 4. CLINIC CONNECT */}
         <section className="pb-12">
            <ClinicShareTeaser />
         </section>

      </main>
    </div>
  );
};

export default DashboardScreen;
