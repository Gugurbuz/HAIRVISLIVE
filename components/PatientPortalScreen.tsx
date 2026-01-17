
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Lock, Loader2, FileText, Activity } from 'lucide-react';
import { useLeads, LeadData } from '../context/LeadContext';
import DashboardScreen from './DashboardScreen';
import { LanguageCode } from '../translations';

interface PatientPortalProps {
  lang: LanguageCode;
  onExit: () => void;
}

const PatientPortalScreen: React.FC<PatientPortalProps> = ({ lang, onExit }) => {
  const { getLeadByIdOrEmail } = useLeads();
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<LeadData | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network delay for security feel
    setTimeout(() => {
        const lead = getLeadByIdOrEmail(identifier);
        
        if (lead) {
            setActiveLead(lead);
            setView('dashboard');
        } else {
            setError("No report found. Please verify your ID or Email.");
        }
        setIsLoading(false);
    }, 1500);
  };

  const handleQuickDemo = () => {
    setIdentifier('L-8392');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#0E1A2B] text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative z-10"
        >
            <div className="flex flex-col items-center text-center space-y-6 mb-12">
                <div className="w-20 h-20 bg-teal-500/10 rounded-[2rem] flex items-center justify-center border border-teal-500/20 shadow-lg shadow-teal-500/10">
                    <User size={32} className="text-teal-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Report Access</h1>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">
                        Enter your Report ID or registered Email to access your secure visual report and active proposals.
                    </p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                        Report ID or Email
                    </label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            required
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            placeholder="e.g. L-8392 or email@domain.com"
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white placeholder:text-slate-600 focus:border-teal-500 outline-none transition-all font-medium group-hover:bg-slate-950/80"
                        />
                        <Activity className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-bold">
                        {error}
                    </motion.div>
                )}

                <button 
                    disabled={isLoading}
                    className="w-full py-5 bg-teal-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Access Secure Report <ChevronRight size={16} /></>}
                </button>
                
                <button 
                    type="button" 
                    onClick={handleQuickDemo} 
                    className="w-full py-3 bg-teal-500/10 text-teal-400 rounded-xl font-bold text-[9px] uppercase tracking-widest border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                >
                    Fill Demo Report ID
                </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                 <button onClick={onExit} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                     Back to Home
                 </button>
            </div>
        </motion.div>
      </div>
    );
  }

  // DASHBOARD VIEW
  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-28 pb-20">
       <nav className="fixed top-0 left-0 right-0 z-[80] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#0E1A2B] rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-[#0E1A2B] uppercase tracking-wide">My Preview</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {activeLead?.id}</p>
                 </div>
              </div>
              <button onClick={() => setView('login')} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black text-[#0E1A2B] uppercase tracking-widest transition-colors">
                 Log Out
              </button>
          </div>
       </nav>

       <div className="max-w-7xl mx-auto px-6">
          {activeLead ? (
              <DashboardScreen
                lang={lang}
                analysis={activeLead.analysisData || {
                    norwoodScale: activeLead.norwoodScale || 'NW3',
                    hairLossPattern: 'Pattern Hair Loss',
                    severity: 'Moderate' as const,
                    affectedAreas: ['Frontal', 'Crown'],
                    estimatedGrafts: activeLead.estimatedGrafts || 2000,
                    graftsRange: {
                      min: activeLead.estimatedGrafts || 2000,
                      max: activeLead.estimatedGrafts || 2000
                    },
                    confidence: 85,
                    recommendations: {
                      primary: 'Hair Transplant',
                      alternative: [],
                      medicalTreatment: [],
                      lifestyle: []
                    },
                    analysis: {
                      hairDensity: 'Medium' as const,
                      scalpHealth: 'Good' as const,
                      donorAreaQuality: 'Good' as const,
                      candidacy: 'Good' as const,
                      notes: 'Assessment based on profile data'
                    }
                }}
                capturedPhotos={[]}
                planningImage=""
                afterImage=""
                leadData={activeLead}
              />
          ) : (
              <div className="text-center py-20 text-slate-400">Loading profile data...</div>
          )}
       </div>
    </div>
  );
};

export default PatientPortalScreen;
