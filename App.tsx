
import React, { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen';
import ScannerScreen from './components/ScannerScreen';
import PreScanScreen from './components/PreScanScreen';
import AuthOTPModal from './components/AuthOTPModal'; 
import DashboardScreen from './components/DashboardScreen';
import PartnerPortalScreen from './components/PartnerPortalScreen';
import PartnerJoinScreen from './components/PartnerJoinScreen';
import PatientPortalScreen from './components/PatientPortalScreen';
import ClinicLandingScreen from './components/ClinicLandingScreen'; 
import ClinicScreen from './components/ClinicScreen';
import ClinicDirectoryScreen from './components/ClinicDirectoryScreen';
import PreReportIntakeScreen from './components/PreReportIntakeScreen';
import BlogScreen from './components/BlogScreen';
import Footer from './components/Footer';
import TypeSelectionScreen from './components/TypeSelectionScreen';
import { Header } from './components/Header'; // Imported Header
import { translations, LanguageCode } from './translations';
import { geminiService, ScalpImages } from './geminiService';
import { useLeads, LeadData, IntakeData } from './context/LeadContext';
import { AppState } from './types'; // Imported AppState

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

  const { addLead } = useLeads();
  const t = translations[lang];

  useEffect(() => {
    window.scrollTo(0, 0);
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
    
    // Trigger background analysis immediately
    runBackgroundAnalysis(photos, skip);
  };

  // Intake Complete -> Go to Auth Gate (OTP)
  const handleIntakeComplete = (data: IntakeData) => {
    setIntakeData(data);
    setAppState('AUTH_GATE');
  };

  // Auth Complete -> Go to Result (Finalize Lead)
  const handleAuthComplete = (authData: any) => {
    // Combine Intake Data + Auth Data (Verified Phone/Email)
    const mergedData = { 
        ...intakeData, 
        contactMethod: authData.type, 
        contactValue: authData.value,
        verified: true
    };
    finalizeLeadCreation(analysisResult, afterImage, planningImage, mergedData);
  };

  // Background Analysis Logic (2-Stage Pipeline)
  const runBackgroundAnalysis = async (photos: any[], skip: boolean) => {
    setError(null);
    
    // If skipping (dev mode), mock everything
    if (skip) {
        setTimeout(() => {
             const mockResult = {
                diagnosis: { norwood_scale: "NW3", analysis_summary: "Visual estimation indicates pattern consistent with typical NW3 recession." },
                detailed_analysis: {
                    current_condition_summary: "Frontal recession visible.",
                    hair_quality_assessment: "Medium caliber.",
                    projected_results_summary: "High density expected."
                },
                technical_metrics: { 
                    graft_count_min: 2500, 
                    graft_count_max: 3000, 
                    graft_distribution: { zone_1: 1500, zone_2: 1000, zone_3: 500 },
                    estimated_session_time_hours: 6, 
                    suggested_technique: "Sapphire FUE",
                    technique_reasoning: "Often selected for higher density in frontal zones." 
                },
                donor_assessment: { density_rating: 'Good', estimated_hairs_per_cm2: 70, total_safe_capacity_grafts: 4000, donor_condition_summary: "Visual analysis suggests adequate donor density." },
                phenotypic_features: { apparent_age: 35, skin_tone: 'Medium', skin_undertone: 'Warm', beard_presence: 'Stubble', beard_texture: 'Wavy', eyebrow_density: 'Medium', eyebrow_color: 'Dark' },
                scalp_geometry: { hairline_design_polygon: [{x: 0, y: 0}], high_density_zone_polygon: [{x: 0, y: 0}] }
            };
            setAnalysisResult(mockResult);
            setPlanningImage("https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200");
            setAfterImage("https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=1200");
        }, 3000); // Fake delay to match intake length
        return;
    }

    try {
      const getPhoto = (id: string) => 
        photos.find(p => p.id === id)?.preview.split(',')[1] || 
        photos[0]?.preview.split(',')[1] || "";

      const viewImages: ScalpImages = {
        front: getPhoto('front'),
        left: getPhoto('left'),
        right: getPhoto('right'),
        crown: getPhoto('top'), 
        donor: getPhoto('donor'),
        macro: getPhoto('hairline_macro')
      };
      
      const mainPhoto = viewImages.front; 

      // STEP 1: Geometric Analysis (Metrics & Text)
      const result = await geminiService.analyzeScalp(viewImages);
      setAnalysisResult(result);

      if (!result) throw new Error("Analysis failed");

      // STEP 2: Surgical Plan Generation (Doctor Drawing)
      const planImage = await geminiService.generateSurgicalPlanImage(mainPhoto, result);
      setPlanningImage(planImage);
      
      // Store plan image in result for later reference
      result.surgical_plan_image = planImage || undefined;

      // STEP 3: Targeted Simulation (Using Original + Plan)
      // We pass the Plan Image as context so the AI knows exactly where to "plant"
      const simImage = await geminiService.generateSimulation(mainPhoto, planImage, result);
      setAfterImage(simImage);
      
      result.simulation_image = simImage || undefined;

    } catch (err: any) {
      console.error("Workflow Error:", err);
      // Fallback
      setAnalysisResult({ diagnosis: { norwood_scale: "NW3", analysis_summary: "Visual estimation unavailable." } }); 
    }
  };

  const finalizeLeadCreation = (result: any, simImg: string | null, planImg: string | null, mergedData: any) => {
      if (result) {
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
              isUnlocked: false,
              suitability: calculatedSuitability,
              donorBand: donorRating,
              responses: [],
              patientDetails: {
                  fullName: "Verified Patient",
                  phone: mergedData.contactMethod === 'phone' ? mergedData.contactValue : '',
                  email: mergedData.contactMethod === 'email' ? mergedData.contactValue : '',
                  consent: true,
                  kvkk: true,
                  gender: mergedData.gender,
                  previousTransplant: mergedData.history
              },
              intake: mergedData, 
              analysisData: {
                  ...result,
                  surgical_plan_image: planImg,
                  simulation_image: simImg
              }
          };
          addLead(newLead);
      }
      setAppState('RESULT');
  };

  const showFooter = ['LANDING', 'DIRECTORY', 'CLINIC_DETAILS', 'RESULT', 'CLINIC_LANDING', 'BLOG'].includes(appState);

  return (
    <div className={`min-h-screen bg-[#F7F8FA] overflow-x-hidden flex flex-col`} dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      
      {/* GLOBAL HEADER COMPONENT */}
      <Header 
        appState={appState} 
        setAppState={setAppState} 
        lang={lang} 
        setLang={setLang} 
      />

      <main className="relative flex-grow">
        {appState === 'LANDING' && (
          <LandingScreen 
            onStart={handleStartSimulation} 
            onVisitClinic={() => setAppState('CLINIC_DETAILS')} 
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
            onVisitClinic={() => setAppState('CLINIC_DETAILS')}
          />
        )}
        {appState === 'CLINIC_DETAILS' && (
          <ClinicScreen 
            lang={lang} 
            onBack={() => setAppState('DIRECTORY')} 
            onBook={handleStartSimulation} 
          />
        )}
        {appState === 'PARTNER_PORTAL' && <PartnerPortalScreen lang={lang} onBack={() => setAppState('LANDING')} />}
        
        {appState === 'BLOG' && <BlogScreen onBack={() => setAppState('LANDING')} onNavigate={(p) => setAppState(p as any)} />}

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
          <div className="w-full h-screen flex items-center justify-center bg-[#F7F8FA] px-6">
             <PreReportIntakeScreen 
                lang={lang} 
                onComplete={handleIntakeComplete} 
             />
          </div>
        )}

        {/* OTP GATE (Was Lead Capture) */}
        {appState === 'AUTH_GATE' && (
          <div className="w-full min-h-screen relative flex items-center justify-center animate-in fade-in duration-700 bg-[#F7F8FA]">
             <div className="relative z-20 px-6 w-full max-w-xl">
                <AuthOTPModal 
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
              planningImage={planningImage || ''} // Passed planning image here
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
