'use client';

import React, { useEffect, useState } from 'react';
import { createLoadingEstimator, LoadingEstimator } from '@/lib/loading-estimator';

interface EnhancedLoadingModalProps {
  isOpen: boolean;
  model: string;
  onClose?: () => void;
}

export const EnhancedLoadingModal: React.FC<EnhancedLoadingModalProps> = ({
  isOpen,
  model,
  onClose
}) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing generation...');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [estimator, setEstimator] = useState<LoadingEstimator | null>(null);

  useEffect(() => {
    if (isOpen && model) {
      const newEstimator = createLoadingEstimator(model);
      setEstimator(newEstimator);
      setProgress(0);
      setStatusMessage('Initializing generation...');
      setTimeRemaining(null);

      // Update progress every 500ms
      const interval = setInterval(() => {
        if (newEstimator) {
          const currentProgress = newEstimator.getProgress();
          const currentStatus = newEstimator.getStatusMessage();
          const currentTimeRemaining = newEstimator.getEstimatedTimeRemaining();

          setProgress(currentProgress);
          setStatusMessage(currentStatus);
          setTimeRemaining(currentTimeRemaining);

          // Check if stuck
          if (newEstimator.isStuck()) {
            setStatusMessage('Generation is taking longer than expected...');
          }
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isOpen, model]);

  if (!isOpen) return null;

  const modelInfo = estimator?.getModelInfo();
  const isVideoModel = modelInfo?.category === 'video';

  // Helper function to get model icon (same as in simple-chat-interface)
  const getModelIcon = (model: string) => {
    if (model.includes('sora')) return '/openai.svg'; // Use OpenAI icon for Sora
    if (model.includes('nano-banana')) return '/gemini-color.svg';
    if (model.includes('flux')) return '/flux.svg';
    if (model.includes('kling')) return '/kling-color.svg';
    if (model.includes('endframe') || model.includes('MiniMax-Hailuo-02')) return '/minimax-color.svg'; // EndFrame uses Minimax
    if (model.includes('minimax')) return '/minimax-color.svg';
    if (model.includes('seedream') || model.includes('bytedance')) return '/bytedance-color.svg';
    if (model.includes('hunyuan')) return '/bytedance-color.svg'; // Using ByteDance icon for Hunyuan
    if (model.includes('wan-pro') || model.includes('wan/v2.2-a14b') || model.includes('wan-25-preview')) return '/alibaba-color.svg'; // Using Alibaba icon for Wan models
    if (model.includes('veo3')) return '/Gen4.png'; // Using Gen4 for Veo 3
    if (model.includes('ovi')) return '/Gen4.png'; // Using Gen4 for Ovi
    if (model.includes('luma')) return '/dreammachine.svg'; // Using Dream Machine SVG for Luma
    if (model.includes('imagen')) return '/Gen4.png';
    if (model.includes('photon')) return '/ideogram.svg';
    if (model.includes('recraft')) return '/ideogram.svg';
    return '/gemini-color.svg'; // Default fallback
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Model Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <img 
                    src={getModelIcon(model)} 
                    alt={`${model} icon`}
                    className="w-8 h-8 object-contain animate-spin"
                  />
                </div>
              </div>
              
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="text-purple-600 transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Progress Text */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-gray-600">
              {statusMessage}
            </div>
          </div>

          {/* Time Remaining */}
          {timeRemaining !== null && timeRemaining > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-500">
                Estimated time remaining: {Math.round(timeRemaining)}s
              </div>
            </div>
          )}

          {/* Model Info */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Generating with</div>
            <div className="font-medium text-gray-900">
              {model.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            {modelInfo && (
              <div className="text-xs text-gray-400 mt-1">
                Average time: {Math.round(modelInfo.averageExecutionTime)}s
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Cancel Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel Generation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
