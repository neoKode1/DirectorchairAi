import { analyzePromptForDirectorStyle } from './film-director-data';

export interface JSONPromptStructure {
  scene: {
    setting: {
      location: string;
      time: string;
      weather?: {
        condition: string;
        visibility: string;
        temperature: string;
        wind: string;
      };
      lighting: {
        source: string;
        intensity: string;
        shadows: string;
      };
      environment: {
        architecture: string;
        details: string[];
        smells: string[];
        sounds: string[];
      };
    };
    characters: Array<{
      [key: string]: {
        name?: string;
        state?: string;
        clothing?: string;
        equipment?: string;
        emotions?: string[];
        actions?: string[];
        description?: string;
        visibility?: string;
        features?: string[];
        presence?: string;
        intent?: string;
      };
    }>;
    events: Array<{
      trigger: string;
      effect: string;
      escalation: string;
    }>;
    tone: {
      mood: string;
      pacing: string;
      color_palette: string[];
      camera_angles: string[];
      music?: {
        type: string;
        instruments: string[];
        volume: string;
      };
    };
    themes: string[];
    objective: {
      goal: string;
      viewer_reaction: string[];
    };
  };
}

export class JSONPromptGenerator {
  private genreContexts: Record<string, any> = {
    horror: {
      weather: ['atmospheric conditions', 'moody environment', 'oppressive atmosphere'],
      lighting: ['flickering fluorescent', 'dim candlelight', 'moonlight through clouds', 'emergency lighting'],
      architecture: ['abandoned building', 'gothic structure', 'dilapidated house', 'underground facility'],
      emotions: ['paralyzing fear', 'desperate panic', 'overwhelming dread', 'primal terror'],
      themes: ['isolation', 'fear of the unknown', 'inescapable past', 'descent into madness']
    },
    sci_fi: {
      weather: ['artificial atmosphere', 'controlled environment', 'space vacuum', 'alien climate'],
      lighting: ['neon glow', 'holographic displays', 'LED strips', 'artificial sunlight'],
      architecture: ['futuristic cityscape', 'space station', 'underground facility', 'alien structure'],
      emotions: ['awe and wonder', 'technological fascination', 'existential curiosity', 'controlled fear'],
      themes: ['technology vs humanity', 'artificial intelligence', 'space exploration', 'dystopian future']
    },
    thriller: {
      weather: ['atmospheric conditions', 'moody environment', 'tense atmosphere'],
      lighting: ['street lamps', 'car headlights', 'office lighting', 'natural daylight'],
      architecture: ['urban environment', 'office building', 'residential area', 'industrial zone'],
      emotions: ['heightened awareness', 'suspicious tension', 'controlled fear', 'determined focus'],
      themes: ['suspense', 'mystery', 'danger', 'survival']
    },
    drama: {
      weather: ['natural environment', 'atmospheric conditions', 'environmental mood'],
      lighting: ['natural window light', 'soft ambient lighting', 'warm interior lights', 'golden hour'],
      architecture: ['home interior', 'public space', 'natural setting', 'urban environment'],
      emotions: ['contemplative', 'emotional depth', 'quiet intensity', 'gentle melancholy'],
      themes: ['human connection', 'personal growth', 'emotional journey', 'life changes']
    }
  };

  private directorStyles: Record<string, any> = {
    ridley_scott: {
      lighting: ['atmospheric', 'moody', 'natural window light', 'backlighting for silhouettes'],
      camera_angles: ['wide establishing shots', 'close-ups on details', 'dutch angles for tension'],
      color_palette: ['cool blues and grays', 'warm oranges in contrast', 'desaturated tones'],
      pacing: 'deliberate, atmospheric, building tension'
    },
    christopher_nolan: {
      lighting: ['practical lighting', 'natural sources', 'high contrast', 'dramatic shadows'],
      camera_angles: ['handheld for immediacy', 'steady wide shots', 'close-ups for emotion'],
      color_palette: ['natural tones', 'high contrast black and white', 'muted colors'],
      pacing: 'intense, fast-paced, building momentum'
    },
    david_fincher: {
      lighting: ['controlled, precise', 'minimal artificial light', 'natural window light'],
      camera_angles: ['steady, controlled movements', 'close-ups on details', 'wide establishing shots'],
      color_palette: ['cool, desaturated tones', 'minimal color palette', 'high contrast'],
      pacing: 'methodical, precise, building tension'
    },
    denis_villeneuve: {
      lighting: ['atmospheric', 'natural light', 'minimal artificial sources', 'moody'],
      camera_angles: ['wide, contemplative shots', 'slow, deliberate movements', 'close-ups for intimacy'],
      color_palette: ['desaturated, natural tones', 'cool blues and grays', 'minimal contrast'],
      pacing: 'slow, contemplative, building atmosphere'
    }
  };

  generateJSONPrompt(userPrompt: string, contentType: string): JSONPromptStructure {
    console.log('🎬 [JSONPromptGenerator] Starting JSON prompt generation');
    console.log('🎬 [JSONPromptGenerator] User prompt:', userPrompt);
    console.log('🎬 [JSONPromptGenerator] Content type:', contentType);
    
    const directorAnalysis = analyzePromptForDirectorStyle(userPrompt);
    console.log('🎬 [JSONPromptGenerator] Director analysis:', directorAnalysis);
    
    const genre = this.detectGenreFromPrompt(userPrompt);
    console.log('🎬 [JSONPromptGenerator] Detected genre:', genre);
    
    const context = this.genreContexts[genre] || this.genreContexts.drama;
    const directorStyle = this.directorStyles[directorAnalysis.suggestedDirector] || this.directorStyles.denis_villeneuve;

    // Extract core elements from user prompt
    const coreElements = this.extractCoreElements(userPrompt);
    
    // Generate contextual details
    const setting = this.generateSetting(coreElements, context, directorStyle);
    const characters = this.generateCharacters(coreElements, context, directorStyle);
    const events = this.generateEvents(coreElements, context, directorStyle);
    const tone = this.generateTone(coreElements, context, directorStyle, directorAnalysis);
    const themes = this.generateThemes(coreElements, context, directorAnalysis);
    const objective = this.generateObjective(contentType, genre, directorAnalysis);

    return {
      scene: {
        setting,
        characters,
        events,
        tone,
        themes,
        objective
      }
    };
  }

  private detectGenreFromPrompt(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('horror') || lowerPrompt.includes('scary') || lowerPrompt.includes('monster') ||
        lowerPrompt.includes('ghost') || lowerPrompt.includes('demonic') || lowerPrompt.includes('supernatural')) {
      return 'horror';
    }
    
    if (lowerPrompt.includes('sci-fi') || lowerPrompt.includes('futuristic') || lowerPrompt.includes('robot') ||
        lowerPrompt.includes('alien') || lowerPrompt.includes('space') || lowerPrompt.includes('cyber') ||
        lowerPrompt.includes('t-800') || lowerPrompt.includes('terminator') || lowerPrompt.includes('neon')) {
      return 'sci_fi';
    }
    
    if (lowerPrompt.includes('thriller') || lowerPrompt.includes('suspense') || lowerPrompt.includes('action') ||
        lowerPrompt.includes('chase') || lowerPrompt.includes('danger') || lowerPrompt.includes('conflict')) {
      return 'thriller';
    }
    
    return 'drama';
  }

  private extractCoreElements(prompt: string): any {
    const lowerPrompt = prompt.toLowerCase();
    
    return {
      location: this.extractLocation(prompt),
      time: this.extractTime(prompt),
      characters: this.extractCharacters(prompt),
      actions: this.extractActions(prompt),
      mood: this.extractMood(prompt)
    };
  }

  private extractLocation(prompt: string): string {
    const locationPatterns = [
      /(?:in|at|on|inside|outside|within)\s+([^,\.]+)/gi,
      /([^,\.]+)\s+(?:street|alley|building|room|house|city|town|forest|mountain)/gi
    ];
    
    for (const pattern of locationPatterns) {
      const match = prompt.match(pattern);
      if (match) return match[0].trim();
    }
    
    return 'unknown location';
  }

  private extractTime(prompt: string): string {
    const timePatterns = [
      /(?:at|during|in)\s+(night|day|dawn|dusk|midnight|noon|morning|evening)/gi,
      /(\d{4})/g, // Year like 1984
      /(?:in|during)\s+([^,\.]+)/gi
    ];
    
    for (const pattern of timePatterns) {
      const match = prompt.match(pattern);
      if (match) return match[0].trim();
    }
    
    return 'unknown time';
  }

  private extractCharacters(prompt: string): string[] {
    const characterPatterns = [
      /(?:the|a|an)\s+([^,\.]+?)(?:\s+emerges|\s+appears|\s+walks|\s+stands)/gi,
      /([^,\.]+?)(?:\s+with|\s+wearing|\s+carrying)/gi
    ];
    
    const characters: string[] = [];
    for (const pattern of characterPatterns) {
      const matches = prompt.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !characters.includes(match[1])) {
          characters.push(match[1].trim());
        }
      }
    }
    
    return characters.length > 0 ? characters : ['protagonist'];
  }

  private extractActions(prompt: string): string[] {
    const actionVerbs = ['emerges', 'appears', 'walks', 'runs', 'stands', 'sits', 'looks', 'watches', 'moves'];
    const actions: string[] = [];
    
    for (const verb of actionVerbs) {
      if (prompt.toLowerCase().includes(verb)) {
        actions.push(verb);
      }
    }
    
    return actions;
  }

  private extractMood(prompt: string): string {
    const moodWords = ['dark', 'bright', 'moody', 'tense', 'peaceful', 'chaotic', 'serene', 'dramatic'];
    
    for (const word of moodWords) {
      if (prompt.toLowerCase().includes(word)) {
        return word;
      }
    }
    
    return 'neutral';
  }

  private generateSetting(coreElements: any, context: any, directorStyle: any): any {
    const weather = context.weather ? this.getRandomElement(context.weather) : undefined;
    
    return {
      location: coreElements.location,
      time: coreElements.time,
      weather: weather ? {
        condition: weather,
        visibility: this.getRandomElement(['low', 'medium', 'high']),
        temperature: this.getRandomElement(['chilly', 'warm', 'hot', 'cold']),
        wind: this.getRandomElement(['calm', 'breeze', 'windy', 'howling'])
      } : undefined,
      lighting: {
        source: this.getRandomElement(directorStyle.lighting || context.lighting),
        intensity: this.getRandomElement(['dim', 'medium', 'bright', 'harsh']),
        shadows: this.getRandomElement([
          'long, dramatic shadows',
          'soft, diffused shadows',
          'sharp, angular shadows',
          'minimal shadows'
        ])
      },
      environment: {
        architecture: this.getRandomElement(context.architecture),
        details: this.generateEnvironmentalDetails(context),
        smells: this.generateSmells(context),
        sounds: this.generateSounds(context)
      }
    };
  }

  private generateCharacters(coreElements: any, context: any, directorStyle: any): any[] {
    const characters = [];
    
    // Main character/protagonist
    if (coreElements.characters.length > 0) {
      characters.push({
        protagonist: {
          name: coreElements.characters[0],
          state: this.getRandomElement(['focused', 'tense', 'determined', 'curious']),
          clothing: this.getRandomElement(['casual attire', 'formal wear', 'practical clothing', 'uniform']),
          equipment: this.getRandomElement(['flashlight', 'camera', 'weapon', 'tool']),
          emotions: this.getRandomElements(context.emotions, 2),
          actions: coreElements.actions.length > 0 ? coreElements.actions : ['moving cautiously', 'observing surroundings']
        }
      });
    }
    
    // Additional characters or entities
    if (coreElements.characters.length > 1) {
      characters.push({
        entity: {
          description: coreElements.characters[1],
          visibility: this.getRandomElement(['clear', 'partially obscured', 'shadowy', 'barely visible']),
          features: this.generateEntityFeatures(context),
          presence: this.getRandomElement(['imposing', 'subtle', 'threatening', 'mysterious']),
          intent: this.getRandomElement(['unknown', 'hostile', 'curious', 'indifferent'])
        }
      });
    }
    
    return characters;
  }

  private generateEvents(coreElements: any, context: any, directorStyle: any): any[] {
    const events = [];
    
    // Generate 2-3 contextual events
    const eventTemplates = [
      {
        trigger: 'protagonist moves forward',
        effect: 'environment responds with atmospheric change',
        escalation: 'tension builds as situation becomes more intense'
      },
      {
        trigger: 'character interaction occurs',
        effect: 'mood shifts dramatically',
        escalation: 'conflict or revelation emerges'
      },
      {
        trigger: 'environmental element activates',
        effect: 'scene transforms unexpectedly',
        escalation: 'new threat or opportunity presents itself'
      }
    ];
    
    for (let i = 0; i < Math.min(3, eventTemplates.length); i++) {
      events.push(eventTemplates[i]);
    }
    
    return events;
  }

  private generateTone(coreElements: any, context: any, directorStyle: any, directorAnalysis: any): any {
    return {
      mood: this.getRandomElement(['tense', 'atmospheric', 'dramatic', 'contemplative']),
      pacing: directorStyle.pacing || 'moderate',
      color_palette: directorStyle.color_palette || ['natural tones', 'muted colors'],
      camera_angles: directorStyle.camera_angles || ['wide establishing shot', 'close-up for detail'],
      music: {
        type: this.getRandomElement(['ambient', 'orchestral', 'electronic', 'minimal']),
        instruments: this.getRandomElements(['strings', 'piano', 'synthesizer', 'drums'], 2),
        volume: this.getRandomElement(['subtle', 'moderate', 'prominent'])
      }
    };
  }

  private generateThemes(coreElements: any, context: any, directorAnalysis: any): string[] {
    const baseThemes = context.themes || ['human experience', 'personal journey'];
    return this.getRandomElements(baseThemes, 3);
  }

  private generateObjective(contentType: string, genre: string, directorAnalysis: any): any {
    return {
      goal: `Create a ${contentType} that captures the essence of ${genre} with ${directorAnalysis.suggestedDirector}'s signature style`,
      viewer_reaction: [
        'emotional engagement',
        'visual immersion',
        'atmospheric connection'
      ]
    };
  }

  private generateEnvironmentalDetails(context: any): string[] {
    const detailTemplates = [
      'subtle atmospheric elements',
      'environmental storytelling details',
      'mood-enhancing features',
      'character-revealing surroundings'
    ];
    
    return this.getRandomElements(detailTemplates, 3);
  }

  private generateSmells(context: any): string[] {
    const smellTemplates = [
      'atmospheric scents',
      'environmental odors',
      'mood-setting aromas'
    ];
    
    return this.getRandomElements(smellTemplates, 2);
  }

  private generateSounds(context: any): string[] {
    const soundTemplates = [
      'ambient environmental sounds',
      'atmospheric audio elements',
      'mood-enhancing audio details'
    ];
    
    return this.getRandomElements(soundTemplates, 2);
  }

  private generateEntityFeatures(context: any): string[] {
    const featureTemplates = [
      'distinctive physical characteristics',
      'unique behavioral traits',
      'memorable visual elements'
    ];
    
    return this.getRandomElements(featureTemplates, 2);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Convert JSON structure back to a natural language prompt
  convertToNaturalLanguage(jsonStructure: JSONPromptStructure): string {
    console.log('🎬 [JSONPromptGenerator] Converting JSON structure to natural language');
    console.log('🎬 [JSONPromptGenerator] JSON structure:', JSON.stringify(jsonStructure, null, 2));
    
    const { scene } = jsonStructure;
    
    let prompt = '';
    
    // Setting
    prompt += `${scene.setting.location} at ${scene.setting.time}. `;
    if (scene.setting.weather) {
      prompt += `${scene.setting.weather.condition} with ${scene.setting.weather.visibility} visibility. `;
    }
    prompt += `${scene.setting.lighting.source} provides ${scene.setting.lighting.intensity} lighting, creating ${scene.setting.lighting.shadows}. `;
    
    // Characters
    if (scene.characters.length > 0) {
      const protagonist = scene.characters[0];
      const charKey = Object.keys(protagonist)[0];
      const char = protagonist[charKey];
      
      if (char.name && char.name !== 'protagonist') {
        prompt += `${char.name} is ${char.state}, wearing ${char.clothing}. `;
        if (char.actions && char.actions.length > 0) {
          prompt += `${char.actions.join(', ')}. `;
        }
      }
    }
    
    // Tone and atmosphere
    prompt += `The scene has a ${scene.tone.mood} mood with ${scene.tone.pacing} pacing. `;
    prompt += `Color palette features ${scene.tone.color_palette.join(', ')}. `;
    
    const finalPrompt = prompt.trim();
    console.log('🎬 [JSONPromptGenerator] Final natural language prompt:', finalPrompt);
    
    return finalPrompt;
  }
}

// Export singleton instance
export const jsonPromptGenerator = new JSONPromptGenerator();
