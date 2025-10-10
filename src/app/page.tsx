"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Video, Image as ImageIcon, Music, Mic, Zap, Users, Shield, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to timeline if user is already signed in
    if (user && !loading) {
      router.push('/timeline');
    }
  }, [user, loading, router]);

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const features = [
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "AI Image Generation",
      description: "Create stunning images with Google Imagen 4, Stable Diffusion 3.5, Flux Pro, and more"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Image-to-Video",
      description: "Transform images into videos with 6 advanced models including Luma Ray 2 and Kling v2.1"
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Audio Generation",
      description: "Generate music and sound effects with professional-grade AI models"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice Synthesis",
      description: "Create realistic voiceovers with ElevenLabs TTS and MiniMax Speech"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Workflows",
      description: "Intelligent automation with director-level creative guidance"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Storage",
      description: "Your creations are safely stored and organized in your personal gallery"
    }
  ];

  const stats = [
    { number: "15+", label: "AI Models" },
    { number: "10K+", label: "Creations" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="p-8 bg-black/40 backdrop-blur-md border-cyan-500/30 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto relative">
              <Image
                src="/download.svg"
                alt="DirectorchairAI Logo"
                width={64}
                height={64}
                className="dark:invert"
              />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome back!</h2>
            <p className="text-gray-300">You're already signed in. Ready to create?</p>
            <Link href="/timeline">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                Go to Studio
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30"
        src="/adarkorchestra_28188__--ar_21_--bs_2_--video_1_--end_loop_5f2e42e9-a7fb-492c-9ec8-cb1b4596066d_0.mp4"
      />

      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/download.svg"
              alt="DirectorchairAI Logo"
              width={40}
              height={40}
              className="dark:invert"
            />
            <span className="text-2xl font-bold text-white">DirectorchairAI</span>
          </div>
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6">
              Create with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                AI Director
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
              Professional media creation with AI that thinks like a film director.
              Generate images, videos, audio, and voiceovers using natural language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleSignUp}
                disabled={loading}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-4"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {loading ? "Starting..." : "Start Creating Free"}
              </Button>
              <p className="text-sm text-cyan-300">10 free generations • No credit card required</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  {stat.number}
                </div>
                <div className="text-gray-300 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful AI models and intelligent workflows in one unified platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-black/40 backdrop-blur-md border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                <div className="text-cyan-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="p-12 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-md border-cyan-500/30 max-w-4xl mx-auto text-center">
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators using DirectorchairAI to bring their visions to life
            </p>
            <Button
              onClick={handleSignUp}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-12 py-4"
            >
              <Users className="w-5 h-5 mr-2" />
              {loading ? "Loading..." : "Get Started Free"}
            </Button>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 DirectorchairAI. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}