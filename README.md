# 🏥 HealthSphere — Next-Generation Personal Health & Emergency Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.10-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HealthSphere** is a production-grade, AI-powered longitudinal healthcare platform designed to seamlessly integrate personal health management, interactive clinical timeline analytics, automated prescription tracking, instant Emergency SOS dispatch routing, digital medical ID cards, and real-time AI medical consultations.

---

## 🌟 Overview

HealthSphere bridges the gap between disparate health records and actionable patient insights. Built with a modern responsive frontend using **React 18**, **TypeScript**, and **Tailwind CSS**, HealthSphere delivers an intuitive, accessible, and fast patient portal.

### Key Highlights
- 🧠 **AI Health Consultations**: Interactive AI assistant powered by Google Gemini with speech-to-text input, medical document attachments, and clinical summaries.
- ⚡ **One-Touch Emergency SOS**: Instant geolocation tracking, automated SOS trigger, nearby hospital locator with Leaflet maps, and 24/7 emergency contact dispatch.
- 📅 **Longitudinal Health Timeline**: Unified chronological view aggregating prescriptions, lab reports, appointments, vital logs, and blood donations into a filterable timeline.
- 💊 **Smart Prescription Tracking**: Dosage schedules, adherence stats, timing badges, calendar views, and CSV/PDF export options.
- 🪪 **Digital Medical ID & Vault**: Instant Medical ID card generator, BMI calculator, emergency details, and encrypted medical document storage.

---

## ✨ Features

### 1. Interactive Patient Dashboard
- Comprehensive health overview with real-time vitals summary cards.
- Embedded clinical timeline preview, care network map, and adherence progress widgets.
- One-click navigation to all core health tools.

### 2. Longitudinal Health Timeline (`/timeline`)
- Adapter pattern (`timelineAdapters.ts`) aggregating all patient records.
- Filter by date range (Today, This Week, Last Month, Custom), record type, and priority level.
- Interactive event drawer with full diagnostic notes and attachments.

### 3. Emergency SOS System (`/emergency`)
- One-tap SOS trigger with animated countdown and browser `useGeolocation` tracking.
- Interactive Leaflet map displaying nearby hospitals and ambulance services.
- Digital Medical ID display and instant emergency contact caller.

### 4. Smart Medication Tracker (`/medicines`)
- Add and manage prescription schedules with timing badges (Before Meal, After Meal, Bedtime).
- Dose adherence progress tracker, calendar view, and refill reminders.
- Data export in CSV format for physician reviews.

### 5. AI Assistant & Health Advisor (`/ai-assistant`)
- Generative AI consultation leveraging `@google/generative-ai`.
- Speech-to-text input via `useSpeechRecognition` hook.
- Pre-configured prompt templates for quick health questions.

### 6. Profile & Medical Document Vault (`/profile`)
- Complete patient demographics, blood group, allergies, and chronic conditions.
- Automatic profile completion percentage calculator.
- Digital Medical ID card exportable for offline emergency use.

---

## 🏗️ Architecture & Design Pattern

```
                       ┌─────────────────────────────────────────┐
                       │               React 18 SPA              │
                       │           (Vite + TypeScript)           │
                       └───────────────────┬─────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────┴─────────┐              ┌────────┴─────────┐              ┌────────┴─────────┐
│ Global Contexts  │              │ Domain Modules   │              │ Custom Hooks     │
│  - AuthContext   │              │  - Medicines     │              │  - useGeolocation│
│  - ThemeContext  │              │  - Timeline      │              │  - useSpeech     │
│  - ChatContext   │              │  - Emergency     │              │  - useMedia      │
└──────────────────┘              │  - AI Assistant  │              └──────────────────┘
                                  └────────┬─────────┘
                                           │
                                  ┌────────┴─────────┐
                                  │ Adapter Layer    │
                                  │ - timelineAdapt  │
                                  │ - exportUtils    │
                                  └──────────────────┘
```

- **Feature-Driven Directory Structure**: Code is co-located by domain feature (`components/medicines`, `components/timeline`, etc.) for maximum maintainability.
- **Adapter Pattern**: Normalizes diverse health domain schemas into unified models.
- **Accessible UI Primitives**: Built on Radix UI accessible foundations with custom Tailwind styling.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Core Framework** | React 18.3.1, TypeScript 5.8.3, Vite 8.0.10 |
| **Routing** | React Router 6.30.1 (`HashRouter` strategy) |
| **Styling & Icons** | Tailwind CSS 3.4.17, Lucide Icons (`lucide-react`), Framer Motion 12.29 |
| **UI Components** | Radix UI primitives, Shadcn UI component suite, Embla Carousel |
| **Data Fetching** | `@tanstack/react-query` 5.83.0 |
| **AI Integration** | `@google/generative-ai` 0.24.1 |
| **Mapping & Location** | Leaflet 1.9.4, React-Leaflet 4.2.1 |
| **Testing** | Vitest 3.2.4, `@testing-library/react`, ESLint 9.32.0 |

---

## 📂 Folder Structure

```
HealthSphere/
├── public/                     # Static assets & web manifest
├── src/
│   ├── assets/                 # SVGs, images, static media
│   ├── components/             # Reusable UI & Domain Components
│   │   ├── appointments/       # Appointment management UI
│   │   ├── bloodDonation/      # Blood & Organ donation UI
│   │   ├── chat/               # AI Assistant & Chat components
│   │   ├── emergency/          # Emergency SOS & geolocation UI
│   │   ├── layout/             # Navbar, Sidebar, Footer, Layout wrapper
│   │   ├── medicines/          # Prescription & dose tracking UI
│   │   ├── profile/            # Patient profile & Medical ID card
│   │   ├── timeline/           # Longitudinal clinical timeline UI
│   │   └── ui/                 # Shared Shadcn UI primitives & custom cards
│   ├── contexts/               # React Context Providers (Auth, Theme, Chat)
│   ├── hooks/                  # Custom hooks (Geolocation, Speech, Media, Toasts)
│   ├── pages/                  # Page Containers (Dashboard, Medicines, Emergency, etc.)
│   ├── services/               # API & WebSocket client definitions
│   ├── types/                  # Global TypeScript type definitions
│   └── utils/                  # Utility functions & helpers
├── package.json                # Project dependencies & scripts
├── tailwind.config.ts          # Tailwind styling tokens & dark mode configuration
└── vite.config.ts              # Vite bundling configuration
```

---

## 🚀 Quick Start — Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or yarn/bun

### 1. Clone & Navigate
```bash
git clone https://github.com/Ashmita1206/HealthSphere.git
cd HealthSphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_optional_maps_api_key
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

Run the automated Vitest unit test suite:
```bash
npm run test
```

Run TypeScript strict type checking:
```bash
npx tsc --noEmit
```

Build for production:
```bash
npm run build
```

---

## 📸 Screenshots Section

| Patient Dashboard | Health Timeline |
| :---: | :---: |
| ![Dashboard Preview](./screenshots/dashboard.png) | ![Timeline Preview](./screenshots/timeline.png) |

| Emergency SOS Locator | Smart Medication Tracker |
| :---: | :---: |
| ![Emergency SOS Preview](./screenshots/emergency.png) | ![Medicines Preview](./screenshots/medicines.png) |

*(Refer to [`screenshots/README.md`](./screenshots/README.md) for adding screenshot assets).*

---

## 🔮 Future Scope & Roadmap

- 📱 **Progressive Web App (PWA)**: Full offline support for Emergency Medical ID & offline prescription access.
- 🔒 **HIPAA & GDPR Compliance**: End-to-end client-side encryption for health document vaults.
- ⌚ **Wearable Integration**: Sync real-time Apple HealthKit / Google Fit vital data via Web Bluetooth API.
- 🌐 **Multi-Language Support**: i18n localization in 10+ regional languages.

---

## 👥 Team & Authors

- **Ashmita Goyal** — Lead Frontend Architect — [GitHub](https://github.com/Ashmita1206)
- **Neeraj Mishra** — Full Stack & System Engineer — [GitHub](https://github.com/Neeraj-code-beep)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
