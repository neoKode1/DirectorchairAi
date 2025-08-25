"use client";

import { useState, useEffect } from 'react';
import { ContentFilteringLogger } from '@/lib/content-filtering-logger';

export default function ContentFilteringStats() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logger = ContentFilteringLogger.getInstance();
      setStats(logger.getFilteringStats());
      setLogs(logger.getLogsForAnalysis());
    }
  }, []);

  const refreshStats = () => {
    if (typeof window !== 'undefined') {
      const logger = ContentFilteringLogger.getInstance();
      setStats(logger.getFilteringStats());
      setLogs(logger.getLogsForAnalysis());
    }
  };

  const exportLogs = () => {
    if (typeof window !== 'undefined') {
      const logger = ContentFilteringLogger.getInstance();
      const logData = logger.exportLogs();
      const blob = new Blob([logData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-filtering-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearLogs = () => {
    if (typeof window !== 'undefined' && confirm('Are you sure you want to clear all logs?')) {
      const logger = ContentFilteringLogger.getInstance();
      logger.clearLogs();
      refreshStats();
    }
  };

  if (!stats) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        {isVisible ? 'Hide' : 'Show'} Filter Stats
      </button>

      {/* Stats Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Content Filtering Stats</h3>
            <button
              onClick={refreshStats}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>

          {/* Statistics */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Total Generations</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalGenerations}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Successful</div>
                <div className="text-xl font-bold text-green-600">{stats.successfulGenerations}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Failed</div>
                <div className="text-xl font-bold text-red-600">{stats.failedGenerations}</div>
              </div>
            </div>
          </div>

          {/* Most Filtered Terms */}
          {stats.mostFilteredTerms.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Most Filtered Terms</h4>
              <div className="space-y-1">
                {stats.mostFilteredTerms.slice(0, 5).map((term: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{term.term}</span>
                    <span className="font-medium text-red-600">{term.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={exportLogs}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
            >
              Export Logs
            </button>
            <button
              onClick={clearLogs}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
            >
              Clear Logs
            </button>
          </div>

          {/* Recent Logs Preview */}
          {logs.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Recent Activity</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {logs.slice(-3).reverse().map((log: any, index: number) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex justify-between">
                      <span className={log.success ? 'text-green-600' : 'text-red-600'}>
                        {log.success ? '✓' : '✗'}
                      </span>
                      <span className="text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-700 truncate">{log.model}</div>
                    {log.filteredTerms.length > 0 && (
                      <div className="text-gray-500">
                        {log.filteredTerms.length} terms filtered
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
