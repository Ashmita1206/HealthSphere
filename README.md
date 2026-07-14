# 🏥 HealthSphere AI

![React](https://img.shields.io/badge/Frontend-React-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38B2AC)
![AI](https://img.shields.io/badge/AI-Health%20Assistant-orange)
![Realtime](https://img.shields.io/badge/Realtime-Supabase-success)
![Storage](https://img.shields.io/badge/Storage-Supabase%20Storage-purple)

HealthSphere AI is a modern **AI-powered healthcare management web application** built using **React, TypeScript, Supabase, and AI integrations**.

The platform helps users manage their **medicines, appointments, reminders, medical reports, and health-related activities** in one centralized dashboard while also providing an **AI-assisted healthcare chatbot** for quick health guidance.

This project combines:

- Full Stack Web Development
- AI-powered healthcare assistance
- Realtime systems
- Cloud storage
- Authentication & secure data handling
- Modern responsive UI/UX

---

# 🚀 Project Overview

The goal of **HealthSphere AI** is to simplify personal healthcare management through an intelligent and user-friendly platform.

Users can:

- Manage medicines & reminders
- Upload and store medical reports securely
- Track appointments
- Interact with an AI-powered health assistant
- Access health information quickly
- Use speech recognition and accessibility features

The application focuses on building a **scalable healthcare ecosystem** using modern technologies and cloud-based services.

---

# ✨ Core Features

## 🔐 Authentication System
- Email/password authentication using Supabase
- User registration & login
- Persistent session management
- Protected routes & secure pages

---

## 👤 Profile Management
- Update personal profile information
- Store user-specific health data
- Personalized dashboard experience

---

## 💊 Medicine Management
- Add medicines
- Update medicine details
- Delete medicines
- Track active medications

---

## ⏰ Smart Reminders
- Create reminders for medicines & tasks
- Enable/disable reminders
- Delete reminders
- Realtime updates using Supabase Realtime

---

## 📅 Appointment Tracking
- Schedule appointments
- View upcoming appointments
- Delete completed appointments

---

## 📁 Medical Reports Vault
- Upload medical reports securely
- Download reports anytime
- Delete uploaded reports
- Cloud storage using Supabase Storage

---

## 🤖 AI Health Assistant
- AI-powered healthcare chatbot
- Chat persistence for logged-in users
- Speech-to-text support
- Text-to-speech responses
- Edge Function powered AI integration

---

## 📊 Dashboard & Analytics
- Health overview dashboard
- Medicine summaries
- Appointment insights
- Interactive charts using Recharts

---

## 🎤 Accessibility & Media Features
- Browser Speech Recognition
- Speech Synthesis API
- Webcam & microphone permission handling
- Responsive UI for multiple devices

---

## 📍 Location Features
- Geolocation support
- Nearby hospital/clinic integration (mock service currently)

---

# 🧠 How It Works

1. User signs into the platform  
2. Health data is securely managed using Supabase  
3. Users can:
   - Add medicines
   - Schedule appointments
   - Create reminders
   - Upload reports  
4. AI Chat Assistant processes user health queries  
5. Edge Functions communicate with the AI gateway  
6. Dashboard displays realtime health insights  

---

# 🛠 Tech Stack

## Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Radix UI

---

## Backend Services
- Supabase Authentication
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions

---

## Libraries & Tools
- React Query
- React Router DOM
- React Hook Form
- Zod
- Recharts
- Lucide React
- Vitest
- ESLint

---

# 📂 Project Structure

```bash
healthsphere-ai
│
├── public
│
├── src
│   ├── components
│   │   ├── chat
│   │   │   └── ChatBot.tsx
│   │   │
│   │   ├── ui
│   │   └── layout
│   │
│   ├── contexts
│   │   ├── AuthContext
│   │   └── ThemeContext
│   │
│   ├── hooks
│   │   ├── useGeolocation
│   │   ├── useSpeechRecognition
│   │   ├── useMediaPermissions
│   │   └── use-toast
│   │
│   ├── integrations
│   │   └── supabase
│   │       └── client.ts
│   │
│   ├── pages
│   │   ├── Dashboard
│   │   ├── Medicines
│   │   ├── Reports
│   │   ├── Appointments
│   │   ├── Reminders
│   │   ├── Emergency
│   │   ├── Profile
│   │   └── Settings
│   │
│   ├── services
│   │   └── locationsService.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── supabase
│   └── functions
│       └── health-chat
│           └── index.ts
│
├── .env.example
├── package.json
├── SUPABASE_SETUP.md
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url

VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Supabase Edge Function Variables:

```env
LOVABLE_API_KEY=your_ai_gateway_api_key
```

> ⚠️ Never expose service-role keys in frontend applications.

---

# 🗄 Database Tables

The application uses the following Supabase tables:

- `profiles`
- `medicines`
- `appointments`
- `reminders`
- `reports`
- `chat_messages`

Storage Bucket:
- `reports`

---

# 🚀 Running the Project Locally

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/healthsphere-ai.git
```

---

## 2. Navigate to Project

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

# 📦 Build for Production

```bash
npm run build
```

Deploy easily on:

- Vercel
- Netlify
- Firebase Hosting
- Any static hosting platform

---

# 🔒 Security & Best Practices

- Supabase Row Level Security (RLS)
- Secure authentication handling
- Protected API routes
- Cloud-based storage security
- Environment variable protection
- HTTPS recommended for production

---

# 📡 API & Backend Services

## Supabase Edge Function

```bash
/functions/v1/health-chat
```

Used for:
- AI chat requests
- Message forwarding
- AI gateway communication

---

# 📸 Screenshots

Add screenshots here:

```bash
/sscreenshots/dashboard.png
/screenshots/chat.png
/screenshots/reports.png
```

Example:

![Dashboard](./screenshots/dashboard.png)

---

# 🔮 Future Plans

Planned future improvements include:

- Real hospital & clinic APIs
- Advanced AI symptom analysis
- Health analytics & insights
- Medicine recommendation system
- Emergency SOS system
- Wearable device integration
- Push notifications
- Mobile app version
- Better AI personalization
- Advanced healthcare dashboards

---

# 🤝 Contributing

Contributions are welcome.

Steps to contribute:

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Authors

## Neeraj Mishra
- Full Stack Developer
- AI & Web Development Enthusiast

## Ashmita Goyal
- Frontend & Healthcare Platform Contributor

---

# 📚 Additional Resources

- `.env.example` → Environment variables reference
- `SUPABASE_SETUP.md` → Database & Supabase setup guide
- `screenshots/README.md` → Screenshot guide

---

# ⭐ Support

If you like this project, consider giving it a **star on GitHub** ⭐

- [.env.example](./.env.example) — Environment variables reference
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Complete Supabase database setup guide with SQL schemas and RLS policies
- [screenshots/README.md](./screenshots/README.md) — Guide for adding and optimizing application screenshots
