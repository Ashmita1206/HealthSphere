# 🏥 HealthSphere — Personal Health & Emergency Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.10-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19.2-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-4EA94B.svg?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HealthSphere** is a full-stack longitudinal healthcare platform integrating personal health tracking, interactive clinical timelines, prescription management, emergency SOS routing with nearby hospital locator, medical report storage, and server-side AI medical consultations powered by Google Gemini.

---

## 🌟 Overview

HealthSphere bridges the gap between disparate health records and actionable patient insights. Built with a modern responsive frontend (**React 18**, **TypeScript**, **Tailwind CSS**) and an **Express / Node.js / MongoDB** REST backend, HealthSphere provides a secure and accessible patient portal.

### Key Highlights
- 🧠 **Server-Side AI Consultations**: Context-aware AI assistant leveraging Google Gemini for medical advice, document analysis, and SSE streaming.
- ⚡ **One-Touch Emergency SOS**: Geolocation tracking, automated SOS triggers, OpenStreetMap Overpass hospital locator, and emergency notification dispatch.
- 📅 **Longitudinal Health Timeline**: Unified chronological view aggregating prescriptions, lab reports, appointments, vital logs, and blood donations.
- 💊 **Smart Prescription Tracking**: Dosage schedules, adherence progress tracking, timing badges, calendar views, and CSV export options.
- 🪪 **Digital Medical ID & Vault**: Instant Medical ID card display, profile health vitals, emergency contacts, and report storage.

---

## ✨ Implemented Features

### 1. Interactive Patient Dashboard (`/dashboard`)
- Comprehensive health overview with real-time vitals and adherence summary widgets.
- Clinical snapshot previews and quick access to core healthcare tools.

### 2. Longitudinal Health Timeline (`/timeline`)
- Adapter pattern (`timelineAdapters.ts`) normalizing all patient data types into a unified view.
- Filter by date range (Today, This Week, Last Month, Custom), record category, and priority level.
- Interactive detail drawer with full notes and record metadata.

### 3. Emergency SOS System (`/emergency`)
- SOS activation with browser `navigator.geolocation` tracking.
- Nearby hospital locator powered by OpenStreetMap Overpass API endpoints.
- Emergency alert registration and hospital contact access.

### 4. Smart Medication Tracker (`/medicines`)
- Add and manage prescription schedules with timing indicators (Before Meal, After Meal, Bedtime).
- Adherence tracking, active/inactive medicine filtering, and CSV export for physician review.

### 5. AI Consultation & Report Intelligence (`/ai-chat`, `/medical-reports`)
- Server-side Google Gemini integration (`@google/genai`) for medical query processing and Server-Sent Events (SSE) streaming.
- Contextual patient memory (`AIMemory`) automatically incorporating allergies and chronic conditions into AI prompts.
- Diagnostic report parsing with Cloudinary report storage and extracted biomarker summaries.

### 6. Profile & Medical Document Vault (`/profile`, `/reports`)
- Complete patient demographics, blood group, allergies, and emergency contact details.
- Secure report file uploads (PDF/Images) stored via Cloudinary.

---

## 🛠️ My Technical Contributions (Neeraj Mishra)

As Full Stack & System Engineer on HealthSphere, key technical deliverables authored include:

- 🔒 **Security & Authentication Hardening**: Implemented strict `req.user._id` authorization scoping across chat and health record endpoints; configured production JWT secret validation (`server/config/jwt.config.js`) throwing fatal startup errors if unconfigured in production.
- 🧠 **Server-Side AI Memory Engine**: Engineered `AIMemory` schema and dynamic patient context builder (`server/services/ai/aiService.js`), combining allergies, chronic conditions, and active prescriptions into prompt context.
- 📡 **SSE Response Streaming**: Built Server-Sent Events (SSE) streaming pipeline in `chatController.js` with client disconnect handling and error normalization (`GeminiError`).
- 📄 **Medical Report OCR Pipeline**: Developed report processing pipeline in `server/controllers/reportController.js` using Multer buffer streaming to Cloudinary and Gemini multimodal text extraction.
- 🛡️ **ReDoS & Search Security**: Escaped regex special characters across chat and global AI search queries (`replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React 18 SPA                        │
│                 (Vite + TypeScript)                     │
└────────────────────────────┬────────────────────────────┘
                             │ REST API / SSE (JWT Auth)
┌────────────────────────────▼────────────────────────────┐
│                    Express REST API                     │
│                 (Node.js + Middlewares)                 │
└──────┬──────────────────────┬────────────────────┬──────┘
       │                      │                    │
┌──────▼──────┐        ┌──────▼──────┐      ┌──────▼──────┐
│  MongoDB    │        │  Cloudinary │      │  Google     │
│ (Mongoose)  │        │ (Storage)   │      │  Gemini AI  │
└─────────────┘        └─────────────┘      └─────────────┘
```

- **Server-Side AI Execution**: Gemini API key and prompt orchestration run exclusively on the backend (`server/services/gemini/geminiService.js`).
- **Data Isolation**: Database queries enforce user isolation using authenticated JWT context (`req.user._id`).
- **Adapter Pattern**: Frontend adapters (`timelineAdapters.ts`) normalize backend schemas into unified UI models.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend** | React 18.3.1, TypeScript 5.8.3, Vite 8.0.10, Tailwind CSS 3.4.17 |
| **UI Components** | Radix UI primitives, Shadcn UI suite, Lucide Icons, Framer Motion |
| **Routing & Querying** | React Router 6.30.1 (`HashRouter`), `@tanstack/react-query` 5.83.0 |
| **Backend & Database** | Node.js, Express 4.19.2, MongoDB / Mongoose |
| **AI & Storage** | Google Gemini (`@google/genai`), Cloudinary SDK, Multer |
| **Maps & Location** | Leaflet 1.9.4, React-Leaflet 4.2.1, OpenStreetMap Overpass API |
| **Testing** | Vitest 3.2.4, `@testing-library/react` |

---

## 📂 Project Structure

```
HealthSphere/
├── server/                     # Express Backend Application
│   ├── config/                 # DB, Gemini, and JWT configurations
│   ├── controllers/            # API request handlers (AI, Auth, Health, Reports)
│   ├── middlewares/            # Auth middleware, rate limiters, error handlers
│   ├── models/                 # Mongoose schemas (User, AIMemory, Report, Medicine)
│   ├── routes/                 # Express API routes (/api/auth, /api/chat, /api/ai)
│   └── services/               # Gemini AI engine, OCR, and context builders
├── src/                        # React Frontend Application
│   ├── components/             # UI primitives and feature modules
│   ├── contexts/               # React Context Providers (AuthContext, ThemeContext)
│   ├── pages/                  # Page routes (Dashboard, AIChat, Emergency, Timeline)
│   ├── services/               # Frontend API client (`api.ts`)
│   └── utils/                  # Utility helpers and timeline adapters
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start — Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- MongoDB instance (local or MongoDB Atlas)
- Google Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/Ashmita1206/HealthSphere.git
cd HealthSphere
```

### 2. Environment Configuration

#### Backend Environment (`server/.env`)
Create a file named `server/.env`:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:8081
```

#### Frontend Environment (`src/.env.local` or `.env`)
Create a file named `src/.env.local`:
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

### 3. Install & Run

#### Start Backend Server
```bash
cd server
npm install
node index.js
```

#### Start Frontend Client (New Terminal)
```bash
# In project root
npm install
npm run dev
```

---

## 🧪 Verification & Testing

Run Vitest unit tests:
```bash
npm run test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Build production client:
```bash
npm run build
```

---

## 🔮 Future Scope

- 📱 **Progressive Web App (PWA)**: Offline caching for Emergency Medical ID and prescription schedules.
- 🔒 **End-to-End Vault Encryption**: Client-side document encryption for health records.
- ⌚ **Wearable Data Sync**: Integration with Apple HealthKit and Google Fit APIs.
- 🌐 **Localization**: Multi-language support for regional clinical terms.

---

## 👥 Team & Authors

- **Ashmita Goyal** — Lead Frontend Architect — [GitHub](https://github.com/Ashmita1206)
- **Neeraj Mishra** — Full Stack & System Engineer — [GitHub](https://github.com/Neeraj-code-beep)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
