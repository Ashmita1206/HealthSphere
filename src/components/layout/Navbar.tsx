import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, User, LogOut, Activity, Search, Bell, ShieldAlert, Sparkles, ChevronDown, CheckCircle2
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

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    if (!user?.email) return "P";
    return user.email.charAt(0).toUpperCase();
  };

  const isPublicPage = ["/", "/about", "/contact", "/privacy", "/terms"].includes(location.pathname);

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

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-bold text-teal-800 focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Skip to main content
      </a>
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Left section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {user && !isPublicPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-slate-700 hover:bg-slate-100 rounded-xl"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                  HealthSphere
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  AI
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Middle Navigation - Public Landing Nav */}
        {isPublicPage && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#hero" className="hover:text-teal-700 transition-colors">Home</a>
            <a href="#features" className="hover:text-teal-700 transition-colors">Features</a>
            <Link to="/about" className="hover:text-teal-700 transition-colors">About</Link>
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors">Services</a>
            <a href="#testimonials" className="hover:text-teal-700 transition-colors">Testimonials</a>
            <Link to="/contact" className="hover:text-teal-700 transition-colors">Contact</Link>
          </nav>
        )}

        {/* Dashboard Search Bar for Logged in User */}
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
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </form>
        )}

        {/* Right Section: CTAs / Notifications / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Emergency Quick Badge */}
              <Link to="/emergency" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-colors">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span>Emergency SOS</span>
              </Link>

              {/* Notification Popover */}
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
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border border-slate-200 shadow-xl bg-white">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 font-heading">Notifications</h4>
                    <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    <DropdownMenuItem
                      onSelect={() => navigate("/reports")}
                      className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 rounded-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Lab Analysis Ready</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Your Blood Panel CBC report has been analyzed by AI.</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate("/medicines")}
                      className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 rounded-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Medicine Reminder</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Time for Metformin 500mg (Post Lunch).</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                      </div>
                    </DropdownMenuItem>
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
                    <Avatar className="h-8 w-8 border border-teal-200">
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
                <DropdownMenuContent className="w-60 p-2 rounded-2xl border border-slate-200 shadow-xl" align="end">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> HealthSphere AI Patient
                    </p>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-xl text-xs font-medium py-2">
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
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth/login")}
                className="text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/auth/register")}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

