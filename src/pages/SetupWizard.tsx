import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../store";

export default function SetupWizard() {
  const navigate = useNavigate();
  const { setSystemSettings } = useSettingsStore();
  const [loading, setLoading] = useState(false);

  // Form state
  const [systemName, setSystemName] = useState("SMS Portal");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/setup", {
        systemName,
        timezone,
        logo,
        favicon,
        username,
        password,
      });

      Swal.fire({
        icon: "success",
        title: "Installation Complete",
        text: "System has been successfully configured",
        timer: 2000,
        showConfirmButton: false,
      });

      setSystemSettings({ isSetupCompleted: true, systemName, logo, favicon });
      navigate("/login");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Installation Failed",
        text: err.response?.data?.error || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Installation Wizard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure your SMS Portal before getting started
          </p>
        </div>

        <form onSubmit={handleInstall} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b dark:border-gray-800 pb-2">
              System Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  required
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  required
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Favicon URL (Optional)
                </label>
                <input
                  type="url"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b dark:border-gray-800 pb-2">
              Administrator Account
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-colors"
            >
              {loading ? "Installing..." : "Complete Installation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
