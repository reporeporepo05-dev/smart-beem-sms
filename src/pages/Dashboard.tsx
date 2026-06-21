import { useEffect, useState } from "react";
import { CreditCard, Send, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/app/balance").then((res) => setBalance(res.data.balance));
    axios
      .get("/app/campaigns")
      .then((res) => setCampaigns(res.data.slice(0, 5)));
  }, []);

  const statCards = [
    {
      label: "SMS Balance",
      value: balance !== null ? balance : "...",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Total Campaigns",
      value: campaigns.length || "...",
      icon: Send,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl flex items-center gap-4"
          >
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b dark:border-gray-800">
          <h2 className="text-lg font-bold">Recent Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {campaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{camp.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium 
                                            ${
                                              camp.status === "COMPLETED"
                                                ? "bg-green-100 text-green-700"
                                                : camp.status === "SENDING"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-yellow-100 text-yellow-700"
                                            }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(camp.createdAt), "PPpp")}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No campaigns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
