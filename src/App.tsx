import React, { useEffect, useState } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useAuthStore, useThemeStore, useSettingsStore } from "./store";
import axios from "axios";

// Pages placeholders
import SetupWizard from "./pages/SetupWizard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import NewCampaign from "./pages/NewCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import BottomNav from "./components/BottomNav";
import DesktopNav from "./components/DesktopNav";

axios.defaults.baseURL = "/api";

const AppLayout = () => {
  const [init, setInit] = useState(false);
  const { setSystemSettings } = useSettingsStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    // Check system setup status
    axios
      .get("/auth/status")
      .then((res) => {
        setSystemSettings({
          isSetupCompleted: res.data.configured,
          systemName: "",
          logo: "",
          favicon: "",
        });
        setInit(true);
      })
      .catch(() => {
        setInit(true);
      });

    axios.get("/auth/settings").then((res) => {
      setSystemSettings({
        isSetupCompleted: true,
        systemName: res.data.systemName || "SMS Portal",
        logo: res.data.logo || "",
        favicon: res.data.favicon || "",
      });
      if (res.data.favicon) {
        const link = document.querySelector(
          "link[rel~='icon']",
        ) as HTMLLinkElement;
        if (link) link.href = res.data.favicon;
        else {
          const el = document.createElement("link");
          el.rel = "icon";
          el.href = res.data.favicon;
          document.head.appendChild(el);
        }
      }
      if (res.data.systemName) document.title = res.data.systemName;
    });
  }, []);

  if (!init)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200 flex flex-col md:flex-row">
      <Outlet />
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token } = useAuthStore();
  const { isSetupCompleted } = useSettingsStore();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  if (!isSetupCompleted) return <Navigate to="/setup" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <DesktopNav className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r dark:border-gray-800 bg-white dark:bg-gray-900" />
      <div className="flex-1 md:pl-64 flex flex-col pb-16 md:pb-0 min-h-screen">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
      <BottomNav className="md:flex fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden" />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/setup",
        element: <SetupWizard />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/campaigns",
        element: (
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        ),
      },
      {
        path: "/campaigns/new",
        element: (
          <ProtectedRoute>
            <NewCampaign />
          </ProtectedRoute>
        ),
      },
      {
        path: "/campaigns/:id",
        element: (
          <ProtectedRoute>
            <CampaignDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
