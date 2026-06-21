import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useSettingsStore } from "../store";
import { MessageSquare } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { systemName, logo } = useSettingsStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", { username, password });
      login(data.token, data.username);
      navigate("/");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.error || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-8">
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              className="h-16 w-16 object-contain mb-4"
            />
          ) : (
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {systemName || "SMS Portal"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
