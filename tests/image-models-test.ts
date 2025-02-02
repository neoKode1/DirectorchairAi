import { fal } from "@fal-ai/client";

interface ImageResult {
  url: string;
  content_type?: string | null;
  width?: number | null;
  height?: number | null;
}

async function testFluxProUltra() {
  try {
    console.log("Starting FLUX Pro Ultra test...");
    
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        num_images: 1,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg",
        aspect_ratio: "16:9"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FLUX Pro Ultra generation completed!");
    console.log("Result:", result);
    console.log("Image URLs:", result.data?.images?.map((img: ImageResult) => img.url));
  } catch (error) {
    console.error("Error in FLUX Pro Ultra:", error);
  }
}

async function testFluxProUltraFinetuned() {
  try {
    console.log("Starting FLUX Pro Ultra Finetuned test...");
    
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra-finetuned", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        finetune_id: "your-finetune-id",
        finetune_strength: 0.8,
        num_images: 1,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg",
        aspect_ratio: "16:9"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FLUX Pro Ultra Finetuned generation completed!");
    console.log("Result:", result);
    console.log("Image URLs:", result.data?.images?.map((img: ImageResult) => img.url));
  } catch (error) {
    console.error("Error in FLUX Pro Ultra Finetuned:", error);
  }
}

async function testFluxSchnell() {
  try {
    console.log("Starting FLUX Schnell test...");
    
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        image_size: "landscape_4_3",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FLUX Schnell generation completed!");
    console.log("Result:", result);
    console.log("Image URLs:", result.data?.images?.map(img => img.url));
  } catch (error) {
    console.error("Error in FLUX Schnell:", error);
  }
}

async function testRecraft() {
  try {
    console.log("Starting Recraft test...");
    
    const result = await fal.subscribe("fal-ai/recraft", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        image_size: "landscape_4_3",
        style: "realistic_image",
        colors: []
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Recraft generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Recraft:", error);
  }
}

async function testPhoton() {
  try {
    console.log("Starting Photon test...");
    
    // Using fetch for Luma API since it doesn't use the fal client
    const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations/image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${process.env.LUMA_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        prompt: "A majestic tiger in a mystical forest",
        aspect_ratio: "16:9",
        model: "photon-1"
      })
    });

    const result = await response.json();
    console.log("Photon generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Photon:", error);
  }
}

// Run all tests
async function runImageTests() {
  await testFluxProUltra();
  await testFluxProUltraFinetuned();
  await testFluxSchnell();
  await testRecraft();
  await testPhoton();
}

runImageTests(); 