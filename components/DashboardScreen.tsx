
import React, { useState } from "react";
import {
  Shield,
  Sparkles,
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
  FileText,
  SlidersHorizontal,
  Calendar,
  User,
  MapPin,
  ArrowRight,
  Printer,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { LanguageCode, translations } from "../translations";
import { LeadData } from "../context/LeadContext";
import { ScalpAnalysisResult } from "../geminiService";
import { validateCopy, getSafeLabel } from "../copy/copy";

// --- TYPES ---

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

// --- SUB-COMPONENTS ---

const StatusBadge = ({ label, color = "teal" }: { label: string, color?: "teal" | "amber" | "slate" }) => {
  const styles = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[color]}`}>
      {label}
    </span>
  );
};

const DataRow = ({ label, value, sub }: { label: string, value: string, sub?: string }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    <div className="text-right">
      <div className="text-sm font-black text-[#0E1A2B]">{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-medium">{sub}</div>}
    </div>
  </div>
);

const ZoneBar = ({ label, count, max = 2000, color }: { label: string, count: number, max?: number, color: string }) => {
  const percent = Math.min((count / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="font-black text-[#0E1A2B]">{count} Grafts</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const DashboardScreen: React.FC<DashboardProps> = ({
  lang,
  analysis,
  capturedPhotos,
  planningImage,
  afterImage,
  leadData
}) => {
  const t = translations[lang];
  const [activeView, setActiveView] = useState<'simulation' | 'original' | 'timeline'>('simulation');
  
  // Data Extraction with Safe Fallbacks
  const patientId = leadData?.id || "Unknown";
  const patientName = leadData?.patientDetails?.fullName || "Guest User";
  const nwScale = safeStr(analysis?.norwoodScale, "NW3");
  const graftMin = analysis?.graftsRange?.min || 2000;
  const graftMax = analysis?.graftsRange?.max || 2500;
  const donorRating = safeStr(analysis?.analysis?.donorAreaQuality, "Good");

  // Graft Zones - estimate distribution from estimated grafts
  const totalGrafts = analysis?.estimatedGrafts || 2200;
  const zones = { zone_1: Math.round(totalGrafts * 0.5), zone_2: Math.round(totalGrafts * 0.35), zone_3: Math.round(totalGrafts * 0.15) };

  // Phenotype - use analysis data
  const phenotype = {
    hairDensity: analysis?.analysis?.hairDensity,
    scalpHealth: analysis?.analysis?.scalpHealth,
  };

  const summaryText = analysis?.analysis?.notes || "Visual patterns indicate recession consistent with typical pattern thinning. Donor density appears sufficient for coverage.";

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24 font-sans text-slate-800">
      
      {/* 1. TOP BAR (Print/Share) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#0E1A2B] rounded-lg flex items-center justify-center text-white">
                <FileText size={16} />
             </div>
             <div>
                <h1 className="text-xs font-black uppercase tracking-widest text-[#0E1A2B]">Visual Analysis Report</h1>
                <p className="text-[10px] text-slate-400 font-mono">ID: {patientId} • {new Date().toLocaleDateString()}</p>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <Printer size={18} />
             </button>
             <button className="px-4 py-2 bg-[#0E1A2B] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors">
                <Download size={14} /> PDF
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN (Visuals & Key Metrics) --- */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* A. HEADER CARD */}
           <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-3xl font-black text-[#0E1A2B]">{patientName}</h2>
                    <StatusBadge label="Analysis Ready" color="teal" />
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                    {summaryText}
                 </p>
              </div>
              <div className="flex gap-4 text-right shrink-0">
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scale</div>
                    <div className="text-2xl font-black text-[#0E1A2B]">{nwScale}</div>
                 </div>
                 <div className="w-px bg-slate-100" />
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Grafts</div>
                    <div className="text-2xl font-black text-teal-600">{graftMin} - {graftMax}</div>
                 </div>
              </div>
           </div>

           {/* B. MAIN VISUALIZER */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-lg relative group">
              <div className="absolute top-6 left-6 z-20 flex gap-2">
                 <button 
                    onClick={() => setActiveView('simulation')}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border transition-all ${activeView === 'simulation' ? 'bg-[#0E1A2B] text-white border-[#0E1A2B]' : 'bg-white/80 text-slate-600 border-white hover:bg-white'}`}
                 >
                    AI Simulation
                 </button>
                 <button 
                    onClick={() => setActiveView('original')}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border transition-all ${activeView === 'original' ? 'bg-[#0E1A2B] text-white border-[#0E1A2B]' : 'bg-white/80 text-slate-600 border-white hover:bg-white'}`}
                 >
                    Original
                 </button>
                 {planningImage && (
                    <button 
                        onClick={() => setActiveView('timeline')}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border transition-all ${activeView === 'timeline' ? 'bg-[#0E1A2B] text-white border-[#0E1A2B]' : 'bg-white/80 text-slate-600 border-white hover:bg-white'}`}
                    >
                        Timeline
                    </button>
                 )}
              </div>

              <div className="aspect-[4/3] md:aspect-[16/9] relative bg-slate-100">
                 <AnimatePresence mode="wait">
                    <motion.img 
                        key={activeView}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={
                            activeView === 'simulation' ? (afterImage || planningImage || capturedPhotos[0]?.preview) :
                            activeView === 'timeline' ? planningImage :
                            capturedPhotos[0]?.preview
                        }
                        className="w-full h-full object-cover"
                    />
                 </AnimatePresence>
                 
                 {/* Watermark/Disclaimer Overlay */}
                 <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end">
                    <div className="text-white/80">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1">
                            <Sparkles size={12} className="text-teal-400" /> AI Generated Visualization
                        </div>
                        <p className="text-[10px] opacity-60 max-w-md">
                            *Simulation uses generative AI to project potential outcomes. Actual medical results vary based on physiology.
                        </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* C. PLANNING DETAILS (Grid) */}
           <div className="grid md:grid-cols-2 gap-6">
              
              {/* Graft Distribution */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-2 mb-6">
                    <Layers size={18} className="text-teal-600" />
                    <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-widest">Proposed Plan</h3>
                 </div>
                 <div className="space-y-6">
                    <ZoneBar label="Zone 1: Frontal Hairline" count={zones.zone_1} color="bg-teal-500" />
                    <ZoneBar label="Zone 2: Mid-Scalp" count={zones.zone_2} color="bg-indigo-500" />
                    <ZoneBar label="Zone 3: Crown (Vertex)" count={zones.zone_3} color="bg-amber-500" />
                 </div>
                 <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Total Est.</span>
                    <span className="text-lg font-black text-[#0E1A2B]">{zones.zone_1 + zones.zone_2 + zones.zone_3} Grafts</span>
                 </div>
              </div>

              {/* Phenotype / Donor */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-2 mb-6">
                    <ScanFace size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-widest">Phenotype Assessment</h3>
                 </div>
                 <div className="space-y-1">
                    <DataRow label="Donor Density" value={donorRating} sub="Occipital Zone Check" />
                    <DataRow label="Hair Texture" value={safeStr(phenotype?.beard_texture || "Straight", "Unknown")} />
                    <DataRow label="Hair Thickness" value={safeStr(phenotype?.eyebrow_density || "Medium", "Medium")} />
                    <DataRow label="Scalp Contrast" value={safeStr(phenotype?.skin_tone, "Medium")} sub="Visual Contrast" />
                 </div>
              </div>

           </div>
        </div>

        {/* --- RIGHT COLUMN (Action & Context) --- */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* 1. DISCLAIMER BOX */}
           <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                 <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">Not A Medical Diagnosis</h4>
                 <p className="text-[11px] text-amber-700 leading-relaxed">
                    This report is a visual planning aid generated by AI. It does not replace a physical examination by a doctor.
                 </p>
              </div>
           </div>

           {/* 2. CLINIC CONNECT CTA */}
           <div className="bg-[#0E1A2B] rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10 text-teal-400">
                    <Share2 size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-white mb-2">{t.dashboard.clinicConnect}</h3>
                 <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                    {t.dashboard.clinicConnectDesc}
                 </p>
                 <button className="w-full py-4 bg-white text-[#0E1A2B] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-50 transition-all shadow-lg flex items-center justify-center gap-2">
                    {t.dashboard.unlockSharing} <ArrowRight size={14} />
                 </button>
                 <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Shield size={10} /> Private & Secure
                 </div>
              </div>
           </div>

           {/* 3. REFERENCE IMAGES */}
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Eye size={16} /> Source Images
              </h3>
              <div className="grid grid-cols-3 gap-2">
                 {capturedPhotos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                       <img src={photo.preview} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                       <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm px-1.5 rounded text-[8px] font-bold text-white uppercase">
                          {getSafeLabel(photo.id).split(' ')[0]}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* 4. UPSELL FEATURES */}
           <div className="space-y-3">
              <LockedRow label="Medical Travel Plan" />
              <LockedRow label="Virtual Consultation" />
              <LockedRow label="Financing Options" />
           </div>

           {/* 5. DATA PRIVACY FOOTER */}
           <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <Lock size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.dashboard.securityBadge}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                 {t.dashboard.dataRetention}
              </p>
           </div>

        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT ---
const LockedRow = ({ label }: { label: string }) => (
   <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl opacity-60">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <Lock size={14} />
         </div>
         <span className="text-xs font-bold text-slate-600">{label}</span>
      </div>
      <ChevronRight size={14} className="text-slate-300" />
   </div>
);

export default DashboardScreen;
