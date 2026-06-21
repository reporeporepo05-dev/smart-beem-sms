import { Link, useLocation } from "react-router-dom";
import { Home, Send, List, LogOut } from "lucide-react";
import { useAuthStore } from "../store";
import { cn } from "../lib/utils";

export default function BottomNav({ className }: { className?: string }) {
  const location = useLocation();
  const { logout } = useAuthStore();

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/campaigns", icon: List, label: "Campaigns" },
    { to: "/campaigns/new", icon: Send, label: "Send SMS" },
  ];

  return (
    <nav className={cn(className)}>
      {links.map((link) => {
        const Icon = link.icon;
        const active = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex flex-col items-center justify-center w-full px-2 py-1 text-xs font-medium rounded-lg transition-colors",
              active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
            )}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="flex flex-col items-center justify-center w-full px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="w-6 h-6 mb-1" />
        <span className="truncate">Logout</span>
      </button>
    </nav>
  );
}
