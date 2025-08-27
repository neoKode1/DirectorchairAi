"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { button as Button } from '@/components/ui/button';
import { 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  X,
  RefreshCw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Upload,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ModelIcon } from '@/components/model-icons';
import { contentStorage, type StoredContent } from '@/lib/content-storage';
import { sessionStorage, type SessionContent } from '@/lib/session-storage';

interface GeneratedContent {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url: string;
  title: string;
  prompt?: string;
  timestamp: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    size?: number;
    seed?: number; // Add seed information for reproducibility
    seedDescription?: string; // Add seed description for user display
  };
  // New fields for multiple images
  images?: string[];
  imageCount?: number;
  selectedImageIndex?: number;
}

interface GeneratedContentDisplayProps {
  className?: string;
  sessionId?: string;
}

// Add monitoring utility at the top of the component
const ContentPanelMonitor = {
  log(action: string, details: any = {}) {
    const interaction = {
      timestamp: Date.now(),
      action,
      details,
      component: 'GeneratedContentDisplay'
    };
    
    console.log(`📊 [ContentPanelMonitor] ${action}:`, details);
    
    // Store in localStorage for persistence
    const existingData = localStorage.getItem('content-panel-interactions');
    const allInteractions = existingData ? JSON.parse(existingData) : [];
    allInteractions.push(interaction);
    
    // Keep only last 500 interactions
    if (allInteractions.length > 500) {
      allInteractions.splice(0, allInteractions.length - 500);
    }
    
    localStorage.setItem('content-panel-interactions', JSON.stringify(allInteractions));
  }
};

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ 
  className = "",
  sessionId
}) => {
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedContent | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Helper function to truncate long prompts
  const truncatePrompt = (prompt: string, maxLength: number = 100): string => {
    if (prompt.length <= maxLength) {
      return prompt;
    }
    // Find the first sentence or break at a reasonable point
    const firstSentence = prompt.split('.')[0];
    if (firstSentence.length <= maxLength) {
      return firstSentence + '...';
    }
    return prompt.substring(0, maxLength) + '...';
  };

  // Synchronize selectedContent with content array when content changes
  useEffect(() => {
    if (selectedContent) {
      const updatedContent = content.find(c => c.id === selectedContent.id);
      if (updatedContent && updatedContent.selectedImageIndex !== selectedContent.selectedImageIndex) {
        console.log('🔄 [GeneratedContentDisplay] Synchronizing selectedContent with updated content');
        setSelectedContent(updatedContent);
      }
    }
  }, [content, selectedContent]);

  // Keyboard shortcuts for fullscreen (F key disabled to allow typing)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F key functionality disabled - users can use the fullscreen button instead
      // Press 'Escape' to close fullscreen
      if (event.key === 'Escape') {
        if (fullscreenImage) {
          event.preventDefault();
          setFullscreenImage(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedContent, fullscreenImage]);

  // Load saved content from localStorage on mount
  useEffect(() => {
    console.log('📂 [GeneratedContentDisplay] Loading saved content from localStorage');
    
    if (sessionId) {
      // Load session-specific content
      const sessionContent = sessionStorage.getSessionContent(sessionId);
      console.log('📂 [GeneratedContentDisplay] Loaded', sessionContent.length, 'items from session:', sessionId);
      setContent(sessionContent);
      
      if (sessionContent.length > 0) {
        setSelectedContent(sessionContent[0]);
      }
    } else {
      // Load legacy content storage
      const savedContent = contentStorage.loadContent();
      
      if (savedContent.length > 0) {
        console.log('📂 [GeneratedContentDisplay] Loaded', savedContent.length, 'items from localStorage');
        setContent(savedContent);
        
        // Set the most recent content as selected
        if (savedContent.length > 0) {
          setSelectedContent(savedContent[0]);
        }
      }
    }
  }, [sessionId]);

  // Listen for new generated content from the chat interface
  useEffect(() => {
    console.log('🎯 [GeneratedContentDisplay] Component mounted, setting up event listeners');
    
    // Prevent multiple event listeners
    const existingListener = (window as any).__contentGeneratedListener;
    if (existingListener) {
      window.removeEventListener('content-generated', existingListener);
    }
    
         const handleNewContent = (event: CustomEvent) => {
       console.log('📥 [GeneratedContentDisplay] Received content-generated event:', event.detail);
       console.log('📥 [GeneratedContentDisplay] Prompt in event detail:', event.detail.prompt);
       const newContent: GeneratedContent = event.detail;
       console.log('📥 [GeneratedContentDisplay] Setting content:', newContent);
       
       // Store listener reference for cleanup
       (window as any).__contentGeneratedListener = handleNewContent;
       
       // Add the new content to the list
       setContent(prev => {
         console.log('📥 [GeneratedContentDisplay] Previous content:', prev);
         const newContentList = [newContent, ...prev];
         console.log('📥 [GeneratedContentDisplay] New content list:', newContentList);
         return newContentList;
       });
       
               // Save to appropriate storage
        if (sessionId) {
          sessionStorage.addContent(sessionId, newContent);
          console.log('💾 [GeneratedContentDisplay] Saved new content to session:', sessionId);
        }
        
        // Always save to localStorage for gallery access
        contentStorage.addContent(newContent);
        console.log('💾 [GeneratedContentDisplay] Saved new content to localStorage for gallery');
       
       // If it's an image, add it to loading state for blur effect
       if (newContent.type === 'image') {
         setLoadingImages(prev => new Set(prev).add(newContent.id));
       }
       
       setSelectedContent(newContent);
       setIsLoading(false);
       
       toast({
         title: "Content Generated!",
         description: `${newContent.type} content has been created successfully.`,
       });
     };

    const handleGenerationStart = () => {
      console.log('🔄 [GeneratedContentDisplay] Generation started');
      setIsLoading(true);
    };

    // Add event listeners
    window.addEventListener('content-generated', handleNewContent as EventListener);
    window.addEventListener('generation-started', handleGenerationStart as EventListener);
    
    console.log('✅ [GeneratedContentDisplay] Event listeners added successfully');
    console.log('✅ [GeneratedContentDisplay] Listening for events: content-generated, generation-started');

    return () => {
      console.log('🧹 [GeneratedContentDisplay] Cleaning up event listeners');
      window.removeEventListener('content-generated', handleNewContent as EventListener);
      window.removeEventListener('generation-started', handleGenerationStart as EventListener);
      // Clear the stored listener reference
      delete (window as any).__contentGeneratedListener;
    };
  }, [toast]);

  // Add keyboard support for ESC key to close fullscreen modal and arrow key navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenImage) {
        handleCloseFullscreen();
      }
      
      // Arrow key navigation for image variants
      if (fullscreenImage && fullscreenImage.images && fullscreenImage.images.length > 1) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handleFullscreenPreviousImage();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleFullscreenNextImage();
        }
      }
    };

    if (fullscreenImage) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [fullscreenImage]);



  const handleDownload = async (content: GeneratedContent) => {
    try {
      const response = await fetch(content.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Fix file extension mapping
      let fileExtension = 'file';
      if (content.metadata?.format) {
        const format = content.metadata.format.toLowerCase();
        if (format.includes('jpeg') || format.includes('jpg') || format === 'image_jpeg') {
          fileExtension = 'jpg';
        } else if (format.includes('png')) {
          fileExtension = 'png';
        } else if (format.includes('webp')) {
          fileExtension = 'webp';
        } else if (format.includes('mp4') || format.includes('video')) {
          fileExtension = 'mp4';
        } else if (format.includes('gif')) {
          fileExtension = 'gif';
        } else {
          fileExtension = format;
        }
      } else if (content.type === 'image') {
        fileExtension = 'jpg'; // Default for images
      } else if (content.type === 'video') {
        fileExtension = 'mp4'; // Default for videos
      }
      
      a.download = `${content.title}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveContent = (contentId: string) => {
    setContent(prev => prev.filter(c => c.id !== contentId));
    if (selectedContent?.id === contentId) {
      setSelectedContent(null);
    }
    // Remove from appropriate storage
    if (sessionId) {
      sessionStorage.removeContent(sessionId, contentId);
      console.log('🗑️ [GeneratedContentDisplay] Removed content from session:', sessionId, contentId);
    } else {
      contentStorage.removeContent(contentId);
      console.log('🗑️ [GeneratedContentDisplay] Removed content from localStorage:', contentId);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageClick = (content: GeneratedContent) => {
    if (content.type === 'image') {
      console.log('🖼️ [GeneratedContentDisplay] Image clicked:', content);
      ContentPanelMonitor.log('image_click', { contentId: content.id, title: content.title });
      
      // Use the selected image URL if available, otherwise use the main URL
      const imageUrl = content.images && content.selectedImageIndex !== undefined 
        ? content.images[content.selectedImageIndex] 
        : content.url;
      
      console.log('🖼️ [GeneratedContentDisplay] Using image URL for injection:', imageUrl);
      
      // Create a content object with the correct image URL
      const contentWithCorrectUrl = {
        ...content,
        url: imageUrl
      };
      
      // Inject the image into the chat input instead of opening fullscreen
      handleInjectImageToChat(contentWithCorrectUrl);
    }
  };

  const handleCloseFullscreen = () => {
    console.log('🔍 [GeneratedContentDisplay] Closing fullscreen');
    setFullscreenImage(null);
  };

  const handleOpenFullscreen = (content: GeneratedContent) => {
    console.log('🔍 [GeneratedContentDisplay] Opening fullscreen for content:', content);
    console.log('🔍 [GeneratedContentDisplay] Content type:', content.type);
    console.log('🔍 [GeneratedContentDisplay] Content URL:', content.url);
    setFullscreenImage(content);
  };

  const handleInjectImageToChat = (content: GeneratedContent) => {
    console.log('💉 [GeneratedContentDisplay] Injecting image to chat:', content);
    console.log('💉 [GeneratedContentDisplay] Content type:', content.type);
    console.log('💉 [GeneratedContentDisplay] Content URL:', content.url);
    console.log('💉 [GeneratedContentDisplay] Content images:', content.images);
    console.log('💉 [GeneratedContentDisplay] Selected image index:', content.selectedImageIndex);
    
    if (content.type !== 'image') {
      console.log('❌ [GeneratedContentDisplay] Cannot inject non-image content:', content.type);
      return;
    }
    
    // Use the selected image URL if available, otherwise use the main URL
    const imageUrl = content.images && content.selectedImageIndex !== undefined 
      ? content.images[content.selectedImageIndex] 
      : content.url;
    
    console.log('💉 [GeneratedContentDisplay] Using image URL for injection:', imageUrl);
    
    // Dispatch a custom event to inject the image into the chat interface
    const injectEvent = new CustomEvent('inject-image-to-chat', {
      detail: {
        imageUrl: imageUrl,
        imageTitle: content.title,
        prompt: content.prompt || ''
      }
    });
    
    window.dispatchEvent(injectEvent);
    
    toast({
      title: "Image Added to Chat!",
      description: `${content.title} has been added to the chat input. You can now type a prompt to animate it or use it for image editing.`,
    });
  };

  const handleImageLoad = (contentId: string) => {
    // Remove from loading state when image is fully loaded
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(contentId);
      return newSet;
    });
  };

  const handleAnimateImage = (content: GeneratedContent) => {
    if (content.type === 'image') {
      console.log('🎬 [GeneratedContentDisplay] Animate button clicked for image:', content.url);
      console.log('🎬 [GeneratedContentDisplay] Content details:', {
        id: content.id,
        title: content.title,
        url: content.url,
        images: content.images,
        selectedImageIndex: content.selectedImageIndex,
        prompt: content.prompt
      });
      
      // Use the selected image URL if available, otherwise use the main URL
      const imageUrl = content.images && content.selectedImageIndex !== undefined 
        ? content.images[content.selectedImageIndex] 
        : content.url;
      
      console.log('🎬 [GeneratedContentDisplay] Selected image URL for animation:', imageUrl);
      
      // Dispatch a custom event to trigger animation in the chat interface
      const animateEvent = new CustomEvent('animate-image', {
        detail: {
          imageUrl: imageUrl,
          imageTitle: content.title,
          prompt: content.prompt || 'Animate this image'
        }
      });
      
      console.log('🎬 [GeneratedContentDisplay] Dispatching animate-image event:', animateEvent.detail);
      window.dispatchEvent(animateEvent);
      
      toast({
        title: "Animation Requested!",
        description: `Starting animation for "${content.title}"`,
      });
    } else {
      console.log('❌ [GeneratedContentDisplay] Cannot animate non-image content:', content.type);
    }
  };

  const handleImageVariantSelect = (content: GeneratedContent, imageIndex: number) => {
    console.log('🖼️ [GeneratedContentDisplay] Selecting image variant:', imageIndex, 'for content ID:', content.id);
    console.log('🖼️ [GeneratedContentDisplay] Current selectedImageIndex:', content.selectedImageIndex);
    console.log('🖼️ [GeneratedContentDisplay] Available images:', content.images);
    console.log('🖼️ [GeneratedContentDisplay] Current content state before update:', content);
    
    // Get the URL of the selected variant
    const selectedImageUrl = content.images?.[imageIndex] || content.url;
    console.log('🖼️ [GeneratedContentDisplay] Selected image URL:', selectedImageUrl);
    
    // Update the content with the selected image index and URL
    setContent(prev => {
      console.log('🔄 [GeneratedContentDisplay] Previous content state:', prev);
      const updated = prev.map(item => 
        item.id === content.id 
          ? { 
              ...item, 
              selectedImageIndex: imageIndex,
              url: selectedImageUrl // Update the main URL to the selected variant
            }
          : item
      );
      console.log('🔄 [GeneratedContentDisplay] Updated content array:', updated);
      console.log('🔄 [GeneratedContentDisplay] Updated item for this content:', updated.find(item => item.id === content.id));
      return updated;
    });
    
    // Update selected content
    setSelectedContent(prev => {
      console.log('🔄 [GeneratedContentDisplay] Previous selected content:', prev);
      const updated = prev?.id === content.id 
        ? { 
            ...prev, 
            selectedImageIndex: imageIndex,
            url: selectedImageUrl // Update the main URL to the selected variant
          }
        : prev;
      console.log('🔄 [GeneratedContentDisplay] Updated selected content:', updated);
      return updated;
    });
    
    // Force a re-render by updating the key
    console.log('🔄 [GeneratedContentDisplay] Forcing re-render with new selectedImageIndex:', imageIndex);
  };

  // Navigation functions for image variants
  const handlePreviousImage = () => {
    if (!selectedContent || !selectedContent.images || selectedContent.images.length <= 1) return;
    
    const currentIndex = selectedContent.selectedImageIndex || 0;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : selectedContent.images.length - 1;
    
    console.log('⬅️ [Navigation] Previous image clicked, current index:', currentIndex, 'new index:', newIndex);
    handleImageVariantSelect(selectedContent, newIndex);
  };

  const handleNextImage = () => {
    if (!selectedContent || !selectedContent.images || selectedContent.images.length <= 1) return;
    
    const currentIndex = selectedContent.selectedImageIndex || 0;
    const newIndex = currentIndex < selectedContent.images.length - 1 ? currentIndex + 1 : 0;
    
    console.log('➡️ [Navigation] Next image clicked, current index:', currentIndex, 'new index:', newIndex);
    handleImageVariantSelect(selectedContent, newIndex);
  };

  // Fullscreen modal navigation handlers
  const handleFullscreenPreviousImage = () => {
    if (fullscreenImage && fullscreenImage.images && fullscreenImage.selectedImageIndex !== undefined) {
      const currentIndex = fullscreenImage.selectedImageIndex;
      const newIndex = currentIndex > 0 ? currentIndex - 1 : fullscreenImage.images.length - 1; // Wrap around
      
      console.log('⬅️ [Fullscreen] Navigating to previous image:', newIndex);
      
      setFullscreenImage(prev => prev ? {
        ...prev,
        selectedImageIndex: newIndex,
        url: prev.images![newIndex]
      } : null);
      
      // Also update the main content state
      setContent(prev => prev.map(item => 
        item.id === fullscreenImage.id 
          ? { 
              ...item, 
              selectedImageIndex: newIndex,
              url: fullscreenImage.images![newIndex]
            }
          : item
      ));
    }
  };

  const handleFullscreenNextImage = () => {
    if (fullscreenImage && fullscreenImage.images && fullscreenImage.selectedImageIndex !== undefined) {
      const currentIndex = fullscreenImage.selectedImageIndex;
      const newIndex = currentIndex < fullscreenImage.images.length - 1 ? currentIndex + 1 : 0; // Wrap around
      
      console.log('➡️ [Fullscreen] Navigating to next image:', newIndex);
      
      setFullscreenImage(prev => prev ? {
        ...prev,
        selectedImageIndex: newIndex,
        url: prev.images![newIndex]
      } : null);
      
      // Also update the main content state
      setContent(prev => prev.map(item => 
        item.id === fullscreenImage.id 
          ? { 
              ...item, 
              selectedImageIndex: newIndex,
              url: fullscreenImage.images![newIndex]
            }
          : item
      ));
    }
  };

  console.log('🎨 [GeneratedContentDisplay] Rendering with content:', content, 'isLoading:', isLoading);
  console.log('🎨 [GeneratedContentDisplay] Content items with selectedImageIndex:', content.map(item => ({ id: item.id, selectedImageIndex: item.selectedImageIndex })));
  
  // Component for displaying image variants in a 2x2 grid
  const ImageVariantsGrid = ({ contentId }: { contentId: string }) => {
    // Get the current content from the state
    const currentContent = content.find(c => c.id === contentId);
    
    console.log('🔲 [ImageVariantsGrid] Rendering with content ID:', contentId, 'selectedImageIndex:', currentContent?.selectedImageIndex);
    console.log('🔲 [ImageVariantsGrid] Content images:', currentContent?.images);
    console.log('🔲 [ImageVariantsGrid] Content images length:', currentContent?.images?.length);
    
    if (!currentContent?.images || currentContent.images.length === 0) return null;
    
    return (
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-2">Image Variants (Click to select):</div>
        <div className="grid grid-cols-2 gap-2">
          {currentContent.images.map((imageUrl, index) => (
            <div
              key={index}
              className={`relative cursor-pointer rounded border-2 transition-all ${
                currentContent.selectedImageIndex === index 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                console.log('🖱️ [ImageVariantsGrid] Click detected on variant:', index, 'for content ID:', contentId);
                console.log('🖱️ [ImageVariantsGrid] Current selectedImageIndex before click:', currentContent.selectedImageIndex);
                console.log('🖱️ [ImageVariantsGrid] Clicking variant index:', index);
                handleImageVariantSelect(currentContent, index);
              }}
            >
              <img
                src={imageUrl}
                alt={`Variant ${index + 1}`}
                className="w-full h-20 object-cover rounded"
                onLoad={() => handleImageLoad(contentId)}
                onError={() => handleImageLoad(contentId)}
              />
              {currentContent.selectedImageIndex === index && (
                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                  ✓
                </div>
              )}
              {/* Debug info */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                {currentContent.selectedImageIndex === index ? '✓' : '○'}
              </div>
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Generated Content</h2>
          <Badge variant="outline" className="text-xs">
            {content.length} items
          </Badge>
        </div>
        
        {content.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setContent([]);
                if (sessionId) {
                  sessionStorage.clearSessionContent(sessionId);
                  console.log('🧹 [GeneratedContentDisplay] Cleared all content from session:', sessionId);
                } else {
                  contentStorage.clearAllContent();
                  console.log('🧹 [GeneratedContentDisplay] Cleared all content from localStorage');
                }
              }}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sessionId) {
                  const sessionStats = sessionStorage.getSessionStats();
                  const session = sessionStorage.getSession(sessionId);
                  console.log('📊 [GeneratedContentDisplay] Session stats:', sessionStats);
                  toast({
                    title: "Session Statistics",
                    description: `Session: ${session?.name}, ${content.length} items`,
                  });
                } else {
                  const stats = contentStorage.getStorageStats();
                  console.log('📊 [GeneratedContentDisplay] Storage stats:', stats);
                  toast({
                    title: "Storage Statistics",
                    description: `${stats.totalItems} items, ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB used`,
                  });
                }
              }}
              className="text-xs"
            >
              📊 Stats
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm text-gray-400">Generating content...</p>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {content.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Content Yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Generated images, videos, and audio will appear here. Start by describing what you want to create in the chat.
            </p>
          </div>
        ) : (
          content.map((item) => (
                        <Card
              key={item.id}
              className={`relative overflow-hidden cursor-pointer transition-all group ${
                selectedContent?.id === item.id ? 'border-purple-500/50' : 'border-gray-700/30'
              }`}
              onClick={() => setSelectedContent(content.find(c => c.id === item.id) || item)}
            >
              {/* Full background image for image content */}
              {item.type === 'image' && (
                <>
                  <img
                    src={item.url}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      loadingImages.has(item.id) 
                        ? 'blur-md scale-95 opacity-70' 
                        : 'blur-0 scale-100 opacity-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(item);
                    }}
                    onLoad={() => handleImageLoad(item.id)}
                    onError={() => handleImageLoad(item.id)}
                    title="Click to add this image to the chat input for animation"
                  />
                  {loadingImages.has(item.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  {/* Hover glow effect with inject indicator */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to inject
                    </div>
                  </div>
                </>
              )}
              
              {/* Content overlay */}
              <div className="relative p-3">
                {/* For non-image content, show the original layout */}
                {item.type !== 'image' && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {item.type === 'video' && (
                        <div className="w-12 h-12 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                          <Video className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      {item.type === 'audio' && (
                        <div className="w-12 h-12 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                          <Music className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      {item.type === 'text' && (
                        <div className="w-12 h-12 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getContentIcon(item.type)}
                        <span className="text-sm font-medium text-gray-200 truncate">
                          {item.title}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.prompt && (
                          <ModelIcon 
                            model={item.prompt.toLowerCase().includes('flux') ? 'flux' : 
                                   item.prompt.toLowerCase().includes('veo') ? 'veo3' :
                                   item.prompt.toLowerCase().includes('kling') ? 'kling' :
                                   item.prompt.toLowerCase().includes('luma') ? 'luma' :
                                   item.prompt.toLowerCase().includes('minimax') ? 'minimax' :
                                   item.prompt.toLowerCase().includes('seedance') ? 'seedance' : 'flux'}
                            size="sm"
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                        {item.metadata?.width && item.metadata?.height && (
                          <span>{item.metadata.width}×{item.metadata.height}</span>
                        )}
                        {item.metadata?.duration && (
                          <span>{formatDuration(item.metadata.duration)}</span>
                        )}
                        {item.metadata?.size && (
                          <span>{formatFileSize(item.metadata.size)}</span>
                        )}
                        {item.metadata?.seed && (
                          <span className="text-purple-400 font-mono">
                            🎲 {item.metadata.seed}
                          </span>
                        )}
                      </div>
                      
                      {item.prompt && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          "{truncatePrompt(item.prompt)}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* For image content, show overlay layout */}
                {item.type === 'image' && (
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getContentIcon(item.type)}
                        <span className="text-sm font-medium text-white truncate drop-shadow-lg">
                          {item.title}
                        </span>
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                          {item.type}
                        </Badge>
                        {item.prompt && (
                          <ModelIcon 
                            model={item.prompt.toLowerCase().includes('flux') ? 'flux' : 
                                   item.prompt.toLowerCase().includes('veo') ? 'veo3' :
                                   item.prompt.toLowerCase().includes('kling') ? 'kling' :
                                   item.prompt.toLowerCase().includes('luma') ? 'luma' :
                                   item.prompt.toLowerCase().includes('minimax') ? 'minimax' :
                                   item.prompt.toLowerCase().includes('seedance') ? 'seedance' : 'flux'}
                            size="sm"
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-200 drop-shadow-lg">
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                        {item.metadata?.width && item.metadata?.height && (
                          <span>{item.metadata.width}×{item.metadata.height}</span>
                        )}
                        {item.metadata?.duration && (
                          <span>{formatDuration(item.metadata.duration)}</span>
                        )}
                        {item.metadata?.size && (
                          <span>{formatFileSize(item.metadata.size)}</span>
                        )}
                        {item.metadata?.seed && (
                          <span className="text-purple-300 font-mono">
                            🎲 {item.metadata.seed}
                          </span>
                        )}
                      </div>
                      
                      {item.prompt && (
                        <p className="text-xs text-gray-200 mt-1 truncate drop-shadow-lg">
                          "{truncatePrompt(item.prompt)}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnimateImage(item);
                        }}
                        className="h-8 w-8 p-0 text-white hover:text-purple-300 hover:bg-white/20 backdrop-blur-sm"
                        title="Animate this image"
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInjectImageToChat(item);
                        }}
                        className="h-8 w-8 p-0 text-white hover:text-green-300 hover:bg-white/20 backdrop-blur-sm"
                        title="Edit this image"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveContent(item.id);
                        }}
                        className="h-8 w-8 p-0 text-white hover:text-red-300 hover:bg-white/20 backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Image variants grid for multiple images */}
                {item.type === 'image' && item.images && item.images.length > 1 && (
                  <ImageVariantsGrid 
                    key={`${item.id}-${item.selectedImageIndex || 0}`} 
                    contentId={item.id} 
                  />
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Selected Content Preview */}
      {selectedContent && (
        <div className="border-t border-gray-700/30 p-4">
          <div className="space-y-3">
                         <div className="flex items-center justify-between">
               <h3 className="text-sm font-medium text-white">Preview</h3>
               <div className="flex items-center justify-center gap-2">
                 {/* Animate button for images in preview */}
                 {selectedContent.type === 'image' && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleAnimateImage(selectedContent)}
                     className="text-xs border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                   >
                     <Zap className="w-3 h-3 mr-1" />
                     Animate
                   </Button>
                 )}
                 {/* Edit button for images in preview */}
                 {selectedContent.type === 'image' && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleInjectImageToChat(selectedContent)}
                     className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/20"
                     title="Edit this image"
                   >
                     <Edit className="w-3 h-3 mr-1" />
                     Edit
                   </Button>
                 )}
                 {/* Fullscreen button for images */}
                 {selectedContent.type === 'image' && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handleOpenFullscreen(selectedContent)}
                     className="text-xs border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                            title="Open fullscreen view"
                   >
                     <Maximize2 className="w-3 h-3 mr-1" />
                     Fullscreen
                   </Button>
                 )}
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleDownload(selectedContent)}
                   className="text-xs"
                 >
                   <Download className="w-3 h-3 mr-1" />
                   Download
                 </Button>
               </div>
             </div>
            
                                      <div className="bg-black/50 rounded-lg overflow-hidden">
                {selectedContent.type === 'image' && (
                  <div className="relative">
                    <div className="relative group">
                      <img
                        src={selectedContent.images && selectedContent.selectedImageIndex !== undefined 
                          ? selectedContent.images[selectedContent.selectedImageIndex] 
                          : selectedContent.url}
                        alt={selectedContent.title}
                        className={`w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-90 transition-all duration-700 ${
                          loadingImages.has(selectedContent.id) 
                            ? 'blur-lg scale-95 opacity-60' 
                            : 'blur-0 scale-100 opacity-100'
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleOpenFullscreen(selectedContent);
                        }}
                        onLoad={() => handleImageLoad(selectedContent.id)}
                        onError={() => handleImageLoad(selectedContent.id)}
                        title="Right-click for fullscreen"
                      />
                      {/* Hover overlay for visual feedback */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      </div>
                    </div>
                    
                    {/* Navigation arrows for image variants */}
                    {selectedContent.images && selectedContent.images.length > 1 && (
                      <>
                        {/* Previous arrow */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviousImage();
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Next arrow */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {/* Debug info for preview */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Preview: {selectedContent.selectedImageIndex !== undefined ? selectedContent.selectedImageIndex + 1 : 'N/A'} of {selectedContent.images?.length || 1}
                    </div>
                    {loadingImages.has(selectedContent.id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}
              
              {selectedContent.type === 'video' && (
                <video
                  src={selectedContent.url}
                  controls
                  className="w-full h-auto max-h-64"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
              
              {selectedContent.type === 'audio' && (
                <div className="p-4">
                  <audio
                    src={selectedContent.url}
                    controls
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}
              
              {selectedContent.type === 'text' && (
                <div className="p-4 text-sm text-gray-300">
                  <pre className="whitespace-pre-wrap">{selectedContent.url}</pre>
                </div>
              )}
            </div>
            
            {selectedContent.prompt && (
              <div className="text-xs text-gray-400">
                <span className="font-medium">Prompt:</span> "{truncatePrompt(selectedContent.prompt)}"
              </div>
            )}
            
            {/* Image variants grid in preview */}
            {selectedContent.type === 'image' && selectedContent.images && selectedContent.images.length > 1 && (
              <ImageVariantsGrid 
                key={`preview-${selectedContent.id}-${selectedContent.selectedImageIndex || 0}`} 
                contentId={selectedContent.id} 
              />
            )}
          </div>
                 </div>
       )}

       {/* Enhanced Large Preview Modal - Midjourney Style */}
       {fullscreenImage && createPortal(
         <div 
           className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
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
           onClick={handleCloseFullscreen}
         >
           {/* Main Image Container - Centered like Midjourney */}
           <div 
             className="relative w-full h-full flex items-center justify-center p-8"
             onClick={(e) => e.stopPropagation()}
           >
             {/* Close Button - Top Right */}
             <button
               onClick={handleCloseFullscreen}
               className="absolute top-6 right-6 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
               aria-label="Close fullscreen"
             >
               <X className="w-6 h-6" />
             </button>

             {/* Navigation Arrows - Only show if there are multiple images */}
             {fullscreenImage.images && fullscreenImage.images.length > 1 && (
               <>
                 {/* Left Arrow */}
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleFullscreenPreviousImage();
                   }}
                   disabled={fullscreenImage.selectedImageIndex === 0}
                   className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                   aria-label="Previous image"
                 >
                   <ChevronLeft className="w-8 h-8" />
                 </button>
                 
                 {/* Right Arrow */}
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleFullscreenNextImage();
                   }}
                   disabled={fullscreenImage.selectedImageIndex === fullscreenImage.images.length - 1}
                   className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 p-4 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                   aria-label="Next image"
                 >
                   <ChevronRight className="w-8 h-8" />
                 </button>
                 
                 {/* Image Counter - Top Center */}
                 <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                   {fullscreenImage.selectedImageIndex !== undefined ? fullscreenImage.selectedImageIndex + 1 : 1} of {fullscreenImage.images.length}
                 </div>
               </>
             )}
             
             {/* Main Image - Centered and Large */}
             <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
               <img
                 src={fullscreenImage.images && fullscreenImage.selectedImageIndex !== undefined 
                   ? fullscreenImage.images[fullscreenImage.selectedImageIndex] 
                   : fullscreenImage.url}
                 alt={fullscreenImage.title}
                 className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                   loadingImages.has(fullscreenImage.id) 
                     ? 'blur-xl scale-95 opacity-50' 
                     : 'blur-0 scale-100 opacity-100'
                 }`}
                 onClick={(e) => e.stopPropagation()}
                 onLoad={() => handleImageLoad(fullscreenImage.id)}
                 onError={() => handleImageLoad(fullscreenImage.id)}
               />
               
               {/* Loading overlay */}
               {loadingImages.has(fullscreenImage.id) && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                   <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}
             </div>

             {/* Image Info Panel - Bottom */}
             <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl w-full px-6">
               <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <h3 className="font-semibold text-lg text-white mb-2">{fullscreenImage.title}</h3>
                     {fullscreenImage.prompt && (
                       <p className="text-sm text-gray-300 mb-3 leading-relaxed">"{truncatePrompt(fullscreenImage.prompt, 200)}"</p>
                     )}
                     <div className="flex items-center gap-4 text-sm text-gray-400">
                       <span className="flex items-center gap-1">
                         <ImageIcon className="w-4 h-4" />
                         {fullscreenImage.timestamp.toLocaleTimeString()}
                       </span>
                       {fullscreenImage.metadata?.width && fullscreenImage.metadata?.height && (
                         <span className="flex items-center gap-1">
                           <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                           {fullscreenImage.metadata.width}×{fullscreenImage.metadata.height}
                         </span>
                       )}
                       {fullscreenImage.metadata?.size && (
                         <span className="flex items-center gap-1">
                           <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                           {formatFileSize(fullscreenImage.metadata.size)}
                         </span>
                       )}
                     </div>
                   </div>
                   
                   {/* Action Buttons */}
                   <div className="flex items-center justify-center gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleAnimateImage(fullscreenImage);
                       }}
                       className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                     >
                       <Zap className="w-4 h-4 mr-1" />
                       Animate
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDownload(fullscreenImage);
                       }}
                       className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                     >
                       <Download className="w-4 h-4 mr-1" />
                       Download
                     </Button>
                   </div>
                 </div>
               </div>
             </div>

             {/* Keyboard hints */}
             <div className="absolute top-6 left-6 bg-black/50 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm">
               Press ESC to close
             </div>
           </div>
         </div>,
         document.body
       )}
     </div>
   );
 };
