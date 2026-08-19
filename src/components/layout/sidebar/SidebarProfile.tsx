import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface SidebarProfileProps {
  collapsed: boolean;
}

export function SidebarProfile({ collapsed }: SidebarProfileProps) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  if (!user) return null;

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

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

  const profileContent = (
    <Link
      to="/profile"
      className={`flex items-center gap-3 rounded-xl transition-colors duration-150 hover:bg-[#FAF9F6] group ${
        collapsed ? "justify-center p-2 mx-1" : "px-4 py-3 mx-2"
      }`}
      aria-label={collapsed ? `${displayName} — Profile` : undefined}
    >
      <Avatar className="h-8 w-8 border border-[#E5E7EB] shrink-0">
        <AvatarImage src="" alt={displayName} />
        <AvatarFallback className="bg-[#0F766E] text-white font-bold text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      {!collapsed && (
        <motion.div
          variants={textVariants}
          initial={false}
          animate="expanded"
          className="min-w-0 overflow-hidden"
        >
          <p className="text-[13px] font-semibold text-[#0F172A] truncate">
            {displayName}
          </p>
          <p className="text-[11px] text-[#64748B] truncate">
            Personal Health Profile
          </p>
        </motion.div>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{profileContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="bg-[#0F172A] text-white text-xs font-medium px-3 py-1.5 rounded-lg border-0 shadow-lg"
        >
          {displayName}
        </TooltipContent>
      </Tooltip>
    );
  }

  return profileContent;
}
