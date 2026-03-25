# בדרך (BaDerech)

> האומנות של להיות אנושי בתנועה

A Hebrew-first daily movement coach app. 7 minutes per day, every day.

## Philosophy

- Everything starts and ends in movement
- Drop the mental "backpack" (negative weight from past)
- Don't add arrows — don't add self-criticism to real pain
- 95/5: 95% of life is the journey, not peak moments
- Always moving — even backwards is OK

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS (RTL Hebrew, mobile-first)
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT
- **AI**: OpenAI API (gpt-4o-mini)

## Quick Start

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and OpenAI API key
```

### 3. Start development

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

App runs at: http://localhost:5173

## Features

- **Onboarding**: 4-step goal-setting flow
- **AI Coach Chat**: Max 3 questions, then generates a personalized plan
- **Dashboard**: Daily movement card with 7-minute timer
  - IDLE → RUNNING (gold pulsing) → OVERTIME (yellow neon) → DONE
  - "עצור כאן, שמור אנרגיה למחר" after 7:42
- **Light Map**: Visual dark map with glowing bulbs
  - Past days: glowing gold lights (clickable)
  - Today: pulsing bright light
  - Future: dark dots
  - At 80%: shape outline appears
  - At 85%+: countdown message
- **Resilience**: "אתה בדרך ליעד, לא קרה כלום" after missed days

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/baderech
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=sk-...  (optional - falls back to mock)
NODE_ENV=development
```

The app works without an OpenAI key using built-in mock responses.
