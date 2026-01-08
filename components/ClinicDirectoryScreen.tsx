
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Filter, ArrowRight, CheckCircle2,
  SlidersHorizontal, ChevronLeft, Check, X, Sparkles,
  Globe, LayoutGrid, ChevronDown, Stethoscope, Hotel, Crown,
  List, Map as MapIcon, Phone, AlertCircle
} from 'lucide-react';
import { clinicService } from '../lib/clinicService';
import type { Database } from '../lib/database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'];

interface ClinicDirectoryScreenProps {
  onBack: () => void;
  onVisitClinic: (clinicId: string) => void;
}

interface UIClinic {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  budgetCategory: string;
  techniques: string[];
  treatments: string[];
  amenities: string[];
  tags: string[];
  image: string;
  verified: boolean;
  featured: boolean;
  coordinates?: { x: number; y: number };
}

const BUDGET_TIERS = [
  { label: "Exclusive - €€€€", value: "exclusive" },
  { label: "Premium - €€€", value: "premium" },
  { label: "Economy - €€", value: "standard" },
  { label: "Budget - €", value: "economy" },
];

const TECHNIQUES_LIST = [
  "Sapphire FUE",
  "DHI Implantation",
  "Manual FUE",
  "Robotic FUE",
  "Unshaven FUE",
  "FUE",
  "DHI"
];

const TREATMENTS_LIST = [
  "Hair Transplant",
  "Beard Transplant",
  "Eyebrow Transplant",
  "Women's Hair Transplant",
  "Afro-Textured Hair",
  "Repair / Revision"
];

const AMENITIES_LIST = [
  "VIP Transfer",
  "5* Hotel Included",
  "Needle-Free Anesthesia",
  "JCI Accredited",
  "English Speaking Staff"
];

const transformClinicData = (dbClinic: Clinic): UIClinic => {
  const metadata = (dbClinic.metadata as any) || {};
  const specialties = metadata.specialties || [];
  const certifications = metadata.certifications || [];

  return {
    id: dbClinic.id,
    name: dbClinic.name,
    location: dbClinic.location || 'Unknown',
    rating: 4.8 + Math.random() * 0.2,
    reviews: Math.floor(Math.random() * 3000) + 500,
    price: 2000 + Math.floor(Math.random() * 4000),
    currency: "€",
    budgetCategory: "standard",
    techniques: specialties,
    treatments: ["Hair Transplant"],
    amenities: certifications,
    tags: specialties.slice(0, 3),
    image: dbClinic.logo_url || "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600",
    verified: dbClinic.status === 'ACTIVE',
    featured: false,
    coordinates: undefined
  };
};

const ClinicDirectoryScreen: React.FC<ClinicDirectoryScreenProps> = ({ onBack, onVisitClinic }) => {
  const [clinics, setClinics] = useState<UIClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // View State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  // Filters
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [budgetTier, setBudgetTier] = useState<string | null>(null);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // UI States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedMapClinic, setSelectedMapClinic] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await clinicService.getAllClinics({ status: 'ACTIVE' });

        if (error) {
          console.error('Error fetching clinics:', error);
          setError('Failed to load clinics. Please try again.');
          setClinics([]);
        } else if (data) {
          const transformedClinics = data.map(transformClinicData);
          setClinics(transformedClinics);
        }
      } catch (err) {
        console.error('Unexpected error fetching clinics:', err);
        setError('An unexpected error occurred.');
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const toggleFilter = (item: string, currentList: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const clearFilters = () => {
    setSelectedCountry("All");
    setBudgetTier(null);
    setSelectedTechniques([]);
    setSelectedTreatments([]);
    setSelectedAmenities([]);
    setSearchQuery("");
  };

  const hasActiveFilters = budgetTier || selectedCountry !== "All" || selectedTechniques.length > 0 || selectedTreatments.length > 0 || selectedAmenities.length > 0;

  const filteredClinics = clinics.filter(clinic => {
    // 1. Search & Location
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          clinic.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "All" || clinic.location.includes(selectedCountry);

    // 2. Budget
    const matchesBudget = !budgetTier || clinic.budgetCategory === budgetTier;

    // 3. Multi-select Filters
    const matchesTechniques = selectedTechniques.length === 0 ||
                              selectedTechniques.some(t => clinic.techniques?.includes(t));

    const matchesTreatments = selectedTreatments.length === 0 ||
                              selectedTreatments.every(t => clinic.treatments?.includes(t));

    const matchesAmenities = selectedAmenities.length === 0 ||
                             selectedAmenities.every(a => clinic.amenities?.includes(a));

    return matchesSearch && matchesCountry && matchesBudget && matchesTechniques && matchesTreatments && matchesAmenities;
  });

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#0E1A2B] tracking-tight">Filters</h2>
        {hasActiveFilters && (
            <button 
                onClick={clearFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wide"
            >
                Clear <X size={12} />
            </button>
        )}
      </div>

      {/* Simulation Filter */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide">AI Recommendation</h3>
        <button className="w-full py-4 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold flex items-center justify-center gap-2 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm">
           <Sparkles size={14} className="text-teal-500" /> Restore my simulation filters
        </button>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* Country */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide flex items-center gap-2">
            <Globe size={14} /> Location
        </h3>
        <div className="relative group">
            <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#0E1A2B] outline-none focus:border-teal-500 appearance-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
            >
                <option value="All">All countries</option>
                {['Turkey', 'UK', 'Mexico', 'Spain'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-teal-500 transition-colors" />
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide flex items-center gap-2">
             Pricing
        </h3>
        <div className="flex flex-wrap gap-2">
           {BUDGET_TIERS.map(tier => (
              <button
                key={tier.value}
                onClick={() => setBudgetTier(budgetTier === tier.value ? null : tier.value)}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                    budgetTier === tier.value 
                        ? 'bg-[#0E1A2B] text-white border-[#0E1A2B] shadow-lg' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-500 hover:text-teal-600'
                }`}
              >
                 {tier.label.split(' - ')[1]}
              </button>
           ))}
        </div>
      </div>

      {/* Treatments */}
      <div className="space-y-3">
         <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide flex items-center gap-2">
            Treatment Type
         </h3>
         <div className="space-y-2">
            {TREATMENTS_LIST.map(item => (
               <CheckboxItem 
                 key={item} 
                 label={item} 
                 checked={selectedTreatments.includes(item)} 
                 onChange={() => toggleFilter(item, selectedTreatments, setSelectedTreatments)} 
               />
            ))}
         </div>
      </div>

      {/* Techniques */}
      <div className="space-y-3">
         <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide flex items-center gap-2">
            <Stethoscope size={14} /> Technique
         </h3>
         <div className="space-y-2">
            {TECHNIQUES_LIST.map(item => (
               <CheckboxItem 
                 key={item} 
                 label={item} 
                 checked={selectedTechniques.includes(item)} 
                 onChange={() => toggleFilter(item, selectedTechniques, setSelectedTechniques)} 
               />
            ))}
         </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
         <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide flex items-center gap-2">
            <Hotel size={14} /> Amenities & Service
         </h3>
         <div className="space-y-2">
            {AMENITIES_LIST.map(item => (
               <CheckboxItem 
                 key={item} 
                 label={item} 
                 checked={selectedAmenities.includes(item)} 
                 onChange={() => toggleFilter(item, selectedAmenities, setSelectedAmenities)} 
               />
            ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-[80px]">
      {/* Sticky Top Bar for Mobile & Search */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
         <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-[#0E1A2B] hover:text-white transition-all shadow-sm shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 md:w-80 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search clinics..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:border-teal-500 focus:bg-white outline-none transition-all"
                    />
                </div>
                <button 
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden w-10 h-10 rounded-xl bg-[#0E1A2B] text-white flex items-center justify-center shadow-lg shrink-0"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex items-start gap-12">
         {/* DESKTOP SIDEBAR */}
         <aside className="hidden lg:block w-72 shrink-0 sticky top-28 h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-10 pr-4">
            <SidebarContent />
         </aside>

         {/* MAIN CONTENT AREA */}
         <div className="flex-1 min-w-0">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                 <div>
                    <h2 className="text-xl font-black text-[#0E1A2B] uppercase tracking-wide">
                        Global Centers of Excellence
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 font-medium">
                        Showing {filteredClinics.length} verified partner clinics
                    </p>
                 </div>
                 
                 {/* VIEW TOGGLE */}
                 <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <button 
                       onClick={() => setViewMode('grid')}
                       className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#0E1A2B] text-white shadow-md' : 'text-slate-400 hover:text-[#0E1A2B]'}`}
                    >
                       <LayoutGrid size={18} />
                    </button>
                    <button 
                       onClick={() => setViewMode('list')}
                       className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#0E1A2B] text-white shadow-md' : 'text-slate-400 hover:text-[#0E1A2B]'}`}
                    >
                       <List size={18} />
                    </button>
                    <button 
                       onClick={() => setViewMode('map')}
                       className={`p-2.5 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#0E1A2B] text-white shadow-md' : 'text-slate-400 hover:text-[#0E1A2B]'}`}
                    >
                       <MapIcon size={18} />
                    </button>
                 </div>
             </div>

             {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-6"></div>
                    <p className="text-[#0E1A2B] font-bold text-lg">Loading clinics...</p>
                </div>
             ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <p className="text-[#0E1A2B] font-bold text-lg mb-2">Error loading clinics</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 transition-colors">
                        Retry
                    </button>
                </div>
             ) : filteredClinics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="text-[#0E1A2B] font-bold text-lg mb-2">No clinics found</p>
                    <button onClick={clearFilters} className="text-teal-600 text-xs font-black uppercase tracking-widest hover:underline">
                        Reset All Filters
                    </button>
                </div>
             ) : (
                <>
                {/* GRID VIEW */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClinics.map((clinic, idx) => (
                    <motion.div 
                        key={clinic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-300 group cursor-pointer flex flex-col"
                        onClick={() => onVisitClinic(clinic.id)}
                    >
                        <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                            <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                {clinic.verified && (
                                    <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                                        <CheckCircle2 className="w-3 h-3 text-teal-500" />
                                        <span className="text-[9px] font-black text-[#0E1A2B] uppercase tracking-wider">Verified</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1.5 text-white border border-white/10">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs font-black">{clinic.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1 gap-4">
                            <div>
                                <h3 className="text-lg font-black text-[#0E1A2B] leading-tight mb-2 group-hover:text-teal-600 transition-colors">{clinic.name}</h3>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">{clinic.location}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {clinic.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-100">
                                    {tag}
                                </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div>
                                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Starting From</span>
                                    <span className="text-xl font-black text-[#0E1A2B]">{clinic.currency}{clinic.price.toLocaleString()}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#0E1A2B] group-hover:bg-[#0E1A2B] group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    ))}
                  </div>
                )}

                {/* LIST VIEW */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredClinics.map((clinic, idx) => (
                      <motion.div
                        key={clinic.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-4 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group cursor-pointer flex flex-col md:flex-row items-center gap-6"
                        onClick={() => onVisitClinic(clinic.id)}
                      >
                         <div className="w-full md:w-48 h-32 shrink-0 rounded-[1.5rem] overflow-hidden relative">
                            <img src={clinic.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={clinic.name} />
                         </div>
                         <div className="flex-1 space-y-3 w-full">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h3 className="text-lg font-black text-[#0E1A2B] group-hover:text-teal-600 transition-colors">{clinic.name}</h3>
                                  <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                      <MapPin size={12} /> <span className="text-[10px] font-bold uppercase tracking-wide">{clinic.location}</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                  <Star size={12} className="text-yellow-500 fill-current" />
                                  <span className="text-xs font-bold text-yellow-700">{clinic.rating}</span>
                               </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                               {clinic.amenities.slice(0,3).map(am => (
                                  <span key={am} className="text-[9px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{am}</span>
                               ))}
                            </div>
                         </div>
                         <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-2 pl-0 md:pl-6 md:border-l border-slate-100 min-w-[120px]">
                            <div className="text-right">
                               <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
                               <span className="text-lg font-black text-[#0E1A2B]">{clinic.currency}{clinic.price.toLocaleString()}</span>
                            </div>
                            <button className="px-5 py-2 bg-[#0E1A2B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-teal-500 transition-colors">
                               View
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* MAP VIEW */}
                {viewMode === 'map' && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden h-[600px] relative"
                   >
                      <div className="absolute inset-0 bg-[#EBF0F5] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center opacity-30 grayscale" />
                      
                      {/* Interactive Markers */}
                      {filteredClinics.map((clinic) => clinic.coordinates && (
                         <div 
                           key={clinic.id}
                           className="absolute group z-10"
                           style={{ left: `${clinic.coordinates.x}%`, top: `${clinic.coordinates.y}%` }}
                         >
                            <button 
                              onClick={() => setSelectedMapClinic(clinic.id === selectedMapClinic ? null : clinic.id)}
                              className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${selectedMapClinic === clinic.id ? 'bg-teal-500 scale-150' : 'bg-[#0E1A2B] hover:scale-125'}`}
                            >
                               <div className={`absolute -inset-2 bg-teal-500/30 rounded-full animate-ping ${selectedMapClinic === clinic.id ? 'block' : 'hidden'}`} />
                            </button>

                            {/* Tooltip */}
                            <AnimatePresence>
                               {selectedMapClinic === clinic.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-[1.5rem] shadow-2xl border border-slate-100 w-64 z-20"
                                  >
                                     <div className="aspect-video rounded-xl overflow-hidden mb-3 relative">
                                        <img src={clinic.image} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-white/90 px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1">
                                           <Star size={8} className="fill-yellow-400 text-yellow-400" /> {clinic.rating}
                                        </div>
                                     </div>
                                     <h4 className="font-bold text-[#0E1A2B] text-sm leading-tight mb-1">{clinic.name}</h4>
                                     <p className="text-[10px] text-slate-500 font-medium mb-3">{clinic.location}</p>
                                     <button 
                                       onClick={() => onVisitClinic(clinic.id)}
                                       className="w-full py-2 bg-[#0E1A2B] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 transition-colors"
                                     >
                                        Visit Clinic
                                     </button>
                                  </motion.div>
                               )}
                            </AnimatePresence>
                         </div>
                      ))}

                      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-[1.5rem] border border-slate-200 shadow-xl max-w-xs">
                         <h4 className="font-bold text-[#0E1A2B] flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-teal-500" /> Global Network
                         </h4>
                         <p className="text-xs text-slate-500 leading-relaxed">
                            Our verified centers of excellence are strategically located in top medical tourism destinations. Select a marker to preview.
                         </p>
                      </div>
                   </motion.div>
                )}
                </>
             )}
         </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
            <div className="fixed inset-0 z-[100] lg:hidden">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setShowMobileFilters(false)}
                />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-8 overflow-y-auto"
                >
                    <button onClick={() => setShowMobileFilters(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                    <div className="mt-8">
                        <SidebarContent />
                    </div>
                    <div className="mt-10 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black uppercase tracking-widest text-xs"
                        >
                            Show {filteredClinics.length} Clinics
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckboxItem = ({ label, checked, onChange }: any) => (
  <label className="flex items-center gap-3 cursor-pointer group select-none">
     <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
         checked 
           ? 'border-teal-500 bg-teal-500 shadow-md shadow-teal-500/30' 
           : 'border-slate-300 bg-white group-hover:border-teal-400'
     }`}>
        {checked && <Check size={12} className="text-white" />}
     </div>
     <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
     <span className={`text-sm font-medium transition-colors ${
         checked ? 'text-[#0E1A2B] font-bold' : 'text-slate-500 group-hover:text-teal-600'
     }`}>{label}</span>
  </label>
);

export default ClinicDirectoryScreen;
