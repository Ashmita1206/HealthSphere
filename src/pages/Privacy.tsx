import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PrivacyPage() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header */}
      <PageHeader
        title="Privacy Policy & HIPAA Data Protection"
        description="How HealthSphere AI collects, encrypts, and safeguards your clinical health records."
        breadcrumbs={[{ label: "Privacy Policy" }]}
        badge="AES-256 Encrypted"
      />

      <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-900">
          <ShieldCheck className="w-6 h-6 text-teal-700 shrink-0" />
          <p className="text-xs leading-relaxed font-semibold">
            Your patient health privacy is our highest priority. HealthSphere AI complies strictly with HIPAA and GDPR regulations. Your data is encrypted end-to-end and never sold to third parties.
          </p>
        </div>

        <div className="space-y-6 text-xs text-slate-600 leading-relaxed font-normal">
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-700" />
              1. Information We Collect
            </h3>
            <p>
              We collect information you explicitly provide during account registration, profile setup, medical report uploads, and AI chat sessions. This includes legal demographics, contact phone numbers, vital signs, medication logs, and lab PDF documents.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              2. How We Use Your Information
            </h3>
            <p>
              Your data is exclusively utilized to render real-time AI triage feedback, generate adherence reminders, pinpoint nearby emergency trauma centers during SOS broadcasts, and calculate personalized Health Scores.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700" />
              3. Data Security & AES-256 Encryption
            </h3>
            <p>
              All stored records are encrypted at rest using AES-256-GCM algorithms. Communication between your browser and our API servers is protected by TLS 1.3 encryption.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              4. Patient Rights & Data Erasure
            </h3>
            <p>
              You maintain total ownership of your medical records. You may request a complete export or immediate deletion of your clinical account at any time by contacting privacy@healthsphere.com.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}

