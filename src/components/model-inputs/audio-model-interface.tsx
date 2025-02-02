import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AudioModelInterfaceProps {
  modelInfo: {
    id: string;
    name: string;
    description: string;
  };
  onSubmit: (result: any) => void;
}

export function AudioModelInterface({ modelInfo, onSubmit }: AudioModelInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [numSteps, setNumSteps] = useState(25);
  const [duration, setDuration] = useState(8);
  const [cfgStrength, setCfgStrength] = useState(4.5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          num_steps: numSteps,
          duration,
          cfg_strength: cfgStrength,
          model: modelInfo.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSubmit(result);
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Audio Generation Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use Audio Generation</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Prompt</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe the type of audio you want to generate. Be specific about the style, mood, and instruments.
                      Example: "Indian holy music with tabla and sitar"
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Number of Steps</h3>
                    <p className="text-sm text-muted-foreground">
                      Controls the quality of the generation. Higher values (max 50) produce better quality but take longer.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Duration</h3>
                    <p className="text-sm text-muted-foreground">
                      Length of the generated audio in seconds (1-30 seconds).
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">CFG Strength</h3>
                    <p className="text-sm text-muted-foreground">
                      Controls how closely the generation follows your prompt. Higher values (1-10) stick closer to the prompt but might be less creative.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            placeholder="Describe the audio you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="num_steps">Number of Steps: {numSteps}</Label>
            </div>
            <Slider
              id="num_steps"
              min={1}
              max={50}
              step={1}
              value={[numSteps]}
              onValueChange={([value]) => setNumSteps(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="duration">Duration (seconds): {duration}</Label>
            </div>
            <Slider
              id="duration"
              min={1}
              max={30}
              step={1}
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="cfg_strength">CFG Strength: {cfgStrength}</Label>
            </div>
            <Slider
              id="cfg_strength"
              min={1}
              max={10}
              step={0.1}
              value={[cfgStrength]}
              onValueChange={([value]) => setCfgStrength(value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Audio"}
        </Button>
      </form>
    </div>
  );
} 