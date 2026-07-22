import { motion } from "framer-motion";
import { AlertTriangle, FileText, Scale, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function TermsPage() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header */}
      <PageHeader
        title="Terms of Service & Clinical Disclaimer"
        description="Legal agreement governing the usage of HealthSphere AI clinical triage tools."
        breadcrumbs={[{ label: "Terms of Service" }]}
        badge="Legal Terms"
      />

      <Card className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold font-heading text-amber-950">Important Medical Disclaimer</h4>
            <p className="text-xs leading-relaxed font-normal">
              HealthSphere AI provides artificial intelligence symptom triage, risk level evaluations, and medication reminders for informational purposes only. It is NOT a substitute for professional clinical advice, emergency medical response, diagnosis, or treatment by a licensed physician. Always seek the advice of your doctor in acute medical situations.
            </p>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white p-6 sm:p-8 space-y-6">
        <div className="space-y-6 text-xs text-slate-600 leading-relaxed font-normal">
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-700" />
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing or creating an account on HealthSphere AI, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any portion of these terms, you must discontinue platform usage immediately.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              2. User Account Responsibilities
            </h3>
            <p>
              You are responsible for safeguarding your login credentials, password, and two-factor authentication tokens. You agree to immediately notify support of any unauthorized breach of your account.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              3. Limitation of Liability
            </h3>
            <p>
              HealthSphere AI and its clinical partners shall not be held liable for any indirect, incidental, or consequential damages resulting from reliance on AI recommendations or emergency location routing.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}

