# DirectorchairAI

**AI-Powered Media Studio with Film Director Intelligence**

Create professional media with AI that thinks like a film director. Generate images, videos, audio, and voiceovers using natural language and get intelligent cinematographic guidance with automated smart controls.

## 🚀 Features

### Core AI Capabilities
- **Intelligent Chat Interface**: Natural language interaction with AI that understands film direction
- **Multi-Model Generation**: Support for images, videos, audio, and voiceovers
- **Auteur Engine**: Film director-style prompt enhancement with genre-specific styling
- **Smart Controls Agent**: Automated parameter optimization with background intelligence
- **Real-time Generation**: Live progress tracking and content preview
- **Collapsible Content Panel**: Dynamic content management with smooth slide animations
- **Prompt Copy Functionality**: Clickable prompts with one-click clipboard copying
- **Intent-Driven Workflow**: Clear intent selection for image editing, animation, and style transfer
- **User Interaction Monitoring**: Comprehensive logging and analytics for user experience insights

### Intent-Driven Workflow
- **Intent Selection Modal**: Clear options for Edit, Animate, Style Transfer, Create Image, and Create Video
- **Model Preference Validation**: Automatic validation against user's preferred models
- **Smart Intent Detection**: AI-powered intent analysis with user confirmation
- **Seamless Workflow**: Smooth transitions between intent selection and generation
- **User Guidance**: Clear prompts and suggestions for optimal results
- **Frame System**: Two-slot image input system for primary image + optional style reference
- **Drag & Drop Support**: Intuitive drag and drop for both primary and style images
- **Dynamic UI**: Style reference slot appears only after primary image is uploaded

### Smart Controls Agent
- **Automatic Parameter Optimization**: Background agent analyzes prompts and optimizes settings
- **User Preference Learning**: Remembers user choices and respects manual overrides
- **Intelligent Aspect Ratio Selection**: Automatically chooses optimal aspect ratios
- **Content Type Detection**: Smart detection of image vs video intent
- **Resolution Optimization**: Automatic resolution selection based on model requirements
- **Style Enhancement**: Background style analysis and enhancement
- **Seamless Integration**: Works automatically without user intervention
- **Audio Toggle**: Coming soon text-to-speech generation toggle (disabled for future implementation)

### Content Management & Storage
- **Automatic Content Saving**: All generations automatically saved to localStorage
- **Content Gallery**: Organized storage and management of generated content
- **Storage Manager**: Export, import, and manage your content library
- **Session Management**: Create and manage different creative sessions
- **Persistent Storage**: Content survives page reloads and browser restarts
- **Image Compression**: Automatic image resizing for optimal API compatibility
- **Edit Button Integration**: One-click image editing from content panel

### Enhanced User Experience
- **Dual Mode Interface**: Chat mode for conversation, Gen mode for focused generation
- **Auto-Hide Smart Controls**: Clean interface in generation mode with background automation
- **Clickable Prompts**: One-click copying of suggested prompts to clipboard
- **Visual Feedback**: Toast notifications and progress indicators
- **Error Handling**: Comprehensive error messages and recovery options
- **Model Preference Sync**: Automatic synchronization across all interface elements
- **Centered Action Buttons**: Improved visual alignment and user interface
- **User Interaction Dashboard**: Real-time monitoring and analytics

### Mobile Optimization
- **Responsive Design**: Fully optimized for mobile devices with touch-friendly interfaces
- **Mobile Navigation**: Bottom navigation bar with quick access to key features
- **Touch Targets**: All interactive elements meet mobile accessibility standards (44px minimum)
- **Mobile-First Layout**: Adaptive layouts that work seamlessly across all screen sizes
- **Safe Area Support**: Proper handling of device safe areas and notches
- **Mobile Animations**: Smooth, performance-optimized animations for mobile devices
- **Mobile Typography**: Responsive text sizing that scales appropriately
- **Mobile Grid Systems**: Flexible grid layouts that adapt to screen size

### AI Models Supported

#### Image Generation
- **FLUX Pro 1.1 Ultra**: Professional-grade image generation
- **Stable Diffusion 3.5 Large**: Advanced stable diffusion model
- **Google Imagen 4**: Google's highest quality image generation
- **Dreamina v3.1**: Enhanced image generation with artistic styles
- **FLUX LoRA**: Image-to-image transformation with style transfer
- **Ideogram Character**: Character consistency for visual content
- **Nano Banana Edit**: Advanced image-to-image editing with precise modifications
- **Gemini 2.5 Flash Image Edit**: Google's state-of-the-art image editing with multi-image support

#### Video Generation
- **Google Veo3 Fast**: Cost-effective video generation ($0.25/second)
- **Google Veo3 Standard**: High-quality video generation
- **Kling v2.1 Master**: Professional video generation with advanced features
- **Luma Ray 2**: Natural motion video generation
- **Luma Ray 2 Flash**: Fast image-to-video generation with automatic compression
- **Minimax Hailuo 02**: Enhanced motion and smoothness
- **Seedance 1.0 Pro**: Multiple angle shot variations

#### Audio & Voice
- **ElevenLabs TTS Turbo v2.5**: High-quality text-to-speech
- **Stable Audio**: High-quality audio generation
- **Minimax Music**: AI-powered music generation

### Advanced Features
- **Voice Input**: Speak to the AI with microphone support and comprehensive diagnostics
- **Style Analysis**: Upload reference images for style extraction
- **Prompt Enhancement**: AI-powered prompt improvement with director insights
- **Custom LoRA Support**: Hard-coded custom styles (Cinema, Cinematic, Koala)
- **Content Filtering**: Intelligent content policy compliance
- **Cost Estimation**: Real-time cost tracking for AI model usage
- **Export Options**: Multiple format support for generated content
- **Image-to-Video Animation**: Seamless animation from generated images
- **Parameter Validation**: Automatic validation and correction of generation parameters
- **User Interaction Analytics**: Comprehensive logging and monitoring system
- **Frame System**: Advanced two-slot image input for complex editing workflows
- **Multi-Image Support**: Support for primary image + style reference combinations
- **Model-Specific Optimization**: Automatic parameter optimization for each AI model

## 🖼️ Frame System

The Frame System is an advanced image input interface that enables complex editing workflows with multiple image inputs:

### Two-Slot Design
- **Primary Image Slot**: Upload your main image for editing
- **Style Reference Slot**: Optionally upload a style reference image
- **Dynamic UI**: Style slot appears only after primary image is uploaded
- **Visual Feedback**: Clear preview of uploaded images with drag & drop support

### Supported Models
- **Nano Banana Edit**: Advanced image-to-image editing with precise control
- **Gemini 2.5 Flash Image Edit**: Google's state-of-the-art multi-image editing
- **FLUX LoRA**: Style transfer with reference image support

### Workflow
1. **Toggle Frame System**: Click "Show Frames" to enable the interface
2. **Upload Primary Image**: Drag & drop or click to upload your main image
3. **Add Style Reference** (Optional): Upload a reference image for style guidance
4. **Select Intent**: Choose "Edit" for image editing or "Style" for style transfer
5. **Generate**: Let the AI process both images for enhanced results

### Use Cases
- **Style Transfer**: Use reference images to apply specific artistic styles
- **Complex Editing**: Combine multiple images for sophisticated edits
- **Consistency**: Maintain visual consistency across multiple images
- **Creative Exploration**: Experiment with different style combinations

## 🎬 Auteur Engine

The Auteur Engine is a sophisticated prompt enhancement system that applies film director aesthetics to your AI generations:

### Supported Directors
- **Christopher Nolan**: IMAX-style cinematography with dramatic angles
- **Wes Anderson**: Symmetrical composition and distinctive color palettes
- **Denis Villeneuve**: Epic wide shots and atmospheric lighting
- **David Fincher**: Precise geometric composition and controlled lighting
- **Martin Scorsese**: Dynamic tracking shots and urban realism
- **Quentin Tarantino**: Stylized violence and pop culture references
- **Stanley Kubrick**: Perfect symmetry and clinical precision
- **Alfred Hitchcock**: Suspenseful atmosphere and psychological tension
- **Akira Kurosawa**: Epic scale and human drama
- **And many more...**

### Genre-Specific Styling
The system automatically detects content genre and applies appropriate director styles:
- **Action**: Dynamic camera movements and high-energy composition
- **Drama**: Intimate close-ups and emotional lighting
- **Horror**: Atmospheric tension and psychological elements
- **Sci-Fi**: Futuristic aesthetics and technological themes
- **Comedy**: Bright lighting and playful composition

## 🤖 Smart Controls Agent

The Smart Controls Agent is an intelligent background system that automatically optimizes your generation parameters:

### Automatic Optimization
- **Aspect Ratio Selection**: Analyzes prompts and selects optimal aspect ratios
- **Content Type Detection**: Automatically determines image vs video intent
- **Resolution Optimization**: Chooses appropriate resolutions for each model
- **Style Enhancement**: Applies cinematic styling automatically
- **Parameter Validation**: Ensures all parameters meet model requirements

### User Preference Learning
- **Manual Override Respect**: Remembers when users manually select settings
- **Temporary Override**: Respects manual choices for a set duration
- **Learning Algorithm**: Adapts to user preferences over time
- **Background Operation**: Works seamlessly without interrupting workflow

### Integration Features
- **Seamless Operation**: No user intervention required
- **Performance Optimization**: Efficient background processing
- **Error Recovery**: Automatic fallback to safe defaults
- **Cross-Model Compatibility**: Works with all supported AI models

## 📱 Mobile Experience

### Responsive Design
- **Adaptive Layouts**: Content automatically adjusts to screen size
- **Touch Optimization**: All buttons and controls optimized for touch interaction
- **Mobile Navigation**: Intuitive bottom navigation with quick access
- **Gesture Support**: Swipe and tap gestures for enhanced interaction

### Mobile-Specific Features
- **Bottom Navigation**: Easy access to Home, Chat, Models, and Gallery
- **Touch-Friendly Controls**: All interactive elements sized for mobile
- **Mobile-Optimized Animations**: Smooth, performance-optimized transitions
- **Responsive Typography**: Text that scales appropriately for mobile screens

## 🎨 Models Page

The Models Page provides a comprehensive interface for exploring and selecting AI models:

### Visual Design
- **Full-Screen Background**: Immersive Gen4.png background covering the entire viewport
- **PNG Icon Integration**: Each model uses its actual PNG icon as the full card background
- **Reduced Sidebar Blur**: Improved readability with minimal blur effects
- **Responsive Grid**: Adaptive grid layout that works on all screen sizes
- **Hover Effects**: Subtle glow and scale effects for interactive feedback

### Navigation Features
- **Category Organization**: Models organized by Image, Video, and Voice categories
- **Clickable Cards**: Each model card navigates to its specific interface
- **Use in Chat Button**: Quick access to set model as preferred and redirect to chat
- **Sidebar Navigation**: Clean sidebar with actual model PNG icons and readable text
- **Model Preferences**: Automatic synchronization with user's preferred models

### Model Categories
- **Image Models**: 9 models including Google Imagen 4, Stable Diffusion 3.5, Flux Pro, Gemini 2.5 Flash
- **Video Models**: 8 models including Google Veo3, Kling v2.1, Luma Ray 2, Minimax Hailuo 02
- **Voice Models**: ElevenLabs TTS Turbo v2.5 for text-to-speech generation

## 🎯 Usage Guide

### Getting Started
1. **Choose Your Mode**: Select "Chat" for conversation or "Gen" for focused generation
2. **Set Model Preferences**: Configure your preferred AI models for each content type
3. **Describe Your Vision**: Use natural language to describe what you want to create
4. **Select Intent**: Choose Edit, Animate, Style Transfer, Create Image, or Create Video
5. **Use Frame System** (Optional): Upload primary image + optional style reference for advanced editing
6. **Let AI Optimize**: The Smart Controls Agent automatically optimizes parameters
7. **Generate Content**: Click generate and watch your content come to life

### Advanced Features
- **Edit Button**: Click the Edit button on any generated image to modify it
- **Copy Prompts**: Click any suggested prompt to copy it to your clipboard
- **Manual Override**: Use "Show Controls" to manually adjust settings when needed
- **Style Reference**: Upload reference images for style transfer
- **Voice Input**: Use your microphone to describe your vision
- **Content Animation**: Animate generated images with one click
- **Monitor Usage**: Use the Monitor button to view interaction analytics
- **Frame System**: Toggle "Show Frames" to access advanced two-slot image input
- **Multi-Image Editing**: Upload primary image + style reference for complex edits
- **Model Comparison**: Test different models (Nano Banana vs Gemini) for best results

### Tips for Best Results
- **Be Descriptive**: Provide detailed descriptions for better results
- **Use Director References**: Mention specific directors or styles
- **Trust the Agent**: Let the Smart Controls Agent optimize parameters
- **Experiment**: Try different prompts and styles to discover new possibilities
- **Save Favorites**: Use the content panel to save and organize your best work
- **Use Intent Selection**: Choose the right intent for your desired outcome
- **Leverage Frame System**: Use primary + style reference for complex editing workflows
- **Compare Models**: Test Nano Banana Edit vs Gemini for different editing styles
- **Use Style References**: Upload reference images to guide the editing process

## 🔧 Technical Features

### API Integration
- **FAL.ai Integration**: Direct integration with FAL.ai's model ecosystem
- **Dedicated Routes**: Separate API routes for video and image generation
- **Parameter Validation**: Automatic validation and correction of API parameters
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Timeout Management**: Intelligent timeout handling for long-running generations
- **Claude AI Integration**: Advanced conversational AI for film direction guidance

### Performance Optimization
- **Image Compression**: Automatic compression for optimal API compatibility
- **Background Processing**: Non-blocking background operations
- **Memory Management**: Efficient memory usage and cleanup
- **Caching**: Smart caching of frequently used data
- **Lazy Loading**: Optimized loading of components and resources
- **Token Management**: Optimized token usage for AI model interactions

### Security & Privacy
- **Local Storage**: All content stored locally in your browser
- **No Data Collection**: No user data sent to external servers
- **Secure API Calls**: Secure communication with AI model APIs
- **Content Filtering**: Built-in content policy compliance
- **Environment Variables**: Secure API key management

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **Modern web browser**: Chrome, Firefox, Safari, Edge
- **Internet connection**: For AI model access
- **FAL.ai API key**: For full functionality (optional but recommended)
- **Anthropic API key**: For advanced chat features (optional)

### Installation

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

### Environment Setup

#### Required API Keys
- **FAL_KEY**: Get your free API key from [FAL.ai](https://fal.ai/)
- **ANTHROPIC_API_KEY**: Get your API key from [Anthropic](https://console.anthropic.com/)

#### Optional Configuration
- **NEXT_PUBLIC_APP_URL**: Your application URL (for production)
- **NEXTAUTH_SECRET**: Secret for authentication (if using auth features)

### Development Commands

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

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── timeline/          # Main application page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   ├── intelligent-chat-interface.tsx
│   ├── generated-content-display.tsx
│   └── user-interaction-monitor.tsx
├── lib/                  # Utility libraries
│   ├── claude-api.ts     # Claude AI integration
│   ├── intelligence-core.ts
│   └── content-storage.ts
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- **TypeScript**: All code should be written in TypeScript
- **React**: Use functional components with hooks
- **Tailwind CSS**: Use Tailwind for styling
- **Testing**: Write tests for new features
- **Documentation**: Update documentation for new features

### Code Style
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check our [Documentation](docs/)
- **Issues**: Open an [Issue](https://github.com/neoKode1/DirectorchairAi/issues)
- **Discussions**: Join our [Discussions](https://github.com/neoKode1/DirectorchairAi/discussions)
- **Discord**: Join our [Discord Community](https://discord.gg/directorchair)

## 🎬 Roadmap

### Upcoming Features
- **Advanced Video Editing**: Timeline-based video editing capabilities
- **Collaborative Sessions**: Real-time collaboration features
- **Advanced Analytics**: Detailed usage analytics and insights
- **Mobile App**: Native mobile applications
- **API Documentation**: Comprehensive API documentation
- **Plugin System**: Extensible plugin architecture

### Recent Updates
- **Models Page Redesign**: Complete redesign with PNG icons, full-screen background, and improved navigation
- **Sidebar Enhancement**: Reduced blur and improved readability with actual model PNG icons
- **Audio Toggle**: Coming soon audio generation toggle in smart controls (disabled for future implementation)
- **F Key Fix**: Disabled F key fullscreen to allow typing "F" in chat input
- **Frame System**: Advanced two-slot image input system for complex editing workflows
- **Gemini 2.5 Flash Image Edit**: New Google model with multi-image support
- **Nano Banana Edit**: Enhanced image editing with precise parameter control
- **Intent-Driven Workflow**: Clear intent selection for better user experience
- **User Interaction Monitoring**: Comprehensive analytics and logging
- **Edit Button Integration**: One-click image editing from content panel
- **Chat Response Fixes**: Improved chat interface with full response display
- **Mobile Optimization**: Enhanced mobile experience and responsiveness

---

**DirectorchairAI** - Where AI meets cinematic creativity 🎬✨

*Built with Next.js, React, TypeScript, and Tailwind CSS*