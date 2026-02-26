"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { SimpleChatInterface } from "@/components/simple-chat-interface";
import { GalleryView } from "@/components/gallery-view";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Download, Edit, Video } from "lucide-react";
import { downloadVideoWithFrame } from "@/lib/video-thumbnail";
import { useToast } from "@/hooks/use-toast";
import { ImageSelector, type ImageSelection } from "@/components/image-selector";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// Static loading component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-100"></div>
      <p className="text-neutral-400">Loading...</p>
    </div>
  </div>
);

function TimelineContent() {
  const [mounted, setMounted] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();


  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditImage = (imageUrl: string) => {
    // Call the injectImage function that's exposed on the window object
    if ((window as any).injectImageToChat) {
      (window as any).injectImageToChat(imageUrl);
    }
  };

  const handleAnimateImage = (imageUrl: string) => {
    // Inject the image and set a flag to force video generation
    if ((window as any).injectImageToChat) {
      (window as any).injectImageToChat(imageUrl);
      // Set a flag to force video generation
      if ((window as any).setForceVideoGeneration) {
        (window as any).setForceVideoGeneration(true);
      }
      // Add a small delay to ensure the image is injected first
      setTimeout(() => {
        if ((window as any).setChatInput) {
          // Only set a default prompt if the user hasn't already entered one
          const currentInput = (window as any).getChatInput ? (window as any).getChatInput() : '';
          if (!currentInput || currentInput.trim() === '') {
            (window as any).setChatInput("Animate this character with smooth motion");
          }
        }
      }, 200);
    }
  };

  const handleImageSelection = (selection: ImageSelection) => {
    console.log('🎯 [Timeline] Image selection completed:', selection);
    
    // Inject the cropped image into the chat interface
    if (typeof window !== 'undefined' && (window as any).injectImageToChat) {
      (window as any).injectImageToChat(selection.croppedDataUrl);
      
      // Set an intelligent prompt for AI analysis
      const analysisPrompt = "Analyze this image selection and recreate it perfectly. Focus on the visual elements, style, and composition of this specific portion.";
      if (typeof window !== 'undefined' && (window as any).setChatInput) {
        (window as any).setChatInput(analysisPrompt);
      }
      
      // Show toast notification
      toast({
        title: "Image Selection Ready",
        description: "The selected area has been injected into the chat for AI analysis. Press Generate to recreate it.",
        duration: 4000,
      });
    }
  };

  // Handle download with frame extraction for videos (matching gallery functionality)
  const handleDownload = async (url: string, title: string, type: 'image' | 'video') => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      if (type === 'video') {
        console.log('📥 [Timeline] Starting video download with frame extraction');
        await downloadVideoWithFrame(url, title);
        
        toast({
          title: "Download Complete!",
          description: `Downloaded video and last frame for "${title}"`,
        });
      } else if (type === 'image') {
        // Simple image download
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${title || 'image'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast({
          title: "Download Complete!",
          description: `Downloaded image "${title}"`,
        });
      }
    } catch (error) {
      console.error('❌ [Timeline] Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const scrollToBottom = () => {
    if (contentAreaRef.current) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (contentAreaRef.current) {
            // Scroll to the very bottom with a small buffer
            const scrollHeight = contentAreaRef.current.scrollHeight;
            const clientHeight = contentAreaRef.current.clientHeight;
            const maxScrollTop = scrollHeight - clientHeight;
            
            console.log('📜 [Timeline] Scrolling to bottom:', {
              scrollHeight,
              clientHeight,
              maxScrollTop,
              currentScrollTop: contentAreaRef.current.scrollTop
            });
            
            contentAreaRef.current.scrollTo({
              top: maxScrollTop + 50, // Add 50px buffer to ensure we see everything
              behavior: 'smooth'
            });
            
            // Fallback: ensure we're at the bottom after a short delay
            setTimeout(() => {
              if (contentAreaRef.current) {
                const currentScrollTop = contentAreaRef.current.scrollTop;
                const newScrollHeight = contentAreaRef.current.scrollHeight;
                const newMaxScrollTop = newScrollHeight - contentAreaRef.current.clientHeight;
                
                // If we're not at the bottom, scroll again
                if (currentScrollTop < newMaxScrollTop - 100) {
                  console.log('📜 [Timeline] Fallback scroll needed:', {
                    currentScrollTop,
                    newMaxScrollTop,
                    difference: newMaxScrollTop - currentScrollTop
                  });
                  
                  contentAreaRef.current.scrollTo({
                    top: newMaxScrollTop + 50,
                    behavior: 'smooth'
                  });
                }
              }
            }, 200);
          }
        });
      });
    }
  };


    const handleGenerate = async (generationData: any): Promise<any> => {
    try {
      console.log('🚀 [Timeline] ===== GENERATION START =====');
      console.log('🚀 [Timeline] Generation data received:', generationData);
      
      // Validate that generationData is not empty or null
      if (!generationData || typeof generationData !== 'object' || Object.keys(generationData).length === 0) {
        console.error('❌ [Timeline] Empty or invalid generation data received:', generationData);
        throw new Error('Generation data is missing or empty. This may be due to an error in the AI planning process. Please try with a different prompt or image.');
      }
      
      // Validate generation data before sending
      if (!generationData.model && !generationData.endpointId) {
        throw new Error('Missing model or endpointId in generation data');
      }
      
      if (!generationData.prompt && !generationData.image_url) {
        throw new Error('Missing prompt or image_url in generation data');
      }
      
      // Use the unified generation API for all FAL models
      const apiEndpoint = '/api/generate';
      
      // Clean up the generation data to ensure it has the required fields
      const cleanGenerationData = {
        model: generationData.model || generationData.endpointId,
        prompt: generationData.prompt,
        image_url: generationData.image_url,
        image_urls: generationData.image_urls,
        aspect_ratio: generationData.aspect_ratio,
        duration: generationData.duration,
        resolution: generationData.resolution,
        ...generationData // Include any other parameters
      };
      
      console.log('🔧 [Timeline] Calling unified API:', {
        url: apiEndpoint,
        method: 'POST',
        data: cleanGenerationData
      });
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanGenerationData)
      });
      
      if (!response.ok) {
        let errorMessage = `API call failed with status ${response.status}`;
        let errorType = 'unknown';
        try {
          const errorData = await response.json();
          console.error('❌ [Timeline] API error response:', errorData);
          
          // Check for content policy violations
          if (errorData.result?.error === 'Unprocessable Entity' || response.status === 422) {
            // Look for content policy violation details
            if (JSON.stringify(errorData).includes('content_policy_violation')) {
              errorType = 'content_policy';
              errorMessage = 'Content policy violation: The image or prompt contains material that cannot be processed. Please try with different content.';
            } else {
              errorType = 'validation';
              errorMessage = 'Content validation failed: Please check your image and prompt parameters.';
            }
          } else {
            errorMessage = errorData.error || errorData.message || errorData.result?.error || errorMessage;
          }
        } catch (parseError) {
          console.error('❌ [Timeline] Failed to parse error response:', parseError);
        }
        
        console.error('❌ [Timeline] Throwing error:', { errorType, errorMessage, status: response.status });
        const error = new Error(errorMessage);
        (error as any).type = errorType;
        (error as any).status = response.status;
        throw error;
      }
      
      const result = await response.json();
      console.log('📦 [Timeline] API response:', result);
      console.log('📦 [Timeline] Video data check:', {
        hasDataVideo: !!result.data?.video,
        hasDataVideos: !!result.data?.videos,
        hasVideos: !!result.videos,
        dataVideo: result.data?.video,
        dataVideos: result.data?.videos
      });
      
      // Create content object for both display and storage
      const contentToStore = {
        ...result,
        // Flatten the API response structure for easier display
        images: result.data?.images || result.images || [],
        videos: result.data?.videos || result.data?.video ? [result.data.video] : result.videos || [],
        timestamp: new Date().toISOString(),
        prompt: generationData.prompt,
        model: cleanGenerationData.model
      };
      
      console.log('📦 [Timeline] Content to store:', {
        rawResult: result,
        resultData: result.data,
        resultVideo: result.data?.video,
        resultVideos: result.data?.videos,
        images: contentToStore.images,
        videos: contentToStore.videos,
        imagesLength: contentToStore.images?.length,
        videosLength: contentToStore.videos?.length,
        firstVideo: contentToStore.videos?.[0],
        firstVideoUrl: contentToStore.videos?.[0]?.url
      });
      
      // Add to generated content for display in center panel
      setGeneratedContent(prev => [...prev, contentToStore]);
      
      // Scroll to bottom to show the new content (wait for DOM update)
      setTimeout(() => {
        scrollToBottom();
      }, 500);
      
      // Store in localStorage for gallery using contentStorage
      if (typeof window !== 'undefined') {
        const { contentStorage } = await import('@/lib/content-storage');
        const newContent = {
          id: `generated-${Date.now()}`,
          type: (contentToStore.images?.length > 0 ? 'image' : 'video') as 'image' | 'video',
          url: contentToStore.images?.[0]?.url || contentToStore.videos?.[0]?.url,
          title: contentToStore.prompt?.substring(0, 50) + '...' || 'Generated Content',
          prompt: contentToStore.prompt,
          timestamp: new Date(),
          metadata: {
            format: contentToStore.model,
            // Store additional info in a way that doesn't conflict with the interface
          }
        };
        console.log('💾 [Timeline] Adding content to storage:', {
          newContent,
          contentToStore,
          videoUrl: contentToStore.videos?.[0]?.url,
          imageUrl: contentToStore.images?.[0]?.url,
          type: newContent.type
        });
        
        contentStorage.addContent(newContent);
        
        // Trigger a custom event to notify GalleryView to refresh
        window.dispatchEvent(new CustomEvent('contentUpdated'));
      }
      
      console.log('✅ [Timeline] Generation completed successfully');
      
      // Return the result so it can be displayed in the chat
      return result;

    } catch (error) {
      console.error('❌ [Timeline] Generation error:', error);
      console.error('❌ [Timeline] Generation data that caused error:', generationData);
      throw error;
    }
  };

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex bg-neutral-950">
      {/* Left Column — Chat Interface */}
      <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-950 shrink-0">
        <SimpleChatInterface
            onContentGenerated={handleGenerate}
            onGenerationStarted={() => console.log('Generation started')}
            onGenerationComplete={() => console.log('Generation complete')}
          onImageInjected={() => console.log('Image injection ready')}
          />
        </div>

      {/* Center Column — Main Preview Area */}
      <div className="flex-1 flex flex-col bg-neutral-950">
        <div ref={contentAreaRef} className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6 h-full">

            {generatedContent.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-neutral-600 tracking-wider uppercase">Generate content to preview here</p>
              </div>
            ) : (
              generatedContent.map((content, index) => (
                <div key={index} className="bg-neutral-900 border border-neutral-800 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-100 truncate">
                      {content.prompt}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {new Date(content.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {content.images && content.images.length > 0 ? (
                    <div className="space-y-4">
                      {content.images.map((image: any, imgIndex: number) => (
                        <div key={imgIndex} className="relative group">
                          <ImageSelector
                            imageUrl={image.url}
                            onSelectionComplete={handleImageSelection}
                            className="w-full"
                          >
                            <img
                              src={image.url}
                              alt={content.prompt}
                              className="w-full h-auto max-h-[80vh] object-contain"
                            />
                          </ImageSelector>
                          <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="flex space-x-2 pointer-events-auto">
                              <button
                                onClick={() => handleEditImage(image.url)}
                                className="h-8 px-3 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleAnimateImage(image.url)}
                                className="h-8 px-3 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Animate</span>
                              </button>
                              <button
                                onClick={() => handleDownload(image.url, `image-${Date.now()}`, 'image')}
                                className="h-8 px-3 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isDownloading ? '...' : 'Save'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : content.videos && content.videos.length > 0 ? (
                    <div className="space-y-4">
                      {content.videos.map((video: any, vidIndex: number) => {
                        return (
                        <div key={vidIndex} className="relative group">
                          <video
                            src={video.url}
                            controls
                            className="w-full h-auto max-h-[80vh] object-contain"
                            preload="metadata"
                            playsInline
                          />
                          <div className="absolute top-3 right-3 bg-neutral-950/70 text-neutral-100 px-3 py-1 text-xs font-medium tracking-wider backdrop-blur-sm border border-neutral-700">
                            VIDEO
                          </div>
                          <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="flex space-x-2 pointer-events-auto">
                              <button
                                onClick={() => handleEditImage(video.url)}
                                className="h-8 px-3 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDownload(video.url, `video-${Date.now()}`, 'video')}
                                className="h-8 px-3 bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isDownloading ? '...' : 'Save'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-neutral-500 text-sm">No media content generated</div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Model: {content.model}</span>
                    <div className="flex space-x-3">
                      <button className="text-neutral-500 hover:text-white text-xs tracking-wider transition-colors">
                        Share
                      </button>
                      <button className="text-neutral-500 hover:text-white text-xs tracking-wider transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column — Gallery */}
      <div className={`relative border-l border-neutral-800 flex flex-col bg-neutral-950 transition-all duration-300 ease-in-out ${
        isGalleryCollapsed ? 'w-12' : 'w-[260px]'
      }`}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-neutral-900 border border-neutral-800 px-1.5 py-3 hover:bg-neutral-800 transition-colors"
          title={isGalleryCollapsed ? 'Expand Gallery' : 'Collapse Gallery'}
        >
          <svg
            className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
              isGalleryCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {!isGalleryCollapsed && (
          <>
            <div className="px-4 py-3 border-b border-neutral-800">
              <h2 className="text-xs font-medium text-neutral-400 tracking-wider uppercase">Gallery</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GalleryView
                className="h-full"
                useLocalStorage={true}
                onItemClick={(item) => {
                  console.log('Gallery item clicked for editing:', item);
                  if (item.type === 'image') {
                    handleEditImage(item.url);
                  }
                }}
                onAnimate={(item) => {
                  console.log('Animate item:', item);
                  if (item.type === 'image') {
                    handleAnimateImage(item.url);
                  }
                }}
              />
            </div>
          </>
        )}

        {/* Gallery Tab when collapsed */}
        {isGalleryCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <div className="transform -rotate-90 text-xs font-medium text-neutral-500 tracking-wider whitespace-nowrap">
              GALLERY
            </div>
          </div>
        )}
      </div>


      <Toaster />
    </div>
  );
}

export default function TimelinePage() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingSpinner />}>
            <TimelineContent />
          </Suspense>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
} 