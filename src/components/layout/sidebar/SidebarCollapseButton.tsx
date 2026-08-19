import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarCollapseButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarCollapseButton({ collapsed, onToggle }: SidebarCollapseButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onToggle}
      className="w-full flex items-center justify-center h-10 text-[#64748B] hover:text-[#0F766E] hover:bg-[#FAF9F6] transition-colors duration-150 border-b border-[#E5E7EB]"
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
    >
      {collapsed ? (
        <ChevronRight className="w-4 h-4" />
      ) : (
        <ChevronLeft className="w-4 h-4" />
      )}
    </motion.button>
  );
}
