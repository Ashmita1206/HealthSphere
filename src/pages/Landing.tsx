import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Bot,
  Shield,
  Pill,
  Calendar,
  FileText,
  AlertTriangle,
  Droplets,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Bot,
    title: "AI Health Assistant",
    description: "Get instant health guidance with our intelligent AI assistant",
  },
  {
    icon: Pill,
    title: "Medicine Management",
    description: "Track medications with smart reminders and adherence monitoring",
  },
  {
    icon: FileText,
    title: "Digital Health Records",
    description: "Securely store and access your medical reports anytime",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Schedule and manage all your healthcare appointments",
  },
  {
    icon: AlertTriangle,
    title: "Emergency SOS",
    description: "One-click emergency alerts with location sharing",
  },
  {
    icon: Droplets,
    title: "Blood & Organ Network",
    description: "Connect with donors and find matches quickly",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "AI Support" },
  { value: "256-bit", label: "Encryption" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Shield className="h-4 w-4" />
                Enterprise-Grade Healthcare Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Your Complete{" "}
              <span className="text-gradient">Health Management</span>{" "}
              Solution
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground lg:text-xl"
            >
              AI-powered health assistant, secure medical records, medication tracking, 
              appointment management, and emergency services — all in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                className="btn-healthcare h-14 px-8 text-lg"
                onClick={() => navigate("/auth/register")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg"
                onClick={() => navigate("/auth/login")}
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Everything You Need for Better Health
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive tools designed to help you take control of your health journey
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-healthcare p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-muted/50 py-20 lg:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold lg:text-4xl">
                Enterprise-Grade Security
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Your health data deserves the highest level of protection. We use 
                industry-leading security measures to keep your information safe.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "AES-256-GCM encryption for all data",
                  "HIPAA-compliant infrastructure",
                  "Secure authentication with HttpOnly cookies",
                  "Regular security audits and penetration testing",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
                <div className="relative flex h-64 w-64 items-center justify-center rounded-3xl bg-gradient-primary lg:h-80 lg:w-80">
                  <Shield className="h-24 w-24 text-primary-foreground lg:h-32 lg:w-32" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl rounded-3xl bg-gradient-primary p-8 text-center text-primary-foreground lg:p-12"
          >
            <h2 className="text-3xl font-bold lg:text-4xl">
              Start Your Health Journey Today
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Join thousands of users who trust HealthSphere for their healthcare needs.
            </p>
            <Button
              size="lg"
              className="mt-8 h-14 bg-white px-8 text-lg text-primary hover:bg-white/90"
              onClick={() => navigate("/auth/register")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
