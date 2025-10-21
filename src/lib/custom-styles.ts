// Custom Style Management System for FLUX Krea Trained Styles
export interface CustomStyle {
  id: string;
  name: string;
  trigger_word: string;
  lora_file_url: string;
  config_file_url: string;
  created_at: Date;
  status: 'training' | 'trained' | 'failed';
  description?: string;
  tags?: string[];
  preview_image_url?: string;
}

export interface CustomStyleUsage {
  styleId: string;
  triggerWord: string;
  loraFileUrl: string;
  loraScale: number;
}

export class CustomStyleManager {
  private static instance: CustomStyleManager;
  private styles: CustomStyle[] = [];
  private readonly storageKey = 'custom_styles';

  private constructor() {
    this.loadStyles();
    this.initializeHardcodedStyles();
  }

  // Initialize hard-coded styles for all image generation
  private initializeHardcodedStyles(): void {
    // Using your actual custom LoRAs from fal.ai training
    const hardcodedStyles: CustomStyle[] = [
      {
        id: 'hardcoded_cinema_style',
        name: 'Cinema Style',
        trigger_word: 'cinema style',
        lora_file_url: 'https://v3.fal.media/files/tiger/FURmycp3e7Y8_SCPFJwEK_pytorch_lora_weights.safetensors',
        config_file_url: 'https://v3.fal.media/files/tiger/hl2OCNFmRfjzHAPG68CVa_config.json',
        created_at: new Date(),
        status: 'trained',
        description: 'Hard-coded cinema style for all image generation',
        tags: ['hardcoded', 'cinema', 'custom-lora']
      },
      {
        id: 'hardcoded_cinematic_style',
        name: 'Cinematic Style',
        trigger_word: 'cinematic',
        lora_file_url: 'https://v3.fal.media/files/elephant/68yIfClrJDAfxeaLHTORX_pytorch_lora_weights.safetensors',
        config_file_url: 'https://v3.fal.media/files/elephant/I-tVdRCarQyErjjxnXHOF_config.json',
        created_at: new Date(),
        status: 'trained',
        description: 'Hard-coded cinematic style for all image generation',
        tags: ['hardcoded', 'cinematic', 'custom-lora']
      }
    ];

    // Add hard-coded styles if they don't already exist
    for (const hardcodedStyle of hardcodedStyles) {
      const existingStyle = this.styles.find(style => style.id === hardcodedStyle.id);
      if (!existingStyle) {
        this.styles.push(hardcodedStyle);
        console.log('🎨 [CustomStyleManager] Added hard-coded style:', hardcodedStyle.name);
      }
    }
  }

  public static getInstance(): CustomStyleManager {
    if (!CustomStyleManager.instance) {
      CustomStyleManager.instance = new CustomStyleManager();
    }
    return CustomStyleManager.instance;
  }

  // Add a new trained style
  async addTrainedStyle(
    trainingResult: any,
    styleName: string,
    triggerWord: string,
    description?: string,
    tags?: string[]
  ): Promise<CustomStyle> {
    const customStyle: CustomStyle = {
      id: `style_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: styleName,
      trigger_word: triggerWord,
      lora_file_url: trainingResult.data.diffusers_lora_file.url,
      config_file_url: trainingResult.data.config_file.url,
      created_at: new Date(),
      status: 'trained',
      description,
      tags
    };

    this.styles.push(customStyle);
    this.saveStyles();
    
    console.log('🎨 [CustomStyleManager] Added new trained style:', customStyle);
    return customStyle;
  }

  // Get all available styles
  getAvailableStyles(): CustomStyle[] {
    return this.styles.filter(style => style.status === 'trained');
  }

  // Get style by ID
  getStyleById(styleId: string): CustomStyle | undefined {
    return this.styles.find(style => style.id === styleId);
  }

  // Get style by trigger word
  getStyleByTriggerWord(triggerWord: string): CustomStyle | undefined {
    return this.styles.find(style => style.trigger_word === triggerWord);
  }

  // Add custom LoRA manually (for your fal.ai trained LoRAs)
  addCustomLoRA(
    name: string,
    triggerWord: string,
    loraFileUrl: string,
    configFileUrl: string,
    description?: string
  ): CustomStyle {
    const customStyle: CustomStyle = {
      id: `custom_lora_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      trigger_word: triggerWord,
      lora_file_url: loraFileUrl,
      config_file_url: configFileUrl,
      created_at: new Date(),
      status: 'trained',
      description: description || `Custom LoRA: ${name}`,
      tags: ['custom-lora', 'fal-ai-trained']
    };

    this.styles.push(customStyle);
    this.saveStyles();
    
    console.log('🎨 [CustomStyleManager] Added custom LoRA:', customStyle);
    return customStyle;
  }

  // Check if prompt contains a custom style trigger word
  detectCustomStyleInPrompt(prompt: string): CustomStyleUsage | null {
    const availableStyles = this.getAvailableStyles();
    
    for (const style of availableStyles) {
      if (prompt.includes(style.trigger_word)) {
        return {
          styleId: style.id,
          triggerWord: style.trigger_word,
          loraFileUrl: style.lora_file_url,
          loraScale: 0.65 // Set to 0.65 weight as requested
        };
      }
    }
    
    return null;
  }

  // Apply custom style to generation parameters
  applyCustomStyleToParams(
    baseParams: Record<string, any>,
    styleUsage: CustomStyleUsage
  ): Record<string, any> {
    return {
      ...baseParams,
      // Add the LoRA weights URL
      lora_weights: styleUsage.loraFileUrl,
      // Add LoRA scale
      lora_scale: styleUsage.loraScale,
      // Ensure we're using compatible parameters for LoRA models
      num_inference_steps: baseParams.num_inference_steps || 28,
      guidance_scale: baseParams.guidance_scale || 7.5,
      enable_safety_checker: true,
      output_format: "jpeg"
    };
  }

  // Remove custom style from database
  removeStyle(styleId: string): boolean {
    const initialLength = this.styles.length;
    this.styles = this.styles.filter(style => style.id !== styleId);
    const removed = this.styles.length < initialLength;
    
    if (removed) {
      this.saveStyles();
      console.log('🗑️ [CustomStyleManager] Removed style:', styleId);
    }
    
    return removed;
  }

  // Update style metadata
  updateStyle(styleId: string, updates: Partial<CustomStyle>): boolean {
    const styleIndex = this.styles.findIndex(style => style.id === styleId);
    
    if (styleIndex !== -1) {
      this.styles[styleIndex] = { ...this.styles[styleIndex], ...updates };
      this.saveStyles();
      console.log('✏️ [CustomStyleManager] Updated style:', styleId);
      return true;
    }
    
    return false;
  }

  // Get styles by tag
  getStylesByTag(tag: string): CustomStyle[] {
    return this.styles.filter(style => 
      style.status === 'trained' && 
      style.tags?.includes(tag)
    );
  }

  // Search styles by name or description
  searchStyles(query: string): CustomStyle[] {
    const lowerQuery = query.toLowerCase();
    return this.styles.filter(style => 
      style.status === 'trained' && (
        style.name.toLowerCase().includes(lowerQuery) ||
        style.description?.toLowerCase().includes(lowerQuery) ||
        style.trigger_word.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Get usage statistics
  getUsageStats(): { total: number; trained: number; failed: number; training: number } {
    return {
      total: this.styles.length,
      trained: this.styles.filter(s => s.status === 'trained').length,
      failed: this.styles.filter(s => s.status === 'failed').length,
      training: this.styles.filter(s => s.status === 'training').length
    };
  }

  // Private methods for persistence
  private saveStyles(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.styles));
      } catch (error) {
        console.error('Failed to save custom styles:', error);
      }
    }
  }

  private loadStyles(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.styles = parsed.map((style: any) => ({
            ...style,
            created_at: new Date(style.created_at)
          }));
        }
      } catch (error) {
        console.error('Failed to load custom styles:', error);
      }
    }
  }
}

// Export singleton instance
export const customStyleManager = CustomStyleManager.getInstance();

// Function to initialize your custom LoRAs from fal.ai
export function initializeCustomLoRAs(): void {
  // Add your cinema style LoRA
  customStyleManager.addCustomLoRA(
    'Cinema Style',
    'cinema style',
    'https://v3.fal.media/files/tiger/FURmycp3e7Y8_SCPFJwEK_pytorch_lora_weights.safetensors',
    'https://v3.fal.media/files/tiger/hl2OCNFmRfjzHAPG68CVa_config.json',
    'Custom cinema style LoRA trained on fal.ai'
  );

  // Add your cinematic style LoRA
  customStyleManager.addCustomLoRA(
    'Cinematic Style',
    'cinematic',
    'https://v3.fal.media/files/elephant/68yIfClrJDAfxeaLHTORX_pytorch_lora_weights.safetensors',
    'https://v3.fal.media/files/elephant/I-tVdRCarQyErjjxnXHOF_config.json',
    'Custom cinematic style LoRA trained on fal.ai'
  );

  // Add your koala LoRA (if you have the config file)
  customStyleManager.addCustomLoRA(
    'Koala Style',
    'koala', // You may want to update this trigger word based on your training
    'https://v3.fal.media/files/koala/OX12GZ0Ea7YjsizWcLoGh_pytorch_lora_weights.safetensors',
    '', // TODO: Add koala config URL if available
    'Custom koala style LoRA trained on fal.ai'
  );

  console.log('🎨 [CustomLoRAs] Custom LoRAs initialized');
}

// Helper function to enhance prompts with custom styles
export function enhancePromptWithCustomStyle(
  originalPrompt: string,
  styleUsage: CustomStyleUsage
): string {
  // Content filtering removed - user has full control over prompts
  const filteredPrompt = originalPrompt;
  
  // Check if the trigger word already exists in the prompt
  const hasTriggerWord = filteredPrompt.toLowerCase().includes(styleUsage.triggerWord.toLowerCase());
  
  if (hasTriggerWord) {
    // If the trigger word already exists, just return the filtered prompt
    console.log(`🎨 [CustomStyle] Trigger word "${styleUsage.triggerWord}" already present in prompt`);
    return filteredPrompt;
  } else {
    // If the trigger word doesn't exist, add it at the end
    const enhancedPrompt = `${filteredPrompt}, ${styleUsage.triggerWord}`;
    console.log(`🎨 [CustomStyle] Added trigger word "${styleUsage.triggerWord}" to prompt`);
    return enhancedPrompt;
  }
}

import { ContentFilteringLogger, FilteredTerm } from './content-filtering-logger';

// Enhanced content filtering for FAL.com compliance
export function filterProblematicContent(prompt: string): { filteredPrompt: string; filteredTerms: FilteredTerm[] } {
  const lowerPrompt = prompt.toLowerCase();
  const logger = ContentFilteringLogger.getInstance();
  const filteredTerms: FilteredTerm[] = [];
  
  // Comprehensive FAL.com content policy filtering
  const contentFilters = [
    // Horror/Dark content that might trigger NSFW filters
    { original: 'eerie', replacement: 'mysterious', reason: 'horror content flag' },
    { original: 'unsettling', replacement: 'dramatic', reason: 'horror content flag' },
    { original: 'shadowy', replacement: 'atmospheric', reason: 'potentially dark/violent' },
    { original: 'creepy', replacement: 'moody', reason: 'horror content flag' },
    { original: 'scary', replacement: 'intense', reason: 'horror content flag' },
    { original: 'horror', replacement: 'thriller', reason: 'horror content flag' },
    { original: 'evil', replacement: 'mysterious', reason: 'potentially dark/violent' },
    { original: 'dark', replacement: 'low-light', reason: 'potentially dark/violent' },
    { original: 'sinister', replacement: 'mysterious', reason: 'potentially dark/violent' },
    { original: 'ominous', replacement: 'dramatic', reason: 'potentially dark/violent' },
    { original: 'haunting', replacement: 'atmospheric', reason: 'horror content flag' },
    { original: 'chilling', replacement: 'dramatic', reason: 'horror content flag' },
    { original: 'spine-chilling', replacement: 'intense', reason: 'horror content flag' },
    { original: 'nightmarish', replacement: 'surreal', reason: 'horror content flag' },
    { original: 'disturbing', replacement: 'dramatic', reason: 'potentially dark/violent' },
    { original: 'macabre', replacement: 'gothic', reason: 'horror content flag' },
    { original: 'grisly', replacement: 'dramatic', reason: 'violence content flag' },
    { original: 'gruesome', replacement: 'intense', reason: 'violence content flag' },
    
    // Violence-related terms
    { original: 'blood', replacement: 'dramatic lighting', reason: 'violence content flag' },
    { original: 'gore', replacement: 'intense action', reason: 'violence content flag' },
    { original: 'violence', replacement: 'dramatic conflict', reason: 'violence content flag' },
    { original: 'murder', replacement: 'dramatic scene', reason: 'violence content flag' },
    { original: 'kill', replacement: 'dramatic action', reason: 'violence content flag' },
    { original: 'death', replacement: 'dramatic moment', reason: 'violence content flag' },
    { original: 'slaughter', replacement: 'dramatic scene', reason: 'violence content flag' },
    { original: 'massacre', replacement: 'dramatic conflict', reason: 'violence content flag' },
    { original: 'carnage', replacement: 'dramatic action', reason: 'violence content flag' },
    
    // Weapon-related terms
    { original: 'gun', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'weapon', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'rifle', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'pistol', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'shotgun', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'knife', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'sword', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'axe', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'blade', replacement: 'prop', reason: 'weapon content flag' },
    { original: 'dagger', replacement: 'prop', reason: 'weapon content flag' },
    
    // Explicit content terms
    { original: 'nude', replacement: 'artistic figure', reason: 'explicit content flag' },
    { original: 'naked', replacement: 'artistic figure', reason: 'explicit content flag' },
    { original: 'sex', replacement: 'intimate scene', reason: 'explicit content flag' },
    { original: 'sexual', replacement: 'intimate', reason: 'explicit content flag' },
    { original: 'pornographic', replacement: 'artistic', reason: 'explicit content flag' },
    { original: 'explicit', replacement: 'dramatic', reason: 'explicit content flag' },
    
    // Substance-related terms
    { original: 'drug', replacement: 'dramatic moment', reason: 'substance content flag' },
    { original: 'alcohol', replacement: 'dramatic moment', reason: 'substance content flag' },
    { original: 'drunk', replacement: 'dramatic state', reason: 'substance content flag' },
    { original: 'high', replacement: 'dramatic state', reason: 'substance content flag' },
    { original: 'intoxicated', replacement: 'dramatic state', reason: 'substance content flag' },
    
    // Specific horror movie references that might trigger filters
    { original: 'michael myers', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'jason voorhees', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'freddy krueger', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'leatherface', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'ghostface', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'chucky', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'pinhead', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'pennywise', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'jigsaw', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'hannibal lecter', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'norman bates', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'carrie white', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'regan macneil', replacement: 'mysterious figure', reason: 'horror character reference' },
    { original: 'damien thorn', replacement: 'mysterious figure', reason: 'horror character reference' },
    
    // Movie/TV show references that might trigger copyright issues
    { original: 'the shining', replacement: 'mysterious hotel', reason: 'copyright reference' },
    { original: 'the exorcist', replacement: 'mysterious scene', reason: 'copyright reference' },
    { original: 'halloween', replacement: 'mysterious night', reason: 'copyright reference' },
    { original: 'friday the 13th', replacement: 'mysterious camp', reason: 'copyright reference' },
    { original: 'nightmare on elm street', replacement: 'mysterious dream', reason: 'copyright reference' },
    { original: 'texas chainsaw massacre', replacement: 'mysterious farm', reason: 'copyright reference' },
    { original: 'scream', replacement: 'mysterious call', reason: 'copyright reference' },
    { original: 'child\'s play', replacement: 'mysterious doll', reason: 'copyright reference' },
    { original: 'hellraiser', replacement: 'mysterious puzzle', reason: 'copyright reference' },
    { original: 'it', replacement: 'mysterious clown', reason: 'copyright reference' },
    { original: 'pet sematary', replacement: 'mysterious cemetery', reason: 'copyright reference' },
    { original: 'misery', replacement: 'mysterious situation', reason: 'copyright reference' },
    { original: 'cujo', replacement: 'mysterious dog', reason: 'copyright reference' },
    { original: 'christine', replacement: 'mysterious car', reason: 'copyright reference' },
    { original: 'firestarter', replacement: 'mysterious power', reason: 'copyright reference' },
    { original: 'the stand', replacement: 'mysterious conflict', reason: 'copyright reference' },
    { original: 'needful things', replacement: 'mysterious shop', reason: 'copyright reference' },
    { original: 'dolores claiborne', replacement: 'mysterious woman', reason: 'copyright reference' },
    { original: 'gerald\'s game', replacement: 'mysterious game', reason: 'copyright reference' },
    { original: 'bag of bones', replacement: 'mysterious bones', reason: 'copyright reference' },
    { original: 'dreamcatcher', replacement: 'mysterious dream', reason: 'copyright reference' },
    { original: 'cell', replacement: 'mysterious device', reason: 'copyright reference' },
    { original: 'lisey\'s story', replacement: 'mysterious story', reason: 'copyright reference' },
    { original: 'duma key', replacement: 'mysterious key', reason: 'copyright reference' },
    { original: 'under the dome', replacement: 'mysterious dome', reason: 'copyright reference' },
    { original: 'revival', replacement: 'mysterious revival', reason: 'copyright reference' },
    { original: 'end of watch', replacement: 'mysterious watch', reason: 'copyright reference' },
    { original: 'sleeping beauties', replacement: 'mysterious sleep', reason: 'copyright reference' },
    { original: 'elevation', replacement: 'mysterious elevation', reason: 'copyright reference' },
    { original: 'institute', replacement: 'mysterious institute', reason: 'copyright reference' },
    { original: 'later', replacement: 'mysterious later', reason: 'copyright reference' },
    { original: 'billy summers', replacement: 'mysterious man', reason: 'copyright reference' },
    { original: 'gwendy\'s final task', replacement: 'mysterious task', reason: 'copyright reference' },
    { original: 'fairy tale', replacement: 'mysterious tale', reason: 'copyright reference' },
    { original: 'holly', replacement: 'mysterious woman', reason: 'copyright reference' },
    { original: 'you like it darker', replacement: 'mysterious preference', reason: 'copyright reference' }
  ];
  
  let filteredPrompt = prompt;
  
  // Apply content filters
  for (const filter of contentFilters) {
    if (lowerPrompt.includes(filter.original)) {
      const regex = new RegExp(filter.original, 'gi');
      filteredPrompt = filteredPrompt.replace(regex, filter.replacement);
      filteredTerms.push(filter);
      console.log(`🎭 [ContentFilter] Replaced "${filter.original}" with "${filter.replacement}" (${filter.reason})`);
    }
  }
  
  // Additional pattern-based filtering for edge cases
  const patternFilters = [
    { pattern: /\b(gun|weapon|rifle|pistol|shotgun|knife|sword|axe|blade|dagger)\b/gi, replacement: 'prop', reason: 'weapon content flag' },
    { pattern: /\b(blood|gore|violence|murder|kill|death|slaughter|massacre|carnage)\b/gi, replacement: 'dramatic scene', reason: 'violence content flag' },
    { pattern: /\b(drug|alcohol|drunk|high|intoxicated)\b/gi, replacement: 'dramatic moment', reason: 'substance content flag' },
    { pattern: /\b(nude|naked|sex|sexual|pornographic|explicit)\b/gi, replacement: 'artistic scene', reason: 'explicit content flag' }
  ];
  
  for (const filter of patternFilters) {
    if (filter.pattern.test(filteredPrompt)) {
      const originalText = filteredPrompt;
      filteredPrompt = filteredPrompt.replace(filter.pattern, filter.replacement);
      if (originalText !== filteredPrompt) {
        filteredTerms.push({
          original: 'pattern-matched content',
          replacement: filter.replacement,
          reason: filter.reason
        });
        console.log(`🎭 [ContentFilter] Applied pattern filtering: ${filter.reason}`);
      }
    }
  }
  
  // Log the filtering if any terms were filtered
  if (filteredTerms.length > 0) {
    console.log(`🎭 [ContentFilter] Total terms filtered: ${filteredTerms.length}`);
    console.log(`🎭 [ContentFilter] Original prompt: ${prompt}`);
    console.log(`🎭 [ContentFilter] Filtered prompt: ${filteredPrompt}`);
  }
  
  return { filteredPrompt, filteredTerms };
}

// Helper function to check if a model supports custom LoRA styles
export function supportsCustomLoRA(modelId: string): boolean {
  const supportedModels = [
    'fal-ai/flux-pro/v1.1-ultra',
    'fal-ai/flux-pro/kontext',
    'fal-ai/flux-krea-lora/image-to-image',
    'fal-ai/stable-diffusion-v35-large',
    'fal-ai/imagen4/preview'
  ];
  
  return supportedModels.some(model => modelId.includes(model.replace('fal-ai/', '')));
}
