"use client";

import Link from "next/link";
import { ArrowRight, Play, Pause, Video, Image, Music, Mic } from "lucide-react";
import { useState, useRef } from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/Untitled Project (1).jpg"
        >
          <source src="/dragon.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/40" />
        <div className="absolute inset-0 grain pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-normal text-white tracking-tight mb-4 fade-in">
            DIRECTORCHAIR AI
          </h1>
          <p className="text-sm md:text-base font-light text-neutral-400 tracking-widest mb-10 fade-in" style={{ animationDelay: '0.2s' }}>
            AI-POWERED MEDIA STUDIO
          </p>

          <div className="flex items-center gap-4 fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/timeline"
              className="group flex items-center gap-3 px-6 py-3 border border-neutral-700 hover:border-neutral-500 hover:bg-white/5 transition-all duration-300"
            >
              <Play className="w-4 h-4 text-white" />
              <span className="text-xs font-medium tracking-wider text-white">START CREATING</span>
            </Link>
            <Link
              href="/auth/signin"
              className="px-6 py-3 text-xs font-light tracking-wider text-neutral-400 hover:text-white transition-colors"
            >
              SIGN IN
            </Link>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-6 left-6 right-6 lg:left-12 lg:right-12 flex justify-between items-end z-10">
          <div className="flex gap-6 text-xs text-neutral-500 font-light">
            <span>AI Video Generation</span>
            <span className="hidden md:inline">Available worldwide</span>
          </div>
          <span className="text-xs text-neutral-600">© 2024 DEEPTECH</span>
        </div>
      </section>

      {/* Work Section - Row 1 */}
      <section className="bg-neutral-950 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-12 lg:mb-16">
            <p className="text-xs text-neutral-600 tracking-widest mb-3">PORTFOLIO</p>
            <h2 className="font-display text-4xl lg:text-5xl font-normal text-white tracking-tight">Selected Work</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <VideoBackgroundSection videoSrc="/dragon.mp4" title="Cinematic Dragon" description="AI-generated cinematic content" index="01" />
            <VideoBackgroundSection videoSrc="/Nayri.mp4" title="AI-Generated Art" description="Artificial intelligence creativity" index="02" />
            <VideoBackgroundSection videoSrc="/dorthy.mp4" title="Digital Dreams" description="Ideas into visual reality" index="03" />
            <VideoBackgroundSection videoSrc="/murdercrow.mp4" title="Dark Cinematics" description="Darker side of AI creativity" index="04" />
          </div>
        </div>
      </section>

      {/* Work Section - Row 2 */}
      <section className="bg-neutral-900 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <VideoBackgroundSection videoSrc="/91b9d7be-bb33-4df3-af75-85c7bc3f9d79.mp4" title="Dynamic Motion" description="Advanced motion generation" index="05" />
            <VideoBackgroundSection videoSrc="/adarkorchestra_28188__--ar_21_--bs_2_--video_1_--end_loop_5f2e42e9-a7fb-492c-9ec8-cb1b4596066d_0.mp4" title="Orchestral Dreams" description="Symphonic visual storytelling" index="06" />
            <VideoBackgroundSection videoSrc="/emily.mp4" title="Emily&apos;s World" description="Portrait of digital beauty" index="07" />
            <VideoBackgroundSection videoSrc="/adarkorchestra_28188_a_close_up_of_a_woman_in_a_figure_drawin_940529d4-6e22-4aea-8db9-ca561ddc3685_2.mp4" title="Portrait Beauty" description="Close-up portrait elegance" index="08" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-neutral-950 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-xs text-neutral-600 tracking-widest mb-3">SERVICES</p>
            <h2 className="font-display text-4xl lg:text-5xl font-normal text-white tracking-tight">Professional AI Tools</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Image, title: "Image Generation", description: "Create stunning images with professional-grade AI models", detail: "FLUX • Stable Diffusion • DALL-E" },
              { icon: Video, title: "Video Creation", description: "Generate videos with cinematic quality and motion", detail: "Sora • Veo • Kling • Wan" },
              { icon: Music, title: "Audio Generation", description: "Compose music and soundscapes with AI", detail: "Sound design • Scoring" },
              { icon: Mic, title: "Voice Synthesis", description: "Create natural voiceovers and narration", detail: "TTS • Narration • Dialogue" },
            ].map((feature, index) => (
              <div key={index} className="group p-8 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-neutral-500 group-hover:text-white transition-colors mb-6" />
                <h3 className="text-lg font-medium text-white tracking-tight mb-3">{feature.title}</h3>
                <p className="text-sm text-neutral-500 font-light leading-relaxed mb-4">{feature.description}</p>
                <p className="text-xs text-neutral-600">{feature.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Section - Row 3 */}
      <section className="bg-neutral-950 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <VideoBackgroundSection videoSrc="/2025-06-18T16-54-52_closeup_shot_.mp4" title="Digital Transformation" description="Transform reality with digital magic" index="09" />
            <VideoBackgroundSection videoSrc="/2025-06-10T19-49-58_generation.mp4" title="Gothic Aesthetics" description="Dark and mysterious narratives" index="10" />
            <VideoBackgroundSection videoSrc="/2025-06-10T11-51-32_generation.mp4" title="Fluid Motion" description="Smooth and natural movement" index="11" />
            <VideoBackgroundSection videoSrc="/91b9d7be-bb33-4df3-af75-85c7bc3f9d79.mp4" title="Symphonic Visuals" description="Music-inspired storytelling" index="12" />
          </div>
        </div>
      </section>

      {/* Work Section - Row 4 */}
      <section className="bg-neutral-900 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <VideoBackgroundSection videoSrc="/adarkorchestra_28188__--ar_21_--bs_2_--video_1_--end_loop_5f2e42e9-a7fb-492c-9ec8-cb1b4596066d_0.mp4" title="Mythical Creatures" description="Bring legends to life with AI" index="13" />
            <VideoBackgroundSection videoSrc="/2025-04-28T21-06-16__static.mp4" title="Creative Expression" description="Unleash your artistic vision" index="14" />
            <VideoBackgroundSection videoSrc="/adarkorchestra_28188_a_close_up_of_a_woman_in_a_figure_drawin_940529d4-6e22-4aea-8db9-ca561ddc3685_2.mp4" title="Dream Worlds" description="Create impossible realities" index="15" />
            <VideoBackgroundSection videoSrc="/video_cdfddbe6dc7c4c6ab48150b7bd59729f.mp4" title="Dark Fantasy" description="Explore the depths of imagination" index="16" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-950 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto text-center">
          <p className="text-xs text-neutral-600 tracking-widest mb-3">GET STARTED</p>
          <h2 className="font-display text-4xl lg:text-5xl font-normal text-white tracking-tight mb-8">
            Ready to Create?
          </h2>
          <p className="text-neutral-400 font-light leading-relaxed mb-10 max-w-xl mx-auto">
            Join thousands of creators using AI to bring their cinematic vision to life.
          </p>
          <Link
            href="/timeline"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-neutral-950 hover:bg-neutral-100 transition-all duration-300 text-sm font-medium tracking-wider"
          >
            START CREATING
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <p className="text-xs text-neutral-600">
            © 2024 DirectorChair AI. Built by DeeptechAi.
          </p>
          <span className="text-xs text-neutral-600">All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}

// Video Background Component — Director portfolio style
interface VideoBackgroundSectionProps {
  videoSrc: string;
  title: string;
  description: string;
  index: string;
}

function VideoBackgroundSection({ videoSrc, title, description, index }: VideoBackgroundSectionProps) {
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
    <article
      className="group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          muted
          loop
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {isPlaying ? (
            <Pause className="w-12 h-12 text-white" />
          ) : (
            <Play className="w-12 h-12 text-white" />
          )}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-white tracking-tight group-hover:text-neutral-300 transition-colors">{title}</h3>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        <span className="text-xs text-neutral-600 font-light">{index}</span>
      </div>
    </article>
  );
}