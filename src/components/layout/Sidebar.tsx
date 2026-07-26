import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Pill,
  FileText,
  Calendar,
  Droplets,
  Bell,
  AlertTriangle,
  Settings,
  LogOut,
  X,
  Activity,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Sparkles,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", badge: null },
  { icon: MessageSquareText, label: "AI Consultation", href: "/ai-chat", badge: "AI" },
  { icon: FileText, label: "Medical Reports OCR", href: "/medical-reports", badge: "AI" },
  { icon: Eye, label: "AI Vision", href: "/ai-vision", badge: "New" },
  { icon: Heart, label: "AI Health Score", href: "/ai-health-score", badge: "Live" },
  { icon: Pill, label: "Medicines", href: "/medicines", badge: null },
  { icon: Calendar, label: "Appointments", href: "/appointments", badge: null },
  { icon: Droplets, label: "Blood & Organ", href: "/blood-organ", badge: null },
  { icon: Bell, label: "Reminders", href: "/reminders", badge: "2" },
  { icon: AlertTriangle, label: "Emergency", href: "/emergency", badge: "24/7", alert: true },
  { icon: User, label: "My Profile", href: "/profile", badge: null },
  { icon: Settings, label: "Settings", href: "/settings", badge: null },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between py-4">
      <div>
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-900 font-heading">HealthSphere AI</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 pt-2">
          {!collapsed && !isMobile && (
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Clinical Navigation
            </p>
          )}

          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.href && !item.isChatTrigger;
              return (
                <Link
                  key={idx}
                  to={item.href}
                  onClick={() => {
                    onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                    isActive
                      ? "bg-teal-700 text-white shadow-sm font-bold"
                      : item.alert
                      ? "text-rose-700 hover:bg-rose-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-white"
                        : item.alert
                        ? "text-rose-600 animate-pulse"
                        : "text-slate-500 group-hover:text-teal-700"
                    )}
                  />
                  
                  {(!collapsed || isMobile) && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            isActive
                              ? "bg-white/20 text-white"
                              : item.alert
                              ? "bg-rose-100 text-rose-700"
                              : item.badge === "AI"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-200 text-slate-700"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / User Trust Badge & Sign out */}
      <div className="px-3 space-y-3">
        {(!collapsed || isMobile) && (
          <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-teal-900">HIPAA Compliant</p>
              <p className="text-[10px] text-teal-700">256-bit Encrypted Health Data</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "w-full text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl justify-start gap-3",
            collapsed && !isMobile && "justify-center px-0"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 pt-16 z-30 bg-white border-r border-slate-200/80 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors z-40"
          aria-label="Collapse sidebar"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

