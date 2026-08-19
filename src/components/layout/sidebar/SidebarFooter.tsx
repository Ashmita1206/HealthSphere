import { motion, useReducedMotion } from "framer-motion";
import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface SidebarFooterProps {
  collapsed: boolean;
  onClose: () => void;
}

export function SidebarFooter({ collapsed, onClose }: SidebarFooterProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

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

  const signOutButton = (
    <button
      onClick={handleSignOut}
      className={cn(
        "flex items-center gap-3 rounded-xl text-[13px] font-medium transition-colors duration-150 min-h-[44px] w-full text-[#64748B] hover:bg-[#FAF9F6] hover:text-[#0F766E]",
        collapsed ? "justify-center px-0 mx-1" : "px-3 mx-2"
      )}
      aria-label={collapsed ? "Sign Out" : undefined}
    >
      <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
      {!collapsed && (
        <motion.span
          variants={textVariants}
          initial={false}
          animate="expanded"
          className="overflow-hidden whitespace-nowrap"
        >
          Sign Out
        </motion.span>
      )}
    </button>
  );

  return (
    <div className="border-t border-[#E5E7EB] px-1 py-3 space-y-2">
      {/* HIPAA Trust Badge */}
      {!collapsed && (
        <motion.div
          variants={textVariants}
          initial={false}
          animate="expanded"
          className="mx-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB] flex items-center gap-2.5"
        >
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-[#0F172A]">
              HIPAA Compliant
            </p>
            <p className="text-[10px] text-[#64748B]">
              256-bit Encrypted Health Data
            </p>
          </div>
        </motion.div>
      )}

      {/* Sign Out */}
      {collapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{signOutButton}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-[#0F172A] text-white text-xs font-medium px-3 py-1.5 rounded-lg border-0 shadow-lg"
          >
            Sign Out
          </TooltipContent>
        </Tooltip>
      ) : (
        signOutButton
      )}
    </div>
  );
}
