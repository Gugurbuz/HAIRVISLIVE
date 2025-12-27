
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Check, ChevronRight, Sparkles, BrainCircuit, ScanFace, Zap, 
  ShieldCheck, Mail, Phone, SkipForward, X, Lock, Globe, MapPin, Pill, Star
} from 'lucide-react';
import { LanguageCode } from '../translations';

interface AnalysisChatProps {
  onComplete: (data: any) => void;
  lang: LanguageCode;
}

type ChatStep = 
  | 'INIT' 
  // Layer A: Calibration (Mandatory)
  | 'Q_AGE'
  | 'Q_GENDER'
  | 'Q_GOAL'
  | 'Q_HISTORY'
  | 'Q_EXPECTATION'
  // Layer B: Optimization (High Value, Optional)
  | 'LAYER_B_INTRO'
  | 'Q_TIMELINE'
  | 'Q_BUDGET'
  | 'Q_LOCATION'
  | 'Q_MEDS'
  // Layer C: Monetization (Consent)
  | 'Q_CONSENT'
  | 'PROCESSING' 
  | 'COMPLETE';

const AnalysisChatScreen: React.FC<AnalysisChatProps> = ({ onComplete, lang }) => {
  const [messages, setMessages] = useState<Array<{id: number, text: string | React.ReactNode, sender: 'ai' | 'user'}>>([]);
  const [step, setStep] = useState<ChatStep>('INIT');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Consent Form State
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [contactValue, setContactValue] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Data State
  const [answers, setAnswers] = useState({
    ageRange: '',
    gender: 'Male',
    previousTransplant: 'No',
    goal: 'Hairline',
    expectation: '',
    timeline: '',
    budget: '',
    location: '',
    meds: '',
    contact: '',
    consent: false
  });

  const getProgress = () => {
    switch(step) {
        case 'INIT': return 5;
        case 'Q_AGE': return 10;
        case 'Q_GENDER': return 18;
        case 'Q_GOAL': return 26;
        case 'Q_HISTORY': return 34;
        case 'Q_EXPECTATION': return 42;
        case 'LAYER_B_INTRO': return 50;
        case 'Q_TIMELINE': return 58;
        case 'Q_BUDGET': return 66;
        case 'Q_LOCATION': return 74;
        case 'Q_MEDS': return 82;
        case 'Q_CONSENT': return 90;
        case 'PROCESSING': return 98;
        case 'COMPLETE': return 100;
        default: return 0;
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, step, contactMethod]);

  // --- ORCHESTRATOR ---
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Start Flow
    if (step === 'INIT') {
      addAiMessage("Analyzing scalp topography...", 400);
      setTimeout(() => {
         addAiMessage("Visual patterns mapped. To calibrate the simulation age-appropriately, what is your age range?", 1000, () => setStep('Q_AGE'));
      }, 1500);
    }
  }, []);

  const addAiMessage = (text: string | React.ReactNode, delay: number = 0, callback?: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), text, sender: 'ai' }]);
      if (callback) callback();
    }, delay + 600);
  };

  const handleResponse = (key: string, value: string, nextStep: ChatStep, nextAiMsg?: string, isSkip: boolean = false) => {
    // 1. Visual Feedback
    if (!isSkip) setSelectedOption(value);

    // 2. State Update & Transition
    setTimeout(() => {
        // Add User Message (Visual only)
        const displayValue = isSkip ? "Skip" : value;
        setMessages(prev => [...prev, { id: Date.now(), text: displayValue, sender: 'user' }]);
        
        setAnswers(prev => ({ ...prev, [key]: value }));
        setSelectedOption(null);

        // Special Transition for Layer B Intro
        if (nextStep === 'LAYER_B_INTRO') {
            setStep('PROCESSING'); // Show quick loader
            setTimeout(() => {
                addAiMessage("Calibration complete.", 0);
                addAiMessage("Now optimizing for clinic matching (Optional). When are you looking to start?", 800, () => setStep('Q_TIMELINE'));
            }, 1000);
        } 
        else if (nextAiMsg) {
            setStep('PROCESSING'); // Temporary hold
            addAiMessage(nextAiMsg, 600, () => setStep(nextStep));
        } else {
            setStep(nextStep);
        }
    }, 400);
  };

  const handleConsentSubmit = () => {
      if (!contactMethod || !contactValue || !consentGiven) return;
      
      setMessages(prev => [...prev, { id: Date.now(), text: `Notify via ${contactMethod}`, sender: 'user' }]);
      setAnswers(prev => ({ ...prev, contact: contactValue, consent: true }));
      finishFlow();
  };

  const handleConsentSkip = () => {
      setMessages(prev => [...prev, { id: Date.now(), text: "Just the report, please.", sender: 'user' }]);
      finishFlow();
  };

  const finishFlow = () => {
      setStep('PROCESSING');
      addAiMessage("Generating your secure report...", 800, () => {
          setStep('COMPLETE');
          setTimeout(() => onComplete(answers), 1500);
      });
  };

  return (
    <div className="w-full max-w-md relative flex flex-col h-[650px] font-sans mx-auto">
      
      {/* 1. Glass Container & Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
         <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-teal-400/20 rounded-full blur-[80px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-indigo-400/10 rounded-full blur-[60px]" />
      </div>

      {/* 2. Main Content Card */}
      <div className="relative z-10 flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[2.5rem] m-2 border border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] overflow-hidden">
         
         {/* Header */}
         <div className="px-6 py-5 border-b border-white/30 flex items-center justify-between bg-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 relative">
                  <BrainCircuit className="w-5 h-5 text-teal-600" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
               </div>
               <div>
                  <h3 className="text-slate-800 font-bold text-sm tracking-tight">HairVis AI</h3>
                  <div className="flex items-center gap-1.5">
                     <span className="w-1 h-1 bg-teal-500 rounded-full" />
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        {step.startsWith('Q_CONSENT') ? 'Finalizing' : 'Calibrating'}
                     </p>
                  </div>
               </div>
            </div>
            
            {/* Completeness Meter */}
            <div className="flex flex-col items-end w-16">
               <div className="text-[9px] font-black text-teal-600 mb-1">{getProgress()}%</div>
               <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${getProgress()}%` }} 
                    className="h-full bg-teal-500 rounded-full"
                  />
               </div>
            </div>
         </div>

         {/* Chat Stream */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
                <motion.div 
                   key={msg.id}
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm backdrop-blur-sm ${
                        msg.sender === 'user' 
                        ? 'bg-[#0E1A2B] text-white rounded-br-none shadow-lg shadow-slate-900/10' 
                        : 'bg-white/80 text-slate-600 border border-white rounded-bl-none shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </motion.div>
            ))}
            
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white/50 border border-white/40 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center backdrop-blur-sm">
                        <Sparkles size={14} className="text-teal-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Processing</span>
                    </div>
                </div>
            )}
            
            {/* --- LAYER C: CONSENT UI BLOCK --- */}
            {step === 'Q_CONSENT' && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 border border-teal-100 p-5 rounded-2xl shadow-xl space-y-4"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0E1A2B] text-sm">Unlock Clinical Quotes?</h4>
                            <p className="text-[10px] text-slate-500">We can match this report with top-rated clinics.</p>
                        </div>
                    </div>

                    {!contactMethod ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setContactMethod('email')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all bg-white"
                            >
                                <Mail size={18} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-700">Email Me</span>
                            </button>
                            <button 
                                onClick={() => setContactMethod('whatsapp')}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all bg-white"
                            >
                                <Phone size={18} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-700">WhatsApp</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="relative">
                                <input 
                                    type={contactMethod === 'email' ? 'email' : 'tel'} 
                                    placeholder={contactMethod === 'email' ? 'your@email.com' : '+1 234...'}
                                    value={contactValue}
                                    onChange={(e) => setContactValue(e.target.value)}
                                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-teal-500 outline-none"
                                    autoFocus
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {contactMethod === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                                </div>
                            </div>
                            
                            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consentGiven ? 'bg-teal-500 border-teal-500' : 'bg-white border-slate-300'}`}>
                                    {consentGiven && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={consentGiven} onChange={() => setConsentGiven(!consentGiven)} />
                                <span className="text-[10px] text-slate-500 leading-tight">
                                    I agree to share my anonymous report data with selected partner clinics to receive quotes.
                                </span>
                            </label>

                            <button 
                                onClick={handleConsentSubmit}
                                disabled={!contactValue || !consentGiven}
                                className="w-full py-3 bg-[#0E1A2B] text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-600 transition-colors shadow-lg"
                            >
                                Get Quotes
                            </button>
                        </div>
                    )}

                    {!contactMethod && (
                        <button onClick={handleConsentSkip} className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600">
                            No thanks, just view report
                        </button>
                    )}
                    {contactMethod && (
                        <button onClick={() => setContactMethod(null)} className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600">
                            Back
                        </button>
                    )}
                </motion.div>
            )}

            <div ref={messagesEndRef} />
         </div>

         {/* Input Area (Dynamic) */}
         <div className="p-4 border-t border-white/30 bg-white/20 backdrop-blur-md min-h-[160px] flex flex-col justify-end">
            <AnimatePresence mode="wait">
               
               {/* LAYER A: AGE */}
               {step === 'Q_AGE' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-1">Select Age Range</p>
                       <div className="grid grid-cols-2 gap-2">
                           {['18-25', '26-35', '36-45', '46+'].map(opt => (
                               <OptionButton key={opt} label={opt} onClick={() => handleResponse('ageRange', opt, 'Q_GENDER')} selected={selectedOption === opt} disabled={selectedOption !== null} centered />
                           ))}
                       </div>
                   </motion.div>
               )}

               {/* LAYER A: GENDER */}
               {step === 'Q_GENDER' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-1">Biological Sex (Affects Pattern)</p>
                       <div className="grid grid-cols-2 gap-2">
                           <OptionButton label="Male" onClick={() => handleResponse('gender', 'Male', 'Q_GOAL')} selected={selectedOption === 'Male'} disabled={selectedOption !== null} centered />
                           <OptionButton label="Female" onClick={() => handleResponse('gender', 'Female', 'Q_GOAL')} selected={selectedOption === 'Female'} disabled={selectedOption !== null} centered />
                       </div>
                   </motion.div>
               )}

               {/* LAYER A: GOAL */}
               {step === 'Q_GOAL' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-1">Primary Goal</p>
                       <OptionButton label="Restore Frontal Hairline" icon={<ChevronRight size={16} />} onClick={() => handleResponse('goal', 'Frontal', 'Q_HISTORY')} selected={selectedOption === 'Frontal'} disabled={selectedOption !== null} />
                       <OptionButton label="Fill Crown / Vertex" icon={<ChevronRight size={16} />} onClick={() => handleResponse('goal', 'Crown', 'Q_HISTORY')} selected={selectedOption === 'Crown'} disabled={selectedOption !== null} />
                       <OptionButton label="Both Areas" icon={<ChevronRight size={16} />} onClick={() => handleResponse('goal', 'Both', 'Q_HISTORY')} selected={selectedOption === 'Both'} disabled={selectedOption !== null} />
                   </motion.div>
               )}

               {/* LAYER A: HISTORY */}
               {step === 'Q_HISTORY' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-1">Previous Procedures?</p>
                       <div className="grid grid-cols-2 gap-2">
                           <OptionButton label="No, First Time" onClick={() => handleResponse('previousTransplant', 'No', 'Q_EXPECTATION')} selected={selectedOption === 'No'} disabled={selectedOption !== null} centered />
                           <OptionButton label="Yes, I have" onClick={() => handleResponse('previousTransplant', 'Yes', 'Q_EXPECTATION')} selected={selectedOption === 'Yes'} disabled={selectedOption !== null} centered />
                       </div>
                   </motion.div>
               )}

               {/* LAYER A: EXPECTATION */}
               {step === 'Q_EXPECTATION' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center mb-1">Your Priority?</p>
                       <OptionButton label="Natural Look" icon={<Star size={14} />} onClick={() => handleResponse('expectation', 'Natural', 'LAYER_B_INTRO')} selected={selectedOption === 'Natural'} disabled={selectedOption !== null} />
                       <OptionButton label="Maximum Density" icon={<Zap size={14} />} onClick={() => handleResponse('expectation', 'Density', 'LAYER_B_INTRO')} selected={selectedOption === 'Density'} disabled={selectedOption !== null} />
                       <OptionButton label="Minimal Recovery" icon={<Activity size={14} />} onClick={() => handleResponse('expectation', 'Recovery', 'LAYER_B_INTRO')} selected={selectedOption === 'Recovery'} disabled={selectedOption !== null} />
                   </motion.div>
               )}

               {/* LAYER B: TIMELINE */}
               {step === 'Q_TIMELINE' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Timeframe</p>
                           <button onClick={() => handleResponse('timeline', 'Skipped', 'Q_BUDGET', undefined, true)} className="text-[10px] text-slate-400 font-bold hover:text-teal-600 flex items-center gap-1">Skip <SkipForward size={10} /></button>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           <OptionButton label="ASAP" onClick={() => handleResponse('timeline', 'ASAP', 'Q_BUDGET')} selected={selectedOption === 'ASAP'} disabled={selectedOption !== null} centered />
                           <OptionButton label="1-3 Months" onClick={() => handleResponse('timeline', '1-3 Months', 'Q_BUDGET')} selected={selectedOption === '1-3 Months'} disabled={selectedOption !== null} centered />
                           <OptionButton label="3-6 Months" onClick={() => handleResponse('timeline', '3-6 Months', 'Q_BUDGET')} selected={selectedOption === '3-6 Months'} disabled={selectedOption !== null} centered />
                           <OptionButton label="Just Looking" onClick={() => handleResponse('timeline', 'Researching', 'Q_BUDGET')} selected={selectedOption === 'Researching'} disabled={selectedOption !== null} centered />
                       </div>
                   </motion.div>
               )}

               {/* LAYER B: BUDGET */}
               {step === 'Q_BUDGET' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Budget Tier</p>
                           <button onClick={() => handleResponse('budget', 'Skipped', 'Q_LOCATION', undefined, true)} className="text-[10px] text-slate-400 font-bold hover:text-teal-600 flex items-center gap-1">Skip <SkipForward size={10} /></button>
                       </div>
                       <OptionButton label="Economy (€1.5k - €2.5k)" onClick={() => handleResponse('budget', 'Economy', 'Q_LOCATION')} selected={selectedOption === 'Economy'} disabled={selectedOption !== null} />
                       <OptionButton label="Standard (€2.5k - €4k)" onClick={() => handleResponse('budget', 'Standard', 'Q_LOCATION')} selected={selectedOption === 'Standard'} disabled={selectedOption !== null} />
                       <OptionButton label="Premium (€4k+)" onClick={() => handleResponse('budget', 'Premium', 'Q_LOCATION')} selected={selectedOption === 'Premium'} disabled={selectedOption !== null} />
                   </motion.div>
               )}

               {/* LAYER B: LOCATION */}
               {step === 'Q_LOCATION' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Preferred Location</p>
                           <button onClick={() => handleResponse('location', 'Skipped', 'Q_MEDS', undefined, true)} className="text-[10px] text-slate-400 font-bold hover:text-teal-600 flex items-center gap-1">Skip <SkipForward size={10} /></button>
                       </div>
                       <OptionButton label="Turkey (Best Value)" icon={<Globe size={14} />} onClick={() => handleResponse('location', 'Turkey', 'Q_MEDS')} selected={selectedOption === 'Turkey'} disabled={selectedOption !== null} />
                       <OptionButton label="Europe / UK (Local)" icon={<MapPin size={14} />} onClick={() => handleResponse('location', 'Europe', 'Q_MEDS')} selected={selectedOption === 'Europe'} disabled={selectedOption !== null} />
                       <OptionButton label="No Preference" icon={<Check size={14} />} onClick={() => handleResponse('location', 'Any', 'Q_MEDS')} selected={selectedOption === 'Any'} disabled={selectedOption !== null} />
                   </motion.div>
               )}

               {/* LAYER B: MEDS */}
               {step === 'Q_MEDS' && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current Medication</p>
                           <button onClick={() => handleResponse('meds', 'Skipped', 'Q_CONSENT', undefined, true)} className="text-[10px] text-slate-400 font-bold hover:text-teal-600 flex items-center gap-1">Skip <SkipForward size={10} /></button>
                       </div>
                       <OptionButton label="None" onClick={() => handleResponse('meds', 'None', 'Q_CONSENT')} selected={selectedOption === 'None'} disabled={selectedOption !== null} />
                       <OptionButton label="Minoxidil / Finasteride" icon={<Pill size={14} />} onClick={() => handleResponse('meds', 'Meds', 'Q_CONSENT')} selected={selectedOption === 'Meds'} disabled={selectedOption !== null} />
                       <OptionButton label="Vitamins / Supplements" icon={<Sparkles size={14} />} onClick={() => handleResponse('meds', 'Vitamins', 'Q_CONSENT')} selected={selectedOption === 'Vitamins'} disabled={selectedOption !== null} />
                   </motion.div>
               )}

               {/* PROCESSING STATE */}
               {step === 'PROCESSING' && !isTyping && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full py-4 space-y-3">
                       <div className="relative">
                           <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
                           <div className="absolute inset-0 flex items-center justify-center">
                               <Zap size={16} className="text-teal-500 fill-current" />
                           </div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Computing...</p>
                   </motion.div>
               )}

               {/* COMPLETE */}
               {step === 'COMPLETE' && (
                   <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                       <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 text-white">
                           <Check size={32} strokeWidth={3} />
                       </div>
                       <div>
                           <h3 className="text-[#0E1A2B] font-black text-lg tracking-tight">Report Ready</h3>
                           <p className="text-slate-400 text-xs font-medium">Opening your dashboard...</p>
                       </div>
                   </motion.div>
               )}

            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

// Reusable Option Button
const OptionButton = ({ label, icon, onClick, centered, selected, disabled }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`
            w-full py-4 px-5 
            rounded-xl text-xs font-bold transition-all shadow-sm 
            flex items-center group active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
            ${centered ? 'justify-center text-center' : 'justify-between text-left'}
            ${selected 
                ? 'bg-teal-500 text-white border-teal-500 shadow-teal-500/30 scale-[0.99]' 
                : 'bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-[#0E1A2B] hover:shadow-md'
            }
            ${disabled && !selected ? 'opacity-50 cursor-not-allowed grayscale' : ''}
        `}
    >
        <span>{label}</span>
        {icon && !selected && <span className="text-slate-300 group-hover:text-teal-500 transition-colors">{icon}</span>}
        {selected && (
            <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
        )}
    </button>
);

export default AnalysisChatScreen;
