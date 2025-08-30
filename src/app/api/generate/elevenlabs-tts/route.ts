import { NextRequest } from "next/server";
import { createGenerationHandler, commonValidations } from "@/lib/api-handlers";
import { getVoiceId, createVoiceSettings } from "@/lib/voice-mappings";

// Validation function for ElevenLabs TTS
function validateElevenLabsInput(input: any) {
  // Validate text
  const textValidation = commonValidations.validateText(input);
  if (!textValidation.isValid) {
    return textValidation;
  }

  // Validate voice
  if (!input.voice) {
    return { isValid: false, error: 'Voice is required' };
  }

  return { isValid: true };
}

// Transform input for ElevenLabs API
function transformElevenLabsInput(input: any) {
  const { text, voice, stability, similarity_boost, style, speed, timestamps, previous_text, next_text, language_code } = input;
  
  // Get voice ID with fallback
  const { voiceId, isFallback } = getVoiceId(voice);
  console.log('🎤 [ElevenLabs TTS] Voice mapping:', { voice, voiceId, isFallback });

  // Create voice settings
  const voice_settings = createVoiceSettings({
    stability,
    similarity_boost,
    style,
    speed
  });

  // Build transformed input
  const transformedInput: any = {
    text: text.trim(),
    voice_id: voiceId,
    model_id: "eleven_turbo_v2",
    voice_settings
  };

  // Add optional parameters only if provided
  if (timestamps !== undefined) transformedInput.timestamps = timestamps;
  if (previous_text) transformedInput.previous_text = previous_text;
  if (next_text) transformedInput.next_text = next_text;
  if (language_code) transformedInput.language_code = language_code;

  return transformedInput;
}

// Create the handler using our shared pattern
export const POST = createGenerationHandler({
  endpoint: "fal-ai/elevenlabs/tts/turbo-v2.5",
  modelName: "ElevenLabs TTS",
  validateInput: validateElevenLabsInput,
  transformInput: transformElevenLabsInput,
  enableLogs: true
});
