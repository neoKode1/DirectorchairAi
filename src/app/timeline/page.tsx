"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { SimpleChatInterface } from "@/components/simple-chat-interface";
import { GalleryView } from "@/components/gallery-view";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Download, Edit, Video, MessageSquare, X } from "lucide-react";
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function TimelineContent() {
  const [mounted, setMounted] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGalleryCollapsed, setIsGalleryCollapsed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
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


  const normalizeGeneratedContent = (result: any, generationData: any, cleanGenerationData: any) => ({
    ...result,
    images: result.data?.images || result.images || [],
    videos: result.data?.videos || (result.data?.video ? [result.data.video] : result.videos || []),
    timestamp: new Date().toISOString(),
    prompt: generationData.prompt,
    model: cleanGenerationData.model,
  });

  const storeCompletedContent = async (contentToStore: any) => {
    if (typeof window === 'undefined') return;
    const mediaUrl = contentToStore.images?.[0]?.url || contentToStore.videos?.[0]?.url;
    if (!mediaUrl) return;

    const { contentStorage } = await import('@/lib/content-storage');
    contentStorage.addContent({
      id: `generated-${Date.now()}`,
      type: (contentToStore.images?.length > 0 ? 'image' : 'video') as 'image' | 'video',
      url: mediaUrl,
      title: contentToStore.prompt?.substring(0, 50) + '...' || 'Generated Content',
      prompt: contentToStore.prompt,
      timestamp: new Date(),
      metadata: { format: contentToStore.model },
    });
    window.dispatchEvent(new CustomEvent('contentUpdated'));
  };

  const pollQueuedGeneration = async (queuedContentId: string, requestId: string, model: string, prompt: string) => {
    const maxAttempts = 240; // 20 minutes at 5s intervals
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 2500 : 5000));

      const response = await fetch(`/api/generate/status?model=${encodeURIComponent(model)}&requestId=${encodeURIComponent(requestId)}`);
      const statusResult = await response.json().catch(() => null);
      if (!response.ok || !statusResult) {
        throw new Error(statusResult?.error || `Queue status failed with ${response.status}`);
      }

      if (statusResult.status !== 'COMPLETED') {
        setGeneratedContent(prev => prev.map(content =>
          content.id === queuedContentId ? { ...content, status: statusResult.status || 'IN_PROGRESS' } : content
        ));
        continue;
      }

      const completedContent = normalizeGeneratedContent(statusResult, { prompt }, { model });
      const finalContent = {
        ...completedContent,
        id: queuedContentId,
        queued: true,
        status: 'COMPLETED',
        requestId,
      };

      setGeneratedContent(prev => prev.map(content =>
        content.id === queuedContentId ? finalContent : content
      ));
      await storeCompletedContent(finalContent);
      setTimeout(() => scrollToBottom(), 500);
      return;
    }
    throw new Error('Queued generation timed out while polling. It may still complete in Fal history.');
  };

  const handleGenerate = async (generationData: any): Promise<any> => {
    try {
      
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
      
      const response = await fetch('/api/generate/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanGenerationData)
      });
      
      // Check for auth redirects (307 → HTML login page) or non-JSON responses
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && !contentType.includes('application/json')) {
        throw new Error('Session expired. Please refresh the page and sign in again.');
      }

      if (!response.ok) {
        let errorMessage = `API call failed with status ${response.status}`;
        let errorType = 'unknown';

        // Handle 413 specifically — the response is usually HTML, not JSON
        if (response.status === 413) {
          errorType = 'payload_too_large';
          errorMessage = 'Image is too large. Please try a smaller image or let the system compress it automatically.';
          console.error('❌ [Timeline] 413 Payload Too Large — image data exceeds server limit');
        } else {
          try {
            const errorData = await response.json();
            console.error('❌ [Timeline] API error response:', errorData);

            // Check for content policy violations
            if (errorData.result?.error === 'Unprocessable Entity' || response.status === 422) {
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
            // Response wasn't JSON (e.g. HTML error page from proxy)
            console.error('❌ [Timeline] Failed to parse error response:', parseError);
          }
        }
        
        console.error('❌ [Timeline] Throwing error:', { errorType, errorMessage, status: response.status });
        const error = new Error(errorMessage);
        (error as any).type = errorType;
        (error as any).status = response.status;
        throw error;
      }
      
      const result = await response.json();

      if (result.queued && result.requestId) {
        const queuedContentId = `queued-${result.requestId}`;
        const queuedContent = {
          id: queuedContentId,
          queued: true,
          status: result.status || 'IN_QUEUE',
          requestId: result.requestId,
          images: [],
          videos: [],
          timestamp: new Date().toISOString(),
          prompt: generationData.prompt,
          model: cleanGenerationData.model,
        };

        setGeneratedContent(prev => [...prev, queuedContent]);
        setTimeout(() => scrollToBottom(), 250);

        pollQueuedGeneration(queuedContentId, result.requestId, cleanGenerationData.model, generationData.prompt)
          .catch(error => {
            console.error('❌ [Timeline] Queue polling failed:', error);
            setGeneratedContent(prev => prev.map(content =>
              content.id === queuedContentId
                ? { ...content, status: 'FAILED', error: error instanceof Error ? error.message : 'Queue polling failed' }
                : content
            ));
            toast({
              title: 'Generation Failed',
              description: error instanceof Error ? error.message : 'Queue polling failed',
              variant: 'destructive',
            });
          });

        return result;
      }

      const contentToStore = normalizeGeneratedContent(result, generationData, cleanGenerationData);
      setGeneratedContent(prev => [...prev, contentToStore]);
      setTimeout(() => scrollToBottom(), 500);
      await storeCompletedContent(contentToStore);
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
    <div className="h-[calc(100vh-72px)] flex bg-background overflow-hidden max-w-[100vw]">
      {/* Left Column — Chat Interface */}
      <div className="hidden md:flex w-80 border-r border-border flex-col bg-background shrink-0 max-h-full overflow-hidden">
        <SimpleChatInterface
            onContentGenerated={handleGenerate}
            onGenerationStarted={() => {}}
            onGenerationComplete={() => {}}
          onImageInjected={() => {}}
          />
        </div>

      {/* Center Column — Main Preview Area */}
      <div className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
        <div ref={contentAreaRef} className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="space-y-6 h-full">

            {generatedContent.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Generate content to preview here</p>
              </div>
            ) : (
              generatedContent.map((content, index) => (
                <div key={index} className="bg-card border border-border p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {content.prompt}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(content.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {content.queued && content.status !== 'COMPLETED' ? (
                    <div className="border border-dashed border-border bg-card/60 p-6 text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {content.status === 'FAILED' ? 'Generation failed' : 'Queued generation running'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {content.status === 'FAILED'
                          ? content.error || 'Fal returned a failed status.'
                          : `${content.status || 'IN_QUEUE'} · Request ${content.requestId}`}
                      </p>
                    </div>
                  ) : content.images && content.images.length > 0 ? (
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
                          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="flex space-x-2 pointer-events-auto">
                              <button
                                onClick={() => handleEditImage(image.url)}
                                className="h-8 px-3 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleAnimateImage(image.url)}
                                className="h-8 px-3 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Animate</span>
                              </button>
                              <button
                                onClick={() => handleDownload(image.url, `image-${Date.now()}`, 'image')}
                                className="h-8 px-3 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
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
                          <div className="absolute top-3 right-3 bg-background/70 text-foreground px-3 py-1 text-xs font-medium tracking-wider backdrop-blur-sm border border-border">
                            VIDEO
                          </div>
                          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="flex space-x-2 pointer-events-auto">
                              <button
                                onClick={() => handleEditImage(video.url)}
                                className="h-8 px-3 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
                                disabled={isDownloading}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDownload(video.url, `video-${Date.now()}`, 'video')}
                                className="h-8 px-3 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200 text-xs tracking-wider"
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
                    <div className="text-muted-foreground text-sm">No media content generated</div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Model: {content.model}</span>
                    <div className="flex space-x-3">
                      <button className="text-muted-foreground hover:text-foreground text-xs tracking-wider transition-colors">
                        Share
                      </button>
                      <button className="text-muted-foreground hover:text-foreground text-xs tracking-wider transition-colors">
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
      <div className={`hidden md:flex relative border-l border-border flex-col bg-background transition-all duration-300 ease-in-out shrink-0 ${
        isGalleryCollapsed ? 'w-12' : 'w-[260px]'
      }`}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsGalleryCollapsed(!isGalleryCollapsed)}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-card border border-border px-1.5 py-3 hover:bg-secondary transition-colors"
          title={isGalleryCollapsed ? 'Expand Gallery' : 'Collapse Gallery'}
        >
          <svg
            className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
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
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Gallery</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GalleryView
                className="h-full"
                useLocalStorage={true}
                onItemClick={(item) => {
                  if (item.type === 'image') {
                    handleEditImage(item.url);
                  }
                }}
                onAnimate={(item) => {
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
            <div className="transform -rotate-90 text-xs font-medium text-muted-foreground tracking-wider whitespace-nowrap">
              GALLERY
            </div>
          </div>
        )}
      </div>


      {/* Mobile Chat Toggle Button */}
      <button
        onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/80 transition-colors"
        aria-label="Toggle chat"
      >
        {isMobileChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Mobile Chat Overlay */}
      {isMobileChatOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-background">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-xs text-muted-foreground tracking-wider uppercase">Chat</span>
            <button onClick={() => setIsMobileChatOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SimpleChatInterface
              onContentGenerated={async (content) => { await handleGenerate(content); setIsMobileChatOpen(false); }}
              onGenerationStarted={() => {}}
              onGenerationComplete={() => {}}
              onImageInjected={() => {}}
            />
          </div>
        </div>
      )}

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