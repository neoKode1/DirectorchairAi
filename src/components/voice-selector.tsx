import { CheckIcon, ChevronsUpDownIcon, PlayIcon, PauseIcon, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { button as Button, ButtonProps } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// ElevenLabs Voices
const ELEVENLABS_VOICES = [
  "Rachel", "Aria", "Domi", "Bella", "Antoni", "Thomas", "Josh", "Arnold", 
  "Adam", "Sam", "Callum", "Serena", "Fin", "Grace", "Daniel", "Sarah",
  "Charlie", "George", "Emily", "Michael", "Ethan", "Gigi", "Freya", "Blair",
  "Jessie", "Ryan", "Sammy", "Glinda", "Giovanni", "Mimi", "Clyde"
];

// MiniMax Voices
const MINIMAX_VOICES = [
  // Built-in voices
  "Wise_Woman", "Young_Woman", "Young_Man", "Old_Man", "Old_Woman", "Child_Boy", "Child_Girl",
  // Extended voices
  "Professional_Male", "Professional_Female", "Casual_Male", "Casual_Female",
  "Narrator_Male", "Narrator_Female", "News_Anchor_Male", "News_Anchor_Female",
  "Storyteller_Male", "Storyteller_Female", "Teacher_Male", "Teacher_Female",
  "Customer_Service_Male", "Customer_Service_Female", "Radio_DJ_Male", "Radio_DJ_Female",
  "Podcast_Host_Male", "Podcast_Host_Female", "Audiobook_Male", "Audiobook_Female",
  "Commercial_Male", "Commercial_Female", "Documentary_Male", "Documentary_Female",
  "Cartoon_Male", "Cartoon_Female", "Gaming_Male", "Gaming_Female",
  "Assistant_Male", "Assistant_Female", "Friend_Male", "Friend_Female"
];

// PlayHT Voices
const PLAYHT_VOICES = [
  "Jennifer (English (US)/American)",
  "Dexter (English (US)/American)",
  "Ava (English (AU)/Australian)",
  "Tilly (English (AU)/Australian)",
  "Charlotte (Advertising) (English (CA)/Canadian)",
  "Charlotte (Meditation) (English (CA)/Canadian)",
  "Cecil (English (GB)/British)",
  "Sterling (English (GB)/British)",
  "Cillian (English (IE)/Irish)",
  "Madison (English (IE)/Irish)",
  "Ada (English (ZA)/South african)",
  "Furio (English (IT)/Italian)",
  "Alessandro (English (IT)/Italian)",
  "Carmen (English (MX)/Mexican)",
  "Sumita (English (IN)/Indian)",
  "Navya (English (IN)/Indian)",
  "Baptiste (English (FR)/French)",
  "Lumi (English (FI)/Finnish)",
  "Ronel Conversational (Afrikaans/South african)",
  "Ronel Narrative (Afrikaans/South african)",
  "Abdo Conversational (Arabic/Arabic)",
  "Abdo Narrative (Arabic/Arabic)",
  "Mousmi Conversational (Bengali/Bengali)",
  "Mousmi Narrative (Bengali/Bengali)",
  "Caroline Conversational (Portuguese (BR)/Brazilian)",
  "Caroline Narrative (Portuguese (BR)/Brazilian)",
  "Ange Conversational (French/French)",
  "Ange Narrative (French/French)",
  "Anke Conversational (German/German)",
  "Anke Narrative (German/German)",
  "Bora Conversational (Greek/Greek)",
  "Bora Narrative (Greek/Greek)",
  "Anuj Conversational (Hindi/Indian)",
  "Anuj Narrative (Hindi/Indian)",
  "Alessandro Conversational (Italian/Italian)",
  "Alessandro Narrative (Italian/Italian)",
  "Kiriko Conversational (Japanese/Japanese)",
  "Kiriko Narrative (Japanese/Japanese)",
  "Dohee Conversational (Korean/Korean)",
  "Dohee Narrative (Korean/Korean)",
  "Ignatius Conversational (Malay/Malay)",
  "Ignatius Narrative (Malay/Malay)",
  "Adam Conversational (Polish/Polish)",
  "Adam Narrative (Polish/Polish)",
  "Andrei Conversational (Russian/Russian)",
  "Andrei Narrative (Russian/Russian)",
  "Aleksa Conversational (Serbian/Serbian)",
  "Aleksa Narrative (Serbian/Serbian)",
  "Carmen Conversational (Spanish/Spanish)",
  "Patricia Conversational (Spanish/Spanish)",
  "Aiken Conversational (Tagalog/Filipino)",
  "Aiken Narrative (Tagalog/Filipino)",
  "Katbundit Conversational (Thai/Thai)",
  "Katbundit Narrative (Thai/Thai)",
  "Ali Conversational (Turkish/Turkish)",
  "Ali Narrative (Turkish/Turkish)",
  "Sahil Conversational (Urdu/Pakistani)",
  "Sahil Narrative (Urdu/Pakistani)",
  "Mary Conversational (Hebrew/Israeli)",
  "Mary Narrative (Hebrew/Israeli)",
];

// Combined voices with metadata
const ALL_VOICES = [
  {
    group: "ElevenLabs",
    voices: ELEVENLABS_VOICES.map(voice => ({
      value: voice,
      label: voice,
      provider: "ElevenLabs",
      description: "High-quality natural voices"
    }))
  },
  {
    group: "MiniMax",
    voices: MINIMAX_VOICES.map(voice => ({
      value: voice,
      label: voice,
      provider: "MiniMax",
      description: "AI-powered voices with extended options"
    }))
  },
  {
    group: "PlayHT",
    voices: PLAYHT_VOICES.map(voice => ({
      value: voice,
      label: voice,
      provider: "PlayHT",
      description: "Multi-language voices with accents"
    }))
  }
];

type VoiceSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
} & ButtonProps;

export function VoiceSelector({
  value,
  onValueChange,
  placeholder = "Select voice...",
  className,
  ...props
}: VoiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Find the selected voice across all groups
  const selectedVoice = ALL_VOICES.flatMap(group => group.voices).find(voice => voice.value === value);

  const generateVoicePreview = async (voiceName: string, provider: string) => {
    if (previewingVoice === voiceName) return; // Already previewing this voice
    
    setPreviewingVoice(voiceName);
    setPreviewAudio(null);
    setIsPlaying(false);
    
    try {
      const previewText = "Hello! This is a preview of my voice. How do I sound?";
      let apiEndpoint = '';
      let requestBody: any = {};

      // Determine which API to use based on provider
      if (provider === "ElevenLabs") {
        apiEndpoint = '/api/generate/elevenlabs-tts';
        requestBody = {
          text: previewText,
          voice: voiceName,
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          speed: 1
        };
      } else if (provider === "MiniMax") {
        apiEndpoint = '/api/generate/minimax-tts';
        requestBody = {
          text: previewText,
          voice_setting: {
            voice_id: voiceName,
            speed: 1,
            vol: 1,
            pitch: 0,
            english_normalization: false
          },
          audio_setting: {
            sample_rate: "32000",
            bitrate: "128000",
            format: "mp3",
            channel: "1"
          },
          output_format: "url"
        };
      } else if (provider === "PlayHT") {
        // For PlayHT, we'll use a placeholder since we don't have a direct API
        toast({
          title: "Preview Not Available",
          description: "PlayHT voice previews are coming soon!",
        });
        setPreviewingVoice(null);
        return;
      }

      console.log('🎵 [Voice Preview] Generating preview for:', voiceName, 'using', provider);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Preview failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [Voice Preview] Preview generated:', result);

      if (result.audioUrl) {
        console.log('🎵 [Voice Preview] Setting audio URL:', result.audioUrl);
        setPreviewAudio(result.audioUrl);
        toast({
          title: "Voice Preview Ready!",
          description: `Preview for ${voiceName} is ready to play.`,
        });
      } else {
        console.error('❌ [Voice Preview] No audioUrl in result:', result);
      }

    } catch (error) {
      console.error('❌ [Voice Preview] Preview error:', error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate voice preview.",
        variant: "destructive",
      });
    } finally {
      setPreviewingVoice(null);
    }
  };

  const handlePlayPause = () => {
    console.log('🎵 [Voice Preview] Play/Pause clicked, audioRef:', !!audioRef.current, 'isPlaying:', isPlaying);
    
    if (audioRef.current) {
      if (isPlaying) {
        console.log('🎵 [Voice Preview] Pausing audio');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('🎵 [Voice Preview] Playing audio');
        audioRef.current.play().catch(error => {
          console.error('❌ [Voice Preview] Play error:', error);
          toast({
            title: "Playback Error",
            description: "Failed to play audio preview.",
            variant: "destructive",
          });
        });
        setIsPlaying(true);
      }
    } else {
      console.error('❌ [Voice Preview] No audio element found');
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  // Effect to handle audio element setup
  useEffect(() => {
    if (previewAudio && audioRef.current) {
      console.log('🎵 [Voice Preview] Setting up audio element with URL:', previewAudio);
      audioRef.current.load(); // Ensure the audio loads
    }
  }, [previewAudio]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            {...props}
            className={cn("max-w-fit justify-between", className)}
            role="combobox"
            aria-expanded={open}
          >
            {selectedVoice ? (
              <div className="flex items-center gap-2">
                <span>{selectedVoice.label}</span>
                <span className="text-xs text-muted-foreground">({selectedVoice.provider})</span>
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search voices..." className="h-9" />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>No voice found</CommandEmpty>
              {ALL_VOICES.map((group) => (
                <CommandGroup key={group.group} heading={group.group}>
                  {group.voices.map((voice) => (
                    <CommandItem
                      key={voice.value}
                      value={voice.value}
                      onSelect={() => {
                        onValueChange(voice.value);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === voice.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.label}</span>
                          <span className="text-xs text-muted-foreground">{voice.description}</span>
                        </div>
                      </div>
                      
                      {/* Preview Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateVoicePreview(voice.value, voice.provider);
                        }}
                        disabled={previewingVoice === voice.value}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        {previewingVoice === voice.value ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Volume2Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

             {/* Audio Preview Player */}
       {previewAudio && (
         <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border-2 border-blue-200">
           <Button
             variant="ghost"
             size="sm"
             onClick={handlePlayPause}
             className="h-8 w-8 p-0 bg-blue-100 hover:bg-blue-200"
           >
             {isPlaying ? (
               <PauseIcon className="h-4 w-4 text-blue-600" />
             ) : (
               <PlayIcon className="h-4 w-4 text-blue-600" />
             )}
           </Button>
           <span className="text-sm font-medium text-blue-800">
             🔊 Voice Preview Ready!
           </span>
           <span className="text-xs text-blue-600">
             Click play to hear: {previewAudio.substring(0, 30)}...
           </span>
           <audio
             ref={audioRef}
             src={previewAudio}
             onEnded={handleAudioEnded}
             onPlay={handleAudioPlay}
             onPause={handleAudioPause}
             onError={(e) => console.error('❌ [Voice Preview] Audio error:', e)}
             onLoadStart={() => console.log('🎵 [Voice Preview] Audio loading started')}
             onCanPlay={() => console.log('🎵 [Voice Preview] Audio can play')}
             className="hidden"
           />
         </div>
       )}
      
             {/* Debug info */}
       {previewAudio && (
         <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
           <div className="font-bold text-yellow-800">🔍 Debug Info:</div>
           <div>Audio URL: {previewAudio ? '✅ Set' : '❌ Not set'}</div>
           <div>Is Playing: {isPlaying ? '✅ Yes' : '❌ No'}</div>
           <div>Audio Ref: {audioRef.current ? '✅ Available' : '❌ Not available'}</div>
           <div>Voice: {previewingVoice || 'Unknown'}</div>
           <div>URL Preview: {previewAudio?.substring(0, 50)}...</div>
         </div>
       )}
    </div>
  );
}

// Export individual voice arrays for use in specific interfaces
export { ELEVENLABS_VOICES, MINIMAX_VOICES, PLAYHT_VOICES };
