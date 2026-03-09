# Interactive Avatar Agent

A skill-showcase project featuring a real-time AI avatar powered by **HeyGen Streaming Avatar** and **OpenAI GPT-4o** with function-calling (agentic) capabilities.

## Demo Features

- 🎭 **Live Talking Avatar** — HeyGen streams a lip-synced AI avatar via WebRTC
- 🤖 **Agentic AI** — GPT-4o with tool use: time, calculator, weather demo
- 🎙️ **Voice & Text Input** — Web Speech API for hands-free interaction
- 💬 **Conversation History** — Full multi-turn context for natural dialogue
- ⚡ **Real-time** — Avatar speaks responses as they arrive

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Avatar | HeyGen Streaming Avatar SDK |
| AI / LLM | OpenAI GPT-4o + function calling |
| Styling | Tailwind CSS + custom dark theme |
| State | Zustand |
| Language | TypeScript |
| Voice | Web Speech API |

## Architecture

```
User (voice/text)
      │
      ▼
Next.js Frontend
  ├── AvatarDisplay  — HeyGen WebRTC video stream
  └── ChatInterface  — Message history + input
      │
      ▼ POST /api/agent
Next.js API Route
  └── OpenAI GPT-4o
      ├── Tool: get_current_time
      ├── Tool: calculate
      └── Tool: get_weather
      │
      ▼ text response
HeyGen Avatar speaks the reply
```

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd Interactive-Avatar-Agent
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your keys:

```env
OPENAI_API_KEY=sk-...
HEYGEN_API_KEY=...
```

Get your keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **HeyGen**: https://app.heygen.com/settings?nav=API

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Use it

1. Click **Start Avatar** to initialize the HeyGen session
2. Type a message or click the **microphone** to speak
3. The avatar responds vocally and in the chat

### Example prompts

- "What time is it right now?"
- "What's 15% of 340?"
- "What's the weather like in Tokyo?"
- "Tell me a fun fact about space"

## Customizing the Avatar

Set these in `.env.local`:

```env
NEXT_PUBLIC_HEYGEN_AVATAR_ID=your_avatar_id
NEXT_PUBLIC_HEYGEN_VOICE_ID=your_voice_id
```

Find available avatars and voices in the [HeyGen API docs](https://docs.heygen.com).

## Extending Agent Tools

Add new tools in `src/lib/openai.ts`:

```typescript
// 1. Add tool definition to agentTools[]
{
  type: "function",
  function: {
    name: "my_tool",
    description: "What the tool does",
    parameters: { ... }
  }
}

// 2. Add execution logic to executeTool()
case "my_tool":
  return doSomething(args);
```

## Deployment

Deploy to Vercel in one click:

```bash
npx vercel --prod
```

Set the environment variables in the Vercel dashboard.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agent/route.ts        # OpenAI agentic loop
│   │   └── heygen-token/route.ts # HeyGen session token
│   ├── layout.tsx
│   ├── page.tsx                  # Main app page
│   └── globals.css
├── components/
│   ├── AvatarDisplay.tsx         # HeyGen video + controls
│   ├── ChatInterface.tsx         # Message list + input
│   ├── ToolBadge.tsx
│   └── ui/button.tsx
├── hooks/
│   ├── useAvatar.ts              # HeyGen SDK wrapper
│   └── useVoiceInput.ts          # Web Speech API wrapper
├── lib/
│   ├── openai.ts                 # OpenAI client + tools
│   └── utils.ts
├── store/
│   └── chat.ts                   # Zustand state
└── types/
    └── index.ts
```
