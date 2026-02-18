import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PieChart,
  Compass,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: PieChart, label: "Portfolio", path: "/portfolio" },
    { icon: Compass, label: "Discover", path: "/discover" },
    { icon: User, label: "Account", path: "/account" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl border-r border-white/20 dark:border-white/10 transition-transform duration-300 lg:translate-x-0 lg:static",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-primary">
            MF Tracker
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6 px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Welcome
            </p>
            <p className="font-medium truncate">{user?.name || "Investor"}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white",
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-white/10 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-lg">MF Tracker</span>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
