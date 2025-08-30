import React, { useState } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, Play, Download, Video, Volume2, Music } from 'lucide-react';
import { AudioGenerationInterface } from '../audio-generation-interface';

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
  const [syncMode, setSyncMode] = useState("cut_off");
  const [activeTab, setActiveTab] = useState("upload");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const uploadVideoToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    const result = await response.json();
    return result.url;
  };

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
      
      setVideoFile(file);
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

  const handleAudioGenerated = (audioUrl: string, audioData: any) => {
    console.log('🎵 [LipSync] Audio generated:', audioUrl);
    setGeneratedAudioUrl(audioUrl);
    toast({
      title: "Audio Ready for Lip Sync",
      description: "Generated audio is now available for lip sync generation.",
    });
  };

  const handleAudioSelected = (audioUrl: string) => {
    console.log('🎵 [LipSync] Audio selected:', audioUrl);
    setGeneratedAudioUrl(audioUrl);
    setActiveTab("upload"); // Switch to upload tab to show the selected audio
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

    const finalAudioUrl = uploadedAudioUrl || generatedAudioUrl;
    if (!finalAudioUrl && !audioFile) {
      toast({
        title: "Audio Required",
        description: "Please upload an audio file or generate audio first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let finalVideoUrl = videoUrl;
      let finalAudioUrl = uploadedAudioUrl || generatedAudioUrl;

      // Upload video file if we have one
      if (videoFile) {
        finalVideoUrl = await uploadVideoToServer(videoFile);
      }

      // Upload audio file if we have one
      if (audioFile) {
        finalAudioUrl = await uploadAudioToServer(audioFile);
      }

      const generateData = {
        model: selectedModel === "fal-ai/sync-lipsync" ? "lipsync-1.9.0-beta" : undefined,
        video_url: finalVideoUrl,
        audio_url: finalAudioUrl,
        sync_mode: syncMode
      };

      console.log('🎬 [Lip Sync] Generating with:', generateData);

      const response = await fetch('/api/generate/sync-lipsync', {
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

          {/* Sync Mode Selection */}
          <div>
            <Label htmlFor="sync-mode">Sync Mode</Label>
            <Select value={syncMode} onValueChange={setSyncMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select sync mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cut_off">Cut Off - Match shorter duration</SelectItem>
                <SelectItem value="loop">Loop - Loop shorter content</SelectItem>
                <SelectItem value="bounce">Bounce - Bounce effect for longer content</SelectItem>
                <SelectItem value="silence">Silence - Add silence to shorter content</SelectItem>
                <SelectItem value="remap">Remap - Intelligent timing remapping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audio Section */}
          <div>
            <Label>Audio Source</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                <TabsTrigger value="generate">Generate Audio</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="audio">Upload Audio File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="audio"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
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
              </TabsContent>

              <TabsContent value="generate" className="space-y-4">
                <AudioGenerationInterface
                  onAudioGenerated={handleAudioGenerated}
                  onAudioSelected={handleAudioSelected}
                  showDownloadButton={true}
                  showUseInLipSync={false}
                  showUseInVideo={false}
                />
                
                {generatedAudioUrl && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-700 mb-2">Generated audio ready for lip sync:</p>
                    <audio controls className="w-full" src={generatedAudioUrl} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedAudioUrl(generatedAudioUrl)}
                      className="mt-2"
                    >
                      Use This Generated Audio
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !videoUrl || (!uploadedAudioUrl && !generatedAudioUrl && !audioFile)}
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
              <li>• Upload a video file (MP4, MOV, AVI, WebM) with clear facial features</li>
              <li>• Upload your own audio file or use generated TTS audio</li>
              <li>• Choose sync mode based on your content duration needs</li>
              <li>• Supported audio formats: MP3, WAV, M4A, AAC</li>
              <li>• Maximum file size: 100MB for videos, 50MB for audio</li>
              <li>• The model will synchronize lip movement with your audio</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
