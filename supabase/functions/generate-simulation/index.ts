import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';
import { getPrompt } from '../_shared/prompts.ts';
import { logPromptUsage, createInputHash } from '../_shared/logger.ts';
import { getFeatureFlags, isFeatureEnabled } from '../_shared/feature-flags.ts';

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

const GEMINI_MODEL_ID = 'gemini-1.5-pro';

// Gemini response içinden image inlineData çıkarmak için helper
type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
  [key: string]: unknown;
};

function extractImageBase64FromGemini(result: GeminiResponse): {
  base64: string;
  mimeType: string;
} | null {
  if (!result?.candidates) return null;

  for (const c of result.candidates) {
    const parts = c.content?.parts ?? [];
    for (const p of parts) {
      if (
        p.inlineData?.data &&
        p.inlineData.mimeType &&
        p.inlineData.mimeType.startsWith('image/')
      ) {
        return {
          base64: p.inlineData.data,
          mimeType: p.inlineData.mimeType,
        };
      }
    }
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();

  try {
    console.log('Simulation request started');

    // Feature flag (kapanırsa 503 dön)
    let simulationEnabled = true;
    try {
      simulationEnabled = await isFeatureEnabled('enable_simulation');
      console.log('Feature flag check:', simulationEnabled);
    } catch (flagError) {
      console.error('Feature flag check failed, defaulting to enabled:', flagError);
    }

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
          },
        }
      );
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY missing');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Parsing request body');
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
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });

    const { prompt, version } = getPrompt('hair_simulation');

    const parseImageData = (imageData: string) => {
      let rawBase64 = imageData.trim();
      let mimeType = 'image/jpeg';

      const dataUrlMatch = rawBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);

      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        rawBase64 = dataUrlMatch[2];
      } else if (rawBase64.includes(',')) {
        rawBase64 = rawBase64.split(',')[1];
      }

      if (rawBase64.length < 1000) {
        console.warn('Image base64 too short', {
          length: rawBase64.length,
          sample: rawBase64.slice(0, 50),
        });
        throw new Error('Image data too short or invalid');
      }

      return { data: rawBase64, mimeType };
    };

    // Safely extract data from analysis result
    const norwoodScale =
      (analysisResult as any).norwoodScale ||
      (analysisResult as any).diagnosis?.norwood_scale ||
      'Unknown';

    const hairLossPattern =
      (analysisResult as any).hairLossPattern ||
      (analysisResult as any).diagnosis?.analysis_summary ||
      'General hair loss';

    const severity = (analysisResult as any).severity || 'Moderate';

    const estimatedGrafts =
      (analysisResult as any).estimatedGrafts ||
      (analysisResult as any).technical_metrics?.graft_count_min ||
      2500;

    const graftsMin =
      (analysisResult as any).graftsRange?.min ||
      (analysisResult as any).technical_metrics?.graft_count_min ||
      estimatedGrafts;

    const graftsMax =
      (analysisResult as any).graftsRange?.max ||
      (analysisResult as any).technical_metrics?.graft_count_max ||
      estimatedGrafts;

    const affectedAreas =
      (analysisResult as any).affectedAreas || ['Frontal'];

    const primaryTreatment =
      (analysisResult as any).recommendations?.primary ||
      (analysisResult as any).technical_metrics?.suggested_technique ||
      'Hair Transplant';

    const contextText = `
Patient Analysis:
- Norwood Scale: ${norwoodScale}
- Hair Loss Pattern: ${hairLossPattern}
- Severity: ${severity}
- Estimated Grafts: ${estimatedGrafts} (${graftsMin}-${graftsMax})
- Affected Areas: ${
      Array.isArray(affectedAreas) ? affectedAreas.join(', ') : affectedAreas
    }
- Primary Treatment: ${primaryTreatment}

Generate a realistic "after" simulation showing the expected results of hair restoration based on this analysis.`;

    const fullPrompt = prompt + contextText;

    const imageParts: { inlineData: { data: string; mimeType: string } }[] = [];

    const mainImageParsed = parseImageData(mainImage);
    imageParts.push({ inlineData: mainImageParsed });

    if (contextImages?.front) {
      const parsed = parseImageData(contextImages.front);
      imageParts.push({ inlineData: parsed });
    }
    if (contextImages?.top) {
      const parsed = parseImageData(contextImages.top);
      imageParts.push({ inlineData: parsed });
    }

    console.log('Image parts prepared for simulation:', {
      count: imageParts.length,
      mimeTypes: imageParts.map((p) => p.inlineData.mimeType),
      sizes: imageParts.map((p) => p.inlineData.data.length),
    });

    console.log('Calling Gemini API');
    const result = await model.generateContent([
      fullPrompt,
      ...imageParts.map((img) => ({
        inlineData: {
          mimeType: img.inlineData.mimeType,
          data: img.inlineData.data
        }
      }))
    ]);

    console.log('Gemini API response received, extracting image');
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.error('No text in Gemini response');
      throw new Error('No text content in Gemini response');
    }

    console.log('Response text received, length:', text.length);

    const imageUrl = text.trim();

    console.log('Image URL extracted, length:', imageUrl.length);

    const executionTime = Date.now() - startTime;
    const inputHash = createInputHash({
      mainImage: mainImage.substring(0, 100),
      analysisResult,
    });

    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: version,
        executionTimeMs: executionTime,
        model: GEMINI_MODEL_ID,
        success: true,
        inputHash,
        outputSizeBytes: imageUrl.length,
      });
    } catch (logError) {
      console.error('Failed to log usage (non-blocking):', logError);
    }

    console.log('Simulation completed successfully');
    return new Response(JSON.stringify({ imageUrl }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
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
        model: GEMINI_MODEL_ID,
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
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
