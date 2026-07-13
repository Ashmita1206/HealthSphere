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
- Keep JWT secrets, MongoDB credentials, and Cloudinary keys on the server-side only.
- Use HTTPS in production and rotate keys regularly.

---

## 📦 Build & Deployment

- Build the frontend:

```bash
npm run build
```

- Deploy the static frontend to Vercel, Netlify, or any static host that supports SPA routing.
- Deploy the backend server to a Node.js host and configure the API base URL appropriately.

Notes:
- The project now uses a custom Node.js + Express backend with MongoDB and Cloudinary.

---

## Folder Structure (high level)

- `src/pages/` — route pages (Landing, Dashboard, Reminders, Medicines, Reports, Appointments, Profile, Settings, Emergency, etc.)
- `src/components/` — UI building blocks and the chat widget
- `src/contexts/` — global providers (`AuthContext`, `ThemeContext`)
- `src/hooks/` — custom hooks: `useGeolocation`, `useSpeechRecognition`, `useMediaPermissions`, `use-toast`, etc.
- `server/` — backend API routes and controllers

---

## Backend API and Storage

This app now uses the custom backend exposed under `/api`:

- `GET /api/user/profile` — fetch authenticated user profile
- `PUT /api/user/profile` — update authenticated user profile
- `POST /api/auth/signup` — register a new user
- `POST /api/auth/login` — authenticate and receive JWT token
- `GET /api/reminders` — list authenticated user's reminders
- `POST /api/reminders` — create a reminder
- `PUT /api/reminders/:id` — toggle or update a reminder
- `DELETE /api/reminders/:id` — delete a reminder
- `GET /api/reports` — list authenticated user's medical reports
- `POST /api/reports/upload` — upload a report file via Cloudinary
- `DELETE /api/reports/:id` — delete a report
- `POST /api/health/chat` — AI chat endpoint returning backend-compatible responses
- `GET /api/emergency/nearby` — server-side nearby hospital lookup (no browser CORS to Overpass)

Reports are stored via Cloudinary through the backend; there is no client-side cloud storage SDK.

---

## Environment Variables

Create a `.env` file at the project root based on [.env.example](./.env.example).

Frontend & Backend variables used in code:

- `VITE_API_BASE_URL=http://localhost:4000/api`
- `VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key`
- `PORT=4000`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o-mini`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

Important: Do not commit `.env` files or secret keys to the repository.

---

## Screenshots

Add screenshots of the app here (dashboard, reports upload, reminders, chat). Example placeholders:

![Dashboard screenshot](./screenshots/dashboard.png)
![Reports upload](./screenshots/reports.png)
![Chat assistant](./screenshots/chat.png)

See [screenshots/README.md](./screenshots/README.md) for guidance on adding application screenshots.

---

## Future Enhancements / Roadmap

- Replace the mock `locationsService` with a real Places API or backend hospital lookup.
- Add server-side validation and tighten backend access controls for production.
- Add CI/CD to automate frontend builds and backend deployments.
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
