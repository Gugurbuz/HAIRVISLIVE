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

// Edge function isimlerin: analyze-scalp, generate-simulation
// App.tsx ayrıca generateSurgicalPlanImage çağırıyor -> sende edge'de yok.
// Şimdilik stub (plan image) olarak mainPhoto döndüreceğiz ki akış kırılmasın.
// Sonra Sprint 2’de bunu ayrı edge function yaparız.

export const geminiService = {
  async analyzeScalp(images: ScalpImages): Promise<ScalpAnalysisResult> {
    const { data, error } = await supabase.functions.invoke<ScalpAnalysisResult>('analyze-scalp', {
      body: { images },
    });

    if (error) throw new Error(error.message || 'analyze-scalp failed');
    if (!data) throw new Error('No data returned from analyze-scalp');
    return data;
  },

  async generateSurgicalPlanImage(mainPhotoData: string, analysisResult: ScalpAnalysisResult): Promise<string> {
    if (typeof mainPhotoData === 'string' && mainPhotoData.startsWith('data:')) {
      return mainPhotoData;
    }
    return `data:image/jpeg;base64,${mainPhotoData}`;
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
