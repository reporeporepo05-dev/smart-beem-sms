import { Link, useLocation } from "react-router-dom";
import { Home, Send, List, LogOut, MessageSquare } from "lucide-react";
import { useAuthStore, useSettingsStore } from "../store";
import { cn } from "../lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function DesktopNav({ className }: { className?: string }) {
  const location = useLocation();
  const { logout, username } = useAuthStore();
  const { systemName, logo } = useSettingsStore();

  const links = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/campaigns", icon: List, label: "Campaigns" },
    { to: "/campaigns/new", icon: Send, label: "Send SMS" },
  ];

  return (
    <nav className={cn("flex flex-col py-6", className)}>
      <div className="px-6 mb-8 flex items-center gap-3">
        {logo ? (
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
        ) : (
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight">
          {systemName || "SMS Portal"}
        </h1>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50",
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="px-4 mt-auto">
        <div className="mb-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold uppercase">
            {username?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administrator
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
