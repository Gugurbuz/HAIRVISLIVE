import { createClient } from 'npm:@supabase/supabase-js@2.38.4';
import type { ValidationError } from './validation.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface PromptUsageLog {
  promptName: string;
  promptVersion: string;
  executionTimeMs: number;
  tokenCount?: number;
  model: string;
  success: boolean;
  errorMessage?: string;
  inputHash?: string;
  outputSizeBytes: number;
  userId?: string;
  sessionId?: string;
}

export interface ValidationErrorLog {
  usageLogId?: string;
  promptName: string;
  promptVersion: string;
  validationSchema: string;
  errors: ValidationError[];
  rawResponse: string;
  expectedFormat: string;
}

export async function logPromptUsage(log: PromptUsageLog): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('prompt_usage_logs')
      .insert({
        prompt_name: log.promptName,
        prompt_version: log.promptVersion,
        execution_time_ms: log.executionTimeMs,
        token_count: log.tokenCount || 0,
        model: log.model,
        success: log.success,
        error_message: log.errorMessage,
        input_hash: log.inputHash,
        output_size_bytes: log.outputSizeBytes,
        user_id: log.userId,
        session_id: log.sessionId,
      })
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Failed to log prompt usage:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Exception logging prompt usage:', err);
    return null;
  }
}

export async function logValidationError(log: ValidationErrorLog): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_validation_errors')
      .insert({
        usage_log_id: log.usageLogId,
        prompt_name: log.promptName,
        prompt_version: log.promptVersion,
        validation_schema: log.validationSchema,
        errors: log.errors,
        raw_response: log.rawResponse,
        expected_format: log.expectedFormat,
      });

    if (error) {
      console.error('Failed to log validation error:', error);
    }
  } catch (err) {
    console.error('Exception logging validation error:', err);
  }
}

export function createInputHash(input: any): string {
  const str = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function measureOutputSize(output: any): number {
  return new TextEncoder().encode(JSON.stringify(output)).length;
}
