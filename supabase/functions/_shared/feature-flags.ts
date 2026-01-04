import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  config: Record<string, any>;
}

let cachedFlags: Record<string, FeatureFlag> | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 60000;

export async function getFeatureFlags(): Promise<Record<string, FeatureFlag>> {
  if (cachedFlags && Date.now() < cacheExpiry) {
    return cachedFlags;
  }

  try {
    const { data, error } = await supabase.rpc('get_active_feature_flags');

    if (error) {
      console.error('Error fetching feature flags:', error);
      return cachedFlags || {};
    }

    cachedFlags = data || {};
    cacheExpiry = Date.now() + CACHE_TTL;
    return cachedFlags;
  } catch (error) {
    console.error('Failed to get feature flags:', error);
    return cachedFlags || {};
  }
}

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key]?.enabled ?? false;
}

export async function getFeatureConfig(key: string): Promise<Record<string, any>> {
  const flags = await getFeatureFlags();
  return flags[key]?.config ?? {};
}

export function refreshCache(): void {
  cachedFlags = null;
  cacheExpiry = 0;
}