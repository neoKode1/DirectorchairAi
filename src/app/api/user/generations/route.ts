import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth.config";
// Placeholder credit costs
const CREDIT_COSTS = {
  image: 1,
  video: 5,
  audio: 2
};

// Check if user can generate
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({
    credits: session.user.credits,
    subscriptionTier: session.user.subscriptionTier,
  });
}

// Use credits for generation
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await req.json();
  const { type } = data;

  if (!type || !(type in CREDIT_COSTS)) {
    return new NextResponse("Invalid generation type", { status: 400 });
  }

  const creditCost = CREDIT_COSTS[type as keyof typeof CREDIT_COSTS];
  
  if (session.user.credits < creditCost) {
    return new NextResponse("Insufficient credits", { status: 400 });
  }

  // Update credits in session
  session.user.credits -= creditCost;

  return NextResponse.json({
    credits: session.user.credits,
    subscriptionTier: session.user.subscriptionTier,
  });
} 