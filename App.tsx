// src/App.tsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Globe, ChevronDown, LayoutDashboard, Menu, X, ArrowRight, BookOpen } from 'lucide-react';
import LandingScreen from './components/LandingScreen';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

const ScannerScreen = lazy(() => import('./components/ScannerScreen'));
const PreScanScreen = lazy(() => import('./components/PreScanScreen'));
const LeadCaptureModal = lazy(() => import('./components/LeadCaptureModal'));
const DashboardScreen = lazy(() => import('./components/DashboardScreen'));
const PartnerPortalScreen = lazy(() => import('./components/PartnerPortalScreen'));
const PartnerJoinScreen = lazy(() => import('./components/PartnerJoinScreen'));
const PatientPortalScreen = lazy(() => import('./components/PatientPortalScreen'));
const ClinicLandingScreen = lazy(() => import('./components/ClinicLandingScreen'));
const ClinicScreen = lazy(() => import('./components/ClinicScreen'));
const ClinicDirectoryScreen = lazy(() => import('./components/ClinicDirectoryScreen'));
const PreReportIntakeScreen = lazy(() => import('./components/PreReportIntakeScreen'));
const BlogScreen = lazy(() => import('./components/BlogScreen'));

import { translations, LanguageCode } from './translations';
import { ScalpImages } from './geminiService';
import { secureGeminiService } from './lib/geminiService';
import { useLeads, LeadData, IntakeData } from './context/LeadContext';
import { AnimatePresence, motion } from 'framer-motion';
import TypeSelectionScreen from './components/TypeSelectionScreen';

type AppState =
  | 'LANDING'
  | 'SELECT_TYPE' // New State
  | 'PRE_SCAN'
  | 'SCAN'
  | 'ANALYZE'
  | 'LEAD_CAPTURE'
  | 'RESULT'
  | 'CLINIC_LANDING'
  | 'PARTNER_JOIN'
  | 'PARTNER_PORTAL'
  | 'PATIENT_PORTAL'
  | 'CLINIC_DETAILS'
  | 'DIRECTORY'
  | 'BLOG';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [lang, setLang] = useState<LanguageCode>('EN');
  const [capturedPhotos, setCapturedPhotos] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

   const [planningImage, setPlanningImage] = useState<string | null>(null); 
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);

  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [planningImage, setPlanningImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { addLead } = useLeads();
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [appState]);

  const handleStartSimulation = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
    setAppState('SELECT_TYPE'); // Go to Type Selection instead of PreScan
  };

  const handleTypeSelection = (type: string) => {
      // Currently only supporting 'hair' effectively
      if (type === 'hair') {
          setAppState('PRE_SCAN');
      }
  };

  const handleScanComplete = (photos: any[], skip: boolean = false) => {
    setCapturedPhotos(photos);
    setAppState('ANALYZE');
    runBackgroundAnalysis(photos, skip);
  };

  const handleIntakeComplete = (data: IntakeData) => {
    setIntakeData(data);
    setAppState('LEAD_CAPTURE');
  };

  const handleGateComplete = (gateData: any) => {
    finalizeLeadCreation(analysisResult, afterImage, { ...intakeData, ...gateData });
  };

  const runBackgroundAnalysis = async (photos: any[], skip: boolean) => {
    setError(null);

    if (skip) {
      setTimeout(() => {
        const mockResult = {
          diagnosis: { norwood_scale: 'NW3', analysis_summary: 'Visual estimation indicates pattern consistent with typical NW3 recession.' },
          technical_metrics: {
            graft_count_min: 2500,
            graft_count_max: 3000,
            graft_distribution: { zone_1: 1500, zone_2: 1000, zone_3: 500 },
            estimated_session_time_hours: 6,
            suggested_technique: 'Sapphire FUE',
            technique_reasoning: 'Often selected for higher density in frontal zones.',
          },
          donor_assessment: {
            density_rating: 'Good',
            estimated_hairs_per_cm2: 70,
            total_safe_capacity_grafts: 4000,
            donor_condition_summary: 'Visual analysis suggests adequate donor density.',
          },
          phenotypic_features: {
            apparent_age: 35,
            skin_tone: 'Medium',
            skin_undertone: 'Warm',
            beard_presence: 'Stubble',
            beard_texture: 'Wavy',
            eyebrow_density: 'Medium',
            eyebrow_color: 'Dark',
          },
          scalp_geometry: { hairline_design_polygon: [{ x: 0, y: 0 }], high_density_zone_polygon: [{ x: 0, y: 0 }] },
        };
        setAnalysisResult(mockResult);
        setPlanningImage('https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200');
        setAfterImage('https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200');
      }, 3000);
      return;
    }

    try {
      const getPhoto = (id: string) =>
        photos.find((p) => p.id === id)?.preview.split(',')[1] || photos[0]?.preview.split(',')[1] || '';

      const viewImages: ScalpImages = {
        front: getPhoto('front'),
        left: getPhoto('left'),
        right: getPhoto('right'),
        crown: getPhoto('top'),
        donor: getPhoto('donor'),
        macro: getPhoto('hairline_macro'),
      };

      const mainPhoto = viewImages.front;

      const result = await secureGeminiService.analyzeScalp(viewImages);
      setAnalysisResult(result);

      const timelinePromise = secureGeminiService.generateMedicalTimelineImage(mainPhoto, result!);
      const simPromise = secureGeminiService.generateSimulation(mainPhoto, result!, { left: viewImages.left, donor: viewImages.donor });

      const [timelineImg, simImg] = await Promise.all([timelinePromise, simPromise]);

      setPlanningImage(timelineImg);
      setAfterImage(simImg);
    } catch (err: any) {
      console.error('Workflow Error:', err);
      setAnalysisResult({ diagnosis: { norwood_scale: 'NW3', analysis_summary: 'Visual estimation unavailable.' } });
    }
  };

  const finalizeLeadCreation = (result: any, simImg: string | null, mergedData: any) => {
    if (result) {
      const newLead: LeadData = {
        id: `L-${Math.floor(Math.random() * 10000)}`,
        countryCode: lang === 'EN' ? 'US' : lang,
        age: result.phenotypic_features?.apparent_age || 30,
        gender: mergedData.gender || 'Male',
        norwoodScale: result.diagnosis?.norwood_scale || 'NW3',
        estimatedGrafts: `${result.technical_metrics?.graft_count_min || 2500}`,
        registrationDate: 'Just Now',
        timestamp: Date.now(),
        thumbnailUrl: simImg || capturedPhotos[0]?.preview,
        status: 'AVAILABLE' as const,
        price: 65,
        proposalPrice: 12,
        isUnlocked: false,
        isNegotiable: true,
        patientDetails: {
          fullName: mergedData.fullName || 'Guest',
          phone: mergedData.contactValue || '',
          email: mergedData.email || '',
          consent: mergedData.consentGiven || false,
          kvkk: true,
          gender: mergedData.gender,
          previousTransplant: mergedData.history,
        },
        intake: mergedData,
        analysisData: result,
      };
      addLead(newLead);
    }
    setAppState('RESULT');
  };

  const isSimulationMode = ['PRE_SCAN', 'SCAN', 'LEAD_CAPTURE', 'ANALYZE', 'RESULT'].includes(appState);

  const showFooter = ['LANDING', 'DIRECTORY', 'CLINIC_DETAILS', 'RESULT', 'CLINIC_LANDING', 'BLOG'].includes(appState);

  const isDarkHeader = ['PARTNER_PORTAL', 'CLINIC_DETAILS'].includes(appState);

  // BlogScreen has its own fixed navbar overlay, so hide main header there to avoid double headers.
  const hideMainHeader = ['CLINIC_LANDING', 'PARTNER_JOIN', 'SCAN', 'BLOG'].includes(appState);

  const transparentHeaderPages = ['PARTNER_PORTAL', 'CLINIC_DETAILS'];

  return (
    <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden flex flex-col" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-teal-500 text-white shadow-teal-500/30">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M7 4c2 4-2 12 0 16" />
                    <path d="M12 4c2 4-2 12 0 16" />
                    <path d="M17 4c2 4-2 12 0 16" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-[#0E1A2B]">
                  HAIR<span className="text-teal-500">VIS</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {!isSimulationMode ? (
                  <>
                    <MobileNavItem onClick={() => setAppState('LANDING')} label="Home" />
                    <MobileNavItem onClick={() => setAppState('DIRECTORY')} label="Centers of Excellence" />
                    <MobileNavItem onClick={() => setAppState('BLOG')} label="Knowledge Base" />
                    <MobileNavItem onClick={() => setAppState('PATIENT_PORTAL')} label="My Preview" />
                  </>
                ) : (
                  <div className="p-6 bg-slate-5 rounded-3xl border border-slate-100 mb-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Simulation in Progress</p>
                    <div className="flex flex-col gap-4">
                      <div className={`flex items-center gap-3 ${(appState === 'PRE_SCAN' || appState === 'SCAN') ? 'text-teal-600' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${(appState === 'PRE_SCAN' || appState === 'SCAN') ? 'bg-teal-500' : 'bg-slate-300'}`} />
                        <span className="font-bold uppercase tracking-widest text-xs">{t.navCapture}</span>
                      </div>
                      <div className={`flex items-center gap-3 ${(appState === 'ANALYZE' || appState === 'LEAD_CAPTURE') ? 'text-teal-600' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${(appState === 'ANALYZE' || appState === 'LEAD_CAPTURE') ? 'bg-teal-500' : 'bg-slate-300'}`} />
                        <span className="font-bold uppercase tracking-widest text-xs">{t.navAnalysis}</span>
                      </div>
                      <div className={`flex items-center gap-3 ${appState === 'RESULT' ? 'text-teal-600' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${appState === 'RESULT' ? 'bg-teal-500' : 'bg-slate-300'}`} />
                        <span className="font-bold uppercase tracking-widest text-xs">{t.navReport}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                <button
                  onClick={() => setAppState('CLINIC_LANDING')}
                  className="w-full flex items-center justify-between p-5 bg-[#0E1A2B] text-white rounded-2xl shadow-xl active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard size={20} className="text-teal-400" />
                    <span className="font-bold uppercase tracking-widest text-xs">For Clinics</span>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <p className="text-[10px] text-slate-400 font-medium text-center pt-2">© {new Date().getFullYear()} HairVis Inc.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hideMainHeader && appState !== 'PATIENT_PORTAL' && (
        <nav
          className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-6 md:py-8 flex items-center justify-between transition-all duration-700 ${
            transparentHeaderPages.includes(appState) ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setAppState('LANDING')}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all bg-teal-500 text-white shadow-teal-500/30">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path className="wave-1" d="M7 4c2 4-2 12 0 16" />
                <path className="wave-2" d="M12 4c2 4-2 12 0 16" />
                <path className="wave-3" d="M17 4c2 4-2 12 0 16" />
              </svg>
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${isDarkHeader ? 'text-white' : 'text-[#0E1A2B]'}`}>
              HAIR<span className="text-teal-500">VIS</span>
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-10">
            <div className="hidden lg:flex items-center gap-12">
              {!isSimulationMode ? (
                <>
                  <button onClick={() => setAppState('PATIENT_PORTAL')}>
                    <NavItem active={false} label="My Preview" isDark={isDarkHeader} />
                  </button>

                  <button onClick={() => setAppState('DIRECTORY')}>
                    <NavItem
                      active={appState === 'DIRECTORY'}
                      label="Centers of Excellence"
                      subLabel="Find Clinics Now"
                      isDark={isDarkHeader}
                    />
                  </button>

                  <button onClick={() => setAppState('BLOG')}>
                    <NavItem
                      active={appState === 'BLOG'}
                      label="Knowledge"
                      icon={<BookOpen size={16} className={`${isDarkHeader ? 'text-slate-300' : 'text-slate-400'}`} />}
                      subLabel="Guides & Medical"
                      isDark={isDarkHeader}
                    />
                  </button>
                </>
              ) : (
                <>
                  <NavItem active={appState === 'PRE_SCAN' || appState === 'SCAN'} label={t.navCapture} isDark={isDarkHeader} />
                  <NavItem active={appState === 'ANALYZE' || appState === 'LEAD_CAPTURE'} label={t.navAnalysis} isDark={isDarkHeader} />
                  <NavItem active={appState === 'RESULT'} label={t.navReport} isDark={isDarkHeader} />
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                    isDarkHeader ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/5 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> {lang}{' '}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLangMenu && (
                  <div className="absolute top-full mt-2 right-0 w-32 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                    {(['EN', 'TR', 'DE', 'FR', 'PL', 'AR'] as LanguageCode[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          setLang(l);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-slate-50 transition-colors ${
                          lang === l ? 'text-teal-600 bg-teal-50/50' : 'text-slate-600'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2.5 rounded-xl transition-all ${isDarkHeader ? 'text-white hover:bg-white/10' : 'text-[#0E1A2B] hover:bg-slate-100'}`}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      )}

      <Suspense fallback={<LoadingScreen />}>
        <main className="relative flex-grow">
          {appState === 'LANDING' && (
            <LandingScreen
              onStart={handleStartSimulation}
              onVisitClinic={() => setAppState('CLINIC_DETAILS')}
              onBrowseDirectory={() => setAppState('DIRECTORY')}
              lang={lang}
            />
          )}

          {appState === 'BLOG' && (
            <BlogScreen
              onBack={() => setAppState('LANDING')}
              onNavigate={(page: string) => setAppState(page as AppState)}
            />
          )}
     {/* NEW TYPE SELECTION SCREEN */}
        {appState === 'SELECT_TYPE' && (
            <TypeSelectionScreen 
                lang={lang}
                onBack={() => setAppState('LANDING')}
                onSelect={handleTypeSelection}
            />
        )}
          {appState === 'PATIENT_PORTAL' && <PatientPortalScreen lang={lang} onExit={() => setAppState('LANDING')} />}

          {appState === 'CLINIC_LANDING' && (
            <ClinicLandingScreen onLogin={() => setAppState('PARTNER_PORTAL')} onApply={() => setAppState('PARTNER_JOIN')} onBack={() => setAppState('LANDING')} />
          )}

          {appState === 'PARTNER_JOIN' && <PartnerJoinScreen onSubmit={() => setAppState('PARTNER_PORTAL')} onBack={() => setAppState('CLINIC_LANDING')} />}

          {appState === 'DIRECTORY' && <ClinicDirectoryScreen onBack={() => setAppState('LANDING')} onVisitClinic={() => setAppState('CLINIC_DETAILS')} />}

          {appState === 'CLINIC_DETAILS' && <ClinicScreen lang={lang} onBack={() => setAppState('DIRECTORY')} onBook={handleStartSimulation} />}

          {appState === 'PARTNER_PORTAL' && <PartnerPortalScreen lang={lang} onBack={() => setAppState('LANDING')} />}

          {appState === 'PRE_SCAN' && <PreScanScreen onStart={() => setAppState('SCAN')} onBack={() => setAppState('LANDING')} lang={lang} />}

          {appState === 'SCAN' && (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F7F8FA] pt-24 md:pt-32">
              <div className="relative w-full flex-1 lg:max-h-[85vh] lg:max-w-[440px] lg:rounded-[3.5rem] lg:border-[12px] lg:border-slate-800 overflow-hidden bg-black shadow-2xl">
                <ScannerScreen onComplete={handleScanComplete} onExit={() => setAppState('LANDING')} lang={lang} />
              </div>
            </div>
          )}

          {appState === 'ANALYZE' && (
            <div className="w-full h-screen flex items-center justify-center bg-[#F7F8FA] px-6">
              <PreReportIntakeScreen lang={lang} onComplete={handleIntakeComplete} />
            </div>
          )}

          {appState === 'LEAD_CAPTURE' && (
            <div className="w-full min-h-screen relative flex items-center justify-center animate-in fade-in duration-700 bg-[#F7F8FA]">
              <div className="relative z-20 px-6 w-full max-w-xl">
                <LeadCaptureModal onComplete={handleGateComplete} lang={lang} />
              </div>
            </div>
          )}

          {appState === 'RESULT' && (
            <div className="w-full max-w-7xl mx-auto py-32 px-6">
              <DashboardScreen
                lang={lang}
                analysis={analysisResult || {}}
                capturedPhotos={capturedPhotos}
                planningImage={planningImage || ''}
                afterImage={afterImage || ''}
                error={error}
                leadData={useLeads().leads[0]}
              />
            </div>
          )}
        </main>
      </Suspense>

      {showFooter && <Footer lang={lang} onNavigate={(page) => setAppState(page as AppState)} />}
    </div>
  );
};

const NavItem = ({ active, label, icon, isDark, subLabel }: any) => (
  <div className="flex items-center gap-3 group cursor-pointer text-left relative h-full">
    {icon}
    <div
      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 shrink-0 ${
        active ? 'bg-teal-500 animate-pulse scale-150' : isDark ? 'bg-slate-500 group-hover:bg-slate-300' : 'bg-slate-300 group-hover:bg-slate-400'
      }`}
    />
    <div className="flex flex-col justify-center relative">
      <span
        className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 leading-none ${
          active ? (isDark ? 'text-white' : 'text-[#0E1A2B]') : isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-[#0E1A2B]'
        }`}
      >
        {label}
      </span>
      {subLabel && (
        <span className="absolute top-full left-0 pt-1.5 text-[10px] text-teal-500 font-bold tracking-wider whitespace-nowrap opacity-100 transition-opacity">
          {subLabel}
        </span>
      )}
    </div>
  </div>
);

const MobileNavItem = ({ onClick, label }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between group p-4 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-100"
  >
    <span className="text-lg font-bold text-[#0E1A2B] tracking-tight text-left group-hover:text-teal-600 transition-colors">{label}</span>
    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-sm">
      <ArrowRight size={18} />
    </div>
  </button>
);

export default App;
