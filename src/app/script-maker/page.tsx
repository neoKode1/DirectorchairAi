"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Film, Download, Play, Pause, RefreshCw, Edit, Video, X, Save, FolderOpen } from "lucide-react";

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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ring"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function ScriptMakerContent() {
  const [mounted, setMounted] = useState(false);
  const [movieTitle, setMovieTitle] = useState('');
  const [plot, setPlot] = useState('');
  const [genreIdea, setGenreIdea] = useState('');
  const [eraSetting, setEraSetting] = useState('');
  const [photoStyle, setPhotoStyle] = useState('cinematic');
  const [minutesToExtract, setMinutesToExtract] = useState(5);
  const [characterProfiles, setCharacterProfiles] = useState<any[]>([]);
  const [finalScript, setFinalScript] = useState('');
  const [minutes, setMinutes] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: idea, 2: screenplay, 3: character upload, 4: style reference, 5: shot list, 6: visual generation
  const [extractedCharacters, setExtractedCharacters] = useState<string[]>([]); // Character names from screenplay
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingPlot, setIsAnalyzingPlot] = useState(false);
  const [hasAnalyzedPlot, setHasAnalyzedPlot] = useState(false);
  const [userPlotInput, setUserPlotInput] = useState('');
  const [claudeEnhancedPlot, setClaudeEnhancedPlot] = useState('');
  const [characterReferenceImages, setCharacterReferenceImages] = useState<Array<{ url: string; analysis: string; characterName?: string; fileName?: string }>>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<{url: string, title: string} | null>(null);
  const [styleReferenceImage, setStyleReferenceImage] = useState<{ url: string; analysis: string; fileName?: string } | null>(null);
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('fal-ai/nano-banana-pro/edit');
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getModelFriendlyName = (modelId?: string) => {
    if (!modelId) return 'Unknown Model';
    if (modelId === 'fal-ai/nano-banana-pro/edit') return 'Nano Banana Pro Edit';
    if (modelId === 'fal-ai/nano-banana/edit') return 'Nano Banana Edit (Legacy)';
    if (modelId === 'fal-ai/bytedance/seedream/v4/edit') return 'SeeDream 4.0 Edit';
    if (modelId === 'fal-ai/flux-pro/v1.1-ultra') return 'Flux Pro 1.1 Ultra';
    if (modelId === 'fal-ai/stable-diffusion-v35-large') return 'Stable Diffusion 3.5';
    return modelId;
  };

  useEffect(() => {
    setMounted(true);
    // Load user's preferred model from shared settings
    try {
      const savedSettings = localStorage.getItem('directorchair-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.preferredVideoModel && settings.preferredVideoModel !== 'none') {
          setSelectedModel(settings.preferredVideoModel);
        }
      }
    } catch (error) {
      console.error('Error loading saved model preference:', error);
    }
  }, []);

  // Auto-analyze plot when user stops typing (debounced)
  useEffect(() => {
    // Only analyze if:
    // 1. User input is substantial (>50 chars)
    // 2. Not currently analyzing
    // 3. User input has changed since last analysis
    if (!userPlotInput || userPlotInput.length < 50 || isAnalyzingPlot) return;
    
    // Don't re-analyze if the input hasn't changed
    if (userPlotInput === claudeEnhancedPlot) return;
    
    const timer = setTimeout(async () => {
      await handlePlotAnalysis();
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [userPlotInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStyleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingStyle(true);
    
    try {
      // Upload image
      const formData = new FormData();
      formData.append('image', file); // API expects 'image' field name
      
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success || !uploadData.url) {
        throw new Error('Upload failed');
      }

      // Analyze image for style
      const analysisResponse = await fetch('/api/script-maker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          plot,
          genreIdea,
          eraSetting,
          photoStyle,
          minutesToExtract,
          characterProfiles,
          analysisType: 'style-analysis',
          styleImageUrl: uploadData.url
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze style');
      }

      const analysisData = await analysisResponse.json();
      
      if (analysisData.success) {
        setStyleReferenceImage({
          url: uploadData.url,
          analysis: analysisData.result,
          fileName: file.name
        });
        
        toast({
          title: "Style Reference Added",
          description: "Style analysis complete! This will guide all scene generations.",
        });
      } else {
        throw new Error(analysisData.error || 'Style analysis failed');
      }
    } catch (error) {
      console.error('❌ Style image upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload and analyze style image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingStyle(false);
    }
  };

  const handleCharacterImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, characterName?: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingImage(true);
    toast({
      title: "Analyzing Character",
      description: `Google is analyzing ${characterName || 'the character'} image...`,
    });

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });

      const base64Image = reader.result as string;

      // Call image analysis API
      const response = await fetch('/api/extract-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: base64Image  // API expects 'imageUrl' parameter
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      
      if (data.success && data.prompt) {
        // If this is for a specific character, update or add that character
        if (characterName) {
          setCharacterReferenceImages(prev => {
            const existingIndex = prev.findIndex(img => img.characterName === characterName);
            if (existingIndex >= 0) {
              // Update existing character
              const updated = [...prev];
              updated[existingIndex] = {
                url: base64Image,
                analysis: data.prompt,
                characterName: characterName,
                fileName: file.name
              };
              return updated;
            } else {
              // Add new character
              return [...prev, {
                url: base64Image,
                analysis: data.prompt,
                characterName: characterName,
                fileName: file.name
              }];
            }
          });
        } else {
          // Generic character upload (Step 1)
          setCharacterReferenceImages(prev => [...prev, {
            url: base64Image,
            analysis: data.prompt,
            fileName: file.name
          }]);
        }

        toast({
          title: "Character Analyzed!",
          description: characterName ? `${characterName} image ready` : "Character details extracted",
        });
      } else {
        throw new Error('No analysis data received');
      }

    } catch (error) {
      console.error('❌ Character image analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze character image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleRemoveCharacterImage = (index: number) => {
    setCharacterReferenceImages(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Character Removed",
      description: "Character reference image has been removed",
    });
  };

  const handleScriptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File",
        description: "Please upload a .txt, .pdf, .doc, or .docx file",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Uploading Script",
        description: "Reading your screenplay...",
      });

      let scriptText = '';

      if (fileExtension === '.txt') {
        // Read text file directly
        scriptText = await file.text();
      } else if (fileExtension === '.pdf') {
        // For PDF, we'll need to extract text (simplified version)
        toast({
          title: "PDF Upload",
          description: "PDF support coming soon. Please use .txt format for now.",
          variant: "destructive"
        });
        return;
      } else {
        // For .doc/.docx, we'll need special handling
        toast({
          title: "Word Document Upload",
          description: "Word document support coming soon. Please use .txt format for now.",
          variant: "destructive"
        });
        return;
      }

      // Validate script has content
      if (!scriptText || scriptText.trim().length < 100) {
        toast({
          title: "Script Too Short",
          description: "Please upload a screenplay with at least 100 characters",
          variant: "destructive"
        });
        return;
      }

      // Set the script
      setFinalScript(scriptText);

      // Extract character names from the uploaded script
      const characterPattern = /^([A-Z][A-Z\s.-]+)(?=\s*$|\s*\(.*\)\s*$)/gm;
      const matches = scriptText.match(characterPattern);

      if (matches) {
        const trimmedNames = matches.map((name: string) => name.trim());
        const uniqueSet = new Set<string>(trimmedNames);
        const uniqueCharacters = Array.from(uniqueSet)
          .filter((char: string) =>
            char.length > 1 &&
            !['FADE IN', 'FADE OUT', 'CUT TO', 'INTERIOR', 'EXTERIOR', 'INT.', 'EXT.', 'INT', 'EXT', 'CONTINUED', 'V.O.', 'O.S.'].some(keyword => char.startsWith(keyword))
          );

        setExtractedCharacters(uniqueCharacters);
        console.log('🎭 [ScriptMaker] Extracted characters from uploaded script:', uniqueCharacters);
      }

      toast({
        title: "Script Uploaded!",
        description: `Found ${matches?.length || 0} characters. You can now skip to shot list generation.`,
      });

      // Jump to step 5 (shot list) - skip character upload and style reference for now
      setCurrentStep(5);

    } catch (error) {
      console.error('❌ Script upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to read the script file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fullscreen image handlers (from timeline page)
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

  // Handle download with frame extraction for videos (matching gallery functionality)
  const handleDownload = async (url: string, title: string, type: 'image' | 'video') => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      if (type === 'video') {
        console.log('📥 [ScriptMaker] Starting video download with frame extraction');
        // Import the download function dynamically
        const { downloadVideoWithFrame } = await import('@/lib/video-thumbnail');
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
      console.error('❌ [ScriptMaker] Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Export screenplay project
  const handleExportProject = async () => {
    if (!movieTitle || !finalScript || minutes.length === 0) {
      toast({
        title: "Cannot Export",
        description: "Please complete the screenplay and generate at least one minute of shots before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import the content storage dynamically
      const { contentStorage } = await import('@/lib/content-storage');
      
      // Create the screenplay project
      const project = {
        id: `screenplay-${Date.now()}`,
        title: movieTitle,
        plot: userPlotInput,
        enhancedPlot: claudeEnhancedPlot,
        genre: genreIdea,
        era: eraSetting,
        photoStyle: photoStyle,
        duration: minutesToExtract,
        script: finalScript,
        characters: characterReferenceImages.map(img => ({
          name: img.characterName || 'Unknown',
          imageUrl: img.url,
          analysis: img.analysis
        })),
        minutes: minutes.map((minute, index) => ({
          script: minute.script || '',
          shots: minute.shots?.map((shot: any, shotIndex: number) => ({
            shotNumber: shot.shotNumber || shotIndex + 1,
            shotType: shot.shotType || '',
            camera: shot.camera || '',
            action: shot.action || '',
            lighting: shot.lighting || '',
            characters: shot.characters || [],
            imageUrl: shot.imageUrl || '',
            generatedBy: shot.generatedBy || ''
          })) || []
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to content storage
      contentStorage.saveScreenplayProject(project);

      toast({
        title: "Project Exported!",
        description: `"${movieTitle}" has been saved to your Screenplays gallery.`,
      });

      console.log('🎬 [ScriptMaker] Exported screenplay project:', project);
    } catch (error) {
      console.error('❌ [ScriptMaker] Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to save the screenplay project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlotAnalysis = async () => {
    if (!userPlotInput || userPlotInput.length < 20) return;
    
    setIsAnalyzingPlot(true);
    
    try {
      const response = await fetch('/api/script-maker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          plot: userPlotInput,
          genreIdea,
          eraSetting,
          photoStyle,
          minutesToExtract,
          analysisType: 'plot-formalization'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze plot');
      }

      const data = await response.json();
      
      if (data.success) {
        // Store Claude's enhanced version separately
        setClaudeEnhancedPlot(data.result);
        setHasAnalyzedPlot(true);
        
        // Update the main plot variable for use in next steps
        setPlot(data.result);
        
        toast({
          title: "Plot Enhanced by Claude",
          description: "Your plot has been formalized and structured!",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('❌ Plot analysis error:', error);
    } finally {
      setIsAnalyzingPlot(false);
    }
  };

  const handleGenerateCharacters = async () => {
    setIsGenerating(true);
    toast({
      title: "Generating Characters",
      description: "Claude is creating detailed character profiles...",
    });
    
    try {
      const response = await fetch('/api/script-maker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          plot,
          genreIdea,
          eraSetting,
          photoStyle,
          minutesToExtract,
          analysisType: 'character-generation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate characters');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('🎭 [Character Generation] Raw result:', data.result);
        console.log('🎭 [Character Generation] Result type:', typeof data.result);
        
        // Parse character data if it's a string
        let characters = data.result;
        if (typeof characters === 'string') {
          try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = characters.match(/```json\n([\s\S]*?)\n```/) || characters.match(/```\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              console.log('🎭 [Character Generation] Found JSON in code block');
              characters = JSON.parse(jsonMatch[1]);
            } else {
              console.log('🎭 [Character Generation] Attempting direct parse');
              characters = JSON.parse(characters);
            }
          } catch (parseError) {
            console.error('❌ [Character Generation] Parse error:', parseError);
            console.error('❌ [Character Generation] Failed string:', characters.substring(0, 500));
            
            toast({
              title: "Parsing Error",
              description: "Claude returned invalid JSON. Using text fallback.",
              variant: "destructive",
            });
            
            // Fallback: treat as plain text, no characters generated
            setCharacterProfiles([]);
            setIsGenerating(false);
            return;
          }
        }
        
        console.log('🎭 [Character Generation] Parsed characters:', characters);
        
        setCharacterProfiles(Array.isArray(characters) ? characters : []);
        setCurrentStep(2);
        
        toast({
          title: "Characters Ready",
          description: `${Array.isArray(characters) ? characters.length : 0} character profiles generated!`,
        });
      } else {
        throw new Error(data.error || 'Character generation failed');
      }
    } catch (error) {
      console.error('❌ Character generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate characters",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    toast({
      title: "Writing Screenplay",
      description: "Claude is crafting your full movie script...",
    });
    
    try {
      const response = await fetch('/api/script-maker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          plot,
          genreIdea,
          eraSetting,
          photoStyle,
          minutesToExtract,
          characterProfiles: characterProfiles.length > 0 ? characterProfiles : characterReferenceImages.map((img, i) => ({
            name: `Character ${i + 1}`,
            description: img.analysis
          })),
          analysisType: 'screenplay-generation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate screenplay');
      }

      const data = await response.json();
      
      if (data.success) {
        const screenplay = data.result;
        setFinalScript(screenplay);
        
        // Extract character names from screenplay using multiple patterns
        const characterPattern = /^([A-Z][A-Z\s.-]+)(?=\s*$|\s*\(.*\)\s*$)/gm;
        const matches = screenplay.match(characterPattern);

        let uniqueCharacters: string[] = [];

        if (matches) {
          const trimmedNames = matches.map((name: string) => name.trim());
          const uniqueSet = new Set<string>(trimmedNames);
          uniqueCharacters = Array.from(uniqueSet)
            .filter((char: string) =>
              char.length > 1 &&
              !['FADE IN', 'FADE OUT', 'CUT TO', 'INTERIOR', 'EXTERIOR', 'INT.', 'EXT.', 'INT', 'EXT', 'CONTINUED', 'V.O.', 'O.S.', 'SCENE', 'ACT', 'THE END', 'TITLE'].some(keyword => char.startsWith(keyword))
            );
        }

        // Fallback: try a looser pattern (Name followed by colon or dialogue)
        if (uniqueCharacters.length === 0) {
          const loosePattern = /^([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)*)(?:\s*[:]\s|\s*\()/gm;
          const looseMatches = screenplay.match(loosePattern);
          if (looseMatches) {
            const names = looseMatches.map((m: string) => m.replace(/[\s:(\s]+$/, '').trim());
            const uniqueSet = new Set<string>(names);
            uniqueCharacters = Array.from(uniqueSet).filter((char: string) => char.length > 1);
          }
        }

        setExtractedCharacters(uniqueCharacters);
        console.log('🎭 [ScriptMaker] Extracted characters from screenplay:', uniqueCharacters);

        setCurrentStep(3); // Move to character upload step

        toast({
          title: "Screenplay Complete",
          description: uniqueCharacters.length > 0
            ? `Found ${uniqueCharacters.length} character${uniqueCharacters.length > 1 ? 's' : ''}. Upload their images next!`
            : "Screenplay ready! You can add characters manually or skip to shot list.",
        });
      } else {
        throw new Error(data.error || 'Screenplay generation failed');
      }
    } catch (error) {
      console.error('❌ Screenplay generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate screenplay",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    setIsGenerating(true);
    toast({
      title: "Creating Shot List",
      description: "Claude is extracting shots from your screenplay...",
    });
    
    try {
      const response = await fetch('/api/script-maker/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          plot,
          screenplay: finalScript, // Send the full screenplay
          genreIdea,
          eraSetting,
          photoStyle,
          minutesToExtract,
          characterProfiles: characterProfiles.length > 0 ? characterProfiles : characterReferenceImages.map((img, i) => ({
            name: `Character ${i + 1}`,
            description: img.analysis
          })),
          analysisType: 'storyboard-breakdown'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate storyboard');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('🎬 [Storyboard Generation] Raw result:', data.result);
        console.log('🎬 [Storyboard Generation] Result type:', typeof data.result);
        
        // Parse storyboard data if it's a string
        let storyboard = data.result;
        if (typeof storyboard === 'string') {
          try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = storyboard.match(/```json\n([\s\S]*?)\n```/) || storyboard.match(/```\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              console.log('🎬 [Storyboard Generation] Found JSON in code block');
              storyboard = JSON.parse(jsonMatch[1]);
            } else {
              console.log('🎬 [Storyboard Generation] Attempting direct parse');
              
              // Try to find JSON object boundaries
              const firstBrace = storyboard.indexOf('{');
              const lastBrace = storyboard.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1) {
                storyboard = storyboard.substring(firstBrace, lastBrace + 1);
                console.log('🎬 [Storyboard Generation] Extracted JSON object');
              }
              
              storyboard = JSON.parse(storyboard);
            }
          } catch (parseError) {
            console.error('❌ [Storyboard Generation] Parse error:', parseError);
            console.error('❌ [Storyboard Generation] Failed string:', storyboard.substring(0, 500));
            
            toast({
              title: "Parsing Error",
              description: "Claude returned invalid JSON. Please try again.",
              variant: "destructive",
            });
            
            setIsGenerating(false);
            return;
          }
        }
        
        console.log('🎬 [Storyboard Generation] Parsed storyboard:', storyboard);
        
        // Ensure we have the correct structure
        const minutes = storyboard.minutes || (Array.isArray(storyboard) ? storyboard : []);
        
        setMinutes(minutes);
        setCurrentStep(6); // Move to visual generation step
        
        toast({
          title: "Shot List Ready",
          description: `${minutes.length} minute${minutes.length !== 1 ? 's' : ''} with 12 shots each ready for visual generation!`,
        });
      } else {
        throw new Error(data.error || 'Storyboard generation failed');
      }
    } catch (error) {
      console.error('❌ Storyboard generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate storyboard",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateShot = async (minuteIndex: number, shotIndex: number, shot: any) => {
    setIsGenerating(true);
    
    toast({
      title: "Generating Shot",
      description: `Creating visual for Minute ${minuteIndex + 1}, Shot ${shotIndex + 1}...`,
    });

    try {
      // Match shot characters to uploaded character images FIRST
      const shotCharacters = shot.characters || [];
      const matchedImageUrls: string[] = [];
      const matchedCharacterAnalysis: string[] = [];

      console.log('🎬 [ScriptMaker] Character matching debug:', {
        shotCharacters,
        totalUploadedImages: characterReferenceImages.length,
        uploadedCharacterNames: characterReferenceImages.map(img => img.characterName),
        characterReferenceImages: characterReferenceImages
      });

      if (shotCharacters.length > 0 && characterReferenceImages.length > 0) {
        shotCharacters.forEach((charName: string) => {
          console.log(`🔍 [ScriptMaker] Looking for character: "${charName}"`);
          
          // Find matching character reference by name
          const matchedChar = characterReferenceImages.find(img => {
            const match = img.characterName && img.characterName.toLowerCase() === charName.toLowerCase();
            console.log(`  - Checking "${img.characterName}" === "${charName}": ${match}`);
            return match;
          });
          
          if (matchedChar) {
            console.log(`  ✅ Found match for "${charName}"`);
            matchedImageUrls.push(matchedChar.url);
            matchedCharacterAnalysis.push(`${charName}: ${matchedChar.analysis}`);
          } else {
            console.log(`  ❌ No match found for "${charName}"`);
          }
        });
      }

      console.log('🎬 [ScriptMaker] Character matching result:', {
        shotCharacters,
        matchedCount: matchedImageUrls.length,
        totalReferences: characterReferenceImages.length,
        matchedImageUrls: matchedImageUrls.length > 0 ? 'Has images' : 'No images'
      });

      // Build a cinematic prompt from the shot details
      const promptParts = [
        photoStyle,
        shot.shotType || 'cinematic shot',
        shot.camera || '',
        shot.action || '',
        shot.lighting || '',
        `from ${movieTitle}`,
        `${genreIdea} genre`,
        `set in ${eraSetting}`
      ];

      // Add style reference analysis to prompt if available (truncated)
      if (styleReferenceImage && styleReferenceImage.analysis) {
        const styleAnalysis = styleReferenceImage.analysis.substring(0, 200);
        promptParts.push(`Style: ${styleAnalysis}`);
      }

      // Add matched character analysis to prompt (truncated)
      if (matchedCharacterAnalysis.length > 0) {
        const truncatedAnalysis = matchedCharacterAnalysis.map(a => a.substring(0, 150));
        promptParts.push(...truncatedAnalysis);
      }

      let prompt = promptParts.filter(Boolean).join(', ');

      // Truncate prompt to 2000 characters max for safety
      const MAX_PROMPT_LENGTH = 2000;
      if (prompt.length > MAX_PROMPT_LENGTH) {
        console.warn(`⚠️ [ScriptMaker] Prompt too long (${prompt.length} chars), truncating to ${MAX_PROMPT_LENGTH}`);
        prompt = prompt.substring(0, MAX_PROMPT_LENGTH);
      }

      // Use the user's selected model as primary, with fallback chain
      const primaryModelId = selectedModel;
      const legacyModelId = 'fal-ai/nano-banana/edit';
      const seedreamModelId = 'fal-ai/bytedance/seedream/v4/edit';
      const flux2ModelId = 'fal-ai/flux-pro/v1.1-ultra';
      const hasCharacterReferences = matchedImageUrls.length > 0;

      console.log('🎬 [ScriptMaker] Generating shot with user-selected model:', {
        minute: minuteIndex + 1,
        shot: shotIndex + 1,
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 200),
        hasCharacterReferences: hasCharacterReferences,
        characterImageCount: matchedImageUrls.length,
        matchedCharacters: matchedCharacterAnalysis.map(a => a.substring(0, 50))
      });

      type ModelAttempt = {
        payload: Record<string, any>;
        fallbackToast?: string;
      };

      const buildNanoBananaPayload = (modelId: string) => ({
        model: modelId,
        prompt,
        aspect_ratio: '16:9',
        num_images: 1,
        output_format: 'png',
        resolution: '1K',
        image_urls: matchedImageUrls // Always include image_urls, even if empty array
      });

      const primaryModelName = getModelFriendlyName(primaryModelId);
      const modelAttempts: ModelAttempt[] = [
        {
          payload: buildNanoBananaPayload(primaryModelId),
          fallbackToast: hasCharacterReferences
            ? `${primaryModelName} failed, switching to Nano Banana (Legacy)...`
            : `${primaryModelName} failed, switching to SeeDream 4.0 Edit...`
        }
      ];

      if (hasCharacterReferences) {
        // With character references: Primary → Nano Banana Legacy → SeeDream 4.0 Edit
        modelAttempts.push({
          payload: buildNanoBananaPayload(legacyModelId),
          fallbackToast: 'Nano Banana (Legacy) failed, trying SeeDream 4.0 Edit...'
        });

        if (matchedImageUrls.length > 0) {
          modelAttempts.push({
            payload: {
              model: seedreamModelId,
              prompt,
              image_url: matchedImageUrls[0],
              image_size: 'landscape_16_9',
              num_images: 1,
              output_format: 'jpeg'
            },
            fallbackToast: 'SeeDream 4.0 Edit failed, trying Flux Pro 1.1 Ultra...'
          });
        }
      } else {
        // Without character references: Nano Banana Pro → SeeDream 4.0 Edit → Flux Pro 1.1 Ultra
        modelAttempts.push({
          payload: {
            model: seedreamModelId,
            prompt,
            image_size: 'landscape_16_9',
            num_images: 1,
            output_format: 'jpeg'
          },
          fallbackToast: 'SeeDream 4.0 Edit failed, trying Flux Pro 1.1 Ultra...'
        });
      }

      // Final fallback for both paths: Flux Pro 1.1 Ultra (text-to-image)
      modelAttempts.push({
        payload: {
          model: flux2ModelId,
          prompt,
          aspect_ratio: '16:9',
          num_images: 1,
          output_format: 'jpeg',
          safety_tolerance: '2'
        }
      });

      const runModelAttempt = async (payload: Record<string, any>) => {
        console.log('🎬 [ScriptMaker] Model request attempt:', {
          model: payload.model,
          imageUrlsCount: Array.isArray(payload.image_urls)
            ? payload.image_urls.length
            : payload.image_url
              ? 1
              : 0,
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 100),
          fullPayload: {
            ...payload,
            image_urls: payload.image_urls ? `[${payload.image_urls.length} images]` : undefined,
            image_url: payload.image_url ? '[image data]' : undefined
          }
        });

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        console.log('🎬 [ScriptMaker] Model response:', {
          model: payload.model,
          ok: response.ok,
          status: response.status,
          hasError: !!result.error,
          error: result.error,
          hasData: !!result.data,
          hasImages: !!(result.data?.images || result.images)
        });

        if (!response.ok) {
          const errorMsg = result.error || result.details || `${payload.model} failed`;
          console.error('❌ [ScriptMaker] Model failed:', {
            model: payload.model,
            status: response.status,
            error: errorMsg,
            fullResult: result
          });
          throw new Error(errorMsg);
        }

        const generatedUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;

        if (!generatedUrl) {
          console.error('❌ [ScriptMaker] No image URL in response:', result);
          throw new Error(`No image URL from ${payload.model}`);
        }

        console.log('✅ [ScriptMaker] Successfully generated with:', payload.model);
        return generatedUrl;
      };

      let imageUrl: string | null = null;
      let usedModel = primaryModelId;
      let lastError: Error | null = null;

      for (let i = 0; i < modelAttempts.length; i++) {
        const attempt = modelAttempts[i];
        try {
          imageUrl = await runModelAttempt(attempt.payload);
          usedModel = attempt.payload.model;

          if (usedModel !== primaryModelId) {
            toast({
              title: "Fallback Successful",
              description: `Shot generated with ${getModelFriendlyName(usedModel)}`
            });
          }

          break;
        } catch (attemptError) {
          lastError = attemptError instanceof Error ? attemptError : new Error('Unknown generation error');
          console.warn(`⚠️ [ScriptMaker] ${attempt.payload.model} failed:`, attemptError);

          if (attempt.fallbackToast && i < modelAttempts.length - 1) {
            toast({
              title: "Trying Fallback Model",
              description: attempt.fallbackToast,
            });
          }
        }
      }

      if (!imageUrl) {
        throw lastError || new Error('Failed to generate shot with any model');
      }

      // Update the shot with the generated image and model info
      const updatedMinutes = [...minutes];
      if (updatedMinutes[minuteIndex] && updatedMinutes[minuteIndex].shots) {
        updatedMinutes[minuteIndex].shots[shotIndex] = {
          ...updatedMinutes[minuteIndex].shots[shotIndex],
          imageUrl: imageUrl,
          generatedBy: usedModel // Track which model generated this shot
        };
        setMinutes(updatedMinutes);

        toast({
          title: "Shot Generated!",
          description: `Minute ${minuteIndex + 1}, Shot ${shotIndex + 1} is ready`,
        });
      }

    } catch (error) {
      console.error('❌ [ScriptMaker] Shot generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate shot",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAllShots = async (minuteIndex: number) => {
    const minute = minutes[minuteIndex];
    if (!minute || !minute.shots) return;

    toast({
      title: "Generating All Shots",
      description: `Creating all 12 shots for Minute ${minuteIndex + 1}...`,
      duration: 5000,
    });

    for (let shotIndex = 0; shotIndex < minute.shots.length; shotIndex++) {
      const shot = minute.shots[shotIndex];
      if (!shot.imageUrl) { // Only generate if not already generated
        await handleGenerateShot(minuteIndex, shotIndex, shot);
        // Add a small delay between shots to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const canProceedToCharacters = movieTitle && claudeEnhancedPlot && genreIdea && eraSetting && photoStyle;
  const canProceedToShotList = characterReferenceImages.length > 0 || characterProfiles.length > 0; // Has characters from either source
  const canGenerateScenes = minutes.length > 0;

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-[calc(100vh-72px)] flex bg-background overflow-hidden max-w-[100vw]">
      {/* Left Column - Project Setup */}
      <div className="hidden md:flex w-80 border-r border-border flex-col overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Film className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground tracking-tight">ScriptMaker</h2>
          </div>
          <p className="text-xs text-muted-foreground">AI-powered movie script generator</p>
        </div>

        {/* Step 1: Movie Idea */}
        <div className={`p-4 border-b border-border ${currentStep >= 1 ? '' : 'opacity-50'}`}>
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Step 1: Movie Idea</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Movie Title</label>
              <input
                type="text"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                placeholder="Enter movie title"
                className="w-full px-3 py-2 text-sm border border-border focus:border-ring focus:outline-none bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Genre</label>
              <select
                value={genreIdea}
                onChange={(e) => setGenreIdea(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border focus:border-ring focus:outline-none bg-card text-foreground"
              >
                <option value="">Select Genre</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Thriller">Thriller</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Your Plot Ideas</label>
              <textarea
                value={userPlotInput}
                onChange={(e) => setUserPlotInput(e.target.value)}
                placeholder="Type your movie plot ideas here... (stream of consciousness is fine!)"
                className="w-full px-3 py-2 text-sm border border-border focus:border-ring focus:outline-none resize-none bg-card text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 Just start typing - Claude will enhance and structure your ideas below
              </p>
            </div>

            {/* Claude Enhanced Plot Output */}
            {(isAnalyzingPlot || claudeEnhancedPlot) && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1 flex items-center justify-between">
                  <span>Claude Enhanced Plot</span>
                  {isAnalyzingPlot && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Analyzing...
                    </span>
                  )}
                  {!isAnalyzingPlot && hasAnalyzedPlot && claudeEnhancedPlot && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enhanced
                    </span>
                  )}
                </label>
                <div className="w-full px-3 py-2 text-sm border border-border bg-card/50 min-h-[100px] max-h-[200px] overflow-y-auto">
                  {isAnalyzingPlot ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      <span>Claude is enhancing your plot...</span>
                    </div>
                  ) : claudeEnhancedPlot ? (
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{claudeEnhancedPlot}</p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ✨ This is the enhanced version that will be used for character and screenplay generation
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Era/Setting</label>
              <input
                type="text"
                value={eraSetting}
                onChange={(e) => setEraSetting(e.target.value)}
                placeholder="e.g., Present Day, 1920s, Medieval"
                className="w-full px-3 py-2 text-sm border border-border focus:border-ring focus:outline-none bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Photo Style</label>
              <select
                value={photoStyle}
                onChange={(e) => setPhotoStyle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border focus:border-ring focus:outline-none bg-card text-foreground"
              >
                <option value="cinematic">Cinematic</option>
                <option value="vhs-aesthetic">VHS Aesthetic</option>
                <option value="retro">Retro</option>
                <option value="animation">Animation</option>
                <option value="manga">Manga/Anime</option>
                <option value="noir">Film Noir</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={minutesToExtract || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMinutesToExtract(isNaN(val) ? 5 : val);
                }}
                min="1"
                max="30"
                className="w-full px-3 py-2 text-sm border border-border focus:border-ring focus:outline-none bg-card text-foreground"
              />
            </div>

            {canProceedToCharacters && currentStep === 1 && (
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors tracking-wider"
                >
                  Next: Generate Screenplay →
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-background text-muted-foreground">OR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block">
                    <input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleScriptUpload}
                      className="hidden"
                      id="script-upload"
                    />
                    <div className="w-full px-4 py-2 text-sm font-medium text-muted-foreground border border-border hover:border-ring hover:text-foreground transition-all cursor-pointer text-center tracking-wider">
                      📄 Upload Your Own Script
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground text-center">
                    Skip screenplay generation and jump to shot list
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Screenplay */}
        <div className={`p-4 border-b border-border ${currentStep >= 2 ? '' : 'opacity-50'}`}>
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Step 2: Screenplay</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {currentStep < 2 ? 'Complete Step 1 to unlock' : 'Generate full screenplay'}
          </p>

          {currentStep >= 2 && !finalScript && (
            <button
              onClick={handleGenerateScript}
              disabled={isGenerating}
              className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wider"
            >
              {isGenerating ? 'Writing...' : 'Write Screenplay'}
            </button>
          )}

          {currentStep >= 2 && finalScript && (
            <div className="space-y-2">
              <div className="p-2 border border-border text-xs text-muted-foreground">
                ✅ Screenplay complete
              </div>
              {extractedCharacters.length > 0 ? (
                <>
                  <div className="p-2 border border-border text-xs text-muted-foreground">
                    Found {extractedCharacters.length} character{extractedCharacters.length > 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors tracking-wider"
                  >
                    Next: Upload Characters →
                  </button>
                </>
              ) : (
                <>
                  <div className="p-2 border border-border text-xs text-muted-foreground">
                    No characters auto-detected
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors tracking-wider"
                  >
                    Next: Add Characters →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Character Image Upload */}
        <div className={`p-4 border-b border-border ${currentStep >= 3 ? '' : 'opacity-50'}`}>
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Step 3: Character Images</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {currentStep < 3 ? 'Complete Step 2 to unlock' : 'Upload images for each character'}
          </p>

          {currentStep >= 3 && (
            <div className="space-y-2">
              {extractedCharacters.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload reference images for consistency:
                  </p>
                  {extractedCharacters.map((charName, index) => {
                    const hasImage = characterReferenceImages.some(img => img.characterName === charName);
                    return (
                      <div key={index} className={`p-2 border ${hasImage ? 'border-ring bg-card/50' : 'border-border bg-card'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{charName}</span>
                          {hasImage && <span className="text-xs text-muted-foreground">✓</span>}
                        </div>
                        <label className="block">
                          <div className="text-xs px-2 py-1 border border-border cursor-pointer hover:border-ring text-center text-muted-foreground hover:text-foreground transition-all">
                            {hasImage ? 'Update Image' : 'Upload Image'}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCharacterImageUpload(e, charName)}
                            disabled={isAnalyzingImage}
                            className="hidden"
                          />
                        </label>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-xs text-muted-foreground mb-2">
                  No characters were auto-detected. You can skip this step or add a character image below.
                </p>
              )}

              {/* Generic character upload for manual additions */}
              <label className="block">
                <div className="text-xs px-2 py-1 border border-dashed border-border cursor-pointer hover:border-ring text-center text-muted-foreground hover:text-foreground transition-all">
                  + Upload Character Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCharacterImageUpload(e)}
                  disabled={isAnalyzingImage}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setCurrentStep(4)}
                className="w-full mt-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors tracking-wider"
              >
                {characterReferenceImages.length > 0 || extractedCharacters.length > 0 ? 'Next: Style Reference →' : 'Skip to Style Reference →'}
              </button>
            </div>
          )}
        </div>

        {/* Step 4: Style Reference */}
        <div className={`p-4 border-b border-border ${currentStep >= 4 ? '' : 'opacity-50'}`}>
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Step 4: Style Reference</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {currentStep < 4 ? 'Complete Step 3 to unlock' : 'Upload a style reference image to guide all scene generations'}
          </p>

          {currentStep >= 4 && !styleReferenceImage && (
            <div className="space-y-4">
              <div className="border border-dashed border-border p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStyleImageUpload}
                  disabled={isAnalyzingStyle}
                  className="hidden"
                  id="style-upload"
                />
                <label
                  htmlFor="style-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 border border-border flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isAnalyzingStyle ? 'Analyzing style...' : 'Upload Style Reference Image'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Upload an image that represents the visual style you want for all scenes
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep >= 4 && styleReferenceImage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-border">
                <div className="w-8 h-8 border border-ring flex items-center justify-center">
                  <Video className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Style Reference Added</div>
                  <div className="text-xs text-muted-foreground">{styleReferenceImage.fileName}</div>
                </div>
              </div>

              <div className="bg-card p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-2">Style Analysis:</div>
                <div className="text-sm text-foreground">{styleReferenceImage.analysis}</div>
              </div>

              <button
                onClick={() => setCurrentStep(5)}
                className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors tracking-wider"
              >
                Next: Shot List →
              </button>
            </div>
          )}
        </div>

        {/* Step 5: Shot List Breakdown */}
        <div className={`p-4 border-b border-border ${currentStep >= 5 ? '' : 'opacity-50'}`}>
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Step 5: Shot List</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {currentStep < 5 ? 'Complete Step 4 to unlock' : 'Extract shots from screenplay'}
          </p>

          {currentStep >= 4 && (
            <button
              onClick={handleGenerateStoryboard}
              disabled={isGenerating}
              className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wider"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Shot List'}
            </button>
          )}
        </div>

        {/* Step 6: Generate Visual Scenes */}
        <div className={`p-4 ${currentStep >= 6 ? '' : 'opacity-50'}`}>
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Step 6: Visual Scenes</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {currentStep < 6 ? 'Complete Step 5 to unlock' : 'Generate scene images (12 per minute)'}
          </p>

          {currentStep >= 6 && (
            <div className="space-y-2">
              {Array.from({ length: minutesToExtract }, (_, i) => i + 1).map(minute => (
                <button
                  key={minute}
                  onClick={() => handleGenerateAllShots(minute - 1)}
                  disabled={isGenerating}
                  className="w-full px-3 py-2 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wider"
                >
                  {isGenerating ? 'Generating...' : `Minute ${minute}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Column - Dynamic Content Display */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div ref={contentAreaRef} className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden bg-card">
          {currentStep === 1 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 border border-border flex items-center justify-center">
                  <Film className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-2xl font-normal text-foreground tracking-tight mb-3">Welcome to ScriptMaker</h3>
                <p className="text-muted-foreground font-light mb-6">
                  Transform your movie ideas into complete screenplays with visual storyboards.
                  Upload character images for consistency across all scenes.
                </p>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 border border-border hover:border-border transition-colors">
                    <div className="text-xl font-medium text-foreground mb-1">1</div>
                    <div className="text-xs text-muted-foreground">Movie Idea</div>
                  </div>
                  <div className="p-3 border border-border hover:border-border transition-colors">
                    <div className="text-xl font-medium text-foreground mb-1">2</div>
                    <div className="text-xs text-muted-foreground">Screenplay</div>
                  </div>
                  <div className="p-3 border border-border hover:border-border transition-colors">
                    <div className="text-xl font-medium text-foreground mb-1">3</div>
                    <div className="text-xs text-muted-foreground">Character Upload</div>
                  </div>
                  <div className="p-3 border border-border hover:border-border transition-colors">
                    <div className="text-xl font-medium text-foreground mb-1">4</div>
                    <div className="text-xs text-muted-foreground">Shot List</div>
                  </div>
                  <div className="p-3 border border-border hover:border-border transition-colors col-span-2">
                    <div className="text-xl font-medium text-foreground mb-1">5</div>
                    <div className="text-xs text-muted-foreground">Visual Generation</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {finalScript && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-normal text-foreground tracking-tight">Screenplay</h2>
                <span className="text-sm text-muted-foreground">{minutesToExtract} minute screenplay</span>
              </div>
              <div className="border border-border p-8 max-h-[70vh] overflow-y-auto bg-background">
                <pre className="text-foreground font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {finalScript}
                </pre>
              </div>
            </div>
          )}

          {currentStep === 3 && extractedCharacters.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-normal text-foreground tracking-tight mb-4">Upload Character Images</h2>
              <p className="text-muted-foreground font-light mb-6">
                Upload reference images for each character found in your screenplay. These will ensure visual consistency across all generated scenes.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedCharacters.map((charName, index) => {
                  const charImage = characterReferenceImages.find(img => img.characterName === charName);

                  return (
                    <div key={index} className="border border-border p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-foreground tracking-tight">{charName}</h3>
                        {charImage && (
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Uploaded
                          </span>
                        )}
                      </div>

                      {charImage ? (
                        <div className="space-y-3">
                          <img
                            src={charImage.url}
                            alt={charName}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-background border border-border text-xs text-muted-foreground">
                            <strong>Analysis:</strong> {charImage.analysis.substring(0, 150)}...
                          </div>
                          <label className="block">
                            <div className="w-full px-4 py-2 text-sm font-medium text-muted-foreground border border-border cursor-pointer hover:border-ring hover:text-foreground text-center transition-all tracking-wider">
                              Update Image
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCharacterImageUpload(e, charName)}
                              disabled={isAnalyzingImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="block">
                          <div className="w-full h-48 border border-dashed border-border cursor-pointer hover:border-ring hover:bg-secondary/50 transition-colors flex flex-col items-center justify-center gap-2">
                            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-muted-foreground">
                              {isAnalyzingImage ? 'Analyzing...' : 'Click to upload'}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCharacterImageUpload(e, charName)}
                            disabled={isAnalyzingImage}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>💡 Tip:</strong> Uploaded {characterReferenceImages.filter(img => img.characterName).length}/{extractedCharacters.length} characters.
                  {characterReferenceImages.filter(img => img.characterName).length === 0 && ' Upload at least one character to proceed.'}
                </p>
              </div>
            </div>
          )}

          {currentStep >= 4 && minutes.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <h2 className="font-display text-2xl font-normal text-foreground tracking-tight mb-4">Visual Storyboard</h2>
              <p className="text-sm text-muted-foreground font-light mb-6">
                Shot-by-shot breakdown ready for visual generation with {getModelFriendlyName(selectedModel)}
              </p>

              {minutes.map((minute: any, minuteIndex: number) => (
                <div key={minuteIndex} className="mb-8">
                  <div className="bg-primary text-primary-foreground px-4 py-2 font-medium flex items-center justify-between">
                    <span className="text-sm tracking-wider">MINUTE {minuteIndex + 1}</span>
                    <button
                      onClick={() => handleGenerateAllShots(minuteIndex)}
                      disabled={isGenerating}
                      className="text-xs px-3 py-1 border border-border text-muted-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Generate All 12 Shots
                    </button>
                  </div>
                  <div className="border border-border border-t-0 p-6 bg-background">
                    {minute.script && (
                      <div className="mb-4 p-4 bg-card border border-border">
                        <h4 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2">Scene Overview</h4>
                        <p className="text-sm text-muted-foreground">{minute.script}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {minute.shots && minute.shots.map((shot: any, shotIndex: number) => (
                        <div key={shotIndex} className="border border-border p-4 hover:border-ring transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground tracking-wider">SHOT {shot.shotNumber || shotIndex + 1}/12</span>
                            <button
                              onClick={() => handleGenerateShot(minuteIndex, shotIndex, shot)}
                              className="text-xs px-2 py-1 text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                              disabled={isGenerating}
                            >
                              Generate
                            </button>
                          </div>

                          {shot.imageUrl ? (
                            <div className="relative group cursor-pointer" onClick={() => setFullscreenImage({url: shot.imageUrl, title: `Shot ${shot.shotNumber || shotIndex + 1}`})}>
                              <img
                                src={shot.imageUrl}
                                alt={`Shot ${shotIndex + 1}`}
                                className="w-full aspect-video object-cover mb-2"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 mb-2 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <div className="flex space-x-2 pointer-events-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditImage(shot.imageUrl);
                                    }}
                                    className="h-8 px-3 bg-white/20 text-foreground border border-white/30 hover:bg-white/30 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200"
                                    disabled={isDownloading}
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span className="text-sm">Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAnimateImage(shot.imageUrl);
                                    }}
                                    className="h-8 px-3 bg-white/20 text-foreground border border-white/30 hover:bg-white/30 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200"
                                    disabled={isDownloading}
                                  >
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm">Generate video</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(shot.imageUrl, `shot-${shot.shotNumber || shotIndex + 1}`, 'image');
                                    }}
                                    className="h-8 px-3 bg-white/20 text-foreground border border-white/30 hover:bg-white/30 backdrop-blur-sm flex items-center space-x-1 transition-all duration-200"
                                    disabled={isDownloading}
                                  >
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm">
                                      {isDownloading ? 'Downloading...' : 'Download'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full aspect-video bg-card border border-border mb-2 flex items-center justify-center">
                              <Film className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}

                          {shot.shotType && <p className="text-xs text-muted-foreground mb-1"><strong>Type:</strong> {shot.shotType}</p>}
                          {shot.camera && <p className="text-xs text-muted-foreground mb-1"><strong>Camera:</strong> {shot.camera}</p>}
                          {shot.action && <p className="text-xs text-muted-foreground mb-1">{shot.action}</p>}
                          {shot.lighting && <p className="text-xs text-muted-foreground mb-1"><strong>Lighting:</strong> {shot.lighting}</p>}
                          {shot.generatedBy && (
                            <p className="text-xs text-muted-foreground font-medium">
                              ✓ {getModelFriendlyName(shot.generatedBy)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Progress & Export */}
      <div className="hidden lg:flex w-64 border-l border-border flex-col bg-background shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Progress</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className={`p-3 border ${currentStep >= 1 ? 'border-ring' : 'border-border'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-sm text-foreground">Movie Idea</span>
              </div>
            </div>

            <div className={`p-3 border ${currentStep >= 2 ? 'border-ring' : 'border-border'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-sm text-foreground">Screenplay</span>
              </div>
            </div>

            <div className={`p-3 border ${currentStep >= 3 ? 'border-ring' : 'border-border'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  3
                </div>
                <span className="text-sm text-foreground">Character Upload</span>
              </div>
            </div>

            <div className={`p-3 border ${currentStep >= 4 ? 'border-ring' : 'border-border'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  currentStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  4
                </div>
                <span className="text-sm text-foreground">Style Reference</span>
              </div>
            </div>

            <div className={`p-3 border ${currentStep >= 5 ? 'border-ring' : 'border-border'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  currentStep >= 5 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  5
                </div>
                <span className="text-sm text-foreground">Shot List</span>
              </div>
            </div>

            <div className={`p-3 border ${currentStep >= 6 ? 'border-ring' : 'border-border'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  currentStep >= 6 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  6
                </div>
                <span className="text-sm text-foreground">Visual Scenes</span>
              </div>
            </div>
          </div>

          {currentStep >= 4 && minutes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">Generation Stats</h3>
              {minutes.map((minute: any, index: number) => {
                const totalShots = minute.shots?.length || 0;
                const generatedShots = minute.shots?.filter((s: any) => s.imageUrl).length || 0;
                const progress = totalShots > 0 ? (generatedShots / totalShots) * 100 : 0;

                return (
                  <div key={index} className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Minute {index + 1}</span>
                      <span>{generatedShots}/{totalShots}</span>
                    </div>
                    <div className="w-full bg-secondary h-1">
                      <div
                        className="bg-primary h-1 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <button
                className="w-full mt-4 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 tracking-wider"
                onClick={handleExportProject}
                disabled={!movieTitle || !finalScript || minutes.length === 0}
              >
                <Save className="w-4 h-4" />
                Export Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 z-10 border border-border hover:border-ring text-foreground p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={() => {
                  handleEditImage(fullscreenImage.url);
                  setFullscreenImage(null);
                }}
                className="h-12 px-6 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-2 transition-all duration-200"
                disabled={isDownloading}
              >
                <Edit className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wider">Edit</span>
              </button>
              <button
                onClick={() => {
                  handleAnimateImage(fullscreenImage.url);
                  setFullscreenImage(null);
                }}
                className="h-12 px-6 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-2 transition-all duration-200"
                disabled={isDownloading}
              >
                <Video className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wider">Generate Video</span>
              </button>
              <button
                onClick={() => {
                  handleDownload(fullscreenImage.url, fullscreenImage.title, 'image');
                  setFullscreenImage(null);
                }}
                className="h-12 px-6 bg-white/10 text-foreground border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center space-x-2 transition-all duration-200"
                disabled={isDownloading}
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wider">
                  {isDownloading ? 'Downloading...' : 'Download'}
                </span>
              </button>
            </div>

            {/* Title */}
            <div className="absolute top-4 left-4 border border-border text-foreground px-3 py-1 text-sm font-medium tracking-wider">
              {fullscreenImage.title}
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default function ScriptMakerPage() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingSpinner />}>
            <ScriptMakerContent />
          </Suspense>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

