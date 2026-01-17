import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenAI } from 'npm:@google/genai';
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
    let mockConfig = {};
    try {
      mockModeEnabled = await isFeatureEnabled('mock_mode');
      mockConfig = await getFeatureConfig('mock_mode');
      console.log('Feature flags checked, mock mode:', mockModeEnabled);
    } catch (flagError) {
      console.error('Feature flag check failed (non-blocking):', flagError);
    }

    if (mockModeEnabled) {
      const mockDelay = mockConfig.mock_delay_ms || 1000;
      await new Promise(resolve => setTimeout(resolve, mockDelay));

      const mockResponse = {
        norwoodScale: 'NW3',
        hairLossPattern: 'Receding hairline with frontal thinning',
        severity: 'Moderate',
        affectedAreas: ['Frontal', 'Temporal'],
        estimatedGrafts: 2750,
        graftsRange: { min: 2500, max: 3000 },
        confidence: 85,
        recommendations: {
          primary: 'Sapphire FUE Hair Transplant',
          supporting: ['PRP Therapy', 'Finasteride']
        },
        analysis: {
          summary: 'Mock analysis response for testing'
        }
      };

      return new Response(JSON.stringify(mockResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Mock-Mode': 'true',
        },
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Parsing request body');
    const { images }: { images: ScalpImages } = await req.json();

    if (!images || (!images.front && !images.top && !images.left && !images.right)) {
      throw new Error('At least one image is required');
    }

    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = 'models/gemini-3-pro-image-preview';

    const { prompt, version } = getPrompt('scalp_analysis');

    const imageParts = [];
    if (images.front) {
      imageParts.push({
        inlineData: {
          data: images.front.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }
    if (images.top) {
      imageParts.push({
        inlineData: {
          data: images.top.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }
    if (images.left) {
      imageParts.push({
        inlineData: {
          data: images.left.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }
    if (images.right) {
      imageParts.push({
        inlineData: {
          data: images.right.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }

    console.log('Calling Gemini API for analysis');
    const result = await genAI.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            ...imageParts.map(img => ({ inlineData: img.inlineData }))
          ]
        }
      ]
    });
    const text = result.text;
    console.log('Gemini API response received');

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsedData;
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
        model: 'gemini-3-pro-image-preview',
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
          rawResponse: cleanedText,
          expectedFormat: 'JSON object with norwoodScale, hairLossPattern, severity, affectedAreas, estimatedGrafts, graftsRange, confidence, recommendations, analysis',
        });
      } catch (logError) {
        console.error('Failed to log validation error (non-blocking):', logError);
      }

      return new Response(
        JSON.stringify({
          error: 'AI response validation failed',
          details: formatValidationErrors(validation.errors!),
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

    console.log('Analysis completed successfully');
    return new Response(JSON.stringify(validation.data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Scalp analysis error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    const executionTime = Date.now() - startTime;
    try {
      await logPromptUsage({
        promptName: 'scalp_analysis',
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