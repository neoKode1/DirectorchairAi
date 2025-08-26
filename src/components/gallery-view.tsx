"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { button as Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Play, 
  Image as ImageIcon, 
  Video, 
  Music,
  Eye,
  Zap,
  Calendar,
  Clock,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { contentStorage, type StoredContent } from '@/lib/content-storage';

interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  title: string;
  prompt: string;
  timestamp: Date;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    duration?: number;
  };
}

interface GalleryViewProps {
  items?: GalleryItem[]; // Make optional since we'll load from storage
  className?: string;
  onItemClick?: (item: GalleryItem) => void;
  onAnimate?: (item: GalleryItem) => void;
  useLocalStorage?: boolean; // New prop to enable local storage
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items: propItems,
  className = "",
  onItemClick,
  onAnimate,
  useLocalStorage = true
}) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localItems, setLocalItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load items from localStorage if enabled
  useEffect(() => {
    if (useLocalStorage) {
      console.log('📂 [GalleryView] Loading items from localStorage');
      const savedContent = contentStorage.loadContent();
      
      // Filter out text items and convert StoredContent to GalleryItem
      const filteredItems: GalleryItem[] = savedContent
        .filter(item => item.type !== 'text') // Exclude text items
        .map(item => ({
          id: item.id,
          type: item.type as 'image' | 'video' | 'audio',
          url: item.url,
          title: item.title,
          prompt: item.prompt || '',
          timestamp: item.timestamp,
          metadata: item.metadata
        }));
      
      setLocalItems(filteredItems);
      setIsLoading(false);
      console.log('📂 [GalleryView] Loaded', filteredItems.length, 'items from localStorage (filtered from', savedContent.length, 'total)');
    } else if (propItems) {
      setLocalItems(propItems);
      setIsLoading(false);
    }
  }, [useLocalStorage, propItems]);

  // Use either local items or prop items
  const items = useLocalStorage ? localItems : (propItems || []);

  const handleItemClick = (item: GalleryItem) => {
    const index = items.findIndex(i => i.id === item.id);
    setCurrentIndex(index);
    setSelectedItem(item);
    setIsFullscreen(true);
    onItemClick?.(item);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedItem(items[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedItem(items[newIndex]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isFullscreen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleNext();
        break;
      case 'Escape':
        e.preventDefault();
        setIsFullscreen(false);
        break;
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, currentIndex, items]);

  const handleAnimate = (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    onAnimate?.(item);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'video':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'audio':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("w-full h-full", className)}>
      {/* Gallery Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <h2 className="text-heading font-semibold">Content Gallery</h2>
          <Badge variant="secondary" className="badge-enhanced">
            {items.length} items
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="btn-ghost">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="btn-ghost">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="p-2 overflow-y-auto h-[calc(100%-80px)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center animate-spin">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-subheading font-medium">Loading gallery...</h3>
              <p className="text-caption text-muted-foreground">
                Loading your saved content from local storage.
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-subheading font-medium">No content yet</h3>
              <p className="text-caption text-muted-foreground max-w-sm">
                Generated images, videos, and audio will appear here. Start by describing what you want to create in the chat.
              </p>
            </div>
          </div>
        ) : (
          <div className="gallery-grid">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "gallery-item group cursor-pointer animate-fade-in relative aspect-square overflow-hidden rounded-lg",
                  "hover-lift"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleItemClick(item)}
              >
                {/* Background Image/Media */}
                {item.type === 'image' && (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {item.type === 'video' && (
                  <>
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    {item.metadata?.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.metadata.duration)}
                      </div>
                    )}
                  </>
                )}
                {item.type === 'audio' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Music className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge 
                        variant="secondary" 
                        className={cn("badge-enhanced bg-white/90 text-black border-0", getTypeColor(item.type))}
                      >
                        {getTypeIcon(item.type)}
                        {item.type}
                      </Badge>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="btn-secondary bg-white/90 text-black border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium line-clamp-2 text-white mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Prompt */}
                  <p className="text-xs text-white/80 line-clamp-2 mb-2">
                    {item.prompt}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(item.timestamp)}
                    </div>
                    {item.metadata?.width && item.metadata?.height && (
                      <span>
                        {item.metadata.width}×{item.metadata.height}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="btn-secondary bg-white/90 text-black border-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {item.type === 'image' && onAnimate && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="btn-secondary bg-white/90 text-black border-0"
                        onClick={(e) => handleAnimate(e, item)}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal - Using createPortal to render outside component tree */}
      {isFullscreen && selectedItem && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999
          }}
          onClick={() => setIsFullscreen(false)}
        >
          {/* Main Image Container - Centered and Large */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Top Right */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            {currentIndex < items.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Main Image - Centered and Large */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              {selectedItem.type === 'image' && (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain transition-all duration-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {selectedItem.type === 'video' && (
                <video
                  src={selectedItem.url}
                  controls
                  className="max-w-full max-h-full object-contain transition-all duration-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {selectedItem.type === 'audio' && (
                <div className="w-full max-w-md bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-8 flex items-center justify-center">
                  <audio src={selectedItem.url} controls className="w-full" />
                </div>
              )}
            </div>

            {/* Image Counter - Top Center */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-700/50">
                <span className="text-sm text-white font-medium">
                  {currentIndex + 1} of {items.length}
                </span>
              </div>
            </div>

            {/* Image Info Panel - Bottom */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl w-full px-6">
              <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-2">{selectedItem.title}</h3>
                    {selectedItem.prompt && (
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">"{selectedItem.prompt}"</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        {formatTimestamp(selectedItem.timestamp)}
                      </span>
                      {selectedItem.metadata?.width && selectedItem.metadata?.height && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                          {selectedItem.metadata.width}×{selectedItem.metadata.height}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
