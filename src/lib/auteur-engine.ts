// Auteur Engine - Persistent Director Style Management
// Implements the "set-and-forget" director style system for cohesive cinematic generation

import { MOVIES_DATABASE, getMoviesByDirector, type Movie } from './movies-database';

export interface DirectorProfile {
  director_name: string;
  genre: string[];
  style_profile: {
    visual_keywords: string[];
    composition_style: string[];
    camera_motion_preference: string[];
    lighting: string[];
    color_palette: string[];
    setting_tropes: string[];
  };
}

export interface AuteurEngineState {
  activeDirector: string | null;
  isEnabled: boolean;
  sessionId: string;
  lastUpdated: Date;
  selectedGenre?: string;
}

export interface PromptAugmentationResult {
  enhancedPrompt: string;
  appliedStyle: string;
  weightings: Record<string, number>;
  cinematicInstructions: string[];
}

// Cinematic Style Ontology with extensive director list and genre categorization
export const CINEMATIC_STYLE_ONTOLOGY: { director_profiles: DirectorProfile[] } = {
  director_profiles: [
    {
      director_name: "Christopher Nolan",
      genre: ["Thriller", "Sci-Fi", "Action", "Drama"],
      style_profile: {
        visual_keywords: [
          "realistic",
          "gritty realism",
          "high contrast",
          "surreal"
        ],
        composition_style: [
          "wide close-up",
          "shallow depth of field",
          "geometric shapes",
          "recursions",
          "impossible objects"
        ],
        camera_motion_preference: [
          "hand-held camera work",
          "elliptical editing",
          "crosscutting"
        ],
        lighting: [
          "deep shadows",
          "documentary-style lighting",
          "natural light"
        ],
        color_palette: [
          "muted colors",
          "shades of grey",
          "black",
          "brown"
        ],
        setting_tropes: [
          "urban settings",
          "modern locations and architecture",
          "real filming locations"
        ]
      }
    },
    {
      director_name: "Wes Anderson",
      genre: ["Comedy", "Drama", "Adventure", "Fantasy"],
      style_profile: {
        visual_keywords: [
          "storybook-like",
          "whimsical",
          "quirky",
          "retro",
          "nostalgic"
        ],
        composition_style: [
          "perfectly symmetrical",
          "central focal point",
          "meticulously balanced compositions"
        ],
        camera_motion_preference: [
          "dolly shot",
          "smooth transitions",
          "slow, deliberate camera movements"
        ],
        lighting: [
          "soft lighting",
          "warm tones",
          "golden-hour lighting"
        ],
        color_palette: [
          "pastel colors",
          "vibrant accents",
          "pinks",
          "oranges",
          "yellows"
        ],
        setting_tropes: [
          "meticulously designed sets",
          "elaborately detailed backgrounds",
          "vintage or retro-styled settings"
        ]
      }
    },
    {
      director_name: "Denis Villeneuve",
      genre: ["Sci-Fi", "Thriller", "Drama", "War"],
      style_profile: {
        visual_keywords: [
          "dark",
          "cinematic",
          "epic",
          "digital rendering"
        ],
        composition_style: [
          "central figures against monumental landscapes",
          "brutalist architecture"
        ],
        camera_motion_preference: [
          "slow camera movements",
          "long takes",
          "smooth gradients"
        ],
        lighting: [
          "high contrast lighting",
          "moody lighting",
          "cool blue tones",
          "warm highlights"
        ],
        color_palette: [
          "muted tones",
          "earthy hues",
          "cool blues"
        ],
        setting_tropes: [
          "futuristic urban settings",
          "monumental architecture",
          "dramatic skies"
        ]
      }
    },
    {
      director_name: "David Fincher",
      genre: ["Thriller", "Crime", "Drama", "Mystery"],
      style_profile: {
        visual_keywords: [
          "precise",
          "controlled",
          "geometric",
          "digital precision"
        ],
        composition_style: [
          "precise geometric composition",
          "controlled three-point lighting",
          "digital precision"
        ],
        camera_motion_preference: [
          "controlled camera movements",
          "precise tracking shots",
          "minimal camera shake"
        ],
        lighting: [
          "controlled lighting",
          "minimal shadows",
          "precise framing"
        ],
        color_palette: [
          "cool tones",
          "desaturated colors",
          "high production value"
        ],
        setting_tropes: [
          "interior scenes",
          "controlled environments",
          "modern architecture"
        ]
      }
    },
    {
      director_name: "Martin Scorsese",
      genre: ["Crime", "Drama", "Biography", "Thriller"],
      style_profile: {
        visual_keywords: [
          "dynamic",
          "urban realism",
          "vibrant",
          "character-driven"
        ],
        composition_style: [
          "dynamic tracking shots",
          "vibrant color palette",
          "urban environment authenticity"
        ],
        camera_motion_preference: [
          "dynamic camera work",
          "rich saturation",
          "realistic urban atmosphere"
        ],
        lighting: [
          "character focus",
          "vibrant lighting",
          "urban atmosphere"
        ],
        color_palette: [
          "rich saturation",
          "realistic urban colors",
          "character focus"
        ],
        setting_tropes: [
          "urban drama",
          "crime content",
          "character-driven stories"
        ]
      }
    },
    {
      director_name: "Quentin Tarantino",
      genre: ["Crime", "Action", "Thriller", "Drama"],
      style_profile: {
        visual_keywords: [
          "stylized violence",
          "pop culture references",
          "retro aesthetic",
          "bold colors"
        ],
        composition_style: [
          "low angle shots",
          "close-ups",
          "tracking shots",
          "split screen"
        ],
        camera_motion_preference: [
          "smooth tracking shots",
          "dynamic camera movements",
          "handheld sequences"
        ],
        lighting: [
          "high contrast",
          "neon lighting",
          "dramatic shadows"
        ],
        color_palette: [
          "vibrant reds",
          "deep blacks",
          "neon colors",
          "saturated tones"
        ],
        setting_tropes: [
          "urban environments",
          "retro diners",
          "crime scenes"
        ]
      }
    },
    {
      director_name: "Stanley Kubrick",
      genre: ["Drama", "Sci-Fi", "Horror", "War"],
      style_profile: {
        visual_keywords: [
          "symmetrical composition",
          "one-point perspective",
          "minimalist",
          "clinical precision"
        ],
        composition_style: [
          "perfect symmetry",
          "long tracking shots",
          "wide establishing shots",
          "geometric patterns"
        ],
        camera_motion_preference: [
          "slow tracking shots",
          "steady camera movements",
          "long takes"
        ],
        lighting: [
          "high key lighting",
          "natural light",
          "minimal shadows"
        ],
        color_palette: [
          "muted tones",
          "cool colors",
          "minimal contrast"
        ],
        setting_tropes: [
          "sterile environments",
          "geometric architecture",
          "isolated locations"
        ]
      }
    },
    {
      director_name: "Alfred Hitchcock",
      genre: ["Thriller", "Mystery", "Horror", "Drama"],
      style_profile: {
        visual_keywords: [
          "suspenseful",
          "psychological",
          "voyeuristic",
          "claustrophobic"
        ],
        composition_style: [
          "high angle shots",
          "point of view shots",
          "close-ups",
          "framing through objects"
        ],
        camera_motion_preference: [
          "slow zooms",
          "tracking shots",
          "dolly shots"
        ],
        lighting: [
          "chiaroscuro",
          "dramatic shadows",
          "low key lighting"
        ],
        color_palette: [
          "black and white",
          "high contrast",
          "monochromatic"
        ],
        setting_tropes: [
          "confined spaces",
          "urban environments",
          "psychological landscapes"
        ]
      }
    },
    {
      director_name: "Akira Kurosawa",
      genre: ["Drama", "Action", "War", "Historical"],
      style_profile: {
        visual_keywords: [
          "epic scale",
          "natural elements",
          "human drama",
          "cinematic poetry"
        ],
        composition_style: [
          "wide landscapes",
          "group compositions",
          "natural framing",
          "dramatic angles"
        ],
        camera_motion_preference: [
          "static shots",
          "slow movements",
          "panning shots"
        ],
        lighting: [
          "natural light",
          "dramatic weather",
          "atmospheric conditions"
        ],
        color_palette: [
          "earth tones",
          "natural colors",
          "monochromatic"
        ],
        setting_tropes: [
          "historical settings",
          "natural landscapes",
          "rural environments"
        ]
      }
    },
    {
      director_name: "Federico Fellini",
      genre: ["Drama", "Comedy", "Fantasy", "Romance"],
      style_profile: {
        visual_keywords: [
          "surreal",
          "dreamlike",
          "theatrical",
          "baroque"
        ],
        composition_style: [
          "circular movements",
          "crowded frames",
          "theatrical staging",
          "dream sequences"
        ],
        camera_motion_preference: [
          "circular tracking shots",
          "floating camera",
          "dreamy movements"
        ],
        lighting: [
          "theatrical lighting",
          "dramatic contrasts",
          "mood lighting"
        ],
        color_palette: [
          "rich colors",
          "warm tones",
          "vibrant hues"
        ],
        setting_tropes: [
          "theatrical sets",
          "dream landscapes",
          "urban fantasies"
        ]
      }
    },
    {
      director_name: "Ingmar Bergman",
      genre: ["Drama", "Romance", "Psychological", "Art House"],
      style_profile: {
        visual_keywords: [
          "minimalist",
          "psychological",
          "introspective",
          "existential"
        ],
        composition_style: [
          "close-ups",
          "two-shots",
          "minimal backgrounds",
          "face studies"
        ],
        camera_motion_preference: [
          "static shots",
          "slow movements",
          "minimal camera work"
        ],
        lighting: [
          "natural light",
          "minimal lighting",
          "dramatic shadows"
        ],
        color_palette: [
          "monochromatic",
          "muted tones",
          "high contrast"
        ],
        setting_tropes: [
          "isolated locations",
          "interior spaces",
          "psychological landscapes"
        ]
      }
    },
    {
      director_name: "Jean-Luc Godard",
      genre: ["Drama", "Romance", "Crime", "Art House"],
      style_profile: {
        visual_keywords: [
          "avant-garde",
          "experimental",
          "self-reflexive",
          "modernist"
        ],
        composition_style: [
          "jump cuts",
          "handheld camera",
          "direct address",
          "text overlays"
        ],
        camera_motion_preference: [
          "handheld movements",
          "jump cuts",
          "experimental techniques"
        ],
        lighting: [
          "natural light",
          "available light",
          "minimal artificial lighting"
        ],
        color_palette: [
          "vibrant colors",
          "high contrast",
          "bold hues"
        ],
        setting_tropes: [
          "urban environments",
          "modern settings",
          "contemporary life"
        ]
      }
    },
    {
      director_name: "Fritz Lang",
      genre: ["Sci-Fi", "Thriller", "Drama", "Expressionist"],
      style_profile: {
        visual_keywords: [
          "expressionist",
          "geometric",
          "futuristic",
          "metaphysical"
        ],
        composition_style: [
          "geometric patterns",
          "symmetrical compositions",
          "dramatic angles",
          "architectural lines"
        ],
        camera_motion_preference: [
          "static shots",
          "geometric movements",
          "controlled camera"
        ],
        lighting: [
          "dramatic shadows",
          "chiaroscuro",
          "geometric light patterns"
        ],
        color_palette: [
          "high contrast",
          "monochromatic",
          "geometric patterns"
        ],
        setting_tropes: [
          "futuristic cities",
          "geometric architecture",
          "metaphysical spaces"
        ]
      }
    },
    {
      director_name: "Orson Welles",
      genre: ["Drama", "Mystery", "Thriller", "Film Noir"],
      style_profile: {
        visual_keywords: [
          "deep focus",
          "dramatic angles",
          "expressionist",
          "theatrical"
        ],
        composition_style: [
          "deep focus shots",
          "low angle shots",
          "dramatic framing",
          "theatrical staging"
        ],
        camera_motion_preference: [
          "long takes",
          "complex movements",
          "theatrical camera work"
        ],
        lighting: [
          "dramatic shadows",
          "chiaroscuro",
          "theatrical lighting"
        ],
        color_palette: [
          "high contrast",
          "monochromatic",
          "dramatic tones"
        ],
        setting_tropes: [
          "theatrical sets",
          "dramatic locations",
          "expressionist environments"
        ]
      }
    },
    {
      director_name: "Charlie Chaplin",
      genre: ["Comedy", "Drama", "Romance", "Silent"],
      style_profile: {
        visual_keywords: [
          "slapstick",
          "sentimental",
          "physical comedy",
          "humanist"
        ],
        composition_style: [
          "wide shots",
          "full body framing",
          "comic timing",
          "physical comedy"
        ],
        camera_motion_preference: [
          "static shots",
          "simple movements",
          "comic timing"
        ],
        lighting: [
          "natural light",
          "simple lighting",
          "clear visibility"
        ],
        color_palette: [
          "black and white",
          "high contrast",
          "clear definition"
        ],
        setting_tropes: [
          "urban environments",
          "working class settings",
          "comic situations"
        ]
      }
    },
    {
      director_name: "Buster Keaton",
      genre: ["Comedy", "Action", "Adventure", "Silent"],
      style_profile: {
        visual_keywords: [
          "physical comedy",
          "daredevil stunts",
          "deadpan",
          "geometric"
        ],
        composition_style: [
          "wide shots",
          "full body framing",
          "geometric patterns",
          "stunt sequences"
        ],
        camera_motion_preference: [
          "static shots",
          "long takes",
          "stunt photography"
        ],
        lighting: [
          "natural light",
          "clear visibility",
          "outdoor lighting"
        ],
        color_palette: [
          "black and white",
          "high contrast",
          "clear definition"
        ],
        setting_tropes: [
          "urban environments",
          "construction sites",
          "stunt locations"
        ]
      }
    },
    {
      director_name: "Sergei Eisenstein",
      genre: ["Drama", "Historical", "War", "Propaganda"],
      style_profile: {
        visual_keywords: [
          "montage",
          "revolutionary",
          "epic scale",
          "symbolic"
        ],
        composition_style: [
          "dramatic angles",
          "mass scenes",
          "symbolic imagery",
          "epic scale"
        ],
        camera_motion_preference: [
          "static shots",
          "dramatic angles",
          "mass movements"
        ],
        lighting: [
          "dramatic shadows",
          "high contrast",
          "symbolic lighting"
        ],
        color_palette: [
          "black and white",
          "high contrast",
          "symbolic tones"
        ],
        setting_tropes: [
          "historical settings",
          "mass gatherings",
          "revolutionary scenes"
        ]
      }
    },
    {
      director_name: "D.W. Griffith",
      genre: ["Drama", "Historical", "Romance", "Silent"],
      style_profile: {
        visual_keywords: [
          "epic scale",
          "melodramatic",
          "historical",
          "romantic"
        ],
        composition_style: [
          "epic landscapes",
          "romantic scenes",
          "historical settings",
          "dramatic angles"
        ],
        camera_motion_preference: [
          "static shots",
          "epic movements",
          "romantic sequences"
        ],
        lighting: [
          "natural light",
          "romantic lighting",
          "dramatic shadows"
        ],
        color_palette: [
          "black and white",
          "romantic tones",
          "dramatic contrast"
        ],
        setting_tropes: [
          "historical settings",
          "romantic landscapes",
          "epic locations"
        ]
      }
    },
    {
      director_name: "F.W. Murnau",
      genre: ["Horror", "Drama", "Expressionist", "Silent"],
      style_profile: {
        visual_keywords: [
          "expressionist",
          "gothic",
          "atmospheric",
          "supernatural"
        ],
        composition_style: [
          "dramatic angles",
          "gothic architecture",
          "atmospheric shots",
          "supernatural elements"
        ],
        camera_motion_preference: [
          "floating camera",
          "atmospheric movements",
          "supernatural tracking"
        ],
        lighting: [
          "dramatic shadows",
          "gothic lighting",
          "atmospheric conditions"
        ],
        color_palette: [
          "black and white",
          "gothic tones",
          "atmospheric contrast"
        ],
        setting_tropes: [
          "gothic castles",
          "atmospheric landscapes",
          "supernatural realms"
        ]
      }
    },
    {
      director_name: "Georges Méliès",
      genre: ["Fantasy", "Sci-Fi", "Comedy", "Silent"],
      style_profile: {
        visual_keywords: [
          "magical",
          "fantastical",
          "theatrical",
          "innovative"
        ],
        composition_style: [
          "theatrical staging",
          "magical effects",
          "fantastical scenes",
          "innovative techniques"
        ],
        camera_motion_preference: [
          "static shots",
          "magical transformations",
          "theatrical presentation"
        ],
        lighting: [
          "theatrical lighting",
          "magical effects",
          "fantastical illumination"
        ],
        color_palette: [
          "hand-tinted colors",
          "magical hues",
          "fantastical tones"
        ],
        setting_tropes: [
          "magical realms",
          "theatrical sets",
          "fantastical locations"
        ]
      }
    },
    {
      director_name: "Lumière Brothers",
      genre: ["Documentary", "Historical", "Silent", "Experimental"],
      style_profile: {
        visual_keywords: [
          "documentary",
          "realistic",
          "natural",
          "observational"
        ],
        composition_style: [
          "static shots",
          "natural scenes",
          "observational framing",
          "realistic presentation"
        ],
        camera_motion_preference: [
          "static camera",
          "natural movements",
          "observational style"
        ],
        lighting: [
          "natural light",
          "available light",
          "realistic illumination"
        ],
        color_palette: [
          "black and white",
          "natural tones",
          "realistic contrast"
        ],
        setting_tropes: [
          "real locations",
          "natural environments",
          "everyday scenes"
        ]
      }
    }
  ]
};

export class AuteurEngine {
  private static instance: AuteurEngine;
  private state: AuteurEngineState;
  private storageKey = 'auteur_engine_state';

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): AuteurEngine {
    if (!AuteurEngine.instance) {
      AuteurEngine.instance = new AuteurEngine();
    }
    return AuteurEngine.instance;
  }

  // Tiered Memory Architecture Implementation
  private loadState(): AuteurEngineState {
    try {
      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        // Front-end (Local Storage) - Immediate recall
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('🎬 [AuteurEngine] Loaded state from localStorage:', parsed);
          return parsed;
        }
      }
    } catch (error) {
      console.warn('⚠️ [AuteurEngine] Failed to load state from localStorage:', error);
    }

    // Default state
    return {
      activeDirector: null,
      isEnabled: false,
      sessionId: this.generateSessionId(),
      lastUpdated: new Date()
    };
  }

  private saveState(): void {
    try {
      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        this.state.lastUpdated = new Date();
        const stateString = JSON.stringify(this.state);
        localStorage.setItem(this.storageKey, stateString);
        console.log('💾 [AuteurEngine] Saved state to localStorage:', this.state);
      }
    } catch (error) {
      console.error('❌ [AuteurEngine] Failed to save state to localStorage:', error);
    }
  }

  // Public API Methods
  public setActiveDirector(directorName: string | null): void {
    console.log('🎬 [AuteurEngine] Setting active director:', directorName);
    this.state.activeDirector = directorName;
    this.state.isEnabled = directorName !== null;
    this.saveState();
  }

  public getActiveDirector(): string | null {
    return this.state.activeDirector;
  }

  public isEnabled(): boolean {
    return this.state.isEnabled;
  }

  public disable(): void {
    console.log('🎬 [AuteurEngine] Disabling Auteur Engine');
    this.state.activeDirector = null;
    this.state.isEnabled = false;
    this.saveState();
  }

  public getAvailableDirectors(): string[] {
    return CINEMATIC_STYLE_ONTOLOGY.director_profiles.map(profile => profile.director_name);
  }

  public getDirectorsByGenre(genre?: string): DirectorProfile[] {
    if (!genre || genre === 'All') {
      return CINEMATIC_STYLE_ONTOLOGY.director_profiles;
    }
    return CINEMATIC_STYLE_ONTOLOGY.director_profiles.filter(
      profile => profile.genre.includes(genre)
    );
  }

  public getAvailableGenres(): string[] {
    const allGenres = new Set<string>();
    CINEMATIC_STYLE_ONTOLOGY.director_profiles.forEach(profile => {
      profile.genre.forEach(genre => allGenres.add(genre));
    });
    return Array.from(allGenres).sort();
  }

  public getDirectorProfile(directorName: string): DirectorProfile | null {
    return CINEMATIC_STYLE_ONTOLOGY.director_profiles.find(
      profile => profile.director_name === directorName
    ) || null;
  }

  // Core Prompt Augmentation Logic
  public augmentPrompt(userPrompt: string): PromptAugmentationResult {
    if (!this.state.isEnabled || !this.state.activeDirector) {
      console.log('🎬 [AuteurEngine] Auteur Engine is disabled or no active director');
      return {
        enhancedPrompt: userPrompt,
        appliedStyle: 'none',
        weightings: {},
        cinematicInstructions: []
      };
    }

    const directorProfile = this.getDirectorProfile(this.state.activeDirector);
    if (!directorProfile) {
      console.warn('⚠️ [AuteurEngine] Director profile not found:', this.state.activeDirector);
      return {
        enhancedPrompt: userPrompt,
        appliedStyle: 'none',
        weightings: {},
        cinematicInstructions: []
      };
    }

    console.log('🎬 [AuteurEngine] Augmenting prompt with director style:', this.state.activeDirector);
    console.log('🎬 [AuteurEngine] Original prompt:', userPrompt);
    console.log('🎬 [AuteurEngine] Director profile:', directorProfile.director_name);

    // Prompt Fusion Implementation
    const enhancedPrompt = this.performPromptFusion(userPrompt, directorProfile);
    const weightings = this.generatePromptWeightings(directorProfile);
    const cinematicInstructions = this.generateCinematicInstructions(directorProfile);

    const result: PromptAugmentationResult = {
      enhancedPrompt,
      appliedStyle: this.state.activeDirector,
      weightings,
      cinematicInstructions
    };

    console.log('🎬 [AuteurEngine] Augmented prompt result:', result);
    console.log('🎬 [AuteurEngine] Enhanced prompt length:', enhancedPrompt.length);
    console.log('🎬 [AuteurEngine] Prompt enhancement added:', enhancedPrompt.length - userPrompt.length, 'characters');
    return result;
  }

  // Prompt Fusion with Weighting - Enhanced to work with existing infrastructure
  private performPromptFusion(userPrompt: string, directorProfile: DirectorProfile): string {
    const { style_profile } = directorProfile;
    
    console.log('🎬 [AuteurEngine] Starting prompt fusion for director:', directorProfile.director_name);
    console.log('🎬 [AuteurEngine] Original user prompt:', userPrompt);
    
    // Check if user explicitly mentioned weather elements
    const userMentionedWeather = this.userMentionedWeather(userPrompt);
    console.log('🎬 [AuteurEngine] User mentioned weather:', userMentionedWeather);
    
    // Select key elements from the director's style (more conservative selection)
    let visualKeywords = this.selectRandomElements(style_profile.visual_keywords, 1);
    const compositionElements = this.selectRandomElements(style_profile.composition_style, 1);
    const lightingElements = this.selectRandomElements(style_profile.lighting, 1);
    const colorElements = this.selectRandomElements(style_profile.color_palette, 1);
    
    // Filter out weather-related elements unless user explicitly mentioned weather
    if (!userMentionedWeather) {
      visualKeywords = visualKeywords.filter(keyword => 
        !keyword.toLowerCase().includes('weather') && 
        !keyword.toLowerCase().includes('rain') && 
        !keyword.toLowerCase().includes('wind') && 
        !keyword.toLowerCase().includes('storm') &&
        !keyword.toLowerCase().includes('fog') &&
        !keyword.toLowerCase().includes('snow')
      );
      console.log('🎬 [AuteurEngine] Filtered out weather elements from visual keywords');
    }

    console.log('🎬 [AuteurEngine] Selected elements:');
    console.log('🎬 [AuteurEngine] - visualKeywords:', visualKeywords);
    console.log('🎬 [AuteurEngine] - compositionElements:', compositionElements);
    console.log('🎬 [AuteurEngine] - lightingElements:', lightingElements);
    console.log('🎬 [AuteurEngine] - colorElements:', colorElements);

    // Build the enhanced prompt with subtle weighting
    let enhancedPrompt = userPrompt;

    // Add visual keywords with moderate weighting (don't override user content)
    if (visualKeywords.length > 0) {
      const weightedKeywords = visualKeywords.map(keyword => `(${keyword}:1.3)`).join(', ');
      enhancedPrompt += `, ${weightedKeywords}`;
      console.log('🎬 [AuteurEngine] Added visual keywords:', weightedKeywords);
    }

    // Add composition elements (no weighting to avoid conflicts)
    if (compositionElements.length > 0) {
      enhancedPrompt += `, ${compositionElements.join(', ')}`;
      console.log('🎬 [AuteurEngine] Added composition elements:', compositionElements.join(', '));
    }

    // Add lighting with light weighting
    if (lightingElements.length > 0) {
      const weightedLighting = lightingElements.map(lighting => `(${lighting}:1.2)`).join(', ');
      enhancedPrompt += `, ${weightedLighting}`;
      console.log('🎬 [AuteurEngine] Added lighting elements:', weightedLighting);
    }

    // Add color palette (no weighting)
    if (colorElements.length > 0) {
      enhancedPrompt += `, ${colorElements.join(', ')}`;
      console.log('🎬 [AuteurEngine] Added color elements:', colorElements.join(', '));
    }

    // Add director-specific cinematic instructions (subtle)
    const cinematicInstructions = this.generateDirectorSpecificInstructions(directorProfile);
    if (cinematicInstructions) {
      enhancedPrompt += `, ${cinematicInstructions}`;
      console.log('🎬 [AuteurEngine] Added cinematic instructions:', cinematicInstructions);
    }

    const finalPrompt = enhancedPrompt.trim();
    console.log('🎬 [AuteurEngine] Final enhanced prompt:', finalPrompt);
    console.log('🎬 [AuteurEngine] Enhancement added:', finalPrompt.length - userPrompt.length, 'characters');
    
    return finalPrompt;
  }

  private generatePromptWeightings(directorProfile: DirectorProfile): Record<string, number> {
    const weightings: Record<string, number> = {};
    
    // Assign weights based on director style importance (more conservative)
    directorProfile.style_profile.visual_keywords.forEach(keyword => {
      weightings[keyword] = 1.3; // Moderate impact for visual keywords
    });

    directorProfile.style_profile.lighting.forEach(lighting => {
      weightings[lighting] = 1.2; // Light impact for lighting
    });

    directorProfile.style_profile.composition_style.forEach(composition => {
      weightings[composition] = 1.0; // No weighting for composition to avoid conflicts
    });

    return weightings;
  }

  private generateCinematicInstructions(directorProfile: DirectorProfile): string[] {
    const instructions: string[] = [];
    const { style_profile } = directorProfile;

    // Add camera motion preferences
    if (style_profile.camera_motion_preference.length > 0) {
      const cameraInstruction = style_profile.camera_motion_preference[0];
      instructions.push(cameraInstruction);
    }

    // Add setting tropes
    if (style_profile.setting_tropes.length > 0) {
      const settingInstruction = style_profile.setting_tropes[0];
      instructions.push(settingInstruction);
    }

    return instructions;
  }

  private generateDirectorSpecificInstructions(directorProfile: DirectorProfile): string {
    const { director_name } = directorProfile;
    
    // Director-specific cinematic commands
    const directorCommands: Record<string, string> = {
      "Christopher Nolan": "shot on IMAX film, handheld camera, dramatic angles",
      "Wes Anderson": "perfectly symmetrical, dolly shot, fixed lens",
      "Denis Villeneuve": "epic wide shots, atmospheric lighting, monumental scale",
      "David Fincher": "precise geometric composition, controlled lighting, digital precision",
      "Martin Scorsese": "dynamic tracking shots, vibrant colors, urban realism",
      "Quentin Tarantino": "stylized violence, pop culture references, bold colors, retro aesthetic",
      "Stanley Kubrick": "perfect symmetry, one-point perspective, clinical precision, long tracking shots",
      "Alfred Hitchcock": "suspenseful atmosphere, psychological tension, voyeuristic angles, dramatic shadows",
      "Akira Kurosawa": "epic scale, human drama, cinematic poetry, wide landscapes",
      "Federico Fellini": "surreal dreamlike quality, theatrical staging, baroque sensibilities, circular movements",
      "Ingmar Bergman": "minimalist approach, psychological depth, introspective mood, existential themes",
      "Jean-Luc Godard": "avant-garde techniques, experimental style, self-reflexive, modernist approach",
      "Fritz Lang": "expressionist style, geometric patterns, futuristic vision, metaphysical themes",
      "Orson Welles": "deep focus cinematography, dramatic angles, expressionist lighting, theatrical staging",
      "Charlie Chaplin": "slapstick comedy, sentimental humanism, physical comedy, working class charm",
      "Buster Keaton": "physical comedy, daredevil stunts, deadpan expression, geometric precision",
      "Sergei Eisenstein": "revolutionary montage, epic scale, symbolic imagery, dramatic angles",
      "D.W. Griffith": "epic scale, melodramatic style, historical grandeur, romantic sensibilities",
      "F.W. Murnau": "expressionist horror, gothic atmosphere, supernatural elements, dramatic shadows",
      "Georges Méliès": "magical fantasy, theatrical presentation, innovative effects, fantastical elements",
      "Lumière Brothers": "documentary realism, natural observation, realistic presentation, everyday scenes"
    };

    return directorCommands[director_name] || "";
  }

  private selectRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private userMentionedWeather(userPrompt: string): boolean {
    const weatherKeywords = [
      'rain', 'rainy', 'raining', 'storm', 'stormy', 'thunder', 'lightning',
      'snow', 'snowy', 'snowing', 'fog', 'foggy', 'mist', 'misty',
      'wind', 'windy', 'breeze', 'breezy', 'hurricane', 'tornado',
      'weather', 'atmospheric', 'climate', 'precipitation', 'drizzle',
      'hail', 'sleet', 'blizzard', 'monsoon', 'typhoon'
    ];
    
    const promptLower = userPrompt.toLowerCase();
    return weatherKeywords.some(keyword => promptLower.includes(keyword));
  }

  private generateSessionId(): string {
    return `auteur_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // State Management for Backend Integration
  public getState(): AuteurEngineState {
    return { ...this.state };
  }

  public setState(newState: Partial<AuteurEngineState>): void {
    this.state = { ...this.state, ...newState };
    this.saveState();
  }

  // Utility Methods
  public getDirectorDescription(directorName: string): string {
    const profile = this.getDirectorProfile(directorName);
    if (!profile) return '';

    const { style_profile } = profile;
    const keyElements = [
      ...style_profile.visual_keywords.slice(0, 2),
      ...style_profile.composition_style.slice(0, 1),
      ...style_profile.lighting.slice(0, 1)
    ];

    return `${directorName} style: ${keyElements.join(', ')}`;
  }

  public validateDirectorName(directorName: string): boolean {
    return this.getAvailableDirectors().includes(directorName);
  }

  // Movie Database Methods
  public getMoviesByDirector(directorName: string): Movie[] {
    return getMoviesByDirector(directorName);
  }

  public getAllMovies(): Movie[] {
    return MOVIES_DATABASE;
  }

  public getMoviesByGenre(genre: string): Movie[] {
    return MOVIES_DATABASE.filter(movie => movie.genres.includes(genre));
  }

  public getMoviesByAward(award: string): Movie[] {
    return MOVIES_DATABASE.filter(movie => 
      movie.awards.some(awardName => 
        awardName.toLowerCase().includes(award.toLowerCase())
      )
    );
  }

  public getMoviesByVisualStyle(styleKeyword: string): Movie[] {
    return MOVIES_DATABASE.filter(movie => 
      movie.visualStyle.cinematography.some(style => 
        style.toLowerCase().includes(styleKeyword.toLowerCase())
      ) ||
      movie.visualStyle.colorPalette.some(color => 
        color.toLowerCase().includes(styleKeyword.toLowerCase())
      ) ||
      movie.visualStyle.lighting.some(light => 
        light.toLowerCase().includes(styleKeyword.toLowerCase())
      )
    );
  }

  public getMovieGenres(): string[] {
    const allGenres = new Set<string>();
    MOVIES_DATABASE.forEach(movie => {
      movie.genres.forEach(genre => allGenres.add(genre));
    });
    return Array.from(allGenres).sort();
  }

  public getMovieAwards(): string[] {
    const allAwards = new Set<string>();
    MOVIES_DATABASE.forEach(movie => {
      movie.awards.forEach(award => allAwards.add(award));
    });
    return Array.from(allAwards).sort();
  }

  public getMovieVisualStyles(): string[] {
    const allStyles = new Set<string>();
    MOVIES_DATABASE.forEach(movie => {
      movie.visualStyle.cinematography.forEach(style => allStyles.add(style));
      movie.visualStyle.colorPalette.forEach(color => allStyles.add(color));
      movie.visualStyle.lighting.forEach(light => allStyles.add(light));
    });
    return Array.from(allStyles).sort();
  }
}

// Export singleton instance
export const auteurEngine = AuteurEngine.getInstance();
