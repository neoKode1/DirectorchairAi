"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { button as Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Get theme from localStorage or default to dark
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      // Let CSS variables handle the colors automatically
    } else {
      root.classList.remove('dark');
      // Let CSS variables handle the colors automatically
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    applyTheme(newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2 bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/40 transition-all duration-200"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-white" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
