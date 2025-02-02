import {
  ComponentProps,
  HTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
  useMemo,
} from "react";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPanel,
  SheetPortal,
  SheetTitle,
} from "./ui/sheet";
import {
  queryKeys,
  refreshVideoCache,
  useProjectMediaItems,
} from "@/data/queries";
import { useProjectId, useVideoProjectStore } from "@/data/store";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { MediaItem } from "@/data/schema";
import {
  CopyIcon,
  FilmIcon,
  ImagesIcon,
  MicIcon,
  MusicIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { formatDuration } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/data/db";
import { LoadingIcon } from "./ui/icons";
import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import type { DragEventHandler } from "react";

type MediaGallerySheetProps = ComponentProps<typeof Sheet> & {
  selectedMediaId: string;
};

type AudioPlayerProps = {
  media: MediaItem;
} & HTMLAttributes<HTMLAudioElement>;

function AudioPlayer({ media, ...props }: AudioPlayerProps) {
  const src = resolveMediaUrl(media);
  if (!src) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square bg-accent text-muted-foreground flex flex-col items-center justify-center">
        {media.mediaType === "music" && <MusicIcon className="w-1/2 h-1/2" />}
        {media.mediaType === "voiceover" && <MicIcon className="w-1/2 h-1/2" />}
      </div>
      <div>
        <audio src={src} {...props} controls className="rounded" />
      </div>
    </div>
  );
}

type MediaPropertyItemProps = {
  className?: string;
  label: string;
  value: string;
};

function MediaPropertyItem({
  children,
  className,
  label,
  value,
}: PropsWithChildren<MediaPropertyItemProps>) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-1 rounded bg-black/50 p-3 text-sm flex-wrap text-wrap overflow-hidden",
        className,
      )}
    >
      <div className="absolute right-2 top-2 opacity-30 transition-opacity group-hover:opacity-70">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(value);
          }}
        >
          <CopyIcon className="w-4 h-4" />
        </Button>
      </div>
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground text-ellipsis">
        {children ?? value}
      </div>
    </div>
  );
}

const MEDIA_PLACEHOLDER: MediaItem = {
  id: "placeholder",
  kind: "generated",
  input: { prompt: "n/a" },
  mediaType: "image",
  status: "pending",
  createdAt: 0,
  endpointId: "n/a",
  projectId: "",
  requestId: "",
};

export function MediaGallerySheet({
  selectedMediaId,
  ...props
}: MediaGallerySheetProps) {
  const projectId = useProjectId();
  const { data: mediaItems = [] } = useProjectMediaItems(projectId);
  const selectedMedia =
    mediaItems.find((media) => media.id === selectedMediaId) ??
    MEDIA_PLACEHOLDER;
  const setSelectedMediaId = useVideoProjectStore((s) => s.setSelectedMediaId);
  const setGenerateData = useVideoProjectStore((s) => s.setGenerateData);
  const setEndpointId = useVideoProjectStore((s) => s.setEndpointId);
  const setGenerateMediaType = useVideoProjectStore(
    (s) => s.setGenerateMediaType,
  );
  const onGenerate = useVideoProjectStore((s) => s.onGenerate);

  const handleOpenGenerateDialog = () => {
    setGenerateMediaType("video");
    const image = selectedMedia.output?.images?.[0]?.url;

    const endpoint = AVAILABLE_ENDPOINTS.find(
      (endpoint) => endpoint.category === "video",
    );

    setEndpointId(endpoint?.endpointId ?? AVAILABLE_ENDPOINTS[0].endpointId);

    setGenerateData({
      ...(selectedMedia.input || {}),
      image,
      duration: undefined,
    });
    setSelectedMediaId(null);
    onGenerate();
  };

  const handleVary = () => {
    setGenerateMediaType(selectedMedia.mediaType);
    setEndpointId(selectedMedia.endpointId as string);
    setGenerateData(selectedMedia.input || {});
    setSelectedMediaId(null);
    onGenerate();
  };

  // Event handlers
  const preventClose: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const close = () => {
    setSelectedMediaId(null);
  };
  const mediaUrl = useMemo(
    () => resolveMediaUrl(selectedMedia),
    [selectedMedia],
  );
  const prompt = selectedMedia?.input?.prompt;

  const queryClient = useQueryClient();
  const deleteMedia = useMutation({
    mutationFn: () => db.media.delete(selectedMediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectMediaItems(projectId),
      });
      refreshVideoCache(queryClient, projectId);
      close();
    },
  });
  return (
    <Sheet {...props}>
      <SheetOverlay className="pointer-events-none flex flex-col" />
      <SheetPortal>
        <div
          className="pointer-events-auto fixed inset-0 z-[51] mr-[42rem] flex flex-col items-center justify-center gap-4 px-32 py-16"
          onClick={close}
        >
          {!!mediaUrl && (
            <>
              {selectedMedia.mediaType === "image" && (
                <img
                  src={mediaUrl}
                  className="animate-fade-scale-in h-auto max-h-[90%] w-auto max-w-[90%] object-contain transition-all cursor-grab"
                  onClick={preventClose}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("application/json", JSON.stringify(selectedMedia));
                    event.dataTransfer.setData("job", JSON.stringify(selectedMedia));
                  }}
                />
              )}
              {selectedMedia.mediaType === "video" && (
                <video
                  src={mediaUrl}
                  className="animate-fade-scale-in h-auto max-h-[90%] w-auto max-w-[90%] object-contain transition-all cursor-grab"
                  controls
                  onClick={preventClose}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("application/json", JSON.stringify(selectedMedia));
                    event.dataTransfer.setData("job", JSON.stringify(selectedMedia));
                  }}
                />
              )}
              {(selectedMedia.mediaType === "music" ||
                selectedMedia.mediaType === "voiceover") && (
                <div
                  draggable
                  className="cursor-grab"
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("application/json", JSON.stringify(selectedMedia));
                    event.dataTransfer.setData("job", JSON.stringify(selectedMedia));
                  }}
                >
                  <AudioPlayer media={selectedMedia} />
                </div>
              )}
            </>
          )}
          <style jsx>{`
            @keyframes fadeScaleIn {
              from {
                opacity: 0;
                transform: scale(0.8);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fade-scale-in {
              animation: fadeScaleIn 0.3s ease-out forwards;
            }
          `}</style>
        </div>
        <SheetPanel
          className="flex h-screen max-h-screen min-h-screen flex-col overflow-hidden sm:max-w-2xl"
          onPointerDownOutside={preventClose as any}
        >
          <SheetHeader>
            <SheetTitle>Media Gallery</SheetTitle>
            <SheetDescription className="sr-only">
              The b-roll for your video composition
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full max-h-full flex-1 flex-col gap-8 overflow-y-hidden">
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground">
                {prompt ?? <span className="italic">No description</span>}
              </p>
              <div></div>
            </div>
            <div className="flex flex-row gap-2">
              {selectedMedia?.mediaType === "image" && (
                <Button
                  onClick={handleOpenGenerateDialog}
                  variant="secondary"
                  disabled={deleteMedia.isPending}
                >
                  <FilmIcon className="w-4 h-4 opacity-50" />
                  Make Video
                </Button>
              )}
              <Button
                onClick={handleVary}
                variant="secondary"
                disabled={deleteMedia.isPending}
              >
                <ImagesIcon className="w-4 h-4 opacity-50" />
                Re-run
              </Button>
              <Button
                variant="secondary"
                disabled={deleteMedia.isPending}
                onClick={() => deleteMedia.mutate()}
              >
                {deleteMedia.isPending ? (
                  <LoadingIcon />
                ) : (
                  <TrashIcon className="w-4 h-4 opacity-50" />
                )}
                Delete
              </Button>
            </div>
            <div className="flex-1 flex flex-col gap-2 justify-end">
              <MediaPropertyItem label="Media URL" value={mediaUrl ?? "n/a"} />
              <MediaPropertyItem
                label="Model (fal endpoint)"
                value={selectedMedia.endpointId ?? "n/a"}
              >
                <a
                  href={`https://fal.ai/models/${selectedMedia.endpointId}`}
                  target="_blank"
                  className="underline underline-offset-4 decoration-muted-foreground/70 decoration-dotted"
                >
                  <code>{selectedMedia.endpointId}</code>
                </a>
              </MediaPropertyItem>
              <MediaPropertyItem
                label="Status"
                value={selectedMedia.status ?? "n/a"}
              />
              <MediaPropertyItem
                label="Request ID"
                value={selectedMedia.requestId ?? "n/a"}
              >
                <code>{selectedMedia.requestId}</code>
              </MediaPropertyItem>
            </div>
          </div>
        </SheetPanel>
      </SheetPortal>
    </Sheet>
  );
}
