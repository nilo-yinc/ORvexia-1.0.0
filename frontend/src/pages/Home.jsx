import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Workflow,
  Sparkles,
  BarChart3,
  FolderKanban,
  Settings,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Play,
  Plus,
  Users,
  Search,
  Activity,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Database,
  Globe
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, isPositive, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
        }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
    </div>
  </motion.div>
);

const ActivityItem = ({ title, status, time, type }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0 hover:bg-gray-50/50 dark:hover:bg-[#222222]/50 px-2 rounded-lg transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === 'success' ? 'bg-green-100 dark:bg-green-950/20' :
          status === 'failed' ? 'bg-red-100 dark:bg-red-950/20' : 'bg-orange-100 dark:bg-orange-950/20'
          }`}>
          <Workflow className={`w-5 h-5 ${status === 'success' ? 'text-green-600 dark:text-green-400' :
            status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
            }`} />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#1a1a1a] ${status === 'success' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-orange-500'
          }`} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
            {type}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className={`hidden sm:flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${status === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950/10 dark:text-green-500' :
        status === 'failed' ? 'bg-red-50 text-red-700 dark:bg-red-950/10 dark:text-red-500' : 'bg-orange-50 text-orange-700 dark:bg-orange-950/10 dark:text-orange-500'
        }`}>
        {status}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
    </div>
  </div>
);

export const Home = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Workflow, label: 'Active Workflows', value: '24', trend: '12%', isPositive: true, colorClass: 'bg-orange-500' },
    { icon: Play, label: 'Total Executions', value: '1,842', trend: '8%', isPositive: true, colorClass: 'bg-blue-500' },
    { icon: CheckCircle2, label: 'Success Rate', value: '99.2%', trend: '0.4%', isPositive: true, colorClass: 'bg-green-500' },
    { icon: Zap, label: 'Compute Usage', value: '64%', trend: '5%', isPositive: false, colorClass: 'bg-purple-500' },
  ];

  const recentActivity = [
    { title: 'Shopify Order Sync', status: 'success', time: '2 mins ago', type: 'INTEGRATION' },
    { title: 'Customer Onboarding', status: 'processing', time: '5 mins ago', type: 'WORKFLOW' },
    { title: 'Daily Analytics Report', status: 'success', time: '1 hour ago', type: 'AUTOMATION' },
    { title: 'Lead Scraping Tool', status: 'failed', time: '3 hours ago', type: 'AI BUILDER' },
    { title: 'Newsletter Blast', status: 'success', time: '5 hours ago', type: 'SCHEDULED' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Welcome back, Demo User
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here is what's happening with your automations today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">System Functional</span>
            </div>
            <button
              onClick={() => navigate('/workflows/builder')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-sm overflow-hidden text-clip">
              <div className="p-6 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium italic">Latest workflow executions and events</p>
                </div>
                <button className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors">
                  View History
                </button>
              </div>
              <div className="p-2 sm:p-4">
                {recentActivity.map((activity, idx) => (
                  <ActivityItem key={idx} {...activity} />
                ))}
              </div>
            </div>

            {/* AI Suggestion Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-bold tracking-wider uppercase">AI Opportunity</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Automate your Customer Support</h3>
                  <p className="text-orange-50 text-sm opacity-90">
                    Based on your active apps, we can set up an AI Agent to handle 60% of common queries automatically.
                  </p>
                </div>
                <ArrowRight className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            </motion.div>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="space-y-6">

            {/* Quick Actions Grid */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 shadow-sm">
              <h2 className="text-md font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FolderKanban, label: 'Templates', path: '/templates', color: 'text-blue-500' },
                  { icon: Sparkles, label: 'AI Tools', path: '/ai-builder', color: 'text-purple-500' },
                  { icon: BarChart3, label: 'Insight', path: '/analytics', color: 'text-green-500' },
                  { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-500' },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 dark:border-[#2a2a2a] hover:border-orange-200 dark:hover:border-orange-900/50 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all group"
                  >
                    <action.icon className={`w-6 h-6 mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Indicators */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 shadow-sm">
              <h2 className="text-md font-bold text-gray-900 dark:text-white mb-4">Infrastructure Health</h2>
              <div className="space-y-4">
                {[
                  { label: 'API Gateway', status: 'Healthy', icon: Globe },
                  { label: 'Worker Clusters', status: 'Healthy', icon: Cpu },
                  { label: 'Data Latency', status: 'Low', icon: Database },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-50 dark:bg-[#222222] rounded-md">
                        <item.icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help / Docs Card */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <h3 className="text-lg font-bold mb-2">Need help?</h3>
              <p className="text-gray-400 text-xs mb-4">Explore our documentation or contact our 24/7 expert support team.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-semibold transition-all">
                Read Documentation
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
