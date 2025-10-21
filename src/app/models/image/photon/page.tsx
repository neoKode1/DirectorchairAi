"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { button as Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Upload, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PhotonModelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for image generation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'fal-ai/photon',
          prompt: prompt.trim(),
          image_url: imageUrl || undefined,
          aspect_ratio: '16:9'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast({
          title: "Success!",
          description: "Image generated successfully.",
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred during generation.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `photon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => router.push('/models')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Models
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Photon Model
              </CardTitle>
              <CardDescription>
                Generate high-quality images using the unified FAL API service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Image URL (Optional)</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
              <CardDescription>
                Your generated image will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result?.data?.images?.[0] ? (
                <div className="space-y-4">
                  <img 
                    src={result.data.images[0].url} 
                    alt={prompt}
                    className="w-full h-auto rounded-lg"
                  />
                  <Button 
                    onClick={() => handleDownload(result.data.images[0].url)}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No image generated yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}