import { Link } from "react-router-dom";
import { 
  Activity, Mail, Phone, MapPin, ShieldCheck, Lock, Heart, Github, Twitter, Linkedin, Facebook
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-md">
                <Activity className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
              </div>
              <span className="text-2xl font-extrabold text-white font-heading tracking-tight">
                HealthSphere <span className="text-teal-400">AI</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Enterprise clinical intelligence and personalized healthcare platform. Streamlining patient care with AI diagnosis support, encrypted records, smart reminders, and 24/7 emergency dispatch.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/Ashmita1206/HealthSphere"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-700 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-700 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-700 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-teal-700 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Home Platform
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-teal-400 transition-colors">
                  About HealthSphere
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/auth/login" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Patient Portal Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
              Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400">Dashboard</li>
              <li className="text-slate-400">Medicines & Reminders</li>
              <li className="text-slate-400">Emergency SOS</li>
              <li className="text-slate-400">AI Health Assistant</li>
              <li className="text-slate-400">Blood Donation</li>
              <li className="text-slate-400">Health Timeline</li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400">AI Symptom Diagnostic</li>
              <li className="text-slate-400">Medical Reports OCR</li>
              <li className="text-slate-400">Medication Reminders</li>
              <li className="text-slate-400">GPS Emergency Dispatch</li>
              <li className="text-slate-400">Blood & Organ Registry</li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading mb-4">
              Compliance & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>HIPAA & SOC2 Certified</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                End-to-end encrypted medical data storage.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} HealthSphere AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-slate-400 font-mono text-[11px] font-semibold">
              v1.0.0
            </span>
            <span className="text-slate-400">Powered by Advanced AI for Better Clinical Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
