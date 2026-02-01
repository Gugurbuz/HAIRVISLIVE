import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenAI } from 'npm:@google/genai';
import { getPrompt } from '../_shared/prompts.ts';
import { logPromptUsage, createInputHash } from '../_shared/logger.ts';
import { isFeatureEnabled } from '../_shared/feature-flags.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

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

function toInlineImagePart(dataUrl: string) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64,
    },
    // Optional: keep high vision fidelity
    mediaResolution: {
      level: 'media_resolution_high',
    },
  };
}

function extractFirstImageDataUrl(result: any): string | null {
  const candidates = result?.candidates || [];
  const parts = candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    if (p?.inlineData?.data) {
      const mime = p.inlineData.mimeType || 'image/png';
      const data = p.inlineData.data;
      return `data:${mime};base64,${data}`;
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Feature flag (existing pattern)
    let simulationEnabled = true;
    try {
      simulationEnabled = await isFeatureEnabled('enable_simulation');
    } catch (flagError) {
      console.error('Feature flag check failed, defaulting to enabled:', flagError);
    }

    if (!simulationEnabled) {
      return new Response(JSON.stringify({ error: 'Simulation feature is currently disabled' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const body = await req.json();
    const mainImage: string = body?.mainImage;
    const analysisResult: ScalpAnalysisResult = body?.analysisResult;
    const contextImages: Partial<ScalpImages> | undefined = body?.contextImages;

    if (!mainImage) throw new Error('Main image is required');
    if (!analysisResult) throw new Error('Analysis result is required');

    const { prompt, version } = getPrompt('hair_simulation');

    // Build context from analysis
    const norwoodScale = analysisResult.norwoodScale || 'Unknown';
    const hairLossPattern = analysisResult.hairLossPattern || 'General hair loss';
    const severity = analysisResult.severity || 'Moderate';
    const estimatedGrafts = analysisResult.estimatedGrafts || 2500;
    const graftsMin = analysisResult.graftsRange?.min ?? estimatedGrafts;
    const graftsMax = analysisResult.graftsRange?.max ?? estimatedGrafts;
    const affectedAreas = Array.isArray(analysisResult.affectedAreas) ? analysisResult.affectedAreas : ['Frontal'];
    const primaryTreatment = analysisResult.recommendations?.primary || 'Hair Transplant';

    const contextText = `
Patient Analysis:
- Norwood Scale: ${norwoodScale}
- Hair Loss Pattern: ${hairLossPattern}
- Severity: ${severity}
- Estimated Grafts: ${estimatedGrafts} (${graftsMin}-${graftsMax})
- Affected Areas: ${affectedAreas.join(', ')}
- Primary Treatment: ${primaryTreatment}

Task:
Generate a realistic "after" simulation image (12 months after), preserving identity, lighting, shadows, and background as much as possible. Hairline should be natural and consistent with Norwood scale and graft budget.`;

    const fullPrompt = `${prompt}\n\n${contextText}`;

    // v1alpha for mediaResolution; image model is fine
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY, apiVersion: 'v1alpha' });

    const parts: any[] = [{ text: fullPrompt }, toInlineImagePart(mainImage)];

    if (contextImages?.front) parts.push(toInlineImagePart(contextImages.front));
    if (contextImages?.top) parts.push(toInlineImagePart(contextImages.top));
    if (contextImages?.left) parts.push(toInlineImagePart(contextImages.left));
    if (contextImages?.right) parts.push(toInlineImagePart(contextImages.right));

    // IMPORTANT:
    // - gemini-3-pro-image-preview supports imageConfig
    // - DO NOT send thinkingConfig (your previous 400)
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts }],
      config: {
        // Gemini 3 guide: Image generation config
        imageConfig: {
          aspectRatio: '4:5',
          imageSize: '2K', // change to "4K" if you want
        },
      },
    });

    const imageUrl = extractFirstImageDataUrl(result);
    if (!imageUrl) {
      console.error('No image returned. Full result:', JSON.stringify(result));
      throw new Error('No image returned from Gemini');
    }

    // Logging
    const executionTimeMs = Date.now() - startTime;
    const inputHash = createInputHash({
      mainImage: mainImage?.slice?.(0, 80) || '',
      analysisResult,
    });

    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: version,
        executionTimeMs,
        model: 'gemini-3-pro-image-preview',
        success: true,
        inputHash,
        outputSizeBytes: imageUrl.length,
      });
    } catch (logError) {
      console.error('Failed to log usage (non-blocking):', logError);
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Simulation generation error:', error);

    const executionTimeMs = Date.now() - startTime;
    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: 'v1.0.0',
        executionTimeMs,
        model: 'gemini-3-pro-image-preview',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        outputSizeBytes: 0,
      });
    } catch (logError) {
      console.error('Failed to log error (non-blocking):', logError);
    }

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
