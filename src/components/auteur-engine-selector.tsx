"use client";

import React, { useState, useEffect } from 'react';
import { button as Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Film, 
  Camera, 
  Palette, 
  Lightbulb, 
  Settings,
  CheckCircle,
  X,
  Sparkles,
  Filter
} from 'lucide-react';
import { 
  auteurEngine, 
  type DirectorProfile,
  type AuteurEngineState
} from '@/lib/auteur-engine';
import { type Movie } from '@/lib/movies-database';
import { MovieSelector } from '@/components/movie-selector';
import { cn } from '@/lib/utils';

interface AuteurEngineSelectorProps {
  onDirectorChange?: (directorName: string | null) => void;
  onMovieSelect?: (movie: Movie) => void;
  className?: string;
}

export function AuteurEngineSelector({ 
  onDirectorChange, 
  onMovieSelect,
  className 
}: AuteurEngineSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [engineState, setEngineState] = useState<AuteurEngineState | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Load current state on mount
  useEffect(() => {
    const currentState = auteurEngine.getState();
    setEngineState(currentState);
    setSelectedDirector(currentState.activeDirector);
    setSelectedGenre(currentState.selectedGenre || 'All');
  }, []);

  const handleDirectorSelect = (directorName: string) => {
    console.log('🎬 [AuteurEngineSelector] Director selected:', directorName);
    
    if (selectedDirector === directorName) {
      // If same director selected, disable the engine
      auteurEngine.disable();
      setSelectedDirector(null);
      setEngineState(auteurEngine.getState());
      onDirectorChange?.(null);
    } else {
      // Set new director
      auteurEngine.setActiveDirector(directorName);
      setSelectedDirector(directorName);
      setEngineState(auteurEngine.getState());
      onDirectorChange?.(directorName);
    }
    
    setIsOpen(false);
  };

  const handleDisable = () => {
    console.log('🎬 [AuteurEngineSelector] Disabling Auteur Engine');
    auteurEngine.disable();
    setSelectedDirector(null);
    setEngineState(auteurEngine.getState());
    onDirectorChange?.(null);
    setIsOpen(false);
  };

  const handleGenreChange = (genre: string) => {
    console.log('🎬 [AuteurEngineSelector] Genre selected:', genre);
    setSelectedGenre(genre);
    // Update the engine state with selected genre
    auteurEngine.setState({ selectedGenre: genre });
  };

  const getDirectorIcon = (directorName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Christopher Nolan": <Camera className="w-4 h-4" />,
      "Wes Anderson": <Palette className="w-4 h-4" />,
      "Denis Villeneuve": <Film className="w-4 h-4" />,
      "David Fincher": <Settings className="w-4 h-4" />,
      "Martin Scorsese": <Lightbulb className="w-4 h-4" />,
      "Quentin Tarantino": <Camera className="w-4 h-4" />,
      "Stanley Kubrick": <Settings className="w-4 h-4" />,
      "Alfred Hitchcock": <Camera className="w-4 h-4" />,
      "Akira Kurosawa": <Film className="w-4 h-4" />,
      "Federico Fellini": <Palette className="w-4 h-4" />,
      "Ingmar Bergman": <Lightbulb className="w-4 h-4" />,
      "Jean-Luc Godard": <Camera className="w-4 h-4" />,
      "Fritz Lang": <Settings className="w-4 h-4" />,
      "Orson Welles": <Film className="w-4 h-4" />,
      "Charlie Chaplin": <Palette className="w-4 h-4" />,
      "Buster Keaton": <Camera className="w-4 h-4" />,
      "Sergei Eisenstein": <Film className="w-4 h-4" />,
      "D.W. Griffith": <Camera className="w-4 h-4" />,
      "F.W. Murnau": <Settings className="w-4 h-4" />,
      "Georges Méliès": <Palette className="w-4 h-4" />,
      "Lumière Brothers": <Camera className="w-4 h-4" />
    };
    return iconMap[directorName] || <Film className="w-4 h-4" />;
  };

  const getDirectorColor = (directorName: string) => {
    const colorMap: Record<string, string> = {
      "Christopher Nolan": "border-blue-500 bg-blue-500/10 text-blue-400",
      "Wes Anderson": "border-pink-500 bg-pink-500/10 text-pink-400",
      "Denis Villeneuve": "border-purple-500 bg-purple-500/10 text-purple-400",
      "David Fincher": "border-gray-500 bg-gray-500/10 text-gray-400",
      "Martin Scorsese": "border-red-500 bg-red-500/10 text-red-400",
      "Quentin Tarantino": "border-orange-500 bg-orange-500/10 text-orange-400",
      "Stanley Kubrick": "border-indigo-500 bg-indigo-500/10 text-indigo-400",
      "Alfred Hitchcock": "border-slate-500 bg-slate-500/10 text-slate-400",
      "Akira Kurosawa": "border-emerald-500 bg-emerald-500/10 text-emerald-400",
      "Federico Fellini": "border-rose-500 bg-rose-500/10 text-rose-400",
      "Ingmar Bergman": "border-cyan-500 bg-cyan-500/10 text-cyan-400",
      "Jean-Luc Godard": "border-yellow-500 bg-yellow-500/10 text-yellow-400",
      "Fritz Lang": "border-violet-500 bg-violet-500/10 text-violet-400",
      "Orson Welles": "border-amber-500 bg-amber-500/10 text-amber-400",
      "Charlie Chaplin": "border-lime-500 bg-lime-500/10 text-lime-400",
      "Buster Keaton": "border-teal-500 bg-teal-500/10 text-teal-400",
      "Sergei Eisenstein": "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400",
      "D.W. Griffith": "border-sky-500 bg-sky-500/10 text-sky-400",
      "F.W. Murnau": "border-stone-500 bg-stone-500/10 text-stone-400",
      "Georges Méliès": "border-green-500 bg-green-500/10 text-green-400",
      "Lumière Brothers": "border-neutral-500 bg-neutral-500/10 text-neutral-400"
    };
    return colorMap[directorName] || "border-gray-500 bg-gray-500/10 text-gray-400";
  };

  const getDirectorDescription = (directorName: string) => {
    const descriptionMap: Record<string, string> = {
      "Christopher Nolan": "Realistic, gritty, high contrast with deep shadows",
      "Wes Anderson": "Whimsical, symmetrical, pastel colors with retro charm",
      "Denis Villeneuve": "Dark, cinematic, epic scale with monumental architecture",
      "David Fincher": "Precise, controlled, geometric with digital precision",
      "Martin Scorsese": "Dynamic, urban realism with vibrant colors",
      "Quentin Tarantino": "Stylized violence, pop culture, bold colors and retro aesthetic",
      "Stanley Kubrick": "Symmetrical composition, clinical precision, minimalist approach",
      "Alfred Hitchcock": "Suspenseful, psychological, voyeuristic with dramatic shadows",
      "Akira Kurosawa": "Epic scale, natural elements, human drama with cinematic poetry",
      "Federico Fellini": "Surreal, dreamlike, theatrical with baroque sensibilities",
      "Ingmar Bergman": "Minimalist, psychological, introspective with existential themes",
      "Jean-Luc Godard": "Avant-garde, experimental, self-reflexive with modernist approach",
      "Fritz Lang": "Expressionist, geometric, futuristic with metaphysical themes",
      "Orson Welles": "Deep focus, dramatic angles, expressionist with theatrical staging",
      "Charlie Chaplin": "Slapstick, sentimental, physical comedy with humanist themes",
      "Buster Keaton": "Physical comedy, daredevil stunts, deadpan with geometric precision",
      "Sergei Eisenstein": "Montage, revolutionary, epic scale with symbolic imagery",
      "D.W. Griffith": "Epic scale, melodramatic, historical with romantic sensibilities",
      "F.W. Murnau": "Expressionist, gothic, atmospheric with supernatural elements",
      "Georges Méliès": "Magical, fantastical, theatrical with innovative techniques",
      "Lumière Brothers": "Documentary, realistic, natural with observational style"
    };
    return descriptionMap[directorName] || "Professional cinematic style";
  };

  // Get filtered directors based on selected genre
  const filteredDirectors = auteurEngine.getDirectorsByGenre(selectedGenre);
  const availableGenres = auteurEngine.getAvailableGenres();

  return (
    <div className={cn("space-y-3", className)}>
      {/* Auteur Engine Status Display */}
      {engineState?.isEnabled && selectedDirector && (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Auteur Engine Active</span>
            </div>
            <Badge className={cn("text-xs", getDirectorColor(selectedDirector))}>
              {getDirectorIcon(selectedDirector)}
              <span className="ml-1">{selectedDirector}</span>
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisable}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Director Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant={engineState?.isEnabled ? "default" : "outline"}
            className={cn(
              "w-full justify-start gap-2",
              engineState?.isEnabled 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                : "border-dashed"
            )}
          >
            <Film className="w-4 h-4" />
            {engineState?.isEnabled 
              ? `Active: ${selectedDirector}` 
              : "Select Director Style"
            }
            {engineState?.isEnabled && (
              <CheckCircle className="w-4 h-4 ml-auto" />
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="w-5 h-5" />
              Auteur Engine - Director Selection
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a director's style to apply as a persistent overlay to all your image generations. 
              This creates a cohesive, cinematic aesthetic throughout your creative session.
            </p>
            
            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Label htmlFor="genre-filter" className="text-sm font-medium text-gray-700">
                Filter by Genre:
              </Label>
              <Select value={selectedGenre} onValueChange={handleGenreChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Genres</SelectItem>
                  {availableGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <RadioGroup 
              value={selectedDirector || ""} 
              onValueChange={handleDirectorSelect}
              className="space-y-3"
            >
              {filteredDirectors.map((directorProfile) => {
                const directorName = directorProfile.director_name;
                const isSelected = selectedDirector === directorName;
                
                return (
                  <div
                    key={directorName}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      isSelected 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => handleDirectorSelect(directorName)}
                  >
                    <RadioGroupItem 
                      value={directorName} 
                      id={directorName}
                      className="mt-1"
                    />
                    
                    <Label 
                      htmlFor={directorName} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getDirectorIcon(directorName)}
                        <span className="font-medium text-gray-900">
                          {directorName}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-purple-500" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {getDirectorDescription(directorName)}
                      </p>
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {directorProfile.genre.map((genre, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs text-gray-500"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Style Keywords */}
                      <div className="flex flex-wrap gap-1">
                        {directorProfile.style_profile.visual_keywords.slice(0, 3).map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            
            {filteredDirectors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No directors found for the selected genre.</p>
                <p className="text-sm">Try selecting a different genre or "All Genres".</p>
              </div>
            )}
            
            {selectedDirector && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleDisable}
                  variant="outline"
                  className="flex-1"
                >
                  Disable Auteur Engine
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Keep Active
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Movie Selector */}
      <div className="border-t border-border/50 glass-light p-4">
        <div className="flex items-center gap-2 mb-3">
          <Film className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Cinematic References</span>
        </div>
        <MovieSelector
          onMovieSelect={(movie) => {
            console.log('🎬 [AuteurEngineSelector] Movie selected:', movie.title);
            onMovieSelect?.(movie);
          }}
        />
      </div>

      {/* Quick Info */}
      {engineState?.isEnabled && (
        <div className="text-xs text-gray-500 text-center">
          💡 All prompts will be automatically enhanced with {selectedDirector}'s cinematic style
        </div>
      )}
    </div>
  );
}
