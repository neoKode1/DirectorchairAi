/**
 * Prompt optimization system to automatically replace problematic words
 * with safer alternatives to avoid content policy violations
 */

export interface PromptOptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  changes: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
  wasOptimized: boolean;
}

// Comprehensive mapping of problematic terms to safer alternatives
const CONTENT_POLICY_REPLACEMENTS: Record<string, { replacement: string; reason: string }> = {
  // Environmental danger/neglect terms
  'abandoned': { replacement: 'unused', reason: 'Avoids negative connotations of neglect' },
  'deserted': { replacement: 'empty', reason: 'Neutral description of space' },
  'derelict': { replacement: 'old', reason: 'Less negative aging descriptor' },
  'ruined': { replacement: 'weathered', reason: 'Natural aging vs destruction' },
  'destroyed': { replacement: 'damaged', reason: 'Less severe damage description' },
  'broken': { replacement: 'worn', reason: 'Natural wear vs breakage' },
  'crumbling': { replacement: 'aged', reason: 'Natural aging process' },
  'collapsed': { replacement: 'low', reason: 'Structural state without danger' },
  
  // Safety/threat terms
  'dangerous': { replacement: 'challenging', reason: 'Difficulty without danger' },
  'threatening': { replacement: 'intense', reason: 'Strong emotion without threat' },
  'menacing': { replacement: 'dramatic', reason: 'Theatrical intensity' },
  'hostile': { replacement: 'unfriendly', reason: 'Mild social tension' },
  'violent': { replacement: 'dynamic', reason: 'Movement without violence' },
  'aggressive': { replacement: 'energetic', reason: 'High energy without aggression' },
  
  // Isolation/vulnerability terms
  'isolated': { replacement: 'remote', reason: 'Distance without isolation' },
  'vulnerable': { replacement: 'gentle', reason: 'Softness without vulnerability' },
  'exposed': { replacement: 'open', reason: 'Visibility without exposure' },
  'defenseless': { replacement: 'peaceful', reason: 'Calm without defenselessness' },
  
  // Atmospheric danger terms
  'ominous': { replacement: 'mysterious', reason: 'Intrigue without foreboding' },
  'sinister': { replacement: 'shadowy', reason: 'Darkness without evil' },
  'haunted': { replacement: 'atmospheric', reason: 'Mood without supernatural' },
  'cursed': { replacement: 'ancient', reason: 'Age without curse' },
  'forbidden': { replacement: 'restricted', reason: 'Limited access without taboo' },
  
  // Physical danger terms
  'sharp': { replacement: 'defined', reason: 'Clarity without sharpness' },
  'pointed': { replacement: 'angular', reason: 'Shape without point' },
  'blade': { replacement: 'edge', reason: 'Boundary without weapon' },
  'weapon': { replacement: 'tool', reason: 'Object without weapon context' },
  'knife': { replacement: 'implement', reason: 'Tool without weapon' },
  'gun': { replacement: 'device', reason: 'Object without weapon' },
  
  // Emotional distress terms
  'terrified': { replacement: 'surprised', reason: 'Reaction without terror' },
  'frightened': { replacement: 'startled', reason: 'Mild surprise' },
  'scared': { replacement: 'concerned', reason: 'Worry without fear' },
  'panicked': { replacement: 'hurried', reason: 'Speed without panic' },
  'distressed': { replacement: 'troubled', reason: 'Mild concern' },
  
  // Death/decay terms
  'dead': { replacement: 'still', reason: 'Motionless without death' },
  'dying': { replacement: 'fading', reason: 'Diminishing without death' },
  'corpse': { replacement: 'figure', reason: 'Form without death' },
  'grave': { replacement: 'resting place', reason: 'Location without death' },
  'tomb': { replacement: 'chamber', reason: 'Space without death' },
  
  // Blood/violence terms
  'blood': { replacement: 'liquid', reason: 'Substance without blood' },
  'bloody': { replacement: 'stained', reason: 'Marked without blood' },
  'gore': { replacement: 'detail', reason: 'Specificity without gore' },
  'wound': { replacement: 'mark', reason: 'Indication without injury' },
  'injury': { replacement: 'condition', reason: 'State without injury' },
  
  // Negative emotional states
  'angry': { replacement: 'determined', reason: 'Strong emotion without anger' },
  'furious': { replacement: 'passionate', reason: 'Intensity without fury' },
  'hate': { replacement: 'dislike', reason: 'Preference without hate' },
  'rage': { replacement: 'intensity', reason: 'Strength without rage' },
  'wrath': { replacement: 'power', reason: 'Force without wrath' },
  
  // Substance abuse terms
  'drunk': { replacement: 'tired', reason: 'State without intoxication' },
  'intoxicated': { replacement: 'dizzy', reason: 'Sensation without intoxication' },
  'high': { replacement: 'elevated', reason: 'State without drugs' },
  'stoned': { replacement: 'relaxed', reason: 'State without drugs' },
  
  // Adult content terms
  'nude': { replacement: 'unclothed', reason: 'State without explicit content' },
  'naked': { replacement: 'bare', reason: 'Exposed without explicit content' },
  'sexual': { replacement: 'intimate', reason: 'Close without sexual content' },
  'erotic': { replacement: 'sensual', reason: 'Sensory without erotic content' },
  
  // Crime/illegal terms
  'stolen': { replacement: 'found', reason: 'Acquisition without theft' },
  'illegal': { replacement: 'unusual', reason: 'Uncommon without illegality' },
  'criminal': { replacement: 'mysterious', reason: 'Unknown without crime' },
  'thief': { replacement: 'figure', reason: 'Person without crime' },
  'robber': { replacement: 'visitor', reason: 'Person without crime' },
  
  // War/military terms
  'war': { replacement: 'conflict', reason: 'Disagreement without war' },
  'battle': { replacement: 'contest', reason: 'Competition without battle' },
  'soldier': { replacement: 'guardian', reason: 'Protector without military' },
  'army': { replacement: 'group', reason: 'Collection without military' },
  
  // Religious/supernatural terms that might be problematic
  'demon': { replacement: 'creature', reason: 'Being without demonic' },
  'devil': { replacement: 'figure', reason: 'Entity without devil' },
  'satan': { replacement: 'entity', reason: 'Being without satanic' },
  'hell': { replacement: 'realm', reason: 'Place without hell' },
  'damned': { replacement: 'cursed', reason: 'State without damnation' },
};

// Additional patterns for more complex replacements
const PATTERN_REPLACEMENTS: Array<{
  pattern: RegExp;
  replacement: string;
  reason: string;
}> = [
  {
    pattern: /\b(very\s+)?dark\b/gi,
    replacement: 'dimly lit',
    reason: 'Atmospheric lighting without darkness'
  },
  {
    pattern: /\b(very\s+)?bright\b/gi,
    replacement: 'well lit',
    reason: 'Good lighting without intensity'
  },
  {
    pattern: /\b(completely\s+)?empty\b/gi,
    replacement: 'spacious',
    reason: 'Positive space description'
  },
  {
    pattern: /\b(completely\s+)?silent\b/gi,
    replacement: 'quiet',
    reason: 'Peaceful without complete silence'
  },
  {
    pattern: /\b(extremely\s+)?cold\b/gi,
    replacement: 'cool',
    reason: 'Temperature without extreme cold'
  },
  {
    pattern: /\b(extremely\s+)?hot\b/gi,
    replacement: 'warm',
    reason: 'Temperature without extreme heat'
  }
];

/**
 * Optimize a prompt by replacing problematic terms with safer alternatives
 */
export function optimizePrompt(prompt: string): PromptOptimizationResult {
  const changes: Array<{ original: string; replacement: string; reason: string }> = [];
  let optimizedPrompt = prompt;

  // First, handle word-level replacements
  for (const [problematic, { replacement, reason }] of Object.entries(CONTENT_POLICY_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${problematic}\\b`, 'gi');
    if (regex.test(optimizedPrompt)) {
      optimizedPrompt = optimizedPrompt.replace(regex, replacement);
      changes.push({
        original: problematic,
        replacement,
        reason
      });
    }
  }

  // Then, handle pattern-based replacements
  for (const { pattern, replacement, reason } of PATTERN_REPLACEMENTS) {
    if (pattern.test(optimizedPrompt)) {
      const originalMatch = optimizedPrompt.match(pattern)?.[0];
      if (originalMatch) {
        optimizedPrompt = optimizedPrompt.replace(pattern, replacement);
        changes.push({
          original: originalMatch,
          replacement,
          reason
        });
      }
    }
  }

  return {
    originalPrompt: prompt,
    optimizedPrompt,
    changes,
    wasOptimized: changes.length > 0
  };
}

/**
 * Get suggestions for improving a prompt based on common content policy issues
 */
export function getPromptSuggestions(prompt: string): string[] {
  const suggestions: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Check for common problematic patterns
  if (lowerPrompt.includes('abandoned') || lowerPrompt.includes('deserted')) {
    suggestions.push('Consider using "unused" or "empty" instead of "abandoned" or "deserted"');
  }

  if (lowerPrompt.includes('dark') && !lowerPrompt.includes('dimly lit')) {
    suggestions.push('Try "dimly lit" instead of "dark" for better atmospheric lighting');
  }

  if (lowerPrompt.includes('alone') && (lowerPrompt.includes('dangerous') || lowerPrompt.includes('threatening'))) {
    suggestions.push('Remove danger-related words when describing solitude');
  }

  if (lowerPrompt.includes('weapon') || lowerPrompt.includes('knife') || lowerPrompt.includes('gun')) {
    suggestions.push('Replace weapon terms with "tool" or "object" for safer content');
  }

  if (lowerPrompt.includes('blood') || lowerPrompt.includes('violence')) {
    suggestions.push('Avoid blood and violence terms - use "liquid" or "dynamic" instead');
  }

  if (lowerPrompt.includes('dead') || lowerPrompt.includes('dying')) {
    suggestions.push('Use "still" or "fading" instead of death-related terms');
  }

  return suggestions;
}

/**
 * Check if a prompt is likely to be rejected by content policies
 */
export function isPromptLikelyRejected(prompt: string): {
  isLikelyRejected: boolean;
  reasons: string[];
  confidence: number;
} {
  const reasons: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  let confidence = 0;

  // Check for high-risk terms
  const highRiskTerms = ['abandoned', 'deserted', 'dangerous', 'threatening', 'violent', 'blood', 'dead', 'weapon'];
  for (const term of highRiskTerms) {
    if (lowerPrompt.includes(term)) {
      reasons.push(`Contains high-risk term: "${term}"`);
      confidence += 0.3;
    }
  }

  // Check for medium-risk terms
  const mediumRiskTerms = ['dark', 'empty', 'alone', 'isolated', 'broken', 'ruined'];
  for (const term of mediumRiskTerms) {
    if (lowerPrompt.includes(term)) {
      reasons.push(`Contains medium-risk term: "${term}"`);
      confidence += 0.2;
    }
  }

  // Check for combinations that increase risk
  if (lowerPrompt.includes('alone') && (lowerPrompt.includes('dark') || lowerPrompt.includes('empty'))) {
    reasons.push('Combination of solitude with potentially unsafe environment');
    confidence += 0.2;
  }

  if (lowerPrompt.includes('abandoned') && lowerPrompt.includes('station')) {
    reasons.push('Abandoned public spaces often trigger content policies');
    confidence += 0.3;
  }

  return {
    isLikelyRejected: confidence > 0.3,
    reasons,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * Format the optimization result for logging
 */
export function formatOptimizationResult(result: PromptOptimizationResult): string {
  if (!result.wasOptimized) {
    return 'No optimization needed - prompt appears safe';
  }

  const changesList = result.changes
    .map(change => `  • "${change.original}" → "${change.replacement}" (${change.reason})`)
    .join('\n');

  return `Prompt optimized with ${result.changes.length} changes:\n${changesList}`;
}
