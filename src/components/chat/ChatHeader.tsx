import { Bot, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function ChatHeader({ onClose, onToggleSidebar, isSidebarOpen }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/90 p-3 sm:p-4 text-primary-foreground shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Visible only on mobile/tablet */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden text-primary-foreground hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 shadow-inner">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        
        <div>
          <h3 className="font-semibold text-sm sm:text-base leading-none mb-1">HealthSphere AI</h3>
          <p className="text-[10px] sm:text-xs opacity-80 leading-none hidden sm:block">Healthcare Assistant</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-primary-foreground hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none rounded-full h-8 w-8 sm:h-9 sm:w-9"
        aria-label="Close chatbot"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
}
