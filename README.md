# 🏥 HealthSphere

HealthSphere is a production-ready frontend application for personal health management. This repository contains a Vite + React + TypeScript single-page application backed by a custom Node.js + Express + MongoDB API. The app uses JWT authentication, Cloudinary uploads for reports, and a backend AI chat endpoint.

This README documents implemented functionality directly reflected in the source code.

---

## 🚀 Key Features (implemented)

- Authentication: email/password sign-up, sign-in, session handling via `AuthContext` and JWT.
- Profile management: view & update user profile persisted in MongoDB.
- Medicines: CRUD for medicines stored in the backend.
- Reminders: create/enable/disable/delete reminders through `/api/reminders`.
- Appointments: create/delete appointments stored in MongoDB.
- Reports vault: upload/download/delete medical reports using Cloudinary via `/api/reports/upload`.
- AI Chat assistant: client chat UI (`src/components/chat/ChatBot.tsx`) with backend `/api/health/chat`.
- Chat response compatibility: backend returns `{ choices: [{ message: { content } }], response, recommendations, riskLevel, requiresDoctor }`.
- Dashboard: overview page that fetches backend data and renders charts with `recharts`.
- Media & Speech: browser-based SpeechRecognition (speech-to-text), SpeechSynthesis (TTS), and media permission handling via `useMediaPermissions`.
- Geolocation: `useGeolocation` hook and backend emergency hospital lookup via `/api/emergency/nearby`.
- UI & Accessibility: Tailwind CSS, Radix primitives/shadcn-style components, theme provider (light/dark), responsive layout and sidebar.

---

## 🧱 Tech Stack

- Frontend: Vite, React 18, TypeScript
- Styling & UI: Tailwind CSS, Radix UI primitives (shadcn-style components), `lucide-react`, `framer-motion`
- Data & State: `@tanstack/react-query`, `react-router-dom`, `react-hook-form`, `zod`
- Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT auth, Cloudinary uploads
- AI gateway: OpenAI via backend `/api/health/chat`
- Charts: `recharts`
- Tooling & Tests: Vitest, ESLint, TypeScript

---

## 📁 Repository Layout (top-level)

- `src/` — application source code
  - `pages/` — route pages (Landing, Dashboard, Reminders, Medicines, Reports, Appointments, Profile, Settings, Emergency, etc.)
  - `components/` — reusable UI components and the chat widget (`src/components/chat/ChatBot.tsx`)
  - `contexts/` — `AuthContext`, `ThemeContext`
  - `hooks/` — `useGeolocation`, `useSpeechRecognition`, `useMediaPermissions`, `use-toast`, etc.
  - `services/` — backend-aware helper services like `locationsService`
- `public/` — static assets
- `server/` — custom Node.js + Express backend routes and controllers
- `package.json` — scripts and dependencies

See `src/App.tsx` for routing and protected-route setup.

---

## ⚙️ Prerequisites

- Node.js 18+ (recommended)
- npm (or yarn)
- MongoDB Atlas, Cloudinary, and OpenAI credentials configured in `.env`

## 📥 Quick Start — Run Locally

1. Clone the repository

```bash
cd healthsphere-ai
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file and add the required keys.

---

## 5. Start Development Server

```bash
npm run dev
```

Application will run at:

```bash
http://localhost:5173
```

---

# 🧪 Testing

Run tests using:

```bash
npm run test
```

---

## 🔒 Security & Best Practices

- Do not commit `.env` files or secret keys to the repository.
- Keep JWT secrets, MongoDB credentials, and Cloudinary keys on the server-side only.
- Use HTTPS in production and rotate keys regularly.

---

## 📦 Build & Deployment

- Build the frontend:

```bash
npm run build
```

- Deploy the static frontend to Vercel, Netlify, or any static host that supports SPA routing.
- Deploy Supabase resources (tables, storage bucket, Edge Functions) via the Supabase dashboard or CLI. Configure `LOVABLE_API_KEY` as an environment variable for the `health-chat` function if AI chat is needed.

Notes:

- The project is a frontend SPA that relies on Supabase for backend services. Provisioning the Supabase project (tables, storage buckets, RLS policies, and Edge Functions) is required for full functionality.

---

## Folder Structure (high level)

- `src/pages/` — route pages (Landing, Dashboard, Reminders, Medicines, Reports, Appointments, Profile, Settings, Emergency, etc.)
- `src/components/` — UI building blocks and the chat widget
- `src/contexts/` — global providers (`AuthContext`, `ThemeContext`)
- `src/hooks/` — custom hooks: `useGeolocation`, `useSpeechRecognition`, `useMediaPermissions`, `use-toast`, etc.
- `src/integrations/supabase/` — Supabase client and generated types
- `supabase/functions/` — Edge Functions (AI chat)

---

## Database tables (referenced in source code)

Create these tables in your Supabase project (names used in client queries):

- `profiles`
- `medicines`
- `appointments`
- `reminders`
- `reports`
- `chat_messages`

The application expects a `reports` storage bucket for report uploads.

---

## API / Endpoints (in this repo)

- Supabase Edge Function: `/functions/v1/health-chat` (implemented at `supabase/functions/health-chat/index.ts`). The frontend calls:
  - `${VITE_SUPABASE_URL}/functions/v1/health-chat` with `Authorization: Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}`

  The function forwards messages to an external AI gateway using the `LOVABLE_API_KEY` environment variable (set on Supabase function/config).

- Supabase Storage: bucket `reports` used by `src/pages/Reports.tsx` to upload files and create signed URLs.

Client-side API interactions use `@supabase/supabase-js` via `src/integrations/supabase/client.ts`.

---

## Environment Variables

Create a `.env` file at the project root based on [.env.example](./.env.example).

Frontend (Vite) variables used in code:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable / anon key used by the client
- `VITE_GOOGLE_MAPS_API_KEY` — (optional) used by `getGoogleMapsEmbedUrl` in `src/services/locationsService.ts`

Supabase Edge Function (server-side) variables:

- `LOVABLE_API_KEY` — API key for the external AI gateway used by `health-chat` function

Important: Do not store service-role secrets in the frontend environment.

For detailed setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

---

## Screenshots

Add screenshots of the app here (dashboard, reports upload, reminders, chat). Example placeholders:

![Dashboard screenshot](./screenshots/dashboard.png)
![Reports upload](./screenshots/reports.png)
![Chat assistant](./screenshots/chat.png)

See [screenshots/README.md](./screenshots/README.md) for guidance on adding application screenshots.

---

## Future Enhancements / Roadmap

- Replace the mock `locationsService` with a real Places API or Supabase-stored locations.
- Add server-side validation and tighten RLS policies for production.
- Add CI/CD to automate frontend builds and Supabase migrations.
- Add end-to-end tests and visual regression tests for UI flows.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Run tests and linters locally.
3. Open a pull request with a clear description and necessary migration notes (if database changes are required).

Please open issues for bugs and feature requests.

---

## License

This project is available under the MIT License.

---

## Contact / Authors

- Ashmita Goyal — https://github.com/Ashmita1206
- Neeraj Mishra — https://github.com/Neeraj-code-beep

---

## Getting Started Resources

- [.env.example](./.env.example) — Environment variables reference
- [screenshots/README.md](./screenshots/README.md) — Guide for adding and optimizing application screenshots
