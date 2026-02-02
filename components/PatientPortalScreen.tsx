import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useLeads, LeadData } from '../context/LeadContext';
import DashboardScreen from './DashboardScreen';
import { LanguageCode } from '../translations';
import SocialAuthModal from './SocialAuthModal';
import { supabase } from '../lib/supabase';

interface PatientPortalProps {
  lang: LanguageCode;
  onExit: () => void;
}

const PatientPortalScreen: React.FC<PatientPortalProps> = ({ lang, onExit }) => {
  const { leads } = useLeads();
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<LeadData | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleAuthComplete({
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email || 'User',
          userId: session.user.id,
        });
      }
    };
    checkSession();
  }, []);

  const handleAuthComplete = async (authData: { email: string; name: string; userId: string }) => {
    setIsLoading(true);

    // Find lead by userId or email
    const userLead = leads.find(
      lead => lead.patientDetails?.email === authData.email || lead.email === authData.email
    );

    if (userLead) {
      setActiveLead(userLead);
      setView('dashboard');
    } else {
      setError(
        lang === 'TR'
          ? 'Henüz bir simülasyonunuz bulunmuyor. Lütfen önce saç analizi yapın.'
          : 'No simulation found. Please complete a hair analysis first.'
      );
    }

    setIsLoading(false);
  };

  if (view === 'login') {
    return (
      <>
        <SocialAuthModal
          onComplete={handleAuthComplete}
          onBack={onExit}
          lang={lang}
          mode="signin"
        />
        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
              <p className="text-red-700 text-sm font-medium text-center">{error}</p>
            </div>
          </div>
        )}
      </>
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
                // Fallback analysis structure if not present (should be present for valid leads)
                analysis={activeLead.analysisData || {
                    diagnosis: { norwood_scale: activeLead.norwoodScale },
                    technical_metrics: { graft_count_min: activeLead.estimatedGrafts, graft_count_max: activeLead.estimatedGrafts }
                }}
                capturedPhotos={[]} // Pass empty, Dashboard uses leadData thumbnail fallback
                planningImage="" // Will likely be empty unless saved in context, but Dashboard handles this safely
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
