"use client";

import React, { useState } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Download, Play, Pause, Volume2, Upload, Copy } from 'lucide-react';
import { VoiceSelector } from './voice-selector';

interface AudioGenerationInterfaceProps {
  onAudioGenerated?: (audioUrl: string, audioData: any) => void;
  onAudioSelected?: (audioUrl: string) => void;
  showDownloadButton?: boolean;
  showUseInLipSync?: boolean;
  showUseInVideo?: boolean;
}

export const AudioGenerationInterface: React.FC<AudioGenerationInterfaceProps> = ({
  onAudioGenerated,
  onAudioSelected,
  showDownloadButton = true,
  showUseInLipSync = true,
  showUseInVideo = true
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [text, setText] = useState("Hello! This is a sample text for audio generation. How does it sound?");
  const [selectedProvider, setSelectedProvider] = useState<"elevenlabs" | "minimax">("elevenlabs");
  const [selectedVoice, setSelectedVoice] = useState("Rachel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedAudioData, setGeneratedAudioData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // ElevenLabs specific settings
  const [elevenLabsSettings, setElevenLabsSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    speed: 1
  });

  // MiniMax specific settings
  const [miniMaxSettings, setMiniMaxSettings] = useState({
    speed: 1,
    vol: 1,
    pitch: 0,
    english_normalization: false,
    sample_rate: "32000",
    bitrate: "128000",
    format: "mp3",
    channel: "1"
  });

  const handleGenerateAudio = async () => {
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
      let apiEndpoint = '';
      let requestBody: any = {};

      if (selectedProvider === "elevenlabs") {
        apiEndpoint = '/api/generate/elevenlabs-tts';
        requestBody = {
          text: text.trim(),
          voice: selectedVoice,
          stability: elevenLabsSettings.stability,
          similarity_boost: elevenLabsSettings.similarity_boost,
          style: elevenLabsSettings.style,
          speed: elevenLabsSettings.speed
        };
      } else {
        apiEndpoint = '/api/generate/minimax-tts';
        requestBody = {
          text: text.trim(),
          voice_setting: {
            voice_id: selectedVoice,
            speed: miniMaxSettings.speed,
            vol: miniMaxSettings.vol,
            pitch: miniMaxSettings.pitch,
            english_normalization: miniMaxSettings.english_normalization
          },
          audio_setting: {
            sample_rate: miniMaxSettings.sample_rate,
            bitrate: miniMaxSettings.bitrate,
            format: miniMaxSettings.format,
            channel: miniMaxSettings.channel
          },
          output_format: "url"
        };
      }

      console.log('🎤 [Audio Generation] Generating audio with:', requestBody);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Generation failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [Audio Generation] Audio generated:', result);

      if (result.audioUrl) {
        setGeneratedAudioUrl(result.audioUrl);
        setGeneratedAudioData(result);
        
        toast({
          title: "Audio Generated!",
          description: `Audio created successfully using ${selectedProvider === "elevenlabs" ? "ElevenLabs" : "MiniMax"}.`,
        });

        // Call the callback if provided
        if (onAudioGenerated) {
          onAudioGenerated(result.audioUrl, result);
        }
      } else {
        throw new Error('No audio URL in response');
      }

    } catch (error) {
      console.error('❌ [Audio Generation] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate audio.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

  const handleDownloadAudio = async () => {
    const audioUrl = generatedAudioUrl || uploadedAudioUrl;
    if (!audioUrl) return;

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-audio-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Audio file download has begun.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download audio file.",
        variant: "destructive",
      });
    }
  };

  const handleUseInLipSync = () => {
    const audioUrl = generatedAudioUrl || uploadedAudioUrl;
    if (!audioUrl) {
      toast({
        title: "No Audio Available",
        description: "Please generate or upload audio first.",
        variant: "destructive",
      });
      return;
    }

    if (onAudioSelected) {
      onAudioSelected(audioUrl);
    }

    toast({
      title: "Audio Selected for Lip Sync",
      description: "Audio has been selected for lip sync generation.",
    });
  };

  const handleUseInVideo = () => {
    const audioUrl = generatedAudioUrl || uploadedAudioUrl;
    if (!audioUrl) {
      toast({
        title: "No Audio Available",
        description: "Please generate or upload audio first.",
        variant: "destructive",
      });
      return;
    }

    if (onAudioSelected) {
      onAudioSelected(audioUrl);
    }

    toast({
      title: "Audio Selected for Video",
      description: "Audio has been selected for video generation.",
    });
  };

  const handlePlayPause = () => {
    const audioUrl = generatedAudioUrl || uploadedAudioUrl;
    if (!audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Play error:', error);
        toast({
          title: "Playback Error",
          description: "Failed to play audio.",
          variant: "destructive",
        });
      });
      setIsPlaying(true);
    }
  };

  const handleCopyAudioUrl = () => {
    const audioUrl = generatedAudioUrl || uploadedAudioUrl;
    if (!audioUrl) return;

    navigator.clipboard.writeText(audioUrl).then(() => {
      toast({
        title: "URL Copied",
        description: "Audio URL copied to clipboard.",
      });
    });
  };

  const currentAudioUrl = generatedAudioUrl || uploadedAudioUrl;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Generation & Management</CardTitle>
          <CardDescription>
            Generate audio from text or upload your own audio files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Audio</TabsTrigger>
              <TabsTrigger value="upload">Upload Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              {/* Text Input */}
              <div>
                <Label htmlFor="text">Text to Convert</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Provider Selection */}
              <div>
                <Label htmlFor="provider">TTS Provider</Label>
                <Select value={selectedProvider} onValueChange={(value: "elevenlabs" | "minimax") => setSelectedProvider(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select TTS provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevenlabs">ElevenLabs - High-quality natural voices</SelectItem>
                    <SelectItem value="minimax">MiniMax - AI-powered voices with extended options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selection */}
              <div>
                <Label htmlFor="voice">Voice</Label>
                <VoiceSelector
                  value={selectedVoice}
                  onValueChange={setSelectedVoice}
                  placeholder="Select a voice..."
                />
              </div>

              {/* Provider-specific Settings */}
              {selectedProvider === "elevenlabs" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stability">Stability</Label>
                    <Input
                      id="stability"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={elevenLabsSettings.stability}
                      onChange={(e) => setElevenLabsSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="similarity_boost">Similarity Boost</Label>
                    <Input
                      id="similarity_boost"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={elevenLabsSettings.similarity_boost}
                      onChange={(e) => setElevenLabsSettings(prev => ({ ...prev, similarity_boost: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Input
                      id="style"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={elevenLabsSettings.style}
                      onChange={(e) => setElevenLabsSettings(prev => ({ ...prev, style: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="speed">Speed</Label>
                    <Input
                      id="speed"
                      type="number"
                      min="0.25"
                      max="4"
                      step="0.25"
                      value={elevenLabsSettings.speed}
                      onChange={(e) => setElevenLabsSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              )}

              {selectedProvider === "minimax" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minimax_speed">Speed</Label>
                    <Input
                      id="minimax_speed"
                      type="number"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={miniMaxSettings.speed}
                      onChange={(e) => setMiniMaxSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimax_vol">Volume</Label>
                    <Input
                      id="minimax_vol"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={miniMaxSettings.vol}
                      onChange={(e) => setMiniMaxSettings(prev => ({ ...prev, vol: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimax_pitch">Pitch</Label>
                    <Input
                      id="minimax_pitch"
                      type="number"
                      min="-20"
                      max="20"
                      step="1"
                      value={miniMaxSettings.pitch}
                      onChange={(e) => setMiniMaxSettings(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimax_format">Format</Label>
                    <Select value={miniMaxSettings.format} onValueChange={(value) => setMiniMaxSettings(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="wav">WAV</SelectItem>
                        <SelectItem value="flac">FLAC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateAudio}
                disabled={isGenerating || !text.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Audio...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Generate Audio
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div>
                <Label htmlFor="audio-upload">Upload Audio File</Label>
                <Input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: MP3, WAV, M4A, AAC. Max size: 50MB
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Audio Player and Actions */}
          {currentAudioUrl && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated Audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Audio Player */}
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Play
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {generatedAudioData?.duration_ms ? 
                        `Duration: ${Math.round(generatedAudioData.duration_ms / 1000)}s` : 
                        'Audio ready'
                      }
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {showDownloadButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAudio}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAudioUrl}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>

                    {showUseInLipSync && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUseInLipSync}
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        Use in Lip Sync
                      </Button>
                    )}

                    {showUseInVideo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUseInVideo}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Use in Video
                      </Button>
                    )}
                  </div>

                  {/* Audio Info */}
                  {generatedAudioData && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      <div>Provider: {selectedProvider === "elevenlabs" ? "ElevenLabs" : "MiniMax"}</div>
                      <div>Voice: {selectedVoice}</div>
                      {generatedAudioData.requestId && (
                        <div>Request ID: {generatedAudioData.requestId}</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={currentAudioUrl || undefined}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};
