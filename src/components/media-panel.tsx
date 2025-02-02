import { db } from "@/data/db";
import { queryKeys, refreshVideoCache } from "@/data/queries";
import type { MediaItem, VideoTrack } from "@/data/schema";
import { useProjectId, useVideoProjectStore } from "@/data/store";
import { falClient } from "@/lib/fal";
import { cn, resolveMediaUrl, trackIcons } from "@/lib/utils";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CircleXIcon,
  GripVerticalIcon,
  HourglassIcon,
  ImageIcon,
  MicIcon,
  MusicIcon,
  VideoIcon,
} from "lucide-react";
import {
  type DragEventHandler,
  Fragment,
  type HTMLAttributes,
  createElement,
  MouseEvent,
} from "react";
import { Badge } from "./ui/badge";
import { LoadingIcon } from "./ui/icons";
import { useToast } from "@/hooks/use-toast";
import { getMediaMetadata } from "@/lib/ffmpeg";

type MediaItemRowProps = {
  data: MediaItem;
  onOpen: (data: MediaItem) => void;
  onDoubleClick?: (data: MediaItem) => void;
  draggable?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onDoubleClick'>;

export function MediaItemRow({
  data,
  className,
  onOpen,
  onDoubleClick,
  draggable = true,
  ...props
}: MediaItemRowProps) {
  const isDone = data.status === "completed" || data.status === "failed";
  const queryClient = useQueryClient();
  const projectId = useProjectId();
  const { toast } = useToast();

  useQuery({
    queryKey: queryKeys.projectMedia(projectId, data.id),
    queryFn: async () => {
      if (data.kind === "uploaded") return null;
      const queueStatus = await falClient.queue.status(data.endpointId, {
        requestId: data.requestId,
      });
      if (queueStatus.status === "IN_PROGRESS") {
        await db.media.update(data.id, {
          ...data,
          status: "running",
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.projectMediaItems(data.projectId),
        });
      }
      let media: Partial<MediaItem> = {};

      if (queueStatus.status === "COMPLETED") {
        try {
          const result = await falClient.queue.result(data.endpointId, {
            requestId: data.requestId,
          });
          media = {
            ...data,
            output: result.data,
            status: "completed",
          };

          await db.media.update(data.id, media);

          toast({
            title: "Generation completed",
            description: `Your ${data.mediaType} has been generated successfully.`,
          });
        } catch {
          await db.media.update(data.id, {
            ...data,
            status: "failed",
          });
          toast({
            title: "Generation failed",
            description: `Failed to generate ${data.mediaType}.`,
          });
        } finally {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.projectMediaItems(data.projectId),
          });
        }

        if (media.mediaType !== "image") {
          const mediaMetadata = await getMediaMetadata(media as MediaItem);

          await db.media.update(data.id, {
            ...media,
            metadata: mediaMetadata?.media || {},
          });

          await queryClient.invalidateQueries({
            queryKey: queryKeys.projectMediaItems(data.projectId),
          });
        }
      }

      return null;
    },
    enabled: !isDone && data.kind === "generated",
    refetchInterval: data.mediaType === "video" ? 20000 : 1000,
  });

  const mediaUrl = resolveMediaUrl(data) ?? "";
  const mediaId = data.id.split("-")[0];

  const handleOnDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    if (data.status !== "completed") {
      event.preventDefault();
      return;
    }
    
    event.dataTransfer.effectAllowed = "copy";
    const dragData = {
      ...data,
      url: mediaUrl,
    };
    event.dataTransfer.setData("application/json", JSON.stringify(dragData));
    event.dataTransfer.setData("job", JSON.stringify(dragData));
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onOpen(data);
  };

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (data.status === "completed" && onDoubleClick) {
      onDoubleClick(data);
    }
  };

  const coverImage =
    data.mediaType === "video"
      ? data.metadata?.start_frame_url || data?.metadata?.end_frame_url
      : resolveMediaUrl(data);

  return (
    <div
      className={cn(
        "flex items-start space-x-2 py-2 w-full px-4 hover:bg-accent transition-all",
        {
          "cursor-grab": draggable && data.status === "completed",
          "cursor-not-allowed": data.status !== "completed",
        },
        className,
      )}
      {...props}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={draggable && data.status === "completed"}
      onDragStart={handleOnDragStart}
    >
      {!!draggable && (
        <div
          className={cn(
            "flex items-center h-full cursor-grab text-muted-foreground",
            {
              "text-muted": data.status !== "completed",
            },
          )}
        >
          <GripVerticalIcon className="w-4 h-4" />
        </div>
      )}
      <div className="w-16 h-16 aspect-square relative rounded overflow-hidden border border-transparent hover:border-accent bg-accent transition-all">
        {data.status === "completed" ? (
          <>
            {(data.mediaType === "image" || data.mediaType === "video") &&
              (coverImage ? (
                <img
                  src={coverImage}
                  alt="Generated media"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center top-0 left-0 absolute p-2 z-50">
                  {data.mediaType === "image" ? (
                    <ImageIcon className="w-7 h-7 text-muted-foreground" />
                  ) : (
                    <VideoIcon className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
              ))}
            {data.mediaType === "music" && (
              <div className="w-full h-full flex items-center justify-center top-0 left-0 absolute p-2 z-50">
                <MusicIcon className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            {data.mediaType === "voiceover" && (
              <div className="w-full h-full flex items-center justify-center top-0 left-0 absolute p-2 z-50">
                <MicIcon className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center text-muted-foreground">
            {data.status === "running" && <LoadingIcon className="w-8 h-8" />}
            {data.status === "pending" && (
              <HourglassIcon className="w-8 h-8 animate-spin ease-in-out delay-700 duration-1000" />
            )}
            {data.status === "failed" && (
              <CircleXIcon className="w-8 h-8 text-rose-700" />
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col h-full gap-1 flex-1">
        <div className="flex flex-col items-start justify-center">
          <div className="flex w-full justify-between">
            <h3 className="text-sm font-medium flex flex-row gap-1 items-center">
              {createElement(trackIcons[data.mediaType], {
                className: "w-4 h-4 stroke-1",
              } as React.ComponentProps<
                (typeof trackIcons)[keyof typeof trackIcons]
              >)}
              <span>{data.kind === "generated" ? "Job" : "File"}</span>
              <code className="text-muted-foreground">#{mediaId}</code>
            </h3>
            {data.status !== "completed" && (
              <Badge
                variant="outline"
                className={cn({
                  "text-rose-700": data.status === "failed",
                  "text-sky-500": data.status === "running",
                  "text-muted-foreground": data.status === "pending",
                })}
              >
                {data.status}
              </Badge>
            )}
          </div>
          <p className="opacity-40 text-sm line-clamp-1 ">
            {data.input?.prompt}
          </p>
        </div>
        <div className="flex flex-row gap-2 justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(data.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

type MediaItemsPanelProps = {
  data: MediaItem[];
  mediaType: string;
} & HTMLAttributes<HTMLDivElement>;

export function MediaItemPanel({
  className,
  data,
  mediaType,
}: MediaItemsPanelProps) {
  const setSelectedMediaId = useVideoProjectStore((s) => s.setSelectedMediaId);
  const queryClient = useQueryClient();
  const projectId = useProjectId();
  const { toast } = useToast();

  const addToTrack = useMutation({
    mutationFn: async (media: MediaItem) => {
      // Get all tracks for this project
      const tracks = await db.tracks.tracksByProject(projectId);
      
      // Find appropriate track based on media type
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
        
        const newTrackId = await db.tracks.create({
          type: trackType,
          label: trackType.charAt(0).toUpperCase() + trackType.slice(1),
          projectId: projectId,
          locked: false
        });

        const foundTrack = await db.tracks.find(newTrackId.toString());
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

      // Calculate duration in frames (30fps)
      const defaultDurationMs = 5000; // Default 5 seconds
      const mediaDurationMs = media.metadata?.duration ?? defaultDurationMs;
      const durationInFrames = Math.max(1, Math.floor((mediaDurationMs / 1000) * 30));

      const keyframe = await db.keyFrames.create({
        trackId: track.id,
        timestamp: timestamp,
        duration: durationInFrames,
        data: keyframeData
      });

      return keyframe;
    },
    onSuccess: () => {
      refreshVideoCache(queryClient, projectId);
      toast({
        title: "Added to timeline",
        description: "Media has been added to the timeline.",
      });
    },
    onError: (error) => {
      console.error("Failed to add to timeline:", error);
      toast({
        title: "Failed to add to timeline",
        description: "There was an error adding the media to the timeline.",
        variant: "destructive",
      });
    },
  });

  const handleOnOpen = (item: MediaItem) => {
    setSelectedMediaId(item.id);
  };

  const handleDoubleClick = (item: MediaItem) => {
    if (item.status === "completed") {
      addToTrack.mutate(item);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden divide-y divide-border",
        className,
      )}
    >
      {data
        .filter((media) => {
          if (mediaType === "all") return true;
          return media.mediaType === mediaType;
        })
        .map((media) => (
          <Fragment key={media.id}>
            <MediaItemRow 
              data={media} 
              onOpen={handleOnOpen}
              onDoubleClick={handleDoubleClick}
            />
          </Fragment>
        ))}
    </div>
  );
}
