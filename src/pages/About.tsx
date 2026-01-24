import { motion } from "framer-motion";
import { Heart, Users, Award, Clock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold">About HealthSphere</h1>
        <p className="mt-4 text-lg text-muted-foreground">Enterprise-grade healthcare platform with AI-powered assistance</p>
      </motion.div>
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Heart, title: "Patient-First", desc: "Your health is our priority" },
          { icon: Users, title: "50K+ Users", desc: "Trusted by thousands" },
          { icon: Award, title: "HIPAA Ready", desc: "Enterprise security" },
          { icon: Clock, title: "24/7 Support", desc: "Always available" },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-healthcare p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
              <item.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
