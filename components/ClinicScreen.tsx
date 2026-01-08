
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, ShieldCheck, Award, CheckCircle2,
  Calendar, Clock, Languages, ChevronLeft, Building2,
  Stethoscope, GraduationCap, ArrowRight, Play, Wifi,
  Coffee, Car, Hotel, Plane, Check, ArrowUpRight,
  User, Microscope, Syringe, Scissors, Zap, ThumbsUp,
  MessageCircle, StarHalf, FileText, Activity, AlertCircle
} from 'lucide-react';
import { LanguageCode } from '../translations';
import { clinicService } from '../lib/clinicService';
import type { Database } from '../lib/database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'];

interface ClinicScreenProps {
  lang: LanguageCode;
  clinicId: string;
  onBack: () => void;
  onBook: () => void;
}

const TABS = ['Overview', 'Medical Team', 'Technique', 'Packages', 'Reviews'];

const ClinicScreen: React.FC<ClinicScreenProps> = ({ lang, clinicId, onBack, onBook }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeImage, setActiveImage] = useState(0);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await clinicService.getClinicById(clinicId);

        if (error) {
          console.error('Error fetching clinic:', error);
          setError('Failed to load clinic details.');
          setClinic(null);
        } else if (data) {
          setClinic(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching clinic:', err);
        setError('An unexpected error occurred.');
        setClinic(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [clinicId]);

  const clinicImages = [
    clinic?.logo_url || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516549655169-df83a0674f66?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800"
  ];

  const metadata = (clinic?.metadata as any) || {};
  const specialties = metadata.specialties || [];
  const languages = metadata.languages || ['English'];
  const certifications = metadata.certifications || [];
  const established = metadata.established || 2010;
  const surgeons = metadata.surgeons || 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-[#0E1A2B] font-bold">Loading clinic...</p>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-[#0E1A2B] font-bold text-xl">Clinic Not Found</h2>
          <p className="text-slate-500">{error || 'The clinic you are looking for does not exist.'}</p>
          <button onClick={onBack} className="px-6 py-2 bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 transition-colors">
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pb-32">
      {/* IMMERSIVE HERO */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={clinicImages[activeImage]} className="w-full h-full object-cover transition-transform duration-1000" alt="Clinic Interior" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2B] via-[#0E1A2B]/40 to-transparent" />
        </div>

        {/* Navigation Header */}
        <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-start z-20">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#0E1A2B] transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-400" /> Verified Partner
             </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="space-y-4">
                 <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-teal-500 text-[#0E1A2B] text-[10px] font-black uppercase tracking-widest rounded-lg">Top Rated 2024</span>
                    <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md">JCI Accredited</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                    {clinic.name.toUpperCase()}
                 </h1>
                 <div className="flex items-center gap-6 text-slate-300 text-sm font-medium">
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-teal-400" /> {clinic.location}</div>
                    <div className="flex items-center gap-2"><Star size={16} className="text-yellow-400 fill-current" /> {(4.7 + Math.random() * 0.3).toFixed(2)} ({Math.floor(Math.random() * 3000) + 500} Reviews)</div>
                 </div>
              </div>
              
              <div className="hidden md:flex gap-2">
                 {clinicImages.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === i ? 'w-12 bg-teal-400' : 'w-4 bg-white/30 hover:bg-white'}`} 
                    />
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* STICKY NAV */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all">
         <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-8">
               {TABS.map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-6 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors whitespace-nowrap ${activeTab === tab ? 'text-[#0E1A2B]' : 'text-slate-400 hover:text-[#0E1A2B]'}`}
                  >
                     {tab}
                     {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500" />
                     )}
                  </button>
               ))}
               <div className="flex-1 min-w-[20px]" />
               <div className="hidden md:flex items-center gap-6 border-l border-slate-200 pl-8 py-4">
                  <div className="text-right">
                     <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting from</span>
                     <span className="block text-lg font-black text-[#0E1A2B]">€2,200</span>
                  </div>
                  <button onClick={onBook} className="px-6 py-3 bg-[#0E1A2B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-colors shadow-lg">
                     Book Consultation
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-12 min-h-[50vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && (
            <motion.div key="Overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <OverviewTab clinic={clinic} metadata={metadata} established={established} surgeons={surgeons} languages={languages} />
            </motion.div>
          )}
          {activeTab === 'Medical Team' && (
            <motion.div key="Medical Team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <MedicalTeamTab />
            </motion.div>
          )}
          {activeTab === 'Technique' && (
            <motion.div key="Technique" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <TechniqueTab />
            </motion.div>
          )}
          {activeTab === 'Packages' && (
            <motion.div key="Packages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <PackagesTab onSelect={onBook} />
            </motion.div>
          )}
          {activeTab === 'Reviews' && (
            <motion.div key="Reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <ReviewsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING ACTION BUTTON MOBILE */}
      <div className="fixed bottom-6 left-6 right-6 md:hidden z-50">
         <button onClick={onBook} className="w-full py-4 bg-[#0E1A2B] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-teal-900/40 flex items-center justify-center gap-3">
            Book Consultation <ArrowRight size={16} />
         </button>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const OverviewTab = ({ clinic, metadata, established, surgeons, languages }: any) => (
  <div className="grid lg:grid-cols-12 gap-12">
    <div className="lg:col-span-8 space-y-12">
       <div className="space-y-6">
          <h2 className="text-3xl font-black text-[#0E1A2B]">Clinic Overview</h2>
          <p className="text-slate-500 leading-relaxed font-light text-lg">
             {clinic.description || 'A leading hair restoration clinic dedicated to providing exceptional results using the latest techniques and technology.'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <FeatureItem icon={Calendar} label="Founded" value={established.toString()} />
             <FeatureItem icon={CheckCircle2} label="Success Rate" value="98.4%" />
             <FeatureItem icon={Languages} label="Languages" value={languages.slice(0, 3).join(', ')} />
             <FeatureItem icon={Clock} label="Wait Time" value="2-4 Weeks" />
          </div>
       </div>

       {/* BENTO GALLERY */}
       <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#0E1A2B]">Facility & Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
             <div className="col-span-2 md:col-span-2 row-span-2 rounded-[2rem] overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="OT" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                   <span className="text-white font-bold">Main Operating Theater</span>
                </div>
             </div>
             <div className="col-span-1 rounded-[2rem] overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Detail" />
             </div>
             <div className="col-span-1 rounded-[2rem] overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1516549655169-df83a0674f66?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Lobby" />
             </div>
             <div className="col-span-2 rounded-[2rem] bg-[#0E1A2B] p-6 flex flex-col justify-center gap-4 text-white">
                <div className="flex items-center gap-3 text-sm font-bold"><Wifi size={16} className="text-teal-400" /> High-Speed Wi-Fi</div>
                <div className="flex items-center gap-3 text-sm font-bold"><Coffee size={16} className="text-teal-400" /> Premium Lounge</div>
                <div className="flex items-center gap-3 text-sm font-bold"><Car size={16} className="text-teal-400" /> VIP Transfer Service</div>
             </div>
          </div>
       </div>
    </div>

    <div className="lg:col-span-4 space-y-8">
       {/* SURGEON CARD SUMMARY */}
       <div className="bg-white p-8 rounded-[2.5rem] surgical-shadow border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 text-center space-y-6">
             <div className="w-32 h-32 mx-auto rounded-full p-1 border-2 border-dashed border-teal-500">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300" className="w-full h-full rounded-full object-cover" alt="Dr Arslan" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-[#0E1A2B]">Dr. Arslan Musbeh</h3>
                <p className="text-teal-600 font-bold text-xs uppercase tracking-widest mt-1">Lead Surgeon</p>
             </div>
             <div className="space-y-3 text-left">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                   <Award size={18} className="text-[#0E1A2B] shrink-0" /> 
                   <span>ISHRS Member since 2012</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                   <GraduationCap size={18} className="text-[#0E1A2B] shrink-0" /> 
                   <span>Odessa State Medical University</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                   <Stethoscope size={18} className="text-[#0E1A2B] shrink-0" /> 
                   <span>Specializes in Sapphire FUE</span>
                </div>
             </div>
             <button className="w-full py-4 bg-slate-50 hover:bg-[#0E1A2B] hover:text-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                View Full CV
             </button>
          </div>
       </div>
    </div>
  </div>
);

const MedicalTeamTab = () => (
  <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Lead Surgeon Deep Dive */}
    <div className="bg-white rounded-[3rem] p-8 md:p-12 surgical-shadow border border-slate-100 flex flex-col md:flex-row gap-12 items-center">
      <div className="w-full md:w-1/3 space-y-6 text-center">
         <div className="aspect-[3/4] rounded-[2rem] overflow-hidden relative shadow-2xl">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Dr Arslan" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2B] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 text-left">
               <h3 className="text-2xl font-black text-white">Dr. Arslan Musbeh</h3>
               <p className="text-teal-400 font-bold text-xs uppercase tracking-widest">Medical Director</p>
            </div>
         </div>
      </div>
      <div className="w-full md:w-2/3 space-y-8">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full text-teal-600 text-[10px] font-black uppercase tracking-widest">
               <Award size={14} /> 15+ Years Experience
            </div>
            <h2 className="text-4xl font-black text-[#0E1A2B] tracking-tight">The Artist Behind The Hairline</h2>
            <p className="text-slate-500 leading-relaxed font-light text-lg">
              Dr. Arslan Musbeh is a pioneer in the field of hair restoration in Turkey. He is one of the few doctors who personally executes the channel opening phase of the surgery, which is the most critical step determining the angle, direction, and density of the hair growth. He is a trainer for the International Society of Hair Restoration Surgery (ISHRS) and has performed over 3,000 successful surgeries.
            </p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <h4 className="font-bold text-[#0E1A2B] flex items-center gap-2"><GraduationCap size={16} /> Education</h4>
               <ul className="mt-2 space-y-1 text-sm text-slate-500">
                  <li>• Odessa State Medical University (MD)</li>
                  <li>• France Medical Specialization</li>
               </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <h4 className="font-bold text-[#0E1A2B] flex items-center gap-2"><Award size={16} /> Memberships</h4>
               <ul className="mt-2 space-y-1 text-sm text-slate-500">
                  <li>• ISHRS (International Society)</li>
                  <li>• FUE Europe</li>
               </ul>
            </div>
         </div>
      </div>
    </div>

    {/* Staff Grid */}
    <div>
       <h3 className="text-2xl font-black text-[#0E1A2B] mb-8 px-4">Core Medical Staff</h3>
       <div className="grid md:grid-cols-3 gap-6">
          <TeamMemberCard 
            name="Dr. Elif Yilmaz" 
            role="Dermatologist" 
            img="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400"
            desc="Specializes in scalp health and PRP therapy preparation."
          />
          <TeamMemberCard 
            name="Leyla Demir" 
            role="Head Nurse" 
            img="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
            desc="Expert in graft preservation and post-op care protocols."
          />
          <TeamMemberCard 
            name="Murat Can" 
            role="Patient Coordinator" 
            img="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
            desc="Ensures your journey from airport to clinic is seamless."
          />
       </div>
    </div>
  </div>
);

const TechniqueTab = () => (
   <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Technique */}
      <div className="bg-[#0E1A2B] text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/20">
                  <Microscope size={14} /> Advanced Methodology
               </div>
               <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Sapphire FUE <br/><span className="text-teal-400">Precision</span></h2>
               <p className="text-slate-300 leading-relaxed font-light text-lg">
                  We utilize genuine Sapphire blades for channel opening. Unlike steel blades, Sapphire allows for V-shaped incisions that are smaller, cleaner, and heal significantly faster. This enables higher density implantation with minimal trauma to the scalp.
               </p>
               <div className="flex gap-4 pt-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-3xl font-black text-white">0.6<span className="text-sm text-teal-400">mm</span></span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Incision Width</span>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="flex flex-col gap-1">
                     <span className="text-3xl font-black text-white">99<span className="text-sm text-teal-400">%</span></span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Graft Survival</span>
                  </div>
               </div>
            </div>
            <div className="relative aspect-square">
               <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full opacity-20 animate-pulse" />
               <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" className="relative z-10 w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl" alt="Sapphire Blade" />
            </div>
         </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-8">
         <h3 className="text-2xl font-black text-[#0E1A2B] px-4">Procedural Workflow</h3>
         <div className="grid md:grid-cols-4 gap-6">
            <ProcessCard 
               step="01" 
               title="Extraction" 
               desc="Follicles are harvested individually using a specialized micromotor."
               icon={Scissors}
            />
            <ProcessCard 
               step="02" 
               title="Separation" 
               desc="Grafts are cleaned and sorted by single, double, or triple hairs in solution."
               icon={Microscope}
            />
            <ProcessCard 
               step="03" 
               title="Incision" 
               desc="Dr. Arslan opens micro-channels using Sapphire blades for direction control."
               icon={Syringe}
            />
            <ProcessCard 
               step="04" 
               title="Implantation" 
               desc="Grafts are carefully placed into the channels using forceps for max density."
               icon={User}
            />
         </div>
      </div>
   </div>
);

const PackagesTab = ({ onSelect }: { onSelect: () => void }) => (
   <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
         <h2 className="text-3xl font-black text-[#0E1A2B]">Transparent Pricing</h2>
         <p className="text-slate-500">No hidden costs. All our packages include the core medical procedure, PRP therapy, and post-operative medication.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         <PackageCard 
            name="Silver" 
            price="2,200" 
            features={['FUE Procedure (Max Grafts)', 'Consultation', 'Blood Tests', '1 PRP Session', 'Post-op Meds', 'Airport Transfer', '2 Nights 4* Hotel']} 
         />
         <PackageCard 
            name="Gold (Recommended)" 
            price="2,800" 
            features={['Everything in Silver', 'Needle-Free Anesthesia', '2 Nights 5* Hotel', 'VIP Private Transfer', 'Personal Assistant', 'Warranty Certificate']} 
            highlight
         />
         <PackageCard 
            name="Platinum" 
            price="3,500" 
            features={['Everything in Gold', 'DHI Technique Option', '3 Nights 5* Hotel', '1 Year Follow-up Care', 'Hyperbaric Oxygen Therapy', 'Stem Cell Treatment']} 
         />
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 surgical-shadow border border-slate-100">
         <h3 className="text-xl font-black text-[#0E1A2B] mb-8">Detailed Comparison</h3>
         <div className="space-y-4">
            <ComparisonRow feature="Max Grafts" silver="Yes" gold="Yes" platinum="Yes" />
            <ComparisonRow feature="Hotel Stay" silver="2 Nights (4*)" gold="2 Nights (5*)" platinum="3 Nights (5*)" />
            <ComparisonRow feature="Anesthesia" silver="Standard" gold="Needle-Free" platinum="Needle-Free" />
            <ComparisonRow feature="Technique" silver="Sapphire FUE" gold="Sapphire FUE" platinum="DHI / Sapphire" />
            <ComparisonRow feature="Transfer" silver="Group" gold="VIP Private" platinum="VIP Private" />
         </div>
      </div>
   </div>
);

const ReviewsTab = () => {
   const reviews = [
     { name: "James Anderson", country: "UK", rating: 5, date: "2 weeks ago", text: "The professionalism of Dr. Arslan and his team is unmatched. The VIP transfer and hotel were top notch. I'm 6 months in and the results are incredible. Highly recommend to anyone considering it.", initial: "J" },
     { name: "Ahmed Al-Fayed", country: "UAE", rating: 5, date: "1 month ago", text: "Very clean facility and honest consultation. They told me exactly what to expect. Painless procedure with the needle-free anesthesia. Thank you to the whole team.", initial: "A" },
     { name: "Thomas Mueller", country: "Germany", rating: 4.5, date: "2 months ago", text: "Great results so far. The clinic is very modern. Only downside was the traffic in Istanbul, but the driver handled it well. The medical part was perfect.", initial: "T" },
     { name: "Sarah Jenkins", country: "USA", rating: 5, date: "3 months ago", text: "As a woman, I was nervous, but Dr. Arslan designed a feminine hairline that looks so natural. The unshaven FUE option was a lifesaver for me.", initial: "S" },
   ];

   return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-sm border border-slate-100 gap-8">
            <div className="flex items-center gap-6">
               <div className="text-6xl font-black text-[#0E1A2B]">4.98</div>
               <div className="space-y-1">
                  <div className="flex text-yellow-400 gap-1"><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /></div>
                  <p className="text-sm font-bold text-slate-400">Based on 2,143 verified reviews</p>
               </div>
            </div>
            <div className="flex gap-4">
               <div className="px-6 py-3 bg-[#F7F8FA] rounded-xl text-center">
                  <div className="text-xl font-black text-[#0E1A2B]">99%</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Satisfaction</div>
               </div>
               <div className="px-6 py-3 bg-[#F7F8FA] rounded-xl text-center">
                  <div className="text-xl font-black text-[#0E1A2B]">45+</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Countries</div>
               </div>
            </div>
         </div>

         <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review, i) => (
               <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 surgical-shadow hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-black text-xl">
                           {review.initial}
                        </div>
                        <div>
                           <h4 className="font-bold text-[#0E1A2B]">{review.name}</h4>
                           <span className="text-xs text-slate-400 font-medium">{review.country} • {review.date}</span>
                        </div>
                     </div>
                     <div className="flex bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star size={14} className="text-yellow-500 fill-current" />
                        <span className="ml-1 text-xs font-bold text-yellow-700">{review.rating}</span>
                     </div>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-sm">"{review.text}"</p>
               </div>
            ))}
         </div>
      </div>
   );
};

// --- HELPER COMPONENTS ---

const FeatureItem = ({ icon: Icon, label, value }: any) => (
   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
      <Icon size={20} className="text-teal-600" />
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
      <span className="text-sm font-bold text-[#0E1A2B]">{value}</span>
   </div>
);

const PackageCard = ({ name, price, features, highlight }: any) => (
   <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 relative group hover:-translate-y-2 flex flex-col ${highlight ? 'bg-[#0E1A2B] border-[#0E1A2B] text-white shadow-2xl shadow-teal-900/20' : 'bg-white border-slate-100 text-[#0E1A2B] hover:border-teal-500/30 hover:shadow-xl'}`}>
      {highlight && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-[#0E1A2B] text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-widest shadow-lg">
            Most Popular
         </div>
      )}
      <div className="space-y-6 mb-8">
         <div>
            <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-2 ${highlight ? 'text-teal-400' : 'text-slate-400'}`}>{name}</h4>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-black">€{price}</span>
            </div>
         </div>
         <div className="h-px bg-current opacity-10" />
         <ul className="space-y-4">
            {features.map((f: string, i: number) => (
               <li key={i} className="flex items-start gap-3 text-sm font-medium opacity-90">
                  <Check size={16} className={`shrink-0 ${highlight ? 'text-teal-400' : 'text-teal-600'}`} />
                  {f}
               </li>
            ))}
         </ul>
      </div>
      <div className="mt-auto">
         <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${highlight ? 'bg-white text-[#0E1A2B] hover:bg-teal-50' : 'bg-slate-50 text-[#0E1A2B] hover:bg-[#0E1A2B] hover:text-white'}`}>
            Select Package <ArrowUpRight size={14} />
         </button>
      </div>
   </div>
);

const TeamMemberCard = ({ name, role, img, desc }: any) => (
   <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 surgical-shadow group hover:shadow-xl transition-all">
      <div className="h-64 overflow-hidden relative">
         <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2B]/80 to-transparent" />
         <div className="absolute bottom-4 left-4 text-white">
            <h4 className="font-bold text-lg">{name}</h4>
            <span className="text-teal-400 text-xs font-black uppercase tracking-widest">{role}</span>
         </div>
      </div>
      <div className="p-6">
         <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
   </div>
);

const ProcessCard = ({ step, title, desc, icon: Icon }: any) => (
   <div className="bg-white p-6 rounded-[2rem] border border-slate-100 surgical-shadow hover:shadow-lg transition-all group">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#0E1A2B] mb-4 group-hover:bg-[#0E1A2B] group-hover:text-white transition-colors">
         <Icon size={24} />
      </div>
      <span className="text-4xl font-black text-slate-100 absolute top-4 right-6 pointer-events-none">{step}</span>
      <h4 className="font-bold text-[#0E1A2B] mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
   </div>
);

const ComparisonRow = ({ feature, silver, gold, platinum }: any) => (
   <div className="grid grid-cols-4 items-center py-4 border-b border-slate-50 last:border-0 text-sm">
      <div className="font-bold text-[#0E1A2B]">{feature}</div>
      <div className="text-slate-500 text-center">{silver}</div>
      <div className="text-teal-600 font-bold text-center">{gold}</div>
      <div className="text-slate-500 text-center">{platinum}</div>
   </div>
);

export default ClinicScreen;
