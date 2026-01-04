
import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, LayoutDashboard, Menu, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { translations, LanguageCode } from '../translations';
import { AppState } from '../types';

interface HeaderProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
}

export const Header: React.FC<HeaderProps> = ({ appState, setAppState, lang, setLang }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations[lang];

  // Close menus when app state changes (Navigation)
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowLangMenu(false);
  }, [appState]);

  // View Logic
  const isSimulationMode = ['SELECT_TYPE', 'PRE_SCAN', 'SCAN', 'AUTH_GATE', 'ANALYZE', 'RESULT'].includes(appState);
  const isDarkHeader = ['PARTNER_PORTAL', 'CLINIC_DETAILS'].includes(appState);
  const hideMainHeader = ['CLINIC_LANDING', 'PARTNER_JOIN', 'SCAN', 'PATIENT_PORTAL', 'BLOG'].includes(appState);
  const transparentHeaderPages = ['PARTNER_PORTAL', 'CLINIC_DETAILS'];

  if (hideMainHeader) return null;

  return (
    <>
      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl flex flex-col"
          >
            {/* Mobile Header */}
            <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-teal-500 text-white shadow-teal-500/30`}>
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

            {/* Mobile Menu Items */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {!isSimulationMode ? (
                  <>
                    <MobileNavItem onClick={() => setAppState('LANDING')} label="Home" />
                    <MobileNavItem onClick={() => setAppState('DIRECTORY')} label="Centers of Excellence" />
                    <MobileNavItem onClick={() => setAppState('BLOG')} label="Knowledge Hub" />
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
                        <div className={`flex items-center gap-3 ${(appState === 'ANALYZE' || appState === 'AUTH_GATE') ? 'text-teal-600' : 'text-slate-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${(appState === 'ANALYZE' || appState === 'AUTH_GATE') ? 'bg-teal-500' : 'bg-slate-300'}`} />
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

                 <p className="text-[10px] text-slate-400 font-medium text-center pt-2">
                   © 2025 HairVis Inc. Medical AI.
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-10 py-6 md:py-8 flex items-center justify-between transition-all duration-700 ${transparentHeaderPages.includes(appState) ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-slate-100'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setAppState('LANDING')}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all bg-teal-500 text-white shadow-teal-500/30`}>
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
                    <button onClick={() => setAppState('PATIENT_PORTAL')}><NavItem active={false} label="My Preview" isDark={isDarkHeader} /></button>
                    <button onClick={() => setAppState('BLOG')}>
                      <NavItem 
                        active={appState === 'BLOG'} 
                        label="Knowledge Hub" 
                        isDark={isDarkHeader} 
                      />
                    </button>
                    <button onClick={() => setAppState('DIRECTORY')}>
                      <NavItem
                        active={appState === 'DIRECTORY'}
                        label="Centers of Excellence"
                        subLabel="Find Clinics Now"
                        isDark={isDarkHeader}
                      />
                    </button>
                    <button onClick={() => setAppState('MONITORING')}>
                      <NavItem
                        active={appState === 'MONITORING'}
                        label="AI Monitoring"
                        isDark={isDarkHeader}
                      />
                    </button>
                </>
            ) : (
                <>
                    <NavItem active={appState === 'PRE_SCAN' || appState === 'SCAN'} label={t.navCapture} isDark={isDarkHeader} />
                    <NavItem active={appState === 'ANALYZE' || appState === 'AUTH_GATE'} label={t.navAnalysis} isDark={isDarkHeader} />
                    <NavItem active={appState === 'RESULT'} label={t.navReport} isDark={isDarkHeader} />
                </>
            )}
          </div>

          <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setShowLangMenu(!showLangMenu)} className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-xl text-[10px] font-bold transition-all shadow-sm ${isDarkHeader ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white/5 border-slate-200 text-slate-600 hover:bg-white'}`}>
                  <Globe className="w-3.5 h-3.5" /> {lang} <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                </button>
                {showLangMenu && (
                  <div className="absolute top-full mt-2 right-0 w-32 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                    {(['EN', 'TR', 'DE', 'FR', 'PL', 'AR'] as LanguageCode[]).map(l => (
                      <button key={l} onClick={() => { setLang(l); setShowLangMenu(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-slate-5 transition-colors ${lang === l ? 'text-teal-600 bg-teal-50/50' : 'text-slate-600'}`}>
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
    </>
  );
};

const NavItem = ({ active, label, icon, isDark, subLabel }: any) => (
  <div className="flex items-center gap-3 group cursor-pointer text-left relative h-full">
    {icon}
    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 shrink-0 ${active ? 'bg-teal-500 animate-pulse scale-150' : (isDark ? 'bg-slate-500 group-hover:bg-slate-300' : 'bg-slate-300 group-hover:bg-slate-400')}`} />
    <div className="flex flex-col justify-center relative">
        <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 leading-none ${active ? (isDark ? 'text-white' : 'text-[#0E1A2B]') : (isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-[#0E1A2B]')}`}>
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
    <span className="text-lg font-bold text-[#0E1A2B] tracking-tight text-left group-hover:text-teal-600 transition-colors">
      {label}
    </span>
    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-sm">
      <ArrowRight size={18} />
    </div>
  </button>
);
