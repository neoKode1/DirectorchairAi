import { NextRequest, NextResponse } from "next/server";

// Stripe integration disabled for minimal deployment
// This allows the app to deploy without Stripe environment variables

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Stripe integration disabled for minimal deployment" },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "Stripe integration disabled for minimal deployment" },
    { status: 503 }
  );
}