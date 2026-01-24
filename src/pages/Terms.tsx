import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="lead">By using HealthSphere, you agree to these terms. Please read them carefully.</p>
        <h2>Acceptance of Terms</h2>
        <p>By accessing or using HealthSphere, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
        <h2>Medical Disclaimer</h2>
        <p>HealthSphere provides health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider.</p>
        <h2>User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
        <h2>Limitation of Liability</h2>
        <p>HealthSphere is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>
        <h2>Changes to Terms</h2>
        <p>We may update these terms. Continued use after changes constitutes acceptance of the new terms.</p>
      </motion.div>
    </div>
  );
}
