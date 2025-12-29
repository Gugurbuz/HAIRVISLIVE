import { supabase } from './lib/supabase';

// App.tsx’nin beklediği tip
export type ScalpImages = {
  front: string;
  left?: string;
  right?: string;  // App gönderiyor ama edge function kullanmıyor (ok)
  crown?: string;
  donor?: string;
  macro?: string;  // App gönderiyor ama edge function kullanmıyor (ok)
};

// Edge function isimlerin: analyze-scalp, generate-simulation
// App.tsx ayrıca generateSurgicalPlanImage çağırıyor -> sende edge'de yok.
// Şimdilik stub (plan image) olarak mainPhoto döndüreceğiz ki akış kırılmasın.
// Sonra Sprint 2’de bunu ayrı edge function yaparız.

export const geminiService = {
  async analyzeScalp(images: ScalpImages) {
    const { data, error } = await supabase.functions.invoke('analyze-scalp', {
      body: { images },
    });

    if (error) throw new Error(error.message || 'analyze-scalp failed');
    return data;
  },

  // App.tsx bunu bekliyor (generateSurgicalPlanImage)
  // Şimdilik: plan image üretilmiyorsa bile akış bozulmasın diye mainPhoto’yu geri döndürüyoruz.
  // İstersen burada “No plan available” placeholder da döndürebiliriz.
  async generateSurgicalPlanImage(mainPhotoBase64: string, analysisResult: any) {
    // TODO Sprint 2: ayrı edge function: generate-plan
    // Şimdilik aynı foto
    return `data:image/jpeg;base64,${mainPhotoBase64}`;
  },

  async generateSimulation(mainPhotoBase64: string, planningImage: string, analysisResult: any) {
    // generate-simulation edge function şu payload'u bekliyor:
    // { mainImage, analysisResult, contextImages }
    // planningImage edge tarafında kullanılmıyor (şimdilik), o yüzden geçmiyoruz.
    const { data, error } = await supabase.functions.invoke('generate-simulation', {
      body: {
        mainImage: mainPhotoBase64,
        analysisResult,
        // contextImages istersen burada ekleyebilirsin (left/donor gibi)
      },
    });

    if (error) throw new Error(error.message || 'generate-simulation failed');

    // Edge function { imageUrl } döndürüyor
    if (!data?.imageUrl) throw new Error('No imageUrl returned from generate-simulation');
    return data.imageUrl as string;
  },
};
