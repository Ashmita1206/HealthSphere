import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, User, LogOut, Search, Bell, ShieldAlert, Sparkles, ChevronDown,
  CheckCircle2, X, LayoutDashboard, FileText, Pill, Calendar, Bot, Eye,
  Heart, Activity, AlertTriangle, Droplets, BookOpen, Headphones,
  ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { notificationService, type AppNotification } from "@/services/notificationService";

/* ------------------------------------------------------------------ */
/*  Global search destinations                                         */
/* ------------------------------------------------------------------ */

const globalDestinations = [
  { path: "/profile", keywords: ["profile", "medical history", "allergy"] },
  { path: "/medicines", keywords: ["medicine", "medication", "dose", "pill"] },
  { path: "/appointments", keywords: ["appointment", "doctor", "visit"] },
  { path: "/reports", keywords: ["report", "lab", "document"] },
  { path: "/timeline", keywords: ["timeline", "activity", "vital", "weight", "bmi"] },
  { path: "/blood-donation", keywords: ["blood", "donation", "donor"] },
  { path: "/emergency", keywords: ["emergency", "sos", "hospital", "ambulance"] },
  { path: "/reminders", keywords: ["reminder", "notification"] },
  { path: "/ai-assistant", keywords: ["ai", "assistant", "consultation"] },
];

/* ------------------------------------------------------------------ */
/*  Desktop navigation structure (Public Landing Nav)                   */
/* ------------------------------------------------------------------ */

interface NavDropdownItem {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavDropdownItem[];
}

const navSections: NavSection[] = [
  {
    label: "Product",
    items: [
      { label: "Dashboard", description: "Your personal health command center", href: "/dashboard", icon: LayoutDashboard },
      { label: "Medical Reports", description: "AI-analyzed lab results & OCR extraction", href: "/reports", icon: FileText },
      { label: "Medicines", description: "Track medications & adherence", href: "/medicines", icon: Pill },
      { label: "Health Timeline", description: "Longitudinal health activity stream", href: "/timeline", icon: Activity },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "AI Assistant", description: "Clinical copilot for health queries", href: "/ai-chat", icon: Bot },
      { label: "Health Score", description: "AI-computed wellness assessment", href: "/ai-health-score", icon: Heart },
      { label: "AI Vision", description: "Scan & interpret medical documents", href: "/ai-vision", icon: Eye },
    ],
  },
  {
    label: "Care",
    items: [
      { label: "Appointments", description: "Schedule & manage doctor visits", href: "/appointments", icon: Calendar },
      { label: "Blood & Organ", description: "Donation tracking & eligibility", href: "/blood-organ", icon: Droplets },
      { label: "Emergency SOS", description: "24/7 emergency contacts & nearest ER", href: "/emergency", icon: AlertTriangle },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "About HealthSphere", description: "Our mission & clinical approach", href: "/about", icon: BookOpen },
      { label: "Contact & Support", description: "Get in touch with our team", href: "/contact", icon: Headphones },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Mobile drawer links                                                */
/* ------------------------------------------------------------------ */

const mobileNavLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Assistant", href: "/ai-chat", icon: Bot },
  { label: "Medical Reports", href: "/reports", icon: FileText },
  { label: "Medicines", href: "/medicines", icon: Pill },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Health Timeline", href: "/timeline", icon: Activity },
  { label: "Emergency SOS", href: "/emergency", icon: AlertTriangle },
  { label: "About", href: "/about", icon: BookOpen },
  { label: "Contact & Support", href: "/contact", icon: Headphones },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isPublicPage = ["/", "/about", "/contact", "/privacy", "/terms"].includes(location.pathname);

  /* ---------- Scroll Listener for Sticky Header ---------- */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------- Notification Service Subscription ---------- */
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });
    return () => unsubscribe();
  }, []);

  /* ---------- Mobile Drawer Body Scroll Lock & Focus Management ---------- */
  useEffect(() => {
    if (!publicMenuOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    drawer?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPublicMenuOpen(false);
        return;
      }

      if (e.key === "Tab" && drawer) {
        const focusables = drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [publicMenuOpen]);

  /* ---------- Close mobile menu on route change ---------- */
  useEffect(() => {
    setPublicMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  /* ---------- Desktop hover handlers ---------- */
  const openDropdown = useCallback((label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(label);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (!user?.email) return "P";
    return user.email.charAt(0).toUpperCase();
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return;

    const destination = globalDestinations.find((item) =>
      item.keywords.some(
        (keyword) =>
          normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery),
      ),
    );

    navigate(
      destination?.path ??
        `/timeline?search=${encodeURIComponent(searchQuery.trim())}`,
    );
    setSearchQuery("");
  };

  const handleNotificationClick = (notif: AppNotification) => {
    notificationService.markAsRead(notif.id);
    setNotificationsOpen(false);
    navigate(notif.route);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E7EB]/80 shadow-xs"
          : "bg-[#FAF9F6]/90 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-bold text-teal-800 focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to main content
      </a>

      <div
        className={`flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full ${
          isPublicPage ? "max-w-7xl mx-auto" : ""
        }`}
      >
        {/* ============ LEFT: Logo & Mobile Hamburger ============ */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Authenticated mobile hamburger */}
          {user && !isPublicPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-slate-700 hover:bg-slate-100 rounded-xl shrink-0 w-11 h-11 flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Public mobile hamburger */}
          {isPublicPage && (
            <button
              onClick={() => setPublicMenuOpen(!publicMenuOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors duration-150 shrink-0"
              aria-label="Toggle public navigation"
              aria-expanded={publicMenuOpen}
              aria-controls="public-mobile-drawer"
            >
              {publicMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <div className="shrink-0">
            <BrandLogo
              variant="full"
              size={isPublicPage ? "lg" : "md"}
              to={user ? "/dashboard" : "/"}
            />
          </div>
        </div>

        {/* ============ MIDDLE: Desktop Public Nav with Popovers ============ */}
        {isPublicPage && (
          <nav className="hidden md:flex items-center gap-1 ml-8" aria-label="Primary navigation">
            {navSections.map((section) => (
              <div
                key={section.label}
                className="relative"
                onMouseEnter={() => openDropdown(section.label)}
                onMouseLeave={closeDropdown}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-[13px] font-semibold tracking-[-0.01em] rounded-lg transition-colors duration-180 ${
                    activeDropdown === section.label
                      ? "text-[#0F766E] bg-[#F0FDFA]"
                      : "text-[#475569] hover:text-[#0F766E] hover:bg-[#F8FAFC]"
                  }`}
                  aria-expanded={activeDropdown === section.label}
                  aria-haspopup="true"
                  onClick={() => setActiveDropdown(activeDropdown === section.label ? null : section.label)}
                >
                  {section.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-180 ${
                      activeDropdown === section.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Popover */}
                <AnimatePresence>
                  {activeDropdown === section.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-[#E5E7EB]/80 py-2 z-50"
                      onMouseEnter={() => openDropdown(section.label)}
                      onMouseLeave={closeDropdown}
                    >
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0 group-hover:bg-[#CCFBF1] transition-colors duration-150">
                            <item.icon className="w-4 h-4 text-[#0F766E]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        )}

        {/* ============ MIDDLE: Authenticated Search Bar ============ */}
        {user && !isPublicPage && (
          <form
            role="search"
            onSubmit={handleSearch}
            className="hidden md:flex items-center relative max-w-sm w-full mx-4"
          >
            <label htmlFor="global-health-search" className="sr-only">
              Search HealthSphere
            </label>
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              id="global-health-search"
              type="text"
              placeholder="Search reports, vitals, medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100/90 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:bg-white focus:border-teal-600 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs font-semibold p-0.5"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>
        )}

        {/* ============ RIGHT: CTAs / Notification Popover / Profile ============ */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {user ? (
            <>
              {/* Emergency SOS Badge */}
              <Link
                to="/emergency"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-colors shrink-0"
              >
                <ShieldAlert className="w-4 h-4 animate-pulse text-rose-600" />
                <span>Emergency SOS</span>
              </Link>

              {/* Notification Popover Center */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-600 hover:bg-slate-100 rounded-xl"
                    aria-label="Open notifications"
                    aria-expanded={notificationsOpen}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl border border-slate-200 shadow-xl bg-white overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F6]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-slate-900 font-heading uppercase tracking-wider">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] text-[#0F766E] font-bold bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#CCFBF1]">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => notificationService.markAllAsRead()}
                        className="text-[11px] font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          onSelect={() => handleNotificationClick(notif)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 rounded-none focus:bg-slate-50 ${
                            !notif.read ? "bg-[#F0FDFA]/50" : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              notif.severity === "attention"
                                ? "bg-amber-50 text-amber-600"
                                : notif.severity === "critical"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {notif.timestamp}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1 h-auto rounded-xl hover:bg-slate-100 transition-colors"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-10 w-10 border border-teal-200">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="bg-teal-700 text-white font-bold text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 p-2 rounded-2xl border border-slate-200 shadow-xl bg-white" align="end">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> HealthSphere AI Patient
                    </p>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-xl text-xs font-medium py-2 focus:bg-teal-50 focus:text-teal-800">
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    Profile & Medical History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-xs font-semibold py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth/login")}
                className="hidden sm:inline-flex text-[13px] font-semibold text-[#475569] hover:text-[#0F766E] hover:bg-[#F0FDFA] rounded-lg px-3 py-2 transition-colors duration-180"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/auth/register")}
                className="bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-[13px] px-4 sm:px-5 py-2 rounded-lg shadow-xs hover:shadow-md transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  VIEWPORT-LEVEL PUBLIC MOBILE DRAWER (Z-INDEX 50 OVERLAY)   */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isPublicPage && publicMenuOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[#0F172A]/50 backdrop-blur-xs md:hidden"
              onClick={() => setPublicMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Viewport Level Drawer Panel */}
            <motion.div
              id="public-mobile-drawer"
              ref={drawerRef}
              tabIndex={-1}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[340px] max-w-[calc(100vw-24px)] bg-white shadow-2xl md:hidden flex flex-col focus:outline-none"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              {/* Drawer Header: Logo + Close Button */}
              <div className="flex items-center justify-between px-4 py-3 h-16 border-b border-[#E5E7EB] shrink-0 bg-white">
                <div className="shrink-0">
                  <BrandLogo variant="full" size="sm" to="/" onClick={() => setPublicMenuOpen(false)} />
                </div>
                <button
                  onClick={() => setPublicMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F766E] transition-colors duration-150 shrink-0"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Navigation Content */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setPublicMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#334155] hover:text-[#0F766E] hover:bg-[#F0FDFA] transition-colors duration-150"
                  >
                    <link.icon className="w-4.5 h-4.5 text-[#0F766E] shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Drawer Footer Actions */}
              <div className="border-t border-[#E5E7EB] p-4 space-y-2 shrink-0 bg-[#FAF9F6]">
                <Button
                  variant="ghost"
                  onClick={() => { setPublicMenuOpen(false); navigate("/auth/login"); }}
                  className="w-full justify-center text-sm font-bold text-[#475569] hover:text-[#0F766E] hover:bg-[#F0FDFA] rounded-xl py-2.5 h-11"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => { setPublicMenuOpen(false); navigate("/auth/register"); }}
                  className="w-full justify-center bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-sm rounded-xl py-2.5 h-11 shadow-xs"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
