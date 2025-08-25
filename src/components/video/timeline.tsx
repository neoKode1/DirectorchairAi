"use client";

import clsx from "clsx";
import type { HTMLAttributes, DragEventHandler } from "react";
import { cn } from "@/lib/utils";
import { TimelineCursor } from "./track";
import { VideoTrackRow } from "./track";
import { useState } from "react";
import { Slider } from "@nextui-org/react";
import { SearchIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { db } from "@/data/db";
import { useProjectId } from "@/data/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, refreshVideoCache } from "@/data/queries";
import type { MediaItem } from "@/data/schema";

type TimelineRulerProps = {
  duration?: number;
} & HTMLAttributes<HTMLDivElement>;

export function TimelineRuler({
  className,
  duration = 30,
}: TimelineRulerProps) {
  const totalTicks = duration * 10;
  return (
    <div className={cn("w-full h-full relative overflow-hidden", className)}>
      <div className="flex px-2 py-0.5 h-full">
        {Array.from({ length: totalTicks + 1 }).map((_, index) => {
          const isMajorTick = index % 50 === 0;
          const isMinorTick = index % 10 === 0;
          return (
            <div key={index} className="flex-grow flex flex-col">
              {isMajorTick && (
                <div className="text-muted-foreground text-sm tabular-nums h-full text-center mt-1">
                  {(index / 10).toFixed(0)}s
                  <div className="h-[12px] w-px bg-border/50 mx-auto mt-1"></div>
                </div>
              )}
              {isMinorTick && !isMajorTick && (
                <div className="text-muted-foreground tabular-nums text-center">
                  &middot;
                  <div className="h-[8px] w-px bg-border/30 mx-auto mt-1"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type TimelineProps = {
  tracks: any[]; // Replace with your track type
} & HTMLAttributes<HTMLDivElement>;

export function Timeline({ tracks, className, ...props }: TimelineProps) {
  const projectId = useProjectId();
  const queryClient = useQueryClient();
  const [cursorTime, setCursorTime] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [dragOverTracks, setDragOverTracks] = useState(false);
  const [verticalScroll, setVerticalScroll] = useState(0);

  const addToTrack = useMutation({
    mutationFn: async (media: MediaItem) => {
      // Find or create appropriate track based on media type
      let track = tracks.find((t) => {
        if (media.mediaType === "video" || media.mediaType === "image")
          return t.type === "video";
        if (media.mediaType === "music") return t.type === "music";
        if (media.mediaType === "voiceover") return t.type === "voiceover";
        return false;
      });

      // If track doesn't exist, create it
      if (!track) {
        let trackType: "video" | "music" | "voiceover";
        if (media.mediaType === "video" || media.mediaType === "image") {
          trackType = "video";
        } else if (media.mediaType === "music") {
          trackType = "music";
        } else {
          trackType = "voiceover";
        }

        const newTrack = await db.tracks.create({
          type: trackType,
          label: trackType.charAt(0).toUpperCase() + trackType.slice(1),
          projectId: projectId,
          locked: false,
        });

        track = await db.tracks.find(newTrack.toString());
        if (!track) throw new Error("Failed to create track");
      }

      // Get existing keyframes to determine insertion point
      const existingKeyframes = await db.keyFrames.keyFramesByTrack(track.id);
      const lastKeyframe = existingKeyframes[existingKeyframes.length - 1];

      // Calculate new keyframe timestamp (place after last keyframe or at start)
      const timestamp = lastKeyframe
        ? lastKeyframe.timestamp + lastKeyframe.duration
        : 0;

      // Create keyframe data based on media type
      const baseData = {
        mediaId: media.id,
        prompt: media.input?.prompt || media.metadata?.title || "",
      };

      let keyframeData;
      if (media.mediaType === "video" || media.mediaType === "image") {
        keyframeData = {
          ...baseData,
          type: "video" as const,
          url: media.input?.image_url || "",
        };
      } else {
        keyframeData = {
          ...baseData,
          type: "prompt" as const,
        };
      }

      const keyframe = await db.keyFrames.create({
        trackId: track.id,
        timestamp: timestamp,
        duration: media.metadata?.duration ?? 5000,
        data: keyframeData,
      });

      return keyframe;
    },
    onSuccess: () => {
      refreshVideoCache(queryClient, projectId);
    }
  });

  const handleCursorChange = (position: number) => {
    setCursorTime(position);
    // TODO: Add video playback position update here
  };

  const handleZoomChange = (value: number | number[]) => {
    const zoomValue = Array.isArray(value) ? value[0] : value;
    setZoomLevel(zoomValue);
  };

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setDragOverTracks(true);
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Only set dragOverTracks to false if we're actually leaving the drop zone
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverTracks(false);
    }
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverTracks(false);

    let jobPayload = event.dataTransfer.getData("job");
    if (!jobPayload) {
      // Try alternate format
      jobPayload = event.dataTransfer.getData("application/json");
    }
    if (!jobPayload) {
      console.warn("No valid data found in drop event");
      return;
    }

    try {
      const job: MediaItem = JSON.parse(jobPayload);
      console.log("Dropped media item:", job);
      if (job.status === "completed") {
        addToTrack.mutate(job);
      }
    } catch (error) {
      console.error("Failed to parse dropped media:", error);
    }
  };

  const handleVerticalScroll = (value: number | number[]) => {
    const scrollValue = Array.isArray(value) ? value[0] : value;
    setVerticalScroll(scrollValue);

    const container = document.querySelector(".timeline-tracks-container");
    if (container) {
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = (scrollValue / 100) * maxScroll;
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-full timeline-container select-none",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        dragOverTracks && "bg-white/5 ring-2 ring-purple-500/50",
        className,
      )}
      {...props}
    >
      <div className="relative w-full h-full flex">
        {/* Main Timeline Area */}
        <div className="flex-1 relative">
          {/* Ruler */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 h-8 border-b border-border/40">
              <TimelineRuler className="flex-1" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-2 px-4">
                <ZoomOutIcon className="w-4 h-4 text-muted-foreground" />
                <Slider
                  aria-label="Zoom Level"
                  defaultValue={100}
                  minValue={25}
                  maxValue={400}
                  step={25}
                  value={zoomLevel}
                  onChange={handleZoomChange}
                  className="w-32"
                  classNames={{
                    base: "max-w-md gap-3",
                    track: "bg-white/10",
                    filler: "bg-purple-500",
                    thumb: "bg-purple-500 shadow-lg border-2 border-white",
                    label: "text-white",
                  }}
                />
                <ZoomInIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground ml-2 tabular-nums w-12">
                  {zoomLevel}%
                </span>
              </div>
            </div>
          </div>

          {/* Main content area - This is the drop zone */}
          <div
            className={cn(
              "relative w-full h-[calc(100%-2rem)] flex",
              dragOverTracks && "bg-purple-500/10",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ zIndex: 100 }}
          >
            {/* Tracks Container */}
            <div className="flex-1 relative">
              <div
                className="timeline-tracks-container relative w-full h-full z-10 flex flex-col gap-1 p-1 overflow-y-auto"
                style={{
                  transform: `scaleX(${zoomLevel / 100})`,
                  transformOrigin: "left",
                  width: `${10000 / zoomLevel}%`,
                  minWidth: "100%",
                }}
              >
                {tracks.map((track) => (
                  <VideoTrackRow key={track.id} data={track} />
                ))}
              </div>

              {/* Cursor - Make sure it doesn't interfere with drops */}
              <div
                className="absolute inset-0"
                style={{ zIndex: 50, pointerEvents: "none" }}
              >
                <TimelineCursor
                  className="h-full pointer-events-none"
                  onPositionChange={handleCursorChange}
                  scale={zoomLevel / 100}
                />
              </div>
            </div>

            {/* Vertical Scroll */}
            <div className="w-8 h-full flex items-center justify-center border-l border-border/40 bg-background-dark">
              <div className="h-[calc(100%-16px)] py-2">
                <Slider
                  aria-label="Vertical Scroll"
                  orientation="vertical"
                  defaultValue={0}
                  value={verticalScroll}
                  onChange={handleVerticalScroll}
                  className="h-full"
                  minValue={0}
                  maxValue={100}
                  step={1}
                  hideThumb={false}
                  classNames={{
                    base: "max-h-full gap-3",
                    track: "bg-white/10",
                    filler: "bg-purple-500",
                    thumb:
                      "bg-purple-500 shadow-lg border-2 border-white hover:bg-purple-600 hover:border-white/80",
                    label: "text-white",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
