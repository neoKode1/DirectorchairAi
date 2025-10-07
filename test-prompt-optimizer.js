#!/usr/bin/env node

/**
 * Test script to demonstrate the prompt optimizer functionality
 */

// Import the optimizer (this would be done differently in a real Node.js environment)
// For now, we'll simulate the functionality

const testPrompts = [
  "A close-up of the character's face only as they exit the subway train into the abandoned subway station.",
  "A dark and dangerous alley with broken windows and abandoned buildings.",
  "A violent scene with blood and weapons in a deserted area.",
  "A peaceful landscape with beautiful flowers and bright sunshine.",
  "A mysterious figure in a haunted house with ominous shadows.",
  "A soldier with a weapon in a war zone.",
  "A nude figure in an erotic pose.",
  "A drunk person stumbling down the street.",
  "A dead body in a graveyard with blood everywhere."
];

// Simulate the optimization function
function optimizePrompt(prompt) {
  const replacements = {
    'abandoned': 'unused',
    'deserted': 'empty', 
    'dark': 'dimly lit',
    'dangerous': 'challenging',
    'broken': 'worn',
    'violent': 'dynamic',
    'blood': 'liquid',
    'weapon': 'tool',
    'soldier': 'guardian',
    'nude': 'unclothed',
    'erotic': 'sensual',
    'drunk': 'tired',
    'dead': 'still',
    'bloody': 'stained',
    'haunted': 'atmospheric',
    'ominous': 'mysterious'
  };

  let optimized = prompt;
  const changes = [];

  for (const [original, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    if (regex.test(optimized)) {
      optimized = optimized.replace(regex, replacement);
      changes.push({ original, replacement });
    }
  }

  return {
    originalPrompt: prompt,
    optimizedPrompt: optimized,
    changes,
    wasOptimized: changes.length > 0
  };
}

console.log('🧪 Testing Prompt Optimizer');
console.log('============================\n');

testPrompts.forEach((prompt, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`Original:  "${prompt}"`);
  
  const result = optimizePrompt(prompt);
  
  if (result.wasOptimized) {
    console.log(`Optimized: "${result.optimizedPrompt}"`);
    console.log(`Changes:   ${result.changes.map(c => `"${c.original}" → "${c.replacement}"`).join(', ')}`);
  } else {
    console.log(`Optimized: No changes needed (prompt appears safe)`);
  }
  
  console.log('---\n');
});

console.log('✅ Prompt optimization test completed!');
console.log('\n💡 Key insights:');
console.log('- "abandoned" → "unused" (avoids negative connotations)');
console.log('- "dark" → "dimly lit" (atmospheric without danger)');
console.log('- "dangerous" → "challenging" (difficulty without threat)');
console.log('- "violent" → "dynamic" (movement without violence)');
console.log('- "weapon" → "tool" (object without weapon context)');
console.log('- "soldier" → "guardian" (protector without military)');
