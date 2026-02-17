# ScriptMaker Implementation Guide

## 🎬 Overview

**ScriptMaker** is a complete AI-powered movie script-to-visual pipeline that transforms raw creative ideas into professional screenplays with visual storyboards. It integrates Claude AI for script analysis and Nano Banana Edit for scene generation.

## 🚀 Features

### 1. **Claude AI Integration** (Background Intelligence)
- **Auto-Format Plot Ideas**: Claude automatically analyzes and formalizes stream-of-consciousness plot inputs
- **Character Generation**: Creates detailed character profiles with physical descriptions
- **Screenplay Writing**: Generates professionally formatted screenplays
- **Shot Breakdown**: Creates minute-by-minute shot lists (12 shots per minute)

### 2. **Visual Generation Pipeline**
- **Nano Banana Edit Integration**: Generates cinematic images for each shot
- **16:9 Aspect Ratio**: Perfect for widescreen cinematic format
- **Batch Generation**: Generate all 12 shots for a minute at once
- **Progress Tracking**: Real-time visualization of generation progress

### 3. **4-Step Workflow**

#### **Step 1: Movie Idea**
- Movie Title
- Genre (Action, Comedy, Drama, Horror, Romance, Sci-Fi, Thriller, Fantasy)
- Plot/Story (stream of consciousness - Claude will format it!)
- Era/Setting (Present Day, 1920s, Medieval, etc.)
- Photo Style (Cinematic, VHS, Retro, Animation, etc.)
- Duration (1-30 minutes)

**Claude Magic**: As you type your plot, Claude analyzes it in the background (2-second debounce) and automatically:
- Identifies core story elements
- Structures the narrative
- Adds professional detail
- Maintains genre conventions

#### **Step 2: Character Profiles**
Click "Generate Characters" to have Claude create:
- 3-5 main characters
- Physical descriptions (age, appearance, distinctive features)
- Personality traits and quirks
- Background and motivations
- Role in the story
- Character arc
- Visual style (clothing, accessories)

**Output**: Character cards with all details displayed

#### **Step 3: Screenplay**
Click "Write Screenplay" to generate:
- Properly formatted screenplay
- Scene headings (INT./EXT.)
- Action lines in present tense
- Character dialogue
- Parentheticals for tone
- Proper spacing and structure

**Output**: Full screenplay displayed in monospace font

#### **Step 4: Visual Storyboard**
Click "Generate Storyboard" to create:
- Shot-by-shot breakdown
- 12 shots per minute
- Shot type (WIDE SHOT, CLOSE-UP, etc.)
- Camera movement (STATIC, TRACKING, etc.)
- Action description
- Lighting notes
- Visual prompts ready for generation

**Visual Generation**: Each shot card has a "Generate" button that:
1. Builds a cinematic prompt from shot details
2. Calls Nano Banana Edit via `/api/generate`
3. Generates a 16:9 image
4. Displays the result in the shot card

**Batch Generation**: "Generate All 12 Shots" button for each minute

## 📁 File Structure

### New Files Created

```
src/app/script-maker/page.tsx          # Main ScriptMaker page
src/app/api/script-maker/analyze/route.ts  # Claude analysis API
SCRIPTMAKER_IMPLEMENTATION.md          # This documentation
```

### Modified Files

```
src/app/layout.tsx                     # Added navigation link
```

## 🔌 API Integration

### Claude Analysis API
**Endpoint**: `/api/script-maker/analyze`

**Analysis Types**:
1. `plot-formalization` - Auto-format plot ideas
2. `character-generation` - Generate character profiles
3. `screenplay-generation` - Write full screenplay
4. `storyboard-breakdown` - Create shot lists

**Request Format**:
```json
{
  "movieTitle": "The Last Horizon",
  "plot": "astronaut lost in space finds alien artifact...",
  "genreIdea": "Sci-Fi",
  "eraSetting": "2145",
  "photoStyle": "cinematic",
  "minutesToExtract": 5,
  "analysisType": "plot-formalization"
}
```

**Response Format**:
```json
{
  "success": true,
  "result": "Formatted plot or generated data",
  "analysisType": "plot-formalization"
}
```

### Nano Banana Edit Generation
**Endpoint**: `/api/generate`

**Model**: `fal-ai/nano-banana/edit`

**Parameters**:
```json
{
  "model": "fal-ai/nano-banana/edit",
  "prompt": "cinematic shot, wide shot, tracking camera, astronaut discovering alien artifact, dramatic lighting, from The Last Horizon, Sci-Fi genre, set in 2145",
  "aspect_ratio": "16:9",
  "num_images": 1,
  "output_format": "jpeg",
  "safety_tolerance": "2"
}
```

## 🎨 UI/UX Design

### Layout
- **Left Column (320px)**: Step-by-step controls and inputs
- **Center Column (flex-1)**: Generated content display
- **Right Column (256px)**: Progress tracker and export options

### Color Scheme
- **Primary**: Purple (#8b5cf6) - for buttons and accents
- **Success**: Green (#16a34a) - for progress indicators
- **Background**: Gray (#f9fafb) - for content area
- **Text**: Gray scale for hierarchy

### Animations
- Smooth transitions on hover states
- Progress bar animations
- Loading spinners with purple accent
- Toast notifications for feedback

## 🔧 Technical Implementation

### State Management
```typescript
const [movieTitle, setMovieTitle] = useState('');
const [plot, setPlot] = useState('');
const [genreIdea, setGenreIdea] = useState('');
const [eraSetting, setEraSetting] = useState('');
const [photoStyle, setPhotoStyle] = useState('cinematic');
const [minutesToExtract, setMinutesToExtract] = useState(5);
const [characterProfiles, setCharacterProfiles] = useState<any[]>([]);
const [finalScript, setFinalScript] = useState('');
const [minutes, setMinutes] = useState<any[]>([]);
const [currentStep, setCurrentStep] = useState(1);
const [isGenerating, setIsGenerating] = useState(false);
const [isAnalyzingPlot, setIsAnalyzingPlot] = useState(false);
```

### Auto-Analysis (Debounced)
```typescript
useEffect(() => {
  if (!plot || plot.length < 50) return;
  
  const timer = setTimeout(async () => {
    await handlePlotAnalysis();
  }, 2000); // Wait 2 seconds after user stops typing

  return () => clearTimeout(timer);
}, [plot]);
```

### Shot Generation Pipeline
```typescript
const handleGenerateShot = async (minuteIndex, shotIndex, shot) => {
  // 1. Build cinematic prompt
  const prompt = [photoStyle, shot.shotType, shot.camera, shot.action, 
                  shot.lighting, `from ${movieTitle}`, `${genreIdea} genre`]
                  .filter(Boolean).join(', ');

  // 2. Call Nano Banana Edit
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'fal-ai/nano-banana/edit',
      prompt,
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'jpeg'
    })
  });

  // 3. Update state with generated image
  const imageUrl = result.data?.images?.[0]?.url;
  const updatedMinutes = [...minutes];
  updatedMinutes[minuteIndex].shots[shotIndex].imageUrl = imageUrl;
  setMinutes(updatedMinutes);
};
```

## 📊 Progress Tracking

The right panel shows real-time generation progress:
- **Per-minute progress bars**: Shows X/12 shots generated
- **Visual progress indicator**: Green bar fills as shots complete
- **Step completion**: Green checkmarks for completed steps

## 🎯 User Flow

1. **Enter basic movie info** (title, genre, setting, duration)
2. **Type plot ideas** → Claude auto-formats in background
3. **Click "Generate Characters"** → Claude creates profiles
4. **Click "Write Screenplay"** → Claude writes formatted script
5. **Click "Generate Storyboard"** → Claude breaks down shots
6. **Click "Generate"** on individual shots → Nano Banana creates visuals
7. **OR** Click "Generate All 12 Shots" → Batch generate full minute
8. **Export Project** → Download complete storyboard

## 🚨 Error Handling

- **API Failures**: Toast notifications with error details
- **Missing Parameters**: Validation before API calls
- **Rate Limiting**: 1-second delay between batch shots
- **Generation Failures**: Individual shot errors don't block others

## 🔮 Future Enhancements

### Planned Features
1. **Video Generation**: Convert shots to video using Veo 3 or Kling
2. **Audio Integration**: Add voice-over using ElevenLabs TTS
3. **Character Consistency**: Use Ideogram Character for consistent faces
4. **Export Options**: PDF, HTML, ZIP with all assets
5. **Collaboration**: Multi-user project editing
6. **Template Library**: Pre-built story templates
7. **Style Transfer**: Apply director styles (Nolan, Villeneuve, etc.)

## 📝 Usage Example

```typescript
// User types in plot field:
"astronaut lost in space finds alien artifact that shows him visions"

// Claude auto-formats (after 2 seconds):
"In the year 2145, Captain Marcus Reed, a seasoned astronaut, becomes 
stranded in deep space after his ship suffers catastrophic damage. While 
drifting through the void, he discovers an ancient alien artifact that 
pulses with an otherworldly energy. When he touches it, the artifact 
floods his mind with vivid visions of distant civilizations, cosmic 
events, and a warning about Earth's future. Now Marcus must decide 
whether to trust these visions or dismiss them as hallucinations caused 
by isolation. With oxygen running low, he races against time to decode 
the artifact's message and find a way home before it's too late."

// User clicks "Generate Characters":
[
  {
    name: "Captain Marcus Reed",
    age: 42,
    physical: "Weathered face, short gray hair, intense blue eyes...",
    personality: "Pragmatic, resilient, haunted by past mission failures",
    role: "Protagonist - Lost astronaut seeking redemption",
    ...
  },
  ...
]

// User clicks "Write Screenplay":
"FADE IN:

EXT. SPACE - CONTINUOUS

The vastness of space stretches infinitely. Stars glitter like diamonds 
against the black velvet of the cosmos.

INT. DAMAGED SPACECRAFT - CONTINUOUS

CAPTAIN MARCUS REED (42), weathered and weary, floats in zero gravity 
among debris and sparking equipment..."

// User clicks "Generate Storyboard":
Minute 1 - Shot 1/12:
  Type: WIDE SHOT
  Camera: CRANE MOVEMENT
  Action: Establish vastness of space, damaged ship visible
  Lighting: High contrast, starlight illumination
  [Generate Button] ← Clicks this

// Nano Banana generates cinematic 16:9 image of the scene
```

## ✅ Build Status

**Build**: ✅ Successful  
**Route**: `/script-maker` (7.15 kB)  
**API**: `/api/script-maker/analyze` (273 B)  
**Dependencies**: Claude API, Nano Banana Edit

## 🎓 Key Learnings

1. **Debounced Analysis**: Prevents API spam while maintaining responsiveness
2. **Step-by-Step Flow**: Clear progression keeps users oriented
3. **Visual Feedback**: Toast notifications and progress bars essential
4. **Batch Operations**: "Generate All" saves time for users
5. **Error Resilience**: Individual shot failures don't break the pipeline

## 🔐 Environment Variables

Required:
```bash
ANTHROPIC_API_KEY=sk-ant-...  # For Claude AI
FAL_KEY=...                    # For Nano Banana Edit
```

## 📞 Support

For issues or questions:
- Check console logs for detailed error messages
- Verify API keys are set correctly
- Ensure Claude API has sufficient credits
- Check Nano Banana Edit model availability

---

**Built with**: Next.js 15, React 18, TypeScript, Tailwind CSS, Claude 3.5 Sonnet, Nano Banana Edit

