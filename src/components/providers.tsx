"use client";

import { UploadProvider } from "@/components/providers/upload-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UploadProvider>
      {children}
    </UploadProvider>
  );
} 