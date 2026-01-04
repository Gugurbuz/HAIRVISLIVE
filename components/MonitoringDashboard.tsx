import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Database as DatabaseIcon } from 'lucide-react';
import { monitoringService, type DashboardStats, type PromptMetrics } from '../lib/monitoring';
import type { Database } from '../lib/database.types';

type PromptUsageLog = Database['public']['Tables']['prompt_usage_logs']['Row'];
type AIValidationError = Database['public']['Tables']['ai_validation_errors']['Row'];

type TimeRange = '24h' | '7d' | '30d';

export default function MonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<PromptMetrics[]>([]);
  const [recentLogs, setRecentLogs] = useState<PromptUsageLog[]>([]);
  const [validationErrors, setValidationErrors] = useState<AIValidationError[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'errors'>('overview');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, metricsData, logsData, errorsData] = await Promise.all([
        monitoringService.getDashboardStats(timeRange),
        monitoringService.getPromptMetrics(timeRange),
        monitoringService.getRecentUsageLogs(50),
        monitoringService.getValidationErrors(false, 50),
      ]);

      setStats(statsData);
      setMetrics(metricsData);
      setRecentLogs(logsData);
      setValidationErrors(errorsData);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveError = async (errorId: string) => {
    try {
      await monitoringService.markErrorResolved(errorId, 'Resolved from dashboard');
      loadData();
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium">Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Monitoring Dashboard</h1>
            <p className="text-slate-600 mt-1">Real-time performance metrics and validation tracking</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '24h'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              30d
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Total Calls</h3>
                <Activity className="text-blue-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalCalls}</p>
              <p className="text-sm text-slate-500 mt-2">
                {stats.successfulCalls} successful, {stats.failedCalls} failed
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Success Rate</h3>
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.totalCalls > 0 ? Math.round((stats.successfulCalls / stats.totalCalls) * 100) : 0}%
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {stats.failedCalls} errors detected
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Avg Execution</h3>
                <Clock className="text-amber-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.avgExecutionTime}ms</p>
              <p className="text-sm text-slate-500 mt-2">
                Across all prompts
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Validation Errors</h3>
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.totalValidationErrors}</p>
              <p className="text-sm text-slate-500 mt-2">
                {stats.unresolvedErrors} unresolved
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Performance</h3>
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {stats.successfulCalls > 0 && stats.avgExecutionTime > 0
                  ? Math.round((stats.successfulCalls / stats.avgExecutionTime) * 100)
                  : 0}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Throughput score
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Active Prompts</h3>
                <DatabaseIcon className="text-slate-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.length}</p>
              <p className="text-sm text-slate-500 mt-2">
                Currently deployed
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-b border-slate-200 bg-white rounded-t-xl px-6 pt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prompt Metrics
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'logs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent Logs
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'errors'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Validation Errors ({validationErrors.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border border-slate-200 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Prompt Performance</h3>
              {metrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="promptName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalCalls" fill="#3b82f6" name="Total Calls" />
                    <Bar dataKey="avgExecutionTime" fill="#10b981" name="Avg Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8">No metrics data available</p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Prompt</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Calls</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Success Rate</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Avg Time</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.promptName} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{metric.promptName}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{metric.totalCalls}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            metric.successRate >= 95
                              ? 'bg-green-100 text-green-800'
                              : metric.successRate >= 80
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {metric.successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">{metric.avgExecutionTime}ms</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-slate-700">{metric.totalErrors}</span>
                        {metric.validationErrors > 0 && (
                          <span className="ml-2 text-red-600">({metric.validationErrors} validation)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Usage Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Prompt</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Version</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Duration</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{log.prompt_name}</td>
                      <td className="py-3 px-4 text-slate-600">{log.prompt_version}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{log.execution_time_ms}ms</td>
                      <td className="py-3 px-4 text-center">
                        {log.success ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Validation Errors</h3>
            {validationErrors.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                <p className="text-slate-600 font-medium">No unresolved validation errors</p>
                <p className="text-slate-500 text-sm mt-1">All AI responses are passing validation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {validationErrors.map((error) => (
                  <div key={error.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{error.prompt_name}</span>
                          <span className="text-sm text-slate-600">{error.prompt_version}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                            {error.validation_schema}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(error.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolveError(error.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Validation Errors:</p>
                      <div className="bg-white rounded p-2 text-xs font-mono text-red-700 max-h-32 overflow-y-auto">
                        {JSON.stringify(error.errors, null, 2)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Raw Response:</p>
                      <div className="bg-white rounded p-2 text-xs font-mono text-slate-600 max-h-32 overflow-y-auto">
                        {error.raw_response.substring(0, 500)}
                        {error.raw_response.length > 500 && '...'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
