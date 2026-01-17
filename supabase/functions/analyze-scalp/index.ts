import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';
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

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const { prompt, version } = getPrompt('scalp_analysis');

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

    const imageParts = [];
    if (images.front) {
      const parsed = parseImageData(images.front);
      imageParts.push({ inlineData: parsed });
    }
    if (images.top) {
      const parsed = parseImageData(images.top);
      imageParts.push({ inlineData: parsed });
    }
    if (images.left) {
      const parsed = parseImageData(images.left);
      imageParts.push({ inlineData: parsed });
    }
    if (images.right) {
      const parsed = parseImageData(images.right);
      imageParts.push({ inlineData: parsed });
    }

    console.log('Image parts prepared:', {
      count: imageParts.length,
      mimeTypes: imageParts.map(p => p.inlineData.mimeType),
      sizes: imageParts.map(p => p.inlineData.data.length),
    });

    console.log('Calling Gemini API for analysis');
    const result = await model.generateContent([
      prompt,
      ...imageParts.map(img => ({
        inlineData: {
          mimeType: img.inlineData.mimeType,
          data: img.inlineData.data
        }
      }))
    ]);

    console.log('Gemini API response received, extracting text');
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.error('No text in response:', JSON.stringify(result, null, 2));
      throw new Error('No text content in Gemini response');
    }

    console.log('Text extracted, length:', text.length);

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
        model: 'gemini-3-pro-image-preview',
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