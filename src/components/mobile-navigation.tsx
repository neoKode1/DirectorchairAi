"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  MessageSquare, 
  Image, 
  Video, 
  Settings,
  Menu,
  X,
  Calendar,
  Music
} from "lucide-react";
import { button as Button } from "@/components/ui/button";

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/"
    },
    {
      name: "Chat",
      href: "/timeline",
      icon: MessageSquare,
      active: pathname === "/timeline"
    },
    {
      name: "Models",
      href: "/models",
      icon: Image,
      active: pathname.startsWith("/models")
    },
    {
      name: "Audio",
      href: "/audio-generation",
      icon: Music,
      active: pathname === "/audio-generation"
    },
    {
      name: "Gallery",
      href: "/gallery",
      icon: Video,
      active: pathname === "/gallery"
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={cn("mobile-nav", className)}>
        <div className="flex items-center justify-around h-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full mobile-touch-target",
                  "transition-colors duration-200",
                  item.active
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="mobile-text-xs">{item.name}</span>
              </Link>
            );
          })}
          
          <Link
            href="/timeline?sessions"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full mobile-touch-target",
              "transition-colors duration-200",
              pathname === "/timeline" && (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).has('sessions') : false)
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="mobile-text-xs">Sessions</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMenu}>
          <div 
            className="mobile-modal-content max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="mobile-text-lg font-semibold">Menu</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="mobile-touch-target"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-2">
              <Link
                href="/auth/signin"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <Settings className="w-4 h-4" />
                <span className="mobile-text-sm">Settings</span>
              </Link>
              
              <Link
                href="/models"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <Image className="w-4 h-4" />
                <span className="mobile-text-sm">All Models</span>
              </Link>
              
              <Link
                href="/timeline"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="mobile-text-sm">AI Chat</span>
              </Link>
              
              <div className="pt-4 border-t border-border/50">
                <p className="mobile-text-xs text-muted-foreground text-center">
                  DirectorchairAI v1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileTopNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/") return "Home";
    if (pathname === "/timeline") return "AI Studio";
    if (pathname.startsWith("/models")) return "Models";
    if (pathname === "/audio-generation") return "Audio Studio";
    if (pathname === "/gallery") return "Gallery";
    return "DirectorchairAI";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <header className={cn("mobile-nav-top", className)}>
        <div className="flex items-center justify-between h-full mobile-px">
          <Link
            href="/"
            className="mobile-text-sm sm:text-base font-bold mobile-touch-target"
          >
            {getPageTitle()}
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="mobile-touch-target"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMenu}>
          <div 
            className="mobile-modal-content max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="mobile-text-lg font-semibold">Menu</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="mobile-touch-target"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <Home className="w-4 h-4" />
                <span className="mobile-text-sm">Home</span>
              </Link>
              
              <Link
                href="/timeline"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="mobile-text-sm">AI Studio</span>
              </Link>
              
              <Link
                href="/models"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <Image className="w-4 h-4" />
                <span className="mobile-text-sm">Models</span>
              </Link>
              
              <Link
                href="/audio-generation"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <Music className="w-4 h-4" />
                <span className="mobile-text-sm">Audio Studio</span>
              </Link>
              
              <Link
                href="/auth/signin"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors mobile-touch-target"
                onClick={toggleMenu}
              >
                <Settings className="w-4 h-4" />
                <span className="mobile-text-sm">Settings</span>
              </Link>
              
              <div className="pt-4 border-t border-border/50">
                <p className="mobile-text-xs text-muted-foreground text-center">
                  DirectorchairAI v1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
