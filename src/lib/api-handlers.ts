import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface GenerationHandlerOptions {
  endpoint: string;
  modelName: string;
  validateInput: (input: any) => ValidationResult;
  transformInput?: (input: any) => any;
  enableLogs?: boolean;
}

// Standardized queue update handler
export function createStandardQueueHandler(modelName: string) {
  return (update: any) => {
    if (update.status === "IN_PROGRESS") {
      update.logs?.map((log: any) => log.message).forEach((message: string) => {
        console.log(`📊 [${modelName}] ${message}`);
      });
    }
  };
}

// Standardized error handler for generation APIs
export function handleGenerationError(error: unknown, modelName: string): NextResponse {
  console.error(`❌ [${modelName}] Generation error:`, error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return NextResponse.json({
    error: 'Failed to generate content',
    details: errorMessage,
    model: modelName
  }, { status: 500 });
}

// Common request validation patterns
export const commonValidations = {
  requirePrompt: (input: any): ValidationResult => {
    if (!input.prompt || !input.prompt.trim()) {
      return { isValid: false, error: 'Prompt is required' };
    }
    return { isValid: true };
  },

  requireUrl: (input: any, field: string = 'url'): ValidationResult => {
    if (!input[field] || typeof input[field] !== 'string') {
      return { isValid: false, error: `${field} is required` };
    }
    return { isValid: true };
  },

  validateImageUrl: (input: any): ValidationResult => {
    if (!input.image_url || typeof input.image_url !== 'string') {
      return { isValid: false, error: 'Image URL is required' };
    }
    return { isValid: true };
  },

  validateText: (input: any): ValidationResult => {
    if (!input.text || !input.text.trim()) {
      return { isValid: false, error: 'Text is required' };
    }
    return { isValid: true };
  }
};

// Generic generation handler factory
export function createGenerationHandler({
  endpoint,
  modelName,
  validateInput,
  transformInput = (input) => input,
  enableLogs = true
}: GenerationHandlerOptions) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      console.log(`🎬 [${modelName}] Starting generation request`);
      
      const input = await request.json();
      
      // Validate input
      const validation = validateInput(input);
      if (!validation.isValid) {
        console.error(`❌ [${modelName}] Validation error: ${validation.error}`);
        return NextResponse.json({ 
          error: validation.error,
          model: modelName
        }, { status: 400 });
      }
      
      // Transform input if needed
      const transformedInput = transformInput(input);
      
      // Make API call
      const result = await fal.subscribe(endpoint, {
        input: transformedInput,
        logs: enableLogs,
        onQueueUpdate: enableLogs ? createStandardQueueHandler(modelName) : undefined,
      });

      console.log(`✅ [${modelName}] Generation completed successfully`);
      
      return NextResponse.json({
        success: true,
        data: result.data,
        requestId: result.requestId,
        model: modelName
      });

    } catch (error) {
      return handleGenerationError(error, modelName);
    }
  };
}

// Common response formatters
export const responseFormatters = {
  success: (data: any, modelName: string, requestId?: string) => ({
    success: true,
    data,
    model: modelName,
    requestId,
    timestamp: new Date().toISOString()
  }),

  error: (error: string, modelName: string, details?: any) => ({
    success: false,
    error,
    model: modelName,
    details,
    timestamp: new Date().toISOString()
  })
};

// Input sanitizers
export const inputSanitizers = {
  sanitizePrompt: (prompt: string): string => {
    return prompt.trim().slice(0, 2000); // Limit prompt length
  },

  sanitizeNumericInput: (value: any, defaultValue: number, min?: number, max?: number): number => {
    const num = typeof value === 'number' ? value : defaultValue;
    if (min !== undefined && num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
  },

  sanitizeStringInput: (value: any, defaultValue: string, maxLength?: number): string => {
    const str = typeof value === 'string' ? value : defaultValue;
    return maxLength ? str.slice(0, maxLength) : str;
  }
};