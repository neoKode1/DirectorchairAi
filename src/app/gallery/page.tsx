"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { button as Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  Play, 
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  FileText as FileTextIcon,
  Calendar,
  Clock,
  ArrowLeft,
  Fullscreen,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { GeneratedContentDisplay } from "@/components/generated-content-display";

interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  timestamp: string;
  tags: string[];
  metadata?: {
    format?: string;
    duration?: number;
    resolution?: string;
    size?: number;
  };
}

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'text'>('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - in real app, this would come from your storage
  useEffect(() => {
    // Simulate loading gallery items
    const mockItems: GalleryItem[] = [
      {
        id: '1',
        type: 'image',
        title: 'Cinematic Portrait',
        description: 'A dramatic portrait with controlled lighting and precise composition',
        url: '/api/generated-content/1',
        thumbnail: '/api/generated-content/1/thumbnail',
        timestamp: '2024-01-15T10:30:00Z',
        tags: ['portrait', 'cinematic', 'dramatic', 'lighting'],
        metadata: { format: 'jpg', resolution: '2048x1536', size: 2048576 }
      },
      {
        id: '2',
        type: 'video',
        title: 'Dynamic Animation',
        description: 'Smooth motion with atmospheric effects and depth',
        url: '/api/generated-content/2',
        thumbnail: '/api/generated-content/2/thumbnail',
        timestamp: '2024-01-15T11:15:00Z',
        tags: ['animation', 'motion', 'atmospheric', 'depth'],
        metadata: { format: 'mp4', duration: 5, resolution: '1920x1080', size: 10485760 }
      },
      {
        id: '3',
        type: 'image',
        title: 'Urban Landscape',
        description: 'Modern cityscape with geometric composition and digital precision',
        url: '/api/generated-content/3',
        thumbnail: '/api/generated-content/3/thumbnail',
        timestamp: '2024-01-15T12:00:00Z',
        tags: ['landscape', 'urban', 'geometric', 'modern'],
        metadata: { format: 'jpg', resolution: '2048x1536', size: 3072000 }
      },
      {
        id: '4',
        type: 'video',
        title: 'Nature Documentary',
        description: 'Professional wildlife footage with steady camera movements',
        url: '/api/generated-content/4',
        thumbnail: '/api/generated-content/4/thumbnail',
        timestamp: '2024-01-15T13:45:00Z',
        tags: ['nature', 'wildlife', 'documentary', 'steady'],
        metadata: { format: 'mp4', duration: 8, resolution: '1920x1080', size: 16777216 }
      },
      {
        id: '5',
        type: 'image',
        title: 'Abstract Art',
        description: 'Contemporary abstract composition with vibrant colors',
        url: '/api/generated-content/5',
        thumbnail: '/api/generated-content/5/thumbnail',
        timestamp: '2024-01-15T14:20:00Z',
        tags: ['abstract', 'contemporary', 'vibrant', 'art'],
        metadata: { format: 'jpg', resolution: '2048x1536', size: 2560000 }
      },
      {
        id: '6',
        type: 'video',
        title: 'Sci-Fi Scene',
        description: 'Futuristic environment with glowing elements and tech aesthetics',
        url: '/api/generated-content/6',
        thumbnail: '/api/generated-content/6/thumbnail',
        timestamp: '2024-01-15T15:10:00Z',
        tags: ['sci-fi', 'futuristic', 'glowing', 'tech'],
        metadata: { format: 'mp4', duration: 6, resolution: '1920x1080', size: 12582912 }
      },
      {
        id: '7',
        type: 'image',
        title: 'Portrait Series',
        description: 'Professional headshot with studio lighting and clean background',
        url: '/api/generated-content/7',
        thumbnail: '/api/generated-content/7/thumbnail',
        timestamp: '2024-01-15T16:30:00Z',
        tags: ['portrait', 'professional', 'studio', 'clean'],
        metadata: { format: 'jpg', resolution: '2048x1536', size: 1800000 }
      },
      {
        id: '8',
        type: 'video',
        title: 'Product Showcase',
        description: 'Smooth product reveal with elegant camera movements',
        url: '/api/generated-content/8',
        thumbnail: '/api/generated-content/8/thumbnail',
        timestamp: '2024-01-15T17:15:00Z',
        tags: ['product', 'showcase', 'elegant', 'smooth'],
        metadata: { format: 'mp4', duration: 4, resolution: '1920x1080', size: 8388608 }
      }
    ];

    setGalleryItems(mockItems);
    setLoading(false);
  }, []);

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'audio': return <MusicIcon className="w-4 h-4" />;
      case 'text': return <FileTextIcon className="w-4 h-4" />;
      default: return <FileTextIcon className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/Untitled Project (1).jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/timeline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Studio
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                    Gallery
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Browse and manage your generated content
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-background/95 backdrop-blur border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filters */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === 'image' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('image')}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Images
                </Button>
                <Button
                  variant={selectedFilter === 'video' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('video')}
                >
                  <VideoIcon className="w-4 h-4 mr-1" />
                  Videos
                </Button>
                <Button
                  variant={selectedFilter === 'audio' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('audio')}
                >
                  <MusicIcon className="w-4 h-4 mr-1" />
                  Audio
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Start creating content to see it here'}
              </p>
              <Button asChild>
                <Link href="/timeline">
                  Start Creating
                </Link>
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6"
              : "space-y-4"
            }>
              {filteredItems.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-background/95 backdrop-blur border-border/50">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary">
                        <Fullscreen className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      {item.type === 'video' && (
                        <Button size="sm" variant="secondary">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Duration Badge for Videos */}
                    {item.type === 'video' && item.metadata?.duration && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatDuration(item.metadata.duration)}
                        </Badge>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.metadata?.size && (
                          <span>{formatFileSize(item.metadata.size)}</span>
                        )}
                        {item.metadata?.resolution && (
                          <span>{item.metadata.resolution}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
