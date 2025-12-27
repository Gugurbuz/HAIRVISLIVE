
import { GoogleGenAI, Type } from "@google/genai";

// ---------------------------------------------------------
// HELPER FUNCTIONS (Canvas & Image Processing)
// ---------------------------------------------------------
const cleanBase64 = (base64OrDataUrl: string) => {
  if (!base64OrDataUrl) return "";
  if (base64OrDataUrl.includes(",")) return base64OrDataUrl.split(",")[1];
  return base64OrDataUrl;
};

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------
export interface ScalpImages {
  front: string;
  left: string;
  right: string;
  crown: string;
  donor: string;
  macro: string;
}

export interface DonorMetrics {
  density_rating: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
  estimated_hairs_per_cm2: number;
  total_safe_capacity_grafts: number;
  donor_condition_summary: string;
}

export interface PhenotypeFeatures {
  apparent_age: number;
  skin_tone: 'Light' | 'Medium' | 'Dark';
  skin_undertone: 'Cool' | 'Warm' | 'Olive';
  beard_presence: 'None' | 'Stubble' | 'Full';
  beard_texture: 'Straight' | 'Wavy' | 'Curly';
  eyebrow_density: 'Sparse' | 'Medium' | 'Thick';
  eyebrow_color: 'Light' | 'Dark';
}

export interface ScalpAnalysisResult {
  diagnosis: {
    norwood_scale: string;
    analysis_summary: string;
  };
  technical_metrics: {
    graft_count_min: number;
    graft_count_max: number;
    graft_distribution: { zone_1: number; zone_2: number; zone_3: number };
    estimated_session_time_hours: number;
    suggested_technique: string;
    technique_reasoning: string;
  };
  donor_assessment: DonorMetrics;
  scalp_geometry: {
    hairline_design_polygon: { x: number; y: number }[]; 
    high_density_zone_polygon: { x: number; y: number }[];
  };
  phenotypic_features: PhenotypeFeatures;
}

export interface HairPhenotypeProfile {
  hair_texture: 'straight' | 'wavy' | 'curly';
  hair_thickness: 'thin' | 'medium' | 'thick';
  color_palette: string; 
  hairline_style: 'conservative_flat' | 'soft_m' | 'mature_receded';
  max_density_band: 'low' | 'medium' | 'high';
  risk_flags: string[];
}

// ---------------------------------------------------------
// DECISION TREE ENGINE
// ---------------------------------------------------------
function derivePhenotypeProfile(analysis: ScalpAnalysisResult): HairPhenotypeProfile {
  const { phenotypic_features: feat, diagnosis } = analysis;
  const nwLevel = parseInt(diagnosis.norwood_scale.replace(/\D/g, '')) || 3;
  
  // A) TEXTURE SELECTION
  let texture: 'straight' | 'wavy' | 'curly' = 'wavy'; // Default safe fallback
  
  if (feat.beard_presence !== 'None') {
    if (feat.beard_texture === 'Curly') texture = 'curly';
    else if (feat.beard_texture === 'Wavy') texture = 'wavy';
    else texture = 'straight';
  } else {
    // Fallback logic
    if (feat.eyebrow_density === 'Thick' && (feat.skin_undertone === 'Olive' || feat.skin_undertone === 'Warm')) {
      texture = 'wavy';
    } else if (feat.eyebrow_density === 'Sparse' && feat.skin_undertone === 'Cool') {
      texture = 'straight';
    }
  }
  // Safety Rule: "If unsure, don't produce curly"
  if (texture === 'curly' && feat.beard_presence === 'None') texture = 'wavy';

  // B) THICKNESS SELECTION
  let thickness: 'thin' | 'medium' | 'thick' = 'medium';
  if (feat.beard_presence !== 'None') {
     // Infer from beard usually matching hair thickness
     thickness = feat.beard_texture === 'Straight' ? 'medium' : 'thick'; 
  } else {
     if (feat.eyebrow_density === 'Thick' && feat.eyebrow_color === 'Dark') thickness = 'thick';
     else if (feat.eyebrow_density === 'Sparse') thickness = 'thin';
  }

  // C) COLOR PALETTE
  let color = "Dark Brown";
  if (feat.skin_undertone === 'Cool') color = "Ash Brown / Cool Dark Brown";
  else if (feat.skin_undertone === 'Warm') color = "Warm Dark Chestnut";
  else if (feat.skin_undertone === 'Olive') color = "Matte Dark Black/Brown";
  
  if (feat.eyebrow_color === 'Light') color = "Light/Medium Ash Brown";

  // D) HAIRLINE STYLE
  let hairline: 'conservative_flat' | 'soft_m' | 'mature_receded' = 'soft_m';
  
  if (feat.apparent_age >= 40 || nwLevel >= 5) {
    hairline = 'mature_receded';
  } else if (feat.apparent_age >= 30 && feat.apparent_age < 40) {
    hairline = 'soft_m';
  } else if (feat.apparent_age < 30 && nwLevel <= 3) {
    hairline = 'conservative_flat';
  }
  
  // Extra Rule: Olive/Warm + Thick hair supports a stronger line
  if (feat.skin_undertone === 'Olive' && thickness === 'thick' && hairline === 'soft_m') {
     hairline = 'conservative_flat';
  }

  // E) MAX DENSITY BAND
  let density: 'low' | 'medium' | 'high' = 'medium';
  if (nwLevel <= 3) density = 'high';
  else if (nwLevel === 4) density = 'medium';
  else density = 'low'; // NW 5-7

  return {
    hair_texture: texture,
    hair_thickness: thickness,
    color_palette: color,
    hairline_style: hairline,
    max_density_band: density,
    risk_flags: nwLevel >= 6 ? ["Limit density", "Focus frontal"] : []
  };
}

// ---------------------------------------------------------
// SERVICE EXPORT
// ---------------------------------------------------------
export const geminiService = {
  
  getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  },

  /**
   * PHASE 1: GEOMETRIC ANALYSIS & PHENOTYPE EXTRACTION
   */
  async analyzeScalp(images: ScalpImages): Promise<ScalpAnalysisResult | null> {
    const ai = this.getClient();
    
    // SAFETY: System instruction MUST prohibit diagnosis language.
    const contentParts: any[] = [
      { text: `You are a specialized AI assistant for VISUAL HAIR ANALYSIS.
      
      ROLE: Provide visual estimations and planning data. 
      PROHIBITED: DO NOT provide a medical diagnosis. DO NOT use words like "disease", "cure", "pathology". 
      
      PHASE 1 TASK: VISUAL ASSESSMENT
      
      1. **Recipient Area Estimation (Front/Top Views):** 
         - Estimate the Norwood Pattern based on visual evidence.
         - Estimate graft capacity for Zone 1, 2, and 3 based on surface area.
         - **Define TWO nested polygons on the FRONT view:**
           - \`hairline_design_polygon\`: The complete outer boundary of the entire transplant area.
           - \`high_density_zone_polygon\`: A smaller, inner zone for maximum density packing.

      2. **Donor Area Assessment (Back/Side Views):**
         - Analyze the 'DONOR' image specifically for visible density and estimated safe capacity.
         - Rate donor condition: Poor/Moderate/Good/Excellent based on visual density.

      3. **Technique Suitability & Phenotype:**
         - Suggest a technique (Sapphire FUE, DHI) suitable for the observed hair type.
         - Analyze facial phenotype (age, skin tone etc) for simulation guidance.

      Output strict JSON.` 
      }
    ];

    contentParts.push({ text: `\nVIEW: FRONT (Primary Recipient)` });
    contentParts.push({ inlineData: { data: cleanBase64(images.front), mimeType: "image/jpeg" } });

    if(images.donor) {
      contentParts.push({ text: `\nVIEW: DONOR (Primary Source - Analyze Density)` });
      contentParts.push({ inlineData: { data: cleanBase64(images.donor), mimeType: "image/jpeg" } });
    }
    if(images.left) {
      contentParts.push({ text: `\nVIEW: SIDE LEFT (Temple & Temporal Points)` });
      contentParts.push({ inlineData: { data: cleanBase64(images.left), mimeType: "image/jpeg" } });
    }
    if(images.crown) {
      contentParts.push({ text: `\nVIEW: CROWN (Vertex)` });
      contentParts.push({ inlineData: { data: cleanBase64(images.crown), mimeType: "image/jpeg" } });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", 
        contents: [{ parts: contentParts }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: {
                type: Type.OBJECT,
                properties: {
                  norwood_scale: { type: Type.STRING },
                  analysis_summary: { type: Type.STRING },
                },
                required: ["norwood_scale", "analysis_summary"],
              },
              technical_metrics: {
                type: Type.OBJECT,
                properties: {
                  graft_count_min: { type: Type.INTEGER },
                  graft_count_max: { type: Type.INTEGER },
                  graft_distribution: {
                    type: Type.OBJECT,
                    properties: { zone_1: { type: Type.INTEGER }, zone_2: { type: Type.INTEGER }, zone_3: { type: Type.INTEGER } },
                  },
                  estimated_session_time_hours: { type: Type.NUMBER },
                  suggested_technique: { type: Type.STRING },
                  technique_reasoning: { type: Type.STRING },
                },
                required: ["graft_count_min", "graft_count_max", "suggested_technique", "technique_reasoning"],
              },
              donor_assessment: {
                type: Type.OBJECT,
                properties: {
                  density_rating: { type: Type.STRING, enum: ['Poor', 'Moderate', 'Good', 'Excellent'] },
                  estimated_hairs_per_cm2: { type: Type.INTEGER },
                  total_safe_capacity_grafts: { type: Type.INTEGER },
                  donor_condition_summary: { type: Type.STRING },
                },
                required: ["density_rating", "estimated_hairs_per_cm2", "total_safe_capacity_grafts", "donor_condition_summary"]
              },
              scalp_geometry: {
                type: Type.OBJECT,
                properties: {
                  hairline_design_polygon: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                  },
                  high_density_zone_polygon: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                  }
                },
                required: ["hairline_design_polygon", "high_density_zone_polygon"]
              },
              phenotypic_features: {
                type: Type.OBJECT,
                properties: {
                  apparent_age: { type: Type.INTEGER },
                  skin_tone: { type: Type.STRING, enum: ['Light', 'Medium', 'Dark'] },
                  skin_undertone: { type: Type.STRING, enum: ['Cool', 'Warm', 'Olive'] },
                  beard_presence: { type: Type.STRING, enum: ['None', 'Stubble', 'Full'] },
                  beard_texture: { type: Type.STRING, enum: ['Straight', 'Wavy', 'Curly'] },
                  eyebrow_density: { type: Type.STRING, enum: ['Sparse', 'Medium', 'Thick'] },
                  eyebrow_color: { type: Type.STRING, enum: ['Light', 'Dark'] }
                },
                required: ["apparent_age", "skin_tone", "skin_undertone", "beard_presence", "beard_texture", "eyebrow_density", "eyebrow_color"]
              }
            },
            required: ["diagnosis", "technical_metrics", "donor_assessment", "scalp_geometry", "phenotypic_features"]
          }
        }
      });

      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("Phase 1 Analysis Error:", error);
      throw error;
    }
  },

  async generateMedicalTimelineImage(base64Image: string, analysisResult: ScalpAnalysisResult): Promise<string | null> {
    const ai = this.getClient();
    
    // Derive phenotype to ensure consistency with the main simulation
    const phenotype = derivePhenotypeProfile(analysisResult);

    // SAFETY: Instructions must be for "Visual Simulation" not "Result Guarantee"
    const masterPrompt = `You are a medical visualization expert. Your task is to create a high-resolution, four-panel medical photography collage arranged in a 2x2 grid, showing the TYPICAL RECOVERY STAGES of a male hair transplant.

CRITICAL RULE: The final output MUST be a 2x2 collage of four frontal headshots. All four panels MUST maintain the exact same frontal perspective as the input image. DO NOT generate any top-down, angled, or vertex views. The head position and camera angle must remain consistent across all four images.

PATIENT DETAILS: The patient's natural hair color appears to be ${phenotype.color_palette}. The patient's eyes are obscured by a blurred bar in all panels for privacy.

PANEL DESCRIPTIONS:

Top-Left Panel (Surgical Plan): A FRONTAL VIEW immediately post-operation. The recipient area on the forehead is shaved, showing hundreds of tiny red graft incisions. Colored surgical markings are visible on the scalp: a red line outlining the new frontal hairline boundary, and a blue shaded zone behind it indicating density placement.

Top-Right Panel (Early Growth - 4 Months): A FRONTAL VIEW of early growth. The transplanted area shows VERY SHORT, sparse, stubbly new hairs, like a 1-week beard shadow. Hair length should be only a few millimeters. Density is low and uneven. The surrounding non-transplanted hair is significantly longer, creating a clear contrast. The new hair color matches the patient's natural hair.

Bottom-Left Panel (Maturing Stage - 8 Months): A FRONTAL VIEW of maturing hair. The transplanted hair is now visibly longer, approximately 2-4 centimeters in length. It is NOT full length yet. Density has increased significantly, but is not yet at its final state. The texture of the new hair is still maturing; it might look slightly wiry or less smooth than the native hair.

Bottom-Right Panel (Projected Result - 12 Months): A FRONTAL VIEW of the projected result. Full, ${phenotype.hair_thickness}, styled ${phenotype.hair_texture} hair with a color of ${phenotype.color_palette}. The hair is at its final length and density. A solid red contour line is drawn underneath the perfectly defined new hairline to emphasize the result. The hair should look natural and consistent with the patient's age and features.

OVERALL STYLE: Clinical, realistic medical photography. Neutral lighting, neutral plain background. Do not add any text overlays. The image should be a pure visual collage. Maintain the same person's head shape and features (except hair) across all panels.

NEGATIVE PROMPTS: no top-down views, no vertex views, no angled shots, no fashion photography, no fake before-after marketing look, no cartoon, no illustration, no beauty model, no exaggerated density, no perfect hairline symmetry, no dramatic lighting, no artistic blur.
    `;
    
    const contentPayload: any[] = [
      { text: masterPrompt },
      { inlineData: { data: cleanBase64(base64Image), mimeType: "image/jpeg" } }
    ];

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ parts: contentPayload }],
      });
      
      const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

      if (imagePart && imagePart.inlineData) {
        return `data:image/png;base64,${imagePart.inlineData.data}`;
      }
      return null;

    } catch (error) {
      console.error("Medical Timeline Generation Error:", error);
      return null;
    }
  },

  /**
   * PHASE 2: MULTI-VIEW CONTEXTUAL SIMULATION
   */
  async generateSimulation(base64Image: string, analysisResult: ScalpAnalysisResult, contextImages?: Partial<ScalpImages>): Promise<string | null> {
      const phenotype = derivePhenotypeProfile(analysisResult);
      
      const ai = this.getClient();
      
      const contentPayload: any[] = [];

      // 1. Instructions
      const masterPrompt = `
        ROLE: You are a visual simulation AI.
        GOAL: Generate a realistic 12-month post-procedure SIMULATION for the PRIMARY IMAGE.
        
        CRITICAL RULE: The output image MUST maintain the exact same camera angle, perspective, and head position as the PRIMARY IMAGE. The primary image is a frontal view, so the output MUST also be a frontal view. DO NOT generate a top-down or angled view.

        MULTI-VIEW CONTEXT: Use the provided SIDE/DONOR views to match hair texture and blend temporal points.
        FACIAL PROPORTIONS: Apply the Rule of Thirds for a balanced hairline height.
        
        HAIR PHENOTYPE (Strictly Adhere):
        - Texture: ${phenotype.hair_texture}
        - Thickness: ${phenotype.hair_thickness}
        - Color: ${phenotype.color_palette}
        - Style: ${phenotype.hairline_style}
        - Density: ${phenotype.max_density_band}

        REALISM: Add micro-irregularities and a density gradient. Do NOT change the patient's face, expression, or the background.
        Output a visual simulation photo.
      `;
      contentPayload.push({ text: masterPrompt });

      // 2. Add Context Images (Side/Donor)
      if (contextImages?.left) {
          contentPayload.push({ text: "REFERENCE: SIDE VIEW" });
          contentPayload.push({ inlineData: { data: cleanBase64(contextImages.left), mimeType: "image/jpeg" } });
      }
      if (contextImages?.donor) {
          contentPayload.push({ text: "REFERENCE: DONOR AREA" });
          contentPayload.push({ inlineData: { data: cleanBase64(contextImages.donor), mimeType: "image/jpeg" } });
      }

      // 3. Add Primary Target Image
      contentPayload.push({ text: "PRIMARY IMAGE (Apply simulation here)" });
      contentPayload.push({ inlineData: { data: cleanBase64(base64Image), mimeType: "image/jpeg" } });

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image", 
          contents: [{ parts: contentPayload }],
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

        if (imagePart && imagePart.inlineData) {
          return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
        return null;

      } catch (error) {
        console.error("Phase 2 Simulation Error:", error);
        return null;
      }
  },
};
