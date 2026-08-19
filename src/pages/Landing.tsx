import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ShieldCheck,
  Pill,
  Calendar,
  FileText,
  AlertTriangle,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Activity,
  Sparkles,
  ChevronDown,
  Star,
  Stethoscope,
  Target,
  Eye,
  Lightbulb,
  Shield,
  FileSpreadsheet,
  Check,
  X,
  BarChart3,
  UserCheck,
  ClipboardList,
  HeartPulse,
  Hospital,
  IdCard,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/ui/SectionHeader';

const floatingStats = [
  { value: '23+', label: 'Clinical Modules', icon: LayoutDashboard },
  { value: '24x7', label: 'Emergency Ready', icon: AlertTriangle },
  { value: 'AI', label: 'Health Assistant', icon: Bot },
  { value: '100%', label: 'Encrypted & Secure', icon: ShieldCheck },
];

const aboutCards = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'Empower every individual with intelligent, accessible, and unified personal health management — available anytime, anywhere.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'A world where healthcare is proactive, personalized, and seamlessly connected through technology and artificial intelligence.',
  },
  {
    icon: Lightbulb,
    title: 'Problem We Solve',
    description: 'Fragmented medical records, missed medications, delayed emergency response, and lack of actionable health insights.',
  },
  {
    icon: Shield,
    title: 'Why HealthSphere?',
    description: 'One unified platform combining AI diagnostics, emergency SOS, medicine reminders, digital Medical ID, and encrypted health records.',
  },
];

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Centralized narrative health stream with vitals, upcoming medications, appointments, and personalized health score.',
    badge: 'Command Center',
  },
  {
    icon: Pill,
    title: 'Medicines',
    description: 'Time-aware medication journey with dose schedules, interaction alerts, refill reminders, and adherence analytics.',
    badge: 'Smart Dosage',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency 24/7',
    description: 'One-touch emergency speed dial and GPS broadcast to nearby trauma hospitals and emergency contacts.',
    badge: 'Instant Dispatch',
  },
  {
    icon: Activity,
    title: 'Health Timeline',
    description: 'Chronological story of all health events — vitals, lab results, medications, and appointments in one feed.',
    badge: 'Patient Story',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Clinical-grade symptom triage and evidence-based health guidance with transparent evidence attribution.',
    badge: 'Clinical AI',
  },
  {
    icon: Calendar,
    title: 'Appointments',
    description: 'Schedule and manage doctor visits with automated preparation checklists and consultation history.',
    badge: 'Care Coordination',
  },
  {
    icon: Droplets,
    title: 'Blood & Organ',
    description: 'Register as a donor or request blood. Find nearby donors, track eligibility, and manage donation history.',
    badge: 'Support Network',
  },
  {
    icon: UserCheck,
    title: 'Medical Profile',
    description: 'Comprehensive patient health passport with allergies, chronic conditions, surgical history, and emergency contacts.',
    badge: 'Digital Identity',
  },
  {
    icon: IdCard,
    title: 'Medical ID',
    description: 'Digital medical identity card with QR code access for first responders containing critical health information.',
    badge: 'Emergency ID',
  },
  {
    icon: Hospital,
    title: 'Nearby Hospitals',
    description: 'GPS-powered hospital finder with real-time distance, directions, specialties, and emergency status.',
    badge: 'Location Aware',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Trends',
    description: 'Visual health analytics with restrained trend lines for vitals, medication adherence, and clinical indicators.',
    badge: 'Data Insights',
  },
  {
    icon: FileSpreadsheet,
    title: 'Reports & OCR',
    description: 'Upload, analyze, and extract medical lab report parameters with plain-language AI explanations.',
    badge: 'OCR Extraction',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'UNDERSTAND YOUR HEALTH',
    description: 'Get an immediate, synthesized overview of your health standing and key clinical metrics.',
    icon: Activity,
  },
  {
    step: '02',
    title: 'CONNECT YOUR RECORDS',
    description: 'Upload blood test PDFs, prescriptions, and lab reports into your encrypted OCR vault.',
    icon: FileSpreadsheet,
  },
  {
    step: '03',
    title: 'SEE WHAT CHANGED',
    description: 'Track longitudinal vital trends, biomarker shifts, and medication adherence over time.',
    icon: BarChart3,
  },
  {
    step: '04',
    title: 'TAKE THE NEXT ACTION',
    description: 'Follow time-aware medication schedules, log daily vitals, and prepare for doctor visits.',
    icon: Pill,
  },
  {
    step: '05',
    title: 'ASK HEALTHSPHERE',
    description: 'Receive clinical-grade AI triage grounded strictly in verified lab report baselines.',
    icon: Bot,
  },
];

const comparisons = [
  { feature: 'Medical Records', traditional: 'Paper folders & scattered PDFs', healthsphere: 'Unified digital health records' },
  { feature: 'AI Health Support', traditional: 'Generic web searches', healthsphere: 'Evidence-based AI clinical triage' },
  { feature: 'Emergency Response', traditional: 'Manual phone dialing', healthsphere: 'One-touch GPS emergency dispatch' },
  { feature: 'Medicine Reminders', traditional: 'Paper notes (easy to miss)', healthsphere: 'Time-aware alerts & adherence' },
  { feature: 'Digital Medical ID', traditional: 'Physical cards (can be lost)', healthsphere: 'Digital Medical ID with QR access' },
  { feature: 'Health Timeline', traditional: 'No centralized history', healthsphere: 'Chronological patient health story' },
];

const testimonials = [
  {
    name: 'Dr. Rajesh Sharma',
    role: 'Senior Cardiologist, Metro Heart Institute',
    comment: 'HealthSphere has fundamentally improved how my patients present their health history. AI lab report extractions save valuable time during consultations.',
    rating: 5,
    initials: 'RS',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Chronic Care Patient',
    comment: 'Managing my daily prescriptions and blood pressure used to be overwhelming. The medication reminders and AI assistant give me complete confidence.',
    rating: 5,
    initials: 'SJ',
  },
  {
    name: 'Dr. Elena Rostova',
    role: 'Chief Medical Officer, Horizon Health',
    comment: 'The clinical restraint combined with robust encryption makes HealthSphere an exemplary patient engagement platform.',
    rating: 5,
    initials: 'ER',
  },
];

const faqs = [
  {
    question: 'What is HealthSphere?',
    answer: 'HealthSphere is an intelligent personal health operating system that unifies medical records, medication tracking, emergency SOS, vitals analytics, and clinical AI guidance — all in one secure platform.',
  },
  {
    question: 'Is my health data secure?',
    answer: 'Yes. All personal health telemetry is encrypted using 256-bit encryption in transit and at rest, maintaining strict HIPAA-compliant data isolation.',
  },
  {
    question: 'How does medication management work?',
    answer: 'HealthSphere provides a time-aware medication journey with dosage reminders, drug interaction alerts, refill notices, and 7-day adherence tracking.',
  },
  {
    question: 'How does the AI Assistant function?',
    answer: 'The AI Assistant provides symptom triage and health explanations paired with transparent evidence attribution (such as Verified Lab Baseline). It complements professional medical advice.',
  },
  {
    question: 'What happens during an emergency?',
    answer: 'With a single tap on Emergency 24/7, HealthSphere locates nearest trauma facilities, alerts designated contacts, and exposes your emergency Medical ID for first responders.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const memoizedFeatures = useMemo(() => features, []);
  const memoizedTestimonials = useMemo(() => testimonials, []);
  const memoizedComparisons = useMemo(() => comparisons, []);

  const handleNavigate = useCallback((path: string) => () => navigate(path), [navigate]);
  const toggleFaq = useCallback((idx: number) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  }, []);

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#0F172A] selection:bg-[#0F766E] selection:text-white">
      {/* HERO SECTION */}
      <section id="hero" aria-label="Hero section" className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-xs text-xs font-semibold text-[#0F766E]">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                <span>CLINICAL DIGITAL HEALTH ARCHITECTURE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12] font-heading">
                YOUR HEALTH,{' '}
                <span className="font-serif font-normal italic text-[#0F766E]">
                  UNDERSTOOD.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A unified personal health operating system connecting diagnostic lab reports, daily telemetry, medication schedules, and clinical AI into one calm, encrypted platform.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  onClick={handleNavigate('/auth/register')}
                  className="w-full sm:w-auto h-12 px-7 text-sm font-semibold bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <a
                  href="#features"
                  className="w-full sm:w-auto h-12 px-7 text-sm font-semibold bg-white hover:bg-[#FAF9F6] text-[#0F172A] border border-[#E5E7EB] rounded-xl transition-all flex items-center justify-center"
                >
                  Explore Capabilities
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64748B] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                  <span>HIPAA-Compliant Architecture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                  <span>Zero Marketing Tracking</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Mock UI Snapshot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#042F2C] flex items-center justify-center text-white font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Health Standing</p>
                      <p className="text-[10px] text-[#64748B]">Updated Today</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E6F4F1] text-[#047857] border border-[#A7F3D0]">
                    Optimal · 82/100
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#E6F4F1] border border-[#A7F3D0] text-xs space-y-1">
                  <p className="font-bold text-[#047857] flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" /> Clinical Insight
                  </p>
                  <p className="text-[#0F172A] leading-relaxed text-[11px]">
                    Fasting glucose from Aug 4 lab report is stable (98 mg/dL). Source: Verified Lab Baseline.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] text-xs space-y-1">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Next Priority Care</p>
                  <p className="font-semibold text-[#0F172A]">Metformin 500mg · Due at 8:00 AM</p>
                  <p className="text-[11px] text-[#475569]">Take with morning meal</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] text-center">
                    <p className="text-[10px] text-[#64748B] font-medium">Heart Rate</p>
                    <p className="text-sm font-bold text-[#0F172A] tabular-nums">72 bpm</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] text-center">
                    <p className="text-[10px] text-[#64748B] font-medium">Blood Pressure</p>
                    <p className="text-sm font-bold text-[#0F172A] tabular-nums">120/80</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] text-center">
                    <p className="text-[10px] text-[#64748B] font-medium">Adherence</p>
                    <p className="text-sm font-bold text-[#047857] tabular-nums">94%</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Badges */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {floatingStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center text-[#0F766E] shrink-0">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{stat.value}</p>
                      <p className="text-[10px] text-[#64748B] font-medium">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" aria-label="About HealthSphere" className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="About HealthSphere"
            title="Reimagining Digital Healthcare Management"
            subtitle="HealthSphere unifies fragmented records, medication schedules, emergency SOS, and clinical AI into one cohesive personal health operating system."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="p-6 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] shadow-xs hover:border-[#0F766E]/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F766E] flex items-center justify-center text-white mb-4">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] mb-2">{card.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" aria-label="Platform features" className="py-16 bg-[#FAF9F6] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Platform Capabilities"
            title="Comprehensive Health Telemetry Ecosystem"
            subtitle="23+ modules engineered for clinical safety, transparent reasoning, and intuitive patient agency."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {memoizedFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#0F766E]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] flex items-center justify-center text-[#0F766E]">
                      <feat.icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF9F6] text-[#475569] border border-[#E5E7EB]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-1 group-hover:text-[#0F766E] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{feat.description}</p>
                </div>
                <Link
                  to="/auth/register"
                  className="mt-4 pt-3 border-t border-[#E5E7EB] inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#115E59]"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" aria-label="How it works" className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Workflow"
            title="How HealthSphere Works"
            subtitle="Four steps from setup to intelligent healthcare management."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((stepItem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="p-5 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] text-center space-y-3"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-[#0F766E] text-white font-bold text-sm flex items-center justify-center">
                  {stepItem.step}
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">{stepItem.title}</h4>
                <p className="text-xs text-[#475569] leading-relaxed">{stepItem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="comparison" aria-label="Comparison table" className="py-16 bg-[#FAF9F6] border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Comparison"
            title="HealthSphere vs Traditional Management"
            subtitle="Clear advantages of a unified health operating system."
          />

          <div className="mt-10 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-xs">
            <div className="grid grid-cols-12 bg-[#0F172A] text-white text-xs font-semibold py-3 px-5">
              <div className="col-span-4">Capability</div>
              <div className="col-span-4 text-slate-400">Traditional</div>
              <div className="col-span-4 text-[#2DD4BF]">HealthSphere</div>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {memoizedComparisons.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 py-3 px-5 items-center text-xs">
                  <div className="col-span-4 font-bold text-[#0F172A]">{row.feature}</div>
                  <div className="col-span-4 text-[#64748B] flex items-center gap-1">
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{row.traditional}</span>
                  </div>
                  <div className="col-span-4 text-[#0F766E] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                    <span>{row.healthsphere}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" aria-label="Testimonials" className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Clinical Feedback"
            title="Trusted by Doctors & Patients"
            subtitle="Real experiences with HealthSphere's care management platform."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {memoizedTestimonials.map((t, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed italic">"{t.comment}"</p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#E5E7EB]">
                  <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{t.name}</p>
                    <p className="text-[10px] text-[#64748B]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-label="Frequently asked questions" className="py-16 bg-[#FAF9F6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="FAQ"
            title="Frequently Asked Questions"
            subtitle="Clear answers about HealthSphere security, capabilities, and emergency protocols."
          />

          <div className="mt-10 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-[#0F172A] hover:bg-[#FAF9F6] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-4 text-xs text-[#475569] leading-relaxed border-t border-[#E5E7EB] pt-3"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
