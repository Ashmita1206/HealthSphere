import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Eye, EyeOff, Activity, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Sparkles, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate(from, { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Column: Enterprise Healthcare Feature & Trust Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-md">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-extrabold font-heading tracking-tight">
            HealthSphere <span className="text-teal-400">AI</span>
          </span>
        </div>

        {/* Middle Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 space-y-6 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-800/80 border border-teal-700/80 text-xs font-bold text-teal-200">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Secure Patient Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight leading-tight">
            Clinical AI & Encrypted Patient Intelligence
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Sign in to manage your medical history, review automated lab reports, track daily medication schedules, and consult your 24/7 AI health assistant.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "HIPAA & SOC-2 Compliant Data Storage",
              "Instant AI Symptom & Report Triage",
              "24/7 One-Touch Emergency Hospital Dispatch"
            ].map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-teal-100 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer Security Badge */}
        <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-teal-800/80 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span>Protected by 256-bit Bank-Grade Encryption</span>
        </div>

      </div>

      {/* Right Column: Glass Card Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white border border-slate-200/80 shadow-xl rounded-3xl p-8 sm:p-10 space-y-8"
        >
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex lg:hidden items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold">
                <Activity className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 font-heading">HealthSphere AI</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Enter your credentials to access your patient dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`pl-10 h-11 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 ${
                    errors.email ? "border-rose-500 focus:ring-rose-500/20" : ""
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`pl-10 pr-10 h-11 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 ${
                    errors.password ? "border-rose-500 focus:ring-rose-500/20" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account?{" "}
              <Link to="/auth/register" className="font-bold text-teal-700 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

