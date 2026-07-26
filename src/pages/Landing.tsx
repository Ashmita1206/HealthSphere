import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Lock,
  Cloud,
  ChevronDown,
  Star,
  Users,
  Stethoscope,
  Brain,
  Zap,
  Shield,
  FileSpreadsheet,
  Check,
  X,
  Heart,
  MapPin,
  BarChart3,
  CreditCard,
  Target,
  Eye,
  Lightbulb,
  Clock,
  Smartphone,
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

/* ============================================================================
   DATA — All static data arrays for the landing page sections.
   ============================================================================ */

const floatingStats = [
  { value: '23+', label: 'Modules', icon: LayoutDashboard },
  { value: '24x7', label: 'Emergency Ready', icon: AlertTriangle },
  { value: 'AI', label: 'Health Assistant', icon: Bot },
  { value: '100%', label: 'Responsive', icon: Smartphone },
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
    description: 'Centralized health overview with vitals, upcoming medications, appointments, and your personalized health score.',
    badge: 'Command Center',
  },
  {
    icon: Pill,
    title: 'Medicines',
    description: 'Smart medication tracking with dosage schedules, interaction alerts, refill reminders, and adherence analytics.',
    badge: 'Smart Dosage',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency SOS',
    description: 'One-touch GPS emergency broadcast to nearby hospitals, ambulances, and designated emergency contacts.',
    badge: 'Instant Dispatch',
  },
  {
    icon: Activity,
    title: 'Health Timeline',
    description: 'Chronological view of all health events — vitals, lab results, medications, and appointments in one feed.',
    badge: 'Life Log',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Clinical-grade symptom triage and evidence-based health guidance powered by advanced generative medical AI.',
    badge: 'Interactive AI',
  },
  {
    icon: Calendar,
    title: 'Appointments',
    description: 'Schedule, manage, and track doctor visits with automated reminders and consultation history archive.',
    badge: 'Smart Scheduling',
  },
  {
    icon: Droplets,
    title: 'Blood Donation',
    description: 'Register as a donor or request blood. Find nearby donors, track eligibility, and manage donation history.',
    badge: 'Save Lives',
  },
  {
    icon: UserCheck,
    title: 'Medical Profile',
    description: 'Comprehensive patient profile with allergies, chronic conditions, surgical history, and emergency contacts.',
    badge: 'Complete Record',
  },
  {
    icon: IdCard,
    title: 'Medical ID',
    description: 'Digital medical identity card with QR code access for first responders containing critical health information.',
    badge: 'Digital ID',
  },
  {
    icon: Hospital,
    title: 'Nearby Hospitals',
    description: 'GPS-powered hospital finder with real-time distance, directions, specialties, and emergency department status.',
    badge: 'Location Aware',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Visual health analytics with trend charts for vitals, medication adherence, and predictive risk indicators.',
    badge: 'Data Insights',
  },
  {
    icon: FileSpreadsheet,
    title: 'Reports & Exports',
    description: 'Generate, view, and export medical reports as PDFs. Share with doctors or save for personal records.',
    badge: 'Export Ready',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Register',
    description: 'Create your secure, encrypted patient account in under 60 seconds with email verification.',
    icon: ClipboardList,
  },
  {
    step: '02',
    title: 'Add Medical Details',
    description: 'Complete your medical profile with allergies, conditions, medications, and emergency contacts.',
    icon: HeartPulse,
  },
  {
    step: '03',
    title: 'Track Health',
    description: 'Log vitals, schedule appointments, set medicine reminders, and monitor your health timeline.',
    icon: Activity,
  },
  {
    step: '04',
    title: 'Get AI Insights & Emergency Support',
    description: 'Receive AI-powered health guidance, predictive alerts, and instant access to emergency services.',
    icon: Brain,
  },
];

const statsCounters = [
  { target: 23, suffix: '+', label: 'Application Modules' },
  { target: 160, suffix: '+', label: 'Reusable Components' },
  { target: 35, suffix: '+', label: 'Automated Tests' },
  { target: 0, suffix: '', label: 'TypeScript Errors' },
  { target: 100, suffix: '%', label: 'Responsive' },
];

const comparisons = [
  { feature: 'Medical Records', traditional: 'Paper folders & scattered PDFs', healthsphere: 'Unified digital health records' },
  { feature: 'AI Health Support', traditional: 'No AI — only in-person visits', healthsphere: '24/7 AI symptom triage & advice' },
  { feature: 'Emergency Response', traditional: 'Manual phone calling', healthsphere: 'One-touch GPS SOS dispatch' },
  { feature: 'Medicine Reminders', traditional: 'Paper notes (easy to miss)', healthsphere: 'Smart alerts & adherence tracking' },
  { feature: 'Digital Medical ID', traditional: 'Physical cards (can be lost)', healthsphere: 'QR-code digital Medical ID' },
  { feature: 'Health Timeline', traditional: 'No centralized history', healthsphere: 'Chronological life-long health log' },
];

/* Demo testimonials — frontend only, no real user data */
const testimonials = [
  {
    name: 'Dr. Rajesh Sharma',
    role: 'Senior Cardiologist, Metro Heart Institute',
    comment: 'HealthSphere has fundamentally changed how my patients present their medical history. The AI report summaries save 15 minutes per consultation.',
    rating: 5,
    initials: 'RS',
    color: 'bg-teal-600',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Chronic Care Patient',
    comment: 'Managing my daily insulin and blood pressure readings used to be stressful. The medication reminders and AI chat give me complete peace of mind.',
    rating: 5,
    initials: 'SJ',
    color: 'bg-blue-600',
  },
  {
    name: 'Dr. Elena Rostova',
    role: 'Chief Medical Officer, Horizon Health',
    comment: 'The enterprise-level security combined with intuitive UI makes HealthSphere the gold standard for modern patient engagement platforms.',
    rating: 5,
    initials: 'ER',
    color: 'bg-purple-600',
  },
];

const faqs = [
  {
    question: 'What is HealthSphere?',
    answer: 'HealthSphere is a comprehensive AI-powered personal healthcare companion that unifies medical records, medication management, emergency SOS, health analytics, and an intelligent AI assistant — all in one secure platform.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All personal health data is encrypted using AES-256 bit encryption both in transit and at rest. We follow HIPAA-grade privacy standards and never share or sell patient data.',
  },
  {
    question: 'Can I manage medicines?',
    answer: 'Yes. HealthSphere provides smart medication scheduling with dosage reminders, drug interaction warnings, refill alerts, and detailed adherence tracking to help you stay on top of your prescriptions.',
  },
  {
    question: 'How does AI Assistant work?',
    answer: 'Our AI Assistant uses clinically validated models trained on peer-reviewed medical literature to provide symptom triage, health assessments, and evidence-based recommendations. It complements, never replaces, professional medical advice.',
  },
  {
    question: 'Can I use Emergency SOS?',
    answer: 'Yes. With a single tap, Emergency SOS detects your GPS coordinates, finds the nearest trauma hospitals and ambulances, and alerts your designated emergency contacts instantly.',
  },
];

/* ============================================================================
   ANIMATED COUNTER HOOK
   ============================================================================ */

function useCountUp(target: number, duration = 2000, shouldStart: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    if (target === 0) { setCount(0); return; }

    let startTime: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, shouldStart]);

  return count;
}

/* ============================================================================
   STAT COUNTER COMPONENT
   ============================================================================ */

function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(target, 1800, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
      <h3 className="text-3xl lg:text-4xl font-extrabold text-teal-700 font-heading tracking-tight">
        {count}{suffix}
      </h3>
      <p className="text-sm font-bold text-slate-900 mt-1.5">{label}</p>
    </div>
  );
}

/* ============================================================================
   LANDING PAGE COMPONENT
   ============================================================================ */

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Memoize static data to prevent unnecessary re-creation
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
    <div className="bg-slate-50 overflow-hidden">

      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section id="hero" aria-label="Hero section" className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-teal-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">

        {/* Ambient Background Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-teal-200/30 via-emerald-200/20 to-blue-200/30 blur-3xl pointer-events-none -z-10" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-teal-200/80 shadow-sm text-xs font-bold text-teal-800 tracking-wide">
                <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" aria-hidden="true" />
                <span>AI-POWERED HEALTHCARE PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-heading">
                Your Complete AI-Powered{' '}
                <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Personal Healthcare Companion
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Manage your health records, medications, appointments, and emergencies with AI-driven insights — all in one beautifully designed, secure platform.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  onClick={handleNavigate('/auth/register')}
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                  aria-label="Get started with HealthSphere"
                >
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>

                <a
                  href="#features"
                  className="w-full sm:w-auto h-13 px-8 text-base font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl transition-all flex items-center justify-center"
                  aria-label="Explore platform features"
                >
                  Explore Features
                </a>
              </div>

              {/* Trust Callout */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />
                  <span>256-bit Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Interactive UI Preview + Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              {/* Floating Stat Badges */}
              <div className="hidden lg:block" aria-hidden="true">
                {floatingStats.map((stat, idx) => {
                  const positions = [
                    'top-0 -left-10',
                    '-top-4 right-0',
                    'bottom-20 -left-14',
                    'bottom-4 -right-6',
                  ];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 + idx * 0.15 }}
                      className={`absolute ${positions[idx]} z-10 animate-float float-delay-${idx + 1}`}
                    >
                      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 font-heading">{stat.value}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mock Clinical UI Card */}
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-2xl space-y-4">

                  {/* Mock Header */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-900 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold tracking-wide font-heading">HealthSphere Assistant</p>
                        <p className="text-[10px] text-teal-200">Active Patient Triage Mode</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-800 text-teal-100 border border-teal-700">
                      Live AI
                    </span>
                  </div>

                  {/* Mock Chat Bubble */}
                  <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-800">
                      <p className="font-semibold text-teal-800 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Patient Symptoms Query
                      </p>
                      <p className="text-slate-600">"I have a mild fever (100.2°F), dry cough, and fatigue for 2 days. What should I do?"</p>
                    </div>

                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/70 text-slate-800">
                      <p className="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" /> AI Clinical Assessment
                      </p>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        Based on your parameters: <strong>Low-risk viral respiratory infection</strong>.
                      </p>
                      <div className="mt-2 text-[10px] flex items-center gap-2 font-bold text-teal-800">
                        <span className="px-2 py-0.5 rounded bg-teal-100">Rest & Hydration</span>
                        <span className="px-2 py-0.5 rounded bg-teal-100">Paracetamol 500mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Mini Banner */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Heart Rate</p>
                      <p className="text-base font-extrabold text-slate-900 font-heading">72 bpm</p>
                      <span className="text-[9px] font-bold text-emerald-600">Normal</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Pressure</p>
                      <p className="text-base font-extrabold text-slate-900 font-heading">120/80</p>
                      <span className="text-[9px] font-bold text-emerald-600">Optimal</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Health Score</p>
                      <p className="text-base font-extrabold text-teal-700 font-heading">94 / 100</p>
                      <span className="text-[9px] font-bold text-teal-600">Excellent</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Mobile Floating Stats (horizontal scroll) */}
              <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
                {floatingStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 font-heading">{stat.value}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================================================================
          ABOUT SECTION
          ================================================================ */}
      <section id="about" aria-label="About HealthSphere" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="About HealthSphere"
            title="Reimagining Personal Healthcare Management"
            subtitle="HealthSphere addresses the critical challenges in modern healthcare — fragmented records, missed medications, and delayed emergencies — with one intelligent platform."
          />

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200/80 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform mb-4">
                  <card.icon className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading mb-2 group-hover:text-teal-800 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES SECTION — 12 Module Cards
          ================================================================ */}
      <section id="features" aria-label="Platform features" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Platform Capabilities"
            title="Complete Digital Health Ecosystem"
            subtitle="23+ modules covering every aspect of personal health management — from daily medication tracking to AI-powered emergency response."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {memoizedFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="gradient-border-card p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                      <feat.icon className="w-5.5 h-5.5 stroke-[2.2]" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 font-heading mb-1.5 group-hover:text-teal-800 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <Link
                  to="/auth/register"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 hover:text-teal-900 pt-3 border-t border-slate-200/60 transition-colors"
                  aria-label={`Explore ${feat.title}`}
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS — 4-Step Process
          ================================================================ */}
      <section id="how-it-works" aria-label="How it works" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Simple Patient Journey"
            title="How HealthSphere Works"
            subtitle="A seamless 4-step workflow that transforms complex health management into intuitive digital care."
          />

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-blue-300" aria-hidden="true" />

            {howItWorksSteps.map((stepItem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className="relative p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-sm group hover:border-teal-300 hover:shadow-md transition-all text-center"
              >
                {/* Step Number Circle */}
                <div className="mx-auto w-14 h-14 rounded-full bg-teal-700 flex items-center justify-center text-white font-extrabold text-lg font-heading shadow-md mb-5 group-hover:scale-110 group-hover:shadow-teal-glow transition-all relative z-10">
                  {stepItem.step}
                </div>

                <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
                  <stepItem.icon className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                </div>

                <h4 className="text-lg font-bold text-slate-900 font-heading mb-2">{stepItem.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{stepItem.description}</p>

                {/* Mobile arrow between steps */}
                {idx < howItWorksSteps.length - 1 && (
                  <div className="lg:hidden flex justify-center pt-4" aria-hidden="true">
                    <ChevronDown className="w-5 h-5 text-teal-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY CHOOSE HEALTHSPHERE — Comparison Table
          ================================================================ */}
      <section id="comparison" aria-label="Why choose HealthSphere" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Why Choose Us"
            title="HealthSphere vs. Traditional Health Management"
            subtitle="See how HealthSphere streamlines every aspect of personal healthcare."
          />

          <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider py-4 px-6" role="row">
              <div className="col-span-5 sm:col-span-4" role="columnheader">Capability</div>
              <div className="col-span-7 sm:col-span-4 text-slate-400" role="columnheader">Traditional</div>
              <div className="hidden sm:block sm:col-span-4 text-teal-400" role="columnheader">HealthSphere</div>
            </div>

            <div className="divide-y divide-slate-100" role="rowgroup">
              {memoizedComparisons.map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="grid grid-cols-12 py-4 px-6 items-center text-xs sm:text-sm font-medium"
                  role="row"
                >
                  <div className="col-span-5 sm:col-span-4 font-bold text-slate-900 font-heading" role="cell">
                    {row.feature}
                  </div>
                  <div className="col-span-7 sm:col-span-4 text-slate-500 flex items-center gap-1.5" role="cell">
                    <X className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
                    <span>{row.traditional}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-4 mt-2 sm:mt-0 text-teal-800 font-bold flex items-center gap-1.5 bg-teal-50 sm:bg-transparent p-2 sm:p-0 rounded-lg" role="cell">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                    <span>{row.healthsphere}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          STATISTICS — Animated Counters
          ================================================================ */}
      <section id="statistics" aria-label="Platform statistics" className="py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="By The Numbers"
            title="Built for Scale & Reliability"
            subtitle="Production-grade engineering powering every module of HealthSphere."
          />

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {statsCounters.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <StatCounter target={stat.target} suffix={stat.suffix} label={stat.label} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS — Demo Frontend Cards
          ================================================================ */}
      {/* NOTE: These are demo frontend-only testimonials for UI demonstration purposes */}
      <section id="testimonials" aria-label="User testimonials" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Clinical Trust & Feedback"
            title="Trusted by Doctors & Patients Alike"
            subtitle="Hear from healthcare professionals and patients who rely on HealthSphere."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {memoizedTestimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                    "{t.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  {/* Avatar Initials */}
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 font-heading">{t.name}</h5>
                    <p className="text-[11px] text-slate-500 font-normal">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ ACCORDION
          ================================================================ */}
      <section id="faq" aria-label="Frequently asked questions" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Frequently Asked Questions"
            title="Got Questions? We Have Answers."
            subtitle="Learn more about HealthSphere's capabilities, privacy safeguards, and emergency features."
          />

          <div className="mt-12 space-y-4" role="list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-all"
                  role="listitem"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base font-heading hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-t-2xl"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-700' : ''}`} aria-hidden="true" />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-question-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 text-sm text-slate-600 font-normal leading-relaxed border-t border-slate-200/40 pt-3"
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

      {/* ================================================================
          CALL TO ACTION
          ================================================================ */}
      <section id="cta" aria-label="Call to action" className="py-20 bg-gradient-to-r from-teal-800 via-teal-700 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-teal-100 border border-white/20 inline-block">
              Take Control of Your Health Today
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight">
              Start Managing Your Health Smarter
            </h2>

            <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto font-normal leading-relaxed">
              Create your free HealthSphere account and access AI health insights, digital records, medicine reminders, and 24/7 emergency support.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleNavigate('/dashboard')}
                className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-white text-teal-900 hover:bg-slate-100 rounded-xl shadow-lg transition-all"
                aria-label="Launch HealthSphere Dashboard"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                onClick={handleNavigate('/about')}
                variant="outline"
                className="w-full sm:w-auto h-13 px-8 text-base font-semibold border-white/40 text-white rounded-xl
                !bg-transparent hover:!bg-transparent hover:!text-white hover:!border-white/40 focus:!bg-transparent active:!bg-transparent"
                aria-label="Learn more about HealthSphere"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
