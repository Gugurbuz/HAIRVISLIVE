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
        console.log('[OAuth] Checking for OAuth callback...');
        console.log('[OAuth] URL:', window.location.href);

        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

        const hasOAuthArtifacts =
          searchParams.has('code') ||
          searchParams.has('error') ||
          searchParams.has('error_description') ||
          searchParams.has('access_token') ||
          hashParams.has('access_token') ||
          hashParams.has('error');

        // Exchange PKCE code for session if present
        if (searchParams.has('code')) {
          console.log('[OAuth] Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) {
            console.error('[OAuth] Code exchange failed:', exchangeError);
          } else if (data?.session) {
            console.log('[OAuth] Session established:', data.session.user.email);

            // Check if we have pending scan data (user came from scan flow)
            const pendingScanDataRaw = sessionStorage.getItem('pendingScanData');
            if (pendingScanDataRaw) {
              console.log('[OAuth] Pending scan data found, starting analysis...');

              const savedScanData = JSON.parse(pendingScanDataRaw);
              const restoredPhotos: any[] = [];

              savedScanData.capturedPhotos.forEach((placeholder: any, idx: number) => {
                const preview = sessionStorage.getItem(`scan_photo_${idx}`);
                if (preview) {
                  restoredPhotos.push({
                    ...placeholder,
                    preview,
                  });
                }
              });

              if (restoredPhotos.length > 0) {
                // Store auth data
                sessionStorage.setItem('authData', JSON.stringify({
                  email: data.session.user.email || '',
                  name: data.session.user.user_metadata?.full_name || data.session.user.email || 'User',
                  userId: data.session.user.id,
                }));

                // Restore photos
                setCapturedPhotos(restoredPhotos);
                lastScanRef.current = { photos: restoredPhotos, skip: savedScanData.skipAnalysis || false };

                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);

                // Start analysis
                setAppState('ANALYZING');
                runBackgroundAnalysis(restoredPhotos, savedScanData.skipAnalysis || false).then(() => {
                  setAppState('INTAKE');

                  // Clean up scan data
                  sessionStorage.removeItem('pendingScanData');
                  savedScanData.capturedPhotos.forEach((_: any, idx: number) => {
                    sessionStorage.removeItem(`scan_photo_${idx}`);
                  });
                });

                return;
              }
            }
          }
        }

        // Clean up OAuth artifacts from URL
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

    // retry için sakla
    lastScanRef.current = { photos, skip };

    // Save photos to sessionStorage for post-auth analysis
    try {
      const stateToSave = {
        capturedPhotos: photos.map(p => ({ id: p.id, label: p.label })),
        skipAnalysis: skip,
        createdAt: Date.now(),
      };

      console.log('[App] Saving scan data to sessionStorage');
      sessionStorage.setItem('pendingScanData', JSON.stringify(stateToSave));

      photos.forEach((photo, idx) => {
        try {
          sessionStorage.setItem(`scan_photo_${idx}`, photo.preview);
        } catch (e) {
          console.warn(`[App] Could not save photo ${idx}:`, e);
        }
      });
    } catch (e) {
      console.error('[App] Failed to save scan data:', e);
    }

    // Go to auth first, then analyze
    setAppState('AUTH_GATE');
  };

  // Intake Complete -> Finalize Lead Creation
  const handleIntakeComplete = (data: IntakeData) => {
    setIntakeData(data);

    // Get auth data from sessionStorage
    try {
      const authDataRaw = sessionStorage.getItem('authData');
      if (!authDataRaw) {
        console.error('[App] No auth data found after intake');
        setError(lang === 'TR' ? 'Oturum verisi bulunamadı.' : 'Session data not found.');
        setAppState('LANDING');
        return;
      }

      const authData = JSON.parse(authDataRaw);

      // Combine Intake Data + Auth Data
      const mergedData: any = {
        ...data,
        contactMethod: 'email',
        contactValue: authData.email,
        userName: authData.name,
        userId: authData.userId,
        verified: true,
      };

      console.log('[App] Creating lead with merged data');
      finalizeLeadCreation(analysisResult, afterImage, planningImage, mergedData);

      // Clean up
      sessionStorage.removeItem('authData');
    } catch (e) {
      console.error('[App] Failed to finalize lead:', e);
      setError(lang === 'TR' ? 'Kayıt oluşturulamadı.' : 'Failed to create lead.');
    }
  };

  // Auth Complete -> Start Analysis -> Go to Intake
  const handleAuthComplete = async (authData: { email: string; name: string; userId: string }) => {
    console.log('[App] Auth complete called:', authData.email);

    // Store auth data for later use
    sessionStorage.setItem('authData', JSON.stringify(authData));

    // Restore scan data from sessionStorage
    try {
      const pendingScanDataRaw = sessionStorage.getItem('pendingScanData');
      if (!pendingScanDataRaw) {
        console.error('[App] No pending scan data found after auth');
        setError(lang === 'TR' ? 'Scan verisi bulunamadı. Lütfen tekrar scan yapın.' : 'Scan data not found. Please scan again.');
        setAppState('LANDING');
        return;
      }

      const savedScanData = JSON.parse(pendingScanDataRaw);
      const restoredPhotos: any[] = [];

      savedScanData.capturedPhotos.forEach((placeholder: any, idx: number) => {
        const preview = sessionStorage.getItem(`scan_photo_${idx}`);
        if (preview) {
          restoredPhotos.push({
            ...placeholder,
            preview,
          });
        }
      });

      if (restoredPhotos.length === 0) {
        console.error('[App] No photos could be restored');
        setError(lang === 'TR' ? 'Fotoğraflar yüklenemedi. Lütfen tekrar scan yapın.' : 'Photos could not be loaded. Please scan again.');
        setAppState('LANDING');
        return;
      }

      console.log('[App] Restored photos:', restoredPhotos.length);
      setCapturedPhotos(restoredPhotos);
      lastScanRef.current = { photos: restoredPhotos, skip: savedScanData.skipAnalysis || false };

      // Start analysis
      setAppState('ANALYZING');
      await runBackgroundAnalysis(restoredPhotos, savedScanData.skipAnalysis || false);

      // After analysis completes, go to intake
      setAppState('INTAKE');

      // Clean up scan data
      sessionStorage.removeItem('pendingScanData');
      savedScanData.capturedPhotos.forEach((_: any, idx: number) => {
        sessionStorage.removeItem(`scan_photo_${idx}`);
      });
    } catch (e) {
      console.error('[App] Failed to restore scan data:', e);
      setError(lang === 'TR' ? 'Scan verisi yüklenemedi.' : 'Failed to load scan data.');
      setAppState('LANDING');
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

  // Background Analysis Logic (2-Stage Pipeline)
  // forceReal = true -> skip gelse bile gerçek analiz çalışır
  const runBackgroundAnalysis = async (photos: any[], skip: boolean, forceReal: boolean = false) => {
    setError(null);
    setIsAnalyzing(true);

    const analysisStartTime = Date.now();
    await updateActivity();

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

    let viewImages: ScalpImages | null = null;

    try {
      const getPhoto = (id: string): string => {
        const found = photos.find((p) => p.id === id);
        if (found?.preview && typeof found.preview === 'string') {
          return found.preview;
        }
        const fallback = photos[0]?.preview;
        return typeof fallback === 'string' ? fallback : '';
      };

      viewImages = {
        front: getPhoto('front'),
        left: getPhoto('left'),
        right: getPhoto('right'),
        crown: getPhoto('top'),
        donor: getPhoto('donor'),
        macro: getPhoto('hairline_macro'),
      };

      const mainPhoto = viewImages.front || viewImages.crown || getPhoto('front');

      if (!mainPhoto || mainPhoto.length < 1000) {
        throw new Error('Missing or invalid main photo');
      }

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

      const planImage = await geminiService.generateSurgicalPlanImage(mainPhoto, result);
      setPlanningImage(planImage);

      (result as any).surgical_plan_image = planImage || undefined;

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

      const userMsg = classifyUserError(err);
      setError(userMsg);

      try {
        await logAnalysis({
          operationType: 'scalp_analysis',
          inputData: { viewTypes: Object.keys(viewImages || {}) },
          error: err?.message || String(err),
          durationMs: Date.now() - analysisStartTime,
        });
      } catch (logErr) {
        console.error('Failed to log analysis error (non-blocking):', logErr);
      }

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
          <div className="w-full h-[100svh] flex flex-col items-center justify-center bg-[#F7F8FA] [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)]">
            <div className="relative w-full flex-1 lg:max-h-[85vh] lg:max-w-[440px] lg:rounded-[3.5rem] lg:border-[12px] lg:border-slate-800 overflow-hidden bg-black shadow-2xl">
              <ScannerScreen onComplete={handleScanComplete} onExit={() => setAppState('LANDING')} lang={lang} />
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

        {/* ANALYZING (Loading after auth) */}
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
                  {lang === 'TR' ? 'Fotoğraflarınız analiz ediliyor, lütfen bekleyin...' : 'Analyzing your photos, please wait...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* INTAKE PHASE (After Analysis) */}
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
                />
              </div>
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
