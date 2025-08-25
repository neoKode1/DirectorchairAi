"use client";

import dynamic from "next/dynamic";
import { Loading } from "@/components/loading";

// Dynamically import the App component with no SSR
const AppClient = dynamic(() => import("@/components/main").then(mod => mod.App), {
  ssr: false,
  loading: () => <Loading />
});

interface AppClientWrapperProps {
  projectId: string;
}

export function AppClientWrapper({ projectId }: AppClientWrapperProps) {
  return <AppClient projectId={projectId} />;
} 