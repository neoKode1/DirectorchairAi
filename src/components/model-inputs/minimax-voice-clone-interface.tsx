import React, { useState, useRef } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, Play, Download, Mic, MicOff, Square } from 'lucide-react';

interface MiniMaxVoiceCloneInterfaceProps {
  onGenerate: (result: any) => void;
}

// TTS Models for preview
const TTS_MODELS = [
  { id: "speech-02-hd", name: "Speech 02 HD", description: "High quality, slower" },
  { id: "speech-02-turbo", name: "Speech 02 Turbo", description: "Fast generation" },
  { id: "speech-01-hd", name: "Speech 01 HD", description: "Original HD model" },
  { id: "speech-01-turbo", name: "Speech 01 Turbo", description: "Original fast model" }
];

export const MiniMaxVoiceCloneInterface: React.FC<MiniMaxVoiceCloneInterfaceProps> = ({ onGenerate }) => {
  const { toast } = useToast();
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewText, setPreviewText] = useState("Hello, this is a preview of your cloned voice! I hope you like it!");
  const [selectedModel, setSelectedModel] = useState("speech-02-hd");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [volumeNormalization, setVolumeNormalization] = useState(true);
  const [accuracy, setAccuracy] = useState([0.8]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [clonedVoiceId, setClonedVoiceId] = useState("");
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File",
          description: "Please select an audio file.",
          variant: "destructive",
        });
        return;
      }
      
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      
      toast({
        title: "Audio Uploaded",
        description: "Audio file selected successfully.",
      });
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
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
        setAudioUrl(audioUrl);
        
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

  const uploadAudioToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload audio');
    }

    const result = await response.json();
    return result.url;
  };

  const handleGenerate = async () => {
    if (!audioUrl) {
      toast({
        title: "Audio Required",
        description: "Please upload or record an audio file for voice cloning.",
        variant: "destructive",
      });
      return;
    }

    if (!previewText.trim()) {
      toast({
        title: "Preview Text Required",
        description: "Please enter text for the voice preview.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let finalAudioUrl = audioUrl;

      // If we have an audio file, upload it first
      if (audioFile) {
        finalAudioUrl = await uploadAudioToServer(audioFile);
      }

      const generateData = {
        audio_url: finalAudioUrl,
        text: previewText.trim(),
        model: selectedModel,
        noise_reduction: noiseReduction,
        need_volume_normalization: volumeNormalization,
        accuracy: accuracy[0]
      };

      console.log('🎭 [Voice Clone] Generating with:', generateData);

      const response = await fetch('/api/generate/minimax-voice-clone', {
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
      console.log('✅ [Voice Clone] Generation result:', result);

      // Store the cloned voice ID for future use
      if (result.data?.custom_voice_id) {
        setClonedVoiceId(result.data.custom_voice_id);
      }

      // Set preview audio if available
      if (result.data?.audio?.url) {
        setPreviewAudio(result.data.audio.url);
      }

      onGenerate(result);

      toast({
        title: "Voice Cloned Successfully!",
        description: "Your custom voice has been created and is ready to use.",
      });

    } catch (error) {
      console.error('❌ [Voice Clone] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to clone voice.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateCost = () => {
    // Voice cloning is typically more expensive than regular TTS
    // Rough estimate: $1-5 per voice clone + $0.30 per 1K characters for preview
    const charCount = previewText.length;
    const previewCost = (charCount / 1000) * 0.30;
    const cloneCost = 2.00; // Estimated cost for voice cloning
    return (cloneCost + previewCost).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MiniMax Voice Clone</CardTitle>
          <CardDescription>
            Clone custom voices from audio samples and generate personalized TTS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Voice Sample</Label>
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
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="audio-upload">Upload Audio File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload at least 10 seconds of clear audio for best results
              </p>
            </div>

            {/* Audio Preview */}
            {audioUrl && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Voice Sample:</p>
                <audio controls className="w-full" src={audioUrl} />
              </div>
            )}
          </div>

          {/* Preview Text */}
          <div>
            <Label htmlFor="preview-text">Preview Text</Label>
            <Textarea
              id="preview-text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Enter text to generate a preview with your cloned voice..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {previewText.length}/500 characters
              </span>
              <span className="text-sm text-muted-foreground">
                Estimated cost: ${calculateCost()}
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">TTS Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TTS_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accuracy">Accuracy: {accuracy[0]}</Label>
              <Slider
                id="accuracy"
                min={0.1}
                max={1.0}
                step={0.1}
                value={accuracy}
                onValueChange={setAccuracy}
                className="w-full"
              />
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="noise-reduction">Noise Reduction</Label>
              <Switch
                id="noise-reduction"
                checked={noiseReduction}
                onCheckedChange={setNoiseReduction}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="volume-normalization">Volume Normalization</Label>
              <Switch
                id="volume-normalization"
                checked={volumeNormalization}
                onCheckedChange={setVolumeNormalization}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !audioUrl || !previewText.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cloning Voice...
              </>
            ) : (
              "Clone Voice & Generate Preview"
            )}
          </Button>

          {/* Results */}
          {clonedVoiceId && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-sm text-green-900 mb-2">Voice Cloned Successfully!</h4>
              <p className="text-xs text-green-800 mb-2">
                <strong>Voice ID:</strong> {clonedVoiceId}
              </p>
              <p className="text-xs text-green-700">
                You can now use this voice ID with the Speech 2.5 HD model for TTS generation.
              </p>
            </div>
          )}

          {previewAudio && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-sm text-blue-900 mb-2">Preview Audio:</h4>
              <audio controls className="w-full" src={previewAudio} />
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Record or upload at least 10 seconds of clear audio</li>
              <li>• Higher accuracy requires more processing time</li>
              <li>• Use noise reduction for cleaner audio samples</li>
              <li>• The cloned voice ID can be used with Speech 2.5 HD</li>
              <li>• Voice cloning costs more than regular TTS</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
