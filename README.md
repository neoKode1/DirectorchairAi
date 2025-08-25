# DirectorchairAI

**AI-Powered Media Studio with Film Director Intelligence**

Create professional media with AI that thinks like a film director. Generate images, videos, audio, and voiceovers using natural language and get intelligent cinematographic guidance.

## 🚀 Features

### Core AI Capabilities
- **Intelligent Chat Interface**: Natural language interaction with AI that understands film direction
- **Multi-Model Generation**: Support for images, videos, audio, and voiceovers
- **Auteur Engine**: Film director-style prompt enhancement with genre-specific styling
- **Smart Controls**: Advanced prompt engineering and style reference analysis
- **Real-time Generation**: Live progress tracking and content preview
- **Collapsible Content Panel**: Dynamic content management with smooth slide animations

### Content Management & Storage
- **Automatic Content Saving**: All generations automatically saved to localStorage
- **Content Gallery**: Organized storage and management of generated content
- **Storage Manager**: Export, import, and manage your content library
- **Session Management**: Create and manage different creative sessions
- **Persistent Storage**: Content survives page reloads and browser restarts

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

#### Video Generation
- **Google Veo3 Fast**: Cost-effective video generation ($0.25/second)
- **Google Veo3 Standard**: High-quality video generation
- **Kling v2.1 Master**: Professional video generation with advanced features
- **Luma Ray 2**: Natural motion video generation
- **Luma Ray 2 Flash**: Fast image-to-video generation
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

## 📱 Mobile Experience

### Responsive Design
- **Adaptive Layouts**: Content automatically adjusts to screen size
- **Touch Optimization**: All buttons and controls optimized for touch interaction
- **Mobile Navigation**: Intuitive bottom navigation with quick access
- **Gesture Support**: Swipe and tap gestures for enhanced interaction

### Mobile-Specific Features
- **Bottom Navigation**: Easy access to Home, Chat, Models, and Gallery
- **Mobile Menu**: Slide-out menu with additional options
- **Touch-Friendly Controls**: All interactive elements meet accessibility standards
- **Mobile Typography**: Responsive text that scales appropriately
- **Mobile Grids**: Flexible layouts that work on all screen sizes

## 🗂️ Content Management

### Collapsible Content Panel
- **Dynamic Interface**: Smooth slide-in/out animations
- **State Persistence**: Remembers your panel preferences
- **Keyboard Accessible**: Full keyboard navigation support
- **Responsive Design**: Works seamlessly on all devices

### Storage Features
- **Automatic Saving**: All generations saved automatically
- **Content Gallery**: Browse all your generated content
- **Storage Statistics**: Track usage and storage space
- **Export/Import**: Backup and restore your content library
- **Session Management**: Organize content by creative sessions

### Content Types Supported
- **Images**: All major formats (PNG, JPG, WEBP)
- **Videos**: MP4, MOV, and other video formats
- **Audio**: MP3, WAV, and audio files
- **Metadata**: Prompts, timestamps, and generation parameters

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom mobile utilities
- **AI Integration**: FAL.ai API with proxy server
- **Chat**: Claude AI for intelligent conversations
- **State Management**: Zustand for client-side state
- **UI Components**: Radix UI with custom mobile components
- **Animations**: Framer Motion and CSS animations
- **Storage**: localStorage with IndexedDB support
- **Mobile**: Responsive design with mobile-first approach

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FAL.ai API key
- Anthropic API key (for Claude chat)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/directorchair-ai.git
   cd directorchair-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   FAL_KEY=your_fal_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🧪 Beta Testing

### Current Status: **READY FOR BETA TESTING** ✅

The application is fully configured for beta testing with the following features:

#### Storage System
- ✅ **Public folder**: Configured with uploads directory
- ✅ **localStorage**: Fully implemented with 50MB limit
- ✅ **Content persistence**: Survives page reloads
- ✅ **Auto-save**: All generations automatically saved

#### Content Management
- ✅ **Collapsible panel**: Smooth animations and state persistence
- ✅ **Gallery view**: Browse all saved content
- ✅ **Storage manager**: Export/import functionality
- ✅ **Session management**: Organize by creative sessions

#### AI Integration
- ✅ **17 AI models**: All models configured and ready
- ✅ **Custom LoRAs**: Hard-coded cinema styles
- ✅ **Content filtering**: Policy compliance
- ✅ **Cost tracking**: Real-time usage monitoring

### Testing Checklist
- [ ] Generate images with different models
- [ ] Create videos with various durations
- [ ] Test voice input functionality
- [ ] Verify content panel collapse/expand
- [ ] Check content persistence across reloads
- [ ] Test export/import functionality
- [ ] Verify mobile responsiveness
- [ ] Test custom LoRA styles

## 📱 Mobile Development

### Mobile-First Approach
The application is built with a mobile-first approach, ensuring optimal performance and user experience across all devices.

### Mobile Utilities
Custom Tailwind utilities for mobile optimization:
- `mobile-px`, `mobile-py`: Responsive padding
- `mobile-text-*`: Responsive typography
- `mobile-grid-*`: Responsive grid layouts
- `mobile-touch-target`: Touch-friendly sizing
- `mobile-safe-area`: Safe area handling

### Mobile Components
- `MobileNavigation`: Bottom navigation bar
- `MobileTopNavigation`: Top navigation with menu
- Mobile-optimized modals and sheets
- Touch-friendly buttons and inputs

## 🎯 Usage

### Basic Workflow
1. **Start a Conversation**: Use the chat interface to describe what you want to create
2. **AI Analysis**: The system analyzes your request and selects appropriate models
3. **Style Enhancement**: The Auteur Engine applies director-specific styling
4. **Generation**: Content is generated with real-time progress tracking
5. **Review & Export**: Preview and download your generated content
6. **Content Management**: Access your content through the collapsible panel

### Advanced Features
- **Style Reference**: Upload images to extract and apply specific styles
- **Voice Input**: Use your microphone for hands-free interaction
- **Batch Generation**: Create multiple variations of your content
- **Cost Tracking**: Monitor your AI usage and costs in real-time
- **Content Export**: Backup your entire content library

## 🔧 Configuration

### Model Selection
The AI automatically selects the best model for your request, but you can also:
- Manually select specific models
- Set default preferences
- Configure cost limits and usage alerts

### Auteur Engine Settings
- Choose your preferred director style
- Set genre-specific preferences
- Configure prompt enhancement intensity
- Customize style application rules

### Storage Configuration
- Set storage limits and cleanup policies
- Configure export/import settings
- Manage session preferences
- Set content retention policies

## 📊 Performance

### Mobile Optimization
- **Lazy Loading**: Components load only when needed
- **Image Optimization**: Automatic image compression and optimization
- **Code Splitting**: Efficient bundle splitting for faster loading
- **Caching**: Intelligent caching for improved performance

### AI Performance
- **Real-time Processing**: Live progress updates during generation
- **Batch Operations**: Efficient handling of multiple requests
- **Error Recovery**: Graceful handling of API failures
- **Cost Optimization**: Smart model selection for cost efficiency

### Storage Performance
- **Efficient Storage**: Optimized localStorage usage
- **Automatic Cleanup**: Smart content management
- **Fast Retrieval**: Quick content loading and display
- **Export Optimization**: Efficient backup and restore

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both desktop and mobile
5. Submit a pull request

### Mobile Testing
- Test on various screen sizes (320px to 1920px+)
- Verify touch interactions work correctly
- Check performance on mobile devices
- Ensure accessibility standards are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FAL.ai** for providing the AI model infrastructure
- **Anthropic** for Claude AI integration
- **Next.js** team for the excellent framework
- **Tailwind CSS** for the utility-first styling system
- **Radix UI** for accessible component primitives

## 📞 Support

- **Documentation**: [docs.directorchair.ai](https://docs.directorchair.ai)
- **Discord**: [Join our community](https://discord.gg/directorchair)
- **Email**: support@directorchair.ai
- **Issues**: [GitHub Issues](https://github.com/your-username/directorchair-ai/issues)

---

**Built with ❤️ by [DeeptechAi](https://deeptech.ai)**

*Transform your creative vision with AI that thinks like a film director.*