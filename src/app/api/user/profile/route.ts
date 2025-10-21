import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth.config";

// Get user profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    credits: session.user.credits,
    subscriptionTier: session.user.subscriptionTier,
  });
}

// Update user profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await req.json();
  const { name } = data;

  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  // Update session data
  session.user.name = name;

  return NextResponse.json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    credits: session.user.credits,
    subscriptionTier: session.user.subscriptionTier,
  });
} 