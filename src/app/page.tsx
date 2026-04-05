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


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-secondary selection:text-foreground">

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden">

        <div className="relative z-10 max-w-screen-xl mx-auto text-center flex flex-col items-center">
          {/* Version badge */}
          <a
            href="https://github.com/neoKode1/DirectorchairAi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card text-xs font-medium text-muted-foreground mb-8 hover:border-ring transition-colors uppercase tracking-wider fade-in"
          >
            <span className="flex h-1.5 w-1.5 bg-foreground" />
            v3.0.0 is now live
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight text-foreground mb-6 max-w-4xl fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            AI-Powered Media Studio with Film Director Intelligence.
          </h1>

          <p
            className="text-base md:text-lg font-light text-muted-foreground max-w-2xl mb-10 fade-in"
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
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4" />
              Watch Demo Video
            </a>
            <Link
              href="/timeline"
              className="flex items-center gap-2 px-6 py-3 border border-foreground/20 bg-foreground/10 backdrop-blur-sm text-foreground text-xs font-medium tracking-wider uppercase hover:bg-foreground/20 transition-colors w-full sm:w-auto justify-center"
            >
              Open Studio
            </Link>
          </div>

          {/* Studio Mockup Interface */}
          <div
            className="mt-20 w-full max-w-6xl border border-border bg-background shadow-2xl flex flex-col text-left fade-in"
            style={{ animationDelay: "0.4s", aspectRatio: "16/9" }}
          >
            <div className="flex-1 flex overflow-hidden">
              {/* Col 1 — Chat Sidebar */}
              <div className="w-64 border-r border-border p-4 flex-col justify-between bg-background hidden md:flex">
                <div className="space-y-4">
                  <div className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-6">
                    Director Chat
                  </div>
                  <div className="h-8 w-3/4 bg-card border border-border" />
                  <div className="h-16 w-full bg-card border border-border" />
                  <div className="h-8 w-1/2 bg-card border border-border" />
                </div>
                <div className="h-12 w-full border border-border bg-card flex items-center px-3 gap-2">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <div className="h-2 w-1/2 bg-secondary" />
                </div>
              </div>

              {/* Col 2 — Main Preview */}
              <div className="flex-1 p-6 flex flex-col gap-4 bg-background">
                <div className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2">
                  Stage
                </div>
                <div className="w-full flex-1 bg-card border border-border flex items-center justify-center relative overflow-hidden group">
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  <div className="absolute inset-0 bg-background/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-foreground/10 border border-foreground/20 text-foreground w-12 h-12 flex items-center justify-center backdrop-blur-sm hover:bg-foreground/20 transition-colors">
                      <Play className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Col 3 — Gallery */}
              <div className="w-[260px] border-l border-border p-4 bg-background hidden lg:block overflow-hidden">
                <div className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-6">
                  Takes
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square border border-border bg-card" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 px-6 relative z-10 border-t border-border">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">Architecture</p>
            <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-4">Revolutionary Workflow</h2>
            <p className="text-sm font-light text-muted-foreground max-w-2xl">A seamless creative process powered by a state-of-the-art three-column architecture, designed specifically for rapid media generation.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Large */}
            <div className="md:col-span-2 border border-border bg-card p-8 flex flex-col justify-between group hover:border-ring transition-colors">
              <div>
                <PanelLeft className="w-7 h-7 text-foreground mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">Three-Column Interface</h3>
                <p className="text-sm font-light text-muted-foreground mb-6 max-w-md">Chat naturally on the left, view your high-res generated media in the dynamic center, and manage your entire project history in the collapsible smart gallery on the right.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Drag &amp; Drop</span>
                <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Auto-scrolling</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border border-border bg-card p-8 flex flex-col justify-between hover:border-ring transition-colors">
              <div>
                <Video className="w-7 h-7 text-foreground mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">Advanced I2V</h3>
                <p className="text-sm font-light text-muted-foreground mb-6">Six integrated Image-to-Video models including Luma Ray 2, Kling v2.1, and Wan Pro for breathtaking cinematic motion.</p>
              </div>
              <div className="w-full h-px bg-secondary overflow-hidden relative">
                <div className="absolute left-0 top-0 w-3/4 h-full bg-muted-foreground" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border border-border bg-card p-8 flex flex-col justify-between hover:border-ring transition-colors">
              <div>
                <ImageIcon className="w-7 h-7 text-foreground mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">Intelligent Gallery</h3>
                <p className="text-sm font-light text-muted-foreground">Fullscreen viewing, one-click actions to download, edit, or animate any generated piece of content.</p>
              </div>
            </div>

            {/* Feature 4: Large */}
            <div className="md:col-span-2 border border-border bg-card p-8 flex flex-col justify-between hover:border-ring transition-colors">
              <div>
                <Cpu className="w-7 h-7 text-foreground mb-6" strokeWidth={1.5} />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">Smart Content Management</h3>
                <p className="text-sm font-light text-muted-foreground mb-6 max-w-lg">Local storage integration ensures your workflow survives page reloads. Automated model fallbacks protect against content policy blocks.</p>
              </div>
              <div className="flex gap-2">
                {["Auto-Save", "Policy Fallback", "Unified API"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 border border-border bg-background text-xs text-muted-foreground uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Models Section ── */}
      <section className="py-24 px-6 relative z-10 border-t border-border bg-background">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">Integration</p>
              <h2 className="font-display text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-4">Supported AI Models</h2>
              <p className="text-sm font-light text-muted-foreground max-w-xl">Harness the power of industry-leading AI models, seamlessly integrated through a unified generation endpoint.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 border border-border bg-card">
              Powered by FAL.ai &amp; Anthropic
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Image Models */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Image Generation</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Google Imagen 4:", desc: "Highest quality generation" },
                  { name: "Flux Pro 1.1 Ultra:", desc: "Professional-grade images" },
                  { name: "FLUX 2 Flex:", desc: "Enhanced typography & editing" },
                  { name: "Dreamina v3.1:", desc: "Superior picture effects" },
                  { name: "Grok Image Edit:", desc: "xAI enhanced realism" },
                  { name: "Gemini 2.5 Flash:", desc: "Multi-image blending" },
                ].map((m) => (
                  <li key={m.name} className="flex items-start gap-3 text-sm font-light text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 mt-2 shrink-0" />
                    <span><strong className="font-normal text-foreground">{m.name}</strong> {m.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Models */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Film className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Image-to-Video (I2V)</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Sora 2 Pro:", desc: "OpenAI's cinematic video engine" },
                  { name: "Veo 3.1 Fast:", desc: "Google's latest video model" },
                  { name: "Kling v3 Pro:", desc: "Cinematic motion with voice & audio" },
                  { name: "Grok Video:", desc: "xAI text & image-to-video with audio" },
                  { name: "Wan Pro:", desc: "1080p at 30 FPS, up to 6 seconds" },
                  { name: "Minimax Hailuo 02:", desc: "Smooth high-quality motion" },
                ].map((m) => (
                  <li key={m.name} className="flex items-start gap-3 text-sm font-light text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 mt-2 shrink-0" />
                    <span><strong className="font-normal text-foreground">{m.name}</strong> {m.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Audio Models */}
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <Mic className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Motion &amp; Performance</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Ovi (with Audio):", desc: "Synchronized audio generation" },
                  { name: "DreamActor v2:", desc: "Motion transfer & performance" },
                  { name: "Kling AI Avatar:", desc: "Professional lip-sync" },
                  { name: "Hunyuan Video:", desc: "Tencent's high-quality video" },
                ].map((m) => (
                  <li key={m.name} className="flex items-start gap-3 text-sm font-light text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 mt-2 shrink-0" />
                    <span><strong className="font-normal text-foreground">{m.name}</strong> {m.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-sm font-medium tracking-tighter uppercase">DirectorChair AI</span>
          </div>

          <div className="flex gap-6 text-xs font-light text-muted-foreground uppercase tracking-wider">
            <span>Built with Next.js, React &amp; Tailwind</span>
            <a href="https://github.com/neoKode1/DirectorchairAi/blob/main/LICENSE" className="hover:text-foreground transition-colors">MIT License</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/neoKode1/DirectorchairAi" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-ring transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://github.com/neoKode1/DirectorchairAi/discussions" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-ring transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}