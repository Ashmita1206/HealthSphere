import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface SidebarBrandProps {
  collapsed: boolean;
}

export function SidebarBrand({ collapsed }: SidebarBrandProps) {
  const prefersReducedMotion = useReducedMotion();

  const textVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      width: "auto",
      transition: { duration: prefersReducedMotion ? 0.01 : 0.25, ease: "easeOut", delay: prefersReducedMotion ? 0 : 0.1 },
    },
    collapsed: {
      opacity: 0,
      x: -6,
      width: 0,
      transition: { duration: prefersReducedMotion ? 0.01 : 0.15, ease: "easeOut" },
    },
  };

  return (
    <div className="h-16 flex items-center px-4 border-b border-[#E5E7EB] shrink-0 overflow-hidden">
      {collapsed ? (
        <BrandLogo variant="icon" size="sm" to="/dashboard" />
      ) : (
        <BrandLogo variant="full" size="md" to="/dashboard" />
      )}
    </div>
  );
}

