"use client";

import { Timeline } from "@/components/video/timeline";
import { useVideoProjectStore, VideoProjectStoreContext } from "@/data/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { useRef, useEffect, useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster";
import { useGenerationLimit } from "@/hooks/use-generation-limit";
import Head from 'next/head';
import VideoModelInterface from "@/components/model-inputs/video-model-interface";
import { AudioModelInterface } from "@/components/model-inputs/audio-model-interface";
import { IntelligentChatInterface } from "@/components/intelligent-chat-interface";
import { GeneratedContentDisplay } from "@/components/generated-content-display";
import { GalleryView } from "@/components/gallery-view";
import { StorageManager } from "@/components/storage-manager";
import { SessionManager } from "@/components/session-manager";
import { MobileNavigation } from "@/components/mobile-navigation";
import { CollapsibleContentPanel } from "@/components/collapsible-content-panel";
// Content filtering removed - user has full control over prompts

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Static loading component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Dynamic imports with loading states
const Header = dynamic(() => import("@/components/header"), { 
  ssr: false,
  loading: () => <div className="h-[56px]" /> 
});

const LeftPanel = dynamic(() => import("@/components/left-panel"), { 
  ssr: false,
  loading: () => <div className="w-[300px] bg-background" />
});

const VideoPreview = dynamic(() => import("@/components/video-preview"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-black" />
});

const BottomBar = dynamic(() => import("@/components/bottom-bar"), { 
  ssr: false,
  loading: () => <div className="h-[100px] bg-background" />
});

const RightPanel = dynamic(() => import("@/components/right-panel"), { 
  ssr: false,
  loading: () => <div className="w-[300px] bg-background" />
});

const ProjectDialog = dynamic(() => import("@/components/project-dialog").then(mod => mod.ProjectDialog), { 
  ssr: false 
});

const ExportDialog = dynamic(() => import("@/components/export-dialog").then(mod => mod.ExportDialog), { 
  ssr: false 
});

const KeyDialog = dynamic(() => import("@/components/key-dialog").then(mod => mod.KeyDialog), { 
  ssr: false 
});

const MediaGallerySheet = dynamic(() => import("@/components/media-gallery").then(mod => mod.MediaGallerySheet), { 
  ssr: false 
});

function TimelineContent() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'gallery' | 'storage' | 'sessions'>('content');
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const selectedMediaId = useVideoProjectStore((s) => s.selectedMediaId);
  const setSelectedMediaId = useVideoProjectStore((s) => s.setSelectedMediaId);
  const keyDialogOpen = useVideoProjectStore((s) => s.keyDialogOpen);
  const setKeyDialogOpen = useVideoProjectStore((s) => s.setKeyDialogOpen);
  const { incrementCount } = useGenerationLimit();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle URL parameters for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('sessions')) {
        setActiveTab('sessions');
      }
    }
  }, []);

  const handleOnSheetOpenChange = (open: boolean) => {
    if (!open) setSelectedMediaId(null);
  };

    const handleGenerate = async (generationData: any): Promise<any> => {
    try {
      console.log('🚀 [Timeline] Generation data received:', generationData);
      console.log('📊 [Timeline] Generation data details:', {
        endpointId: generationData.endpointId,
        parameters: generationData,
        timestamp: new Date().toISOString()
      });
      console.log('📦 [Timeline] Enhanced prompt in generation data:', generationData.prompt);
      console.log('📦 [Timeline] Structured prompt for display:', generationData.structuredPromptForDisplay);
      
      // Increment generation count
      await incrementCount();
      console.log('✅ [Timeline] Count incremented successfully');
      
      // Use the unified generation API for all FAL models
      const apiEndpoint = '/api/generate';
      
      console.log('🔧 [Timeline] Calling unified API:', {
        url: apiEndpoint,
        method: 'POST',
        data: generationData
      });
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API call failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📦 [Timeline] API response:', result);
      
      // Show success message
      console.log('✅ [Timeline] Generation completed successfully');
      
      // Return the result so it can be displayed in the chat
      return result;

    } catch (error) {
      console.error('❌ [Timeline] Generation error:', error);
      // The error will be handled by the calling component
      throw error;
    }
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/91b9d7be-bb33-4df3-af75-85c7bc3f9d79.mp4"
      />

      {/* Overlay with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/30 to-background/40 animate-gradient" />

      {/* Content Container */}
      <div className="relative z-20 mobile-timeline">
        {/* Left Panel - Chat Interface */}
        <div className="mobile-timeline-chat">
          <IntelligentChatInterface 
            onContentGenerated={handleGenerate}
            onGenerationStarted={() => console.log('Generation started')}
            onGenerationComplete={() => console.log('Generation complete')}
          />
        </div>
        
        {/* Collapsible Right Panel - Content Display with Tabs */}
        <CollapsibleContentPanel 
          defaultExpanded={false}
          panelWidth="400px"
          className="glass"
        >
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-border/50">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 mobile-px py-3 sm:py-4 mobile-text-xs sm:text-sm font-medium transition-enhanced focus-ring mobile-touch-target ${
                activeTab === 'content'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Recent Content
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 mobile-px py-3 sm:py-4 mobile-text-xs sm:text-sm font-medium transition-enhanced focus-ring mobile-touch-target ${
                activeTab === 'gallery'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex-1 mobile-px py-3 sm:py-4 mobile-text-xs sm:text-sm font-medium transition-enhanced focus-ring mobile-touch-target ${
                activeTab === 'storage'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Storage
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 mobile-px py-3 sm:py-4 mobile-text-xs sm:text-sm font-medium transition-enhanced focus-ring mobile-touch-target ${
                activeTab === 'sessions'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Sessions
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="h-[calc(100%-57px)]">
            {activeTab === 'content' ? (
              <GeneratedContentDisplay className="h-full" sessionId={activeSessionId} />
            ) : activeTab === 'gallery' ? (
              <GalleryView 
                className="h-full"
                useLocalStorage={true}
                onItemClick={(item) => console.log('Gallery item clicked:', item)}
                onAnimate={(item) => console.log('Animate item:', item)}
              />
            ) : activeTab === 'storage' ? (
              <StorageManager className="h-full" />
            ) : (
              <SessionManager 
                className="h-full" 
                onSessionChange={setActiveSessionId}
                onSessionCreate={(session) => {
                  setActiveSessionId(session.id);
                  setActiveTab('content');
                }}
              />
            )}
          </div>
        </CollapsibleContentPanel>
        
        <Toaster />
        {mounted && (
          <>
            <ProjectDialog />
            <ExportDialog />
            <KeyDialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen} />
            {selectedMediaId && (
              <MediaGallerySheet 
                selectedMediaId={selectedMediaId} 
                open={!!selectedMediaId} 
                onOpenChange={handleOnSheetOpenChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <>
      <Head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </Head>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingSpinner />}>
            <TimelineContent />
          </Suspense>
          
          {/* Mobile Navigation */}
          <MobileNavigation />
          
          {/* Content filtering removed - user has full control over prompts */}
        </QueryClientProvider>
      </ToastProvider>
    </>
  );
} 