"use client";

import { button as Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { AvailableModelsShowcase } from "@/components/model-icons";

export default function SignInPage() {
  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/timeline" });
  };

  const handleDevSignIn = () => {
    signIn("dev", { callbackUrl: "/timeline" });
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/adarkorchestra_28188__--ar_21_--bs_2_--video_1_--end_loop_5f2e42e9-a7fb-492c-9ec8-cb1b4596066d_0.mp4"
      />

      {/* Overlay with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 animate-gradient" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Section */}
        <div className="flex-1 text-white">
          <h1 className="text-6xl lg:text-8xl font-bold mb-6 text-gray-300 drop-shadow-lg">
            DirectorchairAI
          </h1>
          <p className="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 drop-shadow-md">
            AI-Powered Media Studio with Film Director Intelligence
          </p>
          <div className="space-y-4 mb-8">
            <p className="text-xl text-cyan-100 font-medium drop-shadow-sm">
              Create professional media with AI that thinks like a film director. Generate images, videos, audio, and voiceovers using natural language and get intelligent cinematographic guidance.
            </p>
            <ul className="space-y-3">
              {[
                "Intelligent Chat Interface with AI Analysis",
                "Film Director Suggestions & Cinematographic Guidance",
                "Multi-Model AI Generation (Images, Videos, Audio, Voice)",
                "Professional Video Editing & Timeline Tools",
                "Smart Model Selection & Optimization",
                "Gallery Management & Content Organization",
              ].map((feature) => (
                <li key={feature} className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-cyan-400 drop-shadow-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-lg text-white font-medium drop-shadow-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Model Icons Showcase */}
          <div className="mt-12">
            <AvailableModelsShowcase className="text-white" />
          </div>
        </div>

        {/* Sign In Card */}
        <Card className="w-full max-w-md p-8 bg-black/40 backdrop-blur-md border-cyan-500/30 shadow-2xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 relative mb-4">
              <Image
                src="/download.svg"
                alt="DirectorchairAI Logo"
                width={96}
                height={96}
                className="dark:invert animate-float drop-shadow-lg"
                priority
              />
            </div>

            <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-md">
              Start Creating
            </h2>

            <div className="w-full space-y-6">
              {/* Development Mode Button */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  size="lg"
                  onClick={handleDevSignIn}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span className="text-lg font-semibold">Continue in Development Mode</span>
                </Button>
              )}
              
              <Button
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                size="lg"
                onClick={handleSignIn}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-lg font-semibold">Sign in with Google</span>
              </Button>

              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold text-cyan-300 drop-shadow-sm">
                  Start Free - No Credit Card Required
                </p>
                <div className="flex flex-col text-sm text-cyan-100/80 font-medium">
                  <span>Get 10 free generations to try our platform</span>
                  <span>Upgrade anytime for unlimited access</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-cyan-200/70 z-10 drop-shadow-sm">
        <p>© 2024 DirectorchairAI. All rights reserved.</p>
      </div>
    </div>
  );
} 