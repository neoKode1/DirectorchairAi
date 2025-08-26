"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Mic, 
  Plus, 
  Sparkles, 
  Loader2, 
  Bot, 
  User, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Zap,
  Clock,
  Settings,
  Upload,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Video,
  Music,
  Film,
  HomeIcon,
  Copy,
  Clipboard
} from 'lucide-react';
import { intelligenceCore, UserIntent, TaskDelegation, ModelCapability } from '@/lib/intelligence-core';
import { FilmDirectorSuggestions } from '@/components/film-director-suggestions';
import { ModelPreferenceSelector, type ModelPreferences } from '@/components/model-preference-selector';
import { ModelIcon } from '@/components/model-icons';
import { CostEstimator } from '@/components/cost-estimator';
import { AuteurEngineSelector } from '@/components/auteur-engine-selector';
import { type Movie } from '@/lib/movies-database';
import { AVAILABLE_ENDPOINTS, type ApiInfo } from '@/lib/fal';
import { smartControlsAgent } from '@/lib/smart-controls-agent';
import { contentStorage } from '@/lib/content-storage';

import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent?: UserIntent;
  delegation?: TaskDelegation;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  attachments?: {
    type: 'image' | 'video' | 'audio';
    name: string;
    size: number;
    preview?: string | null;
  }[];
  // Add new field for AI suggestions
  suggestions?: string[];
  // Add flag for welcome message
  isWelcomeMessage?: boolean;
  // Add flag for shot suggestion message
  isShotSuggestion?: boolean;
  // Add flag for progress message
  isProgressMessage?: boolean;
  // Add generated content for inline display
  generatedContent?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    images?: string[];
    imageCount?: number;
    prompt?: string;
    metadata?: {
      width?: number;
      height?: number;
      format?: string;
    };
  };
}

interface IntelligentChatInterfaceProps {
  className?: string;
  onContentGenerated?: (content: any) => Promise<any>;
  onGenerationStarted?: () => void;
  onGenerationComplete?: () => void;
}

export function IntelligentChatInterface({ 
  className, 
  onContentGenerated, 
  onGenerationStarted,
  onGenerationComplete 
}: IntelligentChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  // Unified generation state management
  const [generationState, setGenerationState] = useState<{
    isActive: boolean;
    type: 'image' | 'video' | 'style' | 'workflow' | null;
    startTime: Date | null;
    currentTask: string | null;
  }>({
    isActive: false,
    type: null,
    startTime: null,
    currentTask: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDelegation, setPendingDelegation] = useState<TaskDelegation | null>(null);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [lastGeneratedImagePrompt, setLastGeneratedImagePrompt] = useState<string | null>(null);
  const [showSmartControls, setShowSmartControls] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentDelegation, setCurrentDelegation] = useState<TaskDelegation | null>(null);
  const [currentIntent, setCurrentIntent] = useState<UserIntent | null>(null);
  const [styleReferenceImage, setStyleReferenceImage] = useState<string | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);
  const [extractedStylePrompt, setExtractedStylePrompt] = useState<string | null>(null);
  const [voiceInputAvailable, setVoiceInputAvailable] = useState<boolean | null>(null);
  const [chatMode, setChatMode] = useState<'chat' | 'gen'>('gen'); // Add chat mode state
  const [hasStyleImageUploaded, setHasStyleImageUploaded] = useState(false); // Track if style image is uploaded
  const [isListening, setIsListening] = useState(false); // Voice input state
  const [currentVideoModel, setCurrentVideoModel] = useState<string>('fal-ai/kling-video/v2.1/master/image-to-video'); // Current video model for processing
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    title: string;
    prompt?: string;
    timestamp: Date;
  } | null>(null); // Fullscreen image state for chat images

  // Intent selection state
  const [showIntentSelection, setShowIntentSelection] = useState(false);
  const [uploadedImageForIntent, setUploadedImageForIntent] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<'animate' | 'edit' | 'style' | null>(null);
  const [intentValidation, setIntentValidation] = useState<{
    isValid: boolean;
    message: string;
    suggestions: string[];
  } | null>(null);

  // Generation state helper functions
  const startGeneration = (type: 'image' | 'video' | 'style' | 'workflow', task: string) => {
    console.log(`🚀 [Generation State] Starting ${type} generation: ${task}`);
    setGenerationState({
      isActive: true,
      type,
      startTime: new Date(),
      currentTask: task
    });
  };

  const stopGeneration = () => {
    console.log('🛑 [Generation State] Stopping generation');
    setGenerationState({
      isActive: false,
      type: null,
      startTime: null,
      currentTask: null
    });
  };

  const isGenerating = () => generationState.isActive;
  const isVideoGenerating = () => generationState.isActive && generationState.type === 'video';
  const isPendingStyleGeneration = () => generationState.isActive && generationState.type === 'style';

  // Intent options configuration
  const INTENT_OPTIONS = [
    {
      id: 'animate' as const,
      label: '🎬 Animate Image',
      description: 'Convert image to video animation',
      icon: Video,
      category: 'video'
    },
    {
      id: 'edit' as const,
      label: '✏️ Edit Image', 
      description: 'Modify the existing image',
      icon: ImageIcon,
      category: 'image'
    },
    {
      id: 'style' as const,
      label: '🎨 Style Transfer',
      description: 'Apply style to generate new image',
      icon: Sparkles,
      category: 'image'
    }
  ];

  // Intent validation function
  const validateIntentWithPreferences = async (intent: 'animate' | 'edit' | 'style') => {
    console.log('🔍 [Intent Validation] Validating intent:', intent);
    
    const saved = localStorage.getItem('narrative-model-preferences');
    if (!saved) {
      return {
        isValid: false,
        message: 'No model preferences found. Please set your preferred models first.',
        suggestions: ['Go to Model Preferences and select your preferred models']
      };
    }

    try {
      const preferences = JSON.parse(saved);
      const intentOption = INTENT_OPTIONS.find(option => option.id === intent);
      
      if (!intentOption) {
        return {
          isValid: false,
          message: 'Invalid intent selected.',
          suggestions: ['Please select a valid intent']
        };
      }

      const requiredCategory = intentOption.category;
      const preferredModel = preferences[requiredCategory];

      if (!preferredModel || preferredModel === 'none') {
        return {
          isValid: false,
          message: `No preferred ${requiredCategory} model selected.`,
          suggestions: [
            `Go to Model Preferences and select a ${requiredCategory} model`,
            'Or I can suggest the best model for this task'
          ]
        };
      }

      // Check if the preferred model is suitable for the intent
      const availableModels = AVAILABLE_ENDPOINTS.filter(model => model.category === requiredCategory);
      const modelExists = availableModels.some(model => model.endpointId === preferredModel);

      if (!modelExists) {
        return {
          isValid: false,
          message: `Your preferred ${requiredCategory} model is no longer available.`,
          suggestions: [
            'Go to Model Preferences and select a different model',
            'Or I can suggest the best available model'
          ]
        };
      }

      return {
        isValid: true,
        message: `✅ Ready to ${intent} using ${preferredModel}`,
        suggestions: []
      };

    } catch (error) {
      console.error('❌ [Intent Validation] Error validating intent:', error);
      return {
        isValid: false,
        message: 'Error validating your preferences.',
        suggestions: ['Please check your model preferences']
      };
    }
  };

  // Handle fullscreen image display
  const handleOpenFullscreen = (imageData: {
    url: string;
    title: string;
    prompt?: string;
    timestamp: Date;
  }) => {
    console.log('🔍 [IntelligentChatInterface] Opening fullscreen for image:', imageData);
    setFullscreenImage(imageData);
  };

  const handleCloseFullscreen = () => {
    console.log('🔍 [IntelligentChatInterface] Closing fullscreen');
    setFullscreenImage(null);
  };

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Press 'Escape' to close fullscreen
      if (event.key === 'Escape' && fullscreenImage) {
        event.preventDefault();
        handleCloseFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenImage]);

  // Listen for model preference changes
  useEffect(() => {
    const handleModelPreferencesChanged = (event: CustomEvent) => {
      console.log('📡 [IntelligentChatInterface] Received model-preferences-changed event:', event.detail);
      
      const { preferences } = event.detail;
      
      // Update current video model if video preference changed
      if (preferences.video && preferences.video !== 'none' && preferences.video !== currentVideoModel) {
        console.log('🎬 [IntelligentChatInterface] Video preference changed from', currentVideoModel, 'to', preferences.video);
        setCurrentVideoModel(preferences.video);
        
        // Update model preferences state
        setModelPreferences(preferences);
        
        // Update intelligence core with new preferences
        intelligenceCore.setModelPreferences(preferences);
        
        console.log('✅ [IntelligentChatInterface] Updated currentVideoModel and model preferences');
      }
    };

    window.addEventListener('model-preferences-changed', handleModelPreferencesChanged as EventListener);
    
    return () => {
      window.removeEventListener('model-preferences-changed', handleModelPreferencesChanged as EventListener);
    };
  }, [currentVideoModel, intelligenceCore]);

  // Function to sync current video model with user preferences
  const syncVideoModelWithPreferences = useCallback(() => {
    console.log('🔄 [IntelligentChatInterface] Starting video model sync...');
    console.log('🔄 [IntelligentChatInterface] Current video model:', currentVideoModel);
    
    const saved = localStorage.getItem('narrative-model-preferences');
    console.log('🔄 [IntelligentChatInterface] Saved preferences from localStorage:', saved);
    
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        console.log('🔄 [IntelligentChatInterface] Parsed preferences:', preferences);
        console.log('🔄 [IntelligentChatInterface] Video preference:', preferences.video);
        
        if (preferences.video && preferences.video !== 'none' && preferences.video !== currentVideoModel) {
          console.log('🔄 [IntelligentChatInterface] Syncing video model with preferences:', preferences.video);
          setCurrentVideoModel(preferences.video);
          return preferences.video;
        } else {
          console.log('🔄 [IntelligentChatInterface] No sync needed - video preference:', preferences.video, 'current model:', currentVideoModel);
        }
      } catch (error) {
        console.error('❌ [IntelligentChatInterface] Failed to sync video model with preferences:', error);
      }
    } else {
      console.log('🔄 [IntelligentChatInterface] No saved preferences found in localStorage');
    }
    
    console.log('🔄 [IntelligentChatInterface] Returning current video model:', currentVideoModel);
    return currentVideoModel;
  }, [currentVideoModel]);

  // Handle video model change during processing
  const handleVideoModelChange = (newModelId: string) => {
    try {
      console.log('🔄 [Video Model Change] Changing from', currentVideoModel, 'to', newModelId);
      
      // Validate the new model ID
      if (!newModelId || typeof newModelId !== 'string') {
        console.error('❌ [Video Model Change] Invalid model ID:', newModelId);
        return;
      }
      
      // Check if the model exists in available endpoints
      const videoModels = AVAILABLE_ENDPOINTS.filter((model: ApiInfo) => model.category === 'video');
      const modelExists = videoModels.some((model: ApiInfo) => model.endpointId === newModelId);
      
      if (!modelExists) {
        console.error('❌ [Video Model Change] Model not found in available endpoints:', newModelId);
        return;
      }
      
      setCurrentVideoModel(newModelId);
      
      // Update the generation progress with the new model
      if (generationProgress) {
        setGenerationProgress(prev => prev ? {
          ...prev,
          modelId: newModelId
        } : null);
      }
      
      // Update the current delegation with the new model
      if (currentDelegation) {
        setCurrentDelegation(prev => prev ? {
          ...prev,
          endpointId: newModelId
        } : null);
      }
      
      console.log('✅ [Video Model Change] Successfully changed to:', newModelId);
    } catch (error) {
      console.error('❌ [Video Model Change] Error changing model:', error);
    }
  };

  // Handle intent selection
  const handleIntentSelection = async (intent: 'animate' | 'edit' | 'style') => {
    console.log('🎯 [Intent Selection] User selected intent:', intent);
    
    setSelectedIntent(intent);
    
    // Validate the intent with user preferences
    const validation = await validateIntentWithPreferences(intent);
    setIntentValidation(validation);
    
    if (validation.isValid) {
      // Hide intent selection and proceed to prompt input
      setShowIntentSelection(false);
      setUploadedImageForIntent(null);
      
      // Set the uploaded image for processing
      setUploadedImage(uploadedImageForIntent);
      setImagePreview(uploadedImageForIntent);
      
      toast({
        title: "Intent Confirmed",
        description: `Ready to ${intent} your image. Enter your prompt below.`,
      });
    } else {
      // Show validation error in the modal, don't add to chat
      toast({
        title: "Setup Required",
        description: validation.message,
        variant: "destructive",
      });
    }
  };

  // Handle intent selection cancellation
  const handleIntentCancellation = () => {
    console.log('❌ [Intent Selection] User cancelled intent selection');
    
    setShowIntentSelection(false);
    setSelectedIntent(null);
    setIntentValidation(null);
    setUploadedImageForIntent(null);
    
    // Clear any uploaded image
    setUploadedImage(null);
    setImagePreview(null);
  };

  // Handle paste functionality
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUserInput(prev => prev + text);
        console.log('📋 [Paste] Successfully pasted text from clipboard');
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      // Fallback for older browsers or when clipboard access is denied
      try {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        document.execCommand('paste');
        const pastedText = textarea.value;
        document.body.removeChild(textarea);
        if (pastedText) {
          setUserInput(prev => prev + pastedText);
          console.log('📋 [Paste] Successfully pasted text using fallback method');
        }
      } catch (fallbackError) {
        console.error('Fallback paste method also failed:', fallbackError);
      }
    }
  };

  // Debug chat mode changes
  useEffect(() => {
    console.log('🔄 [Chat Mode Debug] Chat mode changed to:', chatMode);
    console.log('🔄 [Chat Mode Debug] Chat mode type:', typeof chatMode);
    console.log('🔄 [Chat Mode Debug] Current timestamp:', new Date().toISOString());
    console.log('🔄 [Chat Mode Debug] Messages count at change:', messages.length);
    console.log('🔄 [Chat Mode Debug] Is processing at change:', isProcessing);
  }, [chatMode, messages.length, isProcessing]);

  // Check voice input availability on component mount
  useEffect(() => {
    const checkVoiceInputAvailability = async () => {
      console.log('🎤 [Voice Input] Checking availability on component mount...');
      
      try {
        // Check SpeechRecognition API
        const hasSpeechRecognition = 'SpeechRecognition' in window;
        const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
        
        if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
          console.warn('🎤 [Voice Input] SpeechRecognition API not available');
          setVoiceInputAvailable(false);
          return;
        }
        
        // Check MediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('🎤 [Voice Input] MediaDevices API not available');
          setVoiceInputAvailable(false);
          return;
        }
        
        // Check for audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        if (audioDevices.length === 0) {
          console.warn('🎤 [Voice Input] No audio input devices found');
          setVoiceInputAvailable(false);
          return;
        }
        
        console.log('🎤 [Voice Input] Voice input should be available');
        setVoiceInputAvailable(true);
        
      } catch (error) {
        console.error('🎤 [Voice Input] Error checking availability:', error);
        setVoiceInputAvailable(false);
      }
    };
    
    checkVoiceInputAvailability();
  }, []);

  // Diagnostic function for voice input
  const diagnoseVoiceInput = () => {
    console.log('🔍 [Voice Input] === DIAGNOSTIC REPORT ===');
    console.log('🔍 [Voice Input] Timestamp:', new Date().toISOString());
    console.log('🔍 [Voice Input] User Agent:', navigator.userAgent);
    console.log('🔍 [Voice Input] Platform:', navigator.platform);
    console.log('🔍 [Voice Input] Language:', navigator.language);
    console.log('🔍 [Voice Input] Online:', navigator.onLine);
    console.log('🔍 [Voice Input] Cookie Enabled:', navigator.cookieEnabled);
    
    // Check SpeechRecognition API
    const hasSpeechRecognition = 'SpeechRecognition' in window;
    const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
    console.log('🔍 [Voice Input] SpeechRecognition APIs:');
    console.log('🔍 [Voice Input] - SpeechRecognition:', hasSpeechRecognition);
    console.log('🔍 [Voice Input] - webkitSpeechRecognition:', hasWebkitSpeechRecognition);
    
    // Check MediaDevices API
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasEnumerateDevices = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
    console.log('🔍 [Voice Input] MediaDevices APIs:');
    console.log('🔍 [Voice Input] - navigator.mediaDevices:', hasMediaDevices);
    console.log('🔍 [Voice Input] - getUserMedia:', hasGetUserMedia);
    console.log('🔍 [Voice Input] - enumerateDevices:', hasEnumerateDevices);
    
    // Check permissions
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          console.log('🔍 [Voice Input] Microphone permission status:', permissionStatus.state);
          console.log('🔍 [Voice Input] Permission details:', permissionStatus);
        })
        .catch(error => {
          console.log('🔍 [Voice Input] Could not query microphone permission:', error);
        });
    } else {
      console.log('🔍 [Voice Input] Permissions API not available');
    }
    
    console.log('🔍 [Voice Input] === END DIAGNOSTIC REPORT ===');
  };

  // Voice input handler with extended pause timeout and comprehensive logging
  const handleVoiceInput = async () => {
    console.log('🎤 [Voice Input] Starting voice input handler...');
    console.log('🎤 [Voice Input] Browser environment check:');
    console.log('🎤 [Voice Input] - User Agent:', navigator.userAgent);
    console.log('🎤 [Voice Input] - Platform:', navigator.platform);
    console.log('🎤 [Voice Input] - Language:', navigator.language);
    console.log('🎤 [Voice Input] - Cookie Enabled:', navigator.cookieEnabled);
    console.log('🎤 [Voice Input] - Online:', navigator.onLine);
    
    // Check if SpeechRecognition API is supported
    const hasSpeechRecognition = 'SpeechRecognition' in window;
    const hasWebkitSpeechRecognition = 'webkitSpeechRecognition' in window;
    
    console.log('🎤 [Voice Input] SpeechRecognition API support:');
    console.log('🎤 [Voice Input] - SpeechRecognition:', hasSpeechRecognition);
    console.log('🎤 [Voice Input] - webkitSpeechRecognition:', hasWebkitSpeechRecognition);
    
    if (!hasSpeechRecognition && !hasWebkitSpeechRecognition) {
      console.error('🎤 [Voice Input] SpeechRecognition API not supported in this browser');
      console.log('🎤 [Voice Input] Available APIs:', Object.keys(window).filter(key => key.toLowerCase().includes('speech')));
      toast({
        title: "Voice Input Not Available",
        description: "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice input.",
        variant: "default",
      });
      return;
    }

    // If already listening, stop the recognition
    if (isListening) {
      console.log('🎤 [Voice Input] User manually stopped recording');
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
      setIsListening(false);
      return;
    }

    // Check if MediaDevices API is supported
    console.log('🎤 [Voice Input] MediaDevices API check:');
    console.log('🎤 [Voice Input] - navigator.mediaDevices exists:', !!navigator.mediaDevices);
    console.log('🎤 [Voice Input] - getUserMedia exists:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    console.log('🎤 [Voice Input] - enumerateDevices exists:', !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices));
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('🎤 [Voice Input] MediaDevices API not supported in this environment');
      console.log('🎤 [Voice Input] Available media APIs:', Object.keys(navigator).filter(key => key.toLowerCase().includes('media')));
      toast({
        title: "Voice Input Not Available",
        description: "Voice input is not supported in this environment. You can still type your prompts manually.",
        variant: "default",
      });
      return;
    }

    // Check microphone permissions and enumerate devices
    console.log('🎤 [Voice Input] Checking microphone permissions and devices...');
    
    try {
      // First, try to enumerate devices to see what's available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log('🎤 [Voice Input] Available audio devices:', audioDevices.length);
      audioDevices.forEach((device, index) => {
        console.log(`🎤 [Voice Input] - Device ${index + 1}:`, {
          deviceId: device.deviceId,
          label: device.label,
          groupId: device.groupId
        });
      });
      
      // Check if we have any audio input devices
      if (audioDevices.length === 0) {
        console.warn('🎤 [Voice Input] No audio input devices found');
        toast({
          title: "No Microphone Found",
          description: "No microphone or audio input device detected. Please connect a microphone and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Try to get microphone permission
      console.log('🎤 [Voice Input] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('🎤 [Voice Input] Microphone permission granted successfully');
      console.log('🎤 [Voice Input] Audio tracks:', stream.getAudioTracks().length);
      stream.getAudioTracks().forEach((track, index) => {
        console.log(`🎤 [Voice Input] - Track ${index + 1}:`, {
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        });
      });
      
      // Stop the stream immediately after testing
      stream.getTracks().forEach(track => track.stop());
      console.log('🎤 [Voice Input] Test stream stopped');
      
    } catch (error) {
      console.error('🎤 [Voice Input] Microphone permission/access error:', error);
      console.log('🎤 [Voice Input] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = "Please allow microphone access in your browser settings to use voice input.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Microphone access denied. Please click the microphone icon in your browser's address bar and select 'Allow'.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Microphone is in use by another application. Please close other apps using the microphone.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Microphone not supported in this browser. Please try a different browser.";
        } else if (error.name === 'SecurityError') {
          errorMessage = "Microphone access blocked by security settings. Please check your browser's security settings.";
        }
      }
      
      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    console.log('🎤 [Voice Input] Initializing SpeechRecognition...');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('🎤 [Voice Input] Using SpeechRecognition constructor:', SpeechRecognition.name || 'Unknown');
    
    const recognition = new SpeechRecognition();
    console.log('🎤 [Voice Input] SpeechRecognition instance created:', recognition);
    
    // Store recognition instance for manual stopping
    (window as any).currentRecognition = recognition;
    
    // Configure recognition settings
    recognition.continuous = true; // Enable continuous listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US';
    
    console.log('🎤 [Voice Input] Recognition configuration:');
    console.log('🎤 [Voice Input] - continuous:', recognition.continuous);
    console.log('🎤 [Voice Input] - interimResults:', recognition.interimResults);
    console.log('🎤 [Voice Input] - lang:', recognition.lang);
    
    let finalTranscript = '';
    let timeoutId: NodeJS.Timeout | null = null;
    
    recognition.onstart = () => {
      console.log('🎤 [Voice Input] Started listening with extended pause timeout...');
      setIsListening(true);
      // Clear input when starting new voice session
      setUserInput('');
      finalTranscript = '';
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      finalTranscript = ''; // Reset to rebuild from all final results
      
      // Process all results and rebuild the final transcript
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update input with the final + interim transcript
      const currentTranscript = finalTranscript + interimTranscript;
      console.log('🎤 [Voice Input] Final:', finalTranscript);
      console.log('🎤 [Voice Input] Interim:', interimTranscript);
      console.log('🎤 [Voice Input] Current:', currentTranscript);
      setUserInput(currentTranscript);
      
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set a new timeout for 5 seconds after speech stops
      timeoutId = setTimeout(() => {
        console.log('🎤 [Voice Input] Extended pause detected, stopping recognition');
        recognition.stop();
      }, 5000); // 5 second pause timeout
    };
    
    recognition.onerror = (event: any) => {
      console.error('🎤 [Voice Input] Recognition error occurred:', event.error);
      console.log('🎤 [Voice Input] Error event details:', {
        error: event.error,
        message: event.message,
        type: event.type,
        target: event.target
      });
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsListening(false);
      
      // Provide user-friendly error messages with detailed logging
      let errorMessage = 'Voice input error occurred';
      let errorType = 'unknown';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings and try again.';
          errorType = 'permission_denied';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          errorType = 'no_speech';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture error. Please check your microphone connection.';
          errorType = 'audio_capture';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          errorType = 'network';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please check your browser settings.';
          errorType = 'service_not_allowed';
          break;
        case 'aborted':
          errorMessage = 'Voice recognition was aborted.';
          errorType = 'aborted';
          break;
        case 'audio-busy':
          errorMessage = 'Audio device is busy. Please close other applications using the microphone.';
          errorType = 'audio_busy';
          break;
        case 'audio-hardware':
          errorMessage = 'Audio hardware error. Please check your microphone connection.';
          errorType = 'audio_hardware';
          break;
        case 'invalid-grammar':
          errorMessage = 'Invalid grammar configuration.';
          errorType = 'invalid_grammar';
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported. Please try a different language.';
          errorType = 'language_not_supported';
          break;
        default:
          errorMessage = `Voice input error: ${event.error}`;
          errorType = 'unknown';
      }
      
      console.log('🎤 [Voice Input] Error analysis:', {
        errorType,
        errorMessage,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      
      // Show error toast
      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive",
      });
    };
    
    recognition.onend = () => {
      console.log('🎤 [Voice Input] Stopped listening');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsListening(false);
    };
    
    recognition.start();
  };

  const [modelPreferences, setModelPreferences] = useState<ModelPreferences>({
    image: null,
    video: null,
    music: null,
    voiceover: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Removed delegation override state - no longer needed with intent-driven workflow
  
  // Add state for content type selection
  const [contentType, setContentType] = useState<'image' | 'video'>('image');

  // Add workflow execution state
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [workflowStep, setWorkflowStep] = useState(0);
  
  // Add style reference state

  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  
  // Add state for hiding/showing smart controls (already declared above)

  // Add progress tracking state
  const [generationProgress, setGenerationProgress] = useState<{
    isActive: boolean;
    progress: number;
    status: string;
    estimatedTime: string;
    modelId: string;
  } | null>(null);

  // Function to handle welcome message item clicks
  const handleWelcomeItemClick = async (itemType: string) => {
    console.log('🎯 [IntelligentChatInterface] Welcome item clicked:', itemType);
    
    let responseMessage = '';
    let newPreferences = { ...modelPreferences };

    switch (itemType) {
      case 'image-generation':
        newPreferences.image = 'fal-ai/flux-pro/v1.1-ultra';
        responseMessage = `🎨 **Image Generation Ready!**

I've set up **Flux Pro 1.1 Ultra** as your preferred image generation model. This is our most advanced model for creating high-quality images with cinematic styling.

**What you can create:**
• Professional photography-style images
• Cinematic landscapes and scenes
• Character portraits and concept art
• Artistic compositions with dramatic lighting

**Next Step:** Type your prompt in the input box at the bottom of the screen and press Enter to generate your image using Flux Pro 1.1 Ultra! 🚀`;
        setContentType('image');
        break;
        
      case 'video-creation':
        // Don't set a specific video model yet - let user choose or use smart selection
        responseMessage = `🎬 **Video Creation Ready!**

I'm ready to help you create amazing videos! I have access to several top-tier video generation models:

**Available Models:**
• **Kling v2.1 Master** - Enhanced motion realism (Default)
• **Google Veo3** - Exceptional quality and realism
• **Luma Dream Machine** - Natural motion and smooth camera work
• **Minimax Hailuo 02** - High-quality cinematic generation

You can either:
1. **Set your preferred video model** in the Model Preferences (top right)
2. **Let me choose automatically** - I'll select the best model based on your prompt

Type your video prompt below and I'll get started! 🎥`;
        setContentType('video');
        break;
        
      case 'audio-voice':
        responseMessage = `🎵 **Audio & Voice Creation Ready!**

I'm ready to help you create professional audio content! While I don't have audio models currently configured, I can guide you through the process and help you craft perfect prompts for audio generation.

**What I can help with:**
• Music composition prompts
• Sound effect descriptions
• Voice-over script writing
• Audio branding concepts

Please note: You'll need to configure audio models in the Model Preferences to generate actual audio content. For now, I can help you plan and structure your audio projects! 🎧`;
        break;
        
      case 'smart-model-selection':
        responseMessage = `🧠 **Smart Model Selection Active!**

I'm your AI assistant for intelligent model selection! I analyze your prompts and automatically choose the best AI model for your specific needs.

**How it works:**
• **Intent Analysis** - I understand what type of content you want
• **Model Matching** - I select the optimal model based on your requirements
• **Quality Optimization** - I choose models that will give you the best results
• **Context Awareness** - I consider your previous work and preferences

**Current Setup:**
• **Image Generation**: Flux Pro 1.1 Ultra (set as preferred)
• **Video Generation**: Smart selection from available models
• **Workflow Detection**: Automatic multi-step content creation

Try me out! Describe what you want to create and watch me select the perfect model! ⚡`;
        newPreferences.image = 'fal-ai/flux-pro/v1.1-ultra';
        break;
        
      case 'director-guidance':
        responseMessage = `🎭 **Director Guidance Active!**

Welcome to your personal film director assistant! I provide professional cinematographic guidance to elevate your creative projects.

**What I offer:**
• **Genre-specific techniques** (Horror, Romance, Action, Sci-Fi, Drama)
• **Cinematic shot suggestions** (Close-ups, wide shots, tracking shots)
• **Lighting and composition advice**
• **Professional terminology and techniques**
• **Context-aware suggestions** based on your prompts

**Smart Analysis Features:**
• Automatic genre detection from your prompts
• Emotion-based cinematographic recommendations
• Keyword-triggered professional suggestions
• Real-time guidance during content creation

Start describing your creative vision and I'll provide director-level guidance to bring it to life! 🎬✨`;
        newPreferences.image = 'fal-ai/flux-pro/v1.1-ultra';
        setContentType('image');
        break;
        
      default:
        return;
    }

    // Update model preferences if changed
    if (JSON.stringify(newPreferences) !== JSON.stringify(modelPreferences)) {
      console.log('🔧 [IntelligentChatInterface] Updating model preferences:', newPreferences);
      setModelPreferences(newPreferences);
      intelligenceCore.setModelPreferences(newPreferences);
      
      // Save to localStorage
      localStorage.setItem('narrative-model-preferences', JSON.stringify(newPreferences));
      
      // Show toast notification
      toast({
        title: "Model Preferences Updated",
        description: `Set ${newPreferences.image ? 'Flux Pro 1.1 Ultra' : 'smart selection'} for optimal results`,
      });
    }

    // Add assistant response message
    const assistantMessage: ChatMessage = {
      id: `welcome-response-${Date.now()}`,
      type: 'assistant',
      content: responseMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    
    console.log('✅ [IntelligentChatInterface] Welcome item setup complete:', itemType);
  };

  // Function to detect if user request is a workflow
  const detectWorkflowRequest = (userInput: string): boolean => {
    const prompt = userInput.toLowerCase();
    return (
      prompt.includes('multiple angle') || 
      prompt.includes('different angle') || 
      prompt.includes('various angle') || 
      prompt.includes('all angle') ||
      (prompt.includes('character') && (prompt.includes('variation') || prompt.includes('different') || prompt.includes('multiple'))) ||
      // Only trigger workflow for actual multi-step requests, not simple scene descriptions
      (prompt.includes('scene') && (prompt.includes('sequence') || prompt.includes('series') || prompt.includes('multiple'))) ||
      (prompt.includes('sequence') && prompt.includes('multiple')) || 
      (prompt.includes('story') && (prompt.includes('chapter') || prompt.includes('part') || prompt.includes('series')))
    );
  };

  // Animation requests are now handled by dedicated animate buttons on images
  // No longer detecting "animate it" commands in chat interface

  // Shot suggestions are now handled by dedicated animate buttons on images
  // No longer generating shot suggestions for "animate it" commands

  // Function to start progress tracking for video generation
  const startVideoProgress = (modelId: string, estimatedTime: string) => {
    console.log('🎬 [Progress] Starting video generation progress tracking');
    
    setGenerationProgress({
      isActive: true,
      progress: 0,
      status: 'Initializing video generation...',
      estimatedTime,
      modelId,
    });

    // Start progress simulation based on model type
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (!prev) return null;
        
        let newProgress = prev.progress;
        let newStatus = prev.status;
        
        // Different progress patterns for different models
        if (modelId.includes('kling')) {
          // Kling models: slower start, faster finish
          if (prev.progress < 20) {
            newProgress += 0.5;
            newStatus = 'Analyzing image and preparing motion...';
          } else if (prev.progress < 60) {
            newProgress += 1.2;
            newStatus = 'Generating video frames...';
          } else if (prev.progress < 85) {
            newProgress += 2;
            newStatus = 'Applying motion and effects...';
          } else if (prev.progress < 95) {
            newProgress += 1;
            newStatus = 'Finalizing video quality...';
          } else {
            newProgress += 0.5;
            newStatus = 'Almost complete...';
          }
        } else if (modelId.includes('veo3')) {
          // Veo3 models: steady progress
          if (prev.progress < 30) {
            newProgress += 1;
            newStatus = 'Processing video request...';
          } else if (prev.progress < 70) {
            newProgress += 1.5;
            newStatus = 'Generating high-quality video...';
          } else if (prev.progress < 90) {
            newProgress += 1;
            newStatus = 'Enhancing video quality...';
          } else {
            newProgress += 0.5;
            newStatus = 'Finalizing...';
          }
        } else if (modelId.includes('luma')) {
          // Luma models: faster start
          if (prev.progress < 40) {
            newProgress += 1.5;
            newStatus = 'Creating dream sequence...';
          } else if (prev.progress < 80) {
            newProgress += 1.2;
            newStatus = 'Generating smooth motion...';
          } else if (prev.progress < 95) {
            newProgress += 0.8;
            newStatus = 'Polishing video...';
          } else {
            newProgress += 0.3;
            newStatus = 'Final touches...';
          }
        } else {
          // Default progress pattern
          if (prev.progress < 50) {
            newProgress += 1;
            newStatus = 'Processing video generation...';
          } else if (prev.progress < 90) {
            newProgress += 1.2;
            newStatus = 'Generating video content...';
          } else {
            newProgress += 0.5;
            newStatus = 'Finalizing...';
          }
        }
        
        // Cap at 95% - let the actual completion finish it
        if (newProgress >= 95) {
          newProgress = 95;
          newStatus = 'Almost complete...';
        }
        
        return {
          ...prev,
          progress: newProgress,
          status: newStatus,
        };
      });
    }, 1000); // Update every second

    // Store the interval ID for cleanup
    return progressInterval;
  };

  // Function to complete progress
  const completeVideoProgress = () => {
    console.log('✅ [Progress] Completing video generation progress');
    setGenerationProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        progress: 100,
        status: 'Video generation complete!',
      };
    });
    
    // Clear progress after a delay
    setTimeout(() => {
      setGenerationProgress(null);
    }, 2000);
  };

    // Function to handle shot suggestion clicks
  const handleShotSuggestionClick = async (suggestion: string) => {
    console.log('🎬 [IntelligentChatInterface] Shot suggestion clicked:', suggestion);
    
    // Add user message showing the selected shot
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Set content type to video for animation
    setContentType('video');
    
    // Create an enhanced input for animation that includes the last generated image
    if (lastGeneratedImage) {
      const enhancedInput = `animate it [Last generated image: ${lastGeneratedImage} - requesting image-to-video animation] ${suggestion}`;
      console.log('🎬 [IntelligentChatInterface] Enhanced animation input:', enhancedInput);
      
      // Process the animation request through the intelligence core
      try {
        setIsProcessing(true);
        
        // Let the intelligence core handle model selection - it will use user preferences
        // and fall back to smart selection if needed

        // Process through intelligence core with forced video content type
        const intent = await intelligenceCore.analyzeUserIntent(enhancedInput, 'video');
        console.log('📊 [IntelligentChatInterface] Animation intent:', intent);
        
        const delegation = await intelligenceCore.selectOptimalModel(intent);
        console.log('📊 [IntelligentChatInterface] Animation delegation:', delegation);
        
                 if (delegation) {
           console.log('🎯 [IntelligentChatInterface] Animation delegation found, starting generation');
           setPendingDelegation(delegation);
           setCurrentIntent(intent);
           
           // Add assistant message showing animation is starting
           const assistantMessage: ChatMessage = {
             id: (Date.now() + 1).toString(),
             type: 'assistant',
             content: `🎬 **Starting Animation**: Converting your image to video using ${delegation.modelId}

**Shot Style:** ${suggestion}`,
             timestamp: new Date(),
             intent: intent,
             delegation: delegation,
             status: 'processing',
           };
           setMessages(prev => [...prev, assistantMessage]);
           
           // Start generation immediately - progress will be handled by polling
           try {
             await handleGenerateNow();
           } catch (error) {
             // Clear progress on error
             setGenerationProgress(null);
             throw error;
           }
        } else {
          console.log('❌ [IntelligentChatInterface] No delegation found for animation request');
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: '❌ **Error**: Could not process animation request. Please try again.',
            timestamp: new Date(),
            status: 'error',
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('❌ [IntelligentChatInterface] Error processing animation request:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '❌ **Error**: Failed to process animation request. Please try again.',
          timestamp: new Date(),
          status: 'error',
        };
        setMessages(prev => [...prev, errorMessage]);
        
        toast({
          title: "Animation Error",
          description: "Failed to process animation request. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log('❌ [IntelligentChatInterface] No last generated image found for animation');
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '❌ **Error**: No image found to animate. Please generate an image first.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Function to create workflow steps
  const createWorkflowSteps = (userInput: string, intent: any): any[] => {
    const prompt = userInput.toLowerCase();
    const basePrompt = extractBaseCharacterDescription(userInput);
    
    if (prompt.includes('multiple angle') || prompt.includes('different angle') || 
        prompt.includes('various angle') || prompt.includes('all angle')) {
      return [
        {
          id: 'profile',
          prompt: `${basePrompt}, profile view, cybernetic design, blue glowing elements`,
          description: 'Generate profile view'
        },
        {
          id: 'back',
          prompt: `${basePrompt}, back view, technological details, circuit patterns`,
          description: 'Generate back view'
        },
        {
          id: 'three-quarter',
          prompt: `${basePrompt}, 3/4 angle, futuristic robot design`,
          description: 'Generate 3/4 angle view'
        },
        {
          id: 'closeup',
          prompt: `${basePrompt}, close-up portrait, glowing blue eyes`,
          description: 'Generate close-up portrait'
        },
        {
          id: 'low-angle',
          prompt: `${basePrompt}, low angle shot, heroic pose, looking up`,
          description: 'Generate low angle shot'
        }
      ];
    }
    
    // Default single step
    return [{
      id: 'single',
      prompt: userInput,
      description: 'Generate content'
    }];
  };

  const extractBaseCharacterDescription = (userPrompt: string): string => {
    const prompt = userPrompt.toLowerCase();
    
    if (prompt.includes('ai character') || prompt.includes('cybernetic')) {
      return 'AI character, cybernetic design, blue glowing elements, technological aesthetic';
    }
    
    if (prompt.includes('robot') || prompt.includes('android')) {
      return 'Robot character, metallic design, futuristic technology';
    }
    
    return 'Character, professional design, high quality';
  };

  // Function to execute workflow
  const executeWorkflow = async (workflow: any) => {
    setIsExecutingWorkflow(true);
    setCurrentWorkflow(workflow);
    setWorkflowStep(0);

    for (let i = 0; i < workflow.steps.length; i++) {
      setWorkflowStep(i);
      
      const step = workflow.steps[i];
      console.log(`🔄 [Workflow] Executing step ${i + 1}/${workflow.steps.length}: ${step.description}`);
      
      try {
        // Create delegation for this step
        const delegation: TaskDelegation = {
          modelId: workflow.model || 'fal-ai/flux-pro/v1.1-ultra', // Use Flux for workflow steps
          reason: `Workflow step: ${step.description}`,
          confidence: 0.9,
          estimatedTime: '30s',
          parameters: {
            prompt: step.prompt,
            aspect_ratio: selectedAspectRatio,
            ...workflow.parameters
          },
          intent: workflow.intent || 'image'
        };

        console.log('🔄 [Workflow] Step delegation created:', {
          modelId: delegation.modelId,
          prompt: delegation.parameters.prompt,
          parameters: delegation.parameters
        });

        // Set the delegation and intent for generation
        setPendingDelegation(delegation);
        setCurrentIntent({
          type: delegation.intent as 'image' | 'video' | 'audio' | 'voiceover',
          confidence: delegation.confidence,
          keywords: [],
          context: step.prompt,
          requiresGeneration: true
        });

        // Execute the generation
        await handleGenerateNow();
        
        // Assume success if no error was thrown
        console.log(`✅ [Workflow] Step ${i + 1} completed successfully`);
        
        // Add workflow progress message
        const progressMessage: ChatMessage = {
          id: `workflow-${Date.now()}-${i}`,
          type: 'assistant',
          content: `🔄 **Workflow Progress**: Completed step ${i + 1}/${workflow.steps.length} - ${step.description}`,
          timestamp: new Date(),
          status: 'completed',
        };
        setMessages(prev => [...prev, progressMessage]);
      } catch (error) {
        console.error(`❌ [Workflow] Step ${i + 1} failed:`, error);
        
        const errorMessage: ChatMessage = {
          id: `workflow-error-${Date.now()}-${i}`,
          type: 'assistant',
          content: `❌ **Workflow Error**: Failed to complete step ${i + 1} - ${step.description}`,
          timestamp: new Date(),
          status: 'error',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Workflow completed
    setIsExecutingWorkflow(false);
    setCurrentWorkflow(null);
    setWorkflowStep(0);
    
    // Add completion message with next actions
    const completionMessage: ChatMessage = {
      id: `workflow-complete-${Date.now()}`,
      type: 'assistant',
      content: `🎉 **Workflow Complete!** 

All ${workflow.steps.length} steps have been executed successfully.

**Next Actions:**
• **Create Video Animations** - Animate the generated images into videos
• **Generate More Variations** - Create additional character variations  
• **Create Scene Integration** - Place character in different scenes

Click any of these options to continue the workflow, or start a new request.`,
      timestamp: new Date(),
      status: 'completed',
    };
    setMessages(prev => [...prev, completionMessage]);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load saved model preferences from localStorage and set defaults
  useEffect(() => {
    const saved = localStorage.getItem('narrative-model-preferences');
    let preferences: ModelPreferences;
    
    if (saved) {
      try {
        const parsedPreferences = JSON.parse(saved);
        console.log('📋 [IntelligentChatInterface] Loading saved model preferences:', parsedPreferences);
        
        // Validate the preferences structure
        preferences = {
          image: parsedPreferences.image || 'fal-ai/flux-pro/v1.1-ultra', // Default to Flux v1.1
          video: parsedPreferences.video || 'fal-ai/kling-video/v2.1/master/image-to-video', // Default to Kling Master v2.1 I2V
          music: parsedPreferences.music || null,
          voiceover: parsedPreferences.voiceover || null,
        };
        
        console.log('📋 [IntelligentChatInterface] Validated preferences:', preferences);
      } catch (error) {
        console.error('❌ [IntelligentChatInterface] Failed to load model preferences:', error);
        // Set default preferences if loading fails
        preferences = {
          image: 'fal-ai/flux-pro/v1.1-ultra', // Default to Flux v1.1
          video: 'fal-ai/kling-video/v2.1/master/image-to-video', // Default to Kling Master v2.1 I2V
          music: null,
          voiceover: null,
        };
      }
    } else {
      console.log('📋 [IntelligentChatInterface] No saved model preferences found, setting defaults');
      preferences = {
        image: 'fal-ai/flux-pro/v1.1-ultra', // Default to Flux v1.1
        video: 'fal-ai/kling-video/v2.1/master/image-to-video', // Default to Kling Master v2.1 I2V
        music: null,
        voiceover: null,
      };
      
      // Save the default preferences to localStorage
      localStorage.setItem('narrative-model-preferences', JSON.stringify(preferences));
      console.log('💾 [IntelligentChatInterface] Saved default model preferences to localStorage');
    }
    
    setModelPreferences(preferences);
    intelligenceCore.setModelPreferences(preferences);
    
    // Update currentVideoModel with user's video preference
    if (preferences.video && preferences.video !== 'none') {
      setCurrentVideoModel(preferences.video);
      console.log('🎬 [IntelligentChatInterface] Updated currentVideoModel to user preference:', preferences.video);
    }
    
    console.log('✅ [IntelligentChatInterface] Model preferences loaded and set successfully');
  }, []);

  // Initialize with welcome message and check model availability
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔧 [IntelligentChatInterface] Initializing welcome message and checking models');
      
      // Enable Claude Code SDK enhancement for better analysis
      intelligenceCore.enableClaudeCodeEnhancement(true);
      
      // Check if models are available
      const availableCapabilities = intelligenceCore.getModelCapabilities();
      console.log('🔍 [IntelligentChatInterface] Available model capabilities:', availableCapabilities.length);
      
      // Verify default models are available
      const defaultImageModel = 'fal-ai/flux-pro/v1.1-ultra';
      const defaultVideoModel = 'fal-ai/kling-video/v2.1/master/image-to-video';
      
      const imageModelAvailable = availableCapabilities.some(cap => cap.endpointId === defaultImageModel);
      const videoModelAvailable = availableCapabilities.some(cap => cap.endpointId === defaultVideoModel);
      
      console.log(`🔍 [IntelligentChatInterface] Default image model (${defaultImageModel}) available:`, imageModelAvailable);
      console.log(`🔍 [IntelligentChatInterface] Default video model (${defaultVideoModel}) available:`, videoModelAvailable);
      
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `🎯 **Welcome to DirectorchairAI!**
        
I'm your AI-powered media creation assistant, designed to help you generate stunning images, videos, audio, and more. I can analyze your requests, suggest optimal AI models, and provide director-level guidance for your creative projects.

**What I can help you with:**
• **Image Generation**: Create high-quality images with cinematic styling
• **Video Creation**: Generate videos from text or animate existing images
• **Audio & Voice**: Create music, sound effects, and voiceovers
• **Smart Model Selection**: Automatically choose the best AI models for your needs
• **Director Guidance**: Get professional cinematographic suggestions

**How to get started:**
1. Simply describe what you want to create
2. I'll analyze your request and suggest the best approach
3. Choose your preferred AI models in the Model Preferences
4. Generate your content with one click!

**Default Models Loaded:**
${imageModelAvailable ? '✅' : '❌'} **Image**: Flux v1.1 Ultra
${videoModelAvailable ? '✅' : '❌'} **Video**: Kling Master v2.1 I2V

Ready to create something amazing? Just tell me what you have in mind! 🎬✨`,
        timestamp: new Date(),
        isWelcomeMessage: true, // Add flag to identify welcome message
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
      console.log('✅ [IntelligentChatInterface] Welcome message and model check initialized');
    }
  }, [isInitialized]);

  // Set up event listeners for animation requests from content display
  useEffect(() => {
    console.log('🎯 [IntelligentChatInterface] Setting up event listeners for animation requests');
    
    const handleContentGenerated = (event: CustomEvent) => {
      console.log('📦 [IntelligentChatInterface] Received content-generated event:', event.detail);
      const { type, url, title, prompt, timestamp, metadata, id } = event.detail;
      
      // Check if we've already processed this content (prevent duplicates)
      const existingMessage = messages.find(msg => 
        msg.generatedContent?.url === url && 
        msg.timestamp.getTime() - new Date(timestamp).getTime() < 5000 // Within 5 seconds
      );
      
      if (existingMessage) {
        console.log('🔄 [IntelligentChatInterface] Content already exists in chat, skipping duplicate:', url);
        return;
      }
      
      // Create a message with the generated content
      const contentMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ **${title}**`,
        timestamp: new Date(timestamp),
        status: 'completed',
        generatedContent: {
          type: type as 'image' | 'video' | 'audio',
          url: url,
          prompt: prompt,
          metadata: metadata
        }
      };
      
      // Add the content message to the chat
      setMessages(prev => [...prev, contentMessage]);
      
      // Save content to gallery storage
      const contentToSave = {
        id: id || Date.now().toString(),
        type: type as 'image' | 'video' | 'audio',
        url: url,
        title: title,
        prompt: prompt,
        timestamp: new Date(timestamp),
        metadata: metadata
      };
      
      contentStorage.addContent(contentToSave);
      console.log('💾 [IntelligentChatInterface] Saved generated content to gallery:', contentToSave);
      
      // Show success toast
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Generated!`,
        description: `${title} has been created successfully and saved to gallery.`,
      });
      
      console.log('✅ [IntelligentChatInterface] Added generated content to chat:', contentMessage);
    };
    
    const handleAnimateImage = (event: CustomEvent) => {
      console.log('🎬 [IntelligentChatInterface] Received animate-image event:', event.detail);
      const { imageUrl, imageTitle, prompt } = event.detail;
      
      console.log('🎬 [IntelligentChatInterface] Animation request details:', {
        imageUrl,
        imageTitle,
        prompt,
        hasImageUrl: !!imageUrl,
        imageUrlLength: imageUrl?.length
      });
      
      // Set the last generated image URL for animation
      setLastGeneratedImage(imageUrl);
      setLastGeneratedImagePrompt(prompt || 'Generated image');
      console.log('💾 [IntelligentChatInterface] Set last generated image for animation:', imageUrl);
      
      // Set the last generated image URL for the intelligence core
      intelligenceCore.setLastGeneratedImage(imageUrl);
      console.log('💾 [IntelligentChatInterface] Set last generated image in intelligence core:', imageUrl);
      
      // Add a user message showing the animation request
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: `Animate "${imageTitle}"`,
        timestamp: new Date(),
      };
      
      console.log('🎬 [IntelligentChatInterface] Adding user message for animation request');
      setMessages(prev => [...prev, userMessage]);
      
      // Process the animation request through the intelligence core
      handleAnimationFromButton(imageUrl, imageTitle, prompt);
    };

    const handleInjectImageToChat = (event: CustomEvent) => {
      console.log('💉 [IntelligentChatInterface] Received inject-image-to-chat event:', event.detail);
      const { imageUrl, imageTitle, prompt } = event.detail;
      
      console.log('💉 [IntelligentChatInterface] Image injection details:', {
        imageUrl,
        imageTitle,
        prompt,
        hasImageUrl: !!imageUrl,
        imageUrlLength: imageUrl?.length
      });
      
      // Set the uploaded image
      setUploadedImage(imageUrl);
      setImagePreview(imageUrl);
      
      // Add a user message showing the image was injected
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: `[Image injected: ${imageTitle} - ready for animation]`,
        timestamp: new Date(),
      };
      
      console.log('💉 [IntelligentChatInterface] Adding user message for image injection');
      setMessages(prev => [...prev, userMessage]);
      
      // Show toast notification
      toast({
        title: "Image Added Successfully!",
        description: `${imageTitle} has been added to the chat input. You can now type a prompt to animate it, edit it, or use it for other AI operations.`,
      });
    };

    // Add event listeners
    window.addEventListener('animate-image', handleAnimateImage as EventListener);
    window.addEventListener('inject-image-to-chat', handleInjectImageToChat as EventListener);
    window.addEventListener('content-generated', handleContentGenerated as EventListener);
    
    console.log('✅ [IntelligentChatInterface] Event listeners added for animate-image, inject-image-to-chat, and content-generated');

    return () => {
      console.log('🧹 [IntelligentChatInterface] Cleaning up event listeners');
      window.removeEventListener('animate-image', handleAnimateImage as EventListener);
      window.removeEventListener('inject-image-to-chat', handleInjectImageToChat as EventListener);
      window.removeEventListener('content-generated', handleContentGenerated as EventListener);
    };
  }, [toast]);

  // Helper function to compress image to fit within API limits
  const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress the image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log('🖼️ [Image Compression] Original size:', file.size, 'bytes');
        console.log('🖼️ [Image Compression] Compressed dimensions:', width, 'x', height);
        console.log('🖼️ [Image Compression] Compressed data URL length:', compressedDataUrl.length);
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle animation requests from dedicated animate buttons
  const handleAnimationFromButton = async (imageUrl: string, imageTitle: string, prompt?: string) => {
    console.log('🎬 [IntelligentChatInterface] Processing animation from button:', { imageUrl, imageTitle, prompt });
    setIsProcessing(true);

    try {
            // Check if the image URL is a FAL media URL that might be too large
      if (imageUrl.includes('fal.media')) {
        console.log('🖼️ [IntelligentChatInterface] Detected FAL media URL, checking if compression is needed');
        
        // For FAL media URLs, we need to fetch and compress the image
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          
          console.log('🖼️ [IntelligentChatInterface] Fetched image from FAL media, compressing for animation');
          const compressedImageUrl = await compressImage(file, 1920, 1920, 0.8);
          
          console.log('✅ [IntelligentChatInterface] Image compressed for animation, using compressed URL');
          imageUrl = compressedImageUrl; // Use the compressed version
        } catch (compressionError) {
          console.error('❌ [IntelligentChatInterface] Failed to compress FAL media image:', compressionError);
          console.log('⚠️ [IntelligentChatInterface] Continuing with original URL (may cause size issues)');
        }
      }
      // Get user's preferred video model from preferences
      const saved = localStorage.getItem('narrative-model-preferences');
      let userVideoModel = 'fal-ai/kling-video/v2.1/master/image-to-video'; // Default fallback
      
      if (saved) {
        try {
          const preferences = JSON.parse(saved);
          if (preferences.video && preferences.video !== 'none') {
            userVideoModel = preferences.video;
            console.log('🎬 [IntelligentChatInterface] Using user\'s preferred video model:', userVideoModel);
          } else {
            console.log('🎬 [IntelligentChatInterface] No video preference set, using default:', userVideoModel);
          }
        } catch (error) {
          console.error('❌ [IntelligentChatInterface] Failed to parse video preferences:', error);
        }
      }
      
      // Validate that the user's preferred model exists in available endpoints
      const videoModels = AVAILABLE_ENDPOINTS.filter((model: ApiInfo) => model.category === 'video');
      const modelExists = videoModels.some((model: ApiInfo) => model.endpointId === userVideoModel);
      
      if (!modelExists) {
        console.error('❌ [IntelligentChatInterface] User\'s preferred video model not found:', userVideoModel);
        userVideoModel = 'fal-ai/kling-video/v2.1/master/image-to-video'; // Fallback to default
        console.log('🎬 [IntelligentChatInterface] Falling back to default model:', userVideoModel);
      }
      
      // Create a direct delegation using the user's preferred model
      const directDelegation: TaskDelegation = {
        modelId: userVideoModel,
        intent: 'video',
        reason: 'Direct animation request using user\'s preferred model',
        confidence: 1.0,
        estimatedTime: '2-5 minutes',
        parameters: {
          prompt: prompt || `Animate ${imageTitle}`,
          image_url: imageUrl,
          aspect_ratio: '16:9',
          duration: '5s'
        }
      };
      
      console.log('🎯 [IntelligentChatInterface] Created direct delegation for animation:', directDelegation);
      
      // Set up the delegation for immediate generation
      setPendingDelegation(directDelegation);
      setCurrentIntent({ 
        type: 'video', 
        confidence: 1.0,
        keywords: ['animate', 'video'],
        context: 'image-to-video animation',
        requiresGeneration: true
      });
      
      // Add assistant message showing animation is ready with user's preferred model
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🎬 **Animation Ready**: Your image is ready to be animated using ${userVideoModel}`,
        timestamp: new Date(),
        intent: { 
          type: 'video', 
          confidence: 1.0,
          keywords: ['animate', 'video'],
          context: 'image-to-video animation',
          requiresGeneration: true
        },
        delegation: directDelegation,
        status: 'pending',
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      console.log('✅ [IntelligentChatInterface] Animation setup complete with user\'s preferred model');
      
      // Automatically start generation after a short delay
      setTimeout(async () => {
        try {
          console.log('🚀 [IntelligentChatInterface] Auto-starting animation generation');
          await handleGenerateNow();
        } catch (error) {
          console.error('❌ [IntelligentChatInterface] Auto-generation failed:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error in handleAnimationFromButton:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '❌ **Error**: Could not process animation request. Please try again.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Animation Error",
        description: "Failed to process animation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Animation requests are now handled by dedicated animate buttons on images
  // No longer processing "animate it" commands in chat interface

  // Modified handleSubmit to detect and execute workflows
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 [Submit Debug] Form submitted');
    console.log('🚀 [Submit Debug] User input:', userInput);
    console.log('🚀 [Submit Debug] Is processing:', isProcessing);
    console.log('🚀 [Submit Debug] Chat mode:', chatMode);
    
    // Prevent multiple submissions
    if (!userInput.trim() || isProcessing) {
      console.log('🚀 [Submit Debug] Early return - empty input or already processing');
      return;
    }
    
    // Additional safeguard against duplicate submissions
    if (isGenerating()) {
      console.log('🚀 [Submit Debug] Early return - generation already in progress');
      return;
    }

    // Check if another generation is already in progress
    if (isGenerating()) {
      console.log('❌ [IntelligentChatInterface] Submit blocked - generation already in progress');
      toast({
        title: "Generation in Progress",
        description: `Please wait for the current ${generationState.type} generation to complete.`,
        variant: "destructive",
      });
      return;
    }

    const inputText: string = userInput.trim();
    const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🚀 [Submit Debug] Trimmed input text:', inputText);
    console.log('🚀 [Submit Debug] Generation ID:', generationId);
    
    setUserInput('');
    setIsProcessing(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    console.log('🚀 [Submit Debug] Adding user message:', userMessage);
    console.log('🚀 [Submit Debug] User message content:', userMessage.content);
    setMessages(prev => {
      console.log('🚀 [Submit Debug] Previous messages count:', prev.length);
      const newMessages = [...prev, userMessage];
      console.log('🚀 [Submit Debug] New messages count:', newMessages.length);
      return newMessages;
    });

    try {
      // Check chat mode first
      console.log('🔍 [Chat Mode] Current chat mode:', chatMode);
      console.log('🔍 [Chat Mode] Input text length:', inputText.length);
      console.log('🔍 [Chat Mode] Input text preview:', inputText.substring(0, 50));
      console.log('🔍 [Chat Mode] Chat mode comparison result:', chatMode === 'chat');
      console.log('🔍 [Chat Mode] Chat mode type:', typeof chatMode);
      console.log('🔍 [Chat Mode] Chat mode value:', JSON.stringify(chatMode));
      console.log('🔍 [Chat Mode] Is processing state:', isProcessing);
      console.log('🔍 [Chat Mode] Messages count:', messages.length);
      console.log('🔍 [Chat Mode] User input state:', userInput);
      
                  if (chatMode === 'chat') {
              console.log('💬 [Chat Mode] Processing as conversational message:', inputText);
              
              // Generate conversation history for context (improved for better memory)
              const conversationHistory = messages
                .filter(msg => msg.type === 'user' || msg.type === 'assistant')
                .filter(msg => !msg.isWelcomeMessage && !msg.isShotSuggestion && !msg.isProgressMessage) // Skip system messages
                .map(msg => {
                  // Truncate very long messages but keep more context
                  const maxLength = msg.type === 'assistant' ? 800 : 200; // Allow longer assistant messages
                  const content = msg.content.length > maxLength 
                    ? msg.content.substring(0, maxLength) + '...' 
                    : msg.content;
                  return `${msg.type === 'user' ? 'User' : 'Assistant'}: ${content}`;
                })
                .slice(-12); // Keep last 12 messages for better context
              
              console.log('💬 [Chat Mode] Conversation history for context:', conversationHistory);
              console.log('💬 [Chat Mode] Total messages in history:', messages.length);
              console.log('💬 [Chat Mode] Filtered conversation history length:', conversationHistory.length);
              
              // Generate Claude AI-powered conversational response
              let responseContent: string = '';
              
              try {
                console.log('🤖 [Claude AI] Generating conversational response via API...');
                
                // Call the chat API endpoint
                const apiResponse = await fetch('/api/chat', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userInput: inputText,
                    conversationHistory: conversationHistory
                  }),
                });
                
                if (!apiResponse.ok) {
                  throw new Error(`API request failed: ${apiResponse.status}`);
                }
                
                const result = await apiResponse.json();
                
                if (result.success && result.response) {
                  responseContent = result.response;
                  console.log('✅ [Claude AI] Response generated successfully via API');
                  console.log('🤖 [Claude AI] Response length:', responseContent.length);
                  console.log('🤖 [Claude AI] Response preview:', responseContent.substring(0, 200) + '...');
                } else {
                  throw new Error(result.error || 'No response from API');
                }
                
              } catch (error) {
                console.error('❌ [Claude AI] Error generating response:', error);
                
                // Fallback to intelligent template-based response
                console.log('🔄 [Chat Mode] Falling back to template-based response');
                responseContent = generateFallbackResponse(inputText);
              }
        
        console.log('💬 [Chat Mode] Generated response content length:', responseContent.length);
        console.log('💬 [Chat Mode] Response content preview:', responseContent.substring(0, 100));
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          status: 'completed',
        };
        
        console.log('💬 [Chat Mode] Created assistant message:', {
          id: assistantMessage.id,
          type: assistantMessage.type,
          status: assistantMessage.status,
          contentLength: assistantMessage.content.length
        });
        
        console.log('💬 [Chat Mode] About to add assistant message to state');
        console.log('💬 [Chat Mode] Assistant message content:', assistantMessage.content.substring(0, 100) + '...');
        setMessages(prev => {
          console.log('💬 [Chat Mode] Previous messages count:', prev.length);
          const newMessages = [...prev, assistantMessage];
          console.log('💬 [Chat Mode] New messages count:', newMessages.length);
          return newMessages;
        });
        console.log('💬 [Chat Mode] Assistant message added to state');
        setIsProcessing(false);
        console.log('💬 [Chat Mode] Processing completed, returning');
        console.log('💬 [Chat Mode] Final state check - isProcessing:', isProcessing);
        console.log('💬 [Chat Mode] Final state check - messages count:', messages.length);
        return;
      }
      
      // Check if this is a style command
      if (inputText.startsWith('/')) {
        console.log('🎨 [Style] Detected style command:', inputText);
        await handleStyleCommandExecution(inputText);
        return;
      }
      
      // Animation requests are now handled by dedicated animate buttons on images
      // No longer processing "animate it" commands in chat interface
      
      // Check if this is a workflow request
      if (detectWorkflowRequest(inputText)) {
        console.log('🔄 [Workflow] Detected workflow request:', inputText);
        
        // Create workflow
        const intent = await intelligenceCore.analyzeUserIntent(inputText, contentType);
        
        const delegation = await intelligenceCore.selectOptimalModel(intent);
        const workflow = {
          id: `workflow-${Date.now()}`,
          name: 'Automated Workflow',
          description: 'Executing multiple generations',
          steps: createWorkflowSteps(inputText, intent),
           model: delegation?.modelId || 'fal-ai/flux-pro/v1.1-ultra', // Default to Flux for workflows
          intent: intent.type,
          parameters: delegation?.parameters || {}
        };

        // Add workflow start message
        const workflowMessage: ChatMessage = {
          id: `workflow-start-${Date.now()}`,
          type: 'assistant',
          content: `🚀 **Automated Workflow Detected!**

I've identified this as a workflow request and will automatically execute ${workflow.steps.length} generations:

${workflow.steps.map((step: any, index: number) => `${index + 1}. ${step.description}`).join('\n')}

Starting workflow execution...`,
          timestamp: new Date(),
          status: 'processing',
        };
        setMessages(prev => [...prev, workflowMessage]);

        // Execute the workflow
        await executeWorkflow(workflow);
      } else {
        // Regular single generation
        await handleRegularGeneration(inputText, generationId);
      }
    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '❌ **Error**: I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
        status: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Processing Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract regular generation logic
  const handleRegularGeneration = async (userInput: string, generationId?: string) => {
    console.log('🚀 [IntelligentChatInterface] Starting generation process');
    console.log('🚀 [IntelligentChatInterface] Original user input:', userInput);
    console.log('📋 [IntelligentChatInterface] Delegation data:', pendingDelegation);
    console.log('🎨 [IntelligentChatInterface] Style image uploaded:', hasStyleImageUploaded);
    console.log('🎨 [IntelligentChatInterface] Style reference image:', styleReferenceImage);
    
    // Start generation state tracking
    startGeneration('image', 'Regular generation process');
    
    // Sync video model with user preferences before generation
    const syncedVideoModel = syncVideoModelWithPreferences();
    console.log('🎬 [IntelligentChatInterface] Using synced video model for generation:', syncedVideoModel);
    
    // Declare variables at the function level
    let progressInterval: NodeJS.Timeout | null = null;
    let currentDelegation = pendingDelegation;
    let videoModelToUse = syncedVideoModel || currentVideoModel;
    
    try {
      // Check if there's an uploaded image and user provided a prompt (intent-driven workflow)
      if (uploadedImage && userInput.trim()) {
        console.log('🖼️ [IntelligentChatInterface] Uploaded image detected with user prompt');
        
        // Get the saved preferences to determine which model to use
        const saved = localStorage.getItem('narrative-model-preferences');
        if (!saved) {
          throw new Error('No model preferences found. Please set your preferred models first.');
        }

        const preferences = JSON.parse(saved);
        
        // Check if this is an image editing request
        if (userInput.toLowerCase().includes('edit') || userInput.toLowerCase().includes('modify') || 
            userInput.toLowerCase().includes('change') || userInput.toLowerCase().includes('transform')) {
          console.log('✏️ [IntelligentChatInterface] Detected image editing request');
          
          // Use the user's preferred image model or nano-banana/edit
          const imageModel = preferences.image || 'fal-ai/nano-banana/edit';
          
          // Get delegation for image editing
          const intent = await intelligenceCore.analyzeUserIntent(userInput, 'image');
          const delegation = await intelligenceCore.selectOptimalModel(intent);
          
          if (delegation) {
            // Override the model to use the user's preference or nano-banana/edit
            delegation.modelId = imageModel;
            delegation.reason = 'Image-to-image editing with user prompt';
            
            // Add the image_urls parameter for image editing
            const enhancedPrompt = userInput.trim().startsWith('edit') || userInput.trim().startsWith('modify') || userInput.trim().startsWith('change')
              ? `${userInput.trim()} - make dramatic and noticeable changes`
              : `Edit this image with dramatic and noticeable changes: ${userInput.trim()}`;
            
            delegation.parameters = {
              ...delegation.parameters,
              image_urls: [uploadedImage],
              prompt: enhancedPrompt,
              num_images: 1,
              output_format: "jpeg",
              strength: 0.9,
              guidance_scale: 7.5
            };
            
            // Set the pending delegation
            setPendingDelegation(delegation);
            startGeneration('image', 'Image-to-image editing');
            
            // Add delegation message
            const delegationMessage: ChatMessage = {
              id: `delegation-${Date.now()}`,
              type: 'assistant',
              content: `✏️ **Edit Ready**: Your image is ready to be edited using ${imageModel}`,
              timestamp: new Date(),
              intent: intent,
              delegation: delegation,
              status: 'pending',
            };
            setMessages(prev => [...prev, delegationMessage]);
            
            // Clear the uploaded image after setting up the delegation
            setUploadedImage(null);
            setImagePreview(null);
            
            // Continue with the generation process
            currentDelegation = delegation;
          } else {
            throw new Error('No suitable image editing model found. Please check your model preferences.');
          }
        } else {
          // Default to animation
          console.log('🎬 [IntelligentChatInterface] Defaulting to animation request');
          
          // Use the user's preferred video model
          const videoModel = preferences.video || videoModelToUse;
          
          // Get delegation from intelligence core for video generation
          const videoIntent = await intelligenceCore.analyzeUserIntent(userInput, 'video');
          const delegation = await intelligenceCore.selectOptimalModel(videoIntent);
          
          if (delegation) {
            // Override the model to use the user's preferred video model
            delegation.modelId = videoModel;
            delegation.reason = 'Image-to-video animation with user prompt';
            
            // Add the image_url parameter for video generation
            delegation.parameters = {
              ...delegation.parameters,
              image_url: uploadedImage,
              prompt: userInput.trim()
            };
            
            // Set the pending delegation
            setPendingDelegation(delegation);
            startGeneration('video', 'Image-to-video animation');
            
            // Add delegation message
            const delegationMessage: ChatMessage = {
              id: `delegation-${Date.now()}`,
              type: 'assistant',
              content: `🎬 **Animation Ready**: Your image is ready to be animated using ${videoModel}`,
              timestamp: new Date(),
              intent: videoIntent,
              delegation: delegation,
              status: 'pending',
            };
            setMessages(prev => [...prev, delegationMessage]);
            
            // Clear the uploaded image after setting up the delegation
            setUploadedImage(null);
            setImagePreview(null);
            
            // Continue with the generation process
            currentDelegation = delegation;
          } else {
            throw new Error('No suitable video model found for animation. Please check your model preferences.');
          }
        }
      }
      
      // Check if a style image is uploaded and we should show the delegation selector
      if (hasStyleImageUploaded && styleReferenceImage && !isPendingStyleGeneration()) {
        console.log('🎨 [IntelligentChatInterface] Style image detected, showing delegation selector');
        
        // Create a context that includes the style reference image
        const styleContext = `[Image uploaded: ${styleReferenceImage} - requesting image-to-image style transfer] ${userInput}`;
        
        // Get delegation from intelligence core to ensure proper prompt enhancement
        const intent = await intelligenceCore.analyzeUserIntent(styleContext, 'image', true);
        const delegation = await intelligenceCore.selectOptimalModel(intent);
        
        if (delegation) {
          // Override the model to use FLUX LoRA
          delegation.modelId = 'fal-ai/flux-krea-lora/image-to-image';
          delegation.reason = 'Style transfer using uploaded reference image';
          
          // Add the image_url parameter for FLUX LoRA
          if (styleReferenceImage) {
            delegation.parameters = {
              ...delegation.parameters,
              image_url: styleReferenceImage
            };
            console.log('🎨 [IntelligentChatInterface] Added image_url to FLUX LoRA delegation:', styleReferenceImage);
          }
          
          // Set the pending delegation
          setPendingDelegation(delegation);
          startGeneration('style', 'Style transfer generation');
          
          // Add delegation selector message
          const delegationMessage: ChatMessage = {
            id: `delegation-${Date.now()}`,
            type: 'assistant',
            content: `🎨 **Style ready**`,
            timestamp: new Date(),
            status: 'pending',
          };
          
          setMessages(prev => [...prev, delegationMessage]);
          return; // Don't proceed with generation yet
        }
      }
      
      // If no delegation exists, get it from the intelligence core
      if (!currentDelegation) {
        console.log('🔍 [IntelligentChatInterface] No delegation found, getting from intelligence core');
        console.log('🔍 [IntelligentChatInterface] Current contentType:', contentType);
        console.log('🔍 [IntelligentChatInterface] Current model preferences:', modelPreferences);
        console.log('🔍 [IntelligentChatInterface] Has style image uploaded:', hasStyleImageUploaded);
        
        // Check if we have an uploaded image for smart action detection
        const hasUploadedImage = hasStyleImageUploaded || !!uploadedImage;
        console.log('🔍 [IntelligentChatInterface] Has uploaded image for action detection:', hasUploadedImage);
        
        // First analyze the intent with the current content type and image upload status
        const intent = await intelligenceCore.analyzeUserIntent(userInput, contentType, hasUploadedImage);
        console.log('📊 [IntelligentChatInterface] Intent analysis result:', intent);
        
        // Then select the optimal model based on the intent
        const delegation = await intelligenceCore.selectOptimalModel(intent);
        console.log('📊 [IntelligentChatInterface] Model selection result:', delegation);
        
        if (delegation) {
          console.log('✅ [IntelligentChatInterface] Delegation received from intelligence core:', delegation);
          console.log('🎯 [IntelligentChatInterface] Selected model ID:', delegation.modelId);
          console.log('🎯 [IntelligentChatInterface] Selection reason:', delegation.reason);
          console.log('🎯 [IntelligentChatInterface] Confidence:', delegation.confidence);
          currentDelegation = delegation; // Use the delegation directly
          setPendingDelegation(delegation);
          setCurrentIntent(intent);
        } else {
          console.log('❌ [IntelligentChatInterface] No delegation returned from intelligence core');
          console.log('❌ [IntelligentChatInterface] Intent analysis result:', intent);
          console.log('❌ [IntelligentChatInterface] Available models:', intelligenceCore.getModelCapabilities());
          throw new Error('No suitable model found for this request. Please check your model preferences.');
        }
      }
      
      // Verify we have a delegation
      if (!currentDelegation) {
        console.error('❌ [IntelligentChatInterface] No delegation available for generation');
        throw new Error('No delegation available for generation');
      }
      
      // Verify delegation has required properties
      if (!currentDelegation.modelId) {
        console.error('❌ [IntelligentChatInterface] Delegation missing modelId:', currentDelegation);
        throw new Error('Delegation missing model ID');
      }
      
      if (!currentDelegation.parameters) {
        console.error('❌ [IntelligentChatInterface] Delegation missing parameters:', currentDelegation);
        throw new Error('Delegation missing parameters');
      }
      
      // Prepare generation data
      const generationData: Record<string, any> = {
        model: currentDelegation.intent === 'video' ? videoModelToUse : currentDelegation.modelId,
        ...currentDelegation.parameters,
      };
      
      console.log('🔍 [IntelligentChatInterface] Delegation validation:', {
        hasDelegation: !!currentDelegation,
        hasModelId: !!currentDelegation.modelId,
        hasParameters: !!currentDelegation.parameters,
        parametersKeys: currentDelegation.parameters ? Object.keys(currentDelegation.parameters) : 'none',
        intent: currentDelegation.intent,
        modelId: currentDelegation.modelId
      });
      
      // Ensure required parameters for Luma models
      if (generationData.model?.includes('luma')) {
        // Set default resolution if not provided
        if (!generationData.resolution) {
          generationData.resolution = '1080p'; // Default for Luma Ray 2 Flash
          console.log('🎬 [Video] Setting default resolution for Luma model:', generationData.resolution);
        }
        
        // Ensure duration has 's' suffix
        if (generationData.duration && !generationData.duration.endsWith('s')) {
          generationData.duration = generationData.duration + 's';
          console.log('🎬 [Video] Fixed duration format for Luma model:', generationData.duration);
        }
        
        // Ensure aspect_ratio is set
        if (!generationData.aspect_ratio) {
          generationData.aspect_ratio = '16:9'; // Default aspect ratio
          console.log('🎬 [Video] Setting default aspect ratio for Luma model:', generationData.aspect_ratio);
        }
      }
      
      console.log('🎬 [Video] Generation data model assignment:', {
        intent: currentDelegation.intent,
        videoModelToUse,
        currentDelegationModelId: currentDelegation.modelId,
        finalModel: generationData.model
      });

      console.log('📦 [IntelligentChatInterface] Prepared generation data:', generationData);
      console.log('📦 [IntelligentChatInterface] Model ID:', currentDelegation.modelId);
      console.log('📦 [IntelligentChatInterface] Parameters:', currentDelegation.parameters);
      
      // Validate generation data
      if (!generationData.model) {
        throw new Error('Missing model ID in generation data');
      }
      
      if (!generationData.prompt && !generationData.image_url) {
        throw new Error('Missing prompt or image_url in generation data');
      }
      console.log('📦 [IntelligentChatInterface] All keys in generation data:', Object.keys(generationData));
      console.log('📦 [IntelligentChatInterface] Enhanced prompt in generation data:', generationData.prompt);
      console.log('📦 [IntelligentChatInterface] Structured prompt for display:', generationData.structuredPromptForDisplay);

             // Handle video generation with polling
       if (currentDelegation.intent === 'video' && onContentGenerated) {
         console.log('🎬 [Video] Starting video generation with polling');
         
         // Update generation state to video
         startGeneration('video', 'Video generation with polling');
         
         // Use the synced video model for video generation
         videoModelToUse = syncedVideoModel || currentVideoModel;
         console.log('🎬 [Video] Using video model for generation:', videoModelToUse);
         
         // Validate that the video model exists in available endpoints
         const videoModels = AVAILABLE_ENDPOINTS.filter((model: ApiInfo) => model.category === 'video');
         const modelExists = videoModels.some((model: ApiInfo) => model.endpointId === videoModelToUse);
         console.log('🎬 [Video] Model validation:', {
           videoModelToUse,
           modelExists,
           availableVideoModels: videoModels.map(m => m.endpointId)
         });
         
         if (!modelExists) {
           console.error('❌ [Video] Video model not found in available endpoints:', videoModelToUse);
           throw new Error(`Video model ${videoModelToUse} is not available`);
         }
         
         try {
           // Call the content generated callback instead of onGenerate
           const result = await onContentGenerated(generationData);
           console.log('📞 [Video] Initial generation response sent');
           
           // Start progress tracking for video generation
           const estimatedTime = currentDelegation.estimatedTime || '2-5 minutes';
           progressInterval = startVideoProgress(currentVideoModel, estimatedTime);
           
           // Add progress bar message directly to chat
           const progressMessage: ChatMessage = {
             id: (Date.now() + 1).toString(),
             type: 'assistant',
             content: `🎬 **Generating Video**\n\nUsing ${currentVideoModel}\n\n**Estimated Time:** ${estimatedTime}`,
             timestamp: new Date(),
             status: 'processing',
             isProgressMessage: true, // Add flag to identify progress messages
           };
           setMessages(prev => [...prev, progressMessage]);
         } catch (error) {
           console.error('❌ [Video] Video generation error:', error);
           setGenerationProgress(null);
           throw error;
         }
             } else if (onContentGenerated) {
        // Handle image generation normally
        console.log('📞 [IntelligentChatInterface] Calling onContentGenerated callback');
        console.log('📞 [IntelligentChatInterface] Generation data being sent:', generationData);
        
        // Validate generation data before calling callback
        if (!generationData || Object.keys(generationData).length === 0) {
          console.error('❌ [IntelligentChatInterface] Empty generation data, cannot call onContentGenerated');
          throw new Error('Empty generation data - cannot proceed with generation');
        }
        
        if (!generationData.model) {
          console.error('❌ [IntelligentChatInterface] Missing model in generation data:', generationData);
          throw new Error('Missing model in generation data');
        }
        
        if (!generationData.prompt && !generationData.image_url) {
          console.error('❌ [IntelligentChatInterface] Missing prompt or image_url in generation data:', generationData);
          throw new Error('Missing prompt or image_url in generation data');
        }
         
        // Call the content generated callback instead of onGenerate
        const result = await onContentGenerated(generationData);
        console.log('📞 [IntelligentChatInterface] Content generation callback completed');
          console.log('📞 [IntelligentChatInterface] Result type:', typeof result);
          console.log('📞 [IntelligentChatInterface] Result keys:', result ? Object.keys(result) : 'null/undefined');
          
          // If we got a result with generated content, display it
          console.log('🔍 [IntelligentChatInterface] Checking if result has content...');
          console.log('🔍 [IntelligentChatInterface] Result exists:', !!result);
          console.log('🔍 [IntelligentChatInterface] Result keys:', result ? Object.keys(result) : 'null/undefined');
          console.log('🔍 [IntelligentChatInterface] Result.data:', result?.data);
          console.log('🔍 [IntelligentChatInterface] Result.data.images:', result?.data?.images);
          console.log('🔍 [IntelligentChatInterface] Result.data.video:', result?.data?.video);
          console.log('🔍 [IntelligentChatInterface] Result.data.audio:', result?.data?.audio);
          
          // Check both direct properties and nested data properties
          const hasContent = result && (
            (result.images || result.video || result.audio) ||
            (result.data && (result.data.images || result.data.video || result.data.audio))
          );
          
          console.log('🔍 [IntelligentChatInterface] Content detection debug:');
          console.log('🔍 [IntelligentChatInterface] - result exists:', !!result);
          console.log('🔍 [IntelligentChatInterface] - result.data exists:', !!result?.data);
          console.log('🔍 [IntelligentChatInterface] - result.data.video exists:', !!result?.data?.video);
          console.log('🔍 [IntelligentChatInterface] - hasContent:', hasContent);
          
          if (hasContent) {
            console.log('🖼️ [IntelligentChatInterface] Displaying generated content:', result);
                        console.log('🖼️ [IntelligentChatInterface] Result structure:', {
              hasImages: !!(result.images || result.data?.images),
              imagesLength: (result.images || result.data?.images)?.length,
              hasVideo: !!(result.video || result.data?.video),
              hasAudio: !!(result.audio || result.data?.audio),
              resultKeys: Object.keys(result)
            });
            
            // Get the actual content data (either direct or nested in data)
            const contentData = result.data || result;
            
            // Dispatch event to notify the content display panel
            if (contentData.images && contentData.images.length > 0) {
              console.log('🖼️ [IntelligentChatInterface] Processing multiple images:', contentData.images.length);
              
              // Extract all image URLs
              const imageUrls = contentData.images.map((img: any) => img.url);
              const firstImage = contentData.images[0];
              
              console.log('🖼️ [IntelligentChatInterface] Image URLs:', imageUrls);
              console.log('🖼️ [IntelligentChatInterface] First image:', firstImage);
              
              // Debug prompt passing
              console.log('🔍 [IntelligentChatInterface] Debugging prompt passing:');
              console.log('🔍 [IntelligentChatInterface] - pendingDelegation?.parameters.structuredPromptForDisplay:', pendingDelegation?.parameters.structuredPromptForDisplay);
              console.log('🔍 [IntelligentChatInterface] - contentData.prompt:', contentData.prompt);
              console.log('🔍 [IntelligentChatInterface] - result.prompt:', result.prompt);
              console.log('🔍 [IntelligentChatInterface] - pendingDelegation?.parameters.prompt:', pendingDelegation?.parameters.prompt);
              
              const eventDetail = {
                id: generationId || Date.now().toString(),
                type: 'image',
                url: firstImage.url, // Use first image as primary URL
                title: `Generated Image - ${new Date().toLocaleTimeString()}`,
                prompt: pendingDelegation?.parameters.structuredPromptForDisplay || contentData.prompt || result.prompt || pendingDelegation?.parameters.prompt,
                timestamp: new Date(),
                metadata: {
                  width: firstImage.width,
                  height: firstImage.height,
                  format: firstImage.content_type,
                },
                // Add multiple images data
                images: imageUrls,
                imageCount: contentData.images.length,
                selectedImageIndex: 0 // Default to first image
              };
              
                             console.log('🚀 [IntelligentChatInterface] Event detail to be dispatched:', eventDetail);
               const contentEvent = new CustomEvent('content-generated', { detail: eventDetail });
               console.log('🚀 [IntelligentChatInterface] Event object created:', contentEvent);
               console.log('🚀 [IntelligentChatInterface] About to dispatch event...');
               window.dispatchEvent(contentEvent);
               console.log('✅ [IntelligentChatInterface] Event dispatched successfully');
               
               // Store the last generated image URL for future animation requests
              setLastGeneratedImage(firstImage.url);
              setLastGeneratedImagePrompt(userInput);
              console.log('💾 [IntelligentChatInterface] Stored last generated image URL:', firstImage.url);
                       } else if (contentData.video) {
              console.log('🎬 [IntelligentChatInterface] Processing video content:', contentData.video);
              const contentEvent = new CustomEvent('content-generated', {
                detail: {
                  id: Date.now().toString(),
                  type: 'video',
                  url: contentData.video.url,
                  title: `Generated Video - ${new Date().toLocaleTimeString()}`,
                prompt: contentData.prompt || pendingDelegation?.parameters.prompt,
                  timestamp: new Date(),
                  metadata: {
                    format: 'mp4',
                  }
                }
              });
              console.log('🎬 [IntelligentChatInterface] Dispatching video content event:', contentEvent.detail);
              window.dispatchEvent(contentEvent);
            } else if (contentData.audio) {
              const contentEvent = new CustomEvent('content-generated', {
                detail: {
                  id: Date.now().toString(),
                  type: 'audio',
                  url: contentData.audio.url,
                  title: `Generated Audio - ${new Date().toLocaleTimeString()}`,
                prompt: contentData.prompt || pendingDelegation?.parameters.prompt,
                  timestamp: new Date(),
                  metadata: {
                    format: 'mp3',
                  }
                }
              });
              window.dispatchEvent(contentEvent);
            }
           
                    // Add a completion message with inline content display
           const resultMessage: ChatMessage = {
             id: (Date.now() + 2).toString(),
            type: 'assistant',
            content: '✅ **Gen komplete**',
             timestamp: new Date(),
             status: 'completed',
             // Add generated content for inline display
             generatedContent: {
               type: contentData.images ? 'image' : contentData.video ? 'video' : 'audio',
               url: contentData.images ? contentData.images[0].url : contentData.video?.url || contentData.audio?.url,
               images: contentData.images ? contentData.images.map((img: any) => img.url) : undefined,
               imageCount: contentData.images?.length,
               prompt: pendingDelegation?.parameters.structuredPromptForDisplay || contentData.prompt || result.prompt || pendingDelegation?.parameters.prompt,
               metadata: contentData.images ? {
                 width: contentData.images[0].width,
                 height: contentData.images[0].height,
                 format: contentData.images[0].content_type,
               } : contentData.video ? {
                 format: 'mp4',
               } : {
                 format: 'mp3',
               }
             }
           };
           
           console.log('📝 [IntelligentChatInterface] Content already added via event - skipping duplicate message');
           // Note: Content is already added to chat via the content-generated event
           // No need to add resultMessage here as it would create a duplicate
         }
      } else {
        console.warn('⚠️ [IntelligentChatInterface] No onContentGenerated callback provided');
      }

      // Update message status
      console.log('🔄 [IntelligentChatInterface] Updating message status to completed');
      setMessages(prev => prev.map(msg => 
        msg.delegation?.modelId === pendingDelegation?.modelId
          ? { ...msg, status: 'completed' }
          : msg
      ));

      // Reset authorization after generation
      console.log('🔄 [IntelligentChatInterface] Resetting authorization and state');
      intelligenceCore.resetAuthorization();
      setPendingDelegation(null);
      setCurrentIntent(null);
      
      // Reset style generation state after successful generation
      if (isPendingStyleGeneration()) {
        console.log('🔄 [IntelligentChatInterface] Resetting style generation state');
        stopGeneration();
        setHasStyleImageUploaded(false);
        setStyleReferenceImage(null);
      }

      console.log('✅ [IntelligentChatInterface] Generation process completed successfully');
      
      // Stop generation state tracking
      stopGeneration();
      
      toast({
        title: "Generation Started",
        description: `Delegated to ${pendingDelegation?.modelId}. Estimated time: ${pendingDelegation?.estimatedTime}`,
      });

    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error during generation:', error);
       
       // Clear progress on error
       if (currentDelegation?.intent === 'video') {
         setGenerationProgress(null);
       }
       
       // Stop generation state tracking on error
       stopGeneration();
      
      console.log('🔄 [IntelligentChatInterface] Updating message status to error');
      setMessages(prev => prev.map(msg => 
        msg.delegation?.modelId === pendingDelegation?.modelId
          ? { ...msg, status: 'error' }
          : msg
      ));

      toast({
        title: "Generation Error",
        description: "Failed to start generation. Please try again.",
        variant: "destructive",
      });
     } finally {
       // Clear the progress interval
       if (progressInterval) {
         clearInterval(progressInterval);
       }
    }
  };

  const handleGenerateNow = async () => {
    console.log('⚡ [IntelligentChatInterface] Generate Now button clicked');
    
    if (!pendingDelegation) {
      console.log('❌ [IntelligentChatInterface] No pending delegation to generate');
      toast({
        title: "No Generation Ready",
        description: "Please describe what you want to create first.",
        variant: "destructive",
      });
      return;
    }

    // Check if required models are selected
    console.log('🔍 [IntelligentChatInterface] Current model preferences:', modelPreferences);
    console.log('🔍 [IntelligentChatInterface] Current intent:', currentIntent);
    const modelRequirementError = checkModelRequirements(pendingDelegation);
    if (modelRequirementError) {
      console.log('❌ [IntelligentChatInterface] Model requirement not met:', modelRequirementError);
      
      // Add error message to chat with helpful guidance
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `⚙️ **Model Selection Required**

${modelRequirementError}

**Quick Fix:**
1. Click the **"Model Preferences"** button above
2. Select a model for the **${currentIntent?.type}** category
3. Click **"Done"** to save your preferences
4. Try generating again!

This ensures I use your preferred AI model for the best results. 🎯`,
        timestamp: new Date(),
        status: 'error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Model Selection Required",
        description: "Please set up your model preferences to continue",
        variant: "destructive",
      });
      
      return;
    }

    console.log('✅ [IntelligentChatInterface] Authorizing generation');
    intelligenceCore.authorizeGeneration();
     
     // Dispatch generation start event
     const generationStartEvent = new CustomEvent('generation-started');
     window.dispatchEvent(generationStartEvent);
    
    // Update the last assistant message status to processing
    setMessages(prev => {
      const newMessages = [...prev];
      const lastAssistantMessage = newMessages.findLast(msg => msg.type === 'assistant');
      if (lastAssistantMessage) {
        lastAssistantMessage.status = 'processing';
      }
      return newMessages;
    });

    // Start generation by calling handleRegularGeneration
    await handleRegularGeneration(pendingDelegation.parameters.prompt || 'Generated content');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    console.log('🎯 [IntelligentChatInterface] Suggestion clicked:', suggestion);
    
    // Set the input to the suggestion
    setUserInput(suggestion);
    
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the suggestion immediately
    try {
      setIsProcessing(true);
      
      // Check if this is a workflow request
      const isWorkflow = detectWorkflowRequest(suggestion);
      
      if (isWorkflow) {
        console.log('🔄 [IntelligentChatInterface] Workflow detected for suggestion:', suggestion);
        
        // Get intent and delegation
        const intent = await intelligenceCore.analyzeUserIntent(suggestion);
        const delegation = await intelligenceCore.selectOptimalModel(intent);
        
        if (!delegation) {
          throw new Error('No suitable model found for workflow execution');
        }
        
        // Create workflow with proper model selection
        const workflow = {
          id: `workflow-${Date.now()}`,
          name: 'Automated Workflow',
          description: 'Executing multiple generations',
          steps: createWorkflowSteps(suggestion, intent),
                     model: delegation?.modelId || 'fal-ai/flux-pro/v1.1-ultra', // Default to Flux for workflows
          intent: intent.type,
          parameters: delegation?.parameters || {}
        };

        // Add workflow start message
        const workflowMessage: ChatMessage = {
          id: `workflow-start-${Date.now()}`,
          type: 'assistant',
          content: `🚀 **Automated Workflow Detected!**

I've identified this as a workflow request and will automatically execute ${workflow.steps.length} generations:

${workflow.steps.map((step: any, index: number) => `${index + 1}. ${step.description}`).join('\n')}

Starting workflow execution...`,
          timestamp: new Date(),
          status: 'processing',
        };
        setMessages(prev => [...prev, workflowMessage]);

        // Execute the workflow
        await executeWorkflow(workflow);
      } else {
        // Regular single generation
        await handleRegularGeneration(suggestion);
      }
    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error processing suggestion:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        status: 'error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add new function to handle AI suggestion clicks
  const handleAISuggestionClick = async (suggestion: string) => {
    console.log('🎯 [IntelligentChatInterface] AI suggestion clicked:', suggestion);
    
    // Check if a model is selected for the appropriate category
    const intent = await intelligenceCore.analyzeUserIntent(suggestion);
    const categoryMap: Record<string, keyof ModelPreferences> = {
      'image': 'image',
      'video': 'video',
      'audio': 'music',
      'voiceover': 'voiceover',
    };
    
    const category = categoryMap[intent.type];
    const selectedModel = category ? modelPreferences[category] : null;
    
    if (!selectedModel || selectedModel === 'none') {
      // No model selected, show error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ **Model Required**: Please select a ${intent.type} model in Model Preferences to generate "${suggestion}"`,
        timestamp: new Date(),
        status: 'error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Model Selection Required",
        description: `Please select a ${intent.type} model in Model Preferences first.`,
        variant: "destructive",
      });
      return;
    }
    
    // Model is selected, proceed with generation
    console.log('✅ [IntelligentChatInterface] Model selected, proceeding with generation');
    
    // Create user message for the suggestion
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the suggestion through intelligence core
    try {
      setIsProcessing(true);
      
      const result = await intelligenceCore.processUserInput(suggestion);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🎯 **Generating**: "${suggestion}"\n\nI'm creating your ${intent.type} content using ${selectedModel}.`,
        timestamp: new Date(),
        intent: intent,
        delegation: result.delegation || undefined,
        status: result.requiresAction ? 'processing' : undefined,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (result.delegation) {
        setPendingDelegation(result.delegation);
        setCurrentIntent(intent);
        
        // Automatically start generation
        intelligenceCore.authorizeGeneration();
        await handleGenerateNow();
      }
      
    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error processing AI suggestion:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `❌ **Generation Failed**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        status: 'error',
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Generation Failed",
        description: "Failed to process the selected suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModelPreferencesChange = useCallback((preferences: ModelPreferences) => {
    console.log('📋 [IntelligentChatInterface] Model preferences change callback triggered');
    console.log('📋 [IntelligentChatInterface] New preferences:', preferences);
    console.log('📋 [IntelligentChatInterface] Previous preferences:', modelPreferences);
    
    // Check if video model changed
    if (preferences.video !== modelPreferences.video) {
      console.log('🎬 [IntelligentChatInterface] Video model preference changed from', modelPreferences.video, 'to', preferences.video);
      
      // Update currentVideoModel with the new preference
      if (preferences.video && preferences.video !== 'none') {
        setCurrentVideoModel(preferences.video);
        console.log('🎬 [IntelligentChatInterface] Updated currentVideoModel to new preference:', preferences.video);
      }
    }
    
    setModelPreferences(preferences);
    intelligenceCore.setModelPreferences(preferences);
    console.log('📋 [IntelligentChatInterface] Model preferences updated successfully');
  }, [intelligenceCore, modelPreferences]);

  // Removed delegation override functionality - no longer needed with intent-driven workflow

  // Drag and Drop Handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    console.log('🖱️ [IntelligentChatInterface] Drag enter');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    console.log('🖱️ [IntelligentChatInterface] Drag leave');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleImageUpload(imageFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, JPEG, GIF, WebP)",
        variant: "destructive",
      });
    }
  }, []);

  // Handle file upload with compression
  const handleImageUpload = useCallback(async (file: File) => {
    console.log('🖼️ [IntelligentChatInterface] Image uploaded:', file.name);
    
    try {
      // Compress the image to fit within API limits
      const compressedImageUrl = await compressImage(file, 1920, 1920, 0.8);
      
      // Store the compressed image URL for intent selection
      setUploadedImageForIntent(compressedImageUrl);
      setImagePreview(compressedImageUrl);
      
      // Add a user message indicating the image was uploaded
      const userMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: `[Image uploaded: ${file.name}]`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Show intent selection instead of immediately processing
      setShowIntentSelection(true);
      setSelectedIntent(null);
      setIntentValidation(null);

      toast({
        title: "Image Uploaded!",
        description: `${file.name} is ready. Please select what you want to do with this image.`,
      });
      
      console.log('✅ [IntelligentChatInterface] Image compressed and uploaded successfully');
      
    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error compressing image:', error);
      toast({
        title: "Image Upload Failed",
        description: "Failed to process the uploaded image. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('🗑️ [IntelligentChatInterface] Image removed');
  }, []);

  const handleStyleCommand = useCallback((command: string) => {
    console.log('🎨 [IntelligentChatInterface] Style command received:', command);
    
    // Copy the command to the input box
    setUserInput(command);
    
    // Show toast notification
    toast({
      title: "Style Command Added",
      description: `"${command}" has been added to your prompt. Press Enter to execute.`,
    });
  }, [toast]);

  const handleStyleAnalysis = useCallback((analysis: any) => {
    console.log('🎨 [IntelligentChatInterface] Style analysis received:', analysis);
    
    // Store the style analysis for use in the next prompt
    setStyleAnalysis(analysis);
    setExtractedStylePrompt(analysis.analysis);
    
    // Set the style analysis in the intelligence core
    intelligenceCore.setStyleAnalysis(analysis);
    
    // Show toast notification
    toast({
      title: "Style Analysis Complete",
      description: "Cinematic style elements have been extracted and will be applied to your next prompt.",
    });
  }, [toast]);

  const handleStyleImageUpload = useCallback((imageFile: File, imageUrl: string) => {
    console.log('🎨 [IntelligentChatInterface] Style image uploaded:', imageFile.name);
    
    // Store the style reference image
    setStyleReferenceImage(imageUrl);
    setHasStyleImageUploaded(true);
    
    // Show toast notification
    toast({
      title: "Style Image Uploaded",
      description: "Style reference image uploaded. Enter a prompt to generate with FLUX LoRA model.",
    });
  }, [toast]);

  // Fallback response generator for when Claude AI is not available
  const generateFallbackResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('prompt') && (lowerInput.includes('horror') || lowerInput.includes('monster') || lowerInput.includes('rat'))) {
      return `"A dimly lit basement, rats scurrying in shadows, handheld camera, practical lighting, close-up of terrified eyes."`;
    }
    
    if (lowerInput.includes('vampire') || lowerInput.includes('horror') || lowerInput.includes('scary') || lowerInput.includes('monster')) {
      return `Horror needs atmosphere! Deep shadows, practical lighting, close-ups for tension.`;
    }
    
    if (lowerInput.includes('director') || lowerInput.includes('style')) {
      return `Villeneuve: minimalism. Nolan: practical effects. Fincher: precision. Which interests you?`;
    }
    
    if (lowerInput.includes('lighting') || lowerInput.includes('light')) {
      return `Three-point lighting: key, fill, back. Warm=romantic, high contrast=drama.`;
    }
    
    if (lowerInput.includes('story') || lowerInput.includes('narrative') || lowerInput.includes('plot')) {
      return `Start with character conflict. Show, don't tell. What's your protagonist's problem?`;
    }
    
    // Default intelligent response
    return `What aspect of filmmaking would you like to explore?`;
  };

  const handleStyleCommandExecution = useCallback(async (command: string) => {
    console.log('🎨 [IntelligentChatInterface] Executing style command:', command);
    
    try {
      let responseMessage = '';
      
      switch (command) {
        case '/extract-style-from-current':
          if (lastGeneratedImage) {
            responseMessage = `🎨 **Style Extraction Ready!**

I'll analyze the cinematic style of your last generated image and apply it to your next prompt.

**Current Image:** ${lastGeneratedImagePrompt || 'Previous generation'}

Click "Generate Now" to extract and apply the style!`;
            
            // Create a delegation for style extraction
            const styleDelegation: TaskDelegation = {
              modelId: 'style-extraction',
              reason: 'Extract cinematic style from reference image',
              confidence: 0.9,
              estimatedTime: '30s',
              parameters: {
                imageUrl: lastGeneratedImage,
                basePrompt: lastGeneratedImagePrompt || 'cinematic style analysis'
              },
              intent: 'analysis'
            };
            
            setPendingDelegation(styleDelegation);
          } else {
            responseMessage = '❌ **No Image Available**: Please generate an image first before extracting its style.';
          }
          break;
          
        case '/apply-villeneuve-style':
          responseMessage = `🎬 **Denis Villeneuve Style Applied!**

Your next prompt will be enhanced with Villeneuve's signature techniques:
• Atmospheric, minimalist composition
• Natural window lighting
• Expansive environments with muted color palette
• Emphasis on mood and tone over action

Ready to generate with Villeneuve's cinematic approach!`;
          
          // Set the style analysis for Villeneuve
          const villeneuveStyle = {
            analysis: 'atmospheric, minimalist composition, natural window lighting, expansive environments with muted color palette, emphasis on mood and tone over action',
            director: 'Denis Villeneuve',
            confidence: 0.95
          };
          setStyleAnalysis(villeneuveStyle);
          intelligenceCore.setStyleAnalysis(villeneuveStyle);
          break;
          
        case '/apply-nolan-style':
          responseMessage = `🎬 **Christopher Nolan Style Applied!**

Your next prompt will be enhanced with Nolan's signature techniques:
• Practical effects and natural lighting
• Deep shadows and high contrast
• Real-world locations over studio sets
• Handheld camera for immediacy

Ready to generate with Nolan's authentic approach!`;
          
          // Set the style analysis for Nolan
          const nolanStyle = {
            analysis: 'practical effects and natural lighting, deep shadows and high contrast, real-world locations over studio sets, handheld camera for immediacy',
            director: 'Christopher Nolan',
            confidence: 0.95
          };
          setStyleAnalysis(nolanStyle);
          intelligenceCore.setStyleAnalysis(nolanStyle);
          break;
          
        case '/apply-fincher-style':
          responseMessage = `🎬 **David Fincher Style Applied!**

Your next prompt will be enhanced with Fincher's signature techniques:
• Precise geometric composition
• Controlled lighting with minimal shadows
• Digital color grading for mood
• Symmetrical framing

Ready to generate with Fincher's precise approach!`;
          break;
          
        case '/apply-kurosawa-style':
          responseMessage = `🎬 **Akira Kurosawa Style Applied!**

Your next prompt will be enhanced with Kurosawa's signature techniques:
• Dynamic weather elements (rain, wind, mud)
• Epic wide shots with multiple planes of action
• Natural lighting with dramatic shadows
• Emphasis on human emotion and drama

Ready to generate with Kurosawa's epic approach!`;
          break;
          
        case '/apply-hitchcock-style':
          responseMessage = `🎬 **Alfred Hitchcock Style Applied!**

Your next prompt will be enhanced with Hitchcock's signature techniques:
• Voyeuristic camera angles
• Precise geometric composition
• Suspense-building camera movements
• Psychological tension through framing

Ready to generate with Hitchcock's suspenseful approach!`;
          break;
          
        case '/apply-kubrick-style':
          responseMessage = `🎬 **Stanley Kubrick Style Applied!**

Your next prompt will be enhanced with Kubrick's signature techniques:
• Perfect symmetrical composition
• Precise tracking shots
• Atmospheric lighting design
• Psychological depth through framing

Ready to generate with Kubrick's precise approach!`;
          break;
          
        case '/apply-tarantino-style':
          responseMessage = `🎬 **Quentin Tarantino Style Applied!**

Your next prompt will be enhanced with Tarantino's signature techniques:
• Stylized action sequences
• Pop culture visual references
• Dynamic camera movements
• Genre-blending visual styles

Ready to generate with Tarantino's stylized approach!`;
          break;
          
        case '/apply-anderson-style':
          responseMessage = `🎬 **Wes Anderson Style Applied!**

Your next prompt will be enhanced with Anderson's signature techniques:
• Perfect symmetrical composition
• Pastel color palette
• Precise tracking shots
• Whimsical visual storytelling

Ready to generate with Anderson's whimsical approach!`;
          break;
          
        case '/apply-coen-style':
          responseMessage = `🎬 **Coen Brothers Style Applied!**

Your next prompt will be enhanced with the Coens' signature techniques:
• Dark comedy visual style
• Precise geometric composition
• Atmospheric lighting design
• Character-driven camera work

Ready to generate with the Coens' atmospheric approach!`;
          break;
          
        case '/apply-pta-style':
          responseMessage = `🎬 **Paul Thomas Anderson Style Applied!**

Your next prompt will be enhanced with PTA's signature techniques:
• Long takes with complex choreography
• Naturalistic lighting design
• Character intimacy through framing
• Cinematic realism approach

Ready to generate with PTA's naturalistic approach!`;
          break;
          
        default:
          if (command.startsWith('/upload-style-reference')) {
            responseMessage = `📁 **Style Reference Upload Ready!**

I'll analyze the uploaded image and extract its cinematic style elements to enhance your next prompt.

Click "Generate Now" to analyze and apply the style!`;
          } else {
            responseMessage = `❓ **Unknown Style Command**: "${command}"

Available commands:
• /extract-style-from-current - Analyze last generated image
• /apply-villeneuve-style - Apply Denis Villeneuve style
• /apply-nolan-style - Apply Christopher Nolan style
• /apply-fincher-style - Apply David Fincher style
• /apply-kurosawa-style - Apply Akira Kurosawa style
• /apply-hitchcock-style - Apply Alfred Hitchcock style
• /apply-kubrick-style - Apply Stanley Kubrick style
• /apply-tarantino-style - Apply Quentin Tarantino style
• /apply-anderson-style - Apply Wes Anderson style
• /apply-coen-style - Apply Coen Brothers style
• /apply-pta-style - Apply Paul Thomas Anderson style
• /upload-style-reference [filename] - Upload reference image`;
          }
      }
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `style-response-${Date.now()}`,
        type: 'assistant',
        content: responseMessage,
        timestamp: new Date(),
        status: 'completed'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error executing style command:', error);
      
      const errorMessage: ChatMessage = {
        id: `style-error-${Date.now()}`,
        type: 'assistant',
        content: '❌ **Error**: I encountered an issue processing the style command. Please try again.',
        timestamp: new Date(),
        status: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [lastGeneratedImage, lastGeneratedImagePrompt, setPendingDelegation, toast]);

  const handleQuickGenerate = useCallback(async () => {
    console.log('⚡ [IntelligentChatInterface] Quick Generate button clicked');
    
    if (!uploadedImage) {
      toast({
        title: "No Image Uploaded",
        description: "Please upload an image first to use Quick Generate.",
        variant: "destructive",
      });
      return;
    }

    // Check if video model is selected
    if (!modelPreferences.video || modelPreferences.video === 'none') {
      toast({
        title: "Video Model Required",
        description: "Please select a video model in Model Preferences to use Quick Generate.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get the image URL - if it's already a compressed string, use it directly
      let imageUrl: string;
      
      if (typeof uploadedImage === 'string') {
        // Already a compressed base64 string
        imageUrl = uploadedImage;
        console.log('✅ [IntelligentChatInterface] Using compressed image, length:', imageUrl.length);
      } else {
        // Convert File to base64 data URL for FAL.ai compatibility
        console.log('📤 [IntelligentChatInterface] Converting image to base64 for FAL.ai...');
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            console.log('✅ [IntelligentChatInterface] Image converted to base64, length:', result.length);
            resolve(result);
          };
          reader.onerror = (e) => {
            console.error('❌ [IntelligentChatInterface] Failed to convert image to base64:', e);
            reject(new Error('Failed to convert image to base64'));
          };
          reader.readAsDataURL(uploadedImage);
        });
      }

      // Generate default animation prompt based on image filename and type
      const defaultPrompts = [
        "Bring this image to life with subtle, natural movement",
        "Add gentle motion and atmospheric effects to this scene", 
        "Create a smooth, cinematic animation from this image",
        "Animate this image with realistic movement and depth",
        "Transform this static image into a dynamic video scene"
      ];
      
      const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
      
      console.log('⚡ [IntelligentChatInterface] Quick generate with prompt:', randomPrompt);

      // Create user message for quick generation with base64 image metadata
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: `${randomPrompt} [Image uploaded: ${imageUrl} - requesting image-to-video animation]`,
        timestamp: new Date(),
        attachments: [{
          type: 'image',
          name: typeof uploadedImage === 'object' ? uploadedImage.name : 'compressed_image.jpg',
          size: typeof uploadedImage === 'object' ? uploadedImage.size : imageUrl.length,
          preview: imagePreview
        }]
      };

      console.log('👤 [IntelligentChatInterface] Creating quick gen user message:', userMessage);
      setMessages(prev => [...prev, userMessage]);

      // Use the unified API endpoint for all models
      const apiEndpoint = '/api/generate';
      const generateData: any = {
        model: modelPreferences.video,
        prompt: randomPrompt.trim(),
        image_url: imageUrl,
        aspect_ratio: "16:9",
        duration: "5s",
        resolution: "540p",
        loop: false,
      };

      // Add uploaded image info if available
      if (uploadedImage) {
        if (typeof uploadedImage === 'object') {
          generateData.name = uploadedImage.name;
          generateData.size = uploadedImage.size;
        } else {
          generateData.name = 'compressed_image.jpg';
          generateData.size = uploadedImage.length;
        }
      }

      // Adjust parameters based on selected model
      if (modelPreferences.video === 'fal-ai/veo3/fast') {
        generateData.duration = "8s";
        generateData.resolution = "720p";
        generateData.enhance_prompt = true;
        generateData.auto_fix = true;
        generateData.generate_audio = true;
      } else if (modelPreferences.video === 'fal-ai/minimax/hailuo-02/standard/image-to-video') {
        generateData.duration = "6s";
        generateData.prompt_optimizer = true;
        generateData.resolution = "768P";
      } else if (modelPreferences.video?.includes('minimax')) {
        generateData.num_frames = 24;
        generateData.fps = 8;
        generateData.style_strength = 0.8;
        delete generateData.duration;
        delete generateData.resolution;
      } else if (modelPreferences.video === 'fal-ai/kling-video/v2.1/master/image-to-video') {
        generateData.duration = "5s";
        generateData.negative_prompt = "blur, distort, and low quality";
        generateData.cfg_scale = 0.5;
      }

      console.log('🎯 [IntelligentChatInterface] Quick gen API call:', apiEndpoint, generateData);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API call failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 [IntelligentChatInterface] Quick gen API response:', result);

      // Create success message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `✅ **Gen komplete**`,
        timestamp: new Date(),
        status: 'completed',
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Clear uploaded image after successful processing
      if (uploadedImage) {
        console.log('🗑️ [IntelligentChatInterface] Clearing uploaded image after quick gen');
        handleRemoveImage();
      }

      toast({
        title: "Quick Generate Complete!",
        description: "Your video has been generated successfully.",
      });

    } catch (error) {
      console.error('❌ [IntelligentChatInterface] Error during quick generate:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `❌ **Quick Generation Failed**: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or use the regular generation process.`,
        timestamp: new Date(),
        status: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Quick Generate Failed",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, imagePreview, modelPreferences.video, toast, handleRemoveImage]);

  const checkModelRequirements = (delegation: TaskDelegation): string | null => {
    console.log('🔍 [IntelligentChatInterface] Checking model requirements');
    console.log('🔍 [IntelligentChatInterface] Current intent:', currentIntent);
    console.log('🔍 [IntelligentChatInterface] Model preferences:', modelPreferences);
    console.log('🔍 [IntelligentChatInterface] Delegation modelId:', delegation.modelId);
    
    if (!currentIntent) {
      console.log('❌ [IntelligentChatInterface] No current intent');
      return null;
    }

    // Map intent types to preference categories
    const categoryMap: Record<string, keyof ModelPreferences> = {
      'image': 'image',
      'video': 'video',
      'audio': 'music',
      'voiceover': 'voiceover',
    };

    const category = categoryMap[currentIntent.type];
    console.log('🔍 [IntelligentChatInterface] Mapped category:', category);
    console.log('🔍 [IntelligentChatInterface] Intent type:', currentIntent.type);
    
    if (!category) {
      console.log('❌ [IntelligentChatInterface] No category mapping found for intent type:', currentIntent.type);
      return null;
    }

    const selectedModel = modelPreferences[category];
    console.log('🔍 [IntelligentChatInterface] Selected model for category', category, ':', selectedModel);
    console.log('🔍 [IntelligentChatInterface] Model preferences keys:', Object.keys(modelPreferences));
    console.log('🔍 [IntelligentChatInterface] Model preferences values:', Object.values(modelPreferences));
    
    // If no model is selected, provide a helpful message with a link to preferences
    if (!selectedModel || selectedModel === '' || selectedModel === null) {
      console.log('❌ [IntelligentChatInterface] No model selected for category:', category);
      return `Please select a ${category} model in Model Preferences to complete this request. Click the "Model Preferences" button to set up your preferred models.`;
    }

    // Check if user selected "none" for this category (this should not happen with null handling, but just in case)
    if (selectedModel === 'none') {
      console.log('❌ [IntelligentChatInterface] User selected "none" for category:', category);
      return `You have selected "None" for ${category} generation. Please choose a specific model or change your preference to complete this request.`;
    }

    console.log('✅ [IntelligentChatInterface] Model requirements satisfied');
    return null;
  };

  const getMessageIcon = (message: ChatMessage) => {
    switch (message.type) {
      case 'user':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'assistant':
        return <Bot className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const renderCopyableContent = (content: string) => {
    // Split content into parts and identify prompts
    const parts = [];
    let currentIndex = 0;
    
    // Look for quoted text that looks like prompts (longer than 10 characters and contains prompt-like content)
    const promptRegex = /"([^"]{10,})"/g;
    let match;
    
    while ((match = promptRegex.exec(content)) !== null) {
      const prompt = match[1];
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;
      
      // Check if this looks like a prompt (contains prompt-like keywords)
      const isPrompt = /(cinematic|shot|scene|style|lighting|camera|film|movie|director|cinematography|atmospheric|dramatic|professional|quality|enhanced|beautiful|stunning|masterpiece|artistic|creative)/i.test(prompt);
      
      // Add text before the prompt
      if (matchStart > currentIndex) {
        parts.push({
          type: 'text',
          content: content.substring(currentIndex, matchStart)
        });
      }
      
      // Add the prompt as a copyable button if it looks like a prompt
      if (isPrompt) {
        parts.push({
          type: 'prompt',
          content: prompt
        });
      } else {
        // Add as regular text if it doesn't look like a prompt
        parts.push({
          type: 'text',
          content: match[0]
        });
      }
      
      currentIndex = matchEnd;
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(currentIndex)
      });
    }
    
    // If no prompts found, return regular text
    if (parts.every(part => part.type === 'text')) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
    
    // Render with copyable prompts
    return (
      <div className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else {
            return (
              <button
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(part.content);
                  toast({
                    title: "Prompt copied!",
                    description: "The prompt has been copied to your clipboard.",
                    duration: 2000,
                  });
                }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 font-mono text-sm transition-all duration-200 cursor-pointer group hover:scale-105"
              >
                <span className="font-medium">"{part.content}"</span>
                <svg 
                  className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            );
          }
        })}
      </div>
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    // Special handling for welcome message with clickable elements
    if (message.isWelcomeMessage) {
      return (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none text-foreground">
            <div dangerouslySetInnerHTML={{ __html: message.content.split('**What I can help you with:**')[0].replace(/\n/g, '<br/>') }} />
          </div>
          
          {/* Clickable welcome items */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">What I can help you with:</h4>
            <div className="grid gap-2">
              <button
                onClick={() => handleWelcomeItemClick('image-generation')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 glass-light rounded-lg hover:bg-primary/10 hover-lift transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Image Generation</div>
                  <div className="text-xs text-muted-foreground">Create high-quality images with cinematic styling</div>
                </div>
              </button>
              
              <button
                onClick={() => handleWelcomeItemClick('video-creation')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 glass-light rounded-lg hover:bg-primary/10 hover-lift transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Video className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Video Creation</div>
                  <div className="text-xs text-muted-foreground">Generate videos from text or animate existing images</div>
                </div>
              </button>
              
              <button
                onClick={() => handleWelcomeItemClick('audio-voice')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 glass-light rounded-lg hover:bg-primary/10 hover-lift transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Music className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Audio & Voice</div>
                  <div className="text-xs text-muted-foreground">Create music, sound effects, and voiceovers</div>
                </div>
              </button>
              
              <button
                onClick={() => handleWelcomeItemClick('smart-model-selection')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 glass-light rounded-lg hover:bg-primary/10 hover-lift transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <Brain className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Smart Model Selection</div>
                  <div className="text-xs text-muted-foreground">Automatically choose the best AI models for your needs</div>
                </div>
              </button>
              
              <button
                onClick={() => handleWelcomeItemClick('director-guidance')}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 glass-light rounded-lg hover:bg-primary/10 hover-lift transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <Film className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Director Guidance</div>
                  <div className="text-xs text-muted-foreground">Get professional cinematographic suggestions</div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none text-foreground">
            <div dangerouslySetInnerHTML={{ __html: message.content.split('**How to get started:**')[1].replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      );
    }

         // Special handling for shot suggestion message with clickable elements
     if (message.isShotSuggestion && message.suggestions) {
       return (
         <div className="space-y-4">
           <div className="prose prose-sm max-w-none text-foreground">
             <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
           </div>
           
           {/* Clickable shot suggestions */}
           <div className="space-y-3">
             <div className="grid gap-2">
               {message.suggestions.map((suggestion, index) => (
                 <button
                   key={index}
                   onClick={() => handleShotSuggestionClick(suggestion)}
                   disabled={isProcessing}
                   className="flex items-center gap-3 p-3 glass-light rounded-lg hover:bg-primary/10 hover-lift transition-all duration-200 text-left group"
                 >
                   <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                     <Video className="w-4 h-4 text-green-400" />
                   </div>
                   <div>
                     <div className="font-medium text-foreground">{suggestion}</div>
                     <div className="text-xs text-muted-foreground">Click to animate with this shot style</div>
                   </div>
                 </button>
               ))}
             </div>
           </div>
         </div>
       );
     }

     // Special handling for progress message with inline progress bar
     if (message.isProgressMessage && generationProgress) {
       return (
         <div className="space-y-4">
           <div className="prose prose-sm max-w-none text-foreground">
             <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
           </div>
           
           {/* Inline Progress Bar with Model Selector */}
           <div className="glass-light rounded-lg p-4 border border-primary/20">
             <div className="space-y-3">
               <div className="flex justify-between text-sm text-muted-foreground">
                 <span>{generationProgress.status}</span>
                 <span>{Math.round(generationProgress.progress)}%</span>
               </div>
               
               <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                   style={{ width: `${generationProgress.progress}%` }}
                 />
               </div>
               
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   <span>Processing with {generationProgress?.modelId?.split('/').pop() || 'Unknown Model'}</span>
                 </div>
                 
                 {/* Model Change Button - Only show if progress is low and it's a video model */}
                 {generationProgress && generationProgress.progress < 10 && generationProgress.modelId && generationProgress.modelId.includes('video') && (
                   <button
                     onClick={() => {
                       try {
                         // Find the current model in the list
                         const videoModels = AVAILABLE_ENDPOINTS.filter((model: ApiInfo) => model.category === 'video');
                         const currentModelIndex = videoModels.findIndex((model: ApiInfo) => model.endpointId === generationProgress?.modelId);
                         
                         if (currentModelIndex === -1) {
                           console.error('❌ [Model Switch] Current model not found in video models list');
                           return;
                         }
                         
                         const nextModelIndex = (currentModelIndex + 1) % videoModels.length;
                         const nextModel = videoModels[nextModelIndex];
                         
                         if (nextModel && nextModel.endpointId) {
                           handleVideoModelChange(nextModel.endpointId);
                         } else {
                           console.error('❌ [Model Switch] Invalid next model:', nextModel);
                         }
                       } catch (error) {
                         console.error('❌ [Model Switch] Error switching model:', error);
                       }
                     }}
                     className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-400/10"
                     title="Switch to next video model"
                   >
                     Switch Model
                   </button>
                 )}
               </div>
             </div>
           </div>
         </div>
       );
     }
    
    if (message.delegation) {
      return (
        <div className="space-y-3">
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 glass-light rounded-lg">
                  {attachment.type === 'image' && attachment.preview && (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.name}
                      className="w-12 h-12 object-cover rounded border border-border"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-foreground">{attachment.name}</span>
                    </div>
                  <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024 / 1024).toFixed(1)} MB • Ready for animation
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="prose prose-sm max-w-none text-foreground">
            {renderCopyableContent(message.content)}
          </div>
          
          {/* Inline Generated Content Display */}
          {message.generatedContent && (
            <div className="mt-4 space-y-3">
              {message.generatedContent.type === 'image' && (
                <div className="relative group">
                  <img
                    src={message.generatedContent.url}
                    alt="Generated content"
                    className="w-full max-w-md h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-all duration-300"
                    onClick={() => {
                      // Trigger fullscreen view
                      const event = new CustomEvent('animate-image', {
                        detail: {
                          imageUrl: message.generatedContent?.url,
                          imageTitle: 'Generated Image',
                          prompt: message.generatedContent?.prompt
                        }
                      });
                      window.dispatchEvent(event);
                    }}
                  />
                  {message.generatedContent.imageCount && message.generatedContent.imageCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {message.generatedContent.imageCount} variants
                    </div>
                  )}
                  {message.generatedContent.prompt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      "{message.generatedContent.prompt.substring(0, 100)}..."
                    </div>
                  )}
                </div>
              )}
              
              {message.generatedContent.type === 'video' && (
                <div className="relative">
                  <video
                    src={message.generatedContent.url}
                    controls
                    className="w-full max-w-md h-auto rounded-lg shadow-lg"
                  />
                  {message.generatedContent.prompt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      "{message.generatedContent.prompt.substring(0, 100)}..."
                    </div>
                  )}
                </div>
              )}
              
              {message.generatedContent.type === 'audio' && (
                <div className="relative">
                  <audio
                    src={message.generatedContent.url}
                    controls
                    className="w-full"
                  />
                  {message.generatedContent.prompt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      "{message.generatedContent.prompt.substring(0, 100)}..."
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <Card className="p-4 glass-light">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Model Delegation</span>
              {getStatusIcon(message.status)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ModelIcon model={message.delegation.modelId} size="sm" />
                <Badge variant="outline" className="text-xs">
                  {message.delegation.modelId}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(message.delegation.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">{message.delegation.reason}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Est. {message.delegation.estimatedTime}</span>
              </div>

              {/* Model selection is now handled by intent-driven workflow - no override needed */}

              {/* Cost Estimator - Show when delegation is ready */}
              {message.status === 'pending' && pendingDelegation && (
                <div className="pt-2 space-y-3">
                  <CostEstimator
                    model={pendingDelegation.modelId}
                    parameters={pendingDelegation.parameters}
                    isVisible={true}
                  />
                  
                  <Button
                    onClick={handleGenerateNow}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 glass-light rounded-lg">
                {attachment.type === 'image' && attachment.preview && (
                  <img 
                    src={attachment.preview} 
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded border border-border"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-foreground">{attachment.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(attachment.size / 1024 / 1024).toFixed(1)} MB • Image uploaded
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="prose prose-sm max-w-none text-foreground">
          {renderCopyableContent(message.content)}
        </div>
        
                 {/* AI Suggestions */}
         {message.suggestions && message.suggestions.length > 0 && (
           <div className="mt-4 p-4 glass-light rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Try These Prompts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAISuggestionClick(suggestion)}
                    disabled={isProcessing}
                    className="h-auto p-2 text-xs border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200"
                  >
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{suggestion}</span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(suggestion);
                      toast({
                        title: "Prompt copied!",
                        description: "The prompt has been copied to your clipboard.",
                        duration: 2000,
                      });
                    }}
                    className="h-auto p-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <svg 
                      className="w-3 h-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-400/70 mt-2">
              Click any prompt to generate content instantly, or click the copy icon to copy to clipboard
            </p>
          </div>
        )}
        
        {/* Inline Generated Content Display */}
        {message.generatedContent && (
          <div className="mt-4 space-y-3">
            {message.generatedContent.type === 'image' && (
              <div className="relative group">
                <img
                  src={message.generatedContent.url}
                  alt="Generated content"
                  className="w-full max-w-md h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-all duration-300"
                  onClick={() => {
                    // Open fullscreen view
                    handleOpenFullscreen({
                      url: message.generatedContent?.url || '',
                      title: 'Generated Image',
                      prompt: message.generatedContent?.prompt,
                      timestamp: message.timestamp
                    });
                  }}
                />
                {message.generatedContent.imageCount && message.generatedContent.imageCount > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {message.generatedContent.imageCount} variants
                  </div>
                )}
                {message.generatedContent.prompt && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    "{message.generatedContent.prompt.substring(0, 100)}..."
                  </div>
                )}
              </div>
            )}
            
            {message.generatedContent.type === 'video' && (
              <div className="relative">
                <video
                  src={message.generatedContent.url}
                  controls
                  className="w-full max-w-md h-auto rounded-lg shadow-lg"
                />
                {message.generatedContent.prompt && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    "{message.generatedContent.prompt.substring(0, 100)}..."
                  </div>
                )}
              </div>
            )}
            
            {message.generatedContent.type === 'audio' && (
              <div className="relative">
                <audio
                  src={message.generatedContent.url}
                  controls
                  className="w-full"
                />
                {message.generatedContent.prompt && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    "{message.generatedContent.prompt.substring(0, 100)}..."
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };



  // Function to poll for video generation results
  const pollVideoResult = async (taskId: string, modelId: string, maxAttempts: number = 300) => {
    console.log('🔄 [Polling] Starting video result polling for task:', taskId);
    
    // Clear any existing progress simulation and start fresh progress tracking
    setGenerationProgress({
      isActive: true,
      progress: 0,
      status: 'Starting video generation...',
      estimatedTime: '2-5 minutes',
      modelId,
    });
    
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        console.log(`🔄 [Polling] Attempt ${attempts}/${maxAttempts} - Checking video status`);
        
        // Call the polling endpoint
        const response = await fetch(`/api/fal/poll?taskId=${taskId}`);
        
        if (!response.ok) {
          throw new Error(`Polling failed with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 [Polling] Poll result:', result);
        
                 // Update progress based on status
         if (result.status === 'completed') {
           console.log('✅ [Polling] Video generation completed!');
           clearInterval(pollInterval);
           
           // Complete the progress
           completeVideoProgress();
           
           // Update the progress message to show completion
           setMessages(prev => prev.map(msg => 
             msg.isProgressMessage 
               ? { ...msg, content: '✅ **Video Generation Complete!**', status: 'completed' as const }
               : msg
           ));
          
          // Handle the completed video result
          if (result.video) {
            // Dispatch video completion event
            const videoEvent = new CustomEvent('content-generated', {
              detail: {
                id: Date.now().toString(),
                type: 'video',
                url: result.video.url,
                title: `Generated Video - ${new Date().toLocaleTimeString()}`,
                prompt: result.prompt || 'Video generation',
                timestamp: new Date(),
                metadata: {
                  format: 'mp4',
                  duration: result.video.duration,
                  resolution: result.video.resolution,
                }
              }
            });
            window.dispatchEvent(videoEvent);
            
            
          }
          
                 } else if (result.status === 'failed') {
           console.log('❌ [Polling] Video generation failed');
           clearInterval(pollInterval);
           
           // Clear progress and show error
           setGenerationProgress(null);
           
                      // Update the progress message to show error
           setMessages(prev => prev.map(msg => 
             msg.isProgressMessage 
               ? { ...msg, content: `❌ **Video Generation Failed**\n\nError: ${result.error || 'Unknown error occurred'}`, status: 'error' as const }
               : msg
           ));
          
        } else if (result.status === 'processing') {
          // Update progress based on the model and current attempt
          setGenerationProgress(prev => {
            if (!prev) return null;
            
            let newProgress = prev.progress;
            let newStatus = prev.status;
            
            // Calculate progress based on attempts and model
            if (modelId.includes('kling')) {
              // Kling models: slower start, faster finish
              const progressPercent = Math.min((attempts / 180) * 100, 95); // Max 3 minutes
              newProgress = progressPercent;
              
              if (progressPercent < 20) {
                newStatus = 'Analyzing image and preparing motion...';
              } else if (progressPercent < 60) {
                newStatus = 'Generating video frames...';
              } else if (progressPercent < 85) {
                newStatus = 'Applying motion and effects...';
              } else {
                newStatus = 'Finalizing video quality...';
              }
            } else if (modelId.includes('veo3')) {
              // Veo3 models: steady progress
              const progressPercent = Math.min((attempts / 120) * 100, 95); // Max 2 minutes
              newProgress = progressPercent;
              
              if (progressPercent < 30) {
                newStatus = 'Processing video request...';
              } else if (progressPercent < 70) {
                newStatus = 'Generating high-quality video...';
              } else {
                newStatus = 'Enhancing video quality...';
              }
            } else if (modelId.includes('luma')) {
              // Luma models: faster start
              const progressPercent = Math.min((attempts / 90) * 100, 95); // Max 1.5 minutes
              newProgress = progressPercent;
              
              if (progressPercent < 40) {
                newStatus = 'Creating dream sequence...';
              } else if (progressPercent < 80) {
                newStatus = 'Generating smooth motion...';
              } else {
                newStatus = 'Polishing video...';
              }
            } else {
              // Default progress pattern
              const progressPercent = Math.min((attempts / 150) * 100, 95); // Max 2.5 minutes
              newProgress = progressPercent;
              
              if (progressPercent < 50) {
                newStatus = 'Processing video generation...';
              } else if (progressPercent < 90) {
                newStatus = 'Generating video content...';
              } else {
                newStatus = 'Finalizing...';
              }
            }
            
            return {
              ...prev,
              progress: newProgress,
              status: newStatus,
            };
          });
        }
        
                 // Check if we've exceeded max attempts
         if (attempts >= maxAttempts) {
           console.log('⏰ [Polling] Max attempts reached, stopping polling');
           clearInterval(pollInterval);
           
           // Clear progress and show timeout message
           setGenerationProgress(null);
           
                      // Update the progress message to show timeout
           setMessages(prev => prev.map(msg => 
             msg.isProgressMessage 
               ? { ...msg, content: `⏰ **Video Generation Timeout**\n\nThe video generation is taking longer than expected. Please check your FAL.ai dashboard.`, status: 'error' as const }
               : msg
           ));
        }
        
             } catch (error) {
         console.error('❌ [Polling] Error during polling:', error);
         
         // On error, stop polling and show error message
         clearInterval(pollInterval);
         setGenerationProgress(null);
         
                  // Update the progress message to show error
         setMessages(prev => prev.map(msg => 
           msg.isProgressMessage 
             ? { ...msg, content: `❌ **Polling Error**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`, status: 'error' as const }
             : msg
         ));
      }
    }, 2000); // Poll every 2 seconds
    
    return pollInterval;
  };

  // Add debugging useEffect for chat mode changes
  useEffect(() => {
    console.log('🔄 [Chat Mode Debug] Chat mode changed to:', chatMode);
    console.log('🔄 [Chat Mode Debug] Current messages count:', messages.length);
    console.log('🔄 [Chat Mode Debug] Is processing:', isProcessing);
    console.log('🔄 [Chat Mode Debug] Is generating:', isGenerating);
  }, [chatMode, messages.length, isProcessing, isGenerating]);

  // Add debugging useEffect for message changes
  useEffect(() => {
    console.log('💬 [Message Debug] Messages updated, count:', messages.length);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('💬 [Message Debug] Last message:', {
        id: lastMessage.id,
        type: lastMessage.type,
        content: lastMessage.content.substring(0, 100) + '...',
        status: lastMessage.status,
        timestamp: lastMessage.timestamp
      });
    }
  }, [messages]);

  // Add debugging useEffect for user input changes
  useEffect(() => {
    console.log('📝 [Input Debug] User input changed:', userInput);
  }, [userInput]);

  return (
    <div className={`flex flex-col h-full glass rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-6 border-b border-border/50 glass-light">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="text-heading font-semibold">DirectorchairAI</h2>
          </div>
          <Badge variant="outline" className="badge-enhanced">
            <Zap className="w-3 h-3 mr-1" />
            Smart Delegation
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-accent/50"
            asChild
          >
            <Link href="/">
              <HomeIcon className="w-4 h-4" />
            </Link>
          </Button>

          {/* Chat Mode Toggle */}
          <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg p-1">
            <Button
              variant={chatMode === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                console.log('🔄 [Chat Mode] Chat button clicked');
                console.log('🔄 [Chat Mode] Previous mode:', chatMode);
                console.log('🔄 [Chat Mode] Previous mode type:', typeof chatMode);
                console.log('🔄 [Chat Mode] Current messages count:', messages.length);
                console.log('🔄 [Chat Mode] Is processing:', isProcessing);
                setChatMode('chat');
                setShowSmartControls(true); // Show smart controls in chat mode
                console.log('🔄 [Chat Mode] Mode set to chat');
                console.log('🔄 [Chat Mode] Smart controls enabled for chat mode');
              }}
              className="flex items-center gap-2 text-xs transition-all duration-200"
            >
              <Bot className="w-3 h-3" />
              Chat
            </Button>
            <Button
              variant={chatMode === 'gen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                console.log('🔄 [Chat Mode] Gen button clicked');
                console.log('🔄 [Chat Mode] Previous mode:', chatMode);
                console.log('🔄 [Chat Mode] Current messages count:', messages.length);
                console.log('🔄 [Chat Mode] Is processing:', isProcessing);
                setChatMode('gen');
                setShowSmartControls(false); // Hide smart controls in gen mode (automation handles it)
                console.log('🔄 [Chat Mode] Mode set to gen');
                console.log('🔄 [Chat Mode] Smart controls hidden for gen mode (automation active)');
              }}
              className="flex items-center gap-2 text-xs transition-all duration-200"
            >
              <Sparkles className="w-3 h-3" />
              Gen
            </Button>
          </div>
          
          {/* Smart Controls Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSmartControls(!showSmartControls)}
            className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-all duration-200"
          >
            {showSmartControls ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm">Hide Controls</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm">Show Controls</span>
              </>
            )}
          </Button>
        
        <ModelPreferenceSelector 
          onPreferencesChange={handleModelPreferencesChange}
          className="flex-shrink-0"
        />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in`}
          >
            {message.type !== 'user' && (
              <div className="flex-shrink-0">
                {getMessageIcon(message)}
              </div>
            )}
            
                         <div
               className={`max-w-[80%] ${
                 message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md shadow-soft'
                  : 'glass rounded-2xl rounded-bl-md shadow-soft'
              } p-4 transition-enhanced`}
             >
              {renderMessageContent(message)}
              
              <div className="text-caption mt-3 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="flex-shrink-0">
                {getMessageIcon(message)}
              </div>
            )}
          </div>
        ))}
        
                 {isProcessing && (
          <div className="flex gap-4 justify-start animate-fade-in">
             <div className="flex-shrink-0">
              <Bot className="w-6 h-6 text-primary" />
             </div>
            <div className="glass rounded-2xl rounded-bl-md p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-body">Analyzing your request...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Intent Selection Modal */}
      {showIntentSelection && uploadedImageForIntent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">What would you like to do with this image?</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIntentCancellation}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3 mb-6">
              {INTENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className={`w-full justify-start h-auto p-4 text-left hover:bg-accent/50 transition-all duration-200 ${
                      selectedIntent === option.id ? 'ring-2 ring-primary bg-accent/20' : ''
                    }`}
                    onClick={() => handleIntentSelection(option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Validation Message */}
            {intentValidation && (
              <div className={`p-3 rounded-lg border ${
                intentValidation.isValid 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="text-sm font-medium mb-1">
                  {intentValidation.isValid ? '✅ Ready to proceed' : '⚠️ Setup required'}
                </div>
                <div className="text-sm">{intentValidation.message}</div>
                {intentValidation.suggestions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">Suggestions:</div>
                    <ul className="text-sm space-y-1">
                      {intentValidation.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-xs mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Image Preview */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium mb-2">Image Preview:</div>
              <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                <img
                  src={uploadedImageForIntent}
                  alt="Uploaded image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

                           {/* Smart Controls Section - Conditionally Rendered */}
         {showSmartControls && chatMode === 'gen' && (
           <>
                           {/* Auteur Engine - Director Style Selection */}
         <div className="border-t border-border/50 glass-light p-4">
           <div className="flex items-center gap-2 mb-3">
             <Film className="w-4 h-4 text-purple-400" />
             <span className="text-sm font-medium text-purple-400">Auteur Engine</span>
           </div>
                             <AuteurEngineSelector
                    onDirectorChange={(directorName) => {
                      console.log('🎬 [IntelligentChatInterface] Director changed:', directorName);
                    }}
                    onMovieSelect={(movie) => {
                      console.log('🎬 [IntelligentChatInterface] Movie selected:', movie.title);
                      // Add movie information to the chat or use it for inspiration
                      const movieInfo = `${movie.title} (${movie.year}) - ${movie.director}\n${movie.description}\n\nVisual Style: ${movie.visualStyle.cinematography.slice(0, 3).join(', ')}\nColor Palette: ${movie.visualStyle.colorPalette.slice(0, 2).join(', ')}`;
                      setUserInput(prev => prev + `\n\nCinematic Reference: ${movieInfo}`);
                    }}
                  />
      </div>

                           {/* Film Director Suggestions */}
         <div className="border-t border-border/50 glass-light p-4">
         <FilmDirectorSuggestions
           currentPrompt={userInput}
           onSuggestionClick={handleSuggestionClick}
           contentType={contentType}
           lastGeneratedPrompt={lastGeneratedImagePrompt || undefined}
                       onStyleCommand={handleStyleCommand}
            onStyleAnalysis={handleStyleAnalysis}
            onStyleImageUpload={handleStyleImageUpload}
         />
       </div>

       {/* Aspect Ratio Selector */}
       <div className="border-t border-border/50 glass-light p-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <span className="text-body font-medium">Aspect Ratio:</span>
             <div className="flex gap-2">
               {[
                 { value: '1:1', label: 'Square' },
                 { value: '3:4', label: 'Portrait' },
                 { value: '4:3', label: 'Landscape' },
                 { value: '16:9', label: 'Widescreen' },
                 { value: '9:16', label: 'Mobile' },
               ].map((ratio) => (
                 <button
                   key={ratio.value}
                   onClick={() => {
                     setSelectedAspectRatio(ratio.value);
                     // Track user selection to override automatic optimization
                     smartControlsAgent.userSelectsControl('aspectRatio', ratio.value);
                     console.log('👤 [SmartControls] User manually selected aspect ratio:', ratio.value);
                   }}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-enhanced focus-ring ${
                     selectedAspectRatio === ratio.value
                       ? 'bg-primary text-primary-foreground shadow-soft'
                       : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover-lift'
                   }`}
                   title={`${ratio.label} (${ratio.value})`}
                 >
                   {ratio.value}
                 </button>
               ))}
             </div>
           </div>
           <div className="text-caption text-muted-foreground">
             Selected: {selectedAspectRatio}
                 </div>
           </div>
         </div>

        {/* Content Type Selector */}
        <div className="border-t border-border/50 glass-light p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-body font-medium">Content Type:</span>
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => {
                    setContentType('image');
                    // Track user selection to override automatic optimization
                    smartControlsAgent.userSelectsControl('contentType', 'image');
                    console.log('👤 [SmartControls] User manually selected content type: image');
                  }}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-enhanced focus-ring ${
                    contentType === 'image'
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-secondary-foreground hover:text-foreground hover-lift'
                  }`}
                >
                  🖼️ Image
                </button>
                <button
                  onClick={() => {
                    setContentType('video');
                    // Track user selection to override automatic optimization
                    smartControlsAgent.userSelectsControl('contentType', 'video');
                    console.log('👤 [SmartControls] User manually selected content type: video');
                  }}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-enhanced focus-ring ${
                    contentType === 'video'
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-secondary-foreground hover:text-foreground hover-lift'
                  }`}
                >
                  🎬 Video
                </button>
              </div>
            </div>
            <div className="text-caption text-muted-foreground">
              Generating: {contentType === 'image' ? 'Images' : 'Videos'}
            </div>
          </div>
        </div>
           </>
         )}

             {/* Input Section - Enhanced Design */}
       <div className="border-t border-border/50 glass-light p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div 
              className={`relative glass rounded-2xl shadow-soft overflow-hidden transition-enhanced ${
                isDragOver 
                  ? 'border-primary border-2 bg-primary/10 scale-[1.02]' 
                  : 'border-border/50 hover:border-border hover-glow'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Drag Overlay */}
              {isDragOver && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-subheading font-semibold text-primary">Drop your image here</p>
                    <p className="text-caption text-muted-foreground">to animate it with AI</p>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="p-4 border-b border-gray-300/30">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Upload preview" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-green-600" />
                         <span className="text-sm font-medium text-foreground">
                          {uploadedImage ? (typeof uploadedImage === 'object' ? uploadedImage.name : 'Compressed Image') : 'Image'}
                        </span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ready to process
                        </Badge>
                      </div>
                       <p className="text-xs text-muted-foreground mt-1">
                        Describe how you want to animate or edit this image
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleQuickGenerate}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs px-3 py-1 h-7"
                      >
                        ⚡ Quick Gen
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
              <Textarea
                  value={userInput}
                  onChange={(e) => {
                    console.log('📝 [Input Debug] Textarea changed:', e.target.value);
                    setUserInput(e.target.value);
                  }}
                onKeyDown={(e) => {
                    console.log('⌨️ [Input Debug] Key pressed:', e.key, 'Shift:', e.shiftKey);
                  if (e.key === 'Enter' && !e.shiftKey) {
                      console.log('⌨️ [Input Debug] Enter pressed without shift - form will submit naturally');
                    // Let the form submit naturally - no need to call handleSubmit manually
                    // The form's onSubmit will handle it
                  }
                }}
                  placeholder={
                    chatMode === 'chat' 
                      ? "Ask me about film techniques, director styles, or creative concepts..." 
                      : uploadedImage 
                        ? "Describe how you want to animate or edit this image..." 
                        : `Describe what you want to create (${contentType === 'image' ? 'image' : 'video'}) or drag & drop an image to animate or edit...`
                  }
                  className="flex-1 min-h-[96px] px-6 py-5 bg-transparent border-0 text-foreground placeholder-muted-foreground resize-none outline-none text-body leading-relaxed focus-visible:ring-0 font-medium"
                disabled={isProcessing}
                rows={4}
              />
              </div>
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                {/* Paste Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePaste}
                  className="h-10 w-10 p-0 rounded-full bg-secondary hover:bg-secondary/80 border-border focus-ring transition-enhanced"
                  disabled={isProcessing}
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-4 h-4 text-muted-foreground" />
                </Button>

                {/* Quick Gen Button - only show when image is uploaded */}
                {uploadedImage && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickGenerate}
                    disabled={isProcessing || !modelPreferences.video || modelPreferences.video === 'none'}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs px-3 py-1 h-8"
                    title={
                      !modelPreferences.video || modelPreferences.video === 'none' 
                        ? "Select a video model in Model Preferences first" 
                        : "Generate video instantly with AI"
                    }
                  >
                    ⚡ Quick Gen
                  </Button>
                )}
                
                {/* Voice Input Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceInput}
                  className={`h-10 w-10 p-0 rounded-full border-border focus-ring transition-enhanced ${
                    voiceInputAvailable === false 
                      ? 'bg-red-100 hover:bg-red-200 border-red-300' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  disabled={isProcessing || voiceInputAvailable === false}
                  title={
                    voiceInputAvailable === false 
                      ? "Voice input not available - check console for details (right-click for diagnostics)" 
                      : isListening 
                        ? "Click to stop recording" 
                        : "Click to start voice input"
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    diagnoseVoiceInput();
                    toast({
                      title: "Voice Input Diagnostics",
                      description: "Check the browser console for detailed diagnostic information.",
                      variant: "default",
                    });
                  }}
                >
                  {isListening ? (
                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  ) : voiceInputAvailable === false ? (
                    <Mic className="w-4 h-4 text-red-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                
                {/* Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 p-0 rounded-full bg-secondary hover:bg-secondary/80 border-border focus-ring transition-enhanced"
                  disabled={isProcessing}
                  title="Upload image to animate or edit"
                >
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  type="submit"
                  disabled={!userInput.trim() || isProcessing}
                  size="sm"
                  onClick={() => {
                    console.log('🔘 [Button Debug] Submit button clicked');
                    console.log('🔘 [Button Debug] User input:', userInput);
                    console.log('🔘 [Button Debug] Is processing:', isProcessing);
                    console.log('🔘 [Button Debug] Chat mode:', chatMode);
                  }}
                  className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0 disabled:opacity-50 shadow-soft hover:shadow-medium transition-enhanced focus-ring hover-lift"
                >
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Helper text */}
            <div className="text-center mt-4">
              <p className="text-caption text-muted-foreground">
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Enter</kbd> for new line
                {chatMode === 'gen' && !uploadedImage && (
                  <>
                    {' • '}
                    <span>Drag & drop images to animate or edit</span>
                  </>
                )}
                {chatMode === 'chat' && (
                  <>
                    {' • '}
                    <span>Ask about film techniques, director styles, or creative concepts</span>
                  </>
                )}
              </p>
            </div>
          </form>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
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
          {/* Main Image Container - Centered */}
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
            
            {/* Main Image - Centered and Large */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.title}
                className="max-w-full max-h-full object-contain transition-all duration-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Image Info Panel - Bottom */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 max-w-2xl w-full px-6">
              <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-2">{fullscreenImage.title}</h3>
                    {fullscreenImage.prompt && (
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">"{fullscreenImage.prompt}"</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{fullscreenImage.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
