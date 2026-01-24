import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-center">Contact Us</h1>
        <p className="mt-4 text-center text-muted-foreground">Get in touch with our support team</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Mail, label: "Email", value: "support@healthsphere.com" },
            { icon: Phone, label: "Phone", value: "1-800-HEALTH" },
            { icon: MapPin, label: "Address", value: "Healthcare City, HC 12345" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <form className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input placeholder="Your name" className="mt-1" /></div>
            <div><Label>Email</Label><Input type="email" placeholder="you@example.com" className="mt-1" /></div>
          </div>
          <div><Label>Message</Label><Textarea placeholder="How can we help?" className="mt-1" rows={5} /></div>
          <Button className="w-full btn-healthcare">Send Message</Button>
        </form>
      </motion.div>
    </div>
  );
}
