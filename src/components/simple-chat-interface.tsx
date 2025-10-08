"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EnhancedLoadingModal } from '@/components/enhanced-loading-modal';
import { 
  Send, 
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  RefreshCw,
  Shuffle,
  FileImage,
  CloudUpload,
  Settings,
  Monitor
} from 'lucide-react';
import { contentStorage } from '@/lib/content-storage';
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-compression';
import { processFile, validateFile, formatFileSize as formatFileSizeUtil } from '@/lib/file-processing';

interface SimpleChatInterfaceProps {
  onContentGenerated: (generationData: any) => Promise<any>;
  onGenerationStarted?: () => void;
  onGenerationComplete?: () => void;
  onImageInjected?: (imageUrl: string) => void;
}

export const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({
  onContentGenerated,
  onGenerationStarted,
  onGenerationComplete,
  onImageInjected
}) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    media?: {
      type: 'image' | 'video' | 'audio';
      url: string;
      filename?: string;
    };
    suggestions?: string[];
  }>>([]);
  
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingSuggestions, setFloatingSuggestions] = useState<string[]>([]);
  const [showFloatingDialog, setShowFloatingDialog] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [duration, setDuration] = useState(4);
  const [preferredVideoModel, setPreferredVideoModel] = useState<string>('fal-ai/nano-banana/edit');
  const [forceVideoGeneration, setForceVideoGeneration] = useState<boolean>(false);
  const [userIntent, setUserIntent] = useState<'image' | 'video' | 'auto'>('image');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get model icon
  const getModelIcon = (model: string) => {
    if (model.includes('sora')) return '/openai.svg'; // Use OpenAI icon for Sora
    if (model.includes('nano-banana')) return '/gemini-color.svg';
    if (model.includes('flux')) return '/flux.svg';
    if (model.includes('kling')) return '/kling-color.svg';
    if (model.includes('minimax')) return '/minimax-color.svg';
    if (model.includes('seedream') || model.includes('bytedance')) return '/bytedance-color.svg';
    if (model.includes('hunyuan')) return '/bytedance-color.svg'; // Using ByteDance icon for Hunyuan
    if (model.includes('wan-pro') || model.includes('wan/v2.2-a14b') || model.includes('wan-25-preview')) return '/alibaba-color.svg'; // Using Alibaba icon for Wan models
    if (model.includes('veo3')) return '/Gen4.png'; // Using Gen4 for Veo 3
    if (model.includes('ovi')) return '/Gen4.png'; // Using Gen4 for Ovi
    if (model.includes('kling') && model.includes('avatar')) return '/kling-color.svg'; // Using Kling icon for AI Avatar
    if (model.includes('luma')) return '/dreammachine.svg'; // Using Dream Machine SVG for Luma
    if (model.includes('imagen')) return '/Gen4.png';
    if (model.includes('photon')) return '/ideogram.svg';
    if (model.includes('recraft')) return '/ideogram.svg';
    return '/gemini-color.svg'; // Default fallback
  };

  // Helper function to get supported durations for each model
  const getSupportedDurations = (model: string) => {
    if (model.includes('sora-2')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 8, label: '8 seconds' },
        { value: 12, label: '12 seconds' }
      ];
    }
    if (model.includes('veo3')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 8, label: '8 seconds' },
        { value: 12, label: '12 seconds' }
      ];
    }
    if (model.includes('kling')) {
      if (model.includes('v2.5-turbo')) {
        return [
          { value: 5, label: '5 seconds' },
          { value: 10, label: '10 seconds' }
        ];
      }
      return [
        { value: 5, label: '5 seconds' },
        { value: 10, label: '10 seconds' }
      ];
    }
    if (model.includes('minimax')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 6, label: '6 seconds' },
        { value: 8, label: '8 seconds' }
      ];
    }
    if (model.includes('hunyuan')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 6, label: '6 seconds' },
        { value: 8, label: '8 seconds' }
      ];
    }
    if (model.includes('wan-pro')) {
      return [
        { value: 6, label: '6 seconds' }
      ];
    }
    if (model.includes('ovi')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 6, label: '6 seconds' },
        { value: 8, label: '8 seconds' }
      ];
    }
    if (model.includes('luma')) {
      return [
        { value: 5, label: '5 seconds' },
        { value: 9, label: '9 seconds' }
      ];
    }
    if (model.includes('wan-25-preview')) {
      return [
        { value: 5, label: '5 seconds' },
        { value: 10, label: '10 seconds' }
      ];
    }
    // Default for image models or unknown models
    return [
      { value: 4, label: '4 seconds' },
      { value: 6, label: '6 seconds' },
      { value: 8, label: '8 seconds' }
    ];
  };

  // Helper function to check if model supports duration
  const isVideoModel = (model: string) => {
    return model.includes('video') || 
           model.includes('sora') || 
           model.includes('veo') || 
           model.includes('kling') || 
           model.includes('minimax') || 
           model.includes('luma');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('directorchair-chat-messages');
    const savedLastImage = localStorage.getItem('directorchair-last-generated-image');
    const savedSettings = localStorage.getItem('directorchair-settings');
    
    // Skip loading messages from localStorage to prevent quota exceeded errors
    // Messages will start fresh on each page load
    console.log('📝 [Chat] Starting with empty message history to prevent localStorage quota issues');
    
    // Clear any existing messages on page load to ensure fresh start
    setMessages([]);
    
    if (savedLastImage) {
      setLastGeneratedImage(savedLastImage);
    }
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAspectRatio(settings.aspectRatio || '16:9');
        setResolution(settings.resolution || '1080p');
        setDuration(settings.duration || 4);
        setPreferredVideoModel(settings.preferredVideoModel || 'fal-ai/nano-banana/edit');
        setUserIntent(settings.userIntent || 'image');
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Auto-cleanup old messages to prevent localStorage quota exceeded errors
  useEffect(() => {
    if (messages.length > 25) {
      // Keep only the last 25 messages to prevent quota exceeded
      const messagesToKeep = messages.slice(-25);
      setMessages(messagesToKeep);
      console.log(`🧹 [Chat] Cleaned up old messages, kept last ${messagesToKeep.length} messages`);
    }
  }, [messages.length]);

  // Additional cleanup for messages with images (they take up the most space)
  useEffect(() => {
    const messagesWithImages = messages.filter(msg => msg.media && msg.media.url);
    if (messagesWithImages.length > 10) {
      // If we have more than 10 messages with images, remove the oldest ones
      const messagesWithoutOldImages = messages.filter((msg, index) => {
        if (msg.media && msg.media.url) {
          // Keep only the last 10 messages with images
          const imageMessageIndex = messagesWithImages.findIndex(imgMsg => imgMsg.id === msg.id);
          return imageMessageIndex >= messagesWithImages.length - 10;
        }
        return true; // Keep all messages without images
      });
      setMessages(messagesWithoutOldImages);
      console.log(`🧹 [Chat] Cleaned up old messages with images, kept last 10 image messages`);
    }
  }, [messages]);

  // Disable localStorage saving for messages to prevent quota exceeded errors
  // Messages will be lost on page refresh, but this prevents the app from breaking
  useEffect(() => {
    // Only save a minimal message count for debugging purposes
    if (messages.length > 0) {
      try {
        const messageCount = messages.length;
        localStorage.setItem('directorchair-message-count', messageCount.toString());
      } catch (error) {
        console.error('Error saving message count to localStorage:', error);
      }
    }
  }, [messages]);

  // Save last generated image to localStorage whenever it changes
  useEffect(() => {
    if (lastGeneratedImage) {
      try {
        localStorage.setItem('directorchair-last-generated-image', lastGeneratedImage);
      } catch (error) {
        console.error('Error saving last generated image to localStorage:', error);
      }
    }
  }, [lastGeneratedImage]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settings = {
        aspectRatio,
        resolution,
        duration,
        preferredVideoModel,
        userIntent
      };
      localStorage.setItem('directorchair-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [aspectRatio, resolution, duration, preferredVideoModel, userIntent]);

  // Event listener for model selection changes
  const handleModelSelectionChange = (newModel: string) => {
    console.log('🎯 [Chat] Model selection changed:', { from: preferredVideoModel, to: newModel });
    
    // Update the preferred model
    setPreferredVideoModel(newModel);
    
    // Set user intent based on model selection
    if (isVideoModel(newModel)) {
      setUserIntent('video'); // User explicitly wants video
      console.log('🎯 [Chat] Intent set to VIDEO - user selected video model');
      
      // Adjust duration to a valid value for the new model
      const supportedDurations = getSupportedDurations(newModel);
      const currentDurationValid = supportedDurations.some(d => d.value === duration);
      
      if (!currentDurationValid) {
        // Set to the first available duration for the new model
        const newDuration = supportedDurations[0].value;
        console.log(`🎯 [Chat] Adjusting duration from ${duration}s to ${newDuration}s for ${newModel}`);
        setDuration(newDuration);
      }
    } else {
      setUserIntent('image'); // User explicitly wants image (default behavior)
      console.log('🎯 [Chat] Intent set to IMAGE - user selected image model');
    }
  };


  const processFiles = useCallback(async (files: FileList) => {
    setIsProcessingImages(true);
    setIsProcessingAudio(true);
    
    try {
      for (const file of Array.from(files)) {
        try {
          // Validate the file first
          const validation = validateFile(file);
          if (!validation.isValid) {
            console.error('❌ [Chat] File validation failed:', validation.error);
            alert(`File upload failed: ${validation.error}`);
            continue;
          }

          console.log(`📁 [Chat] Processing ${validation.fileType}: ${file.name} (${formatFileSizeUtil(file.size)})`);
          
          // Process the file (image or audio)
          const result = await processFile(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            maxSizeKB: 1024, // 1MB limit for images
            maxAudioSizeKB: 5120 // 5MB limit for audio
          });

          console.log(`✅ [Chat] ${validation.fileType} processed: ${formatFileSizeUtil(result.originalSize)} → ${formatFileSizeUtil(result.processedSize)} (${result.compressionRatio.toFixed(2)}x compression)`);
          
          // Add to appropriate state based on file type
          if (result.fileType === 'image') {
            setUploadedImages(prev => [...prev, result.processedDataUrl]);
          } else if (result.fileType === 'audio') {
            setUploadedAudio(result.processedDataUrl);
          }
          
        } catch (error) {
          console.error('❌ [Chat] File processing failed:', error);
          alert(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } finally {
      setIsProcessingImages(false);
      setIsProcessingAudio(false);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    processFiles(files);
  }, [processFiles]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearChatHistory = () => {
    setMessages([]);
    setLastGeneratedImage(null);
    try {
      // Clear all DirectorChair-related localStorage items
      localStorage.removeItem('directorchair-chat-messages');
      localStorage.removeItem('directorchair-last-generated-image');
      localStorage.removeItem('directorchair-settings');
      // Also clear any content gallery items that might be taking up space
      localStorage.removeItem('directorchair-content-gallery');
      console.log('✅ [Chat] Chat history and localStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Utility function to handle localStorage quota exceeded
  const handleStorageQuotaExceeded = () => {
    console.warn('⚠️ [Chat] localStorage quota exceeded, clearing old data...');
    try {
      // Clear all DirectorChair localStorage items
      localStorage.removeItem('directorchair-chat-messages');
      localStorage.removeItem('directorchair-last-generated-image');
      localStorage.removeItem('directorchair-content-gallery');
      // Keep settings as they're small
      console.log('✅ [Chat] localStorage cleared due to quota exceeded');
      
      // Also clear the current messages state to prevent immediate re-saving
      setMessages([]);
    } catch (error) {
      console.error('Error clearing localStorage after quota exceeded:', error);
    }
  };

  const injectImage = (imageUrl: string) => {
    console.log('🖼️ [Chat] Injecting image:', imageUrl);
    setUploadedImages([imageUrl]);
    // Scroll to bottom to show the injected image
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Expose injectImage function and setChatInput to parent component
  useEffect(() => {
    if (onImageInjected) {
      // Store the injectImage function in a way that parent can access it
      (window as any).injectImageToChat = injectImage;
      // Store the setUserInput function for setting chat input
      (window as any).setChatInput = setUserInput;
      // Store the getChatInput function for getting current input
      (window as any).getChatInput = () => userInput;
      // Store the setForceVideoGeneration function for forcing video generation
      (window as any).setForceVideoGeneration = setForceVideoGeneration;
    }
  }, [onImageInjected, userInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && uploadedImages.length === 0) return;

    // Validate Kling AI Avatar requirements
    if (preferredVideoModel === 'fal-ai/kling-video/v1/pro/ai-avatar') {
      if (uploadedImages.length === 0) {
        alert('Please upload an image for the AI Avatar.');
        return;
      }
      if (!uploadedAudio) {
        alert('Please upload an audio file for the AI Avatar.');
        return;
      }
    }

    // Detect if user wants video generation based on keywords (very specific to avoid false positives)
    const videoKeywords = [
      // Explicit video/animation terms
      'animate', 'animation', 'video', 'motion', 'cinematic', 'film', 'movie',
      
      // Specific camera movements and shots (only when explicitly mentioned)
      'tracking dolly shot', 'dolly shot', 'dolly in', 'dolly out', 'push in', 'pull out',
      'low-angle shot', 'low angle shot', 'low-angle tracking', 'low angle tracking',
      'high-angle shot', 'high angle shot', 'high-angle tracking', 'high angle tracking',
      'pedestal up shot', 'pedestal upshot', 'pedestal up', 'pedestal down shot', 'pedestal down',
      'pan right shot', 'pan right', 'panning right', 'pan to right',
      'pan left shot', 'pan left', 'panning left', 'pan to left',
      'tilt up shot', 'tilt up', 'tilting up', 'tilt to up',
      'tilt down shot', 'tilt down', 'tilting down', 'tilt to down',
      'zoom in shot', 'zoom in', 'zooming in', 'zoom into',
      'zoom out shot', 'zoom out', 'zooming out', 'zoom away',
      'crane shot', 'crane up', 'crane down', 'crane movement',
      'handheld shot', 'handheld', 'shaky cam', 'shaky camera',
      'steady cam', 'steadicam',
      'close-up shot', 'close up shot', 'establishing shot',
      'wide shot', 'wide angle shot', 'medium shot', 'medium close-up', 'medium close up',
      'over-the-shoulder shot', 'over the shoulder shot', 'over shoulder',
      'point of view shot', 'pov shot', 'first person shot',
      'bird\'s eye view', 'birds eye view', 'aerial shot', 'top down',
      'worm\'s eye view', 'worms eye view', 'ground level',
      
      // Advanced camera techniques
      'rack focus', 'focus pull', 'shallow depth of field', 'bokeh',
      'slow motion', 'slow-mo', 'time-lapse', 'fast motion',
      'freeze frame', 'bullet time', 'matrix effect',
      
      // Video-specific transitions and effects
      'fade in', 'fade out', 'crossfade', 'dissolve', 'wipe',
      'action sequence', 'streaming', 'playing', 'looping',
      
      // File formats and playback
      'gif', 'mp4', 'mov', 'avi', 'playback', 'replay', 'preview', 'trailer',
      'duration', 'seconds', 'minutes', 'timeline', 'sequence'
    ];
    
    // Special trigger words that force video generation (image-to-video only)
    const videoTriggers = [
      'make video', 'create video', 'generate video', 'video of', 
      'animate this', 'make it move', 'animate the image', 'bring to life',
      'animate this image', 'make this move', 'bring this to life',
      'create animation', 'make animation', 'generate animation',
      'turn into video', 'convert to video', 'make a video',
      'animate with', 'animate using', 'animate the character', 'animate this character',
      'make the character', 'bring the character', 'animate the scene',
      // Cinematic shot triggers
      'tracking dolly shot', 'low-angle tracking dolly shot', 'low-angle shot',
      'tracking shot', 'pull out shot', 'push in shot', 'pedestal up shot',
      'pedestal down shot', 'pan right shot', 'pan left shot'
    ];
    
    const hasVideoTrigger = videoTriggers.some(trigger => 
      userInput.toLowerCase().includes(trigger)
    );
    
    const matchedVideoKeywords = videoKeywords.filter(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
    const hasVideoKeywords = matchedVideoKeywords.length > 0;
    
    // Determine if user wants video based on intent
    let wantsVideo = false;
    
    if (userIntent === 'video') {
      // User explicitly selected a video model - always generate video
      wantsVideo = true;
      console.log('🎬 [Chat] Video generation forced by user intent (video model selected)');
    } else {
      // User selected an image model (default) - always generate images
      wantsVideo = false;
      console.log('🎬 [Chat] Image generation forced by user intent (image model selected)');
    }
    
    console.log('🎬 [Chat] Intent-based video detection:', {
      userInput: userInput.toLowerCase(),
      userIntent,
      hasVideoTrigger,
      hasVideoKeywords,
      matchedVideoKeywords,
      wantsVideo,
      preferredVideoModel,
      forceVideoGeneration,
      videoTriggers: videoTriggers.filter(trigger => userInput.toLowerCase().includes(trigger))
    });

    // Detect if user is referencing a previously generated image or injected image
    const imageReferenceKeywords = ['that character', 'that image', 'this character', 'this image', 'the character', 'the image', 'behind that', 'over the shoulder', 'close-up', 'detail shot', 'low-angle', 'different angle', 'another angle', 'variation', 'edit this', 'modify this', 'generate video', 'create video', 'animate', 'make video'];
    const isReferencingPreviousImage = imageReferenceKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    ) && (lastGeneratedImage || uploadedImages.length > 0);

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: userInput.trim(),
      timestamp: new Date(),
      media: uploadedImages.length > 0 ? {
        type: 'image' as const,
        url: uploadedImages[0],
        filename: 'uploaded-image'
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    
    setUserInput('');
    setUploadedImages([]);
    setIsGenerating(true);
    onGenerationStarted?.();

    try {
      // Prepare generation data with proper defaults
      let model: string;
      let imageToUse: string | undefined;
      let imagesToUse: string[] | undefined;

      // Determine which image to use (uploaded/injected or referenced)
      console.log('🖼️ [Chat] Uploaded images state:', uploadedImages);
      console.log('🖼️ [Chat] Last generated image:', lastGeneratedImage);
      console.log('🖼️ [Chat] Is referencing previous image:', isReferencingPreviousImage);
      
      if (uploadedImages.length > 0) {
        // Priority 1: Use injected/uploaded images
        imageToUse = uploadedImages[0];
        imagesToUse = uploadedImages;
        console.log('🖼️ [Chat] Using uploaded/injected image:', imageToUse);
      } else if (isReferencingPreviousImage && lastGeneratedImage) {
        // Priority 2: Use last generated image when referencing
        imageToUse = lastGeneratedImage;
        imagesToUse = [lastGeneratedImage];
        console.log('🖼️ [Chat] Using last generated image:', imageToUse);
      }

      // Use the selected model directly
      model = preferredVideoModel;
      console.log('🎯 [Chat] Using selected model:', model);

      const generationData = {
        model,
        prompt: userInput.trim(),
        image_url: imageToUse,
        image_urls: imagesToUse,
        aspect_ratio: aspectRatio,
        // Add audio_url for Kling AI Avatar
        ...(model === 'fal-ai/kling-video/v1/pro/ai-avatar' && uploadedAudio && {
          audio_url: uploadedAudio
        }),
        // Add required video parameters for video models
        ...(wantsVideo && {
          duration: model.includes('sora-2') ? 4 : '5s', // Sora 2 expects number, others expect string
          resolution: model.includes('sora-2') ? 'auto' : resolution // Sora 2 defaults to 'auto'
        })
      };

      // Set the current model for the spinning icon
      setCurrentModel(model);

      console.log('🎯 [Chat] Final model selection:', {
        selectedModel: model,
        wantsVideo,
        preferredVideoModel,
        hasImage: !!imageToUse
      });

      console.log('🎯 [Chat] Final generation data:', {
        ...generationData,
        hasImage: !!imageToUse,
        imageUrl: imageToUse,
        imagesCount: imagesToUse?.length || 0
      });

      console.log('🎯 [Chat] Generation data being sent:', {
        model,
        aspect_ratio: aspectRatio,
        resolution: resolution,
        duration: duration,
        wantsVideo,
        preferredVideoModel,
        allSettings: { aspectRatio, resolution, duration, preferredVideoModel },
        userAspectRatio: aspectRatio,
        userResolution: resolution,
        detectionReason: hasVideoTrigger ? 'explicit trigger' : hasVideoKeywords ? 'video keywords' : 'default image',
        userInput: userInput,
        hasVideoTrigger,
        hasVideoKeywords,
        videoKeywords: videoKeywords.filter(keyword => userInput.toLowerCase().includes(keyword))
      });

      // Call the generation API directly
      try {
        const result = await onContentGenerated(generationData);
        console.log('✅ [Chat] Generation completed successfully:', result);
        
        // Add success message to chat
        const successMessage = {
          id: (Date.now() + 0.5).toString(),
          type: 'assistant' as const,
          content: wantsVideo 
            ? `✅ Video generated successfully! Check the center panel and gallery.`
            : `✅ Image generated successfully! Check the center panel and gallery.`,
          timestamp: new Date()
        };
        setMessages(prev => prev.slice(0, -1).concat([successMessage]));
        
        // Reset force video generation flag
        setForceVideoGeneration(false);
        
        // Track the last generated image for future references
        if (result?.data?.images?.[0]) {
          setLastGeneratedImage(result.data.images[0].url);
          
          // Show floating suggestions for images (image-to-video workflow)
          showFloatingSuggestions([
            "Animate this character walking",
            "Make video of this character dancing", 
            "Bring this character to life",
            "Animate the image with motion",
            "Create a cinematic video of this character"
          ]);
        }

        // Save to gallery storage
        if (typeof window !== 'undefined') {
          try {
            // Debug: Log the full result to see what we're getting
            console.log('🔍 [Chat] Full generation result:', {
              hasVideos: !!result?.data?.videos,
              videosCount: result?.data?.videos?.length || 0,
              hasImages: !!result?.data?.images,
              imagesCount: result?.data?.images?.length || 0,
              videos: result?.data?.videos,
              images: result?.data?.images
            });

            const contentToStore = {
              id: `generated-${Date.now()}`,
              type: (result?.data?.videos?.length > 0 ? 'video' : 'image') as 'image' | 'video',
              url: result?.data?.videos?.[0]?.url || result?.data?.images?.[0]?.url,
              title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
              prompt: userInput,
              timestamp: new Date(),
                  metadata: {
                    format: generationData.model,
                    duration: typeof generationData.duration === 'number' ? generationData.duration : 4,
                    aspect_ratio: generationData.aspect_ratio,
                    resolution: generationData.resolution
                  }
            };

            console.log('💾 [Chat] Adding content to gallery storage:', contentToStore);
            console.log('💾 [Chat] Current gallery items before add:', contentStorage.loadContent().length);
            contentStorage.addContent(contentToStore);
            console.log('💾 [Chat] Current gallery items after add:', contentStorage.loadContent().length);
            
            // Trigger a custom event to notify GalleryView to refresh
            window.dispatchEvent(new CustomEvent('contentUpdated'));
          } catch (error) {
            console.error('❌ [Chat] Failed to save to gallery storage:', error);
          }
        }
        
        onGenerationComplete?.();
        
      } catch (error: any) {
        // If we get a content policy violation with Nano Banana Edit, try Seedream 4.0 Edit as fallback
        if (error.message?.includes('content policy') && 
            error.message?.includes('violation') && 
            generationData.model === 'fal-ai/nano-banana/edit' &&
            imageToUse) {
          
          console.log('🔄 [Chat] Content policy violation detected, trying Seedream 4.0 Edit as fallback...');
          
          // Retry with Seedream 4.0 Edit
          const fallbackGenerationData = {
            ...generationData,
            model: 'fal-ai/bytedance/seedream/v4/edit'
          };
          
          // Set image_size to auto for Seedream 4.0 Edit (maintains input aspect ratio)
          (fallbackGenerationData as any).image_size = "auto";
          delete (fallbackGenerationData as any).aspect_ratio; // Remove aspect_ratio as Seedream uses image_size
          console.log('🔄 [Chat] Set image_size to auto for Seedream queue fallback');
          
          try {
            const result = await onContentGenerated(fallbackGenerationData);
            console.log('✅ [Chat] Fallback generation completed successfully:', result);
            
            const successMessage = {
              id: (Date.now() + 0.5).toString(),
              type: 'assistant' as const,
              content: `✅ Image generated successfully (using fallback model)! Check the center panel and gallery.`,
              timestamp: new Date()
            };
            setMessages(prev => prev.slice(0, -1).concat([successMessage]));
            
            // Reset force video generation flag
            setForceVideoGeneration(false);
            
            // Track the last generated image for future references
            if (result?.data?.images?.[0]) {
              setLastGeneratedImage(result.data.images[0].url);
              
              // Show floating suggestions for images (image-to-video workflow)
              showFloatingSuggestions([
                "Animate this character walking",
                "Make video of this character dancing", 
                "Bring this character to life",
                "Animate the image with motion",
                "Create a cinematic video of this character"
              ]);
            }

            // Save to gallery storage (fallback generation)
            if (typeof window !== 'undefined') {
              try {
                const contentToStore = {
                  id: `generated-fallback-${Date.now()}`,
                  type: (result?.data?.videos?.length > 0 ? 'video' : 'image') as 'image' | 'video',
                  url: result?.data?.videos?.[0]?.url || result?.data?.images?.[0]?.url,
                  title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
                  prompt: userInput,
                  timestamp: new Date(),
                  metadata: {
                    format: fallbackGenerationData.model,
                    duration: typeof fallbackGenerationData.duration === 'number' ? fallbackGenerationData.duration : 4,
                    aspect_ratio: fallbackGenerationData.aspect_ratio,
                    resolution: fallbackGenerationData.resolution,
                    fallback: true
                  }
                };

                console.log('💾 [Chat] Adding fallback content to gallery storage:', contentToStore);
                contentStorage.addContent(contentToStore);
                
                // Trigger a custom event to notify GalleryView to refresh
                window.dispatchEvent(new CustomEvent('contentUpdated'));
              } catch (error) {
                console.error('❌ [Chat] Failed to save fallback content to gallery storage:', error);
              }
            }
            
            onGenerationComplete?.();
            return;
          } catch (fallbackError) {
            throw fallbackError;
          }
        } else {
          throw error; // Re-throw if it's not a content policy issue or not the right model
        }
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key press to submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (userInput.trim() || uploadedImages.length > 0)) {
        handleSubmit(e as any);
      }
    }
  }, [isGenerating, userInput, uploadedImages.length, handleSubmit]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    // Auto-submit the suggestion
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }, 100);
  };

  const showFloatingSuggestions = (suggestions: string[]) => {
    setFloatingSuggestions(suggestions);
    setShowFloatingDialog(true);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setShowFloatingDialog(false);
      // Clear suggestions after animation
      setTimeout(() => {
        setFloatingSuggestions([]);
      }, 300);
    }, 8000);
  };

  const handleFloatingSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    setShowFloatingDialog(false);
    // Auto-submit the suggestion
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }, 100);
  };

  const handleVary = async (imageUrl: string, prompt: string) => {
    setIsGenerating(true);
    try {
      // Define 4 specific cinematic shot variations
      const variationPrompts = [
        'extreme close-up of the character\'s face, cinematic lighting, dramatic focus',
        'extreme close-up of the character\'s midsection, detailed framing, professional cinematography',
        'extreme close-up of something in the character\'s environment, atmospheric details, cinematic composition',
        'wide shot of the character, establishing perspective, cinematic framing'
      ];

      for (const variationPrompt of variationPrompts) {
        // Prioritize user's prompt first, then add the specific shot variation
        const enhancedPrompt = `${prompt}. ${variationPrompt}`;
        
        const generationData = {
          model: 'fal-ai/nano-banana/edit', // Nano Banana Edit for image variations
          prompt: enhancedPrompt,
          image_urls: [imageUrl],
          aspect_ratio: '16:9'
        };

        let result;
        try {
          result = await onContentGenerated(generationData);
        } catch (error: any) {
          // If we get a content policy violation with Nano Banana Edit, try Seedream 4.0 Edit as fallback
          if (error.message?.includes('content policy') && 
              error.message?.includes('violation') && 
              generationData.model === 'fal-ai/nano-banana/edit') {
            
            console.log('🔄 [Chat] Content policy violation detected in variation, trying Seedream 4.0 Edit as fallback...');
            
            // Retry with Seedream 4.0 Edit
            const fallbackGenerationData = {
              ...generationData,
              model: 'fal-ai/bytedance/seedream/v4/edit'
            };
            
            // Set image_size to auto for Seedream 4.0 Edit (maintains input aspect ratio)
            (fallbackGenerationData as any).image_size = "auto";
            delete (fallbackGenerationData as any).aspect_ratio; // Remove aspect_ratio as Seedream uses image_size
            console.log('🔄 [Chat] Set image_size to auto for Seedream fallback');
            
            result = await onContentGenerated(fallbackGenerationData);
          } else {
            throw error; // Re-throw if it's not a content policy issue or not the right model
          }
        }
        
        const images = result.data?.images || result.images || [];
        if (images?.[0]) {
          // Track this as the latest generated image
          setLastGeneratedImage(images[0].url);
          
          // Create descriptive labels for each variation
          const variationLabels = [
            'Extreme Close-up (Face)',
            'Extreme Close-up (Midsection)', 
            'Extreme Close-up (Environment)',
            'Wide Shot (Character)'
          ];
          
          const currentIndex = variationPrompts.indexOf(variationPrompt);
          const variationLabel = variationLabels[currentIndex] || 'Cinematic Variation';
          
          const variationMessage = {
            id: (Date.now() + Math.random()).toString(),
            type: 'assistant' as const,
            content: `✅ Generated ${variationLabel} variation! Check the center panel and gallery.`,
            timestamp: new Date()
            // Removed media property - variations go to center panel and gallery, not chat
          };
          setMessages(prev => [...prev, variationMessage]);
        }
      }
    } catch (error) {
      console.error('Variation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">DirectorChair AI</h2>
            <p className="text-sm text-gray-500">Describe your idea to generate content</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Model Preferences Dropdown */}
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-gray-500" />
              <Select value={preferredVideoModel} onValueChange={handleModelSelectionChange}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fal-ai/nano-banana/edit">
                    <div className="flex items-center gap-2">
                      <img src="/gemini-color.svg" alt="Nano Banana" className="w-4 h-4" />
                      <span>Nano Banana Edit (Image)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/bytedance/seedream/v4/edit">
                    <div className="flex items-center gap-2">
                      <img src="/bytedance-color.svg" alt="Seedream" className="w-4 h-4" />
                      <span>Seedream 4.0 Edit (Image)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/flux-pro/v1.1-ultra">
                    <div className="flex items-center gap-2">
                      <img src="/flux.svg" alt="Flux" className="w-4 h-4" />
                      <span>Flux Pro (Image)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/sora-2/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/openai.svg" alt="Sora 2" className="w-4 h-4" />
                      <span>Sora 2 (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/sora-2/image-to-video/pro">
                    <div className="flex items-center gap-2">
                      <img src="/openai.svg" alt="Sora 2 Pro" className="w-4 h-4" />
                      <span>Sora 2 Pro (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/veo3/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/Gen4.png" alt="Veo" className="w-4 h-4" />
                      <span>Veo 3 (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/kling-video/v2.1/master/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/kling-color.svg" alt="Kling" className="w-4 h-4" />
                      <span>Kling v2.1 Master (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/kling-video/v2.5-turbo/pro/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/kling-color.svg" alt="Kling" className="w-4 h-4" />
                      <span>Kling V2.5 Turbo Pro (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/minimax/hailuo-02/standard/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/minimax-color.svg" alt="Minimax" className="w-4 h-4" />
                      <span>Minimax Hailuo 02 (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/hunyuan-video">
                    <div className="flex items-center gap-2">
                      <img src="/bytedance-color.svg" alt="Hunyuan" className="w-4 h-4" />
                      <span>Hunyuan Video (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/wan-pro/image-to-video" disabled className="text-gray-400">
                    <div className="flex items-center gap-2">
                      <img src="/alibaba-color.svg" alt="Wan Pro" className="w-4 h-4 opacity-50" />
                      <span>Wan Pro (Image-to-Video) - Disabled</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/wan/v2.2-a14b/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/alibaba-color.svg" alt="Wan v2.2-A14B" className="w-4 h-4" />
                      <span>Wan v2.2-A14B (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/ovi/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/Gen4.png" alt="Ovi" className="w-4 h-4" />
                      <span>Ovi (Image-to-Video with Audio)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/luma-dream-machine/ray-2/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/dreammachine.svg" alt="Luma Ray 2" className="w-4 h-4" />
                      <span>Luma Ray 2 (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/wan-25-preview/image-to-video">
                    <div className="flex items-center gap-2">
                      <img src="/alibaba-color.svg" alt="Wan 2.5 Preview" className="w-4 h-4" />
                      <span>Wan 2.5 Preview (Image-to-Video)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fal-ai/kling-video/v1/pro/ai-avatar">
                    <div className="flex items-center gap-2">
                      <img src="/kling-color.svg" alt="Kling Avatar" className="w-4 h-4" />
                      <span>Kling AI Avatar Pro</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Duration indicator for video models */}
              {isVideoModel(preferredVideoModel) && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {duration}s
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                title="Clear chat history"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-sm">Start a conversation to generate content</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                <p className="text-sm">{message.content}</p>
                
                
                {message.media && (
                  <div className="mt-2">
                    {message.media.type === 'image' ? (
                      <div className="relative group">
                        <img 
                          src={message.media.url} 
                          alt={message.content}
                          className="w-full h-auto rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleDownload(message.media!.url, message.media!.filename || 'download')}
                              className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                            >
                              <Download className="w-3 h-3 inline mr-1" />
                              Download
                            </button>
                            <button 
                              onClick={() => handleVary(message.media!.url, message.content)}
                              className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                            >
                              <Shuffle className="w-3 h-3 inline mr-1" />
                              Vary
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : message.media.type === 'video' ? (
                      <video 
                        src={message.media.url} 
                        controls
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <audio 
                        src={message.media.url} 
                        controls
                        className="w-full"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {/* Enhanced Loading Modal */}
        <EnhancedLoadingModal 
          isOpen={isGenerating} 
          model={currentModel}
          onClose={() => setIsGenerating(false)}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length === 0 && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Suggestions:</p>
          <div className="space-y-2">
            {[
              "Create a cinematic shot with dramatic lighting",
              "Generate a character portrait",
              "Make a nature landscape scene",
              "Animate this image with smooth motion",
              "Create a cinematic video with camera movement"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setUserInput(suggestion)}
                className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Images ({uploadedImages.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image, index) => {
                const sizeKB = Math.round((image.length * 3) / 4 / 1024);
                return (
                <div key={index} className="relative group">
                  <img 
                    src={image} 
                    alt={`Uploaded ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                  />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {sizeKB}KB
                    </div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audio Upload for Kling AI Avatar */}
        {preferredVideoModel === 'fal-ai/kling-video/v1/pro/ai-avatar' && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Audio File (Required for AI Avatar):
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              {uploadedAudio ? (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600">🎵</span>
                  <span className="text-sm text-gray-600">Audio file uploaded</span>
                  <button
                    onClick={() => setUploadedAudio(null)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-gray-500">🎵</span>
                  <p className="text-sm text-gray-500">Drop audio file here or click to upload</p>
                  <p className="text-xs text-gray-400">Supports: MP3, WAV, M4A, AAC (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Row */}
          <div className="flex space-x-3">
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImages || isProcessingAudio}
              className={`flex-shrink-0 p-3 border rounded-lg transition-all duration-200 group ${
                isProcessingImages || isProcessingAudio
                  ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              title={isProcessingImages || isProcessingAudio ? "Processing files..." : "Upload images and audio"}
            >
              <div className="flex flex-col items-center">
                {(isProcessingImages || isProcessingAudio) ? (
                  <RefreshCw className="w-5 h-5 mb-1 animate-spin" />
                ) : (
                <FileImage className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-medium">
                  {(isProcessingImages || isProcessingAudio) ? 'Processing...' : 'Upload'}
                </span>
              </div>
            </button>

            {/* Text Input with Drop Zone */}
            <div className="flex-1 relative">
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative"
              >
                {/* Drop Zone Visual Overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-lg flex items-center justify-center z-10 border-2 border-blue-400">
                    <div className="text-center">
                      <CloudUpload className="w-12 h-12 text-blue-500 mx-auto mb-2 animate-bounce" />
                      <p className="text-blue-600 font-medium">Drop images here</p>
                    </div>
                  </div>
                )}

                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your idea... or drag and drop images here (Press Enter to send)"
                  className={`min-h-[80px] resize-none border-gray-300 focus:border-blue-400 focus:ring-blue-400 pr-12 transition-all duration-200 ${
                    isDragOver ? 'border-blue-400 bg-blue-50' : ''
                  }`}
                  disabled={isGenerating}
                />
                
                {/* Send Button */}
                <Button 
                  type="submit" 
                  disabled={isGenerating || (!userInput.trim() && uploadedImages.length === 0)}
                  size="sm"
                  className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>I'll automatically optimize your prompt for best results</span>
            <span>Supports: JPG, PNG, WebP</span>
          </div>

          {/* Settings and Queue Buttons */}
          <div className="flex justify-center gap-2 mt-3">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Generation Settings</DialogTitle>
                  <DialogDescription>
                    Configure your preferred aspect ratio, resolution, and video model.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="3:4">3:4 (Portrait Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p (HD)</SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="1440p">1440p (2K)</SelectItem>
                        <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration Control - Only show for video models */}
                  {isVideoModel(preferredVideoModel) && (
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSupportedDurations(preferredVideoModel).map((durationOption) => (
                            <SelectItem key={durationOption.value} value={durationOption.value.toString()}>
                              {durationOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Duration options for {preferredVideoModel.includes('sora') ? 'Sora 2' : 
                        preferredVideoModel.includes('veo') ? 'Veo 3' :
                        preferredVideoModel.includes('kling') ? (preferredVideoModel.includes('v2.5-turbo') ? 'Kling V2.5 Turbo Pro' : 'Kling') :
                        preferredVideoModel.includes('minimax') ? 'Minimax' :
                        preferredVideoModel.includes('hunyuan') ? 'Hunyuan' :
                        preferredVideoModel.includes('wan-pro') ? 'Wan Pro' :
                        preferredVideoModel.includes('wan/v2.2-a14b') ? 'Wan v2.2-A14B' :
                        preferredVideoModel.includes('wan-25-preview') ? 'Wan 2.5 Preview' :
                        preferredVideoModel.includes('ovi') ? 'Ovi' :
                        preferredVideoModel.includes('luma') ? 'Luma Ray 2' : 'this model'}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="video-model">Preferred Model</Label>
                    <Select value={preferredVideoModel} onValueChange={handleModelSelectionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fal-ai/nano-banana/edit">
                          <div className="flex items-center gap-2">
                            <img src="/gemini-color.svg" alt="Nano Banana" className="w-4 h-4" />
                            <span>Nano Banana Edit (Image)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/bytedance/seedream/v4/edit">
                          <div className="flex items-center gap-2">
                            <img src="/bytedance-color.svg" alt="Seedream" className="w-4 h-4" />
                            <span>Seedream 4.0 Edit (Image)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/flux-pro/v1.1-ultra">
                          <div className="flex items-center gap-2">
                            <img src="/flux.svg" alt="Flux" className="w-4 h-4" />
                            <span>Flux Pro (Image)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/sora-2/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/openai.svg" alt="Sora 2" className="w-4 h-4" />
                            <span>Sora 2 (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/sora-2/image-to-video/pro">
                          <div className="flex items-center gap-2">
                            <img src="/openai.svg" alt="Sora 2 Pro" className="w-4 h-4" />
                            <span>Sora 2 Pro (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/veo3/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/Gen4.png" alt="Veo" className="w-4 h-4" />
                            <span>Veo 3 (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/kling-video/v2.1/master/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/kling-color.svg" alt="Kling" className="w-4 h-4" />
                            <span>Kling v2.1 Master (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/kling-video/v2.5-turbo/pro/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/kling-color.svg" alt="Kling" className="w-4 h-4" />
                            <span>Kling V2.5 Turbo Pro (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/minimax/hailuo-02/standard/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/minimax-color.svg" alt="Minimax" className="w-4 h-4" />
                            <span>Minimax Hailuo 02 (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/hunyuan-video">
                          <div className="flex items-center gap-2">
                            <img src="/bytedance-color.svg" alt="Hunyuan" className="w-4 h-4" />
                            <span>Hunyuan Video (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/wan-pro/image-to-video" disabled className="text-gray-400">
                          <div className="flex items-center gap-2">
                            <img src="/alibaba-color.svg" alt="Wan Pro" className="w-4 h-4 opacity-50" />
                            <span>Wan Pro (Image-to-Video) - Disabled</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/wan/v2.2-a14b/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/alibaba-color.svg" alt="Wan v2.2-A14B" className="w-4 h-4" />
                            <span>Wan v2.2-A14B (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/ovi/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/Gen4.png" alt="Ovi" className="w-4 h-4" />
                            <span>Ovi (Image-to-Video with Audio)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/luma-dream-machine/ray-2/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/dreammachine.svg" alt="Luma Ray 2" className="w-4 h-4" />
                            <span>Luma Ray 2 (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/wan-25-preview/image-to-video">
                          <div className="flex items-center gap-2">
                            <img src="/alibaba-color.svg" alt="Wan 2.5 Preview" className="w-4 h-4" />
                            <span>Wan 2.5 Preview (Image-to-Video)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="fal-ai/kling-video/v1/pro/ai-avatar">
                          <div className="flex items-center gap-2">
                            <img src="/kling-color.svg" alt="Kling Avatar" className="w-4 h-4" />
                            <span>Kling AI Avatar Pro</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Select your preferred model for content generation. Image models generate images, video models generate videos.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </form>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <p className="text-xs text-gray-400 mt-2">
          Chat Mode can make mistakes. Double check responses.
        </p>
      </div>

      {/* Floating Suggestions Dialog */}
      {showFloatingDialog && floatingSuggestions.length > 0 && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showFloatingDialog ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">💡 Quick Actions</h3>
              <button
                onClick={() => setShowFloatingDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {floatingSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleFloatingSuggestionClick(suggestion)}
                  className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-blue-200 hover:border-blue-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click any suggestion to animate your image with video
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
