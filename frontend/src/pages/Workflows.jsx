import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  Search,
} from "lucide-react";
import { workflowApi } from "../lib/api";

// Function to map workflow names to actual workflow images
const getWorkflowImage = (name) => {
  const n = name.toLowerCase();
  if (n.includes("customer") && n.includes("onboarding")) {
    return "https://www.moengage.com/wp-content/uploads/The-Customer-Onboarding-Process-832x479.webp";
  }
  if (n.includes("invoice")) {
    return "https://dokka.com/wp-content/uploads/2022/11/Invoice-Processing-Workflow.jpg";
  }
  if (n.includes("email") && n.includes("campaign")) {
    return "https://knowledge.hubspot.com/hubfs/marketing-automation-software-tools-5-20240814-2871568.webp";
  }
  if (n.includes("data") && n.includes("sync")) {
    return "https://d2908q01vomqb2.cloudfront.net/e1822db470e60d090affd0956d743cb0e7cdf113/2023/04/19/DataSync-Pipeline-Trigger-Solution-Architecture.png";
  }
  if (n.includes("support") && n.includes("ticket")) {
    return "https://doimages.nyc3.cdn.digitaloceanspaces.com/005SolutionsPages/Support%20ticket%20triage.jpg";
  }
  // Default fallback image
  return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop";
};

export const Workflows = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await workflowApi.getAll();
        setWorkflows(data);
      } catch (err) {
        console.error("Failed to fetch workflows:", err);
        setError("Failed to load workflows");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111111]">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Bar - Top Section */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all hover:border-orange-300 dark:hover:border-orange-700"
          />
        </div>

        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workflows
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Automate your processes with ease.
            </p>
          </div>
          <button
            onClick={() => navigate("/workflows/builder")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ff4f00] hover:bg-[#e64600] text-white text-xs font-bold rounded-full transition-all shadow-sm hover:scale-105 hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Workflow
          </button>
        </div>

        {/* Stats - Small size */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Workflows", value: "3" },
            { label: "Drafts", value: "0" },
            { label: "Success Rate", value: "96.2%" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-3 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer"
            >
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Workflows Grid - 3 Columns with workflow images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map((workflow, idx) => {
            const workflowImage = getWorkflowImage(workflow.name);
            return (
              <motion.div
                key={workflow._id || workflow.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() =>
                  navigate(`/workflows/builder/${workflow._id || workflow.id}`)
                }
                className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer"
              >
                {/* Visual Header - Workflow Image */}
                <div className="h-48 bg-gray-50 dark:bg-[#222222] relative overflow-hidden border-b border-gray-100 dark:border-[#2a2a2a]">
                  <img
                    src={workflowImage}
                    alt={workflow.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://www.regpacks.com/wp-content/uploads/2021/05/Customer-Onboarding-Journey.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-[#2a2a2a] transition-all opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        workflow.status === "active"
                          ? "bg-green-500/90 text-white"
                          : workflow.status === "paused"
                          ? "bg-yellow-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {workflow.status}
                    </div>
                  </div>
                </div>

                {/* Body Section */}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workflow.status === "active"
                          ? "bg-green-500"
                          : workflow.status === "paused"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {workflow.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {workflow.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {workflow.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">
                        Executions
                      </p>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {workflow.executions || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-gray-400">
                        Success
                      </p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-500">
                        {workflow.successRate || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
