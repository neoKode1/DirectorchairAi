'use client';

import { db } from "@/data/db";
import {
  EMPTY_VIDEO_COMPOSITION,
  useProject,
  useVideoComposition,
  useProjectMediaItems,
} from "@/data/queries";
import {
  type MediaItem,
  PROJECT_PLACEHOLDER,
  TRACK_TYPE_ORDER,
  type VideoKeyFrame,
  type VideoProject,
  type VideoTrack,
} from "@/data/schema";
import { useProjectId, useVideoProjectStore } from "@/data/store";
import { cn, resolveDuration, resolveMediaUrl } from "@/lib/utils";
import { Player, type PlayerRef } from "@remotion/player";
import { preloadVideo, preloadAudio } from "@remotion/preload";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  Video,
} from "remotion";
import { throttle } from "throttle-debounce";
import { button as Button } from "@/components/ui/button";
import { DownloadIcon, VideoIcon } from "lucide-react";
import { MusicIcon, MicIcon } from "lucide-react";

interface VideoCompositionProps {
  project: VideoProject;
  tracks: VideoTrack[];
  frames: Record<string, VideoKeyFrame[]>;
  mediaItems: Record<string, MediaItem>;
}

const FPS = 30;
const DEFAULT_DURATION = 5;
const VIDEO_WIDTH = 1024;
const VIDEO_HEIGHT = 720;

const videoSizeMap = {
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "1:1": { width: 1024, height: 1024 },
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  project,
  tracks,
  frames,
  mediaItems,
}) => {
  const sortedTracks = [...tracks].sort((a, b) => {
    return TRACK_TYPE_ORDER[a.type] - TRACK_TYPE_ORDER[b.type];
  });

  let width = VIDEO_WIDTH;
  let height = VIDEO_HEIGHT;

  if (project.aspectRatio) {
    const size = videoSizeMap[project.aspectRatio];
    if (size) {
      width = size.width;
      height = size.height;
    }
  }

  return (
    <Composition
      id={project.id}
      component={MainComposition as any}
      durationInFrames={DEFAULT_DURATION * FPS}
      fps={FPS}
      width={width}
      height={height}
      defaultProps={{
        project,
        tracks: sortedTracks,
        frames,
        mediaItems,
      }}
    />
  );
};

const MainComposition: React.FC<VideoCompositionProps> = ({
  tracks,
  frames,
  mediaItems,
}) => {
  return (
    <AbsoluteFill>
      {tracks.map((track) => (
        <Sequence key={track.id}>
          {track.type === "video" && (
            <VideoTrackSequence
              track={track}
              frames={frames[track.id] || []}
              mediaItems={mediaItems}
            />
          )}
          {(track.type === "music" || track.type === "voiceover") && (
            <AudioTrackSequence
              track={track}
              frames={frames[track.id] || []}
              mediaItems={mediaItems}
            />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

interface TrackSequenceProps {
  track: VideoTrack;
  frames: VideoKeyFrame[];
  mediaItems: Record<string, MediaItem>;
}

const VideoTrackSequence: React.FC<TrackSequenceProps> = ({
  frames,
  mediaItems,
}) => {
  return (
    <AbsoluteFill>
      {frames.map((frame) => {
        const media = mediaItems[frame.data.mediaId];
        if (!media || media.status !== "completed") return null;

        const mediaUrl = resolveMediaUrl(media);
        if (!mediaUrl) return null;

        const duration = Math.max(
          frame.duration || resolveDuration(media) || 5000,
          1000,
        );
        const durationInFrames = Math.max(
          1,
          Math.floor(duration / (1000 / FPS)),
        );

        return (
          <Sequence
            key={frame.id}
            from={Math.floor(frame.timestamp / (1000 / FPS))}
            durationInFrames={durationInFrames}
            premountFor={3000}
          >
            {media.mediaType === "video" && (
              <Video
                src={mediaUrl}
                onError={(e) => {
                  console.error("Video playback error:", e);
                }}
              />
            )}
            {media.mediaType === "image" && (
              <Img src={mediaUrl} style={{ objectFit: "cover" }} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const AudioTrackSequence: React.FC<TrackSequenceProps> = ({
  frames,
  mediaItems,
}) => {
  return (
    <>
      {frames.map((frame) => {
        const media = mediaItems[frame.data.mediaId];
        if (!media || media.status !== "completed") return null;

        const audioUrl = resolveMediaUrl(media);
        if (!audioUrl) return null;

        const duration = frame.duration || resolveDuration(media) || 5000;
        const durationInFrames = Math.floor(duration / (1000 / FPS));

        return (
          <Sequence
            key={frame.id}
            from={Math.floor(frame.timestamp / (1000 / FPS))}
            durationInFrames={durationInFrames}
            premountFor={3000}
          >
            <Audio src={audioUrl} />
          </Sequence>
        );
      })}
    </>
  );
};

const getDurationInFrames = (durationMs: number | undefined): number => {
  const defaultDurationMs = 5000; // Ensure we have at least 5 seconds
  const validatedDurationMs =
    durationMs && durationMs > 0 ? durationMs : defaultDurationMs;
  return Math.max(1, Math.floor(validatedDurationMs / (1000 / FPS)));
};

export default function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const currentVideo = useVideoProjectStore((s) => s.currentVideo);
  const isPlaying = useVideoProjectStore((s) => s.isPlaying);
  const setIsPlaying = useVideoProjectStore((s) => s.setIsPlaying);
  const currentTime = useVideoProjectStore((s) => s.currentTime);
  const setCurrentTime = useVideoProjectStore((s) => s.setCurrentTime);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !mounted) return;

    const video = videoRef.current;

    if (isPlaying) {
      video.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, mounted, setIsPlaying]);

  useEffect(() => {
    if (!videoRef.current || !mounted) return;

    const video = videoRef.current;
    video.currentTime = currentTime;
  }, [currentTime, mounted]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !mounted) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleEnded = () => {
    if (!mounted) return;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="relative flex-1 bg-black/20 backdrop-blur-sm rounded-lg m-4 border border-border/20">
      {mounted && currentVideo ? (
        <video
          ref={videoRef}
          src={currentVideo.url}
          className={cn(
            "absolute inset-0 w-full h-full object-contain rounded-lg",
            !isPlaying && "cursor-pointer"
          )}
          onClick={() => setIsPlaying(!isPlaying)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          playsInline
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <VideoIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No video selected</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Upload or generate a video to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
