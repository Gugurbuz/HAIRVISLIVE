/**
 * Environment-Aware CORS Configuration
 *
 * Provides production-safe CORS headers that restrict origins
 * based on environment (development vs production).
 */

const PRODUCTION_ORIGINS = [
  'https://bbtaaoononqrqctglktc.supabase.co',
  'https://hairvis.app',
  'https://www.hairvis.app',
];

const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Client-Info',
  'Apikey',
  'X-Anonymous-Id',
];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

/**
 * Determine if running in production
 */
function isProduction(): boolean {
  const env = Deno.env.get('DENO_DEPLOYMENT_ID');
  return !!env;
}

/**
 * Get CORS headers based on request origin
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const isProd = isProduction();

  let allowedOrigin = '*';

  if (isProd) {
    if (PRODUCTION_ORIGINS.includes(origin)) {
      allowedOrigin = origin;
    } else {
      allowedOrigin = PRODUCTION_ORIGINS[0];
    }
  } else {
    if (origin) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(request: Request): Response {
  const corsHeaders = getCorsHeaders(request);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: Response, request: Request): Response {
  const corsHeaders = getCorsHeaders(request);
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Validate origin for production security
 */
export function isAllowedOrigin(origin: string): boolean {
  const isProd = isProduction();

  if (!isProd) {
    return true;
  }

  return PRODUCTION_ORIGINS.includes(origin);
}
