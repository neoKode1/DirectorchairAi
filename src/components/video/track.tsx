import { db } from "@/data/db";
import {
  queryKeys,
  refreshVideoCache,
  useProjectMediaItems,
} from "@/data/queries";
import type { MediaItem, VideoKeyFrame, VideoTrack } from "@/data/schema";
import { cn, resolveDuration, resolveMediaUrl, trackIcons } from "@/lib/utils";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DownloadIcon, TrashIcon } from "lucide-react";
import {
  type HTMLAttributes,
  type MouseEventHandler,
  createElement,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { WithTooltip } from "../ui/tooltip";
import { useProjectId, useVideoProjectStore } from "@/data/store";
import { falClient } from "@/lib/fal";

type VideoTrackRowProps = {
  data: VideoTrack;
} & HTMLAttributes<HTMLDivElement>;

type TimelineCursorProps = {
  onPositionChange?: (position: number) => void;
  scale?: number;
  initialPosition?: number;
} & HTMLAttributes<HTMLDivElement>;

type PreviewWindowProps = {
  position: number;
  visible: boolean;
  cursorX: number;
  mediaItems: MediaItem[];
};

function PreviewWindow({ position, visible, cursorX, mediaItems }: PreviewWindowProps) {
  const projectId = useProjectId();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  
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
    if (activeFrame && previewVideoRef.current) {
      const relativeTime = (currentTimeMs - activeFrame.frame.timestamp) / 1000;
      if (Math.abs(previewVideoRef.current.currentTime - relativeTime) > 0.1) {
        previewVideoRef.current.currentTime = relativeTime;
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
          ref={previewVideoRef}
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

export function TimelineCursor({ 
  onPositionChange, 
  scale = 1, 
  initialPosition = 0,
  ...props 
}: TimelineCursorProps) {
  const [cursorPosition, setCursorPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorX, setCursorX] = useState(0);
  const setPlayerCurrentTimestamp = useVideoProjectStore(s => s.setPlayerCurrentTimestamp);
  const playerCurrentTimestamp = useVideoProjectStore(s => s.playerCurrentTimestamp);
  const setIsPlaying = useVideoProjectStore(s => s.setIsPlaying);
  const projectId = useProjectId();
  const { data: mediaItems = [] } = useProjectMediaItems(projectId);

  // Update cursor position when player timestamp changes
  useEffect(() => {
    if (!isDragging) {
      const position = (playerCurrentTimestamp / 30) * 100;
      setCursorPosition(position);
    }
  }, [playerCurrentTimestamp, isDragging]);

  const snapToGrid = (position: number) => {
    const gridSize = 100 / 15;
    const threshold = gridSize * 0.2;
    const closestGrid = Math.round(position / gridSize) * gridSize;
    
    if (Math.abs(position - closestGrid) < threshold) {
      return closestGrid;
    }
    return position;
  };

  const updatePreview = (position: number) => {
    const timestamp = (position / 100) * 30;
    setPlayerCurrentTimestamp(timestamp);
    onPositionChange?.(position);
  };

  const handleCursorDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const timelineElement = e.currentTarget.closest('.timeline-container');
    if (!timelineElement) return;

    setIsPlaying(false);
    setIsDragging(true);
    const timelineRect = timelineElement.getBoundingClientRect();
    const startX = e.clientX;
    const startPosition = cursorPosition;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const timelineWidth = timelineRect.width;
      const scaledDeltaX = deltaX / scale; // Account for zoom level
      const rawPosition = Math.max(0, Math.min(100, 
        startPosition + (scaledDeltaX / timelineWidth) * 100
      ));
      
      const newPosition = moveEvent.shiftKey ? rawPosition : snapToGrid(rawPosition);
      setCursorPosition(newPosition);
      setCursorX(moveEvent.clientX);
      updatePreview(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    const timelineElement = e.currentTarget.closest('.timeline-container');
    if (!timelineElement) return;

    setIsPlaying(false);
    const timelineRect = timelineElement.getBoundingClientRect();
    const scrollOffset = timelineElement.scrollLeft;
    const relativeX = (e.clientX - timelineRect.left + scrollOffset) / scale;
    const rawPosition = Math.max(0, Math.min(100, 
      (relativeX / timelineRect.width) * 100
    ));
    
    const newPosition = e.shiftKey ? rawPosition : snapToGrid(rawPosition);
    setCursorPosition(newPosition);
    updatePreview(newPosition);
  };

  const timeInSeconds = (cursorPosition / 100) * 30;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const frames = Math.floor((timeInSeconds % 1) * 30);
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;

  return (
    <div 
      className="absolute inset-0 pointer-events-auto" 
      onClick={handleTimelineClick}
      style={{
        transform: `scale(${scale}, 1)`,
        transformOrigin: '0 0',
      }}
    >
      <PreviewWindow 
        position={cursorPosition}
        visible={isDragging}
        cursorX={cursorX}
        mediaItems={mediaItems}
      />
      <div 
        className={cn(
          "absolute h-full w-[2px]",
          isDragging ? "bg-sky-400" : "bg-white"
        )}
        style={{
          left: `${cursorPosition}%`,
          transform: `translateX(-50%) scale(${1/scale}, 1)`,
          transformOrigin: '0 0',
          zIndex: 55,
        }}
      >
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 cursor-move"
          style={{ zIndex: 56 }}
          onMouseDown={handleCursorDrag}
        >
          <div 
            className={cn(
              "w-0 h-0",
              "border-l-[8px] border-l-transparent",
              "border-r-[8px] border-r-transparent",
              "border-t-[8px]",
              isDragging ? "border-t-sky-400" : "border-t-white",
              "filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
              "hover:scale-110 active:scale-105 transition-transform duration-75"
            )}
          />
        </div>

        <div 
          className={cn(
            "absolute -top-8 left-1/2 -translate-x-1/2",
            "px-2 py-1 rounded-md shadow-md",
            "flex items-center justify-center text-xs font-medium",
            "select-none pointer-events-none",
            "bg-white text-black",
            isDragging && "bg-sky-400 text-white"
          )}
          style={{
            transform: `scale(${1 / scale})`,
            zIndex: 57
          }}
        >
          <span className="font-mono">{timeDisplay}</span>
          {isDragging && (
            <span className="ml-1 opacity-50 text-[10px]">(Hold ⇧ to disable snap)</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoTrackRow({ data, ...props }: VideoTrackRowProps) {
  const { data: keyframes = [] } = useQuery({
    queryKey: ["frames", data],
    queryFn: () => db.keyFrames.keyFramesByTrack(data.id),
  });

  const mediaType = useMemo(() => keyframes[0]?.data.type, [keyframes]);

  return (
    <div
      className={cn(
        "relative w-full",
        "flex flex-col select-none rounded overflow-hidden shrink-0",
        {
          "min-h-[64px]": mediaType,
          "min-h-[56px]": !mediaType,
        },
      )}
      {...props}
    >
      {keyframes.map((frame) => (
        <VideoTrackView
          key={frame.id}
          className="absolute top-0 bottom-0"
          style={{
            left: `${(frame.timestamp / 10 / 30).toFixed(2)}%`,
            width: `${(frame.duration / 10 / 30).toFixed(2)}%`,
          }}
          track={data}
          frame={frame}
        />
      ))}
    </div>
  );
}

type AudioWaveformProps = {
  data: MediaItem;
};

function AudioWaveform({ data }: AudioWaveformProps) {
  const { data: waveform = [] } = useQuery({
    queryKey: ["media", "waveform", data.id],
    queryFn: async () => {
      if (data.metadata?.waveform && Array.isArray(data.metadata.waveform)) {
        return data.metadata.waveform;
      }
      const { data: waveformInfo } = await falClient.subscribe(
        "fal-ai/ffmpeg-api/waveform",
        {
          input: {
            media_url: resolveMediaUrl(data),
            points_per_second: 5,
            precision: 3,
          },
        },
      );
      await db.media.update(data.id, {
        ...data,
        metadata: {
          ...data.metadata,
          waveform: waveformInfo.waveform,
        },
      });
      return waveformInfo.waveform as number[];
    },
    placeholderData: keepPreviousData,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const svgWidth = waveform.length * 3;
  const svgHeight = 100;

  return (
    <div className="h-full flex items-center">
      <svg
        width="100%"
        height="80%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
      >
        <title>Audio Waveform</title>
        {waveform.map((v, index) => {
          const amplitude = Math.abs(v);
          const height = Math.max(amplitude * svgHeight, 2);
          const x = index * 3;
          const y = (svgHeight - height) / 2;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width="2"
              height={height}
              className="fill-black/40"
              rx="4"
            />
          );
        })}
      </svg>
    </div>
  );
}

type VideoTrackViewProps = {
  track: VideoTrack;
  frame: VideoKeyFrame;
} & HTMLAttributes<HTMLDivElement>;

export function VideoTrackView({
  className,
  track,
  frame,
  ...props
}: VideoTrackViewProps) {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const setPlayerCurrentTimestamp = useVideoProjectStore(s => s.setPlayerCurrentTimestamp);
  const setIsPlaying = useVideoProjectStore(s => s.setIsPlaying);
  const deleteKeyframe = useMutation({
    mutationFn: () => db.keyFrames.delete(frame.id),
    onSuccess: () => refreshVideoCache(queryClient, track.projectId),
  });

  const handleMouseEnter = () => {
    // Convert timestamp from milliseconds to seconds (30fps)
    const timestamp = frame.timestamp / (1000 / 30);
    setPlayerCurrentTimestamp(timestamp);
    setIsPlaying(true);
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
  };

  const handleOnDelete = () => {
    deleteKeyframe.mutate();
  };

  const isSelected = useVideoProjectStore((state) =>
    state.selectedKeyframes.includes(frame.id),
  );
  const selectKeyframe = useVideoProjectStore((state) => state.selectKeyframe);
  const handleOnClick: MouseEventHandler = (e) => {
    if (e.detail > 1) {
      return;
    }
    selectKeyframe(frame.id);
  };

  const projectId = useProjectId();
  const { data: mediaItems = [] } = useProjectMediaItems(projectId);

  const media = mediaItems.find((item) => item.id === frame.data.mediaId);
  if (!media) return null;

  const mediaUrl = resolveMediaUrl(media);

  const imageUrl = useMemo(() => {
    if (media.mediaType === "image") {
      return mediaUrl;
    }
    if (media.mediaType === "video") {
      return (
        media.input?.image_url ||
        media.metadata?.start_frame_url ||
        media.metadata?.end_frame_url
      );
    }
    return undefined;
  }, [media, mediaUrl]);

  const label = media.mediaType ?? "unknown";

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    
    // Don't initiate drag if clicking buttons or resize handle
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }

    e.stopPropagation();
    setIsDragging(true);
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const timelineElement = trackRef.current.closest('.timeline-container');
    if (!timelineElement) return;
    
    const timelineRect = timelineElement.getBoundingClientRect();
    const startX = e.clientX;
    const startLeft = trackRect.left - timelineRect.left;
    setDragOffset(e.clientX - trackRect.left);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current || !timelineElement) return;
      
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const timelineWidth = timelineRect.width;
      
      // Calculate new position as percentage
      let newLeft = startLeft + deltaX;
      const maxLeft = timelineWidth - trackRect.width;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      
      // Convert to timestamp
      const newTimestamp = (newLeft / timelineWidth) * 30 * 1000;
      frame.timestamp = Math.round(newTimestamp / 100) * 100; // Snap to 100ms intervals
      
      // Update visual position
      trackRef.current.style.left = `${(frame.timestamp / (30 * 1000)) * 100}%`;
    };

    const handleMouseUp = async () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Save the new position
      await db.keyFrames.update(frame.id, { timestamp: frame.timestamp });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectPreview(projectId),
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    e.stopPropagation();
    const trackElement = trackRef.current;
    if (!trackElement) return;
    const startX = e.clientX;
    const startWidth = trackElement.offsetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + (direction === "right" ? deltaX : -deltaX);

      const minDuration = 1000;
      const maxDuration: number = resolveDuration(media) ?? 5000;

      const timelineElement = trackElement.closest(".timeline-container");
      const parentWidth = timelineElement
        ? (timelineElement as HTMLElement).offsetWidth
        : 1;
      let newDuration = (newWidth / parentWidth) * 30 * 1000;

      if (newDuration < minDuration) {
        newWidth = (minDuration / 1000 / 30) * parentWidth;
        newDuration = minDuration;
      } else if (newDuration > maxDuration) {
        newWidth = (maxDuration / 1000 / 30) * parentWidth;
        newDuration = maxDuration;
      }

      frame.duration = newDuration;
      trackElement.style.width = `${((frame.duration / 30) * 100) / 1000}%`;
    };

    const handleMouseUp = () => {
      frame.duration = Math.round(frame.duration / 100) * 100;
      trackElement.style.width = `${((frame.duration / 30) * 100) / 1000}%`;
      db.keyFrames.update(frame.id, { duration: frame.duration });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectPreview(projectId),
      });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleExportFrame = async () => {
    if (!media || !mediaUrl) return;
    
    let exportUrl = '';
    
    if (media.mediaType === 'image') {
      exportUrl = mediaUrl;
    } else if (media.mediaType === 'video') {
      // For video, use the thumbnail or first frame
      exportUrl = media.metadata?.start_frame_url || media.input?.image_url || '';
    }

    if (exportUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `frame-${frame.id}.jpg`; // Default to jpg extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      aria-checked={isSelected}
      onClick={handleOnClick}
      className={cn(
        "flex flex-col border border-white/10 rounded-lg cursor-move",
        isDragging && "opacity-75 shadow-xl",
        className,
      )}
      style={{ 
        zIndex: isDragging ? 60 : 50,
        left: `${(frame.timestamp / (30 * 1000)) * 100}%`,
        width: `${(frame.duration / (30 * 1000)) * 100}%`,
        position: 'absolute',
        top: 0,
        bottom: 0,
      }}
      {...props}
    >
      <div
        className={cn(
          "flex flex-col select-none rounded overflow-hidden group h-full",
          {
            "bg-sky-600": track.type === "video",
            "bg-teal-500": track.type === "music",
            "bg-indigo-500": track.type === "voiceover",
          },
        )}
      >
        <div className="p-0.5 pl-1 bg-black/10 flex flex-row items-center">
          <div className="flex flex-row gap-1 text-sm items-center font-semibold text-white/60 w-full">
            <div className="flex flex-row truncate gap-1 items-center">
              {createElement(trackIcons[track.type], {
                className: "w-5 h-5 text-white",
              } as React.ComponentProps<
                (typeof trackIcons)[typeof track.type]
              >)}
              <span className="line-clamp-1 truncate text-sm mb-[2px] w-full ">
                {media.input?.prompt || label}
              </span>
            </div>
            <div className="flex flex-row shrink-0 flex-1 items-center justify-end gap-1">
              {(media.mediaType === 'image' || media.mediaType === 'video') && (
                <WithTooltip tooltip="Export frame">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-black/5 group-hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportFrame();
                    }}
                  >
                    <DownloadIcon className="w-3 h-3 text-white" />
                  </button>
                </WithTooltip>
              )}
              <WithTooltip tooltip="Remove content">
                <button
                  type="button"
                  className="p-1 rounded hover:bg-black/5 group-hover:text-white"
                  onClick={handleOnDelete}
                >
                  <TrashIcon className="w-3 h-3 text-white" />
                </button>
              </WithTooltip>
            </div>
          </div>
        </div>
        <div
          className="p-px flex-1 items-center bg-repeat-x h-full max-h-full overflow-hidden relative"
          style={
            imageUrl
              ? {
                  background: `url(${imageUrl})`,
                  backgroundSize: "auto 100%",
                }
              : undefined
          }
        >
          {(media.mediaType === "music" || media.mediaType === "voiceover") && (
            <AudioWaveform data={media} />
          )}
          <div
            className={cn(
              "absolute right-0 z-50 top-0 bg-black/20 group-hover:bg-black/40",
              "rounded-md bottom-0 w-2 m-1 p-px cursor-ew-resize backdrop-blur-md text-white/40",
              "transition-colors flex flex-col items-center justify-center text-xs tracking-tighter resize-handle",
            )}
            onMouseDown={(e) => handleResize(e, "right")}
          >
            <span className="flex gap-[1px]">
              <span className="w-px h-2 rounded bg-white/40" />
              <span className="w-px h-2 rounded bg-white/40" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
