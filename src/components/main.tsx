"use client";

import BottomBar from "@/components/bottom-bar";
import Header from "@/components/header";
import RightPanel from "@/components/right-panel";
import VideoPreview from "@/components/video-preview";
import {
  VideoProjectStoreContext,
  createVideoProjectStore,
} from "@/data/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { ProjectDialog } from "./project-dialog";
import { MediaGallerySheet } from "./media-gallery";
import { ToastProvider } from "./ui/toast";
import { Toaster } from "./ui/toaster";
import { ExportDialog } from "./export-dialog";
import LeftPanel from "./left-panel";
import { KeyDialog } from "./key-dialog";

import { FloatingChat } from './FloatingChat';

type AppProps = {
  projectId: string;
};

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function App({ projectId }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const queryClient = useRef(new QueryClient()).current;
  const projectStore = useRef(createVideoProjectStore({ projectId })).current;
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [isExportDialogOpen, setExportDialogOpen] = useState(false);
  const [keyDialog, setKeyDialog] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);


  // Handle client-side mounting
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOnSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMediaId(null);
    }
  };

  const handleGenerate = async () => {
    // Generation handling simplified for minimal deployment
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  // Don't render anything until mounted on client
  if (!isMounted) {
    return <LoadingSpinner />;
  }

  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <VideoProjectStoreContext.Provider value={projectStore}>
          <div className="fixed inset-0 flex flex-col overflow-hidden">
            {/* Background Video */}
            <video
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={handleVideoLoad}
              className="absolute inset-0 w-full h-full object-cover z-0"
              src="/91b9d7be-bb33-4df3-af75-85c7bc3f9d79.mp4"
            />
            
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black/80 z-10" />

            {/* Show loading spinner until video is loaded */}
            {!isVideoLoaded && <LoadingSpinner />}

            {/* Main Content */}
            <div className={`relative z-20 flex flex-col h-full ${!isVideoLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <Header openKeyDialog={() => setKeyDialog(true)} />
              <main className="flex flex-1 overflow-hidden relative">
                <LeftPanel />
                <div className="flex flex-col flex-1 bg-black/40 backdrop-blur-sm">
                  <VideoPreview />
                  <BottomBar />
                </div>
                <RightPanel onGenerate={handleGenerate} />
              </main>
              <Toaster />
              <ProjectDialog open={projectDialogOpen} />
              <ExportDialog
                open={isExportDialogOpen}
                onOpenChange={setExportDialogOpen}
              />
              <KeyDialog
                open={keyDialog}
                onOpenChange={(open) => setKeyDialog(open)}
              />
              <MediaGallerySheet
                open={selectedMediaId !== null}
                onOpenChange={handleOnSheetOpenChange}
                selectedMediaId={selectedMediaId ?? ""}
              />

            </div>
          </div>
        </VideoProjectStoreContext.Provider>
      </QueryClientProvider>
    </ToastProvider>
  );
}
