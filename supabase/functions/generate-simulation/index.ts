import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenAI } from 'npm:@google/genai';
import { getPrompt } from '../_shared/prompts.ts';
import { logPromptUsage, createInputHash } from '../_shared/logger.ts';
import { isFeatureEnabled } from '../_shared/feature-flags.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

function toInlinePart(dataUrl: string) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64,
    },
    // Simülasyon üretiminde de yüksek detay iş görür
    mediaResolution: {
      level: 'media_resolution_high',
    },
  };
}

function extractFirstImageAsDataUrl(result: any): string | null {
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

    const { prompt, version } = getPrompt('hair_simulation');

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
Generate a realistic "after" simulation image (12 months after), preserving identity and lighting, with natural hairline and density consistent with the analysis.`;

    const fullPrompt = `${prompt}\n\n${contextText}`;

    const parts: any[] = [{ text: fullPrompt }, toInlinePart(mainImage)];

    if (contextImages?.front) parts.push(toInlinePart(contextImages.front));
    if (contextImages?.top) parts.push(toInlinePart(contextImages.top));
    if (contextImages?.left) parts.push(toInlinePart(contextImages.left));
    if (contextImages?.right) parts.push(toInlinePart(contextImages.right));

    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      apiVersion: 'v1alpha', // mediaResolution için
    });

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts }],
      config: {
        // Image generation config (kılavuz)
        imageConfig: {
          aspectRatio: '4:5',
          imageSize: '2K',
        },
        // “thinkingLevel” image üretimde şart değil; yine de tutarlı olsun diye low
        thinkingConfig: { thinkingLevel: 'low' },
      },
    });

    const imageUrl = extractFirstImageAsDataUrl(result);
    if (!imageUrl) {
      console.error('No image returned. Full result:', JSON.stringify(result));
      throw new Error('No image returned from Gemini');
    }

    const executionTime = Date.now() - startTime;
    const inputHash = createInputHash({ mainImage: mainImage.substring(0, 100), analysisResult });

    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: version,
        executionTimeMs: executionTime,
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

    const executionTime = Date.now() - startTime;
    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: 'v1.0.0',
        executionTimeMs: executionTime,
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
