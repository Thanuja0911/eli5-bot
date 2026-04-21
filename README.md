# 🧠 ELI5 Bot

A web app that explains any complex topic in simple terms — powered by Claude AI with real-time streaming.

Built as part of the [LLM Engineering Roadmap 2026](https://github.com/praneeth-kalluri/LLM-Engineering-Roadmap) — Week 1 project.

## ✨ Features

- 🎚️ Complexity slider: ELI5 / High School / College / Expert
- 🤖 Model selector: Claude Haiku (fast) or Claude Sonnet (smart)
- ⚡ Real-time streaming — words appear one by one
- 📊 Metrics bar: response time and token count

## 🛠️ Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router
- [Vercel AI SDK v6](https://sdk.vercel.ai/) — streaming
- [@ai-sdk/anthropic](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic) — Anthropic provider
- [Tailwind CSS v3](https://tailwindcss.com/) — styling

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/eli5-bot.git
cd eli5-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Anthropic API key
Create a `.env.local` file in the root:

Get your key at [console.anthropic.com](https://console.anthropic.com)

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start explaining!

## 📁 Project Structure

eli5-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts   # Streaming API route (Anthropic + streamText)
│   ├── globals.css        # Tailwind base styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main UI (input, slider, dropdown, stream)
├── .env.local             # Your API key (never committed)
└── README.md

