"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { button as Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, BarChart3, Users, MousePointer, Image, MessageSquare } from 'lucide-react';

interface InteractionData {
  timestamp: number;
  action: string;
  details: any;
  component: string;
}

interface SessionSummary {
  totalInteractions: number;
  actions: Record<string, number>;
  recentInteractions: InteractionData[];
}

export const UserInteractionMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [allInteractions, setAllInteractions] = useState<InteractionData[]>([]);

  const loadInteractionData = () => {
    try {
      // Load chat interface interactions
      const chatData = localStorage.getItem('user-interaction-log');
      const chatInteractions: InteractionData[] = chatData ? JSON.parse(chatData) : [];
      
      // Load content panel interactions
      const contentData = localStorage.getItem('content-panel-interactions');
      const contentInteractions: InteractionData[] = contentData ? JSON.parse(contentData) : [];
      
      // Combine all interactions
      const allData = [...chatInteractions, ...contentInteractions].sort((a, b) => b.timestamp - a.timestamp);
      setAllInteractions(allData);
      
      // Calculate session summary (last 30 minutes)
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      const sessionInteractions = allData.filter(i => i.timestamp > thirtyMinutesAgo);
      
      const summary: SessionSummary = {
        totalInteractions: sessionInteractions.length,
        actions: sessionInteractions.reduce((acc, interaction) => {
          acc[interaction.action] = (acc[interaction.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentInteractions: sessionInteractions.slice(0, 10)
      };
      
      setSessionSummary(summary);
    } catch (error) {
      console.error('Error loading interaction data:', error);
    }
  };

  const exportData = () => {
    try {
      const data = {
        sessionSummary,
        allInteractions,
        exportTimestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-interaction-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const clearData = () => {
    if (confirm('Are you sure you want to clear all interaction data?')) {
      localStorage.removeItem('user-interaction-log');
      localStorage.removeItem('content-panel-interactions');
      setAllInteractions([]);
      setSessionSummary(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadInteractionData();
    }
  }, [isVisible]);

  // Auto-refresh every 5 seconds when visible
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(loadInteractionData, 5000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            User Interaction Monitor
          </h2>
          <div className="flex gap-2">
            <Button onClick={loadInteractionData} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={clearData} size="sm" variant="destructive">
              Clear
            </Button>
            <Button onClick={() => setIsVisible(false)} size="sm">
              Close
            </Button>
          </div>
        </div>

        {sessionSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{sessionSummary.totalInteractions}</div>
                <p className="text-xs text-gray-400">Last 30 minutes</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300 flex items-center">
                  <MousePointer className="w-4 h-4 mr-2" />
                  Most Common Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(sessionSummary.actions)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 1)
                  .map(([action, count]) => (
                    <div key={action}>
                      <div className="text-lg font-semibold text-white">{action}</div>
                      <div className="text-sm text-gray-400">{count} times</div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Unique Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{Object.keys(sessionSummary.actions).length}</div>
                <p className="text-xs text-gray-400">Different types</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Breakdown */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Action Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionSummary?.actions ? (
                <div className="space-y-2">
                  {Object.entries(sessionSummary.actions)
                    .sort(([,a], [,b]) => b - a)
                    .map(([action, count]) => (
                      <div key={action} className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No interaction data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessionSummary?.recentInteractions.map((interaction, index) => (
                  <div key={index} className="text-xs border-l-2 border-blue-500 pl-2">
                    <div className="text-white font-medium">{interaction.action}</div>
                    <div className="text-gray-400">
                      {new Date(interaction.timestamp).toLocaleTimeString()}
                    </div>
                    {interaction.details && Object.keys(interaction.details).length > 0 && (
                      <div className="text-gray-500 mt-1">
                        {Object.entries(interaction.details)
                          .filter(([, value]) => value !== null && value !== undefined)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {String(value).substring(0, 20)}
                              {String(value).length > 20 ? '...' : ''}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
