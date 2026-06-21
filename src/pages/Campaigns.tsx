import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/app/campaigns").then((res) => setCampaigns(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link
          to="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm border-b dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Scheduled</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : camp.status === "SENDING"
                                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {camp.scheduledTime
                      ? format(new Date(camp.scheduledTime), "PPpp")
                      : "Immediate"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/campaigns/${camp.id}`}
                      className="p-2 inline-flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No campaigns found. Create one to get started.
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
