import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { calculateSmsCount } from "../lib/utils";
import { FileUp, Send } from "lucide-react";

export default function NewCampaign() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(false);

  const smsCount = calculateSmsCount(message);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Missing File",
        text: "Please upload an Excel or CSV file with contacts",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("message", message);
    formData.append("file", file);
    if (scheduledTime) {
      formData.append("scheduledTime", new Date(scheduledTime).toISOString());
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/app/campaigns", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Campaign Created",
        text: `Successfully queued ${data.count} contacts`,
      });
      navigate("/campaigns");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to create campaign",
        text: err.response?.data?.error || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Campaign</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 md:p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Campaign Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Summer Promo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 flex justify-between">
            <span>Message Content</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${smsCount > 1 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"} dark:bg-gray-800 dark:text-gray-300`}
            >
              {message.length} chars ({smsCount} SMS/contact)
            </span>
          </label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Type your SMS message..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Contacts (Excel / CSV)
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none">
            <span className="flex items-center space-x-2">
              <FileUp className="w-6 h-6 text-gray-400" />
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {file ? file.name : "Drop files to attach, or browse"}
              </span>
            </span>
            <input
              type="file"
              name="file_upload"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Schedule Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Leave blank to start sending immediately.
          </p>
        </div>

        <div className="pt-4 border-t dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {loading ? "Processing..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
