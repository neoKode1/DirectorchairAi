"use client";

import { button as Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AvailableModelsShowcase } from "@/components/model-icons";
import Link from "next/link";
import { ArrowRight, Sparkles, Video, Image, Music, Mic, Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 className="mobile-text-4xl sm:text-6xl lg:text-8xl font-black text-foreground leading-tight drop-shadow-lg">
              DirectorchairAI
            </h1>
            
            <p className="mobile-text-lg sm:text-2xl lg:text-3xl font-semibold text-muted-foreground mobile-container-sm">
              AI-Powered Media Studio with Film Director Intelligence
            </p>
            
            <p className="mobile-text-base sm:text-lg text-muted-foreground mobile-container-sm">
              Create professional media with AI that thinks like a film director. Generate images, videos, audio, and voiceovers using natural language and get intelligent cinematographic guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 sm:pt-8">
              <Button asChild size="lg" className="mobile-btn-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-4 mobile-touch-target shadow-lg">
                <Link href="/timeline">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="mobile-btn-lg mobile-touch-target bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold text-lg px-8 py-4">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
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
          <AvailableModelsShowcase />
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
      <div className="mobile-py bg-background/30 relative z-20">
        <div className="mobile-container text-center">
          <h2 className="mobile-text-2xl sm:text-4xl font-black text-foreground mb-4 drop-shadow-lg">
            Ready to Create?
          </h2>
          <p className="mobile-text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 mobile-container-sm">
            Join thousands of creators using AI to bring their vision to life
          </p>
          <Button asChild size="lg" className="mobile-btn-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-4 mobile-touch-target shadow-lg">
            <Link href="/timeline">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mobile-py border-t border-border/30 relative z-20 bg-background/40">
        <div className="mobile-container text-center">
          <p className="mobile-text-sm text-muted-foreground">
            © 2024 DirectorchairAI. All rights reserved. Built by DeeptechAi.
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