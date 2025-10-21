import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Image, Video, Music, Zap } from 'lucide-react';
import { SimpleVideoGallery } from '@/components/simple-video-gallery';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Director's Chair AI
                <span className="block text-purple-500">Your Creative Studio</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Access all your favorite AI models in one clean interface. 
                Simple dropdowns, drag-and-drop uploads, and intuitive controls 
                for intermediate to professional creators.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button asChild
                  size="lg"
                  className="text-lg rounded-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link href="/sign-up">
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
      </section>

      <section className="py-16 bg-white w-full">
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
      </section>

      <section className="py-16 bg-gray-50">
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
              <Link href="/sign-up">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild
              size="lg"
              variant="outline"
              className="text-lg"
            >
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
