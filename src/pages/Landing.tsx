import { useState } from 'react';
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader } from '@/components/ui/SectionHeader';

const stats = [
  { value: '50K+', label: 'Health Assessments', desc: 'Analyzed with AI' },
  { value: '98%', label: 'Prediction Accuracy', desc: 'Clinical validation' },
  { value: '24/7', label: 'AI Health Assistant', desc: 'Instant triage' },
  { value: '100+', label: 'Hospitals Supported', desc: 'Emergency network' },
];

const trustedBadges = [
  { icon: ShieldCheck, title: 'HIPAA Compliant', subtitle: 'US Healthcare Standard' },
  { icon: Lock, title: '256-Bit AES Encryption', subtitle: 'Zero-knowledge records' },
  { icon: Brain, title: 'Clinical AI Models', subtitle: 'Trained on medical journals' },
  { icon: Cloud, title: 'Secure Health Cloud', subtitle: 'SOC-2 Type II Certified' },
];

const mainFeatures = [
  {
    icon: Bot,
    title: 'AI Health Chatbot',
    description: 'Instant, clinical-grade symptom analysis and triage advice available 24/7 powered by generative medical AI.',
    badge: 'Interactive AI',
    linkTo: '/auth/register'
  },
  {
    icon: Brain,
    title: 'Disease Risk Prediction',
    description: 'Early risk screening for chronic conditions using historical vitals and lifestyle biomarker intelligence.',
    badge: 'Predictive Care',
    linkTo: '/auth/register'
  },
  {
    icon: Pill,
    title: 'Medicine Reminders',
    description: 'Smart dosage scheduling with push notifications, drug interaction alerts, and adherence tracking.',
    badge: 'Smart Dosage',
    linkTo: '/auth/register'
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Locator & SOS',
    description: 'One-touch GPS emergency broadcast to nearby verified hospitals, ambulances, and emergency contacts.',
    badge: 'Instant Dispatch',
    linkTo: '/auth/register'
  },
  {
    icon: FileText,
    title: 'Medical Reports Analysis',
    description: 'Automatic OCR extraction and plain-language summaries of lab results, X-rays, and prescriptions.',
    badge: 'OCR & Parsing',
    linkTo: '/auth/register'
  },
  {
    icon: Activity,
    title: 'Health Dashboard',
    description: 'Centralized patient dashboard summarizing vitals, heart rate variability, upcoming doses, and health score.',
    badge: 'Real-Time Insights',
    linkTo: '/auth/register'
  },
];

const workflowSteps = [
  { step: '01', title: 'Register Account', desc: 'Create your secure, encrypted patient profile in under 60 seconds.' },
  { step: '02', title: 'Complete Profile', desc: 'Add medical history, allergies, chronic conditions, and emergency contacts.' },
  { step: '03', title: 'Upload Reports', desc: 'Drag-and-drop lab PDFs or prescription images for instant parsing.' },
  { step: '04', title: 'Talk to AI', desc: 'Describe symptoms or ask clinical questions to get instant evidence-based guidance.' },
  { step: '05', title: 'Track Health', desc: 'Monitor vitals trends, medication intake, and preventive care reminders.' },
  { step: '06', title: 'Get Recommendations', desc: 'Receive tailored clinical advice and export reports directly for your doctor.' },
];

const comparisons = [
  { feature: 'Symptom Triage Speed', traditional: '2 - 4 Hours in Waiting Room', healthsphere: 'Instant (Under 5 Seconds)' },
  { feature: 'Medical Record Parsing', traditional: 'Manual Physician Reading', healthsphere: 'Instant AI OCR Summaries' },
  { feature: 'Medication Adherence', traditional: 'Paper Timetables (Easy to Miss)', healthsphere: 'Smart Timeline & Alerts' },
  { feature: 'Emergency Hospital Dispatch', traditional: 'Manual Phone Calling', healthsphere: 'GPS Automated Hospital Locator' },
  { feature: 'Data Privacy & Encryption', traditional: 'Paper Folders & Static PDFs', healthsphere: '256-Bit HIPAA Encrypted' },
];

const testimonials = [
  {
    name: 'Dr. Rajesh Sharma, MD',
    role: 'Senior Cardiologist, Metro Heart Institute',
    comment: 'HealthSphere AI has fundamentally changed how my patients present their medical history. The AI report summaries save 15 minutes per consultation.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Chronic Care Patient',
    comment: 'Managing my daily insulin and blood pressure readings used to be stressful. HealthSphere’s medication reminders and AI chat give me complete peace of mind.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Elena Rostova',
    role: 'Chief Medical Officer, Horizon Health',
    comment: 'The enterprise-level security combined with intuitive UI makes HealthSphere AI the gold standard for modern patient engagement platforms.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  }
];

const faqs = [
  {
    question: 'How accurate is the HealthSphere AI symptom assistant?',
    answer: 'HealthSphere AI utilizes validated clinical models trained on peer-reviewed medical literature. It provides high-accuracy symptom triage and recommendations, designed to complement professional clinical care.'
  },
  {
    question: 'Is my medical data kept private and secure?',
    answer: 'Yes. All personal health data is encrypted using AES-256 bit encryption both in transit and at rest. We adhere strictly to HIPAA guidelines and never sell patient data.'
  },
  {
    question: 'Can I upload paper prescriptions and PDF lab reports?',
    answer: 'Absolutenly. Our automated OCR parser reads handwritten or digital lab reports, extracts critical biomarkers (like HbA1c, Cholesterol, CBC), and explains them in simple language.'
  },
  {
    question: 'How does the Emergency Locator work in a medical crisis?',
    answer: 'With one click, HealthSphere detects your precise GPS coordinates, lists nearest trauma hospitals, and lets you dial emergency services or alert your designated emergency contacts immediately.'
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="bg-slate-50 overflow-hidden">
      
      {/* HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-teal-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        
        {/* Soft Healthcare Backdrop Ambient Lights */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-teal-200/30 via-emerald-200/20 to-blue-200/30 blur-3xl pointer-events-none -z-10" />

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
                <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                <span>AI-POWERED HEALTHCARE PLATFORM FOR SMARTER PATIENT CARE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-heading">
                Enterprise AI Healthcare for <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-blue-600 bg-clip-text text-transparent">Smarter Patient Care</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Personalized healthcare powered by artificial intelligence, secure records, symptom analysis, medicine reminders and emergency assistance—all in one platform.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  onClick={() => navigate('/auth/register')}
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <a
                  href="#features"
                  className="w-full sm:w-auto h-13 px-8 text-base font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl transition-all flex items-center justify-center"
                >
                  Explore Features
                </a>
              </div>

              {/* Trust Callout */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>256-bit Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </motion.div>

            {/* Right Graphic / Interactive UI Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border frame */}
                <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-2xl space-y-4">
                  
                  {/* Mock Clinical Header */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-900 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" />
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

                  {/* Mock Chat Conversation bubble */}
                  <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-800">
                      <p className="font-semibold text-teal-800 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> Patient Symptoms Query
                      </p>
                      <p className="text-slate-600">"I have a mild fever (100.2°F), dry cough, and fatigue for 2 days. What should I do?"</p>
                    </div>

                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/70 text-slate-800">
                      <p className="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" /> AI Clinical Assessment
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
            </motion.div>

          </div>
        </div>
      </section>

      {/* ANIMATED STATISTICS SECTION */}
      <section className="py-12 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60"
              >
                <h3 className="text-3xl lg:text-4xl font-extrabold text-teal-700 font-heading tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-sm font-bold text-slate-900 mt-1">{stat.label}</p>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED & SECURITY SECTION (HIPAA & CLINICAL STANDARDS) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Institutional Trust"
            title="Designed with Clinical Security & Privacy at the Core"
            subtitle="HealthSphere AI adheres to strict international medical data protection standards to keep patient records safe."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustedBadges.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <item.icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-normal mt-1">{item.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Platform Capabilities"
            title="Complete Digital Health Ecosystem"
            subtitle="Everything you need to manage your personal health, consult artificial intelligence, and access emergency medical services."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="p-7 rounded-2xl bg-slate-50/60 border border-slate-200/80 shadow-sm hover:shadow-card-hover hover:bg-white transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                      <feat.icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2 group-hover:text-teal-800 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <Link
                  to={feat.linkTo}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 hover:text-teal-900 pt-4 border-t border-slate-200/60 transition-colors"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Simplified Patient Journey"
            title="How HealthSphere AI Works"
            subtitle="A seamless 6-step workflow that transforms complex medical management into intuitive digital care."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((stepItem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative group hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-extrabold text-teal-700/30 font-heading group-hover:text-teal-700 transition-colors">
                    {stepItem.step}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                    ✓
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-heading mb-1.5">{stepItem.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{stepItem.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE HEALTHSPHERE (COMPARISON CARDS) */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Why Choose Us"
            title="Traditional Healthcare vs. HealthSphere AI"
            subtitle="See how HealthSphere AI streamlines patient care and clinical intelligence."
          />

          <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="grid grid-cols-12 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider py-4 px-6">
              <div className="col-span-5 sm:col-span-4">Capability</div>
              <div className="col-span-7 sm:col-span-4 text-slate-400">Traditional Care</div>
              <div className="hidden sm:block sm:col-span-4 text-teal-400">HealthSphere AI</div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {comparisons.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 py-4 px-6 items-center text-xs sm:text-sm font-medium">
                  <div className="col-span-5 sm:col-span-4 font-bold text-slate-900 font-heading">
                    {row.feature}
                  </div>
                  <div className="col-span-7 sm:col-span-4 text-slate-500 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{row.traditional}</span>
                  </div>
                  <div className="col-span-12 sm:col-span-4 mt-2 sm:mt-0 text-teal-800 font-bold flex items-center gap-1.5 bg-teal-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{row.healthsphere}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL SECTION */}
      <section id="testimonials" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Clinical Trust & Feedback"
            title="Trusted by Doctors & Patients Alike"
            subtitle="Read real reviews from practicing physicians and active users who rely on HealthSphere."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                    "{t.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-teal-200"
                  />
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

      {/* FAQ ACCORDION SECTION */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Frequently Asked Questions"
            title="Got Questions? We Have Answers."
            subtitle="Learn more about our AI clinical engine, privacy safeguards, and emergency features."
          />

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base font-heading hover:text-teal-700 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-teal-700' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
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

      {/* LARGE CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-r from-teal-800 via-teal-700 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-teal-100 border border-white/20 inline-block">
            Start Caring For Your Health Today
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight">
            Ready to Experience the Future of Smart Healthcare?
          </h2>

          <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Create your free HealthSphere AI account now. Access AI symptom analysis, digital health records, and 24/7 emergency support.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/auth/register')}
              className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-white text-teal-900 hover:bg-slate-100 rounded-xl shadow-lg transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate('/auth/login')}
              variant="outline"
              className="w-full sm:w-auto h-13 px-8 text-base font-semibold border-white/40 text-white hover:bg-white/10 rounded-xl transition-all"
            >
              Sign In to Patient Portal
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

