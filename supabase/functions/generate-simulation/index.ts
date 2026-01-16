import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3';
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

    // Skip feature flags check temporarily to avoid blocking
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { prompt, version } = getPrompt('hair_simulation');

    // Safely extract data from analysis result
    const norwoodScale = analysisResult.norwoodScale || analysisResult.diagnosis?.norwood_scale || 'Unknown';
    const hairLossPattern = analysisResult.hairLossPattern || analysisResult.diagnosis?.analysis_summary || 'General hair loss';
    const severity = analysisResult.severity || 'Moderate';
    const estimatedGrafts = analysisResult.estimatedGrafts || analysisResult.technical_metrics?.graft_count_min || 2500;
    const graftsMin = analysisResult.graftsRange?.min || analysisResult.technical_metrics?.graft_count_min || estimatedGrafts;
    const graftsMax = analysisResult.graftsRange?.max || analysisResult.technical_metrics?.graft_count_max || estimatedGrafts;
    const affectedAreas = analysisResult.affectedAreas || ['Frontal'];
    const primaryTreatment = analysisResult.recommendations?.primary || analysisResult.technical_metrics?.suggested_technique || 'Hair Transplant';

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

    const imageParts = [
      {
        inlineData: {
          data: mainImage.split(',')[1],
          mimeType: 'image/jpeg',
        },
      },
    ];

    if (contextImages?.front) {
      imageParts.push({
        inlineData: {
          data: contextImages.front.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }
    if (contextImages?.top) {
      imageParts.push({
        inlineData: {
          data: contextImages.top.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }

    console.log('Calling Gemini API');
    const result = await model.generateContent([fullPrompt, ...imageParts]);
    const response = await result.response;
    const imageUrl = response.text();
    console.log('Gemini API response received');

    const executionTime = Date.now() - startTime;
    const inputHash = createInputHash({ mainImage: mainImage.substring(0, 100), analysisResult });

    try {
      await logPromptUsage({
        promptName: 'hair_simulation',
        promptVersion: version,
        executionTimeMs: executionTime,
        model: 'gemini-1.5-flash',
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
        model: 'gemini-1.5-flash',
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