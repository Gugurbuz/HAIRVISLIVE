import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const FALLBACK_PROMPTS = {
  scalp_analysis: {
    name: 'scalp_analysis',
    version: 'v1.0.0',
    prompt: `You are an expert dermatologist and hair restoration specialist analyzing scalp photographs.

TASK: Analyze the provided scalp images and provide a comprehensive hair loss assessment.

INPUT: You will receive 1-4 images showing:
- Front view (hairline)
- Top view (crown)
- Left side view
- Right side view

OUTPUT REQUIRED (JSON format):
{
  "norwoodScale": "string (1-7 or I-VII for pattern baldness, or descriptive text for other patterns)",
  "hairLossPattern": "string (Androgenetic Alopecia, Diffuse Thinning, Alopecia Areata, etc.)",
  "severity": "string (Minimal, Mild, Moderate, Severe, Advanced)",
  "affectedAreas": ["string array of affected regions"],
  "estimatedGrafts": "number (100-5000)",
  "graftsRange": {
    "min": "number",
    "max": "number"
  },
  "confidence": "number (0-100)",
  "recommendations": {
    "primary": "string (FUE, FUT, Combined, Medical Treatment, etc.)",
    "alternative": ["array of alternative options"],
    "medicalTreatment": ["array of recommended medications/treatments"],
    "lifestyle": ["array of lifestyle recommendations"]
  },
  "analysis": {
    "hairDensity": "string (Very Low, Low, Medium, High, Very High)",
    "scalpHealth": "string (Excellent, Good, Fair, Poor)",
    "donorAreaQuality": "string (Excellent, Good, Fair, Poor, Limited)",
    "candidacy": "string (Excellent, Good, Fair, Poor)",
    "notes": "string (additional clinical observations)"
  }
}

ANALYSIS CRITERIA:
1. Norwood Scale Classification (for male pattern baldness):
   - 1: No significant hair loss
   - 2: Slight recession at temples
   - 3: Deeper temple recession (3A with crown thinning)
   - 4: Advanced temple recession with crown involvement
   - 5: Bridge of hair between front and crown thinning
   - 6: Bridge mostly lost
   - 7: Only narrow band of hair remains

2. Graft Estimation Guidelines:
   - Hairline restoration: 1000-1500 grafts
   - Hairline + mid-scalp: 2000-2500 grafts
   - Hairline + mid-scalp + crown: 3000-4000 grafts
   - Extensive coverage: 4000-5000+ grafts

3. Always provide:
   - Conservative and realistic estimates
   - Clear explanation in notes
   - Multiple treatment options
   - Realistic expectations

Return ONLY valid JSON. No additional text or formatting.`,
  },
  hair_simulation: {
    name: 'hair_simulation',
    version: 'v1.0.0',
    prompt: `You are an expert medical illustrator specializing in hair restoration visualization.

TASK: Generate a photorealistic "after" simulation image showing expected hair restoration results.

Generate the image with natural lighting, realistic density, and professional medical quality.`,
  },
};

export async function getPrompt(name: string): Promise<{ prompt: string; version: string; promptId?: string }> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, prompt_text, version')
      .eq('name', name)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching prompt ${name} from database:`, error);
      const fallback = FALLBACK_PROMPTS[name as keyof typeof FALLBACK_PROMPTS];
      if (!fallback) {
        throw new Error(`Prompt not found: ${name}`);
      }
      return { prompt: fallback.prompt, version: fallback.version };
    }

    if (data) {
      return {
        prompt: data.prompt_text,
        version: data.version,
        promptId: data.id,
      };
    }

    const fallback = FALLBACK_PROMPTS[name as keyof typeof FALLBACK_PROMPTS];
    if (!fallback) {
      throw new Error(`Prompt not found: ${name}`);
    }
    return { prompt: fallback.prompt, version: fallback.version };
  } catch (error) {
    console.error(`Error in getPrompt for ${name}:`, error);
    const fallback = FALLBACK_PROMPTS[name as keyof typeof FALLBACK_PROMPTS];
    if (!fallback) {
      throw new Error(`Prompt not found: ${name}`);
    }
    return { prompt: fallback.prompt, version: fallback.version };
  }
}