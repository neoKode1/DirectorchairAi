// Smart Controls Agent - Automatically optimizes settings in the background
// Respects user manual selections and only overrides when user hasn't made choices

export interface SmartControlState {
  aspectRatio: {
    value: string;
    isUserSelected: boolean;
    lastUserSelection: Date | null;
  };
  contentType: {
    value: 'image' | 'video';
    isUserSelected: boolean;
    lastUserSelection: Date | null;
  };
  resolution: {
    value: string;
    isUserSelected: boolean;
    lastUserSelection: Date | null;
  };
  style: {
    value: string;
    isUserSelected: boolean;
    lastUserSelection: Date | null;
  };
}

export interface SmartAnalysisResult {
  recommendedAspectRatio: string;
  recommendedContentType: 'image' | 'video';
  recommendedResolution: string;
  recommendedStyle: string;
  confidence: number;
  reasoning: string;
  appliedOptimizations: string[];
}

export interface UserOverride {
  control: keyof SmartControlState;
  value: any;
  timestamp: Date;
}

export class SmartControlsAgent {
  private static instance: SmartControlsAgent;
  private state: SmartControlState;
  private userOverrides: Map<string, UserOverride> = new Map();
  private readonly storageKey = 'smart-controls-state';
  private readonly overrideTimeout = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.state = this.getDefaultState();
    this.loadState();
  }

  public static getInstance(): SmartControlsAgent {
    if (!SmartControlsAgent.instance) {
      SmartControlsAgent.instance = new SmartControlsAgent();
    }
    return SmartControlsAgent.instance;
  }

  private getDefaultState(): SmartControlState {
    return {
      aspectRatio: {
        value: '1:1',
        isUserSelected: false,
        lastUserSelection: null
      },
      contentType: {
        value: 'image',
        isUserSelected: false,
        lastUserSelection: null
      },
      resolution: {
        value: '1024x1024',
        isUserSelected: false,
        lastUserSelection: null
      },
      style: {
        value: 'cinematic',
        isUserSelected: false,
        lastUserSelection: null
      }
    };
  }

  // Analyze user prompt and automatically optimize settings
  async analyzeAndOptimize(userPrompt: string, hasUploadedImage: boolean = false): Promise<SmartAnalysisResult> {
    console.log('🧠 [SmartControlsAgent] Analyzing prompt for automatic optimization:', userPrompt);
    
    const analysis = await this.performSmartAnalysis(userPrompt, hasUploadedImage);
    const optimizedSettings = this.applyOptimizations(analysis);
    
    console.log('✅ [SmartControlsAgent] Optimization complete:', optimizedSettings);
    return optimizedSettings;
  }

  private async performSmartAnalysis(userPrompt: string, hasUploadedImage: boolean): Promise<any> {
    const prompt = userPrompt.toLowerCase();
    
    // Analyze content type
    const isVideoIntent = this.detectVideoIntent(prompt, hasUploadedImage);
    const isImageIntent = this.detectImageIntent(prompt, hasUploadedImage);
    
    // Analyze aspect ratio based on content
    const aspectRatio = this.detectOptimalAspectRatio(prompt, isVideoIntent);
    
    // Analyze resolution based on content type and complexity
    const resolution = this.detectOptimalResolution(prompt, isVideoIntent);
    
    // Analyze style preferences
    const style = this.detectOptimalStyle(prompt);
    
    return {
      isVideoIntent,
      isImageIntent,
      aspectRatio,
      resolution,
      style,
      confidence: this.calculateConfidence(prompt, hasUploadedImage)
    };
  }

  private detectVideoIntent(prompt: string, hasUploadedImage: boolean): boolean {
    const videoKeywords = [
      'animate', 'animation', 'video', 'motion', 'moving', 'cinematic',
      'film', 'movie', 'scene', 'action', 'movement', 'dynamic',
      'flowing', 'dancing', 'running', 'walking', 'flying', 'swimming',
      'explosion', 'transition', 'sequence', 'timeline', 'duration'
    ];
    
    const hasVideoKeywords = videoKeywords.some(keyword => prompt.includes(keyword));
    const isAnimationRequest = hasUploadedImage && (prompt.includes('animate') || prompt.includes('motion'));
    
    return hasVideoKeywords || isAnimationRequest;
  }

  private detectImageIntent(prompt: string, hasUploadedImage: boolean): boolean {
    const imageKeywords = [
      'portrait', 'landscape', 'still', 'static', 'photo', 'photograph',
      'picture', 'image', 'artwork', 'painting', 'illustration', 'drawing',
      'sketch', 'design', 'poster', 'banner', 'logo', 'icon'
    ];
    
    const hasImageKeywords = imageKeywords.some(keyword => prompt.includes(keyword));
    const isStyleTransfer = hasUploadedImage && (prompt.includes('style') || prompt.includes('transfer'));
    
    return hasImageKeywords || isStyleTransfer;
  }

  private detectOptimalAspectRatio(prompt: string, isVideo: boolean): string {
    // Video aspect ratios
    if (isVideo) {
      if (prompt.includes('portrait') || prompt.includes('vertical') || prompt.includes('phone')) {
        return '9:16';
      }
      if (prompt.includes('cinematic') || prompt.includes('movie') || prompt.includes('film')) {
        return '21:9';
      }
      if (prompt.includes('landscape') || prompt.includes('wide')) {
        return '16:9';
      }
      return '16:9'; // Default for video
    }
    
    // Image aspect ratios
    if (prompt.includes('portrait') || prompt.includes('person') || prompt.includes('face')) {
      return '3:4';
    }
    if (prompt.includes('landscape') || prompt.includes('scenery') || prompt.includes('nature')) {
      return '16:9';
    }
    if (prompt.includes('square') || prompt.includes('logo') || prompt.includes('icon')) {
      return '1:1';
    }
    if (prompt.includes('banner') || prompt.includes('poster')) {
      return '4:3';
    }
    
    return '1:1'; // Default for images
  }

  private detectOptimalResolution(prompt: string, isVideo: boolean): string {
    if (isVideo) {
      if (prompt.includes('high quality') || prompt.includes('4k') || prompt.includes('ultra')) {
        return '1080p';
      }
      if (prompt.includes('fast') || prompt.includes('quick')) {
        return '540p';
      }
      return '720p'; // Default for video
    }
    
    // Image resolutions
    if (prompt.includes('high quality') || prompt.includes('detailed') || prompt.includes('sharp')) {
      return '1536x1536';
    }
    if (prompt.includes('fast') || prompt.includes('quick')) {
      return '1024x1024';
    }
    return '1024x1024'; // Default for images
  }

  private detectOptimalStyle(prompt: string): string {
    if (prompt.includes('cinematic') || prompt.includes('movie') || prompt.includes('film')) {
      return 'cinematic';
    }
    if (prompt.includes('artistic') || prompt.includes('painting') || prompt.includes('artwork')) {
      return 'artistic';
    }
    if (prompt.includes('realistic') || prompt.includes('photorealistic') || prompt.includes('photo')) {
      return 'realistic';
    }
    if (prompt.includes('anime') || prompt.includes('cartoon') || prompt.includes('animated')) {
      return 'anime';
    }
    return 'cinematic'; // Default style
  }

  private calculateConfidence(prompt: string, hasUploadedImage: boolean): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on clear keywords
    const clearKeywords = ['portrait', 'landscape', 'cinematic', 'animate', 'video', 'photo'];
    const keywordMatches = clearKeywords.filter(keyword => prompt.includes(keyword)).length;
    confidence += keywordMatches * 0.1;
    
    // Increase confidence if image is uploaded (clearer intent)
    if (hasUploadedImage) {
      confidence += 0.2;
    }
    
    // Cap confidence at 0.95
    return Math.min(confidence, 0.95);
  }

  private applyOptimizations(analysis: any): SmartAnalysisResult {
    const optimizations: string[] = [];
    
    // Apply content type optimization (unless user recently selected)
    const contentType = this.shouldApplyOptimization('contentType') 
      ? (analysis.isVideoIntent ? 'video' : 'image')
      : this.state.contentType.value;
    
    if (this.shouldApplyOptimization('contentType')) {
      optimizations.push(`Content type optimized to: ${contentType}`);
    }
    
    // Apply aspect ratio optimization
    const aspectRatio = this.shouldApplyOptimization('aspectRatio')
      ? analysis.aspectRatio
      : this.state.aspectRatio.value;
    
    if (this.shouldApplyOptimization('aspectRatio')) {
      optimizations.push(`Aspect ratio optimized to: ${aspectRatio}`);
    }
    
    // Apply resolution optimization
    const resolution = this.shouldApplyOptimization('resolution')
      ? analysis.resolution
      : this.state.resolution.value;
    
    if (this.shouldApplyOptimization('resolution')) {
      optimizations.push(`Resolution optimized to: ${resolution}`);
    }
    
    // Apply style optimization
    const style = this.shouldApplyOptimization('style')
      ? analysis.style
      : this.state.style.value;
    
    if (this.shouldApplyOptimization('style')) {
      optimizations.push(`Style optimized to: ${style}`);
    }
    
    return {
      recommendedAspectRatio: aspectRatio,
      recommendedContentType: contentType,
      recommendedResolution: resolution,
      recommendedStyle: style,
      confidence: analysis.confidence,
      reasoning: this.generateReasoning(analysis, optimizations),
      appliedOptimizations: optimizations
    };
  }

  private shouldApplyOptimization(control: keyof SmartControlState): boolean {
    const controlState = this.state[control];
    
    // Don't apply if user recently selected this control
    if (controlState.isUserSelected && controlState.lastUserSelection) {
      const timeSinceSelection = Date.now() - controlState.lastUserSelection.getTime();
      if (timeSinceSelection < this.overrideTimeout) {
        return false;
      }
    }
    
    return true;
  }

  private generateReasoning(analysis: any, optimizations: string[]): string {
    const reasons: string[] = [];
    
    if (analysis.isVideoIntent) {
      reasons.push('Detected video intent from keywords');
    }
    if (analysis.isImageIntent) {
      reasons.push('Detected image intent from keywords');
    }
    
    if (optimizations.length > 0) {
      reasons.push(`Applied ${optimizations.length} optimizations`);
    }
    
    return reasons.join('. ');
  }

  // User manually selects a control - this overrides automatic optimization
  userSelectsControl(control: keyof SmartControlState, value: any): void {
    console.log('👤 [SmartControlsAgent] User manually selected:', control, '=', value);
    
    this.state[control] = {
      value,
      isUserSelected: true,
      lastUserSelection: new Date()
    };
    
    // Store the override
    this.userOverrides.set(control, {
      control,
      value,
      timestamp: new Date()
    });
    
    this.saveState();
  }

  // Get current optimized settings
  getOptimizedSettings(): SmartControlState {
    return { ...this.state };
  }

  // Reset user selections (allow automatic optimization again)
  resetUserSelections(): void {
    console.log('🔄 [SmartControlsAgent] Resetting user selections');
    
    // Reset each control individually to maintain type safety
    this.state.aspectRatio = {
      ...this.state.aspectRatio,
      isUserSelected: false,
      lastUserSelection: null
    };
    
    this.state.contentType = {
      ...this.state.contentType,
      isUserSelected: false,
      lastUserSelection: null
    };
    
    this.state.resolution = {
      ...this.state.resolution,
      isUserSelected: false,
      lastUserSelection: null
    };
    
    this.state.style = {
      ...this.state.style,
      isUserSelected: false,
      lastUserSelection: null
    };
    
    this.userOverrides.clear();
    this.saveState();
  }

  // Check if a control was recently manually selected
  isRecentlyUserSelected(control: keyof SmartControlState): boolean {
    const controlState = this.state[control];
    if (!controlState.isUserSelected || !controlState.lastUserSelection) {
      return false;
    }
    
    const timeSinceSelection = Date.now() - controlState.lastUserSelection.getTime();
    return timeSinceSelection < this.overrideTimeout;
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.getDefaultState(), ...parsed };
        
        // Convert date strings back to Date objects
        Object.keys(this.state).forEach(key => {
          const controlKey = key as keyof SmartControlState;
          if (this.state[controlKey].lastUserSelection) {
            this.state[controlKey].lastUserSelection = new Date(this.state[controlKey].lastUserSelection);
          }
        });
        
        console.log('📥 [SmartControlsAgent] Loaded state from localStorage');
      }
    } catch (error) {
      console.error('❌ [SmartControlsAgent] Failed to load state:', error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      console.log('💾 [SmartControlsAgent] Saved state to localStorage');
    } catch (error) {
      console.error('❌ [SmartControlsAgent] Failed to save state:', error);
    }
  }
}

// Export singleton instance
export const smartControlsAgent = SmartControlsAgent.getInstance();
