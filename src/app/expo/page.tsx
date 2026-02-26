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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-neutral-600 tracking-widest mb-3">GENERATE</p>
              <h1 className="font-display text-4xl lg:text-5xl font-normal text-white tracking-tight mb-2">
                Seedance 2.0
              </h1>
              <p className="text-sm text-neutral-400 font-light">
                Generate cinematic videos with BytePlus Seedance AI
              </p>
            </div>
            <Link href="/timeline" className="text-xs font-light text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 px-4 py-2 transition-all">
              Back to Studio
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Generation Controls */}
          <div className="border border-neutral-800 p-8">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-lg font-medium text-white tracking-tight">
                <Sparkles className="w-5 h-5 text-neutral-500" />
                Video Generation
              </h2>
              <p className="text-sm text-neutral-500 font-light mt-1">
                Describe your vision and let Seedance 2.0 bring it to life
              </p>
            </div>
            <div className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-xs text-neutral-400 tracking-wider uppercase">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Tom Cruise fighting Brad Pitt on a rooftop, cinematic action scene with dramatic lighting..."
                  className="min-h-[120px] resize-none bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600"
                  disabled={loading}
                />
                <p className="text-xs text-neutral-600">
                  Be specific and descriptive for best results
                </p>
              </div>

              {/* Duration Slider */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs text-neutral-400 tracking-wider uppercase">Duration: {duration}s</Label>
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
                <Label htmlFor="resolution" className="text-xs text-neutral-400 tracking-wider uppercase">Resolution</Label>
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
                <Label htmlFor="ratio" className="text-xs text-neutral-400 tracking-wider uppercase">Aspect Ratio</Label>
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
              <button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 bg-white text-neutral-950 hover:bg-neutral-100 transition-all duration-300 text-sm font-medium tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    GENERATING...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    GENERATE VIDEO
                  </span>
                )}
              </button>

              {/* Status and Progress */}
              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">{status}</span>
                    <span className="text-neutral-500">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Video Preview */}
          <div className="border border-neutral-800 p-8">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-lg font-medium text-white tracking-tight">
                <Play className="w-5 h-5 text-neutral-500" />
                Preview
              </h2>
              <p className="text-sm text-neutral-500 font-light mt-1">
                Your generated video will appear here
              </p>
            </div>
            <div>
              {videoUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                      autoPlay
                      loop
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadVideo}
                      className="flex-1 py-3 text-xs font-light tracking-wider text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD
                    </button>
                    <button
                      onClick={() => {
                        setVideoUrl(null);
                        setPrompt('');
                        setProgress(0);
                        setStatus('');
                      }}
                      className="flex-1 py-3 text-xs font-light tracking-wider text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-all"
                    >
                      GENERATE NEW
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-neutral-900 flex items-center justify-center border border-dashed border-neutral-800">
                  <div className="text-center p-8">
                    <Video className="w-12 h-12 mx-auto mb-4 text-neutral-700" />
                    <p className="text-neutral-500 text-sm mb-1">No video generated yet</p>
                    <p className="text-xs text-neutral-600">
                      Enter a prompt and click Generate to create your video
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: "⚡", title: "Fast Generation", desc: "Seedance 2.0 generates high-quality videos in 1-5 minutes" },
            { icon: "🎬", title: "Cinematic Quality", desc: "Professional-grade video output with advanced AI models" },
            { icon: "🎨", title: "Creative Control", desc: "Fine-tune duration, resolution, and aspect ratio" },
          ].map((card, i) => (
            <div key={i} className="p-6 border border-neutral-800 hover:border-neutral-700 transition-all">
              <p className="text-lg mb-3">{card.icon}</p>
              <h3 className="text-sm font-medium text-white tracking-tight mb-2">{card.title}</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

