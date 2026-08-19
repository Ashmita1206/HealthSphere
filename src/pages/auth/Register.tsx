import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Eye, EyeOff, Activity, Mail, Lock, User, ArrowRight, AlertCircle, Check, ShieldCheck, Sparkles, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password strength indicators
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
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

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to HealthSphere. You're now logged in.",
      });
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const passwordStrength = getPasswordStrength();
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-rose-500";
    if (passwordStrength <= 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Column: Enterprise Branding & Trust */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Header */}
        <div className="relative z-10">
          <BrandLogo isDark variant="full" size="xl" to="/" />
        </div>

        {/* Middle Copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 space-y-6 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-800/80 border border-teal-700/80 text-xs font-bold text-teal-200">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Join 50,000+ Active Patients</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight leading-tight">
            Start Your Intelligent Health Journey Today
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Create your account to unlock AI symptom triage, digital report OCR parsing, medication reminders, and 24/7 emergency dispatch.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "End-to-End Encrypted Health Records",
              "Personalized Medication Schedule Alerts",
              "Instant GPS Trauma Center SOS Network"
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
          <span>Strict HIPAA & SOC-2 Compliant Platform</span>
        </div>

      </div>

      {/* Right Column: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white border border-slate-200/80 shadow-xl rounded-3xl p-8 sm:p-10 space-y-7"
        >
          <div className="text-center space-y-2">
            <div className="lg:hidden flex justify-center mb-2">
              <BrandLogo variant="full" size="lg" to="/" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Join HealthSphere AI for smarter, personalized care
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                  className={`pl-10 h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 ${
                    errors.fullName ? "border-rose-500 focus:ring-rose-500/20" : ""
                  }`}
                  required
                />
              </div>
              {errors.fullName && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
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
                  className={`pl-10 h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 ${
                    errors.email ? "border-rose-500 focus:ring-rose-500/20" : ""
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </Label>
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
                  className={`pl-10 pr-10 h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 ${
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

              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex h-1.5 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < passwordStrength ? getStrengthColor() : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500">
                    Strength:{" "}
                    {passwordStrength <= 2
                      ? "Weak"
                      : passwordStrength <= 3
                      ? "Fair"
                      : "Strong"}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`pl-10 h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 ${
                    errors.confirmPassword ? "border-rose-500 focus:ring-rose-500/20" : ""
                  }`}
                  required
                />
              </div>
              {confirmPassword && password === confirmPassword && (
                <p className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                  <Check className="h-3.5 w-3.5" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-bold text-teal-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

