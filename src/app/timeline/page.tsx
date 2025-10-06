"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { SimpleChatInterface } from "@/components/simple-chat-interface";
import { GalleryView } from "@/components/gallery-view";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function TimelineContent() {
  const [mounted, setMounted] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);

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
    // Inject the image and automatically add an animation prompt
    if ((window as any).injectImageToChat) {
      (window as any).injectImageToChat(imageUrl);
      // Add a small delay to ensure the image is injected first
      setTimeout(() => {
        if ((window as any).setChatInput) {
          (window as any).setChatInput("Animate this character with smooth motion");
        }
      }, 200);
    }
  };

  const scrollToBottom = () => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({
        top: contentAreaRef.current.scrollHeight,
        behavior: 'smooth'
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
        images: contentToStore.images,
        videos: contentToStore.videos,
        imagesLength: contentToStore.images?.length,
        videosLength: contentToStore.videos?.length
      });
      
      // Add to generated content for display in center panel
      setGeneratedContent(prev => [...prev, contentToStore]);
      
      // Scroll to bottom to show the new content
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
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
    <div className="h-screen flex bg-white">
      {/* Left Column - Chat Interface (Yellow section from screenshot) */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <SimpleChatInterface 
          onContentGenerated={handleGenerate}
          onGenerationStarted={() => console.log('Generation started')}
          onGenerationComplete={() => console.log('Generation complete')}
          onImageInjected={() => console.log('Image injection ready')}
        />
      </div>

      {/* Center Column - Dynamic Content Display (Green section from screenshot) */}
      <div className="flex-1 flex flex-col">
        <div ref={contentAreaRef} className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {generatedContent.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-500">Start a conversation to generate content</p>
                </div>
              </div>
            ) : (
              generatedContent.map((content, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {content.prompt}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(content.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {content.images && content.images.length > 0 ? (
                    <div className="space-y-4">
                      {content.images.map((image: any, imgIndex: number) => (
                        <div key={imgIndex} className="relative group">
                          <img 
                            src={image.url} 
                            alt={content.prompt}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-3">
                              <button 
                                onClick={() => handleEditImage(image.url)}
                                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-lg"
                              >
                                Edit
                              </button>
                              <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-lg">
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : content.videos && content.videos.length > 0 ? (
                    <div className="space-y-4">
                      {content.videos.map((video: any, vidIndex: number) => (
                        <div key={vidIndex} className="relative group">
                          <video 
                            src={video.url} 
                            controls
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
                          />
                          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                            Video
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-3">
                              <button 
                                onClick={() => handleEditImage(video.url)}
                                className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-lg"
                              >
                                Edit
                              </button>
                              <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-lg">
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No media content generated</div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Model: {content.model}</span>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600 text-sm">
                        Share
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 text-sm">
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

      {/* Right Column - Gallery (Reference section from screenshot) */}
      <div className={`relative border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isGalleryCollapsed ? 'w-12' : 'w-64'
      }`}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-l-lg px-2 py-4 shadow-sm hover:shadow-md transition-shadow"
          title={isGalleryCollapsed ? 'Expand Gallery' : 'Collapse Gallery'}
        >
          <svg 
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
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
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-900">Gallery</h2>
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
            <div className="transform -rotate-90 text-xs font-medium text-gray-500 whitespace-nowrap">
              Gallery
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