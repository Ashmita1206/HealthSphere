import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Activity } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Pill,
  FileText,
  History,
  MessageSquareText,
  Bot,
  Eye,
  Heart,
  AlertTriangle,
  Droplets,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarCollapseButton } from "./SidebarCollapseButton";
import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarProfile } from "./SidebarProfile";
import { SidebarFooter } from "./SidebarFooter";
import { BrandLogo } from "@/components/brand/BrandLogo";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Navigation structure                                               */
/* ------------------------------------------------------------------ */

interface NavItemData {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | null;
  alert?: boolean;
}

interface NavGroupData {
  title: string;
  items: NavItemData[];
}

const navGroups: NavGroupData[] = [
  {
    title: "CARE",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Calendar, label: "Appointments", href: "/appointments" },
      { icon: Pill, label: "Medicines", href: "/medicines" },
      { icon: FileText, label: "Medical Reports", href: "/reports" },
      { icon: FileText, label: "Medical OCR", href: "/medical-reports", badge: "AI" },
      { icon: History, label: "Health Timeline", href: "/timeline" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { icon: MessageSquareText, label: "AI Assistant", href: "/ai-chat", badge: "AI" },
      { icon: Eye, label: "AI Vision", href: "/ai-vision" },
      { icon: Heart, label: "AI Health Score", href: "/ai-health-score" },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { icon: AlertTriangle, label: "Emergency 24/7", href: "/emergency", alert: true },
      { icon: Droplets, label: "Blood & Organ", href: "/blood-organ" },
      { icon: Bell, label: "Reminders", href: "/reminders", badge: "2" },
    ],
  },
  {
    title: "PERSONAL",
    items: [
      { icon: User, label: "My Profile", href: "/profile" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SIDEBAR_EXPANDED_WIDTH = 256; // w-64
const SIDEBAR_COLLAPSED_WIDTH = 72; // w-[72px]
const STORAGE_KEY = "healthsphere-sidebar-collapsed";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ isOpen, onClose, onCollapsedChange }: SidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const mobilePanelRef = useRef<HTMLElement>(null);

  // Persist collapsed state
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* noop */
      }
      onCollapsedChange?.(next);
      return next;
    });
  }, [onCollapsedChange]);

  // Notify parent of initial collapsed state on mount
  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------------------------------------------------------- */
  /*  Mobile drawer focus trap & keyboard handling                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = mobilePanelRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    panel?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  /* ---------------------------------------------------------------- */
  /*  Transition config                                                */
  /* ---------------------------------------------------------------- */

  const widthTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

  const drawerTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

  const backdropTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.25, ease: "easeOut" as const };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ============================================================ */}
      {/*  DESKTOP SIDEBAR                                              */}
      {/* ============================================================ */}
      <motion.aside
        aria-label="Primary navigation"
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-[#E5E7EB] overflow-hidden"
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
        transition={widthTransition}
      >
        {/* Brand */}
        <SidebarBrand collapsed={collapsed} />

        {/* Collapse Button */}
        <SidebarCollapseButton
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />

        {/* Navigation Groups — scrollable area */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5">
          {navGroups.map((group) => (
            <SidebarNavGroup
              key={group.title}
              title={group.title}
              items={group.items}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Profile */}
        <div className="border-t border-[#E5E7EB]">
          <div className="py-2">
            <SidebarProfile collapsed={collapsed} />
          </div>
        </div>

        {/* Footer */}
        <SidebarFooter collapsed={collapsed} onClose={onClose} />
      </motion.aside>

      {/* ============================================================ */}
      {/*  MOBILE DRAWER                                                */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              className="fixed inset-0 z-40 bg-[#0F172A]/50 lg:hidden"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              ref={mobilePanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              tabIndex={-1}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={drawerTransition}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-xl lg:hidden flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5E7EB] h-16 shrink-0">
                <BrandLogo variant="full" size="md" to="/dashboard" onClick={onClose} />
                <button
                  onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-[#64748B] hover:bg-[#FAF9F6] hover:text-[#0F766E] transition-colors duration-150 shrink-0"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation — always expanded on mobile */}
              <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5">
                {navGroups.map((group) => (
                  <SidebarNavGroup
                    key={group.title}
                    title={group.title}
                    items={group.items}
                    collapsed={false}
                    onNavigate={onClose}
                  />
                ))}
              </nav>

              {/* Profile */}
              <div className="border-t border-[#E5E7EB]">
                <div className="py-2">
                  <SidebarProfile collapsed={false} />
                </div>
              </div>

              {/* Footer */}
              <SidebarFooter collapsed={false} onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
