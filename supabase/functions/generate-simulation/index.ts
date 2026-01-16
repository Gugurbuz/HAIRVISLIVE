import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3';
import { getPrompt } from '../_shared/prompts.ts';
import { logPromptUsage, createInputHash } from '../_shared/logger.ts';
import { getFeatureFlags, isFeatureEnabled } from '../_shared/feature-flags.ts';
import { checkRateLimit, createRateLimitResponse } from '../_shared/rate-limiter.ts';
import { getCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set');
}

interface ScalpImages {
  front?: string;
  top?: string;
  left?: string;
  right?: string;
}

interface ScalpAnalysisResult {
  norwoodScale: string;
  hairLossPattern: string;
  severity: string;
  affectedAreas: string[];
  estimatedGrafts: number;
  graftsRange: { min: number; max: number };
  confidence: number;
  recommendations: any;
  analysis: any;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  const rateLimitResult = await checkRateLimit(req, {
    endpoint: 'generate-simulation',
    maxRequests: 5,
    windowMs: 60000,
    blockDurationMs: 300000,
  });

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, corsHeaders);
  }

  const startTime = Date.now();

  try {
    const featureFlags = await getFeatureFlags();
    const simulationEnabled = await isFeatureEnabled('enable_simulation');

    if (!simulationEnabled) {
      return new Response(
        JSON.stringify({
          error: 'Simulation feature is currently disabled',
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      );
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const {
      mainImage,
      analysisResult,
      contextImages,
    }: {
      mainImage: string;
      analysisResult: ScalpAnalysisResult;
      contextImages?: Partial<ScalpImages>;
    } = await req.json();

    if (!mainImage) {
      throw new Error('Main image is required');
    }

    if (!analysisResult) {
      throw new Error('Analysis result is required');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { prompt, version } = getPrompt('hair_simulation');

    const contextText = `
Patient Analysis:
- Norwood Scale: ${analysisResult.norwoodScale}
- Hair Loss Pattern: ${analysisResult.hairLossPattern}
- Severity: ${analysisResult.severity}
- Estimated Grafts: ${analysisResult.estimatedGrafts} (${analysisResult.graftsRange.min}-${analysisResult.graftsRange.max})
- Affected Areas: ${analysisResult.affectedAreas.join(', ')}
- Primary Treatment: ${analysisResult.recommendations?.primary || 'Hair Transplant'}

Generate a realistic "after" simulation showing the expected results of hair restoration based on this analysis.`;

    const fullPrompt = prompt + contextText;

    const imageParts = [
      {
        inlineData: {
          data: mainImage.includes(',') ? mainImage.split(',')[1] : mainImage,
          mimeType: 'image/jpeg',
        },
      },
    ];

    if (contextImages?.front) {
      imageParts.push({
        inlineData: {
          data: contextImages.front.includes(',') ? contextImages.front.split(',')[1] : contextImages.front,
          mimeType: 'image/jpeg',
        },
      });
    }
    if (contextImages?.top) {
      imageParts.push({
        inlineData: {
          data: contextImages.top.includes(',') ? contextImages.top.split(',')[1] : contextImages.top,
          mimeType: 'image/jpeg',
        },
      });
    }

    const result = await model.generateContent([fullPrompt, ...imageParts]);
    const response = await result.response;
    const imageUrl = response.text();

    const executionTime = Date.now() - startTime;
    const inputHash = createInputHash({ mainImage: mainImage.substring(0, 100), analysisResult });

    await logPromptUsage({
      promptName: 'hair_simulation',
      promptVersion: version,
      executionTimeMs: executionTime,
      model: 'gemini-1.5-flash',
      success: true,
      inputHash,
      outputSizeBytes: imageUrl.length,
    });

    return new Response(JSON.stringify({ imageUrl }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      },
    });
  } catch (error) {
    console.error('Simulation generation error:', error);

    const executionTime = Date.now() - startTime;
    await logPromptUsage({
      promptName: 'hair_simulation',
      promptVersion: 'v1.0.0',
      executionTimeMs: executionTime,
      model: 'gemini-1.5-flash',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      outputSizeBytes: 0,
    });

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Generation failed',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    );
  }
});
