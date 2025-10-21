"use client";

import { button as Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { AvailableModelsShowcase } from "@/components/model-icons"; // Removed - component deleted
import Link from "next/link";
import { ArrowRight, Sparkles, Video, Image, Music, Mic, Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SimpleVideoGallery } from "@/components/simple-video-gallery";
// Content filtering removed - user has full control over prompts

export default function HomePage() {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/Untitled Project (1).jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-blue-500/10" />
        
        <div className="relative z-20 mobile-container py-12 sm:py-16 lg:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="mobile-text-4xl sm:text-6xl lg:text-8xl font-black text-foreground leading-tight drop-shadow-lg">
                DirectorchairAi
                <span className="block text-purple-500">Your Creative Studio</span>
              </h1>
              
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Access all your favorite AI models in one clean interface. 
                Simple dropdowns, drag-and-drop uploads, and intuitive controls 
                for intermediate to professional creators.
              </p>
              
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button asChild size="lg" className="text-lg rounded-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/timeline">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Creating Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <SimpleVideoGallery />
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid Section - Row 1 */}
      <div className="mobile-py relative z-20">
        <div className="mobile-container">
          <div className="mobile-video-grid">
            <VideoBackgroundSection 
              videoSrc="/dragon.mp4"
              title="Cinematic Dragon"
              description="Experience the power of AI-generated cinematic content"
              overlayColor="from-red-500/20 to-orange-500/20"
            />
            <VideoBackgroundSection 
              videoSrc="/Nayri.mp4"
              title="AI-Generated Art"
              description="Witness the creativity of artificial intelligence"
              overlayColor="from-purple-500/20 to-pink-500/20"
            />
            <VideoBackgroundSection 
              videoSrc="/dorthy.mp4"
              title="Digital Dreams"
              description="Transform your ideas into visual reality"
              overlayColor="from-blue-500/20 to-cyan-500/20"
            />
            <VideoBackgroundSection 
              videoSrc="/murdercrow.mp4"
              title="Dark Cinematics"
              description="Explore the darker side of AI creativity"
              overlayColor="from-gray-500/20 to-slate-500/20"
            />
          </div>
        </div>
      </div>

      {/* Video Grid Section - Row 2 */}
      <div className="mobile-py relative z-20">
        <div className="mobile-container">
          <div className="mobile-video-grid">
            <VideoBackgroundSection 
              videoSrc="/91b9d7be-bb33-4df3-af75-85c7bc3f9d79.mp4"
              title="Dynamic Motion"
              description="Advanced motion generation with AI"
              overlayColor="from-green-500/20 to-emerald-500/20"
            />
            <VideoBackgroundSection 
              videoSrc="/adarkorchestra_28188__--ar_21_--bs_2_--video_1_--end_loop_5f2e42e9-a7fb-492c-9ec8-cb1b4596066d_0.mp4"
              title="Orchestral Dreams"
              description="Symphonic visual storytelling"
              overlayColor="from-indigo-500/20 to-purple-500/20"
            />
            <VideoBackgroundSection 
              videoSrc="/emily.mp4"
              title="Emily's World"
              description="Portrait of digital beauty and grace"
              overlayColor="from-red-500/20 to-yellow-500/20"
            />
                         <VideoBackgroundSection 
               videoSrc="/adarkorchestra_28188_a_close_up_of_a_woman_in_a_figure_drawin_940529d4-6e22-4aea-8db9-ca561ddc3685_2.mp4"
               title="Portrait Beauty"
               description="Close-up portrait of digital elegance"
               overlayColor="from-pink-500/20 to-rose-500/20"
             />
          </div>
        </div>
      </div>

      {/* AI Models Section */}
      <div className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <Image className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Image Models
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Access Flux Pro, Stable Diffusion, Google Imagen, and other 
                  leading image generation models in one interface.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <Video className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Video Models
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Use Sora, Kling, Luma Dream Machine, and other video models 
                  without switching between different platforms.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <Music className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Audio & Voice Models
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  ElevenLabs, MiniMax voice cloning, TTS, and audio generation 
                  models accessible through one streamlined interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mobile-py bg-background/20 relative z-20">
        <div className="mobile-container">
          <div className="text-center mb-12 sm:mb-16">
                      <h2 className="mobile-text-2xl sm:text-4xl font-black text-foreground mb-4 drop-shadow-lg">
            Professional AI Tools
          </h2>
            <p className="mobile-text-base sm:text-xl text-muted-foreground mobile-container-sm">
              Everything you need to create stunning media content with AI assistance
            </p>
          </div>
          
          <div className="mobile-grid-2 lg:grid-cols-4 mobile-gap">
            {[
              {
                icon: Image,
                title: "Image Generation",
                description: "Create stunning images with professional-grade AI models",
                color: "from-orange-400 to-red-500"
              },
              {
                icon: Video,
                title: "Video Creation",
                description: "Generate videos with cinematic quality and motion",
                color: "from-blue-400 to-purple-500"
              },
              {
                icon: Music,
                title: "Audio Generation",
                description: "Compose music and soundscapes with AI",
                color: "from-green-400 to-teal-500"
              },
              {
                icon: Mic,
                title: "Voice Synthesis",
                description: "Create natural voiceovers and narration",
                color: "from-pink-400 to-rose-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/30 backdrop-blur-sm border-border/30">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid Section - Row 3 */}
      <div className="py-8 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <VideoBackgroundSection 
               videoSrc="/2025-06-18T16-54-52_closeup_shot_.mp4"
               title="Digital Transformation"
               description="Transform reality with digital magic"
               overlayColor="from-cyan-500/20 to-blue-500/20"
             />
                         <VideoBackgroundSection 
               videoSrc="/2025-06-10T19-49-58_generation.mp4"
               title="Gothic Aesthetics"
               description="Dark and mysterious visual narratives"
               overlayColor="from-slate-500/20 to-gray-500/20"
             />
                         <VideoBackgroundSection 
               videoSrc="/2025-06-10T11-51-32_generation.mp4"
               title="Fluid Motion"
               description="Smooth and natural movement generation"
               overlayColor="from-teal-500/20 to-green-500/20"
             />
                         <VideoBackgroundSection 
               videoSrc="/91b9d7be-bb33-4df3-af75-85c7bc3f9d79.mp4"
               title="Symphonic Visuals"
               description="Music-inspired visual storytelling"
               overlayColor="from-violet-500/20 to-indigo-500/20"
             />
          </div>
        </div>
      </div>

      {/* AI Models Showcase */}
      <div className="mobile-py bg-muted/20 relative z-20">
        <div className="mobile-container">
          {/* <AvailableModelsShowcase /> Removed - component deleted */}
        </div>
      </div>

      {/* Video Grid Section - Row 4 */}
      <div className="mobile-py relative z-20">
        <div className="mobile-container">
          <div className="mobile-video-grid">
                         <VideoBackgroundSection 
               videoSrc="/adarkorchestra_28188__--ar_21_--bs_2_--video_1_--end_loop_5f2e42e9-a7fb-492c-9ec8-cb1b4596066d_0.mp4"
               title="Mythical Creatures"
               description="Bring legends to life with AI"
               overlayColor="from-amber-500/20 to-orange-500/20"
             />
                         <VideoBackgroundSection 
               videoSrc="/2025-04-28T21-06-16__static.mp4"
               title="Creative Expression"
               description="Unleash your artistic vision"
               overlayColor="from-fuchsia-500/20 to-pink-500/20"
             />
                         <VideoBackgroundSection 
               videoSrc="/adarkorchestra_28188_a_close_up_of_a_woman_in_a_figure_drawin_940529d4-6e22-4aea-8db9-ca561ddc3685_2.mp4"
               title="Dream Worlds"
               description="Create impossible realities"
               overlayColor="from-sky-500/20 to-cyan-500/20"
             />
             <VideoBackgroundSection 
               videoSrc="/video_cdfddbe6dc7c4c6ab48150b7bd59729f.mp4"
               title="Dark Fantasy"
               description="Explore the depths of imagination"
               overlayColor="from-zinc-500/20 to-slate-500/20"
             />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Ready to Create with AI?
          </h2>
          <p className="mt-3 text-lg text-gray-500 mb-8">
            Skip the platform hopping. Access all your favorite AI models in one place 
            with simple controls and professional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild
              size="lg"
              className="text-lg bg-purple-600 hover:bg-purple-700"
            >
              <Link href="/timeline">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild
              size="lg"
              variant="outline"
              className="text-lg"
            >
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mobile-py border-t border-border/30 relative z-20 bg-background/40">
        <div className="mobile-container text-center">
          <p className="mobile-text-sm text-muted-foreground">
            © 2024 DirectorchairAi. All rights reserved. Built by DeeptechAi.
          </p>
        </div>
      </footer>

      {/* Content filtering removed - user has full control over prompts */}
    </div>
  );
}

// Video Background Component
interface VideoBackgroundSectionProps {
  videoSrc: string;
  title: string;
  description: string;
  overlayColor: string;
}

function VideoBackgroundSection({ videoSrc, title, description, overlayColor }: VideoBackgroundSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="relative h-32 sm:h-40 lg:h-48 overflow-hidden cursor-pointer group rounded-lg mobile-touch-target"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${overlayColor} transition-opacity duration-300 group-hover:opacity-50`} />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white space-y-1 sm:space-y-2 p-3 sm:p-4">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            {isPlaying ? (
              <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse" />
            ) : (
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            )}
          </div>
          <h3 className="mobile-text-xs sm:text-sm font-bold">{title}</h3>
          <p className="mobile-text-xs opacity-90">{description}</p>
        </div>
      </div>

      {/* Play/Pause Indicator */}
      <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        {isPlaying ? (
          <Pause className="w-3 h-3 text-white" />
        ) : (
          <Play className="w-3 h-3 text-white" />
        )}
      </div>
    </div>
  );
} 