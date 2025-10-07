// Sora 2 specific content filtering based on OpenAI's content policies
// Reference: https://openai.com/index/sora-system-card/

export interface ContentFilterResult {
  isSafe: boolean;
  filteredPrompt: string;
  violations: string[];
  suggestions: string[];
}

export interface Sora2ContentPolicy {
  category: string;
  description: string;
  examples: string[];
  replacements: string[];
}

// Sora 2 specific content policies based on OpenAI's guidelines
const SORA2_CONTENT_POLICIES: Sora2ContentPolicy[] = [
  {
    category: "Violence and Harm",
    description: "Content depicting violence, harm, or dangerous activities",
    examples: ["violence", "harm", "weapon", "fight", "attack", "hurt", "injure", "kill", "murder", "death", "blood", "gore"],
    replacements: ["dramatic action", "intense scene", "dynamic movement", "energetic activity", "powerful moment"]
  },
  {
    category: "Hate Speech and Discrimination",
    description: "Content promoting hate, discrimination, or harassment",
    examples: ["hate", "discrimination", "harassment", "offensive", "insulting", "derogatory", "racist", "sexist"],
    replacements: ["inclusive", "respectful", "positive", "uplifting", "inspiring"]
  },
  {
    category: "Adult Content",
    description: "Sexually explicit or adult-oriented content",
    examples: ["sexual", "explicit", "adult", "nude", "naked", "pornographic", "erotic", "intimate"],
    replacements: ["artistic", "elegant", "sophisticated", "refined", "beautiful"]
  },
  {
    category: "Illegal Activities",
    description: "Content depicting or promoting illegal activities",
    examples: ["illegal", "criminal", "theft", "fraud", "drug", "alcohol abuse", "vandalism"],
    replacements: ["creative", "innovative", "artistic", "constructive", "positive"]
  },
  {
    category: "Misinformation",
    description: "Content that could spread false information or conspiracy theories",
    examples: ["conspiracy", "misinformation", "false", "fake", "hoax", "deception"],
    replacements: ["educational", "informative", "factual", "accurate", "truthful"]
  },
  {
    category: "Copyright and IP",
    description: "Content that may infringe on copyright or intellectual property",
    examples: ["copyright", "trademark", "brand", "logo", "character from", "movie", "tv show", "book"],
    replacements: ["original", "unique", "creative", "inspired", "artistic"]
  },
  {
    category: "Sensitive Topics",
    description: "Content about sensitive political, religious, or social topics",
    examples: ["political", "religious", "controversial", "sensitive", "divisive", "polarizing"],
    replacements: ["universal", "inclusive", "positive", "uplifting", "inspiring"]
  }
];

// Enhanced content filtering specifically for Sora 2
export function filterSora2Content(prompt: string): ContentFilterResult {
  const lowerPrompt = prompt.toLowerCase();
  const violations: string[] = [];
  const suggestions: string[] = [];
  let filteredPrompt = prompt;

  // Check each content policy category
  for (const policy of SORA2_CONTENT_POLICIES) {
    for (const example of policy.examples) {
      if (lowerPrompt.includes(example.toLowerCase())) {
        violations.push(`${policy.category}: "${example}"`);
        
        // Replace with a safe alternative
        const replacement = policy.replacements[Math.floor(Math.random() * policy.replacements.length)];
        const regex = new RegExp(`\\b${example}\\b`, 'gi');
        filteredPrompt = filteredPrompt.replace(regex, replacement);
        
        suggestions.push(`Consider using "${replacement}" instead of "${example}"`);
      }
    }
  }

    // Additional pattern-based filtering for edge cases (more conservative)
    const patternFilters = [
      {
        pattern: /\b(gun|weapon|rifle|pistol|shotgun|knife|sword|axe|blade|dagger|bomb|explosive)\b/gi,
        replacement: 'prop',
        reason: 'Weapon content'
      },
      {
        pattern: /\b(blood|gore|violence|murder|kill|death|slaughter|massacre|carnage|torture)\b/gi,
        replacement: 'dramatic scene',
        reason: 'Violence content'
      },
      {
        pattern: /\b(drug|alcohol|drunk|high|intoxicated|addiction|overdose)\b/gi,
        replacement: 'dramatic moment',
        reason: 'Substance content'
      },
      {
        pattern: /\b(nude|naked|sex|sexual|pornographic|explicit|intimate|erotic)\b/gi,
        replacement: 'artistic scene',
        reason: 'Adult content'
      },
      {
        pattern: /\b(hate|discrimination|racist|sexist|homophobic|transphobic|offensive)\b/gi,
        replacement: 'inclusive',
        reason: 'Hate speech'
      }
    ];

  for (const filter of patternFilters) {
    if (filter.pattern.test(filteredPrompt)) {
      const originalText = filteredPrompt;
      filteredPrompt = filteredPrompt.replace(filter.pattern, filter.replacement);
      if (originalText !== filteredPrompt) {
        violations.push(filter.reason);
        suggestions.push(`Content filtered: ${filter.reason}`);
      }
    }
  }

  // Check for potential copyright issues
  const copyrightPatterns = [
    /\b(disney|marvel|dc|star wars|harry potter|lord of the rings|game of thrones|breaking bad|friends|seinfeld)\b/gi,
    /\b(mickey mouse|batman|superman|spiderman|iron man|captain america|wonder woman)\b/gi,
    /\b(character from|scene from|movie|tv show|book|comic|anime|manga)\b/gi
  ];

  for (const pattern of copyrightPatterns) {
    if (pattern.test(filteredPrompt)) {
      violations.push('Potential copyright infringement');
      suggestions.push('Avoid referencing specific characters, movies, or shows. Use original concepts instead.');
      filteredPrompt = filteredPrompt.replace(pattern, 'original character');
    }
  }

  // Check prompt length (Sora 2 has character limits)
  if (filteredPrompt.length > 1000) {
    violations.push('Prompt too long');
    suggestions.push('Shorten your prompt to under 1000 characters for better results');
    filteredPrompt = filteredPrompt.substring(0, 1000) + '...';
  }

  const isSafe = violations.length === 0;

  return {
    isSafe,
    filteredPrompt,
    violations,
    suggestions
  };
}

// Generate safe alternative prompts for common scenarios
export function generateSafeSora2Prompt(originalPrompt: string): string[] {
  const alternatives: string[] = [];
  
  // Common safe prompt templates
  const safeTemplates = [
    "A person walking through a beautiful landscape, with natural lighting and peaceful atmosphere",
    "Someone enjoying a hobby or activity in a well-lit, positive environment",
    "A character in a clean, modern setting with bright, natural lighting",
    "An individual performing a creative or artistic activity in a safe environment",
    "A person interacting with nature in a peaceful, scenic location",
    "Someone engaged in a positive social activity with friends or family",
    "A character exploring a beautiful, well-lit indoor or outdoor space",
    "An individual participating in a healthy, constructive activity"
  ];

  // If the original prompt is about a person, try to maintain that context
  if (originalPrompt.toLowerCase().includes('person') || originalPrompt.toLowerCase().includes('character')) {
    alternatives.push("A person in a beautiful, well-lit environment, with natural movement and positive energy");
  }

  // If it's about an object or scene, provide safe alternatives
  if (originalPrompt.toLowerCase().includes('object') || originalPrompt.toLowerCase().includes('scene')) {
    alternatives.push("A beautiful, well-lit scene with natural elements and positive atmosphere");
  }

  // Add some generic safe alternatives
  alternatives.push(...safeTemplates.slice(0, 3));

  return alternatives;
}

// Validate image content for Sora 2 (basic checks)
export function validateImageForSora2(imageUrl: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check if image URL is valid
  if (!imageUrl || imageUrl.trim() === '') {
    issues.push('No image provided');
    return { isValid: false, issues };
  }

  // Check for common problematic image sources
  const problematicDomains = ['adult', 'nsfw', 'explicit', 'violent', 'gore'];
  const lowerUrl = imageUrl.toLowerCase();
  
  for (const domain of problematicDomains) {
    if (lowerUrl.includes(domain)) {
      issues.push(`Image source may contain inappropriate content: ${domain}`);
    }
  }

  // Check image format
  const validFormats = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidFormat = validFormats.some(format => lowerUrl.includes(format));
  
  if (!hasValidFormat) {
    issues.push('Image format may not be supported. Use JPG, PNG, or WebP formats.');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// Get content policy guidance for users
export function getSora2ContentGuidance(): string {
  return `
Sora 2 Content Guidelines:

✅ SAFE CONTENT:
- People in everyday activities (walking, talking, working, playing)
- Nature scenes (landscapes, animals, weather)
- Creative activities (art, music, cooking, sports)
- Positive social interactions
- Educational or informative content
- Original characters and concepts

❌ AVOID:
- Violence, weapons, or dangerous activities
- Adult or sexual content
- Hate speech or discrimination
- Copyrighted characters or brands
- Illegal activities
- Misinformation or conspiracy theories
- Sensitive political or religious topics

💡 TIPS:
- Keep prompts under 1000 characters
- Use positive, descriptive language
- Focus on natural movements and expressions
- Avoid referencing specific movies, shows, or characters
- Use original concepts and ideas
  `.trim();
}
