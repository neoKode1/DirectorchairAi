import { NextResponse } from "next/server";

export const runtime = "edge";

// Store active connections for Server-Sent Events
const clients = new Map<string, ReadableStreamController<Uint8Array>>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const generationId = searchParams.get("id");

  if (!generationId) {
    return new NextResponse("Missing generation ID", { status: 400 });
  }

  // Create a new SSE connection
  const stream = new ReadableStream({
    start(controller) {
      clients.set(generationId, controller);
    },
    cancel() {
      clients.delete(generationId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const generationId = data.id;

    if (!generationId) {
      return new NextResponse("Missing generation ID", { status: 400 });
    }

    // Get the client connection for this generation
    const controller = clients.get(generationId);
    if (controller) {
      // Convert the data to a UTF-8 encoded Uint8Array
      const encoder = new TextEncoder();
      const sseData = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
      
      // Send the update to the client
      controller.enqueue(sseData);

      // If generation is complete or failed, close the connection
      if (data.state === "completed" || data.state === "failed") {
        controller.close();
        clients.delete(generationId);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Callback] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to process callback" }),
      { status: 500 }
    );
  }
} 