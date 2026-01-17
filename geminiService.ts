import type { ScalpAnalysisResult, ScalpImages } from '../geminiService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const secureGeminiService = {
  async analyzeScalp(images: ScalpImages): Promise<ScalpAnalysisResult> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-scalp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ images }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const data = await response.json();
      return data as ScalpAnalysisResult;
    } catch (error) {
      console.error('Scalp analysis error:', error);
      throw error;
    }
  },

  async generateSimulation(
    mainImage: string,
    analysisResult: ScalpAnalysisResult,
    contextImages?: Partial<ScalpImages>
  ): Promise<string> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          mainImage,
          analysisResult,
          contextImages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();
      if (!data.imageUrl) {
        throw new Error('No image URL returned');
      }
      return data.imageUrl;
    } catch (error) {
      console.error('Simulation generation error:', error);
      throw error;
    }
  },

  async generateMedicalTimelineImage(
    mainImage: string,
    analysisResult: ScalpAnalysisResult
  ): Promise<string> {
    return this.generateSimulation(mainImage, analysisResult);
  },
};
