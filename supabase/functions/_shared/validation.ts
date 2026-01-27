import { z } from 'npm:zod@3.22.4';

export const GraftsRangeSchema = z.object({
  min: z.number().int().min(0).max(10000),
  max: z.number().int().min(0).max(10000),
}).refine((data) => data.min <= data.max, {
  message: 'Minimum grafts must be less than or equal to maximum grafts',
});

export const RecommendationsSchema = z.object({
  primary: z.string().min(1).max(200),
  supporting: z.array(z.string().max(200)).default([]),
});

export const AnalysisDetailsSchema = z.object({
  hairDensity: z.enum(['Very Low', 'Low', 'Medium', 'High', 'Very High']),
  scalpHealth: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  donorAreaQuality: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Limited']),
  candidacy: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  notes: z.string().max(2000),
});

export const ScalpAnalysisSchema = z.object({
  norwoodScale: z.string().min(1).max(100),
  hairLossPattern: z.string().min(1).max(200),
  severity: z.enum(['Minimal', 'Mild', 'Moderate', 'Severe', 'Advanced']),
  affectedAreas: z.array(z.string().max(100)).min(1),
  estimatedGrafts: z.number().int().min(0).max(10000),
  graftsRange: GraftsRangeSchema,
  confidence: z.number().min(0).max(100),
  recommendations: RecommendationsSchema,
  analysis: AnalysisDetailsSchema,
});

export type ScalpAnalysisResult = z.infer<typeof ScalpAnalysisSchema>;

export interface ValidationError {
  field: string;
  message: string;
  received?: unknown;
  expected?: string;
}

export function validateScalpAnalysis(data: unknown): {
  success: boolean;
  data?: ScalpAnalysisResult;
  errors?: ValidationError[];
} {
  try {
    const result = ScalpAnalysisSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        received: err.code === 'invalid_type' ? (err as any).received : undefined,
        expected: err.code === 'invalid_type' ? (err as any).expected : undefined,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed', received: data }],
    };
  }
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((err) => {
      let msg = `${err.field}: ${err.message}`;
      if (err.expected && err.received) {
        msg += ` (expected ${err.expected}, received ${err.received})`;
      }
      return msg;
    })
    .join('; ');
}