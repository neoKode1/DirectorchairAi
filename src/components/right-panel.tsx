"use client";

import { useJobCreator } from "@/data/mutations";
import { queryKeys, useProject, useProjectMediaItems } from "@/data/queries";
import type { MediaItem } from "@/data/schema";
import {
  type GenerateData,
  type MediaType,
  useProjectId,
  useVideoProjectStore,
} from "@/data/store";
import { AVAILABLE_ENDPOINTS, type InputAsset } from "@/lib/fal";
import {
  ImageIcon,
  MicIcon,
  MusicIcon,
  LoaderCircleIcon,
  VideoIcon,
  ArrowLeft,
  TrashIcon,
  WandSparklesIcon,
  CrossIcon,
  XIcon,
} from "lucide-react";
import { MediaItemRow } from "./media-panel";
import { button as Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/data/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  assetKeyMap,
  cn,
  getAssetKey,
  getAssetType,
  mapInputKey,
  resolveMediaUrl,
} from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { WithTooltip } from "./ui/tooltip";
import { Label } from "./ui/label";
import { VoiceSelector } from "./playht/voice-selector";
import { LoadingIcon } from "./ui/icons";


import { AspectRatioSelector, type AspectRatioOption } from "./aspect-ratio";

type ModelEndpointPickerProps = {
  mediaType: MediaType;
  value: string;
  onValueChange: (value: string) => void;
};

function ModelEndpointPicker({
  mediaType,
  value,
  onValueChange,
  ...props
}: ModelEndpointPickerProps) {
  const endpoints = useMemo(
    () =>
      AVAILABLE_ENDPOINTS.filter((endpoint) => endpoint.category === mediaType),
    [mediaType],
  );

  if (endpoints.length === 0) {
    return null;
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="text-base w-full minw-56 font-semibold">
        <SelectValue placeholder="Select a model">
          {endpoints.find(e => e.endpointId === value)?.label || "Select a model"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {endpoints.map((endpoint) => (
          <SelectItem 
            key={endpoint.endpointId} 
            value={endpoint.endpointId}
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-row gap-2 items-center">
                <span className="font-medium">{endpoint.label}</span>
              </div>
              {endpoint.description && (
                <span className="text-sm text-muted-foreground">
                  {endpoint.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface RightPanelProps {
  onGenerate?: () => Promise<void>;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

export default function RightPanel({
  className,
  onOpenChange,
  onGenerate,
  ...props
}: RightPanelProps) {
  const projectId = useProjectId();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: project } = useProject(projectId);
  const { generateData, setGenerateData, resetGenerateData } = useVideoProjectStore();

  const mediaType = useVideoProjectStore((s) => s.generateMediaType);
  const setMediaType = useVideoProjectStore((s) => s.setGenerateMediaType);
  const endpointId = useVideoProjectStore((s) => s.endpointId);
  const setEndpointId = useVideoProjectStore((s) => s.setEndpointId);
  
  const endpoint = useMemo(
    () => AVAILABLE_ENDPOINTS.find((e) => e.endpointId === endpointId),
    [endpointId],
  );

  // Set default endpoint when media type changes
  useEffect(() => {
    if (mediaType) {
      const availableEndpoints = AVAILABLE_ENDPOINTS.filter(
        (e) => e.category === mediaType
      );
      if (availableEndpoints.length > 0) {
        // Only set if current endpointId is not valid for this media type
        if (!availableEndpoints.find(e => e.endpointId === endpointId)) {
          setEndpointId(availableEndpoints[0].endpointId);
          resetGenerateData();
        }
      }
    }
  }, [mediaType, endpointId, setEndpointId, resetGenerateData]);

  const handleModelChange = (value: string) => {
    if (value === endpointId) return;
    
    setEndpointId(value);
    const newEndpoint = AVAILABLE_ENDPOINTS.find(e => e.endpointId === value);
    if (newEndpoint) {
      // Reset generate data but preserve the prompt
      const currentPrompt = generateData.prompt;
      resetGenerateData();
      setGenerateData({ 
        prompt: currentPrompt,
        ...newEndpoint.initialInput 
      });
    }
  };

  // Add aspect ratio to dimensions mapping
  const getAspectRatioDimensions = (ratio: AspectRatioOption): { width: number; height: number } => {
    switch (ratio) {
      case "16:9":
        return { width: 1024, height: 576 };
      case "9:16":
        return { width: 576, height: 1024 };
      case "1:1":
        return { width: 512, height: 512 };
      default:
        return { width: 1024, height: 576 }; // Default to 16:9
    }
  };

  const handleAspectRatioChange = (ratio: AspectRatioOption | null) => {
    if (!ratio) return;
    
    // Models that expect string aspect ratios (e.g., Hunyuan)
    const stringAspectRatioModels = ['fal-ai/hunyuan-video', 'fal-ai/pixverse_I2v_3.5fast'];
    
    if (stringAspectRatioModels.includes(generateData.model)) {
      setGenerateData({ 
        ...generateData,
        aspect_ratio: ratio,
        // Remove width/height if they exist
        width: undefined,
        height: undefined
      });
    } else {
      // Models that expect width/height dimensions
      const dimensions = getAspectRatioDimensions(ratio);
      setGenerateData({ 
        ...generateData,
        width: dimensions.width,
        height: dimensions.height,
        // Remove aspect_ratio if it exists
        aspect_ratio: undefined
      });
    }
  };

  const handleMediaTypeChange = (type: MediaType) => {
    if (type === mediaType) return;
    
    setMediaType(type);
    const availableEndpoints = AVAILABLE_ENDPOINTS.filter(
      (e) => e.category === type
    );
    
    if (availableEndpoints.length > 0) {
      const firstEndpoint = availableEndpoints[0];
      setEndpointId(firstEndpoint.endpointId);
      
      // Reset generate data but preserve the prompt
      const currentPrompt = generateData.prompt;
      resetGenerateData();
      setGenerateData({ 
        prompt: currentPrompt,
        ...firstEndpoint.initialInput 
      });
    }
  };

  const [tab, setTab] = useState<string>("generation");
  const [assetMediaType, setAssetMediaType] = useState("all");
  const openGenerateDialog = useVideoProjectStore((s) => s.openGenerateDialog);
  const generateDialogOpen = useVideoProjectStore((s) => s.generateDialogOpen);
  const closeGenerateDialog = useVideoProjectStore(
    (s) => s.closeGenerateDialog,
  );

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeGenerateDialog();
      resetGenerateData();
      return;
    }
    onGenerate?.();
    openGenerateDialog();
  };



  const { data: mediaItems = [] } = useProjectMediaItems(projectId);

  const handleSelectMedia = (media: MediaItem) => {
    const asset = endpoint?.inputAsset?.find((item) => {
      const assetType = getAssetType(item);

      if (
        assetType === "audio" &&
        (media.mediaType === "voiceover" || media.mediaType === "music")
      ) {
        return true;
      }
      return assetType === media.mediaType;
    });

    if (!asset) {
      setTab("generation");
      return;
    }

    setGenerateData({ [getAssetKey(asset)]: resolveMediaUrl(media) });
    setTab("generation");
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const file = files[0]; // Handle one file at a time
      const fileType = file.type.split("/")[0];
      const outputType = fileType === "audio" ? "music" : fileType;

      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file);

      const data: Omit<MediaItem, "id"> = {
        projectId,
        kind: "uploaded",
        createdAt: Date.now(),
        mediaType: outputType as MediaType,
        status: "completed",
        url: localUrl,
      };

      const mediaId = await db.media.create(data);
      const media = await db.media.find(mediaId as string);

      if (media && media.mediaType !== "image") {
        await db.media
          .update(media.id, {
            ...media,
            metadata: {},
          })
          .finally(() => {
            queryClient.invalidateQueries({
              queryKey: queryKeys.projectMediaItems(projectId),
            });
          });
      }

      setGenerateData({
        ...generateData,
        [assetKeyMap[outputType as keyof typeof assetKeyMap]]: localUrl,
      });
    } catch (err) {
      console.warn(`ERROR! ${err}`);
      toast({
        title: "Failed to upload file",
        description: "Please try again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const jobCreator = useJobCreator({
    projectId,
    endpointId,
    mediaType,
    input: generateData,
  });

  const handleGenerate = async () => {
    if (!generateData.prompt) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt to generate media",
        variant: "destructive",
      });
      return;
    }

    let promptHistoryId: string | undefined;

    try {
      setIsGenerating(true);
      await onGenerate?.();
      
      // Add to prompt history
      const addPromptToHistory = useVideoProjectStore.getState().addPromptToHistory;
      promptHistoryId = addPromptToHistory({
        mediaType,
        prompt: generateData.prompt,
        status: 'pending' as const,
        enhancedPrompt: generateData.prompt // Store the original prompt if no enhancement
      });
      
      // Map input keys if needed
      const input = endpoint?.inputMap
        ? mapInputKey(generateData, endpoint.inputMap)
        : generateData;

      const result = await jobCreator.mutateAsync();
      
      // Update prompt history with result
      if (promptHistoryId) {
        const updatePromptInHistory = useVideoProjectStore.getState().updatePromptInHistory;
        
        let mediaUrl: string | undefined = undefined;
        
        if (typeof result === 'object' && result !== null) {
          const falResult = result as { output?: { images?: { url: string }[]; url?: string } };
          if (falResult.output) {
            if (falResult.output.images?.length) {
              mediaUrl = falResult.output.images[0].url;
            } else if (falResult.output.url) {
              mediaUrl = falResult.output.url;
            }
          }
        }
          
        updatePromptInHistory(promptHistoryId, {
          status: 'completed' as const,
          mediaUrl
        });
      }
      
      // Reset the form
      resetGenerateData();
      closeGenerateDialog();
      
      toast({
        title: "Generation started",
        description: "Your media is being generated. Check the gallery for results.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      
      // Update prompt history with error
      if (promptHistoryId) {
        const updatePromptInHistory = useVideoProjectStore.getState().updatePromptInHistory;
        updatePromptInHistory(promptHistoryId, {
          status: 'failed' as const
        });
      }
      
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to start generation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("w-96 border-l border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)} {...props}>
      <div className="flex flex-col h-full">
        <div className="flex-none p-6 border-b border-border/40">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-sm text-muted-foreground font-semibold flex-1">
              Generate Media
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDialogChange(false)}
            >
              <XIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            <div className="flex w-full gap-2">
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("image")}
                className={cn(
                  mediaType === "image" && "bg-white/10",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <ImageIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Image</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("video")}
                className={cn(
                  mediaType === "video" && "bg-white/10",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <VideoIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Video</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("voiceover")}
                className={cn(
                  mediaType === "voiceover" && "bg-white/10",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <MicIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Voiceover</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleMediaTypeChange("music")}
                className={cn(
                  mediaType === "music" && "bg-white/10",
                  "h-14 flex flex-col justify-center w-1/4 rounded-md gap-2 items-center",
                )}
              >
                <MusicIcon className="w-4 h-4 opacity-50" />
                <span className="text-[10px]">Music</span>
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-muted-foreground">Using</div>
              <ModelEndpointPicker
                mediaType={mediaType}
                value={endpointId}
                onValueChange={handleModelChange}
              />
              {endpoint?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {endpoint.description}
                </p>
              )}
            </div>

            {(mediaType === "image" || mediaType === "video") && (
              <div className="flex flex-col gap-2">
                <div className="text-muted-foreground">Aspect Ratio</div>
                <AspectRatioSelector
                  value={generateData.aspect_ratio as AspectRatioOption}
                  onValueChange={handleAspectRatioChange}
                />
              </div>
            )}

            {endpoint?.inputAsset?.map((asset) => {
              const assetType = getAssetType(asset);
              return (
                <div key={assetType} className="flex w-full">
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between">
                      <h4 className="capitalize text-muted-foreground mb-2">
                        {assetType} Reference
                      </h4>
                      {tab === `asset-${assetType}` && (
                        <Button
                          variant="ghost"
                          onClick={() => setTab("generation")}
                          size="sm"
                        >
                          <ArrowLeft /> Back
                        </Button>
                      )}
                    </div>
                    {(tab === "generation" ||
                      tab !== `asset-${assetType}`) && (
                      <>
                        {!generateData[getAssetKey(asset)] && (
                          <div className="flex flex-col gap-2 justify-between">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setTab(`asset-${assetType}`);
                                setAssetMediaType(assetType ?? "all");
                              }}
                              className="cursor-pointer min-h-[30px] flex flex-col items-center justify-center border border-dashed border-border rounded-md px-4"
                            >
                              <span className="text-muted-foreground text-xs text-center text-nowrap">
                                Select
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isUploading}
                              className="cursor-pointer min-h-[30px] flex flex-col items-center justify-center border border-dashed border-border rounded-md px-4"
                              asChild
                            >
                              <label htmlFor="assetUploadButton">
                                <Input
                                  id="assetUploadButton"
                                  type="file"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  multiple={false}
                                  disabled={isUploading}
                                  accept="image/*,audio/*,video/*"
                                />
                                {isUploading ? (
                                  <LoaderCircleIcon className="w-4 h-4 opacity-50 animate-spin" />
                                ) : (
                                  <span className="text-muted-foreground text-xs text-center text-nowrap">
                                    Upload
                                  </span>
                                )}
                              </label>
                            </Button>
                          </div>
                        )}
                        {generateData[getAssetKey(asset)] && (
                          <div className="cursor-pointer overflow-hidden relative w-full flex flex-col items-center justify-center border border-dashed border-border rounded-md">
                            <WithTooltip tooltip="Remove media">
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-black/50 absolute top-1 z-50 bg-black/80 right-1 group-hover:text-white"
                                onClick={() =>
                                  setGenerateData({
                                    [getAssetKey(asset)]: undefined,
                                  })
                                }
                              >
                                <TrashIcon className="w-3 h-3 stroke-2" />
                              </button>
                            </WithTooltip>
                            {generateData[getAssetKey(asset)] && (
                              <SelectedAssetPreview
                                asset={asset}
                                data={generateData}
                              />
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {tab === `asset-${assetType}` && (
                      <div className="flex items-center gap-2 flex-wrap overflow-y-auto max-h-80 divide-y divide-border">
                        {mediaItems
                          .filter((media) => {
                            if (assetMediaType === "all") return true;
                            if (
                              assetMediaType === "audio" &&
                              (media.mediaType === "voiceover" ||
                                media.mediaType === "music")
                            )
                              return true;
                            return media.mediaType === assetMediaType;
                          })
                          .map((job) => (
                            <MediaItemRow
                              draggable={false}
                              key={job.id}
                              data={job}
                              onOpen={handleSelectMedia}
                              className="cursor-pointer"
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="relative">
              <Textarea
                className="text-base shadow-none focus:!ring-0 placeholder:text-base w-full h-32 resize-none"
                placeholder="Imagine..."
                value={generateData.prompt}
                rows={3}
                onChange={(e) => setGenerateData({ prompt: e.target.value })}
              />

            </div>
          </div>
        </div>

        {tab === "generation" && (
          <div className="flex-none p-4 border-t border-border">
            {mediaType === "music" && endpointId === "fal-ai/playht/tts/v3" && (
              <div className="flex flex-row gap-2 mb-4">
                {mediaType === "music" && (
                  <div className="flex flex-row items-center gap-1">
                    <Label>Duration</Label>
                    <Input
                      className="w-12 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={5}
                      max={30}
                      step={1}
                      type="number"
                      value={generateData.duration}
                      onChange={(e) =>
                        setGenerateData({
                          duration: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <span>s</span>
                  </div>
                )}
                {endpointId === "fal-ai/playht/tts/v3" && (
                  <VoiceSelector
                    value={generateData.voice}
                    onValueChange={(voice) => {
                      setGenerateData({ voice });
                    }}
                  />
                )}
              </div>
            )}
            <Button
              className="w-full"
              disabled={isGenerating || !generateData.prompt}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const SelectedAssetPreview = ({
  data,
  asset,
}: {
  data: GenerateData;
  asset: InputAsset;
}) => {
  const assetType = getAssetType(asset);
  const assetKey = getAssetKey(asset);

  if (!data[assetKey]) return null;

  return (
    <>
      {assetType === "audio" && (
        <audio
          src={
            data[assetKey] && typeof data[assetKey] !== "string"
              ? URL.createObjectURL(data[assetKey])
              : data[assetKey] || ""
          }
          controls={true}
        />
      )}
      {assetType === "video" && (
        <video
          src={
            data[assetKey] && typeof data[assetKey] !== "string"
              ? URL.createObjectURL(data[assetKey])
              : data[assetKey] || ""
          }
          controls={false}
          style={{ pointerEvents: "none" }}
        />
      )}
      {assetType === "image" && (
        <img
          id="image-preview"
          src={
            data[assetKey] && typeof data[assetKey] !== "string"
              ? URL.createObjectURL(data[assetKey])
              : data[assetKey] || ""
          }
          alt="Media Preview"
        />
      )}
    </>
  );
};
