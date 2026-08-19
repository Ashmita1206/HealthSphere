import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | null;
  alert?: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  badge,
  alert,
  collapsed,
  onNavigate,
}: SidebarNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;
  const prefersReducedMotion = useReducedMotion();

  const textVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.25,
        ease: "easeOut",
        delay: prefersReducedMotion ? 0 : 0.1,
      },
    },
    collapsed: {
      opacity: 0,
      x: -6,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.15,
        ease: "easeOut",
      },
    },
  };

  const linkContent = (
    <Link
      to={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl text-[13px] font-medium transition-colors duration-150 relative group min-h-[46px]",
        collapsed ? "justify-center px-0 mx-1" : "px-3 mx-2",
        isActive
          ? "text-[#0F766E] bg-[#F0FDFA] font-semibold"
          : "text-[#475569] hover:bg-[#FAF9F6] hover:text-[#0F766E]"
      )}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
    >
      {/* Active indicator — right edge, slides between routes */}
      {isActive && (
        <motion.div
          layoutId="active-sidebar-indicator"
          className="absolute right-0 top-2 bottom-2 w-[2.5px] rounded-l-full bg-[#0F766E]"
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : { type: "spring", stiffness: 350, damping: 30 }
          }
        />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          "w-[18px] h-[18px] shrink-0 transition-all duration-150",
          isActive
            ? "text-[#0F766E]"
            : "text-[#64748B] group-hover:text-[#0F766E]",
          !collapsed && "group-hover:translate-x-[1px]"
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />

      {/* Label + Badge — animated */}
      {!collapsed && (
        <motion.div
          variants={textVariants}
          initial={false}
          animate="expanded"
          className="flex items-center justify-between flex-1 min-w-0 overflow-hidden"
        >
          <span className="truncate">{label}</span>
          {badge && (
            <span
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ml-2",
                badge === "AI"
                  ? "bg-[#E6F4F1] text-[#047857]"
                  : "bg-[#F3F4F1] text-[#475569]"
              )}
            >
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </Link>
  );

  // Wrap in tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="bg-[#0F172A] text-white text-xs font-medium px-3 py-1.5 rounded-lg border-0 shadow-lg"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
