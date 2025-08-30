"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapsibleContentPanelProps {
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  panelWidth?: string;
}

export function CollapsibleContentPanel({
  children,
  className,
  defaultExpanded = false,
  panelWidth = "400px"
}: CollapsibleContentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('content-panel-expanded');
      return saved ? JSON.parse(saved) : defaultExpanded;
    }
    return defaultExpanded;
  });

  // Dispatch custom event when panel state changes
  useEffect(() => {
    const event = new CustomEvent('contentPanelStateChange', {
      detail: { isExpanded, panelWidth }
    });
    window.dispatchEvent(event);
  }, [isExpanded, panelWidth]);

  useEffect(() => {
    localStorage.setItem('content-panel-expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      togglePanel();
    }
  };

  return (
    <>
      {/* Control Tab */}
      <button
        onClick={togglePanel}
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center",
          "w-8 h-16 sm:w-8 sm:h-16 bg-background/95 backdrop-blur border border-border/50 rounded-l-lg",
          "hover:bg-background hover:scale-105 transition-all duration-300 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "shadow-lg hover:shadow-xl",
          "cursor-pointer select-none touch-manipulation",
          isExpanded ? "right-[400px]" : "right-0"
        )}
        style={{ 
          right: isExpanded ? `calc(min(${panelWidth}, 90vw) - 8px)` : "0px"
        }}
        aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        title={isExpanded ? "Collapse panel" : "Expand panel"}
        tabIndex={0}
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
        )}
      </button>

      {/* Content Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-background/95 backdrop-blur border-l border-border/50",
          "transition-all duration-300 ease-in-out shadow-xl",
          "flex flex-col",
          isExpanded ? "translate-x-0" : "translate-x-full",
          className
        )}
        style={{ width: `min(${panelWidth}, 90vw)` }}
      >
        {/* Mobile Close Button - Only visible on mobile */}
        <button
          onClick={togglePanel}
          className="sm:hidden absolute top-4 right-4 z-10 w-8 h-8 bg-background/80 backdrop-blur border border-border/50 rounded-full flex items-center justify-center hover:bg-background transition-all duration-200"
          aria-label="Close panel"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        {children}
      </div>
    </>
  );
}
