"use client";

import Link from "next/link";
import {
  ArrowRight,
  Play,
  PanelLeft,
  Video,
  Cpu,
  CheckCircle,
  Paperclip,
  ImageIcon,
  Film,
  Mic,
  Github,
  MessageCircle,
} from "lucide-react";
import { WarpCanvas } from "@/components/warp-canvas";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white">

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden">
        {/* Interactive Space-Time Grid */}
        <WarpCanvas />

        <div className="relative z-10 max-w-screen-xl mx-auto text-center flex flex-col items-center">
          {/* Version badge */}
          <a
            href="https://github.com/neoKode1/DirectorchairAi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1 border border-neutral-800 bg-neutral-900 text-xs font-medium text-neutral-400 mb-8 hover:border-neutral-700 transition-colors uppercase tracking-wider fade-in"
          >
            <span className="flex h-1.5 w-1.5 bg-neutral-100" />
            v3.0.0 is now live
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight text-neutral-100 mb-6 max-w-4xl fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            AI-Powered Media Studio with Film Director Intelligence.
          </h1>

          <p
            className="text-base md:text-lg font-light text-neutral-400 max-w-2xl mb-10 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Create professional media with AI that thinks like a film director.
            Generate images, videos, audio, and voiceovers using natural language
            and get intelligent cinematographic guidance.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-4 fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="https://youtu.be/tssJN3-TwvI?si=16X4QB_AZXq0NgAq"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-neutral-950 px-6 py-3 text-xs font-medium tracking-wider uppercase hover:bg-neutral-200 transition-colors w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4" />
              Watch Demo Video
            </a>
            <Link
              href="/timeline"
              className="flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/10 backdrop-blur-sm text-white text-xs font-medium tracking-wider uppercase hover:bg-white/20 transition-colors w-full sm:w-auto justify-center"
            >
              Open Studio
            </Link>
          </div>

          {/* Studio Mockup Interface */}
          <div
            className="mt-20 w-full max-w-6xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col text-left fade-in"
            style={{ animationDelay: "0.4s", aspectRatio: "16/9" }}
          >
            <div className="flex-1 flex overflow-hidden">
              {/* Col 1 — Chat Sidebar */}
              <div className="w-64 border-r border-neutral-800 p-4 flex-col justify-between bg-neutral-950 hidden md:flex">
                <div className="space-y-4">
                  <div className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-6">
                    Director Chat
                  </div>
                  <div className="h-8 w-3/4 bg-neutral-900 border border-neutral-800" />
                  <div className="h-16 w-full bg-neutral-900 border border-neutral-800" />
                  <div className="h-8 w-1/2 bg-neutral-900 border border-neutral-800" />
                </div>
                <div className="h-12 w-full border border-neutral-800 bg-neutral-900 flex items-center px-3 gap-2">
                  <Paperclip className="w-4 h-4 text-neutral-500" />
                  <div className="h-2 w-1/2 bg-neutral-800" />
                </div>
              </div>

              {/* Col 2 — Main Preview */}
              <div className="flex-1 p-6 flex flex-col gap-4 bg-neutral-950">
                <div className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-2">
                  Stage
                </div>
                <div className="w-full flex-1 bg-neutral-900 border border-neutral-800 flex items-center justify-center relative overflow-hidden group">
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="absolute inset-0 bg-neutral-950/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/10 border border-white/20 text-white w-12 h-12 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Play className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Col 3 — Gallery */}
              <div className="w-[260px] border-l border-neutral-800 p-4 bg-neutral-950 hidden lg:block overflow-hidden">
                <div className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-6">
                  Takes
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square border border-neutral-800 bg-neutral-900" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 px-6 relative z-10 border-t border-neutral-800">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-4">Architecture</p>
            <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight text-neutral-100 mb-4">Revolutionary Workflow</h2>
            <p className="text-sm font-light text-neutral-400 max-w-2xl">A seamless creative process powered by a state-of-the-art three-column architecture, designed specifically for rapid media generation.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Large */}
            <div className="md:col-span-2 border border-neutral-800 bg-neutral-900 p-8 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
              <div>
                <PanelLeft className="w-7 h-7 text-neutral-100 mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-4">Three-Column Interface</h3>
                <p className="text-sm font-light text-neutral-400 mb-6 max-w-md">Chat naturally on the left, view your high-res generated media in the dynamic center, and manage your entire project history in the collapsible smart gallery on the right.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Drag &amp; Drop</span>
                <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Auto-scrolling</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border border-neutral-800 bg-neutral-900 p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
              <div>
                <Video className="w-7 h-7 text-neutral-100 mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-4">Advanced I2V</h3>
                <p className="text-sm font-light text-neutral-400 mb-6">Six integrated Image-to-Video models including Luma Ray 2, Kling v2.1, and Wan Pro for breathtaking cinematic motion.</p>
              </div>
              <div className="w-full h-px bg-neutral-800 overflow-hidden relative">
                <div className="absolute left-0 top-0 w-3/4 h-full bg-neutral-500" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border border-neutral-800 bg-neutral-900 p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
              <div>
                <ImageIcon className="w-7 h-7 text-neutral-100 mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-4">Intelligent Gallery</h3>
                <p className="text-sm font-light text-neutral-400">Fullscreen viewing, one-click actions to download, edit, or animate any generated piece of content.</p>
              </div>
            </div>

            {/* Feature 4: Large */}
            <div className="md:col-span-2 border border-neutral-800 bg-neutral-900 p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
              <div>
                <Cpu className="w-7 h-7 text-neutral-100 mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400 mb-4">Smart Content Management</h3>
                <p className="text-sm font-light text-neutral-400 mb-6 max-w-lg">Local storage integration ensures your workflow survives page reloads. Automated model fallbacks protect against content policy blocks.</p>
              </div>
              <div className="flex gap-2">
                {["Auto-Save", "Policy Fallback", "Unified API"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-xs text-neutral-500 uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Models Section ── */}
      <section className="py-24 px-6 relative z-10 border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-neutral-500 mb-4">Integration</p>
              <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight text-neutral-100 mb-4">Supported AI Models</h2>
              <p className="text-sm font-light text-neutral-400 max-w-xl">Harness the power of industry-leading AI models, seamlessly integrated through a unified generation endpoint.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 uppercase tracking-wider px-4 py-2 border border-neutral-800 bg-neutral-900">
              Powered by FAL.ai &amp; Anthropic
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Image Models */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <ImageIcon className="w-5 h-5 text-neutral-500" />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400">Image Generation</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Google Imagen 4:", desc: "Highest quality generation" },
                  { name: "Flux Pro 1.1 Ultra:", desc: "Professional-grade images" },
                  { name: "Stable Diffusion 3.5:", desc: "Improved typography" },
                  { name: "Dreamina v3.1:", desc: "Superior picture effects" },
                ].map((m) => (
                  <li key={m.name} className="flex items-start gap-3 text-sm font-light text-neutral-400">
                    <span className="w-1.5 h-1.5 bg-neutral-700 mt-2 shrink-0" />
                    <span><strong className="font-normal text-neutral-100">{m.name}</strong> {m.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Models */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <Film className="w-5 h-5 text-neutral-500" />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400">Image-to-Video (I2V)</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Luma Ray 2 Flash:", desc: "Fast smooth motion" },
                  { name: "Kling v2.1 Master:", desc: "Enhanced motion realism" },
                  { name: "Wan Pro:", desc: "6-second 1080p generation (30 FPS)" },
                  { name: "Seedance 1.0 Pro:", desc: "Advanced motion control" },
                ].map((m) => (
                  <li key={m.name} className="flex items-start gap-3 text-sm font-light text-neutral-400">
                    <span className="w-1.5 h-1.5 bg-neutral-700 mt-2 shrink-0" />
                    <span><strong className="font-normal text-neutral-100">{m.name}</strong> {m.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Audio Models */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
                <Mic className="w-5 h-5 text-neutral-500" />
                <h3 className="text-xs font-medium tracking-wider uppercase text-neutral-400">Audio &amp; Voice</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "ElevenLabs TTS:", desc: "Turbo v2.5 text-to-speech" },
                  { name: "MiniMax Speech:", desc: "2.5 HD advanced TTS" },
                  { name: "Voice Clone:", desc: "Custom voices from audio" },
                  { name: "Sync LipSync:", desc: "Advanced lip sync modes" },
                ].map((m) => (
                  <li key={m.name} className="flex items-start gap-3 text-sm font-light text-neutral-400">
                    <span className="w-1.5 h-1.5 bg-neutral-700 mt-2 shrink-0" />
                    <span><strong className="font-normal text-neutral-100">{m.name}</strong> {m.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-800 py-12 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium tracking-tighter uppercase">DirectorChair AI</span>
          </div>

          <div className="flex gap-6 text-xs font-light text-neutral-500 uppercase tracking-wider">
            <span>Built with Next.js, React &amp; Tailwind</span>
            <a href="https://github.com/neoKode1/DirectorchairAi/blob/main/LICENSE" className="hover:text-white transition-colors">MIT License</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/neoKode1/DirectorchairAi" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://github.com/neoKode1/DirectorchairAi/discussions" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}