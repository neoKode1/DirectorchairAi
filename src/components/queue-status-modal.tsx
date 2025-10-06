'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Clock, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { QueueRequest } from '@/hooks/useQueue';
import Image from 'next/image';

interface QueueStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: QueueRequest[];
  onCancelRequest: (requestId: string, model: string) => Promise<{ success: boolean; message: string; }>;
  onRemoveRequest: (requestId: string) => void;
}

const getStatusIcon = (status: QueueRequest['status']) => {
  switch (status) {
    case 'IN_QUEUE':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'IN_PROGRESS':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'FAILED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'CANCELLED':
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: QueueRequest['status']) => {
  switch (status) {
    case 'IN_QUEUE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'FAILED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getModelIcon = (model: string): string => {
  const modelLower = model.toLowerCase();
  
  if (modelLower.includes('flux')) {
    return '/flux.svg';
  } else if (modelLower.includes('seedream') || modelLower.includes('bytedance')) {
    return '/bytedance-color.svg';
  } else if (modelLower.includes('kling')) {
    return '/kling-color.svg';
  } else if (modelLower.includes('minimax')) {
    return '/minimax-color.svg';
  } else if (modelLower.includes('luma') || modelLower.includes('dream-machine')) {
    return '/dreammachine.png';
  } else if (modelLower.includes('gemini')) {
    return '/gemini-color.svg';
  } else if (modelLower.includes('ideogram')) {
    return '/ideogram.svg';
  } else if (modelLower.includes('nano-banana')) {
    return '/bytedance-color.svg'; // Use bytedance icon for nano-banana as well
  } else {
    return '/flux.svg'; // Default fallback
  }
};

const getProgressValue = (request: QueueRequest) => {
  switch (request.status) {
    case 'IN_QUEUE':
      return request.queuePosition ? Math.max(0, 100 - (request.queuePosition * 10)) : 10;
    case 'IN_PROGRESS':
      return 50;
    case 'COMPLETED':
      return 100;
    case 'FAILED':
    case 'CANCELLED':
      return 0;
    default:
      return 0;
  }
};

export const QueueStatusModal: React.FC<QueueStatusModalProps> = ({
  isOpen,
  onClose,
  requests,
  onCancelRequest,
  onRemoveRequest,
}) => {
  const activeRequests = requests.filter(req => 
    req.status === 'IN_QUEUE' || req.status === 'IN_PROGRESS'
  );
  const completedRequests = requests.filter(req => 
    req.status === 'COMPLETED' || req.status === 'FAILED' || req.status === 'CANCELLED'
  );

  const handleCancelRequest = async (request: QueueRequest) => {
    try {
      await onCancelRequest(request.requestId, request.model);
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const formatModelName = (model: string) => {
    const parts = model.split('/');
    return parts[parts.length - 1] || model;
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) {
      return `${duration}s`;
    } else {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}m ${seconds}s`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Generation Queue</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {activeRequests.length} Active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Active Generations ({activeRequests.length})
              </h3>
              <div className="space-y-3">
                {activeRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="relative w-6 h-6 flex-shrink-0">
                            <Image
                              src={getModelIcon(request.model)}
                              alt={`${formatModelName(request.model)} icon`}
                              fill
                              className="object-contain"
                              sizes="24px"
                            />
                          </div>
                          {getStatusIcon(request.status)}
                          <span className="text-sm font-medium text-gray-900">
                            {formatModelName(request.model)}
                          </span>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {request.prompt}
                        </p>
                        {request.queuePosition !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            Position in queue: #{request.queuePosition + 1}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={request.status !== 'IN_QUEUE'}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{getProgressValue(request)}%</span>
                      </div>
                      <Progress value={getProgressValue(request)} className="h-2" />
                    </div>

                    {/* Logs */}
                    {request.logs && request.logs.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Latest Log:</div>
                        <div className="text-xs bg-white p-2 rounded border max-h-20 overflow-y-auto">
                          {request.logs[request.logs.length - 1]?.message}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Requests */}
          {completedRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Recent Completions ({completedRequests.length})
              </h3>
              <div className="space-y-2">
                {completedRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image
                          src={getModelIcon(request.model)}
                          alt={`${formatModelName(request.model)} icon`}
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </div>
                      {getStatusIcon(request.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {formatModelName(request.model)}
                          </span>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {request.prompt}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDuration(request.createdAt, request.completedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveRequest(request.requestId)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {requests.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No active generations
              </h3>
              <p className="text-sm text-gray-500">
                Start generating content to see it appear here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
