// Seed Manager for DirectorchairAI
// Provides curated seeds for consistent, high-quality image generation

export interface CuratedSeed {
  id: number;
  description: string;
  style: string;
  quality: 'high' | 'premium' | 'excellent';
  tags: string[];
}

export interface SeedLibrary {
  cinematic: CuratedSeed[];
  portrait: CuratedSeed[];
  landscape: CuratedSeed[];
  artistic: CuratedSeed[];
  professional: CuratedSeed[];
  experimental: CuratedSeed[];
}

// Curated seed library with high-quality seeds for different styles
export const SEED_LIBRARY: SeedLibrary = {
  cinematic: [
    { id: 42, description: "Cinematic Master", style: "cinematic", quality: "excellent", tags: ["dramatic", "film", "professional"] },
    { id: 1337, description: "Hollywood Classic", style: "cinematic", quality: "excellent", tags: ["dramatic", "golden hour", "professional"] },
    { id: 2024, description: "Modern Cinema", style: "cinematic", quality: "excellent", tags: ["contemporary", "clean", "professional"] },
    { id: 7777, description: "Epic Scale", style: "cinematic", quality: "excellent", tags: ["grand", "spectacular", "professional"] },
    { id: 9999, description: "Art House", style: "cinematic", quality: "excellent", tags: ["artistic", "sophisticated", "professional"] }
  ],
  portrait: [
    { id: 123, description: "Portrait Master", style: "portrait", quality: "excellent", tags: ["human", "detailed", "professional"] },
    { id: 456, description: "Character Study", style: "portrait", quality: "excellent", tags: ["expressive", "detailed", "professional"] },
    { id: 789, description: "Studio Portrait", style: "portrait", quality: "excellent", tags: ["clean", "professional", "lighting"] },
    { id: 1010, description: "Environmental Portrait", style: "portrait", quality: "excellent", tags: ["contextual", "storytelling", "professional"] },
    { id: 2020, description: "Artistic Portrait", style: "portrait", quality: "excellent", tags: ["creative", "stylized", "professional"] }
  ],
  landscape: [
    { id: 555, description: "Landscape Master", style: "landscape", quality: "excellent", tags: ["nature", "atmospheric", "professional"] },
    { id: 888, description: "Golden Hour", style: "landscape", quality: "excellent", tags: ["warm", "dramatic", "professional"] },
    { id: 1111, description: "Moody Landscape", style: "landscape", quality: "excellent", tags: ["atmospheric", "dramatic", "professional"] },
    { id: 2222, description: "Urban Landscape", style: "landscape", quality: "excellent", tags: ["city", "modern", "professional"] },
    { id: 3333, description: "Fantasy Landscape", style: "landscape", quality: "excellent", tags: ["imaginative", "otherworldly", "professional"] }
  ],
  artistic: [
    { id: 777, description: "Artistic Master", style: "artistic", quality: "excellent", tags: ["creative", "expressive", "professional"] },
    { id: 999, description: "Abstract Beauty", style: "artistic", quality: "excellent", tags: ["abstract", "colorful", "professional"] },
    { id: 1111, description: "Surreal Dream", style: "artistic", quality: "excellent", tags: ["surreal", "dreamlike", "professional"] },
    { id: 4444, description: "Contemporary Art", style: "artistic", quality: "excellent", tags: ["modern", "sophisticated", "professional"] },
    { id: 6666, description: "Classical Art", style: "artistic", quality: "excellent", tags: ["timeless", "elegant", "professional"] }
  ],
  professional: [
    { id: 1000, description: "Professional Master", style: "professional", quality: "excellent", tags: ["clean", "polished", "commercial"] },
    { id: 2000, description: "Corporate Clean", style: "professional", quality: "excellent", tags: ["business", "clean", "commercial"] },
    { id: 3000, description: "Product Perfect", style: "professional", quality: "excellent", tags: ["product", "clean", "commercial"] },
    { id: 4000, description: "Marketing Ready", style: "professional", quality: "excellent", tags: ["commercial", "appealing", "professional"] },
    { id: 5000, description: "Editorial Quality", style: "professional", quality: "excellent", tags: ["editorial", "sophisticated", "professional"] }
  ],
  experimental: [
    { id: 7777, description: "Experimental Master", style: "experimental", quality: "excellent", tags: ["innovative", "unique", "creative"] },
    { id: 8888, description: "Avant Garde", style: "experimental", quality: "excellent", tags: ["avant-garde", "innovative", "creative"] },
    { id: 9999, description: "Futuristic", style: "experimental", quality: "excellent", tags: ["futuristic", "sci-fi", "creative"] },
    { id: 11111, description: "Mixed Media", style: "experimental", quality: "excellent", tags: ["mixed", "eclectic", "creative"] },
    { id: 22222, description: "Boundary Pusher", style: "experimental", quality: "excellent", tags: ["pushing", "limits", "creative"] }
  ]
};

export class SeedManager {
  private static instance: SeedManager;
  private lastUsedSeed: number | null = null;
  private seedHistory: number[] = [];

  private constructor() {}

  static getInstance(): SeedManager {
    if (!SeedManager.instance) {
      SeedManager.instance = new SeedManager();
    }
    return SeedManager.instance;
  }

  /**
   * Select the optimal seed based on prompt analysis and style
   */
  selectOptimalSeed(prompt: string, style?: string): { seed: number; description: string; style: string } {
    console.log('🎲 [SeedManager] Selecting optimal seed for prompt:', prompt);
    
    // Analyze prompt to determine style if not provided
    const detectedStyle = style || this.analyzePromptStyle(prompt);
    console.log('🎲 [SeedManager] Detected style:', detectedStyle);
    
    // Get seeds for the detected style
    const styleSeeds = SEED_LIBRARY[detectedStyle as keyof SeedLibrary] || SEED_LIBRARY.cinematic;
    
    // Select a random seed from the style
    const selectedSeed = styleSeeds[Math.floor(Math.random() * styleSeeds.length)];
    
    // Update history
    this.lastUsedSeed = selectedSeed.id;
    this.seedHistory.push(selectedSeed.id);
    
    // Keep history manageable (last 50 seeds)
    if (this.seedHistory.length > 50) {
      this.seedHistory = this.seedHistory.slice(-50);
    }
    
    console.log('🎲 [SeedManager] Selected seed:', {
      id: selectedSeed.id,
      description: selectedSeed.description,
      style: selectedSeed.style
    });
    
    return {
      seed: selectedSeed.id,
      description: selectedSeed.description,
      style: selectedSeed.style
    };
  }

  /**
   * Analyze prompt to determine the most appropriate style
   */
  private analyzePromptStyle(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Portrait detection
    if (lowerPrompt.includes('portrait') || lowerPrompt.includes('person') || 
        lowerPrompt.includes('face') || lowerPrompt.includes('character') ||
        lowerPrompt.includes('selfie') || lowerPrompt.includes('headshot')) {
      return 'portrait';
    }
    
    // Landscape detection
    if (lowerPrompt.includes('landscape') || lowerPrompt.includes('nature') ||
        lowerPrompt.includes('mountain') || lowerPrompt.includes('forest') ||
        lowerPrompt.includes('ocean') || lowerPrompt.includes('sky') ||
        lowerPrompt.includes('cityscape') || lowerPrompt.includes('urban')) {
      return 'landscape';
    }
    
    // Artistic detection
    if (lowerPrompt.includes('artistic') || lowerPrompt.includes('creative') ||
        lowerPrompt.includes('abstract') || lowerPrompt.includes('surreal') ||
        lowerPrompt.includes('painting') || lowerPrompt.includes('artwork')) {
      return 'artistic';
    }
    
    // Professional detection
    if (lowerPrompt.includes('professional') || lowerPrompt.includes('corporate') ||
        lowerPrompt.includes('business') || lowerPrompt.includes('commercial') ||
        lowerPrompt.includes('product') || lowerPrompt.includes('marketing')) {
      return 'professional';
    }
    
    // Experimental detection
    if (lowerPrompt.includes('experimental') || lowerPrompt.includes('avant-garde') ||
        lowerPrompt.includes('futuristic') || lowerPrompt.includes('sci-fi') ||
        lowerPrompt.includes('innovative') || lowerPrompt.includes('unique')) {
      return 'experimental';
    }
    
    // Default to cinematic for most other cases
    return 'cinematic';
  }

  /**
   * Get the last used seed
   */
  getLastUsedSeed(): number | null {
    return this.lastUsedSeed;
  }

  /**
   * Get seed history
   */
  getSeedHistory(): number[] {
    return [...this.seedHistory];
  }

  /**
   * Get seed information by ID
   */
  getSeedInfo(seedId: number): CuratedSeed | null {
    for (const styleSeeds of Object.values(SEED_LIBRARY)) {
      const seed = styleSeeds.find((s: CuratedSeed) => s.id === seedId);
      if (seed) return seed;
    }
    return null;
  }

  /**
   * Get all seeds for a specific style
   */
  getSeedsForStyle(style: string): CuratedSeed[] {
    return SEED_LIBRARY[style as keyof SeedLibrary] || [];
  }

  /**
   * Get all available styles
   */
  getAvailableStyles(): string[] {
    return Object.keys(SEED_LIBRARY);
  }

  /**
   * Generate a random seed (fallback)
   */
  generateRandomSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }
}

// Export singleton instance
export const seedManager = SeedManager.getInstance();
