# DirectorChair AI

**AI-Powered Media Studio with Film Director Intelligence**

Create professional media with AI that thinks like a film director. Generate images, videos, audio, and voiceovers using natural language and get intelligent cinematographic guidance with automated smart controls.

![DirectorChair AI Screenshot](https://raw.githubusercontent.com/neoKode1/DirectorchairAi/main/public/Screenshot%20(2159).webp)

## 🎬 Demo Video

Watch DirectorChair AI in action:

<div align="center">
  <a href="https://youtu.be/tssJN3-TwvI?si=16X4QB_AZXq0NgAq">
    <img src="https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube" alt="Watch Demo Video" />
  </a>
</div>

*Click the badge above to watch the full demo video showcasing DirectorChair AI's capabilities*

## 🚀 Features

### 🎨 **Revolutionary Three-Column Interface**
- **Left Column - Chat Interface**: Natural language interaction with drag & drop image support
- **Center Column - Dynamic Content Display**: Auto-scrolling content area showing generated media
- **Right Column - Collapsible Gallery**: Smart content gallery with fullscreen viewing and actions
- **Seamless Integration**: All three columns work together for a unified creative workflow

### 💬 **Enhanced Chat Interface**
- **Drag & Drop Integration**: Invisible drop zone directly in text input for seamless image uploads
- **Keyboard Support**: Press Enter to submit prompts (just like any chat app)
- **Smart Image Context**: Chat remembers your last generated image for iterative editing
- **Floating Suggestions**: Auto-dissolving suggestion prompts after successful image generation
- **Settings Integration**: Built-in settings modal for aspect ratio, resolution, and video model preferences
- **Local Storage**: All chat history and settings persist across sessions

### 🎬 **Advanced Image-to-Video Workflow**
- **6 Image-to-Video Models**: Luma Ray 2 Flash, Kling v2.1 Master, Minimax Hailuo 02, Wan Pro, Seedance 1.0 Pro, Wan 2.5 Preview
- **Smart Video Detection**: Intelligent keyword detection for video generation intent
- **One-Click Animation**: Animate button in gallery automatically injects image and fills animation prompt
- **Model Preferences**: Set your preferred video model in settings for consistent results
- **Content Policy Fallback**: Automatic fallback from Nano Banana Edit to Seedream 4.0 Edit for policy violations

### 🖼️ **Intelligent Gallery System**
- **Fullscreen Viewing**: Click any content to view in fullscreen with action buttons
- **Three Action Buttons**: Download, Edit, and Animate buttons for each piece of content
- **Auto-Scroll Content**: Center content area automatically scrolls to show newly generated content
- **Collapsible Design**: Gallery slides away to maximize content viewing area
- **Local Storage**: All generated content automatically saved and organized
- **Delete Functionality**: Remove unwanted content with one click

### 🎯 **Smart Content Management**
- **Automatic Saving**: All generated content saved to browser localStorage
- **Content Persistence**: Survives page reloads and browser restarts
- **Gallery Integration**: Generated content appears in both center display and right gallery
- **Edit Workflow**: Click Edit button to inject image back into chat for modifications
- **Animation Workflow**: Click Animate button to automatically set up video generation

### 🤖 **AI Models Supported**

#### **Image Generation Models**
- **Google Imagen 4**: Google's highest quality image generation
- **Stable Diffusion 3.5 Large**: Advanced stable diffusion with improved typography
- **Dreamina v3.1**: Superior picture effects with diverse styles
- **Flux Pro 1.1 Ultra**: Professional-grade image generation
- **Flux Pro Kontext**: Context-aware editing and manipulation
- **Flux LoRA Image-to-Image**: High-performance style transfer
- **Nano Banana Edit**: Advanced image editing with precise controls
- **Gemini 2.5 Flash Image Edit**: Google's multi-image editing model
- **Qwen Image Edit**: Superior text editing capabilities
- **Seedream 4.0 Edit**: ByteDance's unified image generation and editing

#### **Image-to-Video Models** (6 Total)
- **Luma Ray 2 Flash**: Fast image-to-video with smooth motion
- **Kling v2.1 Master**: Enhanced quality and motion realism
- **Minimax Hailuo 02**: High-quality image-to-video generation
- **Wan Pro**: 6-second 1080p video generation (30 FPS)
- **Seedance 1.0 Pro**: Multiple angle shot variations with advanced motion control
- **Wan 2.5 Preview**: Flexible 5-10 second duration with prompt expansion

#### **Audio & Voice Models**
- **ElevenLabs TTS Turbo v2.5**: High-quality text-to-speech
- **MiniMax Speech 2.5 HD**: Advanced AI text-to-speech
- **MiniMax Voice Clone**: Custom voice cloning from audio samples
- **Sync LipSync**: Advanced lip sync with multiple modes

### 🔧 **Technical Excellence**
- **Unified API**: Single `/api/generate` endpoint handles all FAL model calls
- **Smart Fallback System**: Automatic retry with different models for content policy violations
- **Parameter Optimization**: Model-specific parameter handling for optimal results
- **Error Recovery**: Comprehensive error handling with user-friendly messages
- **Performance Optimization**: Efficient memory usage and background processing
- **TypeScript**: Full type safety throughout the application

### 📱 **Mobile-First Design**
- **Responsive Layout**: Three-column layout adapts perfectly to mobile screens
- **Touch Optimization**: All buttons and controls optimized for touch interaction
- **Mobile Navigation**: Intuitive navigation with touch-friendly targets
- **Performance Optimized**: Smooth animations and transitions on mobile devices

## 🎯 **Quick Start Guide**

### **Basic Workflow**
1. **Start Chatting**: Type your creative vision in the left chat panel
2. **Upload Images** (Optional): Drag & drop images directly into the text input
3. **Generate Content**: Press Enter or click Generate to create your media
4. **View Results**: Content appears in center panel and auto-scrolls into view
5. **Edit or Animate**: Use gallery buttons to edit images or create videos
6. **Save & Organize**: All content automatically saved to your personal gallery

### **Advanced Features**
- **Settings**: Click Settings button to configure aspect ratio, resolution, and video model preferences
- **Floating Suggestions**: After image generation, helpful animation suggestions appear and auto-dissolve
- **Gallery Actions**: Download, Edit, or Animate any content from the fullscreen gallery view
- **Smart Detection**: System automatically detects if you want video generation based on keywords
- **Model Fallback**: If content is rejected, system automatically tries alternative models

### **Pro Tips**
- **Use "Animate" keywords**: Words like "walking", "dancing", "camera movement" trigger video generation
- **Set Video Preferences**: Choose your preferred video model in Settings for consistent results
- **Iterative Editing**: Edit button injects images back into chat for easy modifications
- **Floating Suggestions**: Click any suggestion to automatically set up video generation
- **Keyboard Shortcuts**: Press Enter to submit prompts quickly

## 🚀 **Getting Started**

### **Prerequisites**
- **Node.js**: Version 18 or higher
- **Modern web browser**: Chrome, Firefox, Safari, Edge
- **Internet connection**: For AI model access
- **FAL.ai API key**: For full functionality

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/neoKode1/DirectorchairAi.git
   cd DirectorchairAi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   FAL_KEY=your_fal_ai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### **Environment Setup**

#### **Required API Keys**
- **FAL_KEY**: Get your free API key from [FAL.ai](https://fal.ai/)
- **ANTHROPIC_API_KEY**: Get your API key from [Anthropic](https://console.anthropic.com/)

### **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## 🏗️ **Project Structure**

```
src/
├── app/                           # Next.js app directory
│   ├── api/                      # API routes
│   │   └── generate/             # Unified generation endpoint
│   ├── timeline/                 # Main three-column application
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                      # UI components (buttons, cards, etc.)
│   ├── simple-chat-interface.tsx # Enhanced chat interface
│   ├── gallery-view.tsx         # Smart gallery with actions
│   └── content-storage.ts       # Local storage management
├── lib/                         # Utility libraries
│   ├── fal.ts                   # FAL model configurations
│   └── content-storage.ts       # Content persistence
└── types/                       # TypeScript type definitions
```

## 🎬 **Recent Updates**

### **v3.0.0 - Revolutionary UI Redesign**
- **Three-Column Layout**: Complete redesign with chat, content, and gallery columns
- **6 New Image-to-Video Models**: Added Wan Pro, Seedance 1.0 Pro, and Wan 2.5 Preview
- **Enhanced Chat Interface**: Drag & drop, keyboard support, floating suggestions
- **Smart Gallery System**: Fullscreen viewing with Download, Edit, and Animate buttons
- **Auto-Scroll Content**: Center area automatically scrolls to show new content
- **Collapsible Gallery**: Gallery slides away to maximize content viewing
- **Settings Integration**: Built-in modal for aspect ratio, resolution, and video model preferences
- **Content Persistence**: All chat history, settings, and generated content saved locally
- **Smart Video Detection**: Intelligent keyword detection for video generation
- **Fallback System**: Automatic retry with alternative models for content policy violations

### **v2.1.0 - Enhanced Reliability & User Experience**
- **Automatic Image Compression**: All uploaded images compressed for optimal API compatibility
- **Enhanced Error Handling**: Improved error messages for content policy violations
- **Video Thumbnail Extraction**: Automatic thumbnail generation for gallery cards
- **Video Download with Frames**: Download videos with extracted frames
- **Comprehensive Logging**: Detailed logging system for debugging
- **Model-Specific Parameter Handling**: Fixed parameter requirements for all models

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Guidelines**
- **TypeScript**: All code written in TypeScript
- **React**: Use functional components with hooks
- **Tailwind CSS**: Use Tailwind for styling
- **Testing**: Write tests for new features
- **Documentation**: Update documentation for new features

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:
- **Documentation**: Check our [Documentation](docs/)
- **Issues**: Open an [Issue](https://github.com/neoKode1/DirectorchairAi/issues)
- **Discussions**: Join our [Discussions](https://github.com/neoKode1/DirectorchairAi/discussions)

## 🎬 **Roadmap**

### **Upcoming Features**
- **Advanced Video Editing**: Timeline-based video editing capabilities
- **Collaborative Sessions**: Real-time collaboration features
- **Advanced Analytics**: Detailed usage analytics and insights
- **Mobile App**: Native mobile applications
- **Plugin System**: Extensible plugin architecture

---

**DirectorChair AI** - Where AI meets cinematic creativity 🎬✨

*Built with Next.js, React, TypeScript, and Tailwind CSS*