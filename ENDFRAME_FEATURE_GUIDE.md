# EndFrame Feature Guide

## Overview
The EndFrame feature allows users to create smooth video transitions between two images using the Minimax API. This is perfect for creating morphing effects, character transformations, or scene transitions.

## How It Works
1. **Upload Two Images**: Users upload exactly two images - a start frame and an end frame
2. **Automatic Detection**: The system automatically detects when two images are uploaded and enables EndFrame mode
3. **Describe Transition**: Users describe the transition they want between the frames
4. **Generate Video**: The system uses Minimax's EndFrame API to create a smooth video transition

## Setup Requirements

### Environment Variables
Add the following environment variable to your `.env.local` file:

```bash
MINIMAX_API_KEY=your_minimax_api_key_here
```

You can obtain a Minimax API key from: https://api.minimax.chat/

### API Endpoint
The feature uses a new API endpoint: `/api/endframe`

## User Experience

### Visual Indicators
- **EndFrame Mode Banner**: When two images are uploaded, a purple gradient banner appears indicating EndFrame mode is active
- **Clear Instructions**: Users are guided to describe the transition between their start and end frames
- **Progress Feedback**: Toast notifications provide feedback during generation

### Supported Models
- **MiniMax-Hailuo-02**: The primary model used for EndFrame generation (default)

## Technical Implementation

### Files Added/Modified
- `src/types/endframe.ts` - TypeScript interfaces for EndFrame functionality
- `src/app/api/endframe/route.ts` - API route for Minimax integration
- `src/components/simple-chat-interface.tsx` - UI integration and detection logic

### Key Features
- **Automatic Mode Detection**: Detects when exactly 2 images are uploaded
- **Base64 Image Processing**: Converts uploaded images to the format required by Minimax
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Gallery Integration**: Generated videos are automatically added to the content gallery
- **Chat Integration**: Success/error messages appear in the chat interface

## Usage Examples

### Example Prompts for EndFrame Generation
- "Transform from a person to a dragon"
- "Morph from a house to a castle"
- "Change from day to night scene"
- "Transform from young to old person"
- "Morph from a car to a spaceship"

### Workflow
1. Upload first image (start frame)
2. Upload second image (end frame)
3. EndFrame mode automatically activates
4. Describe the desired transition
5. Click generate
6. Video is created and added to gallery

## Error Handling
The system handles various error scenarios:
- Missing API key
- Invalid image formats
- Network errors
- API rate limits
- Invalid responses

All errors are displayed to the user with clear, actionable messages.

## Future Enhancements
- Support for additional Minimax models
- Custom transition duration settings
- Batch processing of multiple frame pairs
- Integration with other video generation models
