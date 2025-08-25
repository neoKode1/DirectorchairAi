import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeResponse {
  success: boolean;
  result?: string;
  error?: string;
}

export class ClaudeAPI {
  private client: Anthropic | null = null;
  private isAvailable: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    if (typeof window !== 'undefined') {
      // Client-side: not available
      this.isAvailable = false;
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ [ClaudeAPI] ANTHROPIC_API_KEY not found in environment variables');
      this.isAvailable = false;
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
      this.isAvailable = true;
      console.log('✅ [ClaudeAPI] Claude API client initialized successfully');
    } catch (error) {
      console.error('❌ [ClaudeAPI] Failed to initialize Claude API client:', error);
      this.isAvailable = false;
    }
  }

  async generateConversationalResponse(userInput: string, conversationHistory: string[] = []): Promise<string> {
    if (!this.isAvailable || !this.client) {
      console.log('🔄 [ClaudeAPI] Claude API not available, using fallback');
      return this.generateFallbackResponse(userInput);
    }

    try {
      const systemPrompt = `You are DirectorchairAI, an expert film director and creative consultant with deep knowledge of AI content generation tools. You specialize in:

1. **Film Theory & Cinematography**: Deep knowledge of camera techniques, lighting, composition, and visual storytelling
2. **Director Styles**: Expertise in the techniques of directors like Denis Villeneuve, Christopher Nolan, David Fincher, Martin Scorsese, and many others
3. **Creative Development**: Helping users develop stories, characters, and visual concepts
4. **Technical Guidance**: Providing practical advice on filmmaking techniques and industry standards
5. **AI Content Generation**: Expert knowledge of the available AI models and their capabilities

**AVAILABLE AI MODELS & CAPABILITIES:**

                    **Image Generation Models:**
           - **Google Imagen 4**: Google's highest quality image generation with enhanced detail, richer lighting, and fewer artifacts
           - **Stable Diffusion 3.5 Large**: Multimodal Diffusion Transformer with improved image quality, typography, and complex prompt understanding
           - **Dreamina v3.1**: Superior picture effects with significant improvements in aesthetics, precise and diverse styles, and rich details
           - **Flux Pro 1.1 Ultra**: Professional-grade image generation with ultra quality and advanced features
           - **Flux Pro Kontext**: Advanced image generation with context-aware editing and manipulation capabilities (requires reference image)
           - **FLUX LoRA Image-to-Image**: High-performance image-to-image transformation for rapid style transfer and artistic variations (requires reference image)
- **Ideogram Character**: Generate consistent character appearances across multiple images with maintained facial features and proportions (requires reference image)

**Video Generation Models:**
- **Google Veo3 Fast**: Latest video generation with exceptional quality and realism (720p, 8 seconds)
- **Google Veo3 Standard**: High-quality video generation (1080p, 8 seconds)
- **Kling v2.1 Master (I2V)**: Enhanced quality and motion realism for image-to-video (5 seconds)
- **Kling v2.1 Master (T2V)**: Text-to-video generation with professional quality (5 seconds)
- **Luma Ray 2**: Large-scale video generation with realistic visuals and coherent motion (5 seconds)
- **Luma Ray 2 Flash (I2V)**: Fast image-to-video generation (540p, 5 seconds)
- **Minimax Hailuo 02 Standard (I2V)**: High-quality image-to-video generation (768p, 6 seconds)
- **Minimax Hailuo 02 Standard (T2V)**: Text-to-video generation (768p, 6 seconds)
- **Seedance 1.0 Pro (I2V)**: High-quality image-to-video with multiple angle shot variations (1080p, 5 seconds)

**Audio/Voice Models:**
- **ElevenLabs TTS Turbo v2.5**: High-quality text-to-speech with natural voice synthesis

**Key Features:**
- **Smart Model Selection**: AI automatically chooses the best model based on your request
- **Style Reference**: Upload images to influence the style of generated content
- **Director-Specific Enhancement**: Prompts are enhanced using director techniques and styles
- **Multiple Variants**: Image generation creates 4 variants for selection
- **Voice Input**: Use microphone for hands-free prompt creation
- **Chat Mode**: Conversational AI for brainstorming and film discussion
- **Generation Mode**: AI-powered content creation with smart controls

**CRITICAL: You MUST maintain conversation context and remember what you and the user have been discussing. Always reference previous parts of the conversation when relevant.**

Your responses should be:
- **Conversational and engaging** - like talking to a knowledgeable friend
- **Concise and focused** - keep responses brief and to the point (2-4 sentences maximum)
- **Specific and actionable** - provide concrete, practical advice
- **Contextually aware** - ALWAYS reference the conversation history when relevant
- **Educational** - teach users about filmmaking concepts efficiently
- **Encouraging** - inspire creativity and experimentation
- **Model-aware** - when users ask about capabilities, explain which models are best for their needs

**IMPORTANT**: If the user asks about something that was already discussed in the conversation, acknowledge that context and continue the discussion naturally. Never act as if you don't remember what was just talked about.

Keep your responses short, punchy, and immediately useful. Avoid lengthy explanations unless specifically requested.`;

      const conversationContext = conversationHistory.length > 0 
        ? `\n\nPrevious conversation context:\n${conversationHistory.join('\n')}`
        : '';

      const message = `User: ${userInput}${conversationContext}

Please provide a thoughtful, conversational response that demonstrates your expertise in filmmaking and creative development. Make it engaging and specific to what the user is asking about.`;

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      if (response.content && response.content.length > 0) {
        const result = response.content[0];
        if (result.type === 'text') {
          console.log('✅ [ClaudeAPI] Response generated successfully');
          return result.text.trim();
        }
      }

      throw new Error('No valid response content received');

    } catch (error) {
      console.error('❌ [ClaudeAPI] Error generating response:', error);
      return this.generateFallbackResponse(userInput);
    }
  }

  async enhancePromptWithClaude(prompt: string, contentType: string, systemPrompt?: string): Promise<string> {
    if (!this.isAvailable || !this.client) {
      console.log('🔄 [ClaudeAPI] Claude API not available for prompt enhancement');
      return prompt; // Return original prompt if API not available
    }

    try {
      // Import the genre detection function dynamically to avoid circular dependencies
      const { analyzePromptForDirectorStyle } = await import('./film-director-data');
      
      // Analyze the prompt for genre and director style
      const directorAnalysis = analyzePromptForDirectorStyle(prompt);
      console.log('🎬 [ClaudeAPI] Genre analysis:', directorAnalysis);
      
      const defaultSystemPrompt = `You are an expert film director and cinematographer with decades of experience in Hollywood. Your specialty is enhancing prompts for AI content generation to achieve cinematic, professional-grade results.

**Your Task:**
Enhance the user's prompt for ${contentType} generation by applying your director's knowledge and expertise.

**Genre Analysis:**
- Detected Genre: ${this.getGenreFromDirector(directorAnalysis.suggestedDirector)}
- Suggested Director: ${directorAnalysis.suggestedDirector}
- Style Description: ${directorAnalysis.styleDescription}
- Key Techniques: ${directorAnalysis.techniques.join(', ')}
- Lighting Approach: ${directorAnalysis.lighting.join(', ')}

**Genre-Specific Enhancement Guidelines:**

**For Horror/Thriller Content:**
- High contrast lighting with deep shadows
- Dramatic camera angles (low angle, Dutch angle)
- Tense atmosphere with practical lighting
- Close-ups for emotional impact
- Desaturated color palette with cool tones
- Handheld camera for immediacy

**For Sci-Fi/Futuristic Content:**
- Cool, artificial lighting (neon, LED, holographic)
- High-tech atmosphere with digital elements
- Clean, precise composition
- Wide shots establishing futuristic environments
- Blue/cyan color grading
- Smooth, controlled camera movements

**For Drama/Character-Driven Content:**
- Natural lighting with emotional warmth
- Close-ups emphasizing character emotion
- Soft, diffused lighting for intimacy
- Warm color palette for emotional connection
- Shallow depth of field for focus
- Gentle camera movements

**For Action/Thriller Content:**
- Dynamic lighting with movement
- Handheld camera for energy
- High contrast for dramatic impact
- Wide shots for scale and action
- Vibrant, saturated colors
- Fast-paced camera movements

**For Images:**
- Cinematic lighting (three-point lighting, chiaroscuro, golden hour, dramatic shadows)
- Professional composition (rule of thirds, leading lines, depth of field)
- Color grading and mood (warm/cool tones, contrast, saturation)
- Camera angles and perspectives (low angle, high angle, Dutch angle, close-up, wide shot)
- Film stock and texture (grain, vintage, modern, cinematic)
- Professional photography techniques (bokeh, motion blur, sharp focus)

**For Videos:**
- Cinematic movement (dolly shots, tracking shots, crane movements)
- Professional editing techniques (jump cuts, cross dissolves, match cuts)
- Dynamic camera work (handheld, steadicam, gimbal shots)
- Lighting progression and mood changes
- Color grading and LUTs (cinematic color palettes)
- Sound design considerations (diegetic vs non-diegetic)
- Pacing and rhythm (slow motion, time-lapse, real-time)

**For Audio/Music:**
- Professional mixing and mastering techniques
- Genre-specific production values
- Emotional storytelling through sound
- Spatial audio and 3D sound design
- Professional recording techniques

**Important:**
- Return ONLY the enhanced prompt, no explanations or additional text
- Make it specific, detailed, and professional
- Preserve the original intent while adding cinematic expertise
- Keep the enhanced prompt concise but comprehensive
- Focus on technical and artistic excellence
- Apply genre-specific techniques and lighting based on the detected genre`;

      const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

             const message = `Enhance this prompt for ${contentType} generation: "${prompt}"

Genre Analysis: ${directorAnalysis.styleDescription}
Key Techniques: ${directorAnalysis.techniques.join(', ')}
Lighting: ${directorAnalysis.lighting.join(', ')}

Apply your director's knowledge to create a cinematic, professional-grade prompt that will produce high-quality ${contentType} content. 

**Important:** 
- Use the specific director's techniques and lighting approach listed above
- Apply the director's signature style to the subject matter
- Focus on the detected genre and apply appropriate cinematic techniques
- Make the enhancement specific to the director's known work and style`;

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300, // Allow more tokens for prompt enhancement
        system: finalSystemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      if (response.content && response.content.length > 0) {
        const result = response.content[0];
        if (result.type === 'text') {
          console.log('✅ [ClaudeAPI] Genre-aware prompt enhancement successful');
          return result.text.trim();
        }
      }

      throw new Error('No valid response content received for prompt enhancement');

    } catch (error) {
      console.error('❌ [ClaudeAPI] Error enhancing prompt:', error);
      return prompt; // Return original prompt on error
    }
  }

  private getGenreFromDirector(directorKey: string): string {
    const genreMap: Record<string, string> = {
      'denis_villeneuve': 'Sci-Fi/Drama',
      'christopher_nolan': 'Thriller/Action',
      'david_fincher': 'Thriller/Drama',
      'martin_scorsese': 'Drama/Crime',
      'steven_spielberg': 'Adventure/Drama',
      'ridley_scott': 'Sci-Fi/Thriller',
      'guillermo_del_toro': 'Fantasy/Horror',
      'david_cronenberg': 'Horror/Thriller',
      'clint_eastwood': 'Drama/Western',
      'hayao_miyazaki': 'Fantasy/Animation',
      'akira_kurosawa': 'Drama/Action',
      'alfred_hitchcock': 'Thriller/Horror',
      'stanley_kubrick': 'Sci-Fi/Drama',
      'quentin_tarantino': 'Action/Crime',
      'wes_anderson': 'Comedy/Drama',
      'coen_brothers': 'Crime/Drama',
      'paul_thomas_anderson': 'Drama'
    };
    
    return genreMap[directorKey] || 'Drama';
  }

  private generateFallbackResponse(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
         // Model-related queries
     if (lowerInput.includes('model') || lowerInput.includes('models') || lowerInput.includes('available')) {
                                 if (lowerInput.includes('image') || lowerInput.includes('photo')) {
                 return `For images: Google Imagen 4 (highest quality), Stable Diffusion 3.5 Large (improved quality & typography), Dreamina v3.1 (superior aesthetics), Flux Pro 1.1 Ultra (professional), Flux Kontext (with reference image), FLUX LoRA (style transfer), Ideogram Character (consistent characters).`;
               }
      if (lowerInput.includes('video') || lowerInput.includes('animation')) {
        return `For videos: Veo3 (best quality), Kling v2.1 (realistic motion), Luma Ray 2 (coherent motion), Seedance Pro (multiple angles).`;
      }
      if (lowerInput.includes('audio') || lowerInput.includes('voice') || lowerInput.includes('speech')) {
        return `For audio: ElevenLabs TTS Turbo v2.5 for natural text-to-speech synthesis.`;
      }
                                  return `Available: 7 image models (Imagen 4, Stable Diffusion 3.5, Dreamina, Flux, Kontext, LoRA, Character), 9 video models (Veo3, Kling, Luma, Minimax, Seedance), 1 audio model (ElevenLabs TTS).`;
    }
    
    if (lowerInput.includes('prompt') && (lowerInput.includes('horror') || lowerInput.includes('monster') || lowerInput.includes('rat'))) {
      return `"A dimly lit basement, rats scurrying in shadows, handheld camera, practical lighting, close-up of terrified eyes."`;
    }
    
    if (lowerInput.includes('vampire') || lowerInput.includes('horror') || lowerInput.includes('scary') || lowerInput.includes('monster')) {
      return `Horror needs atmosphere! Deep shadows, practical lighting, close-ups for tension.`;
    }
    
    if (lowerInput.includes('director') || lowerInput.includes('style')) {
      return `Villeneuve: minimalism. Nolan: practical effects. Fincher: precision. Which interests you?`;
    }
    
    if (lowerInput.includes('lighting') || lowerInput.includes('light')) {
      return `Three-point lighting: key, fill, back. Warm=romantic, high contrast=drama.`;
    }
    
    if (lowerInput.includes('story') || lowerInput.includes('narrative') || lowerInput.includes('plot')) {
      return `Start with character conflict. Show, don't tell. What's your protagonist's problem?`;
    }
    
    return `What aspect of filmmaking would you like to explore?`;
  }

  isAPIAvailable(): boolean {
    return this.isAvailable;
  }
}

// Export singleton instance
export const claudeAPI = new ClaudeAPI();
