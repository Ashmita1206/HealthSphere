import { motion } from "framer-motion";
import { Heart, Users, Award, Clock, ShieldCheck, Activity, Sparkles, Building2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function AboutPage() {
  return (
    <div className="space-y-16 py-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/80 shadow-xs">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>The Next Generation of AI Triage</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight leading-tight">
          Empowering Clinical Excellence Through Intelligent Technology
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          HealthSphere AI bridges the gap between patient home monitoring, immediate emergency trauma dispatch, and clinical decision support. Built with enterprise security, real-time AI triage, and HIPAA-compliant data vaults.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Patients" value="50,000+" trend="Verified Clinical Accounts" trendDirection="up" icon={Users} />
        <StatCard title="Triage Consultations" value="1.2M+" trend="AI Interactions Analyzed" trendDirection="up" icon={Activity} />
        <StatCard title="Emergency Response" value="< 3 mins" trend="Average SOS Dispatch Time" trendDirection="neutral" icon={Clock} />
        <StatCard title="Compliance Score" value="100%" trend="HIPAA & GDPR Encrypted" trendDirection="up" icon={ShieldCheck} />
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-8">
        <SectionHeader
          title="Built on Four Pillars of Clinical Trust"
          subtitle="How HealthSphere AI maintains accuracy, data integrity, and rapid emergency intervention."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[
            { icon: Heart, title: "Patient-Centered", desc: "Every metric, reminder, and recommendation is designed to optimize patient health outcomes." },
            { icon: Building2, title: "Hospital Integration", desc: "Seamless routing and instant data sharing with nearby emergency trauma centers." },
            { icon: Award, title: "HIPAA Compliant", desc: "AES-256 bit end-to-end data encryption for lab records, vitals, and conversation logs." },
            { icon: Clock, title: "24/7 AI Availability", desc: "Round-the-clock symptom evaluation and prescription reminder notifications." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:bg-teal-50/50 hover:border-teal-200 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-md">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">{item.title}</h3>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}

