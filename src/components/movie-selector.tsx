"use client";

import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Film, 
  Award, 
  Palette, 
  Camera,
  Star,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import { auteurEngine } from '@/lib/auteur-engine';
import { type Movie } from '@/lib/movies-database';
import { cn } from '@/lib/utils';

interface MovieSelectorProps {
  onMovieSelect?: (movie: Movie) => void;
  className?: string;
}

export function MovieSelector({ 
  onMovieSelect, 
  className 
}: MovieSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedAward, setSelectedAward] = useState<string>('All');
  const [selectedDirector, setSelectedDirector] = useState<string>('All');

  const handleMovieSelect = (movie: Movie) => {
    console.log('🎬 [MovieSelector] Movie selected:', movie.title);
    onMovieSelect?.(movie);
    setIsOpen(false);
  };

  const handleGenreChange = (genre: string) => {
    console.log('🎬 [MovieSelector] Genre selected:', genre);
    setSelectedGenre(genre);
  };

  const handleAwardChange = (award: string) => {
    console.log('🎬 [MovieSelector] Award selected:', award);
    setSelectedAward(award);
  };

  const handleDirectorChange = (director: string) => {
    console.log('🎬 [MovieSelector] Director selected:', director);
    setSelectedDirector(director);
  };

  // Get filtered movies based on selections
  const getFilteredMovies = (): Movie[] => {
    let movies = auteurEngine.getAllMovies();

    if (selectedGenre !== 'All') {
      movies = movies.filter(movie => movie.genres.includes(selectedGenre));
    }

    if (selectedAward !== 'All') {
      movies = movies.filter(movie => 
        movie.awards.some(award => 
          award.toLowerCase().includes(selectedAward.toLowerCase())
        )
      );
    }

    if (selectedDirector !== 'All') {
      movies = movies.filter(movie => movie.director === selectedDirector);
    }

    return movies;
  };

  const filteredMovies = getFilteredMovies();
  const availableGenres = auteurEngine.getMovieGenres();
  const availableAwards = auteurEngine.getMovieAwards();
  const availableDirectors = auteurEngine.getAvailableDirectors();

  const getMovieIcon = (movie: Movie) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Christopher Nolan": <Camera className="w-4 h-4" />,
      "Wes Anderson": <Palette className="w-4 h-4" />,
      "Denis Villeneuve": <Film className="w-4 h-4" />,
      "David Fincher": <Camera className="w-4 h-4" />,
      "Martin Scorsese": <Film className="w-4 h-4" />,
      "Quentin Tarantino": <Camera className="w-4 h-4" />,
      "Stanley Kubrick": <Camera className="w-4 h-4" />,
      "Alfred Hitchcock": <Camera className="w-4 h-4" />,
      "Akira Kurosawa": <Film className="w-4 h-4" />
    };
    return iconMap[movie.director] || <Film className="w-4 h-4" />;
  };

  const getMovieColor = (movie: Movie) => {
    const colorMap: Record<string, string> = {
      "Christopher Nolan": "border-blue-500 bg-blue-500/10 text-blue-400",
      "Wes Anderson": "border-pink-500 bg-pink-500/10 text-pink-400",
      "Denis Villeneuve": "border-purple-500 bg-purple-500/10 text-purple-400",
      "David Fincher": "border-gray-500 bg-gray-500/10 text-gray-400",
      "Martin Scorsese": "border-red-500 bg-red-500/10 text-red-400",
      "Quentin Tarantino": "border-orange-500 bg-orange-500/10 text-orange-400",
      "Stanley Kubrick": "border-indigo-500 bg-indigo-500/10 text-indigo-400",
      "Alfred Hitchcock": "border-slate-500 bg-slate-500/10 text-slate-400",
      "Akira Kurosawa": "border-emerald-500 bg-emerald-500/10 text-emerald-400"
    };
    return colorMap[movie.director] || "border-gray-500 bg-gray-500/10 text-gray-400";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Movie Database Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-dashed"
          >
            <Film className="w-4 h-4" />
            Browse Cinematic References
            <Star className="w-4 h-4 ml-auto" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="w-5 h-5" />
              Cinematic Reference Library
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Explore award-winning films with outstanding visual and cinematic styling. 
              Use these references to inspire your creative direction and understand different cinematic approaches.
            </p>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Genre Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={selectedGenre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by genre" />
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

              {/* Award Filter */}
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-500" />
                <Select value={selectedAward} onValueChange={handleAwardChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by award" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Awards</SelectItem>
                    {availableAwards.map((award) => (
                      <SelectItem key={award} value={award}>
                        {award}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Director Filter */}
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" />
                <Select value={selectedDirector} onValueChange={handleDirectorChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by director" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Directors</SelectItem>
                    {availableDirectors.map((director) => (
                      <SelectItem key={director} value={director}>
                        {director}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Movies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
                  onClick={() => handleMovieSelect(movie)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getMovieIcon(movie)}
                      <div>
                        <h3 className="font-medium text-gray-900">{movie.title}</h3>
                        <p className="text-sm text-gray-500">{movie.year}</p>
                      </div>
                    </div>
                    <Badge className={cn("text-xs", getMovieColor(movie))}>
                      {movie.director}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{movie.description}</p>
                  
                                     {/* Awards */}
                   {movie.awards.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-3">
                       {movie.awards.slice(0, 2).map((award: string, index: number) => (
                         <Badge 
                           key={index} 
                           variant="outline" 
                           className="text-xs text-amber-600 border-amber-200"
                         >
                           <Award className="w-3 h-3 mr-1" />
                           {award}
                         </Badge>
                       ))}
                     </div>
                   )}
                   
                   {/* Genres */}
                   <div className="flex flex-wrap gap-1 mb-3">
                     {movie.genres.map((genre: string, index: number) => (
                       <Badge 
                         key={index} 
                         variant="secondary" 
                         className="text-xs"
                       >
                         {genre}
                       </Badge>
                     ))}
                   </div>
                   
                   {/* Visual Style Keywords */}
                   <div className="flex flex-wrap gap-1">
                     {movie.visualStyle.cinematography.slice(0, 2).map((style: string, index: number) => (
                       <Badge 
                         key={index} 
                         variant="outline" 
                         className="text-xs text-blue-600 border-blue-200"
                       >
                         <Camera className="w-3 h-3 mr-1" />
                         {style}
                       </Badge>
                     ))}
                     {movie.visualStyle.colorPalette.slice(0, 1).map((color: string, index: number) => (
                       <Badge 
                         key={index} 
                         variant="outline" 
                         className="text-xs text-purple-600 border-purple-200"
                       >
                         <Palette className="w-3 h-3 mr-1" />
                         {color}
                       </Badge>
                     ))}
                   </div>
                </div>
              ))}
            </div>
            
            {filteredMovies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No movies found for the selected filters.</p>
                <p className="text-sm">Try adjusting your filter criteria.</p>
              </div>
            )}
            
            <div className="text-xs text-gray-500 text-center">
              💡 Click on any movie to view its cinematic details and visual style
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
