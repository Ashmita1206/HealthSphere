import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 pt-14 pb-10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3.5">
            <BrandLogo isDark variant="full" size="md" to="/" />
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Unified personal health operating system connecting diagnostic lab reports, daily telemetry, medication schedules, and evidence-based clinical AI guidance.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" aria-hidden="true" />
                <span>256-Bit Encrypted & HIPAA Compliant</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-3 text-[#2DD4BF]">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/ai-chat" className="text-slate-400 hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link to="/reports" className="text-slate-400 hover:text-white transition-colors">Medical Reports</Link></li>
              <li><Link to="/medicines" className="text-slate-400 hover:text-white transition-colors">Medicines</Link></li>
              <li><Link to="/appointments" className="text-slate-400 hover:text-white transition-colors">Appointments</Link></li>
            </ul>
          </div>

          {/* Intelligence & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-3 text-[#2DD4BF]">
              Intelligence & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/health-score" className="text-slate-400 hover:text-white transition-colors">AI Health Score</Link></li>
              <li><Link to="/timeline" className="text-slate-400 hover:text-white transition-colors">Health Timeline</Link></li>
              <li><Link to="/emergency" className="text-slate-400 hover:text-white transition-colors">Emergency 24/7</Link></li>
              <li><Link to="/blood-donation" className="text-slate-400 hover:text-white transition-colors">Blood & Organ Registry</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Help & Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading mb-3 text-[#2DD4BF]">
              Legal & Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors">Platform Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {currentYear} HealthSphere. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px]">Personal Health Operating System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
