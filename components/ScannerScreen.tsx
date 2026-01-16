import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera as CameraIcon,
  RefreshCw,
  X,
  Sun,
  Sparkles,
  AlertCircle,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Timer,
  Scan,
  Maximize,
  AlertTriangle,
  SwitchCamera,
  ZoomIn,
  FastForward,
  Zap,
  ZapOff
} from 'lucide-react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { translations, LanguageCode } from '../translations';

// --- YARDIMCI FONKSIYONLAR ---

// Singleton AudioContext
let sharedAudioCtx: AudioContext | null = null;
const getAudioContext = () => {
    if (!sharedAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) sharedAudioCtx = new AudioContextClass();
    }
    return sharedAudioCtx;
};

const getLanguageTag = (lang: LanguageCode): string => {
    switch (lang) {
        case 'TR': return 'tr-TR';
        case 'DE': return 'de-DE';
        case 'FR': return 'fr-FR';
        case 'PL': return 'pl-PL';
        case 'AR': return 'ar-SA';
        default: return 'en-US';
    }
};

const getBestVoice = (langTag: string) => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;
    const targetBase = langTag.split('-')[0].toLowerCase(); 
    let candidates = voices.filter(v => {
        const voiceLang = v.lang.toLowerCase().replace('_', '-');
        return voiceLang === langTag.toLowerCase() || voiceLang.startsWith(targetBase + '-');
    });
    if (candidates.length === 0) {
        candidates = voices.filter(v => {
            const voiceLang = v.lang.toLowerCase().replace('_', '-');
            const name = v.name.toLowerCase();
            return voiceLang.startsWith(targetBase) || name.includes('turkish') || name.includes('türkçe');
        });
    }
    if (candidates.length === 0) return null;
    const scoredCandidates = candidates.map(v => {
        let score = 0;
        const name = v.name.toLowerCase();
        if (name.includes('google')) score += 10;
        if (name.includes('yelda') || name.includes('cem')) score += 10;
        if (name.includes('enhanced') || name.includes('premium')) score += 5;
        if (v.default) score -= 1;
        return { voice: v, score };
    });
    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates[0].voice;
};

const speak = (text: string, enabled: boolean, lang: LanguageCode) => {
  if (!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const langTag = getLanguageTag(lang);
  utterance.lang = langTag;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  const setVoiceAndSpeak = () => {
      const bestVoice = getBestVoice(langTag);
      if (bestVoice) {
          utterance.voice = bestVoice;
          utterance.lang = bestVoice.lang; 
      } else {
          utterance.lang = langTag;
      }
      window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
          setVoiceAndSpeak();
          window.speechSynthesis.onvoiceschanged = null;
      };
  } else {
      setVoiceAndSpeak();
  }
};

const analyzeImageContent = (ctx: CanvasRenderingContext2D, width: number, height: number, region?: {x: number, y: number, w: number, h: number}) => {
    try {
        let startX, startY, sampleW, sampleH;
        if (region) {
            startX = region.x; startY = region.y; sampleW = region.w; sampleH = region.h;
        } else {
            sampleW = Math.min(width, height) * 0.5; sampleH = sampleW;
            startX = (width - sampleW) / 2; startY = (height - sampleH) / 2;
        }
        startX = Math.max(0, Math.floor(startX));
        startY = Math.max(0, Math.floor(startY));
        sampleW = Math.min(width - startX, Math.floor(sampleW));
        sampleH = Math.min(height - startY, Math.floor(sampleH));
        if (sampleW <= 0 || sampleH <= 0) return { brightness: 0, sharpness: 0 };
        const imageData = ctx.getImageData(startX, startY, sampleW, sampleH);
        const data = imageData.data;
        const widthSamples = imageData.width;
        let sumLuma = 0; let sumSharpness = 0; let pixelCount = 0; const step = 4; 
        for (let i = 0; i < data.length; i += step * 4) {
            const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            sumLuma += luma;
            if (i + (step * 4) < data.length && i + (widthSamples * 4 * step) < data.length) {
                const rightIdx = i + (step * 4); const downIdx = i + (widthSamples * 4 * step);
                const rightLuma = 0.299 * data[rightIdx] + 0.587 * data[rightIdx+1] + 0.114 * data[rightIdx+2];
                const downLuma = 0.299 * data[downIdx] + 0.587 * data[downIdx+1] + 0.114 * data[downIdx+2];
                const diffH = Math.abs(luma - rightLuma); const diffV = Math.abs(luma - downLuma);
                sumSharpness += (diffH + diffV);
            }
            pixelCount++;
        }
        const avgBrightness = pixelCount > 0 ? sumLuma / pixelCount : 0;
        const sharpnessScore = pixelCount > 0 ? Math.min(100, (sumSharpness / pixelCount) * 5) : 0; 
        return { brightness: avgBrightness, sharpness: sharpnessScore };
    } catch (e) { return { brightness: 0, sharpness: 0 }; }
};

const playSound = (type: 'beep' | 'success' | 'error' | 'focus' | 'lock') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    if (type === 'beep') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'success') {
        [523.25, 659.25, 783.99].forEach((freq, i) => { 
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = freq;
            o.connect(g); g.connect(ctx.destination);
            const startTime = now + (i * 0.08);
            g.gain.setValueAtTime(0, startTime); g.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
            o.start(startTime); o.stop(startTime + 0.5);
        });
    } else if (type === 'error') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'focus') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); 
        osc.frequency.linearRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'lock') {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square'; osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    }
  } catch (e) { console.warn("Audio playback failed", e); }
};

const vibrate = (pattern: number | number[]) => { if (navigator.vibrate) navigator.vibrate(pattern); };

const RangeControl = ({ icon: Icon, label, value, onChange, min = 0, max = 200 }: any) => (
  <div className="flex items-center gap-3 w-full bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
    <Icon className="w-4 h-4 text-slate-700" />
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between text-[10px] text-slate-500 uppercase font-medium tracking-wider mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
    </div>
  </div>
);

// --- ANA COMPONENT ---

interface ScannerScreenProps {
  onComplete: (photos: any[], skip?: boolean) => void;
  onExit: () => void;
  lang: LanguageCode;
}

const ScannerScreen: React.FC<ScannerScreenProps> = ({ onComplete, onExit, lang }) => {
  const isRTL = lang === 'AR';
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const faceMeshRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const processingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastLandmarksRef = useRef<any>(null);
  const photosAccRef = useRef<any[]>([]);
  const holdStartTimeRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const macroIntervalRef = useRef<any>(null);
  
  const countdownIntervalRef = useRef<any>(null);
  const captureLockRef = useRef(false);

  const isModelLoadedRef = useRef(false);
  const lastGuidanceTextRef = useRef('');

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<'searching' | 'out-of-bounds' | 'aligning' | 'holding' | 'capturing' | 'review'>('searching'); 
  const [holdProgress, setHoldProgress] = useState(0); 
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null); 
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentQualityScore, setCurrentQualityScore] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<{ text: string, type: 'up'|'down'|'left'|'right'|null }>({ text: '', type: null });

  // Camera & Flash State
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasTorch, setHasTorch] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Error States
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showSettings, setShowSettings] = useState(false);

  // Refs for state
  const currentStepIndexRef = useRef(0);
  const statusRef = useRef<'searching' | 'out-of-bounds' | 'aligning' | 'holding' | 'capturing' | 'review'>('searching');
  const onCompleteRef = useRef(onComplete);

  // Define Steps
  const SCAN_STEPS = useMemo(() => {
      const t = translations[lang].scannerSteps;
      return [
        { 
            id: 'front', 
            label: t.frontLabel, 
            instruction: t.frontInstruction, 
            target: { yaw: 0, pitch: 0, roll: 0, yawTolerance: 8, pitchTolerance: 10 }, 
            guideType: 'center',
            speakText: t.frontSpeak,
            useAI: true,
            forceCamera: 'user'
        },
        { 
            id: 'left', 
            label: t.leftLabel, 
            instruction: t.leftInstruction, 
            target: { yaw: -55, pitch: 0, roll: 0, yawTolerance: 30, pitchTolerance: 20 }, 
            guideType: 'left',
            speakText: t.leftSpeak,
            useAI: true,
            forceCamera: 'user'
        },
        { 
            id: 'right', 
            label: t.rightLabel, 
            instruction: t.rightInstruction, 
            target: { yaw: 55, pitch: 0, roll: 0, yawTolerance: 30, pitchTolerance: 20 }, 
            guideType: 'right',
            speakText: t.rightSpeak,
            useAI: true,
            forceCamera: 'user'
        },
        {
            id: 'top', 
            label: t.topLabel, 
            instruction: t.topInstruction, 
            target: { yaw: 0, pitch: 30, roll: 0, yawTolerance: 35, pitchTolerance: 25 }, 
            guideType: 'down',
            speakText: t.topSpeak,
            useAI: true,
            forceCamera: 'user'
        },
        {
            id: 'donor',
            label: t.donorLabel,
            instruction: t.donorInstruction,
            subInstruction: 'Auto-Capture when focused',
            target: { yaw: 0, pitch: 0, roll: 0, yawTolerance: 0, pitchTolerance: 0 },
            guideType: 'none',
            speakText: t.donorSpeak,
            useAI: false, 
            isTimerDriven: false,
            checkTexture: true,
            forceCamera: 'environment'
        },
        {
            id: 'hairline_macro',
            label: t.macroLabel,
            instruction: t.macroInstruction,
            subInstruction: 'Using Digital Zoom',
            target: { yaw: 0, pitch: 0, roll: 0, yawTolerance: 0, pitchTolerance: 0 },
            guideType: 'circle',
            speakText: t.macroSpeak,
            useAI: false,
            useFlash: false,
            checkTexture: true,
            forceCamera: 'environment',
            zoom: 2.0 
        }
      ];
  }, [lang]);

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
    }
    setCountdown(null);
  }, []);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
    setValidationError(null);
    setHoldProgress(0);
    setStatus('searching');
    statusRef.current = 'searching';
    captureLockRef.current = false; 
    
    stopCountdown();
    
    const step = SCAN_STEPS[currentStepIndex];
    if (step.forceCamera && step.forceCamera !== facingMode) {
        setFacingMode(step.forceCamera as any);
    }
  }, [currentStepIndex, SCAN_STEPS, stopCountdown]);

  useEffect(() => {
    statusRef.current = status;
    if (status === 'holding' && holdProgress === 0) {
        vibrate(20); 
    }
  }, [status, holdProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const applyTorch = async (enable: boolean) => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const tracks = stream.getVideoTracks();
    if (tracks.length === 0) return;
    
    const track = tracks[0];
    try {
      const capabilities = track.getCapabilities();
      // @ts-ignore
      if (capabilities.torch) {
        setHasTorch(true);
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ torch: enable }] });
        setFlashEnabled(enable);
      } else {
        setHasTorch(false);
      }
    } catch (e) {
      console.warn("Torch control failed", e);
      setHasTorch(false);
    }
  };

  const applyZoom = async (zoomValue: number) => {
      if (!videoRef.current || !videoRef.current.srcObject) return;
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getVideoTracks();
      if (tracks.length === 0) return;
      
      const track = tracks[0];
      try {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.zoom) {
              const maxZoom = capabilities.zoom.max || 1;
              const safeZoom = Math.min(zoomValue, maxZoom);
              await track.applyConstraints({ advanced: [{ zoom: safeZoom } as any] });
              setZoomLevel(safeZoom);
          }
      } catch (e) {
          console.warn("Zoom apply failed", e);
      }
  };

  const toggleCamera = async () => {
      if (flashEnabled) {
          await applyTorch(false);
      }
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleManualFlash = () => {
      applyTorch(!flashEnabled);
  };

  const handleTestSkip = () => {
      if (!import.meta.env.DEV) return;

      const mockPhotoData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      const mockPhotos = SCAN_STEPS.map(step => ({
          id: step.id,
          preview: mockPhotoData,
          type: step.id,
          label: step.label,
          qualityScore: 100
      }));
      onCompleteRef.current(mockPhotos, true); 
  };

  useEffect(() => {
    const step = SCAN_STEPS[currentStepIndex];
    if (step) {
      const timer = setTimeout(() => {
          speak(step.speakText, audioEnabled, lang);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, audioEnabled, lang, SCAN_STEPS]);

  // --- MACRO & DONOR (BLIND SHOT) AUTO-CAPTURE LOOP ---
  useEffect(() => {
    if (macroIntervalRef.current) {
        clearInterval(macroIntervalRef.current);
        macroIntervalRef.current = null;
    }

    const step = SCAN_STEPS[currentStepIndex];
    if (!step.checkTexture) return;

    const t = translations[lang].scannerSteps.guidance;
    const video = videoRef.current;
    if (!video) return;

    const analysisCanvas = document.createElement('canvas');
    const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });

    let focusLockTime = 0;
    let isCountingDown = false;

    macroIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current || statusRef.current === 'capturing' || statusRef.current === 'review' || captureLockRef.current) return;
        if (video.readyState < 2) return;

        const analyzeWidth = 240; 
        const aspectRatio = video.videoWidth / video.videoHeight;
        const analyzeHeight = Math.max(1, Math.round(analyzeWidth / aspectRatio));

        if (analysisCanvas.width !== analyzeWidth) {
            analysisCanvas.width = analyzeWidth;
            analysisCanvas.height = analyzeHeight;
        }
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, analyzeWidth, analyzeHeight);

        let region = undefined;
        if (step.id === 'hairline_macro') {
            const size = Math.min(analyzeWidth, analyzeHeight) * 0.4; 
            region = {
                x: (analyzeWidth - size) / 2,
                y: (analyzeHeight - size) / 2,
                w: size,
                h: size
            };
        }

        const stats = analyzeImageContent(ctx, analyzeWidth, analyzeHeight, region);

        if (step.id === 'donor') {
            const minSharpness = 25; 
            if (isCountingDown) return; 

            if (stats.sharpness > minSharpness && stats.brightness > 40) {
                if (statusRef.current !== 'holding') {
                    setStatus('holding');
                    playSound('focus'); 
                }
                
                focusLockTime += 500; 

                if (focusLockTime > 1000) {
                    isCountingDown = true;
                    playSound('lock');
                    startCountdownCapture();
                }
            } else {
                focusLockTime = 0;
                if (statusRef.current !== 'searching') {
                    setStatus('searching');
                }
            }
            return;
        }

        if (step.id === 'hairline_macro') {
            const minSharpness = 22;
            const goodSharpness = 45;
            let newGuidanceText = '';
            
            if (stats.sharpness < minSharpness) {
                if (statusRef.current !== 'searching') {
                    setStatus('searching');
                    setHoldProgress(0);
                }
                newGuidanceText = t.moveBack;
            } else if (stats.sharpness >= minSharpness && stats.sharpness < goodSharpness) {
                if (statusRef.current !== 'aligning') {
                    setStatus('aligning');
                    playSound('focus');
                }
                newGuidanceText = t.hold;
                setHoldProgress(prev => Math.min(prev + 10, 30)); 

            } else {
                if (statusRef.current !== 'holding') {
                    setStatus('holding');
                    playSound('lock');
                }
                newGuidanceText = t.perfect;
                
                setHoldProgress(prev => {
                    const next = Math.max(30, prev + 25); 
                    if (next >= 100) {
                        handleCapture();
                        return 100;
                    }
                    return next;
                });
            }

            if (newGuidanceText && newGuidanceText !== lastGuidanceTextRef.current) {
                setGuidance({ text: newGuidanceText, type: newGuidanceText === t.moveBack ? 'down' : null });
                lastGuidanceTextRef.current = newGuidanceText;
            }
        }

    }, 500); 

    return () => {
        if (macroIntervalRef.current) clearInterval(macroIntervalRef.current);
    };
  }, [currentStepIndex, audioEnabled, lang, SCAN_STEPS]);


  const startCountdownCapture = () => {
    stopCountdown();
    
    if (status === 'capturing' || captureLockRef.current) return;
    setValidationError(null);
    
    let count = 3;
    setCountdown(count);
    
    speak(translations[lang].scannerSteps.count3, audioEnabled, lang); 
    
    countdownIntervalRef.current = setInterval(() => {
        count--;
        if (count > 0) {
            setCountdown(count);
            const countWords = [translations[lang].scannerSteps.count1, translations[lang].scannerSteps.count2];
            speak(countWords[count-1] || String(count), audioEnabled, lang);
            if(audioEnabled) playSound('beep');
        } else {
            stopCountdown();
            handleCapture();
        }
    }, 1000);
  };

  const handleCapture = useCallback(() => {
    if (captureLockRef.current) return; 
    if (!videoRef.current || !overlayRef.current) return;
    if (statusRef.current === 'capturing' || statusRef.current === 'review') return;
    
    captureLockRef.current = true; // LOCK

    const video = videoRef.current;
    const overlay = overlayRef.current;
    const currentIndex = currentStepIndexRef.current;
    const currentStep = SCAN_STEPS[currentIndex];

    const videoRect = video.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const sourceW = video.videoWidth;
    const sourceH = video.videoHeight;
    const elW = videoRect.width;
    const elH = videoRect.height;
    const sourceRatio = sourceW / sourceH;
    const elementRatio = elW / elH;

    let renderW, renderH, offsetX, offsetY;
    if (sourceRatio > elementRatio) {
        renderH = elH; renderW = elH * sourceRatio; offsetX = (renderW - elW) / 2; offsetY = 0;
    } else {
        renderW = elW; renderH = elW / sourceRatio; offsetX = 0; offsetY = (renderH - elH) / 2;
    }

    const overlayRelX = overlayRect.left - videoRect.left;
    const overlayRelY = overlayRect.top - videoRect.top;
    const overlayRenderX = overlayRelX + offsetX;
    const overlayRenderY = overlayRelY + offsetY;
    const scale = sourceW / renderW;
    const cropX = overlayRenderX * scale;
    const cropY = overlayRenderY * scale;
    const cropW = overlayRect.width * scale;
    const cropH = overlayRect.height * scale;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cropW);
    canvas.height = Math.round(cropH);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        captureLockRef.current = false;
        return;
    }

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.save();
    
    if (facingMode === 'user' && currentStep.id !== 'donor' && currentStep.id !== 'hairline_macro') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const stats = analyzeImageContent(ctx, canvas.width, canvas.height);
    
    let score = Math.round(stats.sharpness * 1.5); 
    if (stats.brightness < 40 || stats.brightness > 220) score -= 20;
    const finalQualityScore = Math.min(99, Math.max(65, score)); 

    setStatus('capturing');
    statusRef.current = 'capturing';
    vibrate([50, 100, 50]); 
    speak(translations[lang].scannerSteps.captured, audioEnabled, lang);

    if (lastLandmarksRef.current && currentStep.useAI && facingMode === 'user') {
       try {
           const landmarks = lastLandmarksRef.current;
           const mapX = (val: number) => {
               const pixelX = val * sourceW;
               const relX = pixelX - cropX;
               return facingMode === 'user' ? cropW - relX : relX;
           };
           const mapY = (val: number) => (val * sourceH) - cropY;
           
           const eyeY = mapY((landmarks[33].y + landmarks[263].y) / 2);
           const faceHeight = Math.abs(mapY(landmarks[152].y) - mapY(landmarks[10].y));
           const blurHeight = faceHeight * 0.28;
           const rawMinX = landmarks[234].x;
           const rawMaxX = landmarks[454].x;
           const x1 = mapX(rawMinX);
           const x2 = mapX(rawMaxX);
           
           const barStartX = Math.min(x1, x2);
           const barWidth = Math.abs(x1 - x2);
           const padding = barWidth * 0.15;
           const blurRadius = Math.max(40, cropW * 0.05);

           ctx.save();
           ctx.filter = `blur(${blurRadius}px)`;
           ctx.beginPath();
           ctx.rect(barStartX - padding, eyeY - (blurHeight * 0.6), barWidth + (padding*2), blurHeight);
           ctx.clip();
           ctx.drawImage(canvas, 0, 0);
           ctx.fillStyle = 'rgba(0,0,0,0.2)';
           ctx.fill();
           ctx.restore();
       } catch (e) {
           console.warn("Blur effect failed", e);
       }
    }
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCurrentQualityScore(finalQualityScore);
    
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white z-[100] animate-out fade-out duration-300 pointer-events-none';
    videoRef.current?.parentElement?.appendChild(flash);
    setTimeout(() => flash.remove(), 300);

    setTimeout(() => {
      setTempPhoto(dataUrl);
      setStatus('review');
      statusRef.current = 'review';
    }, 400);

  }, [brightness, contrast, audioEnabled, lang, SCAN_STEPS, facingMode]);

  const confirmPhoto = () => {
    if (!tempPhoto) return;
    if (audioEnabled) playSound('success');
    
    stopCountdown(); 

    const currentStep = SCAN_STEPS[currentStepIndex];
    const newPhoto = {
        id: currentStep.id,
        preview: tempPhoto,
        type: currentStep.id,
        label: currentStep.label,
        qualityScore: currentQualityScore
    };
    if (!photosAccRef.current.some(p => p.id === currentStep.id)) {
        photosAccRef.current.push(newPhoto);
    }
    setTempPhoto(null);
    setValidationError(null);
    captureLockRef.current = false; 
    
    if (currentStepIndex >= SCAN_STEPS.length - 1) {
        window.speechSynthesis.cancel();
        applyTorch(false);
        onCompleteRef.current(photosAccRef.current);
    } else {
        setCurrentStepIndex(prev => prev + 1);
        setStatus('searching');
        statusRef.current = 'searching';
        setHoldProgress(0);
        holdStartTimeRef.current = null;
    }
  };

  const retakePhoto = () => {
    stopCountdown(); 
    setTempPhoto(null);
    setStatus('searching');
    statusRef.current = 'searching';
    setHoldProgress(0);
    holdStartTimeRef.current = null;
    setValidationError(null);
    captureLockRef.current = false; 
  };

  const onResults = useCallback((results: any) => {
    if (!isMountedRef.current) return;
    if (statusRef.current === 'capturing' || statusRef.current === 'review' || captureLockRef.current) return;
    
    if (!isModelLoadedRef.current) {
        isModelLoadedRef.current = true;
        setIsModelLoaded(true);
    }

    const t = translations[lang].scannerSteps.guidance;
    const step = SCAN_STEPS[currentStepIndexRef.current];
    if (!step.useAI) return; 

    const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
    
    if (!hasFace) {
      if (statusRef.current !== 'searching') setStatus('searching');
      setHoldProgress(0);
      holdStartTimeRef.current = null;
      lastLandmarksRef.current = null;
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    lastLandmarksRef.current = landmarks;

    const nose = landmarks[1];
    const leftCheek = landmarks[234];
    const rightCheek = landmarks[454];
    const midEyes = { x: (landmarks[33].x + landmarks[263].x) / 2, y: (landmarks[33].y + landmarks[263].y) / 2 };
    
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    const yaw = -( (nose.x - midEyes.x) / faceWidth) * 220;
    const faceHeight = Math.abs(landmarks[152].y - landmarks[10].y);
    const pitch = (( (nose.y - midEyes.y) / faceHeight) - 0.35) * 180; 

    const { target } = step;
    const diffYaw = yaw - target.yaw;
    const diffPitch = pitch - target.pitch;
    const yawTol = target.yawTolerance || 20;
    const pitchTol = target.pitchTolerance || 20;

    const isYawGood = Math.abs(diffYaw) < yawTol;
    const isPitchGood = Math.abs(diffPitch) < pitchTol;

    let newGuidance: { text: string, type: 'up'|'down'|'left'|'right'|null } = { text: '', type: null };
    const isMirrored = facingMode === 'user';

    if (!isYawGood) {
        if (diffYaw > 0) {
            newGuidance = { text: t.turnLeft, type: isMirrored ? 'left' : 'right' }; 
        } else {
            newGuidance = { text: t.turnRight, type: isMirrored ? 'right' : 'left' };
        }
    } else if (!isPitchGood) {
        if (diffPitch > 0) newGuidance = { text: t.chinUp, type: 'up' }; 
        else newGuidance = { text: t.chinDown, type: 'down' }; 
    }
    
    if (newGuidance.text !== lastGuidanceTextRef.current) {
        setGuidance(newGuidance);
        lastGuidanceTextRef.current = newGuidance.text;
    }

    if (isYawGood && isPitchGood) {
      if (statusRef.current !== 'holding') setStatus('holding');
      const now = Date.now();
      if (!holdStartTimeRef.current) holdStartTimeRef.current = now;
      const elapsed = now - holdStartTimeRef.current;
      const progress = Math.min((elapsed / 1200) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) handleCapture();
    } else {
      if (statusRef.current !== 'aligning') setStatus('aligning');
      setHoldProgress(0);
      holdStartTimeRef.current = null;
    }
  }, [handleCapture, SCAN_STEPS, facingMode, lang]);

  const onResultsRef = useRef(onResults);
  useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

  useEffect(() => {
    isMountedRef.current = true;
    if (window.speechSynthesis) window.speechSynthesis.getVoices();

    try {
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => `/mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
      faceMesh.onResults((results: any) => {
        if (isMountedRef.current && onResultsRef.current) {
          onResultsRef.current(results);
        }
      });
      faceMeshRef.current = faceMesh;
    } catch (err) {
      console.error("Failed to load FaceMesh", err);
      setModelError("AI Model failed to initialize. Please refresh the page.");
    }

    return () => {
      isMountedRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      const fm = faceMeshRef.current;
      if (fm) try { fm.close(); } catch (e) {}
      window.speechSynthesis.cancel();
      stopCountdown();
    };
  }, [stopCountdown]);

  useEffect(() => {
    const startCamera = async () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: facingMode }
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMountedRef.current) {
              videoRef.current?.play();
              const track = stream.getVideoTracks()[0];
              try {
                  const caps = track.getCapabilities() as any;
                  setHasTorch(!!caps.torch);
                  if (!caps.torch) setFlashEnabled(false);
              } catch(e) {}

              const step = SCAN_STEPS[currentStepIndex];
              if (step.zoom) applyZoom(step.zoom); else applyZoom(1.0);

              const process = async () => {
                if (!isMountedRef.current) return;

                if (!faceMeshRef.current) {
                    rafIdRef.current = requestAnimationFrame(process);
                    return;
                }
                if (processingRef.current) {
                    rafIdRef.current = requestAnimationFrame(process);
                    return;
                }
                if (videoRef.current && videoRef.current.readyState >= 2) {
                    processingRef.current = true;
                    try {
                        if (!captureLockRef.current && faceMeshRef.current && isMountedRef.current) {
                            await faceMeshRef.current.send({ image: videoRef.current });
                        }
                    } catch (e) {
                    } finally {
                        processingRef.current = false;
                    }
                }
                if (isMountedRef.current) rafIdRef.current = requestAnimationFrame(process);
              };
              rafIdRef.current = requestAnimationFrame(process);
            }
          };
        }
      } catch (err) {
        setCameraError("Camera access denied.");
      }
    };
    if (isMountedRef.current) startCamera();
  }, [facingMode]);

  useEffect(() => {
    const step = SCAN_STEPS[currentStepIndex];
    if (videoRef.current?.srcObject) {
      if (step.zoom) {
        applyZoom(step.zoom);
      } else {
        applyZoom(1.0);
      }
    }
  }, [currentStepIndex, SCAN_STEPS]); 

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * holdProgress) / 100;
  const currentStep = SCAN_STEPS[currentStepIndex] || SCAN_STEPS[0];
  const getQualityColor = (s: number) => s >= 90 ? 'text-teal-600' : s >= 80 ? 'text-green-600' : 'text-amber-600';
  const getQualityLabel = (s: number) => s >= 90 ? 'Excellent' : s >= 80 ? 'Good' : 'Acceptable';

  return (
    <div className="absolute inset-0 z-0 bg-[#F7F8FA] flex flex-col text-[#0E1A2B] overflow-hidden font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          ref={videoRef} 
          className={`w-full h-full object-cover transition-transform ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
          playsInline 
          muted 
          style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }} 
        />
        <div className="absolute inset-0 z-10 bg-black" style={{ maskImage: 'radial-gradient(circle at center, transparent 45%, black 100%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 45%, black 100%)', opacity: 0.5 }} />
      </div>

      <AnimatePresence>
        {status === 'review' && tempPhoto && (
            <motion.div {...{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } } as any} className="absolute inset-0 z-[100] bg-[#F7F8FA]/95 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm space-y-6">
                    <h3 className="text-xl font-black uppercase text-center tracking-widest text-[#0E1A2B]">Validate Capture</h3>
                    <div className="aspect-square rounded-[2.5rem] overflow-hidden border-2 border-slate-200 relative shadow-2xl bg-white">
                        <img src={tempPhoto} className="w-full h-full object-cover" alt="Review" />
                        <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase ${getQualityColor(currentQualityScore)} backdrop-blur-md shadow-sm`}>
                           Quality: {getQualityLabel(currentQualityScore)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex gap-4">
                            <button onClick={retakePhoto} className="flex-1 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0E1A2B] font-black uppercase text-xs tracking-widest transition-all">Improve</button>
                            <button onClick={confirmPhoto} className="flex-1 py-4 rounded-2xl bg-[#0E1A2B] text-white hover:bg-teal-600 font-black uppercase text-xs tracking-widest transition-all shadow-xl">Confirm</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <motion.div
          ref={overlayRef}
          {...{
            animate: {
                borderColor: validationError ? '#ef4444' : status === 'holding' ? '#14B8A6' : status === 'out-of-bounds' ? '#ef4444' : status === 'aligning' ? '#fbbf24' : 'rgba(255,255,255,0.8)',
                scale: status === 'holding' ? 1.02 : 1,
                borderWidth: status === 'holding' ? 4 : status === 'out-of-bounds' || validationError ? 4 : status === 'aligning' ? 3 : 2,
                boxShadow: validationError ? '0 0 30px rgba(239,68,68,0.5)' : status === 'holding' ? '0 0 60px rgba(20,184,166,0.3)' : status === 'aligning' ? '0 0 40px rgba(251,191,36,0.3)' : 'none',
                borderRadius: currentStep.guideType === 'circle' ? '50%' : '3.5rem'
            }
          } as any}
          className={`w-[90vmin] max-w-[650px] aspect-square relative z-20 ${currentStep.guideType === 'circle' ? 'rounded-full' : 'rounded-[3.5rem]'}`}
        >
          {currentStep.guideType === 'circle' && (
              <div className={`absolute inset-0 border-2 rounded-full scale-50 animate-pulse ${status === 'holding' ? 'border-teal-500' : status === 'aligning' ? 'border-yellow-400' : 'border-white/40'}`} />
          )}
          <AnimatePresence>
            {validationError && (
                 <motion.div {...{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 } } as any} className="absolute -top-16 left-0 right-0 flex justify-center">
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-2 shadow-xl border border-red-100">
                        <AlertTriangle size={16} /> {validationError}
                    </div>
                 </motion.div>
            )}
          </AnimatePresence>
          {status === 'out-of-bounds' && (
             <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <motion.div {...{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } } as any} className="bg-red-500 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg">
                   <Maximize size={14} /> {translations[lang].scannerSteps.guidance.moveBack} / Center Face
                </motion.div>
             </div>
          )}
          {(status === 'aligning' || status === 'searching') && guidance.type && (
             <motion.div key={guidance.type} {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {guidance.type === 'left' && <motion.div {...{animate: { x: [-15, 0, -15], opacity: [0.5, 1, 0.5] }, transition: { duration: 1.5, repeat: Infinity }} as any} className="absolute left-4"><ArrowLeft className="w-16 h-16 text-yellow-400" strokeWidth={4} /></motion.div>}
                {guidance.type === 'right' && <motion.div {...{animate: { x: [15, 0, 15], opacity: [0.5, 1, 0.5] }, transition: { duration: 1.5, repeat: Infinity }} as any} className="absolute right-4"><ArrowRight className="w-16 h-16 text-yellow-400" strokeWidth={4} /></motion.div>}
                {guidance.type === 'up' && <motion.div {...{animate: { y: [-15, 0, -15], opacity: [0.5, 1, 0.5] }, transition: { duration: 1.5, repeat: Infinity }} as any} className="absolute top-4"><ArrowUp className="w-16 h-16 text-yellow-400" strokeWidth={4} /></motion.div>}
                {guidance.type === 'down' && <motion.div {...{animate: { y: [15, 0, 15], opacity: [0.5, 1, 0.5] }, transition: { duration: 1.5, repeat: Infinity }} as any} className="absolute bottom-4"><ArrowDown className="w-16 h-16 text-yellow-400" strokeWidth={4} /></motion.div>}
             </motion.div>
          )}
          {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div key={countdown} {...{ initial: { scale: 2, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 } } as any} className="text-9xl font-black text-white drop-shadow-2xl">{countdown}</motion.div>
              </div>
          )}
        </motion.div>
      </div>

      {!isModelLoaded && !cameraError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-transparent pointer-events-none">
           <div className="p-4 bg-white/90 rounded-full backdrop-blur-xl border border-slate-200 shadow-2xl flex items-center gap-3">
               <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
               <p className="text-[10px] font-black tracking-widest uppercase text-[#0E1A2B]">{translations[lang].scannerSteps.guidance.loading}</p>
           </div>
        </div>
      )}

      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
        <div className="p-6 bg-gradient-to-b from-white/95 via-white/50 to-transparent flex justify-between items-start pointer-events-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <span className="bg-white/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-slate-200 uppercase text-slate-500">
                 Step {currentStepIndex + 1}/{SCAN_STEPS.length}
               </span>
               {status === 'holding' && (
                 <span className="text-green-600 text-[10px] font-black animate-pulse flex items-center gap-1 uppercase bg-green-100 px-2 py-1 rounded-full"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> HOLD STILL</span>
               )}
               {status === 'aligning' && currentStep.checkTexture && (
                 <span className="text-yellow-600 text-[10px] font-black flex items-center gap-1 uppercase bg-yellow-100 px-2 py-1 rounded-full">FOCUSING...</span>
               )}
            </div>
            <h2 className="text-xl font-black tracking-tight drop-shadow-sm uppercase text-[#0E1A2B]">{currentStep.label}</h2>
          </div>
          <div className="flex items-center gap-2">
             {import.meta.env.DEV && (
                 <button onClick={handleTestSkip} className="p-3 bg-white/80 hover:bg-teal-50 rounded-2xl transition-all backdrop-blur-xl border border-slate-200 text-xs font-bold text-teal-600 shadow-sm"><FastForward className="w-5 h-5" /></button>
             )}
             <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-3 bg-white/80 hover:bg-slate-50 rounded-2xl transition-all backdrop-blur-xl border border-slate-200 shadow-sm">
                {audioEnabled ? <Volume2 className="w-5 h-5 text-[#0E1A2B]" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>
            <button onClick={onExit} className="p-3 bg-white/80 hover:bg-red-50 rounded-2xl transition-all backdrop-blur-xl border border-slate-200 shadow-sm text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {modelError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F7F8FA]/95 z-50 p-10 pointer-events-auto text-center">
              <div className="space-y-6">
                 <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                 <h3 className="text-2xl font-black uppercase tracking-tight text-[#0E1A2B]">AI Model Error</h3>
                 <p className="text-slate-500 font-medium">{modelError}</p>
                 <div className="flex gap-3 justify-center">
                   <button onClick={() => window.location.reload()} className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-teal-700 transition-colors">Retry</button>
                   <button onClick={onExit} className="bg-[#0E1A2B] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-colors">Exit</button>
                 </div>
              </div>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F7F8FA]/95 z-50 p-10 pointer-events-auto text-center">
              <div className="space-y-6">
                 <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                 <h3 className="text-2xl font-black uppercase tracking-tight text-[#0E1A2B]">Camera Error</h3>
                 <p className="text-slate-500 font-medium">{cameraError}</p>
                 <button onClick={onExit} className="bg-[#0E1A2B] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-colors">Exit</button>
              </div>
          </div>
        )}

        <div className="p-8 pb-12 bg-gradient-to-t from-white/95 via-white/50 to-transparent flex flex-col items-center pointer-events-auto">
          <div className="mb-10 text-center bg-white/80 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-sm w-full transition-all duration-300">
            <h3 className="text-base font-bold leading-tight uppercase tracking-tight text-[#0E1A2B]">
                {status === 'holding' ? translations[lang].scannerSteps.guidance.perfect : status === 'out-of-bounds' ? translations[lang].scannerSteps.guidance.moveBack : status === 'aligning' && guidance.text ? guidance.text : currentStep.instruction}
            </h3>
            {currentStep.subInstruction && <p className="text-slate-500 text-xs font-medium mt-1">{currentStep.subInstruction}</p>}
            {status === 'aligning' && currentStep.useAI && !guidance.text && (
                <motion.p {...{ initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } } as any} className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-2">
                    {translations[lang].scannerSteps.guidance.adjustAngle}
                </motion.p>
            )}
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center">
            {(currentStep.useAI || currentStep.checkTexture) ? (
                <>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                    <motion.circle cx="50" cy="50" r={radius} fill="none" stroke={status === 'holding' ? '#14B8A6' : status === 'aligning' ? '#fbbf24' : 'rgba(0,0,0,0.1)'} strokeWidth="6" strokeDasharray={circumference} {...{ animate: { strokeDashoffset: dashOffset }, transition: { type: 'tween', ease: 'linear', duration: 0.1 } } as any} strokeLinecap="round" />
                    </svg>
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'holding' ? 'bg-white shadow-[0_0_30px_rgba(20,184,166,0.3)] scale-110 border border-teal-100' : status === 'out-of-bounds' ? 'bg-red-50 border border-red-100' : 'bg-white border border-slate-100'}`}>
                    {status === 'capturing' ? <RefreshCw className="w-6 h-6 animate-spin text-[#0E1A2B]" /> : status === 'holding' ? <Timer className="w-6 h-6 text-teal-600 animate-pulse" /> : <CameraIcon className={`w-6 h-6 ${status === 'out-of-bounds' ? 'text-red-500' : 'text-slate-400'}`} />}
                    </div>
                </>
            ) : (
                <button onClick={startCountdownCapture} disabled={countdown !== null} className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.05)] flex items-center justify-center active:scale-95 transition-all text-[#0E1A2B]">
                    {countdown !== null ? <span className="text-2xl font-black">{countdown}</span> : <Scan className="w-8 h-8" />}
                </button>
            )}
          </div>

          <div className="absolute bottom-12 left-6 right-6 flex items-center justify-between pointer-events-auto">
             {hasTorch ? (
                 <button onClick={toggleManualFlash} className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${flashEnabled ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-white/80 border-slate-200 hover:bg-white'}`}>
                    {flashEnabled ? <Zap className="w-5 h-5 text-yellow-500" /> : <ZapOff className="w-5 h-5 text-slate-400" />}
                 </button>
             ) : (<div className="w-14" />)}

             <div className="flex items-center gap-3">
                <button onClick={() => setShowSettings(!showSettings)} className="p-4 rounded-2xl bg-white/80 hover:bg-white transition-colors border border-slate-200 backdrop-blur-md shadow-sm">
                    <SlidersHorizontal className="w-5 h-5 text-slate-500" />
                </button>
                <button onClick={toggleCamera} className="p-4 rounded-2xl bg-white/80 hover:bg-white transition-colors border border-slate-200 backdrop-blur-md shadow-sm">
                    <SwitchCamera className="w-5 h-5 text-slate-500" />
                </button>
             </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div {...{ initial: { opacity: 0, y: 20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 20, scale: 0.95 } } as any} className="absolute bottom-32 left-6 right-6 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="space-y-6">
                  <RangeControl icon={Sun} label="Exposure" value={brightness} onChange={setBrightness} />
                  <RangeControl icon={Sparkles} label="Contrast" value={contrast} onChange={setContrast} />
                  {currentStep.zoom && (
                      <div className="flex items-center gap-3 w-full bg-slate-50 p-2 rounded-lg backdrop-blur-sm border border-slate-100">
                        <ZoomIn className="w-4 h-4 text-slate-500" />
                        <div className="text-[10px] text-teal-600 uppercase font-medium">Digital Zoom Active ({zoomLevel}x)</div>
                      </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ScannerScreen;