import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface SessionContextType {
  sessionId: string | null;
  startSession: () => Promise<string>;
  updateActivity: () => Promise<void>;
  endSession: () => Promise<void>;
  logAnalysis: (params: {
    operationType: string;
    inputData: any;
    outputData?: any;
    imageUrls?: string[];
    durationMs?: number;
    error?: string;
  }) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getOrCreateAnonymousId(): string {
  const stored = localStorage.getItem('hairvis_anonymous_id');
  if (stored) return stored;

  const newId = generateAnonymousId();
  localStorage.setItem('hairvis_anonymous_id', newId);
  return newId;
}

function getBrowserMetadata() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer,
    entryUrl: window.location.href
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startSession = async (): Promise<string> => {
    if (sessionId) return sessionId;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = getOrCreateAnonymousId();

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user?.id || null,
          anonymous_id: anonymousId,
          metadata: getBrowserMetadata()
        })
        .select('id')
        .single();

      if (error) throw error;

      const newSessionId = data.id;
      setSessionId(newSessionId);
      localStorage.setItem('hairvis_session_id', newSessionId);
      return newSessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      const fallbackId = `fallback_${Date.now()}`;
      setSessionId(fallbackId);
      return fallbackId;
    }
  };

  const updateActivity = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      setSessionId(null);
      localStorage.removeItem('hairvis_session_id');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const logAnalysis = async (params: {
    operationType: string;
    inputData: any;
    outputData?: any;
    imageUrls?: string[];
    durationMs?: number;
    error?: string;
  }) => {
    const currentSessionId = sessionId || await startSession();

    try {
      const { data: flagsData } = await supabase.rpc('get_active_feature_flags');

      await supabase.from('analysis_logs').insert({
        session_id: currentSessionId,
        operation_type: params.operationType,
        input_data: params.inputData,
        output_data: params.outputData || null,
        image_urls: params.imageUrls || [],
        feature_flags: flagsData || {},
        duration_ms: params.durationMs || null,
        error: params.error || null
      });

      await updateActivity();
    } catch (error) {
      console.error('Error logging analysis:', error);
    }
  };

  useEffect(() => {
    const storedSessionId = localStorage.getItem('hairvis_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      startSession();
    }

    const activityInterval = setInterval(updateActivity, 30000);

    const handleBeforeUnload = () => {
      if (sessionId) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`,
          JSON.stringify({ ended_at: new Date().toISOString() })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        startSession,
        updateActivity,
        endSession,
        logAnalysis
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
