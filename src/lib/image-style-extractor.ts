// Image Style Extraction Service
// This service analyzes reference images to extract cinematic styles and techniques

export interface ExtractedStyle {
  lighting: string[];
  composition: string[];
  colorPalette: string[];
  mood: string[];
  techniques: string[];
  directorMatch: string;
  confidence: number;
}

export interface StyleAnalysis {
  imageUrl: string;
  extractedStyle: ExtractedStyle;
  enhancedPrompt: string;
  directorRecommendation: string;
}

// AI-powered style extraction using various services
export class ImageStyleExtractor {
  private static instance: ImageStyleExtractor;
  
  public static getInstance(): ImageStyleExtractor {
    if (!ImageStyleExtractor.instance) {
      ImageStyleExtractor.instance = new ImageStyleExtractor();
    }
    return ImageStyleExtractor.instance;
  }

  // Extract style from image using AI analysis
  async extractStyleFromImage(imageUrl: string): Promise<StyleAnalysis> {
    try {
      console.log('🎨 [StyleExtractor] Analyzing image for style extraction:', imageUrl);
      
      // Method 1: Use Replicate's BLIP model for image analysis
      const blipAnalysis = await this.analyzeWithBLIP(imageUrl);
      
      // Method 2: Use custom prompt extraction
      const promptAnalysis = await this.extractPromptFromImage(imageUrl);
      
      // Method 3: Use visual analysis for cinematic elements
      const visualAnalysis = await this.analyzeVisualElements(imageUrl);
      
      // Combine all analyses
      const combinedStyle = this.combineAnalyses(blipAnalysis, promptAnalysis, visualAnalysis);
      
      // Match to director style
      const directorMatch = this.matchToDirectorStyle(combinedStyle);
      
      // Generate enhanced prompt
      const enhancedPrompt = this.generateEnhancedPrompt(combinedStyle, directorMatch);
      
      return {
        imageUrl,
        extractedStyle: combinedStyle,
        enhancedPrompt,
        directorRecommendation: directorMatch
      };
      
    } catch (error) {
      console.error('❌ [StyleExtractor] Error extracting style:', error);
      return this.getDefaultAnalysis(imageUrl);
    }
  }

  // Analyze image using BLIP model
  private async analyzeWithBLIP(imageUrl: string): Promise<Partial<ExtractedStyle>> {
    try {
      // This would integrate with Replicate's BLIP model
      // For now, return a placeholder analysis
      return {
        lighting: ['natural lighting', 'soft shadows'],
        composition: ['rule of thirds', 'balanced composition'],
        colorPalette: ['muted tones', 'natural colors'],
        mood: ['atmospheric', 'contemplative'],
        techniques: ['wide shot', 'steady camera'],
        confidence: 0.7
      };
    } catch (error) {
      console.error('❌ [StyleExtractor] BLIP analysis failed:', error);
      return {};
    }
  }

  // Extract prompt from image using prompt extraction models
  private async extractPromptFromImage(imageUrl: string): Promise<Partial<ExtractedStyle>> {
    try {
      // This would integrate with prompt extraction services like:
      // - Replicate's prompt-extraction models
      // - Hugging Face's image-to-prompt models
      // - Custom trained models for cinematic style extraction
      
      const response = await fetch('/api/extract-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      
      if (response.ok) {
        const result = await response.json();
        return this.parsePromptExtraction(result.prompt);
      }
      
      return {};
    } catch (error) {
      console.error('❌ [StyleExtractor] Prompt extraction failed:', error);
      return {};
    }
  }

  // Analyze visual elements for cinematic characteristics
  private async analyzeVisualElements(imageUrl: string): Promise<Partial<ExtractedStyle>> {
    try {
      // This would analyze:
      // - Color distribution and palette
      // - Lighting patterns and shadows
      // - Composition and framing
      // - Depth of field characteristics
      // - Texture and detail levels
      
      return {
        lighting: ['natural window light', 'minimal artificial'],
        composition: ['symmetrical framing', 'negative space'],
        colorPalette: ['cool tones', 'desaturated'],
        mood: ['minimalist', 'atmospheric'],
        techniques: ['controlled lighting', 'precise composition'],
        confidence: 0.8
      };
    } catch (error) {
      console.error('❌ [StyleExtractor] Visual analysis failed:', error);
      return {};
    }
  }

  // Combine multiple analyses into a single style
  private combineAnalyses(
    blipAnalysis: Partial<ExtractedStyle>,
    promptAnalysis: Partial<ExtractedStyle>,
    visualAnalysis: Partial<ExtractedStyle>
  ): ExtractedStyle {
    const combined: ExtractedStyle = {
      lighting: [],
      composition: [],
      colorPalette: [],
      mood: [],
      techniques: [],
      directorMatch: 'denis_villeneuve',
      confidence: 0.5
    };

    // Combine lighting analysis
    combined.lighting = [
      ...new Set([
        ...(blipAnalysis.lighting || []),
        ...(promptAnalysis.lighting || []),
        ...(visualAnalysis.lighting || [])
      ])
    ];

    // Combine composition analysis
    combined.composition = [
      ...new Set([
        ...(blipAnalysis.composition || []),
        ...(promptAnalysis.composition || []),
        ...(visualAnalysis.composition || [])
      ])
    ];

    // Combine color palette analysis
    combined.colorPalette = [
      ...new Set([
        ...(blipAnalysis.colorPalette || []),
        ...(promptAnalysis.colorPalette || []),
        ...(visualAnalysis.colorPalette || [])
      ])
    ];

    // Combine mood analysis
    combined.mood = [
      ...new Set([
        ...(blipAnalysis.mood || []),
        ...(promptAnalysis.mood || []),
        ...(visualAnalysis.mood || [])
      ])
    ];

    // Combine techniques analysis
    combined.techniques = [
      ...new Set([
        ...(blipAnalysis.techniques || []),
        ...(promptAnalysis.techniques || []),
        ...(visualAnalysis.techniques || [])
      ])
    ];

    // Calculate average confidence
    const confidences = [
      blipAnalysis.confidence || 0,
      promptAnalysis.confidence || 0,
      visualAnalysis.confidence || 0
    ].filter(c => c > 0);
    
    combined.confidence = confidences.length > 0 
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
      : 0.5;

    return combined;
  }

  // Match extracted style to director
  private matchToDirectorStyle(style: ExtractedStyle): string {
    const { lighting, mood, colorPalette, techniques, composition } = style;
    
    // Denis Villeneuve indicators
    if (mood.includes('atmospheric') || mood.includes('minimalist') ||
        lighting.includes('natural window light') || colorPalette.includes('muted tones')) {
      return 'denis_villeneuve';
    }
    
    // Christopher Nolan indicators
    if (lighting.includes('practical lighting') || mood.includes('realistic') ||
        techniques.includes('handheld camera') || colorPalette.includes('desaturated')) {
      return 'christopher_nolan';
    }
    
    // David Fincher indicators
    if (techniques.includes('controlled lighting') || mood.includes('precise') ||
        composition.includes('symmetrical framing')) {
      return 'david_fincher';
    }
    
    return 'denis_villeneuve'; // Default
  }

  // Generate enhanced prompt from extracted style
  private generateEnhancedPrompt(style: ExtractedStyle, director: string): string {
    let prompt = '';
    
    // Add lighting elements
    if (style.lighting.length > 0) {
      prompt += `${style.lighting.slice(0, 2).join(', ')}, `;
    }
    
    // Add composition elements
    if (style.composition.length > 0) {
      prompt += `${style.composition.slice(0, 2).join(', ')}, `;
    }
    
    // Add color palette
    if (style.colorPalette.length > 0) {
      prompt += `${style.colorPalette.slice(0, 2).join(', ')}, `;
    }
    
    // Add mood
    if (style.mood.length > 0) {
      prompt += `${style.mood.slice(0, 2).join(', ')}, `;
    }
    
    // Add director style
    prompt += `in the style of ${director.replace('_', ' ')}, `;
    
    // Add cinematic quality markers
    prompt += 'professional cinematography, high production value, cinematic quality, 8K detail';
    
    return prompt;
  }

  // Parse prompt extraction results
  private parsePromptExtraction(prompt: string): Partial<ExtractedStyle> {
    const lowerPrompt = prompt.toLowerCase();
    
    return {
      lighting: this.extractLightingTerms(lowerPrompt),
      composition: this.extractCompositionTerms(lowerPrompt),
      colorPalette: this.extractColorTerms(lowerPrompt),
      mood: this.extractMoodTerms(lowerPrompt),
      techniques: this.extractTechniqueTerms(lowerPrompt),
      confidence: 0.7
    };
  }

  // Extract lighting terms from prompt
  private extractLightingTerms(prompt: string): string[] {
    const lightingTerms = [
      'natural light', 'window light', 'backlighting', 'side lighting',
      'three-point lighting', 'practical lighting', 'minimal lighting',
      'atmospheric lighting', 'dramatic lighting', 'soft lighting'
    ];
    
    return lightingTerms.filter(term => prompt.includes(term));
  }

  // Extract composition terms from prompt
  private extractCompositionTerms(prompt: string): string[] {
    const compositionTerms = [
      'rule of thirds', 'symmetrical', 'asymmetrical', 'leading lines',
      'negative space', 'frame within frame', 'diagonal composition',
      'centered composition', 'balanced composition'
    ];
    
    return compositionTerms.filter(term => prompt.includes(term));
  }

  // Extract color terms from prompt
  private extractColorTerms(prompt: string): string[] {
    const colorTerms = [
      'muted tones', 'desaturated', 'cool tones', 'warm tones',
      'natural colors', 'earth tones', 'blues', 'grays',
      'high contrast', 'low contrast', 'monochromatic'
    ];
    
    return colorTerms.filter(term => prompt.includes(term));
  }

  // Extract mood terms from prompt
  private extractMoodTerms(prompt: string): string[] {
    const moodTerms = [
      'atmospheric', 'minimalist', 'realistic', 'authentic',
      'precise', 'controlled', 'contemplative', 'intimate',
      'expansive', 'mysterious', 'dramatic'
    ];
    
    return moodTerms.filter(term => prompt.includes(term));
  }

  // Extract technique terms from prompt
  private extractTechniqueTerms(prompt: string): string[] {
    const techniqueTerms = [
      'wide shot', 'close-up', 'extreme close-up', 'handheld camera',
      'steady camera', 'tracking shot', 'dutch angle', 'low angle',
      'establishing shot', 'long take', 'slow movement'
    ];
    
    return techniqueTerms.filter(term => prompt.includes(term));
  }

  // Get default analysis when extraction fails
  private getDefaultAnalysis(imageUrl: string): StyleAnalysis {
    return {
      imageUrl,
      extractedStyle: {
        lighting: ['natural lighting'],
        composition: ['balanced composition'],
        colorPalette: ['natural colors'],
        mood: ['atmospheric'],
        techniques: ['wide shot'],
        directorMatch: 'denis_villeneuve',
        confidence: 0.5
      },
      enhancedPrompt: 'natural lighting, balanced composition, natural colors, atmospheric, in the style of denis villeneuve, professional cinematography, high production value, cinematic quality, 8K detail',
      directorRecommendation: 'denis_villeneuve'
    };
  }
}

// Export singleton instance
export const imageStyleExtractor = ImageStyleExtractor.getInstance();
