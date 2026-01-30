import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenAI } from 'npm:@google/genai';
import { getPrompt } from '../_shared/prompts.ts';
import { validateScalpAnalysis, formatValidationErrors } from '../_shared/validation.ts';
import { logPromptUsage, logValidationError, createInputHash, measureOutputSize } from '../_shared/logger.ts';
import { isFeatureEnabled, getFeatureConfig } from '../_shared/feature-flags.ts';

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

// (Basit) JSON şema: modeli “sadece JSON” üretmeye zorlamak için
const scalpAnalysisJsonSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    norwoodScale: { type: 'string' },
    hairLossPattern: { type: 'string' },
    severity: { type: 'string' },
    affectedAreas: { type: 'array', items: { type: 'string' } },
    estimatedGrafts: { type: 'number' },
    graftsRange: {
      type: 'object',
      properties: {
        min: { type: 'number' },
        max: { type: 'number' },
      },
      required: ['min', 'max'],
      additionalProperties: true,
    },
    confidence: { type: 'number' },
    recommendations: { type: 'object', additionalProperties: true },
    analysis: { type: 'object', additionalProperties: true },
  },
  required: [
    'norwoodScale',
    'hairLossPattern',
    'severity',
    'affectedAreas',
    'estimatedGrafts',
    'graftsRange',
    'confidence',
    'recommendations',
    'analysis',
  ],
};

function toInlinePart(dataUrl: string) {
  // data:image/jpeg;base64,xxxx
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64,
    },
    // Gemini 3: medya çözünürlüğü (v1alpha)
    mediaResolution: {
      level: 'media_resolution_high',
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();
  let usageLogId: string | null = null;

  try {
    // Mock mode (senin mevcut yapın)
    let mockModeEnabled = false;
    let mockConfig: any = {};
    try {
      mockModeEnabled = await isFeatureEnabled('mock_mode');
      mockConfig = await getFeatureConfig('mock_mode');
    } catch (flagError) {
      console.error('Feature flag check failed (non-blocking):', flagError);
    }

    if (mockModeEnabled) {
      const mockDelay = mockConfig.mock_delay_ms || 1000;
      await new Promise((resolve) => setTimeout(resolve, mockDelay));

      const mockResponse = {
        norwoodScale: 'NW3',
        hairLossPattern: 'Receding hairline with frontal thinning',
        severity: 'Moderate',
        affectedAreas: ['Frontal', 'Temporal'],
        estimatedGrafts: 2750,
        graftsRange: { min: 2500, max: 3000 },
        confidence: 85,
        recommendations: { primary: 'Sapphire FUE Hair Transplant', supporting: ['PRP Therapy', 'Finasteride'] },
        analysis: { summary: 'Mock analysis response for testing' },
      };

      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Mock-Mode': 'true' },
      });
    }

    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const { images }: { images: ScalpImages } = await req.json();
    if (!images || (!images.front && !images.top && !images.left && !images.right)) {
      throw new Error('At least one image is required');
    }

    const { prompt, version } = getPrompt('scalp_analysis');

    // Gemini 3 kılavuzu: mediaResolution için v1alpha
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      apiVersion: 'v1alpha',
    });

    const parts: any[] = [{ text: prompt }];

    if (images.front) parts.push(toInlinePart(images.front));
    if (images.top) parts.push(toInlinePart(images.top));
    if (images.left) parts.push(toInlinePart(images.left));
    if (images.right) parts.push(toInlinePart(images.right));

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts }],
      config: {
        thinkingConfig: { thinkingLevel: 'low' }, // hızlı cevap
        responseMimeType: 'application/json',
        responseJsonSchema: scalpAnalysisJsonSchema,
      },
    });

    const text = (result as any)?.text ?? '';
    if (!text) {
      console.error('Empty response text. Full result:', JSON.stringify(result));
      throw new Error('Empty AI response');
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(text);
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
        model: 'gemini-3-pro-preview',
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
          validationSchema: 'ScalpAnalysisSchema',
          errors: validation.errors!,
          rawResponse: text,
          expectedFormat: 'JSON object (ScalpAnalysisSchema)',
        });
      } catch (logError) {
        console.error('Failed to log validation error (non-blocking):', logError);
      }

      return new Response(
        JSON.stringify({ error: 'AI response validation failed', details: formatValidationErrors(validation.errors!) }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(validation.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scalp analysis error:', error);

    const executionTime = Date.now() - startTime;
    try {
      await logPromptUsage({
        promptName: 'scalp_analysis',
        promptVersion: 'v1.0.0',
        executionTimeMs: executionTime,
        model: 'gemini-3-pro-preview',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        outputSizeBytes: 0,
      });
    } catch (logError) {
      console.error('Failed to log error (non-blocking):', logError);
    }

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
