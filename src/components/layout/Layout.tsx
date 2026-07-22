import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBot } from '@/components/chat/ChatBot';

interface LayoutProps {
  showSidebar?: boolean;
}

export function Layout({ showSidebar = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isPublicPage = ["/", "/about", "/contact", "/privacy", "/terms"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 relative">
        {showSidebar && user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 w-full transition-all duration-300 ${
            showSidebar && user ? 'lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl' : ''
          }`}
        >
          <Outlet />
        </main>
      </div>

      {isPublicPage && <Footer />}

      {user && <ChatBot />}
    </div>
  );
}

