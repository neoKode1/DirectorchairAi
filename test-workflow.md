# User Workflow Testing Guide

## Monitoring Setup
The system now includes comprehensive user interaction monitoring. You can access the monitoring dashboard by clicking the "Monitor" button in the bottom-right corner of the screen.

## Test Scenarios

### 1. Basic Text-to-Image Generation
**Steps:**
1. Open the timeline page
2. Type a simple prompt like "a beautiful sunset"
3. Press Enter
4. **Expected:** Intent selection modal should appear with "Create Image" and "Create Video" options
5. Select "Create Image"
6. **Expected:** Generation should start with your preferred image model

**Monitor Check:** Look for `form_submit` and `intent_selection` actions in the monitoring dashboard.

### 2. Image Upload and Edit
**Steps:**
1. Upload an image using the file input
2. **Expected:** Intent selection modal should appear with image-specific options
3. Select "Edit"
4. Type a prompt like "make it more vibrant"
5. Press Enter
6. **Expected:** Should use Nano Banana Edit model

**Monitor Check:** Look for `image_upload`, `intent_selection`, and generation actions.

### 3. Click-to-Inject Functionality
**Steps:**
1. Generate some images first (use scenario 1 or 2)
2. In the content panel, click on a generated image
3. **Expected:** Image should be injected into the chat input
4. Type a prompt like "animate this"
5. Press Enter
6. **Expected:** Should show intent selection for animation

**Monitor Check:** Look for `image_click_injection` and `image_injection_received` actions.

### 4. Content Panel Interactions
**Steps:**
1. Generate multiple images
2. Click the "Inject" button on images
3. Use the navigation arrows if multiple variants exist
4. Try the "Animate" button
5. **Expected:** Each action should be logged

**Monitor Check:** Look for various content panel interaction actions.

## Common Issues to Watch For

### Click-to-Inject Not Working
**Symptoms:**
- Clicking image doesn't inject it into chat
- No console logs for `image_click_injection`

**Debug Steps:**
1. Check browser console for errors
2. Verify the image has the correct onClick handler
3. Check if event propagation is being blocked
4. Look for `image_injection_received` in monitoring

### Intent Selection Issues
**Symptoms:**
- Modal doesn't appear when expected
- Wrong model selected for intent

**Debug Steps:**
1. Check `intent_selection` logs in monitoring
2. Verify `selectedIntent` state is being set correctly
3. Check model preference validation

### Generation Failures
**Symptoms:**
- Empty generation data errors
- Wrong model being called

**Debug Steps:**
1. Check `form_submit` logs for input validation
2. Verify intent is being passed correctly to generation logic
3. Check model delegation logic

## Monitoring Dashboard Features

### Real-time Data
- Auto-refreshes every 5 seconds
- Shows last 30 minutes of interactions
- Displays action breakdown and recent interactions

### Export Capabilities
- Export all interaction data as JSON
- Clear data to start fresh
- Persistent storage across sessions

### Key Metrics
- Total interactions in session
- Most common user actions
- Unique action types
- Recent interaction timeline

## Console Logging
All interactions are logged to the browser console with emoji prefixes:
- 📊 [UserMonitor] - General user interactions
- 📊 [ContentPanelMonitor] - Content panel interactions
- 💉 [IntelligentChatInterface] - Image injection events
- 🎯 [Intent Selection] - Intent selection events

## Troubleshooting Commands
Open browser console and run these commands:

```javascript
// Get session summary
UserInteractionMonitor.getSessionSummary()

// Export current data
UserInteractionMonitor.exportLog()

// Clear all data
localStorage.removeItem('user-interaction-log')
localStorage.removeItem('content-panel-interactions')
```

## Expected Workflow Patterns

### New User Pattern
1. `form_submit` (text only)
2. `intent_selection` (create-image/create-video)
3. Generation process
4. `content_generated`

### Image Upload Pattern
1. `image_upload`
2. `intent_selection` (edit/animate/style)
3. `form_submit` (with image)
4. Generation process
5. `content_generated`

### Content Panel Pattern
1. `image_click_injection`
2. `image_injection_received`
3. `form_submit` (with injected image)
4. `intent_selection`
5. Generation process
