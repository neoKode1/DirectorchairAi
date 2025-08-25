"use client";

import { createContext, useContext, ReactNode } from "react";
// Placeholder type for upload response
type UploadResponse = any;

interface StorageContextType {
  maxFileSizes: {
    image: number;
    video: number;
    audio: number;
  };
  allowedTypes: {
    image: string[];
    video: string[];
    audio: string[];
  };
}

const StorageContext = createContext<StorageContextType>({
  maxFileSizes: {
    image: 8 * 1024 * 1024, // 8MB
    video: 256 * 1024 * 1024, // 256MB
    audio: 32 * 1024 * 1024, // 32MB
  },
  allowedTypes: {
    image: ["image/jpeg", "image/png", "image/webp"],
    video: ["video/mp4", "video/webm"],
    audio: ["audio/mpeg", "audio/wav", "audio/mp3"],
  },
});

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const value = {
    maxFileSizes: {
      image: 8 * 1024 * 1024, // 8MB
      video: 256 * 1024 * 1024, // 256MB
      audio: 32 * 1024 * 1024, // 32MB
    },
    allowedTypes: {
      image: ["image/jpeg", "image/png", "image/webp"],
      video: ["video/mp4", "video/webm"],
      audio: ["audio/mpeg", "audio/wav", "audio/mp3"],
    },
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
} 