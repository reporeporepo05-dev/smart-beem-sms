import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store";

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors text-left"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}
