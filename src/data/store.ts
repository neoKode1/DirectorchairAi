"use client";

import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import type { PlayerRef } from "@remotion/player";
import { createContext, useContext } from "react";
import { create } from "zustand";

export const LAST_PROJECT_ID_KEY = "__aivs_lastProjectId";

export type MediaType = "image" | "video" | "voiceover" | "music";

export type GenerateData = {
  prompt: string;
  image?: File | string | null;
  video_url?: File | string | null;
  audio_url?: File | string | null;
  duration: number;
  voice: string;
  [key: string]: any;
};

export interface VideoProjectProps {
  projectId: string;
  endpointId: string;
  projectDialogOpen: boolean;
  player: PlayerRef | null;
  playerCurrentTimestamp: number;
  isPlaying: boolean;
  playerState: "playing" | "paused";
  generateDialogOpen: boolean;
  generateMediaType: MediaType;
  selectedMediaId: string | null;
  selectedKeyframes: string[];
  generateData: GenerateData;
  exportDialogOpen: boolean;
}

export interface VideoProjectState extends VideoProjectProps {
  setPlayerCurrentTimestamp: (timestamp: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  selectKeyframe: (id: string) => void;
  setPlayer: (player: PlayerRef) => void;
  setPlayerState: (state: "playing" | "paused") => void;
  setExportDialogOpen: (open: boolean) => void;
  setSelectedMediaId: (id: string | null) => void;
  setGenerateDialogOpen: (open: boolean) => void;
  setGenerateMediaType: (type: MediaType) => void;
  setProjectDialogOpen: (open: boolean) => void;
  setEndpointId: (id: string) => void;
  setProjectId: (id: string) => void;
  setGenerateData: (data: Partial<GenerateData>) => void;
  resetGenerateData: () => void;
  openGenerateDialog: () => void;
  closeGenerateDialog: () => void;
  onGenerate: () => void;
}

const DEFAULT_PROPS: VideoProjectProps = {
  projectId: "",
  endpointId: AVAILABLE_ENDPOINTS[0].endpointId,
  projectDialogOpen: false,
  player: null,
  playerCurrentTimestamp: 0,
  isPlaying: false,
  playerState: "paused",
  generateDialogOpen: false,
  generateMediaType: "video",
  selectedMediaId: null,
  selectedKeyframes: [],
  generateData: {
    prompt: "",
    image: null,
    duration: 30,
    voice: "",
    video_url: null,
    audio_url: null,
  },
  exportDialogOpen: false,
};

export const createVideoProjectStore = (initialProps?: Partial<VideoProjectProps>) => 
  create<VideoProjectState>((set) => ({
    ...DEFAULT_PROPS,
    ...initialProps,
    setPlayerCurrentTimestamp: (timestamp: number) => 
      set({ playerCurrentTimestamp: timestamp }),
    setIsPlaying: (isPlaying: boolean) => 
      set({ isPlaying }),
    selectKeyframe: (id: string) => 
      set({ selectedKeyframes: [id] }),
    setPlayer: (player: PlayerRef) => 
      set({ player }),
    setPlayerState: (playerState: "playing" | "paused") => 
      set({ playerState }),
    setExportDialogOpen: (open: boolean) => 
      set({ exportDialogOpen: open }),
    setSelectedMediaId: (id: string | null) => 
      set({ selectedMediaId: id }),
    setGenerateDialogOpen: (open: boolean) => 
      set({ generateDialogOpen: open }),
    setGenerateMediaType: (type: MediaType) => 
      set({ generateMediaType: type }),
    setProjectDialogOpen: (open: boolean) => 
      set({ projectDialogOpen: open }),
    setEndpointId: (id: string) => 
      set({ endpointId: id }),
    setProjectId: (id: string) => 
      set({ projectId: id }),
    setGenerateData: (data: Partial<GenerateData>) =>
      set((state) => ({ 
        generateData: { ...state.generateData, ...data } 
      })),
    resetGenerateData: () => 
      set({ generateData: DEFAULT_PROPS.generateData }),
    openGenerateDialog: () => {
      set({ generateDialogOpen: true });
    },
    closeGenerateDialog: () => {
      set({ generateDialogOpen: false });
    },
    onGenerate: () => {
      set({ generateDialogOpen: true });
    },
  }));

export const useVideoProjectStore = createVideoProjectStore();

export const VideoProjectStoreContext = createContext<typeof useVideoProjectStore>(
  useVideoProjectStore
);

export function useProjectStore<T>(
  selector: (state: VideoProjectState) => T
): T {
  const store = useContext(VideoProjectStoreContext);
  return store(selector);
}

export function useProjectId() {
  return useProjectStore((s) => s.projectId);
}
