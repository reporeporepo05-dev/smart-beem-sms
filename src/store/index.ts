import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    set({ theme });
  },
}));

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  username: localStorage.getItem("username"),
  login: (token, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    set({ isAuthenticated: true, token, username });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    set({ isAuthenticated: false, token: null, username: null });
  },
}));

interface SettingsState {
  systemName: string;
  logo: string;
  favicon: string;
  isSetupCompleted: boolean;
  setSystemSettings: (settings: {
    isSetupCompleted: boolean;
    systemName: string;
    logo: string;
    favicon: string;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  systemName: "SMS Portal",
  logo: "",
  favicon: "",
  isSetupCompleted: false,
  setSystemSettings: (settings) => set(settings),
}));
