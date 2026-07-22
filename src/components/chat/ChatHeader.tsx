import { Bot, X, Menu, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function ChatHeader({ onClose, onToggleSidebar, isSidebarOpen }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-3.5 sm:p-4 text-white shrink-0 shadow-sm z-10 border-b border-teal-800/80">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Visible only on mobile/tablet */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden text-white hover:bg-white/10 rounded-xl"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600/90 flex items-center justify-center text-white shadow-md border border-teal-500/50">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base leading-none font-heading">HealthSphere AI</h3>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-200 border border-teal-400/30">
              Active Triage
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-teal-200/80 leading-none mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Clinical Assistant • 24/7 Support
          </p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-white hover:bg-white/10 rounded-xl h-8 w-8 sm:h-9 sm:w-9"
        aria-label="Close chatbot"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
}

