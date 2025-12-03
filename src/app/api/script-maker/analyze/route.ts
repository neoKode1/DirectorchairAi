import { NextRequest, NextResponse } from 'next/server';
import { claudeAPI } from '@/lib/claude-api';

// Helper function to detect actual image type from base64 data by checking magic bytes
function detectImageType(base64Data: string): string | null {
  try {
    // Decode first few bytes to check magic numbers
    const binaryString = Buffer.from(base64Data.substring(0, 20), 'base64');
    const bytes = new Uint8Array(binaryString);

    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'image/png';
    }

    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }

    // WebP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return 'image/webp';
      }
    }

    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return 'image/gif';
    }

    return null;
  } catch (error) {
    console.error('Error detecting image type:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieTitle, plot, screenplay, genreIdea, eraSetting, photoStyle, minutesToExtract, characterProfiles, analysisType, styleImageUrl } = body;

    console.log('🎬 [Script Maker API] Received analysis request:', { 
      movieTitle, 
      genre: genreIdea,
      analysisType 
    });

    // Check if Claude API is available
    if (!claudeAPI.isAPIAvailable()) {
      return NextResponse.json({
        success: false,
        error: 'Claude API is not available. Please check your ANTHROPIC_API_KEY environment variable.'
      }, { status: 503 });
    }

    let systemPrompt = '';
    let userPrompt = '';

    // Handle different analysis types
    switch (analysisType) {
      case 'plot-formalization':
        systemPrompt = `You are a professional screenplay consultant with expertise in story structure and narrative development. Your task is to analyze and formalize stream-of-consciousness plot ideas into structured, coherent movie plot summaries.

**Your Process:**
1. **Identify Core Elements**: Extract the main conflict, protagonist, antagonist, setting, and stakes
2. **Structure the Narrative**: Organize the plot into a clear beginning, middle, and end
3. **Add Professional Detail**: Include character motivations, emotional arcs, and thematic elements
4. **Maintain Genre Conventions**: Ensure the plot fits ${genreIdea} genre expectations
5. **Cinematic Focus**: Think about visual storytelling and how scenes would play out on screen

**Output Format:**
Provide a well-structured plot summary (3-5 paragraphs) that:
- Opens with a compelling hook
- Introduces the protagonist and their world
- Establishes the central conflict
- Outlines the rising action and stakes
- Suggests the climactic moment
- Hints at the resolution (without spoiling the ending)

Keep the tone professional but engaging, as if pitching to a studio executive. Make it ${minutesToExtract} minutes of screen time worth of content.`;

        userPrompt = `Movie Title: "${movieTitle}"
Genre: ${genreIdea}
Era/Setting: ${eraSetting}
Photo Style: ${photoStyle}
Target Duration: ${minutesToExtract} minutes

Raw Plot Idea (stream of consciousness):
"${plot}"

Please formalize this into a professional movie plot summary that maintains the original creative vision while adding structure, clarity, and cinematic appeal.`;
        break;

      case 'character-generation':
        systemPrompt = `You are a world-class casting director and character designer. Create hyper-detailed character profiles for a ${genreIdea} movie set in ${eraSetting}.

**CRITICAL OUTPUT REQUIREMENTS:**
- Return ONLY valid JSON - no markdown, no code blocks, no explanations
- Use proper JSON escaping for all strings (escape quotes, newlines, etc.)
- Return a simple array of character objects
- Do not wrap in markdown code blocks

**Character Profile Requirements:**
For each character, provide:
1. **name**: Memorable and appropriate for the setting
2. **age**: Specific age (not ranges)
3. **physical**: Hair, eyes, build, distinctive features (single string)
4. **personality**: Core traits, quirks, speech patterns (single string)
5. **background**: Brief history that informs their motivations (single string)
6. **role**: Their function in the narrative (single string)

**Important:**
- Create 3-5 main characters
- Make physical descriptions detailed enough for AI image generation
- Ensure characters feel authentic to ${eraSetting}
- Match the tone of ${genreIdea} genre
- Consider visual style: ${photoStyle}
- Escape all special characters in JSON strings
- Keep descriptions concise (1-2 sentences each)

Example format:
[
  {
    "name": "John Smith",
    "age": 35,
    "physical": "Athletic build, short brown hair, piercing blue eyes, strong jawline",
    "personality": "Determined and resourceful with a dry sense of humor",
    "background": "Former soldier turned private investigator",
    "role": "Protagonist seeking redemption"
  }
]`;

        userPrompt = `Movie: "${movieTitle}"
Plot: ${plot}

Create detailed character profiles that bring this story to life. Focus on making them visually distinct and narratively compelling.

IMPORTANT: Return ONLY the JSON array, no other text or formatting.`;
        break;

      case 'screenplay-generation':
        systemPrompt = `You are a professional screenwriter with credits in ${genreIdea} films. Write a properly formatted ${minutesToExtract}-minute screenplay.

**Screenplay Format:**
Use proper screenplay formatting:
- FADE IN: / FADE OUT:
- Scene headings: INT./EXT. LOCATION - TIME OF DAY
- Action lines in present tense
- Character names in ALL CAPS when first introduced
- Dialogue with character name centered above
- Parentheticals for tone/action during dialogue
- Proper spacing and structure

**Story Requirements:**
- Duration: Approximately ${minutesToExtract} minutes (1 page = 1 minute)
- Genre: ${genreIdea} conventions and tropes
- Setting: ${eraSetting}
- Visual Style: ${photoStyle} aesthetic
- Story beats that work for the runtime

**Characters:**
${characterProfiles && characterProfiles.length > 0 ? characterProfiles.map((c: any) => `- ${c.name}: ${c.role || c.description || ''}`).join('\n') : 'Create compelling characters that fit the story'}

**Cinematic Considerations:**
- Write visually - show, don't tell
- Include specific camera directions sparingly (only when essential)
- Create memorable, quotable dialogue
- Build tension appropriate to ${genreIdea}
- Include at least 3 distinct locations
- End with a satisfying climax and resolution`;

        userPrompt = `Movie: "${movieTitle}"
Plot: ${plot}

Write a complete, professionally formatted ${minutesToExtract}-minute screenplay that captures this story with cinematic flair.`;
        break;

      case 'storyboard-breakdown':
        systemPrompt = `You are a storyboard artist and shot designer. Break down a screenplay into detailed shot-by-shot descriptions for visual generation.

**CRITICAL OUTPUT REQUIREMENTS:**
- Return ONLY valid JSON - no text before or after
- Do not wrap in markdown code blocks
- Use proper JSON escaping for all strings
- Return a JSON object with a "minutes" array

**Shot Breakdown Format:**
For EACH MINUTE of the ${minutesToExtract}-minute script, create exactly 12 shots.

Each shot object needs:
- shotNumber: 1-12
- shotType: (e.g., "WIDE SHOT", "CLOSE-UP", "MEDIUM SHOT")
- camera: (e.g., "STATIC", "TRACKING", "PAN")
- action: What happens in the frame (escape quotes!)
- lighting: Mood description
- characters: Array of character names present

**CRITICAL CHARACTER NAMING RULES:**
When describing characters in the "action" field, NEVER use character names. Instead use:
- "the character" for any single character
- "the woman" or "the man" based on gender
- "the person" when gender is unclear
- "the protagonist" for the main character
- "the antagonist" for the villain
- "the two characters" or "the group" for multiple people

WRONG: "Sarah walks into the room and looks around nervously"
CORRECT: "The woman walks into the room and looks around nervously"

WRONG: "John confronts the detective about the missing evidence"
CORRECT: "The man confronts the detective about the missing evidence"

Example format:
{
  "minutes": [
    {
      "minuteNumber": 1,
      "script": "Brief scene description",
      "shots": [
        {
          "shotNumber": 1,
          "shotType": "WIDE SHOT",
          "camera": "CRANE DOWN",
          "action": "Establishing shot of city skyline at sunset",
          "lighting": "Golden hour, warm tones",
          "characters": []
        },
        {
          "shotNumber": 2,
          "shotType": "MEDIUM SHOT",
          "camera": "STATIC",
          "action": "The woman enters the apartment and looks around nervously",
          "lighting": "Dim interior lighting, shadows",
          "characters": ["SARAH"]
        }
      ]
    }
  ]
}

**Important:**
- Escape all quotes in strings
- Keep descriptions concise
- Match lighting to ${photoStyle} style
- Create exactly 12 shots per minute
- Base shots on the screenplay scenes and action
- ALWAYS use generic character descriptors (the woman, the man, the character) in action descriptions, NEVER use character names`;

        userPrompt = `Movie: "${movieTitle}"
Duration: ${minutesToExtract} minutes
Genre: ${genreIdea}
Setting: ${eraSetting}

SCREENPLAY:
${screenplay || plot}

${characterProfiles && characterProfiles.length > 0 ? `\nCHARACTERS:\n${characterProfiles.map((c: any) => `- ${c.name}: ${c.description || c.role || ''}`).join('\n')}` : ''}

Analyze this screenplay and create a detailed shot-by-shot breakdown for each minute. Break down the story into exactly 12 shots per minute, describing the camera work, action, lighting, and characters in each shot.

IMPORTANT: Return ONLY the JSON object, no other text or markdown formatting.`;
        break;

      case 'style-analysis':
        systemPrompt = `You are a professional visual style consultant for film and media production. Your task is to analyze an uploaded reference image and extract detailed visual style information that can be used to guide consistent image generation for a movie project.

**Your Analysis Should Include:**
1. **Visual Style Category**: Identify the overall style (e.g., photorealistic, animated, cartoon, oil painting, watercolor, digital art, etc.)
2. **Color Palette**: Describe dominant colors, color temperature, saturation levels
3. **Lighting Style**: Analyze lighting approach (natural, dramatic, soft, harsh, etc.)
4. **Artistic Technique**: Identify rendering style, brushwork, or digital effects
5. **Mood and Atmosphere**: Describe the emotional tone and visual mood
6. **Technical Details**: Camera angle, composition style, depth of field
7. **Genre Indicators**: How the style relates to movie genres (horror, sci-fi, fantasy, etc.)

**Output Format:**
Provide a comprehensive style analysis (2-3 paragraphs) that describes:
- The visual style category and artistic approach
- Color palette and lighting characteristics  
- Mood, atmosphere, and emotional tone
- Technical and compositional elements
- How this style would work for the movie genre: ${genreIdea}

Focus on creating a detailed style guide that can be used to generate consistent visual content.`;

        userPrompt = `Movie Title: "${movieTitle}"
Genre: ${genreIdea}
Setting: ${eraSetting}

Please analyze the reference image I've provided and give me a detailed style analysis that can guide consistent visual generation for this ${genreIdea} movie project.`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analysis type'
        }, { status: 400 });
    }

    // Generate response using Claude with appropriate token limit
    let response: string;
    
    if (analysisType === 'plot-formalization' || analysisType === 'screenplay-generation') {
      // Use enhancePromptWithClaude for text generation (supports up to 4000 tokens)
      response = await claudeAPI.enhancePromptWithClaude(
        userPrompt,
        analysisType === 'storyboard-breakdown' ? 'storyboard' : 'screenplay',
        systemPrompt
      );
    } else {
      // For character-generation, storyboard-breakdown, and style-analysis, call Claude API directly with higher token limit
      if (!claudeAPI.isAPIAvailable()) {
        return NextResponse.json({
          success: false,
          error: 'Claude API is not available'
        }, { status: 503 });
      }

      // Call Claude API directly for full control over token limits
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // For style-analysis, we need to fetch the image and include it in the message
      let messageContent: any = userPrompt;

      if (analysisType === 'style-analysis' && styleImageUrl) {
        try {
          console.log('🖼️ [Script Maker API] Processing image for style analysis:', styleImageUrl.substring(0, 100));

          let base64Image: string;
          let contentType: string;

          // Check if it's already a data URL (base64)
          if (styleImageUrl.startsWith('data:')) {
            // Extract base64 and content type from data URL
            const matches = styleImageUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              contentType = matches[1];
              base64Image = matches[2];
              console.log('✅ [Script Maker API] Using existing base64 data URL, declared type:', contentType);

              // Verify the actual image format by checking magic bytes
              const actualType = detectImageType(base64Image);
              if (actualType && actualType !== contentType) {
                console.warn(`⚠️ [Script Maker API] Content type mismatch! Declared: ${contentType}, Actual: ${actualType}`);
                contentType = actualType; // Use the actual detected type
                console.log(`✅ [Script Maker API] Corrected content type to: ${contentType}`);
              }
            } else {
              console.error('❌ [Script Maker API] Invalid data URL format');
              throw new Error('Invalid data URL format');
            }
          } else {
            // Fetch the image from URL
            console.log('🖼️ [Script Maker API] Fetching image from URL');
            const imageResponse = await fetch(styleImageUrl);
            if (!imageResponse.ok) {
              console.error('❌ [Script Maker API] Failed to fetch image:', imageResponse.status);
              throw new Error(`Failed to fetch image: ${imageResponse.status}`);
            }

            // Convert to buffer and then to base64
            const arrayBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            base64Image = buffer.toString('base64');

            // Get content type from response
            contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

            // Verify the actual image format
            const actualType = detectImageType(base64Image);
            if (actualType && actualType !== contentType) {
              console.warn(`⚠️ [Script Maker API] Content type mismatch! Header: ${contentType}, Actual: ${actualType}`);
              contentType = actualType;
            }

            console.log('✅ [Script Maker API] Image converted to base64, size:', buffer.length, 'bytes, type:', contentType);
          }

          // Validate content type
          const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
          if (!validTypes.includes(contentType)) {
            console.warn('⚠️ [Script Maker API] Unsupported content type:', contentType, '- defaulting to image/png');
            contentType = 'image/png'; // Default to PNG as it's more common
          }

          // Create message content with both image and text
          messageContent = [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: contentType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: userPrompt
            }
          ];

          console.log('✅ [Script Maker API] Image included in Claude message');
        } catch (imageError) {
          console.error('❌ [Script Maker API] Error processing image for style analysis:', imageError);
          console.error('❌ [Script Maker API] Error stack:', imageError instanceof Error ? imageError.stack : 'No stack');
          // Fall back to text-only if image processing fails
          messageContent = userPrompt;
          console.log('⚠️ [Script Maker API] Falling back to text-only analysis');
        }
      }

      const claudeResponse = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ]
      });

      if (claudeResponse.content && claudeResponse.content.length > 0) {
        const result = claudeResponse.content[0];
        if (result.type === 'text') {
          response = result.text.trim();
        } else {
          throw new Error('No text content in Claude response');
        }
      } else {
        throw new Error('Empty response from Claude');
      }
    }

    console.log('✅ [Script Maker API] Analysis complete');
    console.log('📊 [Script Maker API] Response length:', response.length);

    // Try to parse as JSON if it's character generation or storyboard breakdown
    let parsedResponse = response;
    if (analysisType === 'character-generation' || analysisType === 'storyboard-breakdown') {
      try {
        console.log('🔍 [Script Maker API] Raw Claude response length:', response.length);
        console.log('🔍 [Script Maker API] First 200 chars:', response.substring(0, 200));
        
        // Extract JSON from response if it's wrapped in markdown code blocks
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          console.log('✅ [Script Maker API] Found JSON in markdown code block');
          parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
          console.log('🔍 [Script Maker API] Attempting direct JSON parse');
          // Clean up the response before parsing
          let cleanedResponse = response.trim();
          
          // Try to find JSON boundaries (both array and object)
          const firstArrayBrace = cleanedResponse.indexOf('[');
          const lastArrayBrace = cleanedResponse.lastIndexOf(']');
          const firstObjectBrace = cleanedResponse.indexOf('{');
          const lastObjectBrace = cleanedResponse.lastIndexOf('}');
          
          // Determine which JSON structure to extract
          let startPos = -1;
          let endPos = -1;
          
          if (analysisType === 'character-generation') {
            // Characters should be an array
            if (firstArrayBrace !== -1 && lastArrayBrace !== -1) {
              startPos = firstArrayBrace;
              endPos = lastArrayBrace + 1;
              console.log('🔍 [Script Maker API] Extracting JSON array');
            }
          } else if (analysisType === 'storyboard-breakdown') {
            // Storyboard should be an object with minutes array
            if (firstObjectBrace !== -1 && lastObjectBrace !== -1) {
              startPos = firstObjectBrace;
              endPos = lastObjectBrace + 1;
              console.log('🔍 [Script Maker API] Extracting JSON object');
            }
          }
          
          if (startPos !== -1 && endPos !== -1) {
            cleanedResponse = cleanedResponse.substring(startPos, endPos);
            console.log('🔍 [Script Maker API] Extracted JSON from position', startPos, 'to', endPos);
          }
          
          parsedResponse = JSON.parse(cleanedResponse);
          console.log('✅ [Script Maker API] Successfully parsed JSON');
        }
      } catch (parseError) {
        console.error('❌ [Script Maker API] JSON parse error:', parseError);
        console.error('❌ [Script Maker API] Failed response (first 500 chars):', response.substring(0, 500));
        console.warn('⚠️ [Script Maker API] Returning raw response as fallback');
        // If parsing fails, return the raw response
      }
    }

    return NextResponse.json({
      success: true,
      result: parsedResponse,
      analysisType
    });

  } catch (error) {
    console.error('❌ [Script Maker API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

