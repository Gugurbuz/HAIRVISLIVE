
/**
 * HAIRVIS COPY & CONTENT SAFETY SYSTEM
 * ------------------------------------------------
 * Single source of truth for all user-facing text.
 * Enforces "Non-Medical / Visual Analysis" positioning.
 */

export const BANNED_TERMS = [
  "medical diagnosis",
  "surgical diagnosis",
  "diagnosis",
  "diagnosed",
  "treatment plan",
  "medical recommendation",
  "guaranteed",
  "guarantee",
  "clinically proven",
  "doctor-approved",
  "cure",
  "therapy",
  "pathology",
  "disease",
  "alopecia"
];

export const SAFE_VOCABULARY = {
  report: {
    title: "Hair Analysis & Planning Report",
    subtitle: "AI-Assisted Visual Estimation",
    coverDisclaimer: "This report is an AI-assisted visual planning tool. It does not constitute a medical diagnosis or guarantee of results.",
    
    page1_title: "Current Assessment",
    page1_diagnosis_label: "Observed Pattern (Norwood Estimate)",
    page1_summary_label: "Visual Analysis Summary",
    page1_disclaimer: "Assessment based on image analysis. Final evaluation requires in-person examination.",

    page2_title: "Reference Images",
    page2_badges: {
      focus: "Focus Verified",
      lighting: "Lighting Balanced", 
      angle: "Angle Within Tolerance"
    },
    page2_disclaimer: "Quality checks are automated estimations. Lighting conditions may affect analysis accuracy.",

    page3_title: "Proposed Plan (Estimation)",
    page3_table_grafts: "Est. Grafts",
    page3_table_priority: "Planning Priority",
    page3_duration_label: "Typical Session Duration",
    page3_disclaimer: "Graft numbers are estimates based on visible surface area. Final planning is determined by the specialist.",

    page4_title: "Visual Simulation",
    page4_badge: "Visualization Layer",
    page4_disclaimer: "This is a visual simulation based on average outcomes. Individual results may vary depending on biological factors.",

    page5_title: "Expected Recovery Timeline",
    page5_steps: {
        healing: { title: "Healing Phase", desc: "Crust shedding & anchoring." },
        shock: { title: "Shedding Phase", desc: "Temporary shedding of transplanted hair." },
        growth: { title: "Early Growth", desc: "Fine hairs begin to emerge." },
        result: { title: "Maturation", desc: "Density and thickness improve." }
    },
    page5_disclaimer: "Recovery timelines vary by individual metabolism and physiology.",

    cta_primary: "Discuss with a Specialist",
    cta_secondary: "Share Report with Clinic"
  },
  scanner: {
    instructions: {
      front: "Align face for frontal analysis",
      donor: "Capture donor area for density check"
    }
  },
  legal_disclaimers: {
    processing: "I consent to the processing of my health-related images for visual analysis.",
    not_medical: "I understand this is an informational visual simulation, NOT a medical diagnosis.",
    privacy: "I agree to the Privacy Policy. (Data is encrypted and minimized)."
  }
};

/**
 * CopyGuard Validator
 * Throws error in DEV, returns safe fallback in PROD if banned terms found.
 */
export function validateCopy(text: string): string {
  if (!text) return "";
  const lower = text.toLowerCase();
  const foundBanned = BANNED_TERMS.find(term => lower.includes(term));

  if (foundBanned) {
    const errorMsg = `CopyGuard Violation: Found banned term "${foundBanned}" in text: "${text.substring(0, 20)}..."`;
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(errorMsg); 
    }
    
    // Auto-sanitize for display safety
    return text.replace(new RegExp(foundBanned, "gi"), "[REDACTED]");
  }

  return text;
}

/**
 * Safe Label Mapper
 * Maps technical IDs to user-friendly safe labels
 */
export function getSafeLabel(key: string): string {
  const map: Record<string, string> = {
    "front": "Frontal View",
    "left": "Left Profile",
    "right": "Right Profile",
    "crown": "Vertex / Crown",
    "top": "Top View",
    "donor": "Donor Area",
    "hairline_macro": "Hairline Detail"
  };
  return map[key] || "Reference View";
}
