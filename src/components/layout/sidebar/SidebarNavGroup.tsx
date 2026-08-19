import { motion, useReducedMotion } from "framer-motion";
import { SidebarNavItem } from "./SidebarNavItem";
import type { LucideIcon } from "lucide-react";

interface NavItemData {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | null;
  alert?: boolean;
}

interface SidebarNavGroupProps {
  title: string;
  items: NavItemData[];
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavGroup({
  title,
  items,
  collapsed,
  onNavigate,
}: SidebarNavGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  const headingVariants = {
    expanded: {
      opacity: 1,
      height: "auto",
      marginBottom: 4,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.25,
        ease: "easeOut",
        delay: prefersReducedMotion ? 0 : 0.12,
      },
    },
    collapsed: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.15,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="space-y-0.5">
      {/* Group Heading */}
      <motion.p
        variants={headingVariants}
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.08em] px-5 overflow-hidden"
        aria-hidden={collapsed}
      >
        {title}
      </motion.p>

      {/* Nav Items */}
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          badge={item.badge}
          alert={item.alert}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
