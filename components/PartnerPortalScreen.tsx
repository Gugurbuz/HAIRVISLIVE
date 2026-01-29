
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Users, Settings, Bell, Lock, Unlock,
  MapPin, Activity, Phone, Mail, ArrowLeft,
  ShieldCheck, UserCheck, Stethoscope, LogOut, Plus, X,
  ClipboardList, AlertCircle, CheckCircle2, Building2,
  ArrowRight, Info, BrainCircuit, FileText, Check, AlertTriangle,
  Crown, Star, Clock, Zap, BarChart3, Sparkles, MessageSquare, Pencil, Save,
  Camera, Upload, Trash2, Image as ImageIcon, Globe, Wifi, Car, Coffee, Scissors, Microscope,
  Calendar, Pill, History, Maximize2, Eye, Youtube, Play, ShoppingCart, Package
} from 'lucide-react';
import { LanguageCode } from '../translations';
import { useLeads, LeadData, ClinicResponse, ClinicTier, Suitability, DonorBand } from '../context/LeadContext';
import { supabase } from '../lib/supabase';
import { clinicManagementService } from '../lib/clinicManagementService';
import { ClinicProfileEditor } from './clinic/ClinicProfileEditor';
import { ClinicMediaManager } from './clinic/ClinicMediaManager';
import { LeadMarketplace } from './clinic/LeadMarketplace';

// --- TYPES & INTERFACES ---

type UpgradeReason = 'priority_cases' | 'response_limit' | 'proposal_snapshot' | 'sla_visibility' | 'analytics';

interface UpgradeModalProps {
    reason: UpgradeReason | null;
    onClose: () => void;
    onUpgrade: () => void;
    onSecondary?: () => void;
}

// --- CONSTANTS FOR STRUCTURED INPUTS ---
const LANGUAGES_LIST = ["English", "French", "Arabic", "Turkish", "German", "Spanish", "Italian", "Russian"];
const TECHNIQUES_LIST = ["Sapphire FUE", "DHI Implantation", "Manual FUE", "Robotic FUE", "Unshaven FUE", "Stem Cell Therapy", "OxyCure", "Needle-Free Anesthesia", "Body Hair Transplant"];
const WAIT_TIME_OPTIONS = ["Immediate", "< 1 Week", "1-2 Weeks", "3-4 Weeks", "1-2 Months", "3 Months+"];
const YEARS = Array.from({length: 40}, (_, i) => (new Date().getFullYear() - i).toString());

// --- HELPER: EXTRACT YOUTUBE ID ---
const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// --- COMPONENTS ---

const CoEBadge = ({ active, onClick }: { active: boolean, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer group
        ${active 
            ? 'bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-800 shadow-sm' 
            : 'bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-70 hover:opacity-100'}
    `}>
        <Crown size={12} className={active ? "fill-amber-600 text-amber-700" : ""} />
        <span>{active ? "Center of Excellence" : "Standard Partner"}</span>
        
        {/* Tooltip */}
        <div className="absolute left-6 mt-12 hidden group-hover:block z-50 w-48 p-3 bg-[#0E1A2B] text-white rounded-xl shadow-xl pointer-events-none">
            <div className="text-[9px] leading-relaxed font-medium">
               Priority access • Trust signals • 30 passes included included monthly
            </div>
        </div>
    </div>
);

const SuitabilityBadge = ({ status }: { status: Suitability }) => {
    const config = {
        suitable: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Suitable' },
        borderline: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Borderline' },
        not_recommended: { color: 'bg-red-100 text-red-700 border-red-200', icon: X, label: 'Not Suitable' },
    }[status];
    
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.color} text-[9px] font-bold uppercase tracking-wide`}>
            <Icon size={10} /> {config.label}
        </div>
    );
};

const LeadScoreBadge = ({ score }: { score: number }) => {
    let color = 'bg-slate-100 text-slate-600';
    if (score >= 80) color = 'bg-teal-50 text-teal-700 border-teal-200';
    else if (score >= 50) color = 'bg-blue-50 text-blue-700 border-blue-200';
    
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${color} text-[9px] font-black uppercase tracking-widest`}>
            <Activity size={10} /> Score: {score}
        </div>
    );
};

const UpgradeModal: React.FC<UpgradeModalProps> = ({ reason, onClose, onUpgrade, onSecondary }) => {
    if (!reason) return null;

    const content = {
        priority_cases: {
            title: "See suitable cases earlier",
            body: "CoE clinics access high-fit cases first and receive 30 Engagement Passes every month.",
            bullets: ["Priority access to high-fit cases", "30 monthly passes included", "Faster response = higher conversion"],
            cta: "Upgrade to Center of Excellence",
            secondary: "Not now"
        },
        response_limit: {
            title: "Engagement Passes are used only when you choose to respond.",
            body: "Browsing cases is always free. Buy passes to continue responding to suitable cases, or upgrade to CoE for 30 included passes.",
            bullets: ["Unlimited responses possible", "30 monthly passes with CoE", "Response templates & saved approaches"],
            cta: "Upgrade to Center of Excellence",
            secondary: "Keep browsing cases"
        },
        proposal_snapshot: {
            title: "Help patients compare clearly",
            body: "CoE clinics can include a structured proposal snapshot and receive 30 monthly passes to engage faster.",
            bullets: ["Graft range & session estimate", "Optional price band (range only)", "Standardized format patients understand"],
            cta: "Upgrade to Center of Excellence",
            secondary: "Send without proposal"
        },
        sla_visibility: {
            title: "Build trust with response-time visibility",
            body: "CoE clinics can display “Responds within 24h” to patients. It’s a simple trust signal that reduces hesitation.",
            bullets: ["Patient-visible trust badge", "SLA tracking in your dashboard", "30 monthly passes included"],
            cta: "Upgrade to Center of Excellence",
            secondary: "Maybe later"
        },
        analytics: {
            title: "Understand what works for your clinic",
            body: "CoE analytics show which case types you convert best—helping you focus on the right patients and avoid wasted time.",
            bullets: ["Case mix & response outcomes", "Time-to-response insights", "Trends by hair loss stage & donor band"],
            cta: "Upgrade to Center of Excellence",
            secondary: "Close"
        }
    }[reason];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
                {...{
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                } as any}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            <motion.div 
                {...{
                    initial: { scale: 0.95, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    exit: { scale: 0.95, opacity: 0 }
                } as any}
                className="relative w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 border border-amber-100 shadow-sm">
                        <Crown size={32} className="fill-current" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0E1A2B] leading-tight mb-3">{content.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{content.body}</p>
                </div>

                <div className="space-y-3 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {content.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                            <span className="text-xs font-bold text-slate-700">{bullet}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={onUpgrade} 
                        className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-teal-600 transition-all shadow-xl flex items-center justify-center gap-2 group"
                    >
                        {content.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={onSecondary || onClose} 
                        className="w-full py-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                    >
                        {content.secondary}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- AUTH MOCK (Simplified) ---
const ClinicAuth = ({ onLoginSuccess, onBack }: any) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('demo@hairclinic.com');
    const [password, setPassword] = useState('demo123');

    const handleDemoLogin = async () => {
        setLoading(true);

        try {
            // Sign in with demo credentials
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // Check if user has a clinic assigned
                const { data: userRole } = await supabase
                    .from('user_roles')
                    .select('clinic_id')
                    .eq('user_id', authData.user.id)
                    .eq('role', 'clinic')
                    .maybeSingle();

                // If no clinic assigned, assign the demo clinic (HairTech Istanbul)
                if (!userRole) {
                    await supabase
                        .from('user_roles')
                        .insert({
                            user_id: authData.user.id,
                            role: 'clinic',
                            clinic_id: 'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
                        });
                }

                onLoginSuccess();
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Using demo mode.');
            onLoginSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#050B14] p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <Activity className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Partner Portal</h2>
                <p className="text-slate-400 text-sm text-center mb-6">Sign in to access your clinic dashboard</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        onClick={handleDemoLogin}
                        disabled={loading}
                        className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-2">Demo Credentials:</p>
                        <p className="text-xs text-slate-400">demo@hairclinic.com / demo123</p>
                    </div>
                </div>

                <button onClick={onBack} className="mt-6 w-full text-slate-500 text-xs hover:text-slate-400 transition-colors">
                    Back to Home
                </button>
            </div>
        </div>
    );
};

// --- CLINIC PROFILE EDITOR COMPONENT ---
const ClinicProfileEditor = () => {
    const coverInputRef = useRef<HTMLInputElement>(null);
    const teamInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTeamMemberIndex, setActiveTeamMemberIndex] = useState<number | null>(null);
    
    // Editor State
    const [profile, setProfile] = useState({
        name: "HairMedico Dr. Arslan Musbeh",
        location: "Istanbul, Turkey",
        startPrice: "2,200",
        description: "Founded by Dr. Arslan Musbeh, HAIRMEDICO is a boutique clinic dedicated exclusively to hair restoration. Unlike high-volume centers, we focus on manual quality.",
        website: "www.hairmedico.com",
        contactEmail: "info@hairmedico.com",
        contactPhone: "+90 212 555 0199",
        amenities: ["VIP Transfer", "5* Hotel", "English Speaking", "Needle-Free Anesthesia"],
        techniques: ["Sapphire FUE", "Manual FUE"],
        stats: {
            founded: "2010",
            success: "98.4%",
            languages: "English, French, Arabic, Turkish",
            waitTime: "3 Weeks"
        },
        heroImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200",
        video: "https://www.youtube.com/watch?v=b4XgKjgqXqM", // Updated to a safe FUE Animation
        gallery: [
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1516549655169-df83a0674f66?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800"
        ],
        team: [
            { name: "Dr. Arslan Musbeh", role: "Medical Director", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300", bio: "15+ years of experience in hair restoration. Trainer for ISHRS and specialist in Sapphire FUE technique." },
            { name: "Dr. Elif Yilmaz", role: "Dermatologist", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300", bio: "Expert in scalp health, PRP therapy, and post-operative care protocols." }
        ]
    });

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
        }, 1500);
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setProfile(prev => ({ ...prev, heroImage: ev.target!.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleTeamImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeTeamMemberIndex !== null) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const newTeam = [...profile.team];
                    newTeam[activeTeamMemberIndex].img = ev.target!.result as string;
                    setProfile(prev => ({ ...prev, team: newTeam }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const triggerTeamImageUpload = (index: number) => {
        setActiveTeamMemberIndex(index);
        teamInputRef.current?.click();
    };

    const addTeamMember = () => {
        setProfile(prev => ({
            ...prev,
            team: [...prev.team, { 
                name: "New Member", 
                role: "Position", 
                img: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=300", 
                bio: "Description of role and experience." 
            }]
        }));
    };

    const removeTeamMember = (index: number) => {
        const newTeam = [...profile.team];
        newTeam.splice(index, 1);
        setProfile(prev => ({ ...prev, team: newTeam }));
    };

    const handleAmenityChange = (index: number, val: string) => {
        const newAmenities = [...profile.amenities];
        newAmenities[index] = val;
        setProfile(prev => ({ ...prev, amenities: newAmenities }));
    };

    const addAmenity = () => {
        setProfile(prev => ({ ...prev, amenities: [...prev.amenities, "New Feature"] }));
    };

    const removeAmenity = (index: number) => {
        const newAmenities = [...profile.amenities];
        newAmenities.splice(index, 1);
        setProfile(prev => ({ ...prev, amenities: newAmenities }));
    };

    const toggleLanguage = (lang: string) => {
        const currentLangs = profile.stats.languages.split(', ').filter(l => l);
        let newLangs;
        if (currentLangs.includes(lang)) {
            newLangs = currentLangs.filter(l => l !== lang);
        } else {
            newLangs = [...currentLangs, lang];
        }
        setProfile(prev => ({
            ...prev,
            stats: { ...prev.stats, languages: newLangs.join(', ') }
        }));
    };

    const toggleTechnique = (tech: string) => {
        const currentTechs = [...profile.techniques];
        let newTechs;
        if (currentTechs.includes(tech)) {
            newTechs = currentTechs.filter(t => t !== tech);
        } else {
            newTechs = [...currentTechs, tech];
        }
        setProfile(prev => ({ ...prev, techniques: newTechs }));
    };

    return (
        <div className="relative pb-24">
            {/* HERO EDITOR */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-b-[3rem] group">
                <div className="absolute inset-0 bg-slate-900">
                    <img src={profile.heroImage} className="w-full h-full object-cover opacity-60" alt="Clinic Hero" />
                </div>
                
                {/* Upload Button Overlay - Only in Edit Mode */}
                {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={() => coverInputRef.current?.click()} className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                            <Camera size={16} /> Change Cover Photo
                        </button>
                        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-end gap-6">
                        <div className="flex-1 space-y-2">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={profile.name} 
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    className="w-full bg-transparent text-4xl font-black text-white border-b border-white/20 focus:border-white focus:outline-none placeholder-white/50"
                                    placeholder="Clinic Name"
                                />
                            ) : (
                                <h1 className="text-4xl font-black text-white">{profile.name}</h1>
                            )}
                            
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin size={16} className="text-teal-400" />
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={profile.location}
                                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                                        className="bg-transparent text-sm font-medium text-white border-b border-white/20 focus:border-white focus:outline-none w-64"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-white">{profile.location}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB NAV */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 flex gap-8">
                    {['overview', 'techniques', 'team', 'gallery'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-6 text-[11px] font-black uppercase tracking-[0.2em] relative ${activeTab === tab ? 'text-[#0E1A2B]' : 'text-slate-400'}`}
                        >
                            {tab}
                            {activeTab === tab && <motion.div layoutId="activeTabClinic" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="max-w-4xl mx-auto p-8 min-h-[50vh]">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> Description
                                </label>
                                {isEditing ? (
                                    <textarea 
                                        value={profile.description}
                                        onChange={(e) => setProfile({...profile, description: e.target.value})}
                                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                                    />
                                ) : (
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.description}</p>
                                )}
                            </div>

                            {/* STRUCTURED STATS EDITOR */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* FOUNDED */}
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Founded</div>
                                    {isEditing ? (
                                        <select 
                                            value={profile.stats.founded}
                                            onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, founded: e.target.value } })}
                                            className="w-full bg-slate-50 p-2 rounded-lg font-bold text-[#0E1A2B] text-sm outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                                        </select>
                                    ) : <div className="font-bold text-[#0E1A2B]">{profile.stats.founded}</div>}
                                </div>

                                {/* SUCCESS RATE */}
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</div>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={profile.stats.success}
                                            onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, success: e.target.value } })}
                                            className="w-full font-bold text-[#0E1A2B] bg-transparent focus:outline-none border-b border-dashed border-slate-300"
                                        />
                                    ) : <div className="font-bold text-[#0E1A2B]">{profile.stats.success}</div>}
                                </div>

                                {/* WAIT TIME */}
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Wait Time</div>
                                    {isEditing ? (
                                        <select 
                                            value={profile.stats.waitTime}
                                            onChange={(e) => setProfile({ ...profile, stats: { ...profile.stats, waitTime: e.target.value } })}
                                            className="w-full bg-slate-50 p-2 rounded-lg font-bold text-[#0E1A2B] text-sm outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            {WAIT_TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : <div className="font-bold text-[#0E1A2B]">{profile.stats.waitTime}</div>}
                                </div>

                                {/* LANGUAGES (Multi-Select) */}
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Languages Spoken</div>
                                    {isEditing ? (
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES_LIST.map(lang => (
                                                <button 
                                                    key={lang}
                                                    onClick={() => toggleLanguage(lang)}
                                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                                        profile.stats.languages.includes(lang) 
                                                        ? 'bg-teal-50 border-teal-200 text-teal-700' 
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    ) : <div className="font-bold text-[#0E1A2B] text-sm">{profile.stats.languages}</div>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Globe size={10} /> Website
                                    </div>
                                    {isEditing ? (
                                        <input type="text" value={profile.website} onChange={(e) => setProfile({...profile, website: e.target.value})} className="w-full font-bold text-[#0E1A2B] bg-transparent focus:outline-none text-xs" />
                                    ) : <div className="text-xs font-bold text-[#0E1A2B] truncate">{profile.website}</div>}
                                </div>
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Mail size={10} /> Email
                                    </div>
                                    {isEditing ? (
                                        <input type="text" value={profile.contactEmail} onChange={(e) => setProfile({...profile, contactEmail: e.target.value})} className="w-full font-bold text-[#0E1A2B] bg-transparent focus:outline-none text-xs" />
                                    ) : <div className="text-xs font-bold text-[#0E1A2B] truncate">{profile.contactEmail}</div>}
                                </div>
                                <div className={`p-4 bg-white border rounded-2xl ${isEditing ? 'border-slate-200 hover:border-teal-200' : 'border-slate-100'}`}>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Phone size={10} /> Phone
                                    </div>
                                    {isEditing ? (
                                        <input type="text" value={profile.contactPhone} onChange={(e) => setProfile({...profile, contactPhone: e.target.value})} className="w-full font-bold text-[#0E1A2B] bg-transparent focus:outline-none text-xs" />
                                    ) : <div className="text-xs font-bold text-[#0E1A2B] truncate">{profile.contactPhone}</div>}
                                </div>
                            </div>

                            {/* AMENITIES EDITOR */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Star size={14} /> Clinic Features & Amenities
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.amenities.map((item, idx) => (
                                        <div key={idx} className="group relative">
                                            {isEditing ? (
                                                <input 
                                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none min-w-[120px]"
                                                    value={item}
                                                    onChange={(e) => handleAmenityChange(idx, e.target.value)}
                                                />
                                            ) : (
                                                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 block shadow-sm">{item}</span>
                                            )}
                                            {isEditing && (
                                                <button onClick={() => removeAmenity(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button onClick={addAmenity} className="px-4 py-2 bg-white border border-dashed border-teal-300 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 transition-colors flex items-center gap-1">
                                            <Plus size={12} /> Add Feature
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Starting Price (€)</div>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={profile.startPrice}
                                            onChange={(e) => setProfile({...profile, startPrice: e.target.value})}
                                            className="text-3xl font-black text-[#0E1A2B] bg-transparent border-b-2 border-slate-200 focus:border-teal-500 focus:outline-none w-40"
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-[#0E1A2B]">{profile.startPrice}</span>
                                    )}
                                </div>
                                <div className="text-right text-xs text-slate-400 max-w-[200px]">
                                    Displayed as "Starting From" on directory cards.
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* NEW TECHNIQUES TAB */}
                    {activeTab === 'techniques' && (
                        <motion.div 
                            key="techniques"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Scissors size={14} /> Available Methods
                                </div>
                                {isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {TECHNIQUES_LIST.map(tech => (
                                            <button 
                                                key={tech}
                                                onClick={() => toggleTechnique(tech)}
                                                className={`
                                                    p-4 rounded-xl text-left transition-all border flex items-center justify-between
                                                    ${profile.techniques.includes(tech) 
                                                        ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-sm' 
                                                        : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}
                                                `}
                                            >
                                                <span className="font-bold text-sm">{tech}</span>
                                                {profile.techniques.includes(tech) && <CheckCircle2 size={16} className="text-teal-600" />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {profile.techniques.map(tech => (
                                            <div key={tech} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <CheckCircle2 size={16} className="text-teal-600" />
                                                <span className="font-bold text-[#0E1A2B] text-sm">{tech}</span>
                                            </div>
                                        ))}
                                        {profile.techniques.length === 0 && (
                                            <p className="text-slate-400 text-sm italic">No techniques listed.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-xs font-medium leading-relaxed flex items-start gap-3">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                Selecting accurate techniques helps match you with patients seeking specific treatments like DHI or Needle-Free Anesthesia.
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'team' && (
                        <motion.div 
                            key="team"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Hidden file input for team upload */}
                            <input 
                                type="file" 
                                ref={teamInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleTeamImageUpload} 
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                {profile.team.map((member, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col gap-4 relative group hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-20 h-20 shrink-0">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 shadow-md">
                                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                                                </div>
                                                {isEditing && (
                                                    <button 
                                                        onClick={() => triggerTeamImageUpload(idx)}
                                                        className="absolute bottom-0 right-0 p-2 bg-[#0E1A2B] rounded-full text-white hover:bg-teal-500 transition-colors shadow-lg z-10"
                                                        title="Upload Photo"
                                                    >
                                                        <Camera size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {isEditing ? (
                                                    <>
                                                        <input 
                                                            className="w-full font-bold text-[#0E1A2B] bg-slate-50 px-3 py-2 rounded-lg border border-transparent focus:border-teal-500 focus:outline-none"
                                                            value={member.name}
                                                            onChange={(e) => {
                                                                const newTeam = [...profile.team];
                                                                newTeam[idx].name = e.target.value;
                                                                setProfile({...profile, team: newTeam});
                                                            }}
                                                            placeholder="Name"
                                                        />
                                                        <input 
                                                            className="w-full text-xs text-teal-600 font-bold uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-lg border border-transparent focus:border-teal-500 focus:outline-none"
                                                            value={member.role}
                                                            onChange={(e) => {
                                                                const newTeam = [...profile.team];
                                                                newTeam[idx].role = e.target.value;
                                                                setProfile({...profile, team: newTeam});
                                                            }}
                                                            placeholder="Role"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="font-bold text-[#0E1A2B] text-lg">{member.name}</div>
                                                        <div className="text-xs text-teal-600 font-bold uppercase tracking-widest">{member.role}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Bio Field */}
                                        {isEditing ? (
                                            <textarea
                                                className="w-full text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-transparent focus:border-teal-500 focus:outline-none resize-none"
                                                rows={3}
                                                value={member.bio || ""}
                                                onChange={(e) => {
                                                    const newTeam = [...profile.team];
                                                    newTeam[idx].bio = e.target.value;
                                                    setProfile({...profile, team: newTeam});
                                                }}
                                                placeholder="Short professional biography..."
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-500 leading-relaxed pl-1">{member.bio}</p>
                                        )}

                                        {isEditing && (
                                            <button 
                                                onClick={() => removeTeamMember(idx)}
                                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                title="Remove Member"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                
                                {isEditing && (
                                    <button 
                                        onClick={addTeamMember}
                                        className="h-full min-h-[200px] rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Plus size={24} />
                                        </div>
                                        <span className="font-bold text-sm uppercase tracking-widest">Add Team Member</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'gallery' && (
                        <motion.div 
                            key="gallery"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* VIDEO SECTION */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Youtube size={14} /> Featured Clinic Video
                                </div>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <input 
                                            type="text" 
                                            value={profile.video || ''}
                                            onChange={(e) => setProfile({...profile, video: e.target.value})}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0E1A2B] focus:border-teal-500 outline-none"
                                            placeholder="Paste YouTube Link here (e.g. https://youtube.com/watch?v=...)"
                                        />
                                        {profile.video && getYoutubeId(profile.video) && (
                                            <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 relative">
                                                <iframe 
                                                    width="100%" 
                                                    height="100%" 
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(profile.video)}?rel=0&modestbranding=1`}
                                                    title="YouTube video player" 
                                                    frameBorder="0" 
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    profile.video && getYoutubeId(profile.video) ? (
                                        <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-lg relative group cursor-pointer">
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                src={`https://www.youtube.com/embed/${getYoutubeId(profile.video)}?rel=0&modestbranding=1`}
                                                title="Clinic Video" 
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                                className="pointer-events-none" // Disable interaction in preview mode
                                            ></iframe>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none">
                                                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                                    <Play size={24} className="fill-[#0E1A2B] text-[#0E1A2B] ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            No video added.
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {profile.gallery.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group">
                                        <img src={img} className="w-full h-full object-cover" alt="Clinic" />
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500/80 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-all">
                                        <ImageIcon size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* SAVE BAR */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button 
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className={`
                        px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:scale-105
                        ${isEditing 
                            ? 'bg-[#0E1A2B] text-white' 
                            : 'bg-white text-[#0E1A2B] border border-slate-200'}
                    `}
                >
                    {isEditing ? (
                        isSaving ? <span className="animate-pulse">Saving...</span> : <>Save Changes <Save size={14} /></>
                    ) : (
                        <>Edit Profile <Pencil size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

// --- MAIN PORTAL SCREEN ---

const PartnerPortalScreen: React.FC<{ lang: LanguageCode; onBack: () => void; }> = ({ lang, onBack }) => {
  const { leads, clinicTier, setClinicTier, unlockLead, submitClinicResponse } = useLeads();

  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [activeTab, setActiveTab] = useState<'inbox' | 'my_cases' | 'my_clinic' | 'profile' | 'media' | 'marketplace' | 'settings'>('inbox');
  const [selectedCase, setSelectedCase] = useState<LeadData | null>(null);
  const [credits, setCredits] = useState(120);

  // Clinic state from database
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [clinicSubTab, setClinicSubTab] = useState<'profile' | 'media' | 'marketplace'>('profile');
  
  // Monetization / Modal State
  const [activeModal, setActiveModal] = useState<UpgradeReason | null>(null);

  // Response Builder Form State
  const [responseForm, setResponseForm] = useState<Partial<ClinicResponse>>({
      opinion: undefined,
      approach: { hairline: 'Conservative', crown: 'Secondary', sessions: 'Single Session', notes: '' },
      proposal: { graftRange: '', priceRange: '', currency: '€' }
  });

  // Additional State for Clinical Dashboard
  const [activePhotoView, setActivePhotoView] = useState<'original' | 'ai'>('original');
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  // Human-in-the-Loop State (Doctor Correction)
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionData, setCorrectionData] = useState({
      norwood: '',
      grafts: ''
  });

  // Load initial values when case is selected
  useMemo(() => {
      if (selectedCase) {
          setCorrectionData({
              norwood: selectedCase.norwoodScale,
              grafts: selectedCase.estimatedGrafts
          });
      }
  }, [selectedCase]);

  // Load clinic data on login
  useEffect(() => {
    if (view === 'dashboard') {
      loadClinicData();
    }
  }, [view]);

  const loadClinicData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clinic } = await clinicManagementService.getClinicByUserId(user.id);
    if (clinic) {
      setClinic(clinic);
      setClinicId(clinic.id);
      setCredits(Number(clinic.credits) || 0);
    }
  };

  const handlePurchaseComplete = (newCredits: number) => {
    setCredits(newCredits);
  };

  // Actions
  const handleUpgrade = () => {
      setClinicTier('CoE');
      setActiveModal(null);
  };

  const handleModalClose = () => {
      setActiveModal(null);
  };

  // Trigger 1: Inbox Click
  const handleCaseClick = (lead: LeadData) => {
      // Logic for Free Tier Restrictions (if applicable)
      if (clinicTier === 'Free' && lead.suitability === 'suitable' && !lead.isUnlocked) {
          setActiveModal('priority_cases');
          return;
      }
      setSelectedCase(lead);
  };

  // Trigger 3: Proposal Click
  const handleProposalClick = () => {
      if (clinicTier === 'Free') {
          setActiveModal('proposal_snapshot');
      }
  };

  const handleUnlockCase = (lead: LeadData) => {
      if (credits < 1) { 
          // Show Upgrade/Buy Modal if out of passes
          setActiveModal('response_limit');
          return; 
      }
      setCredits(c => c - 1);
      unlockLead(lead.id);
      setSelectedCase({ ...lead, isUnlocked: true });
  };

  const handleSendResponse = () => {
      if (!selectedCase || !responseForm.opinion) return;
      
      const proposalPayload = clinicTier === 'CoE' ? responseForm.proposal : undefined;

      // Construct Correction Payload if modified
      const hasCorrection = isCorrecting && (correctionData.norwood !== selectedCase.norwoodScale || correctionData.grafts !== selectedCase.estimatedGrafts);
      const correctionPayload = hasCorrection ? {
          isCorrected: true,
          originalNorwood: selectedCase.norwoodScale,
          correctedNorwood: correctionData.norwood,
          originalGraftEstimate: selectedCase.estimatedGrafts,
          correctedGraftEstimate: correctionData.grafts,
          doctorComment: "Expert correction applied."
      } : undefined;

      submitClinicResponse(selectedCase.id, {
          clinicId: 'CLI-001',
          clinicName: clinicTier === 'CoE' ? 'HairMedico (CoE)' : 'Standard Clinic',
          clinicTier: clinicTier,
          opinion: responseForm.opinion,
          approach: responseForm.approach as any,
          proposal: proposalPayload as any,
          medicalCorrection: correctionPayload
      });
      
      setSelectedCase(null);
      setIsCorrecting(false);
      // Reset form
      setResponseForm({
          opinion: undefined,
          approach: { hairline: 'Conservative', crown: 'Secondary', sessions: 'Single Session', notes: '' },
          proposal: { graftRange: '', priceRange: '', currency: '€' }
      });
  };

  const filteredCases = useMemo(() => {
      if (activeTab === 'inbox') return leads.filter(l => !l.isUnlocked);
      if (activeTab === 'my_cases') return leads.filter(l => l.isUnlocked);
      return [];
  }, [leads, activeTab]);

  // Derived Data for Assessment View
  const intake = selectedCase?.intake || {};
  const analysis = selectedCase?.analysisData || {} as any;
  const metrics = analysis.technical_metrics || {};

  if (view === 'login') return <ClinicAuth onLoginSuccess={() => setView('dashboard')} onBack={onBack} />;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-800">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed inset-y-0 z-50">
            <div className="p-6 border-b border-slate-50">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#0E1A2B] rounded-xl flex items-center justify-center text-white"><Activity size={20} /></div>
                    <div>
                        <h2 className="text-lg font-black text-[#0E1A2B] leading-none tracking-tight">HAIR<span className="text-teal-500">VIS</span></h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Partner Access</span>
                    </div>
                </div>
                <CoEBadge active={clinicTier === 'CoE'} onClick={() => setClinicTier(clinicTier === 'Free' ? 'CoE' : 'Free')} />
                {clinicTier === 'Free' && (
                    <button onClick={() => setClinicTier('CoE')} className="mt-3 w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <Zap size={10} className="fill-white" /> Upgrade to CoE
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavButton active={activeTab === 'inbox'} onClick={() => {setActiveTab('inbox'); setSelectedCase(null);}} icon={ClipboardList} label="Inbox" count={leads.filter(l => !l.isUnlocked).length} />
                <NavButton active={activeTab === 'my_cases'} onClick={() => {setActiveTab('my_cases'); setSelectedCase(null);}} icon={UserCheck} label="My Cases" count={leads.filter(l => l.isUnlocked).length} />
                <NavButton active={activeTab === 'marketplace'} onClick={() => {setActiveTab('marketplace'); setSelectedCase(null);}} icon={ShoppingCart} label="Lead Marketplace" />
                <NavButton active={activeTab === 'my_clinic'} onClick={() => {setActiveTab('my_clinic'); setClinicSubTab('profile'); setSelectedCase(null);}} icon={Building2} label="My Clinic" />
                <NavButton active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setSelectedCase(null);}} icon={Settings} label="Settings" />
            </nav>

            <div className="p-6 border-t border-slate-50">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200 mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Credits</p>
                        {clinicTier === 'CoE' && (
                            <span className="text-[9px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-full border border-amber-200">CoE Member</span>
                        )}
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-amber-900">{credits}</span>
                        <button className="text-[10px] font-bold text-amber-700 hover:underline">+ Buy Credits</button>
                    </div>
                    <p className="text-[9px] text-amber-700 mt-2 leading-tight">Use credits to unlock leads and view full contact details.</p>
                </div>
                <button onClick={() => setView('login')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 lg:ml-72 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            {activeTab !== 'my_clinic' && activeTab !== 'marketplace' && (
                <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center z-40">
                    <div>
                        <div className="flex items-center gap-3">
                            {selectedCase && (
                                <button onClick={() => setSelectedCase(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                            )}
                            <h1 className="text-xl font-black text-[#0E1A2B] uppercase tracking-tight">
                                {selectedCase ? `Case Assessment: ${selectedCase.id}` : activeTab === 'inbox' ? 'Case Inbox' : activeTab === 'my_cases' ? 'My Active Cases' : activeTab === 'settings' ? 'Clinic Settings' : 'Dashboard'}
                            </h1>
                        </div>
                        {selectedCase && (
                            <p className="text-xs text-slate-500 mt-1 ml-11">{selectedCase.isUnlocked ? 'Reviewing full details' : 'Reviewing anonymous details'}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </header>
            )}

            <div className={`flex-1 overflow-y-auto relative bg-[#F7F8FA] ${activeTab === 'my_clinic' || activeTab === 'marketplace' ? 'p-0' : selectedCase ? 'p-0' : 'p-8'}`}>
                {activeTab === 'marketplace' ? (
                    <div className="p-8">
                        {clinicId ? (
                            <LeadMarketplace
                                clinicId={clinicId}
                                clinicCredits={credits}
                                onPurchase={handlePurchaseComplete}
                            />
                        ) : (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                ) : activeTab === 'my_clinic' ? (
                    <div className="min-h-screen bg-[#F7F8FA]">
                        {/* Clinic Sub-Navigation */}
                        <div className="bg-white border-b border-slate-200 px-8 py-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setClinicSubTab('profile')}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors ${
                                        clinicSubTab === 'profile'
                                            ? 'bg-teal-500 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Building2 size={16} className="inline mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setClinicSubTab('media')}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors ${
                                        clinicSubTab === 'media'
                                            ? 'bg-teal-500 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <ImageIcon size={16} className="inline mr-2" />
                                    Media
                                </button>
                            </div>
                        </div>

                        {/* Clinic Content */}
                        <div className="p-8">
                            {clinicId ? (
                                <>
                                    {clinicSubTab === 'profile' && (
                                        <ClinicProfileEditor clinicId={clinicId} onSave={loadClinicData} />
                                    )}
                                    {clinicSubTab === 'media' && (
                                        <ClinicMediaManager clinicId={clinicId} />
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="max-w-3xl mx-auto space-y-8 p-8">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-black text-[#0E1A2B] mb-6">Trust & Visibility</h2>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${clinicTier === 'CoE' ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0E1A2B] text-sm">Response Time Badge</div>
                                        <div className="text-xs text-slate-500">Show "Responds within 24h" on your profile</div>
                                    </div>
                                </div>
                                {clinicTier === 'CoE' ? (
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase">Active</div>
                                ) : (
                                    <button onClick={() => setActiveModal('sla_visibility')} className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline">
                                        <Lock size={10} /> Upgrade to CoE
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${clinicTier === 'CoE' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                                        <BarChart3 size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#0E1A2B] text-sm">Performance Analytics</div>
                                        <div className="text-xs text-slate-500">View conversion rates and case trends</div>
                                    </div>
                                </div>
                                {clinicTier === 'CoE' ? (
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase">Active</div>
                                ) : (
                                    <button onClick={() => setActiveModal('analytics')} className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline">
                                        <Lock size={10} /> Upgrade to CoE
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : selectedCase ? (
                    // --- DETAILED CLINICAL COCKPIT ---
                    <div className="max-w-full h-[calc(100vh-80px)] flex flex-col md:flex-row gap-0 md:gap-px bg-slate-200 overflow-hidden">
                        
                        {/* LEFT: Patient Profile & Intake (Scrollable) */}
                        <div className="w-full md:w-[25%] bg-[#F7F8FA] overflow-y-auto flex flex-col gap-px">
                            {/* 1. Patient Card */}
                            <div className="bg-white p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-lg relative">
                                        <img src={selectedCase.thumbnailUrl} className={`w-full h-full object-cover ${!selectedCase.isUnlocked ? 'blur-sm' : ''}`} />
                                        {!selectedCase.isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Lock size={16} className="text-white"/></div>}
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-[#0E1A2B] leading-tight">
                                            {selectedCase.isUnlocked ? selectedCase.patientDetails?.fullName : `Patient ${selectedCase.id.substring(0,4)}`}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Globe size={12} /> {selectedCase.countryCode} • {selectedCase.age} Yrs
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <SuitabilityBadge status={selectedCase.suitability} />
                                        </div>
                                    </div>
                                </div>
                                {!selectedCase.isUnlocked && (
                                    <button onClick={() => handleUnlockCase(selectedCase)} className="w-full py-3 bg-[#0E1A2B] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors">
                                        <Unlock size={14} /> Unlock Profile (1 Pass)
                                    </button>
                                )}
                            </div>

                            {/* 2. Intake Summary */}
                            <div className="bg-white p-6 flex-1">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText size={14} /> Intake Summary
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <History size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">History</div>
                                            <div className="text-sm font-bold text-[#0E1A2B]">{intake.history === 'Yes' ? 'Previous Transplant' : 'First Procedure'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                            <Pill size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Medication</div>
                                            <div className="text-sm font-bold text-[#0E1A2B]">{intake.meds === 'None' ? 'No Meds' : intake.meds || 'Not Reported'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Timeline</div>
                                            <div className="text-sm font-bold text-[#0E1A2B]">{intake.timeline || 'ASAP'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. AI Analysis */}
                            <div className="bg-slate-50 p-6 border-t border-slate-100">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BrainCircuit size={14} className="text-teal-600" /> AI Findings
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Norwood</div>
                                        <div className="text-lg font-black text-[#0E1A2B]">{analysis.diagnosis?.norwood_scale || selectedCase.norwoodScale}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Donor</div>
                                        <div className="text-lg font-black text-[#0E1A2B]">{selectedCase.donorBand}</div>
                                    </div>
                                    <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Est. Grafts</div>
                                        <div className="text-lg font-black text-teal-600">{metrics.graft_count_min} - {metrics.graft_count_max}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CENTER: Visual Radiology (Dark Mode) */}
                        <div className="w-full md:w-[50%] bg-[#050B14] flex flex-col relative">
                            {/* Toolbar */}
                            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setActivePhotoView('original')}
                                        className={`text-xs font-bold uppercase tracking-widest py-4 border-b-2 transition-colors ${activePhotoView === 'original' ? 'text-white border-teal-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                                    >
                                        Original Photos
                                    </button>
                                    {selectedCase.analysisData?.simulation_image && (
                                        <button 
                                            onClick={() => setActivePhotoView('ai')}
                                            className={`text-xs font-bold uppercase tracking-widest py-4 border-b-2 transition-colors flex items-center gap-2 ${activePhotoView === 'ai' ? 'text-teal-400 border-teal-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                                        >
                                            <Sparkles size={12} /> AI Simulation
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                        <Maximize2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Main Canvas */}
                            <div className="flex-1 relative flex items-center justify-center bg-black/50 p-4">
                                <img 
                                    src={activePhotoView === 'ai' ? selectedCase.analysisData?.simulation_image : selectedCase.thumbnailUrl} 
                                    className={`max-h-full max-w-full object-contain shadow-2xl rounded-lg ${!selectedCase.isUnlocked ? 'blur-xl opacity-30' : ''}`}
                                />
                                {!selectedCase.isUnlocked && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <Lock size={48} className="text-slate-600 mb-4" />
                                        <div className="bg-[#0E1A2B] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                                            Photos Locked
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Filmstrip */}
                            <div className="h-24 border-t border-white/10 bg-[#0A0F16] flex items-center px-4 gap-3 overflow-x-auto no-scrollbar">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-16 aspect-square bg-slate-800 rounded-lg overflow-hidden border border-white/10 hover:border-teal-500 cursor-pointer transition-colors relative">
                                        <img src={selectedCase.thumbnailUrl} className={`w-full h-full object-cover ${!selectedCase.isUnlocked ? 'blur-sm' : ''}`} />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] font-bold text-white text-center py-0.5 uppercase">
                                            {['Front', 'Top', 'Left', 'Right', 'Donor'][i-1]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Surgical Proposal (Scrollable) */}
                        <div className="w-full md:w-[25%] bg-white flex flex-col border-l border-slate-200">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-widest flex items-center gap-2">
                                    <Stethoscope size={16} className="text-teal-600" /> Surgical Plan
                                </h3>
                            </div>
                            
                            {selectedCase.isUnlocked ? (
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* 1. Technique Selector */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Technique</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['Sapphire FUE', 'DHI Implantation', 'Hybrid'].map(tech => (
                                                <button 
                                                    key={tech}
                                                    // This currently mocks selecting a technique, integration would update responseForm
                                                    className={`px-4 py-3 rounded-xl border text-xs font-bold text-left transition-all ${tech === 'Sapphire FUE' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    {tech}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Graft Count */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Grafts</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                placeholder="e.g. 3500" 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0E1A2B] focus:border-teal-500 outline-none"
                                                value={responseForm.proposal?.graftRange}
                                                onChange={(e) => setResponseForm({...responseForm, proposal: {...responseForm.proposal, graftRange: e.target.value} as any})}
                                            />
                                            <span className="text-xs font-bold text-slate-400">Grafts</span>
                                        </div>
                                    </div>

                                    {/* 3. Pricing */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Package Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                                            <input 
                                                type="number" 
                                                placeholder="2500" 
                                                className="w-full p-3 pl-8 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0E1A2B] focus:border-teal-500 outline-none"
                                                value={responseForm.proposal?.priceRange}
                                                onChange={(e) => setResponseForm({...responseForm, proposal: {...responseForm.proposal, priceRange: e.target.value} as any})}
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Notes */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Note</label>
                                        <textarea 
                                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:border-teal-500 outline-none resize-none"
                                            placeholder="Write your assessment here..."
                                        />
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200">Standard Reply</button>
                                            <button className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200">Medical Query</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                                    <Lock size={32} className="text-slate-400 mb-3" />
                                    <p className="text-xs font-bold text-slate-500">Proposal tools locked</p>
                                </div>
                            )}

                            {/* Submit Area */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                <button 
                                    onClick={handleSendResponse}
                                    disabled={!selectedCase.isUnlocked}
                                    className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Send Proposal <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    // --- GRID VIEW (Inbox / My Cases) ---
                    <div className="max-w-7xl mx-auto p-8">
                        
                        {/* BANNER 3: RESPONSE LIMIT (Simulated condition) */}
                        {(credits < 5 || clinicTier === 'Free') && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-[#0E1A2B] to-slate-900 rounded-2xl border border-slate-800 text-white flex items-center justify-between shadow-lg">
                                <div>
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <AlertCircle size={16} className="text-amber-400" />
                                        Standard Partners have a monthly response cap
                                    </h4>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        CoE clinics can respond without interruption and get 30 Engagement Passes included every month.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setActiveModal('response_limit')} className="px-4 py-2 bg-white text-[#0E1A2B] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-colors">
                                        Upgrade to CoE
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCases.map(lead => {
                                // Trigger 1 Logic: Free tier sees Green cases as locked/blurred
                                const isPriorityLocked = clinicTier === 'Free' && lead.suitability === 'suitable' && !lead.isUnlocked;
                                
                                return (
                                    <div 
                                        key={lead.id} 
                                        onClick={() => handleCaseClick(lead)} 
                                        className={`
                                            bg-white rounded-[2rem] p-6 border transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full
                                            ${isPriorityLocked ? 'border-amber-100 hover:border-amber-200' : 'border-slate-100 hover:shadow-xl'}
                                        `}
                                    >
                                        {/* BANNER 1: Priority Lock Overlay */}
                                        {isPriorityLocked && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                                                <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center mb-3">
                                                    <Crown size={20} className="text-amber-500 fill-amber-500" />
                                                </div>
                                                <h4 className="font-black text-[#0E1A2B] uppercase tracking-wide text-xs mb-1">See suitable cases earlier</h4>
                                                <p className="text-[10px] text-slate-500 font-medium mb-4 max-w-[200px] leading-relaxed">
                                                    CoE clinics access high-fit cases first and receive 30 passes every month.
                                                </p>
                                                <button onClick={() => setActiveModal('priority_cases')} className="text-[10px] font-black text-[#0E1A2B] uppercase tracking-widest hover:text-teal-600 underline decoration-slate-300 underline-offset-4">
                                                    Upgrade to CoE
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                                                    <img src={lead.thumbnailUrl} className={`w-full h-full object-cover ${!lead.isUnlocked ? 'blur-sm opacity-60' : ''}`} />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-[#0E1A2B] block">{lead.isUnlocked ? lead.patientDetails?.fullName : `Case ${lead.id}`}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">{lead.registrationDate}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <SuitabilityBadge status={lead.suitability} />
                                                {/* NEW LEAD SCORE BADGE */}
                                                {lead.leadScore > 0 && <LeadScoreBadge score={lead.leadScore} />}
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                                <span className="text-slate-500 font-medium text-[11px]">Hair Loss</span>
                                                <span className="font-bold text-[#0E1A2B]">{lead.norwoodScale}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium text-[11px]">Donor</span>
                                                <span className="font-bold text-[#0E1A2B]">{lead.donorBand}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />)}
                                            </div>
                                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest group-hover:underline decoration-teal-600/30">
                                                {lead.isUnlocked ? 'View Details' : 'Unlock Case'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>

        <AnimatePresence>
            {activeModal && (
                <UpgradeModal 
                    reason={activeModal} 
                    onClose={handleModalClose} 
                    onUpgrade={handleUpgrade}
                    onSecondary={handleModalClose}
                />
            )}
        </AnimatePresence>
    </div>
  );
};

// --- NAVIGATION BUTTON ---
const NavButton = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-slate-100 text-[#0E1A2B]' : 'text-slate-500 hover:bg-slate-50'}`}>
        <div className="flex items-center gap-3"><Icon size={18} className={active ? 'text-[#0E1A2B]' : 'text-slate-400'} /><span className="text-xs font-bold uppercase tracking-wide">{label}</span></div>
        {count > 0 && <span className="bg-[#0E1A2B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{count}</span>}
    </button>
);

export default PartnerPortalScreen;
