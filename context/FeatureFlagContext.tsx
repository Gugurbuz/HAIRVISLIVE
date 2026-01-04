import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface FeatureFlagContextType {
  flags: Record<string, FeatureFlag>;
  isLoading: boolean;
  isEnabled: (key: string) => boolean;
  getConfig: (key: string) => Record<string, any>;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadFlags = async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_feature_flags');

      if (error) {
        console.error('Error loading feature flags:', error);
        setFlags({});
        return;
      }

      setFlags(data || {});
    } catch (error) {
      console.error('Error loading feature flags:', error);
      setFlags({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();

    const channel = supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => {
          loadFlags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isEnabled = (key: string): boolean => {
    return flags[key]?.enabled ?? false;
  };

  const getConfig = (key: string): Record<string, any> => {
    return flags[key]?.config ?? {};
  };

  const refreshFlags = async () => {
    setIsLoading(true);
    await loadFlags();
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        isLoading,
        isEnabled,
        getConfig,
        refreshFlags
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}

export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}
