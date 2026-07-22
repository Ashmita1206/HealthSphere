import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Enquiry Transmitted", description: "Our clinical support team will respond within 2 hours." });
  };

  return (
    <div className="py-12 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
            24/7 Clinical Support
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 font-heading">Get in Touch with HealthSphere</h1>
          <p className="text-sm text-slate-500 font-normal max-w-md mx-auto">
            Have questions about clinical AI triage, hospital network integration, or user security?
          </p>
        </div>

        {/* Contact Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: "Direct Support Email", value: "support@healthsphere.com", desc: "Response under 2 hrs" },
            { icon: Phone, label: "Toll-Free Helpline", value: "+1 (800) 432-5847", desc: "Mon-Sun 24/7 Availability" },
            { icon: MapPin, label: "Headquarters", value: "Healthcare City, HC 12345", desc: "Clinical Innovation Hub" },
          ].map((item) => (
            <Card key={item.label} className="rounded-2xl border border-slate-200/80 shadow-sm bg-white hover:border-teal-200 transition-all">
              <CardContent className="p-5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  <item.icon className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-extrabold text-slate-900 font-heading mt-0.5">{item.value}</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="arthur@clinic.org"
                  className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">How Can We Assist You? *</Label>
              <Textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your inquiry, clinical partnership request, or technical feedback..."
                className="text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all">
              <Send className="w-4 h-4 mr-2" />
              <span>{submitted ? "Message Sent!" : "Transmit Inquiry"}</span>
            </Button>
          </form>
        </Card>

      </motion.div>
    </div>
  );
}

