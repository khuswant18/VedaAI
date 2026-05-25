# VedaAI Assessment Creator

AI-powered question paper generator for teachers. Create assignments and instantly generate customized, structured question papers using AI.

![Screenshot Placeholder](docs/screenshot.png)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Docker Compose                          │
│                                                              │
│  ┌────────────┐   ┌────────────┐   ┌───────┐  ┌──────────┐  │
│  │  Frontend   │──▶│  Backend   │──▶│ Redis │  │ MongoDB  │  │
│  │  Next.js    │   │  Express   │   │ Queue │  │ Storage  │  │
│  │  :3000      │   │  :5000     │   │ :6379 │  │ :27017   │  │
│  └────────────┘   └────────────┘   └───────┘  └──────────┘  │
│                        │                                      │
│                 ┌──────┴──────┐                                │
│                 │  BullMQ     │                                │
│                 │  Worker     │                                │
│                 │  ↓          │                                │
│                 │  Claude AI  │                                │
│                 └─────────────┘                                │
└──────────────────────────────────────────────────────────────┘

Flow: Form → REST API → BullMQ Job → AI Generation → WebSocket → Paper View
```

---

## Tech Stack

| Layer      | Technology                            | Purpose                          |
|------------|---------------------------------------|----------------------------------|
| Frontend   | Next.js 14 (App Router) + TypeScript  | React framework, SSR/CSR         |
| Styling    | Tailwind CSS                          | Utility-first CSS                |
| State      | Zustand                               | Lightweight state management     |
| Forms      | react-hook-form + Zod                 | Form validation                  |
| PDF        | @react-pdf/renderer                   | PDF generation                   |
| Icons      | lucide-react                          | Icon library                     |
| HTTP       | axios                                 | API client                       |
| Realtime   | socket.io-client                      | WebSocket client                 |
| Backend    | Node.js + Express + TypeScript        | REST API server                  |
| Database   | MongoDB + Mongoose                    | Data persistence                 |
| Cache      | Redis + ioredis                       | Caching, job status              |
| Queue      | BullMQ                                | Async job processing             |
| WebSocket  | socket.io                             | Real-time events                 |
| AI         | Anthropic Claude SDK                  | Question paper generation        |
| Shared     | Zod                                   | Schema validation, type sharing  |

---

## Prerequisites

- **Node.js** ≥ 18
- **Docker** & **Docker Compose** (for one-command setup)
- **Anthropic API Key** (for AI generation)

---

## Quick Start with Docker

```bash
# 1. Clone the repository
git clone <repo-url>
cd vedaai

# 2. Copy env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3. Add your Anthropic API key to apps/backend/.env
# ANTHROPIC_API_KEY=your_key_here

# 4. Start everything
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **WebSocket:** ws://localhost:5000

---

## Local Setup (Without Docker)

### 1. Start infrastructure

```bash
# Start MongoDB (port 27017)
mongod --dbpath /path/to/data

# Start Redis (port 6379)
redis-server
```

### 2. Install dependencies

```bash
# From project root
npm install

# Build shared package
npm run build:shared
```

### 3. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit .env files with your values
```

### 4. Run development servers

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## Environment Variables

### Backend (apps/backend/.env)

| Variable           | Description                    | Example                                |
|--------------------|---------------------------------|----------------------------------------|
| `PORT`             | Backend server port             | `5000`                                 |
| `NODE_ENV`         | Environment mode                | `development`                          |
| `MONGODB_URI`      | MongoDB connection string       | `mongodb://localhost:27017/vedaai`      |
| `REDIS_URL`        | Redis connection string         | `redis://localhost:6379`               |
| `ANTHROPIC_API_KEY`| Anthropic Claude API key        | `sk-ant-...`                           |
| `CORS_ORIGIN`      | Allowed CORS origin             | `http://localhost:3000`                |

### Frontend (apps/frontend/.env)

| Variable                    | Description            | Example                     |
|-----------------------------|------------------------|-----------------------------|
| `NEXT_PUBLIC_BACKEND_URL`   | Backend API base URL   | `http://localhost:5000`     |
| `NEXT_PUBLIC_WS_URL`        | WebSocket server URL   | `http://localhost:5000`     |

---

## API Endpoints

| Method | Path                              | Description                      |
|--------|-----------------------------------|----------------------------------|
| POST   | `/api/assignments`                | Create assignment + queue job    |
| GET    | `/api/assignments`                | List all assignments             |
| GET    | `/api/assignments/:id`            | Get assignment by ID             |
| POST   | `/api/assignments/:id/regenerate` | Regenerate paper for assignment  |
| GET    | `/api/papers/:assignmentId`       | Get generated paper (cached)     |
| GET    | `/api/jobs/:jobId`                | Get job status                   |
| GET    | `/api/health`                     | Health check                     |

---

## Design Decisions

### Why BullMQ?
AI generation takes 10–30 seconds. Using a job queue prevents HTTP request timeouts, enables automatic retries, and allows the server to handle concurrent requests without blocking.

### Why Zod for LLM Parsing?
LLM JSON output is inherently unreliable — Zod provides structured validation with clear error messages. If validation fails, we send errors back to the LLM with a correction prompt for one retry attempt.

### WebSocket + Polling Fallback
WebSocket provides real-time progress updates for the best UX. The polling fallback (every 3s) catches edge cases where WebSocket connections drop due to network issues or proxies.

### Redis Caching Strategy
- **Papers:** Cached for 24 hours (expensive to regenerate)
- **Job status:** Cached for 1 hour (transient data)
- Cache is invalidated on regeneration

---

## Project Structure

```
vedaai/
├── apps/
│   ├── frontend/          ← Next.js 14 + TypeScript + Tailwind
│   │   └── src/
│   │       ├── app/       ← Pages (App Router)
│   │       ├── components/← UI, Form, Paper, Progress components
│   │       ├── hooks/     ← useSocket, useJobStatus
│   │       ├── lib/       ← PDF export, utilities
│   │       ├── services/  ← API client
│   │       ├── store/     ← Zustand stores
│   │       └── types/     ← Type re-exports
│   └── backend/           ← Express + TypeScript
│       └── src/
│           ├── config/    ← DB, Redis, env config
│           ├── models/    ← Mongoose models
│           ├── queues/    ← BullMQ queue definitions
│           ├── routes/    ← Express routes
│           ├── services/  ← AI, Paper, Cache services
│           ├── socket/    ← Socket.io setup
│           ├── utils/     ← Logger, prompt builder
│           └── workers/   ← BullMQ workers
├── packages/
│   └── shared/            ← Zod schemas + TypeScript types
├── docker-compose.yml
└── README.md
```

---

## Known Limitations

- No authentication/authorization (single-user mode)
- No answer key generation (questions only)
- PDF layout is basic — could be enhanced with custom fonts
- File upload only supports PDF and TXT
- No edit capability for generated questions
- No question bank or history deduplication

---

## Future Improvements

- [ ] Multi-user authentication (NextAuth.js)
- [ ] Answer key generation with the question paper
- [ ] Question editing and manual curation
- [ ] Question bank from past papers
- [ ] Support for more file types (DOCX, images with OCR)
- [ ] Custom school branding on papers
- [ ] Blueprint/weightage-based paper generation
- [ ] Export to DOCX format
- [ ] Mobile app (React Native)
