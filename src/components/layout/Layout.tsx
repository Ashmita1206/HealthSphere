import { useCallback, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './sidebar/index';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBot } from '@/components/chat/ChatBot';

interface LayoutProps {
  showSidebar?: boolean;
}

export function Layout({ showSidebar = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("healthsphere-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const { user, loading } = useAuth();
  const location = useLocation();
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleCollapsedChange = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const isPublicPage = ["/", "/about", "/contact", "/privacy", "/terms"].includes(location.pathname);

  if (showSidebar && !loading && !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen overflow-x-clip flex flex-col bg-[#FAF9F6] font-sans text-slate-900 antialiased selection:bg-teal-800 selection:text-white">
      <Navbar onMenuClick={openSidebar} />

      <div className="flex flex-1 relative">
        {showSidebar && user && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            onCollapsedChange={handleCollapsedChange}
          />
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className={`min-w-0 flex-1 w-full transition-[margin] duration-300 ease-in-out ${
            showSidebar && user
              ? sidebarCollapsed
                ? 'lg:ml-[72px]'
                : 'lg:ml-64'
              : ''
          }`}
        >
          <div className={showSidebar ? 'p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto' : ''}>
            <Outlet />
          </div>
        </main>
      </div>

      {isPublicPage && <Footer />}

      {user && <ChatBot />}
    </div>
  );
}
