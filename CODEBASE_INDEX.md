# DirectorChair AI - Codebase Index

## Project Overview
**DirectorChair AI** is a Next.js 15 application for AI-powered video, audio, and image generation. It integrates multiple AI services including Anthropic Claude, FAL.ai, Minimax, ElevenLabs, and more for creative content generation.

**Tech Stack:**
- **Framework:** Next.js 15.1.6 (React 19)
- **Language:** TypeScript 5.7.3
- **Styling:** Tailwind CSS with Radix UI components
- **Database:** Supabase
- **Authentication:** NextAuth 4.24.11
- **State Management:** Zustand 5.0.2
- **Video:** Remotion 4.0.249
- **AI/ML:** Multiple providers (Anthropic, FAL, Minimax, etc.)

---

## 📁 Directory Structure

### Root Configuration Files
```
.editorconfig              - Editor configuration
.env.directorchair        - Environment variables
.env.example              - Environment template
.gitignore                - Git ignore rules
biome.json                - Biome linter config
components.json           - Shadcn UI components
next.config.js/mjs        - Next.js configuration
package.json              - Dependencies and scripts
postcss.config.mjs        - PostCSS configuration
tailwind.config.ts        - Tailwind CSS config
tsconfig.json             - TypeScript configuration
vitest.config.ts          - Vitest test config
```

### Documentation Files
```
CODE_OF_CONDUCT.md                              - Community guidelines
COLLAPSIBLE_PANEL_IMPLEMENTATION.md             - UI feature docs
CONTRIBUTING.md                                 - Contribution guidelines
DIRECTORCHAIR_AI_COMPREHENSIVE_CAPABILITIES.md  - Feature documentation
IMPLEMENTATION_SUMMARY.md                       - Implementation notes
LICENSE                                         - License information
MINIMAX_VOICE_SYSTEM_GUIDE.md                  - Voice system guide
NANO_BANANA_EDIT_INTEGRATION.md                - Edit feature docs
README.md                                       - Project readme
SUPABASE_SETUP.md                              - Database setup guide
SYNC_LIPSYNC_GUIDE.md                          - Lip sync documentation
UI_REDESIGN_COMPARISON_REPORT.md               - UI design notes
VOICE_DISCOVERY_GUIDE.md                       - Voice feature guide
test-workflow.md                               - Testing workflow
```

### Database Schema Files
```
supabase-directorchair-setup.sql  - Initial setup
supabase-migration-directorchair.sql - Migration scripts
supabase-schema-production.sql    - Production schema
supabase-schema-simple.sql        - Simplified schema
supabase-schema.sql               - Main schema
```

---

## 🎯 Source Code Structure

### `/src/app` - Next.js App Router

#### Core App Files
```
layout.tsx       - Root layout with providers
page.tsx         - Home page
globals.css      - Global styles
error.tsx        - Error boundary page
loading.tsx      - Loading state
not-found.tsx    - 404 page
middleware.ts    - Route middleware
```

#### App Routes (`/src/app/`)
```
/app              - Main application interface
/audio-generation - Audio generation features
/auth             - Authentication pages
/gallery          - Media gallery view
/models           - AI model selection
/reset-password   - Password reset flow
/share            - Content sharing
/test-frames      - Frame testing utilities
/timeline         - Timeline editor
```

### `/src/app/api` - API Routes

#### Authentication
```
/api/auth/auth.config.ts          - Auth configuration
/api/auth/[...nextauth]           - NextAuth handler
/api/callback                     - OAuth callbacks
```

#### Generation APIs

**Image Generation:**
```
/api/generate/flux-pro            - Flux Pro image generation
/api/generate/photon              - Photon image generation
/api/generate/recraft             - Recraft image generation
/api/fal/image                    - FAL image generation
```

**Video Generation:**
```
/api/generate/video               - Main video generation
/api/generate/kling/v21-master    - Kling AI v2.1
/api/generate/luma                - Luma Dream Machine
/api/generate/luma/ray2-flash     - Luma Ray2 Flash
/api/generate/minimax/hailuo02    - Minimax Hailuo v02
/api/generate/veo3                - Google Veo 3
/api/generate/fal/video           - FAL video generation
/api/generate/fal/video/status    - Video status polling
/api/generate/fal/video/train     - Video model training
/api/fal/video                    - FAL video proxy
```

**Audio Generation:**
```
/api/generate/audio               - Main audio generation
/api/generate/elevenlabs-tts      - ElevenLabs TTS
/api/generate/minimax-tts         - Minimax TTS
/api/generate/minimax-voice-clone - Voice cloning
/api/generate/fal/audio           - FAL audio generation
```

**Lip Sync:**
```
/api/generate/sync-lipsync        - Sync Labs lip sync
/api/generate/fal/lipsync         - FAL lip sync
```

**Training:**
```
/api/generate/fal/train           - Model training
```

#### Utility APIs
```
/api/chat                         - Chat interface
/api/download                     - File downloads
/api/enhance-prompt               - AI prompt enhancement
/api/extract-prompt               - Prompt extraction
/api/intelligence-core            - AI intelligence core
/api/models                       - Model management
/api/queue                        - Generation queue
/api/queue/cancel                 - Cancel queue items
/api/queue/result                 - Queue results
/api/share                        - Content sharing
```

#### Upload APIs
```
/api/upload                       - General upload
/api/upload-audio                 - Audio upload
/api/upload-image                 - Image upload
/api/upload-video                 - Video upload
/api/uploads/[...path]            - Serve uploads
```

#### Custom Styles
```
/api/custom-styles/add            - Add custom style
```

#### User Management
```
/api/user/generations             - User generations
/api/user/profile                 - User profile
```

#### FAL Proxy
```
/api/fal                          - FAL main proxy
/api/fal/poll                     - FAL polling
/api/fal/proxy                    - FAL request proxy
```

---

## 🧩 Components (`/src/components`)

### Core Components
```
3d-loading-modal.tsx          - 3D loading animation
aspect-ratio.tsx              - Aspect ratio selector
AuthModal.tsx                 - Authentication modal
error-boundary.tsx            - Error boundary wrapper
gallery-view.tsx              - Gallery grid view
generation-loading-modal.tsx  - Generation progress modal
icons.tsx                     - Custom icon components
image-selector.tsx            - Image selection interface
loading.tsx                   - Loading indicators
logo.tsx                      - Logo component
queue-status-modal.tsx        - Queue status display
simple-chat-interface.tsx     - Chat UI component
theme-toggle.tsx              - Dark/light mode toggle
user-credits-display.tsx      - User credits display
```

### UI Components (`/src/components/ui`)
**Radix UI & Shadcn Components:**
```
accordion.tsx         - Accordion component
badge.tsx            - Badge component
button.tsx           - Button variants
card.tsx             - Card layouts
checkbox.tsx         - Checkbox input
collapsible.tsx      - Collapsible sections
command.tsx          - Command palette
dialog.tsx           - Modal dialogs
dropdown-menu.tsx    - Dropdown menus
form.tsx             - Form utilities
icons.tsx            - Icon library
input.tsx            - Text inputs
label.tsx            - Form labels
landing-laptop-mockup.tsx - Landing page mockup
popover.tsx          - Popover component
progress.tsx         - Progress bars
radio-group.tsx      - Radio button groups
select.tsx           - Select dropdowns
separator.tsx        - Divider lines
sheet.tsx            - Side sheets
skeleton.tsx         - Loading skeletons
slider.tsx           - Range sliders
switch.tsx           - Toggle switches
tabs.tsx             - Tab navigation
textarea.tsx         - Text areas
toast.tsx            - Toast notifications
toaster.tsx          - Toast container
toggle-group.tsx     - Toggle button groups
toggle.tsx           - Toggle buttons
tooltip.tsx          - Tooltips
use-toast.ts         - Toast hook
```

---

## 🔧 Library & Utilities (`/src/lib`)

### AI & API Integration
```
anthropic.ts                  - Anthropic Claude API client
claude-api.ts                 - Claude API wrapper
fal.client.ts                 - FAL client-side SDK
fal.server.ts                 - FAL server-side SDK
fal.ts                        - FAL utilities
```

### Core Logic
```
api-handlers.ts               - API request handlers
auteur-engine.ts              - Film director AI engine
intelligence-core.ts          - AI intelligence system
smart-controls-agent.ts       - Smart controls for UI
```

### Content Management
```
content-filtering-logger.ts   - Content moderation logging
content-storage.ts            - Content storage utilities
upload-handlers.ts            - File upload handlers
```

### Prompt & Style Management
```
custom-styles.ts              - Custom style definitions
film-director-data.ts         - Film director database
image-style-extractor.ts      - Style extraction logic
json-prompt-generator.ts      - JSON prompt builder
movies-database.ts            - Movies reference data
negative-prompts.ts           - Negative prompt presets
prompt-adherence-monitor.ts   - Prompt quality checker
```

### Database & Storage
```
supabase.ts                   - Supabase client setup
session-storage.ts            - Session storage utils
seed-manager.ts               - Seed value management
```

### Media Processing
```
video-thumbnail.ts            - Video thumbnail generator
voice-mappings.ts             - Voice ID mappings
```

### Utilities
```
utils.ts                      - General utilities
uuid-polyfill.ts              - UUID polyfill
```

### Types (`/src/lib/types`)
```
fal-ai.d.ts                   - FAL TypeScript definitions
fal-types.ts                  - FAL type definitions
```

---

## 🎣 Hooks (`/src/hooks`)

```
use-toast.ts              - Toast notification hook
useQueue.ts               - Generation queue management
useSupabaseContent.ts     - Supabase content fetching
useTimeline.ts            - Timeline state management
```

---

## 🌐 Contexts (`/src/contexts`)

```
AuthContext.tsx           - Authentication context provider
```

---

## 📊 Data Layer (`/src/data`)

```
db.ts                     - Database connection
mutations.ts              - Data mutations
queries.ts                - Data queries
schema.ts                 - Database schema definitions
seed.ts                   - Database seeding
store.ts                  - Client-side data store
```

---

## ⚙️ Configuration (`/src/config`)

```
storage.ts                - Storage configuration
```

---

## 🧪 Tests (`/src/tests`)

```
fal-models-test.ts                - FAL models testing
file-upload-realtime-test.ts      - Upload testing
hunyuan-lora-training-test.ts     - LoRA training tests
image-generation-test.ts          - Image gen tests
image-models-test.ts              - Image model tests
kling-test.ts                     - Kling AI tests
lipsync-test.ts                   - Lip sync tests
minimax-i2v-test.ts              - Minimax I2V tests
minimax-live-test.ts             - Minimax live tests
mmaudio-test.ts                  - Audio tests
```

---

## 📦 Key Dependencies

### AI/ML Services
- `@anthropic-ai/sdk` - Claude AI
- `@fal-ai/client` & `@fal-ai/server-proxy` - FAL.ai
- `@langchain/*` - LangChain framework

### UI Framework
- `next` - Next.js framework
- `react` & `react-dom` - React 19
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animations
- `lucide-react` - Icon library

### Media Processing
- `@remotion/*` - Video processing
- `@ffmpeg/*` - Video/audio manipulation
- `three` - 3D graphics

### Data & State
- `@supabase/supabase-js` - Supabase client
- `zustand` - State management
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form handling
- `zod` - Schema validation

### Development
- `typescript` - Type safety
- `@biomejs/biome` - Linting & formatting
- `vitest` - Testing framework

---

## 🚀 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run Next.js linter
npm run format    # Format code with Biome
npm run test      # Run Vitest tests
```

---

## 🔐 Environment Variables

Key environment variables (see `.env.example`):
- Supabase configuration
- API keys for AI services (Anthropic, FAL, Minimax, ElevenLabs)
- NextAuth configuration
- Storage credentials

---

## 🎨 Features

### Content Generation
- **Image Generation:** Flux Pro, Photon, Recraft
- **Video Generation:** Kling AI, Luma, Minimax, Veo3
- **Audio Generation:** ElevenLabs, Minimax TTS
- **Voice Cloning:** Minimax voice cloning
- **Lip Sync:** Sync Labs, FAL lip sync

### Intelligence Features
- AI-powered prompt enhancement
- Style extraction from images
- Film director simulation
- Smart UI controls
- Content filtering

### User Features
- Authentication (NextAuth)
- User profiles
- Generation history
- Credit system
- Gallery view
- Timeline editor
- Content sharing

### Media Management
- File uploads (image, video, audio)
- Custom style library
- Queue management
- Real-time status updates

---

## 📱 Public Assets (`/public`)

- Brand logos (ByteDance, DeepSeek, ElevenLabs, Flux, Gemini, Ideogram, Kling, Minimax)
- Sample videos and images
- User uploads directory
- Style reference images

---

## 🏗️ Architecture Patterns

### Next.js App Router
- Server Components by default
- API routes in `/app/api`
- Route groups for organization
- Loading and error states

### State Management
- Zustand for global state
- React Query for server state
- Context API for auth
- Local storage for preferences

### Data Fetching
- Server Actions where applicable
- API routes for complex logic
- Real-time with Supabase
- Queue system for async tasks

### Styling
- Tailwind utility classes
- CSS variables for theming
- Radix UI primitives
- Responsive design patterns

---

## 🔄 Key Workflows

### Content Generation Flow
1. User inputs prompt/parameters
2. Request sent to appropriate API endpoint
3. Queue system manages generation
4. Status updates via polling/real-time
5. Result stored in Supabase
6. Content displayed in gallery

### Authentication Flow
1. NextAuth handles OAuth/credentials
2. Session stored and validated
3. Protected routes check auth state
4. User profile loaded from Supabase

### Upload Flow
1. Client uploads via API route
2. File processed/validated
3. Stored in Supabase storage
4. URL returned to client
5. Reference saved to database

---

## 📝 Notes

- Project uses Next.js 15 App Router exclusively
- React Server Components for better performance
- TypeScript for type safety
- Supabase for auth, database, and storage
- Multiple AI provider integrations
- Queue-based generation system
- Real-time updates where applicable
- Comprehensive testing setup

---

**Last Updated:** January 2025
**Version:** 0.1.0
