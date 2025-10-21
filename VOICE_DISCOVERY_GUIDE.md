# 🎤 MiniMax Voice Discovery Guide

## **How MiniMax Voices Work**

MiniMax Speech 2.5 HD uses a **voice_id** parameter to select different voices. The system works by:

1. **Built-in Voices**: Pre-trained voices that come with the model
2. **Voice Discovery**: You can experiment with different voice names
3. **Voice Testing**: Test various voice IDs to find working ones

## **🔍 Where to Find More Voices**

### **1. Official MiniMax Resources**
- **MiniMax Console**: https://console.minimax.chat/
- **API Documentation**: Check their official API docs
- **Developer Portal**: Look for voice libraries or voice lists
- **GitHub**: Search for "minimax voices" or "minimax tts"

### **2. Community Sources**
- **Reddit**: r/MiniMax, r/AIVoice, r/TextToSpeech
- **Discord**: MiniMax community servers
- **Twitter**: Follow @MiniMax_AI for updates
- **Forums**: AI voice generation communities

### **3. Voice Testing Strategy**

#### **Common Voice Naming Patterns:**
```
Professional_Male
Professional_Female
Casual_Male
Casual_Female
Narrator_Male
Narrator_Female
News_Anchor_Male
News_Anchor_Female
Storyteller_Male
Storyteller_Female
Teacher_Male
Teacher_Female
Customer_Service_Male
Customer_Service_Female
Radio_DJ_Male
Radio_DJ_Female
Podcast_Host_Male
Podcast_Host_Female
Audiobook_Male
Audiobook_Female
Commercial_Male
Commercial_Female
Documentary_Male
Documentary_Female
Cartoon_Male
Cartoon_Female
Gaming_Male
Gaming_Female
Assistant_Male
Assistant_Female
Friend_Male
Friend_Female
```

#### **Alternative Naming Conventions:**
```
male_1, male_2, male_3
female_1, female_2, female_3
voice_1, voice_2, voice_3
speaker_1, speaker_2, speaker_3
narrator_1, narrator_2
host_1, host_2
anchor_1, anchor_2
teacher_1, teacher_2
```

## **🧪 Voice Discovery Process**

### **Step 1: Test Confirmed Voices**
Start with the known working voices:
- Wise_Woman
- Young_Woman
- Young_Man
- Old_Man
- Old_Woman
- Child_Boy
- Child_Girl

### **Step 2: Experiment with Patterns**
Try these naming patterns:
```
[Profession]_[Gender]
[Style]_[Gender]
[Age]_[Gender]
[Role]_[Gender]
```

### **Step 3: Test Common Variations**
```
Professional_Male
Professional_Female
Casual_Male
Casual_Female
Formal_Male
Formal_Female
Friendly_Male
Friendly_Female
```

### **Step 4: Check Error Messages**
When a voice doesn't work, check the error response for clues about available voices.

## **📝 How to Add New Voices**

### **1. Update the Voice List**
In `src/components/model-inputs/minimax-tts-interface.tsx`:

```typescript
const MINIMAX_VOICES = [
  // Existing voices...
  "Wise_Woman",
  "Young_Woman",
  
  // Add new discovered voices here
  "Professional_Male",
  "Narrator_Female",
  // ... more voices
];
```

### **2. Test Voice Discovery**
Create a simple test script:

```typescript
const testVoice = async (voiceId: string) => {
  try {
    const response = await fetch('/api/generate/minimax-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Hello, this is a test.",
        voice_setting: { voice_id: voiceId }
      })
    });
    
    if (response.ok) {
      console.log(`✅ Voice ${voiceId} works!`);
    } else {
      console.log(`❌ Voice ${voiceId} failed`);
    }
  } catch (error) {
    console.log(`❌ Voice ${voiceId} error:`, error);
  }
};
```

### **3. Community Voice Sharing**
- Share working voices with the community
- Create a voice database
- Document voice characteristics

## **🌐 Alternative Voice Sources**

### **1. ElevenLabs Integration**
You already have ElevenLabs TTS with 40+ voices:
- Jennifer, Dexter, Ava, Tilly, Charlotte, etc.
- Professional quality voices
- Multiple languages and accents

### **2. PlayHT Integration**
You have PlayHT with 800+ voices:
- Multiple languages and accents
- Professional and casual voices
- Character voices

### **3. Voice Cloning**
Consider adding voice cloning features:
- Upload audio samples
- Clone your own voice
- Create custom voices

## **🔧 Technical Implementation**

### **Voice Testing API**
Create an endpoint to test voices:

```typescript
// /api/test-voice
export async function POST(request: Request) {
  const { voice_id } = await request.json();
  
  try {
    const result = await fal.subscribe("fal-ai/minimax/preview/speech-2.5-hd", {
      input: {
        text: "Test voice",
        voice_setting: { voice_id }
      }
    });
    
    return NextResponse.json({ success: true, voice_id });
  } catch (error) {
    return NextResponse.json({ success: false, voice_id, error: error.message });
  }
}
```

### **Voice Discovery UI**
Add a voice discovery interface:

```typescript
const VoiceDiscovery = () => {
  const [testVoice, setTestVoice] = useState("");
  const [workingVoices, setWorkingVoices] = useState([]);
  
  const testVoice = async () => {
    // Test the voice and add to working list if successful
  };
  
  return (
    <div>
      <Input 
        placeholder="Enter voice ID to test"
        value={testVoice}
        onChange={(e) => setTestVoice(e.target.value)}
      />
      <Button onClick={testVoice}>Test Voice</Button>
      
      <div>
        <h3>Working Voices:</h3>
        {workingVoices.map(voice => (
          <div key={voice}>{voice}</div>
        ))}
      </div>
    </div>
  );
};
```

## **📊 Voice Database**

### **Confirmed Working Voices**
- Wise_Woman ✅
- Young_Woman ✅
- Young_Man ✅
- Old_Man ✅
- Old_Woman ✅
- Child_Boy ✅
- Child_Girl ✅

### **Testing Queue**
Add voices to test:
- Professional_Male
- Professional_Female
- Narrator_Male
- Narrator_Female
- News_Anchor_Male
- News_Anchor_Female
- Storyteller_Male
- Storyteller_Female

### **Voice Characteristics**
Document voice characteristics:
- Age range
- Gender
- Style (formal, casual, professional)
- Use case (narration, conversation, etc.)
- Language support

## **🚀 Next Steps**

1. **Test Extended Voice List**: Try the additional voices I added
2. **Community Research**: Check MiniMax forums and documentation
3. **Voice Discovery Tool**: Build a tool to test voice IDs automatically
4. **Voice Database**: Create a database of working voices
5. **Alternative TTS**: Consider integrating more TTS providers

## **💡 Tips for Voice Discovery**

1. **Start Simple**: Test basic patterns first
2. **Check Documentation**: Look for official voice lists
3. **Community Help**: Ask in MiniMax communities
4. **Systematic Testing**: Test voice IDs systematically
5. **Error Analysis**: Learn from error messages
6. **Voice Sharing**: Share working voices with others

---

**Remember**: Voice availability may change with model updates, so keep testing and updating your voice list!
