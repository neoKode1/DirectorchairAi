# DirectorchairAI - Comprehensive Capabilities Documentation

## 🎬 Overview

DirectorchairAI is an advanced AI-powered media studio that combines film director intelligence with cutting-edge AI content generation. The application provides a conversational interface where users can interact with an AI that thinks like a film director, capable of generating images, videos, audio, and voiceovers using natural language.

## 🧠 Core Intelligence System

### Intelligent Core (`src/lib/intelligence-core.ts`)
The heart of DirectorchairAI is the **IntelligenceCore** class that provides:

- **Intent Analysis**: Automatically detects user intent (image, video, audio, voiceover, text, analysis, clarification, lipsync)
- **Model Selection**: Intelligently selects optimal AI models based on user requests and available resources
- **Conversation Management**: Maintains context and provides intelligent responses
- **Task Delegation**: Routes generation tasks to appropriate models and endpoints
- **Style Enhancement**: Applies film director techniques and cinematic styling to prompts

### Key Features:
- **Contextual Memory**: Remembers conversation history and user preferences
- **Smart Model Routing**: Automatically selects the best model for each task
- **Director-Style Enhancement**: Applies cinematic techniques to all prompts
- **Multi-Modal Support**: Handles text, image, video, and audio inputs/outputs

## 💬 Conversational AI System

### Chat Interface (`src/components/intelligent-chat-interface.tsx`)
The conversational AI provides two distinct modes:

#### 1. **Chat Mode** (Conversational)
- **Natural Language Processing**: Powered by Claude AI (Anthropic)
- **Film Director Expertise**: Specialized knowledge in cinematography, lighting, composition
- **Contextual Responses**: Maintains conversation history and references previous discussions
- **Educational Content**: Teaches filmmaking concepts and techniques
- **Model Recommendations**: Suggests appropriate AI models for specific tasks

#### 2. **Generation Mode** (Content Creation)
- **Intent Detection**: Automatically detects when users want to generate content
- **Smart Workflows**: Executes complex multi-step generation processes
- **Real-time Progress**: Shows live generation progress and status updates
- **Content Management**: Handles uploads, downloads, and content organization

### Claude AI Integration (`src/lib/claude-api.ts`)
- **System Prompt**: Comprehensive film director persona with deep AI model knowledge
- **Conversation Context**: Maintains up to 12 previous messages for context
- **Fallback Responses**: Graceful degradation when Claude API is unavailable
- **Response Optimization**: Concise, actionable, and contextually aware responses

## 🤖 Available AI Models

### 🖼️ Image Generation Models

#### **Primary Models (Default: Nano Banana Edit)**
- **Nano Banana Edit** (`fal-ai/nano-banana/edit`) - **DEFAULT FOR CHAT**
  - Advanced image-to-image editing with precise controls
  - Fine-grained parameter control (strength, guidance scale)
  - Perfect for character variations and detailed modifications
  - Supports `image_urls` array for multiple image inputs

- **Google Imagen 4** (`fal-ai/imagen4/preview`)
  - Google's highest quality image generation
  - Enhanced detail, richer lighting, fewer artifacts
  - Excellent for photorealistic content

- **Stable Diffusion 3.5 Large** (`fal-ai/stable-diffusion-v35-large`)
  - Multimodal Diffusion Transformer
  - Improved image quality, typography, complex prompt understanding
  - Resource-efficient generation

- **Dreamina v3.1** (`fal-ai/bytedance/dreamina/v3.1/text-to-image`)
  - Superior picture effects with aesthetic improvements
  - Precise and diverse styles with rich details
  - Optimized for artistic content

#### **Advanced Image Models**
- **Flux Pro 1.1 Ultra** (`fal-ai/flux-pro/v1.1-ultra`)
  - Professional-grade image generation
  - Ultra quality with advanced features
  - Best for high-end commercial content

- **Flux Pro Kontext** (`fal-ai/flux-pro/kontext`)
  - Context-aware editing and manipulation
  - Requires reference image
  - Advanced image-to-image capabilities

- **FLUX LoRA Image-to-Image** (`fal-ai/flux-krea-lora/image-to-image`)
  - High-performance style transfer
  - Rapid artistic variations
  - LoRA adaptations for specific styles

#### **Specialized Image Models**
- **Gemini 2.5 Flash Image Edit** (`fal-ai/gemini-25-flash-image/edit`)
  - Google's multi-image editing model
  - Optimized for blending multiple reference images
  - Supports up to 5 images simultaneously
  - Streamlined API with powerful multi-image capabilities

- **Qwen Image Edit** (`fal-ai/qwen-image-edit`)
  - Superior text editing capabilities
  - Precise image modifications
  - Advanced text-to-image editing

- **Ideogram Character** (`fal-ai/ideogram/character`)
  - Consistent character appearances across multiple images
  - Maintained facial features and proportions
  - Perfect for storytelling and branding

### 🎥 Video Generation Models

#### **High-Quality Video Models**
- **Google Veo3 Fast** (`fal-ai/veo3/fast`)
  - Latest video generation with exceptional quality
  - 720p resolution, 8 seconds duration
  - Cost-effective option ($0.25/second)

- **Google Veo3 Standard** (`fal-ai/veo3/standard`)
  - High-quality video generation
  - 1080p resolution, 8 seconds duration
  - Premium quality option

- **Kling v2.1 Master (I2V)** (`fal-ai/kling-video/v2.1/master/image-to-video`)
  - Enhanced quality and motion realism
  - 5 seconds duration
  - Image-to-video generation

- **Kling v2.1 Master (T2V)** (`fal-ai/kling-video/v2.1/master/text-to-video`)
  - Text-to-video generation
  - Professional quality output
  - 5 seconds duration

#### **Specialized Video Models**
- **Luma Ray 2** (`fal-ai/luma-dream-machine/ray-2`)
  - Large-scale video generation
  - Realistic visuals with coherent motion
  - 5 seconds duration, 720p resolution

- **Luma Ray 2 Flash (I2V)** (`fal-ai/luma-dream-machine/ray-2-flash/image-to-video`)
  - Fast image-to-video generation
  - 540p resolution, 5 seconds duration
  - Automatic compression

- **Minimax Hailuo 02 Standard (I2V)** (`fal-ai/minimax/hailuo-02/standard/image-to-video`)
  - High-quality image-to-video generation
  - 768p resolution, 6 seconds duration
  - Enhanced motion and smoothness

- **Minimax Hailuo 02 Standard (T2V)** (`fal-ai/minimax/hailuo-02/standard/text-to-video`)
  - Text-to-video generation
  - 768p resolution, 6 seconds duration
  - Professional quality

- **Seedance 1.0 Pro (I2V)** (`fal-ai/bytedance/seedance/v1/pro/image-to-video`)
  - Multiple angle shot variations
  - 1080p resolution, 5 seconds duration
  - Advanced motion control

### 🎵 Audio & Voice Models

#### **Text-to-Speech Models**
- **ElevenLabs TTS Turbo v2.5** (`fal-ai/elevenlabs/tts/turbo-v2.5`)
  - High-quality text-to-speech
  - Natural voice synthesis
  - Multiple voice options
  - Advanced voice settings (stability, similarity boost, style)

- **MiniMax Speech 2.5 HD** (`fal-ai/minimax/preview/speech-2.5-hd`)
  - High-quality TTS with advanced AI techniques
  - Multiple voice options
  - Configurable audio settings (sample rate, bitrate, format)

#### **Voice Cloning**
- **MiniMax Voice Clone** (`fal-ai/minimax/voice-clone`)
  - Clone custom voices from audio samples
  - Generate personalized TTS
  - Noise reduction and volume normalization
  - Accuracy control (0.8 default)

#### **Lip Sync**
- **Sync LipSync** (`fal-ai/sync-lipsync`)
  - Advanced lip sync with multiple sync modes
  - Model version: lipsync-1.9.0-beta
  - Supports cut_off sync mode
  - Video and audio input required

### 🛠️ Utility Models

- **FFmpeg Extract Frame** (`fal-ai/ffmpeg-api/extract-frame`)
  - Extract frames from videos (first, middle, last)
  - Supports frame_type parameter
  - Useful for video analysis and thumbnails

## 🔧 API Endpoints

### Core Generation Endpoints

#### **Main Generation API** (`/api/generate`)
- **Purpose**: Central routing for all content generation
- **Methods**: POST
- **Features**: 
  - Automatic model detection (video vs image)
  - Request routing to specialized endpoints
  - Comprehensive logging and error handling

#### **FAL Image Proxy** (`/api/fal/image`)
- **Purpose**: Handles all image generation requests
- **Supported Models**: All image generation models
- **Features**:
  - Model-specific parameter handling
  - Image URL processing for image-to-image models
  - Nano Banana Edit special handling (image_urls array)
  - Automatic parameter validation

#### **FAL Video Proxy** (`/api/fal/video`)
- **Purpose**: Handles all video generation requests
- **Supported Models**: All video generation models
- **Features**:
  - Model-specific duration and resolution handling
  - HALU Minimax special parameter formatting
  - Automatic video processing

#### **FAL Audio Proxy** (`/api/fal/audio`)
- **Purpose**: Handles audio and voice generation
- **Supported Models**: TTS, voice cloning, audio generation
- **Features**:
  - Voice parameter configuration
  - Audio format optimization
  - Multiple TTS provider support

### Specialized Endpoints

#### **Chat API** (`/api/chat`)
- **Purpose**: Conversational AI responses
- **Features**:
  - Claude AI integration
  - Conversation history management
  - Context-aware responses
  - 30-second timeout protection

#### **Intelligence Core API** (`/api/intelligence-core`)
- **Purpose**: Core intelligence processing
- **Features**:
  - Intent analysis
  - Model selection
  - Task delegation
  - Context management

#### **Upload Endpoints**
- **Image Upload** (`/api/upload-image`)
- **Video Upload** (`/api/upload-video`)
- **Audio Upload** (`/api/upload-audio`)
- **General Upload** (`/api/upload`)

#### **Utility Endpoints**
- **Download** (`/api/download`)
- **Share** (`/api/share`)
- **Models** (`/api/models`)
- **Custom Styles** (`/api/custom-styles`)

## 🎯 Smart Features

### **Intent-Driven Workflow**
- **Automatic Intent Detection**: AI analyzes user input to determine desired action
- **Model Selection**: Intelligently chooses the best model for each task
- **Parameter Optimization**: Automatically sets optimal parameters for each model
- **Workflow Execution**: Seamlessly executes complex multi-step processes

### **Director-Style Enhancement**
- **Auteur Engine**: Applies film director techniques to all prompts
- **Cinematic Styling**: Enhances prompts with professional cinematography terms
- **Genre-Specific Enhancement**: Adapts styling based on content type
- **Style Reference Support**: Uses uploaded images to influence generation style

### **Advanced Content Management**
- **Frame System**: Two-slot image input for complex editing workflows
- **Multi-Image Support**: Handles primary image + style reference combinations
- **Content Filtering**: Intelligent content policy compliance
- **Cost Estimation**: Real-time cost tracking for AI model usage

### **User Experience Features**
- **Voice Input**: Microphone support for hands-free prompt creation
- **Real-time Progress**: Live generation tracking and status updates
- **Collapsible Panels**: Dynamic content management with smooth animations
- **Mobile Optimization**: Fully responsive design with touch-friendly interfaces
- **Accessibility**: Comprehensive accessibility features and ARIA labels

## 🔄 Conversational Workflow

### **Typical User Interaction Flow**

1. **User Input**: User types or speaks their request
2. **Intent Analysis**: AI determines if this is conversational or generative
3. **Response Generation**: 
   - **Chat Mode**: Provides conversational response with film director expertise
   - **Generation Mode**: Executes content generation with smart model selection
4. **Content Delivery**: Generated content appears in dynamic chat interface
5. **User Actions**: User can download, vary, or continue conversation

### **Character Variation Workflow** (As Requested)

When a user says "Put the character in that movie" or requests variations:

1. **Character Detection**: AI identifies the character in the uploaded image
2. **Shot Analysis**: Determines current shot type (medium shot, close-up, etc.)
3. **Variation Generation**: Creates 4 variations:
   - **Close-up shot** of the character's head
   - **Detail shot** of what they're holding
   - **Low-angle shot** at ground level
   - **Randomized variation** for creative diversity
4. **Model Selection**: Uses **Nano Banana Edit** as default for image variations
5. **Content Display**: Shows variations in chat interface with download/vary buttons

### **Smart Model Defaults**

- **Image Generation**: **Nano Banana Edit** (Advanced Controls) - DEFAULT
- **Video Generation**: User's preferred model or Kling v2.1 Master
- **Audio Generation**: ElevenLabs TTS Turbo v2.5
- **Voice Cloning**: MiniMax Voice Clone
- **Lip Sync**: Sync LipSync

## 🎨 Style and Customization

### **Style Presets**
- **Cinematic**: Professional movie-like style with dramatic lighting
- **Anime**: Japanese animation style with vibrant colors
- **3D Animation**: Modern 3D animated style with detailed textures
- **Photorealistic**: Ultra-realistic style with fine details
- **Watercolor**: Traditional watercolor painting style

### **Custom LoRA Support**
- **Cinema**: Professional cinematic styling
- **Cinematic**: Enhanced movie-like effects
- **Koala**: Unique artistic style

### **Style Reference System**
- Upload reference images to influence generation style
- Style strength control (0.0 to 1.0)
- Multi-image style blending
- Automatic style extraction and analysis

## 📱 User Interface Components

### **Main Interface**
- **Intelligent Chat Interface**: Primary conversational interface
- **Model Preference Selector**: Choose preferred models for each content type
- **Generated Content Display**: Dynamic content cards with actions
- **Floating Chat**: Quick access chat widget
- **Mobile Navigation**: Bottom navigation for mobile devices

### **Content Cards**
- **Download Button**: Direct download of generated content
- **Vary Button**: Generate variations of the content (as requested)
- **Share Button**: Share content with others
- **Progress Indicators**: Real-time generation progress
- **Model Information**: Shows which model was used

### **Advanced Controls**
- **Aspect Ratio Selection**: Choose output dimensions
- **Style Strength Slider**: Control style influence intensity
- **Parameter Controls**: Model-specific parameter adjustment
- **Batch Generation**: Generate multiple variations simultaneously

## 🔒 Security and Content Management

### **Content Filtering**
- **Intelligent Content Policy**: Automatic detection of policy violations
- **Content Logging**: Comprehensive logging for compliance
- **Safety Checkers**: Built-in safety mechanisms for all models
- **User Interaction Monitoring**: Analytics and usage tracking

### **Data Management**
- **Session Storage**: Temporary storage for conversation context
- **Content Storage**: Secure storage of generated content
- **User Preferences**: Persistent model preferences and settings
- **Upload Handling**: Secure file upload and processing

## 🚀 Performance and Optimization

### **Efficiency Features**
- **Smart Caching**: Intelligent caching of frequently used content
- **Parallel Processing**: Simultaneous generation of multiple variations
- **Resource Optimization**: Efficient use of AI model resources
- **Error Recovery**: Graceful handling of API failures and timeouts

### **Cost Management**
- **Real-time Cost Tracking**: Live cost estimation for all operations
- **Model Efficiency Ratings**: High/Medium/Low efficiency classifications
- **Budget Controls**: Optional spending limits and warnings
- **Usage Analytics**: Detailed usage statistics and cost breakdowns

## 🎯 Integration Points for Enhanced Conversational AI

### **Current State**
- ✅ **Fully Conversational**: Chat interface already supports natural conversation
- ✅ **Intent Detection**: Automatically detects generation vs. conversation requests
- ✅ **Context Memory**: Maintains conversation history and context
- ✅ **Smart Model Selection**: Automatically chooses appropriate models
- ✅ **Nano Banana Default**: Already set as default for image generation in chat

### **Recommended Enhancements for Full Conversational Experience**

1. **Enhanced Variation System**:
   - Implement the 4-variation system (close-up, detail, low-angle, random)
   - Add "Vary" button to all generated content cards
   - Automatic shot type detection and variation generation

2. **Improved Content Actions**:
   - Add download buttons to all content cards in chat
   - Implement one-click variation generation
   - Add content sharing capabilities within chat

3. **Conversational Generation**:
   - Seamless transition between conversation and generation
   - Natural language generation commands
   - Context-aware content creation

4. **Advanced Character Workflows**:
   - Character consistency across multiple generations
   - Automatic character detection and tracking
   - Movie scene integration capabilities

## 📊 Technical Architecture

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Full type safety and development experience
- **Tailwind CSS**: Utility-first styling framework
- **Shadcn/UI**: Modern component library
- **Framer Motion**: Smooth animations and transitions

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **FAL.ai Integration**: Primary AI model provider
- **Anthropic Claude**: Conversational AI backend
- **UploadThing**: File upload and management
- **Vercel**: Deployment and hosting platform

### **State Management**
- **React Hooks**: Local state management
- **Context API**: Global state sharing
- **Local Storage**: Persistent user preferences
- **Session Storage**: Temporary conversation data

## 🎬 Conclusion

DirectorchairAI is a comprehensive AI-powered media studio that successfully combines conversational AI with advanced content generation capabilities. The system is already highly conversational and intelligent, with the ability to:

- Engage in natural film director conversations
- Automatically detect user intent and generate appropriate content
- Use Nano Banana Edit as the default image generation model
- Provide intelligent model selection and parameter optimization
- Maintain conversation context and provide educational content

The application is well-positioned for enhanced conversational workflows, particularly the character variation system and improved content interaction features as requested. The foundation is solid and the architecture supports seamless integration of additional conversational features.
