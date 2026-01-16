import React, { useState, useEffect, useRef } from 'react';
import LandingScreen from './components/LandingScreen';
import ScannerScreen from './components/ScannerScreen';
import PreScanScreen from './components/PreScanScreen';
import SocialAuthModal from './components/SocialAuthModal';
import DashboardScreen from './components/DashboardScreen';
import PartnerPortalScreen from './components/PartnerPortalScreen';
import PartnerJoinScreen from './components/PartnerJoinScreen';
import PatientPortalScreen from './components/PatientPortalScreen';
import ClinicLandingScreen from './components/ClinicLandingScreen';
import ClinicScreen from './components/ClinicScreen';
import ClinicDirectoryScreen from './components/ClinicDirectoryScreen';
import PreReportIntakeScreen from './components/PreReportIntakeScreen';
import BlogScreen from './components/BlogScreen';
import MonitoringDashboard from './components/MonitoringDashboard';
import AdminDebugScreen from './components/AdminDebugScreen';
import Footer from './components/Footer';
import TypeSelectionScreen from './components/TypeSelectionScreen';
import { Header } from './components/Header';
import { translations, LanguageCode } from './translations';
import { geminiService, ScalpImages } from './geminiService';
import { useLeads, LeadData, IntakeData } from './context/LeadContext';
import { useSession } from './context/SessionContext';
import { AppState } from './types';
import { supabase } from './lib/supabase';
import { secureStorage } from './lib/secureStorage';

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

  const { addLead } = useLeads();
  const { logAnalysis, updateActivity } = useSession();
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  // Global Supabase auth listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[App] Global auth state change:', event, session?.user?.email);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const resumePendingAuthFlow = async () => {
      try {
        // ÖNEMLİ: URL'i en başta yakalayalım
        console.log('[OAuth] Initial URL:', window.location.href);
        console.log('[OAuth] Search params:', window.location.search);
        console.log('[OAuth] Hash:', window.location.hash);
        console.log('[OAuth] localStorage keys:', Object.keys(localStorage));
        console.log('[OAuth] pendingAuthState in localStorage:', localStorage.getItem('pendingAuthState'));

        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

        // URL'den OAuth kalıntılarını temizle (önce)
        const hasOAuthArtifacts =
          searchParams.has('code') ||
          searchParams.has('error') ||
          searchParams.has('error_description') ||
          searchParams.has('access_token') ||
          hashParams.has('access_token') ||
          hashParams.has('error');

        // Eğer bu bir PKCE dönüşüyse, code'u session'a çevir ve bekle
        if (searchParams.has('code')) {
          console.log('[OAuth] Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) {
            console.error('[OAuth] Code exchange failed:', exchangeError);
          } else if (data?.session) {
            console.log('[OAuth] Session established:', data.session.user.email);
          }
        }

        // Supabase bazı akışlarda URL fragment'i erken temizleyebiliyor.
        // Bu yüzden asıl sinyalimiz: pendingAuthState var mı?
        const savedState = await secureStorage.getItem<any>('pendingAuthState');
        console.log('[OAuth] Pending state found:', !!savedState);

        // Analiz/intake context'i restore et ve Auth Gate'e dön.
        if (savedState) {
          const createdAt = typeof savedState.createdAt === 'number' ? savedState.createdAt : null;
          const isFresh = createdAt ? Date.now() - createdAt < 30 * 60 * 1000 : true; // 30 dk

          if (isFresh) {
            console.log('[OAuth] Restoring saved state and going to AUTH_GATE');
            setAnalysisResult(savedState.analysisResult);
            setAfterImage(savedState.afterImage);
            setPlanningImage(savedState.planningImage);
            setCapturedPhotos(savedState.capturedPhotos);
            setIntakeData(savedState.intakeData);
            setAppState('AUTH_GATE');
          } else {
            console.log('[OAuth] State expired, not restoring');
          }

          // Döngüye girmemesi için her durumda temizle
          secureStorage.removeItem('pendingAuthState');
        } else if (hasOAuthArtifacts) {
          // OAuth dönüşü var ama pending state yok - bu kullanıcı rapor akışı dışında giriş yapmış
          console.log('[OAuth] OAuth callback detected but no pending state - user logged in outside of report flow');
          // Session kurulmuş olabilir, kontrol et
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('[OAuth] User logged in:', session.user.email, '- staying on current page');
            // Kullanıcı giriş yaptı ama rapor akışında değil - LANDING'de kalsın
          }
        }

        if (hasOAuthArtifacts) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error('[OAuth] Failed to resume pending auth flow:', e);
      }
    };

    resumePendingAuthFlow();
  }, []);

  const isDev = import.meta.env.DEV;

  const classifyUserError = (err: any) => {
    const msg = String(err?.message || err || '').toLowerCase();

    // Tipik senaryolar
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

    // default
    return lang === 'TR'
      ? 'Şu an analiz yapılamadı. Lütfen tekrar deneyin.'
      : 'Analysis failed for now. Please try again.';
  };

  const handleStartSimulation = async () => {
    // Eski aistudio key selector varsa kalsın (dev için)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
    setAppState('SELECT_TYPE');
  };

  const handleTypeSelection = (type: string) => {
    if (type === 'hair') {
      setAppState('PRE_SCAN');
    }
  };

  const handleScanComplete = (photos: any[], skip: boolean = false) => {
    setCapturedPhotos(photos);
    setAppState('ANALYZE');

    // retry için sakla
    lastScanRef.current = { photos, skip };

    // Trigger background analysis immediately
    runBackgroundAnalysis(photos, skip);
  };

  // Intake Complete -> Go to Auth Gate (OTP)
  const handleIntakeComplete = (data: IntakeData) => {
    setIntakeData(data);

    secureStorage.setItem('pendingAuthState', {
      analysisResult,
      afterImage,
      planningImage,
      capturedPhotos,
      intakeData: data,
      createdAt: Date.now(),
    });

    setAppState('AUTH_GATE');
  };

  // Auth Complete -> Go to Result (Finalize Lead)
  const handleAuthComplete = (authData: { email: string; name: string; userId: string }) => {
    console.log('[App] Auth complete called:', authData.email);
    console.log('[App] Current analysis result:', !!analysisResult);
    console.log('[App] Current intake data:', !!intakeData);

    // Combine Intake Data + Auth Data (OAuth)
    const mergedData: any = {
      ...intakeData,
      contactMethod: 'email',
      contactValue: authData.email,
      userName: authData.name,
      userId: authData.userId,
      verified: true,
    };

    finalizeLeadCreation(analysisResult, afterImage, planningImage, mergedData);
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

  // Background Analysis Logic (2-Stage Pipeline)
  // forceReal = true -> skip gelse bile gerçek analiz çalışır
  const runBackgroundAnalysis = async (photos: any[], skip: boolean, forceReal: boolean = false) => {
    setError(null);
    setIsAnalyzing(true);

    const analysisStartTime = Date.now();
    await updateActivity();

    // (1) Skip/mock SADECE DEV'de ve forceReal değilse
    const canUseMock = isDev && skip && !forceReal;

    if (canUseMock) {
      setTimeout(() => {
        const mockResult = {
          diagnosis: {
            norwood_scale: 'NW3',
            analysis_summary: 'Visual estimation indicates pattern consistent with typical NW3 recession.',
          },
          detailed_analysis: {
            current_condition_summary: 'Frontal recession visible.',
            hair_quality_assessment: 'Medium caliber.',
            projected_results_summary: 'High density expected.',
          },
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
          scalp_geometry: {
            hairline_design_polygon: [{ x: 0, y: 0 }],
            high_density_zone_polygon: [{ x: 0, y: 0 }],
          },
        };

        setAnalysisResult(mockResult);
        setPlanningImage('https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200');
        setAfterImage('https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200');
        setIsAnalyzing(false);
      }, 1500);

      return;
    }

    try {
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

      const mainPhoto = viewImages.front;

      // STEP 1: Geometric Analysis (Metrics & Text)
      const result = await geminiService.analyzeScalp(viewImages);
      setAnalysisResult(result);

      if (!result) throw new Error('Analysis failed');

      await logAnalysis({
        operationType: 'scalp_analysis',
        inputData: { viewTypes: Object.keys(viewImages) },
        outputData: result,
        imageUrls: capturedPhotos.map(p => p.id),
        durationMs: Date.now() - analysisStartTime,
      });

      // STEP 2: Surgical Plan Generation (Doctor Drawing)
      // (geminiService içinde şimdilik stub var; akış bozulmasın)
      const planImage = await geminiService.generateSurgicalPlanImage(mainPhoto, result);
      setPlanningImage(planImage);

      // Store plan image in result for later reference
      (result as any).surgical_plan_image = planImage || undefined;

      // STEP 3: Targeted Simulation
      const simImage = await geminiService.generateSimulation(mainPhoto, planImage, result);
      setAfterImage(simImage);

      (result as any).simulation_image = simImage || undefined;

      await logAnalysis({
        operationType: 'simulation_generation',
        inputData: { planImageAvailable: !!planImage },
        outputData: { simulationGenerated: !!simImage },
        imageUrls: simImage ? [simImage] : [],
        durationMs: Date.now() - analysisStartTime,
      });

      setIsAnalyzing(false);
    } catch (err: any) {
      console.error('Workflow Error:', err);

      // (2) Kullanıcıya anlaşılır hata
      const userMsg = classifyUserError(err);
      setError(userMsg);

      await logAnalysis({
        operationType: 'scalp_analysis',
        inputData: { viewTypes: Object.keys(viewImages || {}) },
        error: err.message || String(err),
        durationMs: Date.now() - analysisStartTime,
      });

      // Fallback - ama lead yaratma guard'ları bunu engelleyecek
      setAnalysisResult({
        diagnosis: {
          norwood_scale: 'NW?',
          analysis_summary: lang === 'TR' ? 'Analiz şu an üretilemedi.' : 'Analysis currently unavailable.',
        },
      });

      setIsAnalyzing(false);
    }
  };

  const finalizeLeadCreation = (result: any, simImg: string | null, planImg: string | null, mergedData: any) => {
    console.log('[App] Finalizing lead creation...');

    // (3) LEAD GUARD'LARI — zorunlu kriterler
    const verified = mergedData?.verified === true;
    const consent = mergedData?.consent === true;
    const kvkk = mergedData?.kvkk === true;

    const hasNorwood = !!result?.diagnosis?.norwood_scale && String(result?.diagnosis?.norwood_scale).trim().length > 0;
    const hasGrafts = typeof result?.technical_metrics?.graft_count_min === 'number' || !!result?.technical_metrics?.graft_count_min;

    console.log('[App] Lead guards:', { verified, consent, kvkk, hasNorwood, hasGrafts });

    if (!verified) {
      console.log('[App] Failed: Not verified');
      setError(lang === 'TR' ? 'Doğrulama tamamlanmadan kayıt oluşturulamaz.' : 'Verification is required to create a lead.');
      setAppState('RESULT'); // yine sonuç ekranına gider ama lead yazmaz
      return;
    }

    if (!consent || !kvkk) {
      console.log('[App] Failed: No consent or KVKK');
      setError(lang === 'TR' ? 'KVKK ve açık rıza onayı olmadan kayıt oluşturulamaz.' : 'Consent and KVKK approval are required.');
      setAppState('RESULT');
      return;
    }

    if (!hasNorwood || !hasGrafts) {
      console.log('[App] Failed: Missing analysis data');
      setError(
        lang === 'TR'
          ? 'Analiz verisi eksik olduğu için kayıt oluşturulamadı. Lütfen tekrar deneyin.'
          : 'Analysis data is incomplete. Please retry.'
      );
      setAppState('RESULT');
      return;
    }

    // Lead oluşturma
    const donorRating = result.donor_assessment?.density_rating || 'Good';
    let calculatedSuitability: 'suitable' | 'borderline' | 'not_recommended' = 'suitable';

    if (donorRating === 'Poor') calculatedSuitability = 'not_recommended';
    else if (donorRating === 'Moderate') calculatedSuitability = 'borderline';

    const newLead: LeadData = {
      id: `L-${Math.floor(Math.random() * 10000)}`,
      countryCode: lang === 'EN' ? 'US' : lang,
      age: result.phenotypic_features?.apparent_age || 30,
      gender: (mergedData.gender as 'Male' | 'Female') || 'Male',
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
        photos: capturedPhotos.map((p: any) => ({ label: p.label, preview: p.preview })),
        analysisImages: {
          simulation: simImg,
          planning: planImg,
        },
      },
      metadata: {
        lang,
        intake: mergedData,
      },
    };

    console.log('[App] Adding lead and navigating to RESULT');
    addLead(newLead);
    setAppState('RESULT');
  };

  const showFooter = ['LANDING', 'DIRECTORY', 'CLINIC_DETAILS', 'RESULT', 'CLINIC_LANDING', 'BLOG'].includes(appState);

  return (
    <div className="min-h-screen bg-[#F7F8FA] overflow-x-hidden flex flex-col" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      {/* GLOBAL HEADER COMPONENT */}
      <Header appState={appState} setAppState={setAppState} lang={lang} setLang={setLang} />

      <main className="relative flex-grow">
        {appState === 'LANDING' && (
          <LandingScreen
            onStart={handleStartSimulation}
            onVisitClinic={() => {
              setAppState('DIRECTORY');
            }}
            onBrowseDirectory={() => setAppState('DIRECTORY')}
            lang={lang}
          />
        )}

        {/* TYPE SELECTION SCREEN */}
        {appState === 'SELECT_TYPE' && (
          <TypeSelectionScreen
            lang={lang}
            onBack={() => setAppState('LANDING')}
            onSelect={handleTypeSelection}
          />
        )}

        {appState === 'PATIENT_PORTAL' && <PatientPortalScreen lang={lang} onExit={() => setAppState('LANDING')} />}

        {appState === 'CLINIC_LANDING' && (
          <ClinicLandingScreen
            onLogin={() => setAppState('PARTNER_PORTAL')}
            onApply={() => setAppState('PARTNER_JOIN')}
            onBack={() => setAppState('LANDING')}
          />
        )}

        {appState === 'PARTNER_JOIN' && (
          <PartnerJoinScreen
            onSubmit={() => setAppState('PARTNER_PORTAL')}
            onBack={() => setAppState('CLINIC_LANDING')}
          />
        )}

        {appState === 'DIRECTORY' && (
          <ClinicDirectoryScreen
            onBack={() => setAppState('LANDING')}
            onVisitClinic={(clinicId) => {
              setSelectedClinicId(clinicId);
              setAppState('CLINIC_DETAILS');
            }}
          />
        )}

        {appState === 'CLINIC_DETAILS' && selectedClinicId && (
          <ClinicScreen
            lang={lang}
            clinicId={selectedClinicId}
            onBack={() => setAppState('DIRECTORY')}
            onBook={handleStartSimulation}
          />
        )}

        {appState === 'PARTNER_PORTAL' && <PartnerPortalScreen lang={lang} onBack={() => setAppState('LANDING')} />}

        {appState === 'BLOG' && <BlogScreen onBack={() => setAppState('LANDING')} onNavigate={(p) => setAppState(p as any)} />}

        {appState === 'MONITORING' && <MonitoringDashboard />}

        {appState === 'ADMIN_DEBUG' && <AdminDebugScreen />}

        {appState === 'PRE_SCAN' && (
          <PreScanScreen
            onStart={() => setAppState('SCAN')}
            onBack={() => setAppState('LANDING')}
            lang={lang}
          />
        )}

        {appState === 'SCAN' && (
          <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F7F8FA] pt-24 md:pt-32">
            <div className="relative w-full flex-1 lg:max-h-[85vh] lg:max-w-[440px] lg:rounded-[3.5rem] lg:border-[12px] lg:border-slate-800 overflow-hidden bg-black shadow-2xl">
              <ScannerScreen onComplete={handleScanComplete} onExit={() => setAppState('LANDING')} lang={lang} />
            </div>
          </div>
        )}

        {/* INTAKE PHASE (Progressive Profiling) */}
        {appState === 'ANALYZE' && (
          <div className="w-full min-h-screen bg-[#F7F8FA] px-6 pt-28 pb-10">
            <div className="max-w-2xl mx-auto">
              {/* (2) Error Banner */}
              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-red-600">
                    {lang === 'TR' ? 'Bir sorun oldu' : 'Something went wrong'}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{error}</div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={handleRetryAnalysis}
                      disabled={isAnalyzing}
                      className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white disabled:opacity-60"
                    >
                      {isAnalyzing
                        ? (lang === 'TR' ? 'Tekrar deneniyor...' : 'Retrying...')
                        : (lang === 'TR' ? 'Tekrar Dene' : 'Retry')}
                    </button>

                    <button
                      onClick={() => setError(null)}
                      className="rounded-xl px-4 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-800"
                    >
                      {lang === 'TR' ? 'Kapat' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              )}

              {/* (2) Analyzing Status */}
              {!error && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    {lang === 'TR' ? 'Analiz hazırlanıyor' : 'Preparing your analysis'}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {isAnalyzing
                      ? (lang === 'TR' ? 'Lütfen kısa bir süre bekleyin...' : 'Please wait a moment...')
                      : (lang === 'TR' ? 'Analiz tamamlandı.' : 'Analysis completed.')}
                  </div>

                  {/* Opsiyonel: retry butonu (analiz bitse bile) */}
                  <div className="mt-3">
                    <button
                      onClick={handleRetryAnalysis}
                      disabled={isAnalyzing}
                      className="rounded-xl px-4 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-800 disabled:opacity-60"
                    >
                      {lang === 'TR' ? 'Analizi Yenile' : 'Refresh analysis'}
                    </button>
                  </div>
                </div>
              )}

              {/* Intake form */}
              <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
                <PreReportIntakeScreen
                  lang={lang}
                  onComplete={handleIntakeComplete}
                />
              </div>
            </div>
          </div>
        )}

        {/* OAUTH GATE */}
        {appState === 'AUTH_GATE' && (
          <div className="w-full min-h-screen relative flex items-center justify-center animate-in fade-in duration-700 bg-[#F7F8FA]">
            <div className="relative z-20 px-6 w-full max-w-xl">
              <SocialAuthModal
                onComplete={handleAuthComplete}
                lang={lang}
              />
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

      {showFooter && <Footer lang={lang} onNavigate={(page) => setAppState(page as any)} />}
    </div>
  );
};

export default App;
