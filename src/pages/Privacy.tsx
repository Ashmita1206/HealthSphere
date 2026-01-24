import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="lead">Your privacy is important to us. This policy explains how HealthSphere collects, uses, and protects your information.</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly, including name, email, health records, and usage data to improve our services.</p>
        <h2>How We Use Your Information</h2>
        <p>Your data is used to provide personalized health insights, medication reminders, and emergency services. We never sell your personal information.</p>
        <h2>Data Security</h2>
        <p>We use AES-256-GCM encryption, secure authentication, and HIPAA-compliant infrastructure to protect your health data.</p>
        <h2>Your Rights</h2>
        <p>You can access, update, or delete your personal information at any time through your account settings.</p>
        <h2>Contact</h2>
        <p>Questions? Email us at privacy@healthsphere.com</p>
      </motion.div>
    </div>
  );
}
