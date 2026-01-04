import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { Settings, Activity, Search, Filter, Download, RefreshCw, Database, Zap } from 'lucide-react';

interface Session {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
  metadata: any;
}

interface AnalysisLog {
  id: string;
  session_id: string;
  operation_type: string;
  input_data: any;
  output_data: any;
  image_urls: string[];
  feature_flags: any;
  duration_ms: number | null;
  error: string | null;
  created_at: string;
}

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  config: any;
  updated_at: string;
}

export default function AdminDebugScreen() {
  const [activeTab, setActiveTab] = useState<'flags' | 'sessions' | 'logs'>('flags');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AnalysisLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshFlags } = useFeatureFlags();

  useEffect(() => {
    if (activeTab === 'flags') loadFeatureFlags();
    if (activeTab === 'sessions') loadSessions();
    if (activeTab === 'logs') loadAnalysisLogs();
  }, [activeTab]);

  const loadFeatureFlags = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('key');

      if (error) throw error;
      setFeatureFlags(data || []);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysisLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAnalysisLogs(data || []);
    } catch (error) {
      console.error('Error loading analysis logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatureFlag = async (flagId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: !currentEnabled })
        .eq('id', flagId);

      if (error) throw error;

      await loadFeatureFlags();
      await refreshFlags();
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(analysisLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analysis-logs-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredLogs = analysisLogs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.operation_type.toLowerCase().includes(searchLower) ||
      log.id.toLowerCase().includes(searchLower) ||
      log.session_id.toLowerCase().includes(searchLower) ||
      (log.error && log.error.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Debug Dashboard</h1>
          <p className="text-gray-600">Monitor system activity, manage feature flags, and review logs</p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'flags'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="inline-block w-5 h-5 mr-2" />
            Feature Flags
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'sessions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="inline-block w-5 h-5 mr-2" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'logs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="inline-block w-5 h-5 mr-2" />
            Analysis Logs
          </button>
        </div>

        {activeTab === 'flags' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Feature Flags</h2>
              <button
                onClick={loadFeatureFlags}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="inline-block w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {flag.key}
                        </code>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            flag.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {flag.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                      {Object.keys(flag.config).length > 0 && (
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">
                            Configuration
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                            {JSON.stringify(flag.config, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag(flag.id, flag.enabled)}
                      className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        flag.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {flag.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
              <button
                onClick={loadSessions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="inline-block w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <code className="text-sm font-mono text-gray-600">
                          {session.id.substring(0, 8)}...
                        </code>
                        <div className="text-sm text-gray-500 mt-1">
                          {session.user_id ? 'Authenticated' : 'Anonymous'} User
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Started: {new Date(session.started_at).toLocaleString()}</div>
                        <div>
                          Last Active: {new Date(session.last_activity_at).toLocaleString()}
                        </div>
                        {session.ended_at && (
                          <div className="text-red-600">
                            Ended: {new Date(session.ended_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    {session.metadata && (
                      <details className="text-xs text-gray-500 mt-2">
                        <summary className="cursor-pointer hover:text-gray-700">
                          Session Metadata
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                          {JSON.stringify(session.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Analysis Logs</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportLogs}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="inline-block w-4 h-4 mr-2" />
                    Export
                  </button>
                  <button
                    onClick={loadAnalysisLogs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="inline-block w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs by operation, session ID, or error..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        log.error
                          ? 'border-red-300 bg-red-50 hover:bg-red-100'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${selectedLog?.id === log.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              {log.operation_type}
                            </span>
                            {log.duration_ms && (
                              <span className="text-sm text-gray-500">
                                {log.duration_ms}ms
                              </span>
                            )}
                            {log.error && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                ERROR
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Session: {log.session_id.substring(0, 8)}... •{' '}
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedLog && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Log Details</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Operation</h4>
                    <code className="block p-3 bg-gray-50 rounded text-sm">
                      {selectedLog.operation_type}
                    </code>
                  </div>

                  {selectedLog.error && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Error</h4>
                      <code className="block p-3 bg-red-50 rounded text-sm text-red-800">
                        {selectedLog.error}
                      </code>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Input Data</h4>
                    <pre className="p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.input_data, null, 2)}
                    </pre>
                  </div>

                  {selectedLog.output_data && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Output Data</h4>
                      <pre className="p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.output_data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.image_urls && selectedLog.image_urls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Image URLs</h4>
                      <div className="space-y-1">
                        {selectedLog.image_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 hover:underline truncate"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Feature Flags State</h4>
                    <pre className="p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.feature_flags, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
