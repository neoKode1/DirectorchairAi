"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Film, Clapperboard, Users, Sparkles, Monitor } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/timeline", label: "Studio", icon: Monitor, description: "AI Video Studio" },
  { href: "/script-maker", label: "Script Maker", icon: Clapperboard, description: "AI Screenplay Generator" },
  { href: "/personas", label: "Personas", icon: Users, description: "Character Library", badge: "Preview" },
  { href: "/gallery", label: "Gallery", icon: Film, description: "Your Creations" },
  { href: "/models", label: "Models", icon: Sparkles, description: "Browse AI Models" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative z-[70] p-2 -mr-2 text-foreground hover:text-muted-foreground transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[65] h-full w-72 bg-background border-l border-border shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="text-sm font-medium tracking-tighter text-foreground">Menu</span>
          <ThemeToggle />
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 border border-border text-muted-foreground rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 truncate">{item.description}</p>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase"
          >
            DIRECTORCHAIR AI
          </Link>
          <p className="text-center text-[10px] text-muted-foreground/50 mt-1 tracking-wider uppercase">
            DEEPTECH
          </p>
        </div>
      </div>
    </div>
  );
}
