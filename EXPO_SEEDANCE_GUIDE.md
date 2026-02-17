# EXPO - Seedance 2.0 Integration Guide

## Overview

The EXPO page is a dedicated interface for generating cinematic videos using BytePlus Seedance 2.0 AI model. This feature allows users to create high-quality videos from text prompts with full control over duration, resolution, and aspect ratio.

## Features

- **Text-to-Video Generation**: Create videos from descriptive text prompts
- **Customizable Parameters**:
  - Duration: 5-30 seconds
  - Resolution: 720p, 1080p, 4K
  - Aspect Ratio: 16:9, 9:16, 1:1, 4:3
- **Real-time Progress Tracking**: Monitor generation status with progress bar
- **Video Preview & Download**: Preview generated videos and download them
- **Modern UI**: Beautiful gradient interface with responsive design

## Setup Instructions

### 1. Get Your BytePlus API Key

1. Visit [BytePlus Console](https://console.byteplus.com/)
2. Navigate to **ModelArk > API Key Management**
3. Click **Create long-term key**
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env.local` file in your project root (or add to existing):

```bash
# BytePlus Seedance API Configuration
BYTEPLUS_API_KEY=your_api_key_here
BYTEPLUS_BASE_URL=https://ark.ap-southeast.bytepluses.com/api/v3
```

**Important**: Never commit your `.env.local` file to version control!

### 3. Verify Model ID

The current implementation uses `seedance-2-0` as the model ID. You may need to update this based on your BytePlus console:

1. Go to BytePlus Playground
2. Find the exact model ID for Seedance 2.0
3. Update the model ID in `src/app/api/generate-video/route.ts`:

```typescript
model: 'seedance-2-0', // Update this with exact ID from console
```

Common model IDs:
- `seedance-2-0` (Seedance 2.0)
- `seedance-1.5-pro` (Seedance 1.5 Pro - fallback if 2.0 not available)

## Usage

### Accessing the EXPO Page

Navigate to `/expo` in your application:
```
http://localhost:3000/expo
```

### Generating Videos

1. **Enter a Prompt**: Describe your video in detail
   - Example: "Tom Cruise fighting Brad Pitt on a rooftop, cinematic action scene with dramatic lighting"
   - Be specific about actions, settings, lighting, and mood

2. **Adjust Parameters**:
   - **Duration**: Choose video length (5-30 seconds)
   - **Resolution**: Select quality (720p, 1080p, 4K)
   - **Aspect Ratio**: Pick format (16:9 for widescreen, 9:16 for vertical, etc.)

3. **Generate**: Click "Generate Video" button

4. **Wait**: Generation typically takes 1-5 minutes
   - Progress bar shows current status
   - Status updates every 10 seconds

5. **Preview & Download**: Once complete, video appears in preview panel
   - Click "Download" to save locally
   - Click "Generate New" to create another video

## API Architecture

### API Routes

#### `/api/generate-video` (POST)
Creates a new video generation task.

**Request Body**:
```json
{
  "prompt": "string",
  "duration": 10,
  "resolution": "1080p",
  "ratio": "16:9"
}
```

**Response**:
```json
{
  "task_id": "string"
}
```

#### `/api/poll-task/[taskId]` (GET)
Polls the status of a generation task.

**Response**:
```json
{
  "status": "succeeded" | "running" | "failed",
  "result": {
    "video_url": "string"
  }
}
```

### Polling Mechanism

The frontend polls the task status every 10 seconds until:
- Status is `succeeded` → Video URL is returned
- Status is `failed` → Error message is shown
- Maximum time exceeded → Timeout error

## Advanced Features (Future Enhancements)

### Image-to-Video
To enable image-to-video generation, modify the API request in `src/app/api/generate-video/route.ts`:

```typescript
content: {
  text: prompt,
  references: [{ type: 'image', url: 'https://...' }]
}
```

### Additional Parameters
Seedance 2.0 supports additional parameters:

```typescript
parameters: {
  duration,
  resolution,
  ratio,
  seed: 12345, // For reproducible results
  camera_control: {
    // Camera movement controls
  },
  audio_sync: true, // Audio synchronization
}
```

## Troubleshooting

### "API key not configured" Error
- Ensure `BYTEPLUS_API_KEY` is set in `.env.local`
- Restart your development server after adding environment variables

### "No task_id returned" Error
- Check if the model ID is correct
- Verify your API key has access to Seedance models
- Check BytePlus console for API quota/limits

### Video Generation Fails
- Ensure prompt is descriptive and follows content guidelines
- Try shorter duration (5-10 seconds) first
- Check BytePlus console for error logs

### Polling Timeout
- Video generation can take 1-5+ minutes for longer/higher quality videos
- Check network connection
- Verify task status in BytePlus console

## Best Practices

1. **Prompt Writing**:
   - Be specific and descriptive
   - Include details about lighting, camera angles, mood
   - Mention specific actions and movements
   - Reference cinematic styles if desired

2. **Performance**:
   - Start with shorter durations (5-10s) for testing
   - Use 1080p for balance of quality and speed
   - 4K generation takes significantly longer

3. **Cost Management**:
   - Monitor usage in BytePlus console
   - Set up billing alerts
   - Test with shorter videos first

## Integration with DirectorChair AI

The EXPO page is designed to complement the main DirectorChair AI studio:
- Access from main navigation
- Consistent UI/UX with theme support
- Can be integrated into the main timeline workflow in future updates

## Support

For issues related to:
- **BytePlus API**: Contact BytePlus support or check their documentation
- **EXPO Integration**: Open an issue in the DirectorChair AI repository
- **Feature Requests**: Submit via GitHub issues

---

**Built with Next.js 14, TypeScript, and Tailwind CSS** 🎬✨

