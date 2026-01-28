# 🏥 HealthSphere — AI-Powered Personal Health Management Platform
# 🏥 HealthSphere — Frontend (Vite + React + TypeScript)
HealthSphere is a client-side frontend application for personal health management. It is built with Vite, React, and TypeScript, uses Tailwind CSS and Radix primitives for UI, integrates with Supabase for auth, database and storage, and includes features such as an AI-assisted chat, medicine reminders, a reports vault, and a responsive dashboard.

---

## 🚀 Key Features
- **Authentication:** Supabase auth (email/password, OAuth-ready)
- **AI Chat:** Chat UI and a serverless function under `supabase/functions/health-chat` for AI responses
- **Reminders & Reports:** Medicine reminders and secure report storage using Supabase Storage
- **Dashboard & Charts:** Health metrics and charts using `recharts`
- **Geolocation & Permissions:** Location, camera, and microphone permission handling for specific features
- **Accessibility & Themes:** Light/dark theme toggle, responsive layout, mobile-friendly sidebar
- **Routing & Forms:** `react-router-dom` for client routing and `react-hook-form` + `zod` for validation

---

## 🧱 Tech Stack
- **Frontend:** Vite, React 18, TypeScript
- **Styling:** Tailwind CSS, `tailwindcss-animate`, Radix UI primitives
- **UI / Motion:** shadcn-style components, `framer-motion`, `lucide-react` icons
- **State & Data:** `@tanstack/react-query`, `react-hook-form`, `zod`
- **Backend-as-a-Service:** Supabase (Auth, Database, Storage, Edge Functions)
- **Charts & Visualization:** `recharts`
- **Testing & Tooling:** Vitest, ESLint, TypeScript

---

## 📁 Repository Layout (top-level)

- `src/` — application source (components, pages, hooks, contexts, integrations)
- `public/` — static assets
- `supabase/` — Supabase configuration, Edge Functions and migrations
- `package.json` — project scripts and dependencies

See the `src/` folder for app-specific structure: pages like `Dashboard`, `Appointments`, `Medicines`, `Reports`, and `Profile` are implemented under `src/pages`.

---

## ⚙️ Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn)
- A Supabase project (to use auth, db, and storage features)

## 📥 Quick Start
1. Clone the repository

```bash
git clone <repo-url>
cd healthsphere-guardian-main
```

2. Install dependencies

```bash
npm install
```

3. Configure environment

- Create an `.env` file at the project root (use `.env.example` if provided).
- Typical Vite env variables (examples):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:54321
```

4. Run the development server

```bash
npm run dev
```

Open the app at the URL shown by Vite (usually http://localhost:5173).

---

## 🧪 Testing
- Run unit tests with

```bash
npm run test
```

---

## 🔒 Security & Best Practices
- Do not commit `.env` files or secret keys to version control.
- Use Supabase Row Level Security (RLS) and service role keys only on server-side functions.
- Use HTTPS and rotate keys in production.

---

## 📦 Deployment
- Frontend: Vercel, Netlify, or any static host that supports SPA routing
- Supabase: use Supabase Edge Functions for server-side logic and Supabase hosting for DB/storage

---

## 👩‍💻 Contributors
- Ashmita Goyal — https://github.com/Ashmita1206
- Neeraj Mishra — https://github.com/Ashmita1206

---

## 📜 License
This project is licensed under the MIT License.

---

If you'd like, I can also:
- add a minimal `.env.example` with the expected Vite variable names
- add a brief developer guide for Supabase setup
Example .env (Server):

