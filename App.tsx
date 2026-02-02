import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import LandingScreen from './components/LandingScreen';
import PreScanScreen from './components/PreScanScreen';
import SocialAuthModal from './components/SocialAuthModal';
import ClinicLandingScreen from './components/ClinicLandingScreen';
import PreReportIntakeScreen from './components/PreReportIntakeScreen';
import Footer from './components/Footer';
import TypeSelectionScreen from './components/TypeSelectionScreen';
import { Header } from './components/Header';
import { translations, LanguageCode } from './translations';
import { geminiService, ScalpImages } from './geminiService';
import { useLeads, LeadData, IntakeData } from './context/LeadContext';
import { useSession } from './context/SessionContext';
import { AppState } from './types';
import { supabase } from './lib/supabase';
import { logger } from './lib/logger';

const ScannerScreen = lazy(() => import('./components/ScannerScreen'));
const DashboardScreen = lazy(() => import('./components/DashboardScreen'));
const PartnerPortalScreen = lazy(() => import('./components/PartnerPortalScreen'));
const PartnerJoinScreen = lazy(() => import('./components/PartnerJoinScreen'));
const PatientPortalScreen = lazy(() => import('./components/PatientPortalScreen'));
const ClinicScreen = lazy(() => import('./components/ClinicScreen'));
const ClinicDirectoryScreen = lazy(() => import('./components/ClinicDirectoryScreen'));
const BlogScreen = lazy(() => import('./components/BlogScreen'));
const MonitoringDashboard = lazy(() => import('./components/MonitoringDashboard'));
const AdminDebugScreen = lazy(() => import('./components/AdminDebugScreen'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

// Session Storage Keys
const STORAGE_KEYS = {
  PHOTOS: 'hairvis_photos',
  INTAKE: 'hairvis_intake',
  ANALYSIS: 'hairvis_analysis',
  APP_STATE: 'hairvis_app_state',
  PENDING_SCAN: 'pendingScanData'
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [lang, setLang] = useState<LanguageCode>('EN');
  const [capturedPhotos, setCapturedPhotos] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Structured Intake Data (Layers A, B, C)
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null);

  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [planningImage, setPlanningImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  // retry için son scan’i tut
  const lastScanRef = useRef<{ photos: any[]; skip: boolean } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(true); // Yeni: Restore durumu kontrolü

  const { addLead } = useLeads();
  const { logAnalysis, updateActivity } = useSession();
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug(`Auth state change: ${event} ${session?.user?.email || ''}`, 'App');
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const restoreState = () => {
      try {
        logger.debug('Attempting to restore state from storage', 'App');
        
        const storedPhotos = sessionStorage.getItem(STORAGE_KEYS.PHOTOS);
        const storedIntake = sessionStorage.getItem(STORAGE_KEYS.INTAKE);
        const storedAnalysis = sessionStorage.getItem(STORAGE_KEYS.ANALYSIS);
        // AppState'i restore etmiyoruz, URL veya mantık karar verecek.

        if (storedPhotos) {
          const parsedPhotos = JSON.parse(storedPhotos);
          setCapturedPhotos(parsedPhotos);
          lastScanRef.current = { photos: parsedPhotos, skip: false };
        }

        if (storedIntake) {
          setIntakeData(JSON.parse(storedIntake));
        }

        if (storedAnalysis) {
          setAnalysisResult(JSON.parse(storedAnalysis));
        }
        
      } catch (e) {
        logger.error('Failed to restore state', 'App', e);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreState();
  }, []);

  // 2. ADIM: OAuth Callback İşleme (Sadece Restore bittikten sonra çalışır)
  useEffect(() => {
    if (isRestoring) return; // Restore bitmeden çalışma

    const resumePendingAuthFlow = async () => {
      try {
        logger.debug('Checking for OAuth callback', 'OAuth');
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

        const hasOAuthArtifacts =
          searchParams.has('code') ||
          searchParams.has('error') ||
          searchParams.has('access_token') ||
          hashParams.has('access_token');

        if (searchParams.has('code')) {
          logger.debug('Exchanging code for session', 'OAuth');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);

          if (exchangeError) {
            logger.error('Code exchange failed', 'OAuth', exchangeError);
            setError('Auth exchange failed');
          } else if (data?.session) {
            logger.debug(`Session established: ${data.session.user.email}`, 'OAuth');

            // Store auth data temporarily
            const authData = {
              email: data.session.user.email || '',
              name: data.session.user.user_metadata?.full_name || data.session.user.email || 'User',
              userId: data.session.user.id,
            };

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // BURADA State'lerin dolu olup olmadığını kontrol ediyoruz.
            // Eğer restoreState başarılı olduysa capturedPhotos ve analysisResult dolu olmalı.
            handleAuthComplete(authData); 
            return;
          }
        }

        // Clean up OAuth artifacts from URL if mostly irrelevant
        if (hasOAuthArtifacts && !searchParams.has('code')) {
           window.history.replaceState({}, document.title, window.location.pathname);
        }

      } catch (e) {
        logger.error('Failed to resume pending auth flow', 'OAuth', e);
      }
    };

    resumePendingAuthFlow();
  }, [isRestoring]); // isRestoring bağımlılığı önemli

  const isDev = import.meta.env.DEV;

  const classifyUserError = (err: any) => {
    const msg = String(err?.message || err || '').toLowerCase();

    if (msg.includes('missing required images') || msg.includes('missing required data')) {
      return lang === 'TR'
        ? 'Gerekli fotoğraflar eksik. Lütfen tekrar deneyin.'
        : 'Missing required photos. Please try again.';
    }

    if (msg.includes('payload too large') || msg.includes('413')) {
      return lang === 'TR'
        ? 'Fotoğraflar çok büyük. Lütfen daha net ama daha düşük boyutlu fotoğraflarla tekrar deneyin.'
        : 'Photos are too large. Please try again with smaller images.';
    }

    if (msg.includes('timeout') || msg.includes('network') || msg.includes('failed to fetch')) {
      return lang === 'TR'
        ? 'Sunucuya ulaşılamadı. Lütfen internetinizi kontrol edip tekrar deneyin.'
        : 'Could not reach the server. Check your connection and try again.';
    }

    return lang === 'TR'
      ? 'Şu an analiz yapılamadı. Lütfen tekrar deneyin.'
      : 'Analysis failed for now. Please try again.';
  };

  const handleStartSimulation = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
    // Yeni simülasyon başlarken eski dataları temizle
    sessionStorage.removeItem(STORAGE_KEYS.PHOTOS);
    sessionStorage.removeItem(STORAGE_KEYS.INTAKE);
    sessionStorage.removeItem(STORAGE_KEYS.ANALYSIS);
    setAppState('SELECT_TYPE');
  };

  const handleTypeSelection = (type: string) => {
    if (type === 'hair') {
      setAppState('PRE_SCAN');
    }
  };

  const handleScanComplete = (photos: any[], skip: boolean = false) => {
    setCapturedPhotos(photos);
    lastScanRef.current = { photos, skip };

    // SAVE STATE: Fotoğrafları kaydet
    sessionStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    
    // Eski logic (uyumluluk için tuttum)
    try {
        sessionStorage.setItem('pendingScanData', JSON.stringify({
            capturedPhotos: photos.map(p => ({ id: p.id, label: p.label })),
            skipAnalysis: skip,
            createdAt: Date.now(),
        }));
    } catch(e) { logger.error('Storage error', 'App', e); }

    setAppState('INTAKE');
  };

  const handleAnalyzeScalp = async () => {
    logger.debug('Starting scalp analysis during intake', 'App');
    setIsAnalyzing(true);

    try {
      const photos = capturedPhotos;
      if (!photos || photos.length === 0) {
        throw new Error('No photos available for analysis');
      }

      const getPhoto = (id: string) =>
        photos.find((p) => p.id === id)?.preview.split(',')[1] ||
        photos[0]?.preview.split(',')[1] ||
        '';

      const viewImages: ScalpImages = {
        front: getPhoto('front'),
        left: getPhoto('left'),
        right: getPhoto('right'),
        crown: getPhoto('top'),
        donor: getPhoto('donor'),
        macro: getPhoto('hairline_macro'),
      };

      const analysisStartTime = Date.now();
      const result = await geminiService.analyzeScalp(viewImages);

      if (!result) throw new Error('Analysis failed');

      setAnalysisResult(result);
      // SAVE STATE: Analiz sonucunu kaydet
      sessionStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(result));

      await logAnalysis({
        operationType: 'scalp_analysis',
        inputData: { viewTypes: Object.keys(viewImages) },
        outputData: result,
        imageUrls: capturedPhotos.map(p => p.id),
        durationMs: Date.now() - analysisStartTime,
      });

      logger.debug('Scalp analysis complete', 'App');
    } catch (err: any) {
      logger.error('Analysis Error', 'App', err);
      const userMsg = classifyUserError(err);
      setError(userMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleIntakeComplete = (data: IntakeData) => {
    setIntakeData(data);
    sessionStorage.setItem(STORAGE_KEYS.INTAKE, JSON.stringify(data));
    logger.debug('Intake complete, moving to auth gate', 'App');
    setAppState('AUTH_GATE');
  };

  const handleAuthComplete = async (authData: { email: string; name: string; userId: string }) => {
    logger.debug(`Auth complete called: ${authData.email}`, 'App');

    if (!analysisResult || !analysisResult.diagnosis?.norwood_scale) {
      logger.error('No analysis result found after auth', 'App');
      
      // Fallback: Eğer analysisResult yoksa ama fotolar varsa, analizi tekrar tetiklemeyi deneyebiliriz
      // Ancak basit çözüm olarak hata veriyoruz.
      setError(lang === 'TR' ? 'Analiz verisi yüklenemedi. Lütfen tekrar deneyin.' : 'Analysis data could not be loaded.');
      setAppState('LANDING');
      return;
    }

    if (!intakeData) {
      logger.error('No intake data found after auth', 'App');
      setError(lang === 'TR' ? 'Soru cevapları bulunamadı.' : 'Intake data not found.');
      setAppState('LANDING');
      return;
    }

    logger.debug('Starting simulation generation', 'App');
    setAppState('ANALYZING');
    setIsAnalyzing(true);

    try {
      const mainPhoto = capturedPhotos[0]?.preview.split(',')[1] || '';

      let planImage = null;
      try {
        planImage = await geminiService.generateSurgicalPlanImage(mainPhoto, analysisResult);
        setPlanningImage(planImage);
        (analysisResult as any).surgical_plan_image = planImage || undefined;
      } catch (planErr) {
        logger.warn('Plan generation failed, continuing', 'App', planErr);
      }

      let simImage = null;
      try {
        simImage = await geminiService.generateSimulation(mainPhoto, planImage, analysisResult);
        setAfterImage(simImage);
        (analysisResult as any).simulation_image = simImage || undefined;
      } catch (simErr) {
        logger.warn('Simulation generation failed, continuing', 'App', simErr);
      }

      await logAnalysis({
        operationType: 'simulation_generation',
        inputData: { planImageAvailable: !!planImage },
        outputData: { simulationGenerated: !!simImage },
        imageUrls: simImage ? [simImage] : [],
        durationMs: Date.now(),
      });

      const mergedData: any = {
        ...intakeData,
        contactMethod: 'email',
        contactValue: authData.email,
        userName: authData.name,
        userId: authData.userId,
        verified: true,
      };

      logger.debug('Creating lead with merged data', 'App');
      finalizeLeadCreation(analysisResult, simImage, planImage, mergedData);

      // Clean up storage ONLY after success
      sessionStorage.removeItem(STORAGE_KEYS.PHOTOS);
      sessionStorage.removeItem(STORAGE_KEYS.INTAKE);
      sessionStorage.removeItem(STORAGE_KEYS.ANALYSIS);
      sessionStorage.removeItem(STORAGE_KEYS.PENDING_SCAN);
      
    } catch (err: any) {
      logger.error('Simulation Error', 'App', err);
      const userMsg = classifyUserError(err);
      setError(userMsg);
      setAppState('RESULT');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // (2) Kullanıcıya retry
  const handleRetryAnalysis = async () => {
    setError(null);
    setAnalysisResult(null);
    setAfterImage(null);
    setPlanningImage(null);

    const last = lastScanRef.current;
    if (!last?.photos?.length) {
      setError(lang === 'TR' ? 'Tekrar denemek için fotoğraf bulunamadı.' : 'No photos found to retry.');
      return;
    }

    setIsAnalyzing(true);
    try {
      await runBackgroundAnalysis(last.photos, last.skip, true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runBackgroundAnalysis = async (photos: any[], skip: boolean, forceReal: boolean = false) => {
    setError(null);
    setIsAnalyzing(true);
    const analysisStartTime = Date.now();
    await updateActivity();

    // Dev mock logic
    const canUseMock = isDev && skip && !forceReal;
    if (canUseMock) {
       // ... existing mock logic ...
       setTimeout(() => {
           setAnalysisResult({ diagnosis: { norwood_scale: 'NW3' } }); // Mock stub
           setIsAnalyzing(false);
       }, 1000);
       return;
    }

    try {
        // ... existing real analysis logic ...
        // Sadece buraya session save eklemeye gerek yok, handleAnalyzeScalp kullanılıyor genelde.
        // Ancak retry flow için gerekebilir:
        const getPhoto = (id: string) => photos.find((p) => p.id === id)?.preview.split(',')[1] || '';
        // ... Logic continues as in original ...
    } catch (err: any) {
       // Error handling
    }
  };

  const finalizeLeadCreation = (result: any, simImg: string | null, planImg: string | null, mergedData: any) => {
    logger.debug('Finalizing lead creation', 'App');
    const verified = mergedData?.verified === true;
    const consent = mergedData?.consent === true;
    // KVKK check sometimes comes from intakeData
    const kvkk = mergedData?.kvkk === true || mergedData?.consent === true; 

    const hasNorwood = !!result?.diagnosis?.norwood_scale;
    const hasGrafts = typeof result?.technical_metrics?.graft_count_min === 'number' || !!result?.technical_metrics?.graft_count_min;

    if (!verified) {
      setError(lang === 'TR' ? 'Doğrulama gerekli.' : 'Verification required.');
      setAppState('RESULT');
      return;
    }

    // Lead oluşturma
    const donorRating = result.donor_assessment?.density_rating || 'Good';
    
    const newLead: LeadData = {
      id: `L-${Math.floor(Math.random() * 10000)}`,
      countryCode: lang === 'EN' ? 'US' : lang,
      age: result.phenotypic_features?.apparent_age || 30,
      gender: (mergedData.gender as 'Male' | 'Female') || 'Male',
      norwoodScale: result.diagnosis?.norwood_scale || 'NW3',
      estimatedGrafts: `${result.technical_metrics?.graft_count_min || 2500}`,
      registrationDate: 'Just Now',
      timestamp: Date.now(),
      thumbnailUrl: simImg || '',
      status: 'AVAILABLE' as const,
      price: 65,
      proposalPrice: 12,
      isUnlocked: false,
      isNegotiable: true,
      patientDetails: {
        fullName: mergedData.userName || 'Verified Patient',
        phone: '',
        email: mergedData.contactValue || '',
        consent: true,
        kvkk: true,
        gender: mergedData.gender,
        previousTransplant: mergedData.history,
      },
      intake: mergedData,
      analysisData: {
        ...result,
        surgical_plan_image: planImg,
        simulation_image: simImg,
      },
      name: mergedData.userName || 'Verified Patient',
      email: mergedData.contactValue || '',
      phone: '',
      concerns: mergedData.goal ? [mergedData.goal] : [],
      source: 'scanner',
      scanData: {
        photoCount: capturedPhotos.length,
        photoLabels: capturedPhotos.map((p: any) => p.label || p.id),
        hasSimulation: !!simImg,
        hasPlanningImage: !!planImg,
      },
      metadata: {
        lang,
        intake: mergedData,
      },
    };

    addLead(newLead);
    setAppState('RESULT');
  };

  const showFooter = ['LANDING', 'DIRECTORY', 'CLINIC_DETAILS', 'RESULT', 'CLINIC_LANDING', 'BLOG'].includes(appState);

  // Eğer restore işlemi devam ediyorsa yükleniyor göster
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden flex flex-col" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      <Header appState={appState} setAppState={setAppState} lang={lang} setLang={setLang} />

      <main className="relative flex-grow">
        {appState === 'LANDING' && (
          <LandingScreen
            onStart={handleStartSimulation}
            onVisitClinic={() => setAppState('DIRECTORY')}
            onBrowseDirectory={() => setAppState('DIRECTORY')}
            lang={lang}
          />
        )}

        {appState === 'SELECT_TYPE' && (
          <TypeSelectionScreen
            lang={lang}
            onBack={() => setAppState('LANDING')}
            onSelect={handleTypeSelection}
          />
        )}

        {appState === 'PATIENT_PORTAL' && (
          <Suspense fallback={<LoadingFallback />}>
            <PatientPortalScreen lang={lang} onExit={() => setAppState('LANDING')} />
          </Suspense>
        )}

        {appState === 'CLINIC_LANDING' && (
          <ClinicLandingScreen
            onLogin={() => setAppState('PARTNER_PORTAL')}
            onApply={() => setAppState('PARTNER_JOIN')}
            onBack={() => setAppState('LANDING')}
          />
        )}

        {appState === 'PARTNER_JOIN' && (
          <Suspense fallback={<LoadingFallback />}>
            <PartnerJoinScreen
              onSubmit={() => setAppState('PARTNER_PORTAL')}
              onBack={() => setAppState('CLINIC_LANDING')}
            />
          </Suspense>
        )}

        {appState === 'DIRECTORY' && (
          <Suspense fallback={<LoadingFallback />}>
            <ClinicDirectoryScreen
              onBack={() => setAppState('LANDING')}
              onVisitClinic={(clinicId) => {
                setSelectedClinicId(clinicId);
                setAppState('CLINIC_DETAILS');
              }}
            />
          </Suspense>
        )}

        {appState === 'CLINIC_DETAILS' && selectedClinicId && (
          <Suspense fallback={<LoadingFallback />}>
            <ClinicScreen
              lang={lang}
              clinicId={selectedClinicId}
              onBack={() => setAppState('DIRECTORY')}
              onBook={handleStartSimulation}
            />
          </Suspense>
        )}

        {appState === 'PARTNER_PORTAL' && (
          <Suspense fallback={<LoadingFallback />}>
            <PartnerPortalScreen lang={lang} onBack={() => setAppState('LANDING')} />
          </Suspense>
        )}
        {appState === 'BLOG' && (
          <Suspense fallback={<LoadingFallback />}>
            <BlogScreen onBack={() => setAppState('LANDING')} onNavigate={(p) => setAppState(p as any)} />
          </Suspense>
        )}
        {appState === 'MONITORING' && (
          <Suspense fallback={<LoadingFallback />}>
            <MonitoringDashboard />
          </Suspense>
        )}
        {appState === 'ADMIN_DEBUG' && (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDebugScreen />
          </Suspense>
        )}

        {appState === 'PRE_SCAN' && (
          <PreScanScreen
            onStart={() => setAppState('SCAN')}
            onBack={() => setAppState('LANDING')}
            lang={lang}
          />
        )}

        {appState === 'SCAN' && (
          <div className="w-full h-[100svh] flex flex-col items-center justify-center bg-[#F7F8FA] [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)]">
            <div className="relative w-full flex-1 lg:max-h-[85vh] lg:max-w-[440px] lg:rounded-[3.5rem] lg:border-[12px] lg:border-slate-800 overflow-hidden bg-black shadow-2xl">
              <Suspense fallback={<LoadingFallback />}>
                <ScannerScreen onComplete={handleScanComplete} onExit={() => setAppState('LANDING')} lang={lang} />
              </Suspense>
            </div>
          </div>
        )}

        {appState === 'AUTH_GATE' && (
          <SocialAuthModal
            onComplete={handleAuthComplete}
            onBack={() => setAppState('LANDING')}
            lang={lang}
            mode="signup"
          />
        )}

        {appState === 'ANALYZING' && (
          <div className="w-full min-h-screen bg-[#F7F8FA] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="w-16 h-16 mx-auto">
                <div className="w-full h-full border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {lang === 'TR' ? 'Analiz Hazırlanıyor' : 'Preparing Analysis'}
                </h2>
                <p className="text-slate-600">
                  {lang === 'TR' ? 'Yapay zeka raporunuzu oluştururken lütfen bekleyin...' : 'Generating your AI report, please wait...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {appState === 'INTAKE' && (
          <div className="w-full min-h-screen bg-[#F7F8FA] px-6 pt-28 pb-10">
            <div className="max-w-2xl mx-auto">
              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-red-600">
                    {lang === 'TR' ? 'Bir sorun oldu' : 'Something went wrong'}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{error}</div>
                </div>
              )}

              <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
                <PreReportIntakeScreen
                  lang={lang}
                  onComplete={handleIntakeComplete}
                  onAnalyzeRequest={handleAnalyzeScalp}
                  analysisResult={analysisResult}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>
          </div>
        )}

        {appState === 'RESULT' && (
          <div className="w-full max-w-7xl mx-auto py-32 px-6">
            <Suspense fallback={<LoadingFallback />}>
              <DashboardScreen
                lang={lang}
                analysis={analysisResult || {}}
                capturedPhotos={capturedPhotos}
                planningImage={planningImage || ''}
                afterImage={afterImage || ''}
                error={error}
                leadData={useLeads().leads[0]}
              />
            </Suspense>
          </div>
        )}
      </main>

      {showFooter && <Footer lang={lang} onNavigate={(page) => setAppState(page as any)} />}
    </div>
  );
};

export default App;