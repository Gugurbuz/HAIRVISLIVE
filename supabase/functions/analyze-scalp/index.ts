import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3';
import { getPrompt } from '../_shared/prompts.ts';
import { validateScalpAnalysis, formatValidationErrors } from '../_shared/validation.ts';
import { logPromptUsage, logValidationError, createInputHash, measureOutputSize } from '../_shared/logger.ts';

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
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { images }: { images: ScalpImages } = await req.json();

    if (!images || (!images.front && !images.top && !images.left && !images.right)) {
      throw new Error('At least one image is required');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

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

    usageLogId = await logPromptUsage({
      promptName: 'scalp_analysis',
      promptVersion: version,
      executionTimeMs: executionTime,
      model: 'gemini-1.5-flash',
      success: validation.success,
      errorMessage: validation.success ? undefined : formatValidationErrors(validation.errors!),
      inputHash,
      outputSizeBytes: outputSize,
    });

    if (!validation.success) {
      await logValidationError({
        usageLogId: usageLogId || undefined,
        promptName: 'scalp_analysis',
        promptVersion: version,
        validationSchema: 'ScalpAnalysisSchema',
        errors: validation.errors!,
        rawResponse: cleanedText,
        expectedFormat: 'JSON object with norwoodScale, hairLossPattern, severity, affectedAreas, estimatedGrafts, graftsRange, confidence, recommendations, analysis',
      });

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

    return new Response(JSON.stringify(validation.data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Scalp analysis error:', error);

    const executionTime = Date.now() - startTime;
    await logPromptUsage({
      promptName: 'scalp_analysis',
      promptVersion: 'v1.0.0',
      executionTimeMs: executionTime,
      model: 'gemini-1.5-flash',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      outputSizeBytes: 0,
    });

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
