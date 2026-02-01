import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latencyMs?: number };
    storage: { status: string };
    geminiApi: { status: string };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: { status: 'unknown' },
      storage: { status: 'unknown' },
      geminiApi: { status: 'unknown' },
    },
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('feature_flags').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;

    if (dbError) {
      health.checks.database = { status: 'unhealthy' };
      health.status = 'degraded';
    } else {
      health.checks.database = { status: 'healthy', latencyMs: dbLatency };
    }

    const { error: storageError } = await supabase.storage.listBuckets();
    if (storageError) {
      health.checks.storage = { status: 'unhealthy' };
      health.status = 'degraded';
    } else {
      health.checks.storage = { status: 'healthy' };
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    health.checks.geminiApi = { status: geminiKey ? 'configured' : 'not_configured' };
    if (!geminiKey) {
      health.status = 'degraded';
    }

  } catch (error) {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return new Response(JSON.stringify(health), {
    status: statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
