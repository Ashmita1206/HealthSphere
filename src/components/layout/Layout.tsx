import { useCallback, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
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
  const { user, loading } = useAuth();
  const location = useLocation();
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const isPublicPage = ["/", "/about", "/contact", "/privacy", "/terms"].includes(location.pathname);

  if (showSidebar && !loading && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-[#FAF9F6] font-sans text-slate-900 antialiased selection:bg-teal-800 selection:text-white">
      <Navbar onMenuClick={openSidebar} />

      <div className="flex flex-1 relative">
        {showSidebar && user && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className={`min-w-0 flex-1 w-full transition-[margin,width] duration-250 ease-out ${
            showSidebar ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto' : ''
          } ${
            showSidebar && user ? 'lg:ml-64 lg:w-[calc(100%-16rem)]' : ''
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
