import { supabase } from "./lib/supabase"; // path sende farklıysa düzelt (ör: "../lib/supabase")

// Frontend artık Gemini bilmez. Sadece Edge Function çağırır.

export async function analyzeScalp(images: {
  front: string;
  donor?: string;
  left?: string;
  crown?: string;
}) {
  const { data, error } = await supabase.functions.invoke("analyze-scalp", {
    body: { images },
  });

  if (error) {
    throw new Error(error.message || "analyze-scalp failed");
  }

  return data;
}

export async function generateSimulation(payload: {
  mainImage: string;
  analysisResult: any;
  contextImages?: { left?: string; donor?: string };
}) {
  const { data, error } = await supabase.functions.invoke("generate-simulation", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "generate-simulation failed");
  }

  return data;
}
