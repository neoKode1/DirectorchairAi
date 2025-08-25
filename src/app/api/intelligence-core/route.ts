import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const { userInput, intentType, context } = await request.json();

    console.log('🧠 [API] Intelligence Core request received:', { userInput, intentType, context });

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

    // Call Claude API with the user input
    const response = await chatWithAI(userInput, {
      projectTitle: "AI Intelligence Core",
      projectDescription: "Creative content generation assistant"
    });

    console.log('✅ [API] Claude API response received:', response);

    return NextResponse.json({ 
      response,
      success: true 
    });

  } catch (error: any) {
    console.error("❌ [API] Intelligence Core error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to process request",
        success: false 
      },
      { status: 500 }
    );
  }
}
