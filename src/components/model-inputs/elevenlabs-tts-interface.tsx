"use client";

import React, { useState } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Volume2, Play, Download, Settings } from 'lucide-react';

interface ElevenLabsTTSInterfaceProps {
  onGenerate: (result: any) => void;
}

const VOICES = [
  "Rachel", "Aria", "Domi", "Bella", "Antoni", "Thomas", "Josh", "Arnold", 
  "Adam", "Sam", "Callum", "Serena", "Fin", "Grace", "Daniel", "Sarah",
  "Charlie", "George", "Emily", "Michael", "Ethan", "Gigi", "Freya", "Blair",
  "Jessie", "Ryan", "Sammy", "Glinda", "Giovanni", "Mimi", "Clyde", "Serena"
];

export const ElevenLabsTTSInterface: React.FC<ElevenLabsTTSInterfaceProps> = ({ onGenerate }) => {
  const { toast } = useToast();
  const [text, setText] = useState("Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?");
  const [voice, setVoice] = useState("Rachel");
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [style, setStyle] = useState([0.0]);
  const [speed, setSpeed] = useState([1.0]);
  const [timestamps, setTimestamps] = useState(false);
  const [previousText, setPreviousText] = useState("");
  const [nextText, setNextText] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
        endpointId: "fal-ai/elevenlabs/tts/multilingual-v2",
        text: text.trim(),
        voice,
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0],
        speed: speed[0],
        timestamps,
        ...(previousText && { previous_text: previousText }),
        ...(nextText && { next_text: nextText }),
        ...(languageCode && { language_code: languageCode }),
      };

      console.log('🎤 [ElevenLabs TTS] Generating speech with:', generateData);

      const response = await fetch('/api/generate/elevenlabs-tts', {
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
      console.log('✅ [ElevenLabs TTS] Generation result:', result);

      onGenerate(result);

      toast({
        title: "Speech Generated!",
        description: "Your audio has been created successfully.",
      });

    } catch (error) {
      console.error('❌ [ElevenLabs TTS] Generation error:', error);
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
    // Rough estimate: $0.30 per 1K characters
    const charCount = text.length;
    const cost = (charCount / 1000) * 0.30;
    return cost.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            ElevenLabs Text-to-Speech
          </CardTitle>
          <CardDescription>
            High-quality multilingual text-to-speech with natural intonation and multiple voices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text">Text to Convert</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="min-h-[120px]"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{text.length} characters</span>
              <span>~${calculateCost()}</span>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voiceOption) => (
                  <SelectItem key={voiceOption} value={voiceOption}>
                    {voiceOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label>Voice Settings</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Stability: {stability[0]}</Label>
                  <Badge variant="secondary">0-1</Badge>
                </div>
                <Slider
                  value={stability}
                  onValueChange={setStability}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make the voice more consistent but less expressive
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Similarity Boost: {similarityBoost[0]}</Label>
                  <Badge variant="secondary">0-1</Badge>
                </div>
                <Slider
                  value={similarityBoost}
                  onValueChange={setSimilarityBoost}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make the voice more similar to the original
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Style: {style[0]}</Label>
                  <Badge variant="secondary">0-1</Badge>
                </div>
                <Slider
                  value={style}
                  onValueChange={setStyle}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values add more style exaggeration
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Speed: {speed[0]}x</Label>
                  <Badge variant="secondary">0.7-1.2</Badge>
                </div>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  max={1.2}
                  min={0.7}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Speech speed multiplier
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="timestamps"
                checked={timestamps}
                onCheckedChange={setTimestamps}
              />
              <Label htmlFor="timestamps">Include Word Timestamps</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousText">Previous Text (for continuity)</Label>
                <Textarea
                  id="previousText"
                  value={previousText}
                  onChange={(e) => setPreviousText(e.target.value)}
                  placeholder="Text that came before..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextText">Next Text (for continuity)</Label>
                <Textarea
                  id="nextText"
                  value={nextText}
                  onChange={(e) => setNextText(e.target.value)}
                  placeholder="Text that comes after..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languageCode">Language Code (ISO 639-1)</Label>
              <Input
                id="languageCode"
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                placeholder="en, es, fr, de, etc. (optional)"
              />
              <p className="text-xs text-muted-foreground">
                Only supported for Turbo v2.5 and Flash v2.5 models
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Speech...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate Speech
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
