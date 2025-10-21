"use client";

import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
   // Return the clean model name without the "DirectorchairAI •" prefix
   return endpoint.label;
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

  // Define category icons
  const categoryIcons: Record<(typeof categoryOrder)[number], (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
    image: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15.5 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>,
    video: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M11 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>,
    music: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 18V5l12-2v13"/><path d="M6 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>,
    voiceover: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>,
  };

  // Helper function to get model icon - using actual icons from public folder
  function getModelIcon(endpointId: string) {
    // Image models
    if (endpointId.includes('imagen')) return '/gemini-color.png'; // Google Imagen
    if (endpointId.includes('stable-diffusion')) return '/gemini-color.png'; // Stable Diffusion
    if (endpointId.includes('dreamina')) return '/bytedance-color.webp'; // Dreamina
    if (endpointId.includes('flux')) return '/flux.png'; // Flux models
    if (endpointId.includes('nano-banana')) return '/flux.png'; // Nano Banana (Advanced Controls)
    if (endpointId.includes('gemini')) return '/gemini-color.png'; // Gemini 2.5 Flash (Multi-Image)
    if (endpointId.includes('ideogram')) return '/ideogram.png'; // Ideogram
    
    // Video models
    if (endpointId.includes('veo')) return '/gemini-color.png'; // Google Veo
    if (endpointId.includes('kling')) return '/kling-color.png'; // Kling
    if (endpointId.includes('luma')) return '/dreammachine.png'; // Luma
    if (endpointId.includes('minimax')) return '/minimax-color.png'; // Minimax
    if (endpointId.includes('seedance')) return '/bytedance-color.webp'; // Seedance
    
    // Voice models
    if (endpointId.includes('elevenlabs')) return '/elevenlabs.png'; // ElevenLabs
    
    return '/gemini-color.png'; // default fallback
  }

  return (
    <div 
      className="flex min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/Gen4.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        filter: 'brightness(0.8) contrast(1.2)', // Improve background clarity
      }}
    >
      {/* Reduced overlay for better background visibility */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      
      {/* Sidebar Navigation */}
      <div className="mobile-sidebar w-64 border-r border-white/10 bg-white/5 backdrop-blur-[0.5px] relative z-10">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-4 px-4 mobile-text-base sm:text-lg font-semibold text-white drop-shadow-lg">Models</h2>
            <div className="space-y-1">
              {categoryOrder.map(
                (category) =>
                  categories[category] && (
                    <div key={category} className="mb-6">
                      <div className="flex items-center gap-2 px-4 mobile-text-xs sm:text-sm font-medium text-white/90 mb-3 uppercase tracking-wider">
                        {(() => {
                          const CategoryIcon = categoryIcons[category];
                          return <CategoryIcon className="w-4 h-4" />;
                        })()}
                        {categoryLabels[category]}
                      </div>
                      <div className="space-y-1">
                        {categories[category].map((endpoint) => {
                          const iconSrc = getModelIcon(endpoint.endpointId);
                          
                          return (
                            <Link
                              key={endpoint.endpointId}
                              href={`/models/${category}/${encodeURIComponent(endpoint.endpointId)}`}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 mobile-text-xs sm:text-sm text-white/90 hover:text-white",
                                "hover:bg-white/20 rounded-md transition-all duration-300 mobile-touch-target",
                                "group relative overflow-hidden"
                              )}
                            >
                              <div className="w-4 h-4 flex-shrink-0 rounded overflow-hidden bg-white/30">
                                <Image
                                  src={iconSrc}
                                  alt={`${endpoint.label} icon`}
                                  width={16}
                                  height={16}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="truncate">{formatModelName(endpoint)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <div className="h-full max-w-7xl mx-auto mobile-px mobile-py">{children}</div>
      </div>
    </div>
  );
}
