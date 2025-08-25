"use client";

import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import Link from "next/link";
import { cn } from "@/lib/utils";

function groupEndpointsByCategory() {
  return AVAILABLE_ENDPOINTS.reduce(
    (acc, endpoint) => {
      const category = endpoint.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(endpoint);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_ENDPOINTS>,
  );
}

// Helper function to format model name
function formatModelName(endpoint: (typeof AVAILABLE_ENDPOINTS)[0]) {
  const name = endpoint.label;
  if (
    endpoint.endpointId === "Photon" ||
    endpoint.endpointId === "Photon-Instant"
  ) {
    return `DirectorchairAI • ${name}`;
  }
  if (endpoint.endpointId.includes("minimax")) {
    return `DirectorchairAI • Minimax ${name.replace("Minimax ", "")}`;
  }
  if (endpoint.endpointId.includes("luma")) {
    return `DirectorchairAI • ${name}`;
  }
  return `DirectorchairAI • ${name}`;
}

export default function ModelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Group endpoints by category
  const categories = groupEndpointsByCategory();

  // Category display order and labels
  const categoryOrder = ["image", "video", "music", "voiceover"] as const;
  const categoryLabels: Record<(typeof categoryOrder)[number], string> = {
    image: "Image Models",
    video: "Video Models",
    music: "Music Models",
    voiceover: "Voice Models",
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="mobile-sidebar w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 mobile-text-base sm:text-lg font-semibold">Models</h2>
            <div className="space-y-1">
              {categoryOrder.map(
                (category) =>
                  categories[category] && (
                    <div key={category} className="mb-6">
                      <h3 className="px-4 mobile-text-xs sm:text-sm font-medium text-muted-foreground mb-2 uppercase">
                        {categoryLabels[category]}
                      </h3>
                      <div className="space-y-1">
                        {categories[category].map((endpoint) => (
                          <Link
                            key={endpoint.endpointId}
                            href={`/models/${category}/${encodeURIComponent(endpoint.endpointId)}`}
                            className={cn(
                              "block px-4 py-1.5 mobile-text-xs sm:text-sm",
                              "hover:bg-accent hover:text-accent-foreground",
                              "transition-colors mobile-touch-target",
                            )}
                          >
                            {formatModelName(endpoint)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="h-full max-w-5xl mx-auto mobile-px mobile-py">{children}</div>
      </div>
    </div>
  );
}
