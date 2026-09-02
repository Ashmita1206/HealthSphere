import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import Landing from './pages/Landing';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Medicines from './pages/medicines';
import Reports from './pages/Reports';
import Appointments from './pages/appointments';
import BloodOrgan from './pages/BloodOrgan';
import BloodOrganInfo from './pages/BloodOrganInfo';
import Reminders from './pages/Reminders';
import Timeline from './pages/timeline';
import BloodDonation from './pages/blood-donation';
import Emergency from './pages/emergency';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AIChat from './pages/AIChat';
import MedicalReports from './pages/MedicalReports';
import AIVision from './pages/AIVision';
import AIHealthScore from './pages/AIHealthScore';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <Routes>
                {/* Public routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                </Route>

                {/* Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route element={<Layout showSidebar />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/chat" element={<AIChat />} />
                  <Route path="/medical-reports" element={<MedicalReports />} />
                  <Route path="/ai-vision" element={<AIVision />} />
                  <Route path="/ai-health-score" element={<AIHealthScore />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/medicines" element={<Medicines />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/blood-organ" element={<BloodOrgan />} />
                  <Route
                    path="/blood-organ/info"
                    element={<BloodOrganInfo />}
                  />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/blood-donation" element={<BloodDonation />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
