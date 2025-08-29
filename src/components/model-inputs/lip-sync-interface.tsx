import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Play, Download, Video, Audio } from 'lucide-react';

interface LipSyncInterfaceProps {
  onGenerate: (result: any) => void;
  audioUrl?: string; // Optional: pre-selected audio from TTS or recording
}

const LIP_SYNC_MODELS = [
  {
    id: "fal-ai/sync-lipsync",
    name: "Sync LipSync",
    description: "Advanced lip sync with natural motion"
  },
  {
    id: "fal-ai/wav2lip",
    name: "Wav2Lip",
    description: "Traditional lip sync model"
  }
];

export const LipSyncInterface: React.FC<LipSyncInterfaceProps> = ({ onGenerate, audioUrl }) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState("fal-ai/sync-lipsync");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(audioUrl || "");

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File",
          description: "Please select a video file.",
          variant: "destructive",
        });
        return;
      }
      
      // For now, we'll use a placeholder URL
      // In a real implementation, you'd upload the video to your server
      setVideoUrl(URL.createObjectURL(file));
      
      toast({
        title: "Video Uploaded",
        description: "Video file selected successfully.",
      });
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadedAudioUrl(URL.createObjectURL(file));
      
      toast({
        title: "Audio Uploaded",
        description: "Audio file selected successfully.",
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
    if (!videoUrl) {
      toast({
        title: "Video Required",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedAudioUrl && !audioFile) {
      toast({
        title: "Audio Required",
        description: "Please upload an audio file or use generated audio.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let finalAudioUrl = uploadedAudioUrl;

      // If we have an audio file, upload it first
      if (audioFile) {
        finalAudioUrl = await uploadAudioToServer(audioFile);
      }

      const generateData = {
        model: selectedModel,
        video_url: videoUrl,
        audio_url: finalAudioUrl
      };

      console.log('🎬 [Lip Sync] Generating with:', generateData);

      const response = await fetch('/api/generate/fal/lipsync', {
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
      console.log('✅ [Lip Sync] Generation result:', result);

      onGenerate(result);

      toast({
        title: "Lip Sync Complete!",
        description: "Your synchronized video has been generated successfully.",
      });

    } catch (error) {
      console.error('❌ [Lip Sync] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate lip sync.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lip Sync Generation</CardTitle>
          <CardDescription>
            Synchronize audio with video for natural lip movement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div>
            <Label htmlFor="model">Lip Sync Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {LIP_SYNC_MODELS.map((model) => (
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

          {/* Video Upload */}
          <div>
            <Label htmlFor="video">Video File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="flex-1"
              />
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Upload
              </Button>
            </div>
            {videoUrl && (
              <div className="mt-2 p-2 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Video selected</p>
              </div>
            )}
          </div>

          {/* Audio Upload or Selection */}
          <div>
            <Label htmlFor="audio">Audio File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="flex-1"
              />
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Audio className="h-4 w-4" />
                Upload
              </Button>
            </div>
            
            {uploadedAudioUrl && (
              <div className="mt-2 p-2 bg-muted rounded">
                <p className="text-sm text-muted-foreground mb-2">Audio selected:</p>
                <audio controls className="w-full" src={uploadedAudioUrl} />
              </div>
            )}

            {audioUrl && !uploadedAudioUrl && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700 mb-2">Generated audio available:</p>
                <audio controls className="w-full" src={audioUrl} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedAudioUrl(audioUrl)}
                  className="mt-2"
                >
                  Use This Audio
                </Button>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !videoUrl || (!uploadedAudioUrl && !audioFile)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Lip Sync...
              </>
            ) : (
              "Generate Lip Sync"
            )}
          </Button>

          {/* Instructions */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload a video file (MP4, MOV, AVI)</li>
              <li>• Upload an audio file or use generated TTS audio</li>
              <li>• The model will synchronize lip movement with audio</li>
              <li>• Supported audio formats: MP3, WAV, M4A</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
