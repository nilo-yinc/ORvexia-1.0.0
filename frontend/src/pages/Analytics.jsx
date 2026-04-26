import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Clock, Zap, Terminal, Globe, Cpu, Database, Share2 } from 'lucide-react';
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
  { name: 'SUCCESS', value: 2847, color: '#8dcdff' }, // Technical blue
  { name: 'FAILED', value: 123, color: '#ef4444' },  // Danger red
  { name: 'RUNNING', value: 45, color: '#FF5F1F' },   // Solar flare
];

const MetricPanel = ({ title, value, change, icon: Icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="bg-surface-1 border border-white/[0.05] p-6 group hover:border-accent/40 transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
      <Icon className="w-16 h-16" />
    </div>
    
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="w-8 h-8 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:border-accent/20 transition-all">
        <Icon className="w-4 h-4 text-white/40 group-hover:text-accent" />
      </div>
      <div className={`text-[10px] font-mono font-bold ${change.startsWith('+') ? 'text-accent-success' : 'text-accent-danger'}`}>
        {change}
      </div>
    </div>
    
    <div className="relative z-10">
      <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black font-mono tracking-tighter text-white">{value}</p>
    </div>

    {/* Kinetic Accent */}
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/[0.02]" />
    <div className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-hover:w-full transition-all duration-700" />
  </motion.div>
);

export const Analytics = () => {
  const metrics = [
    { title: 'Total_Executions', value: '3,015', change: '+15.3%', icon: Activity },
    { title: 'Agentic_Modules', value: '12', change: '+25.0%', icon: Cpu },
    { title: 'Latency_Avg', value: '2.4ms', change: '-8.2%', icon: Clock },
    { title: 'Peak_Throughput', value: '125/hr', change: '+22.1%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-obsidian p-8 space-y-12">
      
      {/* Header - Industrial Command Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-4 h-4 text-accent" />
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Telemetry_Stream // Node_Alpha</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            SYSTEM <span className="text-accent italic">TELEMETRY</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-surface-2 border border-white/5 px-4 py-2 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Protocol: 7_Day_Window</span>
            <ChevronDown className="w-3 h-3 text-white/20" />
          </div>
          <button className="px-6 py-2 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all">
            Dump_System_Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-white/[0.03] relative z-10">
        {metrics.map((metric, index) => (
          <MetricPanel key={index} index={index} {...metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-12 relative z-10">
        
        {/* Main Chart - Execution Trends */}
        <div className="lg:col-span-2 bg-surface-1 border border-white/[0.05] p-8 overflow-hidden relative group">
          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-accent" />
              <h3 className="text-[11px] font-black tracking-[0.2em] text-white uppercase">
                Execution_Timeline (24H)
              </h3>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-20 h-[1px] bg-white/5" />
               <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Live_Feed</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5F1F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF5F1F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="rgba(255,255,255,0.1)" 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontStyle: 'monospace' }}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.1)" 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontStyle: 'monospace' }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181B',
                  border: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
                itemStyle={{ color: '#FF5F1F' }}
                cursor={{ stroke: '#FF5F1F', strokeWidth: 1 }}
              />
              <Area
                type="stepAfter"
                dataKey="executions"
                stroke="#FF5F1F"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExec)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution - Pie Chart */}
        <div className="bg-surface-1 border border-white/[0.05] p-8 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <Share2 className="w-4 h-4 text-accent" />
            <h3 className="text-[11px] font-black tracking-[0.2em] text-white uppercase">
              Distribution_Map
            </h3>
          </div>
          
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Total_Ops</span>
              <span className="text-xl font-black font-mono text-white">3,015</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between group/row">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-white/40 group-hover/row:text-white transition-colors uppercase tracking-widest">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/60 font-bold">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats - Industrial Footer Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-white/[0.03] relative z-10">
        {[
          { label: 'Time_Recovery_Sum', value: '142H', subtext: 'MONTHLY_INTERVAL', icon: Clock },
          { label: 'Infrastructure_ROI', value: '$8.4k', subtext: 'VALUATION_EST', icon: Database },
          { label: 'Network_Efficiency', value: '340%', subtext: 'ARCH_PERFORMANCE', icon: Zap },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="p-8 bg-surface-1 border-r border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all"
          >
            <p className="text-[9px] font-mono text-white/20 mb-4 uppercase tracking-[0.3em]">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-black font-mono text-accent tracking-tighter">
                {stat.value}
              </p>
              <div className="w-1.5 h-1.5 bg-accent/20" />
            </div>
            <p className="text-[8px] font-mono text-white/10 uppercase tracking-[0.4em] mt-2">
              {stat.subtext}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);