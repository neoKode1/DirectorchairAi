import { db } from "@/data/db";
import {
  TRACK_TYPE_ORDER,
  type MediaItem,
  type VideoTrack,
  type VideoKeyFrame,
} from "@/data/schema";
import { useProjectId, useVideoProjectStore } from "@/data/store";
import { cn, resolveDuration, resolveMediaUrl } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type DragEventHandler, useMemo, useState, useRef, useEffect } from "react";
import { VideoControls } from "./video-controls";
import { TimelineRuler } from "./video/timeline";
import { VideoTrackRow } from "./video/track";
import { queryKeys, refreshVideoCache, useProjectMediaItems } from "@/data/queries";
import { Slider } from "@nextui-org/react";
import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { TimelineCursor } from "./video/track";

type PreviewWindowProps = {
  position: number;
  visible: boolean;
  cursorX: number;
};

function PreviewWindow({ position, visible, cursorX }: PreviewWindowProps) {
  const projectId = useProjectId();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: mediaItems = [] } = useProjectMediaItems(projectId);

  // Get all tracks and their keyframes
  const tracks = useQuery({
    queryKey: ["tracks", projectId],
    queryFn: () => db.tracks.tracksByProject(projectId),
  }).data || [];

  // Calculate current timestamp in milliseconds
  const currentTimeMs = (position / 100) * 30 * 1000;

  // Find the active keyframe at current timestamp
  const activeFrame = useMemo(() => {
    for (const track of tracks) {
      const keyframes = queryClient.getQueryData<VideoKeyFrame[]>(["frames", track]) || [];
      const frame = keyframes.find(frame => {
        const frameStart = frame.timestamp;
        const frameEnd = frame.timestamp + frame.duration;
        return currentTimeMs >= frameStart && currentTimeMs < frameEnd;
      });
      if (frame) {
        return { frame, track };
      }
    }
    return null;
  }, [tracks, currentTimeMs, queryClient]);

  // Update video time when position changes
  useEffect(() => {
    if (activeFrame && videoRef.current) {
      const relativeTime = (currentTimeMs - activeFrame.frame.timestamp) / 1000;
      if (Math.abs(videoRef.current.currentTime - relativeTime) > 0.1) {
        videoRef.current.currentTime = relativeTime;
      }
    }
  }, [currentTimeMs, activeFrame]);

  if (!visible || !activeFrame) return null;

  const currentMedia = mediaItems.find(item => item.id === activeFrame.frame.data.mediaId);
  if (!currentMedia) return null;

  const mediaUrl = resolveMediaUrl(currentMedia);
  if (!mediaUrl) return null;

  return (
    <div 
      className={cn(
        "absolute pointer-events-none",
        "bg-black/90 rounded-lg overflow-hidden",
        "border border-white/20 shadow-xl"
      )}
      style={{
        width: "160px",
        height: "90px",
        left: Math.min(Math.max(cursorX - 80, 10), window.innerWidth - 170),
        top: "-120px",
        zIndex: 60,
      }}
    >
      {currentMedia.mediaType === "video" ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          playsInline
          muted
        />
      ) : (
        <img 
          src={mediaUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-1 text-[10px] text-white/80 text-center">
        {currentMedia.input?.prompt || activeFrame.track.type}
      </div>
    </div>
  );
}

export default function BottomBar() {
  const queryClient = useQueryClient();
  const projectId = useProjectId();
  const setPlayerCurrentTimestamp = useVideoProjectStore(
    (s) => s.setPlayerCurrentTimestamp
  );
  const playerCurrentTimestamp = useVideoProjectStore(
    (s) => s.playerCurrentTimestamp,
  );
  const formattedTimestamp =
    (playerCurrentTimestamp < 10 ? "0" : "") +
    playerCurrentTimestamp.toFixed(2);
  const minTrackWidth = `${((2 / 30) * 100).toFixed(2)}%`;
  const [dragOverTracks, setDragOverTracks] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Update timeline width on mount and zoom change
  useEffect(() => {
    if (timelineContainerRef.current) {
      setTimelineWidth(timelineContainerRef.current.offsetWidth);
    }
  }, [zoomLevel]);

  // Update cursor position when player timestamp changes
  useEffect(() => {
    if (!isDragging) {
      const position = (playerCurrentTimestamp / 30) * 100;
      setCursorPosition(position);
      
      // Update cursorX based on timeline width
      if (timelineContainerRef.current) {
        const timelineRect = timelineContainerRef.current.getBoundingClientRect();
        const newX = (position / 100) * timelineRect.width + timelineRect.left;
        setCursorX(newX);
      }
    }
  }, [playerCurrentTimestamp, isDragging]);

  const handleOnDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setDragOverTracks(true);
    const jobPayload = event.dataTransfer.getData("job");
    if (!jobPayload) return false;
    const job: MediaItem = JSON.parse(jobPayload);
    return job.status === "completed";
  };

  const addToTrack = useMutation({
    mutationFn: async (media: MediaItem) => {
      // Find or create appropriate track based on media type
      let track = tracks.find(t => {
        if (media.mediaType === "video" || media.mediaType === "image") return t.type === "video";
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
          locked: false
        });

        const foundTrack = await db.tracks.find(newTrack.toString());
        if (!foundTrack) throw new Error("Failed to create track");
        track = foundTrack;
      }

      // Get existing keyframes to determine insertion point
      const existingKeyframes = await db.keyFrames.keyFramesByTrack(track.id);
      const lastKeyframe = existingKeyframes[existingKeyframes.length - 1];
      
      // Calculate new keyframe timestamp (place after last keyframe or at start)
      const timestamp = lastKeyframe 
        ? lastKeyframe.timestamp + lastKeyframe.duration 
        : 0;

      // Create new keyframe
      const duration = media.mediaType === "video" 
        ? (resolveDuration(media) ?? 5000)  // Default to 5s if duration can't be resolved
        : media.metadata?.duration ?? 5000;  // Use metadata duration or default to 5s

      // Create keyframe data based on media type
      const baseData = {
        mediaId: media.id,
        prompt: media.input?.prompt || media.metadata?.title || ""
      };

      let keyframeData;
      if (media.mediaType === "video" || media.mediaType === "image") {
        keyframeData = {
          ...baseData,
          type: "video" as const,
          url: media.input?.image_url || ""
        };
      } else {
        keyframeData = {
          ...baseData,
          type: "prompt" as const
        };
      }

      const keyframe = await db.keyFrames.create({
        trackId: track.id,
        timestamp: timestamp,
        duration: duration,
        data: keyframeData
      });

      return keyframe;
    },
    onSuccess: (data) => {
      if (!data) return;
      refreshVideoCache(queryClient, projectId);
    },
  });

  const { data: tracks = [] } = useQuery({
    queryKey: queryKeys.projectTracks(projectId),
    queryFn: async () => {
      const result = await db.tracks.tracksByProject(projectId);
      return result.toSorted(
        (a, b) => TRACK_TYPE_ORDER[a.type] - TRACK_TYPE_ORDER[b.type],
      );
    },
  });

  const trackObj: Record<string, VideoTrack> = useMemo(() => {
    return {
      video:
        tracks.find((t) => t.type === "video") ||
        ({
          id: "video",
          type: "video",
          label: "Video",
          locked: true,
          keyframes: [],
          projectId: projectId,
        } as VideoTrack),
      music:
        tracks.find((t) => t.type === "music") ||
        ({
          id: "music",
          type: "music",
          label: "Music",
          locked: true,
          keyframes: [],
          projectId: projectId,
        } as VideoTrack),
      voiceover:
        tracks.find((t) => t.type === "voiceover") ||
        ({
          id: "voiceover",
          type: "voiceover",
          label: "Voiceover",
          locked: true,
          keyframes: [],
          projectId: projectId,
        } as VideoTrack),
    };
  }, [tracks, projectId]);

  const handleOnDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setDragOverTracks(false);
    const jobPayload = event.dataTransfer.getData("job");
    if (!jobPayload) return false;
    const job: MediaItem = JSON.parse(jobPayload);
    addToTrack.mutate(job);
    return true;
  };

  const handleZoomChange = (value: number | number[]) => {
    const newZoom = Array.isArray(value) ? value[0] : value;
    setZoomLevel(newZoom);

    // Adjust scroll position to keep current time in view
    if (timelineContainerRef.current) {
      const container = timelineContainerRef.current;
      const currentTimePixel = (playerCurrentTimestamp / 30) * timelineWidth;
      const scrollRatio = currentTimePixel / container.scrollWidth;
      const newScrollLeft = scrollRatio * (timelineWidth * (newZoom / 100));
      container.scrollLeft = newScrollLeft;
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - timelineRect.left;
    const position = Math.max(0, Math.min(100, (relativeX / timelineRect.width) * 100));
    setCursorPosition(position);
    setCursorX(e.clientX);
    setShowPreview(true);
  };

  const handleTimelineMouseLeave = () => {
    setIsHovering(false);
    setShowPreview(false);
    // Update to current playback position when leaving
    const position = (playerCurrentTimestamp / 30) * 100;
    setCursorPosition(position);
    if (timelineRef.current) {
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const newX = (position / 100) * timelineRect.width + timelineRect.left;
      setCursorX(newX);
    }
  };

  return (
    <div className="border-t pb-2 border-border flex flex-col bg-background-light">
      <div className="border-b border-border bg-background-dark px-2 flex flex-row gap-8 py-2 justify-between items-center flex-1">
        <div className="h-full flex flex-col justify-center px-4 bg-muted/50 rounded-md font-mono cursor-default select-none shadow-inner">
          <div className="flex flex-row items-baseline font-thin tabular-nums">
            <span className="text-muted-foreground">00:</span>
            <span>{formattedTimestamp}</span>
            <span className="text-muted-foreground/50 mx-2">/</span>
            <span className="text-sm opacity-50">
              <span className="text-muted-foreground">00:</span>30.00
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ZoomOutIcon className="w-4 h-4 text-muted-foreground" />
          <Slider
            aria-label="Zoom Level"
            className="w-32"
            color="secondary"
            defaultValue={zoomLevel}
            maxValue={400}
            minValue={25}
            step={25}
            value={zoomLevel}
            onChange={handleZoomChange}
            classNames={{
              base: "max-w-md gap-3",
              track: "bg-white/10",
              filler: "bg-purple-500",
              thumb: "bg-purple-500 shadow-lg border-2 border-white",
              label: "text-white"
            }}
          />
          <ZoomInIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground ml-2 tabular-nums w-12">
            {zoomLevel}%
          </span>
        </div>
        <VideoControls />
      </div>
      <div
        className={cn(
          "min-h-64 max-h-72 h-full flex flex-col overflow-y-scroll transition-colors relative",
          {
            "bg-white/5": dragOverTracks,
          },
        )}
        onDragOver={handleOnDragOver}
        onDragLeave={() => setDragOverTracks(false)}
        onDrop={handleOnDrop}
      >
        <TimelineRuler className="sticky top-0 z-[40] pointer-events-none" />
        
        <div 
          ref={timelineContainerRef}
          className="relative flex-1 timeline-container mx-4 overflow-x-auto"
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onMouseEnter={() => setIsHovering(true)}
        >
          <div 
            className="absolute inset-0"
            style={{
              width: `${100 * (zoomLevel / 100)}%`,
              minWidth: '100%',
              height: '100%',
              transformOrigin: '0 0',
            }}
          >
            <div className="absolute inset-0 z-[42]">
              <TimelineCursor 
                onPositionChange={(position) => {
                  const timestamp = (position / 100) * 30;
                  setPlayerCurrentTimestamp(timestamp);
                }}
                initialPosition={cursorPosition}
                scale={zoomLevel / 100}
              />
            </div>
            
            <div 
              className="flex flex-col h-full mt-10 gap-2 pb-2"
              style={{
                position: 'relative',
                zIndex: 41,
                width: '100%',
                transform: `scale(${zoomLevel / 100}, 1)`,
                transformOrigin: '0 0'
              }}
            >
              {Object.values(trackObj).map((track, index) =>
                track ? (
                  <VideoTrackRow
                    key={track.id}
                    data={track}
                    style={{
                      minWidth: minTrackWidth,
                      transform: `scale(${100 / zoomLevel}, 1)`,
                      transformOrigin: '0 0'
                    }}
                  />
                ) : null
              )}
            </div>
          </div>
        </div>

        <div className="h-8 px-4 flex items-center border-t border-border bg-background-dark z-[45]">
          <Slider
            aria-label="Timeline Progress"
            className="w-full"
            color="secondary"
            defaultValue={0}
            maxValue={100}
            minValue={0}
            step={0.1}
            value={playerCurrentTimestamp / 30 * 100}
            onChange={value => {
              const timestamp = (Array.isArray(value) ? value[0] : value) / 100 * 30;
              setPlayerCurrentTimestamp(timestamp);
            }}
            classNames={{
              base: "max-w-full gap-3",
              track: "bg-white/10",
              filler: "bg-purple-500",
              thumb: "bg-purple-500 shadow-lg border-2 border-white",
              label: "text-white"
            }}
          />
        </div>
      </div>
    </div>
  );
}
