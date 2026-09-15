import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { TimelineProvider } from '@/context/TimelineContext';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { MedicalProfileProvider } from '@/context/MedicalProfileContext';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { lazy, Suspense } from 'react';
import { AppLoadingFallback } from '@/components/layout/AppLoadingFallback';

// Core entry pages
import Landing from './pages/Landing';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import Dashboard from './pages/dashboard';
import NotFound from './pages/NotFound';

// Lazy-loaded clinical workspaces and feature dashboards
const Profile = lazy(() => import('./pages/profile'));
const Medicines = lazy(() => import('./pages/medicines'));
const Reports = lazy(() => import('./pages/Reports'));
const Appointments = lazy(() => import('./pages/appointments'));
const BloodOrganInfo = lazy(() => import('./pages/BloodOrganInfo'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Timeline = lazy(() => import('./pages/timeline'));
const BloodDonation = lazy(() => import('./pages/blood-donation'));
const Emergency = lazy(() => import('./pages/emergency'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const AIChat = lazy(() => import('./pages/AIChat'));
const MedicalReports = lazy(() => import('./pages/MedicalReports'));
const AIVision = lazy(() => import('./pages/AIVision'));
const AIHealthScore = lazy(() => import('./pages/AIHealthScore'));
const DoctorPortal = lazy(() => import('./pages/doctor/DoctorPortal'));
const TelemedicineRoom = lazy(() => import('./pages/telemedicine/TelemedicineRoom'));
const PredictiveDashboard = lazy(() => import('./pages/predictive/PredictiveDashboard'));
const NotificationCenter = lazy(() => import('./pages/notifications/NotificationCenter'));
const AdminAnalyticsDashboard = lazy(() => import('./pages/admin/AdminAnalyticsDashboard'));
const WearableDashboard = lazy(() => import('./pages/wearables/WearableDashboard'));
const SecurityDashboard = lazy(() => import('./pages/security/SecurityDashboard'));
const CareTeamWorkspace = lazy(() => import('./pages/collaboration/CareTeamWorkspace'));
const OfflinePlatformDashboard = lazy(() => import('./pages/offline/OfflinePlatformDashboard'));
const PerformanceDashboard = lazy(() => import('./pages/admin/PerformanceDashboard'));
const MonitoringOpsDashboard = lazy(() => import('./pages/admin/MonitoringOpsDashboard'));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TimelineProvider>
              <AnalyticsProvider>
                <MedicalProfileProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <HashRouter>
                      <Suspense fallback={<AppLoadingFallback />}>
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
                            <Route path="/doctor-portal" element={<DoctorPortal />} />
                            <Route path="/doctor" element={<DoctorPortal />} />
                            <Route path="/telemedicine" element={<TelemedicineRoom />} />
                            <Route path="/telemedicine/:consultationId" element={<TelemedicineRoom />} />
                            <Route path="/blood-organ/info" element={<BloodOrganInfo />} />
                            <Route path="/reminders" element={<Reminders />} />
                            <Route path="/timeline" element={<Timeline />} />
                            <Route path="/blood-donation" element={<BloodDonation />} />
                            <Route path="/emergency" element={<Emergency />} />
                            <Route path="/predictive" element={<PredictiveDashboard />} />
                            <Route path="/predictive-ai" element={<PredictiveDashboard />} />
                            <Route path="/notifications" element={<NotificationCenter />} />
                            <Route path="/notification-center" element={<NotificationCenter />} />
                            <Route path="/admin" element={<AdminAnalyticsDashboard />} />
                            <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />
                            <Route path="/wearables" element={<WearableDashboard />} />
                            <Route path="/wearable" element={<WearableDashboard />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/security" element={<SecurityDashboard />} />
                            <Route path="/security-dashboard" element={<SecurityDashboard />} />
                            <Route path="/collaboration" element={<CareTeamWorkspace />} />
                            <Route path="/care-team" element={<CareTeamWorkspace />} />
                            <Route path="/offline" element={<OfflinePlatformDashboard />} />
                            <Route path="/pwa" element={<OfflinePlatformDashboard />} />
                            <Route path="/admin/performance" element={<PerformanceDashboard />} />
                            <Route path="/performance" element={<PerformanceDashboard />} />
                            <Route path="/admin/monitoring" element={<MonitoringOpsDashboard />} />
                            <Route path="/admin/diagnostics" element={<MonitoringOpsDashboard />} />
                          </Route>

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </HashRouter>
                  </TooltipProvider>
                </MedicalProfileProvider>
              </AnalyticsProvider>
            </TimelineProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
