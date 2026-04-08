import { logger } from '@/lib/logger';

const log = logger.child({ module: 'film-director-data' });

// Enhanced Film Director Data with Award-Winning Cinematic Knowledge
export const filmDirectorData = {
  // Director-Specific Styles
  "directors": {
    "denis_villeneuve": {
      name: "Denis Villeneuve",
      style: "Atmospheric, minimalist, expansive environments, muted color palette",
      techniques: [
        "wide establishing shots with vast landscapes",
        "minimalist composition with negative space",
        "atmospheric lighting with natural sources",
        "slow, deliberate camera movements",
        "restrained color palette (blues, grays, earth tones)",
        "emphasis on mood and tone over action",
        "long takes with subtle camera adjustments",
        "naturalistic lighting with practical sources"
      ],
      lighting: [
        "natural window light",
        "overcast daylight",
        "minimal artificial lighting",
        "shadow play with architectural elements",
        "backlighting for silhouette effects",
        "practical lighting sources visible in frame"
      ]
    },
    "christopher_nolan": {
      name: "Christopher Nolan",
      style: "Practical effects, deep shadows, natural lighting, real-world locations",
      techniques: [
        "deep shadows and high contrast",
        "natural lighting with practical sources",
        "real-world locations over studio sets",
        "handheld camera for immediacy",
        "wide-angle lenses for immersive feel",
        "minimal CGI, emphasis on practical effects",
        "nonlinear storytelling visual cues",
        "muted, desaturated color palette"
      ],
      lighting: [
        "natural daylight with deep shadows",
        "practical lighting (lamps, candles, streetlights)",
        "high contrast lighting ratios",
        "backlighting for dramatic silhouettes",
        "minimal fill light",
        "natural color temperature sources"
      ]
    },
    "david_fincher": {
      name: "David Fincher",
      style: "Precise composition, controlled lighting, digital precision",
      techniques: [
        "precise geometric composition",
        "controlled lighting with minimal shadows",
        "digital color grading for mood",
        "steady camera movements",
        "close-ups with detailed textures",
        "symmetrical framing",
        "high production value with digital precision"
      ],
      lighting: [
        "controlled three-point lighting",
        "minimal shadows and contrast",
        "cool color temperature",
        "precise light placement",
        "digital color grading enhancement"
      ]
    },
    "martin_scorsese": {
      name: "Martin Scorsese",
      style: "Dynamic camera work, vibrant colors, urban realism, character-driven storytelling",
      techniques: [
        "dynamic tracking shots following characters",
        "vibrant color palette with rich saturation",
        "urban environment authenticity",
        "character-driven camera movements",
        "handheld camera for immediacy",
        "long takes with complex choreography",
        "close-ups emphasizing emotion",
        "realistic urban lighting and atmosphere"
      ],
      lighting: [
        "urban street lighting",
        "neon and practical sources",
        "vibrant color temperature",
        "dynamic lighting changes",
        "realistic urban atmosphere",
        "character-focused lighting"
      ]
    },
    "steven_spielberg": {
      name: "Steven Spielberg",
      style: "Epic scale, wonder and awe, masterful composition, emotional storytelling",
      techniques: [
        "epic wide shots establishing scale",
        "wonder-inducing camera movements",
        "masterful composition with depth",
        "emotional close-ups",
        "smooth tracking shots",
        "dramatic lighting for impact",
        "character-focused framing",
        "immersive camera work"
      ],
      lighting: [
        "dramatic backlighting",
        "warm, inviting color palette",
        "natural daylight enhancement",
        "emotional lighting cues",
        "atmospheric conditions",
        "character-illuminating sources"
      ]
    },
    "ridley_scott": {
      name: "Ridley Scott",
      style: "Atmospheric sci-fi, detailed world-building, moody lighting, epic scale",
      techniques: [
        "atmospheric world-building shots",
        "moody, atmospheric lighting",
        "detailed production design focus",
        "epic establishing shots",
        "slow, deliberate camera movements",
        "high contrast lighting",
        "immersive environment shots",
        "character isolation in vast spaces"
      ],
      lighting: [
        "atmospheric fog and smoke",
        "high contrast lighting",
        "cool, moody color palette",
        "practical lighting sources",
        "dramatic shadows",
        "environmental lighting effects"
      ]
    },
    "guillermo_del_toro": {
      name: "Guillermo del Toro",
      style: "Dark fantasy, rich colors, gothic atmosphere, magical realism",
      techniques: [
        "rich, saturated color palette",
        "gothic architectural elements",
        "magical realism lighting",
        "detailed creature and set design",
        "atmospheric camera movements",
        "close-ups on fantastical elements",
        "moody, romantic lighting",
        "character transformation focus"
      ],
      lighting: [
        "warm, golden hour lighting",
        "rich, saturated colors",
        "gothic atmospheric effects",
        "magical lighting sources",
        "romantic, moody atmosphere",
        "character-illuminating backlighting"
      ]
    },
    "david_cronenberg": {
      name: "David Cronenberg",
      style: "Body horror, clinical precision, unsettling atmosphere, psychological tension",
      techniques: [
        "clinical, precise camera work",
        "unsettling, disorienting angles",
        "body-focused close-ups",
        "sterile, medical lighting",
        "psychological tension through framing",
        "transformation-focused shots",
        "uncomfortable intimacy",
        "body horror emphasis"
      ],
      lighting: [
        "clinical, bright lighting",
        "sterile, medical atmosphere",
        "harsh, revealing light",
        "minimal shadows",
        "cool, antiseptic color palette",
        "uncomfortable brightness"
      ]
    },
    "clint_eastwood": {
      name: "Clint Eastwood",
      style: "Naturalistic, understated, character-driven, authentic realism",
      techniques: [
        "naturalistic camera work",
        "understated, authentic performances",
        "character-driven storytelling",
        "minimal camera movement",
        "realistic lighting and atmosphere",
        "simple, effective composition",
        "emotional restraint",
        "authentic location shooting"
      ],
      lighting: [
        "natural daylight",
        "minimal artificial lighting",
        "authentic location lighting",
        "soft, realistic shadows",
        "warm, natural color palette",
        "character-focused illumination"
      ]
    },
    "hayao_miyazaki": {
      name: "Hayao Miyazaki",
      style: "Whimsical, nature-focused, gentle movement, magical realism",
      techniques: [
        "gentle, flowing camera movements",
        "nature-focused composition",
        "whimsical, magical elements",
        "soft, dreamlike lighting",
        "character connection with environment",
        "peaceful, contemplative pacing",
        "natural world integration",
        "magical realism atmosphere"
      ],
      lighting: [
        "soft, natural lighting",
        "warm, inviting color palette",
        "magical, ethereal effects",
        "gentle shadows",
        "nature-inspired illumination",
        "dreamlike atmosphere"
      ]
    },
    "akira_kurosawa": {
      name: "Akira Kurosawa",
      style: "Epic samurai films, dynamic composition, human drama, natural elements",
      techniques: [
        "epic wide shots with multiple planes of action",
        "precise geometric composition",
        "character-driven camera movements",
        "natural lighting with dramatic shadows",
        "long takes with complex choreography",
        "emphasis on human emotion and drama",
        "masterful use of negative space",
        "dynamic natural elements (when contextually appropriate)"
      ],
      lighting: [
        "natural daylight with dramatic shadows",
        "high contrast lighting ratios",
        "backlighting for dramatic silhouettes",
        "practical lighting sources"
      ]
    },
    "alfred_hitchcock": {
      name: "Alfred Hitchcock",
      style: "Suspense, psychological tension, precise composition, voyeuristic camera",
      techniques: [
        "voyeuristic camera angles",
        "precise geometric composition",
        "suspense-building camera movements",
        "psychological tension through framing",
        "masterful use of shadows and light",
        "character point-of-view shots",
        "controlled color palette for mood",
        "emphasis on psychological horror"
      ],
      lighting: [
        "dramatic shadows and contrast",
        "mood-setting color temperatures",
        "precise light placement",
        "psychological lighting effects",
        "suspense-building illumination"
      ]
    },
    "stanley_kubrick": {
      name: "Stanley Kubrick",
      style: "Symmetrical composition, precise camera movements, atmospheric lighting, psychological depth",
      techniques: [
        "perfect symmetrical composition",
        "precise tracking shots",
        "atmospheric lighting design",
        "psychological depth through framing",
        "masterful use of color symbolism",
        "controlled camera movements",
        "emphasis on visual storytelling",
        "geometric precision in every frame"
      ],
      lighting: [
        "atmospheric lighting design",
        "color temperature symbolism",
        "precise light placement",
        "psychological lighting effects",
        "controlled contrast ratios"
      ]
    },
    "quentin_tarantino": {
      name: "Quentin Tarantino",
      style: "Stylized violence, pop culture references, dynamic camera work, genre-blending",
      techniques: [
        "stylized action sequences",
        "pop culture visual references",
        "dynamic camera movements",
        "genre-blending visual styles",
        "bold color choices",
        "character-driven camera work",
        "emphasis on dialogue and character",
        "cinematic homage and references"
      ],
      lighting: [
        "stylized lighting for mood",
        "bold color temperature choices",
        "dramatic lighting for action",
        "character-focused illumination",
        "genre-appropriate lighting"
      ]
    },
    "wes_anderson": {
      name: "Wes Anderson",
      style: "Symmetrical composition, pastel color palette, precise camera movements, whimsical storytelling",
      techniques: [
        "perfect symmetrical composition",
        "pastel color palette",
        "precise tracking shots",
        "whimsical visual storytelling",
        "detailed production design",
        "controlled camera movements",
        "emphasis on visual symmetry",
        "cinematic whimsy and charm"
      ],
      lighting: [
        "soft, pastel lighting",
        "controlled color temperatures",
        "symmetrical light placement",
        "whimsical lighting effects",
        "precise illumination control"
      ]
    },
    "coen_brothers": {
      name: "Coen Brothers",
      style: "Dark comedy, precise composition, atmospheric lighting, character-driven storytelling",
      techniques: [
        "dark comedy visual style",
        "precise geometric composition",
        "atmospheric lighting design",
        "character-driven camera work",
        "controlled color palette",
        "emphasis on character moments",
        "cinematic storytelling precision",
        "mood-setting visual elements"
      ],
      lighting: [
        "atmospheric mood lighting",
        "controlled color temperatures",
        "character-focused illumination",
        "mood-setting light placement",
        "precise lighting control"
      ]
    },
    "paul_thomas_anderson": {
      name: "Paul Thomas Anderson",
      style: "Long takes, naturalistic lighting, character intimacy, cinematic realism",
      techniques: [
        "long takes with complex choreography",
        "naturalistic lighting design",
        "character intimacy through framing",
        "cinematic realism approach",
        "controlled camera movements",
        "emphasis on character moments",
        "naturalistic visual storytelling",
        "intimate character focus"
      ],
      lighting: [
        "naturalistic lighting design",
        "character-focused illumination",
        "realistic color temperatures",
        "intimate lighting effects",
        "natural light sources"
      ]
    }
  },

  // Advanced Cinematic Techniques
  "advanced_techniques": {
    "composition": [
      "rule of thirds with dynamic placement",
      "leading lines drawing eye through frame",
      "symmetrical composition for stability",
      "asymmetrical balance for tension",
      "negative space for breathing room",
      "frame within frame for depth",
      "diagonal composition for energy",
      "centered composition for power"
    ],
    "camera_movement": [
      "slow dolly in for intimacy",
      "steady tracking shot following subject",
      "handheld for immediacy and realism",
      "crane shot for grandeur and scale",
      "dutch angle for disorientation",
      "low angle for power and intimidation",
      "high angle for vulnerability",
      "extreme close-up for emotional impact"
    ],
    "lighting_techniques": [
      "three-point lighting for classic look",
      "natural window light for realism",
      "backlighting for silhouette and drama",
      "side lighting for texture and depth",
      "top lighting for mystery and shadow",
      "practical lighting for authenticity",
      "color temperature contrast for mood",
      "minimal lighting for documentary feel"
    ]
  },

  // Genre-Specific Enhancements
  "genres": {
    "horror": {
      techniques: ["low-angle shot", "dutch angle", "extreme close-up", "shaky cam", "jump cut"],
      lighting: ["low-key lighting", "practical sources only", "deep shadows", "minimal fill"],
      mood: "claustrophobic, disorienting, threatening"
    },
    "thriller": {
      techniques: ["handheld camera", "close-up", "tracking shot", "rack focus", "long take"],
      lighting: ["natural lighting", "practical sources", "high contrast", "minimal artificial"],
      mood: "tense, realistic, immediate"
    },
    "drama": {
      techniques: ["close-up", "long take", "shot-reverse-shot", "static camera", "slow movement"],
      lighting: ["natural window light", "minimal artificial", "soft shadows", "warm tones"],
      mood: "intimate, contemplative, emotional"
    },
    "sci_fi": {
      techniques: ["wide establishing shot", "dolly zoom", "anamorphic lens", "steady camera"],
      lighting: ["cool color temperature", "minimal practical", "atmospheric", "muted palette"],
      mood: "expansive, contemplative, otherworldly"
    }
  },

  // Emotion-Driven Cinematography
  "emotions": {
    "tension": {
      techniques: ["dutch angle", "low-angle shot", "extreme close-up", "handheld"],
      lighting: ["high contrast", "deep shadows", "minimal fill", "cool tones"],
      composition: "tight framing, asymmetrical balance"
    },
    "intimacy": {
      techniques: ["close-up", "soft focus", "two-shot", "slow movement"],
      lighting: ["soft natural light", "warm tones", "minimal shadows", "practical sources"],
      composition: "centered, symmetrical, shallow depth of field"
    },
    "isolation": {
      techniques: ["wide shot", "long shot", "static camera", "slow movement"],
      lighting: ["minimal lighting", "natural sources", "cool tones", "deep shadows"],
      composition: "centered subject in vast space, negative space"
    },
    "power": {
      techniques: ["low-angle shot", "wide lens", "steady camera", "slow movement"],
      lighting: ["backlighting", "high contrast", "minimal fill", "dramatic shadows"],
      composition: "centered, symmetrical, strong leading lines"
    }
  },

  // Scene-Specific Enhancements
  "scenes": {
    "interior_night": {
      techniques: ["close-up", "handheld", "rack focus", "long take"],
      lighting: ["practical lighting only", "minimal artificial", "warm tones", "deep shadows"],
      mood: "intimate, mysterious, realistic"
    },
    "exterior_day": {
      techniques: ["wide shot", "establishing shot", "steady camera", "natural movement"],
      lighting: ["natural daylight", "minimal artificial", "soft shadows", "natural color"],
      mood: "expansive, natural, authentic"
    },
    "urban_environment": {
      techniques: ["tracking shot", "handheld", "close-up", "wide establishing"],
      lighting: ["mixed sources", "practical street lighting", "natural daylight", "realistic contrast"],
      mood: "immediate, realistic, dynamic"
    },
    "natural_landscape": {
      techniques: ["wide establishing shot", "slow movement", "steady camera", "long take"],
      lighting: ["natural daylight", "atmospheric conditions", "minimal artificial", "natural color palette"],
      mood: "expansive, contemplative, immersive"
    }
  },

  // Shot Type Explanations with Director Context
  "shot_explanations": {
    "extreme_close_up": "Denis Villeneuve style: Intimate detail with natural lighting, emphasizing texture and emotion without artificial enhancement.",
    "close_up": "Christopher Nolan approach: Natural lighting with practical sources, minimal artificial fill, emphasizing authenticity.",
    "wide_shot": "Villeneuve signature: Expansive environments with minimalist composition, atmospheric lighting, emphasis on mood over action.",
    "low_angle_shot": "Nolan technique: Deep shadows, natural lighting, practical sources, creating power without artificial drama.",
    "dutch_angle": "Fincher precision: Controlled composition with minimal lighting, creating disorientation through precise framing.",
    "tracking_shot": "Villeneuve style: Slow, deliberate movement following subject through natural environments with atmospheric lighting.",
    "handheld_camera": "Nolan approach: Immediate realism with natural lighting, practical sources, minimal artificial enhancement.",
    "establishing_shot": "Villeneuve signature: Vast landscapes with minimalist composition, natural lighting, emphasis on environment over subject.",
    "backlighting": "Nolan technique: Natural sources creating dramatic silhouettes, minimal fill, authentic lighting ratios.",
    "natural_window_light": "Villeneuve style: Soft, natural illumination through architectural elements, minimal artificial enhancement.",
    "practical_lighting": "Nolan approach: Visible light sources in frame, natural color temperature, minimal artificial fill.",
    "minimal_lighting": "Fincher precision: Controlled three-point lighting with minimal shadows, digital color grading for mood.",
    "atmospheric_lighting": "Villeneuve signature: Environmental lighting conditions, natural color palette, emphasis on mood and tone.",
    "high_contrast": "Nolan technique: Deep shadows with natural lighting, practical sources, minimal artificial fill.",
    "soft_focus": "Villeneuve style: Natural depth of field, atmospheric conditions, minimal artificial enhancement.",
    "deep_shadows": "Nolan approach: Natural lighting ratios, practical sources, minimal artificial fill, authentic contrast.",
    "slow_movement": "Villeneuve signature: Deliberate camera movements, atmospheric pacing, emphasis on contemplation.",
    "steady_camera": "Fincher precision: Controlled movements, digital stabilization, precise composition and lighting."
  }
};

// Enhanced prompt analysis with director knowledge
export function analyzePromptForDirectorStyle(prompt: string): {
  suggestedDirector: string;
  techniques: string[];
  lighting: string[];
  styleDescription: string;
} {
  const lowerPrompt = prompt.toLowerCase();

  // Genre detection based on content and mood
  const detectedGenre = detectGenreFromPrompt(lowerPrompt);
  const detectedMood = detectMoodFromPrompt(lowerPrompt);
  const detectedScene = detectSceneFromPrompt(lowerPrompt);
  
  log.debug({ genre: detectedGenre, mood: detectedMood, scene: detectedScene }, 'Prompt analysis');
  
  // Director selection based on genre, mood, and scene
  const selectedDirector = selectDirectorByGenreAndMood(detectedGenre, detectedMood, detectedScene, lowerPrompt);
  
  log.debug({ director: selectedDirector }, 'Director selected');
  
  const director = filmDirectorData.directors[selectedDirector as keyof typeof filmDirectorData.directors];
  
  return {
    suggestedDirector: selectedDirector,
    techniques: director.techniques.slice(0, 4),
    lighting: director.lighting.slice(0, 3),
    styleDescription: `${director.name} style: ${director.style} - Perfect for ${detectedGenre} content with ${detectedMood} mood`
  };
}

// Genre detection function
function detectGenreFromPrompt(prompt: string): string {
  // Horror indicators
  if (prompt.includes('horror') || prompt.includes('scary') || prompt.includes('frightening') || 
      prompt.includes('terrifying') || prompt.includes('nightmare') || prompt.includes('dark') ||
      prompt.includes('shadow') || prompt.includes('creepy') || prompt.includes('eerie') ||
      prompt.includes('demonic') || prompt.includes('supernatural') || prompt.includes('ghost')) {
    return 'horror';
  }
  
  // Thriller indicators
  if (prompt.includes('thriller') || prompt.includes('suspense') || prompt.includes('tension') ||
      prompt.includes('mystery') || prompt.includes('investigation') || prompt.includes('chase') ||
      prompt.includes('action') || prompt.includes('danger') || prompt.includes('conflict') ||
      prompt.includes('dramatic') || prompt.includes('intense')) {
    return 'thriller';
  }
  
  // Sci-Fi indicators
  if (prompt.includes('sci-fi') || prompt.includes('science fiction') || prompt.includes('futuristic') ||
      prompt.includes('space') || prompt.includes('alien') || prompt.includes('robot') ||
      prompt.includes('cyber') || prompt.includes('digital') || prompt.includes('technology') ||
      prompt.includes('future') || prompt.includes('otherworldly') || prompt.includes('cosmic') ||
      prompt.includes('t-800') || prompt.includes('terminator') || prompt.includes('android') ||
      prompt.includes('neon') || prompt.includes('cyberpunk') || prompt.includes('dystopian') ||
      prompt.includes('artificial intelligence') || prompt.includes('ai') || prompt.includes('machine') ||
      prompt.includes('hologram') || prompt.includes('virtual reality') || prompt.includes('vr')) {
    return 'sci_fi';
  }
  
  // Drama indicators
  if (prompt.includes('drama') || prompt.includes('emotional') || prompt.includes('intimate') ||
      prompt.includes('personal') || prompt.includes('relationship') || prompt.includes('family') ||
      prompt.includes('love') || prompt.includes('romance') || prompt.includes('melancholy') ||
      prompt.includes('contemplative') || prompt.includes('reflective') || prompt.includes('nostalgic')) {
    return 'drama';
  }
  
  // Default to drama for portraits and character-focused content
  if (prompt.includes('portrait') || prompt.includes('person') || prompt.includes('face') ||
      prompt.includes('character') || prompt.includes('man') || prompt.includes('woman')) {
    return 'drama';
  }
  
  // Default to drama for landscapes and nature (contemplative)
  if (prompt.includes('landscape') || prompt.includes('nature') || prompt.includes('peaceful') ||
      prompt.includes('serene') || prompt.includes('calm') || prompt.includes('tranquil')) {
    return 'drama';
  }
  
  return 'drama'; // Default fallback
}

// Mood detection function
function detectMoodFromPrompt(prompt: string): string {
  // Tension indicators
  if (prompt.includes('tense') || prompt.includes('anxious') || prompt.includes('worried') ||
      prompt.includes('stressful') || prompt.includes('conflict') || prompt.includes('danger')) {
    return 'tension';
  }
  
  // Intimacy indicators
  if (prompt.includes('intimate') || prompt.includes('close') || prompt.includes('personal') ||
      prompt.includes('romantic') || prompt.includes('love') || prompt.includes('tender') ||
      prompt.includes('warm') || prompt.includes('gentle')) {
    return 'intimacy';
  }
  
  // Isolation indicators
  if (prompt.includes('lonely') || prompt.includes('isolated') || prompt.includes('alone') ||
      prompt.includes('solitary') || prompt.includes('deserted') || prompt.includes('abandoned') ||
      prompt.includes('empty') || prompt.includes('vast')) {
    return 'isolation';
  }
  
  // Power indicators
  if (prompt.includes('powerful') || prompt.includes('strong') || prompt.includes('majestic') ||
      prompt.includes('heroic') || prompt.includes('epic') || prompt.includes('grand') ||
      prompt.includes('impressive') || prompt.includes('commanding')) {
    return 'power';
  }
  
  return 'intimacy'; // Default to intimate for most content
}

// Scene detection function
function detectSceneFromPrompt(prompt: string): string {
  // Interior night indicators
  if (prompt.includes('night') || prompt.includes('dark') || prompt.includes('indoor') ||
      prompt.includes('room') || prompt.includes('interior') || prompt.includes('inside')) {
    return 'interior_night';
  }
  
  // Exterior day indicators
  if (prompt.includes('day') || prompt.includes('sunlight') || prompt.includes('outdoor') ||
      prompt.includes('outside') || prompt.includes('exterior') || prompt.includes('sunny')) {
    return 'exterior_day';
  }
  
  // Urban environment indicators
  if (prompt.includes('city') || prompt.includes('urban') || prompt.includes('street') ||
      prompt.includes('building') || prompt.includes('architecture') || prompt.includes('metropolitan') ||
      prompt.includes('alley') || prompt.includes('neon') || prompt.includes('cyberpunk') ||
      prompt.includes('los angeles') || prompt.includes('downtown') || prompt.includes('cityscape')) {
    return 'urban_environment';
  }
  
  // Natural landscape indicators
  if (prompt.includes('landscape') || prompt.includes('nature') || prompt.includes('forest') ||
      prompt.includes('mountain') || prompt.includes('beach') || prompt.includes('wilderness') ||
      prompt.includes('rural') || prompt.includes('countryside')) {
    return 'natural_landscape';
  }
  
  return 'exterior_day'; // Default fallback
}

// Director selection based on genre, mood, and scene
function selectDirectorByGenreAndMood(genre: string, mood: string, scene: string, prompt: string): string {
  // Horror content - Multiple options based on type
  if (genre === 'horror') {
    if (prompt.includes('body') || prompt.includes('transformation') || prompt.includes('medical') || prompt.includes('clinical')) {
      return 'david_cronenberg'; // Body horror
    }
    if (prompt.includes('gothic') || prompt.includes('fantasy') || prompt.includes('magical') || prompt.includes('romantic')) {
      return 'guillermo_del_toro'; // Dark fantasy horror
    }
    return 'david_fincher'; // Psychological horror
  }
  
  // Sci-Fi content - Multiple options based on style and subject
  if (genre === 'sci_fi') {
    // Cyberpunk/Dystopian content
    if (prompt.includes('neon') || prompt.includes('cyberpunk') || prompt.includes('dystopian') ||
        prompt.includes('t-800') || prompt.includes('terminator') || prompt.includes('android') ||
        prompt.includes('artificial intelligence') || prompt.includes('ai') || prompt.includes('machine') ||
        prompt.includes('hologram') || prompt.includes('virtual reality') || prompt.includes('vr') ||
        prompt.includes('blade runner') || prompt.includes('los angeles') || prompt.includes('1984') ||
        prompt.includes('steam') || prompt.includes('grates') || prompt.includes('endoskeleton')) {
      return 'ridley_scott'; // Blade Runner, Alien - atmospheric cyberpunk
    }
    
    // Epic/Space content
    if (prompt.includes('epic') || prompt.includes('wonder') || prompt.includes('awe') || 
        prompt.includes('emotional') || prompt.includes('space') || prompt.includes('cosmic') ||
        prompt.includes('alien') || prompt.includes('otherworldly')) {
      return 'steven_spielberg'; // Close Encounters, E.T. - epic sci-fi
    }
    
    // Atmospheric/Minimalist content
    if (prompt.includes('atmospheric') || prompt.includes('world-building') || 
        prompt.includes('detailed') || prompt.includes('moody') || prompt.includes('minimalist') ||
        prompt.includes('contemplative') || prompt.includes('slow')) {
      return 'denis_villeneuve'; // Arrival, Dune - atmospheric, minimalist sci-fi
    }
    
    // High-tech/Precision content
    if (prompt.includes('digital') || prompt.includes('technology') || prompt.includes('precise') ||
        prompt.includes('clean') || prompt.includes('controlled') || prompt.includes('systematic')) {
      return 'david_fincher'; // Social Network, Fight Club - precise, digital aesthetic
    }
    
    return 'ridley_scott'; // Default to Ridley Scott for sci-fi
  }
  
  // Thriller content - Multiple options based on style
  if (genre === 'thriller') {
    if (prompt.includes('urban') || prompt.includes('city') || prompt.includes('street') || prompt.includes('vibrant')) {
      return 'martin_scorsese'; // Urban thriller
    }
    if (prompt.includes('epic') || prompt.includes('action') || prompt.includes('adventure') || prompt.includes('wonder')) {
      return 'steven_spielberg'; // Epic thriller
    }
    return 'christopher_nolan'; // Practical, realistic thrillers
  }
  
  // Drama content - Director selection based on mood and scene
  if (genre === 'drama') {
    // Intimate drama - Multiple options
    if (mood === 'intimacy') {
      if (prompt.includes('naturalistic') || prompt.includes('understated') || prompt.includes('authentic')) {
        return 'clint_eastwood'; // Naturalistic intimacy
      }
      return 'david_fincher'; // Precise, controlled intimacy
    }
    
    // Isolation drama - Multiple options
    if (mood === 'isolation') {
      if (prompt.includes('whimsical') || prompt.includes('nature') || prompt.includes('magical') || prompt.includes('gentle')) {
        return 'hayao_miyazaki'; // Whimsical isolation
      }
      return 'denis_villeneuve'; // Atmospheric isolation
    }
    
    // Power drama - Multiple options
    if (mood === 'power') {
      if (prompt.includes('epic') || prompt.includes('wonder') || prompt.includes('awe')) {
        return 'steven_spielberg'; // Epic power
      }
      return 'christopher_nolan'; // Practical, authentic power
    }
    
    // Tension drama - Multiple options
    if (mood === 'tension') {
      if (prompt.includes('urban') || prompt.includes('city') || prompt.includes('dynamic')) {
        return 'martin_scorsese'; // Urban tension
      }
      return 'christopher_nolan'; // Realistic tension
    }
    
    // Natural landscapes - Multiple options
    if (scene === 'natural_landscape') {
      if (prompt.includes('whimsical') || prompt.includes('magical') || prompt.includes('nature') || prompt.includes('gentle')) {
        return 'hayao_miyazaki'; // Whimsical nature
      }
      if (prompt.includes('epic') || prompt.includes('wonder') || prompt.includes('awe')) {
        return 'steven_spielberg'; // Epic landscapes
      }
      return 'denis_villeneuve'; // Atmospheric landscapes
    }
    
    // Urban environments - Multiple options
    if (scene === 'urban_environment') {
      if (prompt.includes('vibrant') || prompt.includes('dynamic') || prompt.includes('character-driven')) {
        return 'martin_scorsese'; // Dynamic urban
      }
      return 'christopher_nolan'; // Practical urban realism
    }
    
    // Interior scenes - Multiple options
    if (scene === 'interior_night') {
      if (prompt.includes('gothic') || prompt.includes('fantasy') || prompt.includes('magical')) {
        return 'guillermo_del_toro'; // Gothic interiors
      }
      return 'david_fincher'; // Controlled interior lighting
    }
    
    // Exterior scenes - Multiple options
    if (scene === 'exterior_day') {
      if (prompt.includes('epic') || prompt.includes('wonder') || prompt.includes('awe')) {
        return 'steven_spielberg'; // Epic exteriors
      }
      return 'denis_villeneuve'; // Atmospheric exteriors
    }
  }
  
  // Additional prompt-based overrides for new directors
  if (prompt.includes('gothic') || prompt.includes('fantasy') || prompt.includes('magical') || prompt.includes('romantic')) {
    return 'guillermo_del_toro';
  }
  
  if (prompt.includes('body') || prompt.includes('transformation') || prompt.includes('clinical') || prompt.includes('medical')) {
    return 'david_cronenberg';
  }
  
  if (prompt.includes('epic') || prompt.includes('wonder') || prompt.includes('awe') || prompt.includes('emotional')) {
    return 'steven_spielberg';
  }
  
  if (prompt.includes('urban') || prompt.includes('vibrant') || prompt.includes('dynamic') || prompt.includes('character-driven')) {
    return 'martin_scorsese';
  }
  
  if (prompt.includes('atmospheric') || prompt.includes('world-building') || prompt.includes('moody')) {
    return 'ridley_scott';
  }
  
  if (prompt.includes('naturalistic') || prompt.includes('understated') || prompt.includes('authentic')) {
    return 'clint_eastwood';
  }
  
  if (prompt.includes('whimsical') || prompt.includes('nature') || prompt.includes('gentle') || prompt.includes('magical')) {
    return 'hayao_miyazaki';
  }
  
  // New director overrides
  if (prompt.includes('samurai') || prompt.includes('epic') || prompt.includes('drama')) {
    return 'akira_kurosawa';
  }
  
  if (prompt.includes('suspense') || prompt.includes('psychological') || prompt.includes('voyeuristic') || prompt.includes('tension')) {
    return 'alfred_hitchcock';
  }
  
  if (prompt.includes('symmetrical') || prompt.includes('precise') || prompt.includes('psychological') || prompt.includes('geometric')) {
    return 'stanley_kubrick';
  }
  
  if (prompt.includes('stylized') || prompt.includes('pop culture') || prompt.includes('dynamic') || prompt.includes('genre-blending')) {
    return 'quentin_tarantino';
  }
  
  if (prompt.includes('pastel') || prompt.includes('whimsical') || prompt.includes('symmetrical') || prompt.includes('charm')) {
    return 'wes_anderson';
  }
  
  if (prompt.includes('dark comedy') || prompt.includes('atmospheric') || prompt.includes('character-driven')) {
    return 'coen_brothers';
  }
  
  if (prompt.includes('long takes') || prompt.includes('naturalistic') || prompt.includes('intimacy') || prompt.includes('realism')) {
    return 'paul_thomas_anderson';
  }
  
  // Original overrides
  if (prompt.includes('atmospheric') || prompt.includes('minimalist') || prompt.includes('moody')) {
    return 'denis_villeneuve';
  }
  
  if (prompt.includes('practical') || prompt.includes('realistic') || prompt.includes('authentic')) {
    return 'christopher_nolan';
  }
  
  if (prompt.includes('precise') || prompt.includes('controlled') || prompt.includes('geometric')) {
    return 'david_fincher';
  }
  
  // Default fallback - Denis Villeneuve for atmospheric, cinematic quality
  return 'denis_villeneuve';
}

