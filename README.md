# 🏥 HealthSphere

HealthSphere is a production-ready frontend application for personal health management. This repository contains a Vite + React + TypeScript single-page application that integrates with Supabase (Auth, Database, Storage, Edge Functions) to provide user authentication, health dashboards, reminders, medicine tracking, appointments, medical report storage, and an AI-assisted health chat.

This README documents implemented functionality directly reflected in the source code.

---

## 🚀 Key Features (implemented)

- Authentication (Supabase): email/password sign-up, sign-in, session handling via `AuthContext`.
- Profile management: view & update user profile stored in the `profiles` table.
- Medicines: CRUD for medicines stored in the `medicines` table.
- Reminders: create/enable/disable/delete reminders in the `reminders` table with realtime updates via Supabase Realtime channels.
- Appointments: create/delete appointments stored in the `appointments` table.
- Reports vault: upload/download/delete medical reports using Supabase Storage and the `reports` table for metadata.
- AI Chat assistant: client chat UI (`src/components/chat/ChatBot.tsx`) and a Supabase Edge Function `health-chat` (Deno) that forwards chat requests to an external AI gateway (requires `LOVABLE_API_KEY`).
- Chat persistence: authenticated chat messages inserted into `chat_messages` table.
- Dashboard: overview page that fetches `profiles`, `medicines`, and `appointments`, and renders charts with `recharts`.
- Media & Speech: browser-based SpeechRecognition (speech-to-text), SpeechSynthesis (TTS), and media permission handling via `useMediaPermissions`.
- Geolocation: `useGeolocation` hook and a `getNearbyLocations` mock service for nearby hospitals/clinics.
- UI & Accessibility: Tailwind CSS, Radix primitives/shadcn-style components, theme provider (light/dark), responsive layout and sidebar.

---

## 🧱 Tech Stack

- Frontend: Vite, React 18, TypeScript
- Styling & UI: Tailwind CSS, Radix UI primitives (shadcn-style components), `lucide-react`, `framer-motion`
- Data & State: `@tanstack/react-query`, `react-router-dom`, `react-hook-form`, `zod`
- Backend services: Supabase (Auth, Postgres, Storage, Realtime, Edge Functions)
- AI gateway: external AI service used by `supabase/functions/health-chat` (configured with `LOVABLE_API_KEY`)
- Charts: `recharts`
- Tooling & Tests: Vitest, ESLint, TypeScript

---

## 📁 Repository Layout (top-level)

- `src/` — application source code
  - `pages/` — route pages (Landing, Dashboard, Reminders, Medicines, Reports, Appointments, Profile, Settings, Emergency, etc.)
  - `components/` — reusable UI components and the chat widget (`src/components/chat/ChatBot.tsx`)
  - `contexts/` — `AuthContext`, `ThemeContext`
  - `hooks/` — `useGeolocation`, `useSpeechRecognition`, `useMediaPermissions`, `use-toast`, etc.
  - `integrations/` — Supabase client (`src/integrations/supabase/client.ts`)
  - `services/` — helper services like `locationsService` (mock nearby locations)
- `public/` — static assets
- `supabase/` — Supabase Edge Function(s) and migrations
  - `functions/health-chat/index.ts` — Deno Edge Function for AI chat
- `package.json` — scripts and dependencies

See `src/App.tsx` for routing and protected-route setup.

---

## ⚙️ Prerequisites

- Node.js 18+ (recommended)
- npm (or yarn)
- A Supabase project for Auth, Database, Storage and Edge Functions (required for full functionality)

## 📥 Quick Start — Run Locally

1. Clone the repository

```bash
git clone <repo-url>
cd healthsphere-guardian-main
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables (see next section)

4. Start the development server

```bash
npm run dev
```

Open the app at the URL shown by Vite (usually http://localhost:5173).

---

## 🧪 Testing

Run unit tests:

```bash
npm run test
```

---

## 🔒 Security & Best Practices

- Do not commit `.env` files or secret keys to the repository.
- Use Supabase Row Level Security (RLS) for production databases and keep service-role keys on server-side only.
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
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Complete Supabase database setup guide with SQL schemas and RLS policies
- [screenshots/README.md](./screenshots/README.md) — Guide for adding and optimizing application screenshots
