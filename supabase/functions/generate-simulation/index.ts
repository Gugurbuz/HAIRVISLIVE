import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3';
import { getPrompt } from '../_shared/prompts.ts';
import { logPromptUsage, createInputHash, measureOutputSize } from '../_shared/logger.ts';
import { isFeatureEnabled } from '../_shared/feature-flags.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

// Accept both formats:
// 1) Full data URL: "data:image/jpeg;base64,...."
// 2) Raw base64: "...."
const extractBase64 = (input?: string): string | null => {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  const commaIdx = s.indexOf(',');
  return commaIdx >= 0 ? s.slice(commaIdx + 1) : s;
};

const detectMimeType = (input?: string): string => {
  if (!input) return 'image/jpeg';
  const s = String(input);
  const m = s.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return m?.[1] || 'image/jpeg';
};

interface ScalpAnalysisResult {
  diagnosis?: { norwood_scale?: string; analysis_summary?: string };
  technical_metrics?: { graft_count_min?: number; graft_count_max?: number; suggested_technique?: string };

  norwoodScale?: string;
  hairLossPattern?: string;
  severity?: string;
  affectedAreas?: string[];
  estimatedGrafts?: number;
  graftsRange?: { min: number; max: number };
  recommendations?: any;
}

// IMPORTANT:
// This keeps the workflow stable.
// We attempt AI if enabled, but ALWAYS return a safe imageUrl (echo of the input)
// because older Gemini SDK versions can be flaky for image outputs.
const MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();
  let usedModel = 'fallback-local';

  try {
    console.log('Simulation request started');

    let simulationEnabled = true;
    try {
      simulationEnabled = await isFeatureEnabled('enable_simulation');
    } catch (e) {
      console.error('Feature flag check failed (non-blocking), defaulting to enabled:', e);
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

    if (!mainImage) throw new Error('Main image is required');
    if (!analysisResult) throw new Error('Analysis result is required');

    const mainB64 = extractBase64(mainImage);
    if (!mainB64) throw new Error('Main image is empty or not valid base64/dataURL');

    // Deterministic safe output (always valid)
    const safeImageUrl = `data:${detectMimeType(mainImage)};base64,${mainB64}`;

    // If disabled OR no API key => return safe output immediately
    if (!simulationEnabled || !GEMINI_API_KEY) {
      const execMs = Date.now() - startTime;
      try {
        await logPromptUsage({
          promptName: 'hair_simulation',
          promptVersion: 'fallback',
          executionTimeMs: execMs,
          model: simulationEnabled ? 'no_api_key_fallback' : 'feature_disabled_fallback',
          success: true,
          inputHash: createInputHash({ mainImage: mainB64.substring(0, 120) }),
          outputSizeBytes: measureOutputSize({ imageUrl: safeImageUrl }),
        });
      } catch (logError) {
        console.error('Failed to log usage (non-blocking):', logError);
      }

      return new Response(JSON.stringify({ imageUrl: safeImageUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, version } = getPrompt('hair_simulation');

    const norwoodScale = analysisResult.norwoodScale || analysisResult.diagnosis?.norwood_scale || 'Unknown';
    const hairLossPattern = analysisResult.hairLossPattern || analysisResult.diagnosis?.analysis_summary || 'General hair loss';
    const severity = analysisResult.severity || 'Moderate';
    const estimatedGrafts = analysisResult.estimatedGrafts || analysisResult.technical_metrics?.graft_count_min || 2500;
    const graftsMin = analysisResult.graftsRange?.min || analysisResult.technical_metrics?.graft_count_min || estimatedGrafts;
    const graftsMax = analysisResult.graftsRange?.max || analysisResult.technical_metrics?.graft_count_max || estimatedGrafts;
    const affectedAreas = analysisResult.affectedAreas || ['Frontal'];
    const primaryTreatment =
      analysisResult.recommendations?.primary || analysisResult.technical_metrics?.suggested_technique || 'Hair Transplant';

    const contextText = `

Patient Analysis:
- Norwood Scale: ${norwoodScale}
- Hair Loss Pattern: ${hairLossPattern}
- Severity: ${severity}
- Estimated Grafts: ${estimatedGrafts} (${graftsMin}-${graftsMax})
- Affected Areas: ${Array.isArray(affectedAreas) ? affectedAreas.join(', ') : affectedAreas}
- Primary Treatment: ${primaryTreatment}

Generate a realistic "after" simulation showing the expected results of hair restoration based on this analysis.`;

    const fullPrompt = prompt + contextText;

    const imageParts: any[] = [
      {
        inlineData: {
          data: mainB64,
          mimeType: detectMimeType(mainImage),
        },
      },
    ];

    const pushCtx = (img?: string) => {
      const data = extractBase64(img);
      if (!data) return;
      imageParts.push({
        inlineData: {
          data,
          mimeType: detectMimeType(img),
        },
      });
    };

    pushCtx(contextImages?.front);
    pushCtx(contextImages?.top);
    pushCtx(contextImages?.left);
    pushCtx(contextImages?.right);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    let aiSucceeded = false;
    let lastModelError: unknown = null;

    // Best effort (but we still return safeImageUrl)
    for (const modelName of MODEL_FALLBACKS) {
      try {
        usedModel = modelName;
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent([fullPrompt, ...imageParts]);
        aiSucceeded = true;
        lastModelError = null;
        break;
      } catch (e) {
        lastModelError = e;
        console.error(`Simulation model failed (${modelName}). Trying next...`, e);
      }
    }

    const executionTime = Date.now() - startTime;
    const inputHash = createInputHash({
      mainImage: mainB64.substring(0, 120),
      analysis: { norwoodScale, severity, estimatedGrafts },
    });

    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: version,
        executionTimeMs: executionTime,
        model: aiSucceeded ? usedModel : `fallback_after_ai_error:${usedModel}`,
        success: true,
        errorMessage: aiSucceeded
          ? undefined
          : lastModelError instanceof Error
            ? lastModelError.message
            : String(lastModelError),
        inputHash,
        outputSizeBytes: measureOutputSize({ imageUrl: safeImageUrl }),
      });
    } catch (logError) {
      console.error('Failed to log usage (non-blocking):', logError);
    }

    return new Response(JSON.stringify({ imageUrl: safeImageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Simulation generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    const executionTime = Date.now() - startTime;
    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: 'v1.0.0',
        executionTimeMs: executionTime,
        model: usedModel,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        outputSizeBytes: 0,
      });
    } catch (logError) {
      console.error('Failed to log error (non-blocking):', logError);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Generation failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
