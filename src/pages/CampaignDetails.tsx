import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function CampaignDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    axios
      .get(`/app/campaigns/${id}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!data && !loading) return <div>Campaign not found</div>;
  if (loading && !data) return <div>Loading...</div>;

  const { campaign, contacts, summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/campaigns"
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-gray-500 text-sm">
            Created {format(new Date(campaign.createdAt), "PPpp")}
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {summary.total}
          </div>
          <div className="text-sm font-medium text-gray-500">
            Total Contacts
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Clock className="w-6 h-6" /> {summary.pending}
          </div>
          <div className="text-sm font-medium text-gray-500">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />{" "}
            {summary.sent + summary.delivered}
          </div>
          <div className="text-sm font-medium text-gray-500">
            Sent & Delivered
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />{" "}
            {summary.failed + summary.undelivered}
          </div>
          <div className="text-sm font-medium text-gray-500">Failed</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b dark:border-gray-800 font-medium text-lg">
          Contact List
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">Phone</th>
                <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">Ref ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {contacts.map((c: any) => (
                <tr key={c.id}>
                  <td className="px-6 py-3">{c.phone}</td>
                  <td className="px-6 py-3 text-gray-500">{c.name || "N/A"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium 
                                            ${
                                              c.status === "DELIVERED" ||
                                              c.status === "SENT"
                                                ? "bg-green-100 text-green-700"
                                                : c.status === "FAILED" ||
                                                    c.status === "UNDELIVERED"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-yellow-100 text-yellow-700"
                                            }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {c.beemRequestId || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
