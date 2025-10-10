"use client";

import { useSession } from "next-auth/react";
import { useSupabaseContent } from "@/hooks/useSupabaseContent";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Database, User } from "lucide-react";

export function UserCreditsDisplay() {
  const { data: session } = useSession();
  const { userCredits, loading } = useSupabaseContent();

  if (!session?.user) {
    return null;
  }

  return (
    <Card className="p-4 bg-black/40 backdrop-blur-md border-cyan-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {session.user.name || session.user.email}
            </p>
            <div className="flex items-center space-x-2">
              <Database className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Supabase Connected</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
            {loading ? "..." : `${userCredits} credits`}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
