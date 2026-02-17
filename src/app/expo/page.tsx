'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Video, Download, Sparkles, Play } from 'lucide-react';
import Link from 'next/link';

export default function ExpoPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(10);
  const [resolution, setResolution] = useState('1080p');
  const [ratio, setRatio] = useState('16:9');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setStatus('Creating task...');
    setProgress(10);
    setVideoUrl(null);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, resolution, ratio }),
      });

      const data = await res.json();

      if (data.task_id) {
        setTaskId(data.task_id);
        setStatus('Task created, generating video...');
        setProgress(30);
        poll(data.task_id);
      } else {
        throw new Error(data.error?.message || 'Failed to create task');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setStatus('');
      setLoading(false);
    }
  };

  const poll = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/poll-task/${id}`);
        const data = await res.json();

        setStatus(data.status || 'Processing...');

        if (data.status === 'succeeded') {
          setVideoUrl(data.result?.video_url || data.video_url);
          setStatus('Video generated successfully!');
          setProgress(100);
          setLoading(false);
          clearInterval(interval);
          toast({
            title: 'Success!',
            description: 'Your video has been generated',
          });
        } else if (data.status === 'failed') {
          setStatus('Failed: ' + (data.error || 'Unknown error'));
          setLoading(false);
          clearInterval(interval);
          toast({
            title: 'Generation Failed',
            description: data.error || 'Unknown error',
            variant: 'destructive',
          });
        } else if (data.status === 'running') {
          setProgress(Math.min(progress + 5, 90));
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        setLoading(false);
        setStatus('Polling error');
      }
    }, 10000); // Poll every 10 seconds

    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `seedance-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                EXPO - Seedance 2.0
              </h1>
              <p className="text-muted-foreground">
                Generate cinematic videos with BytePlus Seedance AI
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/timeline">Back to Studio</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Generation Controls */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Video Generation
              </CardTitle>
              <CardDescription>
                Describe your vision and let Seedance 2.0 bring it to life
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Tom Cruise fighting Brad Pitt on a rooftop, cinematic action scene with dramatic lighting..."
                  className="min-h-[120px] resize-none"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific and descriptive for best results
                </p>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration: {duration}s</Label>
                <Slider
                  id="duration"
                  min={5}
                  max={30}
                  step={5}
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* Resolution Select */}
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution} disabled={loading}>
                  <SelectTrigger id="resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Aspect Ratio Select */}
              <div className="space-y-2">
                <Label htmlFor="ratio">Aspect Ratio</Label>
                <Select value={ratio} onValueChange={setRatio} disabled={loading}>
                  <SelectTrigger id="ratio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>

              {/* Status and Progress */}
              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{status}</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Video Preview */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-cyan-500" />
                Preview
              </CardTitle>
              <CardDescription>
                Your generated video will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videoUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                      autoPlay
                      loop
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadVideo}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => {
                        setVideoUrl(null);
                        setPrompt('');
                        setProgress(0);
                        setStatus('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Generate New
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center p-8">
                    <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-2">No video generated yet</p>
                    <p className="text-sm text-muted-foreground/70">
                      Enter a prompt and click Generate to create your video
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">⚡ Fast Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Seedance 2.0 generates high-quality videos in 1-5 minutes
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">🎬 Cinematic Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Professional-grade video output with advanced AI models
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">🎨 Creative Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Fine-tune duration, resolution, and aspect ratio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

