"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { button as Button } from "@/components/ui/button";

const models = [
  // Image Models
  {
    id: "fal-ai/photon",
    name: "DirectorchairAI • Photon",
    description:
      "High-quality image generation with advanced style and character control",
    category: "image",
  },
  {
    id: "fal-ai/photon-instant",
    name: "DirectorchairAI • Photon Instant",
    description: "Fast image generation optimized for speed and efficiency",
    category: "image",
  },
  {
    id: "fal-ai/flux-pro/v1.1-ultra",
    name: "DirectorchairAI • Flux Pro 1.1 Ultra",
    description: "Professional grade image generation with ultra quality",
    category: "image",
  },
  {
    id: "fal-ai/stable-diffusion-3.5-large",
    name: "DirectorchairAI • Stable Diffusion 3.5 Large",
    description:
      "Advanced stable diffusion model for high-quality image generation",
    category: "image",
  },
  // Video Models
  {
    id: "fal-ai/minimax-video-01",
    name: "Minimax/Hailuo Video 01",
    description:
      "High quality video generation with realistic motion and physics",
    category: "video",
  },
  {
    id: "fal-ai/minimax-video-01-image-to-video",
    name: "Minimax/Hailuo Video 01 (Image to Video)",
    description:
      "Transform static images into dynamic videos with advanced motion",
    category: "video",
  },
  {
    id: "fal-ai/hunyuan",
    name: "DirectorchairAI • Hunyuan",
    description: "High visual quality with motion diversity and text alignment",
    category: "video",
  },
  {
    id: "fal-ai/kling-1.5-pro",
    name: "DirectorchairAI • Kling 1.5 Pro",
    description: "Professional video generation with advanced features",
    category: "video",
  },
  {
    id: "ray2",
    name: "DirectorchairAI • Luma Dream Machine 1.5",
    description: "High quality video generation",
    category: "video",
  },
  {
    id: "fal-ai/minimax/video-01-subject-reference",
    name: "Minimax/Hailuo Video 01 (Subject Reference)",
    description:
      "Text-to-video generation with subject reference image for consistent character appearance",
    category: "video",
  },
  // Audio Models
  {
    id: "fal-ai/mmaudio-v2",
    name: "DirectorchairAI • MMAudio V2",
    description: "Generate synchronized audio for videos",
    category: "audio",
  },
  {
    id: "fal-ai/sync-lipsync-1.8.0",
    name: "DirectorchairAI • sync.so Lipsync 1.8.0",
    description: "Generate realistic lipsync animations from audio",
    category: "audio",
  },
  // Music Models
  {
    id: "fal-ai/minimax-music",
    name: "Minimax/Hailuo Music",
    description: "AI-powered music generation",
    category: "music",
  },
  {
    id: "fal-ai/stable-audio",
    name: "DirectorchairAI • Stable Audio",
    description: "High-quality audio generation with stability",
    category: "music",
  },
];

export default function ModelsPage() {
  // Group models by category
  const groupedModels = models.reduce(
    (acc, model) => {
      if (!acc[model.category]) {
        acc[model.category] = [];
      }
      acc[model.category].push(model);
      return acc;
    },
    {} as Record<string, typeof models>,
  );

  return (
    <div className="mobile-container-sm mobile-py space-y-6 sm:space-y-8">
      <div className="space-y-2">
                    <h1 className="mobile-text-xl sm:text-2xl font-bold">DirectorchairAI Models</h1>
        <p className="mobile-text-sm sm:text-base text-muted-foreground">
          Select a model to get started with generation
        </p>
      </div>

      {Object.entries(groupedModels).map(([category, categoryModels]) => (
        <div key={category} className="space-y-4">
          <h2 className="mobile-text-lg sm:text-xl font-semibold capitalize">
            {category} Models
          </h2>
          <div className="mobile-grid-2 gap-4">
            {categoryModels.map((model) => (
              <Card key={model.id} className="mobile-card space-y-4">
                <div className="space-y-2">
                  <h3 className="mobile-text-base sm:text-lg font-semibold">{model.name}</h3>
                  <p className="mobile-text-xs sm:text-sm text-muted-foreground">
                    {model.description}
                  </p>
                </div>
                <Button asChild className="w-full mobile-btn mobile-touch-target">
                  <Link
                    href={`/models/${model.category}/${model.id.replace("/", "%2F")}`}
                  >
                    Use Model
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
