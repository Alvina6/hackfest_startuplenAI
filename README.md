# StartupLens AI

**From idea to informed action.**  
An AI-powered startup idea validation and planning platform that transforms an early idea into structured research, heuristic rubric scoring, strategic analysis, an MVP feature plan, a phased build roadmap, and contextual AI mentorship.

## Key Features

- **Founder Accounts & JWT Authentication:** Register/Sign-In with salted `scrypt` password hashing and 7-day JWT Bearer tokens. Every saved analysis and mentor conversation is strictly scoped to its owner.
- **MongoDB Atlas + Automatic Fallback:** Connects to MongoDB Atlas via Mongoose whenever `MONGODB_URI` is set in environment variables, and automatically falls back to local file persistence (`.data/`) when running without a MongoDB URI.
- **Heuristic Idea Validator (F1):** Weighted 0–100 score across 6 rubric dimensions (*Problem Clarity 20%*, *Customer Clarity 15%*, *Feasibility 20%*, *Differentiation 15%*, *Business Potential 20%*, *Validation Readiness 10%*) with Recharts breakdown visualization and explicit uncertainty notes.
- **Market & Validation Playbook (F2):** Primary/secondary segments, pain points, adoption barriers, clearly labeled demand hypotheses, customer discovery interview questions, and validation experiments.
- **Competitor Intelligence (F3):** Distinguishes user-provided competitors from unverified AI-suggested candidates so founders know what still requires verification.
- **Business Model & SWOT (F4–F5):** 3–4 business model comparisons with fit scores, pricing hypotheses, recommended starting model, and a 4-quadrant SWOT grid.
- **MVP Scope & Phased Roadmap (F6–F7):** Core user journey, MoSCoW feature prioritization, explicit out-of-scope items, measurable success metrics, and a configurable 4, 6, or 8-week roadmap.
- **Risk Register & Pitch Outline (F8, F11, F12):** Categorized severity/likelihood risk table, 8-slide pitch deck outline with Markdown copy, JSON download, and printable PDF export.
- **Contextual Startup Mentor (F9):** Multi-turn chat scoped strictly to the selected report context with persisted conversation history.

## Environment Variables

See `.env.example`:

- `GEMINI_API_KEY`: Server-side Gemini API key (configured via Secrets in AI Studio or `.env`).
- `GEMINI_MODEL`: Optional model override (defaults to `gemini-4-hydrogen`).
- `MONGODB_URI`: MongoDB Atlas connection string (`mongodb+srv://...`). If omitted, uses local `.data/` persistence.
- `JWT_SECRET`: Long random secret for signing JWT authentication tokens.
- `PORT`: Server port (defaults to `3000`).
- `CORS_ORIGIN`: Optional comma-separated allowlist for production CORS.

## Local Development & Production Build

```bash
npm install
npm run dev      # Starts full-stack Express + Vite server on http://localhost:3000
npm run lint     # TypeScript typecheck (tsc --noEmit)
npm run build    # Builds Vite production client bundle into dist/
NODE_ENV=production npm start
```

## API Endpoints

- `GET /api/health` — Service, AI, auth, and storage status check
- `POST /api/auth/register` — Create founder account (`name`, `email`, `password`)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve authenticated founder profile (Bearer token)
- `GET /api/analyses` — List saved analyses for authenticated user
- `POST /api/analyses` — Validate input, call Gemini, validate report JSON, and save
- `GET /api/analyses/:id` — Retrieve a single saved report (owner-only)
- `PATCH /api/analyses/:id` — Rename a saved report (owner-only)
- `DELETE /api/analyses/:id` — Delete a saved report (owner-only)
- `POST /api/analyses/:id/chat` — Ask a contextual follow-up question to the Startup Mentor (owner-only)

## Known Prototype Limitations

- **Research Mode (`ai_only`):** Live external web scraping/grounding is not enabled; competitor candidates and market hypotheses are explicitly labeled as AI-generated and require independent founder verification.
