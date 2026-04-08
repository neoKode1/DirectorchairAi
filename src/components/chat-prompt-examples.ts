/**
 * Per-model prompt examples that cycle in the chat input placeholder.
 * Helps users understand what kind of prompts work best for each model.
 */

export const MODEL_PROMPT_EXAMPLES: Record<string, string[]> = {
  // ── I2V models ──
  'sora-2/image-to-video': [
    'e.g. "Slow dolly-in on the subject, soft bokeh background gently shifts"',
    'e.g. "Camera pans right revealing a vast ocean, waves crash dramatically"',
    'e.g. "Subject turns toward camera and smiles, warm golden hour light"',
  ],
  'sora-2/video-to-video/remix': [
    'e.g. "Transform this into a Studio Ghibli anime style"',
    'e.g. "Restyle as a noir detective film, black and white, high contrast"',
    'e.g. "Make it look like a watercolor painting in motion"',
  ],
  'veo3.1': [
    'e.g. "Cinematic tracking shot through a neon-lit Tokyo alley at night"',
    'e.g. "Slow-motion close-up of raindrops hitting a window, ASMR audio"',
    'e.g. "Drone shot ascending over a misty mountain range at sunrise"',
  ],
  'first-last-frame': [
    'e.g. "Smooth transition from dawn to sunset over a cityscape"',
    'e.g. "Character walks from frame 1 position to frame 2 position"',
  ],
  'imagen4': [
    'e.g. "A photorealistic portrait of a woman in Renaissance attire, oil painting style"',
    'e.g. "Isometric 3D render of a cozy coffee shop, warm lighting, detailed interior"',
    'e.g. "Product photography of a luxury watch on black marble, studio lighting"',
  ],
  'kling-video/v3': [
    'e.g. "Subject walks forward confidently, camera tracks alongside, cinematic depth"',
    'e.g. "Dramatic zoom into subject\'s eyes, shallow DOF, emotional close-up"',
    'e.g. "Wide establishing shot, subject in center, wind blows through hair"',
  ],
  'kling-video/o3': [
    'e.g. "Subject walks forward confidently, camera tracks alongside, cinematic depth"',
    'e.g. "Dramatic zoom into subject\'s eyes, shallow DOF, emotional close-up"',
  ],
  'kling-video/v2.6/pro/image-to-video': [
    'e.g. "Subject speaks: \\"Welcome to the future\\" — dramatic pause, eye contact"',
    'e.g. "Gentle head turn, soft smile, natural hair movement, studio lighting"',
  ],
  'video-to-video/edit': [
    'e.g. "Transform @Element1 into a cyberpunk character with neon accents"',
    'e.g. "Change the background to a snowy mountain landscape, keep subject"',
    'e.g. "Make the scene look like it was shot on 35mm film, add grain"',
  ],
  'motion-control': [
    'e.g. Upload a dance video + character image → transfers the dance to your character',
    'e.g. Upload a gesture video + portrait → character mimics the gestures',
  ],
  'ai-avatar': [
    'e.g. "Subject speaks naturally with subtle head movements and expressions"',
    'e.g. "Talking head presentation style, professional, slight gestures"',
  ],
  'hailuo': [
    'e.g. "Smooth camera orbit around subject, soft ambient lighting, 6 seconds"',
    'e.g. "Subject looks up in wonder as particles float upward, dreamy atmosphere"',
  ],
  'pixverse': [
    'e.g. "Dynamic action scene, character leaps through the air, slow motion"',
    'e.g. "Magical transformation sequence with sparkle effects and color shift"',
  ],
  'seedance-2.0': [
    'e.g. "The character walks through a garden, soft sunlight, reference images maintain consistency"',
    'e.g. "Subject dances gracefully with flowing fabric, cinematic camera, 8 seconds"',
  ],
  'seedance': [
    'e.g. "Subject dances gracefully, flowing fabric, soft backlight, 8 seconds"',
    'e.g. "Character performs martial arts moves, dynamic camera angles"',
  ],
  'grok-imagine-video/text-to-video': [
    'e.g. "A cat wearing sunglasses surfing a wave at sunset, cinematic 4K"',
    'e.g. "Time-lapse of a flower blooming in a forest clearing, morning dew"',
  ],
  'grok-imagine-video/image-to-video': [
    'e.g. "Subject comes to life, subtle breathing motion, eyes blink naturally"',
    'e.g. "Zoom out slowly revealing the full scene, add gentle wind motion"',
  ],
  'luma-dream-machine': [
    'e.g. "Ethereal camera movement, subject bathed in volumetric light"',
    'e.g. "Dreamy slow-motion, particles floating, shallow depth of field"',
  ],
  'wan-pro': [
    'e.g. "Subject turns head slowly, natural hair physics, soft studio lighting"',
    'e.g. "Gentle zoom into portrait, subtle expression change, warm tones"',
  ],
  'hunyuan-video': [
    'e.g. "A futuristic cityscape with flying cars, neon reflections on wet streets"',
    'e.g. "Underwater scene with bioluminescent jellyfish, deep blue ambiance"',
  ],
  'dreamactor': [
    'e.g. Upload a portrait + driving video → face animation transfer',
    'e.g. Upload headshot + expression video → lip-sync and expression transfer',
  ],
  'ovi/': [
    'e.g. "Subject sings along to the music, natural lip sync, concert lighting"',
    'e.g. "Character speaks with emotion, synchronized audio, studio backdrop"',
  ],
  // ── Image models ──
  'flux-pro': [
    'e.g. "A hyperrealistic astronaut riding a horse on Mars, dramatic sky"',
    'e.g. "Minimalist logo design, clean lines, modern typography, white background"',
  ],
  'flux-2-flex': [
    'e.g. "Concept art of a steampunk airship over Victorian London"',
    'e.g. "Fashion editorial photo, model in avant-garde outfit, studio lighting"',
  ],
  'nano-banana': [
    'e.g. "Change the outfit to a red dress" or "Add sunglasses to the subject"',
    'e.g. "Replace the background with a tropical beach at sunset"',
  ],
  'gemini': [
    'e.g. "Edit this image: make the sky a dramatic purple sunset"',
    'e.g. "Add a reflection in the water, enhance the lighting"',
  ],
  'grok-imagine-image/edit': [
    'e.g. "Transform this portrait into a comic book style illustration"',
    'e.g. "Change the season to winter, add snow to the scene"',
  ],
  'seedream': [
    'e.g. "A photorealistic landscape with dramatic storm clouds, lightning"',
    'e.g. "Character design sheet, multiple angles, fantasy warrior, detailed armor"',
  ],
  'dreamina': [
    'e.g. "High-detail product rendering, glass material, caustic lighting"',
    'e.g. "Anime character portrait, vibrant colors, detailed eyes, soft shading"',
  ],
  'stable-diffusion': [
    'e.g. "A serene Japanese garden in autumn, koi pond, red maple leaves"',
    'e.g. "Sci-fi mech design, battle-worn, standing in a ruined city"',
  ],
  'recraft': [
    'e.g. "Vector illustration of a mountain landscape, flat design, vibrant colors"',
    'e.g. "Brand identity mockup, modern serif logo, earth tone palette"',
  ],
  'qwen': [
    'e.g. "Remove the background and replace with a gradient"',
    'e.g. "Enhance the colors, add cinematic color grading"',
  ],
  'ideogram': [
    'e.g. "Typography poster: \'DREAM BIG\' in 3D chrome letters, retro style"',
    'e.g. "Infographic layout with icons and data visualization, clean design"',
  ],
  'flux-krea-lora': [
    'e.g. "Apply the style of this reference to a new scene"',
    'e.g. "Transfer the artistic style, keep the composition"',
  ],
  'flux-pro/kontext': [
    'e.g. "Change the subject\'s hair color to platinum blonde"',
    'e.g. "Add a hat to the character, keep everything else the same"',
  ],
  'wan/v2.7': [
    'e.g. "Photorealistic portrait with dramatic Rembrandt lighting"',
    'e.g. "Surreal dreamscape, floating islands, aurora in the sky"',
  ],
};
