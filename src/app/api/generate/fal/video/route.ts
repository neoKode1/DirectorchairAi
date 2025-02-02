import { NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      model,
      prompt,
      negative_prompt,
      aspect_ratio,
      resolution,
      style,
      image_url,
      // Hunyuan specific
      num_inference_steps,
      num_frames,
      enable_safety_checker,
      pro_mode,
      // Minimax specific
      prompt_optimizer,
      subject_reference_image_url,
    } = body;

    if (!model) {
      return NextResponse.json(
        { error: "Model is required" },
        { status: 400 }
      );
    }

    if (model === "fal-ai/hunyuan-video") {
      const result = await fal.subscribe("fal-ai/hunyuan-video", {
        input: {
          prompt,
          num_inference_steps: num_inference_steps || 30,
          aspect_ratio: aspect_ratio || "16:9",
          resolution: resolution || "720p",
          num_frames: num_frames || 16,
          enable_safety_checker: enable_safety_checker || true,
          pro_mode: pro_mode || false,
        },
      });

      return NextResponse.json(result);
    } else if (model === "fal-ai/pixverse/v3.5/text-to-video/fast") {
      console.log("Pixverse text-to-video request:", {
        prompt,
        negative_prompt,
        aspect_ratio,
        resolution,
        style,
      });

      const result = await fal.subscribe("fal-ai/pixverse/v3.5/text-to-video/fast", {
        input: {
          prompt,
          negative_prompt: negative_prompt || undefined,
          aspect_ratio: aspect_ratio || "16:9",
          resolution: resolution || "720p",
          style: style || undefined,
        },
        logs: true,
      });

      return NextResponse.json(result);
    } else if (model === "fal-ai/pixverse/v3.5/image-to-video/fast") {
      console.log("Pixverse image-to-video request:", {
        prompt,
        image_url,
        negative_prompt,
        aspect_ratio,
        resolution,
        style,
      });

      if (!image_url) {
        console.error("Missing image URL in request");
        return NextResponse.json(
          { error: "Image URL is required" },
          { status: 400 }
        );
      }

      if (!prompt) {
        return NextResponse.json(
          { error: "Prompt is required" },
          { status: 400 }
        );
      }

      try {
        const result = await fal.subscribe("fal-ai/pixverse/v3.5/image-to-video/fast", {
          input: {
            prompt,
            image_url,
            negative_prompt: negative_prompt || undefined,
            aspect_ratio: aspect_ratio || "16:9",
            resolution: resolution || "720p",
            style: style || undefined,
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              console.log("Generation progress:", update.logs);
            }
          }
        });

        console.log("Pixverse API response:", result);
        return NextResponse.json(result);
      } catch (error) {
        console.error("Pixverse API error:", error);
        return NextResponse.json(
          { error: "Failed to generate video" },
          { status: 500 }
        );
      }
    } else if (model === "fal-ai/minimax/video-01-live/image-to-video") {
      const result = await fal.subscribe("fal-ai/minimax/video-01-live/image-to-video", {
        input: {
          prompt,
          image_url,
          prompt_optimizer: prompt_optimizer || true,
          num_frames: 24,
          fps: 8
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs);
          }
        }
      });

      return NextResponse.json(result);
    } else if (model === "fal-ai/minimax/video-01-subject-reference") {
      const result = await fal.subscribe("fal-ai/minimax/video-01-subject-reference", {
        input: {
          prompt,
          subject_reference_image_url,
          prompt_optimizer: prompt_optimizer || true,
        },
        logs: true,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
  } catch (error) {
    console.error("Error in video generation:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
} 