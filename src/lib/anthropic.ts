import Anthropic from '@anthropic-ai/sdk';
import { PromptHistoryEntry } from '@/data/store';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type ChatContext = {
  projectTitle?: string;
  projectDescription?: string;
  promptHistory?: PromptHistoryEntry[];
};

// Cache for the best available model
let cachedModel: string | null = null;
let lastModelCheck: number = 0;
const MODEL_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Fallback models in order of preference
const FALLBACK_MODELS = [
  'claude-sonnet-4-20250514',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-sonnet-20240229'
];

/**
 * Get the best available Claude model
 */
async function getBestAvailableModel(): Promise<string> {
  const now = Date.now();
  
  // Return cached model if still valid
  if (cachedModel && (now - lastModelCheck) < MODEL_CACHE_DURATION) {
    console.log('🔄 [Anthropic] Using cached model:', cachedModel);
    return cachedModel;
  }

  try {
    console.log('🔍 [Anthropic] Fetching available models...');
    
    // Fetch available models from Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Models API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('📋 [Anthropic] Available models:', data.data?.length || 0);

    // Find the best available model (models are sorted by recency)
    if (data.data && data.data.length > 0) {
      // Look for Claude 4 models first, then Claude 3.5, then any Claude model
      const claude4Model = data.data.find((model: any) => 
        model.id.includes('claude-4') || model.id.includes('sonnet-4')
      );
      
      const claude35Model = data.data.find((model: any) => 
        model.id.includes('claude-3-5') || model.id.includes('3.5')
      );
      
      const anyClaudeModel = data.data.find((model: any) => 
        model.id.includes('claude')
      );

      const selectedModel = claude4Model || claude35Model || anyClaudeModel || data.data[0];
      
      if (selectedModel) {
        const modelId = selectedModel.id;
        cachedModel = modelId;
        lastModelCheck = now;
        
        console.log('✅ [Anthropic] Selected model:', modelId);
        return modelId;
      }
    }
    
    throw new Error('No models available');
    
  } catch (error) {
    console.error('❌ [Anthropic] Failed to fetch models, using fallback:', error);
    
    // Use the first fallback model
    cachedModel = FALLBACK_MODELS[0];
    lastModelCheck = now;
    
    console.log('🔄 [Anthropic] Using fallback model:', cachedModel);
    return cachedModel;
  }
}

export async function chatWithAI(message: string, context?: ChatContext) {
  try {
    // Get the best available model
    const model = await getBestAvailableModel();
    
    // Format prompt history if available
    const promptHistoryText = context?.promptHistory?.length
      ? `
Recent Prompt History:
${context.promptHistory.map(entry => `
- Type: ${entry.mediaType}
  Original Prompt: ${entry.prompt}
  Enhanced Prompt: ${entry.enhancedPrompt || 'N/A'}
  Status: ${entry.status}
  ${entry.mediaUrl ? `Media URL: ${entry.mediaUrl}` : ''}
`).join('\n')}
`
      : '';

    // Format project context if available
    const projectContext = context?.projectTitle
      ? `
Current Project:
Title: ${context.projectTitle}
Description: ${context.projectDescription}
`
      : '';

    console.log('🤖 [Anthropic] Using model:', model);
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${projectContext}${promptHistoryText}

User Message: ${message}`,
      }],
      system: `You are an AI assistant for DirectorchairAI, a powerful AI-powered media studio with film director intelligence. Your role is to help users navigate and use the app effectively, with special focus on understanding their creative process through prompt history.

Key Features to Help With:
1. Media Management
   - Upload: Images, videos, music, and voiceovers
   - Generation: AI-powered content creation
   - Organization: Project-based media gallery

2. Project Settings
   - Project title and description
   - Media organization and filtering
   - Timeline management

3. Content Generation
   - Image generation with various models
   - Video creation from images or text
   - Music and voiceover synthesis
   - Style and parameter customization

4. Prompt Enhancement
   - Analyze prompt history to understand user's creative direction
   - Suggest improvements based on successful generations
   - Help refine prompts for better results
   - Explain why certain prompts work better than others

5. Best Practices
   - Use high-quality source materials
   - Organize media by type and purpose
   - Regular project saves and backups
   - Optimize for performance

Guidelines for Assistance:
1. Be concise but thorough in explanations
2. Reference past prompts when relevant to show understanding
3. Suggest improvements based on successful generations
4. Explain technical concepts in simple terms
5. Reference specific UI elements and their locations
6. Maintain context across the conversation

Remember to maintain a helpful and professional tone while focusing on practical solutions and efficient workflows. Use the project context and prompt history to provide more relevant and personalized assistance.`
    });

    // Get the first text response
    if (response.content[0]?.type === 'text') {
      return response.content[0].text;
    }

    return 'I apologize, but I received an unexpected response format.';
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return 'I apologize, but I am having trouble connecting right now. Please try again later.';
  }
}

/**
 * Get all available models from Anthropic (for debugging/admin purposes)
 */
export async function getAvailableModels() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Models API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching available models:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: errorMessage, fallbackModels: FALLBACK_MODELS };
  }
}

/**
 * Get the currently cached model
 */
export function getCurrentModel(): string | null {
  return cachedModel;
}

/**
 * Force refresh of the model cache
 */
export function refreshModelCache(): void {
  cachedModel = null;
  lastModelCheck = 0;
  console.log('🔄 [Anthropic] Model cache cleared');
} 