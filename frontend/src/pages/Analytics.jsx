import { motion } from 'framer-motion';
import { TrendingUp, Activity, Clock, Zap } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { chartData } from '../utils/MockData';

const performanceData = [
  { hour: '00:00', executions: 45 },
  { hour: '04:00', executions: 32 },
  { hour: '08:00', executions: 78 },
  { hour: '12:00', executions: 125 },
  { hour: '16:00', executions: 98 },
  { hour: '20:00', executions: 67 },
];

const statusData = [
  { name: 'Success', value: 2847, color: '#10b981' },
  { name: 'Failed', value: 123, color: '#ef4444' },
  { name: 'Running', value: 45, color: '#f97316' },
];

export const Analytics = () => {
  const metrics = [
    { title: 'Total Executions', value: '3,015', change: '+15.3%', icon: Activity },
    { title: 'AI-Powered Workflows', value: '12', change: '+25.0%', icon: Zap },
    { title: 'Avg Response Time', value: '2.4s', change: '-8.2%', icon: Clock },
    { title: 'Peak Performance', value: '125/hr', change: '+22.1%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed performance metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] rounded-lg text-sm text-gray-700 dark:text-gray-300">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                </div>
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Execution Trends (24 Hours)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
              <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="executions"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExec)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          7-Day Performance
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData.executionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-[#1a1a1a]" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="executions"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Time Saved', value: '142 hours', subtext: 'This month' },
          { label: 'Cost Savings', value: '$8,450', subtext: 'Estimated value' },
          { label: 'ROI', value: '340%', subtext: 'Since launch' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
          >
            <div className="bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">
                {stat.subtext}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};