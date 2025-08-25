import React from 'react';

interface CostEstimatorProps {
  model: string;
  parameters: Record<string, any>;
  isVisible: boolean;
}

interface ModelCost {
  baseCost: number;
  unit: string;
  description: string;
  quality: 'Budget' | 'Standard' | 'Premium';
}

const MODEL_COSTS: Record<string, ModelCost> = {
  // Image Models
  'fal-ai/flux-pro/v1.1-ultra': { baseCost: 0.05, unit: 'per image', description: 'FLUX Pro Ultra', quality: 'Premium' },
  'fal-ai/flux-pro/v1.1': { baseCost: 0.03, unit: 'per image', description: 'FLUX Pro', quality: 'Standard' },
  'fal-ai/flux-pro/kontext': { baseCost: 0.03, unit: 'per image', description: 'FLUX Kontext', quality: 'Standard' },
  'fal-ai/flux-krea-lora/image-to-image': { baseCost: 0.02, unit: 'per image', description: 'FLUX LoRA', quality: 'Standard' },
  'fal-ai/imagen4/preview': { baseCost: 0.03, unit: 'per image', description: 'Google Imagen 4', quality: 'Premium' },
  'fal-ai/stable-diffusion-v35-large': { baseCost: 0.02, unit: 'per image', description: 'Stable Diffusion 3.5', quality: 'Standard' },
  'fal-ai/bytedance/dreamina/v3.1/text-to-image': { baseCost: 0.02, unit: 'per image', description: 'Dreamina v3.1', quality: 'Standard' },
  'fal-ai/ideogram/character': { baseCost: 0.02, unit: 'per image', description: 'Ideogram Character', quality: 'Standard' },
  
  // Video Models
  'fal-ai/veo3': { baseCost: 0.05, unit: 'per 5s video', description: 'Veo3', quality: 'Premium' },
  'fal-ai/kling-video/v2.1/master': { baseCost: 0.03, unit: 'per 5s video', description: 'Kling Master 2.1', quality: 'Standard' },
  'fal-ai/luma-dream-machine/ray-2': { baseCost: 0.04, unit: 'per 5s video', description: 'Luma Ray 2', quality: 'Standard' },
  'fal-ai/luma-dream-machine/ray-2-flash/image-to-video': { baseCost: 0.02, unit: 'per 5s video', description: 'Luma Ray 2 Flash', quality: 'Budget' },
  'fal-ai/minimax/video-01-live/image-to-video': { baseCost: 0.03, unit: 'per 5s video', description: 'Minimax Hailuo 02', quality: 'Standard' },
  'fal-ai/bytedance/seedance/v1/pro/image-to-video': { baseCost: 0.04, unit: 'per 5s video', description: 'Seedance 1.0 Pro', quality: 'Premium' },
  
  // Audio Models
  'fal-ai/elevenlabs/tts/turbo-v2.5': { baseCost: 0.01, unit: 'per audio', description: 'ElevenLabs TTS', quality: 'Standard' },
};

export const CostEstimator: React.FC<CostEstimatorProps> = ({ model, parameters, isVisible }) => {
  if (!isVisible || !model) return null;

  const modelCost = MODEL_COSTS[model];
  if (!modelCost) return null;

  const calculateCost = (): number => {
    let baseCost = modelCost.baseCost;
    
    // Adjust for number of images
    if (parameters.num_images) {
      baseCost *= parameters.num_images;
    }
    
    // Adjust for video duration
    if (parameters.duration) {
      const duration = parseInt(parameters.duration);
      if (duration > 5) {
        baseCost *= (duration / 5); // Cost scales with duration
      }
    }
    
    // Adjust for video resolution
    if (parameters.resolution === '512P') {
      baseCost *= 0.8; // Lower resolution costs less
    }
    
    return Math.round(baseCost * 100) / 100; // Round to 2 decimal places
  };

  const estimatedCost = calculateCost();
  
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Budget': return 'text-green-600';
      case 'Standard': return 'text-blue-600';
      case 'Premium': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityBgColor = (quality: string) => {
    switch (quality) {
      case 'Budget': return 'bg-green-100';
      case 'Standard': return 'bg-blue-100';
      case 'Premium': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Cost Estimate</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityBgColor(modelCost.quality)} ${getQualityColor(modelCost.quality)}`}>
          {modelCost.quality}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Model:</span>
          <span className="font-medium">{modelCost.description}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Cost:</span>
          <span className="font-medium">${modelCost.baseCost} {modelCost.unit}</span>
        </div>
        
        {parameters.num_images && parameters.num_images > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Variants:</span>
            <span className="font-medium">{parameters.num_images} images</span>
          </div>
        )}
        
        {parameters.duration && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{parameters.duration}s</span>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-900">Estimated Total:</span>
            <span className="text-green-600">${estimatedCost}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          💡 <strong>Cost-saving tip:</strong> Use {modelCost.quality === 'Premium' ? 'Standard' : 'Budget'} models for testing, then upgrade for final production.
        </p>
      </div>
    </div>
  );
};
