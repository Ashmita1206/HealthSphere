import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ChatBot } from "@/components/chat/ChatBot";

interface LayoutProps {
  showSidebar?: boolean;
}

export function Layout({ showSidebar = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 pt-16">
        {showSidebar && user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className={`flex-1 ${showSidebar && user ? "md:ml-64" : ""}`}>
          <Outlet />
        </main>
      </div>

      <div className={showSidebar && user ? "md:ml-64" : ""}>
        <Footer />
      </div>

      {user && <ChatBot />}
    </div>
  );
}
