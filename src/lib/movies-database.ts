// Movies Database for Auteur Engine
// Comprehensive collection of award-winning films with outstanding visual and cinematic styling

export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  awards: string[];
  visualStyle: {
    cinematography: string[];
    colorPalette: string[];
    lighting: string[];
    composition: string[];
    cameraTechniques: string[];
    visualEffects: string[];
  };
  description: string;
  iconicScenes: string[];
  influence: string[];
}

export const MOVIES_DATABASE: Movie[] = [
  // Christopher Nolan Films
  {
    id: "inception-2010",
    title: "Inception",
    year: 2010,
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Thriller", "Action"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Visual Effects"],
    visualStyle: {
      cinematography: ["IMAX cinematography", "practical effects", "zero gravity sequences"],
      colorPalette: ["cool blues", "warm ambers", "high contrast"],
      lighting: ["natural light", "practical lighting", "dramatic shadows"],
      composition: ["geometric precision", "symmetrical framing", "deep focus"],
      cameraTechniques: ["handheld camera", "rotating sets", "practical stunts"],
      visualEffects: ["practical effects", "miniatures", "in-camera effects"]
    },
    description: "Revolutionary visual storytelling with practical effects and IMAX cinematography",
    iconicScenes: ["Rotating hallway fight", "Folding city", "Zero gravity hotel"],
    influence: ["Modern sci-fi cinematography", "Practical effects revival", "IMAX narrative films"]
  },
  {
    id: "interstellar-2014",
    title: "Interstellar",
    year: 2014,
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Visual Effects"],
    visualStyle: {
      cinematography: ["IMAX 70mm", "space photography", "natural landscapes"],
      colorPalette: ["earth tones", "cosmic blacks", "stellar whites"],
      lighting: ["natural light", "cosmic lighting", "minimal artificial light"],
      composition: ["epic scale", "human perspective", "cosmic vastness"],
      cameraTechniques: ["steady camera", "long takes", "practical space sequences"],
      visualEffects: ["practical models", "real space photography", "minimal CGI"]
    },
    description: "Epic space odyssey with groundbreaking practical effects and IMAX cinematography",
    iconicScenes: ["Tesseract sequence", "Water planet", "Docking sequence"],
    influence: ["Space film cinematography", "Practical sci-fi effects", "IMAX narrative scale"]
  },

  // Wes Anderson Films
  {
    id: "grand-budapest-hotel-2014",
    title: "The Grand Budapest Hotel",
    year: 2014,
    director: "Wes Anderson",
    genres: ["Comedy", "Drama", "Adventure"],
    awards: ["Academy Award - Best Production Design", "BAFTA - Best Production Design"],
    visualStyle: {
      cinematography: ["symmetrical composition", "dollhouse aesthetic", "miniature work"],
      colorPalette: ["pastel pinks", "mint greens", "lavender purples"],
      lighting: ["soft lighting", "warm tones", "theatrical illumination"],
      composition: ["perfect symmetry", "central framing", "meticulous detail"],
      cameraTechniques: ["dolly shots", "tracking shots", "model photography"],
      visualEffects: ["miniatures", "stop motion", "practical sets"]
    },
    description: "Whimsical visual masterpiece with symmetrical composition and pastel color palette",
    iconicScenes: ["Hotel exterior shots", "Pastry box chase", "Lobby sequences"],
    influence: ["Symmetrical cinematography", "Pastel color grading", "Miniature filmmaking"]
  },
  {
    id: "moonrise-kingdom-2012",
    title: "Moonrise Kingdom",
    year: 2012,
    director: "Wes Anderson",
    genres: ["Comedy", "Drama", "Romance"],
    awards: ["Academy Award - Best Original Screenplay Nomination"],
    visualStyle: {
      cinematography: ["symmetrical framing", "nostalgic aesthetic", "natural landscapes"],
      colorPalette: ["warm yellows", "forest greens", "sky blues"],
      lighting: ["natural light", "golden hour", "soft shadows"],
      composition: ["central subjects", "balanced framing", "nostalgic angles"],
      cameraTechniques: ["steady camera", "dolly movements", "natural tracking"],
      visualEffects: ["practical effects", "natural locations", "minimal post-production"]
    },
    description: "Nostalgic coming-of-age story with symmetrical composition and warm color palette",
    iconicScenes: ["Beach scenes", "Scout camp", "Church sequences"],
    influence: ["Nostalgic cinematography", "Symmetrical framing", "Natural color grading"]
  },

  // Denis Villeneuve Films
  {
    id: "blade-runner-2049-2017",
    title: "Blade Runner 2049",
    year: 2017,
    director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Thriller", "Drama"],
    awards: ["Academy Award - Best Visual Effects", "Academy Award - Best Cinematography"],
    visualStyle: {
      cinematography: ["epic scale", "minimalist composition", "atmospheric lighting"],
      colorPalette: ["neon oranges", "cyber blues", "desert yellows"],
      lighting: ["atmospheric fog", "neon lighting", "natural light"],
      composition: ["vast landscapes", "human scale", "architectural lines"],
      cameraTechniques: ["slow movements", "long takes", "atmospheric tracking"],
      visualEffects: ["practical sets", "atmospheric effects", "minimal CGI"]
    },
    description: "Visually stunning sci-fi with atmospheric lighting and epic scale cinematography",
    iconicScenes: ["Desert sequences", "Neon cityscapes", "Atmospheric interiors"],
    influence: ["Modern sci-fi cinematography", "Atmospheric lighting", "Epic scale storytelling"]
  },
  {
    id: "arrival-2016",
    title: "Arrival",
    year: 2016,
    director: "Denis Villeneuve",
    genres: ["Sci-Fi", "Drama", "Thriller"],
    awards: ["Academy Award - Best Sound Editing", "BAFTA - Best Sound"],
    visualStyle: {
      cinematography: ["minimalist composition", "natural light", "atmospheric fog"],
      colorPalette: ["cool grays", "warm ambers", "natural tones"],
      lighting: ["natural light", "atmospheric conditions", "minimal artificial light"],
      composition: ["human perspective", "vast scale", "intimate moments"],
      cameraTechniques: ["steady camera", "slow movements", "natural tracking"],
      visualEffects: ["practical effects", "atmospheric fog", "minimal CGI"]
    },
    description: "Atmospheric sci-fi with minimalist composition and natural lighting",
    iconicScenes: ["Alien ship sequences", "Foggy landscapes", "Intimate conversations"],
    influence: ["Minimalist sci-fi", "Atmospheric cinematography", "Natural lighting in genre films"]
  },

  // David Fincher Films
  {
    id: "gone-girl-2014",
    title: "Gone Girl",
    year: 2014,
    director: "David Fincher",
    genres: ["Thriller", "Drama", "Mystery"],
    awards: ["Academy Award - Best Actress Nomination"],
    visualStyle: {
      cinematography: ["precise composition", "controlled lighting", "digital precision"],
      colorPalette: ["cool tones", "desaturated colors", "high contrast"],
      lighting: ["controlled lighting", "minimal shadows", "precise framing"],
      composition: ["geometric precision", "controlled framing", "digital clarity"],
      cameraTechniques: ["steady camera", "precise movements", "controlled tracking"],
      visualEffects: ["digital grading", "precise color correction", "minimal practical effects"]
    },
    description: "Precise thriller with controlled lighting and geometric composition",
    iconicScenes: ["Interior sequences", "Controlled lighting", "Precise framing"],
    influence: ["Precise cinematography", "Controlled lighting", "Digital precision"]
  },
  {
    id: "social-network-2010",
    title: "The Social Network",
    year: 2010,
    director: "David Fincher",
    genres: ["Drama", "Biography"],
    awards: ["Academy Award - Best Adapted Screenplay", "Golden Globe - Best Picture"],
    visualStyle: {
      cinematography: ["digital precision", "controlled composition", "modern aesthetic"],
      colorPalette: ["cool blues", "desaturated tones", "modern grays"],
      lighting: ["controlled lighting", "minimal shadows", "digital clarity"],
      composition: ["precise framing", "modern angles", "controlled perspective"],
      cameraTechniques: ["steady camera", "precise movements", "controlled tracking"],
      visualEffects: ["digital grading", "precise color correction", "modern post-production"]
    },
    description: "Modern drama with digital precision and controlled cinematography",
    iconicScenes: ["Harvard sequences", "Office scenes", "Modern interiors"],
    influence: ["Digital cinematography", "Modern aesthetic", "Precise composition"]
  },

  // Martin Scorsese Films
  {
    id: "goodfellas-1990",
    title: "Goodfellas",
    year: 1990,
    director: "Martin Scorsese",
    genres: ["Crime", "Drama", "Biography"],
    awards: ["Academy Award - Best Supporting Actor", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["dynamic camera work", "vibrant colors", "urban realism"],
      colorPalette: ["rich reds", "deep blacks", "vibrant colors"],
      lighting: ["character focus", "vibrant lighting", "urban atmosphere"],
      composition: ["dynamic framing", "character perspective", "urban environment"],
      cameraTechniques: ["dynamic tracking", "handheld camera", "character following"],
      visualEffects: ["practical effects", "urban locations", "character-driven cinematography"]
    },
    description: "Dynamic crime drama with vibrant colors and character-driven cinematography",
    iconicScenes: ["Copacabana tracking shot", "Restaurant sequences", "Urban environments"],
    influence: ["Dynamic camera work", "Character-driven cinematography", "Urban realism"]
  },
  {
    id: "taxi-driver-1976",
    title: "Taxi Driver",
    year: 1976,
    director: "Martin Scorsese",
    genres: ["Crime", "Drama", "Thriller"],
    awards: ["Cannes Film Festival - Palme d'Or", "Academy Award - Best Picture Nomination"],
    visualStyle: {
      cinematography: ["urban realism", "character perspective", "atmospheric lighting"],
      colorPalette: ["neon colors", "urban grays", "atmospheric tones"],
      lighting: ["neon lighting", "urban atmosphere", "character focus"],
      composition: ["character perspective", "urban framing", "atmospheric composition"],
      cameraTechniques: ["character following", "urban tracking", "atmospheric movement"],
      visualEffects: ["practical effects", "urban locations", "atmospheric conditions"]
    },
    description: "Atmospheric urban drama with neon lighting and character perspective",
    iconicScenes: ["Neon-lit streets", "Taxi sequences", "Urban environments"],
    influence: ["Urban cinematography", "Neon lighting", "Character perspective"]
  },

  // Quentin Tarantino Films
  {
    id: "pulp-fiction-1994",
    title: "Pulp Fiction",
    year: 1994,
    director: "Quentin Tarantino",
    genres: ["Crime", "Drama", "Thriller"],
    awards: ["Academy Award - Best Original Screenplay", "Palme d'Or"],
    visualStyle: {
      cinematography: ["stylized violence", "pop culture aesthetic", "retro colors"],
      colorPalette: ["vibrant colors", "retro tones", "high contrast"],
      lighting: ["stylized lighting", "dramatic shadows", "pop culture aesthetic"],
      composition: ["dynamic framing", "character focus", "stylized composition"],
      cameraTechniques: ["dynamic camera", "stylized movements", "character tracking"],
      visualEffects: ["practical effects", "stylized violence", "retro aesthetic"]
    },
    description: "Stylized crime drama with vibrant colors and pop culture aesthetic",
    iconicScenes: ["Diner sequences", "Stylized violence", "Retro aesthetic"],
    influence: ["Stylized cinematography", "Pop culture aesthetic", "Retro color grading"]
  },
  {
    id: "kill-bill-2003",
    title: "Kill Bill: Vol. 1",
    year: 2003,
    director: "Quentin Tarantino",
    genres: ["Action", "Crime", "Thriller"],
    awards: ["Golden Globe - Best Actress Nomination"],
    visualStyle: {
      cinematography: ["stylized action", "anime influence", "vibrant colors"],
      colorPalette: ["vibrant reds", "deep blacks", "anime colors"],
      lighting: ["stylized lighting", "dramatic shadows", "anime influence"],
      composition: ["dynamic framing", "action composition", "anime aesthetic"],
      cameraTechniques: ["dynamic camera", "action tracking", "stylized movements"],
      visualEffects: ["practical effects", "stylized violence", "anime influence"]
    },
    description: "Stylized action film with anime influence and vibrant color palette",
    iconicScenes: ["House of Blue Leaves", "Anime sequence", "Stylized action"],
    influence: ["Stylized action cinematography", "Anime influence", "Vibrant color grading"]
  },

  // Stanley Kubrick Films
  {
    id: "2001-space-odyssey-1968",
    title: "2001: A Space Odyssey",
    year: 1968,
    director: "Stanley Kubrick",
    genres: ["Sci-Fi", "Adventure", "Mystery"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["perfect symmetry", "one-point perspective", "minimalist composition"],
      colorPalette: ["sterile whites", "cosmic blacks", "minimal contrast"],
      lighting: ["high key lighting", "natural light", "minimal shadows"],
      composition: ["perfect symmetry", "geometric patterns", "minimalist framing"],
      cameraTechniques: ["steady camera", "long takes", "geometric movements"],
      visualEffects: ["practical effects", "miniatures", "revolutionary effects"]
    },
    description: "Revolutionary sci-fi with perfect symmetry and minimalist composition",
    iconicScenes: ["Monolith sequences", "Space station", "Jupiter mission"],
    influence: ["Minimalist cinematography", "Perfect symmetry", "Revolutionary visual effects"]
  },
  {
    id: "shining-1980",
    title: "The Shining",
    year: 1980,
    director: "Stanley Kubrick",
    genres: ["Horror", "Drama", "Thriller"],
    awards: ["Academy Award - Best Cinematography Nomination"],
    visualStyle: {
      cinematography: ["perfect symmetry", "geometric composition", "clinical precision"],
      colorPalette: ["sterile whites", "deep reds", "minimal contrast"],
      lighting: ["high key lighting", "sterile illumination", "minimal shadows"],
      composition: ["perfect symmetry", "geometric patterns", "clinical framing"],
      cameraTechniques: ["steady camera", "long takes", "geometric tracking"],
      visualEffects: ["practical effects", "sterile sets", "clinical aesthetic"]
    },
    description: "Clinical horror with perfect symmetry and geometric composition",
    iconicScenes: ["Hotel corridors", "Geometric patterns", "Sterile environments"],
    influence: ["Clinical cinematography", "Perfect symmetry", "Geometric horror"]
  },

  // Alfred Hitchcock Films
  {
    id: "vertigo-1958",
    title: "Vertigo",
    year: 1958,
    director: "Alfred Hitchcock",
    genres: ["Mystery", "Romance", "Thriller"],
    awards: ["Academy Award - Best Sound Design", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["suspenseful composition", "psychological angles", "dramatic lighting"],
      colorPalette: ["vibrant colors", "dramatic contrast", "psychological tones"],
      lighting: ["chiaroscuro", "dramatic shadows", "psychological lighting"],
      composition: ["suspenseful framing", "psychological angles", "dramatic composition"],
      cameraTechniques: ["dolly zoom", "suspenseful tracking", "psychological movement"],
      visualEffects: ["practical effects", "dramatic lighting", "psychological atmosphere"]
    },
    description: "Psychological thriller with dramatic lighting and suspenseful composition",
    iconicScenes: ["Dolly zoom", "Mission sequences", "Psychological atmosphere"],
    influence: ["Psychological cinematography", "Dramatic lighting", "Suspenseful composition"]
  },
  {
    id: "psycho-1960",
    title: "Psycho",
    year: 1960,
    director: "Alfred Hitchcock",
    genres: ["Horror", "Thriller", "Mystery"],
    awards: ["Academy Award - Best Director Nomination", "Golden Globe - Best Director"],
    visualStyle: {
      cinematography: ["suspenseful composition", "psychological angles", "dramatic lighting"],
      colorPalette: ["black and white", "high contrast", "dramatic tones"],
      lighting: ["chiaroscuro", "dramatic shadows", "psychological lighting"],
      composition: ["suspenseful framing", "psychological angles", "dramatic composition"],
      cameraTechniques: ["suspenseful tracking", "psychological movement", "dramatic angles"],
      visualEffects: ["practical effects", "dramatic lighting", "psychological atmosphere"]
    },
    description: "Revolutionary horror with dramatic lighting and suspenseful composition",
    iconicScenes: ["Shower scene", "Bates Motel", "Psychological sequences"],
    influence: ["Horror cinematography", "Dramatic lighting", "Suspenseful composition"]
  },

  // Akira Kurosawa Films
  {
    id: "seven-samurai-1954",
    title: "Seven Samurai",
    year: 1954,
    director: "Akira Kurosawa",
    genres: ["Action", "Drama", "Adventure"],
    awards: ["Academy Award - Best Costume Design Nomination", "Venice Film Festival"],
    visualStyle: {
      cinematography: ["epic scale", "natural elements", "human drama"],
      colorPalette: ["earth tones", "natural colors", "monochromatic"],
      lighting: ["natural light", "dramatic weather", "atmospheric conditions"],
      composition: ["epic landscapes", "human scale", "natural framing"],
      cameraTechniques: ["static shots", "natural movement", "epic tracking"],
      visualEffects: ["practical effects", "natural locations", "atmospheric conditions"]
    },
    description: "Epic samurai drama with natural lighting and human-scale composition",
    iconicScenes: ["Village sequences", "Battle scenes", "Natural landscapes"],
    influence: ["Epic cinematography", "Natural lighting", "Human-scale composition"]
  },
  {
    id: "ran-1985",
    title: "Ran",
    year: 1985,
    director: "Akira Kurosawa",
    genres: ["Action", "Drama", "War"],
    awards: ["Academy Award - Best Costume Design", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["epic scale", "color composition", "natural elements"],
      colorPalette: ["vibrant colors", "natural tones", "dramatic contrast"],
      lighting: ["natural light", "dramatic weather", "color composition"],
      composition: ["epic landscapes", "color framing", "natural composition"],
      cameraTechniques: ["epic tracking", "color movement", "natural camera"],
      visualEffects: ["practical effects", "natural locations", "color composition"]
    },
    description: "Epic samurai drama with vibrant colors and natural composition",
    iconicScenes: ["Castle sequences", "Battle scenes", "Color landscapes"],
    influence: ["Epic cinematography", "Color composition", "Natural filmmaking"]
  },

  // Federico Fellini Films
  {
    id: "la-dolce-vita-1960",
    title: "La Dolce Vita",
    year: 1960,
    director: "Federico Fellini",
    genres: ["Drama", "Romance", "Comedy"],
    awards: ["Academy Award - Best Costume Design", "Palme d'Or"],
    visualStyle: {
      cinematography: ["surreal dreamlike quality", "theatrical staging", "baroque sensibilities"],
      colorPalette: ["rich blacks", "vibrant colors", "theatrical tones"],
      lighting: ["theatrical lighting", "dramatic shadows", "surreal illumination"],
      composition: ["theatrical framing", "surreal composition", "baroque patterns"],
      cameraTechniques: ["circular movements", "theatrical tracking", "surreal camera work"],
      visualEffects: ["practical effects", "theatrical sets", "surreal atmosphere"]
    },
    description: "Surreal drama with theatrical staging and baroque cinematography",
    iconicScenes: ["Trevi Fountain", "Surreal sequences", "Theatrical moments"],
    influence: ["Surreal cinematography", "Theatrical staging", "Baroque filmmaking"]
  },
  {
    id: "8-12-1963",
    title: "8½",
    year: 1963,
    director: "Federico Fellini",
    genres: ["Drama", "Fantasy", "Romance"],
    awards: ["Academy Award - Best Foreign Language Film", "Academy Award - Best Costume Design"],
    visualStyle: {
      cinematography: ["surreal dreamlike quality", "theatrical staging", "baroque sensibilities"],
      colorPalette: ["rich blacks", "vibrant colors", "surreal tones"],
      lighting: ["theatrical lighting", "dramatic shadows", "surreal illumination"],
      composition: ["theatrical framing", "surreal composition", "baroque patterns"],
      cameraTechniques: ["circular movements", "theatrical tracking", "surreal camera work"],
      visualEffects: ["practical effects", "theatrical sets", "surreal atmosphere"]
    },
    description: "Surreal masterpiece with theatrical staging and baroque cinematography",
    iconicScenes: ["Dream sequences", "Theatrical moments", "Surreal imagery"],
    influence: ["Surreal cinematography", "Theatrical staging", "Baroque filmmaking"]
  },

  // Ingmar Bergman Films
  {
    id: "persona-1966",
    title: "Persona",
    year: 1966,
    director: "Ingmar Bergman",
    genres: ["Drama", "Thriller", "Mystery"],
    awards: ["Academy Award - Best Actress Nomination", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["minimalist approach", "psychological depth", "introspective mood"],
      colorPalette: ["monochromatic", "minimal contrast", "psychological tones"],
      lighting: ["minimal lighting", "psychological shadows", "introspective illumination"],
      composition: ["minimalist framing", "psychological composition", "introspective angles"],
      cameraTechniques: ["minimal movement", "psychological tracking", "introspective camera"],
      visualEffects: ["minimal effects", "psychological atmosphere", "introspective mood"]
    },
    description: "Psychological drama with minimalist approach and introspective mood",
    iconicScenes: ["Close-up sequences", "Psychological moments", "Minimalist scenes"],
    influence: ["Minimalist cinematography", "Psychological depth", "Introspective filmmaking"]
  },
  {
    id: "seventh-seal-1957",
    title: "The Seventh Seal",
    year: 1957,
    director: "Ingmar Bergman",
    genres: ["Drama", "Fantasy", "War"],
    awards: ["Cannes Film Festival - Special Jury Prize", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["minimalist approach", "existential themes", "medieval atmosphere"],
      colorPalette: ["monochromatic", "medieval tones", "existential contrast"],
      lighting: ["minimal lighting", "medieval atmosphere", "existential shadows"],
      composition: ["minimalist framing", "medieval composition", "existential angles"],
      cameraTechniques: ["minimal movement", "medieval tracking", "existential camera"],
      visualEffects: ["minimal effects", "medieval atmosphere", "existential mood"]
    },
    description: "Existential drama with minimalist approach and medieval atmosphere",
    iconicScenes: ["Chess game", "Medieval sequences", "Existential moments"],
    influence: ["Minimalist cinematography", "Existential themes", "Medieval atmosphere"]
  },

  // Terrence Malick Films
  {
    id: "tree-of-life-2011",
    title: "The Tree of Life",
    year: 2011,
    director: "Terrence Malick",
    genres: ["Drama", "Fantasy", "Romance"],
    awards: ["Academy Award - Best Picture Nomination", "Palme d'Or"],
    visualStyle: {
      cinematography: ["natural light", "poetic composition", "spiritual atmosphere"],
      colorPalette: ["natural tones", "warm colors", "spiritual contrast"],
      lighting: ["natural light", "golden hour", "spiritual illumination"],
      composition: ["poetic framing", "natural composition", "spiritual angles"],
      cameraTechniques: ["handheld camera", "natural movement", "spiritual tracking"],
      visualEffects: ["natural effects", "spiritual atmosphere", "poetic mood"]
    },
    description: "Poetic drama with natural light and spiritual atmosphere",
    iconicScenes: ["Creation sequence", "Family moments", "Natural landscapes"],
    influence: ["Poetic cinematography", "Natural light", "Spiritual filmmaking"]
  },
  {
    id: "days-of-heaven-1978",
    title: "Days of Heaven",
    year: 1978,
    director: "Terrence Malick",
    genres: ["Drama", "Romance", "Western"],
    awards: ["Academy Award - Best Cinematography", "Cannes Film Festival"],
    visualStyle: {
      cinematography: ["natural light", "golden hour", "poetic composition"],
      colorPalette: ["golden tones", "natural colors", "warm contrast"],
      lighting: ["natural light", "golden hour", "poetic illumination"],
      composition: ["poetic framing", "natural composition", "golden angles"],
      cameraTechniques: ["handheld camera", "natural movement", "poetic tracking"],
      visualEffects: ["natural effects", "golden atmosphere", "poetic mood"]
    },
    description: "Poetic drama with golden hour lighting and natural composition",
    iconicScenes: ["Golden hour sequences", "Natural landscapes", "Poetic moments"],
    influence: ["Poetic cinematography", "Golden hour lighting", "Natural filmmaking"]
  },

  // Wong Kar-wai Films
  {
    id: "in-the-mood-for-love-2000",
    title: "In the Mood for Love",
    year: 2000,
    director: "Wong Kar-wai",
    genres: ["Drama", "Romance", "Mystery"],
    awards: ["Cannes Film Festival - Best Actor", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["atmospheric lighting", "romantic composition", "nostalgic mood"],
      colorPalette: ["warm reds", "deep greens", "nostalgic tones"],
      lighting: ["atmospheric lighting", "romantic shadows", "nostalgic illumination"],
      composition: ["romantic framing", "atmospheric composition", "nostalgic angles"],
      cameraTechniques: ["slow movement", "romantic tracking", "nostalgic camera"],
      visualEffects: ["atmospheric effects", "romantic mood", "nostalgic atmosphere"]
    },
    description: "Romantic drama with atmospheric lighting and nostalgic mood",
    iconicScenes: ["Rain sequences", "Romantic moments", "Nostalgic scenes"],
    influence: ["Atmospheric cinematography", "Romantic lighting", "Nostalgic filmmaking"]
  },
  {
    id: "chungking-express-1994",
    title: "Chungking Express",
    year: 1994,
    director: "Wong Kar-wai",
    genres: ["Drama", "Romance", "Comedy"],
    awards: ["Hong Kong Film Awards", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["urban energy", "romantic composition", "vibrant colors"],
      colorPalette: ["vibrant colors", "urban tones", "romantic contrast"],
      lighting: ["urban lighting", "romantic shadows", "vibrant illumination"],
      composition: ["urban framing", "romantic composition", "vibrant angles"],
      cameraTechniques: ["handheld camera", "urban tracking", "romantic movement"],
      visualEffects: ["urban effects", "romantic mood", "vibrant atmosphere"]
    },
    description: "Urban romance with vibrant colors and energetic cinematography",
    iconicScenes: ["Urban sequences", "Romantic moments", "Vibrant scenes"],
    influence: ["Urban cinematography", "Vibrant colors", "Energetic filmmaking"]
  },

  // Andrei Tarkovsky Films
  {
    id: "stalker-1979",
    title: "Stalker",
    year: 1979,
    director: "Andrei Tarkovsky",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    awards: ["Cannes Film Festival", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["poetic composition", "spiritual atmosphere", "minimalist approach"],
      colorPalette: ["monochromatic", "spiritual tones", "minimal contrast"],
      lighting: ["natural light", "spiritual shadows", "poetic illumination"],
      composition: ["poetic framing", "spiritual composition", "minimalist angles"],
      cameraTechniques: ["long takes", "poetic movement", "spiritual tracking"],
      visualEffects: ["minimal effects", "spiritual atmosphere", "poetic mood"]
    },
    description: "Poetic sci-fi with spiritual atmosphere and minimalist approach",
    iconicScenes: ["Zone sequences", "Spiritual moments", "Poetic landscapes"],
    influence: ["Poetic cinematography", "Spiritual atmosphere", "Minimalist filmmaking"]
  },
  {
    id: "solaris-1972",
    title: "Solaris",
    year: 1972,
    director: "Andrei Tarkovsky",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    awards: ["Cannes Film Festival - Grand Prix", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["poetic composition", "sci-fi atmosphere", "minimalist approach"],
      colorPalette: ["cool tones", "sci-fi colors", "minimal contrast"],
      lighting: ["artificial light", "sci-fi shadows", "poetic illumination"],
      composition: ["poetic framing", "sci-fi composition", "minimalist angles"],
      cameraTechniques: ["long takes", "poetic movement", "sci-fi tracking"],
      visualEffects: ["minimal effects", "sci-fi atmosphere", "poetic mood"]
    },
    description: "Poetic sci-fi with artificial lighting and minimalist approach",
    iconicScenes: ["Space station", "Sci-fi sequences", "Poetic moments"],
    influence: ["Poetic cinematography", "Sci-fi atmosphere", "Minimalist filmmaking"]
  },

  // Jean-Luc Godard Films
  {
    id: "breathless-1960",
    title: "Breathless",
    year: 1960,
    director: "Jean-Luc Godard",
    genres: ["Crime", "Drama", "Romance"],
    awards: ["Berlin Film Festival", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["new wave style", "urban energy", "revolutionary composition"],
      colorPalette: ["monochromatic", "urban tones", "new wave contrast"],
      lighting: ["natural light", "urban shadows", "new wave illumination"],
      composition: ["revolutionary framing", "urban composition", "new wave angles"],
      cameraTechniques: ["handheld camera", "jump cuts", "new wave movement"],
      visualEffects: ["minimal effects", "urban atmosphere", "new wave mood"]
    },
    description: "Revolutionary new wave film with urban energy and handheld camera",
    iconicScenes: ["Paris sequences", "Jump cuts", "New wave moments"],
    influence: ["New wave cinematography", "Urban energy", "Revolutionary filmmaking"]
  },
  {
    id: "contempt-1963",
    title: "Contempt",
    year: 1963,
    director: "Jean-Luc Godard",
    genres: ["Drama", "Romance"],
    awards: ["Venice Film Festival", "BAFTA - Best Foreign Film"],
    visualStyle: {
      cinematography: ["new wave style", "romantic composition", "colorful palette"],
      colorPalette: ["vibrant colors", "romantic tones", "new wave contrast"],
      lighting: ["natural light", "romantic shadows", "colorful illumination"],
      composition: ["romantic framing", "new wave composition", "colorful angles"],
      cameraTechniques: ["handheld camera", "romantic tracking", "new wave movement"],
      visualEffects: ["colorful effects", "romantic atmosphere", "new wave mood"]
    },
    description: "Colorful new wave romance with vibrant palette and romantic composition",
    iconicScenes: ["Colorful sequences", "Romantic moments", "New wave scenes"],
    influence: ["New wave cinematography", "Vibrant colors", "Romantic filmmaking"]
  },

  // Sergio Leone Films
  {
    id: "good-bad-ugly-1966",
    title: "The Good, the Bad and the Ugly",
    year: 1966,
    director: "Sergio Leone",
    genres: ["Western", "Action", "Adventure"],
    awards: ["BAFTA - Best Foreign Film", "Golden Globe Nomination"],
    visualStyle: {
      cinematography: ["epic scale", "western atmosphere", "dramatic composition"],
      colorPalette: ["desert tones", "western colors", "dramatic contrast"],
      lighting: ["natural light", "western shadows", "dramatic illumination"],
      composition: ["epic framing", "western composition", "dramatic angles"],
      cameraTechniques: ["epic tracking", "western movement", "dramatic camera"],
      visualEffects: ["practical effects", "western atmosphere", "epic mood"]
    },
    description: "Epic western with desert tones and dramatic composition",
    iconicScenes: ["Desert sequences", "Epic landscapes", "Dramatic moments"],
    influence: ["Epic cinematography", "Western atmosphere", "Dramatic filmmaking"]
  },
  {
    id: "once-upon-time-west-1968",
    title: "Once Upon a Time in the West",
    year: 1968,
    director: "Sergio Leone",
    genres: ["Western", "Drama", "Action"],
    awards: ["BAFTA - Best Foreign Film", "Golden Globe Nomination"],
    visualStyle: {
      cinematography: ["epic scale", "western atmosphere", "operatic composition"],
      colorPalette: ["desert tones", "western colors", "operatic contrast"],
      lighting: ["natural light", "western shadows", "operatic illumination"],
      composition: ["epic framing", "western composition", "operatic angles"],
      cameraTechniques: ["epic tracking", "western movement", "operatic camera"],
      visualEffects: ["practical effects", "western atmosphere", "epic mood"]
    },
    description: "Operatic western with epic scale and dramatic composition",
    iconicScenes: ["Epic landscapes", "Operatic moments", "Western sequences"],
    influence: ["Epic cinematography", "Operatic atmosphere", "Western filmmaking"]
  },

  // Ridley Scott Films
  {
    id: "blade-runner-1982",
    title: "Blade Runner",
    year: 1982,
    director: "Ridley Scott",
    genres: ["Sci-Fi", "Thriller", "Drama"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["neo-noir style", "sci-fi atmosphere", "atmospheric lighting"],
      colorPalette: ["neon colors", "dark tones", "atmospheric contrast"],
      lighting: ["neon lighting", "atmospheric shadows", "sci-fi illumination"],
      composition: ["neo-noir framing", "sci-fi composition", "atmospheric angles"],
      cameraTechniques: ["atmospheric tracking", "sci-fi movement", "neo-noir camera"],
      visualEffects: ["revolutionary effects", "sci-fi atmosphere", "atmospheric mood"]
    },
    description: "Revolutionary neo-noir sci-fi with atmospheric lighting and neon colors",
    iconicScenes: ["Neon cityscapes", "Atmospheric sequences", "Sci-fi moments"],
    influence: ["Neo-noir cinematography", "Atmospheric lighting", "Revolutionary effects"]
  },
  {
    id: "gladiator-2000",
    title: "Gladiator",
    year: 2000,
    director: "Ridley Scott",
    genres: ["Action", "Drama", "Adventure"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Actor"],
    visualStyle: {
      cinematography: ["epic scale", "historical atmosphere", "dramatic composition"],
      colorPalette: ["earth tones", "historical colors", "dramatic contrast"],
      lighting: ["natural light", "historical shadows", "dramatic illumination"],
      composition: ["epic framing", "historical composition", "dramatic angles"],
      cameraTechniques: ["epic tracking", "historical movement", "dramatic camera"],
      visualEffects: ["revolutionary effects", "historical atmosphere", "epic mood"]
    },
    description: "Epic historical drama with earth tones and dramatic composition",
    iconicScenes: ["Colosseum sequences", "Epic battles", "Historical moments"],
    influence: ["Epic cinematography", "Historical atmosphere", "Dramatic filmmaking"]
  },

  // Peter Jackson Films
  {
    id: "lord-of-rings-2001",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    director: "Peter Jackson",
    genres: ["Fantasy", "Adventure", "Drama"],
    awards: ["Academy Award - Best Picture Nomination", "Academy Award - Best Visual Effects"],
    visualStyle: {
      cinematography: ["epic scale", "fantasy atmosphere", "dramatic composition"],
      colorPalette: ["fantasy colors", "epic tones", "dramatic contrast"],
      lighting: ["natural light", "fantasy shadows", "dramatic illumination"],
      composition: ["epic framing", "fantasy composition", "dramatic angles"],
      cameraTechniques: ["epic tracking", "fantasy movement", "dramatic camera"],
      visualEffects: ["revolutionary effects", "fantasy atmosphere", "epic mood"]
    },
    description: "Epic fantasy with revolutionary effects and dramatic composition",
    iconicScenes: ["Moria sequences", "Epic landscapes", "Fantasy moments"],
    influence: ["Epic cinematography", "Fantasy atmosphere", "Revolutionary effects"]
  },
  {
    id: "king-kong-2005",
    title: "King Kong",
    year: 2005,
    director: "Peter Jackson",
    genres: ["Adventure", "Drama", "Fantasy"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Visual Effects"],
    visualStyle: {
      cinematography: ["epic scale", "adventure atmosphere", "dramatic composition"],
      colorPalette: ["jungle colors", "epic tones", "dramatic contrast"],
      lighting: ["natural light", "jungle shadows", "dramatic illumination"],
      composition: ["epic framing", "adventure composition", "dramatic angles"],
      cameraTechniques: ["epic tracking", "adventure movement", "dramatic camera"],
      visualEffects: ["revolutionary effects", "adventure atmosphere", "epic mood"]
    },
    description: "Epic adventure with revolutionary effects and jungle atmosphere",
    iconicScenes: ["Skull Island", "Epic sequences", "Adventure moments"],
    influence: ["Epic cinematography", "Adventure atmosphere", "Revolutionary effects"]
  },

  // Alfonso Cuarón Films
  {
    id: "gravity-2013",
    title: "Gravity",
    year: 2013,
    director: "Alfonso Cuarón",
    genres: ["Sci-Fi", "Drama", "Thriller"],
    awards: ["Academy Award - Best Director", "Academy Award - Best Visual Effects"],
    visualStyle: {
      cinematography: ["immersive scale", "sci-fi atmosphere", "revolutionary composition"],
      colorPalette: ["space colors", "immersive tones", "sci-fi contrast"],
      lighting: ["space lighting", "immersive shadows", "sci-fi illumination"],
      composition: ["immersive framing", "sci-fi composition", "revolutionary angles"],
      cameraTechniques: ["immersive tracking", "sci-fi movement", "revolutionary camera"],
      visualEffects: ["revolutionary effects", "sci-fi atmosphere", "immersive mood"]
    },
    description: "Revolutionary sci-fi with immersive cinematography and space atmosphere",
    iconicScenes: ["Space sequences", "Immersive moments", "Revolutionary shots"],
    influence: ["Immersive cinematography", "Space atmosphere", "Revolutionary effects"]
  },
  {
    id: "children-of-men-2006",
    title: "Children of Men",
    year: 2006,
    director: "Alfonso Cuarón",
    genres: ["Sci-Fi", "Drama", "Thriller"],
    awards: ["Academy Award - Best Cinematography Nomination", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["realistic approach", "dystopian atmosphere", "handheld composition"],
      colorPalette: ["dystopian colors", "realistic tones", "gritty contrast"],
      lighting: ["natural light", "dystopian shadows", "realistic illumination"],
      composition: ["realistic framing", "dystopian composition", "handheld angles"],
      cameraTechniques: ["handheld camera", "realistic movement", "dystopian tracking"],
      visualEffects: ["minimal effects", "dystopian atmosphere", "realistic mood"]
    },
    description: "Realistic dystopian drama with handheld camera and gritty atmosphere",
    iconicScenes: ["Long takes", "Dystopian sequences", "Realistic moments"],
    influence: ["Realistic cinematography", "Dystopian atmosphere", "Handheld filmmaking"]
  },

  // Alejandro González Iñárritu Films
  {
    id: "birdman-2014",
    title: "Birdman",
    year: 2014,
    director: "Alejandro González Iñárritu",
    genres: ["Drama", "Comedy", "Romance"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["single take illusion", "theatrical atmosphere", "realistic composition"],
      colorPalette: ["theatrical colors", "realistic tones", "dramatic contrast"],
      lighting: ["theatrical lighting", "realistic shadows", "dramatic illumination"],
      composition: ["theatrical framing", "realistic composition", "dramatic angles"],
      cameraTechniques: ["single take tracking", "theatrical movement", "realistic camera"],
      visualEffects: ["minimal effects", "theatrical atmosphere", "realistic mood"]
    },
    description: "Revolutionary drama with single take illusion and theatrical atmosphere",
    iconicScenes: ["Single take sequences", "Theatrical moments", "Realistic scenes"],
    influence: ["Single take cinematography", "Theatrical atmosphere", "Realistic filmmaking"]
  },
  {
    id: "revenant-2015",
    title: "The Revenant",
    year: 2015,
    director: "Alejandro González Iñárritu",
    genres: ["Drama", "Adventure", "Western"],
    awards: ["Academy Award - Best Director", "Academy Award - Best Cinematography"],
    visualStyle: {
      cinematography: ["natural light", "wilderness atmosphere", "immersive composition"],
      colorPalette: ["natural tones", "wilderness colors", "immersive contrast"],
      lighting: ["natural light", "wilderness shadows", "immersive illumination"],
      composition: ["immersive framing", "wilderness composition", "natural angles"],
      cameraTechniques: ["immersive tracking", "wilderness movement", "natural camera"],
      visualEffects: ["minimal effects", "wilderness atmosphere", "immersive mood"]
    },
    description: "Immersive wilderness drama with natural light and realistic composition",
    iconicScenes: ["Wilderness sequences", "Natural moments", "Immersive shots"],
    influence: ["Immersive cinematography", "Natural light", "Wilderness atmosphere"]
  },

  // Additional Drama Films
  {
    id: "citizen-kane-1941",
    title: "Citizen Kane",
    year: 1941,
    director: "Orson Welles",
    genres: ["Drama", "Mystery"],
    awards: ["Academy Award - Best Original Screenplay", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["deep focus", "revolutionary composition", "expressionist lighting"],
      colorPalette: ["black and white", "high contrast", "dramatic tones"],
      lighting: ["chiaroscuro", "dramatic shadows", "expressionist illumination"],
      composition: ["deep focus", "revolutionary framing", "dramatic angles"],
      cameraTechniques: ["deep focus", "revolutionary tracking", "dramatic movement"],
      visualEffects: ["practical effects", "dramatic lighting", "revolutionary cinematography"]
    },
    description: "Revolutionary drama with deep focus cinematography and expressionist lighting",
    iconicScenes: ["Xanadu sequences", "Deep focus shots", "Revolutionary moments"],
    influence: ["Deep focus cinematography", "Revolutionary composition", "Expressionist lighting"]
  },
  {
    id: "casablanca-1942",
    title: "Casablanca",
    year: 1942,
    director: "Michael Curtiz",
    genres: ["Drama", "Romance", "War"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["classic composition", "romantic lighting", "atmospheric mood"],
      colorPalette: ["black and white", "romantic tones", "atmospheric contrast"],
      lighting: ["romantic lighting", "atmospheric shadows", "classic illumination"],
      composition: ["classic framing", "romantic composition", "atmospheric angles"],
      cameraTechniques: ["classic tracking", "romantic movement", "atmospheric camera"],
      visualEffects: ["practical effects", "romantic atmosphere", "classic mood"]
    },
    description: "Classic romantic drama with atmospheric lighting and timeless composition",
    iconicScenes: ["Airport farewell", "Rick's Café", "Romantic moments"],
    influence: ["Classic cinematography", "Romantic lighting", "Atmospheric mood"]
  },
  {
    id: "godfather-1972",
    title: "The Godfather",
    year: 1972,
    director: "Francis Ford Coppola",
    genres: ["Drama", "Crime", "Thriller"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Actor"],
    visualStyle: {
      cinematography: ["classic composition", "dramatic lighting", "atmospheric mood"],
      colorPalette: ["warm tones", "dramatic contrast", "atmospheric colors"],
      lighting: ["dramatic lighting", "atmospheric shadows", "classic illumination"],
      composition: ["classic framing", "dramatic composition", "atmospheric angles"],
      cameraTechniques: ["classic tracking", "dramatic movement", "atmospheric camera"],
      visualEffects: ["practical effects", "dramatic atmosphere", "classic mood"]
    },
    description: "Classic crime drama with dramatic lighting and atmospheric composition",
    iconicScenes: ["Wedding sequence", "Restaurant scene", "Dramatic moments"],
    influence: ["Classic cinematography", "Dramatic lighting", "Atmospheric mood"]
  },
  {
    id: "apocalypse-now-1979",
    title: "Apocalypse Now",
    year: 1979,
    director: "Francis Ford Coppola",
    genres: ["Drama", "War", "Adventure"],
    awards: ["Academy Award - Best Cinematography", "Palme d'Or"],
    visualStyle: {
      cinematography: ["epic scale", "war atmosphere", "dramatic composition"],
      colorPalette: ["war tones", "dramatic contrast", "atmospheric colors"],
      lighting: ["war lighting", "dramatic shadows", "epic illumination"],
      composition: ["epic framing", "war composition", "dramatic angles"],
      cameraTechniques: ["epic tracking", "war movement", "dramatic camera"],
      visualEffects: ["practical effects", "war atmosphere", "epic mood"]
    },
    description: "Epic war drama with dramatic lighting and atmospheric composition",
    iconicScenes: ["Helicopter attack", "River journey", "Epic moments"],
    influence: ["Epic cinematography", "War lighting", "Dramatic atmosphere"]
  },
  {
    id: "schindlers-list-1993",
    title: "Schindler's List",
    year: 1993,
    director: "Steven Spielberg",
    genres: ["Drama", "History", "War"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Supporting Actress"],
    visualStyle: {
      cinematography: ["documentary style", "historical accuracy", "dramatic composition"],
      colorPalette: ["black and white", "historical tones", "dramatic contrast"],
      lighting: ["documentary lighting", "historical shadows", "dramatic illumination"],
      composition: ["documentary framing", "historical composition", "dramatic angles"],
      cameraTechniques: ["documentary tracking", "historical movement", "dramatic camera"],
      visualEffects: ["practical effects", "historical atmosphere", "documentary mood"]
    },
    description: "Historical drama with documentary-style cinematography and dramatic composition",
    iconicScenes: ["Red coat girl", "Historical sequences", "Dramatic moments"],
    influence: ["Documentary cinematography", "Historical accuracy", "Dramatic mood"]
  },
  {
    id: "forrest-gump-1994",
    title: "Forrest Gump",
    year: 1994,
    director: "Robert Zemeckis",
    genres: ["Drama", "Comedy", "Romance"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Actor"],
    visualStyle: {
      cinematography: ["classic composition", "nostalgic lighting", "warm mood"],
      colorPalette: ["warm tones", "nostalgic colors", "classic contrast"],
      lighting: ["nostalgic lighting", "warm shadows", "classic illumination"],
      composition: ["classic framing", "nostalgic composition", "warm angles"],
      cameraTechniques: ["classic tracking", "nostalgic movement", "warm camera"],
      visualEffects: ["revolutionary effects", "nostalgic atmosphere", "classic mood"]
    },
    description: "Classic drama with nostalgic lighting and warm composition",
    iconicScenes: ["Running sequences", "Historical moments", "Warm scenes"],
    influence: ["Classic cinematography", "Nostalgic lighting", "Warm mood"]
  },
  {
    id: "titanic-1997",
    title: "Titanic",
    year: 1997,
    director: "James Cameron",
    genres: ["Drama", "Romance", "Disaster"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["epic scale", "romantic lighting", "dramatic composition"],
      colorPalette: ["romantic tones", "epic colors", "dramatic contrast"],
      lighting: ["romantic lighting", "epic shadows", "dramatic illumination"],
      composition: ["epic framing", "romantic composition", "dramatic angles"],
      cameraTechniques: ["epic tracking", "romantic movement", "dramatic camera"],
      visualEffects: ["revolutionary effects", "romantic atmosphere", "epic mood"]
    },
    description: "Epic romantic drama with revolutionary effects and dramatic composition",
    iconicScenes: ["Ship sequences", "Romantic moments", "Epic scenes"],
    influence: ["Epic cinematography", "Romantic lighting", "Revolutionary effects"]
  },
  {
    id: "american-beauty-1999",
    title: "American Beauty",
    year: 1999,
    director: "Sam Mendes",
    genres: ["Drama", "Romance", "Comedy"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["suburban composition", "dramatic lighting", "realistic mood"],
      colorPalette: ["suburban tones", "dramatic colors", "realistic contrast"],
      lighting: ["suburban lighting", "dramatic shadows", "realistic illumination"],
      composition: ["suburban framing", "dramatic composition", "realistic angles"],
      cameraTechniques: ["suburban tracking", "dramatic movement", "realistic camera"],
      visualEffects: ["practical effects", "suburban atmosphere", "dramatic mood"]
    },
    description: "Suburban drama with dramatic lighting and realistic composition",
    iconicScenes: ["Rose petal sequences", "Suburban moments", "Dramatic scenes"],
    influence: ["Suburban cinematography", "Dramatic lighting", "Realistic mood"]
  },
  {
    id: "million-dollar-baby-2004",
    title: "Million Dollar Baby",
    year: 2004,
    director: "Clint Eastwood",
    genres: ["Drama", "Sport", "Romance"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["realistic composition", "dramatic lighting", "sport atmosphere"],
      colorPalette: ["realistic tones", "dramatic colors", "sport contrast"],
      lighting: ["realistic lighting", "dramatic shadows", "sport illumination"],
      composition: ["realistic framing", "dramatic composition", "sport angles"],
      cameraTechniques: ["realistic tracking", "dramatic movement", "sport camera"],
      visualEffects: ["practical effects", "sport atmosphere", "realistic mood"]
    },
    description: "Realistic sports drama with dramatic lighting and sport atmosphere",
    iconicScenes: ["Boxing sequences", "Training moments", "Dramatic scenes"],
    influence: ["Realistic cinematography", "Dramatic lighting", "Sport atmosphere"]
  },
  {
    id: "no-country-old-men-2007",
    title: "No Country for Old Men",
    year: 2007,
    director: "Joel Coen",
    genres: ["Drama", "Crime", "Thriller"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["western composition", "dramatic lighting", "thriller atmosphere"],
      colorPalette: ["western tones", "dramatic colors", "thriller contrast"],
      lighting: ["western lighting", "dramatic shadows", "thriller illumination"],
      composition: ["western framing", "dramatic composition", "thriller angles"],
      cameraTechniques: ["western tracking", "dramatic movement", "thriller camera"],
      visualEffects: ["practical effects", "thriller atmosphere", "western mood"]
    },
    description: "Western thriller with dramatic lighting and atmospheric composition",
    iconicScenes: ["Chase sequences", "Western moments", "Thriller scenes"],
    influence: ["Western cinematography", "Dramatic lighting", "Thriller atmosphere"]
  },
  {
    id: "slumdog-millionaire-2008",
    title: "Slumdog Millionaire",
    year: 2008,
    director: "Danny Boyle",
    genres: ["Drama", "Romance", "Adventure"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["dynamic composition", "vibrant lighting", "urban atmosphere"],
      colorPalette: ["vibrant tones", "dynamic colors", "urban contrast"],
      lighting: ["vibrant lighting", "dynamic shadows", "urban illumination"],
      composition: ["dynamic framing", "vibrant composition", "urban angles"],
      cameraTechniques: ["dynamic tracking", "vibrant movement", "urban camera"],
      visualEffects: ["practical effects", "urban atmosphere", "dynamic mood"]
    },
    description: "Dynamic urban drama with vibrant lighting and atmospheric composition",
    iconicScenes: ["Slum sequences", "Game show moments", "Dynamic scenes"],
    influence: ["Dynamic cinematography", "Vibrant lighting", "Urban atmosphere"]
  },
  {
    id: "hurt-locker-2008",
    title: "The Hurt Locker",
    year: 2008,
    director: "Kathryn Bigelow",
    genres: ["Drama", "War", "Thriller"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["documentary style", "war atmosphere", "realistic composition"],
      colorPalette: ["war tones", "documentary colors", "realistic contrast"],
      lighting: ["documentary lighting", "war shadows", "realistic illumination"],
      composition: ["documentary framing", "war composition", "realistic angles"],
      cameraTechniques: ["documentary tracking", "war movement", "realistic camera"],
      visualEffects: ["practical effects", "war atmosphere", "documentary mood"]
    },
    description: "Documentary-style war drama with realistic lighting and atmospheric composition",
    iconicScenes: ["Bomb disposal", "War sequences", "Realistic moments"],
    influence: ["Documentary cinematography", "War lighting", "Realistic atmosphere"]
  },
  {
    id: "12-years-slave-2013",
    title: "12 Years a Slave",
    year: 2013,
    director: "Steve McQueen",
    genres: ["Drama", "History", "Biography"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Supporting Actress"],
    visualStyle: {
      cinematography: ["historical composition", "dramatic lighting", "realistic mood"],
      colorPalette: ["historical tones", "dramatic colors", "realistic contrast"],
      lighting: ["historical lighting", "dramatic shadows", "realistic illumination"],
      composition: ["historical framing", "dramatic composition", "realistic angles"],
      cameraTechniques: ["historical tracking", "dramatic movement", "realistic camera"],
      visualEffects: ["practical effects", "historical atmosphere", "dramatic mood"]
    },
    description: "Historical drama with dramatic lighting and realistic composition",
    iconicScenes: ["Plantation sequences", "Historical moments", "Dramatic scenes"],
    influence: ["Historical cinematography", "Dramatic lighting", "Realistic mood"]
  },
  {
    id: "spotlight-2015",
    title: "Spotlight",
    year: 2015,
    director: "Tom McCarthy",
    genres: ["Drama", "Crime", "Thriller"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Original Screenplay"],
    visualStyle: {
      cinematography: ["journalistic composition", "realistic lighting", "documentary mood"],
      colorPalette: ["realistic tones", "journalistic colors", "documentary contrast"],
      lighting: ["realistic lighting", "journalistic shadows", "documentary illumination"],
      composition: ["journalistic framing", "realistic composition", "documentary angles"],
      cameraTechniques: ["journalistic tracking", "realistic movement", "documentary camera"],
      visualEffects: ["practical effects", "documentary atmosphere", "realistic mood"]
    },
    description: "Journalistic drama with realistic lighting and documentary-style composition",
    iconicScenes: ["Newsroom sequences", "Investigation moments", "Realistic scenes"],
    influence: ["Journalistic cinematography", "Realistic lighting", "Documentary mood"]
  },
  {
    id: "moonlight-2016",
    title: "Moonlight",
    year: 2016,
    director: "Barry Jenkins",
    genres: ["Drama", "Romance"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Supporting Actor"],
    visualStyle: {
      cinematography: ["poetic composition", "atmospheric lighting", "intimate mood"],
      colorPalette: ["atmospheric tones", "poetic colors", "intimate contrast"],
      lighting: ["atmospheric lighting", "poetic shadows", "intimate illumination"],
      composition: ["poetic framing", "atmospheric composition", "intimate angles"],
      cameraTechniques: ["poetic tracking", "atmospheric movement", "intimate camera"],
      visualEffects: ["practical effects", "intimate atmosphere", "poetic mood"]
    },
    description: "Poetic drama with atmospheric lighting and intimate composition",
    iconicScenes: ["Beach sequences", "Intimate moments", "Poetic scenes"],
    influence: ["Poetic cinematography", "Atmospheric lighting", "Intimate mood"]
  },
  {
    id: "shape-of-water-2017",
    title: "The Shape of Water",
    year: 2017,
    director: "Guillermo del Toro",
    genres: ["Drama", "Romance", "Fantasy"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["fantasy composition", "romantic lighting", "atmospheric mood"],
      colorPalette: ["fantasy tones", "romantic colors", "atmospheric contrast"],
      lighting: ["fantasy lighting", "romantic shadows", "atmospheric illumination"],
      composition: ["fantasy framing", "romantic composition", "atmospheric angles"],
      cameraTechniques: ["fantasy tracking", "romantic movement", "atmospheric camera"],
      visualEffects: ["practical effects", "atmospheric mood", "fantasy atmosphere"]
    },
    description: "Fantasy romance with atmospheric lighting and romantic composition",
    iconicScenes: ["Underwater sequences", "Romantic moments", "Fantasy scenes"],
    influence: ["Fantasy cinematography", "Romantic lighting", "Atmospheric mood"]
  },
  {
    id: "parasite-2019",
    title: "Parasite",
    year: 2019,
    director: "Bong Joon-ho",
    genres: ["Drama", "Thriller", "Comedy"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["social commentary", "dramatic lighting", "realistic composition"],
      colorPalette: ["realistic tones", "dramatic colors", "social contrast"],
      lighting: ["realistic lighting", "dramatic shadows", "social illumination"],
      composition: ["realistic framing", "dramatic composition", "social angles"],
      cameraTechniques: ["realistic tracking", "dramatic movement", "social camera"],
      visualEffects: ["practical effects", "social atmosphere", "realistic mood"]
    },
    description: "Social drama with dramatic lighting and realistic composition",
    iconicScenes: ["Basement sequences", "Social moments", "Dramatic scenes"],
    influence: ["Social cinematography", "Dramatic lighting", "Realistic mood"]
  },
  {
    id: "nomadland-2020",
    title: "Nomadland",
    year: 2020,
    director: "Chloé Zhao",
    genres: ["Drama", "Adventure"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["natural composition", "documentary lighting", "realistic mood"],
      colorPalette: ["natural tones", "documentary colors", "realistic contrast"],
      lighting: ["natural lighting", "documentary shadows", "realistic illumination"],
      composition: ["natural framing", "documentary composition", "realistic angles"],
      cameraTechniques: ["natural tracking", "documentary movement", "realistic camera"],
      visualEffects: ["practical effects", "realistic atmosphere", "natural mood"]
    },
    description: "Naturalistic drama with documentary lighting and realistic composition",
    iconicScenes: ["Road sequences", "Natural moments", "Realistic scenes"],
    influence: ["Natural cinematography", "Documentary lighting", "Realistic mood"]
  },

  // Additional Sci-Fi Films
  {
    id: "metropolis-1927",
    title: "Metropolis",
    year: 1927,
    director: "Fritz Lang",
    genres: ["Sci-Fi", "Drama", "Thriller"],
    awards: ["Academy Award - Best Visual Effects Nomination"],
    visualStyle: {
      cinematography: ["expressionist composition", "futuristic lighting", "revolutionary mood"],
      colorPalette: ["black and white", "futuristic tones", "expressionist contrast"],
      lighting: ["expressionist lighting", "futuristic shadows", "revolutionary illumination"],
      composition: ["expressionist framing", "futuristic composition", "revolutionary angles"],
      cameraTechniques: ["expressionist tracking", "futuristic movement", "revolutionary camera"],
      visualEffects: ["revolutionary effects", "futuristic atmosphere", "expressionist mood"]
    },
    description: "Revolutionary sci-fi with expressionist lighting and futuristic composition",
    iconicScenes: ["Robot sequences", "Futuristic city", "Expressionist moments"],
    influence: ["Expressionist cinematography", "Futuristic lighting", "Revolutionary effects"]
  },
  {
    id: "alien-1979",
    title: "Alien",
    year: 1979,
    director: "Ridley Scott",
    genres: ["Sci-Fi", "Horror", "Thriller"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["claustrophobic composition", "atmospheric lighting", "horror mood"],
      colorPalette: ["dark tones", "atmospheric colors", "horror contrast"],
      lighting: ["atmospheric lighting", "dark shadows", "horror illumination"],
      composition: ["claustrophobic framing", "atmospheric composition", "horror angles"],
      cameraTechniques: ["claustrophobic tracking", "atmospheric movement", "horror camera"],
      visualEffects: ["revolutionary effects", "horror atmosphere", "atmospheric mood"]
    },
    description: "Claustrophobic sci-fi horror with atmospheric lighting and revolutionary effects",
    iconicScenes: ["Chestburster scene", "Space sequences", "Horror moments"],
    influence: ["Claustrophobic cinematography", "Atmospheric lighting", "Horror effects"]
  },
  {
    id: "terminator-1984",
    title: "The Terminator",
    year: 1984,
    director: "James Cameron",
    genres: ["Sci-Fi", "Action", "Thriller"],
    awards: ["Academy Award - Best Visual Effects Nomination"],
    visualStyle: {
      cinematography: ["action composition", "cyberpunk lighting", "thriller mood"],
      colorPalette: ["cyberpunk tones", "action colors", "thriller contrast"],
      lighting: ["cyberpunk lighting", "action shadows", "thriller illumination"],
      composition: ["action framing", "cyberpunk composition", "thriller angles"],
      cameraTechniques: ["action tracking", "cyberpunk movement", "thriller camera"],
      visualEffects: ["revolutionary effects", "thriller atmosphere", "cyberpunk mood"]
    },
    description: "Cyberpunk action thriller with revolutionary effects and atmospheric composition",
    iconicScenes: ["Terminator sequences", "Action moments", "Cyberpunk scenes"],
    influence: ["Cyberpunk cinematography", "Action lighting", "Revolutionary effects"]
  },
  {
    id: "back-to-future-1985",
    title: "Back to the Future",
    year: 1985,
    director: "Robert Zemeckis",
    genres: ["Sci-Fi", "Comedy", "Adventure"],
    awards: ["Academy Award - Best Original Screenplay", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["adventure composition", "nostalgic lighting", "comedy mood"],
      colorPalette: ["nostalgic tones", "adventure colors", "comedy contrast"],
      lighting: ["nostalgic lighting", "adventure shadows", "comedy illumination"],
      composition: ["adventure framing", "nostalgic composition", "comedy angles"],
      cameraTechniques: ["adventure tracking", "nostalgic movement", "comedy camera"],
      visualEffects: ["revolutionary effects", "comedy atmosphere", "nostalgic mood"]
    },
    description: "Nostalgic sci-fi adventure with revolutionary effects and comedy composition",
    iconicScenes: ["Time travel sequences", "Adventure moments", "Comedy scenes"],
    influence: ["Nostalgic cinematography", "Adventure lighting", "Revolutionary effects"]
  },
  {
    id: "matrix-1999",
    title: "The Matrix",
    year: 1999,
    director: "Lana Wachowski",
    genres: ["Sci-Fi", "Action", "Thriller"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["revolutionary composition", "cyberpunk lighting", "action mood"],
      colorPalette: ["cyberpunk tones", "revolutionary colors", "action contrast"],
      lighting: ["cyberpunk lighting", "revolutionary shadows", "action illumination"],
      composition: ["revolutionary framing", "cyberpunk composition", "action angles"],
      cameraTechniques: ["revolutionary tracking", "cyberpunk movement", "action camera"],
      visualEffects: ["revolutionary effects", "action atmosphere", "cyberpunk mood"]
    },
    description: "Revolutionary sci-fi action with cyberpunk lighting and groundbreaking effects",
    iconicScenes: ["Bullet time", "Action sequences", "Cyberpunk moments"],
    influence: ["Revolutionary cinematography", "Cyberpunk lighting", "Groundbreaking effects"]
  },
  {
    id: "minority-report-2002",
    title: "Minority Report",
    year: 2002,
    director: "Steven Spielberg",
    genres: ["Sci-Fi", "Thriller", "Action"],
    awards: ["Academy Award - Best Visual Effects Nomination"],
    visualStyle: {
      cinematography: ["futuristic composition", "atmospheric lighting", "thriller mood"],
      colorPalette: ["futuristic tones", "atmospheric colors", "thriller contrast"],
      lighting: ["atmospheric lighting", "futuristic shadows", "thriller illumination"],
      composition: ["futuristic framing", "atmospheric composition", "thriller angles"],
      cameraTechniques: ["futuristic tracking", "atmospheric movement", "thriller camera"],
      visualEffects: ["revolutionary effects", "thriller atmosphere", "futuristic mood"]
    },
    description: "Futuristic sci-fi thriller with atmospheric lighting and revolutionary effects",
    iconicScenes: ["Precrime sequences", "Futuristic moments", "Thriller scenes"],
    influence: ["Futuristic cinematography", "Atmospheric lighting", "Revolutionary effects"]
  },
  {
    id: "eternal-sunshine-2004",
    title: "Eternal Sunshine of the Spotless Mind",
    year: 2004,
    director: "Michel Gondry",
    genres: ["Sci-Fi", "Drama", "Romance"],
    awards: ["Academy Award - Best Original Screenplay", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["surreal composition", "romantic lighting", "dramatic mood"],
      colorPalette: ["romantic tones", "surreal colors", "dramatic contrast"],
      lighting: ["romantic lighting", "surreal shadows", "dramatic illumination"],
      composition: ["surreal framing", "romantic composition", "dramatic angles"],
      cameraTechniques: ["surreal tracking", "romantic movement", "dramatic camera"],
      visualEffects: ["practical effects", "dramatic atmosphere", "surreal mood"]
    },
    description: "Surreal sci-fi romance with romantic lighting and dramatic composition",
    iconicScenes: ["Memory sequences", "Romantic moments", "Surreal scenes"],
    influence: ["Surreal cinematography", "Romantic lighting", "Dramatic mood"]
  },

  {
    id: "district-9-2009",
    title: "District 9",
    year: 2009,
    director: "Neill Blomkamp",
    genres: ["Sci-Fi", "Action", "Thriller"],
    awards: ["Academy Award - Best Picture Nomination", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["documentary composition", "realistic lighting", "action mood"],
      colorPalette: ["realistic tones", "documentary colors", "action contrast"],
      lighting: ["realistic lighting", "documentary shadows", "action illumination"],
      composition: ["documentary framing", "realistic composition", "action angles"],
      cameraTechniques: ["documentary tracking", "realistic movement", "action camera"],
      visualEffects: ["revolutionary effects", "action atmosphere", "documentary mood"]
    },
    description: "Documentary-style sci-fi action with realistic lighting and revolutionary effects",
    iconicScenes: ["Alien sequences", "Action moments", "Documentary scenes"],
    influence: ["Documentary cinematography", "Realistic lighting", "Revolutionary effects"]
  },

  {
    id: "her-2013",
    title: "Her",
    year: 2013,
    director: "Spike Jonze",
    genres: ["Sci-Fi", "Drama", "Romance"],
    awards: ["Academy Award - Best Original Screenplay", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["romantic composition", "warm lighting", "dramatic mood"],
      colorPalette: ["warm tones", "romantic colors", "dramatic contrast"],
      lighting: ["warm lighting", "romantic shadows", "dramatic illumination"],
      composition: ["romantic framing", "warm composition", "dramatic angles"],
      cameraTechniques: ["romantic tracking", "warm movement", "dramatic camera"],
      visualEffects: ["practical effects", "dramatic atmosphere", "romantic mood"]
    },
    description: "Romantic sci-fi drama with warm lighting and dramatic composition",
    iconicScenes: ["AI sequences", "Romantic moments", "Warm scenes"],
    influence: ["Romantic cinematography", "Warm lighting", "Dramatic mood"]
  },
  {
    id: "ex-machina-2014",
    title: "Ex Machina",
    year: 2014,
    director: "Alex Garland",
    genres: ["Sci-Fi", "Drama", "Thriller"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["minimalist composition", "atmospheric lighting", "thriller mood"],
      colorPalette: ["atmospheric tones", "minimalist colors", "thriller contrast"],
      lighting: ["atmospheric lighting", "minimalist shadows", "thriller illumination"],
      composition: ["minimalist framing", "atmospheric composition", "thriller angles"],
      cameraTechniques: ["minimalist tracking", "atmospheric movement", "thriller camera"],
      visualEffects: ["revolutionary effects", "thriller atmosphere", "minimalist mood"]
    },
    description: "Minimalist sci-fi thriller with atmospheric lighting and revolutionary effects",
    iconicScenes: ["AI sequences", "Minimalist moments", "Thriller scenes"],
    influence: ["Minimalist cinematography", "Atmospheric lighting", "Revolutionary effects"]
  },
  {
    id: "mad-max-fury-road-2015",
    title: "Mad Max: Fury Road",
    year: 2015,
    director: "George Miller",
    genres: ["Sci-Fi", "Action", "Adventure"],
    awards: ["Academy Award - Best Visual Effects", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["epic composition", "action lighting", "adventure mood"],
      colorPalette: ["action tones", "epic colors", "adventure contrast"],
      lighting: ["action lighting", "epic shadows", "adventure illumination"],
      composition: ["epic framing", "action composition", "adventure angles"],
      cameraTechniques: ["epic tracking", "action movement", "adventure camera"],
      visualEffects: ["revolutionary effects", "adventure atmosphere", "epic mood"]
    },
    description: "Epic sci-fi action with revolutionary effects and adventure composition",
    iconicScenes: ["Chase sequences", "Action moments", "Epic scenes"],
    influence: ["Epic cinematography", "Action lighting", "Revolutionary effects"]
  },
  {
    id: "ready-player-one-2018",
    title: "Ready Player One",
    year: 2018,
    director: "Steven Spielberg",
    genres: ["Sci-Fi", "Adventure", "Action"],
    awards: ["Academy Award - Best Visual Effects Nomination"],
    visualStyle: {
      cinematography: ["virtual composition", "vibrant lighting", "adventure mood"],
      colorPalette: ["vibrant tones", "virtual colors", "adventure contrast"],
      lighting: ["vibrant lighting", "virtual shadows", "adventure illumination"],
      composition: ["virtual framing", "vibrant composition", "adventure angles"],
      cameraTechniques: ["virtual tracking", "vibrant movement", "adventure camera"],
      visualEffects: ["revolutionary effects", "adventure atmosphere", "virtual mood"]
    },
    description: "Virtual reality sci-fi adventure with vibrant lighting and revolutionary effects",
    iconicScenes: ["VR sequences", "Adventure moments", "Vibrant scenes"],
    influence: ["Virtual cinematography", "Vibrant lighting", "Revolutionary effects"]
  },
  {
    id: "tenet-2020",
    title: "Tenet",
    year: 2020,
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Action", "Thriller"],
    awards: ["Academy Award - Best Visual Effects Nomination"],
    visualStyle: {
      cinematography: ["revolutionary composition", "atmospheric lighting", "thriller mood"],
      colorPalette: ["atmospheric tones", "revolutionary colors", "thriller contrast"],
      lighting: ["atmospheric lighting", "revolutionary shadows", "thriller illumination"],
      composition: ["revolutionary framing", "atmospheric composition", "thriller angles"],
      cameraTechniques: ["revolutionary tracking", "atmospheric movement", "thriller camera"],
      visualEffects: ["revolutionary effects", "thriller atmosphere", "atmospheric mood"]
    },
    description: "Revolutionary sci-fi thriller with atmospheric lighting and groundbreaking effects",
    iconicScenes: ["Time inversion", "Action sequences", "Revolutionary moments"],
    influence: ["Revolutionary cinematography", "Atmospheric lighting", "Groundbreaking effects"]
  },

  // COMEDY GENRE ADDITIONS
  {
    id: "city-lights-1931",
    title: "City Lights",
    year: 1931,
    director: "Charlie Chaplin",
    genres: ["Comedy", "Romance", "Drama"],
    awards: ["National Film Registry", "AFI Top 100 Films"],
    visualStyle: {
      cinematography: ["silent film aesthetics", "physical comedy", "sentimental storytelling"],
      colorPalette: ["black and white", "high contrast", "classic tones"],
      lighting: ["natural light", "studio lighting", "dramatic shadows"],
      composition: ["wide shots", "full body framing", "comic timing"],
      cameraTechniques: ["static shots", "simple movements", "comic timing"],
      visualEffects: ["practical effects", "physical stunts", "minimal effects"]
    },
    description: "Silent comedy masterpiece with physical comedy and sentimental storytelling",
    iconicScenes: ["Flower girl scene", "Boxing match", "Final recognition"],
    influence: ["Physical comedy", "Silent film aesthetics", "Sentimental storytelling"]
  },
  {
    id: "the-general-1926",
    title: "The General",
    year: 1926,
    director: "Buster Keaton",
    genres: ["Comedy", "Action", "Adventure"],
    awards: ["National Film Registry", "AFI Top 100 Films"],
    visualStyle: {
      cinematography: ["physical comedy", "daredevil stunts", "deadpan expression"],
      colorPalette: ["black and white", "high contrast", "clear definition"],
      lighting: ["natural light", "clear visibility", "outdoor lighting"],
      composition: ["wide shots", "full body framing", "geometric patterns"],
      cameraTechniques: ["static shots", "long takes", "stunt photography"],
      visualEffects: ["practical stunts", "real train sequences", "minimal effects"]
    },
    description: "Silent comedy classic with daring stunts and deadpan humor",
    iconicScenes: ["Train chase", "Bridge collapse", "Final escape"],
    influence: ["Physical comedy", "Stunt work", "Deadpan humor"]
  },
  {
    id: "some-like-it-hot-1959",
    title: "Some Like It Hot",
    year: 1959,
    director: "Billy Wilder",
    genres: ["Comedy", "Romance"],
    awards: ["Academy Award - Best Costume Design", "Golden Globe - Best Comedy"],
    visualStyle: {
      cinematography: ["classic Hollywood", "screwball comedy", "cross-dressing humor"],
      colorPalette: ["black and white", "high contrast", "classic tones"],
      lighting: ["studio lighting", "dramatic shadows", "comic timing"],
      composition: ["medium shots", "comic framing", "character focus"],
      cameraTechniques: ["steady camera", "comic timing", "character movements"],
      visualEffects: ["practical effects", "costume design", "minimal effects"]
    },
    description: "Classic screwball comedy with cross-dressing humor and sharp wit",
    iconicScenes: ["Train sequence", "Final chase", "Nobody's perfect"],
    influence: ["Screwball comedy", "Cross-dressing humor", "Classic Hollywood"]
  },
  {
    id: "dr-strangelove-1964",
    title: "Dr. Strangelove",
    year: 1964,
    director: "Stanley Kubrick",
    genres: ["Comedy", "War", "Satire"],
    awards: ["Academy Award - Best Actor Nomination", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["satirical composition", "dark humor", "political commentary"],
      colorPalette: ["black and white", "high contrast", "dramatic tones"],
      lighting: ["dramatic shadows", "chiaroscuro", "political atmosphere"],
      composition: ["symmetrical framing", "political angles", "satirical composition"],
      cameraTechniques: ["steady camera", "political commentary", "satirical timing"],
      visualEffects: ["practical effects", "political satire", "minimal effects"]
    },
    description: "Dark satirical comedy about nuclear war with political commentary",
    iconicScenes: ["War room", "Bomb ride", "Final explosion"],
    influence: ["Political satire", "Dark comedy", "Nuclear war themes"]
  },
  {
    id: "annie-hall-1977",
    title: "Annie Hall",
    year: 1977,
    director: "Woody Allen",
    genres: ["Comedy", "Romance", "Drama"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["neurotic comedy", "romantic realism", "character-driven"],
      colorPalette: ["natural tones", "romantic colors", "realistic contrast"],
      lighting: ["natural light", "romantic lighting", "character focus"],
      composition: ["character framing", "romantic angles", "neurotic timing"],
      cameraTechniques: ["handheld camera", "character movements", "romantic timing"],
      visualEffects: ["practical effects", "character focus", "minimal effects"]
    },
    description: "Neurotic romantic comedy with character-driven storytelling",
    iconicScenes: ["Lobster scene", "Split screen", "Final monologue"],
    influence: ["Neurotic comedy", "Romantic realism", "Character-driven storytelling"]
  },
  {
    id: "the-graduate-1967",
    title: "The Graduate",
    year: 1967,
    director: "Mike Nichols",
    genres: ["Comedy", "Drama", "Romance"],
    awards: ["Academy Award - Best Director", "Golden Globe - Best Comedy"],
    visualStyle: {
      cinematography: ["coming-of-age", "social commentary", "romantic comedy"],
      colorPalette: ["natural tones", "romantic colors", "social contrast"],
      lighting: ["natural light", "romantic lighting", "social atmosphere"],
      composition: ["character framing", "social angles", "romantic timing"],
      cameraTechniques: ["steady camera", "character movements", "social timing"],
      visualEffects: ["practical effects", "social commentary", "minimal effects"]
    },
    description: "Coming-of-age comedy with social commentary and romantic elements",
    iconicScenes: ["Mrs. Robinson seduction", "Pool scene", "Final chase"],
    influence: ["Coming-of-age comedy", "Social commentary", "Romantic elements"]
  },

  // MYSTERY GENRE ADDITIONS
  {
    id: "rear-window-1954",
    title: "Rear Window",
    year: 1954,
    director: "Alfred Hitchcock",
    genres: ["Mystery", "Thriller"],
    awards: ["Academy Award - Best Director Nomination", "BAFTA - Best Film"],
    visualStyle: {
      cinematography: ["voyeuristic thriller", "confined space", "suspenseful composition"],
      colorPalette: ["vibrant colors", "suspenseful tones", "confined contrast"],
      lighting: ["dramatic shadows", "suspenseful lighting", "confined atmosphere"],
      composition: ["point of view shots", "confined framing", "suspenseful angles"],
      cameraTechniques: ["steady camera", "confined movements", "suspenseful timing"],
      visualEffects: ["practical effects", "confined atmosphere", "suspenseful mood"]
    },
    description: "Voyeuristic thriller with confined space and suspenseful composition",
    iconicScenes: ["Window watching", "Murder discovery", "Final confrontation"],
    influence: ["Voyeuristic thriller", "Confined space", "Suspenseful composition"]
  },
  {
    id: "chinatown-1974",
    title: "Chinatown",
    year: 1974,
    director: "Roman Polanski",
    genres: ["Mystery", "Crime", "Drama"],
    awards: ["Academy Award - Best Original Screenplay", "Golden Globe - Best Drama"],
    visualStyle: {
      cinematography: ["neo-noir", "mystery atmosphere", "corruption themes"],
      colorPalette: ["desaturated colors", "noir tones", "corruption contrast"],
      lighting: ["dramatic shadows", "noir lighting", "corruption atmosphere"],
      composition: ["low angle shots", "mystery framing", "corruption angles"],
      cameraTechniques: ["steady camera", "mystery movements", "corruption timing"],
      visualEffects: ["practical effects", "noir atmosphere", "corruption mood"]
    },
    description: "Neo-noir mystery with corruption themes and atmospheric lighting",
    iconicScenes: ["Nose cut", "Water conspiracy", "Final revelation"],
    influence: ["Neo-noir", "Corruption themes", "Atmospheric lighting"]
  },
  {
    id: "the-maltese-falcon-1941",
    title: "The Maltese Falcon",
    year: 1941,
    director: "John Huston",
    genres: ["Mystery", "Crime", "Film Noir"],
    awards: ["Academy Award - Best Picture Nomination", "National Film Registry"],
    visualStyle: {
      cinematography: ["film noir", "mystery atmosphere", "hard-boiled detective"],
      colorPalette: ["black and white", "noir contrast", "mystery tones"],
      lighting: ["dramatic shadows", "chiaroscuro", "noir atmosphere"],
      composition: ["low angle shots", "mystery framing", "noir angles"],
      cameraTechniques: ["steady camera", "mystery movements", "noir timing"],
      visualEffects: ["practical effects", "noir atmosphere", "mystery mood"]
    },
    description: "Classic film noir with hard-boiled detective and mystery atmosphere",
    iconicScenes: ["Falcon reveal", "Interrogation scenes", "Final confrontation"],
    influence: ["Film noir", "Hard-boiled detective", "Mystery atmosphere"]
  },
  {
    id: "the-big-sleep-1946",
    title: "The Big Sleep",
    year: 1946,
    director: "Howard Hawks",
    genres: ["Mystery", "Crime", "Film Noir"],
    awards: ["National Film Registry", "AFI Top 100 Films"],
    visualStyle: {
      cinematography: ["film noir", "complex mystery", "hard-boiled detective"],
      colorPalette: ["black and white", "noir contrast", "complex tones"],
      lighting: ["dramatic shadows", "chiaroscuro", "noir atmosphere"],
      composition: ["low angle shots", "complex framing", "noir angles"],
      cameraTechniques: ["steady camera", "complex movements", "noir timing"],
      visualEffects: ["practical effects", "noir atmosphere", "complex mood"]
    },
    description: "Complex film noir with hard-boiled detective and intricate plot",
    iconicScenes: ["Bookstore scene", "Car chase", "Final revelation"],
    influence: ["Film noir", "Complex mystery", "Hard-boiled detective"]
  },
  {
    id: "laura-1944",
    title: "Laura",
    year: 1944,
    director: "Otto Preminger",
    genres: ["Mystery", "Romance", "Film Noir"],
    awards: ["Academy Award - Best Cinematography", "National Film Registry"],
    visualStyle: {
      cinematography: ["film noir", "romantic mystery", "atmospheric lighting"],
      colorPalette: ["black and white", "noir contrast", "romantic tones"],
      lighting: ["dramatic shadows", "chiaroscuro", "romantic atmosphere"],
      composition: ["low angle shots", "romantic framing", "noir angles"],
      cameraTechniques: ["steady camera", "romantic movements", "noir timing"],
      visualEffects: ["practical effects", "noir atmosphere", "romantic mood"]
    },
    description: "Romantic film noir with atmospheric lighting and mystery elements",
    iconicScenes: ["Portrait scene", "Laura's return", "Final revelation"],
    influence: ["Film noir", "Romantic mystery", "Atmospheric lighting"]
  },

  // CRIME GENRE ADDITIONS
  {
    id: "scarface-1983",
    title: "Scarface",
    year: 1983,
    director: "Brian De Palma",
    genres: ["Crime", "Drama", "Thriller"],
    awards: ["Golden Globe - Best Actor Nomination"],
    visualStyle: {
      cinematography: ["excessive crime drama", "miami vice", "corruption themes"],
      colorPalette: ["vibrant colors", "crime tones", "excessive contrast"],
      lighting: ["dramatic shadows", "crime lighting", "excessive atmosphere"],
      composition: ["low angle shots", "excessive framing", "corruption angles"],
      cameraTechniques: ["steady camera", "excessive movements", "corruption timing"],
      visualEffects: ["practical effects", "crime atmosphere", "excessive mood"]
    },
    description: "Excessive crime drama with Miami vice and corruption themes",
    iconicScenes: ["Say hello scene", "Final shootout", "World is yours"],
    influence: ["Excessive crime drama", "Miami vice", "Corruption themes"]
  },
  {
    id: "reservoir-dogs-1992",
    title: "Reservoir Dogs",
    year: 1992,
    director: "Quentin Tarantino",
    genres: ["Crime", "Thriller"],
    awards: ["Independent Spirit Award - Best Debut Feature"],
    visualStyle: {
      cinematography: ["minimalist crime thriller", "heist gone wrong", "tension building"],
      colorPalette: ["desaturated colors", "crime tones", "tension contrast"],
      lighting: ["dramatic shadows", "crime lighting", "tension atmosphere"],
      composition: ["medium shots", "tension framing", "crime angles"],
      cameraTechniques: ["steady camera", "tension movements", "crime timing"],
      visualEffects: ["practical effects", "crime atmosphere", "tension mood"]
    },
    description: "Minimalist crime thriller with heist gone wrong and tension building",
    iconicScenes: ["Opening diner", "Ear scene", "Final standoff"],
    influence: ["Minimalist crime thriller", "Heist gone wrong", "Tension building"]
  },
  {
    id: "the-departed-2006",
    title: "The Departed",
    year: 2006,
    director: "Martin Scorsese",
    genres: ["Crime", "Drama", "Thriller"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["intense crime thriller", "undercover drama", "betrayal themes"],
      colorPalette: ["desaturated colors", "crime tones", "betrayal contrast"],
      lighting: ["dramatic shadows", "crime lighting", "betrayal atmosphere"],
      composition: ["close-up shots", "betrayal framing", "crime angles"],
      cameraTechniques: ["handheld camera", "betrayal movements", "crime timing"],
      visualEffects: ["practical effects", "crime atmosphere", "betrayal mood"]
    },
    description: "Intense crime thriller with undercover drama and betrayal themes",
    iconicScenes: ["Elevator scene", "Final confrontation", "Rat symbolism"],
    influence: ["Intense crime thriller", "Undercover drama", "Betrayal themes"]
  },
  {
    id: "heat-1995",
    title: "Heat",
    year: 1995,
    director: "Michael Mann",
    genres: ["Crime", "Action", "Drama"],
    awards: ["Academy Award - Best Supporting Actor Nomination"],
    visualStyle: {
      cinematography: ["epic crime drama", "heist sequences", "character study"],
      colorPalette: ["cool colors", "crime tones", "character contrast"],
      lighting: ["dramatic shadows", "crime lighting", "character atmosphere"],
      composition: ["wide shots", "character framing", "crime angles"],
      cameraTechniques: ["steady camera", "character movements", "crime timing"],
      visualEffects: ["practical effects", "crime atmosphere", "character mood"]
    },
    description: "Epic crime drama with heist sequences and character study",
    iconicScenes: ["Coffee shop", "Bank robbery", "Final chase"],
    influence: ["Epic crime drama", "Heist sequences", "Character study"]
  },
  {
    id: "casino-1995",
    title: "Casino",
    year: 1995,
    director: "Martin Scorsese",
    genres: ["Crime", "Drama"],
    awards: ["Academy Award - Best Actress Nomination"],
    visualStyle: {
      cinematography: ["epic crime drama", "las vegas", "corruption themes"],
      colorPalette: ["vibrant colors", "crime tones", "corruption contrast"],
      lighting: ["dramatic shadows", "crime lighting", "corruption atmosphere"],
      composition: ["wide shots", "corruption framing", "crime angles"],
      cameraTechniques: ["steady camera", "corruption movements", "crime timing"],
      visualEffects: ["practical effects", "crime atmosphere", "corruption mood"]
    },
    description: "Epic crime drama with Las Vegas and corruption themes",
    iconicScenes: ["Opening montage", "Casino scenes", "Final betrayal"],
    influence: ["Epic crime drama", "Las Vegas", "Corruption themes"]
  },

  // WAR GENRE ADDITIONS
  {
    id: "full-metal-jacket-1987",
    title: "Full Metal Jacket",
    year: 1987,
    director: "Stanley Kubrick",
    genres: ["War", "Drama"],
    awards: ["Academy Award - Best Adapted Screenplay Nomination"],
    visualStyle: {
      cinematography: ["brutal war drama", "marine training", "vietnam war"],
      colorPalette: ["desaturated colors", "war tones", "brutal contrast"],
      lighting: ["dramatic shadows", "war lighting", "brutal atmosphere"],
      composition: ["wide shots", "brutal framing", "war angles"],
      cameraTechniques: ["steady camera", "brutal movements", "war timing"],
      visualEffects: ["practical effects", "war atmosphere", "brutal mood"]
    },
    description: "Brutal war drama with marine training and Vietnam war",
    iconicScenes: ["Drill instructor", "Boot camp", "Final battle"],
    influence: ["Brutal war drama", "Marine training", "Vietnam war"]
  },
  {
    id: "platoon-1986",
    title: "Platoon",
    year: 1986,
    director: "Oliver Stone",
    genres: ["War", "Drama"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["realistic war drama", "vietnam war", "moral conflict"],
      colorPalette: ["desaturated colors", "war tones", "moral contrast"],
      lighting: ["dramatic shadows", "war lighting", "moral atmosphere"],
      composition: ["handheld shots", "moral framing", "war angles"],
      cameraTechniques: ["handheld camera", "moral movements", "war timing"],
      visualEffects: ["practical effects", "war atmosphere", "moral mood"]
    },
    description: "Realistic war drama with Vietnam war and moral conflict",
    iconicScenes: ["Barnes vs Elias", "Village scene", "Final battle"],
    influence: ["Realistic war drama", "Vietnam war", "Moral conflict"]
  },
  {
    id: "saving-private-ryan-1998",
    title: "Saving Private Ryan",
    year: 1998,
    director: "Steven Spielberg",
    genres: ["War", "Drama", "Action"],
    awards: ["Academy Award - Best Director", "Academy Award - Best Cinematography"],
    visualStyle: {
      cinematography: ["realistic war drama", "d-day invasion", "handheld camera"],
      colorPalette: ["desaturated colors", "war tones", "realistic contrast"],
      lighting: ["natural light", "war lighting", "realistic atmosphere"],
      composition: ["handheld shots", "realistic framing", "war angles"],
      cameraTechniques: ["handheld camera", "realistic movements", "war timing"],
      visualEffects: ["practical effects", "war atmosphere", "realistic mood"]
    },
    description: "Realistic war drama with D-Day invasion and handheld camera",
    iconicScenes: ["D-Day landing", "Sniper scene", "Final battle"],
    influence: ["Realistic war drama", "D-Day invasion", "Handheld camera"]
  },
  {
    id: "the-thin-red-line-1998",
    title: "The Thin Red Line",
    year: 1998,
    director: "Terrence Malick",
    genres: ["War", "Drama"],
    awards: ["Academy Award - Best Cinematography Nomination", "Golden Bear"],
    visualStyle: {
      cinematography: ["poetic war drama", "nature vs war", "philosophical themes"],
      colorPalette: ["natural colors", "war tones", "poetic contrast"],
      lighting: ["natural light", "war lighting", "poetic atmosphere"],
      composition: ["wide shots", "poetic framing", "war angles"],
      cameraTechniques: ["steady camera", "poetic movements", "war timing"],
      visualEffects: ["practical effects", "war atmosphere", "poetic mood"]
    },
    description: "Poetic war drama with nature vs war and philosophical themes",
    iconicScenes: ["Nature shots", "Battle scenes", "Philosophical voiceover"],
    influence: ["Poetic war drama", "Nature vs war", "Philosophical themes"]
  },
  {
    id: "paths-of-glory-1957",
    title: "Paths of Glory",
    year: 1957,
    director: "Stanley Kubrick",
    genres: ["War", "Drama"],
    awards: ["BAFTA - Best Film Nomination"],
    visualStyle: {
      cinematography: ["anti-war drama", "wwi trenches", "moral corruption"],
      colorPalette: ["black and white", "war tones", "moral contrast"],
      lighting: ["dramatic shadows", "war lighting", "moral atmosphere"],
      composition: ["wide shots", "moral framing", "war angles"],
      cameraTechniques: ["steady camera", "moral movements", "war timing"],
      visualEffects: ["practical effects", "war atmosphere", "moral mood"]
    },
    description: "Anti-war drama with WWI trenches and moral corruption",
    iconicScenes: ["Trench scenes", "Court martial", "Final execution"],
    influence: ["Anti-war drama", "WWI trenches", "Moral corruption"]
  },

  // FANTASY GENRE ADDITIONS
  {
    id: "the-wizard-of-oz-1939",
    title: "The Wizard of Oz",
    year: 1939,
    director: "Victor Fleming",
    genres: ["Fantasy", "Adventure", "Musical"],
    awards: ["Academy Award - Best Original Song", "National Film Registry"],
    visualStyle: {
      cinematography: ["classic fantasy", "technicolor", "musical numbers"],
      colorPalette: ["vibrant colors", "fantasy tones", "musical contrast"],
      lighting: ["studio lighting", "fantasy lighting", "musical atmosphere"],
      composition: ["wide shots", "musical framing", "fantasy angles"],
      cameraTechniques: ["steady camera", "musical movements", "fantasy timing"],
      visualEffects: ["practical effects", "fantasy atmosphere", "musical mood"]
    },
    description: "Classic fantasy with Technicolor and musical numbers",
    iconicScenes: ["Tornado", "Yellow brick road", "Emerald city"],
    influence: ["Classic fantasy", "Technicolor", "Musical numbers"]
  },
  {
    id: "the-lord-of-the-rings-2001",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
    director: "Peter Jackson",
    genres: ["Fantasy", "Adventure", "Drama"],
    awards: ["Academy Award - Best Cinematography", "Academy Award - Best Visual Effects"],
    visualStyle: {
      cinematography: ["epic fantasy", "middle-earth", "adventure scale"],
      colorPalette: ["natural colors", "fantasy tones", "epic contrast"],
      lighting: ["natural light", "fantasy lighting", "epic atmosphere"],
      composition: ["wide shots", "epic framing", "fantasy angles"],
      cameraTechniques: ["steady camera", "epic movements", "fantasy timing"],
      visualEffects: ["revolutionary effects", "fantasy atmosphere", "epic mood"]
    },
    description: "Epic fantasy with Middle-earth and adventure scale",
    iconicScenes: ["Shire scenes", "Moria sequence", "Breaking of the fellowship"],
    influence: ["Epic fantasy", "Middle-earth", "Adventure scale"]
  },
  {
    id: "pan's-labyrinth-2006",
    title: "Pan's Labyrinth",
    year: 2006,
    director: "Guillermo del Toro",
    genres: ["Fantasy", "Drama", "War"],
    awards: ["Academy Award - Best Cinematography", "Academy Award - Best Art Direction"],
    visualStyle: {
      cinematography: ["dark fantasy", "spanish civil war", "magical realism"],
      colorPalette: ["desaturated colors", "fantasy tones", "dark contrast"],
      lighting: ["dramatic shadows", "fantasy lighting", "dark atmosphere"],
      composition: ["wide shots", "dark framing", "fantasy angles"],
      cameraTechniques: ["steady camera", "dark movements", "fantasy timing"],
      visualEffects: ["practical effects", "fantasy atmosphere", "dark mood"]
    },
    description: "Dark fantasy with Spanish Civil War and magical realism",
    iconicScenes: ["Faun encounter", "Pale man", "Final sacrifice"],
    influence: ["Dark fantasy", "Spanish Civil War", "Magical realism"]
  },
  {
    id: "the-princess-bride-1987",
    title: "The Princess Bride",
    year: 1987,
    director: "Rob Reiner",
    genres: ["Fantasy", "Adventure", "Comedy"],
    awards: ["Academy Award - Best Original Song Nomination"],
    visualStyle: {
      cinematography: ["romantic fantasy", "adventure comedy", "storybook aesthetic"],
      colorPalette: ["vibrant colors", "fantasy tones", "romantic contrast"],
      lighting: ["natural light", "fantasy lighting", "romantic atmosphere"],
      composition: ["wide shots", "romantic framing", "fantasy angles"],
      cameraTechniques: ["steady camera", "romantic movements", "fantasy timing"],
      visualEffects: ["practical effects", "fantasy atmosphere", "romantic mood"]
    },
    description: "Romantic fantasy with adventure comedy and storybook aesthetic",
    iconicScenes: ["Inconceivable", "Battle of wits", "Final kiss"],
    influence: ["Romantic fantasy", "Adventure comedy", "Storybook aesthetic"]
  },
  {
    id: "spirited-away-2001",
    title: "Spirited Away",
    year: 2001,
    director: "Hayao Miyazaki",
    genres: ["Fantasy", "Animation", "Adventure"],
    awards: ["Academy Award - Best Animated Feature", "Golden Bear"],
    visualStyle: {
      cinematography: ["anime fantasy", "japanese mythology", "coming-of-age"],
      colorPalette: ["vibrant colors", "fantasy tones", "anime contrast"],
      lighting: ["natural light", "fantasy lighting", "anime atmosphere"],
      composition: ["wide shots", "anime framing", "fantasy angles"],
      cameraTechniques: ["steady camera", "anime movements", "fantasy timing"],
      visualEffects: ["hand-drawn animation", "fantasy atmosphere", "anime mood"]
    },
    description: "Anime fantasy with Japanese mythology and coming-of-age",
    iconicScenes: ["Bath house", "No-face", "Train journey"],
    influence: ["Anime fantasy", "Japanese mythology", "Coming-of-age"]
  },
  {
    id: "the-nightingale-2018",
    title: "The Nightingale",
    year: 2018,
    director: "Jennifer Kent",
    genres: ["Fantasy", "Drama", "Thriller"],
    awards: ["Venice Film Festival - Special Jury Prize"],
    visualStyle: {
      cinematography: ["dark fantasy", "colonial australia", "revenge themes"],
      colorPalette: ["desaturated colors", "fantasy tones", "dark contrast"],
      lighting: ["dramatic shadows", "fantasy lighting", "dark atmosphere"],
      composition: ["wide shots", "dark framing", "fantasy angles"],
      cameraTechniques: ["steady camera", "dark movements", "fantasy timing"],
      visualEffects: ["practical effects", "fantasy atmosphere", "dark mood"]
    },
    description: "Dark fantasy with colonial Australia and revenge themes",
    iconicScenes: ["Nightingale song", "Revenge journey", "Final confrontation"],
    influence: ["Dark fantasy", "Colonial Australia", "Revenge themes"]
  },

  // WESTERN GENRE ADDITIONS
  {
    id: "once-upon-a-time-in-the-west-1968",
    title: "Once Upon a Time in the West",
    year: 1968,
    director: "Sergio Leone",
    genres: ["Western", "Drama"],
    awards: ["National Film Registry"],
    visualStyle: {
      cinematography: ["epic western", "railroad themes", "mythic scale"],
      colorPalette: ["desaturated colors", "western tones", "epic contrast"],
      lighting: ["dramatic shadows", "western lighting", "epic atmosphere"],
      composition: ["wide shots", "epic framing", "western angles"],
      cameraTechniques: ["steady camera", "epic movements", "western timing"],
      visualEffects: ["practical effects", "western atmosphere", "epic mood"]
    },
    description: "Epic western with railroad themes and mythic scale",
    iconicScenes: ["Opening sequence", "Harmonica flashbacks", "Final duel"],
    influence: ["Epic western", "Railroad themes", "Mythic scale"]
  },
  {
    id: "unforgiven-1992",
    title: "Unforgiven",
    year: 1992,
    director: "Clint Eastwood",
    genres: ["Western", "Drama"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["revisionist western", "aging gunslinger", "moral complexity"],
      colorPalette: ["desaturated colors", "western tones", "moral contrast"],
      lighting: ["dramatic shadows", "western lighting", "moral atmosphere"],
      composition: ["wide shots", "moral framing", "western angles"],
      cameraTechniques: ["steady camera", "moral movements", "western timing"],
      visualEffects: ["practical effects", "western atmosphere", "moral mood"]
    },
    description: "Revisionist western with aging gunslinger and moral complexity",
    iconicScenes: ["Munny's return", "Bar scene", "Final shootout"],
    influence: ["Revisionist western", "Aging gunslinger", "Moral complexity"]
  },
  {
    id: "true-grit-2010",
    title: "True Grit",
    year: 2010,
    director: "Joel Coen",
    genres: ["Western", "Drama", "Adventure"],
    awards: ["Academy Award - Best Actor Nomination", "Academy Award - Best Supporting Actress Nomination"],
    visualStyle: {
      cinematography: ["classic western", "coming-of-age", "revenge themes"],
      colorPalette: ["desaturated colors", "western tones", "classic contrast"],
      lighting: ["natural light", "western lighting", "classic atmosphere"],
      composition: ["wide shots", "classic framing", "western angles"],
      cameraTechniques: ["steady camera", "classic movements", "western timing"],
      visualEffects: ["practical effects", "western atmosphere", "classic mood"]
    },
    description: "Classic western with coming-of-age and revenge themes",
    iconicScenes: ["Mattie's introduction", "Snake pit", "Final confrontation"],
    influence: ["Classic western", "Coming-of-age", "Revenge themes"]
  },

  // BIOGRAPHY GENRE ADDITIONS
  {
    id: "lawrence-of-arabia-1962",
    title: "Lawrence of Arabia",
    year: 1962,
    director: "David Lean",
    genres: ["Biography", "Drama", "War"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["epic biography", "desert landscapes", "historical scale"],
      colorPalette: ["desert colors", "biography tones", "epic contrast"],
      lighting: ["natural light", "desert lighting", "epic atmosphere"],
      composition: ["wide shots", "epic framing", "biography angles"],
      cameraTechniques: ["steady camera", "epic movements", "biography timing"],
      visualEffects: ["practical effects", "desert atmosphere", "epic mood"]
    },
    description: "Epic biography with desert landscapes and historical scale",
    iconicScenes: ["Desert crossing", "Aqaba attack", "Train derailment"],
    influence: ["Epic biography", "Desert landscapes", "Historical scale"]
  },
  {
    id: "gandhi-1982",
    title: "Gandhi",
    year: 1982,
    director: "Richard Attenborough",
    genres: ["Biography", "Drama", "History"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Actor"],
    visualStyle: {
      cinematography: ["epic biography", "indian independence", "historical drama"],
      colorPalette: ["natural colors", "biography tones", "epic contrast"],
      lighting: ["natural light", "biography lighting", "epic atmosphere"],
      composition: ["wide shots", "epic framing", "biography angles"],
      cameraTechniques: ["steady camera", "epic movements", "biography timing"],
      visualEffects: ["practical effects", "biography atmosphere", "epic mood"]
    },
    description: "Epic biography with Indian independence and historical drama",
    iconicScenes: ["Salt march", "Funeral scene", "Independence speech"],
    influence: ["Epic biography", "Indian independence", "Historical drama"]
  },
  {
    id: "the-aviator-2004",
    title: "The Aviator",
    year: 2004,
    director: "Martin Scorsese",
    genres: ["Biography", "Drama"],
    awards: ["Academy Award - Best Supporting Actress", "Academy Award - Best Cinematography"],
    visualStyle: {
      cinematography: ["period biography", "aviation history", "psychological drama"],
      colorPalette: ["period colors", "biography tones", "psychological contrast"],
      lighting: ["period lighting", "biography lighting", "psychological atmosphere"],
      composition: ["wide shots", "psychological framing", "biography angles"],
      cameraTechniques: ["steady camera", "psychological movements", "biography timing"],
      visualEffects: ["practical effects", "biography atmosphere", "psychological mood"]
    },
    description: "Period biography with aviation history and psychological drama",
    iconicScenes: ["Flight sequences", "Mental breakdown", "Final flight"],
    influence: ["Period biography", "Aviation history", "Psychological drama"]
  },

  // HORROR GENRE ADDITIONS
  {
    id: "the-shining-1980",
    title: "The Shining",
    year: 1980,
    director: "Stanley Kubrick",
    genres: ["Horror", "Drama", "Thriller"],
    awards: ["Academy Award - Best Cinematography Nomination"],
    visualStyle: {
      cinematography: ["psychological horror", "hotel atmosphere", "isolation themes"],
      colorPalette: ["cool colors", "horror tones", "psychological contrast"],
      lighting: ["dramatic shadows", "horror lighting", "psychological atmosphere"],
      composition: ["wide shots", "psychological framing", "horror angles"],
      cameraTechniques: ["steady camera", "psychological movements", "horror timing"],
      visualEffects: ["practical effects", "horror atmosphere", "psychological mood"]
    },
    description: "Psychological horror with hotel atmosphere and isolation themes",
    iconicScenes: ["Here's Johnny", "Maze chase", "Blood elevator"],
    influence: ["Psychological horror", "Hotel atmosphere", "Isolation themes"]
  },
  {
    id: "the-exorcist-1973",
    title: "The Exorcist",
    year: 1973,
    director: "William Friedkin",
    genres: ["Horror", "Drama"],
    awards: ["Academy Award - Best Adapted Screenplay", "Academy Award - Best Sound"],
    visualStyle: {
      cinematography: ["supernatural horror", "religious themes", "possession drama"],
      colorPalette: ["desaturated colors", "horror tones", "religious contrast"],
      lighting: ["dramatic shadows", "horror lighting", "religious atmosphere"],
      composition: ["close-up shots", "religious framing", "horror angles"],
      cameraTechniques: ["steady camera", "religious movements", "horror timing"],
      visualEffects: ["practical effects", "horror atmosphere", "religious mood"]
    },
    description: "Supernatural horror with religious themes and possession drama",
    iconicScenes: ["Exorcism scene", "Staircase fall", "Head rotation"],
    influence: ["Supernatural horror", "Religious themes", "Possession drama"]
  },
  {
    id: "halloween-1978",
    title: "Halloween",
    year: 1978,
    director: "John Carpenter",
    genres: ["Horror", "Thriller"],
    awards: ["National Film Registry"],
    visualStyle: {
      cinematography: ["slasher horror", "suburban terror", "stalking atmosphere"],
      colorPalette: ["desaturated colors", "horror tones", "slasher contrast"],
      lighting: ["dramatic shadows", "horror lighting", "slasher atmosphere"],
      composition: ["point of view shots", "slasher framing", "horror angles"],
      cameraTechniques: ["steady camera", "slasher movements", "horror timing"],
      visualEffects: ["practical effects", "horror atmosphere", "slasher mood"]
    },
    description: "Slasher horror with suburban terror and stalking atmosphere",
    iconicScenes: ["Opening kill", "Stalking sequences", "Final chase"],
    influence: ["Slasher horror", "Suburban terror", "Stalking atmosphere"]
  },

  // HISTORY GENRE ADDITIONS
  {
    id: "schindler's-list-1993",
    title: "Schindler's List",
    year: 1993,
    director: "Steven Spielberg",
    genres: ["History", "Drama", "War"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["historical drama", "holocaust themes", "black and white"],
      colorPalette: ["black and white", "historical tones", "dramatic contrast"],
      lighting: ["dramatic shadows", "historical lighting", "dramatic atmosphere"],
      composition: ["wide shots", "dramatic framing", "historical angles"],
      cameraTechniques: ["steady camera", "dramatic movements", "historical timing"],
      visualEffects: ["practical effects", "historical atmosphere", "dramatic mood"]
    },
    description: "Historical drama with Holocaust themes and black and white cinematography",
    iconicScenes: ["Red coat girl", "List creation", "Final scene"],
    influence: ["Historical drama", "Holocaust themes", "Black and white cinematography"]
  },
  {
    id: "glory-1989",
    title: "Glory",
    year: 1989,
    director: "Edward Zwick",
    genres: ["History", "Drama", "War"],
    awards: ["Academy Award - Best Supporting Actor", "Academy Award - Best Cinematography"],
    visualStyle: {
      cinematography: ["civil war drama", "racial themes", "historical accuracy"],
      colorPalette: ["desaturated colors", "historical tones", "civil war contrast"],
      lighting: ["natural light", "historical lighting", "civil war atmosphere"],
      composition: ["wide shots", "civil war framing", "historical angles"],
      cameraTechniques: ["steady camera", "civil war movements", "historical timing"],
      visualEffects: ["practical effects", "historical atmosphere", "civil war mood"]
    },
    description: "Civil War drama with racial themes and historical accuracy",
    iconicScenes: ["Training sequences", "Battle scenes", "Final charge"],
    influence: ["Civil War drama", "Racial themes", "Historical accuracy"]
  },

  // DISASTER GENRE ADDITIONS

  // SPORT GENRE ADDITIONS
  {
    id: "rocky-1976",
    title: "Rocky",
    year: 1976,
    director: "John G. Avildsen",
    genres: ["Sport", "Drama"],
    awards: ["Academy Award - Best Picture", "Academy Award - Best Director"],
    visualStyle: {
      cinematography: ["underdog drama", "boxing sequences", "philadelphia setting"],
      colorPalette: ["desaturated colors", "sport tones", "underdog contrast"],
      lighting: ["natural light", "sport lighting", "underdog atmosphere"],
      composition: ["close-up shots", "underdog framing", "sport angles"],
      cameraTechniques: ["handheld camera", "underdog movements", "sport timing"],
      visualEffects: ["practical effects", "sport atmosphere", "underdog mood"]
    },
    description: "Underdog drama with boxing sequences and Philadelphia setting",
    iconicScenes: ["Training montage", "Stairs run", "Final fight"],
    influence: ["Underdog drama", "Boxing sequences", "Philadelphia setting"]
  }
];

// Helper functions for movie filtering and search
export const getMoviesByDirector = (directorName: string): Movie[] => {
  return MOVIES_DATABASE.filter(movie => movie.director === directorName);
};

export const getMoviesByGenre = (genre: string): Movie[] => {
  return MOVIES_DATABASE.filter(movie => movie.genres.includes(genre));
};

export const getMoviesByYear = (startYear: number, endYear: number): Movie[] => {
  return MOVIES_DATABASE.filter(movie => movie.year >= startYear && movie.year <= endYear);
};

export const getMoviesByAward = (award: string): Movie[] => {
  return MOVIES_DATABASE.filter(movie => 
    movie.awards.some(awardName => 
      awardName.toLowerCase().includes(award.toLowerCase())
    )
  );
};

export const getMoviesByVisualStyle = (styleKeyword: string): Movie[] => {
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
};

export const getAllGenres = (): string[] => {
  const allGenres = new Set<string>();
  MOVIES_DATABASE.forEach(movie => {
    movie.genres.forEach(genre => allGenres.add(genre));
  });
  return Array.from(allGenres).sort();
};

export const getAllAwards = (): string[] => {
  const allAwards = new Set<string>();
  MOVIES_DATABASE.forEach(movie => {
    movie.awards.forEach(award => allAwards.add(award));
  });
  return Array.from(allAwards).sort();
};

export const getAllVisualStyles = (): string[] => {
  const allStyles = new Set<string>();
  MOVIES_DATABASE.forEach(movie => {
    movie.visualStyle.cinematography.forEach(style => allStyles.add(style));
    movie.visualStyle.colorPalette.forEach(color => allStyles.add(color));
    movie.visualStyle.lighting.forEach(light => allStyles.add(light));
  });
  return Array.from(allStyles).sort();
};
