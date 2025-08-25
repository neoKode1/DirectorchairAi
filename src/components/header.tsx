'use client';

import { button as Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { HomeIcon, SettingsIcon, UserCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ModelIconsCarousel } from "./model-icons";

export default function Header({
  openKeyDialog,
}: {
  openKeyDialog?: () => void;
}) {
  const { data: session } = useSession();

  return (
    <header className="px-6 py-3 flex justify-between items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {session?.user?.image ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-border/20">
            <Image
              src={session.user.image}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <UserCircle className="w-8 h-8 text-muted-foreground" />
        )}
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
          <Logo />
        </h1>
      </div>
      <nav className="flex flex-row items-center justify-end gap-4">
        {/* Model Icons Carousel */}
        <div className="hidden md:flex items-center gap-2">
          <ModelIconsCarousel
            models={["flux", "veo3", "kling", "luma", "minimax", "seedance"]}
            size="sm"
            className="max-w-48"
          />
        </div>
        
        {/* Sign In/Sign Out Button - More Prominent */}
        {session ? (
          <Button variant="outline" size="sm" className="hover:bg-accent/50 border-primary/20" asChild>
            <Link href="/api/auth/signout">
              Sign Out
            </Link>
          </Button>
        ) : (
          <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white" asChild>
            <Link href="/auth/signin">
              Sign In
            </Link>
          </Button>
        )}
        
        <Button variant="ghost" size="sm" className="hover:bg-accent/50" asChild>
          <a
            href="https://directorchair.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            DirectorchairAI
          </a>
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent/50" asChild>
          <a
            href="https://deeptechnologies.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deeptech AI
          </a>
        </Button>
        {process.env.NEXT_PUBLIC_CUSTOM_KEY && openKeyDialog && (
          <Button variant="ghost" size="icon" className="hover:bg-accent/50" onClick={openKeyDialog}>
            <SettingsIcon className="w-5 h-5" />
          </Button>
        )}
      </nav>
    </header>
  );
}
