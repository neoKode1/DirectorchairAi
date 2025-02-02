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
import { useRef, useState } from "react";
import { useStore } from "zustand";
import { ProjectDialog } from "./project-dialog";
import { MediaGallerySheet } from "./media-gallery";
import { ToastProvider } from "./ui/toast";
import { Toaster } from "./ui/toaster";
import { ExportDialog } from "./export-dialog";
import LeftPanel from "./left-panel";
import { KeyDialog } from "./key-dialog";
import { useGenerationLimit } from "@/hooks/use-generation-limit";
import { SubscriptionDialog } from "./subscription-dialog";

type AppProps = {
  projectId: string;
};

export function App({ projectId }: AppProps) {
  const queryClient = new QueryClient();
  const projectStore = useRef(createVideoProjectStore({ projectId })).current;
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [isExportDialogOpen, setExportDialogOpen] = useState(false);
  const [keyDialog, setKeyDialog] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const { showSubscription, setShowSubscription, incrementCount } = useGenerationLimit();

  const handleOnSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMediaId(null);
    }
  };

  const handleGenerate = async () => {
    await incrementCount();
  };

  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <VideoProjectStoreContext.Provider value={projectStore}>
          <div className="flex flex-col relative overflow-x-hidden h-screen bg-background">
            <Header openKeyDialog={() => setKeyDialog(true)} />
            <main className="flex overflow-hidden h-full w-screen relative">
              <LeftPanel />
              <div className="flex flex-col flex-1">
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
            <SubscriptionDialog
              open={showSubscription}
              onOpenChange={setShowSubscription}
            />
          </div>
        </VideoProjectStoreContext.Provider>
      </QueryClientProvider>
    </ToastProvider>
  );
}
