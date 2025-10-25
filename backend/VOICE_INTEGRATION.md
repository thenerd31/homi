# Voice Integration Guide

## Overview

VIBE uses **two complementary voice technologies** to cover different use cases:

1. **Groq Whisper** - Audio file transcription (voice search input)
2. **Vapi** - Real-time voice conversations (Q&A with listings)

---

## 1. Groq Whisper (Voice Search Input)

### Use Case
User uploads an audio file → Transcribe to text → Feed into conversational search

### Flow
```
User records voice memo: "I want a beach house in California for next weekend"
    ↓
POST /api/voice-to-text (audio file)
    ↓
Groq Whisper transcribes → "I want a beach house in California for next weekend"
    ↓
POST /api/search/conversation (transcribed text)
    ↓
Conversational search processes request
```

### Implementation

**Backend Endpoint:**
```python
POST /api/voice-to-text
- Accepts: audio file (MP3, WAV, M4A, OGG)
- Returns: { "text": "transcribed text" }
- Uses: Groq whisper-large-v3 model
```

**Frontend Integration:**
```javascript
// 1. Record audio
const audioBlob = await recordAudio();

// 2. Upload to backend
const formData = new FormData();
formData.append('audio_file', audioBlob, 'recording.mp3');

const response = await fetch('http://localhost:8000/api/voice-to-text', {
  method: 'POST',
  body: formData
});

const { text } = await response.json();

// 3. Send transcription to conversational search
await fetch('http://localhost:8000/api/search/conversation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_message: text,
    user_id: currentUser.id,
    conversation_history: [],
    extracted_so_far: {}
  })
});
```

**Testing:**
```bash
# Test with your own audio file
python test_voice_manual.py /path/to/audio.mp3

# Or use the interactive docs
open http://localhost:8000/docs
```

---

## 2. Vapi (Real-time Voice Q&A)

### Use Case
User talks to AI assistant about a specific listing in real-time

### Flow
```
User clicks "Talk to AI" button on a listing
    ↓
Frontend: Get listing context from backend
GET /api/vapi/context/{listing_id}
    ↓
Frontend: Start Vapi web call with context
POST /api/vapi/call/start { assistant: { ... } }
    ↓
Frontend: Connect to Vapi Web SDK
Vapi.start({ assistant, onMessage: ... })
    ↓
User speaks: "Does it have a pool?"
AI responds: "Yes! This property has an outdoor pool..."
    ↓
User: "What about parking?"
AI: "There's free parking for 2 cars..."
```

### Implementation

**Backend Endpoints:**

```python
# 1. Get listing context for Vapi assistant
GET /api/vapi/context/{listing_id}
Returns: {
  "vapi_message": "You are a helpful AI assistant for...",
  "listing_data": { title, location, price, amenities, ... }
}

# 2. Start Vapi web call (proxy to bypass CORS)
POST /api/vapi/call/start
Body: { assistantId: "..." OR assistant: { ... } }
Returns: { callId, webCallUrl, ... }

# 3. Stop call
POST /api/vapi/call/stop
Body: { call_id: "..." }

# 4. Get call details
GET /api/vapi/call/{call_id}
```

**Frontend Integration (React example):**

```typescript
import Vapi from '@vapi-ai/web';

// 1. Initialize Vapi client
const vapi = new Vapi('YOUR_VAPI_PUBLIC_KEY');

// 2. Function to start voice conversation
async function startVoiceChat(listingId: string) {
  // Get listing context from backend
  const contextResponse = await fetch(
    `http://localhost:8000/api/vapi/context/${listingId}`
  );
  const context = await contextResponse.json();

  // Start Vapi call with inline assistant
  const callResponse = await fetch(
    'http://localhost:8000/api/vapi/call/start',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assistant: {
          model: {
            provider: 'anthropic',
            model: 'claude-3-5-sonnet-20241022',
            messages: [{
              role: 'system',
              content: context.vapi_message
            }]
          },
          voice: {
            provider: '11labs',
            voiceId: 'rachel'  // Natural, friendly voice
          },
          firstMessage: `Hi! I'm here to help you learn about ${context.listing_data.title}. What would you like to know?`
        }
      })
    }
  );

  const callData = await callResponse.json();

  // Connect Vapi Web SDK
  vapi.start(callData.assistantId || callData.assistant);

  // Handle messages
  vapi.on('message', (message) => {
    console.log('AI:', message.text);
  });

  vapi.on('speech-end', () => {
    console.log('User finished speaking');
  });

  vapi.on('call-end', () => {
    console.log('Call ended');
  });
}

// 3. Stop conversation
function stopVoiceChat() {
  vapi.stop();
}

// 4. UI Component
function ListingCard({ listing }) {
  const [isTalking, setIsTalking] = useState(false);

  return (
    <div>
      <h3>{listing.title}</h3>
      <button
        onClick={async () => {
          if (!isTalking) {
            await startVoiceChat(listing.id);
            setIsTalking(true);
          } else {
            stopVoiceChat();
            setIsTalking(false);
          }
        }}
      >
        {isTalking ? '🛑 End Call' : '🎤 Talk to AI'}
      </button>
    </div>
  );
}
```

---

## Environment Variables

```bash
# .env
GROQ_API_KEY=gsk_...          # For Whisper transcription
VAPI_API_KEY=3648fa06-...     # For real-time voice calls
```

---

## Sponsor Integration Summary

| Feature | Sponsor | Technology | Use Case |
|---------|---------|------------|----------|
| Voice Search Input | Groq | Whisper Large V3 | Upload audio → transcribe → search |
| Voice Q&A per Listing | Vapi | Real-time voice AI | Talk to assistant about property |
| Conversational Search | Anthropic | Claude Sonnet 4.5 | Multi-turn search refinement |
| Listing Q&A | Anthropic | Claude Sonnet 4.5 | Answer property questions |

---

## Testing

### Test Groq Whisper Transcription
```bash
cd backend
python test_voice_manual.py ~/Desktop/recording.mp3
```

### Test Vapi (requires frontend)
1. Install Vapi Web SDK: `npm install @vapi-ai/web`
2. Implement frontend component above
3. Click "Talk to AI" on any listing
4. Speak into microphone
5. AI responds in real-time

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         VOICE INPUT                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Audio File Upload                 Real-time Microphone     │
│        │                                  │                  │
│        ▼                                  ▼                  │
│  Groq Whisper                        Vapi Web SDK            │
│  (transcription)                    (streaming voice)        │
│        │                                  │                  │
│        ▼                                  ▼                  │
│  Text String                         Audio Stream            │
│        │                                  │                  │
│        ▼                                  ▼                  │
│  /api/search/conversation           /api/vapi/call/start    │
│        │                                  │                  │
│        ▼                                  ▼                  │
│  Conversational Search              Vapi Assistant           │
│  (Claude Sonnet 4.5)               (Claude + Voice)          │
│        │                                  │                  │
│        ▼                                  ▼                  │
│  Search Results                      Spoken Response         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Frontend Team:**
   - Install `@vapi-ai/web` package
   - Implement voice recording component for Groq Whisper
   - Implement "Talk to AI" button for Vapi conversations
   - Add voice indicator UI (waveform, speaking animation)

2. **Backend:**
   - ✅ Groq Whisper transcription endpoint
   - ✅ Vapi proxy endpoints
   - ✅ Listing context endpoint
   - ⏳ Test with real Vapi API key

3. **Testing:**
   - Record test audio files
   - Test transcription accuracy
   - Test Vapi conversation quality
   - Optimize system prompts for both

---

## Troubleshooting

**Groq Whisper returns empty text:**
- Check audio file format (MP3, WAV, M4A, OGG supported)
- Ensure audio has clear speech
- Check GROQ_API_KEY is valid

**Vapi call fails to start:**
- Verify VAPI_API_KEY is configured
- Check CORS settings in frontend
- Ensure listing context is properly formatted

**Audio not recording in browser:**
- Request microphone permission
- Use HTTPS in production (required for getUserMedia)
- Test with different browsers

---

## Resources

- **Groq Whisper Docs:** https://console.groq.com/docs/speech-text
- **Vapi Docs:** https://docs.vapi.ai/
- **Vapi Web SDK:** https://github.com/VapiAI/web
- **Example Project:** https://github.com/ramizik/vocal-ai
