import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3';
import { getPrompt } from '../_shared/prompts.ts';
import { validateScalpAnalysis, formatValidationErrors } from '../_shared/validation.ts';
import { logPromptUsage, logValidationError, createInputHash, measureOutputSize } from '../_shared/logger.ts';
import { getFeatureFlags, isFeatureEnabled, getFeatureConfig } from '../_shared/feature-flags.ts';

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

// Gemini model names can change across API versions.
// We try a short fallback list to avoid hard failures when Google renames models.
const MODEL_FALLBACKS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();
  let usageLogId: string | null = null;

  try {
    console.log('Analysis request started');

    let mockModeEnabled = false;
    let mockConfig: any = {};
    try {
      mockModeEnabled = await isFeatureEnabled('mock_mode');
      mockConfig = await getFeatureConfig('mock_mode');
      console.log('Feature flags checked, mock mode:', mockModeEnabled);
    } catch (flagError) {
      console.error('Feature flag check failed (non-blocking):', flagError);
    }

    if (mockModeEnabled) {
      const mockDelay = mockConfig.mock_delay_ms || 1000;
      await new Promise((resolve) => setTimeout(resolve, mockDelay));

      const mockResponse = {
        diagnosis: {
          norwood_scale: 'NW 3V',
          analysis_summary: 'Mock analysis result for testing purposes.',
          confidence: 0.85,
        },
        technical_metrics: {
          graft_count_min: 2500,
          graft_count_max: 3200,
          coverage_cm2: 45,
          density_target_grafts_cm2: 55,
          suggested_technique: 'Sapphire FUE',
          success_probability: 0.9,
        },
        zone_plan: {
          zones: [
            { zone_id: 'frontal', area_cm2: 20, target_grafts: 1500, density_grafts_cm2: 75 },
            { zone_id: 'midscalp', area_cm2: 25, target_grafts: 1200, density_grafts_cm2: 48 },
          ],
          total_grafts_planned: 2700,
        },
        donor_assessment: {
          density_rating: 'Good',
          estimated_hairs_per_cm2: 70,
          total_safe_capacity_grafts: 4500,
          donor_condition_summary: 'Adequate donor density for planned procedure.',
        },
        phenotypic_features: {
          apparent_age: 35,
          skin_tone: 'Medium',
          skin_undertone: 'Warm',
          beard_presence: 'Stubble',
          beard_texture: 'Wavy',
          eyebrow_density: 'Medium',
          eyebrow_color: 'Dark',
        },
        scalp_geometry: {
          hairline_design_polygon: [{ x: 0.2, y: 0.3 }, { x: 0.8, y: 0.3 }, { x: 0.7, y: 0.5 }, { x: 0.3, y: 0.5 }],
          high_density_zone_polygon: [{ x: 0.3, y: 0.35 }, { x: 0.7, y: 0.35 }, { x: 0.65, y: 0.45 }, { x: 0.35, y: 0.45 }],
        },
      };

      return new Response(JSON.stringify(mockResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY missing');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Parsing request body');
    const { images }: { images: ScalpImages } = await req.json();

    if (!images || (!images.front && !images.top && !images.left && !images.right)) {
      throw new Error('At least one image is required');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const { prompt, version } = getPrompt('scalp_analysis');

    const imageParts: any[] = [];

    const pushImage = (img?: string) => {
      const data = extractBase64(img);
      if (!data) return;
      imageParts.push({
        inlineData: {
          data,
          mimeType: detectMimeType(img),
        },
      });
    };

    pushImage(images.front);
    pushImage(images.top);
    pushImage(images.left);
    pushImage(images.right);

    if (imageParts.length === 0) {
      throw new Error('No valid images found in request (expected base64 or data URLs).');
    }

    console.log('Calling Gemini API for analysis');

    let lastModelError: unknown = null;
    let result: any = null;
    let usedModel = MODEL_FALLBACKS[0];

    for (const modelName of MODEL_FALLBACKS) {
      try {
        usedModel = modelName;
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([prompt, ...imageParts]);
        lastModelError = null;
        break;
      } catch (e) {
        lastModelError = e;
        console.error(`Gemini model failed (${modelName}). Trying next...`, e);
      }
    }

    if (!result) {
      throw new Error(
        `Gemini generateContent failed for all fallback models. Last error: ${
          lastModelError instanceof Error ? lastModelError.message : String(lastModelError)
        }`
      );
    }

    const response = await result.response;
    const text = response.text();
    console.log('Gemini API response received');

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', text);
      throw new Error('Failed to parse AI response as JSON');
    }

    const validation = validateScalpAnalysis(parsedData);

    const executionTime = Date.now() - startTime;
    const inputHash = createInputHash(images);
    const outputSize = measureOutputSize(validation.success ? validation.data : parsedData);

    try {
      usageLogId = await logPromptUsage({
        promptName: 'scalp_analysis',
        promptVersion: version,
        executionTimeMs: executionTime,
        model: usedModel,
        success: validation.success,
        errorMessage: validation.success ? undefined : formatValidationErrors(validation.errors!),
        inputHash,
        outputSizeBytes: outputSize,
      });
    } catch (logError) {
      console.error('Failed to log usage (non-blocking):', logError);
    }

    if (!validation.success) {
      try {
        await logValidationError({
          usageLogId: usageLogId || undefined,
          promptName: 'scalp_analysis',
          promptVersion: version,
          validationErrors: formatValidationErrors(validation.errors!),
          rawOutput: parsedData,
        });
      } catch (logError) {
        console.error('Failed to log validation error (non-blocking):', logError);
      }

      return new Response(
        JSON.stringify({
          error: 'AI response validation failed',
          details: formatValidationErrors(validation.errors!),
          rawOutput: parsedData,
        }),
        {
          status: 422,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(JSON.stringify(validation.data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    const executionTime = Date.now() - startTime;
    try {
      await logPromptUsage({
        promptName: 'scalp_analysis',
        promptVersion: 'v1.0.0',
        executionTimeMs: executionTime,
        model: 'unknown',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        outputSizeBytes: 0,
      });
    } catch (logError) {
      console.error('Failed to log error (non-blocking):', logError);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Analysis failed',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
