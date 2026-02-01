import { supabase } from './lib/supabase';
import type { ScalpAnalysisResult as ValidationScalpAnalysisResult } from './lib/schemas/validation';

export type ScalpImages = {
  front?: string;
  top?: string;
  left?: string;
  right?: string;
  crown?: string;
  donor?: string;
  macro?: string;
};

export type ScalpAnalysisResult = ValidationScalpAnalysisResult;

export const geminiService = {
  async analyzeScalp(images: ScalpImages): Promise<ScalpAnalysisResult> {
    const { data, error } = await supabase.functions.invoke<ScalpAnalysisResult>('analyze-scalp', {
      body: { images },
    });

    if (error) throw new Error(error.message || 'analyze-scalp failed');
    if (!data) throw new Error('No data returned from analyze-scalp');
    return data;
  },

  async generateSurgicalPlanImage(mainPhotoBase64: string, _analysisResult: ScalpAnalysisResult): Promise<string> {
    const hasDataPrefix = mainPhotoBase64.startsWith('data:');
    return hasDataPrefix ? mainPhotoBase64 : `data:image/jpeg;base64,${mainPhotoBase64}`;
  },

  async generateSimulation(mainPhotoBase64: string, planningImage: string, analysisResult: ScalpAnalysisResult): Promise<string> {
    const { data, error } = await supabase.functions.invoke<{ imageUrl: string }>('generate-simulation', {
      body: {
        mainImage: mainPhotoBase64,
        analysisResult,
      },
    });

    if (error) throw new Error(error.message || 'generate-simulation failed');
    if (!data?.imageUrl) throw new Error('No imageUrl returned from generate-simulation');
    return data.imageUrl;
  },
};
