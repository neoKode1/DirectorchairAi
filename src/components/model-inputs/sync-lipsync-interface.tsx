import React, { useState } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Play, Download, Video, Settings } from 'lucide-react';
import { Volume2 as Audio } from 'lucide-react';

interface SyncLipSyncInterfaceProps {
  onGenerate: (result: any) => void;
  audioUrl?: string; // Optional: pre-selected audio from TTS or recording
}

// Sync LipSync Model Options
const LIPSYNC_MODELS = [
  { id: "lipsync-1.9.0-beta", name: "LipSync 1.9.0 Beta", description: "Latest beta version with improved accuracy" },
  { id: "lipsync-1.8.0", name: "LipSync 1.8.0", description: "Stable version with good performance" },
  { id: "lipsync-1.7.1", name: "LipSync 1.7.1", description: "Older version for compatibility" }
];

// Sync Mode Options
const SYNC_MODES = [
  { id: "cut_off", name: "Cut Off", description: "Cut video/audio to match shorter duration" },
  { id: "loop", name: "Loop", description: "Loop shorter content to match longer duration" },
  { id: "bounce", name: "Bounce", description: "Bounce back and forth for longer content" },
  { id: "silence", name: "Silence", description: "Add silence to shorter content" },
  { id: "remap", name: "Remap", description: "Remap timing to fit duration" }
];

export const SyncLipSyncInterface: React.FC<SyncLipSyncInterfaceProps> = ({ onGenerate, audioUrl }) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState("lipsync-1.9.0-beta");
  const [syncMode, setSyncMode] = useState("cut_off");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
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
      
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      
      toast({
        title: "Video Selected",
        description: "Video file selected successfully. It will be uploaded when you generate.",
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
      let finalVideoUrl = videoUrl;
      let finalAudioUrl = uploadedAudioUrl;

      // If we have a video file, upload it first
      if (videoFile) {
        finalVideoUrl = await uploadVideoToServer(videoFile);
      }

      // If we have an audio file, upload it first
      if (audioFile) {
        finalAudioUrl = await uploadAudioToServer(audioFile);
      }

      const generateData = {
        model: selectedModel,
        video_url: finalVideoUrl,
        audio_url: finalAudioUrl,
        sync_mode: syncMode
      };

      console.log('🎬 [Sync LipSync] Generating with:', generateData);

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
      console.log('✅ [Sync LipSync] Generation result:', result);

      onGenerate(result);

      toast({
        title: "Sync LipSync Complete!",
        description: "Your synchronized video has been generated successfully.",
      });

    } catch (error) {
      console.error('❌ [Sync LipSync] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate sync lip sync.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateCost = () => {
    // Sync LipSync is typically more expensive than basic lip sync
    // Rough estimate: $1-3 per video depending on length and quality
    return "1.50"; // Estimated cost
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync LipSync</CardTitle>
          <CardDescription>
            Advanced lip sync with multiple sync modes and model versions for professional results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model and Sync Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">LipSync Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {LIPSYNC_MODELS.map((model) => (
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
              <Label htmlFor="sync-mode">Sync Mode</Label>
              <Select value={syncMode} onValueChange={setSyncMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sync mode" />
                </SelectTrigger>
                <SelectContent>
                  {SYNC_MODES.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-sm text-muted-foreground">{mode.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* Cost Estimation */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Cost Estimation</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Estimated cost: ${calculateCost()} (varies based on video length and quality)
            </p>
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
                Generating Sync LipSync...
              </>
            ) : (
              "Generate Sync LipSync"
            )}
          </Button>

          {/* Instructions */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Sync LipSync Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Multiple Models:</strong> Choose from 3 different LipSync versions</li>
              <li>• <strong>Sync Modes:</strong> Handle duration mismatches intelligently</li>
              <li>• <strong>Advanced Processing:</strong> Better lip movement synchronization</li>
              <li>• <strong>Professional Quality:</strong> Higher quality output than basic lip sync</li>
            </ul>
            
            <div className="mt-3 pt-3 border-t border-gray-300">
              <h5 className="font-medium text-sm mb-1">Sync Mode Guide:</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Cut Off:</strong> Best for matching durations</li>
                <li>• <strong>Loop:</strong> Good for repetitive content</li>
                <li>• <strong>Bounce:</strong> Creative effect for longer audio</li>
                <li>• <strong>Silence:</strong> Add silence to shorter content</li>
                <li>• <strong>Remap:</strong> Intelligent timing adjustment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
