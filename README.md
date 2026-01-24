# 🏥 HealthSphere — AI-Powered Personal Health Management Platform

HealthSphere is a full-stack, AI-powered healthcare platform that centralizes personal health data, provides intelligent assistance, enables real-time monitoring, and delivers a secure, modern user experience — inspired by professional healthcare portals like Max Healthcare and ILBS.

---

## 🚀 Features

### 🌐 Platform Features
- Professional healthcare landing page with About, Services, Contact, and Auth flow
- Secure authentication system (Login / Register)
- Role-based dashboards (Patient / User)
- Responsive and accessible UI
- Dark / Light theme toggle
- Mobile-friendly navigation drawer (hamburger menu)
- Secure routing & privacy enforcement

### 🧠 AI Capabilities
- AI Chatbot for health queries
- Voice input (mic support) with start/stop control
- Scrollable chat interface
- Smart response generation
- Emergency SOS trigger

### 📍 Location & Permissions
- Nearest hospital / clinic finder using live geolocation
- Camera, microphone, and location permission handling
- Real-time data access where required

### 💊 Health Management
- Medicine reminders
- Reports vault (secure document storage)
- Wellness dashboard with charts & health metrics
- Donor registration
- Emergency services integration

### 🔐 Security
- JWT-based authentication
- End-to-end encrypted API communication
- Environment-based secrets management
- Secure storage for health records

---

## 🧱 Tech Stack

### Frontend
- **Next.js 16 (App Router + Turbopack)**
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI**
- **Framer Motion**
- **Recharts** (charts & graphs)

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**
- **REST APIs**

### AI & Cloud
- **Google Cloud APIs**
- **Google Cloud Storage** (medical reports, files)
- **Speech-to-Text APIs**
- **Text-to-Speech APIs**
- **Geolocation APIs**
- **AI Chat APIs**

---

## 📁 Project Structure

```bash
healthsphere/
│
├── web/                 # Frontend (Next.js)
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # UI components
│   │   ├── lib/         # Utilities & API handlers
│   │   └── styles/      # Global styles
│   └── public/          # Static assets
│
├── server/              # Backend (Node + Express)
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & security
│   └── config/          # Environment configs
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
⚙️ Installation & Setup
🔧 Prerequisites
Node.js v18+

npm or yarn

Git

Google Cloud account

📥 Clone the Repository
git clone https://github.com/Ashmita1206/HealthSphere.git
cd HealthSphere
📦 Install Dependencies
Frontend:
cd web
npm install
Backend:
cd ../server
npm install
🔐 Environment Setup
Create .env files in both web/ and server/ folders using .env.example as reference.

Example .env (Server):
PORT=4000
JWT_SECRET=your_secure_secret
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json
GCS_BUCKET_NAME=your_bucket_name
AI_API_KEY=your_ai_key
WEB_ORIGIN=http://localhost:3000
Example .env.local (Frontend):
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_AI_API_KEY=your_ai_key
▶️ Running the Application
Start Backend:
cd server
npm run dev
Start Frontend:
cd web
npm run dev
Then open:

👉 http://localhost:3000

🔑 External APIs Used
You must configure the following APIs:

API Service	Provider
AI Chat API	Google / OpenAI
Speech-to-Text	Google Cloud
Text-to-Speech	Google Cloud
Geolocation	Google Maps API
File Storage	Google Cloud Storage
Authentication	JWT
🧠 How to Get Google Cloud API Keys
Go to https://console.cloud.google.com

Create a new project

Enable APIs:

Cloud Storage

Speech-to-Text

Text-to-Speech

Maps JavaScript API

Create credentials → API Key / Service Account

Download JSON key file and add path to .env

🔐 Security Best Practices
Never commit .env files

Use HTTPS in production

Rotate API keys regularly

Use secure cookies

Encrypt sensitive data at rest & in transit

🧪 Testing
# Frontend
npm run test

# Backend
npm run test
🚀 Deployment
Frontend
Vercel / Netlify / Firebase Hosting

Backend
Google Cloud Run / AWS / Railway / Render

🧑‍⚕️ Use Cases
Personal health management

Emergency response

Medical report storage

AI-assisted health guidance

Donor registration systems

Healthcare dashboards


🛠️ Future Enhancements
Doctor appointment booking

Telemedicine video calls

Wearable device integration

Multi-language support

Blockchain medical records

Advanced AI diagnostics

👩‍💻 Author
Ashmita Goyal
🔗 GitHub: https://github.com/Ashmita1206
Neeraj Mishra 
🔗 GitHub: https://github.com/Ashmita1206

📜 License
This project is licensed under the MIT License.

⭐ Support
If you like this project, please ⭐ star the repository and share it!
For issues or feature requests, open a GitHub issue.

