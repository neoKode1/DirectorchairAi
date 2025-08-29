import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Play, Square, Download, Upload } from 'lucide-react';

interface MiniMaxTTSInterfaceProps {
  onGenerate: (result: any) => void;
}

// MiniMax Voice Options
const MINIMAX_VOICES = [
  "Wise_Woman",
  "Young_Woman", 
  "Young_Man",
  "Old_Man",
  "Old_Woman",
  "Child_Boy",
  "Child_Girl"
];

// Audio Settings
const SAMPLE_RATES = ["8000", "16000", "22050", "24000", "32000", "44100"];
const BITRATES = ["32000", "64000", "128000", "256000"];
const CHANNELS = ["1", "2"];

export const MiniMaxTTSInterface: React.FC<MiniMaxTTSInterfaceProps> = ({ onGenerate }) => {
  const { toast } = useToast();
  const [text, setText] = useState("Hello! This is a test of the MiniMax Speech 2.5 HD system. How does it sound?");
  const [voiceId, setVoiceId] = useState("Wise_Woman");
  const [speed, setSpeed] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [pitch, setPitch] = useState([0]);
  const [sampleRate, setSampleRate] = useState("32000");
  const [bitrate, setBitrate] = useState("128000");
  const [channel, setChannel] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: parseInt(sampleRate)
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Your voice is being recorded. Click the stop button when finished.",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Voice recording saved successfully.",
      });
    }
  };

  const playRecordedAudio = () => {
    if (recordedAudio) {
      if (audioRef.current) {
        audioRef.current.src = recordedAudio;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  const saveRecordedAudio = async () => {
    if (!audioBlob) return;

    try {
      // Convert to MP3 format for storage
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recorded-voice.mp3');

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Audio Saved",
          description: "Your recorded audio has been saved to storage.",
        });
        return result.url;
      }
    } catch (error) {
      console.error('Error saving audio:', error);
      toast({
        title: "Save Failed",
        description: "Could not save recorded audio.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const generateData = {
        endpointId: "fal-ai/minimax/preview/speech-2.5-hd",
        text: text.trim(),
        voice_setting: {
          voice_id: voiceId,
          speed: speed[0],
          vol: volume[0],
          pitch: pitch[0],
          english_normalization: false
        },
        audio_setting: {
          sample_rate: sampleRate,
          bitrate: bitrate,
          format: "mp3",
          channel: channel
        },
        output_format: "url"
      };

      console.log('🎤 [MiniMax TTS] Generating speech with:', generateData);

      const response = await fetch('/api/generate/minimax-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API call failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [MiniMax TTS] Generation result:', result);

      onGenerate(result);

      toast({
        title: "Speech Generated!",
        description: "Your audio has been created successfully.",
      });

    } catch (error) {
      console.error('❌ [MiniMax TTS] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate speech.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateCost = () => {
    // Rough estimate: $0.30 per 1K characters for MiniMax
    const charCount = text.length;
    const cost = (charCount / 1000) * 0.30;
    return cost.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MiniMax Speech 2.5 HD</CardTitle>
          <CardDescription>
            High-quality text-to-speech with advanced AI techniques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Recording Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Voice Recording</Label>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    Record Voice
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop Recording
                  </Button>
                )}
                
                {recordedAudio && (
                  <>
                    <Button
                      onClick={playRecordedAudio}
                      variant="outline"
                      size="sm"
                      disabled={isPlaying}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isPlaying ? 'Playing...' : 'Play'}
                    </Button>
                    <Button
                      onClick={saveRecordedAudio}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {recordedAudio && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Recorded Audio:</p>
                <audio ref={audioRef} controls className="w-full" />
              </div>
            )}
          </div>

          {/* Text Input */}
          <div>
            <Label htmlFor="text">Text to Speech</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={4}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {text.length}/5000 characters
              </span>
              <span className="text-sm text-muted-foreground">
                Estimated cost: ${calculateCost()}
              </span>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {MINIMAX_VOICES.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="speed">Speed: {speed[0]}</Label>
              <Slider
                id="speed"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onValueChange={setSpeed}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="volume">Volume: {volume[0]}</Label>
              <Slider
                id="volume"
                min={0}
                max={10}
                step={0.1}
                value={volume}
                onValueChange={setVolume}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="pitch">Pitch: {pitch[0]}</Label>
              <Slider
                id="pitch"
                min={-12}
                max={12}
                step={1}
                value={pitch}
                onValueChange={setPitch}
                className="w-full"
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sampleRate">Sample Rate</Label>
              <Select value={sampleRate} onValueChange={setSampleRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_RATES.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate} Hz
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bitrate">Bitrate</Label>
              <Select value={bitrate} onValueChange={setBitrate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BITRATES.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {parseInt(rate) / 1000} kbps
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="channel">Channels</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch === "1" ? "Mono" : "Stereo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Speech...
              </>
            ) : (
              "Generate Speech"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
