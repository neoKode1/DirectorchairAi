import { AVAILABLE_ENDPOINTS } from './fal';
import { claudeAPI } from './claude-api';
import { 
  filmDirectorData, 
  analyzePromptForDirectorStyle, 
  generateDirectorEnhancedSuggestions, 
  integrateStyleIntoPrompt, 
  generateStructuredCinematicPrompt,
  StyleReference 
} from './film-director-data';
import { imageStyleExtractor, StyleAnalysis } from './image-style-extractor';
import { jsonPromptGenerator, JSONPromptStructure } from './json-prompt-generator';
import { auteurEngine } from './auteur-engine';
import { promptAdherenceMonitor } from './prompt-adherence-monitor';
import { customStyleManager, enhancePromptWithCustomStyle, supportsCustomLoRA, filterProblematicContent } from './custom-styles';
import { ContentFilteringLogger } from './content-filtering-logger';
import { seedManager } from './seed-manager';
import { getNegativePrompt } from './negative-prompts';

// Core Intelligence System Types
export interface UserIntent {
  type: 'image' | 'video' | 'audio' | 'voiceover' | 'text' | 'analysis' | 'clarification';
  confidence: number;
  keywords: string[];
  context: string;
  requiresGeneration: boolean;
  imageUrl?: string;
  referenceImage?: string;
}

export interface ModelCapability {
  endpointId: string;
  category: string;
  label: string;
  description: string;
  strengths: string[];
  limitations: string[];
  bestFor: string[];
  efficiency: 'high' | 'medium' | 'low';
}

export interface TaskDelegation {
  modelId: string;
  reason: string;
  confidence: number;
  estimatedTime: string;
  parameters: Record<string, any>;
  intent: 'image' | 'video' | 'audio' | 'voiceover' | 'text' | 'analysis' | 'clarification';
}

export interface WorkflowStep {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  prompt: string;
  model: string;
  description: string;
  parameters: Record<string, any>;
}

export interface NextAction {
  id: string;
  label: string;
  description: string;
  type: 'image-generation' | 'video-generation' | 'scene-generation' | 'selection';
}

export interface AutomatedWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  nextActions: NextAction[];
}

export interface ConversationState {
  currentIntent: UserIntent | null;
  pendingTasks: TaskDelegation[];
  completedTasks: TaskDelegation[];
  userContext: string[];
  clarificationNeeded: boolean;
  generationAuthorized: boolean;
  imageActionType?: 'style-transfer' | 'flux-kontext' | 'animation' | 'image-edit' | 'edit' | 'extract-frame';
}

// New interfaces for Interactive Suggestions & Automated Workflows
export interface CinematicSuggestion {
  id: string;
  name: string;
  category: 'shot-type' | 'lighting' | 'movement' | 'workflow' | 'genre' | 'emotion' | 'keyword';
  description: string;
  parameterMapping: Record<string, any>;
  workflowTrigger?: string;
  requiresConfirmation: boolean;
  compatibleModes: ('image' | 'video' | 'audio')[];
}

export interface SuggestionExecutionResult {
  success: boolean;
  action: 'prompt-modification' | 'workflow-trigger' | 'direct-generation' | 'error';
  modifiedPrompt?: string;
  triggeredWorkflow?: AutomatedWorkflow;
  error?: string;
  userMessage: string;
}

export interface InteractiveSuggestionContext {
  currentPrompt: string;
  contentType: 'image' | 'video' | 'audio';
  userContext: string[];
  lastGeneratedContent?: any;
}

// Central Intelligence Core Class
export class IntelligenceCore {
  private conversationState: ConversationState;
  private modelPreferences: Record<string, string | null>;
  private claudeEnhancementEnabled: boolean = true; // Enable by default
  private styleAnalysis: any = null;

  // New properties for Interactive Suggestions
  private suggestionMappings: Map<string, CinematicSuggestion>;
  private activeWorkflows: Map<string, AutomatedWorkflow>;
  private modelCapabilities: Map<string, ModelCapability>;

  // New property for last generated image URL
  private lastGeneratedImageUrl: string | null;

  constructor() {
    console.log('🧠 [IntelligenceCore] ===== CONSTRUCTOR START =====');
    
    this.conversationState = {
      currentIntent: null,
      pendingTasks: [],
      completedTasks: [],
      userContext: [],
      clarificationNeeded: false,
      generationAuthorized: false,
    };
    
    this.modelPreferences = {
      image: null,
      video: null,
      music: null,
      voiceover: null,
    };
    
    this.suggestionMappings = new Map();
    this.activeWorkflows = new Map();
    this.lastGeneratedImageUrl = null;
    
    console.log('🧠 [IntelligenceCore] Initializing model capabilities...');
    this.modelCapabilities = this.initializeModelCapabilities();
    console.log('🧠 [IntelligenceCore] Model capabilities initialized, size:', this.modelCapabilities.size);
    
    this.initializeSuggestionMappings();
    console.log('🧠 [IntelligenceCore] Intelligence Core initialization complete');
    console.log('🤖 [ClaudeAPI] Claude AI integration enabled');
    console.log('🎬 [IntelligenceCore] Director-level prompt enhancement enabled');
    console.log('✅ [IntelligenceCore] Intelligence Core initialized successfully');
    console.log('🧠 [IntelligenceCore] ===== CONSTRUCTOR END =====');
  }

  // Determine if JSON-structured prompts should be used
  private shouldUseJSONStructure(prompt: string, contentType: string): boolean {
    // Use JSON structure for complex narrative prompts that would benefit from detailed breakdown
    const lowerPrompt = prompt.toLowerCase();
    
    console.log('🔍 [IntelligenceCore] JSON structure analysis for prompt:', prompt);
    console.log('🔍 [IntelligenceCore] Prompt length:', prompt.length);
    
    // Check for narrative complexity indicators
    const narrativeIndicators = [
      'story', 'narrative', 'scene', 'character', 'protagonist', 'antagonist',
      'plot', 'sequence', 'moment', 'situation', 'encounter', 'confrontation',
      'journey', 'quest', 'mission', 'adventure', 'exploration', 'discovery'
    ];
    
    // Check for environmental detail indicators
    const environmentalIndicators = [
      'atmosphere', 'mood', 'setting', 'environment', 'surroundings', 'location',
      'weather', 'lighting', 'shadows', 'architecture', 'interior', 'exterior',
      'landscape', 'cityscape', 'building', 'room', 'space', 'area'
    ];
    
    // Check for character interaction indicators
    const characterIndicators = [
      'interaction', 'dialogue', 'conversation', 'meeting', 'encounter',
      'conflict', 'tension', 'relationship', 'connection', 'bond'
    ];
    
    // Count how many indicators are present
    let indicatorCount = 0;
    const foundIndicators: string[] = [];
    
    for (const indicator of [...narrativeIndicators, ...environmentalIndicators, ...characterIndicators]) {
      if (lowerPrompt.includes(indicator)) {
        indicatorCount++;
        foundIndicators.push(indicator);
      }
    }
    
    // Use JSON structure if we have multiple indicators suggesting complex narrative content
    const shouldUse = indicatorCount >= 2 || prompt.length > 100;
    
    console.log(`🎬 [IntelligenceCore] JSON structure decision: ${indicatorCount} indicators, ${prompt.length} chars, use JSON: ${shouldUse}`);
    console.log(`🎬 [IntelligenceCore] Found indicators:`, foundIndicators);
    
    return shouldUse;
  }

  private generateJSONStructuredPrompt(prompt: string, contentType: string): JSONPromptStructure {
    return jsonPromptGenerator.generateJSONPrompt(prompt, contentType);
  }

  private convertJSONToNaturalLanguage(jsonStructure: JSONPromptStructure): string {
    return jsonPromptGenerator.convertToNaturalLanguage(jsonStructure);
  }

  // Initialize the mapping between UI suggestions and agent actions
  private initializeSuggestionMappings(): void {
    console.log('🎯 [IntelligenceCore] Initializing suggestion mappings for interactive commands');
    
    // Shot Type Suggestions
    this.suggestionMappings.set('low-angle shot', {
      id: 'low-angle-shot',
      name: 'Low-Angle Shot',
      category: 'shot-type',
      description: 'Camera positioned below the subject, looking up for dramatic effect',
      parameterMapping: {
        promptEnhancement: 'low angle shot, dramatic perspective, looking up',
        cameraAngle: 'low',
        mood: 'dramatic',
        power: 'heroic'
      },
      workflowTrigger: undefined,
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    this.suggestionMappings.set('dutch angle', {
      id: 'dutch-angle',
      name: 'Dutch Angle',
      category: 'shot-type',
      description: 'Tilted camera angle for disorienting or tense effect',
      parameterMapping: {
        promptEnhancement: 'dutch angle, tilted camera, disorienting perspective',
        cameraAngle: 'tilted',
        mood: 'tense',
        style: 'cinematic'
      },
      workflowTrigger: undefined,
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    this.suggestionMappings.set('close-up', {
      id: 'close-up',
      name: 'Close-Up',
      category: 'shot-type',
      description: 'Intimate shot focusing on facial expressions or details',
      parameterMapping: {
        promptEnhancement: 'extreme close-up, intimate detail, facial expression',
        shotSize: 'close-up',
        focus: 'detail',
        intimacy: 'high'
      },
      workflowTrigger: undefined,
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    // Workflow Triggers
    this.suggestionMappings.set('character variations', {
      id: 'character-variations',
      name: 'Character Variations',
      category: 'workflow',
      description: 'Generate multiple variations of the same character',
      parameterMapping: {},
      workflowTrigger: 'character-variations',
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    this.suggestionMappings.set('multiple angles', {
      id: 'multiple-angles',
      name: 'Multiple Angles',
      category: 'workflow',
      description: 'Generate the same subject from different camera angles',
      parameterMapping: {},
      workflowTrigger: 'multiple-angles',
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    this.suggestionMappings.set('scene sequence', {
      id: 'scene-sequence',
      name: 'Scene Sequence',
      category: 'workflow',
      description: 'Generate a sequence of related scenes',
      parameterMapping: {},
      workflowTrigger: 'scene-sequence',
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    // Lighting Suggestions
    this.suggestionMappings.set('soft focus', {
      id: 'soft-focus',
      name: 'Soft Focus',
      category: 'lighting',
      description: 'Gentle, diffused lighting for romantic or dreamy effect',
      parameterMapping: {
        promptEnhancement: 'soft focus, diffused lighting, dreamy atmosphere',
        lighting: 'soft',
        mood: 'romantic',
        atmosphere: 'dreamy'
      },
      workflowTrigger: undefined,
      requiresConfirmation: false,
      compatibleModes: ['image', 'video']
    });

    // Movement Suggestions
    this.suggestionMappings.set('tracking shot', {
      id: 'tracking-shot',
      name: 'Tracking Shot',
      category: 'movement',
      description: 'Camera follows the subject in motion',
      parameterMapping: {
        promptEnhancement: 'tracking shot, camera movement, following motion',
        movement: 'tracking',
        dynamism: 'high',
        style: 'cinematic'
      },
      workflowTrigger: undefined,
      requiresConfirmation: false,
      compatibleModes: ['video']
    });

    console.log(`✅ [IntelligenceCore] Initialized ${this.suggestionMappings.size} suggestion mappings`);
  }

  // Core method to handle interactive suggestion clicks
  public async handleInteractiveSuggestion(
    suggestionName: string, 
    context: InteractiveSuggestionContext
  ): Promise<SuggestionExecutionResult> {
    console.log(`🎯 [IntelligenceCore] Processing interactive suggestion: "${suggestionName}"`);
    console.log('🎯 [IntelligenceCore] Context:', context);

    try {
      // Find the suggestion mapping
      const suggestion = this.suggestionMappings.get(suggestionName.toLowerCase());
      
      if (!suggestion) {
        console.warn(`⚠️ [IntelligenceCore] No mapping found for suggestion: "${suggestionName}"`);
        return {
          success: false,
          action: 'error',
          error: `Unknown suggestion: ${suggestionName}`,
          userMessage: `I don't recognize the suggestion "${suggestionName}". Please try a different option.`
        };
      }

      // Check compatibility with current content type
      if (!suggestion.compatibleModes.includes(context.contentType)) {
        console.warn(`⚠️ [IntelligenceCore] Incompatible suggestion: ${suggestionName} for ${context.contentType}`);
        return {
          success: false,
          action: 'error',
          error: `Suggestion "${suggestionName}" is not compatible with ${context.contentType} generation`,
          userMessage: `The "${suggestionName}" suggestion is not available for ${context.contentType} generation. Try switching to a compatible mode.`
        };
      }

      // Handle workflow triggers
      if (suggestion.workflowTrigger) {
        console.log(`🔄 [IntelligenceCore] Triggering workflow: ${suggestion.workflowTrigger}`);
        const workflow = await this.createWorkflowFromTrigger(suggestion.workflowTrigger, context);
        
        return {
          success: true,
          action: 'workflow-trigger',
          triggeredWorkflow: workflow,
          userMessage: `🚀 **Automated Workflow Started!**\n\nI've initiated the "${suggestion.name}" workflow. This will generate multiple variations automatically.\n\n**Workflow Steps:**\n${workflow.steps.map((step, index) => `${index + 1}. ${step.description}`).join('\n')}\n\nStarting execution...`
        };
      }

      // Handle parameter-based suggestions
      console.log(`🎬 [IntelligenceCore] Applying cinematic parameter: ${suggestion.name}`);
      const modifiedPrompt = this.integrateSuggestionIntoPrompt(context.currentPrompt, suggestion);
      
      return {
        success: true,
        action: 'prompt-modification',
        modifiedPrompt: modifiedPrompt,
        userMessage: `🎬 **Cinematic Enhancement Applied!**\n\nI've enhanced your prompt with "${suggestion.name}" techniques:\n\n**Original:** "${context.currentPrompt}"\n**Enhanced:** "${modifiedPrompt}"\n\nReady to generate with professional cinematographic styling!`
      };

    } catch (error) {
      console.error('❌ [IntelligenceCore] Error processing interactive suggestion:', error);
      return {
        success: false,
        action: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        userMessage: `❌ **Error**: Failed to process the "${suggestionName}" suggestion. Please try again.`
      };
    }
  }

  // Integrate suggestion parameters into existing prompt with director knowledge
  private integrateSuggestionIntoPrompt(currentPrompt: string, suggestion: CinematicSuggestion): string {
    console.log(`🎬 [IntelligenceCore] Integrating suggestion into prompt with director knowledge`);
    console.log(`🎬 [IntelligenceCore] Current prompt: "${currentPrompt}"`);
    console.log(`🎬 [IntelligenceCore] Suggestion: ${suggestion.name}`);

    // Get the prompt enhancement from the suggestion
    const enhancement = suggestion.parameterMapping.promptEnhancement;
    
    if (!enhancement) {
      console.warn(`⚠️ [IntelligenceCore] No prompt enhancement found for suggestion: ${suggestion.name}`);
      return currentPrompt;
    }

    // Analyze the current prompt for director style
    const directorStyle = analyzePromptForDirectorStyle(currentPrompt);
    console.log(`🎬 [IntelligenceCore] Detected director style: ${directorStyle.suggestedDirector}`);
    console.log(`🎬 [IntelligenceCore] Style description: ${directorStyle.styleDescription}`);

    // Combine the current prompt with the enhancement
    let combinedPrompt = currentPrompt;
    
    // If the current prompt is empty or very short, use the enhancement as the base
    if (!currentPrompt.trim() || currentPrompt.trim().length < 10) {
      combinedPrompt = enhancement;
    } else {
      // Combine existing prompt with enhancement
      combinedPrompt = `${currentPrompt}, ${enhancement}`;
    }

    // Generate structured cinematic prompt using the combined prompt as the base
    const structuredPrompt = generateStructuredCinematicPrompt(combinedPrompt, directorStyle.suggestedDirector);

    console.log(`🎬 [IntelligenceCore] Generated structured cinematic prompt: "${structuredPrompt}"`);
    return structuredPrompt;
  }

  // Extract and apply style from reference image
  public async extractAndApplyImageStyle(imageUrl: string, basePrompt: string): Promise<{
    success: boolean;
    enhancedPrompt: string;
    styleAnalysis: StyleAnalysis | null;
    error?: string;
  }> {
    console.log(`🎨 [IntelligenceCore] Extracting style from image: ${imageUrl}`);
    
    try {
      // Extract style from the reference image
      const styleAnalysis = await imageStyleExtractor.extractStyleFromImage(imageUrl);
      
      if (!styleAnalysis) {
        throw new Error('Failed to extract style from image');
      }
      
      console.log(`🎨 [IntelligenceCore] Style analysis:`, styleAnalysis);
      
      // Create a style reference object
      const styleReference: StyleReference = {
        url: imageUrl,
        weight: styleAnalysis.extractedStyle.confidence,
        description: styleAnalysis.extractedStyle.mood.join(', '),
        extractedStyle: styleAnalysis.enhancedPrompt
      };
      
      // Integrate the extracted style into the base prompt
      const enhancedPrompt = integrateStyleIntoPrompt(
        basePrompt, 
        styleReference, 
        styleAnalysis.directorRecommendation
      );
      
      console.log(`🎨 [IntelligenceCore] Enhanced prompt with extracted style: "${enhancedPrompt}"`);
      
      return {
        success: true,
        enhancedPrompt,
        styleAnalysis
      };
      
    } catch (error) {
      console.error('❌ [IntelligenceCore] Error extracting image style:', error);
      return {
        success: false,
        enhancedPrompt: basePrompt,
        styleAnalysis: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create workflows from suggestion triggers
  private async createWorkflowFromTrigger(trigger: string, context: InteractiveSuggestionContext): Promise<AutomatedWorkflow> {
    console.log(`🔄 [IntelligenceCore] Creating workflow from trigger: ${trigger}`);

    // Create a basic intent for workflow creation
    const intent: UserIntent = {
      type: context.contentType as any,
      confidence: 0.9,
      keywords: [],
      context: context.currentPrompt,
      requiresGeneration: true
    };

    switch (trigger) {
      case 'character-variations':
        return await this.createCharacterVariationsWorkflow(context.currentPrompt, intent);
      case 'multiple-angles':
        return await this.createMultipleAnglesWorkflow(context.currentPrompt, intent);
      case 'scene-sequence':
        return await this.createSceneSequenceWorkflow(context.currentPrompt, intent);
      default:
        throw new Error(`Unknown workflow trigger: ${trigger}`);
    }
  }

  // Get all available suggestions for the UI
  public getAvailableSuggestions(contentType: 'image' | 'video' | 'audio'): CinematicSuggestion[] {
    const suggestions: CinematicSuggestion[] = [];
    
    for (const suggestion of this.suggestionMappings.values()) {
      if (suggestion.compatibleModes.includes(contentType)) {
        suggestions.push(suggestion);
      }
    }
    
    console.log(`📋 [IntelligenceCore] Returning ${suggestions.length} suggestions for ${contentType} mode`);
    return suggestions;
  }

  // Execute a workflow immediately (no confirmation required)
  public async executeWorkflowImmediately(workflow: AutomatedWorkflow): Promise<void> {
    console.log(`🚀 [IntelligenceCore] Executing workflow immediately: ${workflow.name}`);
    
    workflow.status = 'in-progress';
    this.activeWorkflows.set(workflow.id, workflow);
    
    // Execute each step in sequence
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      workflow.currentStep = i;
      
      console.log(`🔄 [IntelligenceCore] Executing step ${i + 1}/${workflow.steps.length}: ${step.description}`);
      
      try {
        // Create delegation for this step
        const delegation: TaskDelegation = {
          modelId: step.model,
          reason: `Workflow step: ${step.description}`,
          confidence: 0.9,
          estimatedTime: '30s',
          parameters: step.parameters,
          intent: step.type as any
        };
        
        // Execute the generation (this would integrate with the existing generation system)
        await this.executeGenerationStep(delegation);
        
        console.log(`✅ [IntelligenceCore] Step ${i + 1} completed successfully`);
        
      } catch (error) {
        console.error(`❌ [IntelligenceCore] Step ${i + 1} failed:`, error);
        workflow.status = 'failed';
        throw error;
      }
    }
    
    workflow.status = 'completed';
    console.log(`🎉 [IntelligenceCore] Workflow completed successfully`);
  }

  // Execute a single generation step (placeholder for integration)
  private async executeGenerationStep(delegation: TaskDelegation): Promise<void> {
    console.log(`⚡ [IntelligenceCore] Executing generation step with model: ${delegation.modelId}`);
    // This would integrate with the existing generation system
    // For now, we'll simulate the execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`✅ [IntelligenceCore] Generation step completed`);
  }

  // Method to enable/disable Claude Code SDK enhancement
  public enableClaudeCodeEnhancement(enable: boolean = true): void {
    this.claudeEnhancementEnabled = enable;
    console.log(`🤖 [IntelligenceCore] Claude AI enhancement ${enable ? 'enabled' : 'disabled'}`);
  }

  // Method to check if Claude Code SDK enhancement is enabled
  public isClaudeCodeEnhancementEnabled(): boolean {
    return this.claudeEnhancementEnabled;
  }

  // Initialize model capabilities from available endpoints
  private initializeModelCapabilities(): Map<string, ModelCapability> {
    console.log('🔧 [IntelligenceCore] Initializing model capabilities...');
    console.log('🔧 [IntelligenceCore] AVAILABLE_ENDPOINTS count:', AVAILABLE_ENDPOINTS.length);
    console.log('🔧 [IntelligenceCore] AVAILABLE_ENDPOINTS:', AVAILABLE_ENDPOINTS);
    
    const capabilities = new Map<string, ModelCapability>();

    AVAILABLE_ENDPOINTS.forEach((endpoint, index) => {
      console.log(`🔧 [IntelligenceCore] Processing endpoint ${index + 1}/${AVAILABLE_ENDPOINTS.length}:`, {
        endpointId: endpoint.endpointId,
        category: endpoint.category,
        label: endpoint.label,
        hasEndpointId: !!endpoint.endpointId,
        endpointIdType: typeof endpoint.endpointId
      });
      
      if (!endpoint.endpointId) {
        console.error(`❌ [IntelligenceCore] CRITICAL: Endpoint at index ${index} has no endpointId!`, endpoint);
        return; // Skip this endpoint
      }
      
      const capability: ModelCapability = {
        endpointId: endpoint.endpointId,
        category: endpoint.category,
        label: endpoint.label,
        description: endpoint.description,
        strengths: this.getModelStrengths(endpoint),
        limitations: this.getModelLimitations(endpoint),
        bestFor: this.getBestUseCases(endpoint),
        efficiency: this.getEfficiencyRating(endpoint),
      };
      
      capabilities.set(endpoint.endpointId, capability);
      console.log(`✅ [IntelligenceCore] Added capability for ${endpoint.endpointId}`);
    });

    console.log(`🔧 [IntelligenceCore] Model capabilities initialized. Total capabilities: ${capabilities.size}`);
    console.log('🔧 [IntelligenceCore] Available endpoint IDs:', Array.from(capabilities.keys()));

    return capabilities;
  }

  private getModelStrengths(endpoint: any): string[] {
    const strengths: string[] = [];
    
    switch (endpoint.category) {
      case 'image':
        strengths.push('High-quality image generation', 'Creative visual content');
        if (endpoint.endpointId.includes('flux')) {
          strengths.push('Fast generation', 'Good for prototyping');
        }
        if (endpoint.endpointId.includes('flux-krea-lora')) {
          strengths.push('Style transfer', 'LoRA adaptations', 'Rapid artistic variations');
        }
        if (endpoint.endpointId.includes('photon')) {
          strengths.push('Photorealistic results', 'Professional quality');
        }
        if (endpoint.endpointId.includes('ideogram/character')) {
          strengths.push('Consistent character appearance generation', 'Facial feature preservation', 'Character personality maintenance', 'Cross-scene character consistency', 'Branding and storytelling support', 'Multiple character variations', 'Style-aware character generation');
        }
        break;
      case 'video':
        strengths.push('Dynamic content creation', 'Motion and animation');
        if (endpoint.endpointId.includes('luma')) {
          strengths.push('Cinematic quality', 'Long-form video');
        }
        if (endpoint.endpointId.includes('pixverse')) {
          strengths.push('Fast video generation', 'Short clips');
        }
        if (endpoint.endpointId.includes('seedance')) {
          strengths.push('Multiple angle shot variations', 'Advanced camera control', 'Cinematic motion sequences');
        }
        break;
      case 'audio':
        strengths.push('Audio content generation', 'Music and sound effects');
        break;
      case 'voiceover':
        strengths.push('Text-to-speech conversion', 'Voice synthesis');
        if (endpoint.endpointId.includes('elevenlabs')) {
          strengths.push('Natural voice synthesis', 'Multiple voice options', 'High-quality audio output', 'Voice cloning capabilities', 'Emotional expression control', 'Professional narration quality');
        }
        break;
    }

    return strengths;
  }

  private getModelLimitations(endpoint: any): string[] {
    const limitations: string[] = [];
    
    switch (endpoint.category) {
      case 'image':
        limitations.push('Limited to 2D content', 'No video capabilities');
        if (endpoint.endpointId.includes('flux')) {
          limitations.push('May require multiple iterations', 'Style consistency challenges');
        }
        break;
      case 'video':
        limitations.push('Higher computational cost', 'Longer generation times');
        limitations.push('Limited duration', 'Quality vs speed trade-offs');
        break;
      case 'audio':
        limitations.push('Limited to audio content', 'No visual elements');
        break;
      case 'voiceover':
        limitations.push('Text-dependent', 'Limited emotional range');
        break;
    }

    return limitations;
  }

  private getBestUseCases(endpoint: any): string[] {
    const useCases: string[] = [];
    
    switch (endpoint.category) {
      case 'image':
        useCases.push('Marketing materials', 'Social media content', 'Concept art');
        if (endpoint.endpointId.includes('flux')) {
          useCases.push('Quick prototypes', 'Iterative design');
        }
        if (endpoint.endpointId.includes('flux-krea-lora')) {
          useCases.push('Style transfer', 'Artistic variations', 'Image transformation');
        }
        if (endpoint.endpointId.includes('photon')) {
          useCases.push('Professional photography', 'Product visualization');
        }
        if (endpoint.endpointId.includes('ideogram/character')) {
          useCases.push('Consistent character appearance generation', 'Facial feature preservation', 'Character personality maintenance', 'Cross-scene character consistency', 'Branding and storytelling support', 'Multiple character variations', 'Style-aware character generation');
        }
        break;
      case 'video':
        useCases.push('Marketing videos', 'Educational content', 'Entertainment');
        if (endpoint.endpointId.includes('luma')) {
          useCases.push('Cinematic projects', 'Long-form content');
        }
        if (endpoint.endpointId.includes('pixverse')) {
          useCases.push('Social media clips', 'Quick demonstrations');
        }
        if (endpoint.endpointId.includes('seedance')) {
          useCases.push('Cinematic sequences', 'Multi-angle storytelling', 'Dynamic camera work');
        }
        break;
      case 'audio':
        useCases.push('Background music', 'Sound effects', 'Audio branding');
        break;
      case 'voiceover':
        useCases.push('Narration', 'Accessibility content', 'Multilingual content');
        if (endpoint.endpointId.includes('elevenlabs')) {
          useCases.push('Professional voiceovers', 'Audiobook narration', 'Podcast intros', 'Video narration', 'Character voices', 'Brand voice synthesis', 'Educational content narration');
        }
        break;
    }

    return useCases;
  }

  private getEfficiencyRating(endpoint: any): 'high' | 'medium' | 'low' {
    if (endpoint.endpointId.includes('flux') || endpoint.endpointId.includes('pixverse')) {
      return 'high';
    }
    if (endpoint.endpointId.includes('photon') || endpoint.endpointId.includes('luma') || endpoint.endpointId.includes('seedance')) {
      return 'medium';
    }
    if (endpoint.endpointId.includes('flux-krea-lora')) {
      return 'medium';
    }
    if (endpoint.endpointId.includes('ideogram/character')) {
      return 'medium';
    }
    if (endpoint.endpointId.includes('elevenlabs')) {
      return 'high';
    }
    return 'low';
  }

  // Core Intelligence Functions

  /**
   * Analyzes user input to determine intent and required actions
   */
  public async analyzeUserIntent(userInput: string, forcedContentType?: 'image' | 'video' | 'audio', hasUploadedImage?: boolean): Promise<UserIntent> {
    console.log('🔍 [IntelligenceCore] Analyzing user intent:', userInput);
    console.log('🔍 [IntelligenceCore] Forced content type:', forcedContentType);
    const lowerInput = userInput.toLowerCase();
    console.log('🔍 [IntelligenceCore] Lowercase input:', lowerInput);
    
    const keywords = this.extractKeywords(lowerInput);
    console.log('🔍 [IntelligenceCore] Extracted keywords:', keywords);
    
    // Determine intent type
    let type: UserIntent['type'] = 'clarification';
    let confidence = 0.3;
    let requiresGeneration = false;

    console.log('🔍 [IntelligenceCore] Starting intent classification...');

    // If content type is forced, use it directly and return immediately
    if (forcedContentType) {
      console.log('🔍 [IntelligenceCore] Using forced content type:', forcedContentType);
      type = forcedContentType;
      confidence = 0.95; // High confidence for user-selected content type
      requiresGeneration = true;
      
      const context = this.buildContext(userInput);
      console.log('🔍 [IntelligenceCore] Built context:', context);

      const intent: UserIntent = {
        type,
        confidence,
        keywords,
        context,
        requiresGeneration,
      };

      console.log('📊 [IntelligenceCore] Final intent analysis result (forced):', intent);
      this.conversationState.currentIntent = intent;
      return intent;
    }
    // Check for conversational keywords first
    else if (this.containsConversationalKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found conversational keywords');
      type = 'clarification';
      confidence = 0.2; // Low confidence to trigger conversational response
      requiresGeneration = false;
    }
    // Check for question keywords
    else if (this.containsQuestionKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found question keywords');
      type = 'analysis';
      confidence = 0.7; // Higher confidence for questions
      requiresGeneration = false;
    }

    // Check for generation keywords (but don't generate yet)
    else if (this.containsGenerationKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found generation keywords');
      requiresGeneration = true;
      
      if (this.containsImageKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found image keywords');
        type = 'image';
        confidence = 0.9;
      } else if (this.containsVideoKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found video keywords');
        type = 'video';
        confidence = 0.9;
      } else if (this.containsAudioKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found audio keywords');
        type = 'audio';
        confidence = 0.9;
      } else if (this.containsVoiceoverKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found voiceover keywords');
        type = 'voiceover';
        confidence = 0.9;
      } else if (this.containsTextKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found text keywords');
        type = 'text';
        confidence = 0.8;
      }
    } 
    // Check for image action intents when an image is uploaded
    else if (hasUploadedImage && this.containsImageActionKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found image action keywords with uploaded image');
      requiresGeneration = true;
      
      if (this.containsStyleTransferKeywords(lowerInput)) {
        console.log('🎨 [IntelligenceCore] ===== STYLE TRANSFER KEYWORD DETECTION =====');
        console.log('🔍 [IntelligenceCore] ✅ Detected style transfer intent');
        console.log('🎨 [IntelligenceCore] Input that triggered style transfer:', lowerInput);
        type = 'image';
        confidence = 0.95;
        // Add special flag for style transfer
        this.conversationState.imageActionType = 'style-transfer';
        console.log('🎨 [IntelligenceCore] Set imageActionType to style-transfer');
      } else if (this.containsImageEditKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Detected image edit intent');
        type = 'image';
        confidence = 0.95;
        // Add special flag for image editing
        this.conversationState.imageActionType = 'image-edit';
      } else if (this.containsAnimationKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Detected animation intent');
        type = 'video';
        confidence = 0.95;
        // Add special flag for animation
        this.conversationState.imageActionType = 'animation';
      } else if (this.containsFluxKontextKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Detected flux kontext intent');
        type = 'image';
        confidence = 0.95;
        // Add special flag for flux kontext
        this.conversationState.imageActionType = 'flux-kontext';
      } else if (this.containsFrameExtractionKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Detected frame extraction intent');
        type = 'image';
        confidence = 0.95;
        // Add special flag for frame extraction
        this.conversationState.imageActionType = 'extract-frame';
      }
    }
    // Check for descriptive content that should be treated as generation requests
    else if (this.containsImageKeywords(lowerInput) || this.containsVideoKeywords(lowerInput) || this.containsAudioKeywords(lowerInput) || this.containsVoiceoverKeywords(lowerInput) || this.containsCinematicKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found descriptive content keywords');
      requiresGeneration = true;
      
      // PRIORITY: Check for video keywords first (including image-to-video indicators)
      if (this.containsVideoKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found video keywords in descriptive content');
        type = 'video';
        confidence = 0.8;
      } else if (this.containsImageKeywords(lowerInput) || this.containsCinematicKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found image/cinematic keywords in descriptive content');
        type = 'image';
        confidence = 0.8;
      } else if (this.containsAudioKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found audio keywords in descriptive content');
        type = 'audio';
        confidence = 0.8;
      } else if (this.containsVoiceoverKeywords(lowerInput)) {
        console.log('🔍 [IntelligenceCore] ✅ Found voiceover keywords in descriptive content');
        type = 'voiceover';
        confidence = 0.8;
      }
    }
    // Special case for director-specific prompts (e.g., "Directed by Rob Zombie")
    else if (lowerInput.includes('directed by') || this.containsDirectorNames(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found director-specific prompt, treating as image generation');
      requiresGeneration = true;
      type = 'image';
      confidence = 0.9;
    }
    // Special case for cinematic/visual descriptive content that should be treated as image generation
    else if (this.containsCinematicKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found cinematic keywords, treating as image generation');
      requiresGeneration = true;
      type = 'image';
      confidence = 0.7;
    } else if (this.containsAnalysisKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Found analysis keywords');
      type = 'analysis';
      confidence = 0.8;
    } 
    // FALLBACK: Treat descriptive content as image generation requests
    else if (userInput.trim().length > 0 && !this.containsConversationalKeywords(lowerInput) && !this.containsQuestionKeywords(lowerInput)) {
      console.log('🔍 [IntelligenceCore] ✅ Treating descriptive content as image generation request');
      requiresGeneration = true;
      type = 'image';
      confidence = 0.6;
    } else {
      console.log('🔍 [IntelligenceCore] ❌ No specific keywords found, defaulting to clarification');
    }

    const context = this.buildContext(userInput);
    console.log('🔍 [IntelligenceCore] Built context:', context);

    const intent: UserIntent = {
      type,
      confidence,
      keywords,
      context,
      requiresGeneration,
    };

    // Apply Claude AI enhancement if enabled
    if (this.claudeEnhancementEnabled && claudeAPI.isAPIAvailable()) {
      console.log('🤖 [IntelligenceCore] Applying Claude AI enhancement to intent analysis');
      try {
        // Use Claude AI to enhance intent analysis
        const systemPrompt = `You are an expert AI content generation analyst. Your task is to enhance user intent analysis for content generation requests.

**Your Task:**
Analyze the user input and enhance the current intent analysis with better keyword detection and confidence scoring.

**Analysis Guidelines:**
- Identify content type (image, video, audio, text)
- Extract relevant keywords and themes
- Assess confidence level (0-1)
- Determine if generation is required
- Provide context and clarification needs

**Return Format:**
Return only a valid JSON object with the enhanced UserIntent structure:
{
  "type": "image|video|audio|text|analysis|clarification",
  "confidence": 0.0-1.0,
  "keywords": ["keyword1", "keyword2"],
  "context": "context description",
  "requiresGeneration": true|false
}

**Important:**
- Return ONLY valid JSON, no explanations
- Preserve the original intent structure
- Enhance with additional insights and keywords
- Improve confidence scoring based on clarity`;

        const userMessage = `Analyze this user input and enhance the intent analysis: "${userInput}"

Current intent: ${JSON.stringify(intent)}

Provide enhanced intent analysis with better keyword detection and confidence scoring. Return only valid JSON.`;

        const enhancedIntentResponse = await claudeAPI.generateConversationalResponse(userMessage, [systemPrompt]);
        
        if (enhancedIntentResponse && enhancedIntentResponse.trim()) {
          try {
            // Try to parse the response as JSON
            const enhancedIntent = JSON.parse(enhancedIntentResponse.trim());
            console.log('✅ [IntelligenceCore] Claude AI intent analysis successful');
        this.conversationState.currentIntent = enhancedIntent;
            return enhancedIntent as UserIntent;
          } catch (parseError) {
            console.log('⚠️ [IntelligenceCore] Failed to parse Claude AI response as JSON:', parseError);
          }
        }
      } catch (error) {
        console.error('❌ [IntelligenceCore] Claude AI enhancement failed, using original intent:', error);
      }
    }

    console.log('📊 [IntelligenceCore] Final intent analysis result:', intent);
    this.conversationState.currentIntent = intent;
    return intent;
  }

  private extractKeywords(input: string): string[] {
    const keywords: string[] = [];
    
    // Technical terms
    const technicalTerms = ['generate', 'create', 'make', 'build', 'produce', 'render'];
    technicalTerms.forEach(term => {
      if (input.includes(term)) keywords.push(term);
    });

    // Content types
    const contentTypes = ['image', 'video', 'audio', 'voice', 'text', 'photo', 'picture', 'movie', 'music', 'sound'];
    contentTypes.forEach(type => {
      if (input.includes(type)) keywords.push(type);
    });

    // Style indicators
    const styleTerms = ['realistic', 'artistic', 'cinematic', 'professional', 'casual', 'modern', 'vintage'];
    styleTerms.forEach(style => {
      if (input.includes(style)) keywords.push(style);
    });

    // Conversational terms
    const conversationalTerms = ['hello', 'hi', 'hey', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    conversationalTerms.forEach(term => {
      if (input.toLowerCase().includes(term)) keywords.push(term);
    });

    return keywords;
  }

  private containsGenerationKeywords(input: string): boolean {
    const generationWords = ['generate', 'create', 'make', 'build', 'produce', 'render', 'generate'];
    return generationWords.some(word => input.includes(word));
  }

  private containsImageKeywords(input: string): boolean {
    const imageWords = [
      'image', 'photo', 'picture', 'photograph', 'visual', 'artwork', 
      'crow', 'silhouette', 'composition', 'detailed', 'photorealistic', 'majestic', 'dramatic',
      'batman', 'superhero', 'cape', 'suit', 'costume', 'character', 'portrait', 'scene',
      'gotham', 'city', 'skyline', 'night', 'moon', 'lighting', 'atmospheric', 'noir',
      'futuristic', 'tech', 'glowing', 'elements', 'rooftop', 'alley', 'background',
      'shot', 'wide shot', 'close-up', 'angle', 'perspective', 'cinematic', 'camera',
      'tower', 'towers', 'server', 'servers', 'industrial', 'windows', 'shadows',
      'geometric', 'data', 'cores', 'lights', 'sunlight', 'rendering', 'resolution',
      'christopher nolan', 'nolan', 'dramatic', 'low angle', 'looking up', 'towering',
      'golden hour', 'amber', 'blue', 'warm', 'cool', 'contrasting', '8k'
    ];
    const found = imageWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking image keywords:', { input, imageWords, found });
    return found;
  }

  private containsVideoKeywords(input: string): boolean {
    const videoWords = ['video', 'movie', 'animation', 'motion', 'clip', 'footage', 'image-to-video', 'i2v'];
    const hasVideoKeywords = videoWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    
    // Check for image-to-video indicators
    const hasImageUpload = input.includes('[Image uploaded:') && input.includes('requesting image-to-video animation');
    const hasLastGeneratedImage = input.includes('[Last generated image:') && input.includes('requesting image-to-video animation');
    
    const result = hasVideoKeywords || hasImageUpload || hasLastGeneratedImage;
    
    console.log('🔍 [IntelligenceCore] Checking video keywords:', { 
      input, 
      videoWords, 
      hasVideoKeywords, 
      hasImageUpload,
      hasLastGeneratedImage,
      result
    });
    
    return result;
  }

  private containsAudioKeywords(input: string): boolean {
    const audioWords = ['audio', 'music', 'sound', 'melody', 'tune', 'audio'];
    return audioWords.some(word => input.includes(word));
  }

  private containsVoiceoverKeywords(input: string): boolean {
    const voiceWords = [
      'voice', 'speech', 'narration', 'tts', 'text-to-speech', 'voiceover', 'voice over',
      'speak', 'talk', 'say', 'tell', 'read', 'audio narration', 'voice synthesis',
      'elevenlabs', 'eleven labs', 'voice cloning', 'voice generation', 'speech synthesis',
      'audiobook', 'podcast', 'voice actor', 'voice talent', 'voice recording'
    ];
    return voiceWords.some(word => input.includes(word));
  }

  private containsTextKeywords(input: string): boolean {
    const textWords = ['text', 'content', 'writing', 'article', 'story', 'description'];
    return textWords.some(word => input.includes(word));
  }

  private containsAnalysisKeywords(input: string): boolean {
    const analysisWords = ['analyze', 'review', 'examine', 'study', 'evaluate', 'assess'];
    return analysisWords.some(word => input.includes(word));
  }

  private containsConversationalKeywords(input: string): boolean {
    const conversationalWords = ['hello', 'hi', 'hey', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up'];
    const found = conversationalWords.some(word => input.toLowerCase().includes(word));
    console.log('🔍 [IntelligenceCore] Checking conversational keywords:', { input, conversationalWords, found });
    return found;
  }

  private containsQuestionKeywords(input: string): boolean {
    const questionWords = ['who', 'what', 'when', 'where', 'why', 'how', 'do you know', 'can you tell me', 'what is', 'who is'];
    const found = questionWords.some(word => input.toLowerCase().includes(word));
    console.log('🔍 [IntelligenceCore] Checking question keywords:', { input, questionWords, found });
    return found;
  }

  private containsCinematicKeywords(input: string): boolean {
    const cinematicWords = [
      'cinematic', 'wide shot', 'close-up', 'angle', 'perspective', 'camera',
      'dramatic', 'lighting', 'shadows', 'composition', 'framing', 'depth of field',
      'bokeh', 'golden hour', 'blue hour', 'atmospheric', 'mood', 'tone',
      'color grading', 'contrast', 'saturation', 'vibrance', 'hue', 'tint',
      'film grain', 'texture', 'resolution', 'quality', 'professional',
      'hollywood', 'movie', 'film', 'cinematography', 'director', 'style',
      'directed by', 'aesthetic', 'horror', 'industrial', 'gritty', 'desaturated',
      'high contrast', 'red accents', 'grainy', 'film texture', 'vintage',
      'noir', 'neo-noir', 'thriller', 'suspense', 'dark', 'moody', 'ominous',
      'creepy', 'eerie', 'macabre', 'gothic', 'surreal', 'dreamlike', 'nightmare',
      'disturbing', 'unsettling', 'haunting', 'chilling', 'spine-chilling'
    ];
    const found = cinematicWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking cinematic keywords:', { input, cinematicWords, found });
    return found;
  }

  private containsImageActionKeywords(input: string): boolean {
    const actionWords = [
      'style', 'transfer', 'look like', 'similar to', 'mimic', 'painting', 'artistic', 'filter',
      'background', 'scene', 'environment', 'setting', 'context', 'surroundings',
      'animate', 'move', 'motion', 'video', 'cinematic', 'action', 'dynamic',
      'edit', 'modify', 'change', 'transform', 'alter', 'adjust', 'enhance', 'improve'
    ];
    const found = actionWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking image action keywords:', { input, actionWords, found });
    return found;
  }

  private containsStyleTransferKeywords(input: string): boolean {
    const styleTransferWords = [
      'style', 'transfer', 'look like', 'similar to', 'mimic', 'painting', 'artistic', 'filter',
      'oil painting', 'watercolor', 'sketch', 'drawing', 'cartoon', 'anime', 'comic',
      'vintage', 'retro', 'modern', 'classic', 'abstract', 'impressionist', 'realistic'
    ];
    const found = styleTransferWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🎨 [IntelligenceCore] Style transfer keyword check:', { 
      input, 
      styleTransferWords, 
      found,
      matchingWords: styleTransferWords.filter(word => input.toLowerCase().includes(word.toLowerCase()))
    });
    return found;
  }

  private containsFluxKontextKeywords(input: string): boolean {
    const fluxKontextWords = [
      'add background', 'change background', 'new scene', 'different environment',
      'replace background', 'swap background', 'new setting', 'different scene',
      'background context', 'scene context', 'environment context'
    ];
    const found = fluxKontextWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking flux kontext keywords:', { input, fluxKontextWords, found });
    return found;
  }

  private containsFrameExtractionKeywords(input: string): boolean {
    const frameExtractionWords = [
      'extract frame', 'get frame', 'take frame', 'capture frame',
      'first frame', 'middle frame', 'last frame', 'key frame',
      'extract image from video', 'get image from video', 'capture image from video',
      'video thumbnail', 'video preview', 'video still'
    ];
    const found = frameExtractionWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking frame extraction keywords:', { input, frameExtractionWords, found });
    return found;
  }

  private containsAnimationKeywords(input: string): boolean {
    const animationWords = [
      'animate', 'move', 'motion', 'video', 'cinematic', 'action', 'dynamic',
      'make it move', 'bring to life', 'add motion', 'create video', 'generate video'
    ];
    const found = animationWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking animation keywords:', { input, animationWords, found });
    return found;
  }

  private containsImageEditKeywords(input: string): boolean {
    const imageEditWords = [
      'edit', 'modify', 'change', 'transform', 'alter', 'adjust', 'enhance', 'improve',
      'fix', 'correct', 'retouch', 'modify', 'adjust', 'tweak', 'refine', 'polish',
      'edit this', 'modify this', 'change this', 'transform this', 'alter this'
    ];
    const found = imageEditWords.some(word => input.toLowerCase().includes(word.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking image edit keywords:', { input, imageEditWords, found });
    return found;
  }

  private containsDirectorNames(input: string): boolean {
    const directorNames = [
      'rob zombie', 'christopher nolan', 'quentin tarantino', 'david fincher',
      'wes anderson', 'tim burton', 'guillermo del toro', 'ridley scott',
      'james cameron', 'steven spielberg', 'martin scorsese', 'coen brothers',
      'paul thomas anderson', 'darren aronofsky', 'gaspar noé', 'david lynch',
      'stanley kubrick', 'alfred hitchcock', 'federico fellini', 'ingmar bergman',
      'akira kurosawa', 'fritz lang', 'orson welles', 'jean-luc godard'
    ];
    const found = directorNames.some(name => input.toLowerCase().includes(name.toLowerCase()));
    console.log('🔍 [IntelligenceCore] Checking director names:', { input, directorNames, found });
    return found;
  }

  private buildContext(input: string): string {
    // Use the full user input as context for generation
    return input.trim();
  }

  /**
   * Extracts explicit model specifications from user input
   * Supports various formats: "using Flux", "with Veo3", "via Luma", etc.
   */
  private extractExplicitModelFromInput(input: string): string | null {
    const lowerInput = input.toLowerCase();
    
    // Common model specification patterns
    const modelPatterns = [
      /using\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /with\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /via\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /on\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /through\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /generate\s+.*?\s+using\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /create\s+.*?\s+with\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i,
      /make\s+.*?\s+via\s+([a-zA-Z0-9\-\s]+?)(?:\s|$|,|\.)/i
    ];
    
    for (const pattern of modelPatterns) {
      const match = lowerInput.match(pattern);
      if (match && match[1]) {
        const modelName = match[1].trim();
        // Filter out common words that aren't model names
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        if (!commonWords.includes(modelName) && modelName.length > 2) {
          console.log('🔍 [IntelligenceCore] Found explicit model specification:', modelName);
          return modelName;
        }
      }
    }
    
    // Check for direct model names in the input
    const allModels = this.getModelCapabilities();
    for (const model of allModels) {
      const modelName = model.label.toLowerCase();
      const endpointId = model.endpointId.toLowerCase();
      
      if (lowerInput.includes(modelName) || lowerInput.includes(endpointId.split('/').pop() || '')) {
        console.log('🔍 [IntelligenceCore] Found direct model reference:', model.label);
        return model.label;
      }
    }
    
    return null;
  }

  /**
   * Applies flexible workflow rules for intelligent assistance
   * Only used when no explicit model is specified by the user
   */
  private async applyFlexibleWorkflowRules(intent: UserIntent, preferredModelId: string | null): Promise<ModelCapability | undefined> {
    console.log('🎯 [IntelligenceCore] Applying flexible workflow rules for intelligent assistance');
    console.log('🎯 [IntelligenceCore] Intent type:', intent.type);
    console.log('🎯 [IntelligenceCore] Intent context:', intent.context);
    console.log('🎯 [IntelligenceCore] Preferred model ID:', preferredModelId);
    console.log('🎯 [IntelligenceCore] Model capabilities size:', this.modelCapabilities.size);
    
    let selectedModel: ModelCapability | undefined;

    // RULE 3: Video Generation - Use preferred video model or optimal default
    if (intent.type === 'video') {
      console.log('🎬 [IntelligenceCore] Applying Rule 3: Video Generation');
      
      if (preferredModelId) {
        // Use user's preferred video model
        const allModels = this.getModelCapabilities();
        selectedModel = allModels.find(model => model.endpointId === preferredModelId);
        if (selectedModel) {
          console.log('✅ [IntelligenceCore] Using user preferred video model:', selectedModel.label);
        } else {
          console.log('⚠️ [IntelligenceCore] Preferred video model not found:', preferredModelId);
        }
      }
      
      // If no preferred model, select optimal video model based on context
      if (!selectedModel) {
        console.log('🔍 [IntelligenceCore] No preferred video model, selecting optimal default');
        const allModels = this.getModelCapabilities();
        const videoModels = allModels.filter(model => model.category === 'video');
        
        // Check if this is image-to-video animation
        const hasImageUrl = intent.context.includes('[Image uploaded:') || 
                           intent.context.includes('[Last generated image:') ||
                           intent.context.includes('image_url');
        
        if (hasImageUrl) {
          console.log('🎬 [IntelligenceCore] Image-to-video animation detected, filtering for models that support image input');
          
          // Filter for video models that support image input
          const imageToVideoModels = videoModels.filter(model => {
            const endpoint = AVAILABLE_ENDPOINTS.find(ep => ep.endpointId === model.endpointId);
            return endpoint && endpoint.inputAsset && endpoint.inputAsset.includes('image');
          });
          
          console.log('🎬 [IntelligenceCore] Image-to-video capable models:', imageToVideoModels.map(m => m.label));
          
          if (imageToVideoModels.length === 0) {
            console.log('⚠️ [IntelligenceCore] No image-to-video models found, falling back to text-to-video models');
            // Fall back to text-to-video models if no image-to-video models available
            const textToVideoModels = videoModels.filter(model => {
              const endpoint = AVAILABLE_ENDPOINTS.find(ep => ep.endpointId === model.endpointId);
              return !endpoint || !endpoint.inputAsset || !endpoint.inputAsset.includes('image');
            });
            console.log('🎬 [IntelligenceCore] Text-to-video models:', textToVideoModels.map(m => m.label));
            
            // Check if user is requesting multiple angles or cinematic sequences
            const isMultipleAngleRequest = intent.context.toLowerCase().includes('multiple angle') ||
                                          intent.context.toLowerCase().includes('cinematic sequence') ||
                                          intent.context.toLowerCase().includes('camera angles') ||
                                          intent.context.toLowerCase().includes('shot variations') ||
                                          intent.context.toLowerCase().includes('dynamic camera');
            
            if (isMultipleAngleRequest) {
              console.log('🎬 [IntelligenceCore] Multiple angle request detected - prioritizing Seedance for advanced camera control');
              // Prioritize Seedance for multiple angle shot variations
              selectedModel = textToVideoModels.find(model => model.endpointId.includes('seedance')) ||
                             textToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2')) ||
                             textToVideoModels.find(model => model.endpointId.includes('veo3')) ||
                             textToVideoModels.find(model => model.endpointId.includes('kling-video/v2.1/master')) ||
                             textToVideoModels.find(model => model.endpointId.includes('minimax/hailuo-02/standard')) ||
                             textToVideoModels[0];
            } else {
              console.log('🎬 [IntelligenceCore] Standard text-to-video generation, prioritizing Luma Ray 2 as default');
              // Prioritize Luma Ray 2 as default, then other models
              selectedModel = textToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2')) ||
                             textToVideoModels.find(model => model.endpointId.includes('veo3')) ||
                             textToVideoModels.find(model => model.endpointId.includes('kling-video/v2.1/master')) ||
                             textToVideoModels.find(model => model.endpointId.includes('minimax/hailuo-02/standard')) ||
                             textToVideoModels[0];
            }
          } else {
            // Check if user is requesting multiple angles or cinematic sequences
            const isMultipleAngleRequest = intent.context.toLowerCase().includes('multiple angle') ||
                                          intent.context.toLowerCase().includes('cinematic sequence') ||
                                          intent.context.toLowerCase().includes('camera angles') ||
                                          intent.context.toLowerCase().includes('shot variations') ||
                                          intent.context.toLowerCase().includes('dynamic camera');
            
            if (isMultipleAngleRequest) {
              console.log('🎬 [IntelligenceCore] Multiple angle request detected - prioritizing Seedance for advanced camera control');
              // Prioritize Seedance for multiple angle shot variations
              selectedModel = imageToVideoModels.find(model => model.endpointId.includes('seedance')) ||
                             imageToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2-flash/image-to-video')) ||
                             imageToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2')) ||
                             imageToVideoModels.find(model => model.endpointId.includes('veo3')) ||
                             imageToVideoModels.find(model => model.endpointId.includes('kling-video/v2.1/master/image-to-video')) ||
                             imageToVideoModels.find(model => model.endpointId.includes('minimax/hailuo-02/standard/image-to-video')) ||
                             imageToVideoModels[0];
            } else {
              console.log('🎬 [IntelligenceCore] Standard image-to-video animation, prioritizing Luma Ray 2 Flash as default');
              console.log('🎬 [IntelligenceCore] Available image-to-video models:', imageToVideoModels.map(m => m.endpointId));
              
              // Check if Luma Ray 2 Flash is available
              const ray2FlashModel = imageToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2-flash/image-to-video'));
              console.log('🎬 [IntelligenceCore] Luma Ray 2 Flash model found:', ray2FlashModel?.endpointId);
              
              // Check each model in the fallback chain
              const lumaRay2Model = imageToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2'));
              const veo3Model = imageToVideoModels.find(model => model.endpointId.includes('veo3'));
              const klingModel = imageToVideoModels.find(model => model.endpointId.includes('kling-video/v2.1/master/image-to-video'));
              const minimaxModel = imageToVideoModels.find(model => model.endpointId.includes('minimax/hailuo-02/standard/image-to-video'));
              
              console.log('🎬 [IntelligenceCore] Fallback models found:', {
                ray2Flash: ray2FlashModel?.endpointId,
                lumaRay2: lumaRay2Model?.endpointId,
                veo3: veo3Model?.endpointId,
                kling: klingModel?.endpointId,
                minimax: minimaxModel?.endpointId
              });
              
              // Prioritize Luma Ray 2 Flash as default for image-to-video, then other models
              selectedModel = ray2FlashModel ||
                             lumaRay2Model ||
                             veo3Model ||
                             klingModel ||
                             minimaxModel ||
                             imageToVideoModels[0];
              
              console.log('🎬 [IntelligenceCore] Final selected model:', selectedModel?.endpointId);
            }
          }
          
          console.log('🎬 [IntelligenceCore] Selected video model for image-to-video:', selectedModel?.label);
        } else {
          console.log('🎬 [IntelligenceCore] Text-to-video generation, prioritizing Luma Ray 2 as default');
          // For text-to-video, prefer models that don't require image input
          const textToVideoModels = videoModels.filter(model => {
            const endpoint = AVAILABLE_ENDPOINTS.find(ep => ep.endpointId === model.endpointId);
            return !endpoint || !endpoint.inputAsset || !endpoint.inputAsset.includes('image');
          });
          
          if (textToVideoModels.length > 0) {
            // Prioritize Luma Ray 2 as default for text-to-video
            selectedModel = textToVideoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2')) ||
                           textToVideoModels.find(model => model.endpointId.includes('veo3')) ||
                           textToVideoModels.find(model => model.endpointId.includes('kling-video/v2.1/master/text-to-video')) ||
                           textToVideoModels.find(model => model.endpointId.includes('minimax/hailuo-02/standard/text-to-video')) ||
                           textToVideoModels[0];
          } else {
            // Fall back to any video model if no text-to-video specific models
            selectedModel = videoModels.find(model => model.endpointId.includes('luma-dream-machine/ray-2')) ||
                           videoModels[0];
          }
        }
      }
    }
    // RULE 1 & 2: Image Generation Logic
    else if (intent.type === 'image') {
      console.log('🖼️ [IntelligenceCore] Applying Rule 1 & 2: Image Generation');
      console.log('🖼️ [IntelligenceCore] Available image models:', this.getModelCapabilities().filter(m => m.category === 'image').map(m => m.endpointId));
      
      // First, check if user has a preferred image model
      if (preferredModelId) {
        console.log('🎯 [IntelligenceCore] User has preferred image model:', preferredModelId);
        const allModels = this.getModelCapabilities();
        selectedModel = allModels.find(model => model.endpointId === preferredModelId);
        if (selectedModel) {
          console.log('✅ [IntelligenceCore] Using user preferred image model:', selectedModel.label);
        } else {
          console.log('⚠️ [IntelligenceCore] Preferred image model not found:', preferredModelId);
        }
      }
      
      // If no preferred model or preferred model not found, apply intelligent rules
      if (!selectedModel) {
        console.log('🖼️ [IntelligenceCore] No preferred model found, applying intelligent selection rules');
        
        // Check if this is a character consistency request
        const isCharacterRequest = this.isCharacterConsistencyRequest(intent.context);
        
        // Check if this is a variation/angle request
        const isVariationRequest = this.isVariationOrAngleRequest(intent.context);
        
        if (isCharacterRequest) {
          console.log('👤 [IntelligenceCore] Character consistency request detected - prioritizing Ideogram Character for facial feature preservation');
          const allModels = this.getModelCapabilities();
          selectedModel = allModels.find(model => 
            model.category === 'image' && 
            model.endpointId.includes('ideogram/character')
          );
          
          if (selectedModel) {
            console.log('✅ [IntelligenceCore] Ideogram Character selected for character consistency:', selectedModel.label);
          } else {
            console.log('⚠️ [IntelligenceCore] Ideogram Character model not found, falling back to Flux Kontext');
            selectedModel = allModels.find(model => 
              model.category === 'image' && 
              model.endpointId.includes('flux-pro/kontext')
            );
          }
        } else if (isVariationRequest) {
          console.log('🔄 [IntelligenceCore] Rule 2: Image Variations/Angles detected - Using Flux for text-to-image generation');
          // RULE 2: Use Flux for text-to-image generation of variations and angles
          const allModels = this.getModelCapabilities();
          selectedModel = allModels.find(model => 
            model.category === 'image' && 
            model.endpointId.includes('flux-pro/v1.1-ultra') // Use Flux Pro Ultra for text-to-image
          );
          
          if (selectedModel) {
            console.log('✅ [IntelligenceCore] Flux Pro Ultra selected for variations:', selectedModel.label);
          } else {
            console.log('⚠️ [IntelligenceCore] Flux Pro Ultra not found, falling back to any text-to-image Flux model');
            selectedModel = allModels.find(model => 
              model.category === 'image' && 
              model.endpointId.includes('flux') &&
              !model.endpointId.includes('kontext') && // Not Kontext
              !model.endpointId.includes('flux-krea-lora') // Not LoRA (requires image_url)
            );
          }
          
          if (selectedModel) {
            console.log('✅ [IntelligenceCore] Flux selected for variations:', selectedModel.label);
          } else {
            console.log('⚠️ [IntelligenceCore] Flux model not found, falling back to any image model');
            selectedModel = allModels.find(model => model.category === 'image');
          }
        } else {
          console.log('🖼️ [IntelligenceCore] Rule 1: Initial Image Generation - Prioritizing Google Imagen 4 for highest quality');
          // RULE 1: Use Google Imagen 4 for highest quality image generation, fall back to Flux
          const allModels = this.getModelCapabilities();
          selectedModel = allModels.find(model => 
            model.category === 'image' && 
            model.endpointId.includes('imagen4')
          );
        
                         // If Imagen 4 not found, fall back to Stable Diffusion 3.5 Large
                   if (!selectedModel) {
                     console.log('⚠️ [IntelligenceCore] Imagen 4 not found, falling back to Stable Diffusion 3.5 Large');
                     selectedModel = allModels.find(model => 
                       model.category === 'image' && 
                       model.endpointId.includes('stable-diffusion-v35-large')
                     );
                   }
                   
                   // If Stable Diffusion 3.5 not found, fall back to Dreamina
                   if (!selectedModel) {
                     console.log('⚠️ [IntelligenceCore] Stable Diffusion 3.5 not found, falling back to Dreamina');
                     selectedModel = allModels.find(model => 
                       model.category === 'image' && 
                       model.endpointId.includes('dreamina')
                     );
                   }
                   
                             // If Dreamina not found, fall back to Flux (text-to-image models only)
          if (!selectedModel) {
            console.log('⚠️ [IntelligenceCore] Dreamina not found, falling back to Flux (text-to-image only)');
            selectedModel = allModels.find(model => 
              model.category === 'image' && 
              model.endpointId.includes('flux-pro/v1.1-ultra') // Use Flux Pro Ultra for text-to-image
            );
          }
          
          // If Flux Pro Ultra not found, fall back to any text-to-image Flux model
          if (!selectedModel) {
            console.log('⚠️ [IntelligenceCore] Flux Pro Ultra not found, falling back to any text-to-image Flux model');
            selectedModel = allModels.find(model => 
              model.category === 'image' && 
              model.endpointId.includes('flux') &&
              !model.endpointId.includes('kontext') && // Not Kontext
              !model.endpointId.includes('flux-krea-lora') // Not LoRA (requires image_url)
            );
          }
        
          // If Flux not found, fall back to any image model
          if (!selectedModel) {
            console.log('⚠️ [IntelligenceCore] Flux model not found, falling back to any image model');
            selectedModel = allModels.find(model => model.category === 'image');
          }
        }
      }
    }
    // RULE 4: Voiceover Generation - Use ElevenLabs TTS for high-quality voice synthesis
    else if (intent.type === 'voiceover') {
      console.log('🎤 [IntelligenceCore] Applying Rule 4: Voiceover Generation');
      
      if (preferredModelId) {
        // Use user's preferred voiceover model
        const allModels = this.getModelCapabilities();
        selectedModel = allModels.find(model => model.endpointId === preferredModelId);
        if (selectedModel) {
          console.log('✅ [IntelligenceCore] Using user preferred voiceover model:', selectedModel.label);
        } else {
          console.log('⚠️ [IntelligenceCore] Preferred voiceover model not found:', preferredModelId);
        }
      }
      
      // If no preferred model, prioritize ElevenLabs TTS
      if (!selectedModel) {
        console.log('🎤 [IntelligenceCore] No preferred voiceover model, prioritizing ElevenLabs TTS');
        const allModels = this.getModelCapabilities();
        selectedModel = allModels.find(model => 
          model.category === 'voiceover' && 
          model.endpointId.includes('elevenlabs')
        );
        
        if (selectedModel) {
          console.log('✅ [IntelligenceCore] ElevenLabs TTS selected for voiceover:', selectedModel.label);
        } else {
          console.log('⚠️ [IntelligenceCore] ElevenLabs TTS not found, falling back to any voiceover model');
          selectedModel = allModels.find(model => model.category === 'voiceover');
        }
      }
    }
    // Other content types (audio, etc.)
    else {
      console.log('🎵 [IntelligenceCore] Handling other content types');
      
      if (preferredModelId) {
        const allModels = this.getModelCapabilities();
        selectedModel = allModels.find(model => model.endpointId === preferredModelId);
        if (selectedModel) {
          console.log('✅ [IntelligenceCore] Using preferred model:', selectedModel.label);
        }
      }
      
      if (!selectedModel) {
        console.log('🔍 [IntelligenceCore] No preferred model, using automatic selection');
        const allModels = this.getModelCapabilities();
        const suitableModels = allModels.filter(model => {
          switch (intent.type) {
            case 'audio':
              return model.category === 'audio';
            default:
              return false;
          }
        });
        
        if (suitableModels.length > 0) {
          selectedModel = suitableModels[0];
        }
      }
    }

    return selectedModel;
  }

  /**
   * Determines if the user request is for character consistency
   * Used for character generation workflow
   */
  private isCharacterConsistencyRequest(context: string): boolean {
    const lowerContext = context.toLowerCase();
    
    // Keywords that indicate character consistency requests
    const characterKeywords = [
      'character', 'person', 'face', 'portrait', 'consistent', 'same person',
      'maintain appearance', 'keep the same', 'preserve features', 'character design',
      'facial features', 'personality', 'branding', 'storytelling', 'character sheet'
    ];
    
    // Check if any character-related keywords are present
    return characterKeywords.some(keyword => lowerContext.includes(keyword));
  }

  /**
   * Determines if the user request is for image variations or different angles
   * Used for Rule 2: Image Variations/Angles workflow
   */
  private isVariationOrAngleRequest(context: string): boolean {
    const lowerContext = context.toLowerCase();
    
    // Keywords that indicate variation or angle requests
    const variationKeywords = [
      'variation', 'variations', 'different', 'multiple', 'various',
      'angle', 'angles', 'perspective', 'perspectives', 'view', 'views',
      'shot', 'shots', 'pose', 'poses', 'position', 'positions',
      'side', 'front', 'back', 'profile', 'three-quarter', '3/4',
      'close-up', 'closeup', 'wide', 'medium', 'long', 'extreme',
      'low angle', 'high angle', 'dutch angle', 'bird\'s eye', 'worm\'s eye'
    ];
    
    const hasVariationKeywords = variationKeywords.some(keyword => 
      lowerContext.includes(keyword)
    );
    
    console.log('🔍 [IntelligenceCore] Checking for variation/angle request:', {
      context: context,
      hasVariationKeywords,
      matchedKeywords: variationKeywords.filter(keyword => lowerContext.includes(keyword))
    });
    
    return hasVariationKeywords;
  }

  /**
   * Selects the most appropriate model based on intent analysis
   * FLEXIBLE WORKFLOW - Prioritizes user control while providing intelligent assistance
   * 
   * Core Principles:
   * - User is the Director: Always honor explicit model specifications
   * - Intent-Driven Assistance: Provide optimal suggestions when no model specified
   * - Model Delegation is a Suggestion: Allow manual overrides at any time
   */
  public async selectOptimalModel(intent: UserIntent): Promise<TaskDelegation | null> {
    console.log('🎯 [IntelligenceCore] ===== FLEXIBLE MODEL SELECTION START =====');
    console.log('🎯 [IntelligenceCore] Selecting optimal model for intent:', intent);
    console.log('🎯 [IntelligenceCore] Intent type:', intent.type);
    console.log('🎯 [IntelligenceCore] Intent requiresGeneration:', intent.requiresGeneration);
    console.log('🎯 [IntelligenceCore] Intent confidence:', intent.confidence);
    console.log('🎯 [IntelligenceCore] Intent context:', intent.context);
    console.log('🎯 [IntelligenceCore] Current model preferences:', this.modelPreferences);
    
    if (!intent.requiresGeneration) {
      console.log('❌ [IntelligenceCore] No generation required for this intent');
      return null; // No generation needed
    }

    let selectedModel: ModelCapability | undefined;
    let isUserPreferredModel = false;

    // PRIORITY 1: Check for explicit model specification in user input
    const explicitModel = this.extractExplicitModelFromInput(intent.context);
    if (explicitModel) {
      console.log('🎯 [IntelligenceCore] ✅ Found explicit model specification:', explicitModel);
      const allModels = this.getModelCapabilities();
      const userSpecifiedModel = allModels.find(model => 
        model.endpointId.toLowerCase().includes(explicitModel.toLowerCase()) ||
        model.label.toLowerCase().includes(explicitModel.toLowerCase())
      );
      
      if (userSpecifiedModel) {
        console.log('✅ [IntelligenceCore] Honoring user\'s explicit model choice:', userSpecifiedModel.label);
        selectedModel = userSpecifiedModel;
        isUserPreferredModel = true;
      } else {
        console.log('⚠️ [IntelligenceCore] User specified model not found:', explicitModel);
      }
    }

    // If no explicit model specified, proceed with intelligent assistance
    if (!selectedModel) {
      console.log('🎯 [IntelligenceCore] No explicit model specified, providing intelligent assistance');

      // Check for image action types first
      if (this.conversationState.imageActionType) {
        console.log('🎯 [IntelligenceCore] Detected image action type:', this.conversationState.imageActionType);
        
        switch (this.conversationState.imageActionType) {
          case 'style-transfer':
            console.log('🎨 [IntelligenceCore] ===== STYLE TRANSFER MODEL SELECTION =====');
            console.log('🎨 [IntelligenceCore] Routing to style transfer model');
            selectedModel = this.getModelCapabilities().find(model => 
              model.endpointId === 'fal-ai/flux-krea-lora/image-to-image'
            );
            console.log('🎨 [IntelligenceCore] Style transfer model found:', selectedModel);
            if (!selectedModel) {
              console.error('❌ [IntelligenceCore] FLUX LoRA model not found in capabilities');
              console.log('🎨 [IntelligenceCore] Available models:', this.getModelCapabilities().map(m => m.endpointId));
            }
            break;
          case 'flux-kontext':
            console.log('🌍 [IntelligenceCore] Routing to flux kontext model');
            selectedModel = this.getModelCapabilities().find(model => 
              model.endpointId === 'fal-ai/flux-pro/kontext'
            );
            break;
          case 'image-edit':
          case 'edit':
            console.log('✏️ [IntelligenceCore] Routing to image edit model');
            // Check if user has a preferred image editing model
            const preferredImageEditModel = this.modelPreferences.imageEdit;
            if (preferredImageEditModel && preferredImageEditModel !== 'none') {
              selectedModel = this.getModelCapabilities().find(model => 
                model.endpointId === preferredImageEditModel
              );
            }
            if (!selectedModel) {
              // Default to Nano Banana Edit, but also consider Gemini and Qwen
              selectedModel = this.getModelCapabilities().find(model => 
                model.endpointId === 'fal-ai/nano-banana/edit' || 
                model.endpointId === 'fal-ai/gemini-25-flash-image/edit' ||
                model.endpointId === 'fal-ai/qwen-image-edit'
              );
            }
            break;
          case 'extract-frame':
            console.log('🎬 [IntelligenceCore] Routing to frame extraction model');
            selectedModel = this.getModelCapabilities().find(model => 
              model.endpointId === 'fal-ai/ffmpeg-api/extract-frame'
            );
            break;

          case 'animation':
            console.log('🎬 [IntelligenceCore] Routing to animation model');
            // Use user's preferred video model or default to Veo3
            const preferredVideoModel = this.modelPreferences.video;
            if (preferredVideoModel && preferredVideoModel !== 'none') {
              selectedModel = this.getModelCapabilities().find(model => 
                model.endpointId === preferredVideoModel
              );
            }
            if (!selectedModel) {
              // Default to Veo3 for animation
              selectedModel = this.getModelCapabilities().find(model => 
                model.endpointId === 'fal-ai/veo3/image-to-video'
              );
            }
            break;
        }
        
        if (selectedModel) {
          console.log('✅ [IntelligenceCore] Selected model for image action:', selectedModel.label);
          isUserPreferredModel = false; // This is system-selected based on action type
        }
      }

      // If no image action type or no model found, proceed with normal model selection
      if (!selectedModel) {
        // Check if user has a preferred model for this category
        let preferredModelId: string | null = null;
        switch (intent.type) {
          case 'image':
            preferredModelId = this.modelPreferences.image;
            break;
          case 'video':
            preferredModelId = this.modelPreferences.video;
            break;
          case 'audio':
            preferredModelId = this.modelPreferences.music;
            break;
          case 'voiceover':
            preferredModelId = this.modelPreferences.voiceover;
            break;
        }

        console.log('🎯 [IntelligenceCore] Preferred model for', intent.type, ':', preferredModelId);
        console.log('🎯 [IntelligenceCore] Current model preferences:', this.modelPreferences);
        console.log('🎯 [IntelligenceCore] Model capabilities size:', this.modelCapabilities.size);

        // If user selected "none" for this category, return null
        if (preferredModelId === 'none') {
          console.log('❌ [IntelligenceCore] User selected "none" for', intent.type, 'generation');
          return null;
        }

        // Apply flexible workflow rules for intelligent assistance
        selectedModel = await this.applyFlexibleWorkflowRules(intent, preferredModelId);
        isUserPreferredModel = !!preferredModelId;
      }
    }

    // Final validation - ensure we have a selected model
    if (!selectedModel) {
      console.error('❌ [IntelligenceCore] CRITICAL ERROR: No suitable model found for this request');
      console.error('❌ [IntelligenceCore] Intent type:', intent.type);
      console.error('❌ [IntelligenceCore] Intent context:', intent.context);
      console.error('❌ [IntelligenceCore] Available models:', this.getModelCapabilities().map(m => ({
        endpointId: m.endpointId,
        category: m.category,
        label: m.label
      })));
        return null;
      }

    console.log('🎯 [IntelligenceCore] Creating delegation for selected model...');
    console.log('🎯 [IntelligenceCore] Selected model before delegation:', {
        endpointId: selectedModel.endpointId,
        label: selectedModel.label,
      category: selectedModel.category
      });

    const estimatedTime = this.getEstimatedTime(selectedModel, intent);
    const parameters = await this.getDefaultParameters(selectedModel, intent, this.styleAnalysis);

    // Get seed information for the generation
    const seedInfo = seedManager.getSeedInfo(parameters.seed);
    const seedDescription = seedInfo ? `${seedInfo.description} (Seed: ${parameters.seed})` : `Seed: ${parameters.seed}`;

    const delegation: TaskDelegation = {
      modelId: selectedModel.endpointId,
      reason: isUserPreferredModel 
        ? `Using your preferred ${selectedModel.label} for ${intent.type} generation with ${seedDescription}`
        : `Selected ${selectedModel.label} for ${intent.type} generation based on efficiency (${selectedModel.efficiency}) and capabilities with ${seedDescription}`,
      confidence: intent.confidence,
      estimatedTime,
      parameters,
      intent: intent.type,
    };

    console.log('✅ [IntelligenceCore] ===== MODEL SELECTION COMPLETE =====');
    console.log('✅ [IntelligenceCore] Final delegation:', delegation);
    console.log('✅ [IntelligenceCore] Delegation modelId:', delegation.modelId);
    console.log('✅ [IntelligenceCore] Delegation modelId type:', typeof delegation.modelId);
    console.log('✅ [IntelligenceCore] Delegation modelId validation:', {
      hasModelId: !!delegation.modelId,
      modelIdLength: delegation.modelId?.length,
      modelIdValue: delegation.modelId
    });
    console.log('✅ [IntelligenceCore] Selected model endpointId:', selectedModel.endpointId);
    console.log('✅ [IntelligenceCore] Selected model category:', selectedModel.category);
    console.log('✅ [IntelligenceCore] Selected model label:', selectedModel.label);
    
    // Final validation before return
    if (!delegation.modelId) {
      console.error('❌ [IntelligenceCore] CRITICAL ERROR: Delegation modelId is undefined!');
      console.error('❌ [IntelligenceCore] Selected model:', selectedModel);
      console.error('❌ [IntelligenceCore] Delegation:', delegation);
      throw new Error('Model ID is required but was not set in delegation');
    }
    
    return delegation;
  }

  private getEstimatedTime(model: ModelCapability, intent: UserIntent): string {
    switch (model.efficiency) {
      case 'high':
        return intent.type === 'image' ? '30-60 seconds' : '1-2 minutes';
      case 'medium':
        return intent.type === 'image' ? '1-2 minutes' : '2-5 minutes';
      case 'low':
        return intent.type === 'image' ? '2-3 minutes' : '5-10 minutes';
      default:
        return 'Unknown';
    }
  }

  private async getDefaultParameters(model: ModelCapability, intent: UserIntent, styleAnalysis?: any): Promise<Record<string, any>> {
    console.log('📋 [IntelligenceCore] Getting FAL-compatible parameters for model:', model.endpointId);
    console.log('📋 [IntelligenceCore] Intent type:', intent.type);
    console.log('📋 [IntelligenceCore] User prompt:', intent.context);
    
    // Extract the user prompt from the intent context - PRESERVE ORIGINAL USER INTENT
    let userPrompt = intent.context || '';
    const hasImageUpload = intent.imageUrl && intent.imageUrl.trim() !== '';
    const hasLastGeneratedImage = this.lastGeneratedImageUrl && this.lastGeneratedImageUrl.trim() !== '';
    const imageFileName = intent.imageUrl;
    const lastGeneratedImageUrl = this.lastGeneratedImageUrl;
    
    console.log('📋 [IntelligenceCore] Has image upload:', hasImageUpload);
    console.log('📋 [IntelligenceCore] Has last generated image:', hasLastGeneratedImage);
    
    // Store the original prompt for comparison
    const originalPrompt = userPrompt;
    
    // MINIMAL PROMPT ENHANCEMENT - Focus on adherence, not over-enhancement
    try {
      // Only apply essential enhancements that improve prompt adherence
      if (this.claudeEnhancementEnabled && claudeAPI.isAPIAvailable()) {
        const enhancedPrompt = await claudeAPI.enhancePromptWithClaude(userPrompt, intent.type);
        if (enhancedPrompt && enhancedPrompt !== userPrompt) {
          console.log('🤖 [IntelligenceCore] Applied minimal Claude AI enhancement for better adherence');
          userPrompt = enhancedPrompt;
        }
      }
      
      // Validate the prompt length and content
      if (userPrompt.length > 1000) {
        console.warn('⚠️ [IntelligenceCore] Prompt too long, truncating to 1000 characters');
        userPrompt = userPrompt.substring(0, 1000);
      }
      
    } catch (error) {
      console.error('❌ [IntelligenceCore] Prompt enhancement failed, using original prompt:', error);
    }

    // Extract aspect ratio from prompt if specified
    const aspectRatioMatch = userPrompt.match(/aspect ratio:\s*([^\]]+)/i);
    const aspectRatio = aspectRatioMatch ? aspectRatioMatch[1].trim() : '16:9';
    
    // Validate aspect ratio format
    const validAspectRatios = ['1:1', '3:4', '4:3', '16:9', '9:16'];
    const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    // Get appropriate negative prompt based on content type
    const defaultNegativePrompt = getNegativePrompt(intent.type);

    // Create clean base parameters
    const baseParams: Record<string, any> = {
      prompt: userPrompt.trim(),
      aspect_ratio: finalAspectRatio,
      negative_prompt: defaultNegativePrompt,
    };

    // Add image_url if we have an uploaded image or last generated image
    if (hasImageUpload && imageFileName) {
      // Check if imageFileName is actually a base64 data URL (from quick generate)
      if (imageFileName.startsWith('data:')) {
        baseParams.image_url = imageFileName;
      } else {
        // For uploaded images, we need to construct the URL
        baseParams.image_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/uploads/${imageFileName}`;
      }
    } else if (hasLastGeneratedImage && lastGeneratedImageUrl) {
      // For last generated images, use the direct URL
      baseParams.image_url = lastGeneratedImageUrl;
    } else if (this.lastGeneratedImageUrl) {
      // Use the stored last generated image URL from the intelligence core
      baseParams.image_url = this.lastGeneratedImageUrl;
      console.log('💾 [IntelligenceCore] Using stored last generated image URL:', this.lastGeneratedImageUrl);
    }

    console.log('📋 [IntelligenceCore] Creating clean FAL-compatible parameters for model:', model.endpointId);
    console.log('📋 [IntelligenceCore] User prompt:', userPrompt);
    console.log('📋 [IntelligenceCore] Has image upload:', hasImageUpload);
    console.log('📋 [IntelligenceCore] Has last generated image:', hasLastGeneratedImage);
    
    // Return clean, FAL-compatible parameters based on model category
    switch (model.category) {
      case 'image':
        // Image generation models - minimal parameters for FAL compatibility
        return {
          ...baseParams,
          num_images: 1,
          output_format: "jpeg",
          enable_safety_checker: true,
          negative_prompt: defaultNegativePrompt
        };

      case 'video':
        // Video generation models - minimal parameters for FAL compatibility
        return {
          ...baseParams,
          duration: "8s",
          resolution: "720p",
          negative_prompt: defaultNegativePrompt
        };

      case 'music':
        // Music generation models - minimal parameters for FAL compatibility
        return {
          ...baseParams,
          duration: 30
        };

      case 'voiceover':
        // Voice generation models - minimal parameters for FAL compatibility
        return {
          ...baseParams,
          text: userPrompt,
          voice: "Dexter (English (US)/American)",
          quality: "medium",
          output_format: "mp3"
        };

      default:
        // Default parameters for unknown models
        return baseParams;
    }
  }

  /**
   * Manages conversation flow and provides intelligent responses
   * STRICTLY NON-GENERATIVE - Only manages conversation
   */
  public async processUserInput(userInput: string): Promise<{
    response: string;
    requiresAction: boolean;
    delegation: TaskDelegation | null;
    clarificationNeeded: boolean;
    suggestions?: string[]; // Add suggestions field
  }> {
    console.log('💬 [IntelligenceCore] ===== PROCESS USER INPUT START =====');
    console.log('💬 [IntelligenceCore] Processing user input:', userInput);
    console.log('💬 [IntelligenceCore] Input length:', userInput.length);
    console.log('💬 [IntelligenceCore] Input type:', typeof userInput);
    
    // Extract content type from input if present
    let forcedContentType: 'image' | 'video' | undefined;
    const contentTypeMatch = userInput.match(/\[Content type: (image|video)\]/);
    if (contentTypeMatch) {
      forcedContentType = contentTypeMatch[1] as 'image' | 'video';
      console.log('🔍 [IntelligenceCore] Extracted forced content type:', forcedContentType);
    }
    
    const intent = await this.analyzeUserIntent(userInput, forcedContentType);
    
    // Update conversation state
    this.conversationState.userContext.push(userInput);
    
    // If generation is requested, always provide delegation (but don't generate yet)
    if (intent.requiresGeneration) {
      console.log('🚀 [IntelligenceCore] Generation requested, selecting model');
      console.log('🚀 [IntelligenceCore] Intent for model selection:', intent);
      
      const delegation = await this.selectOptimalModel(intent);
      console.log('🚀 [IntelligenceCore] Model selection result:', delegation);
      
      if (delegation) {
        console.log('🚀 [IntelligenceCore] Delegation created successfully:', {
          modelId: delegation.modelId,
          reason: delegation.reason,
          confidence: delegation.confidence,
          estimatedTime: delegation.estimatedTime
        });
        
        this.conversationState.pendingTasks.push(delegation);
        console.log('✅ [IntelligenceCore] Delegation created and added to pending tasks');
        
        const result: {
          response: string;
          requiresAction: boolean;
          delegation: TaskDelegation | null;
          clarificationNeeded: boolean;
          suggestions?: string[];
        } = {
          response: this.generateClarificationResponse(intent),
          requiresAction: true,
          delegation,
          clarificationNeeded: false,
        };
        
        console.log('✅ [IntelligenceCore] Returning result with delegation:', {
          hasDelegation: !!result.delegation,
          delegationModelId: (result.delegation as TaskDelegation)?.modelId || 'undefined',
          requiresAction: result.requiresAction
        });
        
        return result;
      } else {
        console.error('❌ [IntelligenceCore] Failed to create delegation - selectOptimalModel returned null');
      }
    }

    console.log('📝 [IntelligenceCore] Handling non-generation request');
    // Handle non-generation requests
    const analysisResponse = await this.generateAnalysisResponse(intent, userInput);
    
    const result = {
      response: analysisResponse.response,
      requiresAction: false,
      delegation: null,
      clarificationNeeded: false,
      suggestions: analysisResponse.suggestions, // Include suggestions
    };
    
    console.log('💬 [IntelligenceCore] ===== PROCESS USER INPUT END =====');
    console.log('💬 [IntelligenceCore] Final result:', {
      hasResponse: !!result.response,
      requiresAction: result.requiresAction,
      hasDelegation: !!result.delegation,
      delegationModelId: result.delegation ? (result.delegation as TaskDelegation).modelId : 'undefined',
      hasSuggestions: !!result.suggestions,
      suggestionsCount: result.suggestions?.length
    });
    
    return result;
  }

  private generateClarificationResponse(intent: UserIntent): string {
    return `I understand you want to create ${intent.type} content! 🎨

I've analyzed your request and found the perfect model for this task. Here's what I can do for you:

**What I Found:**
- **Content Type**: ${intent.type}
- **Keywords**: ${intent.keywords.join(', ')}
- **Context**: ${intent.context || 'General content creation'}

**My Recommendation:**
I've selected the optimal AI model based on your requirements. The model is ready to create exactly what you described.

**Ready to Generate:**
When you're ready, simply click the "Generate Now" button below and I'll start creating your ${intent.type} right away!

Is there anything specific you'd like me to adjust before we start?`;
  }

  private generateDelegationResponse(delegation: TaskDelegation, intent: UserIntent): string {
    return `✅ **Authorization confirmed!** I'm now delegating your ${intent.type} generation request.

**Selected Model**: ${delegation.modelId}
**Reason**: ${delegation.reason}
**Estimated Time**: ${delegation.estimatedTime}
**Confidence**: ${Math.round(delegation.confidence * 100)}%

**Parameters**:
${Object.entries(delegation.parameters)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

**Status**: Delegating to specialized model...
**Next Step**: The model will begin generation and provide status updates.`;
  }

  private async generateAnalysisResponse(intent: UserIntent, originalInput: string): Promise<{
    response: string;
    suggestions?: string[];
  }> {
    console.log('💬 [IntelligenceCore] Generating analysis response for intent:', intent);
    
    // Handle conversational responses for non-generation requests
    if (intent.type === 'clarification' && intent.confidence < 0.5) {
      console.log('💬 [IntelligenceCore] ✅ Triggering conversational response (clarification + low confidence)');
      const conversationalResponse = await this.generateConversationalResponse(intent, originalInput);
      return {
        response: conversationalResponse.response,
        suggestions: conversationalResponse.suggestions,
      };
    }

    // Handle questions
    if (intent.type === 'analysis' && intent.confidence >= 0.7) {
      console.log('💬 [IntelligenceCore] ✅ Triggering question response (analysis + high confidence)');
      const questionResponse = await this.generateQuestionResponse(intent, originalInput);
      return {
        response: questionResponse.response,
        suggestions: questionResponse.suggestions,
      };
    }

    console.log('💬 [IntelligenceCore] ❌ No specific response type matched, using default analysis response');
    return {
      response: `I've analyzed your request and identified it as a **${intent.type}** task.

**Analysis Results**:
- **Intent Type**: ${intent.type}
- **Confidence**: ${Math.round(intent.confidence * 100)}%
- **Keywords Detected**: ${intent.keywords.join(', ')}
- **Context**: ${intent.context || 'No specific context provided'}

**Available Capabilities**:
${this.getAvailableCapabilities(intent)}

**Recommendation**: ${this.getRecommendation(intent)}

How would you like to proceed?`,
    };
  }

  private async generateConversationalResponse(intent: UserIntent, originalInput: string): Promise<{
    response: string;
    suggestions?: string[];
  }> {
    console.log('💬 [IntelligenceCore] Generating conversational response via API');
    
    try {
      const userMessage = originalInput || intent.context || "Hello";
      
      // Call the server-side API route
      const apiResponse = await fetch('/api/intelligence-core', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userMessage,
          intentType: 'conversational',
          context: intent.context
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      if (data.success && data.response) {
        console.log('💬 [IntelligenceCore] API response received:', data.response);
        
        // Extract suggestions from the response
        const suggestions = this.extractSuggestionsFromResponse(data.response);
        
        return {
          response: data.response,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
      } else {
        throw new Error(data.error || 'No response from API');
      }
    } catch (error) {
      console.error('💬 [IntelligenceCore] API error, falling back to hardcoded response:', error);
      
      // Fallback to hardcoded responses if API fails
      const responses = [
        "Hello! 👋 I'm your AI assistant, ready to help you create amazing content! What would you like to make today?",
        "Hi there! ✨ I'm here to help you bring your creative ideas to life. What kind of content would you like to create?",
        "Hey! 🎨 I'm your creative AI partner. I can help you generate images, videos, audio, and more. What's on your mind?",
        "Hello! 🚀 I'm excited to help you create something amazing! What would you like to work on today?",
        "Hi! 🌟 I'm your AI creation assistant. I can help with images, videos, music, and voice synthesis. What shall we create?"
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      console.log('💬 [IntelligenceCore] Using fallback response:', response);
      
      // Provide some default suggestions
      const defaultSuggestions = [
        "Create a beautiful sunset landscape",
        "Generate a video of a cat playing",
        "Make some relaxing background music",
        "Convert this text to speech"
      ];
      
      return {
        response: response,
        suggestions: defaultSuggestions,
      };
    }
  }

  private async generateQuestionResponse(intent: UserIntent, originalInput: string): Promise<{
    response: string;
    suggestions?: string[];
  }> {
    console.log('❓ [IntelligenceCore] Generating question response via API');
    console.log('❓ [IntelligenceCore] Original input:', originalInput);
    console.log('❓ [IntelligenceCore] Intent context:', intent.context);
    
    try {
      // Use the original user input instead of just context
      const userMessage = originalInput || intent.context || "I have a question";
      
      // Call the server-side API route
      const apiResponse = await fetch('/api/intelligence-core', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userMessage,
          intentType: 'question',
          context: intent.context
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      if (data.success && data.response) {
        console.log('❓ [IntelligenceCore] API response received:', data.response);
        
        // Extract suggestions from the response
        const suggestions = this.extractSuggestionsFromResponse(data.response);
        
        return {
          response: data.response,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
      } else {
        throw new Error(data.error || 'No response from API');
      }
    } catch (error) {
      console.error('❓ [IntelligenceCore] API error, falling back to hardcoded response:', error);
      
      // Fallback to hardcoded responses if Claude API fails
      const lowerInput = intent.context.toLowerCase();
      
      if (lowerInput.includes('christopher nolan')) {
        return {
          response: `🎬 **Christopher Nolan** is a renowned British-American filmmaker known for his innovative storytelling and technical achievements in cinema.

**Key Facts:**
- **Notable Films**: Inception, The Dark Knight trilogy, Interstellar, Dunkirk, Tenet
- **Style**: Complex narratives, practical effects, IMAX cinematography, non-linear storytelling
- **Awards**: Multiple Academy Award nominations and wins
- **Innovation**: Known for pushing technical boundaries in filmmaking

**Creative Connection**: His films often feature stunning visual effects and complex narratives that could inspire amazing AI-generated content! Would you like to create something inspired by his cinematic style?`,
          suggestions: [
            "Create a dream-like cityscape inspired by Inception",
            "Generate a space scene similar to Interstellar",
            "Make a dramatic superhero scene like The Dark Knight"
          ]
        };
      }
      
      if (lowerInput.includes('who') || lowerInput.includes('what is') || lowerInput.includes('what\'s')) {
        return {
          response: `🤔 I understand you're asking a question, but I'm primarily designed to help you create content using AI models rather than provide general knowledge answers.

**What I Can Help With:**
- Creating images, videos, audio, and voice content
- Explaining how different AI models work
- Suggesting creative ideas for your projects
- Helping you choose the best model for your needs

**For General Questions**: I'd recommend using a general-purpose AI assistant like Claude, ChatGPT, or Google for factual information.

**For Creative Projects**: I'm your perfect partner! What would you like to create today?`,
          suggestions: [
            "Create a beautiful landscape image",
            "Generate a short video clip",
            "Make some background music"
          ]
        };
      }
      
      return {
        response: `❓ I see you're asking a question! While I'm primarily focused on helping you create amazing content with AI models, I can help you understand how to use these tools for your creative projects.

**What I'm Great At:**
- Explaining AI model capabilities
- Suggesting creative approaches
- Helping you choose the right model
- Guiding you through the creation process

**What Would You Like to Create?** Maybe we can turn your curiosity into something amazing!`,
        suggestions: [
          "Create a beautiful sunset landscape",
          "Generate a video of a cat playing",
          "Make some relaxing background music"
        ]
      };
    }
  }

  // Add helper method to extract suggestions from AI responses
  private extractSuggestionsFromResponse(response: string): string[] {
    const suggestions: string[] = [];
    
    // Look for patterns that indicate suggestions
    const lines = response.split('\n');
    
    for (const line of lines) {
      // Look for lines that start with quotes or dashes
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
        suggestions.push(trimmedLine.slice(1, -1));
      } else if (trimmedLine.startsWith('- "') && trimmedLine.endsWith('"')) {
        suggestions.push(trimmedLine.slice(3, -1));
      } else if (trimmedLine.startsWith('• "') && trimmedLine.endsWith('"')) {
        suggestions.push(trimmedLine.slice(3, -1));
      }
    }
    
    // If no structured suggestions found, try to extract from markdown code blocks
    if (suggestions.length === 0) {
      const codeBlockMatch = response.match(/```\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        const codeContent = codeBlockMatch[1];
        const codeLines = codeContent.split('\n');
        for (const line of codeLines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('#')) {
            suggestions.push(trimmedLine);
          }
        }
      }
    }
    
    // If still no suggestions, try to extract from bullet points
    if (suggestions.length === 0) {
      const bulletMatches = response.match(/^[-•*]\s*(.+)$/gm);
      if (bulletMatches) {
        for (const match of bulletMatches) {
          const suggestion = match.replace(/^[-•*]\s*/, '').trim();
          if (suggestion && suggestion.length > 10) {
            suggestions.push(suggestion);
          }
        }
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private getAvailableCapabilities(intent: UserIntent): string {
    const capabilities = Array.from(this.modelCapabilities.values())
      .filter(model => {
        switch (intent.type) {
          case 'image':
            return model.category === 'image';
          case 'video':
            return model.category === 'video';
          case 'audio':
            return model.category === 'music';
          case 'voiceover':
            return model.category === 'voiceover';
          default:
            return true;
        }
      })
      .map(model => `- **${model.label}**: ${model.description}`)
      .join('\n');

    return capabilities || 'No specific capabilities for this intent type.';
  }

  private getRecommendation(intent: UserIntent): string {
    if (intent.requiresGeneration) {
      return 'To proceed with generation, please provide explicit authorization with a command like "Generate now" or "Create it".';
    }
    
    return 'This appears to be an analysis request. I can help you understand the available models and their capabilities.';
  }

  /**
   * Authorizes content generation (called only when user explicitly requests it)
   */
  public authorizeGeneration(): void {
    this.conversationState.generationAuthorized = true;
  }

  /**
   * Resets authorization (called after generation or when starting new conversation)
   */
  public resetAuthorization(): void {
    this.conversationState.generationAuthorized = false;
    this.conversationState.pendingTasks = [];
    this.conversationState.currentIntent = null;
  }

  public setModelPreferences(preferences: {
    image: string | null;
    video: string | null;
    music: string | null;
    voiceover: string | null;
  }): void {
    this.modelPreferences = preferences;
    console.log('📋 [IntelligenceCore] Model preferences updated:', preferences);
  }

  /**
   * Gets current conversation state
   */
  public getConversationState(): ConversationState {
    return { ...this.conversationState };
  }

  /**
   * Gets model capabilities for a specific category
   */
  public getModelCapabilities(category?: string): ModelCapability[] {
    console.log('📋 [IntelligenceCore] Getting model capabilities...');
    console.log('📋 [IntelligenceCore] Requested category:', category);
    console.log('📋 [IntelligenceCore] Model capabilities map size:', this.modelCapabilities.size);
    
    const capabilities = Array.from(this.modelCapabilities.values());
    console.log('📋 [IntelligenceCore] All capabilities count:', capabilities.length);
    console.log('📋 [IntelligenceCore] All capabilities:', capabilities.map(c => ({
      endpointId: c.endpointId,
      category: c.category,
      label: c.label
    })));
    
    if (category) {
      const filteredCapabilities = capabilities.filter(model => model.category === category);
      console.log(`📋 [IntelligenceCore] Filtered capabilities for category '${category}':`, filteredCapabilities.length);
      console.log(`📋 [IntelligenceCore] Filtered capabilities:`, filteredCapabilities.map(c => ({
        endpointId: c.endpointId,
        category: c.category,
        label: c.label
      })));
      return filteredCapabilities;
    }
    
    console.log('📋 [IntelligenceCore] Returning all capabilities');
    return capabilities;
  }

  /**
   * Sets style analysis for integration into prompts
   */
  public setStyleAnalysis(analysis: any): void {
    console.log('🎨 [IntelligenceCore] Setting style analysis:', analysis);
    this.styleAnalysis = analysis;
  }

  // New method to generate automated workflows
  async generateAutomatedWorkflow(userPrompt: string, context?: any): Promise<AutomatedWorkflow> {
    console.log('🤖 [IntelligenceCore] Generating automated workflow for:', userPrompt);
    
    const intent = await this.analyzeUserIntent(userPrompt, context);
    
    // Analyze the request for workflow patterns
    const workflow = this.analyzeWorkflowPattern(userPrompt, intent);
    
    console.log('📋 [IntelligenceCore] Generated workflow:', workflow);
    return workflow;
  }

  private async analyzeWorkflowPattern(userPrompt: string, intent: UserIntent): Promise<AutomatedWorkflow> {
    const prompt = userPrompt.toLowerCase();
    
    // Multiple angles workflow
    if (prompt.includes('multiple angle') || prompt.includes('different angle') || 
        prompt.includes('various angle') || prompt.includes('all angle')) {
      return await this.createMultipleAnglesWorkflow(userPrompt, intent);
    }
    
    // Character variations workflow
    if (prompt.includes('character') && (prompt.includes('variation') || prompt.includes('different') || prompt.includes('multiple'))) {
      return await this.createCharacterVariationsWorkflow(userPrompt, intent);
    }
    
    // Scene sequence workflow
    if (prompt.includes('scene') || prompt.includes('sequence') || prompt.includes('story')) {
      return await this.createSceneSequenceWorkflow(userPrompt, intent);
    }
    
    // Default single generation workflow
    return await this.createSingleGenerationWorkflow(userPrompt, intent);
  }

  private async createMultipleAnglesWorkflow(userPrompt: string, intent: UserIntent): Promise<AutomatedWorkflow> {
    const basePrompt = this.extractBaseCharacterDescription(userPrompt);
    const delegation = await this.selectOptimalModel(intent);
    const model = delegation?.modelId || 'fal-ai/flux-pro/v1.1-ultra';
    
    const steps: WorkflowStep[] = [
      {
        id: 'profile',
        type: 'image',
        prompt: `${basePrompt}, profile view, cybernetic design, blue glowing elements`,
        model: model,
        description: 'Generate profile view',
        parameters: { prompt: `${basePrompt}, profile view, cybernetic design, blue glowing elements` }
      },
      {
        id: 'back',
        type: 'image',
        prompt: `${basePrompt}, back view, technological details, circuit patterns`,
        model: model,
        description: 'Generate back view',
        parameters: { prompt: `${basePrompt}, back view, technological details, circuit patterns` }
      },
      {
        id: 'three-quarter',
        type: 'image',
        prompt: `${basePrompt}, 3/4 angle, futuristic robot design`,
        model: model,
        description: 'Generate 3/4 angle view',
        parameters: { prompt: `${basePrompt}, 3/4 angle, futuristic robot design` }
      },
      {
        id: 'closeup',
        type: 'image',
        prompt: `${basePrompt}, close-up portrait, glowing blue eyes`,
        model: model,
        description: 'Generate close-up portrait',
        parameters: { prompt: `${basePrompt}, close-up portrait, glowing blue eyes` }
      },
      {
        id: 'low-angle',
        type: 'image',
        prompt: `${basePrompt}, low angle shot, heroic pose, looking up`,
        model: model,
        description: 'Generate low angle shot',
        parameters: { prompt: `${basePrompt}, low angle shot, heroic pose, looking up` }
      }
    ];

    return {
      id: `workflow-${Date.now()}`,
      name: 'Multiple Character Angles',
      description: 'Generate multiple angles of the character',
      steps,
      currentStep: 0,
      status: 'pending',
      nextActions: [
        {
          id: 'video-animation',
          label: 'Create Video Animations',
          description: 'Animate the generated images into videos',
          type: 'video-generation'
        },
        {
          id: 'more-variations',
          label: 'Generate More Variations',
          description: 'Create additional character variations',
          type: 'image-generation'
        },
        {
          id: 'scene-integration',
          label: 'Create Scene Integration',
          description: 'Place character in different scenes',
          type: 'scene-generation'
        }
      ]
    };
  }

  private async createCharacterVariationsWorkflow(userPrompt: string, intent: UserIntent): Promise<AutomatedWorkflow> {
    const basePrompt = this.extractBaseCharacterDescription(userPrompt);
    const delegation = await this.selectOptimalModel(intent);
    const model = delegation?.modelId || 'fal-ai/flux-pro/v1.1-ultra';
    
    const steps: WorkflowStep[] = [
      {
        id: 'variation-1',
        type: 'image',
        prompt: `${basePrompt}, different pose, dynamic stance`,
        model: model,
        description: 'Generate variation 1',
        parameters: { prompt: `${basePrompt}, variation 1, different pose, dynamic stance` }
      },
      {
        id: 'variation-2',
        type: 'image',
        prompt: `${basePrompt}, alternative design, different lighting`,
        model: model,
        description: 'Generate variation 2',
        parameters: { prompt: `${basePrompt}, alternative design, different lighting` }
      },
      {
        id: 'variation-3',
        type: 'image',
        prompt: `${basePrompt}, unique perspective, creative angle`,
        model: model,
        description: 'Generate variation 3',
        parameters: { prompt: `${basePrompt}, unique perspective, creative angle` }
      }
    ];

    return {
      id: `workflow-${Date.now()}`,
      name: 'Character Variations',
      description: 'Generate multiple character variations',
      steps,
      currentStep: 0,
      status: 'pending',
      nextActions: [
        {
          id: 'select-best',
          label: 'Select Best Variation',
          description: 'Choose the best variation for further development',
          type: 'selection'
        },
        {
          id: 'create-video',
          label: 'Create Video',
          description: 'Animate the selected variation',
          type: 'video-generation'
        }
      ]
    };
  }

  private async createSceneSequenceWorkflow(userPrompt: string, intent: UserIntent): Promise<AutomatedWorkflow> {
    const basePrompt = this.extractBaseCharacterDescription(userPrompt);
    const delegation = await this.selectOptimalModel(intent);
    const model = delegation?.modelId || 'fal-ai/flux-pro/v1.1-ultra';
    
    const steps: WorkflowStep[] = [
      {
        id: 'scene-1',
        type: 'image',
        prompt: `${basePrompt}, establishing shot, wide angle`,
        model: model,
        description: 'Generate establishing shot',
        parameters: { prompt: `${basePrompt}, establishing shot, wide angle` }
      },
      {
        id: 'scene-2',
        type: 'image',
        prompt: `${basePrompt}, medium shot, character focus`,
        model: model,
        description: 'Generate medium shot',
        parameters: { prompt: `${basePrompt}, medium shot, character focus` }
      },
      {
        id: 'scene-3',
        type: 'image',
        prompt: `${basePrompt}, close-up, emotional moment`,
        model: model,
        description: 'Generate close-up shot',
        parameters: { prompt: `${basePrompt}, close-up, emotional moment` }
      }
    ];

    return {
      id: `workflow-${Date.now()}`,
      name: 'Scene Sequence',
      description: 'Generate a sequence of scenes',
      steps,
      currentStep: 0,
      status: 'pending',
      nextActions: [
        {
          id: 'create-video-sequence',
          label: 'Create Video Sequence',
          description: 'Animate the scene sequence',
          type: 'video-generation'
        },
        {
          id: 'add-transitions',
          label: 'Add Scene Transitions',
          description: 'Create smooth transitions between scenes',
          type: 'video-generation'
        }
      ]
    };
  }

  private async createSingleGenerationWorkflow(userPrompt: string, intent: UserIntent): Promise<AutomatedWorkflow> {
    const delegation = await this.selectOptimalModel(intent);
    const model = delegation?.modelId || 'fal-ai/flux-pro/v1.1-ultra';
    
    return {
      id: `workflow-${Date.now()}`,
      name: 'Single Generation',
      description: 'Generate single content piece',
      steps: [
        {
          id: 'single',
          type: intent.type === 'voiceover' ? 'audio' : intent.type === 'analysis' || intent.type === 'clarification' ? 'text' : intent.type,
          prompt: userPrompt,
          model: model,
          description: 'Generate content',
          parameters: { prompt: userPrompt }
        }
      ],
      currentStep: 0,
      status: 'pending',
      nextActions: [
        {
          id: 'refine',
          label: 'Refine Result',
          description: 'Generate variations or improvements',
          type: 'image-generation'
        },
        {
          id: 'animate',
          label: 'Animate',
          description: 'Create video from the image',
          type: 'video-generation'
        }
      ]
    };
  }

  private extractBaseCharacterDescription(userPrompt: string): string {
    // Extract the base character description from the user prompt
    // This is a simple implementation - could be enhanced with AI analysis
    const prompt = userPrompt.toLowerCase();
    
    if (prompt.includes('ai character') || prompt.includes('cybernetic')) {
      return 'AI character, cybernetic design, blue glowing elements, technological aesthetic';
    }
    
    if (prompt.includes('robot') || prompt.includes('android')) {
      return 'Robot character, metallic design, futuristic technology';
    }
    
    // Default fallback
    return 'Character, professional design, high quality';
  }

  // Add prompt validation and sanitization
  private validateAndSanitizePrompt(prompt: string, contentType: string): {
    isValid: boolean;
    sanitizedPrompt: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let sanitizedPrompt = prompt.trim();

    // Check for prompt length limits
    const maxLength = contentType === 'image' ? 1000 : 500;
    if (sanitizedPrompt.length > maxLength) {
      warnings.push(`Prompt exceeds ${maxLength} character limit`);
      sanitizedPrompt = sanitizedPrompt.substring(0, maxLength);
    }

    // Remove conflicting style instructions
    const conflictingPairs = [
      ['warm', 'cool'],
      ['bright', 'dark'],
      ['colorful', 'monochrome'],
      ['sharp', 'blurry'],
      ['realistic', 'artistic']
    ];

    conflictingPairs.forEach(([style1, style2]) => {
      if (sanitizedPrompt.includes(style1) && sanitizedPrompt.includes(style2)) {
        warnings.push(`Conflicting styles detected: ${style1} and ${style2}`);
        // Keep the first occurrence, remove the second
        const firstIndex = sanitizedPrompt.indexOf(style1);
        const secondIndex = sanitizedPrompt.indexOf(style2);
        if (secondIndex > firstIndex) {
          sanitizedPrompt = sanitizedPrompt.replace(new RegExp(`\\b${style2}\\b`, 'g'), '');
        }
      }
    });

    // Validate weighting syntax
    const weightRegex = /\([^:]+:\d+\.?\d*\)/g;
    const weightMatches = sanitizedPrompt.match(weightRegex);
    if (weightMatches) {
      weightMatches.forEach(match => {
        const weight = parseFloat(match.match(/:\d+\.?\d*/)?.[0]?.substring(1) || '1');
        if (weight < 0.1 || weight > 2.0) {
          warnings.push(`Invalid weight value in ${match}: must be between 0.1 and 2.0`);
          sanitizedPrompt = sanitizedPrompt.replace(match, match.replace(/:\d+\.?\d*/, ':1.0'));
        }
      });
    }

    return {
      isValid: warnings.length === 0,
      sanitizedPrompt,
      warnings
    };
  }

  // Enhanced prompt fusion with validation
  private performValidatedPromptFusion(userPrompt: string, directorProfile: any): string {
    console.log('🎬 [IntelligenceCore] Starting validated prompt fusion');
    
    // Validate and sanitize the original prompt
    const validation = this.validateAndSanitizePrompt(userPrompt, 'image');
    if (!validation.isValid) {
      console.warn('⚠️ [IntelligenceCore] Prompt validation warnings:', validation.warnings);
    }
    
    let workingPrompt = validation.sanitizedPrompt;
    
    // Apply director style with consistent weighting
    const { style_profile } = directorProfile;
    
    // Select elements with consistent weighting approach
    const visualKeywords = this.selectRandomElementsFromArray(style_profile.visual_keywords, 1);
    const compositionElements = this.selectRandomElementsFromArray(style_profile.composition_style, 1);
    const lightingElements = this.selectRandomElementsFromArray(style_profile.lighting, 1);
    const colorElements = this.selectRandomElementsFromArray(style_profile.color_palette, 1);
    
    // Apply consistent weighting (1.2 for all style elements)
    const styleEnhancements: string[] = [];
    
    if (visualKeywords.length > 0) {
      styleEnhancements.push(`(${visualKeywords[0]}:1.2)`);
    }
    
    if (compositionElements.length > 0) {
      styleEnhancements.push(`(${compositionElements[0]}:1.2)`);
    }
    
    if (lightingElements.length > 0) {
      styleEnhancements.push(`(${lightingElements[0]}:1.2)`);
    }
    
    if (colorElements.length > 0) {
      styleEnhancements.push(`(${colorElements[0]}:1.2)`);
    }
    
    // Combine with original prompt
    if (styleEnhancements.length > 0) {
      workingPrompt += `, ${styleEnhancements.join(', ')}`;
    }
    
    // Final validation
    const finalValidation = this.validateAndSanitizePrompt(workingPrompt, 'image');
    if (!finalValidation.isValid) {
      console.warn('⚠️ [IntelligenceCore] Final prompt validation warnings:', finalValidation.warnings);
    }
    
    console.log('🎬 [IntelligenceCore] Validated prompt fusion complete:', finalValidation.sanitizedPrompt);
    return finalValidation.sanitizedPrompt;
  }

  // Helper method for selecting random elements from array
  private selectRandomElementsFromArray<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Set the last generated image URL for animation requests
   */
  public setLastGeneratedImage(imageUrl: string): void {
    console.log('💾 [IntelligenceCore] Setting last generated image URL:', imageUrl);
    this.lastGeneratedImageUrl = imageUrl;
  }

  /**
   * Get the last generated image URL
   */
  public getLastGeneratedImage(): string | null {
    return this.lastGeneratedImageUrl;
  }
}

// Export singleton instance
export const intelligenceCore = new IntelligenceCore();