import { supabase } from './supabase';
import type { Database } from './database.types';

type PromptUsageLog = Database['public']['Tables']['prompt_usage_logs']['Row'];
type AIValidationError = Database['public']['Tables']['ai_validation_errors']['Row'];
type Prompt = Database['public']['Tables']['prompts']['Row'];

export interface PromptMetrics {
  promptName: string;
  totalCalls: number;
  successRate: number;
  avgExecutionTime: number;
  totalErrors: number;
  validationErrors: number;
}

export interface DashboardStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgExecutionTime: number;
  totalValidationErrors: number;
  unresolvedErrors: number;
}

export const monitoringService = {
  async getDashboardStats(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<DashboardStats> {
    const since = new Date();
    switch (timeRange) {
      case '24h':
        since.setHours(since.getHours() - 24);
        break;
      case '7d':
        since.setDate(since.getDate() - 7);
        break;
      case '30d':
        since.setDate(since.getDate() - 30);
        break;
    }

    const { data: logs, error: logsError } = await supabase
      .from('prompt_usage_logs')
      .select('*')
      .gte('created_at', since.toISOString());

    if (logsError) throw logsError;

    const { data: errors, error: errorsError } = await supabase
      .from('ai_validation_errors')
      .select('*')
      .gte('created_at', since.toISOString());

    if (errorsError) throw errorsError;

    const totalCalls = logs?.length || 0;
    const successfulCalls = logs?.filter(l => l.success).length || 0;
    const failedCalls = totalCalls - successfulCalls;
    const avgExecutionTime = logs?.length
      ? logs.reduce((sum, l) => sum + l.execution_time_ms, 0) / logs.length
      : 0;
    const totalValidationErrors = errors?.length || 0;
    const unresolvedErrors = errors?.filter(e => !e.resolved).length || 0;

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      avgExecutionTime: Math.round(avgExecutionTime),
      totalValidationErrors,
      unresolvedErrors,
    };
  },

  async getPromptMetrics(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<PromptMetrics[]> {
    const since = new Date();
    switch (timeRange) {
      case '24h':
        since.setHours(since.getHours() - 24);
        break;
      case '7d':
        since.setDate(since.getDate() - 7);
        break;
      case '30d':
        since.setDate(since.getDate() - 30);
        break;
    }

    const { data: logs, error: logsError } = await supabase
      .from('prompt_usage_logs')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (logsError) throw logsError;

    const { data: errors, error: errorsError } = await supabase
      .from('ai_validation_errors')
      .select('*')
      .gte('created_at', since.toISOString());

    if (errorsError) throw errorsError;

    const promptMap = new Map<string, {
      totalCalls: number;
      successfulCalls: number;
      totalExecutionTime: number;
      totalErrors: number;
      validationErrors: number;
    }>();

    logs?.forEach(log => {
      if (!promptMap.has(log.prompt_name)) {
        promptMap.set(log.prompt_name, {
          totalCalls: 0,
          successfulCalls: 0,
          totalExecutionTime: 0,
          totalErrors: 0,
          validationErrors: 0,
        });
      }

      const metrics = promptMap.get(log.prompt_name)!;
      metrics.totalCalls++;
      if (log.success) metrics.successfulCalls++;
      else metrics.totalErrors++;
      metrics.totalExecutionTime += log.execution_time_ms;
    });

    errors?.forEach(error => {
      if (promptMap.has(error.prompt_name)) {
        promptMap.get(error.prompt_name)!.validationErrors++;
      }
    });

    return Array.from(promptMap.entries()).map(([promptName, metrics]) => ({
      promptName,
      totalCalls: metrics.totalCalls,
      successRate: Math.round((metrics.successfulCalls / metrics.totalCalls) * 100),
      avgExecutionTime: Math.round(metrics.totalExecutionTime / metrics.totalCalls),
      totalErrors: metrics.totalErrors,
      validationErrors: metrics.validationErrors,
    }));
  },

  async getRecentUsageLogs(limit = 50): Promise<PromptUsageLog[]> {
    const { data, error } = await supabase
      .from('prompt_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getValidationErrors(resolved = false, limit = 50): Promise<AIValidationError[]> {
    const { data, error } = await supabase
      .from('ai_validation_errors')
      .select('*')
      .eq('resolved', resolved)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async markErrorResolved(errorId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('ai_validation_errors')
      .update({
        resolved: true,
        resolution_notes: notes,
      })
      .eq('id', errorId);

    if (error) throw error;
  },

  async getExecutionTimeTrend(promptName: string, hours = 24): Promise<Array<{ time: string; avgTime: number }>> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const { data, error } = await supabase
      .from('prompt_usage_logs')
      .select('created_at, execution_time_ms')
      .eq('prompt_name', promptName)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    const buckets = new Map<string, { sum: number; count: number }>();
    const bucketSize = Math.ceil(hours / 12);

    data.forEach(log => {
      const date = new Date(log.created_at);
      const bucketKey = new Date(
        Math.floor(date.getTime() / (bucketSize * 60 * 60 * 1000)) * bucketSize * 60 * 60 * 1000
      ).toISOString();

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, { sum: 0, count: 0 });
      }

      const bucket = buckets.get(bucketKey)!;
      bucket.sum += log.execution_time_ms;
      bucket.count++;
    });

    return Array.from(buckets.entries()).map(([time, bucket]) => ({
      time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avgTime: Math.round(bucket.sum / bucket.count),
    }));
  },

  async getActivePrompts(): Promise<Prompt[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
