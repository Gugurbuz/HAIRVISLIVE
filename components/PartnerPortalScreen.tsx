
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  Users, 
  CreditCard, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  ChevronRight, 
  MapPin, 
  Activity, 
  Calendar,
  Phone,
  FileText,
  Clock,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  LogOut,
  Plus,
  X,
  Mail,
  ExternalLink,
  ChevronDown,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Hotel,
  Plane,
  Car,
  Building2,
  ArrowRight,
  Info
} from 'lucide-react';
import { LanguageCode } from '../translations';
import { useLeads, LeadData, ProposalDetails } from '../context/LeadContext';

// --- TYPES ---
interface Transaction {
  id: string;
  type: 'ACCESS' | 'REFILL' | 'PROPOSAL';
  amount: number;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING';
}

interface PartnerPortalProps {
  lang: LanguageCode;
  onBack: () => void;
}

interface ClinicAuthProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const ClinicAuth: React.FC<ClinicAuthProps> = ({ onLoginSuccess, onBack }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fillTestCredentials = () => {
      setEmail('test@clinic.com');
      setPassword('password123');
      setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API call with validation
    setTimeout(() => {
      setIsLoading(false);
      
      if (isRegister) {
          // Registration simulation
          onLoginSuccess();
      } else {
          // Login simulation - Support both demo and test accounts
          const isValidDemo = email === 'demo@clinic.com' && password === 'demo123';
          const isValidTest = email === 'test@clinic.com' && password === 'password123';

          if (isValidDemo || isValidTest) {
              onLoginSuccess();
          } else {
              setError("Invalid credentials. Use the 'Quick Login' button for testing.");
          }
      }
    }, 1200);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-950 relative overflow-y-auto p-6">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDuration: '4s'}} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDuration: '6s'}} />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side: Visuals */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 to-slate-950 relative border-r border-slate-800">
           {/* Image Overlay */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay" />
           
           <div className="relative z-10">
             <div className="flex items-center gap-2 text-teal-400 mb-6">
               <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                  <Activity size={18} />
               </div>
               <span className="font-bold text-xl tracking-tight text-white">HAIR<span className="text-teal-500">VIS</span> <span className="text-slate-400 font-medium">Pro</span></span>
             </div>
             <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
               High-Intent Patients,<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Delivered Instantly.</span>
             </h2>
             <p className="text-slate-400 text-lg">
               Stop chasing cold leads. Access real-time AI analyzed patients actively looking for hair restoration.
             </p>
           </div>

           <div className="space-y-4 relative z-10">
             <div className="flex items-center gap-3 text-sm text-slate-300">
               <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400"><ShieldCheck size={18} /></div>
               <span>HIPAA & GDPR Compliant Data Processing</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-300">
               <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400"><Building2 size={18} /></div>
               <span>Trusted by 500+ Global Clinics</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400"><CheckCircle2 size={18} /></div>
                <span>Verified Patient Identities</span>
             </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-slate-900/50 backdrop-blur-sm">
           <div className="mb-8">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-2xl font-bold text-white mb-2">
                   {isRegister ? "Partner Application" : "Clinic Portal"}
                 </h3>
                 <p className="text-slate-400 text-sm">
                   {isRegister ? "Join the network of verified hair restoration experts." : "Welcome back. Check your dashboard for new leads."}
                 </p>
               </div>
               {!isRegister && (
                 <div className="hidden lg:flex flex-col items-end">
                   <div className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                     <Info size={10} /> Test Mode Active
                   </div>
                 </div>
               )}
             </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             {isRegister && (
               <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Clinic Name</label>
                 <div className="relative group">
                   <Building2 className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                   <input 
                     type="text" 
                     placeholder="Elite Hair Center" 
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-700" 
                     required 
                     value={clinicName}
                     onChange={(e) => setClinicName(e.target.value)}
                   />
                 </div>
               </div>
             )}

             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Work Email</label>
               <div className="relative group">
                 <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                 <input 
                    type="email" 
                    placeholder="dr.smith@clinic.com" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-700" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
               </div>
             </div>

             <div className="space-y-1">
               <div className="flex justify-between items-center ml-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                 {!isRegister && <a href="#" className="text-xs text-teal-500 hover:text-teal-400">Forgot password?</a>}
               </div>
               <div className="relative group">
                 <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                 <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-700" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                 />
               </div>
             </div>
             
             {error && (
                 <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                     <AlertCircle size={16} />
                     {error}
                 </div>
             )}

             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-900/30 hover:shadow-teal-900/50 transform active:scale-[0.98]"
             >
               {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <>
                   {isRegister ? "Apply for Access" : "Access Dashboard"}
                   <ArrowRight size={18} />
                 </>
               )}
             </button>

            {/* Test Credentials Helper */}
            {!isRegister && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-2">Internal Test Access</p>
                    <button 
                        type="button"
                        onClick={fillTestCredentials}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold rounded-lg transition-all border border-slate-700 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={14} /> 
                        Quick Login (test@clinic.com)
                    </button>
                </div>
            )}

             {/* Social Login / Divider */}
             <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                </div>
             </div>

             <button type="button" className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
             </button>

           </form>

           <div className="mt-6 text-center text-sm text-slate-500">
             {isRegister ? "Already a partner? " : "Don't have an account? "}
             <button 
               onClick={() => {
                   setIsRegister(!isRegister);
                   setError(null);
               }}
               className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
             >
               {isRegister ? "Log in" : "Apply now"}
             </button>
           </div>
           
           <button onClick={onBack} className="mt-8 text-xs text-slate-600 hover:text-slate-400 text-center w-full transition-colors">
             ← Back to Home
           </button>
        </div>

      </div>
    </div>
  );
};

const PartnerPortalScreen: React.FC<PartnerPortalProps> = ({ lang, onBack }) => {
  const { leads, unlockLead, updateLeadStatus } = useLeads();
  
  // States
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [activeTab, setActiveTab] = useState<'inbox' | 'my_patients' | 'credits'>('inbox');
  const [selectedCase, setSelectedCase] = useState<LeadData | null>(null);
  
  // Credits System
  const [credits, setCredits] = useState(120);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  
  // Proposal System
  const [showProposalModal, setShowProposalModal] = useState<{ leadId: string; } | null>(null);
  const [proposalForm, setProposalForm] = useState({
      treatment: 'Sapphire FUE',
      packageTier: 'Standard All-Inclusive',
      price: 2500,
      notes: ''
  });

  // Mock Transactions for "Credits" tab
  const transactions: Transaction[] = [
      { id: 'TRX-1024', type: 'ACCESS', amount: 5, description: 'Medical Record Access: Case #8392', date: 'Today, 10:45', status: 'COMPLETED' },
      { id: 'TRX-1023', type: 'REFILL', amount: 50, description: 'Monthly Subscription Renewal', date: 'Oct 01, 2025', status: 'COMPLETED' },
  ];

  const handleAccessRecords = (lead: LeadData) => {
      if (credits < 5) {
          setShowTopUpModal(true);
          return;
      }
      // Simulate API call
      setTimeout(() => {
          setCredits(prev => prev - 5);
          unlockLead(lead.id);
          // Auto-select the newly unlocked case
          const updatedLead = { ...lead, isUnlocked: true, status: 'PURCHASED' as const };
          setSelectedCase(updatedLead);
      }, 800);
  };

  const handleSendProposal = () => {
      if (!showProposalModal) return;
      
      const proposalDetails: ProposalDetails = {
        clinicName: "Global Health Istanbul",
        price: proposalForm.price,
        currency: "€",
        treatmentType: proposalForm.treatment,
        packageTier: proposalForm.packageTier,
        inclusions: {
            hotel: "4* Comfort",
            flight: false,
            transfer: true,
            nights: 3
        },
        timestamp: Date.now()
      };

      updateLeadStatus(showProposalModal.leadId, 'NEGOTIATING', proposalForm.price, proposalDetails);
      setShowProposalModal(null);
      // Optional: Show success toast
  };

  const filteredCases = useMemo(() => {
    if (activeTab === 'inbox') return leads.filter(l => !l.isUnlocked);
    if (activeTab === 'my_patients') return leads.filter(l => l.isUnlocked);
    return [];
  }, [leads, activeTab]);

  const getCountryFlag = (code: string) => {
    const flags: Record<string, string> = { 'GB': '🇬🇧', 'US': '🇺🇸', 'DE': '🇩🇪', 'FR': '🇫🇷', 'TR': '🇹🇷' };
    return flags[code] || '🏳️';
  };

  // --- LOGIN SCREEN ---
  if (view === 'login') {
      return <ClinicAuth onLoginSuccess={() => setView('dashboard')} onBack={onBack} />;
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans text-slate-800">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed inset-y-0 z-50">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0E1A2B] rounded-xl flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#0E1A2B] leading-none tracking-tight">HAIR<span className="text-teal-500">VIS</span></h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Partner Access</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <NavButton 
                    active={activeTab === 'inbox'} 
                    onClick={() => {setActiveTab('inbox'); setSelectedCase(null);}} 
                    icon={ClipboardList} 
                    label="Patient Requests" 
                    count={leads.filter(l => !l.isUnlocked).length}
                />
                <NavButton 
                    active={activeTab === 'my_patients'} 
                    onClick={() => {setActiveTab('my_patients'); setSelectedCase(null);}} 
                    icon={UserCheck} 
                    label="Active Patients" 
                    count={leads.filter(l => l.isUnlocked).length}
                />
                <NavButton 
                    active={activeTab === 'credits'} 
                    onClick={() => {setActiveTab('credits'); setSelectedCase(null);}} 
                    icon={Settings} 
                    label="Practice Settings" 
                />
            </nav>

            <div className="p-6 border-t border-slate-50">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Credits</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-black text-[#0E1A2B]">{credits}</span>
                        <button onClick={() => setShowTopUpModal(true)} className="text-[10px] font-bold text-teal-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100 hover:border-teal-200 transition-all shadow-sm">
                            + Add
                        </button>
                    </div>
                </div>
                <button onClick={() => setView('login')} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 hover:text-red-500 transition-colors ml-2">
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </aside>

        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 pb-safe">
            <div className="flex justify-around items-center p-2">
                <MobileNavButton active={activeTab === 'inbox'} onClick={() => {setActiveTab('inbox'); setSelectedCase(null);}} icon={ClipboardList} label="Requests" />
                <MobileNavButton active={activeTab === 'my_patients'} onClick={() => {setActiveTab('my_patients'); setSelectedCase(null);}} icon={UserCheck} label="Patients" />
                <MobileNavButton active={activeTab === 'credits'} onClick={() => {setActiveTab('credits'); setSelectedCase(null);}} icon={Settings} label="Settings" />
            </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 lg:ml-72 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center z-40">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-[#0E1A2B] uppercase tracking-tight">
                        {selectedCase ? 'Medical File' : activeTab === 'inbox' ? 'Incoming Requests' : activeTab === 'my_patients' ? 'Patient Directory' : 'Practice Management'}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Triage</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0E1A2B] hover:bg-white hover:shadow-md transition-all relative">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'credits' ? (
                    <div className="h-full overflow-y-auto p-6 md:p-12">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                                <h2 className="text-xl font-black text-[#0E1A2B] mb-6">Account Status</h2>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 bg-[#0E1A2B] rounded-2xl p-6 text-white relative overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Available Credits</p>
                                            <div className="text-5xl font-black mt-2 mb-4">{credits}</div>
                                            <button onClick={() => setShowTopUpModal(true)} className="w-full py-3 bg-white text-[#0E1A2B] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">
                                                Purchase Credits
                                            </button>
                                        </div>
                                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/3 translate-y-1/3">
                                            <Activity size={150} />
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Usage</p>
                                        <div className="text-3xl font-black text-[#0E1A2B] mt-2 mb-1">42 <span className="text-sm text-slate-400 font-medium">Files</span></div>
                                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                                            <div className="bg-teal-500 h-full w-[65%]" />
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-400 mt-2">65% of monthly cap</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-widest ml-2">Access Log</h3>
                                {transactions.map(tx => (
                                    <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'ACCESS' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                                                {tx.type === 'ACCESS' ? <Unlock size={18} /> : <Plus size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0E1A2B]">{tx.description}</p>
                                                <p className="text-[10px] font-medium text-slate-400">{tx.date} • {tx.id}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-black ${tx.type === 'ACCESS' ? 'text-slate-800' : 'text-green-600'}`}>
                                            {tx.type === 'ACCESS' ? '-' : '+'}{tx.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : selectedCase ? (
                    <div className="h-full overflow-y-auto bg-white">
                        {/* MEDICAL RECORD DETAIL VIEW */}
                        <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
                            <button onClick={() => setSelectedCase(null)} className="mb-8 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0E1A2B] transition-colors">
                                <ArrowLeft size={14} /> Back to List
                            </button>

                            <div className="flex flex-col md:flex-row gap-8 mb-12">
                                <div className="w-full md:w-64 shrink-0">
                                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 relative mb-4 shadow-inner">
                                        <img src={selectedCase.thumbnailUrl} className={`w-full h-full object-cover ${selectedCase.isUnlocked ? '' : 'blur-xl scale-110 opacity-50'}`} />
                                        {!selectedCase.isUnlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Lock className="text-slate-400" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#0E1A2B] shadow-sm">
                                            {getCountryFlag(selectedCase.countryCode)} {selectedCase.countryCode}
                                        </div>
                                    </div>
                                    
                                    {selectedCase.isUnlocked ? (
                                        <div className="space-y-2">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <Phone size={16} className="text-teal-600" />
                                                <span className="text-xs font-bold text-[#0E1A2B]">{selectedCase.patientDetails?.phone}</span>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <Mail size={16} className="text-teal-600" />
                                                <span className="text-xs font-bold text-[#0E1A2B] truncate">{selectedCase.patientDetails?.email}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAccessRecords(selectedCase)}
                                            className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                                        >
                                            Unlock Medical File (5 Credits)
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 space-y-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-black text-[#0E1A2B]">Case #{selectedCase.id}</h2>
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {selectedCase.age} Years • {selectedCase.gender}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-medium text-sm">Registered: {selectedCase.registrationDate}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Norwood Scale</p>
                                            <p className="text-2xl font-black text-[#0E1A2B]">{selectedCase.norwoodScale}</p>
                                        </div>
                                        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Est. Grafts</p>
                                            <p className="text-2xl font-black text-[#0E1A2B]">{selectedCase.estimatedGrafts}</p>
                                        </div>
                                    </div>

                                    {selectedCase.analysisData?.technical_metrics && (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Stethoscope size={16} /> AI Analysis Summary
                                            </h3>
                                            <div className="space-y-2 text-sm text-slate-600 font-medium">
                                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                                    <span>Frontal Zone Density</span>
                                                    <span className="text-[#0E1A2B] font-bold">Priority Area</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-200 pb-2 pt-1">
                                                    <span>Suggested Technique</span>
                                                    <span className="text-[#0E1A2B] font-bold">{selectedCase.analysisData.technical_metrics.suggested_technique}</span>
                                                </div>
                                                <div className="flex justify-between pt-1">
                                                    <span>Est. Procedure Time</span>
                                                    <span className="text-[#0E1A2B] font-bold">{selectedCase.analysisData.technical_metrics.estimated_session_time_hours} Hours</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedCase.isUnlocked && selectedCase.status !== 'NEGOTIATING' && (
                                        <div className="pt-6 border-t border-slate-100">
                                            <button 
                                                onClick={() => setShowProposalModal({ leadId: selectedCase.id })}
                                                className="px-8 py-4 bg-teal-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg flex items-center gap-3"
                                            >
                                                <FileText size={16} /> Send Treatment Proposal
                                            </button>
                                        </div>
                                    )}
                                    
                                    {selectedCase.status === 'NEGOTIATING' && (
                                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700">
                                            <CheckCircle2 size={20} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Proposal Sent</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto bg-[#F7F8FA] p-6 md:p-8">
                        {/* LIST VIEW (INBOX) */}
                        {filteredCases.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <ClipboardList size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold">No records found in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                                {filteredCases.map(lead => (
                                    <div 
                                        key={lead.id} 
                                        onClick={() => setSelectedCase(lead)}
                                        className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                                                    <img src={lead.thumbnailUrl} className={`w-full h-full object-cover ${lead.isUnlocked ? '' : 'blur-sm opacity-60'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-[#0E1A2B]">{lead.isUnlocked ? lead.patientDetails?.fullName : `Patient ${lead.id}`}</span>
                                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{getCountryFlag(lead.countryCode)}</span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400">{lead.age} Yrs • {lead.gender}</span>
                                                </div>
                                            </div>
                                            {!lead.isUnlocked && <Lock size={16} className="text-slate-300" />}
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Hair Loss Scale</span>
                                                <span className="font-bold text-[#0E1A2B]">{lead.norwoodScale}</span>
                                            </div>
                                            <div className="w-full h-px bg-slate-50" />
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Needs (Grafts)</span>
                                                <span className="font-bold text-[#0E1A2B]">{lead.estimatedGrafts}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            {lead.isUnlocked ? (
                                                <button className="w-full py-3 bg-slate-50 text-[#0E1A2B] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0E1A2B] hover:text-white transition-colors">
                                                    Open Medical File
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <div className="flex-1 py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:border-slate-300">
                                                        View Profile
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleAccessRecords(lead); }}
                                                        className="px-4 py-3 bg-[#0E1A2B] text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-colors"
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>

        {/* MODALS */}
        <AnimatePresence>
            {showTopUpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTopUpModal(false)} />
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[#0E1A2B]">Add Access Credits</h3>
                            <button onClick={() => setShowTopUpModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><X size={18} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button onClick={() => { setCredits(c => c + 50); setShowTopUpModal(false); }} className="p-6 border border-slate-200 rounded-2xl hover:border-[#0E1A2B] hover:shadow-lg transition-all text-center">
                                <span className="block text-2xl font-black text-[#0E1A2B]">50</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter</span>
                            </button>
                            <button onClick={() => { setCredits(c => c + 200); setShowTopUpModal(false); }} className="p-6 bg-[#0E1A2B] text-white rounded-2xl shadow-xl text-center">
                                <span className="block text-2xl font-black">200</span>
                                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Pro Clinic</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showProposalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowProposalModal(null)} />
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-[#0E1A2B]">Treatment Proposal</h3>
                            <button onClick={() => setShowProposalModal(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><X size={18} /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Treatment Plan</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-sm text-[#0E1A2B] outline-none"
                                    value={proposalForm.treatment}
                                    onChange={e => setProposalForm({...proposalForm, treatment: e.target.value})}
                                >
                                    <option>Sapphire FUE</option>
                                    <option>DHI Implantation</option>
                                    <option>Hybrid Technique</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Package Tier</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Standard All-Inclusive', 'Premium VIP', 'Executive'].map(tier => (
                                        <button 
                                            key={tier}
                                            onClick={() => setProposalForm({...proposalForm, packageTier: tier})}
                                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${proposalForm.packageTier === tier ? 'bg-[#0E1A2B] text-white border-[#0E1A2B]' : 'bg-white text-slate-500 border-slate-200'}`}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Total Price (€)</label>
                                <input 
                                    type="number" 
                                    value={proposalForm.price}
                                    onChange={e => setProposalForm({...proposalForm, price: Number(e.target.value)})}
                                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-lg text-[#0E1A2B] outline-none"
                                />
                            </div>

                            <button onClick={handleSendProposal} className="w-full py-4 bg-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg mt-4">
                                Send Proposal to Patient
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-slate-100 text-[#0E1A2B]' : 'text-slate-500 hover:bg-slate-50'}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} className={active ? 'text-[#0E1A2B]' : 'text-slate-400'} />
            <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        </div>
        {count > 0 && <span className="bg-[#0E1A2B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{count}</span>}
    </button>
);

const MobileNavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active ? 'text-[#0E1A2B] bg-slate-50' : 'text-slate-400'}`}
    >
        <Icon size={20} />
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </button>
);

export default PartnerPortalScreen;
