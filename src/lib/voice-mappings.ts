// ElevenLabs Voice ID mapping - Extracted for reuse
export const ELEVENLABS_VOICE_IDS: { [key: string]: string } = {
  // Male voices
  "Adam": "pNInz6obpgDQGcFmaJgB", // Adam - Deep, professional
  "Antoni": "VR6AewLTigWG4xSOukaG", // Antoni - Warm, friendly
  "Arnold": "VR6AewLTigWG4xSOukaG", // Arnold - Strong, authoritative
  "Callum": "VR6AewLTigWG4xSOukaG", // Callum - British accent
  "Charlie": "VR6AewLTigWG4xSOukaG", // Charlie - Casual, young
  "Daniel": "VR6AewLTigWG4xSOukaG", // Daniel - Clear, articulate
  "Ethan": "VR6AewLTigWG4xSOukaG", // Ethan - Natural, conversational
  "Fin": "VR6AewLTigWG4xSOukaG", // Fin - Irish accent
  "George": "VR6AewLTigWG4xSOukaG", // George - Mature, wise
  "Giovanni": "VR6AewLTigWG4xSOukaG", // Giovanni - Italian accent
  "Josh": "VR6AewLTigWG4xSOukaG", // Josh - Young, energetic
  "Michael": "VR6AewLTigWG4xSOukaG", // Michael - Professional, clear
  "Ryan": "VR6AewLTigWG4xSOukaG", // Ryan - Friendly, approachable
  "Sam": "VR6AewLTigWG4xSOukaG", // Sam - Casual, relatable
  "Sammy": "VR6AewLTigWG4xSOukaG", // Sammy - Young, enthusiastic
  "Thomas": "VR6AewLTigWG4xSOukaG", // Thomas - British, refined
  
  // Female voices
  "Aria": "21m00Tcm4TlvDq8ikWAM", // Aria - Clear, professional
  "Bella": "EXAVITQu4vr4xnSDxMaL", // Bella - Warm, friendly
  "Blair": "EXAVITQu4vr4xnSDxMaL", // Blair - Modern, confident
  "Domi": "AZnzlk1XvdvUeBnXmlld", // Domi - Deep, powerful
  "Emily": "EXAVITQu4vr4xnSDxMaL", // Emily - Sweet, gentle
  "Freya": "EXAVITQu4vr4xnSDxMaL", // Freya - Nordic accent
  "Gigi": "EXAVITQu4vr4xnSDxMaL", // Gigi - Young, vibrant
  "Glinda": "EXAVITQu4vr4xnSDxMaL", // Glinda - Magical, ethereal
  "Grace": "EXAVITQu4vr4xnSDxMaL", // Grace - Elegant, refined
  "Jessie": "EXAVITQu4vr4xnSDxMaL", // Jessie - Energetic, fun
  "Mimi": "EXAVITQu4vr4xnSDxMaL", // Mimi - Cute, playful
  "Rachel": "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional, clear
  "Sarah": "EXAVITQu4vr4xnSDxMaL", // Sarah - Warm, motherly
  "Serena": "EXAVITQu4vr4xnSDxMaL", // Serena - Sophisticated, elegant
};

// Female voice names for fallback logic
export const FEMALE_VOICE_NAMES = [
  "Rachel", "Aria", "Bella", "Domi", "Emily", "Freya", "Gigi", 
  "Glinda", "Grace", "Jessie", "Mimi", "Sarah", "Serena", "Blair"
];

// Default voice IDs
export const DEFAULT_VOICE_IDS = {
  FEMALE: "21m00Tcm4TlvDq8ikWAM", // Rachel/Aria for female voices
  MALE: "pNInz6obpgDQGcFmaJgB"    // Adam for male voices
};

export interface VoiceMapping {
  voiceId: string;
  isFallback: boolean;
}

// Helper function to get voice ID with fallback logic
export function getVoiceId(voiceName: string): VoiceMapping {
  const directMapping = ELEVENLABS_VOICE_IDS[voiceName];
  
  if (directMapping) {
    return { voiceId: directMapping, isFallback: false };
  }

  // Fallback logic based on gender/characteristics
  const isFemaleVoice = FEMALE_VOICE_NAMES.includes(voiceName);
  const fallbackId = isFemaleVoice ? DEFAULT_VOICE_IDS.FEMALE : DEFAULT_VOICE_IDS.MALE;
  
  return { voiceId: fallbackId, isFallback: true };
}

// Voice settings interface
export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed?: number;
}

// Default voice settings
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
};

// Helper to create voice settings with fallbacks
export function createVoiceSettings(settings: Partial<VoiceSettings> = {}): VoiceSettings {
  return {
    ...DEFAULT_VOICE_SETTINGS,
    ...settings
  };
}