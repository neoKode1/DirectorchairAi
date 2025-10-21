import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
const SYSTEM_PROMPT = `You are an expert AI prompt engineer specializing in creating high-quality prompts for AI image and video generation. Your task is to enhance user prompts by adding relevant details, improving clarity, and ensuring they follow best practices for AI generation.

Guidelines:
1. Maintain the core intent and style of the original prompt
2. Add relevant details that would improve the quality of the generated content
3. Use clear, descriptive language
4. Include appropriate technical specifications when relevant
5. Keep the enhanced prompt concise but comprehensive
6. Focus on visual and artistic elements for image/video generation

Return only the enhanced prompt, no additional commentary or explanations.`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Dynamic model selection function
async function getBestAvailableModel(): Promise<string> {
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

      return (claude4Model || claude35Model || anyClaudeModel || data.data[0]).id;
    }
    
    throw new Error('No models available');
  } catch (error) {
    console.error('Failed to fetch models, using fallback:', error);
    return 'claude-sonnet-4-20250514';
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, type, project } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const projectInfo = !project
      ? ""
      : `
      Project Info:
      Title: ${project.title}
      Description: ${project.description}
    `.trim();

    const model = await getBestAvailableModel();
    console.log('🤖 [Enhance Prompt API] Using model:', model);

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `
          Create a prompt for generating a ${type} via AI inference. Here's the context:
          ${projectInfo}
          User prompt: ${prompt}
        `.trim(),
      }],
      system: SYSTEM_PROMPT
    });

    // Get the first text response
    if (response.content[0]?.type === 'text') {
      return NextResponse.json({ 
        enhancedPrompt: response.content[0].text.trim() 
      });
    }

    throw new Error('Failed to get response from Claude');
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
} 