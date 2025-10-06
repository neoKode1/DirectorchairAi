'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, Clock, Play } from 'lucide-react';
import Image from 'next/image';
import { QueueRequest } from '@/hooks/useQueue';

interface GenerationLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: QueueRequest[];
  onCancelRequest: (requestId: string, model: string) => Promise<{ success: boolean; message: string; }>;
}

const getModelIcon = (model: string): string => {
  const modelLower = model.toLowerCase();
  
  if (modelLower.includes('sora')) {
    return '/openai.svg'; // Use OpenAI icon for Sora
  } else if (modelLower.includes('flux')) {
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

const formatModelName = (model: string) => {
  const parts = model.split('/');
  return parts[parts.length - 1] || model;
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

export const GenerationLoadingModal: React.FC<GenerationLoadingModalProps> = ({
  isOpen,
  onClose,
  requests,
  onCancelRequest,
}) => {
  const activeRequests = requests.filter(req => 
    req.status === 'IN_QUEUE' || req.status === 'IN_PROGRESS'
  );

  const handleCancelRequest = async (request: QueueRequest) => {
    try {
      await onCancelRequest(request.requestId, request.model);
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  if (activeRequests.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Generating Content
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Active Requests */}
          <div className="space-y-4">
            {activeRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={getModelIcon(request.model)}
                      alt={`${formatModelName(request.model)} icon`}
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatModelName(request.model)}
                      </span>
                      {request.status === 'IN_QUEUE' && (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      {request.status === 'IN_PROGRESS' && (
                        <Play className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {request.status === 'IN_QUEUE' ? 'Waiting in queue' : 'Generating...'}
                    </p>
                  </div>
                  {request.status === 'IN_QUEUE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(request)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{getProgressValue(request)}%</span>
                  </div>
                  <Progress value={getProgressValue(request)} className="h-2" />
                </div>

                {request.queuePosition !== undefined && (
                  <p className="text-xs text-gray-500 mt-2">
                    Position in queue: #{request.queuePosition + 1}
                  </p>
                )}

                {/* Logs */}
                {request.logs && request.logs.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Latest Log:</div>
                    <div className="text-xs bg-white p-2 rounded border max-h-16 overflow-y-auto">
                      {request.logs[request.logs.length - 1]?.message}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Content will appear in the center panel when ready
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
